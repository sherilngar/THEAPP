import { useState, type FormEvent } from 'react';
import { Check, Copy, LogOut, RotateCcw, UserPlus } from 'lucide-react';
import { addGuest, checkOutGuest, reinstateGuest, useStore } from '../../store/store';

const iso = (d: Date) => d.toISOString().slice(0, 10);
const TITLES = ['Mr', 'Ms', 'Mrs', 'Mr & Mrs', 'Dr', ''];

/** Link that opens the guest app with the room already filled in. */
function signInLink(room: string) {
  return `${window.location.origin}${window.location.pathname}#/guest?room=${encodeURIComponent(room)}`;
}

/**
 * The in-house list guests sign in against. In the demo the front office adds guests
 * here; in a pilot it is filled automatically from the property management system.
 */
export function GuestsPanel() {
  const guests = useStore((s) => s.guests);
  const conversations = useStore((s) => s.conversations);
  const [copied, setCopied] = useState<string | null>(null);
  const today = new Date();
  const blank = {
    title: 'Mr',
    firstName: '',
    lastName: '',
    room: '',
    arrival: iso(today),
    departure: iso(new Date(today.getTime() + 3 * 86_400_000)),
    ambassador: 'Nadia',
  };
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');
  const [added, setAdded] = useState('');

  const inHouse = guests.filter((g) => !g.checkedOutAt);
  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setError('');
    setAdded('');
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const room = form.room.trim();
    if (!/^\d{1,6}$/.test(room)) return setError('Room number should be digits only.');
    if (!form.firstName.trim() || !form.lastName.trim())
      return setError('First name and surname are required.');
    if (form.departure < form.arrival) return setError('Departure must be on or after arrival.');
    if (inHouse.some((g) => g.room.replace(/^0+/, '') === room.replace(/^0+/, '')))
      return setError(`Room ${room} already has an in-house guest. Check them out first.`);
    addGuest({ ...form, room });
    setAdded(`${form.title} ${form.lastName} can now sign in to room ${room}.`);
    setForm(blank);
  };

  const copy = async (room: string) => {
    try {
      await navigator.clipboard.writeText(signInLink(room));
      setCopied(room);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      window.prompt('Copy this sign-in link', signInLink(room));
    }
  };

  return (
    <div className="space-y-6" data-testid="guests-panel">
      <section className="card p-5">
        <h3 className="display mb-1 text-2xl">Add an in-house guest</h3>
        <p className="mb-4 text-sm text-muted">
          Guests sign in on their phone with their room number and surname. In a pilot this list
          comes from the property management system automatically.
        </p>
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label" htmlFor="ng-title">
              Title
            </label>
            <select
              id="ng-title"
              className="field"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            >
              {TITLES.map((t) => (
                <option key={t} value={t}>
                  {t || 'None'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="ng-first">
              First name
            </label>
            <input
              id="ng-first"
              className="field"
              value={form.firstName}
              maxLength={40}
              onChange={(e) => set('firstName', e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="ng-last">
              Surname
            </label>
            <input
              id="ng-last"
              className="field"
              value={form.lastName}
              maxLength={40}
              onChange={(e) => set('lastName', e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="ng-room">
              Room
            </label>
            <input
              id="ng-room"
              className="field"
              inputMode="numeric"
              maxLength={6}
              value={form.room}
              onChange={(e) => set('room', e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <div>
            <label className="label" htmlFor="ng-arr">
              Arrival
            </label>
            <input
              id="ng-arr"
              type="date"
              className="field"
              value={form.arrival}
              onChange={(e) => set('arrival', e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="ng-dep">
              Departure
            </label>
            <input
              id="ng-dep"
              type="date"
              className="field"
              value={form.departure}
              onChange={(e) => set('departure', e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="ng-amb">
              Ambassador
            </label>
            <input
              id="ng-amb"
              className="field"
              value={form.ambassador}
              maxLength={30}
              onChange={(e) => set('ambassador', e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button className="btn-primary w-full" data-testid="add-guest">
              <UserPlus size={16} aria-hidden /> Add guest
            </button>
          </div>
        </form>
        {error && (
          <p role="alert" className="mt-3 text-sm text-st-escalated">
            {error}
          </p>
        )}
        {added && (
          <p role="status" className="mt-3 flex items-center gap-1.5 text-sm text-st-done">
            <Check size={14} aria-hidden /> {added}
          </p>
        )}
      </section>

      <section className="card overflow-x-auto p-5">
        <h3 className="display mb-4 text-2xl">In-house guests</h3>
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="pb-2 font-medium">Room</th>
              <th className="pb-2 font-medium">Guest</th>
              <th className="pb-2 font-medium">Stay</th>
              <th className="pb-2 font-medium">App</th>
              <th className="pb-2 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {[...guests]
              .sort(
                (a, b) =>
                  Number(!!a.checkedOutAt) - Number(!!b.checkedOutAt) ||
                  a.room.localeCompare(b.room),
              )
              .map((g) => {
                const conv = conversations.find((c) => c.guestId === g.id);
                return (
                  <tr
                    key={g.id}
                    className={`border-t border-line/60 ${g.checkedOutAt ? 'text-muted' : ''}`}
                    data-testid="guest-row"
                  >
                    <td className="py-2 pe-3 font-semibold tabular-nums">{g.room}</td>
                    <td className="py-2 pe-3">
                      {g.title} {g.firstName} {g.lastName}
                      {g.sample && (
                        <span className="ms-2 rounded-full border border-dashed border-accent/60 px-1.5 text-xs text-accent">
                          sample
                        </span>
                      )}
                    </td>
                    <td className="py-2 pe-3 tabular-nums">
                      {g.arrival} → {g.departure}
                    </td>
                    <td className="py-2 pe-3">
                      {g.checkedOutAt ? 'Checked out' : conv?.signedInAt ? 'Signed in' : 'Not yet'}
                    </td>
                    <td className="py-2 text-end">
                      <div className="flex justify-end gap-1.5">
                        {!g.checkedOutAt && (
                          <button
                            className="btn-ghost min-h-[36px] px-3 text-xs"
                            onClick={() => void copy(g.room)}
                          >
                            {copied === g.room ? (
                              <Check size={14} aria-hidden />
                            ) : (
                              <Copy size={14} aria-hidden />
                            )}
                            {copied === g.room ? 'Copied' : 'Sign-in link'}
                          </button>
                        )}
                        {g.checkedOutAt ? (
                          <button
                            className="btn-ghost min-h-[36px] px-3 text-xs"
                            onClick={() => reinstateGuest(g.id)}
                          >
                            <RotateCcw size={14} aria-hidden /> Undo
                          </button>
                        ) : (
                          <button
                            className="btn-ghost min-h-[36px] px-3 text-xs"
                            onClick={() => checkOutGuest(g.id)}
                          >
                            <LogOut size={14} aria-hidden /> Check out
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
