-- 카툰 에셋 시스템 제거 (0003_cartoon_tables.sql 롤백)
-- 카툰 UI·서비스·타입 코드가 모두 삭제되어 테이블이 더 이상 참조되지 않는다.
-- 원격 DB에는 0003이 적용된 적이 없어 실제로는 no-op이지만,
-- 스키마 히스토리를 코드 상태와 일치시키기 위해 명시적으로 남긴다.

drop table if exists public.cartoon_assets;
