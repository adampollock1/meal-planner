import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  ShoppingCart, 
  Upload, 
  ChefHat,
  ArrowRight,
  Sparkles,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Bot
} from 'lucide-react';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useMealPlan } from '../context/MealPlanContext';
import { useToast } from '../context/ToastContext';
import { parseCSV, generateSampleCSV } from '../utils/csvParser';
import { DayOfWeek, MealType } from '../types';

const DAYS: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const mealTypeIcons: Record<MealType, React.ElementType> = {
  Breakfast: Coffee,
  Lunch: Sun,
  Dinner: Moon,
  Snack: Cookie,
};

function getTodayName(): DayOfWeek {
  return DAYS[new Date().getDay()];
}

export function Home() {
  const { meals, groceryList, importMeals } = useMealPlan();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const today = getTodayName();
  const todayMeals = useMemo(() => {
    return meals.filter(m => m.day === today);
  }, [meals, today]);

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

  // Empty state
  if (meals.length === 0) {
    return (
      <div className="space-y-8">
        {/* Welcome header */}
        <div className="text-center pt-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-200">
            <ChefHat className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to MealPlanner</h1>
          <p className="text-slate-500 max-w-md mx-auto">
            Plan your weekly meals, organize ingredients, and generate smart grocery lists.
          </p>
        </div>

        {/* Chef Alex - Featured */}
        <div className="max-w-2xl mx-auto">
          <Card hover onClick={() => navigate('/chat')} className="group bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 group-hover:scale-105 transition-transform">
                <span className="text-2xl">👨‍🍳</span>
              </div>
              <div className="flex-1">
                <CardTitle className="text-orange-900">Chat with Chef Alex</CardTitle>
                <p className="text-sm text-orange-700 mt-1">
                  Your personal chef assistant - get meal ideas, recipes, and custom meal plans
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-orange-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
            </div>
          </Card>
        </div>

        {/* Getting started cards */}
        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <Card hover onClick={() => navigate('/import')} className="group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <Upload className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <CardTitle>Import CSV File</CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  Upload a CSV file with your meal plan and ingredients
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
            </div>
          </Card>

          <Card hover onClick={handleLoadSampleData} className="group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <CardTitle>Try Sample Data</CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  Load a sample meal plan to explore the features
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
            </div>
          </Card>
        </div>

        {/* Features */}
        <div className="bg-gradient-to-br from-slate-50 to-orange-50 rounded-3xl p-8 max-w-2xl mx-auto">
          <h2 className="font-semibold text-slate-900 mb-4">What you can do:</h2>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-slate-700">
              <div className="w-2 h-2 bg-orange-400 rounded-full" />
              View your meals in weekly or daily format
            </li>
            <li className="flex items-center gap-3 text-slate-700">
              <div className="w-2 h-2 bg-orange-400 rounded-full" />
              Auto-generate grocery lists from your meal plan
            </li>
            <li className="flex items-center gap-3 text-slate-700">
              <div className="w-2 h-2 bg-orange-400 rounded-full" />
              Check off items as you shop
            </li>
            <li className="flex items-center gap-3 text-slate-700">
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
        <h1 className="text-2xl font-bold text-slate-900">Good {getTimeOfDay()}!</h1>
        <p className="mt-1 text-slate-500">Here's your meal plan overview</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalMeals}</p>
              <p className="text-xs text-slate-500">Meals planned</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalIngredients}</p>
              <p className="text-xs text-slate-500">Grocery items</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.daysPlanned}</p>
              <p className="text-xs text-slate-500">Days planned</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {stats.totalIngredients > 0 
                  ? Math.round((stats.checkedItems / stats.totalIngredients) * 100)
                  : 0}%
              </p>
              <p className="text-xs text-slate-500">Shopping done</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Today's meals */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle>Today's Meals</CardTitle>
            <p className="text-sm text-slate-500">{today}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/meals')}>
            View all
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {todayMeals.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {todayMeals.map(meal => {
              const Icon = mealTypeIcons[meal.mealType];
              return (
                <div
                  key={meal.id}
                  className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-500">{meal.mealType}</span>
                  </div>
                  <p className="font-medium text-slate-900">{meal.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {meal.ingredients.length} ingredients
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-xl">
            <p className="text-slate-500">No meals planned for today</p>
          </div>
        )}
      </Card>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card hover onClick={() => navigate('/grocery')} className="group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <CardTitle>Grocery List</CardTitle>
              <p className="text-sm text-slate-500">
                {stats.checkedItems} of {stats.totalIngredients} items checked
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
          </div>
        </Card>

        <Card hover onClick={() => navigate('/chat')} className="group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">👨‍🍳</span>
            </div>
            <div className="flex-1">
              <CardTitle>Chef Alex (AI)</CardTitle>
              <p className="text-sm text-slate-500">
                Get help planning your meals
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
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
