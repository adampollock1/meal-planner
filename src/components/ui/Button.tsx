import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';
  
  const variantStyles = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500/50 shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 dark:bg-orange-500 dark:hover:bg-orange-400',
    secondary: 'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500/50 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 dark:bg-emerald-500 dark:hover:bg-emerald-400',
    outline: 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 focus:ring-slate-500/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm',
    ghost: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 focus:ring-slate-500/50',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/50 shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 dark:bg-red-500 dark:hover:bg-red-400',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
