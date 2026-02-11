import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash, ChatCircle } from '@phosphor-icons/react';
import { useChat } from '../../context/ChatContext';
import { Conversation } from '../../types';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
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

export function ChatDrawer({ isOpen, onClose }: ChatDrawerProps) {
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
    onClose();
  };

  const handleDeleteClick = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (deleteConfirmId === conversationId) {
      deleteConversation(conversationId);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(conversationId);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const handleConversationClick = (conversation: Conversation) => {
    switchConversation(conversation.id);
    setDeleteConfirmId(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="lg:hidden fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Chat History
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X size={20} className="text-slate-500 dark:text-slate-400" />
                </button>
              </div>
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-all duration-200 shadow-sm shadow-orange-500/20"
              >
                <Plus size={18} weight="bold" />
                New Chat
              </button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto p-3">
              {conversations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <ChatCircle size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">
                    No conversations yet
                  </p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                    Start a new chat with Chef Alex
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {conversations.map((conversation) => (
                    <li key={conversation.id}>
                      <button
                        onClick={() => handleConversationClick(conversation)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                          activeConversationId === conversation.id
                            ? 'bg-orange-500/10 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">
                              {conversation.title}
                            </p>
                            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                              {formatRelativeTime(conversation.updatedAt)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleDeleteClick(e, conversation.id)}
                            className={`flex-shrink-0 p-2 rounded-lg transition-all duration-200 ${
                              deleteConfirmId === conversation.id
                                ? 'bg-red-500 text-white'
                                : 'opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500'
                            }`}
                            title={deleteConfirmId === conversation.id ? 'Tap again to confirm' : 'Delete conversation'}
                          >
                            <Trash size={16} weight={deleteConfirmId === conversation.id ? 'fill' : 'regular'} />
                          </button>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
