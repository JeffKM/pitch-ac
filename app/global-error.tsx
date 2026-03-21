"use client";

// 루트 레이아웃 에러 바운더리 — ThemeProvider 등 최상위 컴포넌트 에러 대비
// Tailwind 클래스가 적용되지 않을 수 있으므로 인라인 스타일 사용

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[글로벌 에러]", error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            textAlign: "center",
            fontFamily: "sans-serif",
            padding: "20px",
          }}
        >
          <p style={{ fontSize: "48px", fontWeight: "bold", color: "#888" }}>
            500
          </p>
          <p style={{ fontSize: "20px", fontWeight: "600" }}>
            서비스에 문제가 발생했습니다
          </p>
          <p style={{ fontSize: "14px", color: "#666" }}>
            잠시 후 다시 시도해주세요.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "8px 16px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              cursor: "pointer",
              background: "transparent",
              fontSize: "14px",
            }}
          >
            새로고침
          </button>
        </div>
      </body>
    </html>
  );
}
