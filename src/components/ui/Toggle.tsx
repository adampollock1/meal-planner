interface ToggleOption {
  value: string;
  label: string;
}

interface ToggleProps {
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
}

export function Toggle({ options, value, onChange }: ToggleProps) {
  return (
    <div className="inline-flex bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-1 border border-slate-200/50 dark:border-slate-700/50">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            value === option.value
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200/50 dark:border-slate-600/50'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
