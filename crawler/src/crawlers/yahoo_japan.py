"""
야후재팬 뉴스 크롤러 — RSS 피드 (분야별 인기 기사)
"""

import feedparser
from datetime import datetime

CATEGORY_FEEDS = {
    "politics":      "https://news.yahoo.co.jp/rss/topics/domestic.xml",
    "economy":       "https://news.yahoo.co.jp/rss/topics/business.xml",
    "society":       "https://news.yahoo.co.jp/rss/topics/local.xml",
    "tech":          "https://news.yahoo.co.jp/rss/topics/it.xml",
    "sports":        "https://news.yahoo.co.jp/rss/topics/sports.xml",
    "culture":       "https://news.yahoo.co.jp/rss/topics/entertainment.xml",
    "entertainment": "https://news.yahoo.co.jp/rss/topics/entertainment.xml",
}


def crawl(category: str, limit: int = 5) -> list[dict]:
    feed_url = CATEGORY_FEEDS.get(category)
    if not feed_url:
        return []

    feed = feedparser.parse(feed_url)
    articles = []

    for i, entry in enumerate(feed.entries[:limit]):
        published_at = _parse_date(entry.get("published"))
        articles.append({
            "title":         entry.get("title", ""),
            "original_url":  entry.get("link", ""),
            "summary":       entry.get("summary", ""),
            "published_at":  published_at,
            "thumbnail_url": None,
            "rank":          i + 1,
            "trend_score":   (6 - (i + 1)) * 100,
        })

    return articles


def _parse_date(date_str: str | None) -> datetime | None:
    if not date_str:
        return None
    try:
        import email.utils
        return datetime(*email.utils.parsedate(date_str)[:6])
    except Exception:
        return None
