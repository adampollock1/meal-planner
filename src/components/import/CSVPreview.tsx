import { CheckCircle, WarningCircle, Warning, X } from '@phosphor-icons/react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ImportResult, Meal } from '../../types';

interface CSVPreviewProps {
  result: ImportResult;
  onConfirm: (meals: Meal[], replace: boolean) => void;
  onCancel: () => void;
}

export function CSVPreview({ result, onConfirm, onCancel }: CSVPreviewProps) {
  const { meals, errors, warnings, success } = result;

  const mealsByDay = meals.reduce((acc, meal) => {
    if (!acc[meal.day]) acc[meal.day] = [];
    acc[meal.day].push(meal);
    return acc;
  }, {} as Record<string, Meal[]>);

  const totalIngredients = meals.reduce((sum, meal) => sum + meal.ingredients.length, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {success ? (
              <div className="w-10 h-10 rounded-full bg-emerald-100/80 dark:bg-emerald-900/40 flex items-center justify-center">
                <CheckCircle size={20} weight="duotone" className="text-emerald-600 dark:text-emerald-400" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-red-100/80 dark:bg-red-900/40 flex items-center justify-center">
                <WarningCircle size={20} weight="duotone" className="text-red-600 dark:text-red-400" />
              </div>
            )}
            <div>
              <h3 className="font-semibold font-display text-slate-900 dark:text-slate-100">
                {success ? 'File parsed successfully!' : 'Issues found in file'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {meals.length} meals with {totalIngredients} ingredients
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 active:scale-95"
          >
            <X size={20} weight="bold" className="text-slate-400 dark:text-slate-500" />
          </button>
        </div>
      </Card>

      {/* Errors */}
      {errors.length > 0 && (
        <Card glass={false} className="border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <WarningCircle size={20} weight="duotone" className="text-red-500 dark:text-red-400" />
            <h4 className="font-medium font-display text-red-800 dark:text-red-200">Errors ({errors.length})</h4>
          </div>
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {errors.map((error, i) => (
              <li key={i} className="text-sm text-red-700 dark:text-red-300">
                <span className="font-medium">Row {error.row}:</span> {error.message}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card glass={false} className="border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-900/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <Warning size={20} weight="duotone" className="text-amber-500 dark:text-amber-400" />
            <h4 className="font-medium font-display text-amber-800 dark:text-amber-200">Warnings ({warnings.length})</h4>
          </div>
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {warnings.map((warning, i) => (
              <li key={i} className="text-sm text-amber-700 dark:text-amber-300">{warning}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* Preview */}
      {meals.length > 0 && (
        <Card padding="none">
          <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50">
            <h4 className="font-medium font-display text-slate-900 dark:text-slate-100">Meals Preview</h4>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {Object.entries(mealsByDay).map(([day, dayMeals]) => (
              <div key={day} className="border-b border-slate-100 dark:border-slate-700 last:border-0">
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-700/50">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{day}</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {dayMeals.map(meal => (
                    <div key={meal.id} className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-slate-900 dark:text-slate-100">{meal.name}</span>
                          <span className="ml-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                            {meal.mealType}
                          </span>
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {meal.ingredients.length} ingredients
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      {meals.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => onConfirm(meals, true)}
          >
            Replace existing meals
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onConfirm(meals, false)}
          >
            Add to existing meals
          </Button>
        </div>
      )}
    </div>
  );
}
