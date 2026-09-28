import React, { useState } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  Edit3,
  Maximize2,
  Minimize2,
  ClipboardCheck,
} from 'lucide-react';

interface LinkedInCardProps {
  post: string;
  onUpdatePost: (post: string) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
  onCopyText: (text: string, label: string) => void;
}

// Clean standard LinkedIn logo icon for the icon button
const LinkedInIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.78a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
  </svg>
);

export const LinkedInCard: React.FC<LinkedInCardProps> = ({
  post,
  onUpdatePost,
  onRegenerate,
  isRegenerating,
  onCopyText,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const countWords = (str: string) => {
    const trimmed = str.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  };

  const currentWordCount = isEditing ? countWords(editText) : countWords(post);
  const currentCharCount = isEditing ? editText.length : (post ? post.length : 0);

  const handleStartEdit = () => {
    setEditText(post);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onUpdatePost(editText);
    setIsEditing(false);
  };

  const handleCopy = () => {
    onCopyText(post, 'Copied LinkedIn post to clipboard');
    setIsCopied(true);
    setCopiedNotice(true);
    setTimeout(() => setIsCopied(false), 2000);
    setTimeout(() => setCopiedNotice(false), 5000);
  };

  const handleOpenLinkedIn = () => {
    handleCopy();
    window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank', 'noopener,noreferrer');
  };

  const formatLinkedInText = (text: string) => {
    const paragraphs = text.split('\n');
    return paragraphs.map((para, i) => {
      if (!para.trim()) {
        return <div key={i} className="h-1.5" />;
      }

      const words = para.split(' ');
      const content = words.map((w, wi) => {
        if (w.startsWith('#')) {
          return (
            <span key={wi} className="text-blue-600 dark:text-blue-400 font-medium">
              {w}{' '}
            </span>
          );
        }
        return w + ' ';
      });

      return (
        <p key={i} className="text-zinc-800 dark:text-zinc-200 text-xs sm:text-[13px] leading-relaxed font-sans break-words">
          {content}
        </p>
      );
    });
  };

  return (
    <div
      className={`h-full flex flex-col bg-white dark:bg-[#11141c] border border-zinc-200 dark:border-[#232733] rounded-xl overflow-hidden transition-all shadow-xs ${
        isExpanded ? 'col-span-1 lg:col-span-3' : 'col-span-1'
      }`}
    >
      {/* Header */}
      <div className="px-3.5 py-2 bg-zinc-50 dark:bg-[#0e1118] border-b border-zinc-200 dark:border-[#232733] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            LinkedIn
          </span>
          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            ({currentWordCount} words)
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="p-1 rounded-lg text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:text-zinc-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/40 transition-colors disabled:opacity-50"
            title="Regenerate LinkedIn post"
            aria-label="Regenerate LinkedIn post"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-blue-500' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-[#1a202c] dark:hover:bg-[#242c3d] dark:text-zinc-200 border border-zinc-200 dark:border-[#2b3548] dark:hover:text-white transition-colors"
            title="Copy post content to clipboard"
            aria-label="Copy post content to clipboard"
          >
            {isCopied ? (
              <Check className="w-3 h-3 text-emerald-500" />
            ) : (
              <Copy className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
            )}
            <span>{isCopied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors hidden lg:block"
            title={isExpanded ? 'Collapse' : 'Expand full width'}
            aria-label={isExpanded ? 'Collapse' : 'Expand full width'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* LinkedIn Post Content (Tightened spacing, no forced internal scrollbar) */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col">
        <div className="bg-zinc-50/70 dark:bg-[#0c0e14] border border-zinc-200 dark:border-[#202531] rounded-lg p-2.5 sm:p-3 space-y-2 flex-1 flex flex-col justify-between">
          <div>
            {/* Metadata Row */}
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-zinc-200 dark:border-[#1c212c] text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
              <span className="text-blue-600 dark:text-blue-400/90 font-medium">Post Draft</span>
              {!isEditing && (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="flex items-center gap-1 text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-300 transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {/* Body Content */}
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={8}
                  className="w-full bg-white dark:bg-[#161a23] border border-blue-400 dark:border-blue-700/60 rounded-lg p-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed font-sans"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-blue-600 dark:text-blue-300">
                    {currentWordCount} words • {editText.length} chars
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-2.5 py-1 text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="px-3 py-1 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 rounded-md transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1">{formatLinkedInText(post)}</div>
            )}

            {/* Paste Helper Banner */}
            {copiedNotice && (
              <div className="mt-2.5 p-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 rounded-lg text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
                <ClipboardCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-tight">
                  <span className="font-semibold text-blue-700 dark:text-blue-100">Copied to clipboard.</span>{' '}
                  <span className="text-blue-600 dark:text-blue-300/90">
                    Paste with <kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/60 border border-blue-300 dark:border-blue-700/50 rounded font-mono text-[10px]">Ctrl+V</kbd> (or <kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/60 border border-blue-300 dark:border-blue-700/50 rounded font-mono text-[10px]">⌘V</kbd>) in LinkedIn.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Row: Replaced buttons with 2 small icon buttons side by side (Requirement 1) */}
          {!isEditing && (
            <div className="pt-2 mt-2 border-t border-zinc-200 dark:border-[#1c212c] flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                {currentWordCount} words • {currentCharCount} chars
              </span>
              <div className="flex items-center gap-1.5">
                {/* Icon Button 1: Copy Text with tooltip on hover */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-[#2b3345] bg-white hover:bg-zinc-100 dark:bg-[#161a23] dark:hover:bg-[#1e2433] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  title="Copy text to clipboard"
                  aria-label="Copy text to clipboard"
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Icon Button 2: LinkedIn Logo Icon for copy & open LinkedIn with tooltip on hover */}
                <button
                  type="button"
                  onClick={handleOpenLinkedIn}
                  className="p-1.5 rounded-lg border border-blue-500/30 bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                  title="Copy post and open LinkedIn"
                  aria-label="Copy post and open LinkedIn"
                >
                  <LinkedInIcon className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card bottom indicator */}
      <div className="px-3.5 py-1.5 bg-zinc-50 dark:bg-[#0e1118] border-t border-zinc-200 dark:border-[#232733] flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
        <span className="text-blue-600 dark:text-blue-400/90 font-medium">{currentWordCount} words total</span>
        <span>{currentCharCount} characters</span>
      </div>
    </div>
  );
};
