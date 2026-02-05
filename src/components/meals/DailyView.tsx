import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { MealCard } from './MealCard';
import { Button } from '../ui/Button';
import { Meal, DayOfWeek, MealType } from '../../types';
import { useAccount } from '../../context/AccountContext';
import { getOrderedDays, getWeekDates, formatDayNumber, formatFullDate, formatISODate, isToday, isCurrentWeek } from '../../utils/dateUtils';

interface DailyViewProps {
  meals: Meal[];
  selectedDay: DayOfWeek;
  onDayChange: (day: DayOfWeek) => void;
  onDeleteMeal: (mealId: string) => void;
  onEditMeal?: (meal: Meal) => void;
  referenceDate?: Date;
  expandedMealId?: string | null;
}

const MEAL_TYPE_ORDER: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

// Helper to check if a meal belongs to a specific date/day
function mealMatchesSlot(meal: Meal, dateStr: string, day: DayOfWeek, isThisWeek: boolean): boolean {
  // If meal has a valid date, match by date
  if (meal.date && /^\d{4}-\d{2}-\d{2}$/.test(meal.date)) {
    return meal.date === dateStr;
  }
  // Fallback for old meals without dates: match by day name (only for current week)
  if (isThisWeek && meal.day === day) {
    return true;
  }
  return false;
}

export function DailyView({ meals, selectedDay, onDayChange, onDeleteMeal, onEditMeal, referenceDate = new Date(), expandedMealId }: DailyViewProps) {
  const { settings } = useAccount();
  const orderedDays = getOrderedDays(settings.weekStartsOn);
  const weekDates = getWeekDates(settings.weekStartsOn, referenceDate);
  const isThisWeek = isCurrentWeek(settings.weekStartsOn, referenceDate);
  
  const dayIndex = orderedDays.indexOf(selectedDay);
  const selectedDate = weekDates[dayIndex];
  const selectedDateStr = formatISODate(selectedDate);
  const isTodaySelected = isToday(selectedDate);
  
  const goToPrevDay = () => {
    const newIndex = dayIndex === 0 ? orderedDays.length - 1 : dayIndex - 1;
    onDayChange(orderedDays[newIndex]);
  };

  const goToNextDay = () => {
    const newIndex = dayIndex === orderedDays.length - 1 ? 0 : dayIndex + 1;
    onDayChange(orderedDays[newIndex]);
  };

  // Filter meals by actual date, with fallback for old meals without dates
  const dayMeals = meals.filter(m => mealMatchesSlot(m, selectedDateStr, selectedDay, isThisWeek));
  
  // Group by meal type
  const mealsByType = MEAL_TYPE_ORDER.reduce((acc, type) => {
    acc[type] = dayMeals.filter(m => m.mealType === type);
    return acc;
  }, {} as Record<MealType, Meal[]>);

  return (
    <div className="space-y-6">
      {/* Day selector */}
      <div className="flex items-center">
        <div className="flex-1 flex justify-start">
          <Button variant="ghost" size="sm" onClick={goToPrevDay}>
            <CaretLeft size={20} weight="bold" />
            <span className="hidden sm:inline">{orderedDays[dayIndex === 0 ? orderedDays.length - 1 : dayIndex - 1]}</span>
          </Button>
        </div>
        
        <div className="text-center flex-shrink-0">
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">
            {selectedDay}
          </h2>
          {isTodaySelected && (
            <p className="text-xs font-medium text-orange-500 dark:text-orange-400 uppercase">Today</p>
          )}
          <p className="text-sm text-slate-500 dark:text-slate-400">{formatFullDate(selectedDate)}</p>
        </div>
        
        <div className="flex-1 flex justify-end">
          <Button variant="ghost" size="sm" onClick={goToNextDay}>
            <span className="hidden sm:inline">{orderedDays[dayIndex === orderedDays.length - 1 ? 0 : dayIndex + 1]}</span>
            <CaretRight size={20} weight="bold" />
          </Button>
        </div>
      </div>

      {/* Day selector pills */}
      <div className="flex justify-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {orderedDays.map((day, index) => {
          const date = weekDates[index];
          const isTodayDate = isToday(date);
          const isSelected = day === selectedDay;
          
          return (
            <button
              key={day}
              onClick={() => onDayChange(day)}
              className={`flex flex-col items-center px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                isSelected
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : isTodayDate
                    ? 'bg-orange-100/80 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/50 backdrop-blur-sm'
                    : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700/50'
              }`}
            >
              <span>{day.slice(0, 3)}</span>
              <span className={`text-xs ${isSelected ? 'text-orange-100' : 'text-slate-400 dark:text-slate-500'}`}>
                {formatDayNumber(date)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Meals by type */}
      <div className="space-y-6">
        {MEAL_TYPE_ORDER.map(type => (
          <div key={type}>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              {type}
            </h3>
            {mealsByType[type].length > 0 ? (
              <div className="space-y-3">
                {mealsByType[type].map(meal => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    onDelete={onDeleteMeal}
                    onEdit={onEditMeal}
                    defaultExpanded={meal.id === expandedMealId}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border border-dashed border-slate-200/50 dark:border-slate-700/50 text-center">
                <p className="text-sm text-slate-400 dark:text-slate-500">No {type.toLowerCase()} planned</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
