import React, { useState } from "react";
import { Code2, Copy, Check, X } from "lucide-react";
import { generateKotlinForNode } from "../nodeCodeGenerator";
import { FlowNode } from "../types";

export interface NodeKotlinModalProps {
  isOpen: boolean;
  node: FlowNode | null;
  onClose: () => void;
}

export const NodeKotlinModal: React.FC<NodeKotlinModalProps> = ({
  isOpen,
  node,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !node) return null;

  const snippet = generateKotlinForNode(node.type || "action", node.data);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-3 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{snippet.title}</h3>
              <p className="text-[11px] text-indigo-300 font-mono">{snippet.scope}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative">
          <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-mono text-emerald-300 overflow-x-auto max-h-72 leading-relaxed">
            {snippet.code}
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium border border-slate-700 flex items-center gap-1.5 transition cursor-pointer shadow"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
