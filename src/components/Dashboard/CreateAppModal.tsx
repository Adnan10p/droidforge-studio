import React, { useState } from "react";
import { X, Plus, Sparkles, Smartphone, Check } from "lucide-react";
import { SavedProject, AndroidScreen, UserProfile } from "../../types";
import { DEFAULT_PROJECT_CONFIG, INITIAL_SCREENS, INITIAL_ASSETS } from "../../data/initialData";
import { PROJECT_TEMPLATES } from "../../data/projectTemplates";

interface CreateAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (newProject: SavedProject) => void;
  userProfile?: UserProfile;
}

const GRADIENT_OPTIONS = [
  { id: "blue", name: "Cyan Ocean", classes: "from-cyan-500 via-sky-600 to-blue-700" },
  { id: "purple", name: "Electric Purple", classes: "from-fuchsia-600 via-purple-600 to-pink-600" },
  { id: "emerald", name: "Emerald Mint", classes: "from-emerald-500 via-teal-600 to-green-700" },
  { id: "indigo", name: "Royal Indigo", classes: "from-indigo-600 via-violet-600 to-purple-700" },
  { id: "sunset", name: "Sunset Ember", classes: "from-amber-500 via-orange-600 to-rose-600" },
  { id: "slate", name: "Midnight Dark", classes: "from-slate-700 via-slate-800 to-slate-900" },
];

export const CreateAppModal: React.FC<CreateAppModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
  userProfile,
}) => {
  const [name, setName] = useState("");
  const [packageName, setPackageName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<SavedProject["category"]>("Android App");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("blank");
  const [selectedGradient, setSelectedGradient] = useState<string>(GRADIENT_OPTIONS[0].classes);
  const [status, setStatus] = useState<"Published" | "Draft">("Draft");

  if (!isOpen) return null;

  const prefix = userProfile?.packagePrefix || "com.droidforge";

  const handleNameChange = (val: string) => {
    setName(val);
    const sanitized = val
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    setPackageName(`${prefix}.${sanitized || "myapp"}`);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let projectScreens: AndroidScreen[] = [
      {
        id: `screen_main_${Date.now()}`,
        name: "Screen1",
        title: name.trim() || "Screen1",
        isInitial: true,
        properties: {
          backgroundColor: "#FFFFFF",
          titleVisible: true,
          primaryColor: "#2563EB",
        },
        rootComponent: {
          id: `root_main_${Date.now()}`,
          type: "ScrollView",
          name: "Screen1",
          category: "Layouts",
          props: {
            padding: 16,
            backgroundColor: "#FFFFFF",
            layoutWidth: "match_parent",
            layoutHeight: "match_parent",
          },
          children: [],
        },
        logicBlocks: [],
      },
    ];
    let screenCount = 1;

    if (selectedTemplateId !== "blank") {
      const tpl = PROJECT_TEMPLATES.find((t) => t.id === selectedTemplateId);
      if (tpl) {
        projectScreens = tpl.screens;
        screenCount = tpl.screensCount;
      }
    }

    const defaultPkg = `${prefix}.app`;

    const newProject: SavedProject = {
      id: `proj_${Date.now()}`,
      name: name.trim(),
      packageName: packageName.trim() || defaultPkg,
      description: description.trim() || "Custom Android Jetpack Compose Application",
      category,
      status,
      gradient: selectedGradient,
      updatedAt: "Just now",
      createdAt: new Date().toISOString().split("T")[0],
      screensCount: screenCount,
      deploymentsCount: 0,
      viewsCount: "0",
      config: {
        ...DEFAULT_PROJECT_CONFIG,
        appName: name.trim(),
        packageName: packageName.trim() || defaultPkg,
      },
      screens: projectScreens,
      assets: INITIAL_ASSETS,
      authorProfileId: userProfile?.id,
      authorName: userProfile?.name || userProfile?.defaultAuthor,
    };

    onCreateProject(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Create New App</h2>
              <p className="text-xs text-slate-500">Configure your new Android application project</p>
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

        {/* Modal Body Form */}
        <form onSubmit={handleCreate} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* App Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">App Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Smart Note Keeper, FitPulse Pro"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-2xs font-medium"
            />
          </div>

          {/* Package Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Android Package Name</label>
            <input
              type="text"
              required
              placeholder="com.company.appname"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            />
            <span className="text-[11px] text-slate-400">Unique identifier for Google Play Store</span>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white font-medium shadow-2xs"
              >
                <option value="Android App">Android App</option>
                <option value="Web App">Web App</option>
                <option value="SaaS App">SaaS App</option>
                <option value="Landing Page">Landing Page</option>
                <option value="E-Commerce">E-Commerce</option>
                <option value="Portfolio">Portfolio</option>
                <option value="Tools">Tools & Utility</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white font-medium shadow-2xs"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Short Description</label>
            <input
              type="text"
              placeholder="What does this app do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-2xs"
            />
          </div>

          {/* Starter Template */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 flex items-center justify-between">
              <span>Choose Template</span>
              <span className="text-[11px] text-blue-600 font-normal">Jetpack Compose M3</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div
                onClick={() => setSelectedTemplateId("blank")}
                className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center gap-2.5 ${
                  selectedTemplateId === "blank"
                    ? "border-blue-600 bg-blue-50/50 shadow-2xs"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-xs">Blank App</div>
                  <div className="text-[10px] text-slate-500">Fresh empty canvas</div>
                </div>
              </div>

              {PROJECT_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => {
                    setSelectedTemplateId(tpl.id);
                    setSelectedGradient(tpl.gradient);
                  }}
                  className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center gap-2.5 ${
                    selectedTemplateId === tpl.id
                      ? "border-blue-600 bg-blue-50/50 shadow-2xs"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-slate-800 text-xs truncate">{tpl.name}</div>
                    <div className="text-[10px] text-slate-500">{tpl.category}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Banner Card Theme Gradient */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Dashboard Card Color</label>
            <div className="grid grid-cols-6 gap-2">
              {GRADIENT_OPTIONS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  title={g.name}
                  onClick={() => setSelectedGradient(g.classes)}
                  className={`h-8 rounded-lg bg-gradient-to-r ${g.classes} relative transition flex items-center justify-center ${
                    selectedGradient === g.classes ? "ring-2 ring-blue-600 ring-offset-2 scale-105" : "hover:opacity-90"
                  }`}
                >
                  {selectedGradient === g.classes && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold transition text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Create & Launch Builder</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
