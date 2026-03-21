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
          className="size-5 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label={`${term.term} 용어 설명`}
        >
          <CircleHelp className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-2.5">
        <p className="font-semibold">{term.term}</p>
        <p className="text-sm text-foreground">{term.definition}</p>
        <p className="text-sm text-muted-foreground">{term.analogy}</p>
        <p className="text-xs text-muted-foreground italic">
          예: {term.example}
        </p>
      </PopoverContent>
    </Popover>
  );
}
