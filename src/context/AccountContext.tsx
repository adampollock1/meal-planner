import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, UserSettings, AccountState, AccountActions } from '../types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AccountContextType extends AccountState, AccountActions {
  isSupabaseReady: boolean;
}

const AccountContext = createContext<AccountContextType | null>(null);

// Default settings for new users
const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  defaultServings: 4,
  weekStartsOn: 'Sunday',
  notifications: true,
};

// Convert Supabase user to our User type
function mapSupabaseUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
    avatar: supabaseUser.user_metadata?.avatar,
    createdAt: supabaseUser.created_at,
  };
}

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const isLoggedIn = !!user;

  // Fetch user settings from database
  const fetchSettings = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching settings:', error);
      return DEFAULT_SETTINGS;
    }

    if (data) {
      return {
        theme: data.theme as UserSettings['theme'],
        defaultServings: data.default_servings,
        weekStartsOn: data.week_starts_on as UserSettings['weekStartsOn'],
        notifications: data.notifications,
      };
    }

    return DEFAULT_SETTINGS;
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      // If Supabase isn't configured, just finish loading
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured - running in demo mode');
        setIsLoading(false);
        return;
      }
      
      try {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
          const userSettings = await fetchSettings(session.user.id);
          setSettings(userSettings);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
      
      setIsLoading(false);
    };

    initAuth();

    // Don't set up listener if Supabase isn't configured
    if (!isSupabaseConfigured) {
      return;
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(mapSupabaseUser(session.user));
          const userSettings = await fetchSettings(session.user.id);
          setSettings(userSettings);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSettings(DEFAULT_SETTINGS);
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchSettings]);

  // Login with email and password
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    
    if (!isSupabaseConfigured) {
      const error = 'Supabase is not configured. Please set up your environment variables.';
      setAuthError(error);
      return { success: false, error };
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(mapSupabaseUser(data.user));
        const userSettings = await fetchSettings(data.user.id);
        setSettings(userSettings);
      }

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setAuthError(message);
      return { success: false, error: message };
    }
  }, [fetchSettings]);

  // Sign up with email and password
  const signup = useCallback(async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    
    if (!isSupabaseConfigured) {
      const error = 'Supabase is not configured. Please set up your environment variables.';
      setAuthError(error);
      return { success: false, error };
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(mapSupabaseUser(data.user));
        // Settings will be created automatically by the database trigger
        setSettings(DEFAULT_SETTINGS);
      }

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      setAuthError(message);
      return { success: false, error: message };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
    setUser(null);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Supabase is not configured' };
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Reset failed';
      return { success: false, error: message };
    }
  }, []);

  // Update settings
  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!user) return;

    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    // Convert to database format
    const dbUpdates: Record<string, unknown> = {};
    if (updates.theme !== undefined) dbUpdates.theme = updates.theme;
    if (updates.defaultServings !== undefined) dbUpdates.default_servings = updates.defaultServings;
    if (updates.weekStartsOn !== undefined) dbUpdates.week_starts_on = updates.weekStartsOn;
    if (updates.notifications !== undefined) dbUpdates.notifications = updates.notifications;

    const { error } = await supabase
      .from('user_settings')
      .update(dbUpdates)
      .eq('id', user.id);

    if (error) {
      console.error('Error updating settings:', error);
    }
  }, [user, settings]);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<Pick<User, 'name' | 'email' | 'avatar'>>) => {
    if (!user) return;

    // Update local state immediately
    setUser(prev => prev ? { ...prev, ...updates } : null);

    // Update Supabase user metadata
    const { error } = await supabase.auth.updateUser({
      email: updates.email,
      data: {
        name: updates.name,
        avatar: updates.avatar,
      },
    });

    if (error) {
      console.error('Error updating profile:', error);
      // Revert on error
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(mapSupabaseUser(currentUser));
      }
    }
  }, [user]);

  // Clear auth error
  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value: AccountContextType = {
    user,
    settings,
    isLoggedIn,
    isLoading,
    authError,
    isSupabaseReady: isSupabaseConfigured,
    login,
    signup,
    logout,
    resetPassword,
    updateSettings,
    updateProfile,
    clearAuthError,
  };

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount(): AccountContextType {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}
