import { ITEM_BY_KEY } from '../../domain/catalogue';
import type { Ticket } from '../../domain/types';

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
