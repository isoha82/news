-- =============================================
-- News Project Database Schema
-- =============================================

CREATE TABLE countries (
  id           SERIAL PRIMARY KEY,
  code         VARCHAR(2)   NOT NULL UNIQUE,
  name         VARCHAR(50)  NOT NULL,
  source_name  VARCHAR(100) NOT NULL,
  source_base_url VARCHAR(255) NOT NULL
);

CREATE TABLE categories (
  id       SERIAL PRIMARY KEY,
  name_ko  VARCHAR(50) NOT NULL,
  name_en  VARCHAR(50) NOT NULL,
  slug     VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE sessions (
  id            SERIAL PRIMARY KEY,
  country_id    INTEGER     NOT NULL REFERENCES countries(id),
  category_id   INTEGER     NOT NULL REFERENCES categories(id),
  period_start  TIMESTAMP   NOT NULL,
  period_end    TIMESTAMP   NOT NULL,
  collected_at  TIMESTAMP,
  status        VARCHAR(20) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'completed', 'failed')),
  session_order INTEGER     NOT NULL CHECK (session_order BETWEEN 1 AND 6)
);

CREATE TABLE articles (
  id            SERIAL PRIMARY KEY,
  session_id    INTEGER      NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  title         VARCHAR(500) NOT NULL,
  original_url  TEXT         NOT NULL,
  summary       TEXT,
  rank          INTEGER      NOT NULL CHECK (rank BETWEEN 1 AND 5),
  thumbnail_url TEXT,
  trend_score   INTEGER      NOT NULL DEFAULT 0,
  published_at  TIMESTAMP,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE crawl_logs (
  id                SERIAL PRIMARY KEY,
  country_id        INTEGER     NOT NULL REFERENCES countries(id),
  category_id       INTEGER     NOT NULL REFERENCES categories(id),
  started_at        TIMESTAMP   NOT NULL DEFAULT NOW(),
  finished_at       TIMESTAMP,
  status            VARCHAR(20) NOT NULL DEFAULT 'success'
                    CHECK (status IN ('success', 'failed', 'partial')),
  error_message     TEXT,
  articles_collected INTEGER    NOT NULL DEFAULT 0
);

-- 인덱스
CREATE INDEX idx_sessions_country_category ON sessions(country_id, category_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_articles_session_id ON articles(session_id);
CREATE INDEX idx_articles_rank ON articles(session_id, rank);
CREATE INDEX idx_crawl_logs_started_at ON crawl_logs(started_at DESC);

-- =============================================
-- 기초 데이터 삽입
-- =============================================

INSERT INTO countries (code, name, source_name, source_base_url) VALUES
  ('KR', '한국',   '네이버',    'https://news.naver.com'),
  ('US', '미국',   'CNN',       'https://www.cnn.com'),
  ('JP', '일본',   '야후재팬',  'https://news.yahoo.co.jp');

INSERT INTO categories (name_ko, name_en, slug) VALUES
  ('정치',     'Politics',      'politics'),
  ('경제',     'Economy',       'economy'),
  ('사회',     'Society',       'society'),
  ('기술/IT',  'Tech',          'tech'),
  ('스포츠',   'Sports',        'sports'),
  ('연예/문화','Entertainment', 'entertainment');
