import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowUp,
  Languages,
  LayoutGrid,
  ListChecks,
  MessageCircle,
  Search,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { CATALOGUE, type CatalogueItem, type CatalogueSection } from '../../domain/catalogue';
import type { Message } from '../../domain/types';
import { strings } from '../../i18n/strings';
import {
  cancelTicket,
  requestAmbassador,
  requestFromGrid,
  sendGuestMessage,
  setGuestLanguage,
  startBooking,
  useStore,
} from '../../store/store';
import { ChatCard } from '../cards/ChatCards';
import { MenuBrowser } from '../cards/MenuBrowser';
import { TicketRow } from '../cards/TicketsCard';
import { SECTION_ICON } from '../ui/icons';
import { Logo } from '../ui/Logo';
import { SampleBadge } from '../ui/SampleBadge';
import { ThemeToggle } from '../ui/ThemeToggle';
import { GuestUiContext, useGuestUi } from './context';
import { Sheet } from './Sheet';
import { markAllMessagesSeen, seenMessages } from './seen';

type Tab = 'chat' | 'services' | 'requests';

export function GuestApp({ embedded = false }: { embedded?: boolean }) {
  const lang = useStore((s) => s.conversation.lang);
  const t = strings(lang);
  const [tab, setTab] = useState<Tab>('chat');
  const [menu, setMenu] = useState<{ category?: string; filter?: string } | null>(null);
  const activeCount = useStore(
    (s) =>
      s.tickets.filter(
        (x) => x.guestId === s.guest.id && x.status !== 'done' && x.status !== 'cancelled',
      ).length,
  );
  const ui = useMemo(() => ({ lang, t, embedded, goTo: setTab }), [lang, t, embedded]);

  useEffect(() => {
    if (embedded) return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    return () => {
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
    };
  }, [lang, embedded]);

  const openMenu = useCallback(
    (category?: string, filter?: string) => setMenu({ category, filter }),
    [],
  );

  return (
    <GuestUiContext.Provider value={ui}>
      <div
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        lang={lang}
        data-testid="guest-app"
        className={`relative flex flex-col overflow-hidden bg-bg ${embedded ? 'h-full' : 'mx-auto h-[100dvh] max-w-md sm:my-0 sm:border-x sm:border-line/60'}`}
      >
        <GuestHeader />
        <main className="relative min-h-0 flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              className="absolute inset-0 flex flex-col"
              initial={{ opacity: 0, x: lang === 'ar' ? -12 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {tab === 'chat' && <ChatView onOpenMenu={openMenu} />}
              {tab === 'services' && <ServicesView onOpenMenu={openMenu} />}
              {tab === 'requests' && <RequestsView />}
            </motion.div>
          </AnimatePresence>
        </main>
        <nav
          className="grid grid-cols-3 border-t border-line/70 bg-surface/95 backdrop-blur safe-bottom"
          aria-label="Guest app"
        >
          {(
            [
              ['chat', t.tabChat, MessageCircle],
              ['services', t.tabServices, LayoutGrid],
              ['requests', t.tabRequests, ListChecks],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-current={tab === id ? 'page' : undefined}
              className={`relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[11px] transition-colors ${tab === id ? 'text-fg' : 'text-muted'}`}
            >
              <Icon size={20} aria-hidden strokeWidth={tab === id ? 2.2 : 1.8} />
              {label}
              {id === 'requests' && activeCount > 0 && (
                <motion.span
                  key={activeCount}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium text-accent-fg ltr:left-[calc(50%+6px)] rtl:right-[calc(50%+6px)]"
                  aria-label={`${activeCount} active`}
                >
                  {activeCount}
                </motion.span>
              )}
              {tab === id && (
                <motion.span
                  layoutId={embedded ? 'tab-dot-e' : 'tab-dot'}
                  className="absolute top-0 h-0.5 w-10 rounded-full bg-accent"
                />
              )}
            </button>
          ))}
        </nav>
        <Sheet open={!!menu} onClose={() => setMenu(null)} title={t.menuTitle}>
          {menu && (
            <MenuBrowser
              initialCategory={menu.category}
              initialFilter={menu.filter}
              onDone={() => {
                setMenu(null);
                setTab('chat');
              }}
            />
          )}
        </Sheet>
      </div>
    </GuestUiContext.Provider>
  );
}

function GuestHeader() {
  const { t, lang, embedded } = useGuestUi();
  const guest = useStore((s) => s.guest);
  const conv = useStore((s) => s.conversation);
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-AE' : 'en-GB', {
      day: 'numeric',
      month: 'short',
    });
  return (
    <header
      className={`border-b border-line/60 bg-surface/90 backdrop-blur ${embedded ? 'pt-7' : 'safe-top'}`}
    >
      <div className="flex items-center gap-2 px-4 pt-2">
        <Logo className="h-8" />
        <div className="ms-auto flex items-center gap-1">
          <SampleBadge label={t.sampleContent} title={t.sampleTooltip} />
          <button
            type="button"
            onClick={() => setGuestLanguage(lang === 'ar' ? 'en' : 'ar')}
            className="inline-flex h-11 items-center gap-1 rounded-full px-3 text-sm text-muted hover:bg-raised hover:text-fg"
            aria-label={t.languageLabel}
          >
            <Languages size={16} aria-hidden /> {t.language}
          </button>
          {!embedded && <ThemeToggle />}
        </div>
      </div>
      <div className="px-4 pb-2.5 pt-1">
        <p className="display truncate text-[26px] leading-tight" data-testid="guest-greeting">
          {greeting(t)}, {guest.firstName}
        </p>
        <p className="text-xs text-muted">
          {t.room} <span dir="ltr">{guest.room}</span> · {fmt(guest.arrival)} –{' '}
          {fmt(guest.departure)} · {t.ambassador}: {guest.ambassador}
        </p>
      </div>
      <ModeBanner
        mode={conv.mode}
        human={conv.humanName}
        pending={!!conv.handoverRequested}
        ambassador={guest.ambassador}
      />
    </header>
  );
}

