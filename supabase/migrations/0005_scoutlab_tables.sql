-- ================================================================
-- ScoutLab 스카우팅 데이터 스키마
-- 테이블 6개 + 인덱스 + RLS + updated_at 트리거
-- ================================================================

-- ──────────────────────────────────────────────────────
-- 1. scoutlab_players — 선수 마스터 (Big 5 리그)
-- ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scoutlab_players (
  id               SERIAL  PRIMARY KEY,
  name             TEXT    NOT NULL,
  team             TEXT    NOT NULL,
  league           TEXT    NOT NULL CHECK (league IN (
    'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'
  )),
  position         TEXT    NOT NULL CHECK (position IN (
    'CB', 'FB', 'MF', 'AM', 'W', 'FW'
  )),
  season           TEXT    NOT NULL,     -- 예: "25/26"
  nationality      TEXT,
  age              INTEGER,
  height           INTEGER,             -- cm
  minutes_played   INTEGER DEFAULT 0,
  pitch_ac_player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (name, team, season)
);

CREATE INDEX IF NOT EXISTS idx_sl_players_league ON scoutlab_players(league);
CREATE INDEX IF NOT EXISTS idx_sl_players_team ON scoutlab_players(team);
CREATE INDEX IF NOT EXISTS idx_sl_players_position ON scoutlab_players(position);
CREATE INDEX IF NOT EXISTS idx_sl_players_season ON scoutlab_players(season);
CREATE INDEX IF NOT EXISTS idx_sl_players_pitch_ac ON scoutlab_players(pitch_ac_player_id);

CREATE TRIGGER scoutlab_players_updated_at
  BEFORE UPDATE ON scoutlab_players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────────────
-- 2. scoutlab_metrics — 60+ 메트릭 (카테고리별 JSONB)
--    각 JSONB: { "Metric Name": { "value": 0.65, "percentile": 99 }, ... }
-- ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scoutlab_metrics (
  id               SERIAL  PRIMARY KEY,
  player_id        INTEGER NOT NULL REFERENCES scoutlab_players(id) ON DELETE CASCADE,
  season           TEXT    NOT NULL,
  mode             TEXT    NOT NULL DEFAULT 'per90' CHECK (mode IN ('per90', 'total')),
  adjustment       TEXT    NOT NULL DEFAULT 'padj' CHECK (adjustment IN ('padj', 'raw')),

  -- 카테고리별 메트릭 (JSONB)
  final_product    JSONB   NOT NULL DEFAULT '{}',
  shooting         JSONB   NOT NULL DEFAULT '{}',
  creation         JSONB   NOT NULL DEFAULT '{}',
  passing          JSONB   NOT NULL DEFAULT '{}',
  ball_carrying    JSONB   NOT NULL DEFAULT '{}',
  defending        JSONB   NOT NULL DEFAULT '{}',
  set_pieces       JSONB   NOT NULL DEFAULT '{}',
  aerial           JSONB   NOT NULL DEFAULT '{}',
  possession       JSONB   NOT NULL DEFAULT '{}',
  vaep_overview    JSONB   NOT NULL DEFAULT '{}',
  misc             JSONB   NOT NULL DEFAULT '{}',

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (player_id, season, mode, adjustment)
);

CREATE INDEX IF NOT EXISTS idx_sl_metrics_player ON scoutlab_metrics(player_id);
CREATE INDEX IF NOT EXISTS idx_sl_metrics_season ON scoutlab_metrics(season);

CREATE TRIGGER scoutlab_metrics_updated_at
  BEFORE UPDATE ON scoutlab_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────────────
-- 3. scoutlab_radar — 레이더 차트 축 데이터
-- ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scoutlab_radar (
  id               SERIAL  PRIMARY KEY,
  player_id        INTEGER NOT NULL REFERENCES scoutlab_players(id) ON DELETE CASCADE,
  season           TEXT    NOT NULL,
  -- axes: [{ "label": "Final Product", "percentile": 99 }, ...]
  axes             JSONB   NOT NULL DEFAULT '[]',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (player_id, season)
);

