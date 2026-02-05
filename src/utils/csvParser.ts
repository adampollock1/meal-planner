import { Meal, Ingredient, DayOfWeek, MealType, GroceryCategory, ImportResult, ValidationError } from '../types';
import { getDateForDayInWeek, formatISODate } from './dateUtils';

const VALID_DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const VALID_MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const VALID_CATEGORIES: GroceryCategory[] = [
  'Produce', 'Dairy & Eggs', 'Meat', 'Seafood', 'Pantry', 
  'Frozen', 'Bakery', 'Spices', 'Beverages', 'Other'
];

const REQUIRED_COLUMNS = ['meal_name', 'day', 'meal_type', 'ingredient', 'quantity', 'unit', 'category'];

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// Normalize day name
function normalizeDay(day: string): DayOfWeek | null {
  const normalized = day.trim().toLowerCase();
  const dayMap: Record<string, DayOfWeek> = {
    'monday': 'Monday', 'mon': 'Monday', 'm': 'Monday',
    'tuesday': 'Tuesday', 'tue': 'Tuesday', 'tu': 'Tuesday',
    'wednesday': 'Wednesday', 'wed': 'Wednesday', 'w': 'Wednesday',
    'thursday': 'Thursday', 'thu': 'Thursday', 'th': 'Thursday',
    'friday': 'Friday', 'fri': 'Friday', 'f': 'Friday',
    'saturday': 'Saturday', 'sat': 'Saturday', 'sa': 'Saturday',
    'sunday': 'Sunday', 'sun': 'Sunday', 'su': 'Sunday',
  };
  return dayMap[normalized] || null;
}

// Normalize meal type
function normalizeMealType(type: string): MealType | null {
  const normalized = type.trim().toLowerCase();
  const typeMap: Record<string, MealType> = {
    'breakfast': 'Breakfast', 'b': 'Breakfast', 'bfast': 'Breakfast',
    'lunch': 'Lunch', 'l': 'Lunch',
    'dinner': 'Dinner', 'd': 'Dinner', 'supper': 'Dinner',
    'snack': 'Snack', 's': 'Snack', 'snacks': 'Snack',
  };
  return typeMap[normalized] || null;
}

// Normalize category
function normalizeCategory(category: string): GroceryCategory {
  const normalized = category.trim().toLowerCase();
  const categoryMap: Record<string, GroceryCategory> = {
    'produce': 'Produce', 'vegetables': 'Produce', 'fruits': 'Produce', 'veggies': 'Produce',
    'dairy': 'Dairy & Eggs', 'dairy & eggs': 'Dairy & Eggs', 'dairy and eggs': 'Dairy & Eggs', 'eggs': 'Dairy & Eggs',
    'meat': 'Meat', 'meats': 'Meat', 'poultry': 'Meat',
    'seafood': 'Seafood', 'fish': 'Seafood',
    'pantry': 'Pantry', 'dry goods': 'Pantry', 'canned': 'Pantry',
    'frozen': 'Frozen', 'freezer': 'Frozen',
    'bakery': 'Bakery', 'bread': 'Bakery', 'baked goods': 'Bakery',
    'spices': 'Spices', 'seasonings': 'Spices', 'herbs': 'Spices',
    'beverages': 'Beverages', 'drinks': 'Beverages',
    'other': 'Other',
  };
  return categoryMap[normalized] || 'Other';
}

