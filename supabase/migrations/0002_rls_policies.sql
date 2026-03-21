-- ================================================================
-- RLS 정책 — 읽기 공개, 쓰기는 service_role만
-- ================================================================

-- teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teams_public_read" ON teams FOR SELECT USING (true);
CREATE POLICY "teams_service_write" ON teams FOR ALL USING (auth.role() = 'service_role');

-- players
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "players_public_read" ON players FOR SELECT USING (true);
CREATE POLICY "players_service_write" ON players FOR ALL USING (auth.role() = 'service_role');

-- player_season_stats
ALTER TABLE player_season_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pss_public_read" ON player_season_stats FOR SELECT USING (true);
CREATE POLICY "pss_service_write" ON player_season_stats FOR ALL USING (auth.role() = 'service_role');

-- player_match_stats
ALTER TABLE player_match_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pms_public_read" ON player_match_stats FOR SELECT USING (true);
CREATE POLICY "pms_service_write" ON player_match_stats FOR ALL USING (auth.role() = 'service_role');

-- fixtures
ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fixtures_public_read" ON fixtures FOR SELECT USING (true);
CREATE POLICY "fixtures_service_write" ON fixtures FOR ALL USING (auth.role() = 'service_role');

-- standings
ALTER TABLE standings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "standings_public_read" ON standings FOR SELECT USING (true);
CREATE POLICY "standings_service_write" ON standings FOR ALL USING (auth.role() = 'service_role');

-- glossary
ALTER TABLE glossary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "glossary_public_read" ON glossary FOR SELECT USING (true);
CREATE POLICY "glossary_service_write" ON glossary FOR ALL USING (auth.role() = 'service_role');

-- injuries
ALTER TABLE injuries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "injuries_public_read" ON injuries FOR SELECT USING (true);
CREATE POLICY "injuries_service_write" ON injuries FOR ALL USING (auth.role() = 'service_role');

-- sync_logs
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sync_logs_service_only" ON sync_logs FOR ALL USING (auth.role() = 'service_role');
