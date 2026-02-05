import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ChatMessage, Conversation, ChatState, ChatActions } from '../types';
import { useAccount } from './AccountContext';

interface ChatContextType extends ChatState, ChatActions {}

const ChatContext = createContext<ChatContextType | null>(null);

const STORAGE_KEY_PREFIX = 'mealplan-chat';

interface StoredChatData {
  conversations: Conversation[];
  activeConversationId: string | null;
}

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// Generate title from first user message
function generateTitle(message: string): string {
  const trimmed = message.trim();
  if (trimmed.length <= 40) {
    return trimmed;
  }
  return trimmed.substring(0, 40) + '...';
}

// Helper to get user-specific storage key
function getStorageKey(userId: string | undefined): string {
  if (userId) {
    return `${STORAGE_KEY_PREFIX}-${userId}`;
  }
  return STORAGE_KEY_PREFIX;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAccount();
  
  // Generate storage key based on user ID for multi-user support
  const storageKey = useMemo(() => getStorageKey(user?.id), [user?.id]);
  
  const [data, setData] = useLocalStorage<StoredChatData>(storageKey, {
    conversations: [],
    activeConversationId: null,
  });

  // Create a new conversation
  const createConversation = useCallback((): string => {
    const newConversation: Conversation = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setData(prev => ({
      conversations: [newConversation, ...prev.conversations],
      activeConversationId: newConversation.id,
    }));

    return newConversation.id;
  }, [setData]);

  // Delete a conversation
  const deleteConversation = useCallback((conversationId: string) => {
    setData(prev => {
      const newConversations = prev.conversations.filter(c => c.id !== conversationId);
      const newActiveId = prev.activeConversationId === conversationId
        ? (newConversations.length > 0 ? newConversations[0].id : null)
        : prev.activeConversationId;

      return {
        conversations: newConversations,
        activeConversationId: newActiveId,
      };
    });
  }, [setData]);

  // Switch to a different conversation
  const switchConversation = useCallback((conversationId: string) => {
    setData(prev => ({
      ...prev,
      activeConversationId: conversationId,
    }));
  }, [setData]);

  // Clear active conversation (reset to new chat state)
  const clearActiveConversation = useCallback(() => {
    setData(prev => ({
      ...prev,
      activeConversationId: null,
    }));
  }, [setData]);

  // Add a message to the active conversation
  const addMessage = useCallback((message: Omit<ChatMessage, 'id'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
    };

    setData(prev => {
      // If no active conversation, create one
      if (!prev.activeConversationId) {
        const newConversation: Conversation = {
          id: generateId(),
          title: message.role === 'user' ? generateTitle(message.content) : 'New Chat',
          messages: [newMessage],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return {
          conversations: [newConversation, ...prev.conversations],
          activeConversationId: newConversation.id,
        };
      }

      // Add message to existing conversation
      return {
        ...prev,
        conversations: prev.conversations.map(conv => {
          if (conv.id !== prev.activeConversationId) return conv;

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
        }),
      };
    });
  }, [setData]);

  // Get the active conversation
  const getActiveConversation = useCallback((): Conversation | null => {
    if (!data.activeConversationId) return null;
    return data.conversations.find(c => c.id === data.activeConversationId) || null;
  }, [data.conversations, data.activeConversationId]);

  const value: ChatContextType = {
    conversations: data.conversations,
    activeConversationId: data.activeConversationId,
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
