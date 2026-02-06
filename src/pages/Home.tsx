import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  ShoppingCart, 
  Upload, 
  ChefHat,
  ArrowRight,
  Sparkle,
  Coffee,
  Sun,
  Moon,
  Cookie,
  User
} from '@phosphor-icons/react';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useMealPlan } from '../context/MealPlanContext';
import { useAccount } from '../context/AccountContext';
import { useToast } from '../context/ToastContext';
import { parseCSV, generateSampleCSV } from '../utils/csvParser';
import { MealType } from '../types';
import { formatISODate, formatShortDate } from '../utils/dateUtils';

const mealTypeIcons: Record<MealType, React.ElementType> = {
  Breakfast: Coffee,
  Lunch: Sun,
  Dinner: Moon,
  Snack: Cookie,
};

const mealTypeColors: Record<MealType, { bg: string; text: string; icon: string }> = {
  Breakfast: {
    bg: 'bg-amber-100/80 dark:bg-amber-900/40',
    text: 'text-amber-700 dark:text-amber-400',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  Lunch: {
    bg: 'bg-orange-100/80 dark:bg-orange-900/40',
    text: 'text-orange-700 dark:text-orange-400',
    icon: 'text-orange-600 dark:text-orange-400',
  },
  Dinner: {
    bg: 'bg-indigo-100/80 dark:bg-indigo-900/40',
    text: 'text-indigo-700 dark:text-indigo-400',
    icon: 'text-indigo-600 dark:text-indigo-400',
  },
  Snack: {
    bg: 'bg-emerald-100/80 dark:bg-emerald-900/40',
    text: 'text-emerald-700 dark:text-emerald-400',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
};

// Meal type sort order - Breakfast first, then Lunch, Dinner, Snack
const MEAL_TYPE_ORDER: Record<MealType, number> = {
  Breakfast: 0,
  Lunch: 1,
  Dinner: 2,
  Snack: 3,
};

// Get the next N days starting from today
function getNextDays(count: number): { date: Date; dateStr: string; label: string }[] {
  const days: { date: Date; dateStr: string; label: string }[] = [];
  const today = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = formatISODate(date);
    
    let label: string;
    if (i === 0) {
      label = 'Today';
    } else if (i === 1) {
      label = 'Tomorrow';
    } else {
      label = formatShortDate(date);
    }
    
    days.push({ date, dateStr, label });
  }
  
  return days;
}

export function Home() {
  const { meals, groceryList, importMeals, isLoading } = useMealPlan();
  const { isLoggedIn, isLoading: authLoading } = useAccount();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Get the next 3 days
  const upcomingDays = useMemo(() => getNextDays(3), []);
  
  // Get meals for the next 3 days, sorted by meal type (Breakfast, Lunch, Dinner, Snack)
  const mealsByDay = useMemo(() => {
    return upcomingDays.map(day => ({
      ...day,
      meals: meals
        .filter(m => m.date === day.dateStr)
        .sort((a, b) => MEAL_TYPE_ORDER[a.mealType] - MEAL_TYPE_ORDER[b.mealType]),
    }));
  }, [meals, upcomingDays]);

  const stats = useMemo(() => ({
    totalMeals: meals.length,
    totalIngredients: groceryList.length,
    checkedItems: groceryList.filter(i => i.checked).length,
    daysPlanned: new Set(meals.map(m => m.day)).size,
  }), [meals, groceryList]);

  const handleLoadSampleData = () => {
    const csv = generateSampleCSV();
    const result = parseCSV(csv);
    if (result.success) {
      importMeals(result.meals, true);
      addToast('Sample meal plan loaded!', 'success');
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Welcome screen for logged-out users
  if (!isLoggedIn) {
    return (
      <div className="space-y-8">
        {/* Welcome header */}
        <div className="text-center pt-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/30">
            <ChefHat size={40} weight="duotone" className="text-white" />
          </div>
          <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-slate-100 mb-2">Welcome to Meal Planner</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Plan your weekly meals, organize ingredients, and generate smart grocery lists.
          </p>
        </div>

        {/* Sign in CTA */}
        <div className="max-w-md mx-auto">
          <Card hover onClick={() => navigate('/account')} className="group bg-gradient-to-r from-orange-50/80 to-amber-50/80 dark:from-orange-900/30 dark:to-amber-900/30 border-orange-200/50 dark:border-orange-800/50">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform">
                <User size={28} weight="duotone" className="text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-orange-900 dark:text-orange-200">Sign In to Get Started</CardTitle>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  Create an account or sign in to start planning your meals
                </p>
              </div>
              <ArrowRight size={20} weight="bold" className="text-orange-300 dark:text-orange-600 group-hover:text-orange-500 dark:group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
            </div>
          </Card>
        </div>

        {/* Features */}
        <div className="bg-gradient-to-br from-slate-50/80 to-orange-50/80 dark:from-slate-800/80 dark:to-orange-900/20 backdrop-blur-sm rounded-3xl p-8 max-w-2xl mx-auto border border-slate-200/30 dark:border-slate-700/30">
          <h2 className="font-semibold font-display text-slate-900 dark:text-slate-100 mb-4">What you can do:</h2>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <div className="w-2 h-2 bg-orange-400 rounded-full" />
              Chat with Chef Alex for personalized meal ideas
            </li>
            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <div className="w-2 h-2 bg-orange-400 rounded-full" />
              View your meals in weekly or daily format
            </li>
            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <div className="w-2 h-2 bg-orange-400 rounded-full" />
              Auto-generate grocery lists from your meal plan
            </li>
            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <div className="w-2 h-2 bg-orange-400 rounded-full" />
              Save favorite meals for quick access
            </li>
            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <div className="w-2 h-2 bg-orange-400 rounded-full" />
              Sync your data across all your devices
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // Loading state for meal data
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Loading your meal plan...</p>
        </div>
      </div>
    );
  }

  // Empty state (logged in but no meals)
  if (meals.length === 0) {
    return (
      <div className="space-y-8">
        {/* Welcome header */}
        <div className="text-center pt-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/30">
            <ChefHat size={40} weight="duotone" className="text-white" />
          </div>
          <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-slate-100 mb-2">Welcome to Meal Planner</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Plan your weekly meals, organize ingredients, and generate smart grocery lists.
          </p>
        </div>

        {/* Chef Alex - Featured */}
        <div className="max-w-2xl mx-auto">
          <Card hover onClick={() => navigate('/chat')} className="group bg-gradient-to-r from-orange-50/80 to-amber-50/80 dark:from-orange-900/30 dark:to-amber-900/30 border-orange-200/50 dark:border-orange-800/50">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform">
                <ChefHat size={28} weight="duotone" className="text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-orange-900 dark:text-orange-200">Chat with Chef Alex</CardTitle>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  Your personal chef assistant - get meal ideas, recipes, and custom meal plans
                </p>
              </div>
              <ArrowRight size={20} weight="bold" className="text-orange-300 dark:text-orange-600 group-hover:text-orange-500 dark:group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
            </div>
          </Card>
        </div>

        {/* Getting started cards */}
        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <Card hover onClick={() => navigate('/import')} className="group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100/80 dark:bg-orange-900/40 rounded-xl flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-900/60 transition-colors">
                <Upload size={24} weight="duotone" className="text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <CardTitle>Import CSV File</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Upload a CSV file with your meal plan and ingredients
                </p>
              </div>
              <ArrowRight size={20} weight="bold" className="text-slate-300 dark:text-slate-600 group-hover:text-orange-500 dark:group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
            </div>
          </Card>

          <Card hover onClick={handleLoadSampleData} className="group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100/80 dark:bg-purple-900/40 rounded-xl flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/60 transition-colors">
                <Sparkle size={24} weight="duotone" className="text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <CardTitle>Try Sample Data</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Load a sample meal plan to explore the features
                </p>
              </div>
              <ArrowRight size={20} weight="bold" className="text-slate-300 dark:text-slate-600 group-hover:text-purple-500 dark:group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </div>
          </Card>
        </div>

        {/* Features */}
        <div className="bg-gradient-to-br from-slate-50/80 to-orange-50/80 dark:from-slate-800/80 dark:to-orange-900/20 backdrop-blur-sm rounded-3xl p-8 max-w-2xl mx-auto border border-slate-200/30 dark:border-slate-700/30">
          <h2 className="font-semibold font-display text-slate-900 dark:text-slate-100 mb-4">What you can do:</h2>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <div className="w-2 h-2 bg-orange-400 rounded-full" />
              View your meals in weekly or daily format
            </li>
            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <div className="w-2 h-2 bg-orange-400 rounded-full" />
              Auto-generate grocery lists from your meal plan
            </li>
            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <div className="w-2 h-2 bg-orange-400 rounded-full" />
              Check off items as you shop
            </li>
            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <div className="w-2 h-2 bg-orange-400 rounded-full" />
              Print your grocery list for the store
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // Dashboard with data
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Good {getTimeOfDay()}!</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Here's your meal plan overview</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100/80 dark:bg-orange-900/40 rounded-xl flex items-center justify-center">
              <Calendar size={20} weight="duotone" className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">{stats.totalMeals}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Meals planned</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100/80 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center">
              <ShoppingCart size={20} weight="duotone" className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">{stats.totalIngredients}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Grocery items</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100/80 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
              <Calendar size={20} weight="duotone" className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">{stats.daysPlanned}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Days planned</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100/80 dark:bg-purple-900/40 rounded-xl flex items-center justify-center">
              <Sparkle size={20} weight="duotone" className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
                {stats.totalIngredients > 0 
                  ? Math.round((stats.checkedItems / stats.totalIngredients) * 100)
                  : 0}%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Shopping done</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Upcoming meals - 3 days */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle>Upcoming Meals</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">Next 3 days</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/meals')}>
            View all
            <ArrowRight size={16} weight="bold" />
          </Button>
        </div>

        <div className="space-y-4">
          {mealsByDay.map(({ dateStr, label, meals: dayMeals }) => (
            <div key={dateStr}>
              {/* Day header */}
              <div className="flex items-center gap-2 mb-2">
                <h3 className={`text-sm font-semibold ${
                  label === 'Today' 
                    ? 'text-orange-600 dark:text-orange-400' 
                    : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {label}
                </h3>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              </div>
              
              {dayMeals.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {dayMeals.map(meal => {
                    const Icon = mealTypeIcons[meal.mealType];
                    const colors = mealTypeColors[meal.mealType];
                    return (
                      <div
                        key={meal.id}
                        onClick={() => navigate(`/meals?meal=${meal.id}`)}
                        className="p-4 bg-slate-50/80 dark:bg-slate-700/50 backdrop-blur-sm rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer hover:shadow-md active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center ${colors.bg}`}>
                            <Icon size={14} weight="duotone" className={colors.icon} />
                          </div>
                          <span className={`text-xs font-semibold ${colors.text}`}>{meal.mealType}</span>
                        </div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{meal.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {meal.ingredients.length} ingredients
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 bg-slate-50/50 dark:bg-slate-700/30 backdrop-blur-sm rounded-xl">
                  <p className="text-sm text-slate-400 dark:text-slate-500">No meals planned</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card hover onClick={() => navigate('/grocery')} className="group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100/80 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center">
              <ShoppingCart size={24} weight="duotone" className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <CardTitle>Grocery List</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {stats.checkedItems} of {stats.totalIngredients} items checked
              </p>
            </div>
            <ArrowRight size={20} weight="bold" className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
        </Card>

        <Card hover onClick={() => navigate('/chat')} className="group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100/80 dark:bg-orange-900/40 rounded-xl flex items-center justify-center">
              <ChefHat size={24} weight="duotone" className="text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <CardTitle>Chef Alex (AI)</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Get help planning your meals
              </p>
            </div>
            <ArrowRight size={20} weight="bold" className="text-slate-300 dark:text-slate-600 group-hover:text-orange-500 dark:group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
