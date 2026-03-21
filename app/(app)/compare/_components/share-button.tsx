"use client";

// Share as Image 버튼 — Phase 4에서 실제 구현, 현재 UI만 배치

import { Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  disabled?: boolean;
}

export function ShareButton({ disabled }: ShareButtonProps) {
  return (
    <Button
      variant="outline"
      disabled={disabled}
      onClick={() => {
        // Phase 4에서 구현 예정
      }}
    >
      <Share2 className="size-4" />
      Share as Image
    </Button>
  );
}
