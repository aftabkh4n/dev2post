import React, { useState } from 'react';
import {
  Github,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  FileCode2,
  ClipboardPaste,
  X,
  Loader2,
  Play,
} from 'lucide-react';
import { ContentTone, TargetAudience, SampleSnippet } from '../types';
import { SAMPLE_SNIPPETS } from '../data/presets';

interface CodeInputProps {
  code: string;
  onChangeCode: (val: string) => void;
  tone: ContentTone;
  onChangeTone: (tone: ContentTone) => void;
  audience: TargetAudience;
  onChangeAudience: (aud: TargetAudience) => void;
  customInstructions: string;
  onChangeCustomInstructions: (val: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  onSelectPreset: (snippet: SampleSnippet) => void;
  onFetchGitHub: (url: string) => Promise<void>;
  isFetchingGitHub: boolean;
}

export const CodeInput: React.FC<CodeInputProps> = ({
  code,
  onChangeCode,
  tone,
  onChangeTone,
  audience,
  onChangeAudience,
  customInstructions,
  onChangeCustomInstructions,
  onGenerate,
  isLoading,
  onSelectPreset,
  onFetchGitHub,
  isFetchingGitHub,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'github'>('editor');
  const [githubUrl, setGithubUrl] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const lineCount = code ? code.split('\n').length : 0;
  const charCount = code.length;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) onChangeCode(text);
    } catch {
      // clipboard permission denied
    }
  };

  const handleGitHubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim()) return;
    await onFetchGitHub(githubUrl);
    setActiveTab('editor');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (code.trim() && !isLoading) {
        onGenerate();
      }
    }
  };

  return (
    <div className="bg-white dark:bg-[#12161f] border border-zinc-200 dark:border-[#232733] rounded-xl p-3 sm:p-4 shadow-xs transition-colors">
      {/* Top Header & Presets Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-2.5 border-b border-zinc-200 dark:border-[#232733]">
        {/* Segmented Tab Switcher */}
        <div className="flex items-center bg-zinc-100 dark:bg-[#0c0e14] p-0.5 rounded-lg border border-zinc-200 dark:border-[#202531] self-start">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'editor'
                ? 'bg-white dark:bg-[#1e2433] text-zinc-900 dark:text-zinc-100 shadow-xs border border-zinc-200 dark:border-[#2e374d]'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Code / README
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('github')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'github'
                ? 'bg-white dark:bg-[#1e2433] text-zinc-900 dark:text-zinc-100 shadow-xs border border-zinc-200 dark:border-[#2e374d]'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Import GitHub
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none w-full md:w-auto">
          <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider shrink-0 pr-0.5">
            Samples:
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {SAMPLE_SNIPPETS.map((snippet) => {
              const isReadme = snippet.category === 'readme';
              return (
                <button
                  key={snippet.id}
                  type="button"
                  onClick={() => {
                    onSelectPreset(snippet);
                    setActiveTab('editor');
                  }}
                  className={`px-2 py-0.5 rounded-md text-xs font-mono transition-colors whitespace-nowrap border ${
                    isReadme
                      ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/40 hover:bg-sky-100 dark:hover:bg-sky-900/50'
                      : 'bg-zinc-100 dark:bg-[#161a24] text-amber-700 dark:text-amber-300/90 border-amber-200 dark:border-amber-900/30 hover:bg-amber-50 dark:hover:bg-[#202636]'
                  }`}
                  title={`Load ${snippet.name}`}
                >
                  {isReadme ? 'README' : snippet.name.split(':')[0]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* GitHub URL Input Bar */}
      {activeTab === 'github' && (
        <form onSubmit={handleGitHubSubmit} className="py-2.5">
          <div className="bg-zinc-50 dark:bg-[#0c0e14] border border-zinc-200 dark:border-[#232733] rounded-lg p-2 flex flex-col sm:flex-row items-center gap-2">
            <div className="flex items-center gap-2 w-full text-zinc-400">
              <Github className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0 ml-1" />
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="e.g. https://github.com/aftabkh4n/RebelDesk.git or owner/repo"
                className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isFetchingGitHub || !githubUrl.trim()}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white dark:text-zinc-950 disabled:opacity-50 shrink-0 transition-colors flex items-center justify-center gap-1.5"
            >
              {isFetchingGitHub ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <span>Fetch README</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Code Textarea Area */}
      <div className="mt-2.5">
        <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-50 dark:bg-[#0c0e14] border-t border-x border-zinc-200 dark:border-[#232733] rounded-t-lg text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">Input Source</span>
            {lineCount > 0 && (
              <span className="text-zinc-400 dark:text-zinc-500">
                ({lineCount} lines, {charCount} chars)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!code && (
              <button
                type="button"
                onClick={handlePaste}
                className="flex items-center gap-1 text-zinc-500 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-300 transition-colors"
              >
                <ClipboardPaste className="w-3 h-3" />
                <span>Paste</span>
              </button>
            )}
            {code && (
              <button
                type="button"
                onClick={() => onChangeCode('')}
                className="flex items-center gap-1 text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        <textarea
          value={code}
          onChange={(e) => onChangeCode(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="// Paste any code snippet or GitHub README here...
// Press Cmd+Enter or Ctrl+Enter to generate Twitter, LinkedIn, and Dev.to content."
          rows={6}
          className="w-full bg-zinc-50/50 dark:bg-[#0c0e14] border border-zinc-200 dark:border-[#232733] rounded-b-lg p-3 font-mono text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500/60 dark:focus:border-amber-500/60 transition-colors resize-y leading-relaxed"
          spellCheck={false}
        />
      </div>

      {/* Tone & Audience Bar */}
      <div className="mt-2.5 pt-2.5 border-t border-zinc-200 dark:border-[#232733] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-600 dark:text-zinc-400 text-xs font-mono mr-1">Tone:</span>

          {/* Tone Selector: Pill shaped with clear active state (Requirement 5) */}
          <div className="flex items-center bg-zinc-100 dark:bg-[#0c0e14] rounded-full p-1 border border-zinc-200 dark:border-[#202531] text-xs">
            <button
              type="button"
              onClick={() => onChangeTone('direct')}
              className={`rounded-full px-3 py-1 transition-all ${
                tone === 'direct'
                  ? 'bg-amber-400 text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
              }`}
            >
              Direct
            </button>
            <button
              type="button"
              onClick={() => onChangeTone('story')}
              className={`rounded-full px-3 py-1 transition-all ${
                tone === 'story'
                  ? 'bg-amber-400 text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
              }`}
            >
              Story
            </button>
            <button
              type="button"
              onClick={() => onChangeTone('deepdive')}
              className={`rounded-full px-3 py-1 transition-all ${
                tone === 'deepdive'
                  ? 'bg-amber-400 text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
              }`}
            >
              Deep-Dive
            </button>
            <button
              type="button"
              onClick={() => onChangeTone('punchy')}
              className={`rounded-full px-3 py-1 transition-all ${
                tone === 'punchy'
                  ? 'bg-amber-400 text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
              }`}
            >
              Punchy
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-amber-300 transition-colors rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-[#2b3548]"
          >
            <SlidersHorizontal className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
            <span>Audience / Context</span>
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Generate Button with Amber Accent */}
        <button
          type="button"
          onClick={onGenerate}
          disabled={isLoading || !code.trim()}
          className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Generating 3 Channels...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Generate All 3 Formats</span>
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.2 text-[10px] font-mono bg-amber-500/40 text-zinc-900 rounded font-bold">
                ⌘↵
              </kbd>
            </>
          )}
        </button>
      </div>

      {/* Advanced Settings Drawer */}
      {showAdvanced && (
        <div className="mt-2.5 pt-2.5 border-t border-zinc-200 dark:border-[#232733] grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in duration-150">
          <div>
            <label className="block text-[11px] font-mono text-zinc-600 dark:text-zinc-400 mb-1">
              Target Audience
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onChangeAudience('developers')}
                className={`flex-1 py-1 px-2 text-xs rounded-lg border text-center transition-colors ${
                  audience === 'developers'
                    ? 'bg-amber-100 border-amber-400 text-amber-900 dark:bg-amber-500/20 dark:border-amber-500/40 dark:text-amber-200 font-semibold'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-600 dark:bg-[#0c0e14] dark:border-[#202531] dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                Developers
              </button>
              <button
                type="button"
                onClick={() => onChangeAudience('senior')}
                className={`flex-1 py-1 px-2 text-xs rounded-lg border text-center transition-colors ${
                  audience === 'senior'
                    ? 'bg-amber-100 border-amber-400 text-amber-900 dark:bg-amber-500/20 dark:border-amber-500/40 dark:text-amber-200 font-semibold'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-600 dark:bg-[#0c0e14] dark:border-[#202531] dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                Senior / Lead
              </button>
              <button
                type="button"
                onClick={() => onChangeAudience('beginners')}
                className={`flex-1 py-1 px-2 text-xs rounded-lg border text-center transition-colors ${
                  audience === 'beginners'
                    ? 'bg-amber-100 border-amber-400 text-amber-900 dark:bg-amber-500/20 dark:border-amber-500/40 dark:text-amber-200 font-semibold'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-600 dark:bg-[#0c0e14] dark:border-[#202531] dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                Junior / Learners
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-zinc-600 dark:text-zinc-400 mb-1">
              Angle / Focus (Optional)
            </label>
            <input
              type="text"
              value={customInstructions}
              onChange={(e) => onChangeCustomInstructions(e.target.value)}
              placeholder="e.g. Focus on concurrency safety or avoid re-renders"
              className="w-full bg-zinc-50 dark:bg-[#0c0e14] border border-zinc-200 dark:border-[#202531] rounded-lg px-2.5 py-1 text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500/60"
            />
          </div>
        </div>
      )}
    </div>
  );
};
