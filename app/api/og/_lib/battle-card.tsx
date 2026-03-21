// OG 이미지 배틀카드 JSX 레이아웃 (satori용 — 인라인 CSS 필수)
// satori 제약: CSS Grid 미지원, OKLCH 미지원, Tailwind 미지원

import type { Player, PlayerSeasonStats, Team } from "@/types";

import {
  computeVerdictData,
  getStatWinner,
  OG_STAT_DEFINITIONS,
} from "./compare-utils";

// satori는 OKLCH 미지원 → HEX 하드코딩
const CHART_1 = "#e76f51"; // 선수 A 색상
const CHART_2 = "#2a9d8f"; // 선수 B 색상
const BG_DARK = "#0a0a0a";
const BG_CARD = "#1a1a2e";
const TEXT_PRIMARY = "#fafafa";
const TEXT_MUTED = "#a1a1aa";

interface BattleCardProps {
  player1: Player;
  player2: Player;
  stats1: PlayerSeasonStats;
  stats2: PlayerSeasonStats;
  team1: Team | null;
  team2: Team | null;
}

/** satori에 전달할 JSX 반환 (React 컴포넌트 아님 — hooks/state 불가) */
export function renderBattleCard({
  player1,
  player2,
  stats1,
  stats2,
  team1,
  team2,
}: BattleCardProps) {
  const verdict = computeVerdictData(
    stats1,
    stats2,
    player1.name,
    player2.name,
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        background: `linear-gradient(135deg, ${BG_DARK} 0%, ${BG_CARD} 100%)`,
        color: TEXT_PRIMARY,
        padding: "40px 60px",
      }}
    >
      {/* 헤더 타이틀 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          color: TEXT_MUTED,
          letterSpacing: "2px",
          textTransform: "uppercase",
          marginBottom: "20px",
        }}
      >
        pitch-ac · PL Battle Card
      </div>

      {/* 선수 프로필 영역 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          marginBottom: "24px",
        }}
      >
        {/* 선수 1 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={player1.photoUrl}
            width={90}
            height={90}
            alt={player1.name}
            style={{
              borderRadius: "50%",
              border: `3px solid ${CHART_1}`,
              objectFit: "cover",
            }}
          />
          <span
            style={{
              fontSize: "26px",
              fontWeight: 700,
              marginTop: "10px",
              color: CHART_1,
              textAlign: "center",
            }}
          >
            {player1.name}
          </span>
          <span
            style={{ fontSize: "14px", color: TEXT_MUTED, marginTop: "4px" }}
          >
            {team1?.shortName ?? ""} · {player1.position}
          </span>
        </div>

        {/* VS */}
        <div
          style={{
            fontSize: "36px",
            fontWeight: 700,
            padding: "0 32px",
            color: TEXT_MUTED,
          }}
        >
          VS
        </div>

        {/* 선수 2 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={player2.photoUrl}
            width={90}
            height={90}
            alt={player2.name}
            style={{
              borderRadius: "50%",
              border: `3px solid ${CHART_2}`,
              objectFit: "cover",
            }}
          />
          <span
            style={{
              fontSize: "26px",
              fontWeight: 700,
              marginTop: "10px",
              color: CHART_2,
              textAlign: "center",
            }}
          >
            {player2.name}
          </span>
          <span
            style={{ fontSize: "14px", color: TEXT_MUTED, marginTop: "4px" }}
          >
            {team2?.shortName ?? ""} · {player2.position}
          </span>
        </div>
      </div>

      {/* 스탯 비교 행들 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "12px",
          padding: "12px 24px",
        }}
      >
        {OG_STAT_DEFINITIONS.map((def, index) => {
          const v1 = stats1[def.key] as number | null;
          const v2 = stats2[def.key] as number | null;
          const winner = getStatWinner(v1, v2);
          const fmt = def.format ?? String;
          const isLast = index === OG_STAT_DEFINITIONS.length - 1;

          return (
            <div
              key={def.key as string}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px 0",
                borderBottom: isLast
                  ? "none"
                  : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {/* 선수1 수치 */}
              <span
                style={{
                  flex: 1,
                  textAlign: "right",
                  fontSize: "20px",
                  fontWeight: winner === "player1" ? 700 : 400,
                  color: winner === "player1" ? CHART_1 : TEXT_PRIMARY,
                }}
              >
                {v1 === null ? "N/A" : fmt(v1)}
              </span>

              {/* 중앙: 지표명 + 우위 표시 */}
              <div
                style={{
                  width: "130px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2px",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    color: TEXT_MUTED,
                    textAlign: "center",
                  }}
                >
                  {def.label}
                </span>
                {winner && winner !== "draw" && (
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: winner === "player1" ? CHART_1 : CHART_2,
                    }}
                  />
                )}
              </div>

              {/* 선수2 수치 */}
              <span
                style={{
                  flex: 1,
                  textAlign: "left",
                  fontSize: "20px",
                  fontWeight: winner === "player2" ? 700 : 400,
                  color: winner === "player2" ? CHART_2 : TEXT_PRIMARY,
                }}
              >
                {v2 === null ? "N/A" : fmt(v2)}
              </span>
            </div>
          );
        })}
      </div>

      {/* 판정 */}
      <div
        style={{
          marginTop: "16px",
          fontSize: "18px",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {verdict.isDraw ? (
          <span style={{ color: TEXT_MUTED }}>
            Draw — {verdict.player1Wins}/{OG_STAT_DEFINITIONS.length} categories
            tied
          </span>
        ) : (
          <span style={{ display: "flex", alignItems: "center" }}>
            <span style={{ color: TEXT_MUTED, marginRight: "6px" }}>
              Verdict:
            </span>
            <span
              style={{
                color: verdict.isPlayer1Leading ? CHART_1 : CHART_2,
                marginRight: "6px",
              }}
            >
              {verdict.leaderName}
            </span>
            <span style={{ color: TEXT_MUTED }}>
              leads in {verdict.leadCount}/{OG_STAT_DEFINITIONS.length}{" "}
              categories
            </span>
          </span>
        )}
      </div>

      {/* 워터마크 */}
      <div
        style={{
          marginTop: "12px",
          fontSize: "13px",
          color: TEXT_MUTED,
          letterSpacing: "1px",
        }}
      >
        Compare on pitch-ac
      </div>
    </div>
  );
}
