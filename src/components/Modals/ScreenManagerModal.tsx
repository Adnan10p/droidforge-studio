import React, { useState, useMemo } from "react";
import {
  X,
  Plus,
  Layers,
  Copy,
  Trash2,
  Edit2,
  Check,
  Star,
  Search,
  Sparkles,
  ClipboardPaste,
  Eye,
  FileCode2,
  LayoutTemplate,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { AndroidScreen } from "../../types";
import {
  SCREEN_TEMPLATES,
  ScreenTemplateId,
  formatComposableName,
  formatScreenTitle,
  cloneScreen,
  createScreenFromTemplate,
  copyScreenToClipboard,
  getCopiedScreenFromClipboard,
  hasCopiedScreen,
} from "../../utils/screenManager";

interface ScreenManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  screens: AndroidScreen[];
  currentScreenId: string;
  onSelectScreen: (screenId: string) => void;
  onCreateScreen: (options: {
    name: string;
    title: string;
    template: ScreenTemplateId;
    isInitial: boolean;
  }) => void;
  onRenameScreen: (screenId: string, newName: string, newTitle: string) => void;
  onDeleteScreen: (screenId: string) => void;
  onDuplicateScreen: (screenId: string) => void;
  onPasteScreen: (copiedScreen: AndroidScreen) => void;
  onSetLauncherScreen: (screenId: string) => void;
  initialMode?: "list" | "create";
}

