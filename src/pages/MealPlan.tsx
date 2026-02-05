import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from '@phosphor-icons/react';
import { WeeklyView } from '../components/meals/WeeklyView';
import { DailyView } from '../components/meals/DailyView';
import { Toggle } from '../components/ui/Toggle';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { CalendarPicker } from '../components/ui/CalendarPicker';
import { useMealPlan } from '../context/MealPlanContext';
import { useToast } from '../context/ToastContext';
import { useAccount } from '../context/AccountContext';
import { DayOfWeek } from '../types';
import { getTodayDayOfWeek, isCurrentWeek } from '../utils/dateUtils';

type ViewMode = 'weekly' | 'daily';

const VIEW_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
];

export function MealPlan() {
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getTodayDayOfWeek());
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  const { meals, deleteMeal } = useMealPlan();
  const { addToast } = useToast();
  const { settings } = useAccount();
  const navigate = useNavigate();
  
  const isThisWeek = isCurrentWeek(settings.weekStartsOn, referenceDate);

  const handleWeekSelect = useCallback((date: Date) => {
    setReferenceDate(date);
  }, []);

  const goToToday = useCallback(() => {
    setReferenceDate(new Date());
    setSelectedDay(getTodayDayOfWeek());
  }, []);

  const handleDeleteMeal = useCallback((mealId: string) => {
    const meal = meals.find(m => m.id === mealId);
    deleteMeal(mealId);
    addToast(`Removed "${meal?.name}"`, 'info');
  }, [meals, deleteMeal, addToast]);

  // Week navigation component
  const WeekNavigator = () => (
    <div className="mt-1">
      <CalendarPicker
        selectedDate={referenceDate}
        onSelectWeek={handleWeekSelect}
        weekStartsOn={settings.weekStartsOn}
      />
      {!isThisWeek && (
        <button
          onClick={goToToday}
          className="mt-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
        >
          ← Back to Today
        </button>
      )}
    </div>
  );

  // Empty state
  if (meals.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Meal Plan</h1>
          <WeekNavigator />
        </div>

        <Card className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-100/80 dark:bg-slate-700/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload size={32} weight="duotone" className="text-slate-400 dark:text-slate-500" />
            </div>
            <h2 className="text-xl font-semibold font-display text-slate-900 dark:text-slate-100 mb-2">No meals yet</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Import a CSV file with your meal plan to get started. You can download a template to see the correct format.
            </p>
            <Button onClick={() => navigate('/import')}>
              <Upload size={16} weight="bold" />
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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Meal Plan</h1>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <WeekNavigator />
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {meals.length} meal{meals.length !== 1 ? 's' : ''} planned
            </span>
          </div>
        </div>
        <Toggle
          options={VIEW_OPTIONS}
          value={viewMode}
          onChange={(v) => setViewMode(v as ViewMode)}
        />
      </div>

      {/* View */}
      {viewMode === 'weekly' ? (
        <WeeklyView meals={meals} onDeleteMeal={handleDeleteMeal} referenceDate={referenceDate} />
      ) : (
        <DailyView
          meals={meals}
          selectedDay={selectedDay}
          onDayChange={setSelectedDay}
          onDeleteMeal={handleDeleteMeal}
          referenceDate={referenceDate}
        />
      )}
    </div>
  );
}
