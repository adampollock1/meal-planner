import { useState } from 'react';
import { ForkKnife, Heart } from '@phosphor-icons/react';
import { Toggle } from '../components/ui/Toggle';
import { MealListView } from '../components/meals/MealListView';
import { FavoritesView } from '../components/meals/FavoritesView';
import { useMealPlan } from '../context/MealPlanContext';

type ViewMode = 'meals' | 'favorites';

const VIEW_OPTIONS = [
  { value: 'meals', label: 'My Meals' },
  { value: 'favorites', label: 'Favorites' },
];

export function MealList() {
  const [viewMode, setViewMode] = useState<ViewMode>('meals');
  const { meals, favorites } = useMealPlan();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            viewMode === 'meals' 
              ? 'bg-orange-100/80 dark:bg-orange-900/30' 
              : 'bg-pink-100/80 dark:bg-pink-900/30'
          }`}>
            {viewMode === 'meals' ? (
              <ForkKnife size={20} weight="duotone" className="text-orange-600 dark:text-orange-400" />
            ) : (
              <Heart size={20} weight="duotone" className="text-pink-500 dark:text-pink-400" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
              Meal List
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {viewMode === 'meals' 
                ? `${meals.length} meal${meals.length !== 1 ? 's' : ''} in your plan`
                : `${favorites.length} saved favorite${favorites.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
        </div>

        <Toggle
          options={VIEW_OPTIONS}
          value={viewMode}
          onChange={(v) => setViewMode(v as ViewMode)}
        />
      </div>

      {/* Content */}
      {viewMode === 'meals' ? <MealListView /> : <FavoritesView />}
    </div>
  );
}
