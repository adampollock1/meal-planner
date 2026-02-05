import { X, CheckCircle, WarningCircle, Info, Warning } from '@phosphor-icons/react';
import { useToast } from '../../context/ToastContext';
import { Toast as ToastType } from '../../types';

const icons = {
  success: CheckCircle,
  error: WarningCircle,
  info: Info,
  warning: Warning,
};

const styles = {
  success: 'bg-emerald-50/90 dark:bg-emerald-900/60 border-emerald-200/50 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-100',
  error: 'bg-red-50/90 dark:bg-red-900/60 border-red-200/50 dark:border-red-700/50 text-red-800 dark:text-red-100',
  info: 'bg-blue-50/90 dark:bg-blue-900/60 border-blue-200/50 dark:border-blue-700/50 text-blue-800 dark:text-blue-100',
  warning: 'bg-amber-50/90 dark:bg-amber-900/60 border-amber-200/50 dark:border-amber-700/50 text-amber-800 dark:text-amber-100',
};

const iconStyles = {
  success: 'text-emerald-500 dark:text-emerald-400',
  error: 'text-red-500 dark:text-red-400',
  info: 'text-blue-500 dark:text-blue-400',
  warning: 'text-amber-500 dark:text-amber-400',
};

function ToastItem({ toast }: { toast: ToastType }) {
  const { removeToast } = useToast();
  const Icon = icons[toast.type];

  const handleAction = () => {
    if (toast.action) {
      toast.action.onClick();
      removeToast(toast.id);
    }
  };

  return (
    <div 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-lg dark:shadow-slate-900/50 animate-slide-in ${styles[toast.type]}`}
      role="alert"
    >
      <Icon size={20} weight="duotone" className={`flex-shrink-0 ${iconStyles[toast.type]}`} />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      {toast.action && (
        <button
          onClick={handleAction}
          className="px-3 py-1 text-sm font-semibold rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200 active:scale-95"
        >
          {toast.action.label}
        </button>
      )}
      <button
        onClick={() => removeToast(toast.id)}
        className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200 active:scale-95"
      >
        <X size={16} weight="bold" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm lg:bottom-6 lg:right-6 max-lg:bottom-20">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
