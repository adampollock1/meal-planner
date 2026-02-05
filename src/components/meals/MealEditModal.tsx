import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat } from '@phosphor-icons/react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Toggle } from '../ui/Toggle';
import { DatePicker } from '../ui/DatePicker';
import { IngredientEditor } from './IngredientEditor';
import { Meal, FavoriteMeal, MealType, Ingredient, DayOfWeek } from '../../types';
import { getDayOfWeekFromDate, parseISODate, formatISODate } from '../../utils/dateUtils';

interface MealEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MealFormData) => void;
  meal?: Meal | null;
  favorite?: FavoriteMeal | null;
  mode: 'meal' | 'favorite' | 'addFavoriteToMealPlan';
  title?: string;
}

export interface MealFormData {
  name: string;
  mealType: MealType;
  ingredients: Ingredient[];
  date?: string;
  day?: DayOfWeek;
}

const MEAL_TYPE_OPTIONS = [
  { value: 'Breakfast', label: 'Breakfast' },
  { value: 'Lunch', label: 'Lunch' },
  { value: 'Dinner', label: 'Dinner' },
  { value: 'Snack', label: 'Snack' },
];

export function MealEditModal({
  isOpen,
  onClose,
  onSave,
  meal,
  favorite,
  mode,
  title,
}: MealEditModalProps) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState<MealType>('Dinner');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [date, setDate] = useState('');

  // Initialize form with existing data
  useEffect(() => {
    if (meal) {
      setName(meal.name);
      setMealType(meal.mealType);
      setIngredients([...meal.ingredients]);
      setDate(meal.date);
    } else if (favorite) {
      setName(favorite.name);
      setMealType(favorite.mealType);
      setIngredients([...favorite.ingredients]);
      setDate(mode === 'addFavoriteToMealPlan' ? formatISODate(new Date()) : '');
    } else {
      // Reset for new entry
      setName('');
      setMealType('Dinner');
      setIngredients([]);
      setDate(mode === 'meal' || mode === 'addFavoriteToMealPlan' ? formatISODate(new Date()) : '');
    }
  }, [meal, favorite, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    const formData: MealFormData = {
      name: name.trim(),
      mealType,
      ingredients,
    };

    // Only include date for meals (not favorites)
    if (mode === 'meal' || mode === 'addFavoriteToMealPlan') {
      formData.date = date;
      formData.day = getDayOfWeekFromDate(parseISODate(date));
    }

    onSave(formData);
    onClose();
  };

  const getModalTitle = () => {
    if (title) return title;
    if (mode === 'addFavoriteToMealPlan') return 'Add to Meal Plan';
    if (meal) return 'Edit Meal';
    if (favorite) return 'Edit Favorite';
    return mode === 'favorite' ? 'New Favorite' : 'New Meal';
  };

  const isValid = name.trim().length > 0 && 
    (mode === 'favorite' || date.length > 0);

  const footerContent = (
    <form onSubmit={handleSubmit} className={`flex items-center w-full ${mode === 'favorite' ? 'justify-end' : 'justify-between'}`}>
      {/* Chef Alex button - only show for meal modes, not favorites */}
      {mode !== 'favorite' && (
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate('/chat');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all duration-200"
        >
          <ChefHat size={16} weight="duotone" />
          <span className="hidden sm:inline">Make with Chef Alex!</span>
          <span className="sm:hidden">Chef Alex</span>
        </button>
      )}

      {/* Save button */}
      <Button type="submit" size="sm" disabled={!isValid}>
        {mode === 'addFavoriteToMealPlan' ? 'Add' : 'Save'}
      </Button>
    </form>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getModalTitle()} size="lg" footer={footerContent}>
      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Meal Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Grilled Chicken Salad"
            className="w-full px-3 py-2.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-200"
            autoFocus
          />
        </div>

        {/* Meal Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Meal Type
          </label>
          <Toggle
            options={MEAL_TYPE_OPTIONS}
            value={mealType}
            onChange={(v) => setMealType(v as MealType)}
          />
        </div>

        {/* Date (only for meals, not favorites) */}
        {(mode === 'meal' || mode === 'addFavoriteToMealPlan') && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Date
            </label>
            <DatePicker
              selectedDate={date}
              onSelectDate={setDate}
              placeholder="Select a date"
            />
          </div>
        )}

        {/* Ingredients */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Ingredients
          </label>
          <IngredientEditor
            ingredients={ingredients}
            onChange={setIngredients}
          />
        </div>
      </div>
    </Modal>
  );
}
