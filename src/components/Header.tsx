import React from 'react';
import { Terminal, History, Download, Trash2, Sun, Moon } from 'lucide-react';
import { GeneratedContent } from '../types';

interface HeaderProps {
  historyCount: number;
  onOpenHistory: () => void;
  generatedContent: GeneratedContent | null;
  onExportMarkdown: () => void;
  onReset: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  historyCount,
  onOpenHistory,
  generatedContent,
  onExportMarkdown,
  onReset,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="border-b border-zinc-200 dark:border-[#232733] bg-white/95 dark:bg-[#0c0e14]/95 sticky top-0 z-40 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Logo & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-center justify-center text-amber-500 dark:text-amber-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              CodeToContent
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-amber-700 bg-amber-100 border border-amber-300 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/20">
                v2.1
              </span>
            </span>
            <span className="hidden sm:inline text-xs text-zinc-500 dark:text-zinc-400">
              Technical Content Publisher
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {generatedContent && (
            <>
              <button
                type="button"
                onClick={onExportMarkdown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700 bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 dark:text-zinc-200 dark:bg-[#161b26] dark:border-[#2b3245] dark:hover:bg-[#1f2637] dark:hover:text-white transition-colors"
                title="Export all 3 formats as a Markdown file"
              >
                <Download className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                <span>Export (.md)</span>
              </button>

              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:text-zinc-400 dark:hover:text-rose-300 dark:hover:bg-rose-950/20 transition-colors"
                title="Reset input and clear output"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </>
          )}

          {/* History Button */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700 bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 dark:text-zinc-300 dark:bg-[#161b26] dark:border-[#2b3245] dark:hover:border-zinc-600 dark:hover:bg-[#1f2637] dark:hover:text-white transition-colors"
            title="View saved content history"
          >
            <History className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30">
                {historyCount}
              </span>
            )}
          </button>

          {/* Dark / Light Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 dark:text-zinc-300 dark:hover:text-white dark:bg-[#161b26] dark:border-[#2b3245] dark:hover:bg-[#1f2637] transition-colors"
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
