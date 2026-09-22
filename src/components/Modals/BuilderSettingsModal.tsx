import React, { useState } from "react";
import {
  X,
  Palette,
  Sliders,
  Code2,
  Volume2,
  VolumeX,
  RotateCcw,
  Check,
  ShieldCheck,
  Smartphone,
  Eye,
  Type,
  Grid,
  Sparkles,
  Layers,
  CheckCircle2,
  Maximize,
  Monitor,
  Pipette,
  Copy,
  CheckCheck,
  Paintbrush,
  Bookmark,
  RefreshCw,
  SlidersHorizontal,
  Zap,
  Activity,
  Flame,
  MoveRight,
} from "lucide-react";
import {
  BuilderIdeSettings,
  IdeTheme,
  IdeAccentColor,
  IdeDensity,
  IdeFont,
  CanvasBgStyle,
  CodeEditorTheme,
  AutoSaveInterval,
  CustomThemeColors,
  FlowLineAnimation,
  FlowLineColor,
  FlowLineStyle,
  NodeGlowEffect,
} from "../../types";
import {
  DEFAULT_BUILDER_SETTINGS,
  ACCENT_COLOR_MAP,
  THEME_PREVIEW_MAP,
  DEFAULT_CUSTOM_THEME_COLORS,
  CUSTOM_PALETTE_PRESETS,
  CustomPalettePreset,
  playIdeSound,
} from "../../lib/builderSettings";

interface ColorInputRowProps {
  id: string;
  label: string;
  description: string;
  value: string;
  onChange: (hex: string) => void;
  presetSwatches?: string[];
}

