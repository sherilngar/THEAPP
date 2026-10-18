import { useEffect, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { KeyRound } from 'lucide-react';
import { SiteHeader } from '../components/ui/SiteHeader';
import { StaffBoard } from '../components/staff/StaffBoard';
import { DEPT_ICON } from '../components/ui/icons';
import { DEPARTMENTS, DEPT_BY_ID } from '../domain/departments';
import type { DepartmentId, StaffSession } from '../domain/types';

const KEY = 'so-staff-session';
/** Demo-only PIN. Real deployment uses the hotel's single sign-on. */
const DEMO_PIN = '1234';

function loadSession(): StaffSession | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StaffSession) : null;
  } catch {
    return null;
  }
}

export default function Staff() {
  const [session, setSession] = useState<StaffSession | null>(loadSession);
  useEffect(() => {
    document.title = 'Staff board · SO/ AI Concierge';
  }, []);
  const signIn = (s: StaffSession) => {
    setSession(s);
    try {
      sessionStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* ignore */
    }
  };
  const signOut = () => {
    setSession(null);
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  };
  return (
    <>
      <SiteHeader wide />
      {session ? <StaffBoard session={session} onSignOut={signOut} /> : <Login onSignIn={signIn} />}
    </>
  );
}

function Login({ onSignIn }: { onSignIn: (s: StaffSession) => void }) {
  const [dept, setDept] = useState<DepartmentId>('dutymanager');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (pin !== DEMO_PIN) {
      setError('That PIN is not right. Demo accounts use 1234.');
      return;
    }
    onSignIn({ department: dept, name: DEPT_BY_ID[dept].staff });
  };
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="eyebrow mb-3">Staff board</p>
      <h1 className="display mb-2 text-4xl">Sign in to your department</h1>
      <p className="mb-8 text-sm text-muted">Demo accounts: choose a department and use PIN 1234. Every department can switch tabs to see the whole hotel.</p>
      <form onSubmit={submit} className="card p-5 sm:p-6">
        <fieldset>
          <legend className="label mb-3">Department</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {DEPARTMENTS.map((d, i) => {
              const Icon = DEPT_ICON[d.id];
              const on = dept === d.id;
              return (
                <motion.label
                  key={d.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`flex min-h-[56px] cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${on ? 'border-accent bg-accent/10' : 'border-line hover:bg-raised'}`}
                >
                  <input type="radio" name="dept" value={d.id} checked={on} onChange={() => setDept(d.id)} className="sr-only" />
                  <Icon size={16} className="shrink-0 text-accent" aria-hidden />
                  <span>
                    <span className="block font-medium leading-tight">{d.short}</span>
                    <span className="text-xs text-muted">{d.staff}</span>
                  </span>
                </motion.label>
              );
            })}
          </div>
        </fieldset>
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <div className="w-40">
            <label className="label" htmlFor="pin">
              PIN
            </label>
            <input
              id="pin"
              className="field tracking-[0.4em]"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ''));
                setError('');
              }}
              aria-invalid={!!error}
              aria-describedby={error ? 'pin-error' : undefined}
            />
          </div>
          <button type="submit" className="btn-primary">
            <KeyRound size={16} aria-hidden /> Sign in as {DEPT_BY_ID[dept].staff}
          </button>
        </div>
        {error && (
          <p id="pin-error" role="alert" className="mt-3 text-sm text-st-escalated">
            {error}
          </p>
        )}
      </form>
    </main>
  );
}
