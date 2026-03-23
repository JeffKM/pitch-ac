-- 컵 대회 지원 + 연기 경기(POSTP) 상태 추가

-- status CHECK 제약 업데이트 (POSTP 추가)
ALTER TABLE fixtures DROP CONSTRAINT IF EXISTS fixtures_status_check;
ALTER TABLE fixtures ADD CONSTRAINT fixtures_status_check
  CHECK (status IN ('NS','LIVE','FT','POSTP'));

-- league_id 컬럼 (대회 구분, PL=8이 기본값)
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS league_id INTEGER DEFAULT 8;
UPDATE fixtures SET league_id = 8 WHERE league_id IS NULL;
ALTER TABLE fixtures ALTER COLUMN league_id SET NOT NULL;

-- competition_name 컬럼 (표시용 대회명)
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS competition_name TEXT;

-- gameweek NULL 허용 (컵 경기는 GW 없음)
ALTER TABLE fixtures ALTER COLUMN gameweek DROP NOT NULL;

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_fixtures_league_id ON fixtures(league_id);
