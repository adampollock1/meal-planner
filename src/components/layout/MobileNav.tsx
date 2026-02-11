import { NavLink } from 'react-router-dom';
import { House, Calendar, ListBullets, ShoppingCart, ChefHat } from '@phosphor-icons/react';
import { useAccount } from '../../context/AccountContext';
import { UserAvatar } from '../account/UserAvatar';

const navItems = [
  { to: '/', icon: House, label: 'Home' },
  { to: '/meals', icon: Calendar, label: 'Plan' },
  { to: '/meal-list', icon: ListBullets, label: 'List' },
  { to: '/chat', icon: ChefHat, label: 'Chef' },
  { to: '/grocery', icon: ShoppingCart, label: 'Grocery' },
];

export function MobileNav() {
  const { user } = useAccount();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 z-40 safe-area-bottom">
      <ul className="flex justify-around items-center h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 active:scale-95'
                }`
              }
            >
              <Icon size={20} weight="duotone" />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          </li>
        ))}
        {/* Account */}
        <li>
          <NavLink
            to="/account"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 active:scale-95'
              }`
            }
          >
            <UserAvatar name={user?.name} avatar={user?.avatar} size="sm" className="w-5 h-5" />
            <span className="text-[10px] font-medium">Account</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
