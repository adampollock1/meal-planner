import { useState, useMemo } from 'react';
import { CalendarDots, Plus } from '@phosphor-icons/react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { MealListCard } from './MealListCard';
import { MealEditModal, MealFormData } from './MealEditModal';
import { useMealPlan } from '../../context/MealPlanContext';
import { useToast } from '../../context/ToastContext';
import { Meal } from '../../types';
import { parseISODate, formatFullDate } from '../../utils/dateUtils';

interface MealsByDate {
  date: string;
  formattedDate: string;
  meals: Meal[];
}

export function MealListView() {
  const { meals, favorites, updateMeal, deleteMeal, addMeal, addFavorite } = useMealPlan();
  const { addToast } = useToast();
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Check if a meal is already in favorites (by name and mealType)
  const isMealFavorited = (meal: Meal): boolean => {
    return favorites.some(
      fav => fav.name.toLowerCase() === meal.name.toLowerCase() && fav.mealType === meal.mealType
    );
  };

  // Group meals by date (most recent first)
  const mealsByDate = useMemo((): MealsByDate[] => {
    const groups: Record<string, Meal[]> = {};
    
    meals.forEach(meal => {
      const dateKey = meal.date || 'no-date';
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(meal);
    });

    // Sort dates ascending (earliest first)
    const sortedDates = Object.keys(groups).sort((a, b) => {
      if (a === 'no-date') return 1;
      if (b === 'no-date') return -1;
      return a.localeCompare(b);
    });

    return sortedDates.map(date => ({
      date,
      formattedDate: date === 'no-date' 
        ? 'No Date' 
        : formatFullDate(parseISODate(date)),
      meals: groups[date].sort((a, b) => {
        const order = { Breakfast: 0, Lunch: 1, Dinner: 2, Snack: 3 };
        return order[a.mealType] - order[b.mealType];
      }),
    }));
  }, [meals]);

  const handleEdit = (meal: Meal) => {
    setEditingMeal(meal);
  };

  const handleSaveEdit = (data: MealFormData) => {
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
  };

  const handleAddMeal = (data: MealFormData) => {
    addMeal({
      name: data.name,
      mealType: data.mealType,
      ingredients: data.ingredients,
      date: data.date!,
      day: data.day!,
    });
    addToast(`Added "${data.name}" to meal plan`, 'success');
    setIsAddModalOpen(false);
  };

  const handleDelete = (meal: Meal) => {
    if (confirm(`Delete "${meal.name}"?`)) {
      deleteMeal(meal.id);
      addToast(`Removed "${meal.name}"`, 'info');
    }
  };

  const handleAddToFavorites = (meal: Meal) => {
    addFavorite({
      name: meal.name,
      mealType: meal.mealType,
      ingredients: meal.ingredients,
    });
    addToast(`Added "${meal.name}" to favorites`, 'success');
  };

  // Empty state
  if (meals.length === 0) {
    return (
      <Card className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100/80 dark:bg-slate-700/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CalendarDots size={32} weight="duotone" className="text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100 mb-2">
          No meals planned
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
          Start by adding a meal to your plan or ask Chef Alex to help you create one.
        </p>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} weight="bold" />
          Add Meal
        </Button>

        <MealEditModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddMeal}
          mode="meal"
          title="Add New Meal"
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add button */}
      <div className="flex justify-end">
        <Button onClick={() => setIsAddModalOpen(true)} size="sm">
          <Plus size={16} weight="bold" />
          Add Meal
        </Button>
      </div>

      {/* Meals grouped by date */}
      {mealsByDate.map(({ date, formattedDate, meals: dateMeals }) => (
        <div key={date}>
          {/* Date header */}
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {formattedDate}
            </h3>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {dateMeals.length} meal{dateMeals.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Meals for this date */}
          <div className="space-y-2">
            {dateMeals.map(meal => (
              <MealListCard
                key={meal.id}
                meal={meal}
                onEdit={() => handleEdit(meal)}
                onDelete={() => handleDelete(meal)}
                onAddToFavorites={() => handleAddToFavorites(meal)}
                isFavorited={isMealFavorited(meal)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Edit Modal */}
      <MealEditModal
        isOpen={!!editingMeal}
        onClose={() => setEditingMeal(null)}
        onSave={handleSaveEdit}
        meal={editingMeal}
        mode="meal"
      />

      {/* Add Modal */}
      <MealEditModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddMeal}
        mode="meal"
        title="Add New Meal"
      />
    </div>
  );
}
