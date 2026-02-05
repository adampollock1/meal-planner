import { useState } from 'react';
import { Plus, Trash, DotsSixVertical } from '@phosphor-icons/react';
import { Button } from '../ui/Button';
import { Ingredient, GroceryCategory } from '../../types';

interface IngredientEditorProps {
  ingredients: Ingredient[];
  onChange: (ingredients: Ingredient[]) => void;
}

const CATEGORIES: GroceryCategory[] = [
  'Produce',
  'Dairy & Eggs',
  'Meat',
  'Seafood',
  'Pantry',
  'Frozen',
  'Bakery',
  'Spices',
  'Beverages',
  'Other',
];

const COMMON_UNITS = ['pcs', 'oz', 'lb', 'g', 'kg', 'cup', 'tbsp', 'tsp', 'ml', 'L'];

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function IngredientEditor({ ingredients, onChange }: IngredientEditorProps) {
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: 1,
    unit: 'pcs',
    category: 'Other' as GroceryCategory,
  });

  const handleAddIngredient = () => {
    if (!newIngredient.name.trim()) return;
    
    const ingredient: Ingredient = {
      id: generateId(),
      name: newIngredient.name.trim(),
      quantity: newIngredient.quantity,
      unit: newIngredient.unit,
      category: newIngredient.category,
    };
    
    onChange([...ingredients, ingredient]);
    setNewIngredient({
      name: '',
      quantity: 1,
      unit: 'pcs',
      category: 'Other',
    });
  };

  const handleRemoveIngredient = (id: string) => {
    onChange(ingredients.filter(ing => ing.id !== id));
  };

  const handleUpdateIngredient = (id: string, updates: Partial<Ingredient>) => {
    onChange(ingredients.map(ing => 
      ing.id === id ? { ...ing, ...updates } : ing
    ));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing ingredients list */}
      {ingredients.length > 0 && (
        <div className="space-y-2">
          {ingredients.map((ingredient) => (
            <div
              key={ingredient.id}
              className="p-3 bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl group border border-slate-200/30 dark:border-slate-700/30"
            >
              {/* Row 1: Name and delete button */}
              <div className="flex items-center gap-2 mb-2">
                <DotsSixVertical size={16} weight="bold" className="text-slate-300 dark:text-slate-600 flex-shrink-0" />
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) => handleUpdateIngredient(ingredient.id, { name: e.target.value })}
                  className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  placeholder="Ingredient name"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(ingredient.id)}
                  className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 flex-shrink-0 transition-colors"
                >
                  <Trash size={16} weight="duotone" />
                </button>
              </div>
              
              {/* Row 2: Quantity, Unit, Category */}
              <div className="flex items-center gap-2 pl-6">
                <input
                  type="number"
                  value={ingredient.quantity}
                  onChange={(e) => handleUpdateIngredient(ingredient.id, { quantity: parseFloat(e.target.value) || 0 })}
                  className="w-14 flex-shrink-0 px-2 py-1.5 text-sm bg-white/50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/50 rounded-lg text-center text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
                  min="0"
                  step="0.5"
                />
                <select
                  value={ingredient.unit}
                  onChange={(e) => handleUpdateIngredient(ingredient.id, { unit: e.target.value })}
                  className="w-16 flex-shrink-0 px-1 py-1.5 text-sm bg-white/50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/50 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
                >
                  {COMMON_UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
                <select
                  value={ingredient.category}
                  onChange={(e) => handleUpdateIngredient(ingredient.id, { category: e.target.value as GroceryCategory })}
                  className="flex-1 min-w-0 px-2 py-1.5 text-sm bg-white/50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/50 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add new ingredient form */}
      <div className="p-3 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl space-y-2 border border-slate-200/30 dark:border-slate-700/30">
        {/* Row 1: Name input */}
        <input
          type="text"
          value={newIngredient.name}
          onChange={(e) => setNewIngredient(prev => ({ ...prev, name: e.target.value }))}
          onKeyDown={handleKeyDown}
          placeholder="Add ingredient..."
          className="w-full px-3 py-2.5 text-sm bg-white/50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/50 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
        />
        
        {/* Row 2: Quantity, Unit, Category, Add Button */}
        <div className="flex gap-2">
          <input
            type="number"
            value={newIngredient.quantity}
            onChange={(e) => setNewIngredient(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
            className="w-14 flex-shrink-0 px-2 py-2 text-sm bg-white/50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/50 rounded-lg text-center text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
            min="0"
            step="0.5"
          />
          
          <select
            value={newIngredient.unit}
            onChange={(e) => setNewIngredient(prev => ({ ...prev, unit: e.target.value }))}
            className="w-16 flex-shrink-0 px-1 py-2 text-sm bg-white/50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/50 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
          >
            {COMMON_UNITS.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
          
          <select
            value={newIngredient.category}
            onChange={(e) => setNewIngredient(prev => ({ ...prev, category: e.target.value as GroceryCategory }))}
            className="flex-1 min-w-0 px-2 py-2 text-sm bg-white/50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/50 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleAddIngredient}
            disabled={!newIngredient.name.trim()}
            className="flex-shrink-0 px-3"
          >
            <Plus size={16} weight="bold" />
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {ingredients.length === 0 && (
        <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-2">
          No ingredients yet. Add some above!
        </p>
      )}
    </div>
  );
}
