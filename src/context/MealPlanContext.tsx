import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { generateGroceryList } from '../utils/groceryGenerator';
import { Meal, FavoriteMeal, MealPlanState, MealPlanActions, DayOfWeek, Ingredient } from '../types';
import { useAccount } from './AccountContext';

interface MealPlanContextType extends MealPlanState, MealPlanActions {}

const MealPlanContext = createContext<MealPlanContextType | null>(null);

// Generate unique ID
function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11);
}

export function MealPlanProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn } = useAccount();
  
  const [meals, setMeals] = useState<Meal[]>([]);
  const [favorites, setFavorites] = useState<FavoriteMeal[]>([]);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Generate grocery list from meals
  const groceryList = useMemo(() => {
    return generateGroceryList(meals, checkedItems);
  }, [meals, checkedItems]);

  // Fetch meals from Supabase
  const fetchMeals = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching meals:', error);
        return;
      }

      if (data) {
        const mappedMeals: Meal[] = data.map(row => ({
          id: row.id,
          name: row.name,
          day: row.day as DayOfWeek,
          date: row.date,
          mealType: row.meal_type,
          ingredients: (row.ingredients as Ingredient[]) || [],
        }));
        setMeals(mappedMeals);
      }
    } catch (err) {
      console.error('Error fetching meals:', err);
    }
  }, [user?.id]);

  // Fetch favorites from Supabase
  const fetchFavorites = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching favorites:', error);
        return;
      }

      if (data) {
        const mappedFavorites: FavoriteMeal[] = data.map(row => ({
          id: row.id,
          name: row.name,
          mealType: row.meal_type,
          ingredients: (row.ingredients as Ingredient[]) || [],
          createdAt: row.created_at,
        }));
        setFavorites(mappedFavorites);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  }, [user?.id]);

  // Load data when user logs in
  useEffect(() => {
    if (isLoggedIn && user?.id) {
      setIsLoading(true);
      Promise.all([fetchMeals(), fetchFavorites()])
        .finally(() => setIsLoading(false));
    } else {
      // Clear data on logout
      setMeals([]);
      setFavorites([]);
      setCheckedItems(new Set());
      setIsLoading(false);
    }
  }, [isLoggedIn, user?.id, fetchMeals, fetchFavorites]);

  // Import meals (replace or append)
  const importMeals = useCallback(async (newMeals: Meal[], replace: boolean) => {
    if (!user?.id) return;

    if (replace) {
      // Delete all existing meals first
      await supabase
        .from('meals')
        .delete()
        .eq('user_id', user.id);
      
      setCheckedItems(new Set());
    }

    // Insert new meals
    const mealsToInsert = newMeals.map(meal => ({
      id: meal.id || generateId(),
      user_id: user.id,
      name: meal.name,
      meal_type: meal.mealType,
      day: meal.day,
      date: meal.date,
      ingredients: meal.ingredients,
    }));

    const { error } = await supabase
      .from('meals')
      .insert(mealsToInsert);

    if (error) {
      console.error('Error importing meals:', error);
      return;
    }

    // Refresh meals
    await fetchMeals();
    setLastUpdated(new Date().toISOString());
  }, [user?.id, fetchMeals]);

  // Clear all meals
  const clearAllMeals = useCallback(async () => {
    if (!user?.id) return;

    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing meals:', error);
      return;
    }

    setMeals([]);
    setCheckedItems(new Set());
    setLastUpdated(new Date().toISOString());
  }, [user?.id]);

  // Add a single meal
  const addMeal = useCallback(async (meal: Omit<Meal, 'id'>) => {
    if (!user?.id) return;

    const newMeal = {
      id: generateId(),
      user_id: user.id,
      name: meal.name,
      meal_type: meal.mealType,
      day: meal.day,
      date: meal.date,
      ingredients: meal.ingredients,
    };

    const { error } = await supabase
      .from('meals')
      .insert(newMeal);

    if (error) {
      console.error('Error adding meal:', error);
      return;
    }

    // Optimistically update local state
    const localMeal: Meal = {
      id: newMeal.id,
      name: meal.name,
      mealType: meal.mealType,
      day: meal.day,
      date: meal.date,
      ingredients: meal.ingredients,
    };
    setMeals(prev => [...prev, localMeal]);
    setLastUpdated(new Date().toISOString());
  }, [user?.id]);

  // Update an existing meal
  const updateMeal = useCallback(async (mealId: string, updates: Partial<Omit<Meal, 'id'>>) => {
    if (!user?.id) return;

    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.mealType !== undefined) dbUpdates.meal_type = updates.mealType;
    if (updates.day !== undefined) dbUpdates.day = updates.day;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.ingredients !== undefined) dbUpdates.ingredients = updates.ingredients;

    const { error } = await supabase
      .from('meals')
      .update(dbUpdates)
      .eq('id', mealId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating meal:', error);
      return;
    }

    // Optimistically update local state
    setMeals(prev => prev.map(m => 
      m.id === mealId ? { ...m, ...updates } : m
    ));
    setLastUpdated(new Date().toISOString());
  }, [user?.id]);

  // Delete a specific meal
  const deleteMeal = useCallback(async (mealId: string) => {
    if (!user?.id) return;

    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', mealId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting meal:', error);
      return;
    }

    // Optimistically update local state
    setMeals(prev => prev.filter(m => m.id !== mealId));
    setLastUpdated(new Date().toISOString());
  }, [user?.id]);

  // Toggle grocery item checked state (local only - ephemeral)
  const toggleGroceryItem = useCallback((itemId: string) => {
    const item = groceryList.find(i => i.id === itemId);
    if (!item) return;

    const normalizedName = item.name.toLowerCase();
    
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(normalizedName)) {
        next.delete(normalizedName);
      } else {
        next.add(normalizedName);
      }
      return next;
    });
  }, [groceryList]);

  // Clear all checked items
  const clearCheckedItems = useCallback(() => {
    setCheckedItems(new Set());
  }, []);

  // Uncheck all items
  const uncheckAllItems = useCallback(() => {
    setCheckedItems(new Set());
  }, []);

  // Add a favorite
  const addFavorite = useCallback(async (favorite: Omit<FavoriteMeal, 'id' | 'createdAt'>) => {
    if (!user?.id) return;

    const newFavorite = {
      id: generateId(),
      user_id: user.id,
      name: favorite.name,
      meal_type: favorite.mealType,
      ingredients: favorite.ingredients,
    };

    const { error } = await supabase
      .from('favorites')
      .insert(newFavorite);

    if (error) {
      console.error('Error adding favorite:', error);
      return;
    }

    // Optimistically update local state
    const localFavorite: FavoriteMeal = {
      id: newFavorite.id,
      name: favorite.name,
      mealType: favorite.mealType,
      ingredients: favorite.ingredients,
      createdAt: new Date().toISOString(),
    };
    setFavorites(prev => [localFavorite, ...prev]);
  }, [user?.id]);

  // Update a favorite
  const updateFavorite = useCallback(async (favoriteId: string, updates: Partial<Omit<FavoriteMeal, 'id' | 'createdAt'>>) => {
    if (!user?.id) return;

    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.mealType !== undefined) dbUpdates.meal_type = updates.mealType;
    if (updates.ingredients !== undefined) dbUpdates.ingredients = updates.ingredients;

    const { error } = await supabase
      .from('favorites')
      .update(dbUpdates)
      .eq('id', favoriteId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating favorite:', error);
      return;
    }

    // Optimistically update local state
    setFavorites(prev => prev.map(f => 
      f.id === favoriteId ? { ...f, ...updates } : f
    ));
  }, [user?.id]);

  // Remove a favorite
  const removeFavorite = useCallback(async (favoriteId: string) => {
    if (!user?.id) return;

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', favoriteId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error removing favorite:', error);
      return;
    }

    // Optimistically update local state
    setFavorites(prev => prev.filter(f => f.id !== favoriteId));
  }, [user?.id]);

  // Add a favorite to the meal plan
  const addFavoriteToMealPlan = useCallback(async (favoriteId: string, date: string, day: DayOfWeek) => {
    const favorite = favorites.find(f => f.id === favoriteId);
    if (!favorite || !user?.id) return;

    const newMeal: Omit<Meal, 'id'> = {
      name: favorite.name,
      mealType: favorite.mealType,
      day,
      date,
      ingredients: favorite.ingredients.map(ing => ({
        ...ing,
        id: generateId(),
      })),
    };

    await addMeal(newMeal);
  }, [favorites, user?.id, addMeal]);

  const value: MealPlanContextType = {
    meals,
    groceryList,
    favorites,
    lastUpdated,
    isLoading,
    // Meal actions
    importMeals,
    addMeal,
    updateMeal,
    deleteMeal,
    clearAllMeals,
    // Grocery actions
    toggleGroceryItem,
    clearCheckedItems,
    uncheckAllItems,
    // Favorite actions
    addFavorite,
    updateFavorite,
    removeFavorite,
    addFavoriteToMealPlan,
  };

  return (
    <MealPlanContext.Provider value={value}>
      {children}
    </MealPlanContext.Provider>
  );
}

export function useMealPlan(): MealPlanContextType {
  const context = useContext(MealPlanContext);
  if (!context) {
    throw new Error('useMealPlan must be used within a MealPlanProvider');
  }
  return context;
}
