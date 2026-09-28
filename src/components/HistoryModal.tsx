import React, { useEffect } from 'react';
import { X, History, Trash2, ArrowRight } from 'lucide-react';
import { GeneratedContent } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: GeneratedContent[];
  onSelectHistory: (item: GeneratedContent) => void;
  onDeleteHistory: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistory,
  onDeleteHistory,
  onClearAll,
}) => {
  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#11141c] border border-zinc-200 dark:border-[#232733] rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl transition-colors">
        {/* Header */}
        <div className="px-4 py-3 bg-zinc-50 dark:bg-[#0c0e14] border-b border-zinc-200 dark:border-[#232733] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Saved Generations</h3>
            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">({history.length})</span>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 px-2 py-1 rounded-md transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-md transition-colors"
              title="Close modal"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-2 scrollbar-thin">
          {history.length === 0 ? (
            <div className="py-10 text-center text-zinc-500 dark:text-zinc-400 text-xs space-y-1">
              <p className="font-medium text-zinc-800 dark:text-zinc-300">No saved history yet</p>
              <p className="text-zinc-500">
                Generated content will be automatically saved here for quick reloading.
              </p>
            </div>
          ) : (
            history.map((item) => {
              const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  className="bg-zinc-50 dark:bg-[#0c0e14] border border-zinc-200 dark:border-[#202531] hover:border-zinc-300 dark:hover:border-zinc-700 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => onSelectHistory(item)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700">
                        {item.detectedLanguage || 'Code'}
                      </span>
                      <h4 className="text-xs font-medium text-zinc-900 dark:text-zinc-200 truncate">
                        {item.title || item.devtoIntro?.articleTitle || 'Untitled'}
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1 mb-1.5">{item.summary}</p>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                      <span>{dateStr}</span>
                      <span>•</span>
                      <span>{item.twitterThread.length} tweets</span>
                      <span>•</span>
                      <span>LinkedIn</span>
                      <span>•</span>
                      <span>Dev.to</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => onSelectHistory(item)}
                      className="px-2.5 py-1 rounded-md bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium flex items-center gap-1 transition-colors"
                      title="Load this record"
                    >
                      <span>Load</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteHistory(item.id)}
                      className="p-1 text-zinc-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 transition-colors"
                      title="Delete"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-zinc-50 dark:bg-[#0c0e14] border-t border-zinc-200 dark:border-[#232733] text-xs text-zinc-500 flex justify-between items-center">
          <span className="font-mono text-[11px]">Storage: LocalStorage</span>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white font-medium"
          >
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
