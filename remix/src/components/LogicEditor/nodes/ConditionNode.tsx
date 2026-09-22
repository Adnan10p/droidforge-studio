import React, { memo, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import {
  HelpCircle,
  Check,
  X,
  Plus,
  Trash2,
  Copy,
  Edit2,
  Sliders,
  ChevronDown,
  GitBranch,
  Bug,
} from "lucide-react";
import { ConditionNodeData } from "../types";
import { LogicCondition } from "../../../types";

export const ConditionNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as unknown as ConditionNodeData;
  const cond = nodeData.condition || {
    left: "emailInput.text",
    operator: "isEmpty",
    right: "",
  };
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

  const handleAddBranchAction = (branch: "yes" | "no") => {
    if (typeof (window as any).__onFlowAddConnectedAction === "function") {
      (window as any).__onFlowAddConnectedAction(id, branch === "yes" ? "branch-yes" : "branch-no");
    }
  };

  const handleUpdateCondition = (field: keyof LogicCondition, val: any) => {
    const updated = { ...cond, [field]: val };
    if (typeof (window as any).__onFlowUpdateNode === "function") {
      (window as any).__onFlowUpdateNode(id, {
        condition: updated,
        title: `${updated.left} ${updated.operator} ${updated.right ? updated.right : ""}?`.trim(),
      });
    }
  };

  // Human readable title like "Email Empty?" or "Count > 10"
  const displayTitle = nodeData.title || (
    cond.operator === "isEmpty"
      ? `If ${cond.left || "Input"} is Empty`
      : cond.operator === "isNotEmpty"
      ? `If ${cond.left || "Input"} is Not Empty`
      : `If ${cond.left || "Value"} ${cond.operator} ${cond.right || "0"}`
  );

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
          ? "ring-2 ring-amber-400 shadow-amber-500/30 shadow-lg scale-[1.02]"
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
          title="Edit Condition"
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
          title="Breakpoint Active: Simulation pauses when hitting this decision"
        >
          <Bug className="w-3.5 h-3.5 fill-current" />
        </div>
      )}

      {/* Top Input Handle (Incoming execution flow) */}
      <Handle
        type="target"
        position={Position.Top}
        id="condition-in"
        className="!w-4 !h-4 !bg-amber-400 !border-2 !border-slate-950 !rounded-full !top-[-8px] transition hover:scale-125 cursor-crosshair shadow-md shadow-amber-500/60"
      />

      {/* Main Condition Diamond-Inspired Card */}
      <div
        className={`border-2 ${
          hasBreakpoint
            ? "border-rose-500 shadow-rose-950/50"
            : "border-amber-500/80 hover:border-amber-400"
        } shadow-xl shadow-amber-950/30 rounded-2xl overflow-hidden transition-all`}
        style={{
          backgroundColor: "var(--logic-condition-bg, #221403)",
          borderColor: hasBreakpoint ? undefined : "var(--logic-condition-border, #F59E0B)",
        }}
      >
        {/* Warm Amber Subtle Gradient Header Banner - Compact */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 px-2.5 py-1 flex items-center justify-between text-white font-bold shadow-xs">
          <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-1">
            <span className="p-0.5 rounded-md bg-black/30 border border-amber-300/30 shadow-2xs text-amber-200 shrink-0">
              <GitBranch className="w-3.5 h-3.5 stroke-[2.5]" />
            </span>
            <span className="text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-400/30 uppercase tracking-wider shrink-0">
              IF / THEN
            </span>
            <span className="text-[11px] font-bold text-white drop-shadow-xs truncate" title={displayTitle}>
              {displayTitle}
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
              title={isEditing ? "Close Editor" : "Edit Condition Expression"}
              className="p-1 hover:bg-black/25 rounded transition text-white/90 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleDuplicate}
              title="Duplicate Condition"
              className="p-1 hover:bg-black/25 rounded transition text-white/90 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              title="Delete Condition"
              className="p-1 hover:bg-red-600 rounded transition text-white/90 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Condition Question Body: e.g. ◇ Email Empty? - Compact */}
        <div className="p-2.5 bg-gradient-to-b from-slate-900/90 via-slate-900/95 to-amber-950/40 space-y-1.5 text-center">
          <div className="flex items-center justify-center gap-1 text-xs font-mono font-bold text-amber-200">
            <span className="text-amber-400 text-xs">◇</span>
            <span className="text-xs text-white tracking-tight font-extrabold">{displayTitle}</span>
          </div>

          <div className="p-1.5 px-2 rounded-lg bg-slate-950/90 border border-amber-500/30 text-[10.5px] font-mono text-slate-300 flex items-center justify-center gap-1.5 shadow-inner flex-wrap">
            <span className="text-amber-300 font-bold bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-500/30">
              {cond.left || "var"}
            </span>
            <span className="text-amber-200 font-bold bg-amber-500/25 px-1.5 py-0.5 rounded border border-amber-500/40">
              {cond.operator}
            </span>
            {cond.operator !== "isEmpty" && cond.operator !== "isNotEmpty" && (
              <span className="text-emerald-300 font-bold bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-500/30">
                {cond.right || "\"\""}
              </span>
            )}
          </div>

          {/* Inline Expression Editor */}
          {isEditing && (
            <div className="pt-2 border-t border-amber-500/20 space-y-2 text-left animate-in fade-in duration-150">
              <div>
                <label className="text-[10px] text-amber-300 font-semibold block mb-0.5">Left Operand / Target</label>
                <input
                  type="text"
                  value={cond.left}
                  onChange={(e) => handleUpdateCondition("left", e.target.value)}
                  placeholder="e.g. emailInput.text or count"
                  className="w-full px-2 py-1 text-xs bg-slate-950/80 text-white rounded-lg border border-amber-500/40 focus:border-amber-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="text-[10px] text-amber-300 font-semibold block mb-0.5">Operator</label>
                  <select
                    value={cond.operator}
                    onChange={(e) => handleUpdateCondition("operator", e.target.value as any)}
                    className="w-full px-2 py-1 text-xs bg-slate-950/80 text-amber-300 font-bold rounded-lg border border-amber-500/40 focus:border-amber-400"
                  >
                    <option value="isEmpty">isEmpty</option>
                    <option value="isNotEmpty">isNotEmpty</option>
                    <option value="==">== (equals)</option>
                    <option value="!=">!= (not equals)</option>
                    <option value=">">&gt; (greater)</option>
                    <option value="<">&lt; (less)</option>
                    <option value=">=">&gt;= (greater or eq)</option>
                    <option value="<=">&lt;= (less or eq)</option>
                    <option value="contains">contains</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-amber-300 font-semibold block mb-0.5">Right Value</label>
                  <input
                    type="text"
                    value={cond.right}
                    disabled={cond.operator === "isEmpty" || cond.operator === "isNotEmpty"}
                    onChange={(e) => handleUpdateCondition("right", e.target.value)}
                    placeholder="e.g. '' or 0"
                    className="w-full px-2 py-1 text-xs bg-slate-950/80 text-white rounded-lg border border-amber-500/40 focus:border-amber-400 font-mono disabled:opacity-40"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dual Branch Output Controls (YES vs NO) */}
        <div className="grid grid-cols-2 border-t border-purple-500/20 bg-slate-950/90 text-xs font-bold divide-x divide-purple-500/20">
          {/* YES / TRUE Branch */}
          <div className="p-2 flex flex-col items-center gap-1.5">
            <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-mono font-black">
              <Check className="w-3.5 h-3.5 stroke-[3]" /> YES (True)
            </span>
            <button
              type="button"
              onClick={() => handleAddBranchAction("yes")}
              className="w-full py-1 px-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 text-[10px] font-bold transition cursor-pointer shadow-xs"
            >
              + YES Action
            </button>
          </div>

          {/* NO / FALSE Branch */}
          <div className="p-2 flex flex-col items-center gap-1.5">
            <span className="text-rose-400 flex items-center gap-1 text-[11px] font-mono font-black">
              <X className="w-3.5 h-3.5 stroke-[3]" /> NO (False)
            </span>
            <button
              type="button"
              onClick={() => handleAddBranchAction("no")}
              className="w-full py-1 px-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 hover:border-rose-400 text-[10px] font-bold transition cursor-pointer shadow-xs"
            >
              + NO Action
            </button>
          </div>
        </div>
      </div>

      {/* Output Handles for YES and NO branches */}
      {/* YES Handle (Bottom-Left) */}
      <div className="absolute -bottom-2 left-1/4 -translate-x-1/2 flex flex-col items-center">
        <Handle
          type="source"
          position={Position.Bottom}
          id="branch-yes"
          className="!w-4 !h-4 !bg-emerald-400 !border-2 !border-slate-950 !rounded-full transition hover:scale-125 cursor-crosshair shadow-md shadow-emerald-500/60"
        />
      </div>

      {/* NO Handle (Bottom-Right) */}
      <div className="absolute -bottom-2 left-3/4 -translate-x-1/2 flex flex-col items-center">
        <Handle
          type="source"
          position={Position.Bottom}
          id="branch-no"
          className="!w-4 !h-4 !bg-rose-400 !border-2 !border-slate-950 !rounded-full transition hover:scale-125 cursor-crosshair shadow-md shadow-rose-500/60"
        />
      </div>
    </div>
  );
});

ConditionNode.displayName = "ConditionNode";
