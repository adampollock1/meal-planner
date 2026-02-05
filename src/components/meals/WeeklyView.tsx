import { MealCard } from './MealCard';
import { Meal, MealType, DayOfWeek } from '../../types';
import { useAccount } from '../../context/AccountContext';
import { getOrderedDays, getWeekDates, formatDayNumber, formatISODate, isToday, isCurrentWeek } from '../../utils/dateUtils';

interface WeeklyViewProps {
  meals: Meal[];
  onDeleteMeal: (mealId: string) => void;
  referenceDate?: Date;
}

const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

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

export function WeeklyView({ meals, onDeleteMeal, referenceDate = new Date() }: WeeklyViewProps) {
  const { settings } = useAccount();
  const orderedDays = getOrderedDays(settings.weekStartsOn);
  const weekDates = getWeekDates(settings.weekStartsOn, referenceDate);
  const isThisWeek = isCurrentWeek(settings.weekStartsOn, referenceDate);

  // Group meals by date and type (using actual dates, with fallback for old meals)
  const mealGrid = weekDates.map((date, index) => {
    const dateStr = formatISODate(date);
    const day = orderedDays[index];
    const dayMeals = meals.filter(m => mealMatchesSlot(m, dateStr, day, isThisWeek));
    return {
      day,
      date,
      meals: MEAL_TYPES.map(type => dayMeals.filter(m => m.mealType === type)),
    };
  });

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="min-w-[800px] px-4 sm:px-0">
        {/* Header */}
        <div className="grid grid-cols-8 gap-2 mb-3">
          <div className="p-2" />
          {orderedDays.map((day, index) => {
            const date = weekDates[index];
            const isTodayDate = isToday(date);
            
            return (
              <div key={day} className="p-2 text-center">
                <span className={`text-sm font-medium ${
                  isTodayDate 
                    ? 'text-orange-600 dark:text-orange-400' 
                    : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {day.slice(0, 3)}
                </span>
                <div className={`mt-1 inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                  isTodayDate
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {formatDayNumber(date)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grid */}
        {MEAL_TYPES.map((type, typeIdx) => (
          <div key={type} className="grid grid-cols-8 gap-2 mb-2">
            <div className="p-2 flex items-center">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {type}
              </span>
            </div>
            {orderedDays.map((day, dayIdx) => {
              const cellMeals = mealGrid[dayIdx].meals[typeIdx];
              const date = weekDates[dayIdx];
              const isTodayDate = isToday(date);
              
              return (
                <div
                  key={`${day}-${type}`}
                  className={`min-h-[80px] rounded-xl border p-2 transition-all duration-200 ${
                    isTodayDate
                      ? 'bg-orange-50/80 dark:bg-orange-900/20 border-orange-200/50 dark:border-orange-800/50 backdrop-blur-sm'
                      : 'bg-white/70 dark:bg-slate-800/70 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm'
                  }`}
                >
                  {cellMeals.length > 0 ? (
                    <div className="space-y-2">
                      {cellMeals.map(meal => (
                        <MealCard
                          key={meal.id}
                          meal={meal}
                          onDelete={onDeleteMeal}
                          compact
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <span className="text-xs text-slate-300 dark:text-slate-600">-</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
