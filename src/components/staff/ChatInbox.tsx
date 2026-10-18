import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MessagesSquare } from 'lucide-react';
import type { Message, StaffSession } from '../../domain/types';
import { useStore } from '../../store/store';
import { summariseChats } from '../../store/chats';
import { ChatThread } from './ChatThread';
import { ago, useNow } from './hooks';

export function ChatInbox({ session }: { session: StaffSession }) {
  const chats = useStore(summariseChats);
  const [openId, setOpenId] = useState<string | null>(null);
  const now = useNow(15_000);
  const listRef = useRef<HTMLUListElement>(null);
  const open = chats.find((c) => c.guest.id === openId);

  // On wide screens, open the most urgent chat automatically.
  useEffect(() => {
    if (!openId && chats[0] && window.matchMedia('(min-width: 1024px)').matches)
      setOpenId(chats[0].guest.id);
  }, [openId, chats]);

  const preview = useMemo(
    () => (m?: Message) =>
      !m ? '' : m.text ? m.text : m.cards?.[0]?.type === 'rating' ? 'Rating card' : 'Card',
    [],
  );

  if (!chats.length)
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line py-16 text-center text-sm text-muted">
        <MessagesSquare size={22} aria-hidden />
        No guest chats yet. They appear here as soon as a guest writes.
      </div>
    );

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(280px,360px)_1fr]" data-testid="chat-inbox">
      <ul
        ref={listRef}
        className={`space-y-2 ${open ? 'hidden lg:block' : ''}`}
        aria-label="Guest chats"
      >
        {chats.map((c) => {
          const active = c.guest.id === openId;
          return (
            <motion.li key={c.guest.id} layout>
              <button
                onClick={() => setOpenId(c.guest.id)}
                aria-current={active ? 'true' : undefined}
                data-testid="chat-item"
                data-guest={c.guest.id}
                data-needs-person={c.needsPerson}
                className={`w-full rounded-2xl border p-3 text-start transition-colors ${
                  active
                    ? 'border-accent bg-accent/5'
                    : 'border-line/70 bg-surface hover:bg-raised/60'
                } ${c.needsPerson ? 'border-s-4 border-s-st-escalated' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold tabular-nums">Rm {c.guest.room}</span>
                  <span className="truncate text-sm font-medium">
                    {c.guest.title} {c.guest.lastName}
                  </span>
                  <span className="ms-auto shrink-0 text-xs text-muted">
                    {c.last ? ago(now - c.last.at) : ''}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-muted" dir="auto">
                  {c.last?.sender === 'staff'
                    ? `${c.last.staffName?.split(' · ')[0] ?? 'Staff'}: `
                    : c.last?.sender === 'ai'
                      ? 'AI: '
                      : ''}
                  {preview(c.last)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                  {c.needsPerson ? (
                    <span className="rounded-full bg-st-escalated/10 px-2 py-0.5 font-medium text-st-escalated">
                      Needs a person
                    </span>
                  ) : c.conv.mode === 'human' ? (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 font-medium text-accent">
                      With {c.conv.humanName}
                    </span>
                  ) : (
                    <span className="rounded-full bg-raised px-2 py-0.5 text-muted">
                      AI handling
                    </span>
                  )}
                  {c.unread > 0 && (
                    <span
                      className="rounded-full bg-fg px-2 py-0.5 font-medium text-bg"
                      aria-label={`${c.unread} unread`}
                    >
                      {c.unread} new
                    </span>
                  )}
                </div>
              </button>
            </motion.li>
          );
        })}
      </ul>

      {open ? (
        <div className="card p-4 sm:p-5" data-testid="chat-panel">
          <div className="mb-3 flex items-center gap-3">
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-raised lg:hidden"
              onClick={() => setOpenId(null)}
              aria-label="Back to chats"
            >
              <ArrowLeft size={18} aria-hidden />
            </button>
            <div>
              <h3 className="display text-2xl">
                {open.guest.title} {open.guest.firstName} {open.guest.lastName}
              </h3>
              <p className="text-xs text-muted">
                Room {open.guest.room} · {open.guest.arrival} to {open.guest.departure} · Ambassador{' '}
                {open.guest.ambassador}
              </p>
            </div>
          </div>
          <ChatThread guestId={open.guest.id} session={session} maxHeight="max-h-[55vh]" />
        </div>
      ) : (
        <div className="hidden items-center justify-center rounded-2xl border border-dashed border-line text-sm text-muted lg:flex">
          Choose a chat
        </div>
      )}
    </div>
  );
}
