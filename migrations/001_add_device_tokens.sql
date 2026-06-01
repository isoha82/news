-- FCM 푸시 알림을 위한 디바이스 토큰 테이블
CREATE TABLE IF NOT EXISTS device_tokens (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT         NOT NULL UNIQUE,
  platform   VARCHAR(10)  NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_device_tokens_user ON device_tokens(user_id);
