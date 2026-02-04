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
    <div className="inline-flex bg-slate-100 rounded-xl p-1">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            value === option.value
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
