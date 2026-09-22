import React, { useState } from "react";
import { X, Plus, Trash2, Sliders, Check } from "lucide-react";
import { StateVariable } from "../../types";

interface VariablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  variables: StateVariable[];
  onSave: (variables: StateVariable[]) => void;
}

export const VariablesModal: React.FC<VariablesModalProps> = ({
  isOpen,
  onClose,
  variables,
  onSave,
}) => {
  const [list, setList] = useState<StateVariable[]>(variables || []);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<StateVariable["type"]>("String");
  const [newVal, setNewVal] = useState("");

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!newName.trim()) return;
    const item: StateVariable = {
      id: `var_${Date.now()}`,
      name: newName.trim().replace(/\s+/g, "_"),
      type: newType,
      initialValue: newVal,
    };
    const updated = [...list, item];
    setList(updated);
    setNewName("");
    setNewVal("");
  };

  const handleRemove = (id: string) => {
    setList((prev) => prev.filter((v) => v.id !== id));
  };

  const handleApply = () => {
    onSave(list);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-slate-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Screen State Variables</h3>
              <p className="text-xs text-slate-400">
                Reactive state accessible by conditions and actions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* New Variable Form */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-300 block">Add New Variable</span>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="varName (e.g. counter)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-1 px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-400"
              />
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="col-span-1 px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-400"
              >
                <option value="String">String</option>
                <option value="Int">Int</option>
                <option value="Boolean">Boolean</option>
                <option value="Float">Float</option>
                <option value="List">List</option>
              </select>
              <input
                type="text"
                placeholder="Initial value (0, '')"
                value={newVal}
                onChange={(e) => setNewVal(e.target.value)}
                className="col-span-1 px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-400"
              />
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Variable</span>
            </button>
          </div>

          {/* Variables List */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Configured Variables ({list.length})
            </span>

            {list.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
                No variables declared on this screen yet.
              </div>
            ) : (
              list.map((v) => (
                <div
                  key={v.id}
                  className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                      {v.type}
                    </span>
                    <span className="font-mono font-bold text-white">{v.name}</span>
                    <span className="text-slate-500 font-mono">=</span>
                    <span className="text-emerald-300 font-mono">
                      "{v.initialValue || ""}"
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(v.id)}
                    className="p-1 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
