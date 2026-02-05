import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, ShoppingCart, Upload, CheckCircle } from '@phosphor-icons/react';
import { GroceryList as GroceryListComponent } from '../components/grocery/GroceryList';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useMealPlan } from '../context/MealPlanContext';

export function GroceryList() {
  const { groceryList, meals, toggleGroceryItem } = useMealPlan();
  const navigate = useNavigate();

  const checkedCount = groceryList.filter(i => i.checked).length;
  const totalCount = groceryList.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Empty state - no meals
  if (meals.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Grocery List</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Your shopping list based on your meal plan</p>
        </div>

        <Card className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-100/80 dark:bg-slate-700/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingCart size={32} weight="duotone" className="text-slate-400 dark:text-slate-500" />
            </div>
            <h2 className="text-xl font-semibold font-display text-slate-900 dark:text-slate-100 mb-2">No grocery list yet</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Import a meal plan to automatically generate your grocery list with all the ingredients you need.
            </p>
            <Button onClick={() => navigate('/import')}>
              <Upload size={16} weight="bold" />
              Import Meals
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Grocery List</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {totalCount} item{totalCount !== 1 ? 's' : ''} from {meals.length} meal{meals.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer size={16} weight="duotone" />
          Print
        </Button>
      </div>

      {/* Progress card */}
      <Card className="no-print">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            progress === 100 ? 'bg-emerald-100/80 dark:bg-emerald-900/40' : 'bg-orange-100/80 dark:bg-orange-900/40'
          }`}>
            {progress === 100 ? (
              <CheckCircle size={24} weight="duotone" className="text-emerald-600 dark:text-emerald-400" />
            ) : (
              <ShoppingCart size={24} weight="duotone" className="text-orange-600 dark:text-orange-400" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {progress === 100 ? 'Shopping complete!' : 'Shopping progress'}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {checkedCount} / {totalCount}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100/80 dark:bg-slate-700/80 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-400 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Print header - only shows when printing */}
      <div className="hidden print-only">
        <h1 className="text-2xl font-bold mb-2">Grocery List</h1>
        <p className="text-sm text-slate-500 mb-4">
          {totalCount} items • Generated from {meals.length} meals
        </p>
      </div>

      {/* Grocery list */}
      <GroceryListComponent
        items={groceryList}
        onToggleItem={toggleGroceryItem}
      />
    </div>
  );
}
