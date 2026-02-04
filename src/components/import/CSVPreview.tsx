import { CheckCircle, AlertCircle, AlertTriangle, X } from 'lucide-react';
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
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-slate-900">
                {success ? 'File parsed successfully!' : 'Issues found in file'}
              </h3>
              <p className="text-sm text-slate-500">
                {meals.length} meals with {totalIngredients} ingredients
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </Card>

      {/* Errors */}
      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h4 className="font-medium text-red-800">Errors ({errors.length})</h4>
          </div>
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {errors.map((error, i) => (
              <li key={i} className="text-sm text-red-700">
                <span className="font-medium">Row {error.row}:</span> {error.message}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h4 className="font-medium text-amber-800">Warnings ({warnings.length})</h4>
          </div>
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {warnings.map((warning, i) => (
              <li key={i} className="text-sm text-amber-700">{warning}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* Preview */}
      {meals.length > 0 && (
        <Card padding="none">
          <div className="p-4 border-b border-slate-100">
            <h4 className="font-medium text-slate-900">Meals Preview</h4>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {Object.entries(mealsByDay).map(([day, dayMeals]) => (
              <div key={day} className="border-b border-slate-100 last:border-0">
                <div className="px-4 py-2 bg-slate-50">
                  <span className="text-sm font-medium text-slate-600">{day}</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {dayMeals.map(meal => (
                    <div key={meal.id} className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-slate-900">{meal.name}</span>
                          <span className="ml-2 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {meal.mealType}
                          </span>
                        </div>
                        <span className="text-sm text-slate-500">
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
