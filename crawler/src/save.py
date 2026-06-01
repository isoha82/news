"""
크롤링 결과를 DB에 저장하는 함수 모음.

articles 리스트 요소 형식:
  {
    "title":        str,
    "original_url": str,
    "summary":      str | None,
    "published_at": str | None,
    "thumbnail_url": str | None,
    "rank":         int,          # 1-5
    "trend_score":  int,          # (6 - rank) * 100
  }
"""

import psycopg2.extras


def get_country_id(conn, country_code: str) -> int:
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM countries WHERE code = %s", (country_code.lower(),))
        row = cur.fetchone()
    if not row:
        raise ValueError(f"Unknown country code: {country_code}")
    return row[0]


def get_category_id(conn, category_slug: str) -> int:
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM categories WHERE slug = %s", (category_slug.lower(),))
        row = cur.fetchone()
    if not row:
        raise ValueError(f"Unknown category slug: {category_slug}")
    return row[0]


def save_articles(conn, session_id: str, category_id: int, articles: list) -> int:
    if not articles:
        return 0

    saved = 0
    with conn.cursor() as cur:
        for article in articles:
            trend_score = article.get("trend_score") or (6 - article.get("rank", 5)) * 100
            try:
                cur.execute("""
                    INSERT INTO articles
                        (session_id, category_id, title, original_url,
                         source_domain, rank, trend_score, published_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT DO NOTHING
                    RETURNING id
                """, (
                    session_id,
                    category_id,
                    article.get("title", ""),
                    article.get("original_url", ""),
                    _extract_domain(article.get("original_url", "")),
                    article.get("rank", 1),
                    trend_score,
                    article.get("published_at"),
                ))
                row = cur.fetchone()
                if row:
                    saved += 1
            except Exception as e:
                print(f"  [save] article insert error: {e}")
                conn.rollback()
                continue

    conn.commit()
    return saved


def log_crawl(conn, country_id: int, status: str, articles_collected: int,
              started_at, finished_at, error_message: str = None):
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO crawl_logs
                (country_id, started_at, finished_at, status, articles_collected, error_message)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (country_id, started_at, finished_at, status, articles_collected, error_message))
    conn.commit()


def _extract_domain(url: str) -> str:
    try:
        from urllib.parse import urlparse
        return urlparse(url).netloc
    except Exception:
        return ""
