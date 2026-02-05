import { Coffee, Sun, Moon, Cookie, PencilSimple, Trash, Calendar } from '@phosphor-icons/react';
import { Modal, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Meal, MealType } from '../../types';
import { parseISODate } from '../../utils/dateUtils';

interface MealDetailModalProps {
  meal: Meal | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (meal: Meal) => void;
  onDelete: (mealId: string) => void;
}

const mealTypeIcons: Record<MealType, React.ElementType> = {
  Breakfast: Coffee,
  Lunch: Sun,
  Dinner: Moon,
  Snack: Cookie,
};

const mealTypeColors: Record<MealType, string> = {
  Breakfast: 'bg-amber-100/80 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
  Lunch: 'bg-orange-100/80 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400',
  Dinner: 'bg-indigo-100/80 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400',
  Snack: 'bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
};

export function MealDetailModal({
  meal,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: MealDetailModalProps) {
  if (!meal) return null;

  const Icon = mealTypeIcons[meal.mealType];
  const colorClass = mealTypeColors[meal.mealType];

  const handleEdit = () => {
    onEdit(meal);
    onClose();
  };

  const handleDelete = () => {
    onDelete(meal.id);
    onClose();
  };

  // Format the date nicely
  const formatDate = (dateStr: string) => {
    const date = parseISODate(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={meal.name} size="md">
      <div className="space-y-5">
        {/* Meal Type Badge and Date */}
        <div className="flex flex-wrap items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${colorClass}`}>
            <Icon size={16} weight="duotone" />
            <span className="text-sm font-medium">{meal.mealType}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <Calendar size={16} weight="duotone" />
            <span>{formatDate(meal.date)}</span>
          </div>
        </div>

        {/* Ingredients Section */}
        <div>
          <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
            Ingredients ({meal.ingredients.length})
          </h4>
          {meal.ingredients.length > 0 ? (
            <ul className="space-y-2">
              {meal.ingredients.map((ingredient) => (
                <li
                  key={ingredient.id}
                  className="flex items-center justify-between p-3 bg-slate-50/80 dark:bg-slate-700/50 rounded-xl"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {ingredient.name}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {ingredient.quantity} {ingredient.unit}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500 italic">
              No ingredients added yet
            </p>
          )}
        </div>

        {/* Actions */}
        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={handleDelete}
            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash size={16} weight="duotone" />
            Delete
          </Button>
          <Button type="button" onClick={handleEdit}>
            <PencilSimple size={16} weight="duotone" />
            Edit Meal
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
