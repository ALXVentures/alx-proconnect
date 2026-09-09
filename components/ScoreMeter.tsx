const THRESHOLD = 4.6;
const MAX = 5;

export function ScoreMeter({
  value,
  tone = "brass",
  compact = false,
}: {
  value?: number | null;
  tone?: "brass" | "teal";
  compact?: boolean;
}) {
  const accent = tone === "brass" ? "var(--brass-hi)" : "var(--teal-hi)";
  const pct = (v: number) => `${(v / MAX) * 100}%`;

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="font-mono text-[10px] tracking-widest uppercase text-text-lo">
          Showcase rubric
        </span>
        {typeof value === "number" && (
          <span className="font-mono text-xs" style={{ color: accent }}>
            {value.toFixed(1)}/{MAX}.0
          </span>
        )}
      </div>
      <div
        className={`relative w-full ${
          compact ? "h-1.5" : "h-2"
        } rounded-full bg-ink-3 overflow-hidden`}
      >
        {typeof value === "number" && (
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: pct(value), background: accent }}
          />
        )}
        {/* threshold tick */}
        <div
          className="absolute inset-y-0 w-px bg-text-hi/50"
          style={{ left: pct(THRESHOLD) }}
        />
      </div>
      {!compact && (
        <div className="mt-1 font-mono text-[10px] text-text-lo">
          Published profiles cleared the {THRESHOLD.toFixed(1)}+ pitch-panel bar
        </div>
      )}
    </div>
  );
}
