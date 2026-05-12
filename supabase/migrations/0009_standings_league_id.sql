-- standings 테이블에 league_id 컬럼 추가 (5대 리그 순위표 지원)
ALTER TABLE standings ADD COLUMN IF NOT EXISTS league_id INTEGER NOT NULL DEFAULT 2021;
CREATE INDEX IF NOT EXISTS idx_standings_league_id ON standings(league_id);
