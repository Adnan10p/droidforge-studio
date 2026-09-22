import React, { useState } from "react";
import { Code2, Copy, Check, Sparkles, ExternalLink } from "lucide-react";
import { generateKotlinForNode } from "./nodeCodeGenerator";

interface NodeCodeTooltipProps {
  nodeType: string;
  data: any;
  isVisible: boolean;
  onClose?: () => void;
}

export const NodeCodeTooltip: React.FC<NodeCodeTooltipProps> = ({
  nodeType,
  data,
  isVisible,
}) => {
  const [copied, setCopied] = useState(false);
  const snippet = generateKotlinForNode(nodeType, data);

  if (!isVisible) return null;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 pointer-events-auto select-text w-80 md:w-96 animate-in fade-in zoom-in-95 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-slate-950/95 backdrop-blur-md border border-indigo-500/50 rounded-2xl shadow-2xl p-3 text-slate-200 text-xs overflow-hidden ring-1 ring-white/10">
        {/* Header with Kotlin pill & Copy */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Code2 className="w-3 h-3" />
            </div>
            <div className="truncate">
              <span className="font-bold text-white text-[11px] block truncate">
                {snippet.title}
              </span>
              <span className="text-[9px] text-indigo-300 font-mono block">
                {snippet.scope}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-500/30 text-[9px] font-mono font-bold text-indigo-300">
              Kotlin / Compose
            </span>
            <button
              type="button"
              onClick={handleCopy}
              title="Copy snippet"
              className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition cursor-pointer"
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className="relative rounded-xl bg-slate-900/90 border border-slate-800/60 p-2.5 overflow-x-auto font-mono text-[10px] leading-relaxed max-h-44 scrollbar-thin scrollbar-thumb-slate-700">
          <pre className="text-slate-300 font-mono whitespace-pre">{snippet.code}</pre>
        </div>

        {/* Arrow pointer indicator */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-solid border-t-slate-950 border-t-8 border-x-transparent border-x-8 border-b-0 w-0 h-0" />
      </div>
    </div>
  );
};
