-- ================================================================
-- pitch-ac DB 스키마 — Phase 3
-- 테이블 생성 + 인덱스 + updated_at 트리거
-- ================================================================

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ──────────────────────────────────────────────────────
-- 1. teams — PL 20팀 기본 정보
-- ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teams (
  id          INTEGER PRIMARY KEY,  -- SportMonks team_id
  name        TEXT    NOT NULL,
  short_code  TEXT    NOT NULL,
  logo_url    TEXT    NOT NULL,
  season      TEXT    NOT NULL DEFAULT '2025/2026',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────────────
-- 2. players — 선수 기본 정보
-- ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS players (
  id           INTEGER PRIMARY KEY,  -- SportMonks player_id
  team_id      INTEGER REFERENCES teams(id) ON DELETE SET NULL,
  name         TEXT    NOT NULL,
  position     TEXT    NOT NULL CHECK (position IN ('GK','DEF','MID','FWD')),
  jersey_number INTEGER,
  nationality  TEXT    NOT NULL DEFAULT '',
  photo_url    TEXT    NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);

CREATE TRIGGER players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────────────
-- 3. player_season_stats — 시즌 누적 스탯 + context
-- ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS player_season_stats (
  id           SERIAL  PRIMARY KEY,
  player_id    INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  season       TEXT    NOT NULL,  -- 예: "2025/2026"

  -- 핵심 스탯
  goals        INTEGER NOT NULL DEFAULT 0,
  assists      INTEGER NOT NULL DEFAULT 0,
  xg           REAL    NULL,       -- Starter 플랜 미지원 → NULL
  xa           REAL    NULL,       -- Starter 플랜 미지원 → NULL
  key_passes   INTEGER NOT NULL DEFAULT 0,
  dribbles     INTEGER NOT NULL DEFAULT 0,
  average_rating REAL  NOT NULL DEFAULT 0,

  -- 리그 순위/백분위 등 context (JSONB)
  -- { goals: {rank, percentile, prevSeason}, assists: {...}, ... }
  context      JSONB   NOT NULL DEFAULT '{}',

  -- 레이더 차트 데이터 (JSONB)
  radar_data   JSONB   NOT NULL DEFAULT '{}',

  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (player_id, season)
);

CREATE INDEX IF NOT EXISTS idx_pss_player_id ON player_season_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_pss_season ON player_season_stats(season);

CREATE TRIGGER pss_updated_at
  BEFORE UPDATE ON player_season_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────────────
-- 4. player_match_stats — 경기별 스탯
-- ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS player_match_stats (
  id           SERIAL  PRIMARY KEY,
  player_id    INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  fixture_id   INTEGER NOT NULL,  -- FK는 fixtures 생성 후 별도 추가
  rating       REAL    NOT NULL DEFAULT 0,
  goals        INTEGER NOT NULL DEFAULT 0,
  assists      INTEGER NOT NULL DEFAULT 0,
  minutes_played INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (player_id, fixture_id)
);

CREATE INDEX IF NOT EXISTS idx_pms_player_id ON player_match_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_pms_fixture_id ON player_match_stats(fixture_id);

CREATE TRIGGER pms_updated_at
  BEFORE UPDATE ON player_match_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────────────
-- 5. fixtures — 경기 정보 (복합 데이터는 JSONB)
-- ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fixtures (
  id            INTEGER PRIMARY KEY,  -- SportMonks fixture_id
  gameweek      INTEGER NOT NULL,
  date          TIMESTAMPTZ NOT NULL,
  home_team_id  INTEGER REFERENCES teams(id) ON DELETE SET NULL,
  away_team_id  INTEGER REFERENCES teams(id) ON DELETE SET NULL,
  status        TEXT    NOT NULL CHECK (status IN ('NS','LIVE','FT')) DEFAULT 'NS',
  home_score    INTEGER NULL,
  away_score    INTEGER NULL,
  minute        INTEGER NULL,
  events        JSONB   NOT NULL DEFAULT '[]',
  live_stats    JSONB   NULL,
  lineups       JSONB   NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fixtures_gameweek ON fixtures(gameweek);
CREATE INDEX IF NOT EXISTS idx_fixtures_status ON fixtures(status);
CREATE INDEX IF NOT EXISTS idx_fixtures_home_team ON fixtures(home_team_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_away_team ON fixtures(away_team_id);

CREATE TRIGGER fixtures_updated_at
  BEFORE UPDATE ON fixtures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- player_match_stats → fixtures FK (fixtures 테이블 생성 후 추가)
ALTER TABLE player_match_stats
  ADD CONSTRAINT fk_pms_fixture
  FOREIGN KEY (fixture_id) REFERENCES fixtures(id) ON DELETE CASCADE;

-- ──────────────────────────────────────────────────────
-- 6. standings — 리그 순위표
-- ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS standings (
  id              SERIAL  PRIMARY KEY,
  team_id         INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  season          TEXT    NOT NULL,
  position        INTEGER NOT NULL,
  played          INTEGER NOT NULL DEFAULT 0,
  won             INTEGER NOT NULL DEFAULT 0,
  drawn           INTEGER NOT NULL DEFAULT 0,
  lost            INTEGER NOT NULL DEFAULT 0,
  goals_for       INTEGER NOT NULL DEFAULT 0,
  goals_against   INTEGER NOT NULL DEFAULT 0,
  goal_difference INTEGER NOT NULL GENERATED ALWAYS AS (goals_for - goals_against) STORED,
  points          INTEGER NOT NULL DEFAULT 0,
  form            JSONB   NOT NULL DEFAULT '[]',  -- ["W","D","L","W","W"]
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (team_id, season)
);

CREATE INDEX IF NOT EXISTS idx_standings_season ON standings(season);
CREATE INDEX IF NOT EXISTS idx_standings_position ON standings(position);

CREATE TRIGGER standings_updated_at
  BEFORE UPDATE ON standings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────────────
-- 7. glossary — 축구 용어 사전
-- ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS glossary (
  id          TEXT    PRIMARY KEY,  -- 예: "xg", "xgot", "key-pass"
  term        TEXT    NOT NULL,     -- 표시명: "xG"
  definition  TEXT    NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER glossary_updated_at
  BEFORE UPDATE ON glossary
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────────────
-- 8. injuries — 부상/결장 선수
-- ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS injuries (
  id              SERIAL  PRIMARY KEY,
  player_id       INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team_id         INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  reason          TEXT    NOT NULL,
  expected_return TEXT    NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_injuries_team_id ON injuries(team_id);

CREATE TRIGGER injuries_updated_at
  BEFORE UPDATE ON injuries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────────────
-- 9. sync_logs — API 동기화 로그
-- ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sync_logs (
  id           SERIAL  PRIMARY KEY,
  entity       TEXT    NOT NULL,  -- "fixtures", "players", "standings" 등
  status       TEXT    NOT NULL CHECK (status IN ('success','error')),
  records_synced INTEGER NOT NULL DEFAULT 0,
  error_message TEXT    NULL,
  synced_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_entity ON sync_logs(entity);
CREATE INDEX IF NOT EXISTS idx_sync_logs_synced_at ON sync_logs(synced_at DESC);
