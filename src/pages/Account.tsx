import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignOut, Envelope, Calendar, ChefHat, ShoppingCart, PencilSimple, Check, X } from '@phosphor-icons/react';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { UserAvatar } from '../components/account/UserAvatar';
import { useAccount } from '../context/AccountContext';
import { useMealPlan } from '../context/MealPlanContext';
import { useToast } from '../context/ToastContext';

export function Account() {
  const { user, isLoggedIn, login, logout, updateProfile } = useAccount();
  const { meals, groceryList } = useMealPlan();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      addToast('Please enter email and password', 'error');
      return;
    }

    setIsLoggingIn(true);
    try {
      const success = await login(loginEmail, loginPassword);
      if (success) {
        addToast('Welcome back!', 'success');
        setLoginEmail('');
        setLoginPassword('');
      }
    } catch {
      addToast('Login failed', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    logout();
    addToast('You have been logged out', 'info');
    navigate('/');
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      addToast('Name cannot be empty', 'error');
      return;
    }
    updateProfile({ name: editName.trim(), email: editEmail.trim() });
    setIsEditing(false);
    addToast('Profile updated', 'success');
  };

  const handleCancelEdit = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setIsEditing(false);
  };

  // Calculate stats
  const stats = {
    totalMeals: meals.length,
    totalIngredients: groceryList.length,
    daysPlanned: new Set(meals.map(m => m.day)).size,
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Not logged in - show login form
  if (!isLoggedIn || !user) {
    return (
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center pt-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/30">
            <ChefHat size={40} weight="duotone" className="text-white" />
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 mb-2">Welcome to Meal Planner</h1>
          <p className="text-slate-500 dark:text-slate-400">Sign in to sync your meal plans across devices</p>
        </div>

        <Card>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200/50 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200/50 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
                placeholder="Enter your password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
            This is a demo - any email/password will work
          </p>
        </Card>
      </div>
    );
  }

  // Logged in - show profile
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Account</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Manage your profile and view your activity</p>
      </div>

      {/* Profile Card */}
      <Card>
        <div className="flex items-start gap-4">
          <UserAvatar name={user.name} avatar={user.avatar} size="xl" />
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveProfile}>
                    <Check size={16} weight="bold" />
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                    <X size={16} weight="bold" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">{user.name}</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                    title="Edit profile"
                  >
                    <PencilSimple size={16} weight="duotone" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-1 text-slate-500 dark:text-slate-400">
                  <Envelope size={16} weight="duotone" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-slate-500 dark:text-slate-400">
                  <Calendar size={16} weight="duotone" />
                  <span className="text-sm">Member since {formatDate(user.createdAt)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="w-10 h-10 bg-orange-100/80 dark:bg-orange-900/40 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Calendar size={20} weight="duotone" className="text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">{stats.totalMeals}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Meals Planned</p>
        </Card>
        <Card className="text-center">
          <div className="w-10 h-10 bg-emerald-100/80 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center mx-auto mb-2">
            <ShoppingCart size={20} weight="duotone" className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">{stats.totalIngredients}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Grocery Items</p>
        </Card>
        <Card className="text-center">
          <div className="w-10 h-10 bg-blue-100/80 dark:bg-blue-900/40 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Calendar size={20} weight="duotone" className="text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">{stats.daysPlanned}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Days Planned</p>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardTitle>Account Actions</CardTitle>
        <div className="mt-4 space-y-3">
          <Button variant="outline" onClick={() => navigate('/settings')} className="w-full justify-start">
            Manage Settings
          </Button>
          <Button variant="danger" onClick={handleLogout} className="w-full justify-start">
            <SignOut size={16} weight="duotone" />
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}
