import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ChatMessage, Conversation, ChatState, ChatActions, Meal } from '../types';
import { useAccount } from './AccountContext';

interface ChatContextType extends ChatState, ChatActions {
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextType | null>(null);

// Generate unique ID
function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11);
}

// Generate title from first user message
function generateTitle(message: string): string {
  const trimmed = message.trim();
  if (trimmed.length <= 40) {
    return trimmed;
  }
  return trimmed.substring(0, 40) + '...';
}

interface DbMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  meals?: Meal[];
  timestamp: string;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn } = useAccount();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch conversations from Supabase
  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return;
    }

    if (data) {
      const mappedConversations: Conversation[] = data.map(row => ({
        id: row.id,
        title: row.title,
        messages: (row.messages as DbMessage[]) || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
      setConversations(mappedConversations);
    }
  }, [user?.id]);

  // Load data when user logs in
  useEffect(() => {
    if (isLoggedIn && user?.id) {
      setIsLoading(true);
      fetchConversations().finally(() => setIsLoading(false));
    } else {
      // Clear data on logout
      setConversations([]);
      setActiveConversationId(null);
      setIsLoading(false);
    }
  }, [isLoggedIn, user?.id, fetchConversations]);

  // Create a new conversation
  const createConversation = useCallback((): string => {
    const newId = generateId();
    const newConversation: Conversation = {
      id: newId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistically add to local state
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newId);

    // Save to database (fire and forget for better UX)
    if (user?.id) {
      supabase
        .from('conversations')
        .insert({
          id: newId,
          user_id: user.id,
          title: 'New Chat',
          messages: [],
        })
        .then(({ error }) => {
          if (error) console.error('Error creating conversation:', error);
        });
    }

    return newId;
  }, [user?.id]);

  // Delete a conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    // Optimistically update local state
    setConversations(prev => {
      const newConversations = prev.filter(c => c.id !== conversationId);
      return newConversations;
    });

    // Update active conversation if needed
    setActiveConversationId(prev => {
      if (prev === conversationId) {
        const remaining = conversations.filter(c => c.id !== conversationId);
        return remaining.length > 0 ? remaining[0].id : null;
      }
      return prev;
    });

    // Delete from database
    if (user?.id) {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting conversation:', error);
        // Refresh on error to restore state
        await fetchConversations();
      }
    }
  }, [user?.id, conversations, fetchConversations]);

  // Switch to a different conversation
  const switchConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
  }, []);

  // Clear active conversation (reset to new chat state)
  const clearActiveConversation = useCallback(() => {
    setActiveConversationId(null);
  }, []);

  // Add a message to the active conversation
  const addMessage = useCallback(async (message: Omit<ChatMessage, 'id'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
    };

    // If no active conversation, create one
    if (!activeConversationId) {
      const newId = generateId();
      const title = message.role === 'user' ? generateTitle(message.content) : 'New Chat';
      
      const newConversation: Conversation = {
        id: newId,
        title,
        messages: [newMessage],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setConversations(prev => [newConversation, ...prev]);
      setActiveConversationId(newId);

      // Save to database
      if (user?.id) {
        supabase
          .from('conversations')
          .insert({
            id: newId,
            user_id: user.id,
            title,
            messages: [newMessage],
          })
          .then(({ error }) => {
            if (error) console.error('Error creating conversation:', error);
          });
      }

      return;
    }

    // Add message to existing conversation
    setConversations(prev => prev.map(conv => {
      if (conv.id !== activeConversationId) return conv;

      // Update title if this is the first user message
      const shouldUpdateTitle = conv.title === 'New Chat' && 
        message.role === 'user' && 
        conv.messages.length === 0;

      return {
        ...conv,
        title: shouldUpdateTitle ? generateTitle(message.content) : conv.title,
        messages: [...conv.messages, newMessage],
        updatedAt: new Date().toISOString(),
      };
    }));

    // Update in database
    if (user?.id) {
      const conversation = conversations.find(c => c.id === activeConversationId);
      if (conversation) {
        const newMessages = [...conversation.messages, newMessage];
        const shouldUpdateTitle = conversation.title === 'New Chat' && 
          message.role === 'user' && 
          conversation.messages.length === 0;

        const updates: Record<string, unknown> = {
          messages: newMessages,
          updated_at: new Date().toISOString(),
        };

        if (shouldUpdateTitle) {
          updates.title = generateTitle(message.content);
        }

        supabase
          .from('conversations')
          .update(updates)
          .eq('id', activeConversationId)
          .eq('user_id', user.id)
          .then(({ error }) => {
            if (error) console.error('Error updating conversation:', error);
          });
      }
    }
  }, [activeConversationId, conversations, user?.id]);

  // Get the active conversation
  const getActiveConversation = useCallback((): Conversation | null => {
    if (!activeConversationId) return null;
    return conversations.find(c => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  const value: ChatContextType = {
    conversations,
    activeConversationId,
    isLoading,
    createConversation,
    deleteConversation,
    switchConversation,
    clearActiveConversation,
    addMessage,
    getActiveConversation,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
