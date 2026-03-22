// 라이브 경기 펄스 인디케이터

export function LivePulse() {
  return (
    <span className="relative flex size-2">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-comic-green opacity-75" />
      <span className="relative inline-flex size-2 rounded-full bg-comic-green" />
    </span>
  );
}
