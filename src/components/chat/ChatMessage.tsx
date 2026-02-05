import { ChefHat, User, Plus, Check } from '@phosphor-icons/react';
import { Button } from '../ui/Button';
import { ChatMessage as ChatMessageType, Meal } from '../../types';
import { parseISODate, formatShortDate } from '../../utils/dateUtils';

interface ChatMessageProps {
  message: ChatMessageType;
  onAddMeals?: (meals: Meal[]) => void;
  mealsAdded?: boolean;
}

// Simple markdown-like renderer for AI messages
function formatMessage(content: string): React.ReactNode {
  // Split by lines and process each
  const lines = content.split('\n');
  
  return lines.map((line, i) => {
    // Process bold text (**text**)
    let processed: React.ReactNode = line;
    
    // Handle **bold** text
    const boldParts = line.split(/\*\*(.*?)\*\*/g);
    if (boldParts.length > 1) {
      processed = boldParts.map((part, j) => 
        j % 2 === 1 ? <strong key={j} className="font-semibold">{part}</strong> : part
      );
    }
    
    // Check if it's a day header (starts with emoji + day)
    const isDayHeader = /^📅/.test(line);
    // Check if it's a meal item (starts with dash and emoji)
    const isMealItem = /^-\s*[🍳🥗🍝🍲🥘🍜🍱🌮🍕🥪🥙🍔]/.test(line);
    
    return (
      <span 
        key={i} 
        className={`block ${isDayHeader ? 'mt-3 mb-1 text-base' : ''} ${isMealItem ? 'ml-2 my-0.5' : ''}`}
      >
        {processed}
        {i < lines.length - 1 && !isDayHeader && '\n'}
      </span>
    );
  });
}

export function ChatMessage({ message, onAddMeals, mealsAdded }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const hasMeals = message.meals && message.meals.length > 0;

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-fade-in`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser 
          ? 'bg-orange-100/80 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400' 
          : 'bg-gradient-to-br from-orange-400 to-amber-500 shadow-md shadow-orange-500/20'
      }`}>
        {isUser ? <User size={16} weight="duotone" /> : <ChefHat size={16} weight="fill" className="text-white" />}
      </div>

      {/* Content */}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-orange-500 text-white rounded-tr-md shadow-lg shadow-orange-500/20' 
            : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 rounded-tl-md shadow-lg dark:shadow-slate-900/20'
        }`}>
          <div className="text-sm whitespace-pre-wrap">
            {isUser ? message.content : formatMessage(message.content)}
          </div>
        </div>

        {/* Meals card */}
        {hasMeals && !isUser && (
          <div className="mt-3 bg-gradient-to-r from-orange-50/80 to-amber-50/80 dark:from-orange-900/30 dark:to-amber-900/30 backdrop-blur-sm border border-orange-200/50 dark:border-orange-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium font-display text-orange-800 dark:text-orange-200">
                {message.meals!.length} Meal{message.meals!.length !== 1 ? 's' : ''} Ready
              </h4>
              {mealsAdded ? (
                <span className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
                  <Check size={16} weight="bold" />
                  Added!
                </span>
              ) : (
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => onAddMeals?.(message.meals!)}
                >
                  <Plus size={16} weight="bold" />
                  Add to Plan
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              {message.meals!.slice(0, 5).map(meal => {
                // Format the date for display
                const mealDate = meal.date ? parseISODate(meal.date) : null;
                const formattedDate = mealDate ? formatShortDate(mealDate) : meal.day;
                
                return (
                  <div 
                    key={meal.id} 
                    className="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg px-3 py-2"
                  >
                    <div>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{meal.name}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                        {formattedDate} · {meal.mealType}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {meal.ingredients.length} items
                    </span>
                  </div>
                );
              })}
              {message.meals!.length > 5 && (
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-1">
                  +{message.meals!.length - 5} more meals
                </p>
              )}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <p className={`text-xs text-slate-400 dark:text-slate-500 mt-1 ${isUser ? 'text-right' : ''}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
