import { useState } from 'react';
import { Plus, Trash, ChatCircle, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { useChat } from '../../context/ChatContext';
import { Conversation } from '../../types';

interface ChatHistorySidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

// Format relative time (e.g., "2 hours ago", "Yesterday")
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ChatHistorySidebar({ isCollapsed, onToggleCollapse }: ChatHistorySidebarProps) {
  const { 
    conversations, 
    activeConversationId, 
    createConversation, 
    deleteConversation, 
    switchConversation 
  } = useChat();
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleNewChat = () => {
    createConversation();
  };

  const handleDeleteClick = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (deleteConfirmId === conversationId) {
      deleteConversation(conversationId);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(conversationId);
      // Auto-reset after 3 seconds
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const handleConversationClick = (conversation: Conversation) => {
    switchConversation(conversation.id);
    setDeleteConfirmId(null);
  };

  if (isCollapsed) {
    return (
      <div className="hidden lg:flex flex-shrink-0 w-12 bg-slate-50/80 dark:bg-slate-800/50 border-r border-slate-200/50 dark:border-slate-700/50 flex-col">
        <button
          onClick={onToggleCollapse}
          className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
          title="Expand sidebar"
        >
          <CaretRight size={20} className="text-slate-500 dark:text-slate-400" />
        </button>
        <button
          onClick={handleNewChat}
          className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
          title="New chat"
        >
          <Plus size={20} className="text-slate-500 dark:text-slate-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex flex-shrink-0 w-64 bg-slate-50/80 dark:bg-slate-800/50 border-r border-slate-200/50 dark:border-slate-700/50 flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Chat History</h3>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
            title="Collapse sidebar"
          >
            <CaretLeft size={16} className="text-slate-400 dark:text-slate-500" />
          </button>
        </div>
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-sm shadow-orange-500/20"
        >
          <Plus size={16} weight="bold" />
          New Chat
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="text-center py-8 px-4">
            <ChatCircle size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm text-slate-400 dark:text-slate-500">
              No conversations yet
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Start a new chat with Chef Alex
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <button
                  onClick={() => handleConversationClick(conversation)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                    activeConversationId === conversation.id
                      ? 'bg-orange-500/10 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {conversation.title}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {formatRelativeTime(conversation.updatedAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteClick(e, conversation.id)}
                      className={`flex-shrink-0 p-1.5 rounded-lg transition-all duration-200 ${
                        deleteConfirmId === conversation.id
                          ? 'bg-red-500 text-white'
                          : 'opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 hover:text-red-500'
                      }`}
                      title={deleteConfirmId === conversation.id ? 'Click again to confirm' : 'Delete conversation'}
                    >
                      <Trash size={14} weight={deleteConfirmId === conversation.id ? 'fill' : 'regular'} />
                    </button>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
