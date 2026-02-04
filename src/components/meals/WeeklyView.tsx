import { MealCard } from './MealCard';
import { Meal, DayOfWeek, MealType } from '../../types';

interface WeeklyViewProps {
  meals: Meal[];
  onDeleteMeal: (mealId: string) => void;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export function WeeklyView({ meals, onDeleteMeal }: WeeklyViewProps) {
  // Group meals by day and type
  const mealGrid = DAYS.map(day => {
    const dayMeals = meals.filter(m => m.day === day);
    return {
      day,
      meals: MEAL_TYPES.map(type => dayMeals.filter(m => m.mealType === type)),
    };
  });

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="min-w-[800px] px-4 sm:px-0">
        {/* Header */}
        <div className="grid grid-cols-8 gap-2 mb-3">
          <div className="p-2" />
          {DAYS.map(day => (
            <div key={day} className="p-2 text-center">
              <span className="text-sm font-medium text-slate-600">
                {day.slice(0, 3)}
              </span>
            </div>
          ))}
        </div>

        {/* Grid */}
        {MEAL_TYPES.map((type, typeIdx) => (
          <div key={type} className="grid grid-cols-8 gap-2 mb-2">
            <div className="p-2 flex items-center">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {type}
              </span>
            </div>
            {DAYS.map((day, dayIdx) => {
              const cellMeals = mealGrid[dayIdx].meals[typeIdx];
              return (
                <div
                  key={`${day}-${type}`}
                  className="min-h-[80px] bg-white rounded-xl border border-slate-100 p-2"
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
                      <span className="text-xs text-slate-300">-</span>
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
