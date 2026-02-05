import { 
  Carrot, 
  Egg, 
  Cow, 
  Fish, 
  Package, 
  Snowflake, 
  Bread, 
  Sparkle, 
  Coffee,
  DotsThree
} from '@phosphor-icons/react';
import { GroceryItem } from './GroceryItem';
import { GroceryItem as GroceryItemType, GroceryCategory as CategoryType } from '../../types';

interface GroceryCategoryProps {
  category: CategoryType;
  items: GroceryItemType[];
  onToggleItem: (itemId: string) => void;
}

const categoryIcons: Record<CategoryType, React.ElementType> = {
  'Produce': Carrot,
  'Dairy & Eggs': Egg,
  'Meat': Cow,
  'Seafood': Fish,
  'Pantry': Package,
  'Frozen': Snowflake,
  'Bakery': Bread,
  'Spices': Sparkle,
  'Beverages': Coffee,
  'Other': DotsThree,
};

const categoryColors: Record<CategoryType, string> = {
  'Produce': 'bg-green-100/80 dark:bg-green-900/40 text-green-700 dark:text-green-400',
  'Dairy & Eggs': 'bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
  'Meat': 'bg-red-100/80 dark:bg-red-900/40 text-red-700 dark:text-red-400',
  'Seafood': 'bg-cyan-100/80 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400',
  'Pantry': 'bg-amber-100/80 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
  'Frozen': 'bg-sky-100/80 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400',
  'Bakery': 'bg-orange-100/80 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400',
  'Spices': 'bg-purple-100/80 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400',
  'Beverages': 'bg-teal-100/80 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400',
  'Other': 'bg-slate-100/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300',
};

export function GroceryCategory({ category, items, onToggleItem }: GroceryCategoryProps) {
  const Icon = categoryIcons[category];
  const colorClass = categoryColors[category];
  const checkedCount = items.filter(i => i.checked).length;

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-lg shadow-slate-900/5 dark:shadow-slate-900/30">
      <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
            <Icon size={20} weight="duotone" />
          </div>
          <div>
            <h3 className="font-semibold font-display text-slate-900 dark:text-slate-100">{category}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {checkedCount} of {items.length} items checked
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-slate-100/80 dark:bg-slate-700/80 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${items.length > 0 ? (checkedCount / items.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="p-2 space-y-1">
        {items.map(item => (
          <GroceryItem
            key={item.id}
            item={item}
            onToggle={() => onToggleItem(item.id)}
          />
        ))}
      </div>
    </div>
  );
}
