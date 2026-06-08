"""
세션 생성·완료·순환 로직.

규칙:
  - 국가별 세션은 최대 6개 유지
  - 신규 세션 생성 시 6개 초과하면 가장 오래된 세션을 삭제
  - 새 세션을 is_current=true 로 설정하고 기존 세션은 is_current=false 로 업데이트
"""

MAX_SESSIONS_PER_COUNTRY = 6


def create_session(conn, country_id: int) -> str:
    with conn.cursor() as cur:
        # 현재 세션 수 조회
        cur.execute(
            "SELECT COUNT(*) FROM sessions WHERE country_id = %s",
            (country_id,)
        )
        count = cur.fetchone()[0]

        # 초과분 삭제 (오래된 순)
        overflow = count - MAX_SESSIONS_PER_COUNTRY + 1
        if overflow > 0:
            cur.execute("""
                DELETE FROM sessions
                WHERE id IN (
                    SELECT id FROM sessions
                    WHERE country_id = %s
                    ORDER BY started_at ASC
                    LIMIT %s
                )
            """, (country_id, overflow))

        # 기존 current 세션 해제
        cur.execute(
            "UPDATE sessions SET is_current = false WHERE country_id = %s AND is_current = true",
            (country_id,)
        )

        # 다음 session_order 결정
        cur.execute(
            "SELECT COALESCE(MAX(session_order), 0) FROM sessions WHERE country_id = %s",
            (country_id,)
        )
        last_order = cur.fetchone()[0]
        next_order = (last_order % MAX_SESSIONS_PER_COUNTRY) + 1

        # 신규 세션 생성
        cur.execute("""
            INSERT INTO sessions (country_id, started_at, status, is_current, session_order)
            VALUES (%s, NOW(), 'pending', true, %s)
            RETURNING id
        """, (country_id, next_order))
        session_id = cur.fetchone()[0]

    conn.commit()
    return str(session_id)


def finish_session(conn, session_id: str, status: str = "completed"):
    with conn.cursor() as cur:
        cur.execute("""
            UPDATE sessions
            SET status = %s, finished_at = NOW()
            WHERE id = %s
        """, (status, session_id))
    conn.commit()


def fail_session(conn, session_id: str):
    finish_session(conn, session_id, status="failed")
