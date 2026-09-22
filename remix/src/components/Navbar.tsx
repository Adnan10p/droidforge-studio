import React from "react";
import {
  Sparkles,
  Download,
  Play,
  Undo2,
  Redo2,
  Plus,
  Layers,
  Cpu,
  FolderArchive,
  BookOpen,
  Code2,
  Workflow,
  Settings,
  GitBranch,
  Sliders,
  ArrowLeft,
  ArrowRight,
  FolderKanban,
  Hammer,
  Copy,
  ClipboardPaste,
  Edit2,
  Radio,
  Smartphone,
  RotateCw,
  Power,
  ChevronDown,
  Wifi,
  Usb,
} from "lucide-react";
import { ActiveTab, DeviceType, Orientation, AndroidScreen, BuilderIdeSettings } from "../types";

interface NavbarProps {
  appName: string;
  appIcon?: string;
  packageName?: string;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  screens: AndroidScreen[];
  currentScreenId: string;
  setCurrentScreenId: (id: string) => void;
  onAddScreen: () => void;
  onOpenScreenManager?: () => void;
  onDuplicateCurrentScreen?: () => void;
  onRenameCurrentScreen?: () => void;
  onPasteScreen?: () => void;
  hasCopiedScreen?: boolean;
  deviceType: DeviceType;
  setDeviceType: (dev: DeviceType) => void;
  orientation: Orientation;
  toggleOrientation: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenAiBuilder: () => void;
  onOpenBuildModal: () => void;
  onOpenAppProperties: () => void;
  onOpenBuilderSettings?: () => void;
  onExportZip: () => void;
  isExporting: boolean;
  onCreateNewApp?: () => void;
  onBrowseTemplates?: () => void;
  builderSettings?: BuilderIdeSettings;
  language?: "kotlin" | "java";
  onToggleLanguage?: (lang: "kotlin" | "java") => void;
  onOpenCompanionModal?: () => void;
  onRefreshCompanionScreen?: () => void;
  onResetCompanionConnection?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  appName,
  appIcon,
  packageName,
  activeTab,
  setActiveTab,
  screens,
  currentScreenId,
  setCurrentScreenId,
  onAddScreen,
  onOpenScreenManager,
  onDuplicateCurrentScreen,
  onRenameCurrentScreen,
  onPasteScreen,
  hasCopiedScreen,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenAiBuilder,
  onOpenBuildModal,
  onOpenAppProperties,
  onOpenBuilderSettings,
  onExportZip,
  isExporting,
  onCreateNewApp,
  onBrowseTemplates,
  builderSettings,
  language = "kotlin",
  onToggleLanguage,
  onOpenCompanionModal,
  onRefreshCompanionScreen,
  onResetCompanionConnection,
}) => {
  const [showCompanionDropdown, setShowCompanionDropdown] = React.useState(false);
  const isDashboard = activeTab === "dashboard";
  const isCustom = builderSettings?.theme === "custom";
  const isLight = builderSettings?.theme === "light";
  const isMidnight = builderSettings?.theme === "midnight";
  const isNordic = builderSettings?.theme === "nordic";
  const isHighContrast = builderSettings?.theme === "high-contrast";

  const headerBgClass = isCustom
    ? "border-b"
    : isLight
    ? "bg-white border-b border-slate-200/90 text-slate-800"
    : isMidnight
    ? "bg-[#121215] border-b border-[#27272A] text-zinc-100"
    : isNordic
    ? "bg-[#141B26] border-b border-[#2B374E] text-slate-200"
    : isHighContrast
    ? "bg-[#0a0a0a] border-b-2 border-white/50 text-white"
    : "bg-white border-b border-slate-200/80 text-slate-800";

  // ==========================================
  // 1. DASHBOARD MODE (Project Portfolio Hub)
  // ==========================================
  if (isDashboard) {
    return (
      <header
        id="droidforge-dashboard-header"
        style={{
          backgroundColor: "var(--ide-card-bg)",
          borderColor: "var(--ide-border)",
          color: "var(--ide-text)",
        }}
        className={`select-none z-30 sticky top-0 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 shadow-xs ${headerBgClass}`}
      >
        {/* Left: Studio Branding & Workspace indicator */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 flex items-center justify-center shadow-xs text-white font-black text-sm tracking-wider">
            DF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-base">
                DroidForge Studio
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold flex items-center gap-1">
                <FolderKanban className="w-3 h-3 text-blue-600" />
                <span>Projects Hub</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Manage your Android apps, configure workspace & export backups
            </p>
          </div>
        </div>

        {/* Center: Selected Project Quick Resume Button */}
        {appName && (
          <div className="hidden lg:flex items-center gap-2.5 bg-slate-50 border border-slate-200/90 rounded-full pl-3 pr-1.5 py-1 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active Project:</span>
            </span>

            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
              {appIcon ? (
                <img
                  src={appIcon}
                  alt=""
                  className="w-5 h-5 rounded-md object-cover border border-slate-200/80"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-5 h-5 rounded-md bg-violet-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {appName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="truncate max-w-[150px]">{appName}</span>
            </div>

            <button
              type="button"
              id="dashboard-resume-builder-btn"
              onClick={() => setActiveTab("canvas")}
              title={`Open ${appName} in the Visual Builder`}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-xs transition"
            >
              <Hammer className="w-3 h-3" />
              <span>Open in Builder</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Right: Workspace & Portfolio Actions */}
        <div className="flex items-center gap-2">
          {/* Builder Settings (IDE Preferences) */}
          <button
            id="navbar-builder-settings-btn"
            onClick={onOpenBuilderSettings}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200/80 transition active:scale-95 shadow-2xs"
            title="Builder Settings (Appearance, Personalization, IDE Themes, Canvas Snapping, Code Studio)"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-600 stroke-[2.2]" />
            <span className="hidden sm:inline">Builder Settings</span>
          </button>

          {/* Browse Starter Templates */}
          {onBrowseTemplates && (
            <button
              type="button"
              id="navbar-browse-templates-btn"
              onClick={onBrowseTemplates}
              className="hidden md:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200/80 transition active:scale-95 shadow-2xs"
              title="Explore Android App Templates"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-600" />
              <span>Templates</span>
            </button>
          )}

          {/* New App Primary CTA */}
          {onCreateNewApp && (
            <button
              type="button"
              id="navbar-create-app-btn"
              onClick={onCreateNewApp}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>New App</span>
            </button>
          )}
        </div>
      </header>
    );
  }

  // ==========================================
  // 2. BUILDER MODE (Editing Selected Project)
  // ==========================================
  return (
    <header
      id="droidforge-builder-header"
      style={{
        backgroundColor: "var(--ide-card-bg)",
        borderColor: "var(--ide-border)",
        color: "var(--ide-text)",
      }}
      className={`select-none z-30 sticky top-0 px-3 sm:px-4 py-2 flex items-center justify-between gap-2.5 shadow-xs ${headerBgClass}`}
    >
      {/* Left: Exit to Dashboard & Selected App Identity */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Back to Projects Dashboard Button - Clear Architectural Separation! */}
        <button
          type="button"
          id="navbar-back-to-dashboard-btn"
          onClick={() => setActiveTab("dashboard")}
          title="Exit Builder and return to Projects Dashboard"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold border border-slate-200/70 transition active:scale-95 group shrink-0 shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-900 group-hover:-translate-x-0.5 transition" />
          <span>Projects</span>
        </button>

        <div className="h-5 w-px bg-slate-200 hidden sm:block shrink-0" />

        {/* Selected Project Info Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenAppProperties}
            title="App Properties & Publishing Setup (Icon, Package, AdMob, APIs)"
            className="w-7 h-7 rounded-lg overflow-hidden bg-violet-600 hover:ring-2 hover:ring-violet-400 flex items-center justify-center shadow-2xs font-bold text-white tracking-wider text-xs transition shrink-0"
          >
            {appIcon ? (
              <img
                src={appIcon}
                alt="App Icon"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              appName.slice(0, 2).toUpperCase()
            )}
          </button>

          <div>
            <button
              id="navbar-open-app-properties-btn"
              onClick={onOpenAppProperties}
              title="Click to configure App Name, Package, Versioning, AdMob, and SDK keys"
              className="group flex items-center gap-1 text-xs text-slate-800 hover:text-violet-700 font-bold transition cursor-pointer leading-tight"
            >
              <span className="truncate max-w-[100px] sm:max-w-[140px]">{appName}</span>
              <Settings className="w-3 h-3 text-slate-400 group-hover:text-violet-600 group-hover:rotate-45 transition duration-200" />
            </button>
            {packageName && (
              <span className="text-[10px] font-mono text-slate-400 truncate max-w-[130px] hidden xl:block leading-none">
                {packageName}
              </span>
            )}
          </div>
        </div>

        {/* Screen Switcher & Quick Manager */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-50 rounded-full pl-2 pr-1 py-0.5 border border-slate-200/80 shadow-2xs">
          {/* Screen Manager Launcher Button */}
          <button
            type="button"
            id="navbar-open-screen-manager-btn"
            onClick={onOpenScreenManager}
            title={`Manage all ${screens.length} Screens (Rename, Duplicate, Delete, Copy, Paste, Launcher)`}
            className="flex items-center gap-1 text-[11px] font-bold text-violet-700 hover:text-violet-900 px-1.5 py-0.5 rounded-full hover:bg-violet-100/60 transition"
          >
            <Layers className="w-3.5 h-3.5 stroke-[2.2]" />
            <span className="hidden xl:inline">Screens</span>
            <span className="text-[10px] px-1 py-0.2 bg-violet-200/80 text-violet-800 rounded-full font-bold">
              {screens.length}
            </span>
          </button>

          <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5" />

          {/* Quick Select Screen */}
          <select
            id="screen-select-dropdown"
            value={currentScreenId}
            onChange={(e) => setCurrentScreenId(e.target.value)}
            className="bg-transparent text-xs text-slate-800 rounded px-1 py-0.5 focus:outline-none font-semibold cursor-pointer max-w-[130px] truncate"
          >
            {screens.map((scr) => (
              <option key={scr.id} value={scr.id}>
                {scr.name} {scr.isInitial ? "★" : ""}
              </option>
            ))}
          </select>

          {/* Quick Rename Current Screen */}
          {onRenameCurrentScreen && (
            <button
              type="button"
              id="navbar-rename-screen-btn"
              onClick={onRenameCurrentScreen}
              title="Rename Current Screen"
              className="w-5 h-5 rounded-full hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
            >
              <Edit2 className="w-2.5 h-2.5" />
            </button>
          )}

          {/* Quick Duplicate Current Screen */}
          {onDuplicateCurrentScreen && (
            <button
              type="button"
              id="navbar-duplicate-screen-btn"
              onClick={onDuplicateCurrentScreen}
              title="Duplicate Current Screen"
              className="w-5 h-5 rounded-full hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
            >
              <Copy className="w-2.5 h-2.5" />
            </button>
          )}

          {/* Quick Paste Screen (if copied) */}
          {hasCopiedScreen && onPasteScreen && (
            <button
              type="button"
              id="navbar-paste-screen-btn"
              onClick={onPasteScreen}
              title="Paste Copied Screen as New Screen"
              className="w-5 h-5 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center transition shadow-2xs animate-pulse"
            >
              <ClipboardPaste className="w-2.5 h-2.5" />
            </button>
          )}

          {/* Create New Screen Button */}
          <button
            id="add-new-screen-btn"
            onClick={onAddScreen}
            title="Create New Android Screen (Custom Name & Template)"
            className="w-5 h-5 rounded-full bg-violet-600 hover:bg-violet-700 active:scale-95 text-white flex items-center justify-center transition shadow-2xs"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Center: Builder Studio Tabs (Canvas, Logic Blocks, Code Studio, and App Properties Hub) */}
      <nav
        style={{
          backgroundColor: "var(--ide-tab-bar-bg)",
          borderColor: "var(--ide-border)",
        }}
        className="flex items-center gap-1 p-1 rounded-full border overflow-x-auto max-w-full shadow-2xs"
      >
        <button
          id="tab-btn-canvas"
          onClick={() => setActiveTab("canvas")}
          style={{
            backgroundColor: activeTab === "canvas" ? "var(--ide-tab-active-bg)" : "transparent",
            color: activeTab === "canvas" ? "var(--ide-tab-active-text)" : "var(--ide-tab-inactive-text)",
            borderColor: activeTab === "canvas" ? "var(--ide-tab-indicator)" : "transparent",
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap border ${
            activeTab === "canvas"
              ? "shadow-xs font-bold"
              : "hover:opacity-80"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Canvas</span>
        </button>

        <button
          id="tab-btn-logic"
          onClick={() => setActiveTab("logic")}
          style={{
            backgroundColor: activeTab === "logic" ? "var(--ide-tab-active-bg)" : "transparent",
            color: activeTab === "logic" ? "var(--ide-tab-active-text)" : "var(--ide-tab-inactive-text)",
            borderColor: activeTab === "logic" ? "var(--ide-tab-indicator)" : "transparent",
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap border ${
            activeTab === "logic"
              ? "shadow-xs font-bold"
              : "hover:opacity-80"
          }`}
        >
          <Workflow className="w-3.5 h-3.5" />
          <span>Logic Blocks</span>
        </button>

        <button
          id="tab-btn-code"
          onClick={() => setActiveTab("code")}
          style={{
            backgroundColor: activeTab === "code" ? "var(--ide-tab-active-bg)" : "transparent",
            color: activeTab === "code" ? "var(--ide-tab-active-text)" : "var(--ide-tab-inactive-text)",
            borderColor: activeTab === "code" ? "var(--ide-tab-indicator)" : "transparent",
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap border ${
            activeTab === "code"
              ? "shadow-xs font-bold"
              : "hover:opacity-80"
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Code Studio</span>
        </button>

        <button
          id="tab-btn-properties"
          onClick={() => setActiveTab("properties")}
          style={{
            backgroundColor:
              activeTab === "properties" ||
              activeTab === "sdk" ||
              activeTab === "assets" ||
              activeTab === "versions" ||
              activeTab === "docs"
                ? "var(--ide-tab-active-bg)"
                : "transparent",
            color:
              activeTab === "properties" ||
              activeTab === "sdk" ||
              activeTab === "assets" ||
              activeTab === "versions" ||
              activeTab === "docs"
                ? "var(--ide-tab-active-text)"
                : "var(--ide-tab-inactive-text)",
            borderColor:
              activeTab === "properties" ||
              activeTab === "sdk" ||
              activeTab === "assets" ||
              activeTab === "versions" ||
              activeTab === "docs"
                ? "var(--ide-tab-indicator)"
                : "transparent",
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap border ${
            activeTab === "properties" ||
            activeTab === "sdk" ||
            activeTab === "assets" ||
            activeTab === "versions" ||
            activeTab === "docs"
              ? "shadow-xs font-bold"
              : "hover:opacity-80"
          }`}
          title="App Properties: General, SDK & NDK, Assets, Theme, Version Control, Manifest & Docs"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>App Properties</span>
        </button>
      </nav>

      {/* Right: Builder Actions (Undo, Redo, AI, Settings, Build APK, Export ZIP) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 bg-slate-100/80 rounded-full p-0.5 border border-slate-200/60">
          <button
            id="undo-action-btn"
            disabled={!canUndo}
            onClick={onUndo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-xs disabled:opacity-30 disabled:hover:bg-transparent rounded-full transition"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            id="redo-action-btn"
            disabled={!canRedo}
            onClick={onRedo}
            title="Redo (Ctrl+Y)"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-xs disabled:opacity-30 disabled:hover:bg-transparent rounded-full transition"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Builder Language Mode Switcher (Kotlin Compose vs Java XML) */}
        {onToggleLanguage && (
          <div
            id="navbar-language-selector"
            className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-full p-0.5 border border-slate-200/80 dark:border-slate-700 select-none shadow-2xs"
          >
            <button
              type="button"
              id="navbar-toggle-kotlin"
              onClick={() => onToggleLanguage("kotlin")}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                language === "kotlin"
                  ? "bg-violet-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Kotlin Architecture (Jetpack Compose & Modern Android)"
            >
              <span>Kotlin</span>
            </button>
            <button
              type="button"
              id="navbar-toggle-java"
              onClick={() => onToggleLanguage("java")}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                language === "java"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Java Architecture (Android XML & Java Views)"
            >
              <span>Java</span>
            </button>
          </div>
        )}

        {/* Companion Live Testing Button & Quick Actions Dropdown */}
        {onOpenCompanionModal && (
          <div className="relative">
            <div className="flex items-center bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-full shadow-2xs transition overflow-hidden">
              <button
                type="button"
                id="navbar-companion-btn"
                onClick={onOpenCompanionModal}
                className="flex items-center gap-1.5 text-indigo-700 text-xs font-semibold pl-3 pr-2 py-1.5 active:scale-95"
                title="Open Companion Studio (Live Wi-Fi & USB Android Testing)"
              >
                <Radio className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                <span className="hidden sm:inline">Companion</span>
              </button>
              <button
                type="button"
                id="navbar-companion-dropdown-toggle"
                onClick={() => setShowCompanionDropdown(!showCompanionDropdown)}
                className="px-1.5 py-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-200/60 border-l border-indigo-200 transition"
                title="Companion Quick Actions (Connect Wi-Fi, USB, Reset, Refresh)"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {showCompanionDropdown && (
              <div
                id="navbar-companion-quick-menu"
                className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                  <span>Live Test Companion</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                <div className="space-y-1 mt-1.5">
                  <button
                    type="button"
                    id="navbar-companion-connect-wifi"
                    onClick={() => {
                      onOpenCompanionModal();
                      setShowCompanionDropdown(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-white hover:bg-slate-800 flex items-center gap-2.5 transition"
                  >
                    <Wifi className="w-3.5 h-3.5 text-indigo-400" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold">Connect to companion</div>
                      <div className="text-[10px] text-slate-400">Wi-Fi & QR code pairing</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    id="navbar-companion-connect-usb"
                    onClick={() => {
                      onOpenCompanionModal();
                      setShowCompanionDropdown(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-white hover:bg-slate-800 flex items-center gap-2.5 transition"
                  >
                    <Usb className="w-3.5 h-3.5 text-cyan-400" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold">Connect via USB</div>
                      <div className="text-[10px] text-slate-400">ADB port reverse tunnel</div>
                    </div>
                  </button>

                  {onRefreshCompanionScreen && (
                    <button
                      type="button"
                      id="navbar-companion-refresh-screen"
                      onClick={() => {
                        onRefreshCompanionScreen();
                        setShowCompanionDropdown(false);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-emerald-300 hover:bg-emerald-950/40 flex items-center gap-2.5 transition"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">Refresh Companion Screen</div>
                        <div className="text-[10px] text-emerald-400/70">Push current screen hot-reload</div>
                      </div>
                    </button>
                  )}

                  {onResetCompanionConnection && (
                    <button
                      type="button"
                      id="navbar-companion-reset-conn"
                      onClick={() => {
                        onResetCompanionConnection();
                        setShowCompanionDropdown(false);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-950/40 flex items-center gap-2.5 transition border-t border-slate-800/80 mt-1"
                    >
                      <Power className="w-3.5 h-3.5 text-rose-400" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">Reset connection</div>
                        <div className="text-[10px] text-rose-400/70">Disconnect & new pairing code</div>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Builder Button */}
        <button
          id="ai-builder-trigger-btn"
          onClick={onOpenAiBuilder}
          className="flex items-center gap-1.5 bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-2xs hover:shadow-xs transition active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-600" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>

        {/* Build APK / AAB Modal */}
        <button
          id="build-apk-trigger-btn"
          onClick={onOpenBuildModal}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-xs transition active:scale-95"
        >
          <Play className="w-3 h-3 fill-current" />
          <span className="hidden sm:inline">Build APK</span>
          <span className="sm:hidden">Build</span>
        </button>

        {/* Export Project ZIP */}
        <button
          id="export-zip-btn"
          onClick={onExportZip}
          disabled={isExporting}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-xs transition active:scale-95 disabled:opacity-50"
          title="Download Complete Android Studio Project (.zip)"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{isExporting ? "Zipping..." : "Export"}</span>
        </button>
      </div>
    </header>
  );
};
