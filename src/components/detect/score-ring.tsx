import { cn } from "@/lib/utils";
import type { CombinedVerdict } from "@/lib/detect/types";

const TONE: Record<CombinedVerdict, string> = {
  idle: "var(--color-muted)",
  low: "var(--color-clear)",
  medium: "var(--color-risk)",
  high: "var(--color-blocked)",
  blocked: "var(--color-blocked)",
  "china-block": "var(--color-blocked)",
};

type Props = {
  score: number;
  verdict: CombinedVerdict;
  running: boolean;
};

export function ScoreRing({ score, verdict, running }: Props) {
  const size = 196;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const shown = running ? 8 : score;
  const offset = c - (shown / 100) * c;
  const tone = TONE[verdict];

  return (
    <div className="relative mx-auto grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset,stroke] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div
            className={cn(
              "font-mono text-5xl font-medium tabular-nums tracking-tight",
              running && "animate-pulse",
            )}
            style={{ color: tone }}
          >
            {running ? "—" : shown}
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-subtle">
            / 100
          </div>
        </div>
      </div>
    </div>
  );
}
