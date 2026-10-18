import { motion } from 'motion/react';

/**
 * Response timer as a ring. Progress is the share of the response standard used:
 * under 100% bronze/amber, past it red. Only stroke-dashoffset animates.
 */
export function TimerRing({
  progress,
  label,
  size = 44,
}: {
  progress: number;
  label: string;
  size?: number;
}) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(progress, 1);
  const over = progress >= 1;
  const severe = progress >= 2;
  const color = severe
    ? 'rgb(var(--st-escalated))'
    : over
      ? 'rgb(var(--st-escalated))'
      : progress > 0.7
        ? 'rgb(var(--st-progress))'
        : 'rgb(var(--accent))';
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={label}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgb(var(--line))"
          strokeWidth={3}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - clamped) }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center text-[10px] font-medium tabular-nums ${over ? 'text-st-escalated' : 'text-fg'}`}
        aria-hidden
      >
        {label.split(' ')[0]}
      </span>
      {over && (
        <span
          className="absolute inset-0 animate-ping rounded-full border border-st-escalated/40 motion-reduce:hidden"
          aria-hidden
        />
      )}
    </div>
  );
}
