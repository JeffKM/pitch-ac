import { mockPlayers } from "@/lib/mock";

export default function ComparePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">선수 비교</h1>
      <p className="text-muted-foreground">
        데이터 준비 완료 — {mockPlayers.length}명의 선수 데이터가
        로드되었습니다.
      </p>
    </div>
  );
}
