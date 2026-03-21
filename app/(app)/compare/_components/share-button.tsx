"use client";

// Share as Image 버튼 — OG 이미지 다운로드 (fetch → blob → <a download>)

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  disabled?: boolean;
  player1Id?: number;
  player2Id?: number;
  player1Name?: string;
  player2Name?: string;
}

export function ShareButton({
  disabled,
  player1Id,
  player2Id,
  player1Name,
  player2Name,
}: ShareButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    if (!player1Id || !player2Id) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/og?p1=${player1Id}&p2=${player2Id}`);

      if (!response.ok) {
        throw new Error("이미지 생성 실패");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // <a download> 패턴으로 PNG 다운로드 트리거
      const a = document.createElement("a");
      a.href = url;
      a.download = `${player1Name ?? "player1"}-vs-${player2Name ?? "player2"}-pitch-ac.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
      toast.success("이미지가 다운로드되었습니다");
    } catch {
      toast.error("이미지 다운로드에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      disabled={disabled || isLoading}
      onClick={handleDownload}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      Share as Image
    </Button>
  );
}
