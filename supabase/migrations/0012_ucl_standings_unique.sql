-- UCL 순위 지원을 위한 standings 유니크 제약 변경
-- 동일 팀이 PL + UCL 순위를 모두 가질 수 있도록 league_id 포함
ALTER TABLE standings DROP CONSTRAINT standings_team_id_season_key;
ALTER TABLE standings ADD CONSTRAINT standings_team_id_season_league_id_key
  UNIQUE (team_id, season, league_id);
