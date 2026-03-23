import { Card, CardContent } from "@/components/ui/card";

export function PlayerCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex animate-pulse flex-col items-center gap-3 p-4">
        <div className="size-20 rounded-full bg-comic-cream" />
        <div className="w-full space-y-1.5 text-center">
          <div className="mx-auto h-4 w-28 rounded bg-comic-cream" />
          <div className="mx-auto h-3 w-20 rounded bg-comic-cream" />
        </div>
        <div className="h-5 w-24 rounded bg-comic-cream" />
      </CardContent>
    </Card>
  );
}
