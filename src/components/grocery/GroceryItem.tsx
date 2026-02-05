import { Check } from '@phosphor-icons/react';
import { GroceryItem as GroceryItemType } from '../../types';
import { formatQuantity } from '../../utils/groceryGenerator';

interface GroceryItemProps {
  item: GroceryItemType;
  onToggle: () => void;
}

export function GroceryItem({ item, onToggle }: GroceryItemProps) {
  return (
    <div
      onClick={onToggle}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
        item.checked
          ? 'bg-slate-50/50 dark:bg-slate-700/30 opacity-70'
          : 'bg-white/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 backdrop-blur-sm'
      }`}
    >
      <div
        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
          item.checked
            ? 'bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-500/30'
            : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400 dark:hover:border-emerald-500'
        }`}
      >
        {item.checked && (
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path className="animate-check-draw" d="M5 12l5 5L19 7" />
          </svg>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={`font-medium transition-all duration-200 ${item.checked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
          {item.name}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          from: {item.fromMeals.slice(0, 2).join(', ')}
          {item.fromMeals.length > 2 && ` +${item.fromMeals.length - 2} more`}
        </p>
      </div>
      
      <div className="text-right">
        <span className={`text-sm font-medium transition-all duration-200 ${item.checked ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>
          {formatQuantity(item.totalQuantity)} {item.unit}
        </span>
      </div>
    </div>
  );
}
