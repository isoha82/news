import feedparser

CATEGORY_FEEDS = {
    "politics": "http://rss.cnn.com/rss/cnn_allpolitics.rss",
    "economy": "http://rss.cnn.com/rss/money_news_international.rss",
    "society": "http://rss.cnn.com/rss/cnn_us.rss",
    "tech": "http://rss.cnn.com/rss/cnn_tech.rss",
    "sports": "http://rss.cnn.com/rss/si_topstories.rss",
    "entertainment": "http://rss.cnn.com/rss/cnn_showbiz.rss",
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
