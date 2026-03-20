// 양팀 최근 5경기 폼 비교 카드

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { TeamFormBadge } from "./team-form-badge";

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
        <CardTitle className="text-sm font-medium">최근 5경기 폼</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* 홈팀 */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{homeTeamName}</p>
            <div className="flex gap-1">
              {homeForm.length > 0 ? (
                homeForm.map((result, i) => (
                  <TeamFormBadge key={i} result={result as "W" | "D" | "L"} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground">데이터 없음</p>
              )}
            </div>
          </div>

          {/* 어웨이팀 */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{awayTeamName}</p>
            <div className="flex gap-1">
              {awayForm.length > 0 ? (
                awayForm.map((result, i) => (
                  <TeamFormBadge key={i} result={result as "W" | "D" | "L"} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground">데이터 없음</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
