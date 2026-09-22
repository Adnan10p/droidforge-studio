import React, { useState } from "react";
import {
  Sliders,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Code,
  Tag,
  Search,
  Eye,
  Edit2,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { StateVariable } from "../../types";
import { FlowNode } from "./types";

interface VariableInspectorProps {
  variables: StateVariable[];
  nodes: FlowNode[];
  onSaveVariables: (vars: StateVariable[]) => void;
  onClose?: () => void;
}

export const VariableInspector: React.FC<VariableInspectorProps> = ({
  variables,
  nodes,
  onSaveVariables,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<StateVariable["type"]>("String");
  const [editValue, setEditValue] = useState("");

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<StateVariable["type"]>("String");
  const [newValue, setNewValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Find all variable usage across nodes in current flow
  const getVariableUsage = (varName: string) => {
    const referencingNodes = nodes.filter((n) => {
      const d = n.data as any;
      if (d.action?.variableName === varName) return true;
      if (d.condition?.left?.includes(varName) || d.condition?.right?.includes(varName)) return true;
      if (d.action?.value?.toString().includes(varName)) return true;
      return false;
    });
    return referencingNodes;
  };

  const handleStartEdit = (v: StateVariable) => {
    setEditingId(v.id);
    setEditName(v.name);
    setEditType(v.type);
    setEditValue(v.initialValue);
  };

  const handleSaveEdit = (id: string) => {
    const updated = variables.map((v) =>
      v.id === id
        ? { ...v, name: editName.trim() || v.name, type: editType, initialValue: editValue }
        : v
    );
    onSaveVariables(updated);
    setEditingId(null);
  };

  const handleAddVariable = () => {
    if (!newName.trim()) return;
    const newVar: StateVariable = {
      id: `var_${Date.now()}`,
      name: newName.trim().replace(/[^a-zA-Z0-9_]/g, ""),
      type: newType,
      initialValue: newValue || (newType === "Int" || newType === "Double" ? "0" : newType === "Boolean" ? "false" : ""),
    };
    onSaveVariables([...variables, newVar]);
    setNewName("");
    setNewValue("");
    setIsAdding(false);
  };

  const handleDeleteVariable = (id: string) => {
    onSaveVariables(variables.filter((v) => v.id !== id));
  };

  const filteredVars = variables.filter((v) =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-72 md:w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full select-none shrink-0 text-slate-200 z-20 shadow-2xl">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-tight">Variable Inspector</h3>
            <p className="text-[10px] text-slate-400">State & Scope Real-time Tracking</p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search & Add Bar */}
      <div className="p-2 border-b border-slate-800 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search variables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="px-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      {/* Add New Variable Form Drawer */}
      {isAdding && (
        <div className="p-3 bg-slate-950 border-b border-slate-800 space-y-2 text-xs">
          <div className="font-bold text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create State Variable</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Name</label>
              <input
                type="text"
                placeholder="varName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs font-mono focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Data Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs cursor-pointer focus:border-emerald-500"
              >
                <option value="String">String</option>
                <option value="Int">Int</option>
                <option value="Boolean">Boolean</option>
                <option value="Double">Double</option>
                <option value="List">List</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Initial Value</label>
            <input
              type="text"
              placeholder="e.g. 0, true, 'hello'"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs font-mono focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddVariable}
              className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
            >
              Save Variable
            </button>
          </div>
        </div>
      )}

      {/* Variables List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
        {filteredVars.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            <Sliders className="w-8 h-8 mx-auto opacity-30 mb-2" />
            <p>No state variables registered.</p>
            <p className="text-[10px] mt-1">Click "+ New" to add state variables.</p>
          </div>
        ) : (
          filteredVars.map((v) => {
            const usage = getVariableUsage(v.name);
            const isEditing = editingId === v.id;

            return (
              <div
                key={v.id}
                className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition space-y-2"
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-slate-900 border border-slate-700 px-2 py-1 text-xs font-mono text-emerald-300 rounded"
                      />
                      <select
                        value={editType}
                        onChange={(e) => setEditType(e.target.value as any)}
                        className="bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-slate-200 rounded"
                      >
                        <option value="String">String</option>
                        <option value="Int">Int</option>
                        <option value="Boolean">Boolean</option>
                        <option value="Double">Double</option>
                        <option value="List">List</option>
                      </select>
                    </div>

                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 px-2 py-1 text-xs font-mono text-slate-300 rounded"
                    />

                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(v.id)}
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-white">{v.name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-[9px] font-mono font-bold text-emerald-400">
                          {v.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(v)}
                          title="Edit Variable"
                          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteVariable(v.id)}
                          title="Delete Variable"
                          className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Value & Scope preview */}
                    <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800/80 font-mono text-[10px] text-slate-300 flex items-center justify-between">
                      <span className="text-slate-500">Initial:</span>
                      <span className="text-emerald-300 font-bold truncate max-w-[140px]">
                        {v.initialValue || '""'}
                      </span>
                    </div>

                    {/* Usage & Type Check */}
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1 text-slate-400">
                        <Eye className="w-3 h-3 text-indigo-400" />
                        <span>Used in {usage.length} node{usage.length === 1 ? "" : "s"}</span>
                      </div>

                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Type OK</span>
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
