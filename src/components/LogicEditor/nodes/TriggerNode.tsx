import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import {
  Zap,
  Trash2,
  Copy,
  Power,
  Smartphone,
  MousePointerClick,
  Clock,
  Radio,
  Bug,
  Tag,
} from "lucide-react";
import { TriggerNodeData } from "../types";
import { NodeErrorContext } from "../NodeErrorContext";
import {
  getComponentLogicMeta,
  getValidEventsForComponent,
  getOutputsForEvent,
} from "../../../data/componentLogicMetadata";

export const TriggerNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as unknown as TriggerNodeData;
  const nodeErrorMap = React.useContext(NodeErrorContext);

  // Find target component metadata
  const compList = nodeData.componentsList || [];
  const matchComp = compList.find(
    (c) => c.id === nodeData.componentId || c.name === nodeData.componentName
  );

  const isRootScreen = matchComp
    ? matchComp.id.startsWith("root") ||
      matchComp.type === "Screen" ||
      matchComp.name.toLowerCase().includes("screen")
    : true;

  const displayCompName = isRootScreen
    ? "Screen1"
    : matchComp
    ? matchComp.name
    : nodeData.componentName || "Screen1";

  const compType = matchComp ? (isRootScreen ? "Screen" : matchComp.type) : "Screen";
  const validEvents = getValidEventsForComponent(compType);
  const currentEventDef = validEvents.find((e) => e.id === nodeData.event) || validEvents[0];
  const currentEventId = currentEventDef ? currentEventDef.id : nodeData.event || "Click";
  const currentEventName = currentEventDef ? currentEventDef.name : currentEventId;
  const eventDescription = currentEventDef
    ? currentEventDef.description
    : `Fires when ${displayCompName} triggers ${currentEventId}`;

  // Event output parameters (e.g. permissionName, isKeyboardVisible, errorCode, etc.)
  const eventOutputs = currentEventDef?.outputs || getOutputsForEvent(compType, currentEventId);

  // Icon
  const getEventIcon = () => {
    const ev = currentEventId.toLowerCase();
    if (ev.includes("click")) return <MousePointerClick className="w-3.5 h-3.5 text-amber-400" />;
    if (ev.includes("screen") || ev.includes("resume") || ev.includes("pause") || ev.includes("initialize"))
      return <Smartphone className="w-3.5 h-3.5 text-amber-400" />;
    if (ev.includes("timer") || ev.includes("tick")) return <Clock className="w-3.5 h-3.5 text-amber-400" />;
    if (ev.includes("sensor") || ev.includes("location") || ev.includes("barcode")) return <Radio className="w-3.5 h-3.5 text-amber-400" />;
    return <Zap className="w-3.5 h-3.5 text-amber-400" />;
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

  const handleEventChange = (newEventId: string) => {
    if (typeof (window as any).__onFlowUpdateNode === "function") {
      (window as any).__onFlowUpdateNode(id, { event: newEventId });
    }
  };

  const handleComponentChange = (newCompId: string) => {
    const match = compList.find((c) => c.id === newCompId);
    const newCompName = match ? match.name : newCompId;
    const newIsRoot = match
      ? match.id.startsWith("root") || match.type === "Screen" || match.name.toLowerCase().includes("screen")
      : true;
    const newCompType = match ? (newIsRoot ? "Screen" : match.type) : "Screen";
    const newValidEvents = getValidEventsForComponent(newCompType);
    const hasCurrentEv = newValidEvents.some((e) => e.id === nodeData.event);
    const nextEvent = hasCurrentEv ? nodeData.event : (newValidEvents[0]?.id || "Click");

    if (typeof (window as any).__onFlowUpdateNode === "function") {
      (window as any).__onFlowUpdateNode(id, {
        componentId: newCompId,
        componentName: newCompName,
        event: nextEvent,
      });
    }
  };

  const isEnabled = nodeData.enabled !== false;
  const isSimulatingActive = Boolean((nodeData as any).isSimulatingActive);
  const isPausedAtBreakpoint = Boolean((nodeData as any).isPausedAtBreakpoint);
  const hasBreakpoint = Boolean((nodeData as any).breakpoint);
  const hasError = Boolean((nodeData as any).hasError || nodeErrorMap.has(id));

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
        hasError
          ? "node-error-ring ring-2 ring-rose-500 shadow-2xl shadow-rose-500/60 scale-[1.02]"
          : isPausedAtBreakpoint
          ? "ring-4 ring-rose-500 shadow-2xl shadow-rose-500/50 scale-105 animate-pulse"
          : isSimulatingActive
          ? "flow-node-active-sim ring-4 ring-amber-400 shadow-2xl scale-105"
          : selected
          ? "ring-2 ring-amber-400 shadow-amber-500/20 shadow-lg scale-[1.02]"
          : "hover:shadow-lg"
      } ${isEnabled ? "opacity-100" : "opacity-60 saturate-50"}`}
      style={{ minWidth: "270px", maxWidth: "360px" }}
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
      <div className={`bg-slate-900 border ${hasError ? "border-rose-500/90" : hasBreakpoint ? "border-rose-500/80" : "border-amber-500/40"} rounded-2xl overflow-hidden shadow-2xs`}>
        {/* Top Trigger Banner */}
        <div className={`px-3 py-1.5 flex items-center justify-between text-slate-950 ${
          hasError
            ? "bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 text-white font-bold"
            : "bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500"
        }`}>
          <div className="flex items-center gap-1.5">
            <span className="p-0.5 rounded-md bg-black/20 text-white">
              <Zap className="w-3.5 h-3.5 fill-current" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider">
              Trigger Event
            </span>
            {hasError && (
              <span className="text-[9px] font-black px-1.5 py-0.3 bg-rose-950 border border-rose-400 text-rose-200 rounded-full tracking-wide shadow-sm flex items-center gap-1 animate-pulse">
                ⛔ ERROR
              </span>
            )}
            {hasBreakpoint && !hasError && (
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

        {/* Main Trigger Identity: ⚡ Screen1 • OnScreenLoad */}
        <div className="p-3 bg-slate-900/95 space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              {getEventIcon()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-mono font-bold text-white truncate">
                  ⚡ {displayCompName}
                </span>
                <span className="text-slate-500 text-xs">•</span>
                <span className="text-xs font-semibold text-amber-300 truncate">
                  {currentEventId}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                {eventDescription}
              </p>

              {/* Event Output Parameter Badges */}
              {eventOutputs.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1.5 mt-1.5 border-t border-slate-800">
                  {eventOutputs.map((out) => (
                    <span
                      key={out.name}
                      className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-200 border border-amber-500/40 text-[9px] font-mono flex items-center gap-1 shadow-2xs"
                    >
                      <Tag className="w-2.5 h-2.5 text-amber-400" />
                      <span className="font-bold">{out.name}</span>
                      <span className="text-amber-400/80 text-[8px]">● {out.type}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Component-Aware Component & Event Selectors */}
          <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-800">
            {/* Component Picker */}
            <div>
              <label className="text-[9px] font-semibold text-slate-400 block mb-0.5 uppercase tracking-wider">Component</label>
              <select
                value={nodeData.componentId}
                onChange={(e) => handleComponentChange(e.target.value)}
                className="w-full px-2 py-1 text-[11px] font-medium bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-lg focus:outline-none focus:border-amber-400 truncate cursor-pointer"
                title="Select Component"
              >
                {compList.map((c) => {
                  const isRoot = c.id.startsWith("root") || c.type === "Screen" || c.name.toLowerCase().includes("screen");
                  const displayName = isRoot ? "Screen1" : c.name;
                  return (
                    <option key={c.id} value={c.id}>
                      {displayName} ({isRoot ? "Screen" : c.type})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Component-Aware Event Picker */}
            <div>
              <label className="text-[9px] font-semibold text-slate-400 block mb-0.5 uppercase tracking-wider">Event</label>
              <select
                value={currentEventId}
                onChange={(e) => handleEventChange(e.target.value)}
                className="w-full px-2 py-1 text-[11px] font-medium bg-slate-800/90 text-amber-300 border border-slate-700/80 rounded-lg focus:outline-none focus:border-amber-400 truncate cursor-pointer"
                title="Select Component Event"
              >
                {validEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name || ev.id}
                  </option>
                ))}
              </select>
            </div>
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
