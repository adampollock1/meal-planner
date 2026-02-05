import { useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatMessage as ChatMessageType } from '../../services/geminiService';
import { Meal } from '../../types';

interface ChatContainerProps {
  messages: ChatMessageType[];
  onAddMeals: (meals: Meal[]) => void;
  addedMessageIds: Set<string>;
}

export function ChatContainer({ messages, onAddMeals, addedMessageIds }: ChatContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-5"
    >
      {messages.map((message, index) => (
        <ChatMessage 
          key={index} 
          message={message}
          onAddMeals={onAddMeals}
          mealsAdded={addedMessageIds.has(String(index))}
        />
      ))}
    </div>
  );
}
