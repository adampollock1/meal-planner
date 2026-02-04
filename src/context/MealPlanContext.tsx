import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateGroceryList } from '../utils/groceryGenerator';
import { Meal, GroceryItem, MealPlanState, MealPlanActions } from '../types';

interface MealPlanContextType extends MealPlanState, MealPlanActions {}

const MealPlanContext = createContext<MealPlanContextType | null>(null);

const STORAGE_KEY = 'mealplan-data';

interface StoredData {
  meals: Meal[];
  checkedItems: string[];
  lastUpdated: string | null;
}

export function MealPlanProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useLocalStorage<StoredData>(STORAGE_KEY, {
    meals: [],
    checkedItems: [],
    lastUpdated: null,
  });

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

  const value: MealPlanContextType = {
    meals: data.meals,
    groceryList,
    lastUpdated: data.lastUpdated,
    importMeals,
    clearAllMeals,
    toggleGroceryItem,
    clearCheckedItems,
    uncheckAllItems,
    deleteMeal,
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
