import type { DepartmentId, Guest, Priority, Ticket } from '../domain/types';
import { DEFAULT_STANDARDS } from '../domain/departments';

/** Sample guest profile for the demo. Not a real person. */
export function demoGuest(now: number): Guest {
  const day = 86_400_000;
  const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
  return {
    id: 'guest-demo',
    title: 'Ms',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    room: '1207',
    arrival: iso(now - 2 * day),
    departure: iso(now + 3 * day),
    ambassador: 'Nadia',
  };
}

const OTHER_GUESTS = [
  { id: 'g-0412', name: 'Mr Rahman', room: '0412' },
  { id: 'g-0918', name: 'Mrs Okafor', room: '0918' },
  { id: 'g-1503', name: 'Mr & Mrs Laurent', room: '1503' },
  { id: 'g-0721', name: 'Ms Novak', room: '0721' },
  { id: 'g-1110', name: 'Mr Al Mansoori', room: '1110' },
  { id: 'g-0305', name: 'Mr Tanaka', room: '0305' },
];

const HISTORY: Array<{ dept: DepartmentId; item: string; category: string; prio?: Priority; kind?: Ticket['kind'] }> = [
  { dept: 'housekeeping', item: 'Extra towels', category: 'Housekeeping' },
  { dept: 'housekeeping', item: 'Extra towels', category: 'Housekeeping' },
  { dept: 'housekeeping', item: 'Pillows (pillow menu)', category: 'Housekeeping' },
  { dept: 'housekeeping', item: 'Room cleaning', category: 'Housekeeping' },
  { dept: 'housekeeping', item: 'Turndown service', category: 'Housekeeping' },
  { dept: 'housekeeping', item: 'Water bottles', category: 'Housekeeping' },
  { dept: 'housekeeping', item: 'Water bottles', category: 'Housekeeping' },
  { dept: 'housekeeping', item: 'Baby cot', category: 'Housekeeping' },
  { dept: 'ird', item: 'In-room dining order', category: 'In-Room Dining', kind: 'dining' },
  { dept: 'ird', item: 'In-room dining order', category: 'In-Room Dining', kind: 'dining' },
  { dept: 'ird', item: 'In-room dining order', category: 'In-Room Dining', kind: 'dining' },
  { dept: 'ird', item: 'Collect tray', category: 'In-Room Dining' },
  { dept: 'engineering', item: 'Air conditioning', category: 'Engineering', prio: 'high' },
  { dept: 'engineering', item: 'Air conditioning', category: 'Engineering' },
  { dept: 'engineering', item: 'TV or remote', category: 'Engineering' },
  { dept: 'engineering', item: 'Wi-Fi in room', category: 'Engineering' },
  { dept: 'restaurants', item: 'Table reservation', category: 'Restaurants & Bars', kind: 'reservation' },
  { dept: 'restaurants', item: 'Table reservation', category: 'Restaurants & Bars', kind: 'reservation' },
  { dept: 'spa', item: 'Spa booking', category: 'Spa & Wellness', kind: 'spa' },
  { dept: 'concierge', item: 'Airport transfer (departure)', category: 'Concierge & Transport', kind: 'transport' },
  { dept: 'concierge', item: 'Taxi', category: 'Concierge & Transport', kind: 'transport' },
  { dept: 'frontoffice', item: 'Late check-out', category: 'Front Office & Ambassador' },
  { dept: 'laundry', item: 'Laundry pickup', category: 'Laundry' },
  { dept: 'recreation', item: 'Cabana or daybed', category: 'Recreation, Beach & Kids' },
];

/** Deterministic pseudo-random generator so sample history is identical on every device. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/**
 * Seven days of completed sample tickets so Insights has something to show
 * before the live demo starts. Marked `sample` and hidden from the staff board.
 */
export function sampleHistory(now: number): Ticket[] {
  const rand = rng(257);
  const out: Ticket[] = [];
  const day = 86_400_000;
  for (let i = 0; i < 140; i++) {
    const h = HISTORY[Math.floor(rand() * HISTORY.length)]!;
    const g = OTHER_GUESTS[Math.floor(rand() * OTHER_GUESTS.length)]!;
    const created = now - Math.floor(rand() * 7 * day) - 30 * 60_000;
    const std = DEFAULT_STANDARDS[h.dept].normal * 60_000;
    const acceptAfter = Math.floor(std * (0.25 + rand() * (rand() < 0.12 ? 2.4 : 0.9)));
    const doneAfter = acceptAfter + Math.floor(std * (1 + rand() * 4));
    const escalation = acceptAfter >= std * 2 ? 2 : acceptAfter >= std ? 1 : 0;
    const rating = rand() < 0.7 ? Math.min(5, Math.max(1, Math.round(4.5 - rand() * 2.2 + (escalation ? -1 : 0)))) : undefined;
    out.push({
      id: `S-${String(1000 + i)}`,
      department: h.dept,
      category: h.category,
      item: h.item,
      room: g.room,
      guestId: g.id,
      guestName: g.name,
      priority: h.prio ?? 'normal',
      status: 'done',
      createdAt: created,
      acceptedAt: created + acceptAfter,
      onTheWayAt: created + acceptAfter + 60_000,
      doneAt: created + doneAfter,
      notes: [],
      escalationLevel: escalation as 0 | 1 | 2,
      language: rand() < 0.3 ? 'ar' : 'en',
      kind: h.kind ?? 'service',
      rating,
      sample: true,
    });
  }
  return out.sort((a, b) => a.createdAt - b.createdAt);
}

/** A few live tickets from other rooms so the board looks like a real shift. */
export function liveSampleTickets(now: number): Ticket[] {
  const base = { notes: [], escalationLevel: 0 as const, language: 'en' as const, kind: 'service' as const };
  return [
    { ...base, id: 'T-0991', department: 'housekeeping', category: 'Housekeeping', item: 'Baby cot', room: '0412', guestId: 'g-0412', guestName: 'Mr Rahman', priority: 'normal', status: 'on_the_way', createdAt: now - 6 * 60_000, acceptedAt: now - 5 * 60_000, onTheWayAt: now - 3 * 60_000, assignee: 'Maria' },
    { ...base, id: 'T-0992', department: 'engineering', category: 'Engineering', item: 'TV or remote', details: 'Remote not responding', room: '0918', guestId: 'g-0918', guestName: 'Mrs Okafor', priority: 'normal', status: 'accepted', createdAt: now - 4 * 60_000, acceptedAt: now - 2 * 60_000, assignee: 'Rajesh' },
    { ...base, id: 'T-0993', department: 'concierge', category: 'Concierge & Transport', item: 'Taxi', details: 'Hotel main entrance → Al Hamra · today 18:30 · 2 passengers', room: '1503', guestId: 'g-1503', guestName: 'Mr & Mrs Laurent', priority: 'normal', status: 'accepted', createdAt: now - 9 * 60_000, acceptedAt: now - 8 * 60_000, assignee: 'Youssef', kind: 'transport' },
  ];
}
