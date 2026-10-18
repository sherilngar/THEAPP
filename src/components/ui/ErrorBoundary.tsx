import { Component, type ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';
import { resetDemo } from '../../store/store';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div
        role="alert"
        className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center"
      >
        <p className="eyebrow">Something went wrong</p>
        <h1 className="display text-3xl">We'll have this right in a moment</h1>
        <p className="text-sm text-muted">
          This screen hit an unexpected problem. Reloading usually fixes it. If it persists, reset
          the demo data.
        </p>
        <div className="flex gap-3">
          <button className="btn-primary" onClick={() => window.location.reload()}>
            <RotateCcw size={16} aria-hidden /> Reload
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              resetDemo();
              window.location.reload();
            }}
          >
            Reset demo data
          </button>
        </div>
      </div>
    );
  }
}
