"""
Notification dispatcher:
  - session_update: new crawl session completed
  - hot_issue: trending article detection (score threshold)
  - scrap_comment: new comment on a scraped article (called from comment ingestion)
"""

import logging
from db import get_connection
from fcm import send_multicast

logger = logging.getLogger(__name__)

HOT_ISSUE_SCORE_THRESHOLD = int(__import__("os").getenv("HOT_ISSUE_THRESHOLD", 400))


def _get_user_tokens(conn, user_ids: list) -> dict:
    """Returns {user_id: [fcm_token, ...]} for the given user_ids."""
    if not user_ids:
        return {}
    placeholders = ",".join([f"%s"] * len(user_ids))
    with conn.cursor() as cur:
        cur.execute(
            f"SELECT user_id, token FROM device_tokens WHERE user_id IN ({placeholders})",
            user_ids
        )
        result = {}
        for uid, token in cur.fetchall():
            uid_str = str(uid)
            result.setdefault(uid_str, []).append(token)
    return result


def _save_notification(conn, user_id, ntype, title, body, session_id=None, article_id=None):
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO notifications (user_id, type, title, body, related_session_id, related_article_id)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (user_id, ntype, title, body, session_id, article_id))


def notify_session_update(session_id: str, country_id: int, country_name: str):
    """
    Notify all users who have this country enabled and session_update=true.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT u.id
                FROM users u
                JOIN user_countries uc ON uc.user_id = u.id
                JOIN user_notification_settings uns ON uns.user_id = u.id
                WHERE uc.country_id = %s AND uc.enabled = true AND uns.session_update = true
            """, (country_id,))
            user_ids = [str(row[0]) for row in cur.fetchall()]

        if not user_ids:
            return

        title = f"새 뉴스 도착: {country_name}"
        body = "최신 뉴스 세션이 업데이트됐습니다."

        token_map = _get_user_tokens(conn, user_ids)
        all_tokens = [t for tokens in token_map.values() for t in tokens]

        if all_tokens:
            sent = send_multicast(all_tokens, title, body, data={"type": "session_update", "session_id": session_id})
            logger.info(f"[notify] session_update: {sent}/{len(all_tokens)}개 FCM 전송")

        for uid in user_ids:
            _save_notification(conn, uid, "session_update", title, body, session_id=session_id)
        conn.commit()

    except Exception as e:
        conn.rollback()
        logger.error(f"[notify] notify_session_update error: {e}")
    finally:
        conn.close()


def detect_and_notify_hot_issues():
    """
    30-minute job: find articles that crossed HOT_ISSUE_SCORE_THRESHOLD
    since the last run and notify users with hot_issue=true.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT a.id, a.title, a.session_id, a.trend_score
                FROM articles a
                WHERE a.trend_score >= %s
                  AND a.created_at >= NOW() - INTERVAL '35 minutes'
            """, (HOT_ISSUE_SCORE_THRESHOLD,))
            hot_articles = cur.fetchall()

        if not hot_articles:
            return

        with conn.cursor() as cur:
            cur.execute("""
                SELECT u.id
                FROM users u
                JOIN user_notification_settings uns ON uns.user_id = u.id
                WHERE uns.hot_issue = true
            """)
            user_ids = [str(row[0]) for row in cur.fetchall()]

        if not user_ids:
            return

        token_map = _get_user_tokens(conn, user_ids)
        all_tokens = [t for tokens in token_map.values() for t in tokens]

        for article_id, title, session_id, score in hot_articles:
            notif_title = "핫 이슈"
            notif_body = f"{title}"

            if all_tokens:
                send_multicast(
                    all_tokens, notif_title, notif_body,
                    data={"type": "hot_issue", "article_id": str(article_id)}
                )

            for uid in user_ids:
                _save_notification(
                    conn, uid, "hot_issue", notif_title, notif_body,
                    session_id=str(session_id), article_id=str(article_id)
                )

        conn.commit()
        logger.info(f"[notify] hot_issue: {len(hot_articles)}개 기사, {len(user_ids)}명 알림")

    except Exception as e:
        conn.rollback()
        logger.error(f"[notify] detect_and_notify_hot_issues error: {e}")
    finally:
        conn.close()


def notify_scrap_comment(article_id: str, comment_preview: str):
    """
    Notify users who scraped a given article when a new comment arrives.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT DISTINCT s.user_id
                FROM scraps s
                JOIN user_notification_settings uns ON uns.user_id = s.user_id
                WHERE s.article_id = %s AND uns.scrap_comment = true
            """, (article_id,))
            user_ids = [str(row[0]) for row in cur.fetchall()]

        if not user_ids:
            return

        title = "스크랩 기사에 새 댓글"
        body = comment_preview[:80]

        token_map = _get_user_tokens(conn, user_ids)
        all_tokens = [t for tokens in token_map.values() for t in tokens]

        if all_tokens:
            send_multicast(all_tokens, title, body, data={"type": "scrap_comment", "article_id": article_id})

        for uid in user_ids:
            _save_notification(conn, uid, "scrap_comment", title, body, article_id=article_id)
        conn.commit()

    except Exception as e:
        conn.rollback()
        logger.error(f"[notify] notify_scrap_comment error: {e}")
    finally:
        conn.close()
