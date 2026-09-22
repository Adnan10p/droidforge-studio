import React, { useContext } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";
import { Plus, AlertTriangle } from "lucide-react";
import { NodeErrorContext } from "../NodeErrorContext";

export const InsertableEdge: React.FC<EdgeProps> = ({
  id,
  source,
  target,
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
  data,
}) => {
  const nodeErrorMap = useContext(NodeErrorContext);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  const hasSourceError = source ? nodeErrorMap.has(source) : false;
  const hasTargetError = target ? nodeErrorMap.has(target) : false;

  const isBroken = Boolean(
    data?.isBroken ||
    data?.isError ||
    (style as any)?.stroke === "#F43F5E" ||
    hasSourceError ||
    hasTargetError
  );

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

  const strokeColor = isBroken
    ? "#F43F5E"
    : data?.strokeColor || "#8B5CF6";

  const isAnimated = Boolean(data?.animated ?? true);
  const animationType = data?.animationType || "animated-dots"; // "animated-dots" | "flowing-pulse" | "solid" | "dashed-glow"

  const edgeStyle = isBroken
    ? {
        ...style,
        stroke: "#F43F5E",
        strokeWidth: 2.5,
        strokeDasharray: "6 6",
      }
    : {
        ...style,
        stroke: strokeColor,
        strokeWidth: (style as any)?.strokeWidth || 2.5,
      };

  return (
    <>
      {/* Primary Edge Line */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={edgeStyle}
        className={isBroken ? "broken-flow-edge" : undefined}
      />

      {/* Moving Dot / Flowing Pulse Animated Overlay */}
      {!isBroken && isAnimated && animationType !== "solid" && (
        <path
          d={edgePath}
          fill="none"
          stroke={data?.pulseColor || strokeColor}
          strokeWidth={(style as any)?.strokeWidth ? Number((style as any).strokeWidth) + 1 : 3.5}
          strokeDasharray={animationType === "flowing-pulse" ? "12 12" : "4 8"}
          strokeLinecap="round"
          className="animate-flow-dash pointer-events-none opacity-80"
          style={{
            filter: animationType === "dashed-glow" ? `drop-shadow(0 0 6px ${strokeColor})` : undefined,
          }}
        />
      )}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan flex items-center gap-1.5 z-20 group"
        >
          {isBroken && (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-950/95 border border-rose-500/80 text-rose-300 shadow-lg shadow-rose-900/50 flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3 text-rose-400 fill-rose-500/20" />
              <span>Broken Flow</span>
            </span>
          )}

          {label && !isBroken && (
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
            className={`w-5 h-5 rounded-full bg-slate-900/90 text-slate-300 hover:text-white flex items-center justify-center border shadow-lg transition-all duration-150 transform hover:scale-125 active:scale-95 cursor-pointer ${
              isBroken
                ? "hover:bg-rose-600 border-rose-600/80 hover:border-rose-400 shadow-rose-600/40"
                : "hover:bg-indigo-600 border-slate-700 hover:border-indigo-400 shadow-indigo-500/40"
            }`}
          >
            <Plus className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
