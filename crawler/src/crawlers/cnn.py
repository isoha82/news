"""
CNN 뉴스 크롤러 — RSS 피드 (분야별 인기 기사)
"""

import feedparser
from datetime import datetime

CATEGORY_FEEDS = {
    "politics":      "http://rss.cnn.com/rss/cnn_allpolitics.rss",
    "economy":       "http://rss.cnn.com/rss/money_news_international.rss",
    "society":       "http://rss.cnn.com/rss/cnn_us.rss",
    "tech":          "http://rss.cnn.com/rss/cnn_topstories.rss",  # tech RSS 대신 top stories 사용
    "sports":        "http://rss.cnn.com/rss/si_topstories.rss",
    "culture":       "http://rss.cnn.com/rss/cnn_showbiz.rss",
    "entertainment": "http://rss.cnn.com/rss/cnn_showbiz.rss",
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