const ColorInputRow: React.FC<ColorInputRowProps> = ({
  id,
  label,
  description,
  value,
  onChange,
  presetSwatches = [
    "#0F172A",
    "#1E293B",
    "#334155",
    "#6366F1",
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EC4899",
    "#F8FAFC",
    "#94A3B8",
  ],
}) => {
  const [localVal, setLocalVal] = useState(value);

  React.useEffect(() => {
    setLocalVal(value);
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalVal(val);
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val)) {
      onChange(val);
    }
  };

  const cleanColor =
    value && (value.length === 4 || value.length === 7) && value.startsWith("#")
      ? value
      : "#6366F1";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl border transition shadow-2xs" style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)" }}>
      <div className="min-w-0 flex-1">
        <label
          htmlFor={`picker-${id}`}
          className="text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          style={{ color: "var(--ide-text)" }}
        >
          <span>{label}</span>
        </label>
        <p className="text-[11px] leading-tight mt-0.5" style={{ color: "var(--ide-text-muted)" }}>{description}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Native Color Picker & Visual Swatch */}
        <label
          htmlFor={`picker-${id}`}
          className="w-8 h-8 rounded-lg border-2 shadow-2xs cursor-pointer flex items-center justify-center transition hover:scale-105 relative shrink-0 overflow-hidden"
          style={{ backgroundColor: value, borderColor: "var(--ide-border)" }}
          title={`Click to pick color for ${label}`}
        >
          <input
            id={`picker-${id}`}
            type="color"
            value={cleanColor}
            onChange={(e) => {
              setLocalVal(e.target.value);
              onChange(e.target.value);
            }}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
          />
        </label>

        {/* Text Hex input */}
        <div className="relative">
          <input
            id={`hex-${id}`}
            type="text"
            value={localVal}
            onChange={handleTextChange}
            placeholder="#000000"
            maxLength={7}
            className="w-24 px-2 py-1 text-xs font-mono font-semibold rounded-lg border uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}
          />
        </div>

        {/* Quick Swatches Palette */}
        <div className="hidden lg:flex items-center gap-1">
          {presetSwatches.slice(0, 4).map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => {
                setLocalVal(swatch);
                onChange(swatch);
              }}
              className="w-4 h-4 rounded-full border border-black/15 shadow-2xs hover:scale-125 transition shrink-0 cursor-pointer"
              style={{ backgroundColor: swatch }}
              title={`Apply ${swatch}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface BuilderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BuilderIdeSettings;
  onUpdateSettings: (updates: Partial<BuilderIdeSettings>) => void;
  onResetSettings: () => void;
  onOpenAppTheme?: () => void;
}

type SettingsSection = "appearance" | "canvas" | "logic" | "code" | "workflow";

export const BuilderSettingsModal: React.FC<BuilderSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
  onOpenAppTheme,
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>("appearance");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [customPaletteCategory, setCustomPaletteCategory] = useState<
    "all" | "surfaces" | "typography" | "tabs" | "accent"
  >("all");

  if (!isOpen) return null;

  const handleUpdate = (updates: Partial<BuilderIdeSettings>) => {
    onUpdateSettings(updates);
    if (settings.soundEffects) {
      playIdeSound("toggle");
    }
  };

  const currentAccent = ACCENT_COLOR_MAP[settings.accentColor] || ACCENT_COLOR_MAP.indigo;

  const customColors: CustomThemeColors = {
    ...DEFAULT_CUSTOM_THEME_COLORS,
    ...(settings.customThemeColors || {}),
  };

  const handleUpdateCustomColor = (key: keyof CustomThemeColors, value: string) => {
    const updated: CustomThemeColors = {
      ...customColors,
      [key]: value,
    };
    handleUpdate({
      theme: "custom",
      customThemeColors: updated,
    });
  };

  const handleApplyPreset = (preset: CustomPalettePreset) => {
    handleUpdate({
      theme: "custom",
      customThemeColors: { ...preset.colors },
      accentColor: "custom",
    });
  };

  const handleCopyPaletteJson = () => {
    try {
      navigator.clipboard.writeText(JSON.stringify(customColors, null, 2));
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleResetToSlateDefaults = () => {
    handleUpdate({
      theme: "custom",
      customThemeColors: { ...DEFAULT_CUSTOM_THEME_COLORS },
    });
  };

  const handleCloneFromTheme = (themeKey: IdeTheme) => {
    const t = THEME_PREVIEW_MAP[themeKey];
    if (!t) return;
    const isDark = themeKey !== "light";
    handleUpdate({
      theme: "custom",
      customThemeColors: {
        shellBg: t.shellBg,
        cardBg: t.cardBg,
        cardInnerBg: t.cardInnerBg || t.shellBg,
        textColor: t.textColor,
        textMutedColor: t.textMuted || "#94A3B8",
        borderColor: t.border,
        accentColor: currentAccent.hex,
        accentTextColor: "#FFFFFF",
        tabBarBg: isDark ? "rgba(15, 23, 42, 0.85)" : "#F1F5F9",
        tabActiveBg: isDark ? currentAccent.hex : "#FFFFFF",
        tabActiveText: isDark ? "#FFFFFF" : "#4338CA",
        tabInactiveText: t.textMuted || "#94A3B8",
        tabIndicatorColor: currentAccent.hex,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="rounded-2xl shadow-2xl border w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}>
        {/* Modal Header with Safety Badge */}
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: currentAccent.hex }}
            >
              <Sliders className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold" style={{ color: "var(--ide-text)" }}>Builder Settings</h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  IDE Preferences
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--ide-text-muted)" }}>
                Personalize the DroidForge Studio editor appearance, canvas, and workflow
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl transition hover:opacity-80 cursor-pointer"
            style={{ color: "var(--ide-text-muted)" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prominent Isolation Notice Banner & Direct App Theme Quick Link */}
        <div className="px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong className="text-amber-200">Workstation IDE Scope:</strong> These settings personalize this Builder Studio interface (themes, fonts, canvas snapping). They do <u>not</u> change your Android app screens or APK colors.
            </span>
          </div>

          {onOpenAppTheme && (
            <button
              type="button"
              id="builder-settings-goto-app-theme-btn"
              onClick={() => {
                onClose();
                onOpenAppTheme();
              }}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-semibold text-[11px] transition shadow-2xs cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Change Android App / Screen Theme & Font →</span>
            </button>
          )}
        </div>

        {/* Modal Content Layout (Tabs on Left, Settings on Right) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar Navigation */}
          <div className="w-56 border-r p-3 space-y-1 shrink-0 overflow-y-auto" style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)" }}>
            <button
              type="button"
              onClick={() => setActiveSection("appearance")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                activeSection === "appearance"
                  ? "shadow-xs border font-bold"
                  : "hover:opacity-90"
              }`}
              style={
                activeSection === "appearance"
                  ? { backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }
                  : { color: "var(--ide-text-muted)" }
              }
            >
              <Palette className="w-4 h-4 text-indigo-400" />
              <span>Appearance & Style</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("canvas")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                activeSection === "canvas"
                  ? "shadow-xs border font-bold"
                  : "hover:opacity-90"
              }`}
              style={
                activeSection === "canvas"
                  ? { backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }
                  : { color: "var(--ide-text-muted)" }
              }
            >
              <Grid className="w-4 h-4 text-emerald-400" />
              <span>Canvas & Visual Editor</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("logic")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                activeSection === "logic"
                  ? "shadow-xs border font-bold"
                  : "hover:opacity-90"
              }`}
              style={
                activeSection === "logic"
                  ? { backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }
                  : { color: "var(--ide-text-muted)" }
              }
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Logic Blocks & Flow</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("code")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                activeSection === "code"
                  ? "shadow-xs border font-bold"
                  : "hover:opacity-90"
              }`}
              style={
                activeSection === "code"
                  ? { backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }
                  : { color: "var(--ide-text-muted)" }
              }
            >
              <Code2 className="w-4 h-4 text-blue-400" />
              <span>Code Studio & Syntax</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("workflow")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                activeSection === "workflow"
                  ? "shadow-xs border font-bold"
                  : "hover:opacity-90"
              }`}
              style={
                activeSection === "workflow"
                  ? { backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }
                  : { color: "var(--ide-text-muted)" }
              }
            >
              <Sliders className="w-4 h-4 text-violet-400" />
              <span>Workflow & Feedback</span>
            </button>

            {/* Quick Live Preview Card in Sidebar */}
            <div className="pt-4 mt-4 border-t border-slate-200/80 px-2 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                IDE Live Preview
              </div>
              <div
                className="p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2 transition"
                style={{
                  backgroundColor:
                    settings.theme === "custom"
                      ? customColors.shellBg
                      : THEME_PREVIEW_MAP[settings.theme]?.shellBg || "#0F172A",
                  color:
                    settings.theme === "custom"
                      ? customColors.textColor
                      : THEME_PREVIEW_MAP[settings.theme]?.textColor || "#F8FAFC",
                }}
              >
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span>
                    {settings.theme === "custom"
                      ? "Custom Studio"
                      : THEME_PREVIEW_MAP[settings.theme]?.name || "Slate"}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full shadow-xs"
                    style={{
                      backgroundColor:
                        settings.theme === "custom" ? customColors.accentColor : currentAccent.hex,
                    }}
                  />
                </div>

                {/* Active Tab Preview Pill */}
                <div
                  className="px-2 py-1 rounded-lg text-[10px] font-semibold text-center flex items-center justify-between shadow-2xs border"
                  style={{
                    backgroundColor:
                      settings.theme === "custom" ? customColors.tabActiveBg : currentAccent.hex,
                    color:
                      settings.theme === "custom" ? customColors.tabActiveText : "#FFFFFF",
                    borderColor:
                      settings.theme === "custom"
                        ? customColors.tabIndicatorColor
                        : "transparent",
                  }}
                >
                  <span>Active Tab</span>
                  <span className="text-[9px] opacity-80 font-bold">Canvas</span>
                </div>

                <div
                  className="text-[9px] text-center"
                  style={{
                    color:
                      settings.theme === "custom"
                        ? customColors.textMutedColor
                        : THEME_PREVIEW_MAP[settings.theme]?.textMuted || "#94A3B8",
                  }}
                >
                  Muted typography preview
                </div>
              </div>
            </div>
          </div>

          {/* Right Main Settings Panel */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {/* SECTION 1: Appearance & Personalization */}
            {activeSection === "appearance" && (
              <div className="space-y-6 animate-in fade-in duration-100">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--ide-text)" }}>
                        <Palette className="w-4 h-4 text-indigo-400" />
                        <span>Studio Theme</span>
                      </h4>
                      <p className="text-xs mt-0.5" style={{ color: "var(--ide-text-muted)" }}>
                        Select the overall color theme for DroidForge Studio's workspace shell.
                      </p>
                    </div>

                    {settings.theme !== "custom" && (
                      <button
                        type="button"
                        onClick={() => handleUpdate({ theme: "custom" })}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition cursor-pointer"
                      >
                        <Paintbrush className="w-3.5 h-3.5" />
                        <span>Customize Colors</span>
                      </button>
                    )}
                  </div>

                  {/* Theme Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                    {(Object.keys(THEME_PREVIEW_MAP) as IdeTheme[]).map((themeKey) => {
                      const t = THEME_PREVIEW_MAP[themeKey];
                      const isSelected = settings.theme === themeKey;
                      const isCustom = themeKey === "custom";
                      const shellBg = isCustom ? customColors.shellBg : t.shellBg;
                      const cardBg = isCustom ? customColors.cardBg : t.cardBg;
                      const textColor = isCustom ? customColors.textColor : t.textColor;

                      return (
                        <div
                          key={themeKey}
                          onClick={() => handleUpdate({ theme: themeKey })}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition relative flex flex-col justify-between ${
                            isSelected
                              ? "border-indigo-500 shadow-sm ring-1 ring-indigo-500/20"
                              : "hover:opacity-90"
                          }`}
                          style={{
                            backgroundColor: "var(--ide-card-inner-bg)",
                            borderColor: isSelected ? undefined : "var(--ide-border)",
                          }}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--ide-text)" }}>
                                {isCustom && <Paintbrush className="w-3.5 h-3.5 text-indigo-400" />}
                                <span>{isCustom ? "Custom Studio" : t.name}</span>
                              </span>
                              {isSelected && (
                                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] line-clamp-2 leading-relaxed" style={{ color: "var(--ide-text-muted)" }}>
                              {isCustom
                                ? "Personalize theme surfaces, font colors, and tab navigation styling"
                                : t.desc}
                            </p>
                          </div>

                          {/* Mini visual swatch */}
                          <div className="mt-3 flex items-center gap-1.5 p-1.5 rounded-lg border" style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)" }}>
                            <div
                              className="w-4 h-4 rounded border border-black/20"
                              style={{ backgroundColor: shellBg }}
                              title="Shell Background"
                            />
                            <div
                              className="w-4 h-4 rounded border border-black/20"
                              style={{ backgroundColor: cardBg }}
                              title="Card Background"
                            />
                            <div
                              className="w-4 h-4 rounded border border-black/20 flex items-center justify-center text-[8px] font-bold"
                              style={{ backgroundColor: shellBg, color: textColor }}
                              title="Text Color"
                            >
                              Aa
                            </div>
                            {isCustom && (
                              <div
                                className="w-6 h-4 rounded border border-black/10 flex items-center justify-center text-[8px] font-bold ml-auto"
                                style={{
                                  backgroundColor: customColors.tabActiveBg,
                                  color: customColors.tabActiveText,
                                }}
                                title="Tab Active Color"
                              >
                                Tab
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* CUSTOM THEME, FONT & TAB COLOR STUDIO (USER'S EXPLICIT CUSTOMIZATION HUB) */}
                {/* ========================================================================= */}
                <div className="pt-4 border-t space-y-4" style={{ borderColor: "var(--ide-border)" }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-2xl border" style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)" }}>
                    <div>
                      <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--ide-text)" }}>
                        <Paintbrush className="w-4 h-4 text-indigo-400" />
                        <span>Custom Palette Studio: Theme, Font & Tab Colors</span>
                      </h4>
                      <p className="text-xs mt-0.5" style={{ color: "var(--ide-text-muted)" }}>
                        Customize workspace surface colors, font colors, and tab navigation styling. Changes sync live across the IDE!
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleCopyPaletteJson}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition shadow-2xs cursor-pointer"
                        style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}
                        title="Copy color palette configuration as JSON"
                      >
                        {copiedToast ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" style={{ color: "var(--ide-text-muted)" }} />
                            <span>Copy JSON</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleResetToSlateDefaults}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition shadow-2xs cursor-pointer"
                        style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}
                        title="Reset custom palette to Slate defaults"
                      >
                        <RefreshCw className="w-3.5 h-3.5" style={{ color: "var(--ide-text-muted)" }} />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Ready-Made Palettes (One-Click) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--ide-text)" }}>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Quick Palette Presets</span>
                      </span>
                      <span className="text-[11px]" style={{ color: "var(--ide-text-muted)" }}>
                        Click any preset to apply instantly
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                      {CUSTOM_PALETTE_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className="flex flex-col items-center p-2 rounded-xl border transition text-center shadow-2xs group cursor-pointer"
                          style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}
                        >
                          <div className="flex items-center gap-1 mb-1.5">
                            <span
                              className="w-3 h-3 rounded-full border border-black/20"
                              style={{ backgroundColor: preset.colors.shellBg }}
                              title="Shell"
                            />
                            <span
                              className="w-3 h-3 rounded-full border border-black/20"
                              style={{ backgroundColor: preset.colors.cardBg }}
                              title="Card"
                            />
                            <span
                              className="w-3 h-3 rounded-full border border-black/20"
                              style={{ backgroundColor: preset.colors.accentColor }}
                              title="Accent"
                            />
                            <span
                              className="w-3 h-3 rounded-full border border-black/20"
                              style={{ backgroundColor: preset.colors.tabActiveBg }}
                              title="Tab Active"
                            />
                          </div>
                          <span className="text-[11px] font-bold truncate w-full group-hover:text-indigo-400" style={{ color: "var(--ide-text)" }}>
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Live IDE Mini-Preview Box */}
                  <div className="p-3.5 rounded-2xl border shadow-xs space-y-2.5" style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)" }}>
                    <div className="flex items-center justify-between text-xs font-bold" style={{ color: "var(--ide-text)" }}>
                      <span className="flex items-center gap-1.5">
                        <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Real-Time IDE Workspace Preview</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border" style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text-muted)" }}>
                        Live Simulation
                      </span>
                    </div>

                    {/* Simulated Shell Container */}
                    <div
                      className="rounded-xl border p-3.5 space-y-3 transition shadow-xs"
                      style={{
                        backgroundColor: customColors.shellBg,
                        borderColor: customColors.borderColor,
                        color: customColors.textColor,
                      }}
                    >
                      {/* Simulated Top Header & Tab Bar */}
                      <div
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-xl border shadow-2xs"
                        style={{
                          backgroundColor: customColors.cardBg,
                          borderColor: customColors.borderColor,
                        }}
                      >
                        {/* Title & App Branding */}
                        <div className="flex items-center gap-2">
                          <span
                            className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shadow-2xs"
                            style={{
                              backgroundColor: customColors.accentColor,
                              color: customColors.accentTextColor,
                            }}
                          >
                            DF
                          </span>
                          <span
                            className="text-xs font-bold tracking-tight"
                            style={{ color: customColors.textColor }}
                          >
                            DroidForge Studio
                          </span>
                        </div>

                        {/* Simulated Tab Bar Container */}
                        <div
                          className="flex items-center gap-1 p-1 rounded-full border shadow-2xs overflow-x-auto"
                          style={{
                            backgroundColor: customColors.tabBarBg,
                            borderColor: customColors.borderColor,
                          }}
                        >
                          {/* Active Tab */}
                          <div
                            className="px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-xs border"
                            style={{
                              backgroundColor: customColors.tabActiveBg,
                              color: customColors.tabActiveText,
                              borderColor: customColors.tabIndicatorColor,
                            }}
                          >
                            <Layers className="w-3 h-3" />
                            <span>Canvas</span>
                          </div>

                          {/* Inactive Tab 1 */}
                          <div
                            className="px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 transition"
                            style={{ color: customColors.tabInactiveText }}
                          >
                            <Code2 className="w-3 h-3" />
                            <span>Logic</span>
                          </div>

                          {/* Inactive Tab 2 */}
                          <div
                            className="px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 transition"
                            style={{ color: customColors.tabInactiveText }}
                          >
                            <span>Code</span>
                          </div>
                        </div>
                      </div>

                      {/* Simulated Card Surface & Typography Content */}
                      <div
                        className="p-3 rounded-xl border shadow-2xs space-y-2.5"
                        style={{
                          backgroundColor: customColors.cardBg,
                          borderColor: customColors.borderColor,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <h5
                            className="text-xs font-bold"
                            style={{ color: customColors.textColor }}
                          >
                            Component Inspector & Properties
                          </h5>
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                            style={{
                              backgroundColor: customColors.cardInnerBg,
                              borderColor: customColors.borderColor,
                              color: customColors.textMutedColor,
                            }}
                          >
                            v2.4.0
                          </span>
                        </div>

                        <p
                          className="text-[11px] leading-relaxed"
                          style={{ color: customColors.textMutedColor }}
                        >
                          This sample preview demonstrates how your custom primary font color, muted helper typography, panel borders, and inner input fills look together.
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {/* Simulated Input Field */}
                          <div
                            className="px-2.5 py-1 rounded-lg text-xs font-mono border flex-1 min-w-[140px]"
                            style={{
                              backgroundColor: customColors.cardInnerBg,
                              borderColor: customColors.borderColor,
                              color: customColors.textColor,
                            }}
                          >
                            btn_submit_order
                          </div>

                          {/* Simulated Accent Button */}
                          <button
                            type="button"
                            className="px-3 py-1 rounded-lg text-xs font-bold shadow-2xs transition"
                            style={{
                              backgroundColor: customColors.accentColor,
                              color: customColors.accentTextColor,
                            }}
                          >
                            Apply Action
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Color Category Filter Tabs */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl border overflow-x-auto" style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)" }}>
                    {[
                      { id: "all", label: "All Colors" },
                      { id: "surfaces", label: "🎨 Surfaces & Borders" },
                      { id: "typography", label: "🔤 Font & Typography" },
                      { id: "tabs", label: "📑 Tab Navigation" },
                      { id: "accent", label: "⚡ Accent & Buttons" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() =>
                          setCustomPaletteCategory(
                            cat.id as "all" | "surfaces" | "typography" | "tabs" | "accent"
                          )
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs transition cursor-pointer whitespace-nowrap ${
                          customPaletteCategory === cat.id
                            ? "font-bold shadow-2xs border"
                            : "hover:opacity-90"
                        }`}
                        style={
                          customPaletteCategory === cat.id
                            ? { backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }
                            : { color: "var(--ide-text-muted)" }
                        }
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Section 1: Surfaces & Backgrounds */}
                  {(customPaletteCategory === "all" || customPaletteCategory === "surfaces") && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--ide-text)" }}>
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Theme Surfaces & Background Colors</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <ColorInputRow
                          id="shell-bg"
                          label="Shell Background"
                          description="Base canvas and root editor backdrop"
                          value={customColors.shellBg}
                          onChange={(val) => handleUpdateCustomColor("shellBg", val)}
                        />
                        <ColorInputRow
                          id="card-bg"
                          label="Card / Panel Background"
                          description="Panels, sidebars, header, and modals"
                          value={customColors.cardBg}
                          onChange={(val) => handleUpdateCustomColor("cardBg", val)}
                        />
                        <ColorInputRow
                          id="card-inner-bg"
                          label="Inner Card / Input Fill"
                          description="Text fields, select boxes, and well containers"
                          value={customColors.cardInnerBg}
                          onChange={(val) => handleUpdateCustomColor("cardInnerBg", val)}
                        />
                        <ColorInputRow
                          id="border-color"
                          label="Border & Line Color"
                          description="Dividers, card outlines, and component bounds"
                          value={customColors.borderColor}
                          onChange={(val) => handleUpdateCustomColor("borderColor", val)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Section 2: Font & Typography Colors */}
                  {(customPaletteCategory === "all" || customPaletteCategory === "typography") && (
                    <div className="space-y-2 pt-2">
                      <div className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--ide-text)" }}>
                        <Type className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Font & Typography Colors</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <ColorInputRow
                          id="text-color"
                          label="Primary Font Color"
                          description="Headings, component titles, and main text"
                          value={customColors.textColor}
                          onChange={(val) => handleUpdateCustomColor("textColor", val)}
                        />
                        <ColorInputRow
                          id="text-muted-color"
                          label="Muted / Secondary Font Color"
                          description="Subtitles, descriptions, line numbers, and hints"
                          value={customColors.textMutedColor}
                          onChange={(val) => handleUpdateCustomColor("textMutedColor", val)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Section 3: Tab Navigation Colors */}
                  {(customPaletteCategory === "all" || customPaletteCategory === "tabs") && (
                    <div className="space-y-2 pt-2">
                      <div className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--ide-text)" }}>
                        <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Tab Bar & Navigation Colors</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <ColorInputRow
                          id="tab-bar-bg"
                          label="Tab Bar Container Background"
                          description="Background strip containing Studio navigation tabs"
                          value={customColors.tabBarBg}
                          onChange={(val) => handleUpdateCustomColor("tabBarBg", val)}
                        />
                        <ColorInputRow
                          id="tab-active-bg"
                          label="Active Tab Background"
                          description="Background fill of the currently selected tab"
                          value={customColors.tabActiveBg}
                          onChange={(val) => handleUpdateCustomColor("tabActiveBg", val)}
                        />
                        <ColorInputRow
                          id="tab-active-text"
                          label="Active Tab Font Color"
                          description="Text and icon color of the active tab"
                          value={customColors.tabActiveText}
                          onChange={(val) => handleUpdateCustomColor("tabActiveText", val)}
                        />
                        <ColorInputRow
                          id="tab-inactive-text"
                          label="Inactive Tab Font Color"
                          description="Text and icon color of unselected tabs"
                          value={customColors.tabInactiveText}
                          onChange={(val) => handleUpdateCustomColor("tabInactiveText", val)}
                        />
                        <ColorInputRow
                          id="tab-indicator-color"
                          label="Tab Indicator Highlight"
                          description="Border accent and indicator ring on the active tab"
                          value={customColors.tabIndicatorColor}
                          onChange={(val) => handleUpdateCustomColor("tabIndicatorColor", val)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Section 4: Accent & Action Colors */}
                  {(customPaletteCategory === "all" || customPaletteCategory === "accent") && (
                    <div className="space-y-2 pt-2">
                      <div className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--ide-text)" }}>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Studio Accent & Button Colors</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <ColorInputRow
                          id="accent-color"
                          label="Studio Accent Color"
                          description="Action buttons, active toggles, and highlights"
                          value={customColors.accentColor}
                          onChange={(val) => handleUpdateCustomColor("accentColor", val)}
                        />
                        <ColorInputRow
                          id="accent-text-color"
                          label="Accent Button Font Color"
                          description="Text color inside primary accent buttons"
                          value={customColors.accentTextColor}
                          onChange={(val) => handleUpdateCustomColor("accentTextColor", val)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Quick Starter Base Clone Options */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-600 font-medium">
                      Start customizing by cloning a built-in theme:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {(["slate", "midnight", "light", "nordic"] as IdeTheme[]).map((tKey) => (
                        <button
                          key={tKey}
                          type="button"
                          onClick={() => handleCloneFromTheme(tKey)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-[11px] shadow-2xs hover:bg-slate-100 transition cursor-pointer"
                        >
                          Clone {THEME_PREVIEW_MAP[tKey].name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Studio Accent Color */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Studio Accent Color</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Colors used for builder buttons, active tab indicators, and selection rings.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
                    {(Object.keys(ACCENT_COLOR_MAP) as IdeAccentColor[]).map((accentKey) => {
                      const acc = ACCENT_COLOR_MAP[accentKey];
                      const isSelected = settings.accentColor === accentKey;
                      return (
                        <button
                          key={accentKey}
                          type="button"
                          onClick={() => handleUpdate({ accentColor: accentKey })}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition ${
                            isSelected
                              ? "border-slate-900 bg-slate-50 text-slate-900 shadow-2xs font-bold ring-2 ring-slate-900/10"
                              : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full shadow-2xs shrink-0 flex items-center justify-center text-white"
                            style={{
                              backgroundColor:
                                accentKey === "custom" ? customColors.accentColor : acc.hex,
                            }}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </span>
                          <span className="truncate">{acc.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* UI Density */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-violet-600" />
                    <span>Interface Density & Spacing</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Control the padding and compactness of sidebars, rails, and panels.
                  </p>

                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {(
                      [
                        { id: "compact", label: "Compact", desc: "Dense info layout" },
                        { id: "comfortable", label: "Comfortable", desc: "Default balanced" },
                        { id: "spacious", label: "Spacious", desc: "Touch-friendly" },
                      ] as { id: IdeDensity; label: string; desc: string }[]
                    ).map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleUpdate({ density: d.id })}
                        className={`p-3 rounded-xl border text-left transition ${
                          settings.density === d.id
                            ? "border-blue-600 bg-blue-50/30 text-blue-950 font-bold shadow-2xs"
                            : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                        }`}
                      >
                        <div className="text-xs font-bold">{d.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{d.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Studio UI Font */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Type className="w-4 h-4 text-slate-700" />
                    <span>Studio Font Family</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Typography used for the builder IDE menus, inspector, and headers.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3">
                    {(
                      [
                        { id: "system", label: "System Default", font: "System UI" },
                        { id: "plus-jakarta", label: "Plus Jakarta Sans", font: "Plus Jakarta Sans" },
                        { id: "inter", label: "Inter", font: "Inter" },
                        { id: "jetbrains", label: "JetBrains Mono", font: "JetBrains Mono" },
                        { id: "outfit", label: "Outfit", font: "Outfit" },
                      ] as { id: IdeFont; label: string; font: string }[]
                    ).map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleUpdate({ uiFont: f.id })}
                        className={`p-2.5 rounded-xl border text-left transition text-xs ${
                          settings.uiFont === f.id
                            ? "border-blue-600 bg-blue-50/30 text-blue-950 font-bold shadow-2xs"
                            : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                        }`}
                      >
                        <div className="font-semibold">{f.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">The quick brown fox</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Canvas Background Wallpaper */}
                <div className="pt-4 border-t" style={{ borderColor: "var(--ide-border)" }}>
                  <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--ide-text)" }}>
                    <Grid className="w-4 h-4 text-emerald-400" />
                    <span>Canvas Workspace Wallpaper</span>
                  </h4>
                  <p className="text-xs mt-0.5" style={{ color: "var(--ide-text-muted)" }}>
                    Background pattern behind the interactive Android device frame.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3">
                    {(
                      [
                        { id: "dots", label: "Dot Matrix", desc: "Classic studio dots" },
                        { id: "blueprint", label: "Blueprint Grid", desc: "Engineering CAD grid" },
                        { id: "solid", label: "Minimal Solid", desc: "Clean flat backdrop" },
                        { id: "dark-grid", label: "Dark Tech Mesh", desc: "Obsidian dark grid" },
                        { id: "isometric", label: "3D Isometric", desc: "Perspective CAD grid" },
                        { id: "circuit", label: "Cyber Circuit", desc: "Technical cyber pattern" },
                        { id: "gradient", label: "Studio Glow", desc: "Ambient radial glow" },
                        { id: "crosshatch", label: "Architect Cross", desc: "Diagonal crosshatch" },
                        { id: "hexagon", label: "Honeycomb Matrix", desc: "Tech hex matrix" },
                      ] as { id: CanvasBgStyle; label: string; desc: string }[]
                    ).map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleUpdate({ canvasBackground: b.id })}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          settings.canvasBackground === b.id
                            ? "border-emerald-500 font-bold shadow-2xs ring-1 ring-emerald-500/30"
                            : "hover:opacity-90"
                        }`}
                        style={
                          settings.canvasBackground === b.id
                            ? { backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }
                            : { backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text-muted)" }
                        }
                      >
                        <div className="text-xs font-bold" style={{ color: "var(--ide-text)" }}>{b.label}</div>
                        <div className="text-[10px]" style={{ color: "var(--ide-text-muted)" }}>{b.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: Canvas & Visual Editor */}
            {activeSection === "canvas" && (
              <div className="space-y-6 animate-in fade-in duration-100">
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--ide-text)" }}>
                    <Grid className="w-4 h-4 text-emerald-400" />
                    <span>Grid & Snapping</span>
                  </h4>
                  <p className="text-xs mt-0.5" style={{ color: "var(--ide-text-muted)" }}>
                    Configure visual canvas alignment snapping for Android components.
                  </p>

                  <div className="space-y-3 mt-3">
                    {/* Snap to Grid Switch */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl border" style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)" }}>
                      <div>
                        <div className="text-xs font-bold" style={{ color: "var(--ide-text)" }}>Snap to Material Grid</div>
                        <div className="text-[11px]" style={{ color: "var(--ide-text-muted)" }}>
                          Automatically snaps dropped components to 8dp/16dp grid baselines
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.snapToGrid}
                          onChange={(e) => handleUpdate({ snapToGrid: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5.5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    {/* Grid Size Selection */}
                    {settings.snapToGrid && (
                      <div className="p-3.5 rounded-xl border flex items-center justify-between" style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)" }}>
                        <div>
                          <div className="text-xs font-bold" style={{ color: "var(--ide-text)" }}>Grid Unit Size</div>
                          <div className="text-[11px]" style={{ color: "var(--ide-text-muted)" }}>
                            Android 8-point spatial system
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {([8, 16, 24] as (8 | 16 | 24)[]).map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => handleUpdate({ gridSize: sz })}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                settings.gridSize === sz
                                  ? "bg-emerald-600 text-white shadow-2xs font-bold"
                                  : "hover:opacity-90"
                              }`}
                              style={
                                settings.gridSize !== sz
                                  ? { backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }
                                  : {}
                              }
                            >
                              {sz} dp
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Component Outlines & Guides */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span>Inspection & Boundary Guides</span>
                  </h4>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Show Component Outlines
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Draw subtle boundary borders around layout containers and widgets
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showComponentOutlines}
                        onChange={(e) =>
                          handleUpdate({ showComponentOutlines: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Smart Alignment Crosshairs
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Show alignment indicator lines when dragging components into centers
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.smartAlignmentGuides}
                        onChange={(e) =>
                          handleUpdate({ smartAlignmentGuides: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        48dp Touch Target Indicators
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Visually highlights buttons that meet Google Material accessibility criteria
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.touchTargetIndicators}
                        onChange={(e) =>
                          handleUpdate({ touchTargetIndicators: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2.5: Logic Blocks & Flow Animations */}
            {activeSection === "logic" && (
              <div className="space-y-6 animate-in fade-in duration-100">
                {/* 1. Connection Line Animation Effects */}
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--ide-text)" }}>
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Logic Connection Line Animations</span>
                  </h4>
                  <p className="text-xs mt-0.5" style={{ color: "var(--ide-text-muted)" }}>
                    Dynamic movement and particle effects along logic flow connection wires.
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 mt-3">
                    {(
                      [
                        { id: "animated-dots", label: "Moving Dot Matrix", desc: "Dots move along connection wires" },
                        { id: "flowing-pulse", label: "Flowing Pulse Line", desc: "Pulsing dash flow between nodes" },
                        { id: "dashed-glow", label: "Glowing Cyber Dash", desc: "High-contrast glowing wire animation" },
                        { id: "solid", label: "Solid Cable", desc: "Clean static connection lines" },
                      ] as { id: FlowLineAnimation; label: string; desc: string }[]
                    ).map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => handleUpdate({ flowLineAnimation: a.id })}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                          settings.flowLineAnimation === a.id
                            ? "border-amber-500 font-bold shadow-2xs ring-1 ring-amber-500/30"
                            : "hover:opacity-90"
                        }`}
                        style={
                          settings.flowLineAnimation === a.id
                            ? { backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }
                            : { backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text-muted)" }
                        }
                      >
                        <div className="text-xs font-bold flex items-center justify-between" style={{ color: "var(--ide-text)" }}>
                          <span>{a.label}</span>
                          {settings.flowLineAnimation === a.id && (
                            <Check className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: "var(--ide-text-muted)" }}>{a.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Connection Line Color Scheme */}
                <div className="pt-4 border-t" style={{ borderColor: "var(--ide-border)" }}>
                  <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--ide-text)" }}>
                    <Palette className="w-4 h-4 text-violet-400" />
                    <span>Connection Line Color & Glow</span>
                  </h4>
                  <p className="text-xs mt-0.5" style={{ color: "var(--ide-text-muted)" }}>
                    Color theme for connecting wires, event arrows, and active flow paths.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3">
                    {(
                      [
                        { id: "violet", label: "Neon Violet", hex: "#8B5CF6" },
                        { id: "cyan", label: "Electric Cyan", hex: "#06B6D4" },
                        { id: "emerald", label: "Cyber Emerald", hex: "#10B981" },
                        { id: "amber", label: "Amber Gold", hex: "#F59E0B" },
                        { id: "rose", label: "Crimson Red", hex: "#F43F5E" },
                        { id: "neon-blue", label: "Ice Blue", hex: "#38BDF8" },
                      ] as { id: FlowLineColor; label: string; hex: string }[]
                    ).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleUpdate({ flowLineColor: c.id })}
                        className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                          settings.flowLineColor === c.id
                            ? "font-bold shadow-2xs ring-1"
                            : "hover:opacity-90"
                        }`}
                        style={{
                          backgroundColor: "var(--ide-card-inner-bg)",
                          borderColor: settings.flowLineColor === c.id ? c.hex : "var(--ide-border)",
                          color: "var(--ide-text)",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full shadow-xs shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="text-xs font-semibold">{c.label}</span>
                        </div>
                        {settings.flowLineColor === c.id && (
                          <Check className="w-3.5 h-3.5" style={{ color: c.hex }} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Connection Line Routing Geometry */}
                <div className="pt-4 border-t" style={{ borderColor: "var(--ide-border)" }}>
                  <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--ide-text)" }}>
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Connection Line Style & Routing</span>
                  </h4>
                  <p className="text-xs mt-0.5" style={{ color: "var(--ide-text-muted)" }}>
                    Wire routing algorithm for connecting triggers, conditions, and actions.
                  </p>

                  <div className="grid grid-cols-3 gap-2.5 mt-3">
                    {(
                      [
                        { id: "bezier", label: "Smooth Bezier", desc: "Curved fluid wires" },
                        { id: "step", label: "Step Orthogonal", desc: "90° circuit trace lines" },
                        { id: "straight", label: "Straight Line", desc: "Direct pin connection" },
                      ] as { id: FlowLineStyle; label: string; desc: string }[]
                    ).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleUpdate({ flowLineStyle: s.id })}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          settings.flowLineStyle === s.id
                            ? "border-emerald-500 font-bold shadow-2xs ring-1 ring-emerald-500/30"
                            : "hover:opacity-90"
                        }`}
                        style={
                          settings.flowLineStyle === s.id
                            ? { backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }
                            : { backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text-muted)" }
                        }
                      >
                        <div className="text-xs font-bold" style={{ color: "var(--ide-text)" }}>{s.label}</div>
                        <div className="text-[10px]" style={{ color: "var(--ide-text-muted)" }}>{s.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Logic Node & Note Block Glow Effect */}
                <div className="pt-4 border-t" style={{ borderColor: "var(--ide-border)" }}>
                  <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--ide-text)" }}>
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Logic Node & Note Block Color Effect</span>
                  </h4>
                  <p className="text-xs mt-0.5" style={{ color: "var(--ide-text-muted)" }}>
                    Visual depth, halos, and glow outlines on Trigger, Action, and Note cards.
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 mt-3">
                    {(
                      [
                        { id: "neon-glow", label: "Neon Border Glow", desc: "Vibrant glowing border halos" },
                        { id: "glassmorphism", label: "Glassmorphism Glow", desc: "Frosted backdrop with soft glow" },
                        { id: "subtle-shadow", label: "Soft Floating Elevation", desc: "Clean ambient drop shadows" },
                        { id: "flat", label: "Studio Flat", desc: "Minimalist borders without glow" },
                      ] as { id: NodeGlowEffect; label: string; desc: string }[]
                    ).map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleUpdate({ nodeGlowEffect: g.id })}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                          settings.nodeGlowEffect === g.id
                            ? "border-indigo-500 font-bold shadow-2xs ring-1 ring-indigo-500/30"
                            : "hover:opacity-90"
                        }`}
                        style={
                          settings.nodeGlowEffect === g.id
                            ? { backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }
                            : { backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text-muted)" }
                        }
                      >
                        <div className="text-xs font-bold" style={{ color: "var(--ide-text)" }}>{g.label}</div>
                        <div className="text-[10px] mt-0.5" style={{ color: "var(--ide-text-muted)" }}>{g.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Execution Pulse Toggle */}
                <div className="pt-4 border-t" style={{ borderColor: "var(--ide-border)" }}>
                  <div className="flex items-center justify-between p-3.5 rounded-xl border" style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)" }}>
                    <div>
                      <div className="text-xs font-bold" style={{ color: "var(--ide-text)" }}>
                        Show Execution Pulse Animation
                      </div>
                      <div className="text-[11px]" style={{ color: "var(--ide-text-muted)" }}>
                        Pulse lighting along active flow lines during real-time event simulation
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showNodeExecutionPulse}
                        onChange={(e) =>
                          handleUpdate({ showNodeExecutionPulse: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: Code Studio & Syntax */}
            {activeSection === "code" && (
              <div className="space-y-6 animate-in fade-in duration-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-blue-600" />
                    <span>Code Editor Theme</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select the syntax highlighting theme for Kotlin, Jetpack Compose, and XML.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3">
                    {(
                      [
                        { id: "vs-dark", label: "VS Dark Pro", bg: "#1E1E1E" },
                        { id: "monokai", label: "Monokai Pro", bg: "#272822" },
                        { id: "github-dark", label: "GitHub Dark", bg: "#0D1117" },
                        { id: "github-light", label: "GitHub Light", bg: "#FFFFFF" },
                        { id: "dracula", label: "Dracula", bg: "#282A36" },
                      ] as { id: CodeEditorTheme; label: string; bg: string }[]
                    ).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleUpdate({ codeEditorTheme: c.id })}
                        className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                          settings.codeEditorTheme === c.id
                            ? "border-blue-600 bg-blue-50/30 text-blue-950 font-bold shadow-2xs"
                            : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                        }`}
                      >
                        <div className="text-xs font-semibold">{c.label}</div>
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: c.bg }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size & Indentation */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Type className="w-4 h-4 text-slate-700" />
                    <span>Editor Formatting</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900">Font Size</div>
                        <div className="text-[11px] text-slate-500">Monospace editor size</div>
                      </div>
                      <select
                        value={settings.codeFontSize}
                        onChange={(e) =>
                          handleUpdate({ codeFontSize: parseInt(e.target.value) || 13 })
                        }
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800"
                      >
                        <option value={12}>12 px</option>
                        <option value={13}>13 px</option>
                        <option value={14}>14 px</option>
                        <option value={16}>16 px</option>
                      </select>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900">Tab Indentation</div>
                        <div className="text-[11px] text-slate-500">Spaces per indent level</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {([2, 4] as (2 | 4)[]).map((tab) => (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => handleUpdate({ codeTabSize: tab })}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                              settings.codeTabSize === tab
                                ? "bg-blue-600 text-white shadow-2xs"
                                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {tab} spaces
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Line Numbers, Wrap, Minimap toggles */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                      <span className="font-semibold text-slate-800">Show Line Numbers</span>
                      <input
                        type="checkbox"
                        checked={settings.codeLineNumbers}
                        onChange={(e) => handleUpdate({ codeLineNumbers: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                      <span className="font-semibold text-slate-800">Word Wrapping</span>
                      <input
                        type="checkbox"
                        checked={settings.codeWordWrap}
                        onChange={(e) => handleUpdate({ codeWordWrap: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4: Workflow & Feedback */}
            {activeSection === "workflow" && (
              <div className="space-y-6 animate-in fade-in duration-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-violet-600" />
                    <span>Sound & Interaction Feedback</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Subtle audio cues when interacting with components, toggles, and buttons.
                  </p>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 mt-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
                        {settings.soundEffects ? (
                          <Volume2 className="w-4 h-4" />
                        ) : (
                          <VolumeX className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">IDE Sound Feedback</div>
                        <div className="text-[11px] text-slate-500">
                          Play gentle clicks during drag-and-drop & tool switching
                        </div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.soundEffects}
                        onChange={(e) => handleUpdate({ soundEffects: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* Auto-Save */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Auto-Save Interval</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    How frequently DroidForge Studio writes changes to your local browser storage.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
                    {(
                      [
                        { id: "instant", label: "Realtime", desc: "Every keystroke" },
                        { id: "30s", label: "Every 30s", desc: "Periodic buffer" },
                        { id: "60s", label: "Every 1m", desc: "Low disk activity" },
                        { id: "manual", label: "Manual", desc: "Save manually" },
                      ] as { id: AutoSaveInterval; label: string; desc: string }[]
                    ).map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => handleUpdate({ autoSaveInterval: a.id })}
                        className={`p-2.5 rounded-xl border text-left transition ${
                          settings.autoSaveInterval === a.id
                            ? "border-blue-600 bg-blue-50/30 text-blue-950 font-bold shadow-2xs"
                            : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                        }`}
                      >
                        <div className="text-xs font-bold">{a.label}</div>
                        <div className="text-[10px] text-slate-500">{a.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset to Factory Defaults */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-rose-900">
                        Reset Studio Preferences
                      </div>
                      <div className="text-[11px] text-rose-700">
                        Revert all Builder IDE settings to factory defaults. Your Android projects
                        will not be affected.
                      </div>
                    </div>

                    {!showResetConfirm ? (
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm(true)}
                        className="px-3.5 py-1.5 bg-white border border-rose-300 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition shrink-0 shadow-2xs flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Defaults</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onResetSettings();
                            setShowResetConfirm(false);
                          }}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                        >
                          Confirm Reset
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowResetConfirm(false)}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between" style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)" }}>
          <div className="text-xs flex items-center gap-1.5" style={{ color: "var(--ide-text-muted)" }}>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Settings saved automatically to local storage</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
            style={{ backgroundColor: currentAccent.hex }}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
