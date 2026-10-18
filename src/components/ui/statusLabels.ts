import type { TicketStatus } from '../../domain/types';

export const STATUS_LABEL_EN: Record<TicketStatus, string> = {
  new: 'New',
  accepted: 'Accepted',
  on_the_way: 'On the way',
  done: 'Done',
  cancelled: 'Cancelled',
};
