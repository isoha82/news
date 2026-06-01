import os
from datetime import datetime

from apscheduler.schedulers.blocking import BlockingScheduler
from crawlers import naver, cnn, yahoo_japan
from db import get_connection
from session_manager import create_session, finish_session, fail_session
from save import get_country_id, get_category_id, save_articles, log_crawl
from trend_score import recalculate_session_trend_scores

CRAWL_INTERVAL_HOURS = int(os.getenv("CRAWL_INTERVAL_HOURS", 5))

CRAWLERS = {
    "kr": naver,
    "us": cnn,
    "jp": yahoo_japan,
}

CATEGORIES = ["politics", "economy", "society", "tech", "sports", "culture"]


def run_country(conn, country_code: str, crawler_module):
    country_id = get_country_id(conn, country_code)
    session_id = create_session(conn, country_id)

    total_saved = 0
    started_at = datetime.utcnow()
    error_message = None
    crawl_status = "success"

    try:
        for category in CATEGORIES:
            try:
                articles = crawler_module.crawl(category, limit=5)
                if not articles:
                    print(f"  [{country_code.upper()}][{category}] 0개 (빈 피드)")
                    continue

                category_id = get_category_id(conn, category)
                saved = save_articles(conn, session_id, category_id, articles)
                total_saved += saved
                print(f"  [{country_code.upper()}][{category}] {saved}/{len(articles)}개 저장")

            except Exception as e:
                print(f"  [{country_code.upper()}][{category}] 오류: {e}")
                crawl_status = "partial"

        finish_session(conn, session_id)

        # 트렌드 스코어 재계산 (저장 완료 후)
        try:
            updated = recalculate_session_trend_scores(session_id)
            print(f"  [{country_code.upper()}] 트렌드스코어 {updated}개 재계산 완료")
        except Exception as e:
            print(f"  [{country_code.upper()}] 트렌드스코어 오류 (무시): {e}")

    except Exception as e:
        error_message = str(e)
        crawl_status = "failed"
        fail_session(conn, session_id)
        print(f"  [{country_code.upper()}] 세션 실패: {e}")

    finally:
        finished_at = datetime.utcnow()
        log_crawl(
            conn,
            country_id=country_id,
            status=crawl_status,
            articles_collected=total_saved,
            started_at=started_at,
            finished_at=finished_at,
            error_message=error_message,
        )

    return total_saved


def run_all():
    print(f"\n[{datetime.utcnow().isoformat()}] 전체 크롤링 시작")
    try:
        conn = get_connection()
    except Exception as e:
        print(f"DB 연결 실패: {e}")
        return

    try:
        for country_code, crawler_module in CRAWLERS.items():
            print(f"[{country_code.upper()}] 크롤링 시작")
            saved = run_country(conn, country_code, crawler_module)
            print(f"[{country_code.upper()}] 완료 — {saved}개 저장")
    finally:
        conn.close()

    print(f"[{datetime.utcnow().isoformat()}] 전체 크롤링 완료\n")


def start_scheduler():
    scheduler = BlockingScheduler(timezone="UTC")
    scheduler.add_job(run_all, "interval", hours=CRAWL_INTERVAL_HOURS)
    run_all()  # 시작 시 즉시 1회 실행
    scheduler.start()
