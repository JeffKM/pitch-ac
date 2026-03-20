export default async function FixtureDetailPage({
  params,
}: {
  params: Promise<{ fixtureId: string }>;
}) {
  const { fixtureId } = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">경기 상세</h1>
      <p className="text-muted-foreground">경기 ID: {fixtureId}</p>
    </div>
  );
}