// Parse CSV content
function parseCSVContent(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"';
        i++; // Skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentRow.push(currentCell.trim());
        if (currentRow.some(cell => cell !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
        if (char === '\r') i++; // Skip \n in \r\n
      } else if (char !== '\r') {
        currentCell += char;
      }
    }
  }

  // Handle last row
  if (currentCell !== '' || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(cell => cell !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

// Parse CSV file and return meals
export function parseCSV(
  content: string, 
  weekStartsOn: 'Sunday' | 'Monday' = 'Sunday',
  referenceDate: Date = new Date()
): ImportResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];
  
  const rows = parseCSVContent(content);
  
  if (rows.length === 0) {
    return {
      success: false,
      meals: [],
      errors: [{ row: 0, field: 'file', message: 'CSV file is empty' }],
      warnings: [],
    };
  }

  // Validate headers
  const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z_]/g, '_'));
  const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
  
  if (missingColumns.length > 0) {
    return {
      success: false,
      meals: [],
      errors: [{ row: 1, field: 'headers', message: `Missing required columns: ${missingColumns.join(', ')}` }],
      warnings: [],
    };
  }

  // Get column indices
  const colIndex = {
    meal_name: headers.indexOf('meal_name'),
    day: headers.indexOf('day'),
    meal_type: headers.indexOf('meal_type'),
    ingredient: headers.indexOf('ingredient'),
    quantity: headers.indexOf('quantity'),
    unit: headers.indexOf('unit'),
    category: headers.indexOf('category'),
  };

  // Parse data rows
  const mealMap = new Map<string, Meal>();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    // Skip empty rows
    if (row.every(cell => cell === '')) continue;

    // Validate row has enough columns
    if (row.length < REQUIRED_COLUMNS.length) {
      errors.push({ row: rowNum, field: 'row', message: 'Row has missing columns' });
      continue;
    }

    const mealName = row[colIndex.meal_name];
    const dayRaw = row[colIndex.day];
    const mealTypeRaw = row[colIndex.meal_type];
    const ingredientName = row[colIndex.ingredient];
    const quantityRaw = row[colIndex.quantity];
    const unit = row[colIndex.unit];
    const categoryRaw = row[colIndex.category];

    // Validate meal name
    if (!mealName) {
      errors.push({ row: rowNum, field: 'meal_name', message: 'Meal name is required' });
      continue;
    }

    // Validate and normalize day
    const day = normalizeDay(dayRaw);
    if (!day) {
      errors.push({ row: rowNum, field: 'day', message: `Invalid day: "${dayRaw}". Use ${VALID_DAYS.join(', ')}` });
      continue;
    }

    // Validate and normalize meal type
    const mealType = normalizeMealType(mealTypeRaw);
    if (!mealType) {
      errors.push({ row: rowNum, field: 'meal_type', message: `Invalid meal type: "${mealTypeRaw}". Use ${VALID_MEAL_TYPES.join(', ')}` });
      continue;
    }

    // Validate ingredient
    if (!ingredientName) {
      errors.push({ row: rowNum, field: 'ingredient', message: 'Ingredient name is required' });
      continue;
    }

    // Validate quantity
    const quantity = parseFloat(quantityRaw);
    if (isNaN(quantity) || quantity <= 0) {
      errors.push({ row: rowNum, field: 'quantity', message: `Invalid quantity: "${quantityRaw}". Must be a positive number` });
      continue;
    }

    // Validate unit
    if (!unit) {
      warnings.push(`Row ${rowNum}: Unit is empty for ingredient "${ingredientName}"`);
    }

    // Normalize category
    const category = normalizeCategory(categoryRaw);
    if (category === 'Other' && categoryRaw && !['other'].includes(categoryRaw.toLowerCase())) {
      warnings.push(`Row ${rowNum}: Unknown category "${categoryRaw}" mapped to "Other"`);
    }

    // Create ingredient
    const ingredient: Ingredient = {
      id: generateId(),
      name: ingredientName,
      quantity,
      unit: unit || 'pcs',
      category,
    };

    // Calculate the actual date for this day in the reference week
    const mealDate = getDateForDayInWeek(day, weekStartsOn, referenceDate);
    const mealDateStr = formatISODate(mealDate);

    // Create or update meal
    const mealKey = `${mealName}-${mealDateStr}-${mealType}`;
    if (mealMap.has(mealKey)) {
      mealMap.get(mealKey)!.ingredients.push(ingredient);
    } else {
      mealMap.set(mealKey, {
        id: generateId(),
        name: mealName,
        day,
        date: mealDateStr,
        mealType,
        ingredients: [ingredient],
      });
    }
  }

  const meals = Array.from(mealMap.values());

  return {
    success: errors.length === 0 && meals.length > 0,
    meals,
    errors,
    warnings,
  };
}

// Generate sample CSV content
export function generateSampleCSV(): string {
  return `meal_name,day,meal_type,ingredient,quantity,unit,category
Scrambled Eggs,Monday,Breakfast,Eggs,3,pcs,Dairy & Eggs
Scrambled Eggs,Monday,Breakfast,Butter,1,tbsp,Dairy & Eggs
Scrambled Eggs,Monday,Breakfast,Salt,0.25,tsp,Spices
Scrambled Eggs,Monday,Breakfast,Black Pepper,0.25,tsp,Spices
Toast with Avocado,Monday,Breakfast,Bread,2,slices,Bakery
Toast with Avocado,Monday,Breakfast,Avocado,1,pcs,Produce
Grilled Chicken Salad,Monday,Lunch,Chicken Breast,6,oz,Meat
Grilled Chicken Salad,Monday,Lunch,Mixed Greens,3,cups,Produce
Grilled Chicken Salad,Monday,Lunch,Cherry Tomatoes,0.5,cup,Produce
Grilled Chicken Salad,Monday,Lunch,Olive Oil,2,tbsp,Pantry
Grilled Chicken Salad,Monday,Lunch,Lemon,1,pcs,Produce
Pasta Primavera,Monday,Dinner,Pasta,8,oz,Pantry
Pasta Primavera,Monday,Dinner,Bell Peppers,2,pcs,Produce
Pasta Primavera,Monday,Dinner,Zucchini,1,pcs,Produce
Pasta Primavera,Monday,Dinner,Garlic,3,cloves,Produce
Pasta Primavera,Monday,Dinner,Parmesan Cheese,0.5,cup,Dairy & Eggs
Oatmeal with Berries,Tuesday,Breakfast,Oats,1,cup,Pantry
Oatmeal with Berries,Tuesday,Breakfast,Milk,1,cup,Dairy & Eggs
Oatmeal with Berries,Tuesday,Breakfast,Blueberries,0.5,cup,Produce
Oatmeal with Berries,Tuesday,Breakfast,Honey,1,tbsp,Pantry
Turkey Sandwich,Tuesday,Lunch,Turkey Breast,4,oz,Meat
Turkey Sandwich,Tuesday,Lunch,Bread,2,slices,Bakery
Turkey Sandwich,Tuesday,Lunch,Lettuce,2,leaves,Produce
Turkey Sandwich,Tuesday,Lunch,Tomato,2,slices,Produce
Turkey Sandwich,Tuesday,Lunch,Mayonnaise,1,tbsp,Pantry
Salmon with Rice,Tuesday,Dinner,Salmon Fillet,6,oz,Seafood
Salmon with Rice,Tuesday,Dinner,Brown Rice,1,cup,Pantry
Salmon with Rice,Tuesday,Dinner,Broccoli,2,cups,Produce
Salmon with Rice,Tuesday,Dinner,Soy Sauce,2,tbsp,Pantry
Salmon with Rice,Tuesday,Dinner,Ginger,1,tsp,Spices`;
}
