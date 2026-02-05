import { useState } from 'react';
import { DayColumn } from './DayColumn';
import { MealDetailModal } from './MealDetailModal';
import { Meal, MealType, DayOfWeek } from '../../types';
import { useAccount } from '../../context/AccountContext';
import {
  getOrderedDays,
  getWeekDates,
  formatDayNumber,
  formatISODate,
  isToday,
  isCurrentWeek,
} from '../../utils/dateUtils';

interface WeeklyViewProps {
  meals: Meal[];
  onDeleteMeal: (mealId: string) => void;
  onEditMeal?: (meal: Meal) => void;
  onAddMeal?: (date: string, mealType: MealType) => void;
  referenceDate?: Date;
}

// Helper to check if a meal belongs to a specific date/day
function mealMatchesDate(
  meal: Meal,
  dateStr: string,
  day: DayOfWeek,
  isThisWeek: boolean
): boolean {
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

export function WeeklyView({
  meals,
  onDeleteMeal,
  onEditMeal,
  onAddMeal,
  referenceDate = new Date(),
}: WeeklyViewProps) {
  const { settings } = useAccount();
  const orderedDays = getOrderedDays(settings.weekStartsOn);
  const weekDates = getWeekDates(settings.weekStartsOn, referenceDate);
  const isThisWeek = isCurrentWeek(settings.weekStartsOn, referenceDate);

  // State for the meal detail modal
  const [viewingMeal, setViewingMeal] = useState<Meal | null>(null);

  // Build data for each day column
  const dayColumns = weekDates.map((date, index) => {
    const dateStr = formatISODate(date);
    const day = orderedDays[index];
    const dayMeals = meals.filter((m) =>
      mealMatchesDate(m, dateStr, day, isThisWeek)
    );

    return {
      date,
      dayName: day.slice(0, 3),
      dayNumber: parseInt(formatDayNumber(date), 10),
      meals: dayMeals,
      isToday: isToday(date),
    };
  });

  const handleMealClick = (meal: Meal) => {
    setViewingMeal(meal);
  };

  const handleEmptySlotClick = (date: string, mealType: MealType) => {
    if (onAddMeal) {
      onAddMeal(date, mealType);
    }
  };

  const handleEditFromModal = (meal: Meal) => {
    if (onEditMeal) {
      onEditMeal(meal);
    }
  };

  const handleDeleteFromModal = (mealId: string) => {
    onDeleteMeal(mealId);
  };

  return (
    <>
      {/* Responsive grid: 7 columns on desktop, fewer on smaller screens */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {dayColumns.map((col) => (
          <DayColumn
            key={col.date.toISOString()}
            date={col.date}
            dayName={col.dayName}
            dayNumber={col.dayNumber}
            meals={col.meals}
            isToday={col.isToday}
            onMealClick={handleMealClick}
            onEmptySlotClick={handleEmptySlotClick}
          />
        ))}
      </div>

      {/* Meal Detail Modal */}
      <MealDetailModal
        meal={viewingMeal}
        isOpen={!!viewingMeal}
        onClose={() => setViewingMeal(null)}
        onEdit={handleEditFromModal}
        onDelete={handleDeleteFromModal}
      />
    </>
  );
}