function greeting(t: ReturnType<typeof strings>) {
  const h = new Date().getHours();
  return h < 12 ? t.goodMorning : h < 18 ? t.goodAfternoon : t.goodEvening;
}

function ModeBanner({
  mode,
  human,
  pending,
  ambassador,
}: {
  mode: 'ai' | 'human';
  human?: string;
  pending: boolean;
  ambassador: string;
}) {
  const { t } = useGuestUi();
  const text =
    mode === 'human'
      ? t.humanReplying(human ?? ambassador)
      : pending
        ? t.handoverPending(ambassador)
        : t.aiReplying;
  return (
    <div
      data-testid="mode-banner"
      className={`flex items-center gap-2 px-4 py-0.5 text-[11px] font-medium transition-colors ${mode === 'human' ? 'bg-accent text-accent-fg' : pending ? 'bg-st-progress/15 text-st-progress' : 'bg-raised text-muted'}`}
    >
      {mode === 'human' ? <UserRound size={13} aria-hidden /> : <Sparkles size={13} aria-hidden />}
      <span role="status" className="min-w-0 flex-1 truncate">
        {text}
      </span>
      <button
        type="button"
        onClick={() => void requestAmbassador()}
        className={`-my-1 -me-2 inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium ${mode === 'human' ? 'text-accent-fg' : 'text-fg'} hover:underline`}
        data-testid="talk-ambassador"
      >
        <UserRound size={14} aria-hidden /> {t.talkToAmbassador}
      </button>
    </div>
  );
}

// ------------------------------------------------------------------- chat

function ChatView({ onOpenMenu }: { onOpenMenu: (c?: string, f?: string) => void }) {
  const { t } = useGuestUi();
  const messages = useStore((s) => s.messages);
  const typing = useStore((s) => s.typing);
  const scroller = useRef<HTMLDivElement>(null);
  if (!seenMessages.ready) markAllMessagesSeen(messages.map((m) => m.id));
  const last = messages[messages.length - 1];
  const chips =
    last && last.sender === 'ai' && last.chips?.length
      ? last.chips
      : messages.length === 0
        ? defaultChips(t)
        : [];

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }, [messages.length, typing]);

  return (
    <>
      <div
        ref={scroller}
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-4"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label={t.chatLog}
        data-testid="chat-log"
      >
        {messages.length === 0 && <EmptyChat />}
        <div className="space-y-3">
          {messages.map((m) => (
            <Bubble key={m.id} message={m} onOpenMenu={onOpenMenu} />
          ))}
        </div>
        <AnimatePresence>{typing && <TypingDots />}</AnimatePresence>
      </div>
      <Chips chips={chips} />
      <Composer />
    </>
  );
}

function defaultChips(t: ReturnType<typeof strings>) {
  return t === strings('ar')
    ? ['مناشف إضافية', 'طلب طعام', 'حجز طاولة', 'ساعات المسبح']
    : ['Extra towels', 'Order food', 'Book a table', 'Pool hours'];
}

