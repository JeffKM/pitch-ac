import { PlayerCardSkeleton } from "./_components/player-card-skeleton";

export default function PlayersLoading() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-40 animate-pulse rounded bg-comic-cream" />
      <div className="h-10 w-full animate-pulse rounded-md bg-comic-cream" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <PlayerCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
