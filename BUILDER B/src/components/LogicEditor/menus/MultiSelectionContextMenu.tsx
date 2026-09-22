import React, { useEffect, useRef } from "react";
import {
  Layers,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  Copy,
  Trash2,
} from "lucide-react";
import { FlowNode } from "../types";

export interface MultiSelectionContextMenuProps {
  x: number;
  y: number;
  selectedNodes: FlowNode[];
  onClose: () => void;
  onGroupSelection: () => void;
  onAlign: (alignment: "left" | "center" | "right" | "top" | "middle" | "bottom") => void;
  onDistribute: (axis: "horizontal" | "vertical") => void;
  onDuplicateSelected: () => void;
  onDeleteSelected: () => void;
}

export const MultiSelectionContextMenu: React.FC<MultiSelectionContextMenuProps> = ({
  x,
  y,
  selectedNodes,
  onClose,
  onGroupSelection,
  onAlign,
  onDistribute,
  onDuplicateSelected,
  onDeleteSelected,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

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

  const adjustedX = Math.max(10, Math.min(x, window.innerWidth - 240));
  const adjustedY = Math.max(10, Math.min(y, window.innerHeight - 440));
  const count = selectedNodes.length;

  return (
    <div
      ref={menuRef}
      style={{ left: adjustedX, top: adjustedY }}
      className="fixed z-50 w-60 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl py-1.5 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-100 font-sans select-none"
    >
      {/* Header */}
      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-indigo-300">
          <Layers className="w-3.5 h-3.5" />
          Multi-Selection
        </span>
        <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold font-mono">
          {count} Nodes
        </span>
      </div>

      {/* Grouping */}
      <button
        type="button"
        onClick={() => {
          onGroupSelection();
          onClose();
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white text-left transition cursor-pointer"
      >
        <Layers className="w-4 h-4 text-indigo-400" />
        <span className="flex-1 font-medium">Group Selection (Add Comment Frame)</span>
      </button>

      <div className="h-px bg-slate-800 my-1 mx-2" />

      {/* Alignment Sub-header */}
      <div className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
        Align
      </div>

      <div className="grid grid-cols-3 gap-1 px-2 py-1">
        <button
          type="button"
          onClick={() => {
            onAlign("left");
            onClose();
          }}
          title="Align Left"
          className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 hover:text-white flex items-center justify-center gap-1 text-[11px] border border-slate-800 transition cursor-pointer"
        >
          <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
          <span>Left</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onAlign("center");
            onClose();
          }}
          title="Align Center"
          className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 hover:text-white flex items-center justify-center gap-1 text-[11px] border border-slate-800 transition cursor-pointer"
        >
          <AlignCenter className="w-3.5 h-3.5 text-slate-400" />
          <span>Center</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onAlign("right");
            onClose();
          }}
          title="Align Right"
          className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 hover:text-white flex items-center justify-center gap-1 text-[11px] border border-slate-800 transition cursor-pointer"
        >
          <AlignRight className="w-3.5 h-3.5 text-slate-400" />
          <span>Right</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onAlign("top");
            onClose();
          }}
          title="Align Top"
          className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 hover:text-white flex items-center justify-center gap-1 text-[11px] border border-slate-800 transition cursor-pointer"
        >
          <span>Top</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onAlign("middle");
            onClose();
          }}
          title="Align Middle"
          className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 hover:text-white flex items-center justify-center gap-1 text-[11px] border border-slate-800 transition cursor-pointer"
        >
          <AlignVerticalJustifyCenter className="w-3.5 h-3.5 text-slate-400" />
          <span>Mid</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onAlign("bottom");
            onClose();
          }}
          title="Align Bottom"
          className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 hover:text-white flex items-center justify-center gap-1 text-[11px] border border-slate-800 transition cursor-pointer"
        >
          <span>Bottom</span>
        </button>
      </div>

      <div className="h-px bg-slate-800 my-1 mx-2" />

      {/* Distribution */}
      <div className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
        Distribute
      </div>

      <button
        type="button"
        onClick={() => {
          onDistribute("horizontal");
          onClose();
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white text-left transition cursor-pointer"
      >
        <AlignHorizontalDistributeCenter className="w-4 h-4 text-slate-400" />
        <span className="flex-1 font-medium">Distribute Horizontally</span>
      </button>

      <button
        type="button"
        onClick={() => {
          onDistribute("vertical");
          onClose();
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white text-left transition cursor-pointer"
      >
        <AlignVerticalDistributeCenter className="w-4 h-4 text-slate-400" />
        <span className="flex-1 font-medium">Distribute Vertically</span>
      </button>

      <div className="h-px bg-slate-800 my-1 mx-2" />

      {/* Bulk Operations */}
      <button
        type="button"
        onClick={() => {
          onDuplicateSelected();
          onClose();
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white text-left transition cursor-pointer"
      >
        <Copy className="w-4 h-4 text-slate-400" />
        <span className="flex-1 font-medium">Duplicate Selected ({count})</span>
      </button>

      <button
        type="button"
        onClick={() => {
          onDeleteSelected();
          onClose();
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-left transition cursor-pointer"
      >
        <Trash2 className="w-4 h-4 text-rose-400" />
        <span className="flex-1 font-medium">Delete Selected ({count})</span>
      </button>
    </div>
  );
};