export const ScreenManagerModal: React.FC<ScreenManagerModalProps> = ({
  isOpen,
  onClose,
  screens,
  currentScreenId,
  onSelectScreen,
  onCreateScreen,
  onRenameScreen,
  onDeleteScreen,
  onDuplicateScreen,
  onPasteScreen,
  onSetLauncherScreen,
  initialMode = "list",
}) => {
  const [mode, setMode] = useState<"list" | "create">(initialMode);
  const [searchQuery, setSearchQuery] = useState("");

  // Create Form State
  const [newRawName, setNewRawName] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<ScreenTemplateId>("blank");
  const [makeLauncher, setMakeLauncher] = useState(false);

  // Edit / Rename State
  const [editingScreenId, setEditingScreenId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editTitle, setEditTitle] = useState("");

  // Delete Confirmation State
  const [screenToDelete, setScreenToDelete] = useState<AndroidScreen | null>(null);

  // Copy Feedback Toast
  const [copiedScreenId, setCopiedScreenId] = useState<string | null>(null);
  const [clipboardNotice, setClipboardNotice] = useState<string | null>(null);

  // Reset form when opening create mode
  const handleOpenCreate = () => {
    const nextNum = screens.length + 1;
    setNewRawName(`Screen${nextNum}`);
    setNewTitle(`Screen ${nextNum}`);
    setSelectedTemplate("blank");
    setMakeLauncher(screens.length === 0);
    setMode("create");
  };

  const handleStartRename = (sc: AndroidScreen) => {
    setEditingScreenId(sc.id);
    setEditName(sc.name);
    setEditTitle(sc.title || formatScreenTitle(sc.name));
  };

  const handleSaveRename = (screenId: string) => {
    if (!editName.trim()) return;
    const formattedName = formatComposableName(editName);
    const finalTitle = editTitle.trim() || formatScreenTitle(formattedName);
    onRenameScreen(screenId, formattedName, finalTitle);
    setEditingScreenId(null);
  };

  const handleCopy = (screen: AndroidScreen) => {
    copyScreenToClipboard(screen);
    setCopiedScreenId(screen.id);
    setClipboardNotice(`Copied "${screen.name}" to clipboard`);
    setTimeout(() => {
      setCopiedScreenId(null);
      setClipboardNotice(null);
    }, 2500);
  };

  const handlePaste = () => {
    const copied = getCopiedScreenFromClipboard();
    if (!copied) return;
    onPasteScreen(copied);
    setClipboardNotice(`Pasted "${copied.name}" as new screen`);
    setTimeout(() => setClipboardNotice(null), 2500);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRawName.trim()) return;
    const finalName = formatComposableName(newRawName);
    const finalTitle = newTitle.trim() || formatScreenTitle(finalName);
    onCreateScreen({
      name: finalName,
      title: finalTitle,
      template: selectedTemplate,
      isInitial: makeLauncher,
    });
    setMode("list");
  };

  const filteredScreens = useMemo(() => {
    if (!searchQuery.trim()) return screens;
    const q = searchQuery.toLowerCase();
    return screens.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.title && s.title.toLowerCase().includes(q))
    );
  }, [screens, searchQuery]);

  // Count total components in a screen
  const countComponents = (screen: AndroidScreen): number => {
    let count = 0;
    const walk = (comp: any) => {
      count++;
      if (comp.children && Array.isArray(comp.children)) {
        comp.children.forEach(walk);
      }
    };
    if (screen.rootComponent) walk(screen.rootComponent);
    return count;
  };

  if (!isOpen) return null;

  const copiedScreen = getCopiedScreenFromClipboard();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-200">
              <Layers className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Screen Manager</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                  {screens.length} {screens.length === 1 ? "Screen" : "Screens"}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Create, rename, duplicate, copy, paste, and configure Android activities and Jetpack Compose screens.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mode === "list" ? (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>New Screen</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode("list")}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                Back to Screens List
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Clipboard Banner Notification */}
        {clipboardNotice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 text-xs font-medium text-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{clipboardNotice}</span>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {mode === "create" ? (
            /* ============================================================ */
            /* CREATE NEW SCREEN FORM */
            /* ============================================================ */
            <form onSubmit={handleCreateSubmit} className="max-w-2xl mx-auto space-y-6">
              <div className="bg-violet-50/50 border border-violet-100 rounded-2xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600">
                  <p className="font-semibold text-slate-900 mb-0.5">
                    Create New Jetpack Compose Screen
                  </p>
                  <p>
                    Set a custom name and choose a starting template. A corresponding Composable function
                    and navigation route will automatically be generated in your project.
                  </p>
                </div>
              </div>

              {/* Screen Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Screen Name (Composable Identifier)
                  </label>
                  <input
                    type="text"
                    required
                    value={newRawName}
                    onChange={(e) => {
                      setNewRawName(e.target.value);
                      if (!newTitle || newTitle === formatScreenTitle(formatComposableName(newRawName))) {
                        setNewTitle(formatScreenTitle(formatComposableName(e.target.value)));
                      }
                    }}
                    placeholder="e.g. ProfileScreen, CheckoutScreen"
                    className="w-full text-xs font-mono font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Generated as:{" "}
                    <code className="text-violet-700 font-bold">
                      @{formatComposableName(newRawName)}
                    </code>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Display Title (App Bar & Navigation)
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. User Profile, Checkout & Payment"
                    className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Label shown in the Android TopAppBar and screen selector.
                  </p>
                </div>
              </div>

              {/* Template Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Choose Starting Layout Template
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {SCREEN_TEMPLATES.map((tmpl) => {
                    const isSelected = selectedTemplate === tmpl.id;
                    return (
                      <div
                        key={tmpl.id}
                        onClick={() => setSelectedTemplate(tmpl.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition text-left relative ${
                          isSelected
                            ? "bg-violet-50/70 border-violet-500 ring-2 ring-violet-500/20 shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-slate-900">{tmpl.name}</span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {tmpl.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {tmpl.description}
                        </p>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Launcher Checkbox */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="launcher-checkbox"
                  checked={makeLauncher}
                  onChange={(e) => setMakeLauncher(e.target.checked)}
                  className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 cursor-pointer"
                />
                <label htmlFor="launcher-checkbox" className="text-xs text-slate-700 cursor-pointer">
                  <span className="font-bold text-slate-900 block">
                    Set as Launcher Activity (App Entry Screen)
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    This screen will open first when users launch the APK on Android.
                  </span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMode("list")}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-xs transition"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Create Screen</span>
                </button>
              </div>
            </form>
          ) : (
            /* ============================================================ */
            /* ALL SCREENS LIST VIEW */
            /* ============================================================ */
            <div className="space-y-4">
              {/* Search & Actions Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search screens by name or title..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {/* Paste Screen Button if clipboard has content */}
                  {copiedScreen && (
                    <button
                      type="button"
                      onClick={handlePaste}
                      title={`Paste "${copiedScreen.name}" as a brand new screen`}
                      className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs transition"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5" />
                      <span>Paste Copied Screen ({copiedScreen.name})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Create Screen</span>
                  </button>
                </div>
              </div>

              {/* Screens Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredScreens.map((sc, index) => {
                  const isActive = sc.id === currentScreenId;
                  const isEditing = editingScreenId === sc.id;
                  const compCount = countComponents(sc);
                  const logicCount = sc.logicBlocks ? sc.logicBlocks.length : 0;
                  const isCopied = copiedScreenId === sc.id;

                  return (
                    <div
                      key={sc.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isActive
                          ? "bg-violet-50/40 border-violet-300 ring-1 ring-violet-400/30 shadow-xs"
                          : "bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-sm"
                      }`}
                    >
                      {/* Top Row: Screen Badge, Composable, and Quick Actions */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center border border-slate-200">
                            {index + 1}
                          </span>

                          {sc.isInitial ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <span>Launcher Activity</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onSetLauncherScreen(sc.id)}
                              title="Set as Launcher (Initial Screen on App Startup)"
                              className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-800 border border-slate-200 hover:border-amber-200 transition"
                            >
                              <Star className="w-2.5 h-2.5 text-slate-400" />
                              <span>Set as Launcher</span>
                            </button>
                          )}

                          {isActive && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-600 text-white">
                              Active in Builder
                            </span>
                          )}
                        </div>

                        {/* Top-Right Card Actions */}
                        <div className="flex items-center gap-1">
                          {/* Copy Screen */}
                          <button
                            type="button"
                            onClick={() => handleCopy(sc)}
                            title="Copy Screen to Clipboard"
                            className={`p-1.5 rounded-lg border transition ${
                              isCopied
                                ? "bg-emerald-500 text-white border-emerald-500"
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-slate-200"
                            }`}
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Duplicate Screen */}
                          <button
                            type="button"
                            onClick={() => onDuplicateScreen(sc.id)}
                            title="Duplicate Screen (Creates clone with fresh IDs)"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          {/* Rename Screen */}
                          <button
                            type="button"
                            onClick={() =>
                              isEditing ? setEditingScreenId(null) : handleStartRename(sc)
                            }
                            title="Rename Screen"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Screen */}
                          <button
                            type="button"
                            disabled={screens.length <= 1}
                            onClick={() => setScreenToDelete(sc)}
                            title={
                              screens.length <= 1
                                ? "Cannot delete the only screen in your app"
                                : "Delete Screen"
                            }
                            className={`p-1.5 rounded-lg border transition ${
                              screens.length <= 1
                                ? "text-slate-300 border-slate-100 cursor-not-allowed"
                                : "text-rose-500 hover:text-rose-700 hover:bg-rose-50 border-slate-200"
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Screen Title & Composable Name */}
                      {isEditing ? (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5 my-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                              Composable Name
                            </label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full text-xs font-mono font-medium px-2 py-1 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
                              placeholder="e.g. HomeScreen"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                              Display Title
                            </label>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full text-xs font-medium px-2 py-1 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
                              placeholder="e.g. Dashboard & Feed"
                            />
                          </div>
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingScreenId(null)}
                              className="text-xs text-slate-600 hover:text-slate-800 px-2 py-1 rounded"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveRename(sc.id)}
                              className="text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 px-3 py-1 rounded-lg shadow-xs"
                            >
                              Save Rename
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="my-2">
                          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{sc.title || formatScreenTitle(sc.name)}</span>
                          </h3>
                          <p className="text-xs font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                            <FileCode2 className="w-3 h-3 text-slate-400" />
                            <span>@{sc.name}</span>
                          </p>
                        </div>
                      )}

                      {/* Footer Info: Counts and Open Button */}
                      <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-xs text-slate-500">
                        <div className="flex items-center gap-3 text-[11px]">
                          <span>
                            <strong>{compCount}</strong> UI components
                          </span>
                          <span>•</span>
                          <span>
                            <strong>{logicCount}</strong> logic blocks
                          </span>
                        </div>

                        {!isActive ? (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectScreen(sc.id);
                              onClose();
                            }}
                            className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800 hover:underline"
                          >
                            <span>Open in Canvas</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Currently Editing</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredScreens.length === 0 && (
                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No screens match your search</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try searching for another name or create a new screen.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="mt-3 inline-flex items-center gap-1.5 bg-violet-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Create Screen</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Jetpack Compose UI Tree Synchronized</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-800 font-semibold rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {screenToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Delete Screen</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete{" "}
                <strong className="text-slate-800">
                  {screenToDelete.title || screenToDelete.name}
                </strong>{" "}
                (<code>@{screenToDelete.name}</code>)?
              </p>
              <p className="text-[11px] text-rose-600 font-medium mt-1">
                All components and logic blocks in this screen will be permanently removed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setScreenToDelete(null)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteScreen(screenToDelete.id);
                  setScreenToDelete(null);
                }}
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Screen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
