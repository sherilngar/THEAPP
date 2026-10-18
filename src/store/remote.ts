/**
 * Cross-device sync for the demo. The whole shared demo lives in one database row
 * guarded by a revision number. Every local change is applied on screen at once,
 * then sent with the revision it was based on; if another device got there first,
 * the server returns the latest state, the pending changes are replayed on top of
 * it and sent again. Nothing a guest or staff member does is lost.
 */

export interface Transport {
  load(): Promise<{ rev: number; state: unknown | null }>;
  commit(
    expectedRev: number,
    state: unknown,
  ): Promise<{ ok: boolean; rev: number; state: unknown | null }>;
  /** Calls back with the new revision (and state, if the event carried it) whenever another device commits. */
  subscribe(
    onChange: (rev: number, state: unknown | null) => void,
    onStatus: (connected: boolean) => void,
  ): () => void;
}

export type SyncStatus = 'local' | 'connecting' | 'live' | 'offline';

export interface SyncHooks<S> {
  toWire(s: S): unknown;
  /** Returns null when the stored state is missing or from an incompatible version. */
  fromWire(w: unknown): S | null;
  getLocal(): S;
  setLocal(s: S): void;
  clone(s: S): S;
  onStatus(s: SyncStatus): void;
}

type Change<S> = (draft: S) => void;

export class RemoteSync<S> {
  private base: S | null = null;
  private rev = 0;
  private pending: Array<Change<S>> = [];
  private flushing = false;
  private started = false;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private unsubscribe: (() => void) | null = null;
  private poller: ReturnType<typeof setInterval> | null = null;

  constructor(
    private transport: Transport,
    private hooks: SyncHooks<S>,
    private retryMs = 2000,
    /** Safety net if realtime is blocked (some hotel networks block websockets). 0 = off. */
    private pollMs = 10_000,
  ) {}

  async start() {
    this.hooks.onStatus('connecting');
    try {
      await this.reload(true);
      this.started = true;
      this.unsubscribe = this.transport.subscribe(
        (rev, state) => void this.onRemote(rev, state),
        (connected) => this.hooks.onStatus(connected ? 'live' : 'offline'),
      );
      this.hooks.onStatus('live');
      if (this.pollMs > 0) this.poller = setInterval(() => void this.poll(), this.pollMs);
      await this.flush();
    } catch {
      this.hooks.onStatus('offline');
      this.scheduleRetry(() => this.start());
    }
  }

  stop() {
    this.unsubscribe?.();
    if (this.retryTimer) clearTimeout(this.retryTimer);
    if (this.poller) clearInterval(this.poller);
  }

  private async poll() {
    if (this.flushing || this.pending.length) return;
    try {
      const { rev, state } = await this.transport.load();
      if (rev > this.rev && !this.flushing && !this.pending.length) {
        const remote = state === null ? null : this.hooks.fromWire(state);
        if (remote) this.adopt(rev, remote);
      }
    } catch {
      /* stay on the last known state; the next poll or event retries */
    }
  }

  /** Records a change that has already been applied locally, and sends it. */
  enqueue(change: Change<S>) {
    this.pending.push(change);
    if (this.started) void this.flush();
  }

  private async reload(initial = false) {
    const { rev, state } = await this.transport.load();
    const remote = state === null ? null : this.hooks.fromWire(state);
    if (!remote) {
      // Empty or incompatible database: this device's state becomes the shared one.
      this.base = null;
      this.rev = rev;
      if (initial) this.pending.unshift(() => {});
      return;
    }
    this.adopt(rev, remote);
  }

  private adopt(rev: number, remote: S) {
    this.base = remote;
    this.rev = rev;
    const view = this.hooks.clone(remote);
    for (const change of this.pending) change(view);
    this.hooks.setLocal(view);
  }

  private async onRemote(rev: number, state: unknown | null) {
    if (rev <= this.rev || this.flushing) return;
    const remote = state === null ? null : this.hooks.fromWire(state);
    try {
      if (remote && rev !== Number.MAX_SAFE_INTEGER) this.adopt(rev, remote);
      else await this.reload();
    } catch {
      /* the next flush or event will catch up */
    }
  }

  private async flush() {
    if (this.flushing) return;
    this.flushing = true;
    try {
      while (this.pending.length) {
        // With no shared state yet, upload this device's view, which already holds every pending change.
        const seeding = this.base === null;
        const next = this.hooks.clone(this.base ?? this.hooks.getLocal());
        if (!seeding) this.pending[0]!(next);
        const res = await this.transport.commit(this.rev, this.hooks.toWire(next));
        if (res.ok) {
          this.base = next;
          this.rev = res.rev;
          if (seeding) this.pending = [];
          else this.pending.shift();
          continue;
        }
        // Someone else committed first: rebase the pending changes on their state.
        const remote = res.state === null ? null : this.hooks.fromWire(res.state);
        if (remote) this.adopt(res.rev, remote);
        else {
          this.base = null;
          this.rev = res.rev;
        }
      }
      this.hooks.onStatus('live');
    } catch {
      this.hooks.onStatus('offline');
      this.scheduleRetry(() => this.flush());
    } finally {
      this.flushing = false;
    }
  }

  private scheduleRetry(fn: () => Promise<void>) {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      void fn();
    }, this.retryMs);
  }
}
