import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, Monitor, Bell, BellSlash, Download, Trash } from '@phosphor-icons/react';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Toggle } from '../components/ui/Toggle';
import { useAccount } from '../context/AccountContext';
import { useMealPlan } from '../context/MealPlanContext';
import { useToast } from '../context/ToastContext';

const themeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const weekStartOptions = [
  { value: 'Sunday', label: 'Sunday' },
  { value: 'Monday', label: 'Monday' },
];

export function Settings() {
  const { settings, updateSettings } = useAccount();
  const { meals, groceryList, clearAllMeals } = useMealPlan();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleThemeChange = (value: string) => {
    updateSettings({ theme: value as 'light' | 'dark' | 'system' });
    addToast(`Theme set to ${value}`, 'success');
  };

  const handleWeekStartChange = (value: string) => {
    updateSettings({ weekStartsOn: value as 'Sunday' | 'Monday' });
    addToast(`Week now starts on ${value}`, 'success');
  };

  const handleServingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value >= 1 && value <= 20) {
      updateSettings({ defaultServings: value });
    }
  };

  const handleNotificationsToggle = () => {
    updateSettings({ notifications: !settings.notifications });
    addToast(settings.notifications ? 'Notifications disabled' : 'Notifications enabled', 'success');
  };

  const handleExportData = () => {
    const data = {
      meals,
      groceryList,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mealplan-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast('Data exported successfully', 'success');
  };

  const handleClearData = () => {
    clearAllMeals();
    setShowClearConfirm(false);
    addToast('All data cleared', 'info');
  };

  const ThemeIcon = settings.theme === 'dark' ? Moon : settings.theme === 'light' ? Sun : Monitor;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-all duration-200 active:scale-95"
        >
          <ArrowLeft size={20} weight="bold" />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400">Customize your experience</p>
        </div>
      </div>

      {/* Appearance */}
      <Card>
        <CardTitle>Appearance</CardTitle>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100/80 dark:bg-slate-700/80 rounded-xl flex items-center justify-center">
                <ThemeIcon size={20} weight="duotone" className="text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Theme</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Choose your preferred appearance</p>
              </div>
            </div>
            <Toggle
              options={themeOptions}
              value={settings.theme}
              onChange={handleThemeChange}
            />
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card>
        <CardTitle>Preferences</CardTitle>
        <div className="mt-4 space-y-6">
          {/* Default Servings */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Default Servings</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Default number of servings for new meals</p>
            </div>
            <input
              type="number"
              min="1"
              max="20"
              value={settings.defaultServings}
              onChange={handleServingsChange}
              className="w-20 px-3 py-2 text-center border border-slate-200/50 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm text-slate-900 dark:text-slate-100 transition-all duration-200"
            />
          </div>

          {/* Week Starts On */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Week Starts On</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">First day of your week</p>
            </div>
            <Toggle
              options={weekStartOptions}
              value={settings.weekStartsOn}
              onChange={handleWeekStartChange}
            />
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100/80 dark:bg-slate-700/80 rounded-xl flex items-center justify-center">
                {settings.notifications ? (
                  <Bell size={20} weight="duotone" className="text-slate-600 dark:text-slate-400" />
                ) : (
                  <BellSlash size={20} weight="duotone" className="text-slate-400 dark:text-slate-500" />
                )}
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Notifications</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Get reminders for meal prep</p>
              </div>
            </div>
            <button
              onClick={handleNotificationsToggle}
              className={`relative w-12 h-7 rounded-full transition-all duration-200 ${
                settings.notifications ? 'bg-orange-500 shadow-md shadow-orange-500/30' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${
                  settings.notifications ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card>
        <CardTitle>Data Management</CardTitle>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between p-4 bg-slate-50/80 dark:bg-slate-700/50 backdrop-blur-sm rounded-xl">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Export Data</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Download your meal plans as JSON</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download size={16} weight="duotone" />
              Export
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm rounded-xl">
            <div>
              <p className="font-medium text-red-900 dark:text-red-300">Clear All Data</p>
              <p className="text-sm text-red-600 dark:text-red-400">Permanently delete all meals and grocery lists</p>
            </div>
            {showClearConfirm ? (
              <div className="flex gap-2">
                <Button variant="danger" size="sm" onClick={handleClearData}>
                  Confirm
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowClearConfirm(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="danger" size="sm" onClick={() => setShowClearConfirm(true)}>
                <Trash size={16} weight="duotone" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Storage Info */}
      <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">
        <p>Your data is stored locally in your browser.</p>
        <p className="mt-1">
          {meals.length} meals and {groceryList.length} grocery items saved
        </p>
      </div>
    </div>
  );
}
