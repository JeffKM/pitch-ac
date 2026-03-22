import { Card, CardContent } from "@/components/ui/card";

export function PlayerCardSkeleton() {
  return (
    <Card className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-white">
      <CardContent className="flex animate-pulse flex-col items-center gap-3 p-4">
        <div className="size-20 rounded-full bg-muted" />
        <div className="w-full space-y-1.5 text-center">
          <div className="mx-auto h-4 w-28 rounded bg-muted" />
          <div className="mx-auto h-3 w-20 rounded bg-muted" />
        </div>
        <div className="h-5 w-24 rounded bg-muted" />
      </CardContent>
    </Card>
  );
}
