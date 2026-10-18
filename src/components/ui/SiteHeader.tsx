import { NavLink, Link } from 'react-router-dom';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { SampleBadge } from './SampleBadge';

const LINKS = [
  { to: '/guest', label: 'Guest app' },
  { to: '/staff', label: 'Staff board' },
  { to: '/insights', label: 'Insights' },
  { to: '/present', label: 'Present' },
  { to: '/architecture', label: 'For IT' },
  { to: '/admin', label: 'Settings' },
];

export function SiteHeader({ wide = false }: { wide?: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line/60 bg-bg/85 backdrop-blur-md safe-top">
      <div
        className={`mx-auto flex h-16 items-center gap-4 px-4 sm:px-6 ${wide ? 'max-w-[1600px]' : 'max-w-6xl'}`}
      >
        <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="Home">
          <Logo className="h-9" />
          <span className="hidden border-s border-line ps-3 text-xs text-muted md:inline">
            AI Concierge
          </span>
        </Link>
        <nav
          aria-label="Main"
          className="scrollbar-none -mx-2 flex flex-1 items-center gap-1 overflow-x-auto px-2"
        >
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-2 text-sm transition-colors ${isActive ? 'bg-fg text-bg' : 'text-muted hover:bg-raised hover:text-fg'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden lg:block">
          <SampleBadge />
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
