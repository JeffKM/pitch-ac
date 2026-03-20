export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">선수 프로필</h1>
      <p className="text-muted-foreground">선수 ID: {playerId}</p>
    </div>
  );
}
