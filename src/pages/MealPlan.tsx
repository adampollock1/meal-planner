import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Trash2 } from 'lucide-react';
import { WeeklyView } from '../components/meals/WeeklyView';
import { DailyView } from '../components/meals/DailyView';
import { Toggle } from '../components/ui/Toggle';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useMealPlan } from '../context/MealPlanContext';
import { useToast } from '../context/ToastContext';
import { DayOfWeek } from '../types';

type ViewMode = 'weekly' | 'daily';

const VIEW_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
];

// Get current day of week
function getCurrentDay(): DayOfWeek {
  const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date().getDay();
  // Adjust since our week starts on Monday
  return days[today] === 'Sunday' ? 'Monday' : days[today];
}

export function MealPlan() {
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getCurrentDay());
  const { meals, deleteMeal, clearAllMeals } = useMealPlan();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleDeleteMeal = useCallback((mealId: string) => {
    const meal = meals.find(m => m.id === mealId);
    deleteMeal(mealId);
    addToast(`Removed "${meal?.name}"`, 'info');
  }, [meals, deleteMeal, addToast]);

  const handleClearAll = useCallback(() => {
    if (confirm('Are you sure you want to remove all meals? This cannot be undone.')) {
      clearAllMeals();
      addToast('All meals cleared', 'info');
    }
  }, [clearAllMeals, addToast]);

  // Empty state
  if (meals.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meal Plan</h1>
          <p className="mt-1 text-slate-500">View and manage your weekly meals</p>
        </div>

        <Card className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No meals yet</h2>
            <p className="text-slate-500 mb-6">
              Import a CSV file with your meal plan to get started. You can download a template to see the correct format.
            </p>
            <Button onClick={() => navigate('/import')}>
              <Upload className="w-4 h-4" />
              Import Meals
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meal Plan</h1>
          <p className="mt-1 text-slate-500">
            {meals.length} meal{meals.length !== 1 ? 's' : ''} planned
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Toggle
            options={VIEW_OPTIONS}
            value={viewMode}
            onChange={(v) => setViewMode(v as ViewMode)}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-slate-500 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* View */}
      {viewMode === 'weekly' ? (
        <WeeklyView meals={meals} onDeleteMeal={handleDeleteMeal} />
      ) : (
        <DailyView
          meals={meals}
          selectedDay={selectedDay}
          onDayChange={setSelectedDay}
          onDeleteMeal={handleDeleteMeal}
        />
      )}
    </div>
  );
}
