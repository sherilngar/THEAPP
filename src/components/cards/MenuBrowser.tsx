import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { DIETARY_TAGS, type MenuItem } from '../../data/knowledge';
import type { DiningItem } from '../../domain/types';
import { reviewOrder, useStore } from '../../store/store';
import { useGuestUi } from '../guest/context';
import { SampleBadge } from '../ui/SampleBadge';

export function MenuBrowser({
  initialCategory,
  initialFilter,
  onDone,
}: {
  initialCategory?: string;
  initialFilter?: string;
  onDone: () => void;
}) {
  const { lang, t, guestId } = useGuestUi();
  const menu = useStore((s) => s.settings.knowledge.ird);
  const [cat, setCat] = useState<string>(initialCategory ?? 'all');
  const [filters, setFilters] = useState<string[]>(initialFilter ? [initialFilter] : []);
  const [cart, setCart] = useState<DiningItem[]>([]);
  const [allergies, setAllergies] = useState('');

  const items = useMemo(() => {
    const cats = cat === 'all' ? menu.categories : menu.categories.filter((c) => c.id === cat);
    return cats.flatMap((c) => c.items).filter((i) => filters.every((f) => i.tags.includes(f)));
  }, [menu, cat, filters]);

  const qtyOf = (id: string) => cart.find((c) => c.id === id)?.qty ?? 0;
  const change = (item: MenuItem, delta: number) =>
    setCart((prev) => {
      const ex = prev.find((c) => c.id === item.id);
      if (!ex)
        return delta > 0
          ? [...prev, { id: item.id, name: item.name, qty: 1, modifiers: [] }]
          : prev;
      const qty = ex.qty + delta;
      return qty <= 0
        ? prev.filter((c) => c.id !== item.id)
        : prev.map((c) => (c.id === item.id ? { ...c, qty: Math.min(qty, 20) } : c));
    });
  const toggleMod = (id: string, mod: string) =>
    setCart((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              modifiers: c.modifiers.includes(mod)
                ? c.modifiers.filter((m) => m !== mod)
                : [...c.modifiers, mod],
            }
          : c,
      ),
    );
  const count = cart.reduce((s, c) => s + c.qty, 0);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs text-muted">
          {menu.hours === '24 hours'
            ? lang === 'ar'
              ? 'متاح على مدار الساعة'
              : 'Available 24 hours'
            : menu.hours}
        </p>
        <SampleBadge label={t.sampleContent} />
      </div>
      <div
        className="scrollbar-none -mx-5 mb-3 flex gap-2 overflow-x-auto px-5"
        role="tablist"
        aria-label="Menu categories"
      >
        {[{ id: 'all', name: t.allCategories, nameAr: t.allCategories }, ...menu.categories].map(
          (c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={cat === c.id}
              onClick={() => setCat(c.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${cat === c.id ? 'bg-fg text-bg' : 'bg-raised text-fg'}`}
            >
              {lang === 'ar' ? c.nameAr : c.name}
            </button>
          ),
        )}
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5" aria-label="Dietary filters">
        {DIETARY_TAGS.map((f) => {
          const on = filters.includes(f);
          return (
            <button
              key={f}
              aria-pressed={on}
              onClick={() => setFilters((p) => (on ? p.filter((x) => x !== f) : [...p, f]))}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${on ? 'border-accent bg-accent/10 text-accent' : 'border-line text-muted'}`}
            >
              {t.filters[f]}
            </button>
          );
        })}
      </div>
      <ul className="divide-y divide-line/60">
        {items.length === 0 && (
          <li className="py-8 text-center text-sm text-muted">
            {lang === 'ar' ? 'لا توجد أصناف تطابق هذه الخيارات.' : 'No dishes match these filters.'}
          </li>
        )}
        {items.map((i) => {
          const q = qtyOf(i.id);
          const inCart = cart.find((c) => c.id === i.id);
          return (
            <li key={i.id} className="py-3">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{lang === 'ar' ? i.nameAr : i.name}</p>
                  <p className="text-xs text-muted">
                    {i.tags
                      .map((tag) => t.filters[tag])
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                {q === 0 ? (
                  <button
                    className="btn-ghost min-h-[40px] px-4 py-1"
                    onClick={() => change(i, 1)}
                    aria-label={`${t.addToOrder} ${lang === 'ar' ? i.nameAr : i.name}`}
                  >
                    <Plus size={14} aria-hidden /> {t.addToOrder}
                  </button>
                ) : (
                  <div className="flex items-center gap-1 rounded-full border border-line">
                    <button
                      className="inline-flex h-10 w-10 items-center justify-center"
                      onClick={() => change(i, -1)}
                      aria-label={`Remove one ${i.name}`}
                    >
                      <Minus size={14} aria-hidden />
                    </button>
                    <span className="w-5 text-center text-sm tabular-nums" aria-live="polite">
                      {q}
                    </span>
                    <button
                      className="inline-flex h-10 w-10 items-center justify-center"
                      onClick={() => change(i, 1)}
                      aria-label={`Add one ${i.name}`}
                    >
                      <Plus size={14} aria-hidden />
                    </button>
                  </div>
                )}
              </div>
              <AnimatePresence initial={false}>
                {inCart && i.modifiers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 flex flex-wrap gap-1.5"
                  >
                    {i.modifiers.map((m) => (
                      <button
                        key={m}
                        aria-pressed={inCart.modifiers.includes(m)}
                        onClick={() => toggleMod(i.id, m)}
                        className={`rounded-full border px-3 py-1 text-xs ${inCart.modifiers.includes(m) ? 'border-accent bg-accent/10 text-accent' : 'border-line text-muted'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
      <div className="sticky bottom-0 -mx-5 mt-3 border-t border-line bg-surface px-5 pt-3">
        <label className="label" htmlFor="menu-allergies">
          {t.allergies}
        </label>
        <input
          id="menu-allergies"
          className="field mb-3"
          placeholder={t.allergiesPlaceholder}
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
          maxLength={120}
        />
        <button
          className="btn-primary w-full"
          disabled={!count}
          onClick={() => {
            reviewOrder(guestId, { items: cart, allergies: allergies.trim() || undefined });
            onDone();
          }}
        >
          <ShoppingBag size={16} aria-hidden /> {t.reviewOrder}
          {count ? ` · ${count}` : ''}
        </button>
      </div>
    </div>
  );
}
