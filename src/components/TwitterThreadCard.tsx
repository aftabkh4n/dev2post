import React, { useState } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Edit3,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { TweetItem } from '../types';

interface TwitterThreadCardProps {
  tweets: TweetItem[];
  onUpdateTweets: (tweets: TweetItem[]) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
  onCopyText: (text: string, label: string) => void;
}

export const TwitterThreadCard: React.FC<TwitterThreadCardProps> = ({
  tweets,
  onUpdateTweets,
  onRegenerate,
  isRegenerating,
  onCopyText,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedThread, setCopiedThread] = useState(false);
  const [copiedTweetIdx, setCopiedTweetIdx] = useState<number | null>(null);

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditText(tweets[index].text);
  };

  const saveEdit = (index: number) => {
    const updated = [...tweets];
    updated[index] = { ...updated[index], text: editText };
    onUpdateTweets(updated);
    setEditingIndex(null);
  };

  const countWords = (str: string) => {
    const trimmed = str.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  };

  const totalWords = tweets.reduce((acc, t, idx) => {
    const textToCount = editingIndex === idx ? editText : t.text;
    return acc + countWords(textToCount);
  }, 0);

  const getFullThreadText = () => {
    return tweets
      .map((t, idx) => `${idx + 1}/${tweets.length}\n${t.text}`)
      .join('\n\n---\n\n');
  };

  const handleCopyThread = () => {
    onCopyText(getFullThreadText(), 'Copied full thread to clipboard');
    setCopiedThread(true);
    setTimeout(() => setCopiedThread(false), 2000);
  };

  const handleCopySingleTweet = (text: string, idx: number) => {
    onCopyText(text, `Copied tweet ${idx + 1}`);
    setCopiedTweetIdx(idx);
    setTimeout(() => setCopiedTweetIdx(null), 2000);
  };

  const handleShareTweet = (text: string) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank', 'noopener,noreferrer');
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
          <span className="w-2 h-2 rounded-full bg-sky-400"></span>
          <span className="font-mono text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            X / Twitter
          </span>
          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            ({tweets.length} tweets)
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="p-1 rounded-lg text-zinc-500 hover:text-sky-600 hover:bg-sky-50 dark:text-zinc-400 dark:hover:text-sky-300 dark:hover:bg-sky-950/40 transition-colors disabled:opacity-50"
            title="Regenerate thread"
            aria-label="Regenerate thread"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-sky-500' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleCopyThread}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-[#1a202c] dark:hover:bg-[#242c3d] dark:text-zinc-200 border border-zinc-200 dark:border-[#2b3548] dark:hover:text-white transition-colors"
            title="Copy full thread"
            aria-label="Copy full thread"
          >
            {copiedThread ? (
              <Check className="w-3 h-3 text-emerald-500" />
            ) : (
              <Copy className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
            )}
            <span>{copiedThread ? 'Copied' : 'Copy Thread'}</span>
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

      {/* Connected Thread Content (Tightened spacing, no forced internal scrollbar) */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col space-y-2">
        {tweets.map((tweet, idx) => {
          const charLen = tweet.text.length;
          const isOverLimit = charLen > 280;
          const isNearLimit = charLen > 240 && !isOverLimit;
          const isLast = idx === tweets.length - 1;
          const isEditing = editingIndex === idx;
          const isTweetCopied = copiedTweetIdx === idx;

          return (
            <div key={idx} className="relative flex gap-2">
              {/* Thread Step Number & Connector Line */}
              <div className="flex flex-col items-center">
                <div className="w-5 h-5 rounded-md border border-sky-300 dark:border-sky-800/50 bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-700 dark:text-sky-300 font-mono text-[10px] shrink-0 font-semibold">
                  {idx + 1}
                </div>
                {!isLast && (
                  <div className="w-px grow bg-sky-200 dark:bg-sky-900/30 my-0.5 min-h-[12px]" />
                )}
              </div>

              {/* Tweet Box */}
              <div className="flex-1 min-w-0 bg-zinc-50/70 dark:bg-[#0c0e14] border border-zinc-200 dark:border-[#202531] rounded-lg p-2.5">
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-zinc-200 dark:border-[#1c212c] text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                  <span>Tweet {idx + 1}/{tweets.length}</span>
                  <span
                    className={
                      isOverLimit
                        ? 'text-rose-600 dark:text-rose-400 font-bold'
                        : isNearLimit
                        ? 'text-amber-600 dark:text-amber-400 font-medium'
                        : 'text-zinc-500 dark:text-zinc-400'
                    }
                  >
                    {countWords(tweet.text)}w • {charLen}/280
                  </span>
                </div>

                {/* Tweet Body / Edit */}
                {isEditing ? (
                  <div className="space-y-1.5 mt-1">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      className="w-full bg-white dark:bg-[#161a23] border border-sky-400 dark:border-sky-700/60 rounded-md p-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-sky-500 font-sans"
                    />
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                      <span className={editText.length > 280 ? 'text-rose-500' : 'text-sky-600 dark:text-sky-300'}>
                        {countWords(editText)} words • {editText.length}/280
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingIndex(null)}
                          className="px-2 py-0.5 text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEdit(idx)}
                          className="px-2.5 py-0.5 text-xs font-semibold bg-sky-500 text-white dark:bg-sky-400 dark:text-zinc-950 rounded-md"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs sm:text-[13px] text-zinc-800 dark:text-zinc-200 leading-snug whitespace-pre-wrap font-sans break-words">
                    {tweet.text}
                  </p>
                )}

                {/* Tweet Actions */}
                {!isEditing && (
                  <div className="mt-1.5 pt-1.5 border-t border-zinc-200 dark:border-[#1c212c] flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                    <button
                      type="button"
                      onClick={() => startEdit(idx)}
                      className="flex items-center gap-1 hover:text-sky-600 dark:hover:text-sky-300 transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopySingleTweet(tweet.text, idx)}
                        className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                        title="Copy this tweet"
                      >
                        {isTweetCopied ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{isTweetCopied ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShareTweet(tweet.text)}
                        className="flex items-center gap-1 text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
                        title="Post to X"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Post</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Card bottom indicator */}
      <div className="px-3.5 py-1.5 bg-zinc-50 dark:bg-[#0e1118] border-t border-zinc-200 dark:border-[#232733] flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mt-auto">
        <span className="text-sky-600 dark:text-sky-400/90 font-medium">{totalWords} words total</span>
        <span>{tweets.length} tweets</span>
      </div>
    </div>
  );
};
