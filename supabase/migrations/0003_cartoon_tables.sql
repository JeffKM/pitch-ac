-- 카툰 에셋 시스템 테이블 (맨시티 카툰 팬사이트)

-- cartoon_assets: 선수별 감정 상태 → 이미지 URL 매핑
CREATE TABLE IF NOT EXISTS cartoon_assets (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  mood TEXT NOT NULL CHECK (mood IN (
    'neutral', 'happy', 'celebrating', 'angry', 'sad',
    'shocked', 'tired', 'injured', 'focused', 'laughing',
    'crying', 'thinking'
  )),
  image_url TEXT NOT NULL,
  thumb_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (player_id, mood)
);

-- speech_bubbles: 선수별 이벤트 트리거 → 말풍선 대사
CREATE TABLE IF NOT EXISTS speech_bubbles (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'goal_scored', 'goal_conceded', 'assist', 'red_card',
    'yellow_card', 'substitution_in', 'substitution_out',
    'match_win', 'match_loss', 'high_rating', 'low_rating',
    'halftime', 'prematch'
  )),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_cartoon_assets_player_id ON cartoon_assets(player_id);
CREATE INDEX idx_cartoon_assets_mood ON cartoon_assets(mood);
CREATE INDEX idx_speech_bubbles_player_id ON speech_bubbles(player_id);
CREATE INDEX idx_speech_bubbles_trigger ON speech_bubbles(trigger_type);

-- updated_at 자동 갱신 트리거
CREATE TRIGGER set_updated_at_cartoon_assets
  BEFORE UPDATE ON cartoon_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_speech_bubbles
  BEFORE UPDATE ON speech_bubbles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS 정책: 읽기 공개, 쓰기 service_role만
ALTER TABLE cartoon_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE speech_bubbles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cartoon_assets_select" ON cartoon_assets
  FOR SELECT USING (true);

CREATE POLICY "cartoon_assets_insert" ON cartoon_assets
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "cartoon_assets_update" ON cartoon_assets
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "cartoon_assets_delete" ON cartoon_assets
  FOR DELETE USING (auth.role() = 'service_role');

CREATE POLICY "speech_bubbles_select" ON speech_bubbles
  FOR SELECT USING (true);

CREATE POLICY "speech_bubbles_insert" ON speech_bubbles
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "speech_bubbles_update" ON speech_bubbles
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "speech_bubbles_delete" ON speech_bubbles
  FOR DELETE USING (auth.role() = 'service_role');
