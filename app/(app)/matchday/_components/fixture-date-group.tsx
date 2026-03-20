// 날짜별 경기 그룹 래퍼

interface FixtureDateGroupProps {
  dateLabel: string;
  children: React.ReactNode;
}

export function FixtureDateGroup({
  dateLabel,
  children,
}: FixtureDateGroupProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">{dateLabel}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
