import { useRef, useSyncExternalStore } from 'react';
import { NEW_TICKETS, bookingConfirmation, bookingDraftToTicket, orderDraft, orderReadBack, respond, type EngineResult, type Reply } from '../ai/engine';
import { maskPii } from '../domain/pii';
import { ITEM_BY_KEY } from '../domain/catalogue';
import { DEFAULT_STANDARDS, DEPT_BY_ID, deptName } from '../domain/departments';
import { computeEscalation, escalationLabel } from '../domain/escalation';
import { validateTool } from '../domain/tools';
import type {
  BookingDraft,
  Card,
  Conversation,
  DepartmentId,
  DiningOrder,
  Guest,
  Lang,
  Message,
  Rating,
  Standards,
  Ticket,
  TicketDraft,
  TicketStatus,
} from '../domain/types';
import { DEFAULT_KNOWLEDGE, type Knowledge } from '../data/knowledge';
import { demoGuest, liveSampleTickets, sampleHistory } from '../data/demo';

/**
 * Local demo store. State lives in localStorage and is mirrored to every open tab
 * with BroadcastChannel, so a phone-framed guest app and the staff board stay in
 * sync. The shape matches the Supabase tables in supabase/migrations, so a remote
 * adapter can replace persistence without touching the screens.
 */

export interface State {
  v: 3;
  guest: Guest;
  conversation: Conversation;
  messages: Message[];
  tickets: Ticket[];
  ratings: Rating[];
  settings: { standards: Standards; knowledge: Knowledge };
  clockOffset: number;
  seq: number;
  typing: boolean;
  startedAt: number;
}

const KEY = 'so-concierge-state';
const CHANNEL = 'so-concierge';

function initialState(): State {
  const now = Date.now();
  const guest = demoGuest(now);
  return {
    v: 3,
    guest,
    conversation: { id: 'conv-demo', guestId: guest.id, mode: 'ai', lang: 'en' },
    messages: [],
    tickets: [...sampleHistory(now), ...liveSampleTickets(now)],
    ratings: [],
    settings: { standards: structuredClone(DEFAULT_STANDARDS), knowledge: structuredClone(DEFAULT_KNOWLEDGE) },
    clockOffset: 0,
    seq: 1000,
    typing: false,
    startedAt: now,
  };
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      if (parsed.v === 3) return { ...parsed, typing: false };
    }
  } catch {
    /* storage unavailable: fall through to a fresh demo */
  }
  return initialState();
}

let state: State = typeof window === 'undefined' ? initialState() : load();
const listeners = new Set<() => void>();
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL) : null;

type Bus = { type: 'tickets-created'; ids: string[] };
const busListeners = new Set<(e: Bus) => void>();
export function onStoreEvent(fn: (e: Bus) => void) {
  busListeners.add(fn);
  return () => busListeners.delete(fn);
}

function emit() {
  listeners.forEach((l) => l());
}

function commit(next: State, broadcast = true) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private mode or quota: keep working in memory */
  }
  if (broadcast) channel?.postMessage(state);
  emit();
}

if (channel) {
  channel.onmessage = (e: MessageEvent<State>) => {
    if (e.data?.v === 3) commit(e.data, false);
  };
}
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY && e.newValue) {
      try {
        commit(JSON.parse(e.newValue) as State, false);
      } catch {
        /* ignore malformed */
      }
    }
  });
}

