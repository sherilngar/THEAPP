import { Link } from 'react-router-dom';
import { SiteHeader } from '../components/ui/SiteHeader';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="eyebrow">Page not found</p>
        <h1 className="display text-4xl">This door leads nowhere</h1>
        <p className="text-sm text-muted">The page you're looking for isn't part of the demo.</p>
        <Link to="/" className="btn-primary">
          Back to the start
        </Link>
      </main>
    </>
  );
}
