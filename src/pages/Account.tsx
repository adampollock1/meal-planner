import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignOut, Envelope, Calendar, ChefHat, ShoppingCart, PencilSimple, Check, X, Eye, EyeSlash } from '@phosphor-icons/react';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { UserAvatar } from '../components/account/UserAvatar';
import { useAccount } from '../context/AccountContext';
import { useMealPlan } from '../context/MealPlanContext';
import { useToast } from '../context/ToastContext';

type AuthMode = 'login' | 'signup' | 'forgot-password';

export function Account() {
  const { user, isLoggedIn, isLoading: authLoading, authError, isSupabaseReady, login, signup, logout, resetPassword, updateProfile, clearAuthError } = useAccount();
  const { meals, groceryList } = useMealPlan();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');

  // Auth form state
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Clear errors when switching modes
  useEffect(() => {
    setFormError(null);
    clearAuthError();
  }, [authMode, clearAuthError]);

  // Update edit fields when user changes
  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
    }
  }, [user]);

  const validateForm = (): boolean => {
    setFormError(null);

    if (!email.trim()) {
      setFormError('Email is required');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Please enter a valid email address');
      return false;
    }

    if (authMode === 'forgot-password') {
      return true;
    }

    if (!password) {
      setFormError('Password is required');
      return false;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return false;
    }

    if (authMode === 'signup') {
      if (!name.trim()) {
        setFormError('Name is required');
        return false;
      }

      if (password !== confirmPassword) {
        setFormError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (authMode === 'login') {
        const result = await login(email, password);
        if (result.success) {
          addToast('Welcome back!', 'success');
          resetForm();
        } else {
          setFormError(result.error || 'Login failed');
        }
      } else if (authMode === 'signup') {
        const result = await signup(email, password, name);
        if (result.success) {
          addToast('Account created! Please check your email to verify your account.', 'success');
          resetForm();
        } else {
          setFormError(result.error || 'Signup failed');
        }
      } else if (authMode === 'forgot-password') {
        const result = await resetPassword(email);
        if (result.success) {
          addToast('Password reset email sent! Check your inbox.', 'success');
          setAuthMode('login');
          resetForm();
        } else {
          setFormError(result.error || 'Failed to send reset email');
        }
      }
    } catch {
      setFormError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setFormError(null);
  };

  const handleLogout = async () => {
    await logout();
    addToast('You have been logged out', 'info');
    navigate('/');
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      addToast('Name cannot be empty', 'error');
      return;
    }
    await updateProfile({ name: editName.trim(), email: editEmail.trim() });
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

  // Show loading state during initial auth check
  if (authLoading) {
    return (
      <div className="max-w-md mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show auth form
  if (!isLoggedIn || !user) {
    return (
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center pt-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/30">
            <ChefHat size={40} weight="duotone" className="text-white" />
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 mb-2">
            {authMode === 'login' && 'Welcome Back'}
            {authMode === 'signup' && 'Create Account'}
            {authMode === 'forgot-password' && 'Reset Password'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {authMode === 'login' && 'Sign in to sync your meal plans across devices'}
            {authMode === 'signup' && 'Get started with your personalized meal planning'}
            {authMode === 'forgot-password' && 'Enter your email to receive a reset link'}
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Supabase not configured warning */}
            {!isSupabaseReady && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400">
                <p className="font-medium">Supabase not configured</p>
                <p className="mt-1 text-xs">Please add valid Supabase credentials to your .env file. See SUPABASE_SETUP.md for instructions.</p>
              </div>
            )}

            {/* Error message */}
            {(formError || authError) && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                {formError || authError}
              </div>
            )}

            {/* Name field (signup only) */}
            {authMode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200/50 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
                  placeholder="Your name"
                />
              </div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200/50 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
                placeholder="you@example.com"
              />
            </div>

            {/* Password field (not for forgot-password) */}
            {authMode !== 'forgot-password' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 border border-slate-200/50 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
                    placeholder={authMode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password field (signup only) */}
            {authMode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200/50 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            {/* Forgot password link (login only) */}
            {authMode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setAuthMode('forgot-password')}
                  className="text-sm text-orange-600 dark:text-orange-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {authMode === 'login' && 'Signing in...'}
                  {authMode === 'signup' && 'Creating account...'}
                  {authMode === 'forgot-password' && 'Sending...'}
                </span>
              ) : (
                <>
                  {authMode === 'login' && 'Sign In'}
                  {authMode === 'signup' && 'Create Account'}
                  {authMode === 'forgot-password' && 'Send Reset Link'}
                </>
              )}
            </Button>
          </form>

          {/* Mode switcher */}
          <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 text-center text-sm">
            {authMode === 'login' && (
              <p className="text-slate-500 dark:text-slate-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="text-orange-600 dark:text-orange-400 hover:underline font-medium"
                >
                  Sign up
                </button>
              </p>
            )}
            {authMode === 'signup' && (
              <p className="text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-orange-600 dark:text-orange-400 hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
            {authMode === 'forgot-password' && (
              <p className="text-slate-500 dark:text-slate-400">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-orange-600 dark:text-orange-400 hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
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
