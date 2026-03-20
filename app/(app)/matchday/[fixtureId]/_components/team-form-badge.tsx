// W/D/L 결과별 색상 배지

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type FormResult = "W" | "D" | "L";

interface TeamFormBadgeProps {
  result: FormResult;
}

export function TeamFormBadge({ result }: TeamFormBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("size-7 justify-center p-0 text-xs font-bold", {
        "border-green-500/30 bg-green-500/15 text-green-600 dark:text-green-400":
          result === "W",
        "border-yellow-500/30 bg-yellow-500/15 text-yellow-600 dark:text-yellow-400":
          result === "D",
        "border-red-500/30 bg-red-500/15 text-red-600 dark:text-red-400":
          result === "L",
      })}
    >
      {result}
    </Badge>
  );
}
