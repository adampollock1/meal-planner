import { Meal, GroceryItem, GroceryCategory } from '../types';

// Generate a unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// Normalize ingredient names for comparison
function normalizeIngredientName(name: string): string {
  return name.toLowerCase().trim();
}

// Generate grocery list from meals
export function generateGroceryList(meals: Meal[], existingChecked: Set<string> = new Set()): GroceryItem[] {
  const ingredientMap = new Map<string, GroceryItem>();

  meals.forEach(meal => {
    meal.ingredients.forEach(ingredient => {
      const normalizedName = normalizeIngredientName(ingredient.name);
      const key = `${normalizedName}-${ingredient.unit.toLowerCase()}`;
      
      if (ingredientMap.has(key)) {
        const existing = ingredientMap.get(key)!;
        existing.totalQuantity += ingredient.quantity;
        if (!existing.fromMeals.includes(meal.name)) {
          existing.fromMeals.push(meal.name);
        }
      } else {
        ingredientMap.set(key, {
          id: generateId(),
          name: ingredient.name,
          totalQuantity: ingredient.quantity,
          unit: ingredient.unit,
          category: ingredient.category,
          checked: existingChecked.has(normalizedName),
          fromMeals: [meal.name],
        });
      }
    });
  });

  // Sort by category and then by name
  return Array.from(ingredientMap.values()).sort((a, b) => {
    if (a.category !== b.category) {
      return getCategoryOrder(a.category) - getCategoryOrder(b.category);
    }
    return a.name.localeCompare(b.name);
  });
}

// Get category display order
function getCategoryOrder(category: GroceryCategory): number {
  const order: Record<GroceryCategory, number> = {
    'Produce': 0,
    'Dairy & Eggs': 1,
    'Meat': 2,
    'Seafood': 3,
    'Bakery': 4,
    'Frozen': 5,
    'Pantry': 6,
    'Spices': 7,
    'Beverages': 8,
    'Other': 9,
  };
  return order[category] ?? 9;
}

// Group grocery items by category
export function groupByCategory(items: GroceryItem[]): Map<GroceryCategory, GroceryItem[]> {
  const grouped = new Map<GroceryCategory, GroceryItem[]>();
  
  items.forEach(item => {
    if (!grouped.has(item.category)) {
      grouped.set(item.category, []);
    }
    grouped.get(item.category)!.push(item);
  });

  return grouped;
}

// Format quantity for display
export function formatQuantity(quantity: number): string {
  if (Number.isInteger(quantity)) {
    return quantity.toString();
  }
  // Round to 2 decimal places
  return quantity.toFixed(2).replace(/\.?0+$/, '');
}
