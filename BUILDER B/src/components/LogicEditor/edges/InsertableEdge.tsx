import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";
import { Plus } from "lucide-react";

export const InsertableEdge: React.FC<EdgeProps> = ({
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
}) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof (window as any).__onFlowInsertOnEdge === "function") {
      (window as any).__onFlowInsertOnEdge(
        id,
        { x: labelX, y: labelY },
        e.clientX,
        e.clientY
      );
    }
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan flex items-center gap-1.5 z-20 group"
        >
          {label && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-950/95 border border-slate-700 shadow-md backdrop-blur-sm select-none"
              style={labelStyle}
            >
              {label}
            </span>
          )}

          {/* Floating '+' Insertion Button */}
          <button
            type="button"
            onClick={handlePlusClick}
            title="Insert node between these connections"
            className="w-5 h-5 rounded-full bg-slate-900/90 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 hover:border-blue-400 shadow-lg hover:shadow-blue-500/40 transition-all duration-150 transform hover:scale-125 active:scale-95 cursor-pointer"
          >
            <Plus className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
