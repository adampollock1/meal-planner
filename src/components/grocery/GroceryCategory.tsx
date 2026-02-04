import { 
  Apple, 
  Milk, 
  Beef, 
  Fish, 
  Package, 
  Snowflake, 
  Croissant, 
  Sparkles, 
  Coffee,
  MoreHorizontal
} from 'lucide-react';
import { GroceryItem } from './GroceryItem';
import { GroceryItem as GroceryItemType, GroceryCategory as CategoryType } from '../../types';

interface GroceryCategoryProps {
  category: CategoryType;
  items: GroceryItemType[];
  onToggleItem: (itemId: string) => void;
}

const categoryIcons: Record<CategoryType, React.ElementType> = {
  'Produce': Apple,
  'Dairy & Eggs': Milk,
  'Meat': Beef,
  'Seafood': Fish,
  'Pantry': Package,
  'Frozen': Snowflake,
  'Bakery': Croissant,
  'Spices': Sparkles,
  'Beverages': Coffee,
  'Other': MoreHorizontal,
};

const categoryColors: Record<CategoryType, string> = {
  'Produce': 'bg-green-100 text-green-700',
  'Dairy & Eggs': 'bg-blue-100 text-blue-700',
  'Meat': 'bg-red-100 text-red-700',
  'Seafood': 'bg-cyan-100 text-cyan-700',
  'Pantry': 'bg-amber-100 text-amber-700',
  'Frozen': 'bg-sky-100 text-sky-700',
  'Bakery': 'bg-orange-100 text-orange-700',
  'Spices': 'bg-purple-100 text-purple-700',
  'Beverages': 'bg-teal-100 text-teal-700',
  'Other': 'bg-slate-100 text-slate-700',
};

export function GroceryCategory({ category, items, onToggleItem }: GroceryCategoryProps) {
  const Icon = categoryIcons[category];
  const colorClass = categoryColors[category];
  const checkedCount = items.filter(i => i.checked).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{category}</h3>
            <p className="text-xs text-slate-500">
              {checkedCount} of {items.length} items checked
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
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
