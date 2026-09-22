import React, { useState } from "react";
import {
  Trash2,
  Copy,
  Smartphone,
  Palette,
  Maximize2,
  Sliders,
  Type,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Compass,
  Play,
  Layers,
  Sparkles,
  Navigation,
  SmartphoneNfc,
  X,
  Menu,
  ArrowLeft,
  Home,
  Search,
} from "lucide-react";
import { AndroidScreen, ScreenProperties, ScreenOrientationType, ScreenAnimationType } from "../../../types";

interface ScreenPropertiesTabProps {
  screen: AndroidScreen;
  onUpdateScreenProperties: (screenId: string, props: Partial<ScreenProperties>) => void;
  onUpdateScreenTitle: (screenId: string, title: string) => void;
  onDeleteScreen?: (screenId: string) => void;
  onDuplicateScreen?: (screenId: string) => void;
}

const PRESET_COLORS = [
  "#FFFFFF",
  "#F8FAFC",
  "#F1F5F9",
  "#E2E8F0",
  "#0F172A",
  "#1E293B",
  "#334155",
  "#4F46E5",
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#06B6D4",
  "#3B82F6",
];

const PRESET_SPLASH_COLORS = [
  "#0F172A",
  "#1E1B4B",
  "#1E293B",
  "#4F46E5",
  "#6366F1",
  "#000000",
  "#FFFFFF",
];