CREATE INDEX IF NOT EXISTS idx_sl_radar_player ON scoutlab_radar(player_id);

CREATE TRIGGER scoutlab_radar_updated_at
  BEFORE UPDATE ON scoutlab_radar
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────────────
-- 4. scoutlab_action_maps — 피치 액션 좌표 데이터
-- ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scoutlab_action_maps (
  id               SERIAL  PRIMARY KEY,
  player_id        INTEGER NOT NULL REFERENCES scoutlab_players(id) ON DELETE CASCADE,
  season           TEXT    NOT NULL,
  action_type      TEXT    NOT NULL CHECK (action_type IN ('carries', 'passes', 'crosses')),
  -- lines: [{ "x1":0.1, "y1":0.2, "x2":0.5, "y2":0.6, "progressive":true, "threatening":false }, ...]
  lines            JSONB   NOT NULL DEFAULT '[]',
  total_count      INTEGER NOT NULL DEFAULT 0,
  per90            REAL    NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (player_id, season, action_type)
);

CREATE INDEX IF NOT EXISTS idx_sl_action_maps_player ON scoutlab_action_maps(player_id);

CREATE TRIGGER scoutlab_action_maps_updated_at
  BEFORE UPDATE ON scoutlab_action_maps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────────────
-- 5. scoutlab_similarity — 유사 선수 데이터
-- ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scoutlab_similarity (
  id               SERIAL  PRIMARY KEY,
  player_id        INTEGER NOT NULL REFERENCES scoutlab_players(id) ON DELETE CASCADE,
  season           TEXT    NOT NULL,
  -- similar_players: [{ "rank":1, "name":"...", "team":"...", "league":"...", "age":25, "position":"FW", "score":0.95 }, ...]
  similar_players  JSONB   NOT NULL DEFAULT '[]',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (player_id, season)
);

CREATE INDEX IF NOT EXISTS idx_sl_similarity_player ON scoutlab_similarity(player_id);

CREATE TRIGGER scoutlab_similarity_updated_at
  BEFORE UPDATE ON scoutlab_similarity
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────────────
-- 6. scoutlab_sync_logs — 스크래핑 로그
-- ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scoutlab_sync_logs (
  id               SERIAL  PRIMARY KEY,
  scraper          TEXT    NOT NULL,  -- "player-card", "similarity", "glossary" 등
  season           TEXT    NOT NULL,
  league           TEXT,
  status           TEXT    NOT NULL CHECK (status IN ('success', 'error')),
  records_synced   INTEGER NOT NULL DEFAULT 0,
  records_failed   INTEGER NOT NULL DEFAULT 0,
  error_message    TEXT,
  duration_ms      INTEGER,
  synced_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sl_sync_logs_scraper ON scoutlab_sync_logs(scraper);
CREATE INDEX IF NOT EXISTS idx_sl_sync_logs_synced_at ON scoutlab_sync_logs(synced_at DESC);

-- ================================================================
-- RLS 정책 — 읽기 공개, 쓰기 service_role만
-- ================================================================

ALTER TABLE scoutlab_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sl_players_public_read" ON scoutlab_players FOR SELECT USING (true);
CREATE POLICY "sl_players_service_write" ON scoutlab_players FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE scoutlab_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sl_metrics_public_read" ON scoutlab_metrics FOR SELECT USING (true);
CREATE POLICY "sl_metrics_service_write" ON scoutlab_metrics FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE scoutlab_radar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sl_radar_public_read" ON scoutlab_radar FOR SELECT USING (true);
CREATE POLICY "sl_radar_service_write" ON scoutlab_radar FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE scoutlab_action_maps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sl_action_maps_public_read" ON scoutlab_action_maps FOR SELECT USING (true);
CREATE POLICY "sl_action_maps_service_write" ON scoutlab_action_maps FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE scoutlab_similarity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sl_similarity_public_read" ON scoutlab_similarity FOR SELECT USING (true);
CREATE POLICY "sl_similarity_service_write" ON scoutlab_similarity FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE scoutlab_sync_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sl_sync_logs_service_only" ON scoutlab_sync_logs FOR ALL USING (auth.role() = 'service_role');
