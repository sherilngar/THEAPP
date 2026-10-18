import type { Conversation, Guest, Message } from '../domain/types';
import type { State } from './store';

export interface ChatSummary {
  guest: Guest;
  conv: Conversation;
  last?: Message;
  unread: number;
  needsPerson: boolean;
}

/** A chat needs a person when the guest was promised one, or wrote while a person is in charge. */
export function summariseChats(s: State): ChatSummary[] {
  const lastByConv = new Map<string, Message>();
  const unreadByConv = new Map<string, number>();
  const readAt = new Map(s.conversations.map((c) => [c.id, c.staffReadAt ?? 0]));
  for (const m of s.messages) {
    lastByConv.set(m.conversationId, m);
    if (m.sender === 'guest' && m.at > (readAt.get(m.conversationId) ?? 0))
      unreadByConv.set(m.conversationId, (unreadByConv.get(m.conversationId) ?? 0) + 1);
  }
  return s.conversations
    .map((conv): ChatSummary | null => {
      const guest = s.guests.find((g) => g.id === conv.guestId);
      if (!guest) return null;
      const unread = unreadByConv.get(conv.id) ?? 0;
      const needsPerson = !!conv.handoverRequested || (conv.mode === 'human' && unread > 0);
      return { guest, conv, last: lastByConv.get(conv.id), unread, needsPerson };
    })
    .filter((x): x is ChatSummary => !!x?.last)
    .sort(
      (a, b) =>
        Number(b.needsPerson) - Number(a.needsPerson) || (b.last?.at ?? 0) - (a.last?.at ?? 0),
    );
}
