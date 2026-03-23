"use client";

// 축구 전문 용어 설명 팝오버

import { CircleHelp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getGlossaryTermById } from "@/lib/mock";

interface GlossaryPopoverProps {
  glossaryId: string;
}

export function GlossaryPopover({ glossaryId }: GlossaryPopoverProps) {
  const term = getGlossaryTermById(glossaryId);
  if (!term) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-5 shrink-0 text-comic-black/50 hover:text-comic-black"
          aria-label={`${term.term} 용어 설명`}
        >
          <CircleHelp className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-2.5">
        <p className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-sm)]">
          {term.term}
        </p>
        <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] text-comic-black">
          {term.definition}
        </p>
        <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] text-comic-black/50">
          {term.analogy}
        </p>
        <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/50 italic">
          예: {term.example}
        </p>
      </PopoverContent>
    </Popover>
  );
}
