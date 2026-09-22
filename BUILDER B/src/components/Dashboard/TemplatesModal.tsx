import React, { useState } from "react";
import { X, Sparkles, Layers, ArrowRight, Check } from "lucide-react";
import { PROJECT_TEMPLATES, ProjectTemplate } from "../../data/projectTemplates";
import { SavedProject } from "../../types";
import { INITIAL_ASSETS } from "../../data/initialData";

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (project: SavedProject) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  if (!isOpen) return null;

  const categories = ["All", "E-Commerce", "SaaS App", "Android App"];

  const filtered =
    selectedCategory === "All"
      ? PROJECT_TEMPLATES
      : PROJECT_TEMPLATES.filter((t) => t.category === selectedCategory);

  const handleUseTemplate = (tpl: ProjectTemplate) => {
    const newProject: SavedProject = {
      id: `proj_tpl_${Date.now()}`,
      name: tpl.name,
      packageName: tpl.config.packageName || "com.droidforge.template",
      description: tpl.description,
      category: tpl.category,
      status: "Draft",
      gradient: tpl.gradient,
      updatedAt: "Just now",
      createdAt: new Date().toISOString().split("T")[0],
      screensCount: tpl.screensCount,
      deploymentsCount: 0,
      viewsCount: "0",
      config: tpl.config,
      screens: tpl.screens,
      assets: INITIAL_ASSETS,
    };

    onSelectTemplate(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Project Templates</h2>
              <p className="text-xs text-slate-500">
                Kickstart your application with pre-built Jetpack Compose architectures
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2 bg-white">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {filtered.map((tpl) => (
            <div
              key={tpl.id}
              className="border border-slate-200 rounded-2xl overflow-hidden hover:border-indigo-400 hover:shadow-md transition flex flex-col justify-between bg-white group"
            >
              {/* Top Banner Gradient */}
              <div className={`h-24 bg-gradient-to-r ${tpl.gradient} p-3.5 flex items-start justify-between relative`}>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-800 shadow-2xs">
                  {tpl.badge}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/20 text-white backdrop-blur-xs">
                  {tpl.screensCount} Screens
                </span>
              </div>

              {/* Body */}
              <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition">
                      {tpl.name}
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Material 3 Ready</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUseTemplate(tpl)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-2xs"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
