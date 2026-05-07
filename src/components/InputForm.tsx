import { Play, Zap, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/src/lib/utils";

interface InputFormProps {
  onProcess: (url: string) => void;
  isLoading: boolean;
}

export function InputForm({ onProcess, isLoading }: InputFormProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onProcess(url);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 py-20 px-6">
      <div className="space-y-6 max-w-2xl">
        <div className="inline-flex items-center gap-3 px-3 py-1.5 border border-border rounded-full flex-shrink-0">
          <Zap className="w-3.5 h-3.5 text-white fill-white" />
          <span className="mono-label !text-white !opacity-100">AI Processing Engine</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-sans font-semibold tracking-tight text-white leading-[0.95]">
          Turn videos into <span className="opacity-40">executable blueprints.</span>
        </h1>
        <p className="text-brand-secondary text-lg leading-relaxed max-w-lg">
          Extract structured steps, materials, and actionable checklists from any YouTube tutorial instantly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative group max-w-3xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-black border border-border group-focus-within:border-white transition-all overflow-hidden p-1 gap-1">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube Link..."
            className="flex-1 bg-transparent px-6 py-4 outline-none text-white placeholder:text-neutral-600 font-mono text-sm border-b sm:border-b-0 sm:border-r border-border focus:border-white transition-colors"
            required
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !url}
            className={cn(
              "px-8 py-4 bg-white text-black transition-all disabled:opacity-50 flex items-center justify-center gap-3 font-mono text-xs uppercase tracking-widest font-bold hover:bg-neutral-200 active:scale-[0.98]",
              isLoading && "bg-neutral-400"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Process Video <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
        <div className="mt-4 flex items-center gap-6">
          <span className="mono-label">Supported: YouTube, Shorts, Live</span>
          <div className="h-[1px] flex-1 bg-border" />
          <span className="mono-label">v1.2.0</span>
        </div>
      </form>
    </div>
  );
}
