import { Bot, User, Plus, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { ChatMessage as ChatMessageType } from '../../services/geminiService';
import { Meal } from '../../types';

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
          ? 'bg-orange-100 text-orange-600' 
          : 'bg-emerald-100 text-emerald-600'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Content */}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-orange-500 text-white rounded-tr-md' 
            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-md shadow-sm'
        }`}>
          <div className="text-sm whitespace-pre-wrap">
            {isUser ? message.content : formatMessage(message.content)}
          </div>
        </div>

        {/* Meals card */}
        {hasMeals && !isUser && (
          <div className="mt-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-emerald-800">
                {message.meals!.length} Meal{message.meals!.length !== 1 ? 's' : ''} Ready
              </h4>
              {mealsAdded ? (
                <span className="flex items-center gap-1 text-sm text-emerald-600">
                  <Check className="w-4 h-4" />
                  Added!
                </span>
              ) : (
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => onAddMeals?.(message.meals!)}
                >
                  <Plus className="w-4 h-4" />
                  Add to Plan
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              {message.meals!.slice(0, 5).map(meal => (
                <div 
                  key={meal.id} 
                  className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2"
                >
                  <div>
                    <span className="text-sm font-medium text-slate-800">{meal.name}</span>
                    <span className="text-xs text-slate-500 ml-2">
                      {meal.day} • {meal.mealType}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {meal.ingredients.length} items
                  </span>
                </div>
              ))}
              {message.meals!.length > 5 && (
                <p className="text-xs text-slate-500 text-center py-1">
                  +{message.meals!.length - 5} more meals
                </p>
              )}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <p className={`text-xs text-slate-400 mt-1 ${isUser ? 'text-right' : ''}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
