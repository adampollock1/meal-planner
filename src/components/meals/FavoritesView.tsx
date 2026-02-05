import { useState, useMemo } from 'react';
import { Heart, Plus, CalendarPlus, X, Check } from '@phosphor-icons/react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { DatePicker } from '../ui/DatePicker';
import { MealListCard } from './MealListCard';
import { MealEditModal, MealFormData } from './MealEditModal';
import { useMealPlan } from '../../context/MealPlanContext';
import { useToast } from '../../context/ToastContext';
import { FavoriteMeal, MealType } from '../../types';
import { getDayOfWeekFromDate, parseISODate, formatISODate } from '../../utils/dateUtils';

interface FavoritesByType {
  mealType: MealType;
  favorites: FavoriteMeal[];
}

const MEAL_TYPE_ORDER: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export function FavoritesView() {
  const { favorites, addFavorite, updateFavorite, removeFavorite, addFavoriteToMealPlan } = useMealPlan();
  const { addToast } = useToast();
  const [editingFavorite, setEditingFavorite] = useState<FavoriteMeal | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Selection mode state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(formatISODate(new Date()));

  // Group favorites by meal type
  const favoritesByType = useMemo((): FavoritesByType[] => {
    const groups: Record<MealType, FavoriteMeal[]> = {
      Breakfast: [],
      Lunch: [],
      Dinner: [],
      Snack: [],
    };
    
    favorites.forEach(fav => {
      groups[fav.mealType].push(fav);
    });

    return MEAL_TYPE_ORDER
      .filter(type => groups[type].length > 0)
      .map(type => ({
        mealType: type,
        favorites: groups[type].sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [favorites]);

  const handleEdit = (favorite: FavoriteMeal) => {
    if (isSelectionMode) return; // Don't open edit in selection mode
    setEditingFavorite(favorite);
  };

  const handleSaveEdit = (data: MealFormData) => {
    if (editingFavorite) {
      updateFavorite(editingFavorite.id, {
        name: data.name,
        mealType: data.mealType,
        ingredients: data.ingredients,
      });
      addToast(`Updated "${data.name}"`, 'success');
    }
    setEditingFavorite(null);
  };

  const handleAddFavorite = (data: MealFormData) => {
    addFavorite({
      name: data.name,
      mealType: data.mealType,
      ingredients: data.ingredients,
    });
    addToast(`Added "${data.name}" to favorites`, 'success');
    setIsAddModalOpen(false);
  };

  const handleDelete = (favorite: FavoriteMeal) => {
    if (isSelectionMode) return; // Don't delete in selection mode
    if (confirm(`Remove "${favorite.name}" from favorites?`)) {
      removeFavorite(favorite.id);
      addToast(`Removed "${favorite.name}" from favorites`, 'info');
    }
  };

  // Selection mode handlers
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
    setShowDatePicker(false);
    setSelectedDate(formatISODate(new Date()));
  };

  const handleAddSelectedToMealPlan = () => {
    const day = getDayOfWeekFromDate(parseISODate(selectedDate));
    selectedIds.forEach(id => {
      addFavoriteToMealPlan(id, selectedDate, day);
    });
    addToast(`Added ${selectedIds.size} meal${selectedIds.size !== 1 ? 's' : ''} to plan!`, 'success');
    exitSelectionMode();
  };

  // Empty state
  if (favorites.length === 0) {
    return (
      <Card className="text-center py-12">
        <div className="w-16 h-16 bg-pink-100/80 dark:bg-pink-900/30 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Heart size={32} weight="duotone" className="text-pink-500 dark:text-pink-400" />
        </div>
        <h3 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100 mb-2">
          No favorites yet
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
          Save your favorite meals to quickly add them to your meal plan anytime.
        </p>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} weight="bold" />
          Create Favorite
        </Button>

        <MealEditModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddFavorite}
          mode="favorite"
          title="Create Favorite Meal"
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header buttons */}
      <div className="flex items-center justify-between">
        {isSelectionMode ? (
          <>
            <button
              onClick={exitSelectionMode}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200"
            >
              <X size={16} weight="bold" />
              Cancel
            </button>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Select favorites to add to meal plan
            </span>
          </>
        ) : (
          <>
            <div /> {/* Spacer */}
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setIsSelectionMode(true)} 
                size="sm" 
                variant="secondary"
              >
                <CalendarPlus size={16} weight="bold" />
                Add to Meal Plan
              </Button>
              <Button onClick={() => setIsAddModalOpen(true)} size="sm">
                <Plus size={16} weight="bold" />
                New Favorite
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Favorites grouped by meal type */}
      {favoritesByType.map(({ mealType, favorites: typeFavorites }) => (
        <div key={mealType}>
          {/* Meal type header */}
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {mealType}
            </h3>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {typeFavorites.length} favorite{typeFavorites.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Favorites for this type */}
          <div className="space-y-2">
            {typeFavorites.map(favorite => (
              <MealListCard
                key={favorite.id}
                favorite={favorite}
                onEdit={() => handleEdit(favorite)}
                onDelete={() => handleDelete(favorite)}
                isSelectionMode={isSelectionMode}
                isSelected={selectedIds.has(favorite.id)}
                onToggleSelect={() => toggleSelection(favorite.id)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Floating action bar when items are selected */}
      {isSelectionMode && selectedIds.size > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
          <div className="flex items-center gap-4 px-5 py-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                <Check size={16} weight="bold" className="text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {selectedIds.size} selected
              </span>
            </div>
            <Button onClick={() => setShowDatePicker(true)} size="sm">
              <CalendarPlus size={16} weight="bold" />
              Choose Date
            </Button>
          </div>
        </div>
      )}

      {/* Date picker modal */}
      <Modal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        title="Add to Meal Plan"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            Adding {selectedIds.size} meal{selectedIds.size !== 1 ? 's' : ''} to your meal plan
          </p>
          
          {/* Inline calendar - always visible */}
          <DatePicker
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            inline
          />
          
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowDatePicker(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSelectedToMealPlan}>
              Add to Plan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <MealEditModal
        isOpen={!!editingFavorite}
        onClose={() => setEditingFavorite(null)}
        onSave={handleSaveEdit}
        favorite={editingFavorite}
        mode="favorite"
      />

      {/* Add Modal */}
      <MealEditModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddFavorite}
        mode="favorite"
        title="Create Favorite Meal"
      />
    </div>
  );
}
