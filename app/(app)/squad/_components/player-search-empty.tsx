import { UserSearch } from "lucide-react";

interface PlayerSearchEmptyProps {
  query: string;
}

export function PlayerSearchEmpty({ query }: PlayerSearchEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-comic-black/50">
      <UserSearch className="size-10" />
      <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)]">
        No players found for &quot;{query}&quot;
      </p>
    </div>
  );
}
