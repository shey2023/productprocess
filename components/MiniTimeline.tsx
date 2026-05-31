type Stage = { key: string };

export default function MiniTimeline({
  stages,
  currentKey,
  isFinal = false,
}: {
  stages: Stage[];
  currentKey: string;
  isFinal?: boolean;
}) {
  const currentIdx = stages.findIndex((s) => s.key === currentKey);
  if (!stages.length) return null;

  return (
    <div className="flex items-center gap-1" dir="rtl" aria-hidden>
      {stages.map((s, i) => {
        const done = isFinal || i < currentIdx;
        const current = !isFinal && i === currentIdx;
        return (
          <span
            key={s.key}
            className={`h-1.5 rounded-full transition-all ${
              current
                ? "w-3 bg-gold"
                : done
                  ? "w-1.5 bg-gold"
                  : "w-1.5 bg-hairline"
            }`}
          />
        );
      })}
    </div>
  );
}
