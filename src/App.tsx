/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { InputForm } from './components/InputForm';
import { TutorialContent } from './components/TutorialContent';
import { HistoryBar } from './components/HistoryBar';
import { HistoryItem, StructuredTutorial } from './types';
import { structureTutorial } from './lib/gemini';
import { History, Zap, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTutorial, setActiveTutorial] = useState<StructuredTutorial | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('stepwise_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('stepwise_history', JSON.stringify(history));
  }, [history]);

  const handleProcess = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setActiveTutorial(null);

    try {
      // 1. Fetch Transcript & Metadata from our API
      const response = await fetch(`/api/transcript?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch video data");
      }

      // 2. Structuring with AI
      const isSynthesized = !data.transcript;
      const structured = await structureTutorial(data.transcript, data.metadata);
      const finalTutorial = { ...structured, url, isSynthesized };

      setActiveTutorial(finalTutorial);

      // 3. Update History
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        title: finalTutorial.title,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        data: finalTutorial
      };

      setHistory(prev => [newHistoryItem, ...prev].slice(0, 10));

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setActiveTutorial(item.data);
    setIsHistoryOpen(false);
  };

  const clearHistory = () => {
    if (confirm("Clear all recent history?")) {
      setHistory([]);
      localStorage.removeItem('stepwise_history');
    }
  };

  return (
    <div className="min-h-screen bg-surface font-sans text-brand-primary selection:bg-white selection:text-black">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-surface/80 backdrop-blur-md border-b border-white/5 z-40 px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              setActiveTutorial(null);
              setError(null);
            }}
          >
            <div className="w-9 h-9 bg-white rounded flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <Zap className="w-5 h-5 text-black fill-current" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="font-bold text-xl tracking-tighter uppercase italic">Stepwise</span>
              <span className="mono-label !text-[8px] tracking-[0.4em] opacity-50">Operational Intelligence</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-3 group px-4 py-2 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
            >
              <History className="w-4 h-4 text-brand-secondary group-hover:text-white transition-colors" />
              <span className="mono-label !text-[11px] group-hover:text-white transition-colors">Log</span>
              {history.length > 0 && (
                <span className="font-mono text-[10px] text-white/40">
                  [{history.length}]
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-20 min-h-screen">
        <AnimatePresence mode="wait">
          {!activeTutorial ? (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[80vh]"
            >
              <InputForm onProcess={handleProcess} isLoading={isLoading} />
              
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-6 pt-12"
                >
                  <div className="flex items-center gap-3 mono-label text-white animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" />
                    Assembling Actionable Blueprint
                  </div>
                  <div className="w-64 h-[1px] bg-white/10 relative overflow-hidden">
                    <motion.div 
                      className="absolute inset-y-0 w-1/3 bg-white"
                      animate={{ x: ["-100%", "300%"] }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-12 w-full max-w-xl mx-auto"
                >
                  <div className="relative group">
                    {/* Decorative Corner Accents */}
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t border-l border-red-500/50" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t border-r border-red-500/50" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b border-l border-red-500/50" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b border-r border-red-500/50" />

                    <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-sm overflow-hidden relative">
                      {/* Background "Scan" effect hint */}
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
                      
                      <div className="relative flex items-start gap-6">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 animate-pulse">
                          <AlertCircle className="w-6 h-6 text-red-500" />
                        </div>
                        
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="mono-label !text-red-500 font-bold tracking-[0.2em] text-[10px]">SYSTEM ERROR // EXTRACTION_FAILED</span>
                            <span className="text-[10px] font-mono text-red-500/40">{new Date().toLocaleTimeString()}</span>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-white text-lg font-semibold tracking-tight leading-snug">
                              {error}
                            </p>
                            <p className="text-brand-secondary text-sm leading-relaxed opacity-70">
                              {error.includes('limiting automated access') 
                                ? "This is a network-level restriction from YouTube. Retrying with a different video link or waiting a few minutes usually resolves this."
                                : "The system was unable to parse the video content. This can happen if the video is private, age-restricted, or if its creator has disabled external access."
                              }
                            </p>
                          </div>

                          <div className="pt-4 flex flex-wrap gap-3">
                            <button 
                              onClick={() => setError(null)}
                              className="px-4 py-2 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-500 text-[10px] mono-label transition-all"
                            >
                              Dismiss Report
                            </button>
                            <button 
                              onClick={() => {
                                const input = document.querySelector('input');
                                if (input) {
                                  input.value = '';
                                  input.focus();
                                }
                                setError(null);
                              }}
                              className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] mono-label transition-all"
                            >
                              Reset Prompt
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-0"
            >
              <header className="max-w-7xl mx-auto px-8 py-20 border-x border-border">
                <div className="space-y-8">
                  <button 
                    onClick={() => {
                      setActiveTutorial(null);
                      setError(null);
                    }}
                    className="group mono-label hover:text-white transition-colors flex items-center gap-3"
                  >
                    <ArrowRight className="w-3 h-3 rotate-180 group-hover:-translate-x-1 transition-transform" />
                    Initialize New Process
                  </button>
                  <h1 className="text-4xl md:text-7xl font-sans font-bold tracking-tighter text-white leading-[0.9] max-w-4xl">
                    {activeTutorial.title}
                  </h1>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <div className="px-3 py-1 bg-white/5 border border-white/10 mono-label !text-white text-[9px]">
                      GUIDE ID: {Math.random().toString(36).substring(7).toUpperCase()}
                    </div>
                    <div className="px-3 py-1 bg-white/5 border border-white/10 mono-label !text-white text-[9px]">
                      STATUS: VERIFIED
                    </div>
                    <div className="px-3 py-1 bg-white/5 border border-white/10 mono-label !text-white text-[9px]">
                      ENGINE: GEMINI-3-FLASH
                    </div>
                  </div>
                </div>
              </header>
              <TutorialContent data={activeTutorial} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <HistoryBar
        items={history}
        onSelect={handleHistorySelect}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onClear={clearHistory}
      />

      <footer className="border-t border-white/5 py-16 px-8 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full" />
              <span className="font-bold tracking-tighter uppercase italic text-lg">Stepwise</span>
            </div>
            <p className="text-xs text-brand-secondary leading-relaxed opacity-50 uppercase tracking-wider font-mono">
              Turning instructional content into executable intelligence since 2024.
            </p>
          </div>
          <div className="space-y-4">
            <p className="mono-label !text-white">Capabilities</p>
            <ul className="space-y-2 text-xs text-brand-secondary font-mono uppercase tracking-widest opacity-60">
              <li>Transcript Synthesis</li>
              <li>Material Extraction</li>
              <li>Workflow Mapping</li>
              <li>Progress Tracking</li>
            </ul>
          </div>
          <div className="space-y-4">
            <p className="mono-label !text-white">Resources</p>
            <ul className="space-y-2 text-xs text-brand-secondary font-mono uppercase tracking-widest opacity-60">
              <li className="hover:text-white cursor-pointer transition-colors">Documentation</li>
              <li className="hover:text-white cursor-pointer transition-colors">API Access</li>
              <li className="hover:text-white cursor-pointer transition-colors">Status</li>
            </ul>
          </div>
          <div className="flex flex-col gap-6 items-end">
            <div className="text-right">
              <p className="mono-label !text-white">v1.2.0-STABLE</p>
              <p className="text-[10px] text-brand-secondary font-mono opacity-30 mt-1 uppercase">Build 05062026.04</p>
            </div>
            <div className="flex gap-4">
              <div className="w-1.5 h-1.5 bg-white opacity-20" />
              <div className="w-1.5 h-1.5 bg-white opacity-20" />
              <div className="w-1.5 h-1.5 bg-white opacity-20" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
