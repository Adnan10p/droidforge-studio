import React, { memo, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import {
  Type,
  Navigation,
  Bell,
  MessageSquare,
  Globe,
  Database,
  Vibrate,
  Clock,
  ExternalLink,
  Trash2,
  Copy,
  Plus,
  Edit2,
  Check,
  Smartphone,
  Flame,
  Volume2,
  CheckCircle2,
  Sliders,
  ChevronDown,
  Bug,
} from "lucide-react";
import { ActionNodeData } from "../types";
import { LogicAction } from "../../../types";

export const ActionNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as unknown as ActionNodeData;
  const action = nodeData.action || ({} as LogicAction);
  const [isEditing, setIsEditing] = useState(false);

  // Helper to get action category styling & title
  const getActionMeta = () => {
    switch (action.actionType) {
      case "setProperty":
        return {
          title: "Change Text / Prop",
          icon: <Type className="w-3.5 h-3.5" />,
          color: "border-blue-500/60 bg-blue-950/40 text-blue-400",
          headerBg: "from-blue-600 to-cyan-600",
          subline: action.property || "text",
        };
      case "setVariable":
        return {
          title: "Set Variable",
          icon: <Sliders className="w-3.5 h-3.5" />,
          color: "border-emerald-500/60 bg-emerald-950/40 text-emerald-400",
          headerBg: "from-emerald-600 to-teal-600",
          subline: action.variableOperation || "assign",
        };
      case "navigate":
        return {
          title: "Navigate Screen",
          icon: <Navigation className="w-3.5 h-3.5" />,
          color: "border-indigo-500/60 bg-indigo-950/40 text-indigo-400",
          headerBg: "from-indigo-600 to-purple-600",
          subline: action.targetScreen || "Details",
        };
      case "popBack":
        return {
          title: "Pop Screen Back",
          icon: <Navigation className="w-3.5 h-3.5 rotate-180" />,
          color: "border-indigo-500/60 bg-indigo-950/40 text-indigo-400",
          headerBg: "from-indigo-600 to-purple-600",
          subline: "Go Back",
        };
      case "toast":
        return {
          title: "Show Toast",
          icon: <Bell className="w-3.5 h-3.5" />,
          color: "border-amber-500/60 bg-amber-950/40 text-amber-400",
          headerBg: "from-amber-600 to-yellow-600",
          subline: "Quick message",
        };
      case "snackbar":
        return {
          title: "Show Snackbar",
          icon: <MessageSquare className="w-3.5 h-3.5" />,
          color: "border-orange-500/60 bg-orange-950/40 text-orange-400",
          headerBg: "from-orange-600 to-red-600",
          subline: action.actionLabel || "Action",
        };
      case "dialog":
        return {
          title: "Alert Dialog",
          icon: <MessageSquare className="w-3.5 h-3.5" />,
          color: "border-purple-500/60 bg-purple-950/40 text-purple-400",
          headerBg: "from-purple-600 to-pink-600",
          subline: action.dialogTitle || "Notice",
        };
      case "callApi":
        return {
          title: "Call API",
          icon: <Globe className="w-3.5 h-3.5" />,
          color: "border-sky-500/60 bg-sky-950/40 text-sky-400",
          headerBg: "from-sky-600 to-blue-600",
          subline: `${action.method || "GET"} ${action.endpoint || "/api"}`,
        };
      case "firebaseWrite":
      case "firebaseRead":
        return {
          title: action.actionType === "firebaseWrite" ? "Firebase Write" : "Firebase Read",
          icon: <Flame className="w-3.5 h-3.5" />,
          color: "border-amber-500/60 bg-amber-950/40 text-amber-400",
          headerBg: "from-amber-600 to-orange-600",
          subline: action.collectionName || "collection",
        };
      case "databaseInsert":
      case "databaseQuery":
        return {
          title: "Room Database",
          icon: <Database className="w-3.5 h-3.5" />,
          color: "border-teal-500/60 bg-teal-950/40 text-teal-400",
          headerBg: "from-teal-600 to-emerald-600",
          subline: action.tableName || "table",
        };
      case "vibrate":
        return {
          title: "Haptic Vibrate",
          icon: <Vibrate className="w-3.5 h-3.5" />,
          color: "border-pink-500/60 bg-pink-950/40 text-pink-400",
          headerBg: "from-pink-600 to-rose-600",
          subline: action.hapticPattern || "click",
        };
      case "delay":
        return {
          title: "Delay Timer",
          icon: <Clock className="w-3.5 h-3.5" />,
          color: "border-yellow-500/60 bg-yellow-950/40 text-yellow-400",
          headerBg: "from-yellow-600 to-amber-600",
          subline: `${action.delayMs || 1000} ms`,
        };
      case "openBrowser":
        return {
          title: "Open Browser",
          icon: <ExternalLink className="w-3.5 h-3.5" />,
          color: "border-cyan-500/60 bg-cyan-950/40 text-cyan-400",
          headerBg: "from-cyan-600 to-blue-600",
          subline: action.url || "https://",
        };
      default:
        return {
          title: action.actionType || "Action",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          color: "border-slate-500/60 bg-slate-950/40 text-slate-400",
          headerBg: "from-slate-600 to-zinc-600",
          subline: "Execute",
        };
    }
  };

  const meta = getActionMeta();

  // Find target component name
  const targetCompName =
    (nodeData.componentsList || []).find((c) => c.id === action.targetId)?.name ||
    action.targetId ||
    "target";

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

  const handleAddSubsequentAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof (window as any).__onFlowAddConnectedAction === "function") {
      (window as any).__onFlowAddConnectedAction(id, "bottom");
    }
  };

  const handleUpdateActionField = (field: keyof LogicAction, val: any) => {
    const updatedAction = { ...action, [field]: val };
    if (typeof (window as any).__onFlowUpdateNode === "function") {
      (window as any).__onFlowUpdateNode(id, { action: updatedAction });
    }
  };

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
          ? "flow-node-active-sim ring-4 ring-blue-400 shadow-2xl scale-105"
          : selected
          ? "ring-2 ring-blue-400 shadow-blue-500/20 shadow-lg scale-[1.02]"
          : "hover:shadow-lg"
      }`}
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
          onClick={() => setIsEditing(!isEditing)}
          title="Edit Parameters"
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
        >
          <Edit2 className="w-3 h-3" />
        </button>
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
          title="Breakpoint Active: Simulation pauses when hitting this action"
        >
          <Bug className="w-3.5 h-3.5 fill-current" />
        </div>
      )}

      {/* Top Input Handle (Target from trigger or previous step) */}
      <Handle
        type="target"
        position={Position.Top}
        id="action-in"
        className="!w-4 !h-4 !bg-blue-400 !border-2 !border-slate-950 !rounded-full !top-[-8px] transition hover:scale-125 cursor-crosshair shadow-md shadow-blue-500/50"
      />

      {/* Main Node Card */}
      <div className={`bg-slate-900 border ${hasBreakpoint ? "border-rose-500/80" : "border-slate-700/80"} rounded-2xl overflow-hidden shadow-2xs`}>
        {/* Action Header Banner */}
        <div
          className={`bg-gradient-to-r ${meta.headerBg} px-3 py-1.5 flex items-center justify-between text-white`}
        >
          <div className="flex items-center gap-1.5">
            <span className="p-0.5 rounded-md bg-black/25">{meta.icon}</span>
            <span className="text-[11px] font-bold tracking-tight">{meta.title}</span>
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
                  : "hover:bg-black/25 text-white/90"
              }`}
            >
              <Bug className={`w-3 h-3 ${hasBreakpoint ? "fill-current" : ""}`} />
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              title={isEditing ? "Close Editor" : "Quick Edit Parameters"}
              className="p-1 hover:bg-black/25 rounded transition text-white/90 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleDuplicate}
              title="Duplicate Action"
              className="p-1 hover:bg-black/25 rounded transition text-white/90 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              title="Delete Action"
              className="p-1 hover:bg-red-600 rounded transition text-white/90 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Action Body (Exactly matching user prompt visual specification) */}
        {/*
          ┌───────────────────────┐
          │ Change Text           │
          │ helloText             │
          │ "Hello World"         │
          └───────────────────────┘
        */}
        <div className="p-3 bg-slate-900/95 space-y-2">
          {/* Target Component / Variable */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono text-[11px]">Target:</span>
            <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700/60 truncate max-w-[170px]">
              {action.actionType === "setVariable"
                ? action.variableName || "variable"
                : targetCompName}
            </span>
          </div>

          {/* Primary Value / Payload Card */}
          <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="uppercase font-semibold tracking-wider">
                {action.actionType === "setProperty"
                  ? `Property: ${action.property || "text"}`
                  : action.actionType === "navigate"
                  ? "Destination Screen"
                  : action.actionType === "callApi"
                  ? "HTTP Endpoint"
                  : action.actionType === "setVariable"
                  ? `Operation: ${action.variableOperation || "assign"}`
                  : "Value / Message"}
              </span>
            </div>

            <div className="text-xs font-mono font-semibold text-emerald-300 break-all line-clamp-2">
              {action.actionType === "setProperty"
                ? `"${action.value ?? "Hello World"}"`
                : action.actionType === "navigate"
                ? action.targetScreen || "HomeScreen"
                : action.actionType === "callApi"
                ? `${action.method || "GET"} ${action.endpoint || "/api/data"}`
                : action.actionType === "toast" || action.actionType === "snackbar"
                ? `"${action.message || "Notification sent"}"`
                : action.actionType === "setVariable"
                ? `${action.variableOperation === "increment" ? "+=" : "="} ${
                    action.variableValue || "1"
                  }`
                : String(action.value ?? meta.subline)}
            </div>
          </div>

          {/* Inline Quick Editor if toggled */}
          {isEditing && (
            <div className="pt-2 border-t border-slate-800 space-y-2 animate-in fade-in duration-150">
              {/* If setProperty */}
              {action.actionType === "setProperty" && (
                <>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Component</label>
                    <select
                      value={action.targetId || ""}
                      onChange={(e) => handleUpdateActionField("targetId", e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-slate-800 text-white rounded border border-slate-700"
                    >
                      {(nodeData.componentsList || []).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.type})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">New Value</label>
                    <input
                      type="text"
                      value={action.value ?? ""}
                      onChange={(e) => handleUpdateActionField("value", e.target.value)}
                      placeholder="e.g. Hello World"
                      className="w-full px-2 py-1 text-xs bg-slate-800 text-white rounded border border-slate-700 font-mono"
                    />
                  </div>
                </>
              )}

              {/* If setVariable */}
              {action.actionType === "setVariable" && (
                <>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Variable Name</label>
                    <input
                      type="text"
                      value={action.variableName ?? ""}
                      onChange={(e) => handleUpdateActionField("variableName", e.target.value)}
                      placeholder="e.g. counter"
                      className="w-full px-2 py-1 text-xs bg-slate-800 text-white rounded border border-slate-700 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Operation</label>
                      <select
                        value={action.variableOperation || "assign"}
                        onChange={(e) =>
                          handleUpdateActionField("variableOperation", e.target.value as any)
                        }
                        className="w-full px-2 py-1 text-xs bg-slate-800 text-white rounded border border-slate-700"
                      >
                        <option value="assign">Assign (=)</option>
                        <option value="increment">Increment (+)</option>
                        <option value="decrement">Decrement (-)</option>
                        <option value="toggle">Toggle (!)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Value</label>
                      <input
                        type="text"
                        value={action.variableValue ?? ""}
                        onChange={(e) => handleUpdateActionField("variableValue", e.target.value)}
                        placeholder="1"
                        className="w-full px-2 py-1 text-xs bg-slate-800 text-white rounded border border-slate-700 font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* If navigate */}
              {action.actionType === "navigate" && (
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Destination Screen</label>
                  <select
                    value={action.targetScreen || ""}
                    onChange={(e) => handleUpdateActionField("targetScreen", e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-slate-800 text-white rounded border border-slate-700"
                  >
                    {(nodeData.screensList || []).map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.title || s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* If toast or snackbar */}
              {(action.actionType === "toast" || action.actionType === "snackbar") && (
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Message</label>
                  <input
                    type="text"
                    value={action.message ?? ""}
                    onChange={(e) => handleUpdateActionField("message", e.target.value)}
                    placeholder="Enter message..."
                    className="w-full px-2 py-1 text-xs bg-slate-800 text-white rounded border border-slate-700 font-mono"
                  />
                </div>
              )}

              {/* If callApi */}
              {action.actionType === "callApi" && (
                <>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Method</label>
                      <select
                        value={action.method || "GET"}
                        onChange={(e) => handleUpdateActionField("method", e.target.value as any)}
                        className="w-full px-2 py-1 text-xs bg-slate-800 text-white rounded border border-slate-700"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Endpoint URL</label>
                      <input
                        type="text"
                        value={action.endpoint ?? ""}
                        onChange={(e) => handleUpdateActionField("endpoint", e.target.value)}
                        placeholder="/api/v1/resource"
                        className="w-full px-2 py-1 text-xs bg-slate-800 text-white rounded border border-slate-700 font-mono"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Bottom Bar with "+ Action" Quick Connector */}
        <div className="p-1.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleAddSubsequentAction}
            className="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition hover:border-blue-400 cursor-pointer shadow-2xs"
            title="Append connected Action step below"
          >
            <Plus className="w-3 h-3" />
            <span>+ Action</span>
          </button>
        </div>
      </div>

      {/* Bottom Output Handle (Source) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="action-out"
        className="!w-4 !h-4 !bg-blue-400 !border-2 !border-slate-950 !rounded-full !bottom-[-8px] transition hover:scale-125 cursor-crosshair shadow-md shadow-blue-500/50"
      />
    </div>
  );
});

ActionNode.displayName = "ActionNode";
