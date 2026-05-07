import { History as HistoryIcon, X, Clock, Terminal } from "lucide-react";
import { HistoryItem } from "@/src/types";
import { cn } from "@/src/lib/utils";

interface HistoryBarProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
}

export function HistoryBar({ items, onSelect, isOpen, onClose, onClear }: HistoryBarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-surface border-l border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <HistoryIcon className="w-5 h-5 text-brand-secondary" />
          <span className="mono-label !text-white">Operation Log</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded border border-transparent hover:border-white/10 transition-all">
          <X className="w-5 h-5 text-brand-secondary hover:text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-neutral-700 space-y-4">
            <Terminal className="w-12 h-12 stroke-[1px] opacity-20" />
            <p className="mono-label !text-[11px] text-center max-w-[200px]">System history empty. No cached blueprints detected.</p>
          </div>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="w-full text-left p-6 border border-white/5 hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.03] transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Terminal className="w-3 h-3 text-white/20" />
              </div>
              <h3 className="font-semibold text-sm text-brand-secondary group-hover:text-white transition-colors line-clamp-2 leading-tight">
                {item.title}
              </h3>
              <div className="flex items-center justify-between pt-4">
                <span className="font-mono text-[9px] uppercase tracking-widest text-brand-secondary opacity-50">{item.date}</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-white/20 rounded-full" />
                  <div className="w-1 h-1 bg-white/40 rounded-full" />
                  <div className="w-1 h-1 bg-white/60 rounded-full" />
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="p-6 border-t border-white/5 bg-white/[0.02]">
          <button 
            onClick={onClear}
            className="w-full py-3 text-[10px] font-mono text-brand-secondary hover:text-white border border-white/10 hover:border-white/30 transition-all uppercase tracking-[0.3em] text-center"
          >
            Clear Data Store
          </button>
        </div>
      )}
    </div>
  );
}
