import { UserSearch } from "lucide-react";

interface PlayerSearchEmptyProps {
  query: string;
}

export function PlayerSearchEmpty({ query }: PlayerSearchEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <UserSearch className="size-10" />
      <p className="text-sm">
        &quot;{query}&quot;에 해당하는 선수를 찾을 수 없습니다
      </p>
    </div>
  );
}
