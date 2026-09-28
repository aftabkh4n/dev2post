import React, { useState } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  Edit3,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { DevToIntro } from '../types';

interface DevToCardProps {
  devto: DevToIntro;
  onUpdateDevTo: (devto: DevToIntro) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
  onCopyText: (text: string, label: string) => void;
}

export const DevToCard: React.FC<DevToCardProps> = ({
  devto,
  onUpdateDevTo,
  onRegenerate,
  isRegenerating,
  onCopyText,
}) => {
  const [viewMode, setViewMode] = useState<'preview' | 'markdown'>('preview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(devto.articleTitle);
  const [editedHook, setEditedHook] = useState(devto.hookParagraph);
  const [editedBody, setEditedBody] = useState(devto.bodyParagraph);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const countWords = (str: string) => {
    const trimmed = str.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  };

  const getWordStats = () => {
    const titleW = isEditing ? countWords(editedTitle) : countWords(devto.articleTitle);
    const hookW = isEditing ? countWords(editedHook) : countWords(devto.hookParagraph);
    const bodyW = isEditing ? countWords(editedBody) : countWords(devto.bodyParagraph);
    const bulletsW = devto.takeawayBullets.reduce((acc, b) => acc + countWords(b), 0);
    const total = titleW + hookW + bodyW + bulletsW;
    return { total, hookW, bodyW, bulletsW };
  };

  const stats = getWordStats();

  const startEdit = () => {
    setEditedTitle(devto.articleTitle);
    setEditedHook(devto.hookParagraph);
    setEditedBody(devto.bodyParagraph);
    setIsEditing(true);
  };

  const saveEdit = () => {
    onUpdateDevTo({
      ...devto,
      articleTitle: editedTitle,
      hookParagraph: editedHook,
      bodyParagraph: editedBody,
    });
    setIsEditing(false);
  };

  const getMarkdownRepresentation = () => {
    const tagsFormatted = devto.tags.map((t) => t.replace(/^#/, '')).join(', ');
    return `---
title: ${devto.articleTitle}
published: false
tags: ${tagsFormatted}
---

${devto.hookParagraph}

${devto.bodyParagraph}

### What We'll Cover:
${devto.takeawayBullets.map((bullet) => `- ${bullet}`).join('\n')}
`;
  };

  const handleCopyMarkdown = () => {
    onCopyText(getMarkdownRepresentation(), 'Copied Dev.to article intro (Markdown) to clipboard');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
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
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Dev.to
          </span>
          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            ({stats.total} words)
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-zinc-100 dark:bg-[#0c0e14] border border-zinc-200 dark:border-[#202531] p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                viewMode === 'preview'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-medium border border-emerald-300 dark:border-emerald-800/40'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
              title="Preview mode"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => setViewMode('markdown')}
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                viewMode === 'markdown'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-medium border border-emerald-300 dark:border-emerald-800/40'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
              title="Markdown mode"
            >
              MD
            </button>
          </div>

          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="p-1 rounded-lg text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-zinc-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-950/40 transition-colors disabled:opacity-50"
            title="Regenerate Dev.to intro"
            aria-label="Regenerate Dev.to intro"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-[#1a202c] dark:hover:bg-[#242c3d] dark:text-zinc-200 border border-zinc-200 dark:border-[#2b3548] dark:hover:text-white transition-colors"
            title="Copy markdown"
            aria-label="Copy markdown"
          >
            {isCopied ? (
              <Check className="w-3 h-3 text-emerald-500" />
            ) : (
              <Copy className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
            )}
            <span>{isCopied ? 'Copied' : 'Copy MD'}</span>
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

      {/* Main Content (Tightened spacing, no forced internal scrollbar) */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col">
        {viewMode === 'markdown' ? (
          <div className="relative flex-1">
            <pre className="bg-zinc-50 dark:bg-[#0c0e14] p-2.5 rounded-lg border border-zinc-200 dark:border-[#202531] font-mono text-xs text-zinc-800 dark:text-emerald-200/90 leading-relaxed overflow-x-auto whitespace-pre-wrap break-words h-full">
              {getMarkdownRepresentation()}
            </pre>
          </div>
        ) : (
          <div className="bg-zinc-50/70 dark:bg-[#0c0e14] border border-zinc-200 dark:border-[#202531] rounded-lg p-2.5 sm:p-3 space-y-2 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              {/* Metadata Tags */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1.5 border-b border-zinc-200 dark:border-[#1c212c]">
                <div className="flex flex-wrap items-center gap-1">
                  {devto.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.2 rounded text-[10px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 font-medium"
                    >
                      #{tag.replace(/^#/, '')}
                    </span>
                  ))}
                </div>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400/90 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/30">
                  {devto.estimatedReadTime || '3 min read'}
                </span>
              </div>

              {/* Editing mode or article view */}
              {isEditing ? (
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 dark:text-zinc-400 mb-0.5">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="w-full bg-white dark:bg-[#161a23] border border-emerald-400 dark:border-emerald-700/60 rounded-md p-1.5 text-xs text-zinc-900 dark:text-white font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-emerald-600 dark:text-emerald-300 mb-0.5">
                      Hook Paragraph
                    </label>
                    <textarea
                      value={editedHook}
                      onChange={(e) => setEditedHook(e.target.value)}
                      rows={2}
                      className="w-full bg-white dark:bg-[#161a23] border border-emerald-400 dark:border-emerald-700/60 rounded-md p-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 dark:text-zinc-400 mb-0.5">
                      Context Paragraph
                    </label>
                    <textarea
                      value={editedBody}
                      onChange={(e) => setEditedBody(e.target.value)}
                      rows={3}
                      className="w-full bg-white dark:bg-[#161a23] border border-emerald-400 dark:border-emerald-700/60 rounded-md p-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-300">
                      {stats.total} words ({stats.hookW} hook, {stats.bodyW} context)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-2 py-0.5 text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-600 text-white dark:bg-emerald-500 dark:text-zinc-950 rounded-md transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Article Title */}
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white tracking-tight leading-snug break-words">
                      {devto.articleTitle}
                    </h2>
                    <button
                      type="button"
                      onClick={startEdit}
                      className="p-0.5 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-300 rounded transition-colors shrink-0"
                      title="Edit text"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Hook Box */}
                  <div className="border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-lg p-2 sm:p-2.5">
                    <div className="text-[9px] font-mono font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-0.5">
                      Opening Hook
                    </div>
                    <p className="text-xs sm:text-[13px] text-zinc-800 dark:text-zinc-200 leading-snug font-sans break-words">
                      {devto.hookParagraph}
                    </p>
                  </div>

                  {/* Body Paragraph */}
                  <div className="text-xs sm:text-[13px] text-zinc-700 dark:text-zinc-300 leading-snug font-sans break-words">
                    <p>{devto.bodyParagraph}</p>
                  </div>

                  {/* Bullets */}
                  {devto.takeawayBullets && devto.takeawayBullets.length > 0 && (
                    <div className="bg-white dark:bg-[#12161f] border border-zinc-200 dark:border-[#202531] rounded-lg p-2 sm:p-2.5">
                      <div className="text-[9px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1 font-semibold">
                        Key Takeaways:
                      </div>
                      <ul className="space-y-0.5">
                        {devto.takeawayBullets.map((bullet, idx) => (
                          <li key={idx} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-baseline gap-1.5 break-words">
                            <span className="text-emerald-500 font-mono text-[10px]">•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card bottom indicator */}
      <div className="px-3.5 py-1.5 bg-zinc-50 dark:bg-[#0e1118] border-t border-zinc-200 dark:border-[#232733] flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mt-auto">
        <span className="text-emerald-600 dark:text-emerald-400/90 font-medium">{stats.total} words ({stats.hookW} hook)</span>
        <span>{devto.estimatedReadTime || '3 min read'}</span>
      </div>
    </div>
  );
};
