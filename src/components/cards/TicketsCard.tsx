import { motion } from 'motion/react';
import { ITEM_BY_KEY } from '../../domain/catalogue';
import { deptName } from '../../domain/departments';
import type { Ticket } from '../../domain/types';
import { useStore } from '../../store/store';
import { DEPT_ICON } from '../ui/icons';
import { StatusPill, StatusSteps } from '../ui/Status';
import { useGuestUi } from '../guest/context';

export function ticketLabel(t: Ticket, lang: 'en' | 'ar') {
  if (lang === 'en') return t.item;
  const item = t.itemKey ? ITEM_BY_KEY[t.itemKey] : undefined;
  const map: Record<string, string> = {
    'In-room dining order': 'طلب الطعام في الغرفة',
    'Table reservation': 'حجز طاولة',
    'Spa booking': 'حجز السبا',
    'Service recovery': 'متابعة شخصية من السفير',
    'Guest question to answer': 'سؤال للسفير',
    'Guest complaint': 'ملاحظة للسفير',
    'Guest emergency alert': 'تنبيه طوارئ',
  };
  return item?.ar ?? map[t.item] ?? t.item;
}

export function TicketRow({ ticket, steps = false }: { ticket: Ticket; steps?: boolean }) {
  const { lang, t } = useGuestUi();
  const Icon = DEPT_ICON[ticket.department];
  return (
    <motion.div layout="position" data-ticket-chip={ticket.id} className="rounded-xl border border-line/70 bg-bg/60 p-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-raised text-accent">
          <Icon size={16} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {ticket.quantity && ticket.quantity > 1 && ticket.kind === 'service' ? `${ticket.quantity} × ` : ''}
            {ticketLabel(ticket, lang)}
          </p>
          <p className="text-xs text-muted">
            {deptName(ticket.department, lang)} · <span dir="ltr">{ticket.id}</span>
            {ticket.preferredTime ? ` · ${ticket.preferredTime}` : ''}
          </p>
        </div>
        <StatusPill status={ticket.status} label={t.status[ticket.status]} />
      </div>
      {steps && ticket.status !== 'cancelled' && <StatusSteps status={ticket.status} labels={t.steps} />}
    </motion.div>
  );
}

export function TicketsCard({ ids }: { ids: string[] }) {
  const tickets = useStore((s) => s.tickets.filter((t) => ids.includes(t.id)));
  if (!tickets.length) return null;
  return (
    <div className="mt-2 space-y-2">
      {tickets.map((t) => (
        <TicketRow key={t.id} ticket={t} />
      ))}
    </div>
  );
}
