import { PencilSimple, Trash, Heart, Plus, Calendar, CheckCircle, Circle } from '@phosphor-icons/react';
import { Meal, FavoriteMeal, MealType } from '../../types';

interface MealListCardProps {
  meal?: Meal;
  favorite?: FavoriteMeal;
  onEdit: () => void;
  onDelete: () => void;
  onAddToFavorites?: () => void;
  onAddToPlan?: () => void;
  showDate?: boolean;
  isFavorited?: boolean;
  // Selection mode props
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

const MEAL_TYPE_STYLES: Record<MealType, { bg: string; text: string; darkBg: string; darkText: string }> = {
  Breakfast: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    darkBg: 'dark:bg-amber-900/30',
    darkText: 'dark:text-amber-400',
  },
  Lunch: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    darkBg: 'dark:bg-orange-900/30',
    darkText: 'dark:text-orange-400',
  },
  Dinner: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    darkBg: 'dark:bg-indigo-900/30',
    darkText: 'dark:text-indigo-400',
  },
  Snack: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    darkBg: 'dark:bg-emerald-900/30',
    darkText: 'dark:text-emerald-400',
  },
};

export function MealListCard({
  meal,
  favorite,
  onEdit,
  onDelete,
  onAddToFavorites,
  onAddToPlan,
  showDate = false,
  isFavorited = false,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect,
}: MealListCardProps) {
  const item = meal || favorite;
  if (!item) return null;

  const mealType = item.mealType;
  const styles = MEAL_TYPE_STYLES[mealType];
  const ingredientCount = item.ingredients.length;

  const handleClick = () => {
    if (isSelectionMode && onToggleSelect) {
      onToggleSelect();
    } else {
      onEdit();
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`group backdrop-blur-sm border rounded-xl p-4 transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-orange-50/80 dark:bg-orange-900/20 border-orange-300/50 dark:border-orange-700/50 shadow-md'
          : 'bg-white/80 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg dark:hover:shadow-slate-900/30 hover:border-slate-300/50 dark:hover:border-slate-600/50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Selection checkbox */}
        {isSelectionMode && (
          <div className="flex-shrink-0 pt-0.5">
            {isSelected ? (
              <CheckCircle size={24} weight="fill" className="text-orange-500 dark:text-orange-400" />
            ) : (
              <Circle size={24} weight="regular" className="text-slate-300 dark:text-slate-600" />
            )}
          </div>
        )}

        {/* Left side - meal info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* Meal type badge */}
            <span className={`px-2 py-0.5 text-xs font-medium rounded-lg ${styles.bg} ${styles.text} ${styles.darkBg} ${styles.darkText}`}>
              {mealType}
            </span>
            
            {/* Date badge for meals */}
            {showDate && meal?.date && (
              <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                <Calendar size={12} weight="duotone" />
                {new Date(meal.date + 'T00:00:00').toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            )}
          </div>
          
          {/* Meal name */}
          <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
            {item.name}
          </h3>
          
          {/* Ingredient count */}
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {ingredientCount} ingredient{ingredientCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Right side - actions (hidden in selection mode) */}
        {!isSelectionMode && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
            {/* Add to plan (for favorites) */}
            {onAddToPlan && (
              <button
                onClick={(e) => { e.stopPropagation(); onAddToPlan(); }}
                className="p-2 rounded-lg text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200 active:scale-95"
                title="Add to meal plan"
              >
                <Plus size={16} weight="bold" />
              </button>
            )}
            
            {/* Add to favorites (for meals) */}
            {onAddToFavorites && (
              <button
                onClick={(e) => { e.stopPropagation(); onAddToFavorites(); }}
                className={`p-2 rounded-lg transition-all duration-200 active:scale-95 ${
                  isFavorited 
                    ? 'text-pink-500 dark:text-pink-400' 
                    : 'text-pink-500 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20'
                }`}
                title={isFavorited ? "Already in favorites" : "Save to favorites"}
                disabled={isFavorited}
              >
                <Heart size={16} weight={isFavorited ? "fill" : "duotone"} />
              </button>
            )}
            
            {/* Edit */}
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 active:scale-95"
              title="Edit"
            >
              <PencilSimple size={16} weight="duotone" />
            </button>
            
            {/* Delete */}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 active:scale-95"
              title="Delete"
            >
              <Trash size={16} weight="duotone" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
