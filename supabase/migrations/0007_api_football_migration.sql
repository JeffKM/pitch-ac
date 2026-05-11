-- ================================================================
-- API-Football 마이그레이션 — ID 체계 전환
-- SportMonks ID → API-Football ID로 전환
-- 모든 데이터 초기화 후 재적재 필요
-- ================================================================

-- 1. FK 의존 순서대로 데이터 삭제
TRUNCATE TABLE player_match_stats CASCADE;
TRUNCATE TABLE player_season_stats CASCADE;
TRUNCATE TABLE injuries CASCADE;
TRUNCATE TABLE standings CASCADE;
TRUNCATE TABLE fixtures CASCADE;
TRUNCATE TABLE players CASCADE;
TRUNCATE TABLE teams CASCADE;

-- 2. sync_logs 리셋
TRUNCATE TABLE sync_logs;

-- 3. fixtures.league_id 기본값: SportMonks(8) → API-Football(39)
ALTER TABLE fixtures ALTER COLUMN league_id SET DEFAULT 39;

-- 4. 주석 업데이트
COMMENT ON TABLE teams IS 'PL 20팀 기본 정보 (API-Football ID 기준)';
COMMENT ON TABLE players IS '선수 기본 정보 (API-Football ID 기준)';
COMMENT ON TABLE fixtures IS '경기 정보 (API-Football ID 기준)';
