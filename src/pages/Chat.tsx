import { useState, useCallback, useMemo, useEffect } from 'react';
import { ChefHat, Key, List, Plus } from '@phosphor-icons/react';
import { ChatContainer } from '../components/chat/ChatContainer';
import { ChatInput } from '../components/chat/ChatInput';
import { ChatHistorySidebar } from '../components/chat/ChatHistorySidebar';
import { ChatDrawer } from '../components/chat/ChatDrawer';
import { Card } from '../components/ui/Card';
import { useMealPlan } from '../context/MealPlanContext';
import { useToast } from '../context/ToastContext';
import { useAccount } from '../context/AccountContext';
import { useChat } from '../context/ChatContext';
import { sendMessage, isApiKeyConfigured } from '../services/geminiService';
import { Meal, ChatMessage } from '../types';

const SUGGESTION_PROMPTS = [
  "Hey! I need help planning some meals",
  "Can you help me plan meals for next week?",
  "What's a good high-protein breakfast I could make?",
  "I'm trying to eat healthier, any suggestions?",
];

export function Chat() {
  const [isLoading, setIsLoading] = useState(false);
  const [addedMessageIds, setAddedMessageIds] = useState<Set<string>>(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const { importMeals } = useMealPlan();
  const { addToast } = useToast();
  const { settings } = useAccount();
  const { 
    getActiveConversation, 
    addMessage, 
    createConversation,
    clearActiveConversation,
    activeConversationId 
  } = useChat();

  // Reset to new chat when navigating to this page
  useEffect(() => {
    clearActiveConversation();
  }, [clearActiveConversation]);

  const apiConfigured = isApiKeyConfigured();

  // Get current conversation messages
  const activeConversation = getActiveConversation();
  const messages = useMemo(() => activeConversation?.messages || [], [activeConversation]);

  // Convert messages for API (needs Date objects for conversation history)
  const messagesForApi = useMemo(() => 
    messages.map(m => ({
      role: m.role,
      content: m.content,
      meals: m.meals,
      timestamp: new Date(m.timestamp),
    })), 
    [messages]
  );

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // If no active conversation, create one
    if (!activeConversationId) {
      createConversation();
    }

    // Add user message to context
    const userMessage: Omit<ChatMessage, 'id'> = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMessage);
    setIsLoading(true);

    try {
      // Pass weekStartsOn setting so meals get assigned to correct dates
      const response = await sendMessage(content, messagesForApi, settings.weekStartsOn, new Date());
      
      // Add assistant message to context
      const assistantMessage: Omit<ChatMessage, 'id'> = {
        role: 'assistant',
        content: response.message || "I've prepared your meals!",
        meals: response.meals.length > 0 ? response.meals : undefined,
        timestamp: new Date().toISOString(),
      };
      addMessage(assistantMessage);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Omit<ChatMessage, 'id'> = {
        role: 'assistant',
        content: error instanceof Error 
          ? `Sorry, I encountered an error: ${error.message}` 
          : 'Sorry, something went wrong. Please try again.',
        timestamp: new Date().toISOString(),
      };
      addMessage(errorMessage);
      addToast('Failed to get response', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [messagesForApi, isLoading, addToast, settings.weekStartsOn, addMessage, activeConversationId, createConversation]);

  const handleAddMeals = useCallback((meals: Meal[], messageIndex: number) => {
    importMeals(meals, false);
    setAddedMessageIds(prev => new Set(prev).add(String(messageIndex)));
    addToast(`Added ${meals.length} meal${meals.length !== 1 ? 's' : ''} to your plan!`, 'success');
  }, [importMeals, addToast]);

  // Reset addedMessageIds when switching conversations
  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

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
            To use the AI meal planner, you need to add your Google AI API key.
          </p>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 text-left">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              1. Get a free API key from{' '}
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-600 dark:text-orange-400 hover:underline"
              >
                Google AI Studio
              </a>
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              2. Open the <code className="bg-slate-200 dark:bg-slate-600 px-1 rounded">.env</code> file in your project
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              3. Set <code className="bg-slate-200 dark:bg-slate-600 px-1 rounded">VITE_GOOGLE_AI_KEY</code> to your key
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
        <div className="flex items-center justify-between">
          {/* Left: Menu button (mobile) + Avatar + Title */}
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <List size={24} className="text-slate-600 dark:text-slate-400" />
            </button>
            
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
              <ChefHat size={20} weight="fill" className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">Chef Alex</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">Your personal chef assistant</p>
            </div>
          </div>

          {/* Right: New Chat button (mobile) */}
          <button
            onClick={() => createConversation()}
            className="lg:hidden flex items-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-sm shadow-orange-500/20"
          >
            <Plus size={18} weight="bold" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <ChatDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Main chat area with sidebar */}
      <div className="flex-1 flex min-h-0 rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
        {/* Sidebar */}
        <ChatHistorySidebar 
          isCollapsed={sidebarCollapsed} 
          onToggleCollapse={handleToggleSidebar} 
        />

        {/* Chat content */}
        <div className="flex-1 bg-slate-100/80 dark:bg-slate-800/50 backdrop-blur-sm flex flex-col min-h-0">
          {messages.length === 0 ? (
            // Empty state with suggestions - scrollable on mobile
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col items-center justify-center min-h-full p-4 sm:p-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-xl shadow-orange-500/30">
                  <ChefHat size={32} weight="fill" className="text-white sm:hidden" />
                  <ChefHat size={40} weight="fill" className="text-white hidden sm:block" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold font-display text-slate-800 dark:text-slate-200 mb-1">
                  Hey there! I'm Chef Alex
                </h2>
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-3 sm:mb-4">
                  Ready to cook up something great!
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-md mb-4 sm:mb-6 hidden sm:block">
                  Tell me what you're in the mood for, any dietary needs, or how much time you've got - I'll put together the perfect meal plan for you.
                </p>
                
                <div className="w-full max-w-md space-y-2">
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    Try asking:
                  </p>
                  {SUGGESTION_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(prompt)}
                      disabled={isLoading}
                      className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm hover:bg-orange-50 dark:hover:bg-slate-600 border border-slate-200/50 dark:border-slate-600/50 hover:border-orange-200/50 dark:hover:border-orange-700/50 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:text-orange-700 dark:hover:text-orange-400 transition-all duration-200 disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
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
    </div>
  );
}
