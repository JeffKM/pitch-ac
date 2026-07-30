-- Phase SR: 26/27 시즌 롤오버 — fixtures 시즌 구분 컬럼 추가
-- 시즌 구분이 없으면 26/27 적재 시 gameweek+league_id 조회가 두 시즌을 섞어 반환한다.

-- 1) 컬럼 추가 (기존 행은 NULL)
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS season TEXT;

-- 2) 기존 데이터 백필 — 현재 적재된 경기는 전부 25/26 시즌
UPDATE fixtures SET season = '2025/2026' WHERE season IS NULL;

-- 3) 이후 동기화는 항상 시즌을 기록하므로 NOT NULL 제약 적용
ALTER TABLE fixtures ALTER COLUMN season SET NOT NULL;

-- 4) 시즌+리그+라운드 조회용 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_fixtures_season_league_gw
  ON fixtures(season, league_id, gameweek);

COMMENT ON COLUMN fixtures.season IS 'API season.startDate에서 파생한 시즌 라벨 (예: 2026/2027)';
