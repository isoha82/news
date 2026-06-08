-- =============================================
-- News Project Database Schema
-- Based on ERD v1.0 (2026-05-27)
-- =============================================

-- UUID 지원 활성화 (PostgreSQL 13 미만 환경)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- 공통 참조 테이블 (정적 데이터)
-- =============================================

CREATE TABLE countries (
  id              SERIAL       PRIMARY KEY,
  code            VARCHAR(2)   NOT NULL UNIQUE,   -- kr | us | jp
  name            VARCHAR(50)  NOT NULL,           -- 한국 | 미국 | 일본
  source_name     VARCHAR(100) NOT NULL,           -- 네이버 뉴스 | CNN | 야후재팬
  source_base_url VARCHAR(255) NOT NULL
);

CREATE TABLE categories (
  id         SERIAL      PRIMARY KEY,
  slug       VARCHAR(50) NOT NULL UNIQUE,  -- politics | economy | society | tech | sports | culture
  name_ko    VARCHAR(50) NOT NULL,         -- 정치 | 경제 | 사회 | 기술IT | 스포츠 | 연예문화
  name_en    VARCHAR(50) NOT NULL,
  color      VARCHAR(20) NOT NULL,         -- 배경색 hex (예: #EEEDFE)
  text_color VARCHAR(20) NOT NULL          -- 텍스트색 hex (예: #3C3489)
);

-- =============================================
-- 사용자 (User)
-- =============================================

CREATE TABLE users (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  avatar_url  TEXT,
  provider    VARCHAR(20)  NOT NULL CHECK (provider IN ('google', 'apple', 'kakao')),
  provider_id VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
  UNIQUE (provider, provider_id)
);

CREATE TABLE user_settings (
  id      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID        NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  theme   VARCHAR(10) NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark'))
);

CREATE TABLE user_categories (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  UNIQUE (user_id, category_id)
);

CREATE TABLE user_countries (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  country_id INTEGER NOT NULL REFERENCES countries(id),
  enabled    BOOLEAN NOT NULL DEFAULT true,   -- true=활성, false=비활성
  UNIQUE (user_id, country_id)
);

CREATE TABLE user_notification_settings (
  id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID    NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  session_update BOOLEAN NOT NULL DEFAULT true,   -- 새 세션 도착 알림
  hot_issue      BOOLEAN NOT NULL DEFAULT true,   -- 관심 핫이슈 알림
  scrap_comment  BOOLEAN NOT NULL DEFAULT false   -- 스크랩 기사 댓글 알림
);

-- =============================================
-- 인증 (Auth)
-- =============================================

CREATE TABLE refresh_tokens (
  id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT      NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN   NOT NULL DEFAULT false
);

-- =============================================
-- 세션 · 기사 (Session / Article)
-- =============================================

CREATE TABLE sessions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id    INTEGER     NOT NULL REFERENCES countries(id),
  started_at    TIMESTAMP   NOT NULL,
  finished_at   TIMESTAMP,
  status        VARCHAR(20) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'completed', 'failed')),
  is_current    BOOLEAN     NOT NULL DEFAULT false,
  session_order INTEGER     NOT NULL CHECK (session_order BETWEEN 1 AND 6)
);

