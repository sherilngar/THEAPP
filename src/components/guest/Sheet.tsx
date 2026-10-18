import { useEffect, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useGuestUi } from './context';

/** Bottom sheet scoped to the guest app frame, so it also works inside the Present-mode phone. */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const { t } = useGuestUi();
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const id = window.setTimeout(
      () => panel.current?.querySelector<HTMLElement>('button, input, select, textarea')?.focus(),
      60,
    );
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-40 flex items-end">
          <motion.button
            type="button"
            aria-label={t.close}
            className="absolute inset-0 bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative max-h-[88%] w-full overflow-y-auto rounded-t-3xl bg-surface px-5 pb-6 pt-3 shadow-2xl safe-bottom"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" aria-hidden />
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="display text-2xl">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-raised"
                aria-label={t.close}
              >
                <X size={18} aria-hidden />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
