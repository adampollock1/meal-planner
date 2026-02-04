import { Check } from 'lucide-react';
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
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
        item.checked
          ? 'bg-slate-50 opacity-60'
          : 'bg-white hover:bg-slate-50'
      }`}
    >
      <div
        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
          item.checked
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-slate-300 hover:border-emerald-400'
        }`}
      >
        {item.checked && <Check className="w-4 h-4 text-white" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${item.checked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
          {item.name}
        </p>
        <p className="text-xs text-slate-500 truncate">
          from: {item.fromMeals.slice(0, 2).join(', ')}
          {item.fromMeals.length > 2 && ` +${item.fromMeals.length - 2} more`}
        </p>
      </div>
      
      <div className="text-right">
        <span className={`text-sm font-medium ${item.checked ? 'text-slate-400' : 'text-slate-700'}`}>
          {formatQuantity(item.totalQuantity)} {item.unit}
        </span>
      </div>
    </div>
  );
}
