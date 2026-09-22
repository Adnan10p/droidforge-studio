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
      bg: "bg-slate-900/95",
      border: "border-amber-500/80 hover:border-amber-400 shadow-amber-950/40",
      headerGradient: "bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white",
      badge: "bg-black/30 text-amber-200 border-amber-300/30",
      text: "text-amber-50 font-medium",
      subtext: "text-amber-200/80",
      ring: "ring-2 ring-amber-400 shadow-amber-500/30",
      customBg: "var(--logic-comment-bg, #1C1303)",
    },
    blue: {
      bg: "bg-slate-900/95",
      border: "border-blue-500/80 hover:border-blue-400 shadow-blue-950/40",
      headerGradient: "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white",
      badge: "bg-black/30 text-blue-200 border-blue-300/30",
      text: "text-blue-50 font-medium",
      subtext: "text-blue-200/80",
      ring: "ring-2 ring-blue-400 shadow-blue-500/30",
      customBg: "var(--logic-comment-bg, #0B172E)",
    },
    purple: {
      bg: "bg-slate-900/95",
      border: "border-purple-500/80 hover:border-purple-400 shadow-purple-950/40",
      headerGradient: "bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-700 text-white",
      badge: "bg-black/30 text-purple-200 border-purple-300/30",
      text: "text-purple-50 font-medium",
      subtext: "text-purple-200/80",
      ring: "ring-2 ring-purple-400 shadow-purple-500/30",
      customBg: "var(--logic-comment-bg, #170C29)",
    },
    emerald: {
      bg: "bg-slate-900/95",
      border: "border-emerald-500/80 hover:border-emerald-400 shadow-emerald-950/40",
      headerGradient: "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white",
      badge: "bg-black/30 text-emerald-200 border-emerald-300/30",
      text: "text-emerald-50 font-medium",
      subtext: "text-emerald-200/80",
      ring: "ring-2 ring-emerald-400 shadow-emerald-500/30",
      customBg: "var(--logic-comment-bg, #061F16)",
    },
  }[color];

  return (
    <div
      className={`rounded-2xl select-none transition-all duration-150 shadow-xl border-2 overflow-hidden ${
        colorStyles.border
      } ${colorStyles.bg} ${
        selected ? `${colorStyles.ring} scale-[1.01]` : "hover:border-opacity-100"
      } ${isCollapsed ? "w-64" : "w-80"}`}
      style={{
        backgroundColor: colorStyles.customBg,
      }}
    >
      {/* Header bar with subtle gradient & non-executable badge */}
      <div
        className={`flex items-center justify-between px-3 py-1.5 ${colorStyles.headerGradient} cursor-pointer shadow-xs`}
        onClick={handleToggleCollapse}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            className="text-white/80 hover:text-white transition p-0.5"
            title={isCollapsed ? "Expand Comment" : "Collapse Comment"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
          <StickyNote className="w-3.5 h-3.5 shrink-0" />
          {isEditing ? (
            <input
              type="text"
              value={title}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleBlur}
              className="bg-black/40 border border-white/30 rounded px-1.5 py-0.5 text-xs text-white font-semibold focus:outline-none w-full"
            />
          ) : (
            <span className="text-xs font-bold truncate tracking-tight">{title}</span>
          )}
        </div>

        {/* Visual Pill: COMMENT / NOTE */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border flex items-center gap-0.5 ${colorStyles.badge}`}
            title="Comment block - excluded from Kotlin build"
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
              className="p-1 hover:bg-black/20 rounded transition cursor-pointer text-white/90 hover:text-white"
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
            title="Edit note title"
            className="p-1 hover:bg-black/20 rounded transition cursor-pointer text-white/90 hover:text-white"
          >
            <Edit3 className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={handleDelete}
            title="Delete comment note"
            className="p-1 hover:bg-red-600 rounded transition cursor-pointer text-white/90 hover:text-white"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Body content */}
      <div className="p-3 bg-gradient-to-b from-slate-900/90 via-slate-900/95 to-slate-950/98">
        {!isCollapsed ? (
          <div className="space-y-2">
            {isEditing ? (
              <textarea
                autoFocus
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={handleBlur}
                className="w-full bg-black/50 p-2 text-xs rounded-xl border border-slate-700 font-sans focus:outline-none text-white resize-none"
              />
            ) : (
              <p className={`text-xs font-sans whitespace-pre-wrap leading-relaxed ${colorStyles.text}`}>
                {text}
              </p>
            )}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/10">
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
    </div>
  );
});

NoteNode.displayName = "NoteNode";
