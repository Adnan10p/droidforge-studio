import React from "react";
import { Edit3, Copy, Play, MoreHorizontal, Bug } from "lucide-react";

interface NodeHoverToolbarProps {
  onEdit?: () => void;
  onDuplicate?: () => void;
  onTest?: () => void;
  onMore?: (e: React.MouseEvent) => void;
  onToggleBreakpoint?: () => void;
  hasBreakpoint?: boolean;
}

export const NodeHoverToolbar: React.FC<NodeHoverToolbarProps> = ({
  onEdit,
  onDuplicate,
  onTest,
  onMore,
  onToggleBreakpoint,
  hasBreakpoint,
}) => {
  return (
    <div
      className="absolute -top-9 left-1/2 -translate-x-1/2 z-40 flex items-center gap-0.5 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-xl animate-in fade-in zoom-in-95 duration-100"
      onClick={(e) => e.stopPropagation()}
    >
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          title="Edit Node"
          className="p-1 hover:bg-indigo-600/30 text-slate-300 hover:text-white rounded-lg transition cursor-pointer flex items-center gap-1 text-[10px] font-semibold px-1.5"
        >
          <Edit3 className="w-3 h-3 text-indigo-400" />
          <span>Edit</span>
        </button>
      )}

      {onDuplicate && (
        <button
          type="button"
          onClick={onDuplicate}
          title="Duplicate Node"
          className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition cursor-pointer flex items-center gap-1 text-[10px] font-semibold px-1.5"
        >
          <Copy className="w-3 h-3 text-cyan-400" />
          <span>Duplicate</span>
        </button>
      )}

      {onTest && (
        <button
          type="button"
          onClick={onTest}
          title="Test / Run From Here"
          className="p-1 hover:bg-emerald-600/30 text-slate-300 hover:text-emerald-300 rounded-lg transition cursor-pointer flex items-center gap-1 text-[10px] font-semibold px-1.5"
        >
          <Play className="w-3 h-3 text-emerald-400 fill-current" />
          <span>Test</span>
        </button>
      )}

      {onToggleBreakpoint && (
        <button
          type="button"
          onClick={onToggleBreakpoint}
          title={hasBreakpoint ? "Remove Breakpoint" : "Add Breakpoint"}
          className={`p-1 rounded-lg transition cursor-pointer flex items-center gap-1 text-[10px] font-semibold px-1.5 ${
            hasBreakpoint ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "hover:bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <Bug className="w-3 h-3 text-rose-400" />
        </button>
      )}

      {onMore && (
        <button
          type="button"
          onClick={onMore}
          title="More Options"
          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
