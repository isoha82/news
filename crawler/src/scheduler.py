import os
import time
from apscheduler.schedulers.blocking import BlockingScheduler
from crawlers import naver, cnn, yahoo_japan

CRAWL_INTERVAL_HOURS = int(os.getenv("CRAWL_INTERVAL_HOURS", 5))

CRAWLERS = {
    "KR": naver,
    "US": cnn,
    "JP": yahoo_japan,
}

CATEGORIES = ["politics", "economy", "society", "tech", "sports", "entertainment"]

def run_all():
    print("크롤링 시작")
    for country_code, crawler in CRAWLERS.items():
        for category in CATEGORIES:
            try:
                articles = crawler.crawl(category, limit=5)
                print(f"[{country_code}][{category}] {len(articles)}개 수집")
                # TODO: DB 저장 로직 추가
            except Exception as e:
                print(f"[{country_code}][{category}] 오류: {e}")

def start_scheduler():
    scheduler = BlockingScheduler()
    scheduler.add_job(run_all, "interval", hours=CRAWL_INTERVAL_HOURS)
    run_all()  # 시작 시 즉시 1회 실행
    scheduler.start()
