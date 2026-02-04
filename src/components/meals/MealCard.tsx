import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Coffee, Sun, Moon, Cookie } from 'lucide-react';
import { Card } from '../ui/Card';
import { Meal, MealType } from '../../types';

interface MealCardProps {
  meal: Meal;
  onDelete?: (mealId: string) => void;
  compact?: boolean;
}

const mealTypeIcons: Record<MealType, React.ElementType> = {
  Breakfast: Coffee,
  Lunch: Sun,
  Dinner: Moon,
  Snack: Cookie,
};

const mealTypeColors: Record<MealType, string> = {
  Breakfast: 'bg-amber-100 text-amber-700',
  Lunch: 'bg-orange-100 text-orange-700',
  Dinner: 'bg-indigo-100 text-indigo-700',
  Snack: 'bg-emerald-100 text-emerald-700',
};

export function MealCard({ meal, onDelete, compact = false }: MealCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = mealTypeIcons[meal.mealType];
  const colorClass = mealTypeColors[meal.mealType];

  if (compact) {
    return (
      <div className="p-3 bg-white rounded-xl border border-slate-100 hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colorClass}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-slate-800 truncate">{meal.name}</span>
        </div>
      </div>
    );
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <div 
        className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900">{meal.name}</h3>
              <p className="text-sm text-slate-500">
                {meal.ingredients.length} ingredient{meal.ingredients.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${colorClass}`}>
              {meal.mealType}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-100 animate-fade-in">
          <div className="p-4 bg-slate-50">
            <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
              Ingredients
            </h4>
            <ul className="space-y-2">
              {meal.ingredients.map(ingredient => (
                <li key={ingredient.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{ingredient.name}</span>
                  <span className="text-slate-500">
                    {ingredient.quantity} {ingredient.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {onDelete && (
            <div className="p-3 border-t border-slate-100 bg-white">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(meal.id);
                }}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Remove meal
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