function EmptyChat() {
  const { t } = useGuestUi();
  return (
    <div className="mx-auto max-w-xs py-8 text-center">
      <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-raised text-accent">
        <Sparkles size={22} aria-hidden />
      </div>
      <p className="display mb-2 text-2xl">{t.quickHello}</p>
      <p className="text-sm text-muted">{t.servicesHint}</p>
      <p className="mt-4 rounded-xl bg-raised/70 px-3 py-2 text-[11px] leading-relaxed text-muted">
        {t.privacy}
      </p>
    </div>
  );
}

function Bubble({
  message: m,
  onOpenMenu,
}: {
  message: Message;
  onOpenMenu: (c?: string, f?: string) => void;
}) {
  const { t } = useGuestUi();
  const [animate] = useState(() => !seenMessages.ids.has(m.id));
  useEffect(() => {
    seenMessages.ids.add(m.id);
  }, [m.id]);
  if (m.sender === 'system') {
    return (
      <motion.div
        initial={animate ? { opacity: 0, y: 6 } : false}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-[92%] text-center"
      >
        <p className="inline-block rounded-full bg-raised px-3 py-1.5 text-[12px] text-muted">
          {m.text}
        </p>
        {m.cards?.map((c, i) => (
          <div key={i} className="text-start">
            <ChatCard card={c} message={m} onOpenMenu={onOpenMenu} />
          </div>
        ))}
      </motion.div>
    );
  }
  const mine = m.sender === 'guest';
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 10, scale: 0.97 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}
      data-sender={m.sender}
    >
      {!mine && (
        <span className="mb-1 flex items-center gap-1 px-1 text-[11px] text-muted">
          {m.sender === 'staff' ? (
            <UserRound size={11} aria-hidden />
          ) : (
            <Sparkles size={11} aria-hidden />
          )}
          {m.sender === 'staff' ? m.staffName : t.aiLabel}
        </span>
      )}
      <div
        className={`max-w-[86%] ${m.text ? 'rounded-2xl px-3.5 py-2.5' : ''} text-[15px] leading-relaxed ${
          !m.text
            ? 'w-[86%]'
            : mine
              ? 'rounded-ee-md bg-fg text-bg'
              : m.sender === 'staff'
                ? 'rounded-es-md border border-accent/40 bg-accent/10'
                : 'rounded-es-md bg-surface shadow-soft'
        } ${m.cards?.length ? 'w-[86%]' : ''}`}
      >
        {m.text &&
          (m.sender === 'ai' && animate ? (
            <StreamText text={m.text} />
          ) : (
            <p className="whitespace-pre-line">{m.text}</p>
          ))}
        {m.cards?.map((c, i) => <ChatCard key={i} card={c} message={m} onOpenMenu={onOpenMenu} />)}
      </div>
    </motion.div>
  );
}

/** Reveals new AI replies word by word, like a streamed response. Screen readers get the full text at once. */
function StreamText({ text }: { text: string }) {
  const words = useMemo(() => text.split(/(\s+)/), [text]);
  const [n, setN] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? words.length : 0,
  );
  useEffect(() => {
    if (n >= words.length) return;
    const id = window.setTimeout(() => setN((x) => Math.min(words.length, x + 3)), 28);
    return () => window.clearTimeout(id);
  }, [n, words.length]);
  return (
    <>
      <p className="sr-only">{text}</p>
      <p className="whitespace-pre-line" aria-hidden>
        {words.slice(0, n).join('')}
        {n < words.length && (
          <span className="ms-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse rounded-sm bg-accent/60" />
        )}
      </p>
    </>
  );
}

function TypingDots() {
  const { t } = useGuestUi();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mt-3 flex items-start"
      role="status"
      aria-label={t.typing}
      data-testid="typing"
    >
      <div className="flex gap-1 rounded-2xl rounded-es-md bg-surface px-4 py-3.5 shadow-soft">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-muted"
            animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function Chips({ chips }: { chips: string[] }) {
  const typing = useStore((s) => s.typing);
  if (!chips.length || typing) return null;
  return (
    <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 pb-2" key={chips.join('|')}>
      {chips.map((c, i) => (
        <motion.button
          key={c}
          type="button"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 + i * 0.05, type: 'spring', stiffness: 400, damping: 30 }}
          className="chip shrink-0 whitespace-nowrap"
          onClick={() => void sendGuestMessage(c)}
        >
          {c}
        </motion.button>
      ))}
    </div>
  );
}

