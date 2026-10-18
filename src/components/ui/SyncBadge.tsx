import { Cloud, CloudOff, Laptop, Loader2 } from 'lucide-react';
import { useSyncStatus } from '../../store/store';

const LABEL = {
  live: { text: 'Live on all devices', Icon: Cloud, cls: 'text-st-done border-st-done/40' },
  connecting: { text: 'Connecting…', Icon: Loader2, cls: 'text-muted border-line' },
  offline: {
    text: 'Offline · this device only',
    Icon: CloudOff,
    cls: 'text-st-progress border-st-progress/40',
  },
  local: { text: 'This device only', Icon: Laptop, cls: 'text-muted border-line' },
} as const;

/** Shows whether changes are shared with other devices right now. */
export function SyncBadge({ compact = false }: { compact?: boolean }) {
  const status = useSyncStatus();
  const { text, Icon, cls } = LABEL[status];
  return (
    <span
      role="status"
      title={text}
      data-testid="sync-badge"
      data-sync={status}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      <Icon size={12} aria-hidden className={status === 'connecting' ? 'animate-spin' : ''} />
      <span className={compact ? 'sr-only' : ''}>{text}</span>
    </span>
  );
}