export const ScreenPropertiesTab: React.FC<ScreenPropertiesTabProps> = ({
  screen,
  onUpdateScreenProperties,
  onUpdateScreenTitle,
  onDeleteScreen,
  onDuplicateScreen,
}) => {
  // Accordion sections state
  const [sections, setSections] = useState({
    titleAndBar: true,
    bottomNav: true,
    splashScreen: true,
    layoutAlign: true,
    colors: true,
    systemBars: true,
    orientationAnim: true,
    accessibility: true,
  });

  const [isPlayingSplash, setIsPlayingSplash] = useState(false);

  const toggleSection = (key: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const defaultScreenProps: ScreenProperties = {
    alignHorizontal: "left",
    alignVertical: "top",
    backgroundColor: "#FFFFFF",
    backgroundImage: "",
    sizing: "Responsive",
    title: screen.title || screen.name,
    titleVisible: true,
    appBarStyle: "small",
    appBarSubtitle: "",
    leftNavIcon: "back",
    showAppIcon: false,
    rightActions: ["Search", "More"],
    appBarBgColor: "#4F46E5",
    appBarTextColor: "#FFFFFF",
    elevationShadow: 1,
    showAboutInMenu: true,
    aboutScreenText: "Information shown when user opens About Screen",
    showBottomNav: false,
    splashAppTitle: screen.title || screen.name,
    splashTagline: "Fast, Reliable & Native",
    splashBgColor: "#0F172A",
    splashDuration: 2.2,
    showSplashSpinner: true,
    showStatusBar: true,
    showNavigationBar: true,
    statusBarColor: "#0F172A",
    statusBarLightIcons: false,
    navigationBarColor: "#0F172A",
    navigationBarLightIcons: false,
    navStyle: "gesture",
    edgeToEdge: false,
    primaryColor: "#4F46E5",
    primaryColorDark: "#3730A3",
    screenOrientation: "portrait",
    openScreenAnimation: "default",
    closeScreenAnimation: "default",
    bigDefaultText: false,
    highContrast: false,
    highQualityImages: true,
    showListsAsJson: false,
    scrollable: true,
    keepScreenOn: false,
  };

  const sp: ScreenProperties = {
    ...defaultScreenProps,
    ...(screen.properties || {}),
  };

  const updateProp = <K extends keyof ScreenProperties>(key: K, value: ScreenProperties[K]) => {
    onUpdateScreenProperties(screen.id, { [key]: value });
  };

  const handleAddRightAction = (actionName: string) => {
    const currentActions = sp.rightActions || [];
    if (!currentActions.includes(actionName)) {
      updateProp("rightActions", [...currentActions, actionName]);
    }
  };

  const handleRemoveRightAction = (actionName: string) => {
    const currentActions = sp.rightActions || [];
    updateProp(
      "rightActions",
      currentActions.filter((a) => a !== actionName)
    );
  };

  const triggerSplashSimulation = () => {
    setIsPlayingSplash(true);
    setTimeout(() => setIsPlayingSplash(false), (sp.splashDuration || 2.2) * 1000);
  };

  return (
    <div className="space-y-4 text-xs pb-8" style={{ color: "var(--ide-text)" }}>
      
      {/* ========================================================= */}
      {/* SCREEN IDENTIFICATION BANNER MATCHING SCREENSHOT 1        */}
      {/* ========================================================= */}
      <div
        className="p-3.5 border rounded-2xl shadow-xs"
        style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center font-bold">
              <Smartphone className="w-4 h-4 text-violet-500" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-violet-500 uppercase tracking-wider block">
                SCREEN CONTAINER
              </span>
              <span className="text-xs font-bold" style={{ color: "var(--ide-text)" }}>
                {screen.name}
              </span>
            </div>
          </div>

          {screen.isInitial && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Launcher Screen
            </span>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: APP BAR, TITLE & ICONS MATCHING SCREENSHOT 1   */}
      {/* ========================================================= */}
      <div
        className="border rounded-2xl overflow-hidden shadow-2xs"
        style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)" }}
      >
        <button
          type="button"
          onClick={() => toggleSection("titleAndBar")}
          className="w-full px-4 py-3 flex items-center justify-between font-bold transition cursor-pointer"
          style={{ backgroundColor: "var(--ide-card-inner-bg)", color: "var(--ide-text)" }}
        >
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-violet-500" />
            <span>App Bar, Title & Icons</span>
          </div>
          {sections.titleAndBar ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {sections.titleAndBar && (
          <div className="p-4 space-y-4 border-t" style={{ borderColor: "var(--ide-border)" }}>
            
            {/* Show Top App Bar Checkbox Card */}
            <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-950/40 border-slate-800">
              <div>
                <span className="text-xs font-bold block text-slate-200">Show Top App Bar</span>
                <span className="text-[10px] text-slate-400">
                  Renders Material 3 TopAppBar with title & actions
                </span>
              </div>
              <input
                type="checkbox"
                checked={sp.titleVisible ?? true}
                onChange={(e) => updateProp("titleVisible", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded cursor-pointer accent-violet-600"
              />
            </div>

            {sp.titleVisible !== false && (
              <>
                {/* App Bar Style (Material 3) */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-300">
                    App Bar Style (Material 3)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "small", label: "Small (Standard)" },
                      { id: "center", label: "Center-Aligned" },
                      { id: "medium", label: "Medium (Two-Line)" },
                      { id: "large", label: "Large (Expanded)" },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => updateProp("appBarStyle", st.id as any)}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition cursor-pointer ${
                          (sp.appBarStyle || "small") === st.id
                            ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* App Bar Title */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-300">App Bar Title</label>
                  <input
                    type="text"
                    value={sp.title !== undefined ? sp.title : screen.title || screen.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateProp("title", val);
                      onUpdateScreenTitle(screen.id, val);
                    }}
                    placeholder="Dashboard & Feed"
                    className="w-full text-xs px-3 py-2 border rounded-xl bg-slate-950 border-slate-800 text-slate-200 focus:outline-none focus:border-violet-500 font-medium"
                  />
                </div>

                {/* App Bar Subtitle (Optional) */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-300">
                    App Bar Subtitle (Optional)
                  </label>
                  <input
                    type="text"
                    value={sp.appBarSubtitle || ""}
                    onChange={(e) => updateProp("appBarSubtitle", e.target.value)}
                    placeholder="e.g. Active Workspace or Overview"
                    className="w-full text-xs px-3 py-2 border rounded-xl bg-slate-950 border-slate-800 text-slate-200 focus:outline-none focus:border-violet-500 font-medium"
                  />
                </div>

                {/* Left Navigation Icon */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-300">
                    Left Navigation Icon
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "back", label: "Back ←", icon: ArrowLeft },
                      { id: "menu", label: "Menu ☰", icon: Menu },
                      { id: "close", label: "Close ✕", icon: X },
                      { id: "home", label: "Home", icon: Home },
                      { id: "search", label: "Search", icon: Search },
                      { id: "none", label: "None", icon: X },
                    ].map((nav) => (
                      <button
                        key={nav.id}
                        type="button"
                        onClick={() => updateProp("leftNavIcon", nav.id as any)}
                        className={`py-1.5 px-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1 transition cursor-pointer ${
                          (sp.leftNavIcon || "back") === nav.id
                            ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <span>{nav.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Show App Icon beside Title */}
                <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-950/40 border-slate-800">
                  <div>
                    <span className="text-xs font-bold block text-slate-200">
                      Show App Icon beside Title
                    </span>
                    <span className="text-[10px] text-slate-400">Renders 24x24 app icon branding</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={sp.showAppIcon ?? false}
                    onChange={(e) => updateProp("showAppIcon", e.target.checked)}
                    className="w-4 h-4 text-violet-600 rounded cursor-pointer accent-violet-600"
                  />
                </div>

                {/* Right Action Icons (Buttons) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300">
                      Right Action Icons (Buttons)
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {(sp.rightActions || []).length} active
                    </span>
                  </div>

                  {/* Active Action Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap min-h-[32px]">
                    {(sp.rightActions || ["Search", "More"]).map((act) => (
                      <span
                        key={act}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/30 font-bold text-xs"
                      >
                        <span>{act}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRightAction(act)}
                          className="hover:text-rose-400 text-slate-400 ml-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Quick Add Action buttons */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-semibold block">
                      Quick Add Action:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        "Search",
                        "Alerts",
                        "Favorite",
                        "Share",
                        "Settings",
                        "Refresh",
                        "Filter",
                        "More",
                      ].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleAddRightAction(item)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-semibold transition cursor-pointer"
                        >
                          + {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Colors: Bar Background & Title & Icon Color */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Bar Background
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={sp.appBarBgColor || "#4F46E5"}
                        onChange={(e) => updateProp("appBarBgColor", e.target.value)}
                        className="w-8 h-8 rounded-lg border border-slate-700 p-0.5 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={sp.appBarBgColor || "#4F46E5"}
                        onChange={(e) => updateProp("appBarBgColor", e.target.value)}
                        className="w-full text-xs font-mono px-2.5 py-1.5 border rounded-xl bg-slate-950 border-slate-800 text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Title & Icon Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={sp.appBarTextColor || "#FFFFFF"}
                        onChange={(e) => updateProp("appBarTextColor", e.target.value)}
                        className="w-8 h-8 rounded-lg border border-slate-700 p-0.5 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={sp.appBarTextColor || "#FFFFFF"}
                        onChange={(e) => updateProp("appBarTextColor", e.target.value)}
                        className="w-full text-xs font-mono px-2.5 py-1.5 border rounded-xl bg-slate-950 border-slate-800 text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Elevation Shadow Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300">Elevation Shadow</label>
                    <span className="text-[11px] font-mono text-violet-400 font-bold">
                      {sp.elevationShadow ?? 1} dp
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    value={sp.elevationShadow ?? 1}
                    onChange={(e) => updateProp("elevationShadow", Number(e.target.value))}
                    className="w-full accent-violet-500 cursor-pointer"
                  />
                </div>

                {/* 3-Dots Overflow Menu Checkbox */}
                <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-950/40 border-slate-800">
                  <div>
                    <span className="text-xs font-bold block text-slate-200">
                      3-Dots Overflow Menu
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Includes About Screen dialog & menu options
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={sp.showAboutInMenu ?? true}
                    onChange={(e) => updateProp("showAboutInMenu", e.target.checked)}
                    className="w-4 h-4 text-violet-600 rounded cursor-pointer accent-violet-600"
                  />
                </div>

                {/* About Screen Info Text */}
                {sp.showAboutInMenu && (
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-300">
                      About Screen Info Text
                    </label>
                    <textarea
                      rows={2}
                      value={sp.aboutScreenText || ""}
                      onChange={(e) => updateProp("aboutScreenText", e.target.value)}
                      placeholder="Information shown when user opens About Screen"
                      className="w-full text-xs px-3 py-2 border rounded-xl bg-slate-950 border-slate-800 text-slate-200 focus:outline-none focus:border-violet-500 resize-none font-medium"
                    />
                  </div>
                )}
              </>
            )}

          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SECTION 2: NAV BAR (BOTTOM NAVIGATION) MATCHING SCREENSHOT 2 */}
      {/* ========================================================= */}
      <div
        className="border rounded-2xl overflow-hidden shadow-2xs"
        style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)" }}
      >
        <button
          type="button"
          onClick={() => toggleSection("bottomNav")}
          className="w-full px-4 py-3 flex items-center justify-between font-bold transition cursor-pointer"
          style={{ backgroundColor: "var(--ide-card-inner-bg)", color: "var(--ide-text)" }}
        >
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-violet-500" />
            <span>Nav Bar (Bottom Navigation)</span>
          </div>
          {sections.bottomNav ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {sections.bottomNav && (
          <div className="p-4 space-y-3 border-t" style={{ borderColor: "var(--ide-border)" }}>
            <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-950/40 border-slate-800">
              <div>
                <span className="text-xs font-bold block text-slate-200">
                  Show Bottom Navigation Bar
                </span>
                <span className="text-[10px] text-slate-400">
                  Adds Material 3 NavigationBar with tabs & notification badges
                </span>
              </div>
              <input
                type="checkbox"
                checked={sp.showBottomNav ?? false}
                onChange={(e) => updateProp("showBottomNav", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded cursor-pointer accent-violet-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SECTION 3: SPLASH SCREEN (ANDROID 12+) MATCHING SCREENSHOT 2 */}
      {/* ========================================================= */}
      <div
        className="border rounded-2xl overflow-hidden shadow-2xs"
        style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)" }}
      >
        <button
          type="button"
          onClick={() => toggleSection("splashScreen")}
          className="w-full px-4 py-3 flex items-center justify-between font-bold transition cursor-pointer"
          style={{ backgroundColor: "var(--ide-card-inner-bg)", color: "var(--ide-text)" }}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-500" />
            <span>Splash Screen (Android 12+)</span>
          </div>
          {sections.splashScreen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {sections.splashScreen && (
          <div className="p-4 space-y-4 border-t" style={{ borderColor: "var(--ide-border)" }}>
            
            {/* Live Cold-Start Simulation Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-between shadow-lg">
              <div>
                <div className="text-xs font-bold">Live Cold-Start Simulation</div>
                <div className="text-[10px] text-violet-200 mt-0.5">
                  Play animated splash screen inside phone canvas
                </div>
              </div>

              <button
                type="button"
                onClick={triggerSplashSimulation}
                className="px-4 py-2 rounded-xl bg-white text-violet-950 font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current text-violet-600" />
                <span>{isPlayingSplash ? "Playing..." : "Play Splash"}</span>
              </button>
            </div>

            {/* Splash Screen App Title */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300">
                Splash Screen App Title
              </label>
              <input
                type="text"
                value={sp.splashAppTitle !== undefined ? sp.splashAppTitle : screen.title || screen.name}
                onChange={(e) => updateProp("splashAppTitle", e.target.value)}
                placeholder="Dashboard & Feed"
                className="w-full text-xs px-3 py-2 border rounded-xl bg-slate-950 border-slate-800 text-slate-200 focus:outline-none focus:border-violet-500 font-medium"
              />
            </div>

            {/* Splash Tagline / Slogan */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300">
                Splash Tagline / Slogan
              </label>
              <input
                type="text"
                value={sp.splashTagline || ""}
                onChange={(e) => updateProp("splashTagline", e.target.value)}
                placeholder="Fast, Reliable & Native"
                className="w-full text-xs px-3 py-2 border rounded-xl bg-slate-950 border-slate-800 text-slate-200 focus:outline-none focus:border-violet-500 font-medium"
              />
            </div>

            {/* Splash Window Background Color & Swatches */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-300">
                Splash Window Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={sp.splashBgColor || "#0F172A"}
                  onChange={(e) => updateProp("splashBgColor", e.target.value)}
                  className="w-8 h-8 rounded-lg border border-slate-700 p-0.5 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={sp.splashBgColor || "#0F172A"}
                  onChange={(e) => updateProp("splashBgColor", e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 border rounded-xl bg-slate-950 border-slate-800 text-slate-200 focus:outline-none"
                />
              </div>

              {/* Swatches */}
              <div className="flex items-center gap-2 pt-1">
                {PRESET_SPLASH_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => updateProp("splashBgColor", c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-lg border cursor-pointer transition ${
                      sp.splashBgColor === c ? "ring-2 ring-violet-500 border-white" : "border-slate-700"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Display Duration Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-300">Display Duration</label>
                <span className="text-[11px] font-mono text-violet-400 font-bold">
                  {sp.splashDuration || 2.2}s
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={sp.splashDuration || 2.2}
                onChange={(e) => updateProp("splashDuration", Number(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer"
              />
            </div>

            {/* Show Startup Loading Spinner */}
            <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-950/40 border-slate-800">
              <div>
                <span className="text-xs font-bold block text-slate-200">
                  Show Startup Loading Spinner
                </span>
                <span className="text-[10px] text-slate-400">
                  Displays subtle Material circular loader below branding
                </span>
              </div>
              <input
                type="checkbox"
                checked={sp.showSplashSpinner ?? true}
                onChange={(e) => updateProp("showSplashSpinner", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded cursor-pointer accent-violet-600"
              />
            </div>

          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SECTION 4: LAYOUT, ALIGNMENT & SIZING MATCHING SCREENSHOT 3 */}
      {/* ========================================================= */}
      <div
        className="border rounded-2xl overflow-hidden shadow-2xs"
        style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)" }}
      >
        <button
          type="button"
          onClick={() => toggleSection("layoutAlign")}
          className="w-full px-4 py-3 flex items-center justify-between font-bold transition cursor-pointer"
          style={{ backgroundColor: "var(--ide-card-inner-bg)", color: "var(--ide-text)" }}
        >
          <div className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-violet-500" />
            <span>Layout, Alignment & Sizing</span>
          </div>
          {sections.layoutAlign ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {sections.layoutAlign && (
          <div className="p-4 space-y-3.5 border-t" style={{ borderColor: "var(--ide-border)" }}>
            {/* Align Horizontal */}
            <div>
              <label className="block text-[11px] font-bold mb-1 text-slate-300">
                Align Horizontal
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["left", "center", "right"] as const).map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => updateProp("alignHorizontal", align)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border capitalize transition cursor-pointer ${
                      (sp.alignHorizontal || "left") === align
                        ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

            {/* Align Vertical */}
            <div>
              <label className="block text-[11px] font-bold mb-1 text-slate-300">
                Align Vertical
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["top", "center", "bottom"] as const).map((valign) => (
                  <button
                    key={valign}
                    type="button"
                    onClick={() => updateProp("alignVertical", valign)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border capitalize transition cursor-pointer ${
                      (sp.alignVertical || "top") === valign
                        ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {valign}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizing */}
            <div>
              <label className="block text-[11px] font-bold mb-1 text-slate-300">Sizing</label>
              <div className="grid grid-cols-2 gap-2">
                {(["Fixed", "Responsive"] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => updateProp("sizing", sz)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      (sp.sizing || "Responsive") === sz
                        ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Container */}
            <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-950/40 border-slate-800">
              <div>
                <span className="text-xs font-bold block text-slate-200">Scrollable</span>
                <span className="text-[10px] text-slate-400">
                  Allow screen content to scroll vertically
                </span>
              </div>
              <input
                type="checkbox"
                checked={sp.scrollable ?? true}
                onChange={(e) => updateProp("scrollable", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded cursor-pointer accent-violet-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SECTION 5: COLORS & BACKGROUND MATCHING SCREENSHOT 3      */}
      {/* ========================================================= */}
      <div
        className="border rounded-2xl overflow-hidden shadow-2xs"
        style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)" }}
      >
        <button
          type="button"
          onClick={() => toggleSection("colors")}
          className="w-full px-4 py-3 flex items-center justify-between font-bold transition cursor-pointer"
          style={{ backgroundColor: "var(--ide-card-inner-bg)", color: "var(--ide-text)" }}
        >
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-violet-500" />
            <span>Colors & Background</span>
          </div>
          {sections.colors ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {sections.colors && (
          <div className="p-4 space-y-4 border-t" style={{ borderColor: "var(--ide-border)" }}>
            {/* Background Color */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-300">Background Color</label>
                <span className="text-[10px] font-mono text-slate-400">
                  {sp.backgroundColor || "#FFFFFF"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={sp.backgroundColor || "#FFFFFF"}
                  onChange={(e) => updateProp("backgroundColor", e.target.value)}
                  className="w-8 h-8 rounded-lg border border-slate-700 p-0.5 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={sp.backgroundColor || "#FFFFFF"}
                  onChange={(e) => updateProp("backgroundColor", e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 border rounded-xl bg-slate-950 border-slate-800 text-slate-200 focus:outline-none"
                />
              </div>

              {/* Color Presets */}
              <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => updateProp("backgroundColor", c)}
                    style={{ backgroundColor: c }}
                    title={c}
                    className={`w-6 h-6 rounded-lg border transition cursor-pointer ${
                      sp.backgroundColor === c
                        ? "ring-2 ring-violet-500 border-white scale-110"
                        : "border-slate-700 hover:scale-105"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Background Image */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300">
                Background Image (URL or Drawable)
              </label>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={sp.backgroundImage || ""}
                  onChange={(e) => updateProp("backgroundImage", e.target.value)}
                  placeholder="https://... or @drawable/bg"
                  className="w-full text-xs px-3 py-2 border rounded-xl bg-slate-950 border-slate-800 text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            {/* Primary Color & Primary Color Dark */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={sp.primaryColor || "#4F46E5"}
                    onChange={(e) => updateProp("primaryColor", e.target.value)}
                    className="w-8 h-8 rounded-lg border border-slate-700 p-0.5 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={sp.primaryColor || "#4F46E5"}
                    onChange={(e) => updateProp("primaryColor", e.target.value)}
                    className="w-full text-xs font-mono px-2 py-1.5 border rounded-xl bg-slate-950 border-slate-800 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Primary Color Dark</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={sp.primaryColorDark || "#3730A3"}
                    onChange={(e) => updateProp("primaryColorDark", e.target.value)}
                    className="w-8 h-8 rounded-lg border border-slate-700 p-0.5 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={sp.primaryColorDark || "#3730A3"}
                    onChange={(e) => updateProp("primaryColorDark", e.target.value)}
                    className="w-full text-xs font-mono px-2 py-1.5 border rounded-xl bg-slate-950 border-slate-800 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SECTION 6: STATUS BAR & NAVIGATION BAR MATCHING SCREENSHOT 4 */}
      {/* ========================================================= */}
      <div
        className="border rounded-2xl overflow-hidden shadow-2xs"
        style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)" }}
      >
        <button
          type="button"
          onClick={() => toggleSection("systemBars")}
          className="w-full px-4 py-3 flex items-center justify-between font-bold transition cursor-pointer"
          style={{ backgroundColor: "var(--ide-card-inner-bg)", color: "var(--ide-text)" }}
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-violet-500" />
            <span>Status Bar & Navigation Bar</span>
          </div>
          {sections.systemBars ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {sections.systemBars && (
          <div className="p-4 space-y-3.5 border-t" style={{ borderColor: "var(--ide-border)" }}>
            
            {/* Show Status Bar */}
            <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-950/40 border-slate-800">
              <span className="text-xs font-bold text-slate-200">Show Status Bar</span>
              <input
                type="checkbox"
                checked={sp.showStatusBar ?? true}
                onChange={(e) => updateProp("showStatusBar", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded cursor-pointer accent-violet-600"
              />
            </div>

            {/* Status Bar Color */}
            {sp.showStatusBar && (
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-300">Status Bar Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={sp.statusBarColor || "#0F172A"}
                    onChange={(e) => updateProp("statusBarColor", e.target.value)}
                    className="w-8 h-8 rounded-lg border border-slate-700 p-0.5 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={sp.statusBarColor || "#0F172A"}
                    onChange={(e) => updateProp("statusBarColor", e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 border rounded-xl bg-slate-950 border-slate-800 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Status Bar Light Icons */}
            {sp.showStatusBar && (
              <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-950/40 border-slate-800">
                <div>
                  <span className="text-xs font-bold block text-slate-200">Status Bar Light Icons</span>
                  <span className="text-[10px] text-slate-400">Use dark or light icons for battery/clock</span>
                </div>
                <input
                  type="checkbox"
                  checked={sp.statusBarLightIcons ?? false}
                  onChange={(e) => updateProp("statusBarLightIcons", e.target.checked)}
                  className="w-4 h-4 text-violet-600 rounded cursor-pointer accent-violet-600"
                />
              </div>
            )}

            {/* Show Navigation Bar */}
            <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-950/40 border-slate-800">
              <span className="text-xs font-bold text-slate-200">Show Navigation Bar</span>
              <input
                type="checkbox"
                checked={sp.showNavigationBar ?? true}
                onChange={(e) => updateProp("showNavigationBar", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded cursor-pointer accent-violet-600"
              />
            </div>

            {/* Navigation Bar Color */}
            {sp.showNavigationBar && (
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-300">Navigation Bar Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={sp.navigationBarColor || "#0F172A"}
                    onChange={(e) => updateProp("navigationBarColor", e.target.value)}
                    className="w-8 h-8 rounded-lg border border-slate-700 p-0.5 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={sp.navigationBarColor || "#0F172A"}
                    onChange={(e) => updateProp("navigationBarColor", e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 border rounded-xl bg-slate-950 border-slate-800 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Navigation Bar Light Icons */}
            {sp.showNavigationBar && (
              <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-950/40 border-slate-800">
                <span className="text-xs font-bold text-slate-200">Navigation Bar Light Icons</span>
                <input
                  type="checkbox"
                  checked={sp.navigationBarLightIcons ?? false}
                  onChange={(e) => updateProp("navigationBarLightIcons", e.target.checked)}
                  className="w-4 h-4 text-violet-600 rounded cursor-pointer accent-violet-600"
                />
              </div>
            )}

            {/* System Navigation Style */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-300">
                System Navigation Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "gesture", label: "Gesture Bar (Pill)" },
                  { id: "3button", label: "3-Button (Classic)" },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => updateProp("navStyle", st.id as any)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      (sp.navStyle || "gesture") === st.id
                        ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Edge-to-Edge Enforce */}
            <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-950/40 border-slate-800">
              <div>
                <span className="text-xs font-bold block text-slate-200">Edge-to-Edge Enforce</span>
                <span className="text-[10px] text-slate-400">
                  Android 15+ transparent system bars layout
                </span>
              </div>
              <input
                type="checkbox"
                checked={sp.edgeToEdge ?? false}
                onChange={(e) => updateProp("edgeToEdge", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded cursor-pointer accent-violet-600"
              />
            </div>

          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SECTION 7: ORIENTATION & TRANSITION ANIMATIONS            */}
      {/* ========================================================= */}
      <div
        className="border rounded-2xl overflow-hidden shadow-2xs"
        style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)" }}
      >
        <button
          type="button"
          onClick={() => toggleSection("orientationAnim")}
          className="w-full px-4 py-3 flex items-center justify-between font-bold transition cursor-pointer"
          style={{ backgroundColor: "var(--ide-card-inner-bg)", color: "var(--ide-text)" }}
        >
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-violet-500" />
            <span>Orientation & Transition Animations</span>
          </div>
          {sections.orientationAnim ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {sections.orientationAnim && (
          <div className="p-4 space-y-3 border-t" style={{ borderColor: "var(--ide-border)" }}>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Screen Orientation
              </label>
              <select
                value={sp.screenOrientation || "portrait"}
                onChange={(e) => updateProp("screenOrientation", e.target.value as ScreenOrientationType)}
                className="w-full text-xs px-3 py-2 border rounded-xl bg-slate-950 border-slate-800 text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer font-medium"
              >
                <option value="unspecified">Unspecified (System Default)</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
                <option value="sensor">Sensor (Follows device tilt)</option>
                <option value="user">User (Preferred user rotation)</option>
                <option value="sensorPortrait">Sensor Portrait</option>
                <option value="sensorLandscape">Sensor Landscape</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Open Screen Animation
              </label>
              <select
                value={sp.openScreenAnimation || "default"}
                onChange={(e) => updateProp("openScreenAnimation", e.target.value as ScreenAnimationType)}
                className="w-full text-xs px-3 py-2 border rounded-xl bg-slate-950 border-slate-800 text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer font-medium"
              >
                <option value="default">Default Android Transition</option>
                <option value="fade">Fade In</option>
                <option value="zoom">Zoom Scale In</option>
                <option value="slide_horizontal">Slide Horizontal (Right to Left)</option>
                <option value="slide_vertical">Slide Vertical (Bottom to Top)</option>
                <option value="none">None (Instant Cut)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Close Screen Animation
              </label>
              <select
                value={sp.closeScreenAnimation || "default"}
                onChange={(e) => updateProp("closeScreenAnimation", e.target.value as ScreenAnimationType)}
                className="w-full text-xs px-3 py-2 border rounded-xl bg-slate-950 border-slate-800 text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer font-medium"
              >
                <option value="default">Default Android Transition</option>
                <option value="fade">Fade Out</option>
                <option value="zoom">Zoom Scale Out</option>
                <option value="slide_horizontal">Slide Horizontal (Left to Right)</option>
                <option value="slide_vertical">Slide Vertical (Top to Bottom)</option>
                <option value="none">None (Instant Cut)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SECTION 8: ACCESSIBILITY, MEDIA & DATA                     */}
      {/* ========================================================= */}
      <div
        className="border rounded-2xl overflow-hidden shadow-2xs"
        style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)" }}
      >
        <button
          type="button"
          onClick={() => toggleSection("accessibility")}
          className="w-full px-4 py-3 flex items-center justify-between font-bold transition cursor-pointer"
          style={{ backgroundColor: "var(--ide-card-inner-bg)", color: "var(--ide-text)" }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span>Accessibility, Media & Data</span>
          </div>
          {sections.accessibility ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {sections.accessibility && (
          <div className="p-4 space-y-2.5 border-t" style={{ borderColor: "var(--ide-border)" }}>
            <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-950/40 border-slate-800">
              <div>
                <span className="text-xs font-bold block text-slate-200">Big Default Text</span>
                <span className="text-[10px] text-slate-400">Enlarges baseline font scale for accessibility</span>
              </div>
              <input
                type="checkbox"
                checked={sp.bigDefaultText ?? false}
                onChange={(e) => updateProp("bigDefaultText", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded cursor-pointer accent-violet-600"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-950/40 border-slate-800">
              <div>
                <span className="text-xs font-bold block text-slate-200">High Contrast</span>
                <span className="text-[10px] text-slate-400">Boosts foreground contrast against backgrounds</span>
              </div>
              <input
                type="checkbox"
                checked={sp.highContrast ?? false}
                onChange={(e) => updateProp("highContrast", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded cursor-pointer accent-violet-600"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-950/40 border-slate-800">
              <div>
                <span className="text-xs font-bold block text-slate-200">High Quality Images</span>
                <span className="text-[10px] text-slate-400">Hardware-accelerated Coil mipmapping</span>
              </div>
              <input
                type="checkbox"
                checked={sp.highQualityImages ?? true}
                onChange={(e) => updateProp("highQualityImages", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded cursor-pointer accent-violet-600"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-950/40 border-slate-800">
              <div>
                <span className="text-xs font-bold block text-slate-200">Keep Screen On</span>
                <span className="text-[10px] text-slate-400">FLAG_KEEP_SCREEN_ON (prevents display sleep)</span>
              </div>
              <input
                type="checkbox"
                checked={sp.keepScreenOn ?? false}
                onChange={(e) => updateProp("keepScreenOn", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded cursor-pointer accent-violet-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SECTION 9: SCREEN MANAGEMENT                             */}
      {/* ========================================================= */}
      <div className="border border-rose-500/30 rounded-2xl overflow-hidden shadow-2xs bg-slate-900">
        <div className="px-4 py-3 bg-rose-500/10 flex items-center justify-between font-bold text-rose-400 border-b border-rose-500/20">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Screen Management</span>
          </div>
        </div>

        <div className="p-4 space-y-2.5">
          {onDuplicateScreen && (
            <button
              type="button"
              onClick={() => onDuplicateScreen(screen.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border font-bold rounded-xl transition cursor-pointer text-xs bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-800"
            >
              <Copy className="w-4 h-4" />
              <span>Duplicate Screen "{screen.name}"</span>
            </button>
          )}

          {onDeleteScreen && (
            <button
              type="button"
              id="screen-props-delete-btn"
              onClick={() => onDeleteScreen(screen.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition cursor-pointer text-xs shadow-xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Screen "{screen.name}"</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
