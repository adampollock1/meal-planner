import { NavLink } from 'react-router-dom';
import { Home, Calendar, ShoppingCart, Upload, UtensilsCrossed, Bot } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/meals', icon: Calendar, label: 'Meal Plan' },
  { to: '/chat', icon: Bot, label: 'Chef Alex (AI)' },
  { to: '/grocery', icon: ShoppingCart, label: 'Grocery List' },
  { to: '/import', icon: Upload, label: 'Import CSV' },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-sm">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Meal Planner</h1>
            <p className="text-xs text-slate-500">Plan your week</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
          <p className="text-xs text-slate-600">
            Your data is stored locally in your browser.
          </p>
        </div>
      </div>
    </aside>
  );
}
