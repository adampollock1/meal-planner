import { GroceryCategory } from './GroceryCategory';
import { GroceryItem, GroceryCategory as CategoryType } from '../../types';
import { groupByCategory } from '../../utils/groceryGenerator';

interface GroceryListProps {
  items: GroceryItem[];
  onToggleItem: (itemId: string) => void;
}

const CATEGORY_ORDER: CategoryType[] = [
  'Produce',
  'Dairy & Eggs',
  'Meat',
  'Seafood',
  'Bakery',
  'Frozen',
  'Pantry',
  'Spices',
  'Beverages',
  'Other',
];

export function GroceryList({ items, onToggleItem }: GroceryListProps) {
  const grouped = groupByCategory(items);

  return (
    <div className="space-y-4">
      {CATEGORY_ORDER.map(category => {
        const categoryItems = grouped.get(category);
        if (!categoryItems || categoryItems.length === 0) return null;
        
        return (
          <GroceryCategory
            key={category}
            category={category}
            items={categoryItems}
            onToggleItem={onToggleItem}
          />
        );
      })}
    </div>
  );
}
