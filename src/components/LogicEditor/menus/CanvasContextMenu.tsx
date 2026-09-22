import React, { useEffect, useRef } from "react";
import {
  Zap,
  Play,
  GitFork,
  Variable,
  ClipboardPaste,
  CheckSquare,
  Sparkles,
  Maximize2,
  Crosshair,
  Grid,
  Magnet,
  StickyNote,
} from "lucide-react";

export interface CanvasContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAddTrigger: () => void;
  onAddAction: () => void;
  onAddCondition: () => void;
  onAddVariable: () => void;
  onPaste: () => void;
  hasClipboardContent?: boolean;
  onSelectAll: () => void;
  onCleanLayout: () => void;
  onFitFlow?: () => void;
  onFitFlowToScreen?: () => void;
  onCenterFlow: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  snapToGrid: boolean;
  onToggleSnap?: () => void;
  onToggleSnapToGrid?: () => void;
  onAddComment: () => void;
}

export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  x,
  y,
  onClose,
  onAddTrigger,
  onAddAction,
  onAddCondition,
  onAddVariable,
  onPaste,
  hasClipboardContent = true,
  onSelectAll,
  onCleanLayout,
  onFitFlow,
  onFitFlowToScreen,
  onCenterFlow,
  showGrid,
  onToggleGrid,
  snapToGrid,
  onToggleSnap,
  onToggleSnapToGrid,
  onAddComment,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Adjust coordinates so the menu stays within screen bounds
  const adjustedX = Math.max(10, Math.min(x, window.innerWidth - 250));
  const adjustedY = Math.max(10, Math.min(y, window.innerHeight - 480));

  return (
    <div
      ref={menuRef}
      style={{ left: adjustedX, top: adjustedY }}
      className="fixed z-50 w-56 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl py-1.5 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-100 font-sans select-none"
    >
      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 mb-1 flex items-center justify-between">
        <span>Logic Canvas</span>
        <span className="text-slate-400 text-[9px]">Right-Click</span>
      </div>

      {/* Creation Group */}
      <button
        type="button"
        onClick={() => {
          onAddTrigger();
          onClose();
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-amber-500/15 hover:text-amber-300 text-left transition group cursor-pointer"
      >
        <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
        <span className="flex-1 font-medium">Add Trigger</span>
        <span className="text-[10px] text-slate-400 font-mono">T</span>
      </button>

      <button
        type="button"
        onClick={() => {
          onAddAction();
          onClose();
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-blue-500/15 hover:text-blue-300 text-left transition group cursor-pointer"
      >
        <Play className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
        <span className="flex-1 font-medium">Add Action</span>
        <span className="text-[10px] text-slate-400 font-mono">A</span>
      </button>

      <button
        type="button"
        onClick={() => {
          onAddCondition();
          onClose();
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-purple-500/15 hover:text-purple-300 text-left transition group cursor-pointer"
      >
        <GitFork className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
        <span className="flex-1 font-medium">Add Condition</span>
        <span className="text-[10px] text-slate-400 font-mono">C</span>
      </button>

      <button
        type="button"
        onClick={() => {
          onAddVariable();
          onClose();
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-emerald-500/15 hover:text-emerald-300 text-left transition group cursor-pointer"
      >
        <Variable className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
        <span className="flex-1 font-medium">Add Variable</span>
        <span className="text-[10px] text-slate-400 font-mono">V</span>
      </button>

      <div className="h-px bg-slate-800 my-1 mx-2" />

      {/* Edit & Clipboard Group */}
      <button
        type="button"
        disabled={!hasClipboardContent}
        onClick={() => {
          onPaste();
          onClose();
        }}
        className={`w-full px-3 py-1.5 flex items-center gap-2.5 text-left transition group cursor-pointer ${
          hasClipboardContent
            ? "hover:bg-slate-800 hover:text-white"
            : "opacity-40 cursor-not-allowed"
        }`}
      >
        <ClipboardPaste className="w-4 h-4 text-slate-400" />
        <span className="flex-1 font-medium">Paste</span>
        <span className="text-[10px] text-slate-400 font-mono">Ctrl+V</span>
      </button>

      <button
        type="button"
        onClick={() => {
          onSelectAll();
          onClose();
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white text-left transition group cursor-pointer"
      >
        <CheckSquare className="w-4 h-4 text-slate-400" />
        <span className="flex-1 font-medium">Select All</span>
        <span className="text-[10px] text-slate-400 font-mono">Ctrl+A</span>
      </button>

      <div className="h-px bg-slate-800 my-1 mx-2" />

      {/* View & Layout Group */}
      <button
        type="button"
        onClick={() => {
          onCleanLayout();
          onClose();
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-indigo-500/15 hover:text-indigo-300 text-left transition group cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <span className="flex-1 font-medium">Clean Layout</span>
        <span className="text-[10px] text-indigo-400/70 font-mono">Auto</span>
      </button>

      <button
        type="button"
        onClick={() => {
          if (onFitFlowToScreen) onFitFlowToScreen();
          else if (onFitFlow) onFitFlow();
          onClose();
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white text-left transition group cursor-pointer"
      >
        <Maximize2 className="w-4 h-4 text-slate-400" />
        <span className="flex-1 font-medium">Fit Flow to Screen</span>
        <span className="text-[10px] text-slate-400 font-mono">Shift+1</span>
      </button>

      <button
        type="button"
        onClick={() => {
          onCenterFlow();
          onClose();
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white text-left transition group cursor-pointer"
      >
        <Crosshair className="w-4 h-4 text-slate-400" />
        <span className="flex-1 font-medium">Center Flow</span>
      </button>

      <div className="h-px bg-slate-800 my-1 mx-2" />

      {/* Grid Settings */}
      <button
        type="button"
        onClick={() => {
          onToggleGrid();
          onClose();
        }}
        className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-slate-800 hover:text-white text-left transition group cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <Grid className="w-4 h-4 text-slate-400" />
          <span className="font-medium">Show Grid</span>
        </div>
        <span
          className={`w-2 h-2 rounded-full ${
            showGrid ? "bg-emerald-400 shadow-sm shadow-emerald-500/50" : "bg-slate-600"
          }`}
        />
      </button>

      <button
        type="button"
        onClick={() => {
          if (onToggleSnap) onToggleSnap();
          else if (onToggleSnapToGrid) onToggleSnapToGrid();
          onClose();
        }}
        className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-slate-800 hover:text-white text-left transition group cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <Magnet className="w-4 h-4 text-slate-400" />
          <span className="font-medium">Snap to Grid</span>
        </div>
        <span
          className={`w-2 h-2 rounded-full ${
            snapToGrid ? "bg-emerald-400 shadow-sm shadow-emerald-500/50" : "bg-slate-600"
          }`}
        />
      </button>

      <div className="h-px bg-slate-800 my-1 mx-2" />

      {/* Comment */}
      <button
        type="button"
        onClick={() => {
          onAddComment();
          onClose();
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-amber-500/15 hover:text-amber-300 text-left transition group cursor-pointer"
      >
        <StickyNote className="w-4 h-4 text-amber-400" />
        <span className="flex-1 font-medium">Add Comment</span>
        <span className="text-[10px] text-slate-400 font-mono">N</span>
      </button>
    </div>
  );
};
