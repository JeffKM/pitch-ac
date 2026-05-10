-- ScoutLab "AM/W" 포지션 허용 추가
ALTER TABLE scoutlab_players DROP CONSTRAINT IF EXISTS scoutlab_players_position_check;
ALTER TABLE scoutlab_players ADD CONSTRAINT scoutlab_players_position_check
  CHECK (position IN ('CB', 'FB', 'MF', 'AM', 'W', 'AM/W', 'FW'));
