import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Toast } from '../types';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: Toast['type'], action?: ToastAction) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const addToast = useCallback((message: string, type: Toast['type'], action?: ToastAction) => {
    const id = Math.random().toString(36).substring(2, 11);
    const toast: Toast = { id, message, type, action };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto-remove after 5 seconds (longer if there's an action)
    const timeout = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      timeoutsRef.current.delete(id);
    }, action ? 6000 : 4000);
    
    timeoutsRef.current.set(id, timeout);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    // Clear any pending timeout
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
