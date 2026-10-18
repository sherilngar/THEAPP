import { useState } from 'react';

/**
 * The official SO/ logo file supplied by the hotel, used as-is (never redrawn).
 * Falls back to a neutral text placeholder if the file is missing.
 */
export function Logo({ className = 'h-10' }: { className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <span
        className={`inline-flex items-center font-display text-2xl tracking-wide ${className}`}
        aria-label="SO/ Hotels & Resorts"
      >
        SO/
      </span>
    );
  return (
    <img
      src="brand/so-logo-trimmed.png"
      alt="SO/ Hotels & Resorts"
      width={202}
      height={74}
      className={`logo-img w-auto ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
