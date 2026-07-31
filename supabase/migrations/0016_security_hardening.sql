-- QA03 보안 감사 조치
-- 1) update_updated_at 함수의 search_path 고정 (Supabase advisor: function_search_path_mutable)
--    search_path를 비워 스키마 하이재킹을 차단. 트리거 함수 내부 참조가 없으므로 안전.
alter function public.update_updated_at() set search_path = '';

-- 2) scoutlab-action-maps 공개 버킷의 listing 허용 정책 제거 (advisor: public_bucket_allows_listing)
--    공개 버킷은 개별 객체 URL 접근에 SELECT 정책이 불필요 — 이 정책은 전체 파일 목록 조회만 열어줌.
--    앱은 DB에 저장된 public URL만 사용하고, 업로드는 service_role(스크래퍼)로 수행하므로 영향 없음.
drop policy if exists "sl_action_maps_images_public_read" on storage.objects;
