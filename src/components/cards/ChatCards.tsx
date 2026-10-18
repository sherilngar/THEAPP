import { useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  ShieldAlert,
  Star,
  UserRound,
  UtensilsCrossed,
} from 'lucide-react';
import type { BookingDraft, Card, DiningOrder, Message } from '../../domain/types';
import {
  confirmOrder,
  rateTicket,
  sendGuestMessage,
  submitBooking,
  useStore,
} from '../../store/store';
import { missingBookingField } from '../../ai/engine';
import { menuItems } from '../../data/knowledge';
import { useGuestUi } from '../guest/context';
import { SampleBadge } from '../ui/SampleBadge';
import { TicketsCard } from './TicketsCard';

export function ChatCard({
  card,
  message,
  onOpenMenu,
}: {
  card: Card;
  message: Message;
  onOpenMenu: (category?: string, filter?: string) => void;
}) {
  switch (card.type) {
    case 'tickets':
      return <TicketsCard ids={card.ticketIds} />;
    case 'menu':
      return <MenuPreview onOpen={() => onOpenMenu(card.category, card.filter)} />;
    case 'order_confirm':
      return <OrderCard order={card.order} state={card.state} messageId={message.id} />;
    case 'booking':
      return <BookingCard booking={card.booking} state={card.state} messageId={message.id} />;
    case 'rating':
      return <RatingCard ticketId={card.ticketId} value={card.value} />;
    case 'emergency':
      return <EmergencyCard />;
    case 'handover':
      return <HandoverCard name={card.staffName} />;
    case 'privacy':
      return <PrivacyCard />;
    case 'info':
      return <InfoCard sample={card.sample} />;
  }
}

function MenuPreview({ onOpen }: { onOpen: () => void }) {
  const { t, lang } = useGuestUi();
  const cats = useStore((s) => s.settings.knowledge.ird.categories);
  return (
    <div className="mt-2 rounded-xl border border-line/70 bg-bg/60 p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        <UtensilsCrossed size={16} className="text-accent" aria-hidden /> {t.menuTitle}
      </div>
      <p className="mb-3 text-xs text-muted">
        {cats.map((c) => (lang === 'ar' ? c.nameAr : c.name)).join(' · ')}
      </p>
      <button className="btn-accent w-full" onClick={onOpen}>
        <BookOpen size={16} aria-hidden /> {lang === 'ar' ? 'افتح القائمة' : 'Open the menu'}
      </button>
    </div>
  );
}

