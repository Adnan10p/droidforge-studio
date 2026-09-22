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

  // Find target component name
  const targetCompName =
    (nodeData.componentsList || []).find((c) => c.id === action.targetId)?.name ||
    action.targetId ||
    "Component";

  // Helper to get action category styling & title
  const getActionMeta = () => {
    switch (action.actionType) {
      case "setProperty":
        return {
          title: "Set Property",
          categoryBadge: "PROP",
          icon: <Type className="w-3.5 h-3.5" />,
          borderColor: "border-blue-500/80 hover:border-blue-400",
          shadowColor: "shadow-blue-950/40",
          headerBg: "from-blue-600 via-indigo-600 to-blue-700",
          cardTint: "bg-gradient-to-b from-slate-900/90 via-slate-900/95 to-blue-950/35",
          handleClass: "!bg-blue-400 !border-slate-950 shadow-blue-500/60",
          valTextColor: "text-cyan-300",
          badgeClass: "bg-blue-500/15 border-blue-500/35 text-blue-300",
          buttonClass: "bg-blue-600/20 hover:bg-blue-600/35 text-blue-300 border border-blue-500/40 hover:border-blue-300",
          subline: `Set ${action.property || "text"} = "${action.value ?? ""}"`,
        };
      case "setVariable":
        return {
          title: "Set Variable",
          categoryBadge: "VAR",
          icon: <Sliders className="w-3.5 h-3.5" />,
          borderColor: "border-teal-500/80 hover:border-teal-400",
          shadowColor: "shadow-teal-950/40",
          headerBg: "from-teal-600 via-emerald-600 to-teal-700",
          cardTint: "bg-gradient-to-b from-slate-900/90 via-slate-900/95 to-teal-950/35",
          handleClass: "!bg-teal-400 !border-slate-950 shadow-teal-500/60",
          valTextColor: "text-teal-300",
          badgeClass: "bg-teal-500/15 border-teal-500/35 text-teal-300",
          buttonClass: "bg-teal-600/20 hover:bg-teal-600/35 text-teal-300 border border-teal-500/40 hover:border-teal-300",
          subline: `${action.variableOperation === "increment" ? "Increment (+=)" : "Assign (=)"}`,
        };
      case "navigate":
        return {
          title: "Navigate",
          categoryBadge: "METHOD",
          icon: <Navigation className="w-3.5 h-3.5" />,
          borderColor: "border-indigo-500/80 hover:border-indigo-400",
          shadowColor: "shadow-indigo-950/40",
          headerBg: "from-indigo-600 via-blue-600 to-indigo-700",
          cardTint: "bg-gradient-to-b from-slate-900/90 via-slate-900/95 to-indigo-950/35",
          handleClass: "!bg-indigo-400 !border-slate-950 shadow-indigo-500/60",
          valTextColor: "text-indigo-300",
          badgeClass: "bg-indigo-500/15 border-indigo-500/35 text-indigo-300",
          buttonClass: "bg-indigo-600/20 hover:bg-indigo-600/35 text-indigo-300 border border-indigo-500/40 hover:border-indigo-300",
          subline: `Transition: ${action.transitionType || "slide"}`,
        };
      case "popBack":
        return {
          title: "Go Back",
          categoryBadge: "METHOD",
          icon: <Navigation className="w-3.5 h-3.5 rotate-180" />,
          borderColor: "border-indigo-500/60 hover:border-indigo-400",
          shadowColor: "shadow-indigo-950/30",
          headerBg: "from-indigo-600 via-purple-600 to-violet-500",
          cardTint: "bg-gradient-to-b from-slate-900 via-slate-900/98 to-indigo-950/25",
          handleClass: "!bg-indigo-400 !border-slate-950 shadow-indigo-500/60",
          valTextColor: "text-indigo-300",
          badgeClass: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300",
          buttonClass: "bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/40 hover:border-indigo-300",
          subline: "Return to previous screen",
        };
      case "toast":
        return {
          title: "Notify",
          categoryBadge: "METHOD",
          icon: <Bell className="w-3.5 h-3.5" />,
          borderColor: "border-amber-500/60 hover:border-amber-400",
          shadowColor: "shadow-amber-950/30",
          headerBg: "from-amber-600 via-amber-500 to-orange-500",
          cardTint: "bg-gradient-to-b from-slate-900 via-slate-900/98 to-amber-950/25",
          handleClass: "!bg-amber-400 !border-slate-950 shadow-amber-500/60",
          valTextColor: "text-amber-300",
          badgeClass: "bg-amber-500/10 border-amber-500/30 text-amber-300",
          buttonClass: "bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border-amber-500/40 hover:border-amber-300",
          subline: action.message ? `"${action.message}"` : "Notification popup",
        };
      case "snackbar":
        return {
          title: "Snackbar",
          categoryBadge: "METHOD",
          icon: <MessageSquare className="w-3.5 h-3.5" />,
          borderColor: "border-orange-500/60 hover:border-orange-400",
          shadowColor: "shadow-orange-950/30",
          headerBg: "from-orange-600 via-amber-600 to-rose-600",
          cardTint: "bg-gradient-to-b from-slate-900 via-slate-900/98 to-orange-950/25",
          handleClass: "!bg-orange-400 !border-slate-950 shadow-orange-500/60",
          valTextColor: "text-orange-300",
          badgeClass: "bg-orange-500/10 border-orange-500/30 text-orange-300",
          buttonClass: "bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border-orange-500/40 hover:border-orange-300",
          subline: action.actionLabel ? `Action: ${action.actionLabel}` : "With Action",
        };
      case "dialog":
        return {
          title: "Alert",
          categoryBadge: "METHOD",
          icon: <MessageSquare className="w-3.5 h-3.5" />,
          borderColor: "border-fuchsia-500/60 hover:border-fuchsia-400",
          shadowColor: "shadow-fuchsia-950/30",
          headerBg: "from-fuchsia-600 via-purple-600 to-pink-500",
          cardTint: "bg-gradient-to-b from-slate-900 via-slate-900/98 to-fuchsia-950/25",
          handleClass: "!bg-fuchsia-400 !border-slate-950 shadow-fuchsia-500/60",
          valTextColor: "text-pink-300",
          badgeClass: "bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-300",
          buttonClass: "bg-fuchsia-600/20 hover:bg-fuchsia-600/30 text-fuchsia-300 border-fuchsia-500/40 hover:border-fuchsia-300",
          subline: action.dialogTitle || "Notice dialog",
        };
      case "callApi":
        return {
          title: "Call API",
          categoryBadge: "METHOD",
          icon: <Globe className="w-3.5 h-3.5" />,
          borderColor: "border-sky-500/60 hover:border-sky-400",
          shadowColor: "shadow-sky-950/30",
          headerBg: "from-sky-600 via-cyan-600 to-blue-600",
          cardTint: "bg-gradient-to-b from-slate-900 via-slate-900/98 to-sky-950/25",
          handleClass: "!bg-sky-400 !border-slate-950 shadow-sky-500/60",
          valTextColor: "text-sky-300",
          badgeClass: "bg-sky-500/10 border-sky-500/30 text-sky-300",
          buttonClass: "bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border-sky-500/40 hover:border-sky-300",
          subline: action.endpoint || "/api",
        };
      case "firebaseWrite":
      case "firebaseRead":
        return {
          title: action.actionType === "firebaseWrite" ? "Set Data" : "Get Data",
          categoryBadge: "DATA",
          icon: <Flame className="w-3.5 h-3.5" />,
          borderColor: "border-amber-500/60 hover:border-amber-400",
          shadowColor: "shadow-amber-950/30",
          headerBg: "from-orange-600 via-amber-600 to-yellow-500",
          cardTint: "bg-gradient-to-b from-slate-900 via-slate-900/98 to-amber-950/25",
          handleClass: "!bg-amber-400 !border-slate-950 shadow-amber-500/60",
          valTextColor: "text-amber-300",
          badgeClass: "bg-amber-500/10 border-amber-500/30 text-amber-300",
          buttonClass: "bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border-amber-500/40 hover:border-amber-300",
          subline: `Collection: ${action.collectionName || "app_records"}`,
        };
      case "databaseInsert":
      case "databaseQuery":
        return {
          title: action.actionType === "databaseInsert" ? "Set Data" : "Get Data",
          categoryBadge: "DATA",
          icon: <Database className="w-3.5 h-3.5" />,
          borderColor: "border-teal-500/60 hover:border-teal-400",
          shadowColor: "shadow-teal-950/30",
          headerBg: "from-teal-600 via-emerald-600 to-teal-500",
          cardTint: "bg-gradient-to-b from-slate-900 via-slate-900/98 to-teal-950/25",
          handleClass: "!bg-teal-400 !border-slate-950 shadow-teal-500/60",
          valTextColor: "text-teal-300",
          badgeClass: "bg-teal-500/10 border-teal-500/30 text-teal-300",
          buttonClass: "bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border-teal-500/40 hover:border-teal-300",
          subline: `Table: ${action.tableName || "records"}`,
        };
      case "vibrate":
        return {
          title: "Vibrate",
          categoryBadge: "METHOD",
          icon: <Vibrate className="w-3.5 h-3.5" />,
          borderColor: "border-rose-500/60 hover:border-rose-400",
          shadowColor: "shadow-rose-950/30",
          headerBg: "from-rose-600 via-pink-600 to-red-500",
          cardTint: "bg-gradient-to-b from-slate-900 via-slate-900/98 to-rose-950/25",
          handleClass: "!bg-rose-400 !border-slate-950 shadow-rose-500/60",
          valTextColor: "text-rose-300",
          badgeClass: "bg-rose-500/10 border-rose-500/30 text-rose-300",
          buttonClass: "bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border-rose-500/40 hover:border-rose-300",
          subline: `Pattern: ${action.hapticPattern || "click"}`,
        };
      case "delay":
        return {
          title: "Delay",
          categoryBadge: "FLOW",
          icon: <Clock className="w-3.5 h-3.5" />,
          borderColor: "border-yellow-500/60 hover:border-yellow-400",
          shadowColor: "shadow-yellow-950/30",
          headerBg: "from-yellow-500 via-amber-500 to-orange-500",
          cardTint: "bg-gradient-to-b from-slate-900 via-slate-900/98 to-yellow-950/25",
          handleClass: "!bg-yellow-400 !border-slate-950 shadow-yellow-500/60",
          valTextColor: "text-yellow-300",
          badgeClass: "bg-yellow-500/10 border-yellow-500/30 text-yellow-300",
          buttonClass: "bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 border-yellow-500/40 hover:border-yellow-300",
          subline: `Duration: ${action.delayMs || 1000} ms`,
        };
      case "openBrowser":
      case "share":
      case "copyToClipboard":
        return {
          title: action.actionType === "openBrowser" ? "Open URL" : action.actionType === "share" ? "Share" : "Copy",
          categoryBadge: "METHOD",
          icon: <ExternalLink className="w-3.5 h-3.5" />,
          borderColor: "border-cyan-500/60 hover:border-cyan-400",
          shadowColor: "shadow-cyan-950/30",
          headerBg: "from-cyan-600 via-blue-600 to-indigo-600",
          cardTint: "bg-gradient-to-b from-slate-900 via-slate-900/98 to-cyan-950/25",
          handleClass: "!bg-cyan-400 !border-slate-950 shadow-cyan-500/60",
          valTextColor: "text-cyan-300",
          badgeClass: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
          buttonClass: "bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border-cyan-500/40 hover:border-cyan-300",
          subline: action.url || "System Action",
        };
      case "aiQuery":
        return {
          title: "AI Prompt",
          categoryBadge: "AI",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          borderColor: "border-purple-500/60 hover:border-purple-400",
          shadowColor: "shadow-purple-950/30",
          headerBg: "from-purple-600 via-fuchsia-600 to-pink-500",
          cardTint: "bg-gradient-to-b from-slate-900 via-slate-900/98 to-purple-950/25",
          handleClass: "!bg-purple-400 !border-slate-950 shadow-purple-500/60",
          valTextColor: "text-purple-300",
          badgeClass: "bg-purple-500/10 border-purple-500/30 text-purple-300",
          buttonClass: "bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border-purple-500/40 hover:border-purple-300",
          subline: "Gemini Model",
        };
      case "playAudio":
      case "textToSpeech":
        return {
          title: action.actionType === "playAudio" ? "Play Audio" : "Speak",
          categoryBadge: "METHOD",
          icon: <Volume2 className="w-3.5 h-3.5" />,
          borderColor: "border-lime-500/60 hover:border-lime-400",
          shadowColor: "shadow-lime-950/30",
          headerBg: "from-lime-600 via-emerald-600 to-teal-500",
          cardTint: "bg-gradient-to-b from-slate-900 via-slate-900/98 to-lime-950/25",
          handleClass: "!bg-lime-400 !border-slate-950 shadow-lime-500/60",
          valTextColor: "text-lime-300",
          badgeClass: "bg-lime-500/10 border-lime-500/30 text-lime-300",
          buttonClass: "bg-lime-600/20 hover:bg-lime-600/30 text-lime-300 border-lime-500/40 hover:border-lime-300",
          subline: action.actionType === "playAudio" ? "Audio Player" : "TTS Voice",
        };
      default:
        return {
          title: action.actionType || "Action",
          categoryBadge: "METHOD",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          borderColor: "border-slate-500/60 hover:border-slate-400",
          shadowColor: "shadow-slate-950/30",
          headerBg: "from-slate-600 to-zinc-600",
          cardTint: "bg-gradient-to-b from-slate-900 via-slate-900/98 to-slate-950/25",
          handleClass: "!bg-blue-400 !border-slate-950 shadow-blue-500/60",
          valTextColor: "text-slate-300",
          badgeClass: "bg-slate-500/10 border-slate-500/30 text-slate-300",
          buttonClass: "bg-slate-700/40 hover:bg-slate-700/60 text-slate-200 border-slate-600",
          subline: "Execute",
        };
    }
  };

  const meta = getActionMeta();

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
          ? "ring-2 ring-blue-400 shadow-blue-500/30 shadow-lg scale-[1.02]"
          : "hover:shadow-lg"
      }`}
      style={{ minWidth: "240px", maxWidth: "310px" }}
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
        className={`!w-4 !h-4 ${meta.handleClass} !border-2 !rounded-full !top-[-8px] transition hover:scale-125 cursor-crosshair shadow-md`}
      />

      {/* Main Node Card with Category Border & Glow */}
      <div
        className={`border-2 ${
          hasBreakpoint
            ? "border-rose-500 shadow-rose-950/50"
            : meta.borderColor
        } ${meta.shadowColor} rounded-2xl overflow-hidden shadow-xl transition-all`}
        style={{
          backgroundColor: "var(--logic-action-bg, #0A172E)",
        }}
      >
        {/* Action Header Banner - Compact height */}
        <div
          className={`bg-gradient-to-r ${meta.headerBg} px-2.5 py-1 flex items-center justify-between text-white font-bold shadow-xs`}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-1">
            <span className="p-0.5 rounded-md bg-black/30 border border-white/20 shadow-2xs shrink-0">
              {meta.icon}
            </span>
            <span className="text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 text-white/90 border border-white/20 uppercase tracking-wider shrink-0">
              {(meta as any).categoryBadge || "METHOD"}
            </span>
            <span
              className="text-[11px] font-bold text-white drop-shadow-xs truncate"
              title={meta.title}
            >
              {meta.title}
            </span>
            {hasBreakpoint && (
              <span className="text-[8.5px] font-black px-1.5 py-0.5 bg-rose-700 text-white rounded tracking-wide border border-rose-400/40 shrink-0">
                BREAKPOINT
              </span>
            )}
          </div>

          <div className="flex items-center gap-0.5">
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

        {/* Action Body with Tinted Background - Compact padding */}
        <div className={`p-2.5 ${meta.cardTint} space-y-1.5`}>
          {/* Target Component / Variable */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono text-[11px]">Target:</span>
            <span
              className={`font-mono font-bold px-2 py-0.5 rounded-md border truncate max-w-[170px] ${meta.badgeClass}`}
            >
              {action.actionType === "setVariable"
                ? action.variableName || "variable"
                : targetCompName}
            </span>
          </div>

          {/* Primary Value / Payload Card */}
          <div className="p-1.5 px-2 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-0.5">
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

            <div className={`text-xs font-mono font-bold ${meta.valTextColor} break-all line-clamp-2`}>
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
        <div className="p-1.5 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between">
          <button
            type="button"
            onClick={handleAddSubsequentAction}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs ${meta.buttonClass}`}
            title="Append connected Action step below"
          >
            <Plus className="w-3 h-3 stroke-[2.5]" />
            <span>+ Action</span>
          </button>
        </div>
      </div>

      {/* Bottom Output Handle (Source) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="action-out"
        className={`!w-4 !h-4 ${meta.handleClass} !border-2 !rounded-full !bottom-[-8px] transition hover:scale-125 cursor-crosshair shadow-md`}
      />
    </div>
  );
});

ActionNode.displayName = "ActionNode";
