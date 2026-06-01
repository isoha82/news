"""
네이버 뉴스 크롤러 — 공식 RSS 피드 (분야별 인기 기사)

네이버 뉴스 RSS: https://news.naver.com/main/rss/<slug>.nhn
"""

import feedparser
import re
from datetime import datetime

CATEGORY_FEEDS = {
    "politics":      "https://rss.news.naver.com/main/rss/politics.naver",
    "economy":       "https://rss.news.naver.com/main/rss/economy.naver",
    "society":       "https://rss.news.naver.com/main/rss/society.naver",
    "tech":          "https://rss.news.naver.com/main/rss/it.naver",
    "sports":        "https://rss.news.naver.com/main/rss/sports.naver",
    "culture":       "https://rss.news.naver.com/main/rss/entertainment.naver",
    # 하위 호환: 'entertainment' 키도 culture에 매핑
    "entertainment": "https://rss.news.naver.com/main/rss/entertainment.naver",
}

# feedparser User-Agent 설정 (네이버 봇 차단 우회)
feedparser.USER_AGENT = (
    "Mozilla/5.0 (compatible; NewsBot/1.0; +https://github.com/isoha82/news)"
)


def crawl(category: str, limit: int = 5) -> list[dict]:
    feed_url = CATEGORY_FEEDS.get(category)
    if not feed_url:
        return []

    feed = feedparser.parse(feed_url)
    articles = []

    for i, entry in enumerate(feed.entries[:limit]):
        published_at = _parse_date(entry.get("published"))
        summary = _strip_html(entry.get("summary", ""))

        articles.append({
            "title":         entry.get("title", ""),
            "original_url":  entry.get("link", ""),
            "summary":       summary,
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


def _strip_html(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text).strip()
