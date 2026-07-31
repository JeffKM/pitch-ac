-- QA01 성능 감사 조치
-- 1) service 계열 RLS 정책 16개 제거 (advisor: multiple_permissive_policies 70건 + auth_rls_initplan 16건)
--    service_role은 BYPASSRLS라 정책 없이도 전체 접근 가능 — 이 정책들은 기능상 무의미.
--    다른 롤에겐 auth.role() = 'service_role'이 항상 false라 권한 부여 효과도 없음.
--    반면 FOR ALL로 걸려 있어 공개 SELECT마다 함께 평가되며 auth.role()이 행 단위 재호출됨.
--    제거 후: 공개 테이블 14개는 *_public_read만 평가, sync_logs 계열 2개는 정책 0개(기본 거부 = service 전용 유지).
drop policy if exists "fixtures_service_write" on public.fixtures;
drop policy if exists "glossary_service_write" on public.glossary;
drop policy if exists "injuries_service_write" on public.injuries;
drop policy if exists "pms_service_write" on public.player_match_stats;
drop policy if exists "pss_service_write" on public.player_season_stats;
drop policy if exists "players_service_write" on public.players;
drop policy if exists "sl_action_maps_service_write" on public.scoutlab_action_maps;
drop policy if exists "sl_metrics_service_write" on public.scoutlab_metrics;
drop policy if exists "sl_players_service_write" on public.scoutlab_players;
drop policy if exists "sl_radar_service_write" on public.scoutlab_radar;
drop policy if exists "sl_similarity_service_write" on public.scoutlab_similarity;
drop policy if exists "standings_service_write" on public.standings;
drop policy if exists "teams_service_write" on public.teams;
drop policy if exists "tn_service_write" on public.transfer_news;
drop policy if exists "sync_logs_service_only" on public.sync_logs;
drop policy if exists "sl_sync_logs_service_only" on public.scoutlab_sync_logs;

-- 2) injuries.player_id FK 커버링 인덱스 (advisor: unindexed_foreign_keys)
create index if not exists idx_injuries_player_id on public.injuries (player_id);
