import { FlaskConical } from 'lucide-react';
import { useStore } from '../../store/store';
import { hasSampleContent } from '../../data/knowledge';

export function SampleBadge({
  label = 'Sample content',
  title,
}: {
  label?: string;
  title?: string;
}) {
  const show = useStore((s) => hasSampleContent(s.settings.knowledge));
  if (!show) return null;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-dashed border-accent/60 px-2 py-0.5 text-xs font-medium text-accent"
      title={title ?? 'Placeholder hotel details are in use until real content is approved.'}
    >
      <FlaskConical size={12} aria-hidden />
      {label}
    </span>
  );
}
