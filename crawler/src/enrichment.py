"""
LLM enrichment pipeline: summarize articles that have no summary yet.
Called after save_articles() in scheduler.py for each crawl session.
"""

import logging
from db import get_connection
from llm import summarize_article

logger = logging.getLogger(__name__)


def enrich_session_articles(session_id: str) -> int:
    """
    Summarize all articles from the given session that lack a summary.
    Returns the number of newly generated summaries.
    """
    conn = get_connection()
    count = 0
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT a.id, a.title, a.body
                FROM articles a
                JOIN session_articles sa ON sa.article_id = a.id
                LEFT JOIN article_summaries s ON s.article_id = a.id
                WHERE sa.session_id = %s AND s.id IS NULL AND a.body IS NOT NULL AND a.body != ''
            """, (session_id,))
            rows = cur.fetchall()

        for article_id, title, body in rows:
            result = summarize_article(title, body)
            if result is None:
                continue
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO article_summaries (article_id, bullet1, bullet2, bullet3)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (article_id) DO NOTHING
                """, (article_id, result["bullet1"], result["bullet2"], result["bullet3"]))
                conn.commit()
            count += 1
            logger.info(f"[enrich] summarized article {article_id}")

    except Exception as e:
        logger.error(f"[enrich] enrich_session_articles error: {e}")
        conn.rollback()
    finally:
        conn.close()

    return count
