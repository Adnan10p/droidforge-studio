import React, { useState } from "react";
import {
  Smartphone,
  Palette,
  Maximize2,
  Sliders,
  Type,
  Eye,
  EyeOff,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  RotateCw,
  Compass,
  Play,
  Layers,
  HelpCircle,
  Shield,
  Sun,
  Moon,
  Check,
  ArrowLeft,
  Menu,
  X,
  Home,
  Search,
  Bell,
  Heart,
  Share2,
  Settings,
  Plus,
  Trash2,
  MoreVertical,
  RefreshCw,
  Filter,
  User,
  ShoppingBag,
  Bookmark,
  PanelTop,
  Navigation,
  CheckSquare,
} from "lucide-react";
import {
  AndroidScreen,
  ScreenProperties,
  ScreenOrientationType,
  ScreenAnimationType,
  AppBarActionItem,
  BottomNavItem,
} from "../../../types";

interface ScreenPropertiesTabProps {
  screen: AndroidScreen;
  onUpdateScreenProperties: (screenId: string, props: Partial<ScreenProperties>) => void;
  onUpdateScreenTitle: (screenId: string, title: string) => void;
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

export const ScreenPropertiesTab: React.FC<ScreenPropertiesTabProps> = ({
  screen,
  onUpdateScreenProperties,
  onUpdateScreenTitle,
}) => {
  // Accordion sections state
  const [sections, setSections] = useState({
    titleAndBar: true,
    bottomNav: true,
    splashScreen: false,
    systemBars: false,
    layoutAlign: false,
    colors: false,
    orientationAnim: false,
    accessibility: false,
  });

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
    showStatusBar: true,
    showNavigationBar: true,
    statusBarColor: "#0F172A",
    statusBarLightIcons: false,
    navigationBarColor: "#0F172A",
    navigationBarLightIcons: false,
    primaryColor: "#4F46E5",
    primaryColorDark: "#3730A3",
    screenOrientation: "portrait",
    openScreenAnimation: "default",
    closeScreenAnimation: "default",
    bigDefaultText: false,
    highContrast: false,
    highQualityImages: true,
    showAboutInMenu: true,
    showListsAsJson: false,
    scrollable: true,
    keepScreenOn: false,

    // App Bar Defaults
    appBarVisible: true,
    appBarVariant: "small",
    appBarTitle: screen.title || screen.name,
    appBarSubtitle: "",
    appBarNavIcon: "back",
    appBarShowAppIcon: false,
    appBarAppIconUrl: "",
    appBarActions: [
      { id: "act-search", title: "Search", icon: "search" },
      { id: "act-more", title: "More", icon: "more-vertical" },
    ],
    appBarBackgroundColor: "#4F46E5",
    appBarTextColor: "#FFFFFF",
    appBarElevation: 1,

    // Bottom Navigation Defaults
    showBottomNavBar: false,
    bottomNavStyle: "material3",
    bottomNavActiveIndex: 0,
    bottomNavBackgroundColor: "#FFFFFF",
    bottomNavActiveColor: "#4F46E5",
    bottomNavInactiveColor: "#64748B",
    bottomNavIndicatorColor: "#EEF2FF",
    bottomNavShowLabels: "always",
    bottomNavItems: [
      { id: "nav-1", label: "Home", icon: "home" },
      { id: "nav-2", label: "Search", icon: "search" },
      { id: "nav-3", label: "Explore", icon: "compass", badge: "NEW" },
      { id: "nav-4", label: "Notifications", icon: "bell", badge: "3" },
      { id: "nav-5", label: "Profile", icon: "user" },
    ],

    // System Navigation
    systemNavMode: "gesture",
    edgeToEdge: false,

    // Splash Screen Defaults
    showSplashScreenPreview: false,
    splashTitle: screen.title || screen.name,
    splashTagline: "Fast, Reliable & Native",
    splashDuration: 2200,
    splashShowProgress: true,
  };

  const sp: ScreenProperties = {
    ...defaultScreenProps,
    ...(screen.properties || {}),
  };

  const updateProp = <K extends keyof ScreenProperties>(key: K, value: ScreenProperties[K]) => {
    onUpdateScreenProperties(screen.id, { [key]: value });
  };

  // Helper to add / remove App Bar action item
  const handleAddAppBarAction = (iconName: string, title: string) => {
    const currentActions = sp.appBarActions ? [...sp.appBarActions] : [];
    const newAction: AppBarActionItem = {
      id: `act-${Date.now()}`,
      title,
      icon: iconName,
      showAsAction: "always",
    };
    updateProp("appBarActions", [...currentActions, newAction]);
  };

