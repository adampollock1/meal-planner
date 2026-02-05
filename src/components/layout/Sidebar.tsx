import { NavLink, Link } from 'react-router-dom';
import { House, Calendar, ListBullets, ShoppingCart, Upload, ForkKnife, ChefHat, Gear, SignIn } from '@phosphor-icons/react';
import { useAccount } from '../../context/AccountContext';
import { UserAvatar } from '../account/UserAvatar';

const navItems = [
  { to: '/', icon: House, label: 'Home' },
  { to: '/meals', icon: Calendar, label: 'Meal Plan' },
  { to: '/meal-list', icon: ListBullets, label: 'Meal List' },
  { to: '/chat', icon: ChefHat, label: 'Chef Alex' },
  { to: '/grocery', icon: ShoppingCart, label: 'Grocery List' },
  { to: '/import', icon: Upload, label: 'Import CSV' },
];

export function Sidebar() {
  const { user, isLoggedIn } = useAccount();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 h-screen fixed left-0 top-0">
      {/* Logo */}
      <Link to="/" className="block p-6 border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all duration-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <ForkKnife size={20} weight="duotone" className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-display text-slate-900 dark:text-slate-100">Meal Planner</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Plan your week</p>
          </div>
        </div>
      </Link>

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
                      ? 'bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                  }`
                }
              >
                <Icon size={20} weight="duotone" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Account & Settings Footer */}
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between gap-2">
          {/* Account Section (Left - Larger) */}
          <Link
            to="/account"
            className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-200 group min-w-0"
          >
            <UserAvatar name={user?.name} avatar={user?.avatar} size="sm" />
            {isLoggedIn && user ? (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user.email}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                <SignIn size={16} weight="duotone" />
                Sign In
              </div>
            )}
          </Link>

          {/* Settings Icon (Right - Smaller) */}
          <Link
            to="/settings"
            className="p-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-200 flex-shrink-0"
            title="Settings"
          >
            <Gear size={20} weight="duotone" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
