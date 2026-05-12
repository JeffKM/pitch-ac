-- ================================================================
-- Phase S5: scoutlab_metrics에 comparison_position 컬럼 추가
-- 포지션 비교 그룹별로 백분위를 별도 저장
-- ================================================================

-- 1. comparison_position 컬럼 추가 (기본값: AM/W)
ALTER TABLE scoutlab_metrics
  ADD COLUMN IF NOT EXISTS comparison_position TEXT NOT NULL DEFAULT 'AM/W';

-- 2. CHECK 제약 추가 (5개 비교 그룹)
ALTER TABLE scoutlab_metrics
  ADD CONSTRAINT chk_comparison_position
  CHECK (comparison_position IN ('CB', 'FB', 'MF', 'AM/W', 'FW'));

-- 3. 기존 UNIQUE 제약 삭제 → 새 UNIQUE 제약 생성
ALTER TABLE scoutlab_metrics
  DROP CONSTRAINT IF EXISTS scoutlab_metrics_player_id_season_mode_adjustment_key;

ALTER TABLE scoutlab_metrics
  ADD CONSTRAINT scoutlab_metrics_player_season_mode_adj_cpos_key
  UNIQUE (player_id, season, mode, adjustment, comparison_position);

-- 4. 기존 데이터: 선수 실제 포지션을 기반으로 comparison_position 업데이트
--    AM, W → AM/W 매핑 (DB의 AM/W 비교 그룹에 해당)
UPDATE scoutlab_metrics m
SET comparison_position = CASE
  WHEN p.position IN ('AM', 'W', 'AM/W') THEN 'AM/W'
  WHEN p.position IN ('CB', 'FB', 'MF', 'FW') THEN p.position
  ELSE 'AM/W'
END
FROM scoutlab_players p
WHERE m.player_id = p.id;

-- 5. comparison_position 인덱스
CREATE INDEX IF NOT EXISTS idx_sl_metrics_comparison_position
  ON scoutlab_metrics(comparison_position);
