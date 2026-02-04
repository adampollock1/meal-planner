import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { ToastContainer } from '../ui/Toast';

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pb-20 lg:pb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
