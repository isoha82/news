"""
Batch recalculation of trend_score for articles in a given session.

Formula: trend_score = comment_count * 50 + (6 - rank) * 100
  - rank 1 → base score 500, rank 5 → base score 100
  - each comment adds 50 points
"""

import logging
from db import get_connection

logger = logging.getLogger(__name__)


def recalculate_session_trend_scores(session_id: str) -> int:
    """
    Recalculate trend_score for all articles in the given session.
    Returns the number of rows updated.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE articles
                SET trend_score = (comment_count * 50) + ((6 - rank) * 100)
                WHERE session_id = %s
                RETURNING id
            """, (session_id,))
            updated = cur.rowcount
            conn.commit()
        logger.info(f"[trend_score] session {session_id}: {updated}개 업데이트")
        return updated
    except Exception as e:
        conn.rollback()
        logger.error(f"[trend_score] recalculate error: {e}")
        return 0
    finally:
        conn.close()


def recalculate_all_trend_scores() -> int:
    """Recalculate trend_score for all articles (used for full re-sync)."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE articles
                SET trend_score = (comment_count * 50) + ((6 - rank) * 100)
            """)
            updated = cur.rowcount
            conn.commit()
        logger.info(f"[trend_score] 전체 재계산: {updated}개 업데이트")
        return updated
    except Exception as e:
        conn.rollback()
        logger.error(f"[trend_score] full recalculate error: {e}")
        return 0
    finally:
        conn.close()
