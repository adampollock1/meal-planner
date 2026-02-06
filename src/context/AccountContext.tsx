import React, { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { User, UserSettings, AccountState, AccountActions } from '../types';

interface AccountContextType extends AccountState, AccountActions {}

const AccountContext = createContext<AccountContextType | null>(null);

const ACCOUNT_STORAGE_KEY = 'mealplan-account';

// Mock user for demonstration
const MOCK_USER: User = {
  id: 'user-1',
  email: 'alex@mealplanner.com',
  name: 'Alex Johnson',
  avatar: undefined,
  createdAt: '2024-01-15T10:00:00Z',
};

// Default settings
const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  defaultServings: 4,
  weekStartsOn: 'Sunday',
  notifications: true,
};

interface StoredAccountData {
  user: User | null;
  settings: UserSettings;
  isLoggedIn: boolean;
}

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useLocalStorage<StoredAccountData>(ACCOUNT_STORAGE_KEY, {
    user: MOCK_USER, // Start logged in with mock user for demo
    settings: DEFAULT_SETTINGS,
    isLoggedIn: true,
  });

  // Mock login - accepts any credentials for demo
  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For demo, create a user based on email
    const user: User = {
      id: 'user-' + Date.now(),
      email,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      avatar: undefined,
      createdAt: new Date().toISOString(),
    };

    setData(prev => ({
      ...prev,
      user,
      isLoggedIn: true,
    }));

    return true;
  }, [setData]);

  // Logout
  const logout = useCallback(() => {
    setData(prev => ({
      ...prev,
      user: null,
      isLoggedIn: false,
    }));
  }, [setData]);

  // Update settings
  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...updates,
      },
    }));
  }, [setData]);

  // Update profile
  const updateProfile = useCallback((updates: Partial<Pick<User, 'name' | 'email' | 'avatar'>>) => {
    setData(prev => {
      if (!prev.user) return prev;
      return {
        ...prev,
        user: {
          ...prev.user,
          ...updates,
        },
      };
    });
  }, [setData]);

  const value: AccountContextType = {
    user: data.user,
    settings: data.settings,
    isLoggedIn: data.isLoggedIn,
    login,
    logout,
    updateSettings,
    updateProfile,
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
