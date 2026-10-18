import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { DEPT_BY_ID } from '../../domain/departments';
import { escalationLabel } from '../../domain/escalation';
import type { StaffSession, Ticket } from '../../domain/types';
import { useStore } from '../../store/store';
import { ChatThread } from './ChatThread';
import { StatusPill } from '../ui/Status';

const fmt = (t?: number) =>
  t ? new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—';

export function TicketDrawer({
  ticketId,
  session,
  onClose,
}: {
  ticketId: string | null;
  session: StaffSession;
  onClose: () => void;
}) {
  const ticket = useStore((s) => s.tickets.find((t) => t.id === ticketId));
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!ticketId) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ticketId, onClose]);

  return (
    <AnimatePresence>
      {ticket && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-ink/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`Ticket ${ticket.id}`}
            className="fixed inset-y-0 z-50 flex w-full max-w-lg flex-col bg-surface shadow-2xl ltr:right-0 rtl:left-0"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 38 }}
          >
            <header className="flex items-start justify-between gap-3 border-b border-line/70 px-5 py-4">
              <div>
                <p className="eyebrow">
                  {ticket.id} · {DEPT_BY_ID[ticket.department].en}
                </p>
                <h2 className="display text-2xl">
                  {ticket.quantity && ticket.kind === 'service' ? `${ticket.quantity} × ` : ''}
                  {ticket.item}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <StatusPill status={ticket.status} escalation={ticket.escalationLevel} />
                  <span>
                    Room {ticket.room} · {ticket.guestName}
                  </span>
                  <span className="capitalize">· {ticket.priority} priority</span>
                </div>
              </div>
              <button
                ref={closeRef}
                onClick={onClose}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-raised"
                aria-label="Close"
              >
                <X size={18} aria-hidden />
              </button>
            </header>
            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              <Details ticket={ticket} />
              <Timeline ticket={ticket} />
              {!ticket.sample && (
                <div>
                  <h3 className="eyebrow mb-3">Guest conversation</h3>
                  <ChatThread guestId={ticket.guestId} session={session} />
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Details({ ticket: t }: { ticket: Ticket }) {
  const rows: Array<[string, string | undefined]> = [
    ['Category', t.category],
    ['Details', t.details],
    ['Preferred time', t.preferredTime],
    ['Also sent to', t.alsoNotify ? DEPT_BY_ID[t.alsoNotify].en : undefined],
    ['Assignee', t.assignee],
    ['Escalation', t.escalationLevel ? escalationLabel(t.escalationLevel) : 'None'],
    [
      'Guest language',
      t.language === 'ar' ? 'Arabic' : t.language === 'other' ? 'Other' : 'English',
    ],
    ['Rating', t.rating ? `${t.rating} / 5` : undefined],
  ];
  return (
    <section>
      <dl className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 text-sm">
        {rows
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-muted">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
      </dl>
      {t.originalMessage && (
        <div className="mt-4 rounded-xl bg-raised p-3">
          <p className="eyebrow mb-1">Original guest message</p>
          <p className="text-sm" dir="auto">
            “{t.originalMessage}”
          </p>
        </div>
      )}
    </section>
  );
}

function Timeline({ ticket: t }: { ticket: Ticket }) {
  const events = [
    { at: t.createdAt, text: 'Created' },
    ...(t.acceptedAt
      ? [{ at: t.acceptedAt, text: `Accepted${t.assignee ? ` by ${t.assignee}` : ''}` }]
      : []),
    ...(t.onTheWayAt ? [{ at: t.onTheWayAt, text: 'On the way' }] : []),
    ...(t.doneAt ? [{ at: t.doneAt, text: 'Done' }] : []),
    ...(t.cancelledAt ? [{ at: t.cancelledAt, text: 'Cancelled' }] : []),
    ...t.notes
      .filter((n) => !n.text.startsWith('Status →'))
      .map((n) => ({ at: n.at, text: `${n.by}: ${n.text}` })),
  ].sort((a, b) => a.at - b.at);
  return (
    <section>
      <h3 className="eyebrow mb-3">Timeline</h3>
      <ol className="relative space-y-3 border-s border-line ps-4">
        {events.map((e, i) => (
          <li key={i} className="relative text-sm">
            <span
              className="absolute top-1.5 h-2 w-2 rounded-full bg-accent ltr:-left-[21px] rtl:-right-[21px]"
              aria-hidden
            />
            <span className="me-2 tabular-nums text-muted">{fmt(e.at)}</span>
            {e.text}
          </li>
        ))}
      </ol>
    </section>
  );
}
