import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { ToastContainer } from '../ui/Toast';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: 'easeIn' as const,
    },
  },
};

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pb-20 lg:pb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
