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
  date: string; // ISO date string (YYYY-MM-DD) - the actual date of the meal
  mealType: MealType;
  ingredients: Ingredient[];
}

// A favorite meal template (no date, can be reused)
export interface FavoriteMeal {
  id: string;
  name: string;
  mealType: MealType;
  ingredients: Ingredient[];
  createdAt: string;
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
  favorites: FavoriteMeal[];
  lastUpdated: string | null;
  isLoading: boolean;
}

// Context actions
export interface MealPlanActions {
  // Meal actions
  importMeals: (meals: Meal[], replace: boolean) => void;
  addMeal: (meal: Omit<Meal, 'id'>) => void;
  updateMeal: (mealId: string, updates: Partial<Omit<Meal, 'id'>>) => void;
  deleteMeal: (mealId: string) => void;
  clearAllMeals: () => void;
  // Grocery actions
  toggleGroceryItem: (itemId: string) => void;
  clearCheckedItems: () => void;
  uncheckAllItems: () => void;
  // Favorite actions
  addFavorite: (favorite: Omit<FavoriteMeal, 'id' | 'createdAt'>) => void;
  updateFavorite: (favoriteId: string, updates: Partial<Omit<FavoriteMeal, 'id' | 'createdAt'>>) => void;
  removeFavorite: (favoriteId: string) => void;
  addFavoriteToMealPlan: (favoriteId: string, date: string, day: DayOfWeek) => void;
}

// Toast notification type
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  action?: {
    label: string;
    onClick: () => void;
  };
}

// User account
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

// User preferences/settings
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  defaultServings: number;
  weekStartsOn: 'Sunday' | 'Monday';
  notifications: boolean;
}

// Account state
export interface AccountState {
  user: User | null;
  settings: UserSettings;
  isLoggedIn: boolean;
  isLoading: boolean;
  authError: string | null;
}

// Account actions
export interface AccountActions {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'email' | 'avatar'>>) => Promise<void>;
  clearAuthError: () => void;
}

// Chat message (serializable for localStorage)
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  meals?: Meal[];
  timestamp: string; // ISO string for serialization
}

// Chat conversation session
export interface Conversation {
  id: string;
  title: string; // Auto-generated from first message
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// Chat state
export interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
}

// Chat actions
export interface ChatActions {
  createConversation: () => string; // Returns new conversation ID
  deleteConversation: (conversationId: string) => void;
  switchConversation: (conversationId: string) => void;
  clearActiveConversation: () => void; // Reset to new chat state
  addMessage: (message: Omit<ChatMessage, 'id'>) => void;
  getActiveConversation: () => Conversation | null;
}
