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
} from "lucide-react";
import { AndroidScreen, ScreenProperties, ScreenOrientationType, ScreenAnimationType } from "../../../types";

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
    layoutAlign: true,
    colors: true,
    systemBars: true,
    orientationAnim: true,
    accessibility: true,
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
  };

  const sp: ScreenProperties = {
    ...defaultScreenProps,
    ...(screen.properties || {}),
  };

  const updateProp = <K extends keyof ScreenProperties>(key: K, value: ScreenProperties[K]) => {
    onUpdateScreenProperties(screen.id, { [key]: value });
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

      {/* 1. Title & Top Bar */}
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection("titleAndBar")}
          className="w-full px-3.5 py-2.5 bg-slate-50/70 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-100/70 transition"
        >
          <div className="flex items-center gap-2">
            <Type className="w-3.5 h-3.5 text-violet-600" />
            <span>Title & App Bar</span>
          </div>
          {sections.titleAndBar ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {sections.titleAndBar && (
          <div className="p-3.5 space-y-3 border-t border-slate-100">
            {/* Title */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={sp.title !== undefined ? sp.title : screen.title || screen.name}
                onChange={(e) => {
                  const val = e.target.value;
                  updateProp("title", val);
                  onUpdateScreenTitle(screen.id, val);
                }}
                placeholder="Screen Title"
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 focus:bg-white"
              />
            </div>

            {/* Title Visible */}
            <div className="flex items-center justify-between p-2 bg-slate-50/60 rounded-lg border border-slate-100">
              <span className="text-[11px] font-medium text-slate-700">Title Visible</span>
              <input
                type="checkbox"
                checked={sp.titleVisible ?? true}
                onChange={(e) => updateProp("titleVisible", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
              />
            </div>

            {/* Show About In Menu */}
            <div className="flex items-center justify-between p-2 bg-slate-50/60 rounded-lg border border-slate-100">
              <div>
                <span className="text-[11px] font-medium text-slate-700 block">
                  Show About In Menu
                </span>
                <span className="text-[10px] text-slate-400">
                  Adds "About Screen" in 3-dots overflow menu
                </span>
              </div>
              <input
                type="checkbox"
                checked={sp.showAboutInMenu ?? true}
                onChange={(e) => updateProp("showAboutInMenu", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
              />
            </div>

            {/* About Screen Text */}
            {sp.showAboutInMenu && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  About Screen Text
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