function OrderCard({
  order,
  state,
  messageId,
}: {
  order: DiningOrder;
  state: 'pending' | 'placed' | 'changed';
  messageId: string;
}) {
  const { t, lang } = useGuestUi();
  const all = useStore((s) => menuItems(s.settings.knowledge));
  return (
    <div className="mt-2 rounded-xl border border-line/70 bg-bg/60 p-3">
      <p className="eyebrow mb-2">{t.yourOrder}</p>
      <ul className="mb-3 space-y-1 text-sm">
        {order.items.map((i) => {
          const m = all.find((x) => x.id === i.id);
          return (
            <li key={i.id} className="flex justify-between gap-2">
              <span>
                {i.qty} × {lang === 'ar' && m ? m.nameAr : i.name}
                {i.modifiers.length ? (
                  <span className="text-muted"> · {i.modifiers.join(', ')}</span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
      {order.allergies && (
        <p className="mb-3 rounded-lg bg-st-escalated/10 px-2 py-1 text-xs text-st-escalated">
          {t.allergies}: {order.allergies}
        </p>
      )}
      {state === 'pending' ? (
        <div className="flex gap-2">
          <button className="btn-primary flex-1" onClick={() => confirmOrder(messageId)}>
            {t.placeOrder}
          </button>
          <button className="btn-ghost" onClick={() => void sendGuestMessage(t.change)}>
            {t.change}
          </button>
        </div>
      ) : (
        <p className="flex items-center gap-1.5 text-sm font-medium text-st-done">
          <CheckCircle2 size={16} aria-hidden /> {state === 'placed' ? t.orderPlaced : t.change}
        </p>
      )}
    </div>
  );
}

const TIMES = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '12:30',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
  '22:00',
];

function BookingCard({
  booking,
  state,
  messageId,
}: {
  booking: BookingDraft;
  state: 'pending' | 'done';
  messageId: string;
}) {
  const { t, lang } = useGuestUi();
  const k = useStore((s) => s.settings.knowledge);
  const [b, setB] = useState<BookingDraft>(() => ({
    ...booking,
    date: booking.date ?? 'today',
    partySize: booking.partySize,
    therapist: booking.therapist ?? 'none',
    destination: booking.destination ?? '',
  }));
  const set = (patch: Partial<BookingDraft>) => setB((p) => ({ ...p, ...patch }));
  const id = `bk-${messageId}`;
  const ready = !missingBookingField({ ...b, destination: b.destination || undefined });

  if (state === 'done') {
    const outlet =
      booking.kind === 'restaurant' ? k.outlets.find((o) => o.id === booking.outlet) : undefined;
    const treatment =
      booking.kind === 'spa' ? k.spa.treatments.find((x) => x.id === booking.outlet) : undefined;
    const title = outlet
      ? lang === 'ar'
        ? outlet.nameAr
        : outlet.name
      : treatment
        ? lang === 'ar'
          ? treatment.nameAr
          : treatment.name
        : t.transportTypes[booking.outlet ?? 'taxi'];
    return (
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-line/70 bg-bg/60 p-3 text-sm">
        <CheckCircle2 size={16} className="shrink-0 text-st-done" aria-hidden />
        <span>
          <span className="font-medium">{t.bookingRequested}</span> · {title} ·{' '}
          {booking.date === 'tomorrow'
            ? t.tomorrow
            : booking.date === 'today'
              ? t.today
              : booking.date}{' '}
          {booking.time}
          {booking.partySize ? ` · ${booking.partySize}` : ''}
        </span>
      </div>
    );
  }

  return (
    <form
      className="mt-2 grid grid-cols-2 gap-3 rounded-xl border border-line/70 bg-bg/60 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) submitBooking(messageId, { ...b, destination: b.destination || undefined });
      }}
    >
      {b.kind === 'restaurant' && (
        <div className="col-span-2">
          <label className="label" htmlFor={`${id}-o`}>
            {t.restaurant}
          </label>
          <select
            id={`${id}-o`}
            className="field"
            value={b.outlet ?? ''}
            onChange={(e) => set({ outlet: e.target.value || undefined })}
          >
            <option value="">—</option>
            {k.outlets
              .filter((o) => o.reservations)
              .map((o) => (
                <option key={o.id} value={o.id}>
                  {lang === 'ar' ? o.nameAr : o.name}
                </option>
              ))}
          </select>
        </div>
      )}
      {b.kind === 'spa' && (
        <>
          <div className="col-span-2">
            <label className="label" htmlFor={`${id}-o`}>
              {t.treatment}
            </label>
            <select
              id={`${id}-o`}
              className="field"
              value={b.outlet ?? ''}
              onChange={(e) => set({ outlet: e.target.value || undefined })}
            >
              <option value="">—</option>
              {k.spa.treatments.map((o) => (
                <option key={o.id} value={o.id}>
                  {lang === 'ar' ? o.nameAr : o.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="label" htmlFor={`${id}-th`}>
              {t.therapist}
            </label>
            <select
              id={`${id}-th`}
              className="field"
              value={b.therapist}
              onChange={(e) => set({ therapist: e.target.value })}
            >
              <option value="none">{t.noPreference}</option>
              <option value="female">{t.female}</option>
              <option value="male">{t.male}</option>
            </select>
          </div>
        </>
      )}
      {b.kind === 'transport' && (
        <>
          <div className="col-span-2">
            <label className="label" htmlFor={`${id}-ty`}>
              {t.transportType}
            </label>
            <select
              id={`${id}-ty`}
              className="field"
              value={b.outlet ?? 'taxi'}
              onChange={(e) => {
                const v = e.target.value;
                set({
                  outlet: v,
                  destination:
                    v === 'airport_departure'
                      ? 'Airport'
                      : v === 'airport_arrival'
                        ? 'Hotel'
                        : b.destination,
                  pickup: v === 'airport_arrival' ? 'Airport' : 'Hotel main entrance',
                });
              }}
            >
              {Object.entries(t.transportTypes).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="label" htmlFor={`${id}-de`}>
              {t.destination}
            </label>
            <input
              id={`${id}-de`}
              className="field"
              value={b.destination ?? ''}
              onChange={(e) => set({ destination: e.target.value })}
              maxLength={100}
            />
          </div>
        </>
      )}
      <div>
        <label className="label" htmlFor={`${id}-d`}>
          {t.date}
        </label>
        <select
          id={`${id}-d`}
          className="field"
          value={b.date}
          onChange={(e) => set({ date: e.target.value })}
        >
          <option value="today">{t.today}</option>
          <option value="tomorrow">{t.tomorrow}</option>
        </select>
      </div>
      <div>
        <label className="label" htmlFor={`${id}-t`}>
          {t.time}
        </label>
        <select
          id={`${id}-t`}
          className="field"
          value={b.time ?? ''}
          onChange={(e) => set({ time: e.target.value || undefined })}
        >
          <option value="">—</option>
          {[...new Set([...(b.time ? [b.time] : []), ...TIMES])].sort().map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
      </div>
      {b.kind !== 'spa' && (
        <div>
          <label className="label" htmlFor={`${id}-p`}>
            {b.kind === 'transport' ? t.passengers : t.guests}
          </label>
          <select
            id={`${id}-p`}
            className="field"
            value={b.partySize ?? ''}
            onChange={(e) => set({ partySize: Number(e.target.value) || undefined })}
          >
            <option value="">—</option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      )}
      {b.kind === 'restaurant' && (
        <div>
          <label className="label" htmlFor={`${id}-oc`}>
            {t.occasion}
          </label>
          <select
            id={`${id}-oc`}
            className="field"
            value={b.occasion ?? ''}
            onChange={(e) => set({ occasion: e.target.value || undefined })}
          >
            <option value="">{t.none}</option>
            <option value="Birthday">Birthday</option>
            <option value="Anniversary">Anniversary</option>
            <option value="Honeymoon">Honeymoon</option>
          </select>
        </div>
      )}
      {b.kind === 'transport' && (
        <div>
          <label className="label" htmlFor={`${id}-l`}>
            {t.luggage}
          </label>
          <select
            id={`${id}-l`}
            className="field"
            value={b.luggage ?? 0}
            onChange={(e) => set({ luggage: Number(e.target.value) })}
          >
            {Array.from({ length: 9 }, (_, i) => i).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      )}
      <button type="submit" className="btn-primary col-span-2" disabled={!ready}>
        {t.requestBooking}
      </button>
    </form>
  );
}

function RatingCard({ ticketId, value }: { ticketId: string; value?: number }) {
  const { t } = useGuestUi();
  const [hover, setHover] = useState(0);
  const shown = value ?? hover;
  return (
    <div className="mt-2 rounded-xl border border-line/70 bg-bg/60 p-3">
      <p className="mb-2 text-xs text-muted">{value ? t.thanksRating : t.rateService}</p>
      <div className="flex gap-1" role="radiogroup" aria-label={t.rateService}>
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={t.stars(n)}
            disabled={!!value}
            whileTap={{ scale: 0.85 }}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => rateTicket(ticketId, n)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full disabled:cursor-default"
          >
            <Star
              size={24}
              aria-hidden
              className={n <= shown ? 'fill-accent text-accent' : 'text-line'}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function EmergencyCard() {
  const { t } = useGuestUi();
  return (
    <div
      role="alert"
      className="mt-2 rounded-xl border-2 border-st-escalated/60 bg-st-escalated/10 p-3"
    >
      <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-st-escalated">
        <ShieldAlert size={18} aria-hidden /> {t.emergencyTitle}
      </p>
      <p className="text-sm leading-relaxed">{t.emergencyBody}</p>
    </div>
  );
}

function HandoverCard({ name }: { name: string }) {
  const { t } = useGuestUi();
  return (
    <div className="mt-2 flex items-center gap-3 rounded-xl border border-line/70 bg-bg/60 p-3">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-fg">
        <UserRound size={18} aria-hidden />
      </span>
      <div>
        <p className="text-sm font-medium">{t.handoverTitle}</p>
        <p className="text-xs text-muted">{t.handoverPending(name)}</p>
      </div>
    </div>
  );
}

function PrivacyCard() {
  const { t } = useGuestUi();
  return (
    <p className="mt-2 flex items-center gap-2 rounded-xl bg-raised px-3 py-2 text-xs">
      <Lock size={14} aria-hidden className="text-accent" /> {t.privacyTitle}
    </p>
  );
}

function InfoCard({ sample }: { sample: boolean }) {
  const { t, lang } = useGuestUi();
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
      <span>{lang === 'ar' ? 'من دليل الفندق المعتمد' : 'From the approved hotel guide'}</span>
      {sample && <SampleBadge label={t.sampleContent} />}
    </div>
  );
}
