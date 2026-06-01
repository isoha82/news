import feedparser

CATEGORY_FEEDS = {
    "politics": "https://news.yahoo.co.jp/rss/topics/domestic.xml",
    "economy": "https://news.yahoo.co.jp/rss/topics/business.xml",
    "society": "https://news.yahoo.co.jp/rss/topics/local.xml",
    "tech": "https://news.yahoo.co.jp/rss/topics/it.xml",
    "sports": "https://news.yahoo.co.jp/rss/topics/sports.xml",
    "entertainment": "https://news.yahoo.co.jp/rss/topics/entertainment.xml",
}

def crawl(category: str, limit: int = 5) -> list[dict]:
    feed_url = CATEGORY_FEEDS.get(category)
    if not feed_url:
        return []

    feed = feedparser.parse(feed_url)
    articles = []

    for i, entry in enumerate(feed.entries[:limit]):
        articles.append({
            "title": entry.get("title", ""),
            "original_url": entry.get("link", ""),
            "summary": entry.get("summary", ""),
            "published_at": entry.get("published", None),
            "thumbnail_url": None,
            "rank": i + 1,
            "trend_score": 0,
        })

    return articles
