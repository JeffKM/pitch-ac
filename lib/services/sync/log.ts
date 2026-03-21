import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

/** unknown 에러에서 메시지 추출 (Supabase PostgrestError 포함) */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const { message, details, code } = error as Record<string, unknown>;
    const parts = [String(message)];
    if (code) parts.push(`code: ${code}`);
    if (details) parts.push(`details: ${details}`);
    return parts.join(" | ");
  }
  return String(error);
}

/** 동기화 작업 결과 */
export interface SyncResult {
  entity: string;
  status: "success" | "error";
  recordsSynced: number;
  errorMessage?: string;
}

/** sync_logs 테이블에 결과 기록 */
export async function writeSyncLog(
  supabase: SupabaseClient,
  result: SyncResult,
): Promise<void> {
  const { error } = await supabase.from("sync_logs").insert({
    entity: result.entity,
    status: result.status,
    records_synced: result.recordsSynced,
    error_message: result.errorMessage ?? null,
  });

  if (error) {
    console.error("[writeSyncLog] 로그 기록 실패:", error.message);
  }
}
