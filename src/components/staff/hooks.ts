import { useEffect, useRef, useState } from 'react';
import { now } from '../../store/store';

/** Store clock (including the demo fast-forward), refreshed every second. */
export function useNow(intervalMs = 1000) {
  const [t, setT] = useState(now);
  useEffect(() => {
    const id = window.setInterval(() => setT(now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return Math.max(t, now());
}

let ctx: AudioContext | null = null;
/** A soft two-note chime made with Web Audio, so there is no audio file to load. */
export function chime() {
  try {
    ctx ??= new AudioContext();
    const t0 = ctx.currentTime;
    [880, 1318.5].forEach((f, i) => {
      const o = ctx!.createOscillator();
      const g = ctx!.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t0 + i * 0.12);
      g.gain.linearRampToValueAtTime(0.06, t0 + i * 0.12 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.12 + 0.5);
      o.connect(g).connect(ctx!.destination);
      o.start(t0 + i * 0.12);
      o.stop(t0 + i * 0.12 + 0.55);
    });
  } catch {
    /* audio unavailable */
  }
}

/** Ids that appeared since the board mounted, highlighted for a few seconds. */
export function useNewIds(ids: string[], onNew: (fresh: string[]) => void) {
  const known = useRef<Set<string> | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!known.current) {
      known.current = new Set(ids);
      return;
    }
    const added = ids.filter((id) => !known.current!.has(id));
    if (!added.length) return;
    added.forEach((id) => known.current!.add(id));
    setFresh((p) => new Set([...p, ...added]));
    onNew(added);
    const timer = window.setTimeout(
      () => setFresh((p) => new Set([...p].filter((x) => !added.includes(x)))),
      5000,
    );
    return () => window.clearTimeout(timer);
  }, [ids, onNew]);
  return fresh;
}

export function ago(ms: number) {
  const m = Math.floor(ms / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  return `${h} h ${m % 60} min ago`;
}

export function mmss(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
