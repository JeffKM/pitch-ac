// sync-players 디버그 엔드포인트 테스트

import { describe, expect, it, vi } from "vitest";

// "server-only" 모킹
vi.mock("server-only", () => ({}));

vi.mock("@/lib/services/sync", () => ({
  syncPlayers: vi.fn().mockResolvedValue({
    entity: "players",
    status: "success",
    recordsSynced: 500,
  }),
}));

const { GET } = await import("../sync-players/route");

describe("GET /api/debug/football-data/sync-players", () => {
  it("개발 환경에서 syncPlayers 결과를 반환", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.result.entity).toBe("players");
    expect(body.result.status).toBe("success");
    expect(body.result.recordsSynced).toBe(500);
  });
});
