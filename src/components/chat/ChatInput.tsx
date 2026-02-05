import { useState, useRef, useEffect } from 'react';
import { PaperPlaneRight, CircleNotch } from '@phosphor-icons/react';

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
      <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-2 shadow-lg dark:shadow-slate-900/20 focus-within:border-orange-300/50 dark:focus-within:border-orange-600/50 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me to plan your meals..."
          disabled={disabled || isLoading}
          rows={1}
          className="flex-1 resize-none bg-transparent border-none outline-none ring-0 focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0 px-3 py-2 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm disabled:opacity-50"
          style={{ boxShadow: 'none', outline: 'none' }}
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled || isLoading}
          className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 shadow-lg shadow-orange-500/20 active:scale-95"
        >
          {isLoading ? (
            <CircleNotch size={20} weight="bold" className="animate-spin" />
          ) : (
            <PaperPlaneRight size={20} weight="duotone" />
          )}
        </button>
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  );
}
