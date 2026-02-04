import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ChatInput({ onSend, disabled, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && !isLoading) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-end gap-2 bg-white border border-slate-200 rounded-2xl p-2 shadow-sm focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me to plan your meals..."
          disabled={disabled || isLoading}
          rows={1}
          className="flex-1 resize-none bg-transparent border-0 focus:outline-none focus:ring-0 px-2 py-1.5 text-slate-800 placeholder:text-slate-400 text-sm disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled || isLoading}
          className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
      <p className="text-xs text-slate-400 mt-2 text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  );
}
