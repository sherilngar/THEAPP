import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bot, Send, UserRound, X } from 'lucide-react';
import { DEPT_BY_ID } from '../../domain/departments';
import { escalationLabel } from '../../domain/escalation';
import type { StaffSession, Ticket } from '../../domain/types';
import { handBackToAi, staffReply, useStore } from '../../store/store';
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
              {!ticket.sample && <Conversation ticket={ticket} session={session} />}
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

function Conversation({ ticket, session }: { ticket: Ticket; session: StaffSession }) {
  const messages = useStore((s) => s.messages);
  const conv = useStore((s) => s.conversation);
  const isGuest = useStore((s) => s.guest.id === ticket.guestId);
  const [text, setText] = useState('');
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ block: 'nearest' }), [messages.length]);
  if (!isGuest)
    return (
      <p className="text-sm text-muted">
        Conversation history is available for live demo guests only.
      </p>
    );
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="eyebrow">Guest conversation</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${conv.mode === 'human' ? 'bg-accent text-accent-fg' : 'bg-raised text-muted'}`}
        >
          {conv.mode === 'human' ? `${conv.humanName} is replying` : 'AI is replying'}
        </span>
      </div>
      <div className="max-h-80 space-y-2 overflow-y-auto rounded-xl border border-line/70 bg-bg p-3">
        {messages.length === 0 && (
          <p className="text-center text-xs text-muted">No messages yet.</p>
        )}
        {messages
          .filter((m) => m.text)
          .map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'guest' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${m.sender === 'guest' ? 'bg-fg text-bg' : m.sender === 'staff' ? 'border border-accent/40 bg-accent/10' : m.sender === 'system' ? 'bg-raised text-muted' : 'bg-surface'}`}
                dir="auto"
              >
                <span className="mb-0.5 flex items-center gap-1 text-[10px] opacity-70">
                  {m.sender === 'ai' ? (
                    <Bot size={10} aria-hidden />
                  ) : m.sender === 'staff' ? (
                    <UserRound size={10} aria-hidden />
                  ) : null}
                  {m.sender === 'staff'
                    ? m.staffName
                    : m.sender === 'ai'
                      ? 'AI concierge'
                      : m.sender === 'guest'
                        ? 'Guest'
                        : 'System'}
                </span>
                <span className="whitespace-pre-line">{m.text}</span>
              </div>
            </div>
          ))}
        <div ref={end} />
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          staffReply(text, session.name, session.department);
          setText('');
        }}
      >
        <label htmlFor="staff-reply" className="sr-only">
          Reply to guest
        </label>
        <input
          id="staff-reply"
          data-testid="staff-reply"
          className="field"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Reply as ${session.name}…`}
          maxLength={1000}
        />
        <button
          className="btn-primary min-h-[44px] px-4"
          disabled={!text.trim()}
          aria-label="Send reply"
        >
          <Send size={16} aria-hidden />
        </button>
      </form>
      <p className="mt-2 text-[11px] text-muted">
        Replying takes the chat over from the AI. The guest sees your name.
      </p>
      {conv.mode === 'human' && (
        <button className="btn-ghost mt-3 min-h-[40px] text-xs" onClick={handBackToAi}>
          <Bot size={14} aria-hidden /> Hand back to the AI concierge
        </button>
      )}
    </section>
  );
}
