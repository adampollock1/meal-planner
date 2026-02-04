import { NavLink } from 'react-router-dom';
import { Home, Calendar, ShoppingCart, Bot } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/meals', icon: Calendar, label: 'Meals' },
  { to: '/chat', icon: Bot, label: 'Chef AI' },
  { to: '/grocery', icon: ShoppingCart, label: 'Grocery' },
];

export function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 safe-area-bottom">
      <ul className="flex justify-around items-center h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-orange-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
