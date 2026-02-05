import { Plus, Coffee, Sun, Moon, Cookie } from '@phosphor-icons/react';
import { MealType } from '../../types';

interface EmptySlotProps {
  mealType: MealType;
  onClick: () => void;
}

const mealTypeIcons: Record<MealType, React.ElementType> = {
  Breakfast: Coffee,
  Lunch: Sun,
  Dinner: Moon,
  Snack: Cookie,
};

export function EmptySlot({ mealType, onClick }: EmptySlotProps) {
  const Icon = mealTypeIcons[mealType];

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl border-2 border-dashed border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer group"
    >
      <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 bg-slate-100/50 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors">
        <Icon size={12} weight="duotone" />
      </div>
      <Plus 
        size={12} 
        weight="bold" 
        className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors" 
      />
    </button>
  );
}
