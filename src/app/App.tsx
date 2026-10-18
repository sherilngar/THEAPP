import { Suspense, lazy, useEffect } from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { startSync, tickEscalations } from '../store/store';
import { createSupabaseTransport, syncEnabled } from '../store/supabaseTransport';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { PageSkeleton } from '../components/ui/PageSkeleton';
import { OfflineBanner } from '../components/ui/OfflineBanner';

const Landing = lazy(() => import('../pages/Landing'));
const Guest = lazy(() => import('../pages/Guest'));
const Staff = lazy(() => import('../pages/Staff'));
const Insights = lazy(() => import('../pages/Insights'));
const Present = lazy(() => import('../pages/Present'));
const Architecture = lazy(() => import('../pages/Architecture'));
const Admin = lazy(() => import('../pages/Admin'));
const NotFound = lazy(() => import('../pages/NotFound'));

function AnimatedRoutes() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <ErrorBoundary>
          <Suspense fallback={<PageSkeleton />}>
            <Routes location={location}>
              <Route path="/" element={<Landing />} />
              <Route path="/guest" element={<Guest />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/present" element={<Present />} />
              <Route path="/architecture" element={<Architecture />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </motion.div>
    </AnimatePresence>
  );
}

export function App() {
  useEffect(() => {
    if (syncEnabled()) void startSync(createSupabaseTransport);
  }, []);
  useEffect(() => {
    const id = window.setInterval(tickEscalations, 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <MotionConfig reducedMotion="user">
      <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <OfflineBanner />
        <AnimatedRoutes />
      </HashRouter>
    </MotionConfig>
  );
}
