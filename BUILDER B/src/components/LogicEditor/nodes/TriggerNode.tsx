import React, { memo, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import {
  Zap,
  Trash2,
  Copy,
  ChevronDown,
  Power,
  Smartphone,
  MousePointerClick,
  Sliders,
  Bell,
  Clock,
  Radio,
  Bug,
} from "lucide-react";
import { TriggerNodeData } from "../types";

export const TriggerNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as unknown as TriggerNodeData;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Derive icon based on event or component
  const getEventIcon = () => {
    const ev = (nodeData.event || "").toLowerCase();
    if (ev.includes("click")) return <MousePointerClick className="w-3.5 h-3.5" />;
    if (ev.includes("create") || ev.includes("resume") || ev.includes("lifecycle"))
      return <Smartphone className="w-3.5 h-3.5" />;
    if (ev.includes("timer") || ev.includes("delay")) return <Clock className="w-3.5 h-3.5" />;
    if (ev.includes("sensor") || ev.includes("location")) return <Radio className="w-3.5 h-3.5" />;
    return <Zap className="w-3.5 h-3.5" />;
  };

  const handleToggleEnabled = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof (window as any).__onFlowUpdateNode === "function") {
      (window as any).__onFlowUpdateNode(id, { enabled: nodeData.enabled === false ? true : false });
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof (window as any).__onFlowDeleteNode === "function") {
      (window as any).__onFlowDeleteNode(id);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof (window as any).__onFlowDuplicateNode === "function") {
      (window as any).__onFlowDuplicateNode(id);
    }
  };

  const handleEventChange = (newEvent: string) => {
    if (typeof (window as any).__onFlowUpdateNode === "function") {
      (window as any).__onFlowUpdateNode(id, { event: newEvent });
    }
    setIsMenuOpen(false);
  };

  const handleComponentChange = (newCompId: string) => {
    const match = (nodeData.componentsList || []).find((c) => c.id === newCompId);
    if (typeof (window as any).__onFlowUpdateNode === "function") {
      (window as any).__onFlowUpdateNode(id, {
        componentId: newCompId,
        componentName: match ? match.name : newCompId,
      });
    }
  };

  const isEnabled = nodeData.enabled !== false;
  const isSimulatingActive = Boolean((nodeData as any).isSimulatingActive);
  const isPausedAtBreakpoint = Boolean((nodeData as any).isPausedAtBreakpoint);
  const hasBreakpoint = Boolean((nodeData as any).breakpoint);

  const handleToggleBreakpoint = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof (window as any).__onFlowUpdateNode === "function") {
      (window as any).__onFlowUpdateNode(id, {
        breakpoint: !hasBreakpoint,
      });
    }
  };

  return (
    <div
      className={`group relative rounded-2xl transition-all select-none shadow-md ${
        isPausedAtBreakpoint
          ? "ring-4 ring-rose-500 shadow-2xl shadow-rose-500/50 scale-105 animate-pulse"
          : isSimulatingActive
          ? "flow-node-active-sim ring-4 ring-amber-400 shadow-2xl scale-105"
          : selected
          ? "ring-2 ring-amber-400 shadow-amber-500/20 shadow-lg scale-[1.02]"
          : "hover:shadow-lg"
      } ${isEnabled ? "opacity-100" : "opacity-60 saturate-50"}`}
      style={{ minWidth: "260px", maxWidth: "340px" }}
    >
      {/* Floating Hover Toolbar with Breakpoint Toggle */}
      <div className="absolute -top-7 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center bg-slate-900/95 border border-slate-700/90 rounded-lg px-1.5 py-0.5 shadow-xl gap-1 z-40">
        <button
          type="button"
          onClick={handleToggleBreakpoint}
          title={hasBreakpoint ? "Remove Breakpoint" : "Set Breakpoint (Pause simulation here)"}
          className={`px-1.5 py-0.5 rounded transition flex items-center gap-1 text-[10px] font-semibold cursor-pointer ${
            hasBreakpoint
              ? "bg-rose-600 text-white shadow-xs"
              : "text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Bug className={`w-3.5 h-3.5 ${hasBreakpoint ? "fill-current text-white" : "text-rose-400"}`} />
          <span>{hasBreakpoint ? "Breakpoint Active" : "Breakpoint"}</span>
        </button>
        <div className="w-[1px] h-3 bg-slate-700" />
        <button
          type="button"
          onClick={handleDuplicate}
          title="Duplicate"
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
        >
          <Copy className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          title="Delete"
          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Visual Breakpoint Bug Badge */}
      {hasBreakpoint && (
        <div
          className="absolute -top-2.5 -left-2.5 z-40 bg-rose-600 border-2 border-slate-950 text-white p-1 rounded-full shadow-lg shadow-rose-600/50 flex items-center justify-center animate-bounce"
          title="Breakpoint Active: Simulation pauses when hitting this node"
        >
          <Bug className="w-3.5 h-3.5 fill-current" />
        </div>
      )}

      {/* Outer Card with Amber / Gold Lightning Accent */}
      <div className={`bg-slate-900 border ${hasBreakpoint ? "border-rose-500/80" : "border-amber-500/40"} rounded-2xl overflow-hidden shadow-2xs`}>
        {/* Top Trigger Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 px-3 py-1.5 flex items-center justify-between text-slate-950">
          <div className="flex items-center gap-1.5">
            <span className="p-0.5 rounded-md bg-black/20 text-white">
              <Zap className="w-3.5 h-3.5 fill-current" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider">
              Trigger Event
            </span>
            {hasBreakpoint && (
              <span className="text-[9px] font-black px-1 py-0.2 bg-rose-700 text-white rounded tracking-wide">
                BREAKPOINT
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleToggleBreakpoint}
              title={hasBreakpoint ? "Remove Breakpoint" : "Toggle Breakpoint"}
              className={`p-1 rounded transition cursor-pointer ${
                hasBreakpoint
                  ? "bg-rose-700 text-white ring-2 ring-rose-400"
                  : "hover:bg-black/20 text-slate-900"
              }`}
            >
              <Bug className={`w-3 h-3 ${hasBreakpoint ? "fill-current" : ""}`} />
            </button>
            <button
              type="button"
              onClick={handleToggleEnabled}
              title={isEnabled ? "Disable Trigger" : "Enable Trigger"}
              className="p-1 hover:bg-black/20 rounded transition text-slate-900 cursor-pointer"
            >
              <Power className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleDuplicate}
              title="Duplicate Trigger Flow"
              className="p-1 hover:bg-black/20 rounded transition text-slate-900 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              title="Delete Trigger"
              className="p-1 hover:bg-red-600 hover:text-white rounded transition text-slate-900 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Main Trigger Identity: ⚡ helloButton • On Click */}
        <div className="p-3 bg-slate-900/95 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              {getEventIcon()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-white truncate">
                  ⚡ {nodeData.componentName || "Component"}
                </span>
                <span className="text-slate-500 text-xs">•</span>
                <span className="text-xs font-semibold text-amber-300 truncate">
                  {nodeData.event || "On Click"}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                Fires when user interacts with {nodeData.componentName}
              </p>
            </div>
          </div>

          {/* Quick Component & Event Selectors */}
          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800">
            {/* Component Picker */}
            <select
              value={nodeData.componentId}
              onChange={(e) => handleComponentChange(e.target.value)}
              className="px-2 py-1 text-[11px] font-medium bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-lg focus:outline-none focus:border-amber-400 truncate cursor-pointer"
              title="Change Target Component"
            >
              {(nodeData.componentsList || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>

            {/* Event Picker */}
            <select
              value={nodeData.event || "Click"}
              onChange={(e) => handleEventChange(e.target.value)}
              className="px-2 py-1 text-[11px] font-medium bg-slate-800/90 text-amber-300 border border-slate-700/80 rounded-lg focus:outline-none focus:border-amber-400 truncate cursor-pointer"
              title="Change Trigger Event"
            >
              {(nodeData.availableEvents && nodeData.availableEvents.length > 0
                ? nodeData.availableEvents
                : ["Click", "LongClick", "OnCreate", "TextChanged", "ValueChanged"]
              ).map((ev) => (
                <option key={ev} value={ev}>
                  {ev}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bottom Flow Connector Indicator */}
        <div className="px-3 py-1 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span>Execution starts here</span>
          <span className="text-amber-400 font-mono text-[9px]">OUTPUT ▼</span>
        </div>
      </div>

      {/* Bottom Output Handle (Source) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="trigger-out"
        className="!w-4 !h-4 !bg-amber-400 !border-2 !border-slate-950 !rounded-full !bottom-[-8px] transition hover:scale-125 cursor-crosshair shadow-md shadow-amber-500/50"
      />
    </div>
  );
});

TriggerNode.displayName = "TriggerNode";
