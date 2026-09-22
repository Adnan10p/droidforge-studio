import React, { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  X,
  Search,
  Wrench,
  ChevronRight,
  Zap,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { FlowValidationError } from "./flowValidator";

interface FlowValidationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  errors: FlowValidationError[];
  onFocusNode: (nodeId: string) => void;
  onQuickFix: (error: FlowValidationError) => void;
  onChangeComponentTarget: (nodeId: string) => void;
}

export const FlowValidationDrawer: React.FC<FlowValidationDrawerProps> = ({
  isOpen,
  onClose,
  errors,
  onFocusNode,
  onQuickFix,
  onChangeComponentTarget,
}) => {
  const [activeTab, setActiveTab] = useState<"all" | "errors" | "warnings">("all");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const errorCount = errors.filter((e) => e.severity === "error").length;
  const warningCount = errors.filter((e) => e.severity === "warning").length;

  const filteredErrors = errors.filter((item) => {
    if (activeTab === "errors" && item.severity !== "error") return false;
    if (activeTab === "warnings" && item.severity !== "warning") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="absolute top-0 right-0 bottom-0 z-40 w-96 bg-slate-900/98 border-l border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col animate-in slide-in-from-right duration-200 select-none">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-950/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Flow Health & Validation</h3>
              <p className="text-[11px] text-slate-400">Real-time static code analysis</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-1 px-2.5 rounded-lg transition text-center cursor-pointer ${
              activeTab === "all"
                ? "bg-slate-800 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All ({errors.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("errors")}
            className={`flex-1 py-1 px-2.5 rounded-lg transition text-center cursor-pointer ${
              activeTab === "errors"
                ? "bg-rose-950/80 text-rose-300 border border-rose-800/60 shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Errors ({errorCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("warnings")}
            className={`flex-1 py-1 px-2.5 rounded-lg transition text-center cursor-pointer ${
              activeTab === "warnings"
                ? "bg-amber-950/80 text-amber-300 border border-amber-800/60 shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Warnings ({warningCount})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search flow issues..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Main Error Cards List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {filteredErrors.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Flow Verification Clean!</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-[220px] mx-auto">
                No component mismatches or undeclared variables detected in current flow layout.
              </p>
            </div>
          </div>
        ) : (
          filteredErrors.map((item) => (
            <div
              key={item.id}
              className={`group p-3.5 rounded-2xl border transition-all duration-150 space-y-3 shadow-lg ${
                item.severity === "error"
                  ? "bg-rose-950/30 border-rose-900/60 hover:border-rose-500/80"
                  : "bg-amber-950/30 border-amber-900/60 hover:border-amber-500/80"
              }`}
            >
              {/* Card Header: Icon + Title + Category Pill */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      item.severity === "error"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {item.severity === "error" ? (
                      <AlertCircle className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                </div>

                <span
                  className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
                    item.severity === "error"
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  }`}
                >
                  {item.category}
                </span>
              </div>

              {/* Description Body */}
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {item.description}
              </p>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => onFocusNode(item.nodeId)}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition cursor-pointer"
                >
                  <span>Focus on Canvas</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (item.quickFixType === "change_component") {
                      onChangeComponentTarget(item.nodeId);
                    } else {
                      onQuickFix(item);
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-indigo-500/30 transition cursor-pointer"
                >
                  <Wrench className="w-3 h-3" />
                  <span>{item.actionText}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Drawer Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-indigo-400 fill-current animate-pulse" />
          <span className="font-mono text-[11px]">Real-time analysis active</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
