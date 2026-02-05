import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateGroceryList } from '../utils/groceryGenerator';
import { Meal, FavoriteMeal, MealPlanState, MealPlanActions, DayOfWeek } from '../types';
import { useAccount } from './AccountContext';
import { getDayOfWeekFromDate, parseISODate } from '../utils/dateUtils';

interface MealPlanContextType extends MealPlanState, MealPlanActions {}

const MealPlanContext = createContext<MealPlanContextType | null>(null);

const STORAGE_KEY_PREFIX = 'mealplan-data';
const LEGACY_STORAGE_KEY = 'mealplan-data';
const FAVORITES_STORAGE_KEY = 'mealplan-favorites';

interface StoredData {
  meals: Meal[];
  checkedItems: string[];
  lastUpdated: string | null;
}

interface StoredFavorites {
  favorites: FavoriteMeal[];
}

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// Helper to get user-specific storage key
function getStorageKey(userId: string | undefined): string {
  if (userId) {
    return `${STORAGE_KEY_PREFIX}-${userId}`;
  }
  return LEGACY_STORAGE_KEY;
}

export function MealPlanProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn } = useAccount();
  
  // Generate storage key based on user ID for multi-user support
  const storageKey = useMemo(() => getStorageKey(user?.id), [user?.id]);
  
  // Check for legacy data migration when user logs in
  const getInitialData = (): StoredData => {
    const defaultData: StoredData = {
      meals: [],
      checkedItems: [],
      lastUpdated: null,
    };

    // If logged in, check if we need to migrate legacy data
    if (isLoggedIn && user?.id) {
      const userDataKey = getStorageKey(user.id);
      const existingUserData = window.localStorage.getItem(userDataKey);
      
      if (!existingUserData) {
        // Check for legacy data to migrate
        const legacyData = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacyData) {
          try {
            const parsed = JSON.parse(legacyData);
            // Migrate legacy data to user-specific storage
            window.localStorage.setItem(userDataKey, legacyData);
            return parsed;
          } catch {
            return defaultData;
          }
        }
      }
    }

    return defaultData;
  };

  const [data, setData] = useLocalStorage<StoredData>(storageKey, getInitialData());
  
  // Favorites storage (separate from meal plan data)
  const favoritesKey = useMemo(() => 
    user?.id ? `${FAVORITES_STORAGE_KEY}-${user.id}` : FAVORITES_STORAGE_KEY, 
    [user?.id]
  );
  const [favoritesData, setFavoritesData] = useLocalStorage<StoredFavorites>(
    favoritesKey, 
    { favorites: [] }
  );

  // Generate grocery list from meals
  const groceryList = useMemo(() => {
    const checkedSet = new Set(data.checkedItems.map(name => name.toLowerCase()));
    return generateGroceryList(data.meals, checkedSet);
  }, [data.meals, data.checkedItems]);

  // Import meals (replace or append)
  const importMeals = useCallback((newMeals: Meal[], replace: boolean) => {
    setData(prev => ({
      meals: replace ? newMeals : [...prev.meals, ...newMeals],
      checkedItems: replace ? [] : prev.checkedItems,
      lastUpdated: new Date().toISOString(),
    }));
  }, [setData]);

  // Clear all meals
  const clearAllMeals = useCallback(() => {
    setData({
      meals: [],
      checkedItems: [],
      lastUpdated: new Date().toISOString(),
    });
  }, [setData]);

  // Toggle grocery item checked state
  const toggleGroceryItem = useCallback((itemId: string) => {
    const item = groceryList.find(i => i.id === itemId);
    if (!item) return;

    const normalizedName = item.name.toLowerCase();
    
    setData(prev => {
      const isCurrentlyChecked = prev.checkedItems.some(
        name => name.toLowerCase() === normalizedName
      );
      
      return {
        ...prev,
        checkedItems: isCurrentlyChecked
          ? prev.checkedItems.filter(name => name.toLowerCase() !== normalizedName)
          : [...prev.checkedItems, item.name],
        lastUpdated: new Date().toISOString(),
      };
    });
  }, [groceryList, setData]);

  // Clear all checked items from the list
  const clearCheckedItems = useCallback(() => {
    setData(prev => ({
      ...prev,
      checkedItems: [],
      lastUpdated: new Date().toISOString(),
    }));
  }, [setData]);

  // Uncheck all items
  const uncheckAllItems = useCallback(() => {
    setData(prev => ({
      ...prev,
      checkedItems: [],
      lastUpdated: new Date().toISOString(),
    }));
  }, [setData]);

  // Delete a specific meal
  const deleteMeal = useCallback((mealId: string) => {
    setData(prev => ({
      ...prev,
      meals: prev.meals.filter(m => m.id !== mealId),
      lastUpdated: new Date().toISOString(),
    }));
  }, [setData]);

  // Add a single meal
  const addMeal = useCallback((meal: Omit<Meal, 'id'>) => {
    const newMeal: Meal = {
      ...meal,
      id: generateId(),
    };
    setData(prev => ({
      ...prev,
      meals: [...prev.meals, newMeal],
      lastUpdated: new Date().toISOString(),
    }));
  }, [setData]);

  // Update an existing meal
  const updateMeal = useCallback((mealId: string, updates: Partial<Omit<Meal, 'id'>>) => {
    setData(prev => ({
      ...prev,
      meals: prev.meals.map(m => 
        m.id === mealId ? { ...m, ...updates } : m
      ),
      lastUpdated: new Date().toISOString(),
    }));
  }, [setData]);

  // Add a favorite
  const addFavorite = useCallback((favorite: Omit<FavoriteMeal, 'id' | 'createdAt'>) => {
    const newFavorite: FavoriteMeal = {
      ...favorite,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setFavoritesData(prev => ({
      favorites: [...prev.favorites, newFavorite],
    }));
  }, [setFavoritesData]);

  // Update a favorite
  const updateFavorite = useCallback((favoriteId: string, updates: Partial<Omit<FavoriteMeal, 'id' | 'createdAt'>>) => {
    setFavoritesData(prev => ({
      favorites: prev.favorites.map(f => 
        f.id === favoriteId ? { ...f, ...updates } : f
      ),
    }));
  }, [setFavoritesData]);

  // Remove a favorite
  const removeFavorite = useCallback((favoriteId: string) => {
    setFavoritesData(prev => ({
      favorites: prev.favorites.filter(f => f.id !== favoriteId),
    }));
  }, [setFavoritesData]);

  // Add a favorite to the meal plan
  const addFavoriteToMealPlan = useCallback((favoriteId: string, date: string, day: DayOfWeek) => {
    const favorite = favoritesData.favorites.find(f => f.id === favoriteId);
    if (!favorite) return;

    const newMeal: Meal = {
      id: generateId(),
      name: favorite.name,
      mealType: favorite.mealType,
      day,
      date,
      ingredients: favorite.ingredients.map(ing => ({
        ...ing,
        id: generateId(), // Generate new IDs for ingredients
      })),
    };

    setData(prev => ({
      ...prev,
      meals: [...prev.meals, newMeal],
      lastUpdated: new Date().toISOString(),
    }));
  }, [favoritesData.favorites, setData]);

  const value: MealPlanContextType = {
    meals: data.meals,
    groceryList,
    favorites: favoritesData.favorites,
    lastUpdated: data.lastUpdated,
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
