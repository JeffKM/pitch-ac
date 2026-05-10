import type { Metadata } from "next";

import { ScoutingTabNav } from "./_components/scouting-tab-nav";

export const metadata: Metadata = {
  title: "Scouting | pitch-ac",
  description: "Big 5 리그 선수 고급 메트릭 스카우팅 플랫폼",
};

export default function ScoutingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <ScoutingTabNav />
      {children}
    </div>
  );
}
