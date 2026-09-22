import React, { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import {
  Trash2,
  StickyNote,
  Edit3,
  ChevronDown,
  ChevronRight,
  Info,
  Palette,
} from "lucide-react";
import { NoteNodeData } from "../types";

export const NoteNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as unknown as NoteNodeData;
  const [isEditing, setIsEditing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(Boolean(nodeData.collapsed));
  const [title, setTitle] = useState(nodeData.title || "Flow Note");
  const [text, setText] = useState(nodeData.text || "Add documentation or architectural comments here...");
  const [color, setColor] = useState<"yellow" | "blue" | "purple" | "emerald">(
    nodeData.color || "yellow"
  );
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof (window as any).__onFlowDeleteNode === "function") {
      (window as any).__onFlowDeleteNode(id);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (typeof (window as any).__onFlowUpdateNode === "function") {
      (window as any).__onFlowUpdateNode(id, {
        title,
        text,
        collapsed: isCollapsed,
        color,
      });
    }
  };

  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextCollapsed = !isCollapsed;
    setIsCollapsed(nextCollapsed);
    if (typeof (window as any).__onFlowUpdateNode === "function") {
      (window as any).__onFlowUpdateNode(id, { collapsed: nextCollapsed });
    }
  };

  const handleSelectColor = (newColor: "yellow" | "blue" | "purple" | "emerald") => {
    setColor(newColor);
    setShowColorPicker(false);
    if (typeof (window as any).__onFlowUpdateNode === "function") {
      (window as any).__onFlowUpdateNode(id, { color: newColor });
    }
  };

  // Color scheme variants
  const colorStyles = {
    yellow: {
      bg: "bg-amber-950/40 backdrop-blur-md",
      border: "border-amber-500/50",
      header: "text-amber-300 border-amber-500/20",
      badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      text: "text-amber-100/90",
      subtext: "text-amber-300/70",
      ring: "ring-amber-400/80",
    },
    blue: {
      bg: "bg-blue-950/40 backdrop-blur-md",
      border: "border-blue-500/50",
      header: "text-blue-300 border-blue-500/20",
      badge: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      text: "text-blue-100/90",
      subtext: "text-blue-300/70",
      ring: "ring-blue-400/80",
    },
    purple: {
      bg: "bg-purple-950/40 backdrop-blur-md",
      border: "border-purple-500/50",
      header: "text-purple-300 border-purple-500/20",
      badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      text: "text-purple-100/90",
      subtext: "text-purple-300/70",
      ring: "ring-purple-400/80",
    },
    emerald: {
      bg: "bg-emerald-950/40 backdrop-blur-md",
      border: "border-emerald-500/50",
      header: "text-emerald-300 border-emerald-500/20",
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      text: "text-emerald-100/90",
      subtext: "text-emerald-300/70",
      ring: "ring-emerald-400/80",
    },
  }[color];

  return (
    <div
      className={`rounded-2xl p-3 select-none transition-all duration-150 shadow-xl border ${
        colorStyles.border
      } ${colorStyles.bg} ${
        selected ? `ring-2 ${colorStyles.ring} scale-[1.01]` : "hover:border-opacity-100"
      } ${isCollapsed ? "w-64" : "w-80"}`}
    >
      {/* Header bar with non-executable badge */}
      <div
        className={`flex items-center justify-between pb-2 mb-2 border-b ${colorStyles.header} cursor-pointer`}
        onClick={handleToggleCollapse}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            className="text-slate-400 hover:text-white transition p-0.5"
            title={isCollapsed ? "Expand Comment" : "Collapse Comment"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
          <StickyNote className="w-4 h-4 shrink-0" />
          {isEditing ? (
            <input
              type="text"
              value={title}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleBlur}
              className="bg-black/40 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white font-semibold focus:outline-none w-full"
            />
          ) : (
            <span className="text-xs font-bold truncate">{title}</span>
          )}
        </div>

        {/* Visual Pill: NON-EXECUTABLE */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border flex items-center gap-0.5 ${colorStyles.badge}`}
            title="Ignored by Kotlin code generator"
          >
            <Info className="w-2.5 h-2.5" />
            <span>Comment</span>
          </span>

          {/* Color changer trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              title="Change note color"
              className="p-1 hover:bg-white/10 rounded transition cursor-pointer text-slate-300 hover:text-white"
            >
              <Palette className="w-3 h-3" />
            </button>

            {showColorPicker && (
              <div
                className="absolute top-full right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg p-1.5 shadow-xl flex gap-1 z-50 animate-in fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                {(["yellow", "blue", "purple", "emerald"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleSelectColor(c)}
                    className={`w-4 h-4 rounded-full border border-white/20 transition hover:scale-110 ${
                      c === "yellow"
                        ? "bg-amber-400"
                        : c === "blue"
                        ? "bg-blue-400"
                        : c === "purple"
                        ? "bg-purple-400"
                        : "bg-emerald-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(!isEditing);
            }}
            title="Edit note"
            className="p-1 hover:bg-white/10 rounded transition cursor-pointer text-slate-300 hover:text-white"
          >
            <Edit3 className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={handleDelete}
            title="Delete comment note"
            className="p-1 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded transition cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Body content */}
      {!isCollapsed ? (
        <div className="space-y-2">
          {isEditing ? (
            <textarea
              autoFocus
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={handleBlur}
              className="w-full bg-black/40 p-2 text-xs rounded-xl border border-slate-700 font-sans focus:outline-none text-white resize-none"
            />
          ) : (
            <p className={`text-xs font-sans whitespace-pre-wrap leading-relaxed ${colorStyles.text}`}>
              {text}
            </p>
          )}
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-white/5">
            <span>Non-executable note</span>
            <span className="italic">Excluded from Kotlin build</span>
          </div>
        </div>
      ) : (
        <div className={`text-[11px] truncate italic ${colorStyles.subtext}`}>
          {text}
        </div>
      )}
    </div>
  );
});

NoteNode.displayName = "NoteNode";
