import React, { useState, useEffect } from "react";
import { X, Edit3, Check } from "lucide-react";
import { AndroidScreen } from "../../types";
import { formatComposableName, formatScreenTitle } from "../../utils/screenManager";

interface RenameScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  screen: AndroidScreen | null;
  onRename: (screenId: string, newName: string, newTitle: string) => void;
}

export const RenameScreenModal: React.FC<RenameScreenModalProps> = ({
  isOpen,
  onClose,
  screen,
  onRename,
}) => {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (screen && isOpen) {
      setName(screen.name);
      setTitle(screen.title || formatScreenTitle(screen.name));
    }
  }, [screen, isOpen]);

  if (!isOpen || !screen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const formattedName = formatComposableName(name);
    const finalTitle = title.trim() || formatScreenTitle(formattedName);
    onRename(screen.id, formattedName, finalTitle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Rename Screen</h3>
              <p className="text-[11px] text-slate-500">Update Composable identifier and title</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Screen Composable Name
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ProfileScreen"
              className="w-full text-xs font-mono font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Generated: <code className="text-violet-700 font-bold">@{formatComposableName(name || "Screen")}</code>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Display Title (AppBar)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. User Profile"
              className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-xl hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow-xs transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Name</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
