// W/D/L 결과별 색상 배지

import { Badge } from "@/components/ui/badge";

type FormResult = "W" | "D" | "L";

interface TeamFormBadgeProps {
  result: FormResult;
}

const RESULT_VARIANT = {
  W: "green",
  D: "yellow",
  L: "red",
} as const;

export function TeamFormBadge({ result }: TeamFormBadgeProps) {
  return (
    <Badge
      variant={RESULT_VARIANT[result]}
      className="size-7 justify-center p-0"
    >
      {result}
    </Badge>
  );
}
