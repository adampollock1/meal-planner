// Days of the week
export type DayOfWeek = 
  | 'Monday' 
  | 'Tuesday' 
  | 'Wednesday' 
  | 'Thursday' 
  | 'Friday' 
  | 'Saturday' 
  | 'Sunday';

// Meal types
export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

// Grocery categories
export type GroceryCategory = 
  | 'Produce' 
  | 'Dairy & Eggs' 
  | 'Meat' 
  | 'Seafood'
  | 'Pantry' 
  | 'Frozen' 
  | 'Bakery' 
  | 'Spices' 
  | 'Beverages'
  | 'Other';

// Ingredient as imported from CSV
export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: GroceryCategory;
}

// A meal contains multiple ingredients
export interface Meal {
  id: string;
  name: string;
  day: DayOfWeek;
  mealType: MealType;
  ingredients: Ingredient[];
}

// Grocery item (aggregated from ingredients)
export interface GroceryItem {
  id: string;
  name: string;
  totalQuantity: number;
  unit: string;
  category: GroceryCategory;
  checked: boolean;
  // Track which meals this ingredient comes from
  fromMeals: string[];
}

// Grouped grocery list by category
export interface GroceryListByCategory {
  category: GroceryCategory;
  items: GroceryItem[];
}

// CSV row structure
export interface CSVRow {
  meal_name: string;
  day: string;
  meal_type: string;
  ingredient: string;
  quantity: string;
  unit: string;
  category: string;
}

// Validation error for CSV import
export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

// Import result
export interface ImportResult {
  success: boolean;
  meals: Meal[];
  errors: ValidationError[];
  warnings: string[];
}

// App state
export interface MealPlanState {
  meals: Meal[];
  groceryList: GroceryItem[];
  lastUpdated: string | null;
}

// Context actions
export interface MealPlanActions {
  importMeals: (meals: Meal[], replace: boolean) => void;
  clearAllMeals: () => void;
  toggleGroceryItem: (itemId: string) => void;
  clearCheckedItems: () => void;
  uncheckAllItems: () => void;
  deleteMeal: (mealId: string) => void;
}

// Toast notification type
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
