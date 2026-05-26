-- transfer_news 테이블: 이적뉴스 큐레이션
CREATE TABLE IF NOT EXISTS transfer_news (
  id              BIGINT PRIMARY KEY,
  title           TEXT NOT NULL,
  author          TEXT NOT NULL DEFAULT '',
  source_type     TEXT NOT NULL CHECK (source_type IN ('tweet','article','video','summary')),
  source_urls     TEXT[] NOT NULL DEFAULT '{}',
  view_count      INTEGER NOT NULL DEFAULT 0,
  like_count      INTEGER NOT NULL DEFAULT 0,
  comment_count   INTEGER NOT NULL DEFAULT 0,
  hidden          BOOLEAN NOT NULL DEFAULT false,
  published_at    TIMESTAMPTZ NOT NULL,
  crawled_at      TIMESTAMPTZ DEFAULT now(),
  body_crawled    BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 인덱스: 최신순 피드 + hidden 필터
CREATE INDEX idx_transfer_news_feed ON transfer_news (published_at DESC) WHERE hidden = false;
CREATE INDEX idx_transfer_news_source_type ON transfer_news (source_type);

-- RLS (기존 패턴: 0002_rls_policies.sql)
ALTER TABLE transfer_news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tn_public_read" ON transfer_news FOR SELECT USING (true);
CREATE POLICY "tn_service_write" ON transfer_news FOR ALL USING (auth.role() = 'service_role');

-- updated_at 트리거 (0001의 update_updated_at 함수 재사용)
CREATE TRIGGER set_transfer_news_updated_at
  BEFORE UPDATE ON transfer_news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
