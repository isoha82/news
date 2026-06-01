import feedparser
import requests
from bs4 import BeautifulSoup

CATEGORY_FEEDS = {
    "politics": "https://feeds.feedburner.com/navernews/politics",
    "economy": "https://feeds.feedburner.com/navernews/economy",
    "society": "https://feeds.feedburner.com/navernews/society",
    "tech": "https://feeds.feedburner.com/navernews/tech",
    "sports": "https://feeds.feedburner.com/navernews/sports",
    "entertainment": "https://feeds.feedburner.com/navernews/entertainment",
}

def crawl(category: str, limit: int = 5) -> list[dict]:
    # TODO: RSS 피드 URL 확정 후 구현
    return []