function Composer() {
  const { t } = useGuestUi();
  const [text, setText] = useState('');
  const typing = useStore((s) => s.typing);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || typing) return;
    void sendGuestMessage(text);
    setText('');
  };
  return (
    <form
      onSubmit={submit}
      className="flex items-end gap-2 border-t border-line/60 bg-surface px-3 py-2.5"
    >
      <label htmlFor="guest-input" className="sr-only">
        {t.placeholder}
      </label>
      <input
        id="guest-input"
        data-testid="guest-input"
        className="min-h-[44px] flex-1 rounded-full border border-line bg-bg px-4 text-[16px] text-fg placeholder:text-muted focus:border-accent focus:outline-none"
        placeholder={t.placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={1000}
        autoComplete="off"
        enterKeyHint="send"
      />
      <motion.button
        type="submit"
        whileTap={{ scale: 0.9 }}
        disabled={!text.trim() || typing}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-fg text-bg transition-opacity disabled:opacity-30"
        aria-label={t.send}
        data-testid="guest-send"
      >
        <ArrowUp size={18} aria-hidden className="rtl:-scale-x-100" />
      </motion.button>
    </form>
  );
}

// --------------------------------------------------------------- services

function ServicesView({ onOpenMenu }: { onOpenMenu: (c?: string, f?: string) => void }) {
  const { t, lang } = useGuestUi();
  const [query, setQuery] = useState('');
  const [section, setSection] = useState<CatalogueSection | null>(null);
  const [item, setItem] = useState<CatalogueItem | null>(null);
  const q = query.trim().toLowerCase();
  const results = q
    ? CATALOGUE.flatMap((s) => s.items).filter(
        (i) =>
          i.en.toLowerCase().includes(q) ||
          i.ar.includes(query.trim()) ||
          i.kw.some((k) => k.includes(q)),
      )
    : [];

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4">
      <h2 className="display mb-1 text-2xl">{t.servicesTitle}</h2>
      <p className="mb-4 text-sm text-muted">{t.servicesHint}</p>
      <div className="relative mb-5">
        <Search
          size={16}
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted ltr:left-3 rtl:right-3"
          aria-hidden
        />
        <label htmlFor="svc-search" className="sr-only">
          {t.searchServices}
        </label>
        <input
          id="svc-search"
          className="field ps-9"
          placeholder={t.searchServices}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            type="button"
            className="absolute top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center ltr:right-1 rtl:left-1"
            onClick={() => setQuery('')}
            aria-label={t.close}
          >
            <X size={14} aria-hidden />
          </button>
        )}
      </div>
      {q ? (
        <ul className="space-y-2">
          {results.length === 0 && (
            <li className="py-6 text-center text-sm text-muted">
              {lang === 'ar'
                ? 'لم نجد خدمة مطابقة. اكتب طلبك للكونسيرج.'
                : 'No matching service. Just tell the concierge what you need.'}
            </li>
          )}
          {results.map((i) => (
            <li key={i.key}>
              <button
                className="card flex w-full items-center justify-between px-4 py-3 text-start text-sm"
                onClick={() => setItem(i)}
              >
                {lang === 'ar' ? i.ar : i.en}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid grid-cols-2 gap-3">
          {CATALOGUE.map((s, i) => {
            const Icon = SECTION_ICON[s.id] ?? SECTION_ICON[s.dept]!;
            return (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <button
                  className="card flex h-full min-h-[104px] w-full flex-col items-start gap-3 p-4 text-start transition-transform active:scale-[0.98]"
                  onClick={() => setSection(s)}
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-raised text-accent">
                    <Icon size={18} aria-hidden />
                  </span>
                  <span className="text-sm font-medium leading-snug">
                    {lang === 'ar' ? s.ar : s.en}
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      )}
      <Sheet
        open={!!section && !item}
        onClose={() => setSection(null)}
        title={section ? (lang === 'ar' ? section.ar : section.en) : ''}
      >
        <ul className="divide-y divide-line/60">
          {section?.items.map((i) => (
            <li key={i.key}>
              <button
                className="flex min-h-[48px] w-full items-center justify-between py-3 text-start text-sm"
                onClick={() => setItem(i)}
              >
                {lang === 'ar' ? i.ar : i.en}
                {(i.sensitive || i.action === 'handover') && (
                  <span className="text-[11px] text-muted">
                    {lang === 'ar' ? 'يتابعه موظف' : 'Handled by a person'}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </Sheet>
      <ItemSheet
        item={item}
        onClose={() => {
          setItem(null);
          setSection(null);
        }}
        onOpenMenu={onOpenMenu}
      />
    </div>
  );
}

function ItemSheet({
  item,
  onClose,
  onOpenMenu,
}: {
  item: CatalogueItem | null;
  onClose: () => void;
  onOpenMenu: (c?: string, f?: string) => void;
}) {
  const { t, lang, goTo } = useGuestUi();
  const [qty, setQty] = useState(1);
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  useEffect(() => {
    setQty(1);
    setTime('');
    setNotes('');
  }, [item]);

  // Items that are not plain tickets are handled by the concierge or a dedicated card.
  useEffect(() => {
    if (!item) return;
    const action = item.action ?? 'ticket';
    if (action === 'ticket') return;
    const label = lang === 'ar' ? item.ar : item.en;
    onClose();
    if (action === 'menu')
      onOpenMenu(
        item.context === 'kids' || item.context === 'breakfast' ? item.context : undefined,
      );
    else if (action === 'restaurant' || action === 'spa' || action === 'transport') {
      startBooking(action === 'restaurant' ? 'restaurant' : action, label, item.context);
      goTo('chat');
    } else if (action === 'status') goTo('requests');
    else {
      void sendGuestMessage(action === 'kb' ? `${label}?` : label);
      goTo('chat');
    }
  }, [item, lang, onClose, onOpenMenu, goTo]);

  if (item && (item.action ?? 'ticket') !== 'ticket') return null;
  return (
    <Sheet open={!!item} onClose={onClose} title={item ? (lang === 'ar' ? item.ar : item.en) : ''}>
      {item && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            requestFromGrid(item.key, {
              quantity: item.qty ? qty : undefined,
              time: item.time ? time || 'now' : undefined,
              notes: notes.trim() || undefined,
            });
            onClose();
            goTo('chat');
          }}
        >
          {item.qty && (
            <div>
              <span className="label">{t.quantity}</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="btn-ghost h-11 w-11 px-0"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="−"
                >
                  −
                </button>
                <span className="w-8 text-center text-lg tabular-nums" aria-live="polite">
                  {qty}
                </span>
                <button
                  type="button"
                  className="btn-ghost h-11 w-11 px-0"
                  onClick={() => setQty((q) => Math.min(10, q + 1))}
                  aria-label="+"
                >
                  +
                </button>
              </div>
            </div>
          )}
          {item.time && (
            <div>
              <label className="label" htmlFor="item-time">
                {t.preferredTime}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-pressed={!time}
                  className={`chip ${!time ? 'border-accent text-accent' : ''}`}
                  onClick={() => setTime('')}
                >
                  {t.timeNow}
                </button>
                <input
                  id="item-time"
                  type="time"
                  className="field w-auto flex-1"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required={item.time === 'ask'}
                />
              </div>
            </div>
          )}
          <div>
            <label className="label" htmlFor="item-notes">
              {t.notes}
            </label>
            <textarea
              id="item-notes"
              className="field min-h-[72px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={300}
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            {t.sendRequest}
          </button>
        </form>
      )}
    </Sheet>
  );
}

// --------------------------------------------------------------- requests

function RequestsView() {
  const { t, lang } = useGuestUi();
  const tickets = useStore((s) =>
    s.tickets.filter((x) => x.guestId === s.guest.id).sort((a, b) => b.createdAt - a.createdAt),
  );
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4" data-testid="requests">
      <h2 className="display mb-4 text-2xl">{t.tabRequests}</h2>
      {tickets.length === 0 ? (
        <div className="py-12 text-center">
          <ListChecks size={28} className="mx-auto mb-3 text-muted" aria-hidden />
          <p className="font-medium">{t.noRequests}</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted">{t.noRequestsHint}</p>
        </div>
      ) : (
        <ul className="space-y-3" aria-live="polite">
          {tickets.map((tk) => (
            <motion.li
              key={tk.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TicketRow ticket={tk} steps />
              {tk.status === 'new' && (
                <button
                  className="mt-1 px-1 text-xs text-muted underline-offset-2 hover:underline"
                  onClick={() => cancelTicket(tk.id)}
                >
                  {t.cancel} {lang === 'ar' ? 'الطلب' : 'request'}
                </button>
              )}
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