  const handleRemoveAppBarAction = (id: string) => {
    const currentActions = sp.appBarActions ? sp.appBarActions.filter((a) => a.id !== id) : [];
    updateProp("appBarActions", currentActions);
  };

  // Helper to add / update / remove Bottom Nav item
  const handleAddBottomNavItem = () => {
    const currentItems = sp.bottomNavItems ? [...sp.bottomNavItems] : [];
    const newItem: BottomNavItem = {
      id: `nav-${Date.now()}`,
      label: `Tab ${currentItems.length + 1}`,
      icon: "bookmark",
    };
    updateProp("bottomNavItems", [...currentItems, newItem]);
  };

  const handleUpdateBottomNavItem = (id: string, updates: Partial<BottomNavItem>) => {
    const currentItems = sp.bottomNavItems ? [...sp.bottomNavItems] : [];
    const updated = currentItems.map((item) => (item.id === id ? { ...item, ...updates } : item));
    updateProp("bottomNavItems", updated);
  };

  const handleRemoveBottomNavItem = (id: string) => {
    const currentItems = sp.bottomNavItems ? sp.bottomNavItems.filter((item) => item.id !== id) : [];
    updateProp("bottomNavItems", currentItems);
  };

  const handleResetDefaultBottomNav = () => {
    updateProp("bottomNavItems", [
      { id: "nav-1", label: "Home", icon: "home" },
      { id: "nav-2", label: "Search", icon: "search" },
      { id: "nav-3", label: "Explore", icon: "compass", badge: "NEW" },
      { id: "nav-4", label: "Notifications", icon: "bell", badge: "3" },
      { id: "nav-5", label: "Profile", icon: "user" },
    ]);
  };

  return (
    <div className="space-y-4 text-xs text-slate-700 pb-8">
      {/* Screen Identification Banner */}
      <div className="p-3 bg-violet-50/70 border border-violet-100 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-violet-600" />
            <div>
              <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider block">
                Screen Container
              </span>
              <span className="text-xs font-bold text-slate-900">{screen.name}</span>
            </div>
          </div>
          {screen.isInitial && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              Launcher Screen
            </span>
          )}
        </div>
      </div>

