import { MealChip } from './MealChip';
import { EmptySlot } from './EmptySlot';
import { Meal, MealType } from '../../types';
import { formatISODate } from '../../utils/dateUtils';

interface DayColumnProps {
  date: Date;
  dayName: string;
  dayNumber: number;
  meals: Meal[];
  isToday: boolean;
  onMealClick: (meal: Meal) => void;
  onEmptySlotClick: (date: string, mealType: MealType) => void;
}

const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const mealTypeLabels: Record<MealType, string> = {
  Breakfast: 'Breakfast',
  Lunch: 'Lunch',
  Dinner: 'Dinner',
  Snack: 'Snack',
};

export function DayColumn({
  date,
  dayName,
  dayNumber,
  meals,
  isToday,
  onMealClick,
  onEmptySlotClick,
}: DayColumnProps) {
  const dateStr = formatISODate(date);

  // Group meals by type for quick lookup
  const mealsByType = MEAL_TYPES.reduce((acc, type) => {
    acc[type] = meals.filter((m) => m.mealType === type);
    return acc;
  }, {} as Record<MealType, Meal[]>);

  return (
    <div
      className={`flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden ${
        isToday
          ? 'bg-white/90 dark:bg-slate-800/90 border-orange-200/50 dark:border-orange-800/50 shadow-md'
          : 'bg-white/70 dark:bg-slate-800/70 border-slate-200/50 dark:border-slate-700/50'
      } backdrop-blur-sm`}
    >
      {/* Day Header */}
      <div
        className={`px-3 py-3 text-center border-b ${
          isToday
            ? 'bg-orange-50/50 dark:bg-orange-900/20 border-orange-200/30 dark:border-orange-800/30'
            : 'bg-slate-50/50 dark:bg-slate-700/30 border-slate-200/30 dark:border-slate-700/30'
        }`}
      >
        <span
          className={`text-xs font-semibold uppercase tracking-wide ${
            isToday
              ? 'text-orange-600 dark:text-orange-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {dayName}
        </span>
        <div
          className={`mt-1 w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-bold ${
            isToday
              ? 'bg-orange-500 text-white'
              : 'text-slate-700 dark:text-slate-300'
          }`}
        >
          {dayNumber}
        </div>
        {isToday && (
          <span className="mt-1 inline-block px-2 py-0.5 text-[10px] font-medium bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-full">
            Today
          </span>
        )}
      </div>

      {/* Meal Slots */}
      <div className="flex-1 p-2 space-y-2">
        {MEAL_TYPES.map((type) => {
          const mealsOfType = mealsByType[type];

          return (
            <div key={type} className="space-y-1">
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide px-1">
                {mealTypeLabels[type]}
              </span>
              {mealsOfType.length === 0 ? (
                <EmptySlot
                  mealType={type}
                  onClick={() => onEmptySlotClick(dateStr, type)}
                />
              ) : (
                <div className="space-y-1">
                  {mealsOfType.map((meal) => (
                    <MealChip
                      key={meal.id}
                      meal={meal}
                      onClick={() => onMealClick(meal)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
