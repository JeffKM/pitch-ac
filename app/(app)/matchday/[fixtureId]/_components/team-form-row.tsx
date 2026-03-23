// 양팀 최근 5경기 폼 비교 카드

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { TeamFormBadge } from "./team-form-badge";

function isFormResult(v: string): v is "W" | "D" | "L" {
  return v === "W" || v === "D" || v === "L";
}

interface TeamFormRowProps {
  homeTeamName: string;
  awayTeamName: string;
  homeForm: string[];
  awayForm: string[];
}

export function TeamFormRow({
  homeTeamName,
  awayTeamName,
  homeForm,
  awayForm,
}: TeamFormRowProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>최근 5경기 폼</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/50">
              {homeTeamName}
            </p>
            <div className="flex gap-1">
              {homeForm.length > 0 ? (
                homeForm
                  .filter(isFormResult)
                  .map((result, i) => <TeamFormBadge key={i} result={result} />)
              ) : (
                <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/50">
                  데이터 없음
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/50">
              {awayTeamName}
            </p>
            <div className="flex gap-1">
              {awayForm.length > 0 ? (
                awayForm
                  .filter(isFormResult)
                  .map((result, i) => <TeamFormBadge key={i} result={result} />)
              ) : (
                <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/50">
                  데이터 없음
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
