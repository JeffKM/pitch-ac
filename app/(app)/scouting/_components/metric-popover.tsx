"use client";

// ScoutLab 메트릭 설명 팝오버
import { CircleHelp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { SCOUTLAB_GLOSSARY_MAP } from "../_lib/scoutlab-glossary-data";

interface MetricPopoverProps {
  metricKey: string;
}

export function MetricPopover({ metricKey }: MetricPopoverProps) {
  const term = SCOUTLAB_GLOSSARY_MAP[metricKey];
  if (!term) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-5 shrink-0 text-comic-black/30 hover:text-comic-black"
          aria-label={`${term.label} 용어 설명`}
        >
          <CircleHelp className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-2.5">
        <p className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-sm)]">
          {term.label}
        </p>
        <Badge
          variant="secondary"
          className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)]"
        >
          {term.brief}
        </Badge>
        <p className="text-sm leading-relaxed text-comic-black/80">
          {term.description}
        </p>
        {term.example && (
          <p className="text-xs leading-relaxed text-comic-black/50 italic">
            예: {term.example}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
