-- scoutlab_action_maps에 이미지 URL 컬럼 추가
-- Action Maps 차트가 서버사이드 PNG로 렌더링되어 라인 좌표 대신 이미지 저장
ALTER TABLE scoutlab_action_maps
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Supabase Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('scoutlab-action-maps', 'scoutlab-action-maps', true)
ON CONFLICT (id) DO NOTHING;

-- Storage 공개 읽기 정책
CREATE POLICY "sl_action_maps_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'scoutlab-action-maps');

-- Storage 서비스 역할 쓰기 정책
CREATE POLICY "sl_action_maps_images_service_write"
  ON storage.objects FOR ALL
  USING (bucket_id = 'scoutlab-action-maps' AND auth.role() = 'service_role');
