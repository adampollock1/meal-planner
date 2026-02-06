interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div 
        className={`${sizeClasses[size]} border-orange-500 border-t-transparent rounded-full animate-spin`} 
      />
      {message && (
        <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm">{message}</p>
      )}
    </div>
  );
}
