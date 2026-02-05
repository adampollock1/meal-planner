import { useState, useCallback } from 'react';
import { Robot, Sparkle, WarningCircle, Key } from '@phosphor-icons/react';
import { ChatContainer } from '../components/chat/ChatContainer';
import { ChatInput } from '../components/chat/ChatInput';
import { Card } from '../components/ui/Card';
import { useMealPlan } from '../context/MealPlanContext';
import { useToast } from '../context/ToastContext';
import { useAccount } from '../context/AccountContext';
import { sendMessage, ChatMessage, isApiKeyConfigured } from '../services/geminiService';
import { Meal } from '../types';

const SUGGESTION_PROMPTS = [
  "Hey! I need help planning some meals",
  "Can you help me plan meals for next week?",
  "What's a good high-protein breakfast I could make?",
  "I'm trying to eat healthier, any suggestions?",
];

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addedMessageIds, setAddedMessageIds] = useState<Set<string>>(new Set());
  const { importMeals } = useMealPlan();
  const { addToast } = useToast();
  const { settings } = useAccount();

  const apiConfigured = isApiKeyConfigured();

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Pass weekStartsOn setting so meals get assigned to correct dates
      const response = await sendMessage(content, messages, settings.weekStartsOn, new Date());
      
      // Add assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message || "I've prepared your meals!",
        meals: response.meals.length > 0 ? response.meals : undefined,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: error instanceof Error 
          ? `Sorry, I encountered an error: ${error.message}` 
          : 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      addToast('Failed to get response', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, addToast, settings.weekStartsOn]);

  const handleAddMeals = useCallback((meals: Meal[], messageIndex: number) => {
    importMeals(meals, false);
    setAddedMessageIds(prev => new Set(prev).add(String(messageIndex)));
    addToast(`Added ${meals.length} meal${meals.length !== 1 ? 's' : ''} to your plan!`, 'success');
  }, [importMeals, addToast]);

  // API key not configured
  if (!apiConfigured) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <Card className="max-w-md text-center">
          <div className="w-16 h-16 bg-amber-100/80 dark:bg-amber-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Key size={32} weight="duotone" className="text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mb-2">API Key Required</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            To use the AI meal planner, you need to add your Groq API key.
          </p>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 text-left">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              1. Get a free API key from{' '}
              <a 
                href="https://console.groq.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-600 dark:text-orange-400 hover:underline"
              >
                Groq Console
              </a>
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              2. Open the <code className="bg-slate-200 dark:bg-slate-600 px-1 rounded">.env</code> file in your project
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              3. Replace <code className="bg-slate-200 dark:bg-slate-600 px-1 rounded">your_api_key_here</code> with your key
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Robot size={20} weight="duotone" className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">Chef Alex</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Your personal chef assistant</p>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 bg-slate-100/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden flex flex-col min-h-0 border border-slate-200/50 dark:border-slate-700/50">
        {messages.length === 0 ? (
          // Empty state with suggestions
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100/80 to-amber-100/80 dark:from-orange-900/40 dark:to-amber-900/40 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6">
              <Robot size={40} weight="duotone" className="text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-lg font-semibold font-display text-slate-800 dark:text-slate-200 mb-2">
              Hey there! I'm Chef Alex
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-6">
              I'm here to help you plan some amazing meals. Just tell me what you're in the mood for, any dietary needs, or how much time you've got - and I'll put together something great!
            </p>
            
            <div className="w-full max-w-md space-y-2">
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                Start a conversation:
              </p>
              {SUGGESTION_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="w-full text-left px-4 py-3 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm hover:bg-orange-50 dark:hover:bg-slate-600 border border-slate-200/50 dark:border-slate-600/50 hover:border-orange-200/50 dark:hover:border-orange-700/50 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:text-orange-700 dark:hover:text-orange-400 transition-all duration-200 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ChatContainer 
            messages={messages}
            onAddMeals={(meals) => {
              const messageIndex = messages.findIndex(m => m.meals === meals);
              handleAddMeals(meals, messageIndex !== -1 ? messageIndex : messages.length - 1);
            }}
            addedMessageIds={addedMessageIds}
          />
        )}

        {/* Input */}
        <div className="flex-shrink-0 p-4 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-slate-200/50 dark:border-slate-700/50">
          <ChatInput 
            onSend={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
