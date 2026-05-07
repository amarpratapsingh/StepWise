import { CheckCircle2, Circle, ClipboardList, ListOrdered, Share2, Download, ExternalLink, Info, Layers } from "lucide-react";
import { useState } from "react";
import { StructuredTutorial } from "@/src/types";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/src/lib/utils";

interface TutorialContentProps {
  data: StructuredTutorial;
}

export function TutorialContent({ data }: TutorialContentProps) {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const toggleCheck = (index: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const generateMarkdown = () => {
    const md = `
# ${data.title} ${data.isSynthesized ? '(AI Reconstructed)' : ''}

## Summary
${data.summary}

## Prerequisites
${data.prerequisites.map(p => `- [ ] ${p}`).join('\n')}

## Steps
${data.steps.map((s, i) => `${i + 1}. **${s.title}**\n   ${s.description} ${s.timestamp ? `(*${s.timestamp}*)` : ''}`).join('\n')}

## Checklist
${data.checklist.map(c => `- [ ] ${c}`).join('\n')}

---
${data.isSynthesized ? '*Note: This guide was synthesized from video metadata as no transcripts were available.*' : ''}
    `.trim();

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-y border-border max-w-7xl mx-auto"
    >
      {/* Sidebar: Prerequisites & Checklist */}
      <div className="lg:col-span-4 border-r border-border min-h-screen">
        <div className="sticky top-20 divide-y divide-border">
          {data.isSynthesized && (
            <div className="p-6 bg-white/5 space-y-2">
              <div className="flex items-center gap-2 mono-label text-white">
                <Info className="w-3 h-3" />
                <span>Synthetic Guide</span>
              </div>
              <p className="text-xs text-brand-secondary leading-relaxed">
                Captions were unavailable. Reconstructed using AI based on video metadata.
              </p>
            </div>
          )}

          <div className="p-8 space-y-6">
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-brand-secondary" />
              <h2 className="mono-label !text-white text-sm">Prerequisites</h2>
            </div>
            <ul className="space-y-4">
              {data.prerequisites.map((item, i) => (
                <li key={i} className="flex gap-4 text-sm text-brand-secondary group">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-secondary group-hover:bg-white transition-colors" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-secondary" />
                <h2 className="mono-label !text-white text-sm">Checklist</h2>
              </div>
              <span className="font-mono text-[10px] text-brand-secondary bg-white/10 px-2 py-0.5 border border-white/10">
                {Object.values(checkedItems).filter(Boolean).length} / {data.checklist.length}
              </span>
            </div>
            <div className="space-y-1">
              {data.checklist.map((item, i) => (
                <button
                  key={i}
                  onClick={() => toggleCheck(i)}
                  className="w-full flex items-start gap-4 p-3 hover:bg-white/5 transition-all text-left group border-b border-white/5 last:border-0"
                >
                  <div className="mt-1 flex-shrink-0">
                    <div className={cn(
                      "w-4 h-4 border transition-all flex items-center justify-center",
                      checkedItems[i] ? "bg-white border-white" : "border-white/20 group-hover:border-white/40"
                    )}>
                      {checkedItems[i] && <CheckCircle2 className="w-3 h-3 text-black" />}
                    </div>
                  </div>
                  <span className={cn(
                    "text-sm transition-all",
                    checkedItems[i] ? "text-brand-secondary line-through opacity-50" : "text-white"
                  )}>
                    {item}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Steps */}
      <div className="lg:col-span-8">
        <div className="flex items-center justify-between p-8 border-b border-border">
          <div className="flex items-center gap-3">
            <ListOrdered className="w-5 h-5 text-brand-secondary" />
            <h2 className="mono-label !text-white text-sm">Implementation Workflow</h2>
          </div>
          <button 
            onClick={generateMarkdown}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white mono-label !text-[11px]"
          >
            <Download className="w-3.5 h-3.5" />
            Export Blueprint
          </button>
        </div>

        <div className="divide-y divide-border">
          {data.steps.map((step, i) => (
            <motion.div 
              key={i} 
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
              className="group flex flex-col md:flex-row transition-colors"
            >
              <motion.div 
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  show: { opacity: 1, x: 0, transition: { duration: 0.6 } }
                }}
                className="md:w-24 p-8 flex md:flex-col items-center md:items-start gap-4 md:border-r border-border group-hover:border-white/20 transition-colors"
              >
                <span className="text-4xl font-mono font-bold text-white/10 group-hover:text-white/40 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {step.timestamp && (
                  <span className="mono-label !text-[9px] bg-white/5 px-2 py-0.5 border border-white/10 group-hover:border-white/30 transition-colors">
                    {step.timestamp}
                  </span>
                )}
              </motion.div>
              <div className="flex-1 p-8 space-y-4">
                <motion.h3 
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } }
                  }}
                  className="text-2xl font-semibold text-white tracking-tight leading-tight group-hover:translate-x-2 transition-transform duration-500"
                >
                  {step.title}
                </motion.h3>
                <motion.p 
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.3 } }
                  }}
                  className="text-brand-secondary leading-relaxed max-w-2xl text-lg opacity-80 group-hover:opacity-100 transition-all duration-500 text-balance"
                >
                  {step.description}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-12 border-t border-border bg-white/[0.01]">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="mono-label !text-white uppercase tracking-[0.3em]">Operational Summary</span>
            </div>
            <p className="text-3xl font-sans font-medium text-white/90 leading-tight italic">
              "{data.summary}"
            </p>
            <div className="pt-8 flex items-center justify-between opacity-40">
              <span className="mono-label">Authentication: User Verified</span>
              {data.url && (
                <a 
                  href={data.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="mono-label hover:text-white transition-colors flex items-center gap-2"
                >
                  Direct Connection <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
