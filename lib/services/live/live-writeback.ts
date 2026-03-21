// 라이브 경기 종료 후 최종 데이터를 Supabase DB에 반영
import "server-only";

import { fixtureToDbRow } from "@/lib/services/sync/db-mappers";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Fixture } from "@/types";

/** FT 경기의 최종 데이터를 DB에 upsert — fire-and-forget 패턴으로 호출 */
export async function writebackFinishedFixture(
  fixture: Fixture,
): Promise<void> {
  if (fixture.status !== "FT") return;

  try {
    const supabase = createAdminClient();
    const row = fixtureToDbRow(fixture);
    const { error } = await supabase
      .from("fixtures")
      .upsert(row, { onConflict: "id" });

    if (error) {
      console.error(
        `[writebackFinishedFixture] 경기 ${fixture.id} DB 반영 실패:`,
        error.message,
      );
    }
  } catch (error) {
    console.error(`[writebackFinishedFixture] 경기 ${fixture.id} 예외:`, error);
  }
}
