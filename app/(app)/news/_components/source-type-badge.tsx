// 소스 타입 아이콘 + 텍스트 뱃지

import { FileText, Newspaper, Play, Twitter } from "lucide-react";

import type { SourceType } from "@/types";

const SOURCE_CONFIG: Record<
  SourceType,
  { icon: typeof Twitter; label: string; className: string }
> = {
  tweet: {
    icon: Twitter,
    label: "Tweet",
    className: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  },
  article: {
    icon: Newspaper,
    label: "Article",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  video: {
    icon: Play,
    label: "Video",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  summary: {
    icon: FileText,
    label: "Summary",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
};

interface SourceTypeBadgeProps {
  type: SourceType;
}

export function SourceTypeBadge({ type }: SourceTypeBadgeProps) {
  const config = SOURCE_CONFIG[type];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] ${config.className}`}
    >
      <Icon className="size-3" />
      {config.label}
    </span>
  );
}
