import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, FileSpreadsheet, HelpCircle } from 'lucide-react';
import { CSVDropzone } from '../components/import/CSVDropzone';
import { CSVPreview } from '../components/import/CSVPreview';
import { Button } from '../components/ui/Button';
import { Card, CardTitle } from '../components/ui/Card';
import { useMealPlan } from '../context/MealPlanContext';
import { useToast } from '../context/ToastContext';
import { parseCSV, generateSampleCSV } from '../utils/csvParser';
import { ImportResult, Meal } from '../types';

export function Import() {
  const [parseResult, setParseResult] = useState<ImportResult | null>(null);
  const { importMeals } = useMealPlan();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleFileSelect = useCallback((content: string) => {
    const result = parseCSV(content);
    setParseResult(result);
  }, []);

  const handleConfirm = useCallback((meals: Meal[], replace: boolean) => {
    importMeals(meals, replace);
    addToast(
      `Successfully imported ${meals.length} meals!`,
      'success'
    );
    setParseResult(null);
    navigate('/meals');
  }, [importMeals, addToast, navigate]);

  const handleCancel = useCallback(() => {
    setParseResult(null);
  }, []);

  const handleDownloadTemplate = useCallback(() => {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meal-plan-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Template downloaded!', 'success');
  }, [addToast]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Import Meal Plan</h1>
        <p className="mt-1 text-slate-500">
          Upload a CSV file with your meals and ingredients
        </p>
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upload area */}
        <div className="lg:col-span-2 space-y-6">
          {parseResult ? (
            <CSVPreview
              result={parseResult}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          ) : (
            <CSVDropzone onFileSelect={handleFileSelect} />
          )}
        </div>

        {/* Help sidebar */}
        <div className="space-y-6">
          {/* Download template */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-orange-600" />
              </div>
              <CardTitle>Need a template?</CardTitle>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Download our sample CSV file to see the correct format with example meals.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleDownloadTemplate}
            >
              <Download className="w-4 h-4" />
              Download Template
            </Button>
          </Card>

          {/* Format help */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle>CSV Format</CardTitle>
            </div>
            <div className="space-y-4 text-sm text-slate-600">
              <p>Your CSV file should have these columns:</p>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">meal_name</code>
                  <span>Name of the meal</span>
                </li>
                <li className="flex gap-2">
                  <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">day</code>
                  <span>Monday - Sunday</span>
                </li>
                <li className="flex gap-2">
                  <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">meal_type</code>
                  <span>Breakfast, Lunch, Dinner, Snack</span>
                </li>
                <li className="flex gap-2">
                  <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">ingredient</code>
                  <span>Ingredient name</span>
                </li>
                <li className="flex gap-2">
                  <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">quantity</code>
                  <span>Number amount</span>
                </li>
                <li className="flex gap-2">
                  <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">unit</code>
                  <span>oz, cups, tbsp, etc.</span>
                </li>
                <li className="flex gap-2">
                  <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">category</code>
                  <span>Produce, Meat, Dairy, etc.</span>
                </li>
              </ul>
            </div>
          </Card>

          {/* Categories */}
          <Card>
            <CardTitle className="mb-3">Valid Categories</CardTitle>
            <div className="flex flex-wrap gap-2">
              {['Produce', 'Dairy & Eggs', 'Meat', 'Seafood', 'Pantry', 'Frozen', 'Bakery', 'Spices', 'Beverages'].map(cat => (
                <span key={cat} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                  {cat}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