export function getState() {
  return state;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** Subscribes to the store. Results are cached per state + selector, so derived arrays are stable. */
export function useStore<T>(selector: (s: State) => T): T {
  const cache = useRef<{ s: State; sel: (s: State) => T; v: T } | null>(null);
  const get = () => {
    const c = cache.current;
    if (c && c.s === state && c.sel === selector) return c.v;
    const v = selector(state);
    cache.current = { s: state, sel: selector, v };
    return v;
  };
  return useSyncExternalStore(subscribe, get, get);
}

export const now = () => Date.now() + state.clockOffset;

function update(fn: (draft: State) => void) {
  const next = structuredClone(state);
  fn(next);
  commit(next);
}

let msgCounter = 0;
function msgId() {
  msgCounter += 1;
  return `m-${Date.now().toString(36)}-${msgCounter}-${Math.random().toString(36).slice(2, 6)}`;
}

function pushMessage(s: State, m: Omit<Message, 'id' | 'conversationId' | 'at'> & { at?: number }): Message {
  const msg: Message = { id: msgId(), conversationId: s.conversation.id, at: m.at ?? Date.now() + s.clockOffset, ...m };
  s.messages.push(msg);
  return msg;
}

const tr = (lang: 'en' | 'ar', en: string, ar: string) => (lang === 'ar' ? ar : en);

// ------------------------------------------------------------------ tickets

/** Server-side style validation: every draft must pass its tool schema before it becomes a ticket. */
export function validateDraft(d: TicketDraft): { ok: true } | { ok: false; error: string } {
  const base = validateTool('create_service_request', {
    department: d.department,
    category: d.category,
    item: d.item,
    quantity: d.quantity,
    details: d.details,
    preferred_time: d.preferredTime,
    priority: d.priority,
  });
  if (!base.ok) return base;
  if (d.kind === 'dining') return validateTool('create_dining_order', d.payload);
  if (d.kind === 'reservation') return validateTool('create_reservation', d.payload);
  if (d.kind === 'spa') return validateTool('create_spa_booking', d.payload);
  if (d.kind === 'transport') return validateTool('request_transport', d.payload);
  return { ok: true };
}

function createTickets(s: State, drafts: TicketDraft[], original: string | undefined, lang: Lang): Ticket[] {
  const created: Ticket[] = [];
  for (const d of drafts) {
    const v = validateDraft(d);
    if (!v.ok) {
      console.warn('Rejected invalid request', v.error);
      continue;
    }
    s.seq += 1;
    const t: Ticket = {
      id: `T-${s.seq}`,
      department: d.department,
      alsoNotify: d.alsoNotify,
      category: d.category,
      item: d.item,
      itemKey: d.itemKey,
      quantity: d.quantity,
      details: d.details,
      preferredTime: d.preferredTime,
      room: s.guest.room,
      guestId: s.guest.id,
      guestName: `${s.guest.title} ${s.guest.lastName}`,
      priority: d.priority,
      status: 'new',
      createdAt: Date.now() + s.clockOffset,
      notes: [],
      escalationLevel: 0,
      originalMessage: original,
      language: lang,
      kind: d.kind,
      payload: d.payload,
    };
    s.tickets.push(t);
    created.push(t);
  }
  return created;
}

function guestItemName(t: Ticket, lang: 'en' | 'ar'): string {
  if (lang === 'en') return t.item;
  const item = t.itemKey ? ITEM_BY_KEY[t.itemKey] : undefined;
  if (item) return item.ar;
  const map: Record<string, string> = {
    'In-room dining order': 'طلب الطعام',
    'Table reservation': 'حجز الطاولة',
    'Spa booking': 'حجز السبا',
    'Guest question to answer': 'سؤالك',
    'Guest complaint': 'ملاحظتك',
  };
  return map[t.item] ?? t.item;
}

// ------------------------------------------------------------- guest flow

function applyEngine(s: State, r: EngineResult, original: string) {
  const created = createTickets(s, r.drafts, original, r.lang);
  const ids = created.map((t) => t.id);
  let usedIds = false;
  const fill = (cards?: Card[]) =>
    cards
      ?.map((c) => {
        if (c.type === 'tickets' && c.ticketIds.includes(NEW_TICKETS)) {
          usedIds = true;
          return { ...c, ticketIds: c.ticketIds.flatMap((x) => (x === NEW_TICKETS ? ids : [x])) };
        }
        return c;
      })
      .filter((c) => c.type !== 'tickets' || c.ticketIds.length > 0);

  let pendingCardMsg: string | undefined;
  r.replies.forEach((rep: Reply) => {
    const m = pushMessage(s, { sender: 'ai', text: rep.text, lang: r.lang, cards: fill(rep.cards), chips: rep.chips });
    if (rep.cards?.some((c) => (c.type === 'order_confirm' || c.type === 'booking') && c.state === 'pending')) pendingCardMsg = m.id;
  });
  if (!usedIds && ids.length) pushMessage(s, { sender: 'ai', text: '', lang: r.lang, cards: [{ type: 'tickets', ticketIds: ids }] });

  if (r.completeCardMessageId) completeCard(s, r.completeCardMessageId);
  if (r.pending === null) delete s.conversation.pending;
  else if (r.pending) {
    const p = { ...r.pending };
    if ((p.type === 'order_confirm' || p.type === 'booking') && !p.messageId) p.messageId = pendingCardMsg;
    s.conversation.pending = p;
  }
  if (r.handover && s.conversation.mode === 'ai') {
    s.conversation.handoverRequested = { reason: r.handover.reason, at: Date.now() + s.clockOffset, urgency: r.handover.urgency };
    pushMessage(s, {
      sender: 'system',
      text: tr(s.conversation.lang, `${s.guest.ambassador}, your Experience Ambassador, has been notified and will join this chat.`, `تم إبلاغ ${s.guest.ambassador} من فريق سفراء التجربة وسينضم إلى هذه المحادثة.`),
      lang: s.conversation.lang,
      cards: [{ type: 'handover', staffName: s.guest.ambassador }],
    });
  }
  return created;
}

function completeCard(s: State, messageId: string) {
  const m = s.messages.find((x) => x.id === messageId);
  m?.cards?.forEach((c) => {
    if (c.type === 'order_confirm') c.state = 'placed';
    if (c.type === 'booking') c.state = 'done';
  });
}

const THINK_MS = { min: 650, max: 1200 };

/** Sends a guest message. The concierge "thinks" briefly, then replies with streamed text. */
export function sendGuestMessage(raw: string, opts: { thinkMs?: number } = {}): Promise<void> {
  const text = raw.trim().slice(0, 1000);
  if (!text) return Promise.resolve();
  const { text: masked } = maskPii(text);
  const lang = /[؀-ۿ]/.test(text) ? 'ar' : /\p{L}{2,}/u.test(text) ? 'en' : state.conversation.lang;
  update((s) => {
    pushMessage(s, { sender: 'guest', text: masked, lang });
    s.conversation.lang = lang === 'ar' ? 'ar' : 'en';
    if (s.conversation.mode === 'ai') s.typing = true;
  });

  if (state.conversation.mode === 'human') {
    // A person is handling the chat: the concierge stays quiet, except for safety.
    const r = respond(text, engineCtx());
    if (r.emergency || r.pii.length) {
      update((s) => {
        const created = applyEngine(s, { ...r, replies: r.replies.filter((x) => x.cards?.some((c) => c.type === 'emergency' || c.type === 'privacy')) }, masked);
        if (created.length) queueMicrotask(() => busListeners.forEach((l) => l({ type: 'tickets-created', ids: created.map((t) => t.id) })));
      });
    }
    return Promise.resolve();
  }

  const delay = opts.thinkMs ?? THINK_MS.min + Math.random() * (THINK_MS.max - THINK_MS.min);
  return new Promise((resolve) => {
    window.setTimeout(() => {
      let created: Ticket[] = [];
      try {
        const r = respond(text, engineCtx());
        update((s) => {
          s.typing = false;
          created = applyEngine(s, r, masked);
        });
      } catch (err) {
        console.error(err);
        update((s) => {
          s.typing = false;
          pushMessage(s, {
            sender: 'ai',
            text: tr(s.conversation.lang, "I'm sorry, I couldn't process that just now. I've asked your ambassador to help you personally.", 'عذراً، لم أتمكن من معالجة ذلك الآن. طلبت من السفير مساعدتك شخصياً.'),
            lang: s.conversation.lang,
          });
          s.conversation.handoverRequested = { reason: 'Concierge error fallback', at: Date.now() + s.clockOffset, urgency: 'normal' };
          createTickets(s, [{ department: 'frontoffice', category: 'Guest Relations', item: 'Concierge could not respond', details: 'Automatic fallback: please contact the guest.', priority: 'high', kind: 'handover' }], masked, lang);
        });
      }
      if (created.length) busListeners.forEach((l) => l({ type: 'tickets-created', ids: created.map((t) => t.id) }));
      resolve();
    }, delay);
  });
}

function engineCtx() {
  return {
    guest: state.guest,
    conversation: state.conversation,
    tickets: state.tickets.filter((t) => t.guestId === state.guest.id),
    knowledge: state.settings.knowledge,
    uiLang: state.conversation.lang,
  };
}

export function setGuestLanguage(lang: 'en' | 'ar') {
  update((s) => {
    s.conversation.lang = lang;
  });
}

/** Menu card → read the order back and wait for a yes. */
export function reviewOrder(order: DiningOrder) {
  update((s) => {
    const lang = s.conversation.lang;
    const m = pushMessage(s, {
      sender: 'ai',
      text: orderReadBack(order, s.settings.knowledge, lang),
      lang,
      cards: [{ type: 'order_confirm', order, state: 'pending' }],
      chips: lang === 'ar' ? ['نعم', 'تعديل'] : ['Yes, place it', 'Change'],
    });
    s.conversation.pending = { type: 'order_confirm', order, messageId: m.id, lang };
  });
}

/** Order card "Place order" button. */
export function confirmOrder(messageId: string) {
  let created: Ticket[] = [];
  update((s) => {
    const m = s.messages.find((x) => x.id === messageId);
    const card = m?.cards?.find((c) => c.type === 'order_confirm');
    if (!card || card.type !== 'order_confirm' || card.state !== 'pending') return;
    const lang = s.conversation.lang;
    pushMessage(s, { sender: 'guest', text: tr(lang, 'Yes, place my order', 'نعم، أكد الطلب'), lang });
    created = createTickets(s, [orderDraft(card.order)], undefined, lang);
    card.state = 'placed';
    delete s.conversation.pending;
    pushMessage(s, {
      sender: 'ai',
      text: tr(lang, `Your order is placed, ${s.guest.firstName}. I'll let you know when it's on the way. It will be charged to room ${s.guest.room} (${s.guest.lastName}).`, `تم تأكيد طلبك يا ${s.guest.firstName}، وسأبلغك عندما يكون في الطريق. سيُضاف إلى حساب الغرفة ${s.guest.room}.`),
      lang,
      cards: [{ type: 'tickets', ticketIds: created.map((t) => t.id) }],
    });
  });
  if (created.length) busListeners.forEach((l) => l({ type: 'tickets-created', ids: created.map((t) => t.id) }));
}

/** Booking card submit (restaurant, spa or transport). */
export function submitBooking(messageId: string, booking: BookingDraft) {
  let created: Ticket[] = [];
  update((s) => {
    const lang = s.conversation.lang;
    const draft = bookingDraftToTicket(booking, s.settings.knowledge);
    created = createTickets(s, [draft], undefined, lang);
    if (!created.length) return;
    const m = s.messages.find((x) => x.id === messageId);
    m?.cards?.forEach((c) => {
      if (c.type === 'booking') {
        c.state = 'done';
        c.booking = booking;
      }
    });
    if (s.conversation.pending?.type === 'booking') delete s.conversation.pending;
    pushMessage(s, { sender: 'ai', text: bookingConfirmation(booking, s.settings.knowledge, lang), lang, cards: [{ type: 'tickets', ticketIds: created.map((t) => t.id) }] });
  });
  if (created.length) busListeners.forEach((l) => l({ type: 'tickets-created', ids: created.map((t) => t.id) }));
  return created.length > 0;
}

/** Services grid: a direct request without typing. */
export function requestFromGrid(itemKey: string, opts: { quantity?: number; time?: string; notes?: string }) {
  const item = ITEM_BY_KEY[itemKey];
  if (!item) return;
  let created: Ticket[] = [];
  update((s) => {
    const lang = s.conversation.lang;
    const label = lang === 'ar' ? item.ar : item.en;
    pushMessage(s, { sender: 'guest', text: `${opts.quantity && opts.quantity > 1 ? `${opts.quantity} × ` : ''}${label}${opts.time ? ` · ${opts.time}` : ''}`, lang });
    created = createTickets(
      s,
      [{ department: item.dept, alsoNotify: item.also, category: item.en, item: item.en, itemKey: item.key, quantity: opts.quantity, details: opts.notes ? maskPii(opts.notes).text : undefined, preferredTime: opts.time, priority: item.prio ?? 'normal', kind: item.action === 'handover' ? 'handover' : 'service' }],
      undefined,
      lang,
    );
    pushMessage(s, {
      sender: 'ai',
      text: tr(lang, `Of course, ${s.guest.firstName}. I've sent this to our ${deptName(item.dept)} team.`, `بالتأكيد يا ${s.guest.firstName}. أرسلت طلبك إلى فريق ${deptName(item.dept, 'ar')}.`),
      lang,
      cards: [{ type: 'tickets', ticketIds: created.map((t) => t.id) }],
    });
  });
  if (created.length) busListeners.forEach((l) => l({ type: 'tickets-created', ids: created.map((t) => t.id) }));
}

export function requestAmbassador() {
  const lang = state.conversation.lang;
  return sendGuestMessage(tr(lang, "I'd like to speak to my ambassador, please.", 'أود التحدث إلى السفير من فضلك.'));
}

// ---------------------------------------------------------------- staff

function statusMessage(s: State, t: Ticket, status: TicketStatus, by: string) {
  if (t.guestId !== s.guest.id) return;
  const lang = s.conversation.lang;
  const name = guestItemName(t, lang);
  const dept = deptName(t.department, lang);
  if (status === 'accepted')
    pushMessage(s, { sender: 'system', text: tr(lang, `${dept} has accepted your request: ${name}.`, `قبل فريق ${dept} طلبك: ${name}.`), lang, cards: [{ type: 'tickets', ticketIds: [t.id] }] });
  if (status === 'on_the_way')
    pushMessage(s, { sender: 'system', text: tr(lang, `${by} is on the way with your ${name.toLowerCase()}.`, `${by} في الطريق إليك بطلبك: ${name}.`), lang });
  if (status === 'done')
    pushMessage(s, {
      sender: 'ai',
      text: tr(lang, `Your request “${name}” is complete, ${s.guest.firstName}. How did we do?`, `اكتمل طلبك «${name}» يا ${s.guest.firstName}. كيف كانت الخدمة؟`),
      lang,
      cards: [{ type: 'rating', ticketId: t.id }],
    });
}

export function setTicketStatus(id: string, status: TicketStatus, by?: string) {
  update((s) => {
    const t = s.tickets.find((x) => x.id === id);
    if (!t || t.status === status || t.status === 'done' || t.status === 'cancelled') return;
    const at = Date.now() + s.clockOffset;
    const who = by ?? DEPT_BY_ID[t.department].staff;
    if (status === 'accepted') {
      t.acceptedAt = at;
      t.assignee = who;
    }
    if (status === 'on_the_way') {
      t.acceptedAt ??= at;
      t.assignee ??= who;
      t.onTheWayAt = at;
    }
    if (status === 'done') {
      t.acceptedAt ??= at;
      t.assignee ??= who;
      t.doneAt = at;
    }
    if (status === 'cancelled') t.cancelledAt = at;
    t.status = status;
    t.notes.push({ at, by: who, text: `Status → ${status.replace(/_/g, ' ')}` });
    statusMessage(s, t, status, who);
  });
}

export function cancelTicket(id: string) {
  setTicketStatus(id, 'cancelled', 'Guest');
}

export function reassignTicket(id: string, dept: DepartmentId, by: string) {
  update((s) => {
    const t = s.tickets.find((x) => x.id === id);
    if (!t) return;
    const at = Date.now() + s.clockOffset;
    t.notes.push({ at, by, text: `Reassigned from ${deptName(t.department)} to ${deptName(dept)}` });
    t.department = dept;
    t.createdAt = at; // the new team gets a fresh response clock
    t.escalationLevel = 0;
    t.status = 'new';
    delete t.acceptedAt;
    delete t.assignee;
  });
}

export function addNote(id: string, by: string, text: string) {
  const clean = maskPii(text.trim().slice(0, 500)).text;
  if (!clean) return;
  update((s) => {
    s.tickets.find((x) => x.id === id)?.notes.push({ at: Date.now() + s.clockOffset, by, text: clean });
  });
}

/** A staff member replies in the guest chat. This takes the conversation over from the AI. */
export function staffReply(text: string, staffName: string, dept: DepartmentId) {
  const clean = text.trim().slice(0, 1000);
  if (!clean) return;
  update((s) => {
    const lang = s.conversation.lang;
    if (s.conversation.mode !== 'human' || s.conversation.humanName !== staffName) {
      pushMessage(s, {
        sender: 'system',
        text: tr(lang, `${staffName} (${deptName(dept)}) has joined the chat. You are now talking to a person.`, `انضم ${staffName} (${deptName(dept, 'ar')}) إلى المحادثة. أنت الآن تتحدث مع موظف.`),
        lang,
      });
    }
    s.conversation.mode = 'human';
    s.conversation.humanName = staffName;
    delete s.conversation.handoverRequested;
    delete s.conversation.pending;
    pushMessage(s, { sender: 'staff', staffName: `${staffName} · ${DEPT_BY_ID[dept].short}`, text: clean, lang });
  });
}

export function handBackToAi() {
  update((s) => {
    const lang = s.conversation.lang;
    s.conversation.mode = 'ai';
    delete s.conversation.humanName;
    pushMessage(s, { sender: 'system', text: tr(lang, 'The AI concierge is replying again. Your ambassador is always one tap away.', 'عاد مساعد الكونسيرج الذكي للرد. السفير متاح دائماً بضغطة واحدة.'), lang });
  });
}

export function rateTicket(ticketId: string, value: number) {
  let created: Ticket[] = [];
  update((s) => {
    const t = s.tickets.find((x) => x.id === ticketId);
    if (!t || t.rating) return;
    t.rating = value;
    s.ratings.push({ ticketId, value, at: Date.now() + s.clockOffset });
    s.messages.forEach((m) => m.cards?.forEach((c) => c.type === 'rating' && c.ticketId === ticketId && (c.value = value)));
    const lang = s.conversation.lang;
    if (value <= 2) {
      created = createTickets(
        s,
        [{ department: 'frontoffice', category: 'Service Recovery', item: 'Service recovery', details: `Guest rated “${t.item}” (${t.id}, ${deptName(t.department)}) ${value}/5. Contact the guest personally.`, priority: 'high', kind: 'recovery' }],
        undefined,
        lang,
      );
      pushMessage(s, {
        sender: 'ai',
        text: tr(lang, `I'm very sorry we fell short, ${s.guest.firstName}. Your ambassador, ${s.guest.ambassador}, will contact you personally to put this right.`, `نأسف جداً لأننا لم نكن عند حسن ظنك يا ${s.guest.firstName}. سيتواصل معك ${s.guest.ambassador} من فريق سفراء التجربة شخصياً لمعالجة الأمر.`),
        lang,
        cards: [{ type: 'tickets', ticketIds: created.map((x) => x.id) }],
      });
      s.conversation.handoverRequested = { reason: `Low rating (${value}/5)`, at: Date.now() + s.clockOffset, urgency: 'high' };
    } else {
      pushMessage(s, { sender: 'ai', text: tr(lang, `Thank you, ${s.guest.firstName}. We're delighted to hear it.`, `شكراً لك يا ${s.guest.firstName}. يسعدنا ذلك.`), lang });
    }
  });
  if (created.length) busListeners.forEach((l) => l({ type: 'tickets-created', ids: created.map((x) => x.id) }));
}

// ------------------------------------------------------------- escalation

/** Raises escalation levels as time passes. Idempotent, so every open tab can run it. */
export function tickEscalations() {
  const t = now();
  const changes = state.tickets.filter((x) => !x.sample && computeEscalation(x, state.settings.standards, t) > x.escalationLevel);
  if (!changes.length) return;
  update((s) => {
    for (const c of changes) {
      const tk = s.tickets.find((x) => x.id === c.id);
      if (!tk) continue;
      const level = computeEscalation(tk, s.settings.standards, t);
      if (level <= tk.escalationLevel) continue;
      tk.escalationLevel = level;
      tk.notes.push({ at: t, by: 'System', text: `${escalationLabel(level)} (${level === 1 ? DEPT_BY_ID[tk.department].supervisor : 'Duty Manager'})` });
    }
  });
}

// ---------------------------------------------------------------- admin

export function setStandards(standards: Standards) {
  update((s) => {
    s.settings.standards = standards;
  });
}

export function setKnowledge(knowledge: Knowledge) {
  update((s) => {
    s.settings.knowledge = knowledge;
  });
}

export function advanceClock(minutes: number) {
  update((s) => {
    s.clockOffset += minutes * 60_000;
  });
  tickEscalations();
}

export function resetDemo(opts: { keepSettings?: boolean } = {}) {
  const fresh = initialState();
  if (opts.keepSettings) fresh.settings = state.settings;
  commit(fresh);
}

/** Services grid → booking picker card in the chat. */
export function startBooking(kind: BookingDraft['kind'], label: string, context?: string) {
  update((s) => {
    const lang = s.conversation.lang;
    pushMessage(s, { sender: 'guest', text: label, lang });
    const booking: BookingDraft = { kind };
    if (kind === 'transport') {
      booking.outlet = context === 'airport' ? 'airport_departure' : context ?? 'taxi';
      if (context === 'airport') booking.destination = 'Airport';
    }
    if (kind === 'spa' && context === 'couples') booking.outlet = 'couples';
    if (context === 'beach or terrace table') booking.notes = 'Beach or terrace table';
    const m = pushMessage(s, {
      sender: 'ai',
      text: tr(lang, 'Of course. Choose the details below and I will send the request to our team.', 'بالتأكيد. اختر التفاصيل أدناه وسأرسل الطلب إلى فريقنا.'),
      lang,
      cards: [{ type: 'booking', booking, state: 'pending' }],
    });
    s.conversation.pending = { type: 'booking', booking, asking: kind === 'spa' ? 'outlet' : 'time', messageId: m.id, lang };
  });
}
