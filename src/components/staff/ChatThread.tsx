import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Bot, Hand, Send, UserRound } from 'lucide-react';
import type { Message, StaffSession } from '../../domain/types';
import {
  conversationOf,
  guestById,
  handBackToAi,
  markChatRead,
  messagesOf,
  staffReply,
  takeOverChat,
  useStore,
} from '../../store/store';

const time = (t: number) =>
  new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

/** Short text for messages that are only a card (orders, bookings, ratings). */
function cardSummary(m: Message): string {
  const c = m.cards?.[0];
  if (!c) return '';
  switch (c.type) {
    case 'tickets':
      return `Request card: ${c.ticketIds.join(', ')}`;
    case 'rating':
      return c.value ? `Rated ${c.value}/5` : 'Asked for a rating';
    case 'order_confirm':
      return `Dining order (${c.state})`;
    case 'booking':
      return `Booking card (${c.state})`;
    case 'emergency':
      return 'Emergency guidance shown';
    case 'menu':
      return 'Menu shown';
    default:
      return '';
  }
}

/**
 * One guest's conversation as staff see it: every message, who is replying, and a
 * reply box. Replying (or "Take over") puts a person in charge, and the guest is told.
 */
export function ChatThread({
  guestId,
  session,
  maxHeight = 'max-h-80',
}: {
  guestId: string;
  session: StaffSession;
  maxHeight?: string;
}) {
  const guest = useStore((s) => guestById(s, guestId));
  const conv = useStore((s) => conversationOf(s, guestId));
  const messages = useStore((s) => messagesOf(s, guestId));
  const [text, setText] = useState('');
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight });
  }, [messages.length]);
  // Reading the chat clears its unread count, including when new messages arrive while open.
  useEffect(() => {
    markChatRead(guestId);
  }, [guestId, messages.length]);

  if (!guest)
    return <p className="text-sm text-muted">This guest is no longer on the in-house list.</p>;

  const mine = conv?.mode === 'human' && conv.humanName === session.name;
  const other = conv?.mode === 'human' && !mine ? conv.humanName : undefined;

  const send = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    staffReply(guestId, text, session.name, session.department);
    setText('');
    input.current?.focus();
  };

  return (
    <section aria-label={`Chat with ${guest.title} ${guest.lastName}, room ${guest.room}`}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          data-testid="chat-mode"
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            conv?.mode === 'human'
              ? 'bg-accent text-accent-fg'
              : conv?.handoverRequested
                ? 'bg-st-escalated/10 text-st-escalated'
                : 'bg-raised text-muted'
          }`}
        >
          {conv?.mode === 'human'
            ? `${conv.humanName} is replying`
            : conv?.handoverRequested
              ? `Needs a person: ${conv.handoverRequested.reason}`
              : 'AI concierge is replying'}
        </span>
        {conv?.mode !== 'human' && (
          <button
            className="btn-ghost min-h-[36px] px-3 text-xs"
            onClick={() => takeOverChat(guestId, session.name, session.department)}
            data-testid="take-over"
          >
            <Hand size={14} aria-hidden /> Take over
          </button>
        )}
        {conv?.mode === 'human' && (
          <button
            className="btn-ghost min-h-[36px] px-3 text-xs"
            onClick={() => handBackToAi(guestId)}
            data-testid="hand-back"
          >
            <Bot size={14} aria-hidden /> Hand back to AI
          </button>
        )}
      </div>

      <div
        ref={list}
        className={`${maxHeight} space-y-2 overflow-y-auto rounded-xl border border-line/70 bg-bg p-3`}
        role="log"
        aria-live="polite"
        aria-label="Messages"
        data-testid="staff-chat-log"
      >
        {messages.length === 0 && (
          <p className="py-6 text-center text-xs text-muted">
            The guest hasn't written yet. You can still send the first message.
          </p>
        )}
        {messages.map((m) => {
          const body = m.text || cardSummary(m);
          if (!body) return null;
          const fromGuest = m.sender === 'guest';
          return (
            <div key={m.id} className={`flex ${fromGuest ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                  fromGuest
                    ? 'bg-fg text-bg'
                    : m.sender === 'staff'
                      ? 'border border-accent/40 bg-accent/10'
                      : m.sender === 'system'
                        ? 'bg-raised text-muted'
                        : 'bg-surface'
                } ${m.text ? '' : 'italic opacity-80'}`}
                dir="auto"
              >
                <span className="mb-0.5 flex items-center gap-1 text-[11px] opacity-70">
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
                        ? `${guest.title} ${guest.lastName}`
                        : 'System'}
                  <span className="tabular-nums">· {time(m.at)}</span>
                </span>
                <span className="whitespace-pre-line">{body}</span>
              </div>
            </div>
          );
        })}
      </div>

      <form className="mt-3 flex gap-2" onSubmit={send}>
        <label htmlFor={`reply-${guestId}`} className="sr-only">
          Reply to guest
        </label>
        <input
          id={`reply-${guestId}`}
          ref={input}
          data-testid="staff-reply"
          className="field"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Reply as ${session.name}…`}
          maxLength={1000}
          autoComplete="off"
        />
        <button
          className="btn-primary min-h-[44px] px-4"
          disabled={!text.trim()}
          aria-label="Send reply"
          data-testid="staff-send"
        >
          <Send size={16} aria-hidden className="rtl:-scale-x-100" />
        </button>
      </form>
      <p className="mt-2 text-xs text-muted">
        {other
          ? `${other} is replying to this guest. Sending will make you the person in charge.`
          : mine
            ? 'You are in charge of this chat. The AI stays quiet until you hand it back.'
            : 'Replying takes the chat over from the AI. The guest sees your name.'}
      </p>
    </section>
  );
}