CREATE TABLE articles (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID         NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  category_id   INTEGER      NOT NULL REFERENCES categories(id),
  title         VARCHAR(500) NOT NULL,
  original_url  TEXT         NOT NULL,
  source_domain VARCHAR(255),
  rank          INTEGER      NOT NULL CHECK (rank BETWEEN 1 AND 5),
  trend_score   INTEGER      NOT NULL DEFAULT 0,
  comment_count INTEGER      NOT NULL DEFAULT 0,
  published_at  TIMESTAMP,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE article_summaries (
  id           UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id   UUID      NOT NULL UNIQUE REFERENCES articles(id) ON DELETE CASCADE,
  bullet1      TEXT      NOT NULL,
  bullet2      TEXT      NOT NULL,
  bullet3      TEXT      NOT NULL,
  generated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE article_comments (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id    UUID         NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  masked_author VARCHAR(100),
  content       TEXT         NOT NULL,
  likes         INTEGER      NOT NULL DEFAULT 0,
  dislikes      INTEGER      NOT NULL DEFAULT 0,
  posted_ago    VARCHAR(100),
  sort_order    INTEGER      NOT NULL DEFAULT 0
);

-- =============================================
-- 크롤링 이력 (Crawl Log)
-- =============================================

CREATE TABLE crawl_logs (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id         INTEGER     NOT NULL REFERENCES countries(id),
  started_at         TIMESTAMP   NOT NULL DEFAULT NOW(),
  finished_at        TIMESTAMP,
  status             VARCHAR(20) NOT NULL DEFAULT 'success'
                     CHECK (status IN ('success', 'failed', 'partial')),
  error_message      TEXT,
  articles_collected INTEGER     NOT NULL DEFAULT 0
);

-- =============================================
-- 스크랩 (Scrap)
-- =============================================

CREATE TABLE scrap_folders (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  icon       VARCHAR(50),
  created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE scraps (
  id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id UUID      NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  folder_id  UUID      REFERENCES scrap_folders(id) ON DELETE SET NULL,  -- NULL = 미분류
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, article_id)
);

-- =============================================
-- 알림 (Notification)
-- =============================================

CREATE TABLE notifications (
  id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type               VARCHAR(30)  NOT NULL
                     CHECK (type IN ('session_update', 'hot_issue', 'scrap_comment')),
  title              VARCHAR(255) NOT NULL,
  body               TEXT         NOT NULL,
  is_read            BOOLEAN      NOT NULL DEFAULT false,
  related_session_id UUID         REFERENCES sessions(id) ON DELETE SET NULL,
  related_article_id UUID         REFERENCES articles(id) ON DELETE SET NULL,
  created_at         TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- =============================================
-- 인덱스
-- =============================================

-- sessions
CREATE INDEX idx_sessions_country    ON sessions(country_id);
CREATE INDEX idx_sessions_status     ON sessions(status);
CREATE INDEX idx_sessions_current    ON sessions(country_id, is_current);

-- articles
CREATE INDEX idx_articles_session    ON articles(session_id);
CREATE INDEX idx_articles_category   ON articles(category_id);
CREATE INDEX idx_articles_rank       ON articles(session_id, rank);

-- article_comments
CREATE INDEX idx_comments_article    ON article_comments(article_id, sort_order);

-- crawl_logs
CREATE INDEX idx_crawl_country       ON crawl_logs(country_id);
CREATE INDEX idx_crawl_started       ON crawl_logs(started_at DESC);

-- scraps
CREATE INDEX idx_scraps_user         ON scraps(user_id);
CREATE INDEX idx_scraps_folder       ON scraps(folder_id);

-- refresh_tokens
CREATE INDEX idx_refresh_user        ON refresh_tokens(user_id);

-- notifications
CREATE INDEX idx_notif_user          ON notifications(user_id, is_read, created_at DESC);

-- =============================================
-- 기초 데이터 (Seed Data)
-- =============================================

INSERT INTO countries (code, name, source_name, source_base_url) VALUES
  ('kr', '한국', '네이버 뉴스', 'https://news.naver.com'),
  ('us', '미국', 'CNN',        'https://www.cnn.com'),
  ('jp', '일본', '야후재팬',   'https://news.yahoo.co.jp');

INSERT INTO categories (slug, name_ko, name_en, color, text_color) VALUES
  ('politics', '정치',     'Politics',      '#FBEAF0', '#993556'),
  ('economy',  '경제',     'Economy',       '#E1F5EE', '#0F6E56'),
  ('society',  '사회',     'Society',       '#F0F4FF', '#3A4A8A'),
  ('tech',     '기술·IT',  'Tech/IT',       '#EEEDFE', '#3C3489'),
  ('sports',   '스포츠',   'Sports',        '#FFF3E0', '#8B4513'),
  ('culture',  '연예·문화','Entertainment', '#FAEEDA', '#854F0B');
