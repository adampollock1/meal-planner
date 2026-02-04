import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MealCard } from './MealCard';
import { Button } from '../ui/Button';
import { Meal, DayOfWeek, MealType } from '../../types';

interface DailyViewProps {
  meals: Meal[];
  selectedDay: DayOfWeek;
  onDayChange: (day: DayOfWeek) => void;
  onDeleteMeal: (mealId: string) => void;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPE_ORDER: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export function DailyView({ meals, selectedDay, onDayChange, onDeleteMeal }: DailyViewProps) {
  const dayIndex = DAYS.indexOf(selectedDay);
  
  const goToPrevDay = () => {
    const newIndex = dayIndex === 0 ? DAYS.length - 1 : dayIndex - 1;
    onDayChange(DAYS[newIndex]);
  };

  const goToNextDay = () => {
    const newIndex = dayIndex === DAYS.length - 1 ? 0 : dayIndex + 1;
    onDayChange(DAYS[newIndex]);
  };

  const dayMeals = meals.filter(m => m.day === selectedDay);
  
  // Group by meal type
  const mealsByType = MEAL_TYPE_ORDER.reduce((acc, type) => {
    acc[type] = dayMeals.filter(m => m.mealType === type);
    return acc;
  }, {} as Record<MealType, Meal[]>);

  return (
    <div className="space-y-6">
      {/* Day selector */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={goToPrevDay}>
          <ChevronLeft className="w-5 h-5" />
          {DAYS[dayIndex === 0 ? DAYS.length - 1 : dayIndex - 1]}
        </Button>
        
        <h2 className="text-xl font-bold text-slate-900">{selectedDay}</h2>
        
        <Button variant="ghost" size="sm" onClick={goToNextDay}>
          {DAYS[dayIndex === DAYS.length - 1 ? 0 : dayIndex + 1]}
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Day selector pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => onDayChange(day)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              day === selectedDay
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Meals by type */}
      <div className="space-y-6">
        {MEAL_TYPE_ORDER.map(type => (
          <div key={type}>
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
              {type}
            </h3>
            {mealsByType[type].length > 0 ? (
              <div className="space-y-3">
                {mealsByType[type].map(meal => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    onDelete={onDeleteMeal}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 bg-white rounded-xl border border-dashed border-slate-200 text-center">
                <p className="text-sm text-slate-400">No {type.toLowerCase()} planned</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