      {/* 1. App Bar, Title & Icon */}
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection("titleAndBar")}
          className="w-full px-3.5 py-2.5 bg-slate-50/70 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-100/70 transition"
        >
          <div className="flex items-center gap-2">
            <PanelTop className="w-3.5 h-3.5 text-violet-600" />
            <span>App Bar, Title & Icons</span>
          </div>
          {sections.titleAndBar ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {sections.titleAndBar && (
          <div className="p-3.5 space-y-3.5 border-t border-slate-100">
            {/* App Bar Visible Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/70">
              <div>
                <span className="text-[11px] font-bold text-slate-800 block">Show Top App Bar</span>
                <span className="text-[10px] text-slate-400">Renders Material 3 TopAppBar with title & actions</span>
              </div>
              <input
                type="checkbox"
                checked={sp.appBarVisible ?? sp.titleVisible ?? true}
                onChange={(e) => {
                  const val = e.target.checked;
                  updateProp("appBarVisible", val);
                  updateProp("titleVisible", val);
                }}
                className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
              />
            </div>

            {(sp.appBarVisible ?? sp.titleVisible ?? true) && (
              <>
                {/* App Bar Variant */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                    App Bar Style (Material 3)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "small", label: "Small (Standard)" },
                      { id: "center-aligned", label: "Center-Aligned" },
                      { id: "medium", label: "Medium (Two-Line)" },
                      { id: "large", label: "Large (Expanded)" },
                    ].map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => updateProp("appBarVariant", v.id as any)}
                        className={`py-1.5 px-2 text-[11px] font-medium rounded-lg border transition ${
                          (sp.appBarVariant || "small") === v.id
                            ? "bg-violet-600 text-white border-violet-600 shadow-2xs font-semibold"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    App Bar Title
                  </label>
                  <input
                    type="text"
                    value={sp.appBarTitle !== undefined ? sp.appBarTitle : sp.title || screen.title || screen.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      onUpdateScreenProperties(screen.id, { appBarTitle: val, title: val });
                    }}
                    placeholder="Screen Title"
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 focus:bg-white"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    App Bar Subtitle (Optional)
                  </label>
                  <input
                    type="text"
                    value={sp.appBarSubtitle || ""}
                    onChange={(e) => updateProp("appBarSubtitle", e.target.value)}
                    placeholder="e.g. Active Workspace or Overview"
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 focus:bg-white"
                  />
                </div>

                {/* Left Navigation Icon */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                    Left Navigation Icon
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "back", label: "Back Arrow", icon: ArrowLeft },
                      { id: "menu", label: "Menu Drawer", icon: Menu },
                      { id: "close", label: "Close X", icon: X },
                      { id: "home", label: "Home", icon: Home },
                      { id: "search", label: "Search", icon: Search },
                      { id: "none", label: "None", icon: EyeOff },
                    ].map((nav) => {
                      const IconComp = nav.icon;
                      const isSelected = (sp.appBarNavIcon || "back") === nav.id;
                      return (
                        <button
                          key={nav.id}
                          type="button"
                          onClick={() => updateProp("appBarNavIcon", nav.id as any)}
                          className={`flex items-center gap-1.5 py-1.5 px-2 text-[11px] rounded-lg border transition ${
                            isSelected
                              ? "bg-violet-600 text-white border-violet-600 shadow-2xs font-semibold"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <IconComp className="w-3 h-3 shrink-0" />
                          <span className="truncate">{nav.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* App Icon in Title Bar */}
                <div className="space-y-2 p-2.5 bg-slate-50/70 rounded-xl border border-slate-200/70">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-800 block">
                        Show App Icon beside Title
                      </span>
                      <span className="text-[10px] text-slate-400">Renders 24x24 app icon branding</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={sp.appBarShowAppIcon ?? false}
                      onChange={(e) => updateProp("appBarShowAppIcon", e.target.checked)}
                      className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
                    />
                  </div>
                  {sp.appBarShowAppIcon && (
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">
                        Custom Icon Image URL (or leave blank to use App Icon)
                      </label>
                      <input
                        type="url"
                        value={sp.appBarAppIconUrl || ""}
                        onChange={(e) => updateProp("appBarAppIconUrl", e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                    </div>
                  )}
                </div>

                {/* App Bar Action Icons */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Right Action Icons (Buttons)
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {sp.appBarActions?.length || 0} active
                    </span>
                  </div>

                  {/* Active Actions Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(sp.appBarActions || []).map((act) => (
                      <span
                        key={act.id}
                        className="inline-flex items-center gap-1.5 px-2 py-1 bg-violet-50 border border-violet-200 text-violet-700 rounded-lg text-[11px] font-medium"
                      >
                        <span className="capitalize">{act.title || act.icon}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAppBarAction(act.id)}
                          className="hover:text-red-600 transition"
                          title="Remove action"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {(!sp.appBarActions || sp.appBarActions.length === 0) && (
                      <span className="text-[11px] text-slate-400 italic">No action buttons added yet.</span>
                    )}
                  </div>

                  {/* Quick Add Action Presets */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 block">Quick Add Action:</span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { icon: "search", title: "Search" },
                        { icon: "bell", title: "Alerts" },
                        { icon: "heart", title: "Favorite" },
                        { icon: "share-2", title: "Share" },
                        { icon: "settings", title: "Settings" },
                        { icon: "refresh-cw", title: "Refresh" },
                        { icon: "filter", title: "Filter" },
                        { icon: "more-vertical", title: "More" },
                      ].map((item) => (
                        <button
                          key={item.icon}
                          type="button"
                          onClick={() => handleAddAppBarAction(item.icon, item.title)}
                          className="px-2 py-1 bg-slate-100 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-300 border border-slate-200 rounded-md text-[10px] font-medium transition flex items-center gap-1 text-slate-600"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>{item.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* App Bar Colors & Elevation */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      Bar Background
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={sp.appBarBackgroundColor || sp.primaryColor || "#4F46E5"}
                        onChange={(e) => {
                          updateProp("appBarBackgroundColor", e.target.value);
                          updateProp("primaryColor", e.target.value);
                        }}
                        className="w-7 h-7 rounded-lg border border-slate-300 p-0.5 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={sp.appBarBackgroundColor || sp.primaryColor || "#4F46E5"}
                        onChange={(e) => {
                          updateProp("appBarBackgroundColor", e.target.value);
                          updateProp("primaryColor", e.target.value);
                        }}
                        className="w-full text-[11px] font-mono px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      Title & Icon Color
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={sp.appBarTextColor || "#FFFFFF"}
                        onChange={(e) => updateProp("appBarTextColor", e.target.value)}
                        className="w-7 h-7 rounded-lg border border-slate-300 p-0.5 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={sp.appBarTextColor || "#FFFFFF"}
                        onChange={(e) => updateProp("appBarTextColor", e.target.value)}
                        className="w-full text-[11px] font-mono px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Elevation */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-semibold text-slate-600">
                      Elevation Shadow
                    </label>
                    <span className="text-[10px] font-mono text-violet-600 font-bold">
                      {sp.appBarElevation ?? 1} dp
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="1"
                    value={sp.appBarElevation ?? 1}
                    onChange={(e) => updateProp("appBarElevation", Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  />
                </div>

                {/* Show About in Menu */}
                <div className="flex items-center justify-between p-2 bg-slate-50/60 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-[11px] font-medium text-slate-700 block">
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
                    className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
                  />
                </div>

                {sp.showAboutInMenu && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      About Screen Info Text
                    </label>
                    <textarea
                      rows={2}
                      value={sp.aboutScreenText || ""}
                      onChange={(e) => updateProp("aboutScreenText", e.target.value)}
                      placeholder="Information shown when user opens About Screen"
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 focus:bg-white resize-none"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* 2. Nav Bar (Bottom Navigation Bar) */}
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection("bottomNav")}
          className="w-full px-3.5 py-2.5 bg-slate-50/70 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-100/70 transition"
        >
          <div className="flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5 text-violet-600" />
            <span>Nav Bar (Bottom Navigation)</span>
          </div>
          {sections.bottomNav ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {sections.bottomNav && (
          <div className="p-3.5 space-y-3.5 border-t border-slate-100">
            {/* Show Bottom Nav Bar Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/70">
              <div>
                <span className="text-[11px] font-bold text-slate-800 block">
                  Show Bottom Navigation Bar
                </span>
                <span className="text-[10px] text-slate-400">
                  Adds Material 3 NavigationBar with tabs & notification badges
                </span>
              </div>
              <input
                type="checkbox"
                checked={sp.showBottomNavBar ?? false}
                onChange={(e) => updateProp("showBottomNavBar", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
              />
            </div>

            {sp.showBottomNavBar && (
              <>
                {/* Nav Bar Style */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                    Nav Bar Visual Style
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "material3", label: "Material 3" },
                      { id: "classic", label: "Classic" },
                      { id: "pills", label: "Floating Pills" },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => updateProp("bottomNavStyle", st.id as any)}
                        className={`py-1.5 px-2 text-[11px] font-medium rounded-lg border transition ${
                          (sp.bottomNavStyle || "material3") === st.id
                            ? "bg-violet-600 text-white border-violet-600 shadow-2xs font-semibold"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Label Visibility */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Label Display Mode
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "always", label: "Always" },
                      { id: "selected", label: "Selected Only" },
                      { id: "never", label: "Icon Only" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => updateProp("bottomNavShowLabels", mode.id as any)}
                        className={`py-1 px-2 text-[10px] font-medium rounded-lg border transition ${
                          (sp.bottomNavShowLabels || "always") === mode.id
                            ? "bg-violet-600 text-white border-violet-600 font-semibold"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tabs / Destinations List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Destinations & Tabs ({(sp.bottomNavItems || []).length})
                    </label>
                    <button
                      type="button"
                      onClick={handleResetDefaultBottomNav}
                      className="text-[10px] text-violet-600 hover:text-violet-700 font-semibold"
                    >
                      Reset Tabs
                    </button>
                  </div>

                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {(sp.bottomNavItems || []).map((item, idx) => (
                      <div
                        key={item.id}
                        className={`p-2 rounded-xl border flex items-center gap-2 transition ${
                          (sp.bottomNavActiveIndex ?? 0) === idx
                            ? "bg-violet-50/60 border-violet-300 ring-1 ring-violet-400"
                            : "bg-slate-50/80 border-slate-200"
                        }`}
                      >
                        {/* Radio for active tab */}
                        <button
                          type="button"
                          onClick={() => updateProp("bottomNavActiveIndex", idx)}
                          title="Set as Active Tab"
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            (sp.bottomNavActiveIndex ?? 0) === idx
                              ? "border-violet-600 bg-violet-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {(sp.bottomNavActiveIndex ?? 0) === idx && <Check className="w-2.5 h-2.5" />}
                        </button>

                        {/* Icon Dropdown */}
                        <select
                          value={item.icon}
                          onChange={(e) => handleUpdateBottomNavItem(item.id, { icon: e.target.value })}
                          className="text-[11px] py-1 px-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none shrink-0"
                        >
                          <option value="home">Home</option>
                          <option value="search">Search</option>
                          <option value="compass">Explore</option>
                          <option value="bell">Alerts</option>
                          <option value="user">Profile</option>
                          <option value="heart">Favorites</option>
                          <option value="bookmark">Saved</option>
                          <option value="shopping-bag">Cart</option>
                          <option value="settings">Settings</option>
                        </select>

                        {/* Label input */}
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => handleUpdateBottomNavItem(item.id, { label: e.target.value })}
                          placeholder="Tab Name"
                          className="flex-1 text-xs px-2 py-1 bg-white border border-slate-200 rounded-lg focus:outline-none"
                        />

                        {/* Badge input */}
                        <input
                          type="text"
                          value={item.badge || ""}
                          onChange={(e) => handleUpdateBottomNavItem(item.id, { badge: e.target.value })}
                          placeholder="Badge"
                          title="Badge text e.g. 3 or NEW"
                          className="w-14 text-[10px] text-center font-bold px-1 py-1 bg-white border border-slate-200 rounded-lg focus:outline-none text-violet-600"
                        />

                        {/* Delete item */}
                        <button
                          type="button"
                          onClick={() => handleRemoveBottomNavItem(item.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition shrink-0"
                          title="Remove Tab"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddBottomNavItem}
                    className="w-full py-1.5 px-3 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Destination Tab</span>
                  </button>
                </div>

                {/* Bottom Nav Colors */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      Bar Background
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={sp.bottomNavBackgroundColor || "#FFFFFF"}
                        onChange={(e) => updateProp("bottomNavBackgroundColor", e.target.value)}
                        className="w-7 h-7 rounded-lg border border-slate-300 p-0.5 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={sp.bottomNavBackgroundColor || "#FFFFFF"}
                        onChange={(e) => updateProp("bottomNavBackgroundColor", e.target.value)}
                        className="w-full text-[11px] font-mono px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      Active Icon Tint
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={sp.bottomNavActiveColor || "#4F46E5"}
                        onChange={(e) => updateProp("bottomNavActiveColor", e.target.value)}
                        className="w-7 h-7 rounded-lg border border-slate-300 p-0.5 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={sp.bottomNavActiveColor || "#4F46E5"}
                        onChange={(e) => updateProp("bottomNavActiveColor", e.target.value)}
                        className="w-full text-[11px] font-mono px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 3. Splash Screen ("splace screen") */}
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection("splashScreen")}
          className="w-full px-3.5 py-2.5 bg-slate-50/70 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-100/70 transition"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-violet-600" />
            <span>Splash Screen (Android 12+)</span>
          </div>
          {sections.splashScreen ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {sections.splashScreen && (
          <div className="p-3.5 space-y-3.5 border-t border-slate-100">
            {/* Live Splash Simulation Action */}
            <div className="p-3 bg-violet-600 text-white rounded-xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold block">Live Cold-Start Simulation</span>
                <span className="text-[10px] text-violet-200">Play animated splash screen inside phone canvas</span>
              </div>
              <button
                type="button"
                onClick={() => updateProp("showSplashScreenPreview", true)}
                className="px-3 py-1.5 bg-white text-violet-700 hover:bg-violet-50 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Play Splash</span>
              </button>
            </div>

            {/* Splash Title & Tagline */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Splash Screen App Title
              </label>
              <input
                type="text"
                value={sp.splashTitle !== undefined ? sp.splashTitle : sp.title || screen.title || screen.name}
                onChange={(e) => updateProp("splashTitle", e.target.value)}
                placeholder="App Name displayed during launch"
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Splash Tagline / Slogan
              </label>
              <input
                type="text"
                value={sp.splashTagline || ""}
                onChange={(e) => updateProp("splashTagline", e.target.value)}
                placeholder="e.g. Powered by DroidForge Studio"
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            {/* Splash Window Background Color */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Splash Window Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={sp.splashBackgroundColor || "#0F172A"}
                  onChange={(e) => updateProp("splashBackgroundColor", e.target.value)}
                  className="w-8 h-8 rounded-lg border border-slate-300 p-0.5 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={sp.splashBackgroundColor || "#0F172A"}
                  onChange={(e) => updateProp("splashBackgroundColor", e.target.value)}
                  className="flex-1 text-xs font-mono px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                {["#0F172A", "#1E293B", "#111827", "#4F46E5", "#6366F1", "#000000", "#FFFFFF"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => updateProp("splashBackgroundColor", c)}
                    style={{ backgroundColor: c }}
                    className="w-5 h-5 rounded-md border border-slate-300 transition hover:scale-110"
                    title={`Set to ${c}`}
                  />
                ))}
              </div>
            </div>

            {/* Duration Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-700">
                  Display Duration
                </label>
                <span className="text-[10px] font-mono text-violet-600 font-bold">
                  {((sp.splashDuration || 2200) / 1000).toFixed(1)}s
                </span>
              </div>
              <input
                type="range"
                min="1200"
                max="4000"
                step="200"
                value={sp.splashDuration || 2200}
                onChange={(e) => updateProp("splashDuration", Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
              />
            </div>

            {/* Progress Spinner Toggle */}
            <div className="flex items-center justify-between p-2 bg-slate-50/60 rounded-lg border border-slate-100">
              <div>
                <span className="text-[11px] font-medium text-slate-700 block">
                  Show Startup Loading Spinner
                </span>
                <span className="text-[10px] text-slate-400">
                  Displays subtle Material circular loader below branding
                </span>
              </div>
              <input
                type="checkbox"
                checked={sp.splashShowProgress ?? true}
                onChange={(e) => updateProp("splashShowProgress", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Layout, Alignment & Sizing */}
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection("layoutAlign")}
          className="w-full px-3.5 py-2.5 bg-slate-50/70 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-100/70 transition"
        >
          <div className="flex items-center gap-2">
            <Maximize2 className="w-3.5 h-3.5 text-violet-600" />
            <span>Layout, Alignment & Sizing</span>
          </div>
          {sections.layoutAlign ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {sections.layoutAlign && (
          <div className="p-3.5 space-y-3 border-t border-slate-100">
            {/* Align Horizontal */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Align Horizontal
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["left", "center", "right"] as const).map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => updateProp("alignHorizontal", align)}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg border capitalize transition ${
                      (sp.alignHorizontal || "left") === align
                        ? "bg-violet-600 text-white border-violet-600 shadow-2xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

            {/* Align Vertical */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Align Vertical
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["top", "center", "bottom"] as const).map((valign) => (
                  <button
                    key={valign}
                    type="button"
                    onClick={() => updateProp("alignVertical", valign)}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg border capitalize transition ${
                      (sp.alignVertical || "top") === valign
                        ? "bg-violet-600 text-white border-violet-600 shadow-2xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {valign}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizing */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Sizing
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(["Fixed", "Responsive"] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => updateProp("sizing", sz)}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition ${
                      (sp.sizing || "Responsive") === sz
                        ? "bg-violet-600 text-white border-violet-600 shadow-2xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Container */}
            <div className="flex items-center justify-between p-2 bg-slate-50/60 rounded-lg border border-slate-100">
              <div>
                <span className="text-[11px] font-medium text-slate-700 block">Scrollable</span>
                <span className="text-[10px] text-slate-400">
                  Allow screen content to scroll vertically
                </span>
              </div>
              <input
                type="checkbox"
                checked={sp.scrollable ?? true}
                onChange={(e) => updateProp("scrollable", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Background Color & Background Image */}
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection("colors")}
          className="w-full px-3.5 py-2.5 bg-slate-50/70 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-100/70 transition"
        >
          <div className="flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-violet-600" />
            <span>Colors & Background</span>
          </div>
          {sections.colors ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {sections.colors && (
          <div className="p-3.5 space-y-3.5 border-t border-slate-100">
            {/* Background Color */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-700">
                  Background Color
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  {sp.backgroundColor || "#FFFFFF"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={sp.backgroundColor || "#FFFFFF"}
                  onChange={(e) => updateProp("backgroundColor", e.target.value)}
                  className="w-8 h-8 rounded-lg border border-slate-300 p-0.5 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={sp.backgroundColor || "#FFFFFF"}
                  onChange={(e) => updateProp("backgroundColor", e.target.value)}
                  className="flex-1 text-xs font-mono px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              {/* Color Presets */}
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => updateProp("backgroundColor", c)}
                    style={{ backgroundColor: c }}
                    title={c}
                    className={`w-5 h-5 rounded-md border transition ${
                      sp.backgroundColor === c
                        ? "border-violet-600 ring-2 ring-violet-500/30 scale-110"
                        : "border-slate-300 hover:scale-105"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Background Image */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Background Image (URL or Drawable)
              </label>
              <div className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={sp.backgroundImage || ""}
                  onChange={(e) => updateProp("backgroundImage", e.target.value)}
                  placeholder="https://... or @drawable/bg"
                  className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>

            {/* Primary Color & Primary Color Dark */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Primary Color
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={sp.primaryColor || "#4F46E5"}
                    onChange={(e) => updateProp("primaryColor", e.target.value)}
                    className="w-7 h-7 rounded-lg border border-slate-300 p-0.5 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={sp.primaryColor || "#4F46E5"}
                    onChange={(e) => updateProp("primaryColor", e.target.value)}
                    className="w-full text-xs font-mono px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Primary Color Dark
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={sp.primaryColorDark || "#3730A3"}
                    onChange={(e) => updateProp("primaryColorDark", e.target.value)}
                    className="w-7 h-7 rounded-lg border border-slate-300 p-0.5 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={sp.primaryColorDark || "#3730A3"}
                    onChange={(e) => updateProp("primaryColorDark", e.target.value)}
                    className="w-full text-xs font-mono px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Status Bar & Navigation Bar */}
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection("systemBars")}
          className="w-full px-3.5 py-2.5 bg-slate-50/70 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-100/70 transition"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-violet-600" />
            <span>Status Bar & Navigation Bar</span>
          </div>
          {sections.systemBars ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {sections.systemBars && (
          <div className="p-3.5 space-y-3 border-t border-slate-100">
            {/* Show Status Bar */}
            <div className="flex items-center justify-between p-2 bg-slate-50/60 rounded-lg border border-slate-100">
              <span className="text-[11px] font-medium text-slate-700">Show Status Bar</span>
              <input
                type="checkbox"
                checked={sp.showStatusBar ?? true}
                onChange={(e) => updateProp("showStatusBar", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
              />
            </div>

            {/* Status Bar Color */}
            {sp.showStatusBar && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Status Bar Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={sp.statusBarColor || "#0F172A"}
                    onChange={(e) => updateProp("statusBarColor", e.target.value)}
                    className="w-8 h-8 rounded-lg border border-slate-300 p-0.5 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={sp.statusBarColor || "#0F172A"}
                    onChange={(e) => updateProp("statusBarColor", e.target.value)}
                    className="flex-1 text-xs font-mono px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Status Bar Light Icons */}
            {sp.showStatusBar && (
              <div className="flex items-center justify-between p-2 bg-slate-50/60 rounded-lg border border-slate-100">
                <div>
                  <span className="text-[11px] font-medium text-slate-700 block">
                    Status Bar Light Icons
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Use dark or light icons for battery/clock
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={sp.statusBarLightIcons ?? false}
                  onChange={(e) => updateProp("statusBarLightIcons", e.target.checked)}
                  className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
                />
              </div>
            )}

            <div className="h-[1px] bg-slate-100 my-1" />

            {/* Show Navigation Bar */}
            <div className="flex items-center justify-between p-2 bg-slate-50/60 rounded-lg border border-slate-100">
              <span className="text-[11px] font-medium text-slate-700">Show Navigation Bar</span>
              <input
                type="checkbox"
                checked={sp.showNavigationBar ?? true}
                onChange={(e) => updateProp("showNavigationBar", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
              />
            </div>

            {/* Navigation Bar Color */}
            {sp.showNavigationBar && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Navigation Bar Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={sp.navigationBarColor || "#0F172A"}
                    onChange={(e) => updateProp("navigationBarColor", e.target.value)}
                    className="w-8 h-8 rounded-lg border border-slate-300 p-0.5 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={sp.navigationBarColor || "#0F172A"}
                    onChange={(e) => updateProp("navigationBarColor", e.target.value)}
                    className="flex-1 text-xs font-mono px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Navigation Bar Light Icons */}
            {sp.showNavigationBar && (
              <div className="flex items-center justify-between p-2 bg-slate-50/60 rounded-lg border border-slate-100">
                <span className="text-[11px] font-medium text-slate-700">
                  Navigation Bar Light Icons
                </span>
                <input
                  type="checkbox"
                  checked={sp.navigationBarLightIcons ?? false}
                  onChange={(e) => updateProp("navigationBarLightIcons", e.target.checked)}
                  className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
                />
              </div>
            )}

            {/* System Navigation Mode */}
            {sp.showNavigationBar && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                  System Navigation Style
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateProp("systemNavMode", "gesture")}
                    className={`py-1.5 px-2 text-[11px] font-medium rounded-lg border transition ${
                      (sp.systemNavMode || "gesture") === "gesture"
                        ? "bg-violet-600 text-white border-violet-600 shadow-2xs font-semibold"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Gesture Bar (Pill)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateProp("systemNavMode", "3-button")}
                    className={`py-1.5 px-2 text-[11px] font-medium rounded-lg border transition ${
                      sp.systemNavMode === "3-button"
                        ? "bg-violet-600 text-white border-violet-600 shadow-2xs font-semibold"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    3-Button (Classic)
                  </button>
                </div>
              </div>
            )}

            {/* Edge-to-Edge display */}
            <div className="flex items-center justify-between p-2 bg-slate-50/60 rounded-lg border border-slate-100">
              <div>
                <span className="text-[11px] font-medium text-slate-700 block">
                  Edge-to-Edge Enforce
                </span>
                <span className="text-[10px] text-slate-400">
                  Android 15+ transparent system bars layout
                </span>
              </div>
              <input
                type="checkbox"
                checked={sp.edgeToEdge ?? false}
                onChange={(e) => updateProp("edgeToEdge", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* 5. Screen Orientation & Animations */}
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection("orientationAnim")}
          className="w-full px-3.5 py-2.5 bg-slate-50/70 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-100/70 transition"
        >
          <div className="flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-violet-600" />
            <span>Orientation & Transition Animations</span>
          </div>
          {sections.orientationAnim ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {sections.orientationAnim && (
          <div className="p-3.5 space-y-3 border-t border-slate-100">
            {/* Screen Orientation */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Screen Orientation
              </label>
              <select
                value={sp.screenOrientation || "portrait"}
                onChange={(e) =>
                  updateProp("screenOrientation", e.target.value as ScreenOrientationType)
                }
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
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

            {/* Open Screen Animation */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Open Screen Animation
              </label>
              <select
                value={sp.openScreenAnimation || "default"}
                onChange={(e) =>
                  updateProp("openScreenAnimation", e.target.value as ScreenAnimationType)
                }
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
              >
                <option value="default">Default Android Transition</option>
                <option value="fade">Fade In</option>
                <option value="zoom">Zoom Scale In</option>
                <option value="slide_horizontal">Slide Horizontal (Right to Left)</option>
                <option value="slide_vertical">Slide Vertical (Bottom to Top)</option>
                <option value="none">None (Instant Cut)</option>
              </select>
            </div>

            {/* Close Screen Animation */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Close Screen Animation
              </label>
              <select
                value={sp.closeScreenAnimation || "default"}
                onChange={(e) =>
                  updateProp("closeScreenAnimation", e.target.value as ScreenAnimationType)
                }
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
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

      {/* 6. Accessibility & Media Features */}
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection("accessibility")}
          className="w-full px-3.5 py-2.5 bg-slate-50/70 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-100/70 transition"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>Accessibility, Media & Data</span>
          </div>
          {sections.accessibility ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {sections.accessibility && (
          <div className="p-3.5 space-y-2.5 border-t border-slate-100">
            {/* Big Default Text */}
            <div className="flex items-center justify-between p-2 bg-slate-50/60 rounded-lg border border-slate-100">
              <div>
                <span className="text-[11px] font-medium text-slate-700 block">
                  Big Default Text
                </span>
                <span className="text-[10px] text-slate-400">
                  Enlarges baseline font scale for accessibility
                </span>
              </div>
              <input
                type="checkbox"
                checked={sp.bigDefaultText ?? false}
                onChange={(e) => updateProp("bigDefaultText", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
              />
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between p-2 bg-slate-50/60 rounded-lg border border-slate-100">
              <div>
                <span className="text-[11px] font-medium text-slate-700 block">High Contrast</span>
                <span className="text-[10px] text-slate-400">
                  Boosts foreground contrast against dark/light backgrounds
                </span>
              </div>
              <input
                type="checkbox"
                checked={sp.highContrast ?? false}
                onChange={(e) => updateProp("highContrast", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
              />
            </div>

            {/* High Quality Images */}
            <div className="flex items-center justify-between p-2 bg-slate-50/60 rounded-lg border border-slate-100">
              <div>
                <span className="text-[11px] font-medium text-slate-700 block">
                  High Quality Images
                </span>
                <span className="text-[10px] text-slate-400">
                  Hardware-accelerated Coil mipmapping & supersampling
                </span>
              </div>
              <input
                type="checkbox"
                checked={sp.highQualityImages ?? true}
                onChange={(e) => updateProp("highQualityImages", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
              />
            </div>

            {/* Show Lists As Json */}
            <div className="flex items-center justify-between p-2 bg-slate-50/60 rounded-lg border border-slate-100">
              <div>
                <span className="text-[11px] font-medium text-slate-700 block">
                  Show Lists As Json
                </span>
                <span className="text-[10px] text-slate-400">
                  Serialize data collections as JSON strings for debugging
                </span>
              </div>
              <input
                type="checkbox"
                checked={sp.showListsAsJson ?? false}
                onChange={(e) => updateProp("showListsAsJson", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
              />
            </div>

            {/* Keep Screen On */}
            <div className="flex items-center justify-between p-2 bg-slate-50/60 rounded-lg border border-slate-100">
              <div>
                <span className="text-[11px] font-medium text-slate-700 block">
                  Keep Screen On
                </span>
                <span className="text-[10px] text-slate-400">
                  FLAG_KEEP_SCREEN_ON (prevents device display sleep)
                </span>
              </div>
              <input
                type="checkbox"
                checked={sp.keepScreenOn ?? false}
                onChange={(e) => updateProp("keepScreenOn", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
