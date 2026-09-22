import React, { memo, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import {
  Globe,
  Check,
  X,
  Plus,
  Trash2,
  Copy,
  Edit2,
  Lock,
  ArrowRight,
  Bug,
} from "lucide-react";
import { ApiBranchNodeData } from "../types";
import { LogicAction } from "../../../types";

export const ApiBranchNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as unknown as ApiBranchNodeData;
  const action = nodeData.action || ({
    method: "POST",
    endpoint: "/api/v1/login",
    actionType: "callApi",
  } as LogicAction);

  const [isEditing, setIsEditing] = useState(false);

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

  const handleAddBranchAction = (branch: "success" | "failure") => {
    if (typeof (window as any).__onFlowAddConnectedAction === "function") {
      (window as any).__onFlowAddConnectedAction(
        id,
        branch === "success" ? "branch-success" : "branch-failure"
      );
    }
  };

  const handleUpdateField = (field: keyof LogicAction, val: any) => {
    const updated = { ...action, [field]: val };
    if (typeof (window as any).__onFlowUpdateNode === "function") {
      (window as any).__onFlowUpdateNode(id, { action: updated });
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
          ? "flow-node-active-sim ring-4 ring-sky-400 shadow-2xl scale-105"
          : selected
          ? "ring-2 ring-sky-400 shadow-sky-500/20 shadow-lg scale-[1.02]"
          : "hover:shadow-lg"
      }`}
      style={{ minWidth: "240px", maxWidth: "320px" }}
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
          title="Breakpoint Active: Simulation pauses when hitting this API node"
        >
          <Bug className="w-3.5 h-3.5 fill-current" />
        </div>
      )}

      {/* Top Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="api-in"
        className="!w-4 !h-4 !bg-sky-400 !border-2 !border-slate-950 !rounded-full !top-[-8px] transition hover:scale-125 cursor-crosshair shadow-md shadow-sky-500/60"
      />

      {/* Main Node Card */}
      <div
        className={`border-2 ${
          hasBreakpoint
            ? "border-rose-500 shadow-rose-950/50"
            : "border-sky-500/80 hover:border-sky-400"
        } shadow-xl shadow-sky-950/30 rounded-2xl overflow-hidden transition-all`}
        style={{
          backgroundColor: "var(--logic-action-bg, #0A172E)",
        }}
      >
        {/* Sky / Cyan Header Banner - Compact */}
        <div className="bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-600 px-2.5 py-1 flex items-center justify-between text-white font-bold shadow-xs">
          <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-1">
            <span className="p-0.5 rounded-md bg-black/30 border border-white/20 shadow-2xs text-sky-200 shrink-0">
              <Globe className="w-3.5 h-3.5 stroke-[2.5]" />
            </span>
            <span className="text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 text-sky-300 border border-sky-400/30 uppercase tracking-wider shrink-0">
              METHOD
            </span>
            <span
              className="text-[11px] font-bold text-white drop-shadow-xs truncate"
              title={`${action.method || "GET"} ${action.endpoint || "/api"}`}
            >
              {action.method || "GET"} {action.endpoint || "/api"}
            </span>
            {hasBreakpoint && (
              <span className="text-[8.5px] font-black px-1.5 py-0.5 bg-rose-700 text-white rounded tracking-wide border border-rose-400/40 shrink-0">
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
              title={isEditing ? "Close Editor" : "Edit API Call"}
              className="p-1 hover:bg-black/25 rounded transition text-white/90 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleDuplicate}
              title="Duplicate API Node"
              className="p-1 hover:bg-black/25 rounded transition text-white/90 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              title="Delete API Node"
              className="p-1 hover:bg-red-600 rounded transition text-white/90 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* API Details Body - Compact */}
        <div className="p-2.5 bg-gradient-to-b from-slate-900 via-slate-900/98 to-sky-950/25 space-y-1.5">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide font-mono shadow-xs ${
                action.method === "POST"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : action.method === "DELETE"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : action.method === "PUT"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-sky-500/20 text-sky-300 border border-sky-500/40"
              }`}
            >
              {action.method || "GET"}
            </span>

            <span className="text-xs font-mono font-bold text-white bg-slate-950/80 px-2 py-0.5 rounded-lg border border-sky-500/30 truncate flex-1 shadow-inner">
              {action.endpoint || "/api/v1/auth/login"}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Async HTTP Request</span>
            <span className="font-mono text-[10px] text-sky-300 font-bold bg-sky-950/40 px-1.5 py-0.5 rounded border border-sky-500/20">
              Retrofit / Ktor
            </span>
          </div>

          {/* Quick Editor */}
          {isEditing && (
            <div className="pt-2 border-t border-sky-500/20 space-y-2 animate-in fade-in duration-150">
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="text-[10px] text-sky-300 font-semibold block mb-0.5">Method</label>
                  <select
                    value={action.method || "GET"}
                    onChange={(e) => handleUpdateField("method", e.target.value as any)}
                    className="w-full px-2 py-1 text-xs bg-slate-950/80 text-white rounded-lg border border-sky-500/30 focus:border-sky-400 font-bold"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] text-sky-300 font-semibold block mb-0.5">Endpoint URL</label>
                  <input
                    type="text"
                    value={action.endpoint ?? ""}
                    onChange={(e) => handleUpdateField("endpoint", e.target.value)}
                    placeholder="/api/login"
                    className="w-full px-2 py-1 text-xs bg-slate-950/80 text-white rounded-lg border border-sky-500/30 focus:border-sky-400 font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dual Branch Output Controls: Success vs Failure */}
        <div className="grid grid-cols-2 border-t border-sky-500/20 bg-slate-950/90 text-xs font-bold divide-x divide-sky-500/20">
          {/* Success Branch */}
          <div className="p-2 flex flex-col items-center gap-1.5">
            <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-mono font-black">
              <Check className="w-3.5 h-3.5 stroke-[3]" /> Success (200 OK)
            </span>
            <button
              type="button"
              onClick={() => handleAddBranchAction("success")}
              className="w-full py-1 px-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 text-[10px] font-bold transition cursor-pointer shadow-xs"
            >
              + On Success
            </button>
          </div>

          {/* Failure Branch */}
          <div className="p-2 flex flex-col items-center gap-1.5">
            <span className="text-rose-400 flex items-center gap-1 text-[11px] font-mono font-black">
              <X className="w-3.5 h-3.5 stroke-[3]" /> Failure (Error)
            </span>
            <button
              type="button"
              onClick={() => handleAddBranchAction("failure")}
              className="w-full py-1 px-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 hover:border-rose-400 text-[10px] font-bold transition cursor-pointer shadow-xs"
            >
              + On Error
            </button>
          </div>
        </div>
      </div>

      {/* Output Handles for Success and Failure branches */}
      {/* Success Handle (Bottom-Left) */}
      <div className="absolute -bottom-2 left-1/4 -translate-x-1/2 flex flex-col items-center">
        <Handle
          type="source"
          position={Position.Bottom}
          id="branch-success"
          className="!w-4 !h-4 !bg-emerald-400 !border-2 !border-slate-950 !rounded-full transition hover:scale-125 cursor-crosshair shadow-md shadow-emerald-500/60"
        />
      </div>

      {/* Failure Handle (Bottom-Right) */}
      <div className="absolute -bottom-2 left-3/4 -translate-x-1/2 flex flex-col items-center">
        <Handle
          type="source"
          position={Position.Bottom}
          id="branch-failure"
          className="!w-4 !h-4 !bg-rose-400 !border-2 !border-slate-950 !rounded-full transition hover:scale-125 cursor-crosshair shadow-md shadow-rose-500/60"
        />
      </div>
    </div>
  );
});

ApiBranchNode.displayName = "ApiBranchNode";
