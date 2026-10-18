import { describe, expect, it } from 'vitest';
import { RemoteSync, type SyncStatus, type Transport } from '../../src/store/remote';

interface Doc {
  v: 1;
  items: string[];
}

/** In-memory stand-in for the commit function and realtime channel. */
class FakeServer {
  rev = 0;
  state: unknown = null;
  failNext = 0;
  private subs = new Set<(rev: number, state: unknown) => void>();

  transport(): Transport {
    const tick = () => new Promise((r) => setTimeout(r, 1));
    return {
      load: async () => {
        await tick();
        return { rev: this.rev, state: this.state === null ? null : structuredClone(this.state) };
      },
      commit: async (expected, state) => {
        await tick();
        if (this.failNext > 0) {
          this.failNext -= 1;
          throw new Error('network down');
        }
        if (expected !== this.rev)
          return { ok: false, rev: this.rev, state: structuredClone(this.state) };
        this.rev += 1;
        this.state = structuredClone(state);
        const rev = this.rev;
        const snapshot = structuredClone(state);
        setTimeout(() => this.subs.forEach((s) => s(rev, snapshot)), 2);
        return { ok: true, rev, state: null };
      },
      subscribe: (onChange, onStatus) => {
        this.subs.add(onChange);
        onStatus(true);
        return () => this.subs.delete(onChange);
      },
    };
  }
}

class Device {
  local: Doc;
  status: SyncStatus = 'local';
  sync: RemoteSync<Doc>;
  constructor(server: FakeServer, initial: string[] = []) {
    this.local = { v: 1, items: initial };
    this.sync = new RemoteSync<Doc>(
      server.transport(),
      {
        toWire: (s) => s,
        fromWire: (w) => ((w as Doc)?.v === 1 ? (w as Doc) : null),
        getLocal: () => this.local,
        setLocal: (s) => (this.local = s),
        clone: (s) => structuredClone(s),
        onStatus: (s) => (this.status = s),
      },
      5,
      0,
    );
  }
  change(item: string) {
    const fn = (d: Doc) => {
      d.items.push(item);
    };
    const next = structuredClone(this.local);
    fn(next);
    this.local = next;
    this.sync.enqueue(fn);
  }
}

const settle = () => new Promise((r) => setTimeout(r, 60));

describe('cross-device sync', () => {
  it('seeds an empty database from the first device', async () => {
    const server = new FakeServer();
    const phone = new Device(server, ['welcome']);
    await phone.sync.start();
    await settle();
    expect(server.state).toEqual({ v: 1, items: ['welcome'] });
    expect(phone.status).toBe('live');
  });

  it('a second device adopts the shared state instead of its own', async () => {
    const server = new FakeServer();
    const phone = new Device(server, ['from phone']);
    await phone.sync.start();
    const laptop = new Device(server, ['stale laptop data']);
    await laptop.sync.start();
    await settle();
    expect(laptop.local.items).toEqual(['from phone']);
  });

  it('changes on one device appear on the other', async () => {
    const server = new FakeServer();
    const phone = new Device(server);
    const laptop = new Device(server);
    await phone.sync.start();
    await laptop.sync.start();
    phone.change('2 towels');
    await settle();
    expect(laptop.local.items).toEqual(['2 towels']);
    laptop.change('accepted');
    await settle();
    expect(phone.local.items).toEqual(['2 towels', 'accepted']);
  });

  it('keeps both sides of simultaneous changes', async () => {
    const server = new FakeServer();
    const phone = new Device(server);
    const laptop = new Device(server);
    await phone.sync.start();
    await laptop.sync.start();
    phone.change('guest: order food');
    laptop.change('staff: accept towels');
    phone.change('guest: yes');
    await settle();
    await settle();
    const final = (server.state as Doc).items;
    expect([...final].sort()).toEqual(
      ['guest: order food', 'guest: yes', 'staff: accept towels'].sort(),
    );
    expect(final.indexOf('guest: order food')).toBeLessThan(final.indexOf('guest: yes'));
    expect(phone.local.items).toEqual(final);
    expect(laptop.local.items).toEqual(final);
  });

  it('catches up by polling when realtime events never arrive', async () => {
    const server = new FakeServer();
    const phone = new Device(server);
    await phone.sync.start();
    const quiet: Transport = {
      ...server.transport(),
      subscribe: (_c, onStatus) => (onStatus(true), () => {}),
    };
    const laptop = new RemoteSync<Doc>(
      quiet,
      {
        toWire: (s) => s,
        fromWire: (w) => w as Doc,
        getLocal: () => laptopState,
        setLocal: (s) => (laptopState = s),
        clone: (s) => structuredClone(s),
        onStatus: () => {},
      },
      5,
      10,
    );
    let laptopState: Doc = { v: 1, items: [] };
    await laptop.start();
    phone.change('towels');
    await settle();
    expect(laptopState.items).toEqual(['towels']);
    laptop.stop();
  });

  it('shows offline and retries until the network returns', async () => {
    const server = new FakeServer();
    const phone = new Device(server);
    await phone.sync.start();
    server.failNext = 2;
    phone.change('while offline');
    expect(phone.local.items).toEqual(['while offline']);
    await settle();
    expect(server.state).toEqual({ v: 1, items: ['while offline'] });
    expect(phone.status).toBe('live');
  });
});
