import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Upload, ArrowCounterClockwise } from '@phosphor-icons/react';
import { WeeklyView } from '../components/meals/WeeklyView';
import { DailyView } from '../components/meals/DailyView';
import { MealEditModal, MealFormData } from '../components/meals/MealEditModal';
import { Toggle } from '../components/ui/Toggle';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { CalendarPicker } from '../components/ui/CalendarPicker';
import { useMealPlan } from '../context/MealPlanContext';
import { useToast } from '../context/ToastContext';
import { useAccount } from '../context/AccountContext';
import { DayOfWeek, Meal } from '../types';
import { getTodayDayOfWeek, isCurrentWeek, parseISODate, getDayOfWeekFromDate } from '../utils/dateUtils';

type ViewMode = 'weekly' | 'daily';

const VIEW_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
];

export function MealPlan() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getTodayDayOfWeek());
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [deletedMeal, setDeletedMeal] = useState<Meal | null>(null);
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { meals, deleteMeal, addMeal, updateMeal } = useMealPlan();
  const { addToast } = useToast();
  const { settings } = useAccount();
  const navigate = useNavigate();
  
  const isThisWeek = isCurrentWeek(settings.weekStartsOn, referenceDate);

  // Handle meal ID from URL - switch to correct day and expand the meal
  useEffect(() => {
    const mealId = searchParams.get('meal');
    if (mealId) {
      const meal = meals.find(m => m.id === mealId);
      if (meal) {
        // Set to daily view for better visibility
        setViewMode('daily');
        
        // Switch to the correct day based on meal's date
        if (meal.date) {
          const mealDate = parseISODate(meal.date);
          const mealDay = getDayOfWeekFromDate(mealDate);
          setSelectedDay(mealDay);
          setReferenceDate(mealDate);
        } else {
          setSelectedDay(meal.day);
        }
        
        // Set the expanded meal ID
        setExpandedMealId(mealId);
        
        // Clear the URL parameter after processing
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, meals, setSearchParams]);

  // Auto-hide undo button after 8 seconds
  useEffect(() => {
    if (deletedMeal) {
      // Clear any existing timeout
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
      // Set new timeout
      undoTimeoutRef.current = setTimeout(() => {
        setDeletedMeal(null);
      }, 8000);
    }
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    };
  }, [deletedMeal]);

  const handleWeekSelect = useCallback((date: Date) => {
    setReferenceDate(date);
  }, []);

  const goToToday = useCallback(() => {
    setReferenceDate(new Date());
    setSelectedDay(getTodayDayOfWeek());
  }, []);

  const handleDeleteMeal = useCallback((mealId: string) => {
    const meal = meals.find(m => m.id === mealId);
    if (!meal) return;
    
    // Store the deleted meal for potential undo
    setDeletedMeal(meal);
    deleteMeal(mealId);
    addToast(`Removed "${meal.name}"`, 'info');
  }, [meals, deleteMeal, addToast]);

  const handleUndo = useCallback(() => {
    if (deletedMeal) {
      const { id, ...mealData } = deletedMeal;
      addMeal(mealData);
      addToast(`Restored "${deletedMeal.name}"`, 'success');
      setDeletedMeal(null);
    }
  }, [deletedMeal, addMeal, addToast]);

  const handleEditMeal = useCallback((meal: Meal) => {
    setEditingMeal(meal);
  }, []);

  const handleSaveEdit = useCallback((data: MealFormData) => {
    if (editingMeal) {
      updateMeal(editingMeal.id, {
        name: data.name,
        mealType: data.mealType,
        ingredients: data.ingredients,
        date: data.date,
        day: data.day,
      });
      addToast(`Updated "${data.name}"`, 'success');
    }
    setEditingMeal(null);
  }, [editingMeal, updateMeal, addToast]);

  // Week navigation component
  const WeekNavigator = () => (
    <div className="mt-1 flex items-center gap-2">
      <CalendarPicker
        selectedDate={referenceDate}
        onSelectWeek={handleWeekSelect}
        weekStartsOn={settings.weekStartsOn}
      />
      <button
        onClick={goToToday}
        className={`text-xs font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-all duration-200 ${
          isThisWeek ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        ← Back to Today
      </button>
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
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Meal Plan</h1>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {meals.length} meal{meals.length !== 1 ? 's' : ''} planned
            </span>
          </div>
          <div className="mt-2">
            <WeekNavigator />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {deletedMeal && (
            <button
              onClick={handleUndo}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-100/80 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 rounded-xl transition-all duration-200 active:scale-95 animate-fade-in"
            >
              <ArrowCounterClockwise size={16} weight="bold" />
              Undo
            </button>
          )}
          <Toggle
            options={VIEW_OPTIONS}
            value={viewMode}
            onChange={(v) => setViewMode(v as ViewMode)}
          />
        </div>
      </div>

      {/* View */}
      {viewMode === 'weekly' ? (
        <WeeklyView 
          meals={meals} 
          onDeleteMeal={handleDeleteMeal} 
          onEditMeal={handleEditMeal}
          referenceDate={referenceDate} 
        />
      ) : (
        <DailyView
          meals={meals}
          selectedDay={selectedDay}
          onDayChange={setSelectedDay}
          onDeleteMeal={handleDeleteMeal}
          onEditMeal={handleEditMeal}
          referenceDate={referenceDate}
          expandedMealId={expandedMealId}
        />
      )}

      {/* Edit Modal */}
      <MealEditModal
        isOpen={!!editingMeal}
        onClose={() => setEditingMeal(null)}
        onSave={handleSaveEdit}
        meal={editingMeal}
        mode="meal"
      />
    </div>
  );
}
