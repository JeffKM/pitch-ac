// ScoutLab 공통 필터 영역 — 시즌별 필터 옵션 조회 후 필터 바 + 글로벌 검색 렌더
// searchParams await를 Suspense 경계 안쪽으로 옮겨 페이지 셸이 즉시 렌더되도록 분리

import { getScoutlabFilterOptions } from "@/lib/repositories/scoutlab-repository";

import { parseScoutlabParams } from "../_lib/scoutlab-search-params";
import { ScoutlabFilterBar } from "./scoutlab-filter-bar";
import { ScoutlabGlobalSearch } from "./scoutlab-global-search";

interface ScoutlabFilterSectionProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function ScoutlabFilterSection({
  searchParams,
}: ScoutlabFilterSectionProps) {
  const params = parseScoutlabParams(await searchParams);
  const options = await getScoutlabFilterOptions(params.season);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ScoutlabFilterBar options={options} />
      <ScoutlabGlobalSearch />
    </div>
  );
}
