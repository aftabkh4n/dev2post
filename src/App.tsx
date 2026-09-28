/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CodeInput } from './components/CodeInput';
import { TwitterThreadCard } from './components/TwitterThreadCard';
import { LinkedInCard } from './components/LinkedInCard';
import { DevToCard } from './components/DevToCard';
import { HistoryModal } from './components/HistoryModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  ContentTone,
  TargetAudience,
  GeneratedContent,
  SampleSnippet,
} from './types';
import { SAMPLE_SNIPPETS } from './data/presets';
import { Loader2, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'code_to_content_history_v1';

export default function App() {
  const [code, setCode] = useState<string>(SAMPLE_SNIPPETS[0].code);
  const [tone, setTone] = useState<ContentTone>('direct');
  const [audience, setAudience] = useState<TargetAudience>('developers');
  const [customInstructions, setCustomInstructions] = useState<string>('');

  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [regeneratingChannel, setRegeneratingChannel] = useState<'twitter' | 'linkedin' | 'devto' | null>(null);
  const [isFetchingGitHub, setIsFetchingGitHub] = useState<boolean>(false);

  const [history, setHistory] = useState<GeneratedContent[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [mobileTab, setMobileTab] = useState<'all' | 'twitter' | 'linkedin' | 'devto'>('all');

  // Dark / Light Theme State with localStorage and system preference persistence
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }, []);

  const saveToHistory = (item: GeneratedContent) => {
    try {
      const updated = [item, ...history.filter((h) => h.id !== item.id)].slice(0, 30);
      setHistory(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save to history:', e);
    }
  };

  const addToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast(label, 'success');
    } catch {
      addToast('Could not copy to clipboard', 'error');
    }
  };

  // Main Generation Handler (All 3 simultaneously)
  const handleGenerate = async () => {
    if (!code.trim()) {
      addToast('Please paste a code snippet or README first', 'info');
      return;
    }

    setIsLoading(true);
    setLoadingStep('Analyzing source architecture and mechanics...');

    const stepTimer1 = setTimeout(() => {
      setLoadingStep('Synthesizing plain-language technical explanation...');
    }, 1200);

    const stepTimer2 = setTimeout(() => {
      setLoadingStep('Formatting Twitter thread, LinkedIn post, and Dev.to intro...');
    }, 2800);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          tone,
          audience,
          customInstructions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server error occurred during generation');
      }

      const data = await response.json();

      const newContent: GeneratedContent = {
        id: 'gen-' + Date.now(),
        createdAt: Date.now(),
        inputSnippet: code,
        detectedLanguage: data.language || 'Code',
        title: data.title || 'Code Breakdown',
        summary: data.summary || '',
        twitterThread: data.twitterThread || [],
        linkedinPost: data.linkedinPost || '',
        devtoIntro: data.devtoIntro || {
          articleTitle: data.title || 'Code Walkthrough',
          hookParagraph: '',
          bodyParagraph: '',
          takeawayBullets: [],
          tags: ['webdev', 'programming'],
          estimatedReadTime: '3 min read',
        },
      };

      setGeneratedContent(newContent);
      saveToHistory(newContent);
      addToast('Generated Twitter, LinkedIn, and Dev.to outputs', 'success');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Generation failed. Please try again.', 'error');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Channel-specific regeneration
  const handleRegenerateChannel = async (channel: 'twitter' | 'linkedin' | 'devto') => {
    if (!code.trim() || !generatedContent) return;

    setRegeneratingChannel(channel);
    try {
      const response = await fetch('/api/regenerate-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          code,
          tone,
          customInstructions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to regenerate ${channel}`);
      }

      const data = await response.json();

      setGeneratedContent((prev) => {
        if (!prev) return null;
        let updated = { ...prev };
        if (channel === 'twitter' && data.twitterThread) {
          updated.twitterThread = data.twitterThread;
          addToast('Refreshed Twitter thread', 'success');
        } else if (channel === 'linkedin' && data.linkedinPost) {
          updated.linkedinPost = data.linkedinPost;
          addToast('Refreshed LinkedIn post', 'success');
        } else if (channel === 'devto' && data.devtoIntro) {
          updated.devtoIntro = data.devtoIntro;
          addToast('Refreshed Dev.to intro', 'success');
        }
        saveToHistory(updated);
        return updated;
      });
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Regeneration failed', 'error');
    } finally {
      setRegeneratingChannel(null);
    }
  };

  // Fetch GitHub README
  const handleFetchGitHub = async (url: string) => {
    setIsFetchingGitHub(true);
    try {
      const res = await fetch('/api/fetch-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to fetch repository README');
      }

      const data = await res.json();
      setCode(data.readme);
      addToast(`Imported README from ${data.repo}`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to fetch GitHub README', 'error');
    } finally {
      setIsFetchingGitHub(false);
    }
  };

  // Select Sample Preset
  const handleSelectPreset = (snippet: SampleSnippet) => {
    setCode(snippet.code);
    addToast(`Loaded ${snippet.name}`, 'info');
  };

  // Export full markdown without emojis
  const handleExportMarkdown = () => {
    if (!generatedContent) return;

    const tweetsFormatted = generatedContent.twitterThread
      .map((t, idx) => `### Tweet ${idx + 1}\n${t.text}`)
      .join('\n\n');

    const md = `# ${generatedContent.title}
Language: ${generatedContent.detectedLanguage}
Generated: ${new Date(generatedContent.createdAt).toLocaleString()}

> ${generatedContent.summary}

---

## Twitter / X Thread
${tweetsFormatted}

---

## LinkedIn Post
${generatedContent.linkedinPost}

---

## Dev.to Article Intro
# ${generatedContent.devtoIntro.articleTitle}
Tags: ${generatedContent.devtoIntro.tags.join(', ')}
Estimated Reading Time: ${generatedContent.devtoIntro.estimatedReadTime}

### Hook
${generatedContent.devtoIntro.hookParagraph}

### Context
${generatedContent.devtoIntro.bodyParagraph}

### Key Takeaways
${generatedContent.devtoIntro.takeawayBullets.map((b) => `- ${b}`).join('\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanTitle = (generatedContent.title || 'code-content')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    link.download = `${cleanTitle}-content.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('Exported Markdown file', 'success');
  };

  const handleReset = () => {
    setCode('');
    setGeneratedContent(null);
    addToast('Cleared input and generated output', 'info');
  };

  return (
    <div className="min-h-screen bg-zinc-100/70 dark:bg-[#090b0f] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      <Header
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        generatedContent={generatedContent}
        onExportMarkdown={handleExportMarkdown}
        onReset={handleReset}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* Utilitarian Workbench Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Code to Multi-Platform Content
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono text-emerald-700 bg-emerald-100 border border-emerald-300 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Ready
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              Transform code and READMEs into synchronized Twitter threads, LinkedIn posts, and Dev.to breakdowns.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono text-amber-800 bg-amber-100 border border-amber-300 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/20">
              <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400" />
              Gemini 3.8 Flash
            </span>
          </div>
        </div>

        {/* Input & Options Component */}
        <CodeInput
          code={code}
          onChangeCode={setCode}
          tone={tone}
          onChangeTone={setTone}
          audience={audience}
          onChangeAudience={setAudience}
          customInstructions={customInstructions}
          onChangeCustomInstructions={setCustomInstructions}
          onGenerate={handleGenerate}
          isLoading={isLoading}
          onSelectPreset={handleSelectPreset}
          onFetchGitHub={handleFetchGitHub}
          isFetchingGitHub={isFetchingGitHub}
        />

        {/* Loading Progress Bar */}
        {isLoading && (
          <div className="bg-white dark:bg-[#12161f] border border-amber-400/50 dark:border-amber-500/30 rounded-xl p-4 text-xs font-mono text-zinc-800 dark:text-zinc-200 flex items-center gap-3 shadow-md">
            <Loader2 className="w-4 h-4 animate-spin text-amber-500 dark:text-amber-400 shrink-0" />
            <div>
              <span className="font-semibold text-amber-700 dark:text-amber-300">Processing:</span>{' '}
              <span className="text-zinc-600 dark:text-zinc-300">{loadingStep || 'Analyzing snippet mechanics...'}</span>
            </div>
          </div>
        )}

        {/* Output Section: The 3 Side-by-Side Channels */}
        {generatedContent ? (
          <div className="space-y-3 pt-1">
            {/* Context & Metadata Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-[#12161f] border border-zinc-200 dark:border-[#232733] rounded-xl px-3.5 py-2.5 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold text-amber-800 bg-amber-100 border border-amber-300 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/30">
                  {generatedContent.detectedLanguage}
                </span>
                <div className="min-w-0">
                  <h2 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {generatedContent.title}
                  </h2>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                    {generatedContent.summary}
                  </p>
                </div>
              </div>

              {/* Responsive Channel Selector for Mobile/Tablet */}
              <div className="flex lg:hidden bg-zinc-100 dark:bg-[#0c0e14] p-0.5 rounded-lg border border-zinc-200 dark:border-[#232733] w-full sm:w-auto text-xs font-mono overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setMobileTab('all')}
                  className={`flex-1 sm:flex-none px-2.5 py-1 rounded-md transition-colors text-center whitespace-nowrap ${
                    mobileTab === 'all'
                      ? 'bg-white dark:bg-[#1e2433] text-zinc-900 dark:text-zinc-100 font-medium shadow-xs border border-zinc-200 dark:border-[#2e374d]'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  All 3
                </button>
                <button
                  onClick={() => setMobileTab('twitter')}
                  className={`flex-1 sm:flex-none px-2.5 py-1 rounded-md transition-colors text-center whitespace-nowrap ${
                    mobileTab === 'twitter'
                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 font-medium border border-sky-300 dark:border-sky-500/40'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-sky-600 dark:hover:text-sky-300'
                  }`}
                >
                  Twitter ({generatedContent.twitterThread.length})
                </button>
                <button
                  onClick={() => setMobileTab('linkedin')}
                  className={`flex-1 sm:flex-none px-2.5 py-1 rounded-md transition-colors text-center whitespace-nowrap ${
                    mobileTab === 'linkedin'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 font-medium border border-blue-300 dark:border-blue-500/40'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-300'
                  }`}
                >
                  LinkedIn
                </button>
                <button
                  onClick={() => setMobileTab('devto')}
                  className={`flex-1 sm:flex-none px-2.5 py-1 rounded-md transition-colors text-center whitespace-nowrap ${
                    mobileTab === 'devto'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 font-medium border border-emerald-300 dark:border-emerald-500/40'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-300'
                  }`}
                >
                  Dev.to
                </button>
              </div>
            </div>

            {/* 3-Column Side-by-Side Grid with Equal Height (Requirement 2) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 items-stretch">
              {/* Column 1: Twitter Thread */}
              <div className={`h-full ${mobileTab === 'all' || mobileTab === 'twitter' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'}`}>
                <TwitterThreadCard
                  tweets={generatedContent.twitterThread}
                  onUpdateTweets={(updated) => {
                    const next = { ...generatedContent, twitterThread: updated };
                    setGeneratedContent(next);
                    saveToHistory(next);
                  }}
                  onRegenerate={() => handleRegenerateChannel('twitter')}
                  isRegenerating={regeneratingChannel === 'twitter'}
                  onCopyText={copyToClipboard}
                />
              </div>

              {/* Column 2: LinkedIn Post */}
              <div className={`h-full ${mobileTab === 'all' || mobileTab === 'linkedin' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'}`}>
                <LinkedInCard
                  post={generatedContent.linkedinPost}
                  onUpdatePost={(updated) => {
                    const next = { ...generatedContent, linkedinPost: updated };
                    setGeneratedContent(next);
                    saveToHistory(next);
                  }}
                  onRegenerate={() => handleRegenerateChannel('linkedin')}
                  isRegenerating={regeneratingChannel === 'linkedin'}
                  onCopyText={copyToClipboard}
                />
              </div>

              {/* Column 3: Dev.to Article Intro */}
              <div className={`h-full ${mobileTab === 'all' || mobileTab === 'devto' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'}`}>
                <DevToCard
                  devto={generatedContent.devtoIntro}
                  onUpdateDevTo={(updated) => {
                    const next = { ...generatedContent, devtoIntro: updated };
                    setGeneratedContent(next);
                    saveToHistory(next);
                  }}
                  onRegenerate={() => handleRegenerateChannel('devto')}
                  isRegenerating={regeneratingChannel === 'devto'}
                  onCopyText={copyToClipboard}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Empty / Initial State */
          !isLoading && (
            <div className="border border-zinc-200 dark:border-[#232733] rounded-xl bg-white/80 dark:bg-[#12161f]/50 p-4 text-xs font-mono text-zinc-600 dark:text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                <span>
                  <strong className="text-zinc-900 dark:text-zinc-200">Ready:</strong> Choose a sample above or paste code, then click{' '}
                  <span className="text-amber-700 dark:text-amber-300 font-semibold">"Generate All 3 Formats"</span> (Cmd+Enter).
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400 shrink-0">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>Twitter / X</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>LinkedIn</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Dev.to</span>
              </div>
            </div>
          )
        )}
      </main>

      {/* History Modal Drawer */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistory={(item) => {
          setCode(item.inputSnippet);
          setGeneratedContent(item);
          setIsHistoryOpen(false);
          addToast(`Loaded ${item.title || 'saved content'}`, 'info');
        }}
        onDeleteHistory={(id) => {
          const updated = history.filter((h) => h.id !== id);
          setHistory(updated);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          addToast('Removed from history', 'info');
        }}
        onClearAll={() => {
          setHistory([]);
          localStorage.removeItem(STORAGE_KEY);
          addToast('History cleared', 'info');
        }}
      />

      {/* Global Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
