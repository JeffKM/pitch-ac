// 선수 비교 페이지 이동 버튼

import { GitCompareArrows } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

interface CompareButtonProps {
  playerId: number;
}

export function CompareButton({ playerId }: CompareButtonProps) {
  return (
    <Button variant="outline" asChild>
      <Link href={`/compare?p1=${playerId}`}>
        <GitCompareArrows className="size-4" />
        선수 비교
      </Link>
    </Button>
  );
}
