import Link from "next/link";

import { ComicPanel, ComicPanelHeading, ComicPanelTitle } from "./comic-panel";

/* ── 선수 뱃지 (피그마: 원형 + 번호 + 포지션) ── */
function PlayerBadge({
  number,
  position,
}: {
  number: string;
  position: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex size-[60px] items-center justify-center rounded-full border-[var(--comic-border-width)] border-comic-black bg-comic-white md:size-[80px]">
        <span
          className="font-[family-name:var(--font-bangers)] text-comic-black"
          style={{
            fontSize: "var(--comic-text-xl)",
            lineHeight: "var(--comic-leading-normal)",
          }}
        >
          {number}
        </span>
      </div>
      <span
        className="font-[family-name:var(--font-permanent-marker)] text-comic-black/70"
        style={{ fontSize: "var(--comic-body-xs)" }}
      >
        {position}
      </span>
    </div>
  );
}

/* ── 스탯 카드 (피그마: 크림 배경 + 라벨/값) ── */
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black bg-comic-cream px-4 py-2 text-center">
      <span
        className="block font-[family-name:var(--font-permanent-marker)] text-comic-black/60"
        style={{
          fontSize: "var(--comic-body-xs)",
          letterSpacing: "var(--comic-tracking-tight)",
        }}
      >
        {label}
      </span>
      <span
        className="block font-[family-name:var(--font-bangers)] text-comic-black"
        style={{
          fontSize: "var(--comic-text-base)",
          lineHeight: "var(--comic-leading-loose)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ── 액션 뱃지 (피그마: TACKLE!/BLOCK! 패턴) ── */
function ActionBadge({
  label,
  count,
  color = "skyblue",
}: {
  label: string;
  count: string;
  color?: "skyblue" | "pink";
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span
        className="font-[family-name:var(--font-bangers)] text-comic-black"
        style={{
          fontSize: "var(--comic-text-base)",
          letterSpacing: "var(--comic-tracking-normal)",
        }}
      >
        {label}
      </span>
      <div
        className={`flex size-12 items-center justify-center rounded-full border-[var(--comic-border-width)] border-comic-black ${color === "pink" ? "bg-comic-pink" : "bg-comic-skyblue"}`}
      >
        <span
          className="font-[family-name:var(--font-bangers)] text-comic-white"
          style={{ fontSize: "var(--comic-text-lg)" }}
        >
          {count}
        </span>
      </div>
    </div>
  );
}

/* ── 포메이션 마커 (피그마: Tactics Board) ── */
function FormationMarker({
  number,
  className,
}: {
  number: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute flex size-7 items-center justify-center rounded-full border-[var(--comic-border-thin)] border-comic-white/80 bg-comic-skyblue ${className}`}
    >
      <span
        className="font-[family-name:var(--font-bangers)] text-comic-white"
        style={{ fontSize: "var(--comic-text-xs)" }}
      >
        {number}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════
   메인 홈 컴포넌트 (피그마 Main Content)
   ══════════════════════════════════════════════ */
export function ComicHome() {
  return (
    <main className="mx-auto max-w-5xl p-[var(--comic-panel-padding)]">
      {/* ━━━ 상단 2패널 그리드 (피그마 ComicPanelGrid 1) ━━━ */}
      <div className="grid gap-[var(--comic-panel-gap)] md:grid-cols-2">
        {/* 패널 1: Etihad Stadium */}
        <ComicPanel bg="skyblue" className="p-[var(--comic-panel-padding)]">
          <ComicPanelHeading
            title="ETIHAD STADIUM"
            subtitle="HOME OF THE CHAMPIONS"
          />

          {/* 선수 뱃지 */}
          <div className="flex justify-center gap-4 py-4">
            <PlayerBadge number="10" position="MID" />
            <PlayerBadge number="9" position="FWD" />
            <PlayerBadge number="17" position="MID" />
          </div>

          {/* GOAL! GOAL! 텍스트 */}
          <div className="mt-4">
            <p
              className="font-[family-name:var(--font-bangers)] text-comic-red"
              style={{
                fontSize: "clamp(36px, 8vw, var(--comic-text-5xl))",
                lineHeight: "var(--comic-leading-tight)",
                letterSpacing: "var(--comic-tracking-widest)",
              }}
            >
              GOAL! GOAL!
            </p>
            <p
              className="font-[family-name:var(--font-bangers)] text-comic-red/70"
              style={{
                fontSize: "clamp(28px, 6vw, var(--comic-text-4xl))",
                lineHeight: "var(--comic-leading-tight)",
                letterSpacing: "var(--comic-tracking-widest)",
              }}
            >
              GOAL! GOAL!
            </p>
          </div>
        </ComicPanel>

        {/* 패널 2: Match Action */}
        <ComicPanel bg="green" className="p-[var(--comic-panel-padding)]">
          <ComicPanelHeading
            title="MATCH ACTION"
            subtitle="LIVE FROM THE PITCH"
          />

          {/* 액션 뱃지 */}
          <div className="flex items-center justify-between px-4 py-6">
            <ActionBadge label="TACKLE!" count="5" color="skyblue" />
            <div className="flex size-16 items-center justify-center rounded-full border-[var(--comic-border-width)] border-comic-black bg-comic-black">
              <span className="text-2xl">⚽</span>
            </div>
            <ActionBadge label="BLOCK!" count="3" color="pink" />
          </div>

          {/* SMASH! CRASH! */}
          <div className="mt-4">
            <p
              className="font-[family-name:var(--font-bangers)] text-comic-red"
              style={{
                fontSize: "clamp(32px, 7vw, var(--comic-text-4xl))",
                lineHeight: "var(--comic-leading-tight)",
                letterSpacing: "var(--comic-tracking-mega)",
              }}
            >
              SMASH!
            </p>
            <p
              className="font-[family-name:var(--font-bangers)] text-comic-red/70"
              style={{
                fontSize: "clamp(26px, 5vw, var(--comic-text-3xl))",
                lineHeight: "var(--comic-leading-tight)",
                letterSpacing: "var(--comic-tracking-ultra)",
              }}
            >
              CRASH!
            </p>
          </div>
        </ComicPanel>
      </div>

      {/* ━━━ 하단 3패널 그리드 (피그마 ComicPanelGrid 2) ━━━ */}
      <div className="mt-[var(--comic-panel-gap)] grid gap-[var(--comic-panel-gap)] md:grid-cols-3">
        {/* 패널 3: Player Spotlight */}
        <ComicPanel bg="white" className="p-[var(--comic-panel-padding)]">
          <ComicPanelTitle title="PLAYER SPOTLIGHT" />

          {/* 아바타 */}
          <div className="flex justify-center py-3">
            <div className="relative">
              <div className="flex size-[128px] items-center justify-center rounded-full border-[var(--comic-border-width)] border-comic-black bg-comic-skyblue">
                <span
                  className="font-[family-name:var(--font-bangers)] text-comic-white"
                  style={{
                    fontSize: "var(--comic-text-3xl)",
                    lineHeight: "var(--comic-leading-tight)",
                  }}
                >
                  H
                </span>
              </div>
              {/* 등번호 뱃지 */}
              <div className="absolute -right-1 -bottom-1 flex size-12 items-center justify-center rounded-full border-[var(--comic-border-width)] border-comic-black bg-comic-yellow">
                <span
                  className="font-[family-name:var(--font-bangers)] text-comic-black"
                  style={{ fontSize: "var(--comic-text-lg)" }}
                >
                  9
                </span>
              </div>
            </div>
          </div>

          {/* 선수명 */}
          <div className="mb-3 border-comic-black/20 border-b-[var(--comic-border-thin)] pb-2 text-center">
            <span
              className="font-[family-name:var(--font-bangers)] text-comic-black"
              style={{
                fontSize: "var(--comic-text-base)",
                letterSpacing: "var(--comic-tracking-normal)",
              }}
            >
              HAALAND
            </span>
          </div>

          {/* 스탯 카드 */}
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="GOALS" value="36" />
            <StatCard label="ASSISTS" value="12" />
            <StatCard label="RATING" value="9.5" />
          </div>
        </ComicPanel>

        {/* 패널 4: Upcoming Fixture */}
        <ComicPanel bg="white" className="p-[var(--comic-panel-padding)]">
          <ComicPanelTitle title="UPCOMING FIXTURE" />

          {/* 리그 뱃지 */}
          <div className="mb-4 flex justify-center">
            <span
              className="rounded-[var(--comic-panel-radius)] bg-comic-pink px-4 py-1 font-[family-name:var(--font-bangers)] text-comic-white"
              style={{
                fontSize: "var(--comic-text-base)",
                letterSpacing: "var(--comic-tracking-normal)",
              }}
            >
              PREMIER LEAGUE
            </span>
          </div>

          {/* VS 매치업 */}
          <div className="flex items-center justify-between px-2 py-3">
            <div className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full border-[var(--comic-border-width)] border-comic-black bg-comic-skyblue">
                <span
                  className="font-[family-name:var(--font-bangers)] text-comic-white"
                  style={{ fontSize: "var(--comic-text-base)" }}
                >
                  MC
                </span>
              </div>
              <span
                className="mt-1 block font-[family-name:var(--font-bangers)] text-comic-black"
                style={{ fontSize: "var(--comic-text-sm)" }}
              >
                CITY
              </span>
            </div>

            <span
              className="font-[family-name:var(--font-bangers)] text-comic-black"
              style={{
                fontSize: "var(--comic-text-2xl)",
                letterSpacing: "0.75px",
              }}
            >
              VS
            </span>

            <div className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full border-[var(--comic-border-width)] border-comic-black bg-comic-red">
                <span
                  className="font-[family-name:var(--font-bangers)] text-comic-white"
                  style={{ fontSize: "var(--comic-text-base)" }}
                >
                  MU
                </span>
              </div>
              <span
                className="mt-1 block font-[family-name:var(--font-bangers)] text-comic-black"
                style={{ fontSize: "var(--comic-text-sm)" }}
              >
                UNITED
              </span>
            </div>
          </div>

          {/* 경기 정보 */}
          <div className="mt-3 space-y-1 border-comic-black/20 border-t-[var(--comic-border-thin)] pt-3">
            <div className="flex justify-between">
              <span
                className="font-[family-name:var(--font-permanent-marker)] text-comic-black/60"
                style={{ fontSize: "var(--comic-body-sm)" }}
              >
                DATE:
              </span>
              <span
                className="font-[family-name:var(--font-bangers)] text-comic-black"
                style={{ fontSize: "var(--comic-text-xs)" }}
              >
                SUN 12 MAY
              </span>
            </div>
            <div className="flex justify-between">
              <span
                className="font-[family-name:var(--font-permanent-marker)] text-comic-black/60"
                style={{ fontSize: "var(--comic-body-sm)" }}
              >
                TIME:
              </span>
              <span
                className="font-[family-name:var(--font-bangers)] text-comic-black"
                style={{ fontSize: "var(--comic-text-xs)" }}
              >
                15:00
              </span>
            </div>
            <p
              className="pt-1 text-center font-[family-name:var(--font-permanent-marker)] text-comic-black/50"
              style={{ fontSize: "var(--comic-body-xs)" }}
            >
              ETIHAD STADIUM
            </p>
          </div>
        </ComicPanel>

        {/* 패널 5: Tactics Board */}
        <ComicPanel
          bg="green"
          className="p-[var(--comic-panel-padding)] md:row-span-1"
        >
          <ComicPanelTitle title="TACTICS BOARD" />

          {/* 축구장 미니맵 */}
          <div className="relative mx-auto aspect-[2/3] w-full rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-white/50 bg-comic-green">
            {/* 필드 라인 */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-comic-white/50" />
            <div className="absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-[var(--comic-border-thin)] border-comic-white/50" />

            {/* 4-3-3 포메이션 */}
            <FormationMarker
              number="9"
              className="top-[10%] left-1/2 -translate-x-1/2"
            />
            <FormationMarker number="7" className="top-[22%] left-[20%]" />
            <FormationMarker number="11" className="top-[22%] right-[20%]" />
            <FormationMarker
              number="8"
              className="top-[40%] left-1/2 -translate-x-1/2"
            />
            <FormationMarker number="5" className="top-[55%] left-[25%]" />
            <FormationMarker number="3" className="top-[55%] right-[25%]" />
            <FormationMarker
              number="GK"
              className="bottom-[10%] left-1/2 -translate-x-1/2"
            />
          </div>

          {/* 포메이션 라벨 */}
          <div className="mt-2 flex justify-center">
            <span
              className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/30 bg-comic-white px-3 py-1 font-[family-name:var(--font-bangers)] text-comic-black"
              style={{ fontSize: "var(--comic-text-xs)" }}
            >
              4-3-3
            </span>
          </div>

          <div className="mt-2 text-center">
            <span
              className="font-[family-name:var(--font-bangers)] text-comic-black/80"
              style={{
                fontSize: "var(--comic-text-sm)",
                letterSpacing: "var(--comic-tracking-wide)",
              }}
            >
              FORMATION ANALYSIS
            </span>
          </div>
        </ComicPanel>
      </div>

      {/* ━━━ 브레이킹 뉴스 배너 (피그마 ComicPanelBox) ━━━ */}
      <div className="mt-[var(--comic-panel-gap)]">
        <ComicPanel
          bg="yellow"
          className="flex flex-col items-stretch gap-4 p-[var(--comic-panel-padding)] md:flex-row md:items-center"
        >
          <div className="flex flex-1 items-start gap-4">
            {/* ! 아이콘 */}
            <div className="flex size-16 shrink-0 items-center justify-center rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-yellow">
              <span
                className="font-[family-name:var(--font-bangers)] text-comic-black"
                style={{
                  fontSize: "var(--comic-text-2xl)",
                  lineHeight: "var(--comic-leading-tight)",
                }}
              >
                !
              </span>
            </div>

            <div className="flex-1">
              <p
                className="font-[family-name:var(--font-bangers)] text-comic-black"
                style={{
                  fontSize: "var(--comic-text-2xl)",
                  lineHeight: "var(--comic-leading-snug)",
                  letterSpacing: "0.75px",
                }}
              >
                BREAKING NEWS!
              </p>
              <p
                className="mt-1 font-[family-name:var(--font-permanent-marker)] text-comic-black/80"
                style={{
                  fontSize: "var(--comic-body-lg)",
                }}
              >
                City dominate in latest match! Haaland scores hat-trick for the
                victory!
              </p>
            </div>
          </div>

          <Link
            href="/matchday"
            className="inline-flex items-center justify-center rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-black px-6 py-3 font-[family-name:var(--font-bangers)] text-comic-yellow transition-transform hover:scale-105"
            style={{
              fontSize: "var(--comic-text-lg)",
              letterSpacing: "var(--comic-tracking-wide)",
            }}
          >
            READ MORE
          </Link>
        </ComicPanel>
      </div>
    </main>
  );
}
