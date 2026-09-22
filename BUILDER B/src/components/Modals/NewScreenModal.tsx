import React, { useState, useEffect } from "react";
import { X, Plus, Sparkles, Check } from "lucide-react";
import {
  SCREEN_TEMPLATES,
  ScreenTemplateId,
  formatComposableName,
  formatScreenTitle,
} from "../../utils/screenManager";

interface NewScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  screensCount: number;
  onCreateScreen: (options: {
    name: string;
    title: string;
    template: ScreenTemplateId;
    isInitial: boolean;
  }) => void;
}

export const NewScreenModal: React.FC<NewScreenModalProps> = ({
  isOpen,
  onClose,
  screensCount,
  onCreateScreen,
}) => {
  const [rawName, setRawName] = useState("");
  const [title, setTitle] = useState("");
  const [template, setTemplate] = useState<ScreenTemplateId>("blank");
  const [isInitial, setIsInitial] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const nextNum = screensCount + 1;
      setRawName(`Screen${nextNum}`);
      setTitle(`Screen ${nextNum}`);
      setTemplate("blank");
      setIsInitial(screensCount === 0);
    }
  }, [isOpen, screensCount]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawName.trim()) return;
    const finalName = formatComposableName(rawName);
    const finalTitle = title.trim() || formatScreenTitle(finalName);
    onCreateScreen({
      name: finalName,
      title: finalTitle,
      template,
      isInitial,
    });
    onClose();
  };

  const composablePreview = formatComposableName(rawName || "NewScreen");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Create New Android Screen</h3>
              <p className="text-xs text-slate-500">
                Choose a screen name, display title, and layout template.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Screen Composable Name
              </label>
              <input
                type="text"
                required
                autoFocus
                value={rawName}
                onChange={(e) => {
                  setRawName(e.target.value);
                  if (!title || title === formatScreenTitle(formatComposableName(rawName))) {
                    setTitle(formatScreenTitle(formatComposableName(e.target.value)));
                  }
                }}
                placeholder="e.g. ProfileScreen, CartScreen"
                className="w-full text-xs font-mono font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Composable: <code className="text-violet-600 font-bold">@{composablePreview}</code>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Display Title (TopAppBar)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. User Profile, Checkout"
                className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition"
              />
              <p className="text-[10px] text-slate-400 mt-1">Shown in app header & navigation</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Starter Layout Template
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SCREEN_TEMPLATES.map((tmpl) => {
                const isSelected = template === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setTemplate(tmpl.id)}
                    className={`p-2.5 rounded-xl border text-left transition relative ${
                      isSelected
                        ? "bg-violet-50 border-violet-500 ring-2 ring-violet-500/20"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-slate-800">{tmpl.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-violet-600 stroke-[3]" />}
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {tmpl.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="new-screen-launcher"
              checked={isInitial}
              onChange={(e) => setIsInitial(e.target.checked)}
              className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500"
            />
            <label htmlFor="new-screen-launcher" className="text-xs text-slate-700 cursor-pointer">
              <span className="font-semibold text-slate-800">Set as Launcher Activity</span> (App opens to this screen)
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-600 hover:text-slate-800 px-4 py-2 rounded-xl hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Screen</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
