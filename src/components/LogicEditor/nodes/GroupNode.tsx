import React, { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import { Layers, Edit2, Check, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { GroupNodeData } from "../types";

export const GroupNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as unknown as GroupNodeData;
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(nodeData.title || "Logic Group");

  const handleSaveTitle = () => {
    setIsEditing(false);
    if (typeof (window as any).__onFlowUpdateNode === "function") {
      (window as any).__onFlowUpdateNode(id, { title });
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof (window as any).__onFlowDeleteGroup === "function") {
      (window as any).__onFlowDeleteGroup(id);
    } else if (typeof (window as any).__onFlowDeleteNode === "function") {
      (window as any).__onFlowDeleteNode(id);
    }
  };

  return (
    <div
      className={`relative rounded-3xl transition-all select-none border-2 border-dashed ${
        selected ? "border-indigo-400 bg-indigo-950/20 shadow-xl" : "border-slate-700/80 bg-slate-900/30 hover:border-slate-600"
      } p-3`}
      style={{ minWidth: "320px", minHeight: "220px" }}
    >
      {/* Group Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5" />
          </div>

          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-slate-900 border border-indigo-500 rounded px-2 py-0.5 text-xs text-white font-bold"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveTitle}
                className="p-1 text-emerald-400 hover:text-emerald-300"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span
              onClick={() => setIsEditing(true)}
              className="text-xs font-bold text-white hover:text-indigo-300 cursor-pointer flex items-center gap-1"
            >
              <span>{nodeData.title || "Logic Group"}</span>
              <Edit2 className="w-3 h-3 text-slate-500 opacity-0 hover:opacity-100 transition" />
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleDelete}
          title="Delete Group"
          className="p-1 hover:bg-rose-600/20 rounded text-slate-400 hover:text-rose-400 transition cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="text-[10px] text-slate-500 font-mono">
        Group Container • Drag nodes inside to organize
      </div>
    </div>
  );
});

GroupNode.displayName = "GroupNode";
