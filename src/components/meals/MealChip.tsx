import { Coffee, Sun, Moon, Cookie } from '@phosphor-icons/react';
import { Meal, MealType } from '../../types';

interface MealChipProps {
  meal: Meal;
  onClick: () => void;
}

const mealTypeIcons: Record<MealType, React.ElementType> = {
  Breakfast: Coffee,
  Lunch: Sun,
  Dinner: Moon,
  Snack: Cookie,
};

const mealTypeColors: Record<MealType, string> = {
  Breakfast: 'bg-amber-100/80 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
  Lunch: 'bg-orange-100/80 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400',
  Dinner: 'bg-indigo-100/80 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400',
  Snack: 'bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
};

export function MealChip({ meal, onClick }: MealChipProps) {
  const Icon = mealTypeIcons[meal.mealType];
  const colorClass = mealTypeColors[meal.mealType];

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-2.5 py-2 bg-white/80 dark:bg-slate-700/60 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-600/50 hover:shadow-md hover:border-slate-300/50 dark:hover:border-slate-500/50 transition-all duration-200 cursor-pointer group text-left"
    >
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Icon size={14} weight="duotone" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate block">
          {meal.name}
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          {meal.ingredients.length} ingredient{meal.ingredients.length !== 1 ? 's' : ''}
        </span>
      </div>
    </button>
  );
}
