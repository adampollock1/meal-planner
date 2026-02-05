import { useState, useMemo } from 'react';
import { Heart, Plus } from '@phosphor-icons/react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { MealListCard } from './MealListCard';
import { MealEditModal, MealFormData } from './MealEditModal';
import { useMealPlan } from '../../context/MealPlanContext';
import { useToast } from '../../context/ToastContext';
import { FavoriteMeal, MealType } from '../../types';

interface FavoritesByType {
  mealType: MealType;
  favorites: FavoriteMeal[];
}

const MEAL_TYPE_ORDER: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export function FavoritesView() {
  const { favorites, addFavorite, updateFavorite, removeFavorite } = useMealPlan();
  const { addToast } = useToast();
  const [editingFavorite, setEditingFavorite] = useState<FavoriteMeal | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
    if (confirm(`Remove "${favorite.name}" from favorites?`)) {
      removeFavorite(favorite.id);
      addToast(`Removed "${favorite.name}" from favorites`, 'info');
    }
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
      {/* Add button */}
      <div className="flex justify-end">
        <Button onClick={() => setIsAddModalOpen(true)} size="sm">
          <Plus size={16} weight="bold" />
          New Favorite
        </Button>
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
              />
            ))}
          </div>
        </div>
      ))}

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
