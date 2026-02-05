import { useState } from 'react';
import { CaretDown, CaretUp, Trash, PencilSimple, Coffee, Sun, Moon, Cookie } from '@phosphor-icons/react';
import { Card } from '../ui/Card';
import { Meal, MealType } from '../../types';

interface MealCardProps {
  meal: Meal;
  onDelete?: (mealId: string) => void;
  onEdit?: (meal: Meal) => void;
  compact?: boolean;
  defaultExpanded?: boolean;
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

export function MealCard({ meal, onDelete, onEdit, compact = false, defaultExpanded = false }: MealCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const Icon = mealTypeIcons[meal.mealType];
  const colorClass = mealTypeColors[meal.mealType];

  if (compact) {
    return (
      <div className="p-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colorClass}`}>
            <Icon size={16} weight="duotone" />
          </div>
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{meal.name}</span>
        </div>
      </div>
    );
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <div 
        className="p-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-all duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
              <Icon size={20} weight="duotone" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900 dark:text-slate-100">{meal.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {meal.ingredients.length} ingredient{meal.ingredients.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colorClass}`}>
              {meal.mealType}
            </span>
            {isExpanded ? (
              <CaretUp size={20} weight="bold" className="text-slate-400 dark:text-slate-500" />
            ) : (
              <CaretDown size={20} weight="bold" className="text-slate-400 dark:text-slate-500" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-200/50 dark:border-slate-700/50 animate-fade-in">
          <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50">
            <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              Ingredients
            </h4>
            <ul className="space-y-2">
              {meal.ingredients.map(ingredient => (
                <li key={ingredient.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-300">{ingredient.name}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {ingredient.quantity} {ingredient.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {(onEdit || onDelete) && (
            <div className="p-3 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 flex items-center justify-between">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(meal);
                  }}
                  className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200 active:scale-95"
                >
                  <PencilSimple size={16} weight="duotone" />
                  Edit meal
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(meal.id);
                  }}
                  className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 active:scale-95"
                >
                  <Trash size={16} weight="duotone" />
                  Remove meal
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
