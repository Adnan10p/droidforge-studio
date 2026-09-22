import React, { useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
} from "@xyflow/react";
import { Plus, GitBranch, Zap, Clock, Globe } from "lucide-react";

export function CustomFlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  labelStyle,
  source,
  target,
  sourceHandleId,
  targetHandleId,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof (window as any).__onFlowEdgeContextMenu === "function") {
      (window as any).__onFlowEdgeContextMenu(e, id, source, target, sourceHandleId, targetHandleId);
    }
  };

  const handleInsertNode = (type: "action" | "condition" | "delay" | "callApi") => {
    setIsMenuOpen(false);
    if (typeof (window as any).__onFlowEdgeInsertNode === "function") {
      (window as any).__onFlowEdgeInsertNode(id, source, target, type, sourceHandleId, targetHandleId);
    }
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: isHovered ? 3 : style.strokeWidth || 2,
          transition: "stroke-width 0.15s ease, stroke 0.15s ease",
        }}
        interactionWidth={20}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan flex flex-col items-center z-30"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            if (!isMenuOpen) setIsMenuOpen(false);
          }}
          onContextMenu={handleContextMenu}
        >
          {/* Optional Edge Label (e.g. YES ✓ / NO ✕) */}
          {label && !isHovered && !isMenuOpen && (
            <div
              className="px-2 py-0.5 rounded-full bg-slate-950/90 border border-slate-800 text-[10px] font-mono font-bold shadow-md select-none"
              style={labelStyle as React.CSSProperties}
            >
              {label as string}
            </div>
          )}

          {/* Hover / Active Smart + Button */}
          {(isHovered || isMenuOpen) && (
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                title="Insert Node Here (+)"
                className="w-6 h-6 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg border border-indigo-400/50 transition transform hover:scale-125 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              {/* Edge Insertion Popover */}
              {isMenuOpen && (
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 bg-slate-900 border border-indigo-500/50 rounded-xl shadow-2xl p-1.5 space-y-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Insert Connection Block
                  </div>

                  <button
                    type="button"
                    onClick={() => handleInsertNode("action")}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    <span>Add Action</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInsertNode("condition")}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 transition cursor-pointer"
                  >
                    <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                    <span>Add Condition</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInsertNode("delay")}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Add Delay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInsertNode("callApi")}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 text-sky-400" />
                    <span>Call API</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
