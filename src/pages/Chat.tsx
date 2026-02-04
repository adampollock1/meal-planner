import { useState, useCallback } from 'react';
import { Bot, Sparkles, AlertCircle, Key } from 'lucide-react';
import { ChatContainer } from '../components/chat/ChatContainer';
import { ChatInput } from '../components/chat/ChatInput';
import { Card } from '../components/ui/Card';
import { useMealPlan } from '../context/MealPlanContext';
import { useToast } from '../context/ToastContext';
import { sendMessage, ChatMessage, isApiKeyConfigured } from '../services/geminiService';
import { Meal } from '../types';

const SUGGESTION_PROMPTS = [
  "Hey! I need help planning meals for this week",
  "What's a good high-protein breakfast I could make?",
  "I'm short on time - got any quick dinner ideas?",
  "I'm trying to eat healthier, any suggestions?",
];

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addedMessageIds, setAddedMessageIds] = useState<Set<string>>(new Set());
  const { importMeals } = useMealPlan();
  const { addToast } = useToast();

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
      const response = await sendMessage(content, messages);
      
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
  }, [messages, isLoading, addToast]);

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
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">API Key Required</h2>
          <p className="text-slate-500 mb-4">
            To use the AI meal planner, you need to add your Groq API key.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 text-left">
            <p className="text-sm text-slate-600 mb-2">
              1. Get a free API key from{' '}
              <a 
                href="https://console.groq.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-600 hover:underline"
              >
                Groq Console
              </a>
            </p>
            <p className="text-sm text-slate-600 mb-2">
              2. Open the <code className="bg-slate-200 px-1 rounded">.env</code> file in your project
            </p>
            <p className="text-sm text-slate-600">
              3. Replace <code className="bg-slate-200 px-1 rounded">your_api_key_here</code> with your key
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
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Chef Alex</h1>
            <p className="text-sm text-slate-500">Your personal chef assistant</p>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 bg-slate-100 rounded-2xl overflow-hidden flex flex-col min-h-0">
        {messages.length === 0 ? (
          // Empty state with suggestions
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-3xl flex items-center justify-center mb-6">
              <span className="text-4xl">👨‍🍳</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              Hey there! I'm Chef Alex
            </h2>
            <p className="text-slate-500 text-center max-w-md mb-6">
              I'm here to help you plan some amazing meals. Just tell me what you're in the mood for, any dietary needs, or how much time you've got - and I'll put together something great!
            </p>
            
            <div className="w-full max-w-md space-y-2">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Start a conversation:
              </p>
              {SUGGESTION_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="w-full text-left px-4 py-3 bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-200 rounded-xl text-sm text-slate-700 hover:text-orange-700 transition-colors disabled:opacity-50"
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
        <div className="flex-shrink-0 p-4 bg-slate-50 border-t border-slate-200">
          <ChatInput 
            onSend={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
