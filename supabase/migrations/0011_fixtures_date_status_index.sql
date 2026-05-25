-- Phase MD: sync-results 스마트 폴링 지원용 부분 인덱스
-- NS 상태 경기만 인덱싱 → 시즌 진행할수록 크기 감소
CREATE INDEX IF NOT EXISTS idx_fixtures_status_date
  ON fixtures(status, date)
  WHERE status = 'NS';
