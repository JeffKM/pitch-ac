-- football-data.org 마이그레이션: ID 체계 전환 + 라이브 필드 제거
-- API-Football → football-data.org 전환에 따라 모든 데이터를 초기화하고 스키마를 정리합니다.

-- 1) 모든 데이터 초기화 (ID 체계가 완전히 다르므로 TRUNCATE 필수)
TRUNCATE TABLE player_match_stats CASCADE;
TRUNCATE TABLE player_season_stats CASCADE;
TRUNCATE TABLE players CASCADE;
TRUNCATE TABLE standings CASCADE;
TRUNCATE TABLE fixtures CASCADE;
TRUNCATE TABLE injuries CASCADE;
TRUNCATE TABLE teams CASCADE;
TRUNCATE TABLE sync_logs CASCADE;

-- 2) fixtures 테이블에서 라이브 전용 컬럼 제거
ALTER TABLE fixtures DROP COLUMN IF EXISTS minute;
ALTER TABLE fixtures DROP COLUMN IF EXISTS live_stats;
ALTER TABLE fixtures DROP COLUMN IF EXISTS lineups;

-- 3) fixtures.league_id 기본값 변경 (API-Football 39 → football-data.org 2021)
ALTER TABLE fixtures ALTER COLUMN league_id SET DEFAULT 2021;

-- 4) 테이블 코멘트 업데이트
COMMENT ON TABLE teams IS 'football-data.org team ID 기준';
COMMENT ON TABLE fixtures IS 'football-data.org match ID 기준';
COMMENT ON TABLE standings IS 'football-data.org competition 기준';
