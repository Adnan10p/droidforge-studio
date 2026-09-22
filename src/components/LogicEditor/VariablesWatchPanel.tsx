import React, { useState } from "react";
import {
  Eye,
  Sliders,
  Play,
  RotateCcw,
  Edit2,
  Check,
  X,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  TrendingUp,
  History,
  ArrowRight,
} from "lucide-react";
import { StateVariable } from "../../types";
import { VariableChangeRecord } from "./useVariablesWatch";

interface VariablesWatchPanelProps {
  variables: StateVariable[];
  simulatedValues: Record<string, any>;
  isSimulating: boolean;
  lastChangedVar?: string | null;
  changeHistory?: VariableChangeRecord[];
  onUpdateValue?: (varName: string, nextValue: any) => void;
  onResetValues?: () => void;
  onOpenModal?: () => void;
  onClearHistory?: () => void;
}

export const VariablesWatchPanel: React.FC<VariablesWatchPanelProps> = ({
  variables,
  simulatedValues,
  isSimulating,
  lastChangedVar,
  changeHistory = [],
  onUpdateValue,
  onResetValues,
  onOpenModal,
  onClearHistory,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingVar, setEditingVar] = useState<string | null>(null);
  const [editTempVal, setEditTempVal] = useState<string>("");

  const handleStartEdit = (name: string, currentVal: any) => {
    setEditingVar(name);
    setEditTempVal(String(currentVal ?? ""));
  };

  const handleSaveEdit = (v: StateVariable) => {
    if (!editingVar) return;
    let parsed: any = editTempVal;
    if (v.type === "Int") {
      parsed = parseInt(editTempVal, 10) || 0;
    } else if (v.type === "Double") {
      parsed = parseFloat(editTempVal) || 0;
    } else if (v.type === "Boolean") {
      parsed = editTempVal.toLowerCase() === "true";
    }
    if (onUpdateValue) {
      onUpdateValue(v.name, parsed);
    }
    setEditingVar(null);
  };

  return (
    <div className="border-t border-slate-800 bg-slate-950/95 text-slate-200 shadow-inner">
      {/* Header bar */}
      <div
        className="px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-900/60 transition select-none"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <button type="button" className="text-slate-400 hover:text-white">
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold text-white tracking-tight">
              Variables Watch
            </span>
            {isSimulating ? (
              <span className="flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono">
                ({variables.length})
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {changeHistory.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowHistory(!showHistory);
              }}
              title="Toggle Variable Change History"
              className={`p-1 rounded-md transition text-[10px] flex items-center gap-0.5 cursor-pointer ${
                showHistory
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "hover:bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <History className="w-3 h-3" />
              <span className="text-[9px] font-mono">{changeHistory.length}</span>
            </button>
          )}

          {onResetValues && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onResetValues();
              }}
              title="Reset variable values to defaults"
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md transition text-[10px] flex items-center gap-0.5 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}

          {onOpenModal && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenModal();
              }}
              title="Add or manage variables"
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-emerald-300 rounded-md transition text-[10px] flex items-center gap-0.5 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Watch Table */}
      {!isCollapsed && (
        <div className="px-3 pb-3 pt-1 space-y-2 max-h-56 overflow-y-auto">
          {/* Recent Change History Drawer */}
          {showHistory && changeHistory.length > 0 && (
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] space-y-1 mb-2">
              <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider pb-1 border-b border-slate-800">
                <span className="flex items-center gap-1 text-emerald-400">
                  <TrendingUp className="w-3 h-3" /> Live Change Stream
                </span>
                {onClearHistory && (
                  <button
                    type="button"
                    onClick={onClearHistory}
                    className="text-slate-500 hover:text-rose-400 text-[9px]"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {changeHistory.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between font-mono py-0.5 text-slate-300"
                  >
                    <span className="text-indigo-300 truncate max-w-[80px]">
                      {rec.varName}
                    </span>
                    <div className="flex items-center gap-1 text-[9px]">
                      <span className="text-slate-500 truncate max-w-[50px]">
                        {String(rec.oldValue ?? "nil")}
                      </span>
                      <ArrowRight className="w-2.5 h-2.5 text-emerald-400" />
                      <span className="text-emerald-300 font-bold truncate max-w-[50px]">
                        {String(rec.newValue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {variables.length === 0 ? (
            <div className="text-center py-3 text-slate-400 text-[11px] space-y-1">
              <p>No state variables defined for this screen.</p>
              {onOpenModal && (
                <button
                  type="button"
                  onClick={onOpenModal}
                  className="text-indigo-400 hover:underline font-semibold"
                >
                  + Add State Variable
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              {variables.map((v) => {
                const currentVal =
                  simulatedValues[v.name] !== undefined
                    ? simulatedValues[v.name]
                    : v.defaultValue;
                const isEditing = editingVar === v.name;
                const isRecentlyChanged = lastChangedVar === v.name;

                return (
                  <div
                    key={v.id || v.name}
                    className={`flex items-center justify-between p-1.5 rounded-xl border transition-all ${
                      isRecentlyChanged
                        ? "bg-emerald-500/20 border-emerald-500/60 ring-2 ring-emerald-500/40 scale-[1.01]"
                        : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {/* Left: Variable Name & Type Badge */}
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span
                        className={`text-[9px] font-mono px-1 py-0.5 rounded font-bold uppercase ${
                          v.type === "Int" || v.type === "Double"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : v.type === "Boolean"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : v.type === "List"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {v.type}
                      </span>
                      <span className="text-xs font-mono font-bold text-white truncate">
                        {v.name}
                      </span>
                    </div>

                    {/* Right: Real-time Value & Quick Override */}
                    <div className="flex items-center gap-1 shrink-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editTempVal}
                            onChange={(e) => setEditTempVal(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEdit(v);
                              if (e.key === "Escape") setEditingVar(null);
                            }}
                            className="w-16 px-1.5 py-0.5 text-xs bg-slate-950 border border-indigo-500 rounded text-white font-mono focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(v)}
                            className="p-1 text-emerald-400 hover:bg-slate-800 rounded"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingVar(null)}
                            className="p-1 text-slate-400 hover:bg-slate-800 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span
                            onClick={() => handleStartEdit(v.name, currentVal)}
                            title="Click to override value"
                            className={`px-2 py-0.5 rounded font-mono text-xs cursor-pointer border transition-colors ${
                              isRecentlyChanged
                                ? "bg-emerald-400 text-slate-950 font-bold border-emerald-300"
                                : "bg-slate-950/80 text-emerald-300 border-slate-800 hover:border-indigo-500"
                            }`}
                          >
                            {typeof currentVal === "boolean"
                              ? currentVal
                                ? "true"
                                : "false"
                              : String(currentVal ?? "")}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(v.name, currentVal)}
                            title="Override variable value during simulation"
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
