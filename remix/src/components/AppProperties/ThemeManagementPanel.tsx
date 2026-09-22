import React, { useState } from "react";
import {
  Palette,
  Type,
  Square,
  Sparkles,
  Sun,
  Moon,
  RotateCcw,
  Check,
  Copy,
  Sliders,
  Eye,
  Smartphone,
  Layers,
  ChevronDown,
  Info,
  CheckCircle2,
  Wand2,
  Plus,
  Heart,
  Send,
  Bell,
  Search,
  Settings,
} from "lucide-react";
import {
  ProjectConfig,
  Material3Theme,
  Material3ColorScheme,
  Material3TypographyConfig,
  Material3ShapeConfig,
} from "../../types";
import {
  DEFAULT_M3_THEME,
  PRESET_THEMES,
  SHAPE_PRESETS,
  FONT_OPTIONS,
  generateM3FromPrimaryHex,
} from "../../data/defaultTheme";
import {
  generateThemeKt,
  generateColorKt,
  generateTypeKt,
  generateShapeKt,
} from "../../utils/codeGenerators";

interface ThemeManagementPanelProps {
  config: ProjectConfig;
  onUpdateConfig: (updates: Partial<ProjectConfig>) => void;
}

type ThemeSubTab = "colors" | "typography" | "shapes" | "sandbox" | "code";

export const ThemeManagementPanel: React.FC<ThemeManagementPanelProps> = ({
  config,
  onUpdateConfig,
}) => {
  const theme: Material3Theme = config.theme || DEFAULT_M3_THEME;
  const [activeSubTab, setActiveSubTab] = useState<ThemeSubTab>("colors");
  const [activeColorMode, setActiveColorMode] = useState<"light" | "dark">("light");
  const [selectedCodeFile, setSelectedCodeFile] = useState<"Theme.kt" | "Color.kt" | "Type.kt" | "Shape.kt">("Theme.kt");
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Interactive sandbox states
  const [sandboxSwitch, setSandboxSwitch] = useState(true);
  const [sandboxCheckbox, setSandboxCheckbox] = useState(true);
  const [sandboxRadio, setSandboxRadio] = useState("option1");
  const [sandboxSlider, setSandboxSlider] = useState(65);
  const [sandboxChip, setSandboxChip] = useState("featured");

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const updateTheme = (updates: Partial<Material3Theme>) => {
    const updatedTheme: Material3Theme = {
      ...theme,
      ...updates,
    };
    onUpdateConfig({ theme: updatedTheme });
  };

  const updateColorScheme = (
    mode: "light" | "dark",
    key: keyof Material3ColorScheme,
    value: string
  ) => {
    const target = mode === "light" ? { ...theme.lightColors } : { ...theme.darkColors };
    target[key] = value;
    if (mode === "light") {
      updateTheme({ lightColors: target });
    } else {
      updateTheme({ darkColors: target });
    }
  };

  const applyPresetTheme = (presetId: string) => {
    const found = PRESET_THEMES.find((p) => p.id === presetId);
    if (!found) return;
    updateTheme({
      lightColors: found.lightColors,
      darkColors: found.darkColors,
    });
    showNotification(`Applied preset "${found.name}"`);
  };

  const applyAutoTonalPalette = () => {
    const currentPrimary =
      activeColorMode === "light" ? theme.lightColors.primary : theme.darkColors.primary;
    const generated = generateM3FromPrimaryHex(currentPrimary);
    updateTheme({
      lightColors: generated.light,
      darkColors: generated.dark,
    });
    showNotification(`Generated full Material 3 tonal palette from ${currentPrimary}`);
  };

  const applyShapePreset = (index: number) => {
    const preset = SHAPE_PRESETS[index];
    if (!preset) return;
    const updatedShapes: Material3ShapeConfig = {
      cornerStyle: preset.cornerStyle,
      extraSmall: preset.extraSmall,
      small: preset.small,
      medium: preset.medium,
      large: preset.large,
      extraLarge: preset.extraLarge,
    };
    updateTheme({ shapes: updatedShapes });
    showNotification(`Applied shape preset: ${preset.name}`);
  };

  const currentColors = activeColorMode === "light" ? theme.lightColors : theme.darkColors;

  const getCodeContent = () => {
    switch (selectedCodeFile) {
      case "Theme.kt":
        return generateThemeKt(config);
      case "Color.kt":
        return generateColorKt(config);
      case "Type.kt":
        return generateTypeKt(config);
      case "Shape.kt":
        return generateShapeKt(config);
      default:
        return "";
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto">
      {/* Toast banner */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs transition-colors shrink-0"
              style={{
                backgroundColor: theme.lightColors.primaryContainer,
                color: theme.lightColors.primary,
              }}
            >
              <Palette className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Material 3 Global Theme</h2>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase"
                  style={{
                    backgroundColor: theme.lightColors.secondaryContainer,
                    color: theme.lightColors.onSecondaryContainer,
                  }}
                >
                  Compose M3 v1.3
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Define global dynamic color palettes, Google Font typography scales, and shape tokens.
                Changes propagate instantaneously across the Visual Canvas and export clean Jetpack Compose code.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Color Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setActiveColorMode("light")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                  activeColorMode === "light"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                onClick={() => setActiveColorMode("dark")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                  activeColorMode === "dark"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dark</span>
              </button>
            </div>

            {/* Reset to Default */}
            <button
              onClick={() => {
                onUpdateConfig({ theme: DEFAULT_M3_THEME });
                showNotification("Reset theme to official Material 3 baseline");
              }}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl transition flex items-center gap-1.5 font-medium"
              title="Reset all tokens to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Bar */}
        <div className="max-w-6xl mx-auto flex items-center gap-1 mt-5 border-t border-slate-100 pt-4 overflow-x-auto">
          {[
            { id: "colors", label: "Color Tokens & Palettes", icon: Palette },
            { id: "typography", label: "Typography & Fonts", icon: Type },
            { id: "shapes", label: "Shapes & Corner Radii", icon: Square },
            { id: "sandbox", label: "Interactive Component Sandbox", icon: Eye },
            { id: "code", label: "Kotlin Compose Output", icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as ThemeSubTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? "bg-violet-50 text-violet-700 border border-violet-200/80"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-violet-600" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        {/* TAB 1: COLORS */}
        {activeSubTab === "colors" && (
          <div className="space-y-6">
            {/* Quick Preset Cards */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Curated Material 3 Palettes</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any curated palette to instantly apply calculated harmonic tonal colors.
                  </p>
                </div>
                <button
                  onClick={applyAutoTonalPalette}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-xs transition flex items-center gap-2 shrink-0"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Generate Full Palette from Primary</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {PRESET_THEMES.map((preset) => {
                  const isSelected =
                    theme.lightColors.primary.toLowerCase() === preset.primary.toLowerCase();
                  return (
                    <button
                      key={preset.id}
                      onClick={() => applyPresetTheme(preset.id)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between h-28 relative overflow-hidden group ${
                        isSelected
                          ? "border-violet-600 bg-violet-50/50 ring-2 ring-violet-500/20 shadow-xs"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {preset.name}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Swatches strip */}
                      <div className="flex items-center gap-1.5 mt-auto pt-2">
                        <div
                          className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: preset.primary }}
                          title={`Primary: ${preset.primary}`}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-black/10"
                          style={{ backgroundColor: preset.secondary }}
                          title={`Secondary: ${preset.secondary}`}
                        />
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-black/10"
                          style={{ backgroundColor: preset.tertiary }}
                          title={`Tertiary: ${preset.tertiary}`}
                        />
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-black/10"
                          style={{ backgroundColor: preset.surface }}
                          title={`Surface: ${preset.surface}`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Color & System Options */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Material You Dynamic Color (Android 12+)</h4>
                  <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                    When running on Android 12 through Android 15, dynamically extract wallpaper accent colors using the Android system ColorScheme API. Falls back automatically to your configured theme tokens below.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={theme.useDynamicColor}
                  onChange={(e) => updateTheme({ useDynamicColor: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>

            {/* Detailed Color Scheme Editor */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>{activeColorMode === "light" ? "Light Color Scheme" : "Dark Color Scheme"}</span>
                    <span className="text-xs font-normal text-slate-400">
                      (Editing {activeColorMode} mode tokens)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any color swatch to pick a color or type the 6-digit hex code directly.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Switch view:</span>
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                    <button
                      onClick={() => setActiveColorMode("light")}
                      className={`px-2.5 py-1 rounded-md font-medium transition ${
                        activeColorMode === "light" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => setActiveColorMode("dark")}
                      className={`px-2.5 py-1 rounded-md font-medium transition ${
                        activeColorMode === "dark" ? "bg-slate-900 text-white shadow-xs" : "text-slate-500"
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid of Color Tokens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  {
                    key: "primary",
                    label: "Primary",
                    desc: "Key brand color, filled buttons, active indicators",
                  },
                  {
                    key: "onPrimary",
                    label: "On Primary",
                    desc: "Text and icon color sitting on top of primary",
                  },
                  {
                    key: "primaryContainer",
                    label: "Primary Container",
                    desc: "Tonal container background for prominent components",
                  },
                  {
                    key: "onPrimaryContainer",
                    label: "On Primary Container",
                    desc: "Text & elements inside primary container",
                  },
                  {
                    key: "secondary",
                    label: "Secondary",
                    desc: "Less prominent components, filter chips, badges",
                  },
                  {
                    key: "secondaryContainer",
                    label: "Secondary Container",
                    desc: "Tonal button backgrounds, navigation bar pills",
                  },
                  {
                    key: "tertiary",
                    label: "Tertiary",
                    desc: "Contrasting accents, input validation highlights",
                  },
                  {
                    key: "tertiaryContainer",
                    label: "Tertiary Container",
                    desc: "Alternative containers for distinct visual grouping",
                  },
                  {
                    key: "surface",
                    label: "Surface",
                    desc: "Card containers, sheets, dialog backgrounds",
                  },
                  {
                    key: "onSurface",
                    label: "On Surface",
                    desc: "Primary body text, headers, and foreground icons",
                  },
                  {
                    key: "surfaceVariant",
                    label: "Surface Variant",
                    desc: "Input outlines, divider fills, assist chips",
                  },
                  {
                    key: "onSurfaceVariant",
                    label: "On Surface Variant",
                    desc: "Secondary body text, placeholder text, hints",
                  },
                  {
                    key: "background",
                    label: "Background",
                    desc: "Base background behind scrollable screen content",
                  },
                  {
                    key: "outline",
                    label: "Outline",
                    desc: "Borders for cards, outlined buttons, textfields",
                  },
                  {
                    key: "error",
                    label: "Error",
                    desc: "Destructive actions, error badges, invalid input",
                  },
                ].map((token) => {
                  const val = currentColors[token.key as keyof Material3ColorScheme];
                  return (
                    <div
                      key={token.key}
                      className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition shadow-xs flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-slate-800">{token.label}</span>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            {token.desc}
                          </p>
                        </div>
                        <div
                          className="w-7 h-7 rounded-lg border border-black/10 shadow-xs shrink-0"
                          style={{ backgroundColor: val }}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Hidden Native Color Picker triggered by button */}
                        <div className="relative">
                          <input
                            type="color"
                            value={val.startsWith("#") ? val : "#000000"}
                            onChange={(e) =>
                              updateColorScheme(
                                activeColorMode,
                                token.key as keyof Material3ColorScheme,
                                e.target.value.toUpperCase()
                              )
                            }
                            className="w-7 h-7 rounded-md cursor-pointer border border-slate-300 opacity-0 absolute inset-0"
                          />
                          <div
                            className="w-7 h-7 rounded-md border border-slate-300 cursor-pointer flex items-center justify-center text-xs shadow-xs"
                            style={{ backgroundColor: val }}
                          />
                        </div>

                        {/* Hex text input */}
                        <input
                          type="text"
                          value={val}
                          onChange={(e) =>
                            updateColorScheme(
                              activeColorMode,
                              token.key as keyof Material3ColorScheme,
                              e.target.value
                            )
                          }
                          className="flex-1 font-mono text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 uppercase focus:bg-white focus:outline-none focus:border-violet-500"
                          maxLength={7}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TYPOGRAPHY */}
        {activeSubTab === "typography" && (
          <div className="space-y-6">
            {/* Base Font Family Selector */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900">Global Font Family</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select the primary typeface rendered throughout all Jetpack Compose screens and preview components.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {FONT_OPTIONS.map((font) => {
                  const isSelected = theme.typography.baseFontFamily === font.name;
                  return (
                    <button
                      key={font.name}
                      onClick={() => {
                        const updatedTypography: Material3TypographyConfig = {
                          ...theme.typography,
                          baseFontFamily: font.name,
                          displayLarge: { ...theme.typography.displayLarge, fontFamily: font.name },
                          headlineMedium: { ...theme.typography.headlineMedium, fontFamily: font.name },
                          titleLarge: { ...theme.typography.titleLarge, fontFamily: font.name },
                          titleMedium: { ...theme.typography.titleMedium, fontFamily: font.name },
                          bodyLarge: { ...theme.typography.bodyLarge, fontFamily: font.name },
                          bodyMedium: { ...theme.typography.bodyMedium, fontFamily: font.name },
                          labelLarge: { ...theme.typography.labelLarge, fontFamily: font.name },
                          labelMedium: { ...theme.typography.labelMedium, fontFamily: font.name },
                        };
                        updateTheme({ typography: updatedTypography });
                        showNotification(`Set global font to "${font.name}"`);
                      }}
                      className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? "border-violet-600 bg-violet-50/50 ring-2 ring-violet-500/20"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className="text-base font-bold text-slate-900"
                          style={{ fontFamily: font.name }}
                        >
                          {font.name}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{font.category}</p>
                      <p className="text-xs text-slate-600 mt-2 font-normal line-clamp-1" style={{ fontFamily: font.name }}>
                        The quick brown fox jumps over 123
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Typography Scale Editor */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-900">Material 3 Type Scale Tokens</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fine-tune font size (sp) and weight across the standard Material 3 hierarchy.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: "displayLarge",
                    name: "Display Large",
                    token: theme.typography.displayLarge,
                    sample: "Display 57sp",
                    desc: "Hero banners, splash headers",
                  },
                  {
                    key: "headlineMedium",
                    name: "Headline Medium",
                    token: theme.typography.headlineMedium,
                    sample: "Headline Medium 28sp",
                    desc: "Top page titles and screen intros",
                  },
                  {
                    key: "titleLarge",
                    name: "Title Large",
                    token: theme.typography.titleLarge,
                    sample: "Title Large 22sp",
                    desc: "TopAppBar headers, dialog titles",
                  },
                  {
                    key: "bodyLarge",
                    name: "Body Large",
                    token: theme.typography.bodyLarge,
                    sample: "Body Large 16sp - Readable article and card descriptions",
                    desc: "Primary body text in cards and lists",
                  },
                  {
                    key: "bodyMedium",
                    name: "Body Medium",
                    token: theme.typography.bodyMedium,
                    sample: "Body Medium 14sp - Secondary metadata and captions",
                    desc: "Standard form labels and subtitles",
                  },
                  {
                    key: "labelLarge",
                    name: "Label Large (Buttons)",
                    token: theme.typography.labelLarge,
                    sample: "Button Action 14sp Medium",
                    desc: "Text inside buttons, action chips, and tabs",
                  },
                ].map((item) => {
                  return (
                    <div
                      key={item.key}
                      className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="md:w-1/3">
                        <span className="text-xs font-bold text-slate-800">{item.name}</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                      </div>

                      {/* Live text specimen */}
                      <div className="md:w-1/3 overflow-hidden">
                        <span
                          className="text-slate-900 block truncate"
                          style={{
                            fontFamily: theme.typography.baseFontFamily,
                            fontSize: `${item.token.fontSize}px`,
                            fontWeight:
                              item.token.fontWeight === "bold"
                                ? 700
                                : item.token.fontWeight === "semibold"
                                ? 600
                                : item.token.fontWeight === "medium"
                                ? 500
                                : 400,
                          }}
                        >
                          {item.sample}
                        </span>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-3 md:w-1/3 justify-end">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono text-slate-500">Size:</span>
                          <input
                            type="number"
                            min={10}
                            max={72}
                            value={item.token.fontSize}
                            onChange={(e) => {
                              const size = parseInt(e.target.value) || item.token.fontSize;
                              const updated = { ...theme.typography };
                              (updated as any)[item.key] = {
                                ...(updated as any)[item.key],
                                fontSize: size,
                              };
                              updateTheme({ typography: updated });
                            }}
                            className="w-14 text-xs font-mono px-2 py-1 bg-white border border-slate-200 rounded-lg text-center"
                          />
                          <span className="text-xs text-slate-400">sp</span>
                        </div>

                        <select
                          value={item.token.fontWeight}
                          onChange={(e) => {
                            const updated = { ...theme.typography };
                            (updated as any)[item.key] = {
                              ...(updated as any)[item.key],
                              fontWeight: e.target.value as any,
                            };
                            updateTheme({ typography: updated });
                          }}
                          className="text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium"
                        >
                          <option value="normal">Regular (400)</option>
                          <option value="medium">Medium (500)</option>
                          <option value="semibold">Semi-Bold (600)</option>
                          <option value="bold">Bold (700)</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SHAPES */}
        {activeSubTab === "shapes" && (
          <div className="space-y-6">
            {/* Shape Archetype Presets */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900">Shape Archetype Presets</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a predefined corner radius profile or fine-tune individual scale steps below.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {SHAPE_PRESETS.map((preset, idx) => {
                  const isMatch =
                    theme.shapes.medium === preset.medium &&
                    theme.shapes.large === preset.large;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => applyShapePreset(idx)}
                      className={`p-4 rounded-xl border text-left transition flex flex-col justify-between h-32 ${
                        isMatch
                          ? "border-violet-600 bg-violet-50/50 ring-2 ring-violet-500/20"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-slate-800">{preset.name}</span>
                        {isMatch && (
                          <div className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{preset.description}</p>
                      {/* Visual corner shape specimen */}
                      <div className="flex items-center gap-2 mt-auto pt-2">
                        <div
                          className="w-10 h-6 border-2 border-violet-500 bg-violet-100"
                          style={{
                            borderRadius: `${Math.min(preset.medium, 12)}px`,
                          }}
                        />
                        <div
                          className="w-8 h-6 border-2 border-violet-500 bg-violet-100"
                          style={{
                            borderRadius: `${Math.min(preset.large, 14)}px`,
                          }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shape Scale Slider Tokens */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-900">Corner Radius Scale (dp)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Material 3 organizes components into a 5-step shape scale. Adjusting these values propagates across all respective components on your canvas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  {
                    key: "extraSmall",
                    name: "Extra Small",
                    val: theme.shapes.extraSmall,
                    desc: "Autocomplete dropdowns, small snackbars, text field chips",
                    max: 16,
                  },
                  {
                    key: "small",
                    name: "Small",
                    val: theme.shapes.small,
                    desc: "Filter chips, assist chips, text input corners",
                    max: 24,
                  },
                  {
                    key: "medium",
                    name: "Medium",
                    val: theme.shapes.medium,
                    desc: "Cards, dialog boxes, elevated containers",
                    max: 32,
                  },
                  {
                    key: "large",
                    name: "Large",
                    val: theme.shapes.large,
                    desc: "Floating Action Buttons (FAB), bottom sheets, navigation drawers",
                    max: 48,
                  },
                  {
                    key: "extraLarge",
                    name: "Extra Large",
                    val: theme.shapes.extraLarge,
                    desc: "Search bars, pill action buttons, large badges",
                    max: 60,
                  },
                ].map((s) => {
                  return (
                    <div
                      key={s.key}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-800">{s.name}</span>
                          <p className="text-[11px] text-slate-400 mt-0.5">{s.desc}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-md">
                            {s.val} dp
                          </span>
                          {/* Live preview box */}
                          <div
                            className="w-9 h-9 border-2 border-violet-600 bg-white shadow-xs shrink-0"
                            style={{
                              borderRadius: `${Math.min(s.val, 18)}px`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={0}
                          max={s.max}
                          value={s.val}
                          onChange={(e) => {
                            const newRadius = parseInt(e.target.value) || 0;
                            const updated = { ...theme.shapes, [s.key]: newRadius };
                            updateTheme({ shapes: updated });
                          }}
                          className="w-full accent-violet-600 cursor-pointer"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COMPONENT SANDBOX */}
        {activeSubTab === "sandbox" && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-violet-600" />
                    <span>Real-Time Material 3 Component Sandbox</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Interact directly with standard Material 3 components styled by your active colors, typography, and shape radii.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                    <button
                      onClick={() => setActiveColorMode("light")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                        activeColorMode === "light"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>Light</span>
                    </button>
                    <button
                      onClick={() => setActiveColorMode("dark")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                        activeColorMode === "dark"
                          ? "bg-slate-900 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Sandbox Card with applied theme background */}
              <div
                className="p-6 rounded-2xl border transition-all duration-200 space-y-8"
                style={{
                  backgroundColor: currentColors.background,
                  borderColor: currentColors.outlineVariant,
                  color: currentColors.onBackground,
                  fontFamily: theme.typography.baseFontFamily,
                }}
              >
                {/* 1. App Bar Preview */}
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                    Top App Bar
                  </span>
                  <div
                    className="p-3.5 flex items-center justify-between shadow-xs"
                    style={{
                      backgroundColor: currentColors.surface,
                      color: currentColors.onSurface,
                      borderRadius: `${theme.shapes.medium}px`,
                      border: `1px solid ${currentColors.surfaceVariant}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5" style={{ color: currentColors.onSurface }} />
                      <span
                        className="text-base font-bold"
                        style={{ fontFamily: theme.typography.baseFontFamily }}
                      >
                        {config.appName || "QuickForge App"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 rounded-full hover:opacity-80 transition"
                        style={{ color: currentColors.onSurface }}
                      >
                        <Search className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-full hover:opacity-80 transition"
                        style={{ color: currentColors.onSurface }}
                      >
                        <Bell className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Action Buttons (Filled, Tonal, Elevated, Outlined, Text) */}
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 block">
                    Material 3 Buttons
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Filled Button */}
                    <button
                      style={{
                        backgroundColor: currentColors.primary,
                        color: currentColors.onPrimary,
                        borderRadius: `${theme.shapes.extraLarge}px`,
                        fontSize: `${theme.typography.labelLarge.fontSize}px`,
                      }}
                      className="px-5 py-2.5 font-medium shadow-xs hover:opacity-90 active:scale-95 transition flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Filled Button</span>
                    </button>

                    {/* Tonal Button */}
                    <button
                      style={{
                        backgroundColor: currentColors.secondaryContainer,
                        color: currentColors.onSecondaryContainer,
                        borderRadius: `${theme.shapes.extraLarge}px`,
                        fontSize: `${theme.typography.labelLarge.fontSize}px`,
                      }}
                      className="px-5 py-2.5 font-medium hover:opacity-90 active:scale-95 transition flex items-center gap-2"
                    >
                      <span>Tonal Button</span>
                    </button>

                    {/* Elevated Button */}
                    <button
                      style={{
                        backgroundColor: currentColors.surface,
                        color: currentColors.primary,
                        borderRadius: `${theme.shapes.extraLarge}px`,
                        fontSize: `${theme.typography.labelLarge.fontSize}px`,
                        border: `1px solid ${currentColors.surfaceVariant}`,
                      }}
                      className="px-5 py-2.5 font-medium shadow-sm hover:opacity-90 active:scale-95 transition flex items-center gap-2"
                    >
                      <span>Elevated Button</span>
                    </button>

                    {/* Outlined Button */}
                    <button
                      style={{
                        borderColor: currentColors.outline,
                        color: currentColors.primary,
                        borderRadius: `${theme.shapes.extraLarge}px`,
                        fontSize: `${theme.typography.labelLarge.fontSize}px`,
                      }}
                      className="px-5 py-2.5 font-medium border hover:opacity-80 active:scale-95 transition flex items-center gap-2 bg-transparent"
                    >
                      <span>Outlined Button</span>
                    </button>

                    {/* Text Button */}
                    <button
                      style={{
                        color: currentColors.primary,
                        fontSize: `${theme.typography.labelLarge.fontSize}px`,
                      }}
                      className="px-4 py-2.5 font-medium hover:opacity-75 active:scale-95 transition bg-transparent"
                    >
                      <span>Text Button</span>
                    </button>
                  </div>
                </div>

                {/* 3. Floating Action Button (FAB) & Filter Chips */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                      Floating Action Button (FAB)
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        style={{
                          backgroundColor: currentColors.primaryContainer,
                          color: currentColors.onPrimaryContainer,
                          borderRadius: `${theme.shapes.large}px`,
                        }}
                        className="w-14 h-14 flex items-center justify-center shadow-md hover:opacity-90 active:scale-95 transition"
                      >
                        <Plus className="w-6 h-6 stroke-[2.5]" />
                      </button>

                      <button
                        style={{
                          backgroundColor: currentColors.tertiaryContainer,
                          color: currentColors.onTertiaryContainer,
                          borderRadius: `${theme.shapes.medium}px`,
                        }}
                        className="px-4 py-3 font-medium shadow-md hover:opacity-90 active:scale-95 transition flex items-center gap-2 text-xs"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                        <span>Extended FAB</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                      Filter Chips
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {["featured", "popular", "updates"].map((chip) => {
                        const isSelected = sandboxChip === chip;
                        return (
                          <button
                            key={chip}
                            onClick={() => setSandboxChip(chip)}
                            style={{
                              backgroundColor: isSelected
                                ? currentColors.secondaryContainer
                                : currentColors.surface,
                              color: isSelected
                                ? currentColors.onSecondaryContainer
                                : currentColors.onSurfaceVariant,
                              borderColor: isSelected
                                ? "transparent"
                                : currentColors.outlineVariant,
                              borderRadius: `${theme.shapes.small}px`,
                              fontSize: `${theme.typography.labelMedium.fontSize}px`,
                            }}
                            className="px-3.5 py-1.5 border font-medium transition flex items-center gap-1.5 capitalize"
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                            <span>{chip}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 4. Elevated Cards */}
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                    Cards (Elevated & Outlined)
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Elevated Card */}
                    <div
                      style={{
                        backgroundColor: currentColors.surface,
                        color: currentColors.onSurface,
                        borderRadius: `${theme.shapes.medium}px`,
                        border: `1px solid ${currentColors.surfaceVariant}`,
                      }}
                      className="p-5 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4
                          className="font-bold text-sm"
                          style={{ fontFamily: theme.typography.baseFontFamily }}
                        >
                          Elevated Card Token
                        </h4>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                          style={{
                            backgroundColor: currentColors.primaryContainer,
                            color: currentColors.onPrimaryContainer,
                          }}
                        >
                          M3 Active
                        </span>
                      </div>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: currentColors.onSurfaceVariant }}
                      >
                        Cards act as primary surface containers for grouping related information, actions, and media.
                      </p>
                      <div className="pt-2 flex justify-end">
                        <button
                          style={{
                            color: currentColors.primary,
                            fontSize: `${theme.typography.labelLarge.fontSize}px`,
                          }}
                          className="font-medium hover:underline text-xs"
                        >
                          Learn More →
                        </button>
                      </div>
                    </div>

                    {/* Outlined Card */}
                    <div
                      style={{
                        backgroundColor: "transparent",
                        borderColor: currentColors.outlineVariant,
                        color: currentColors.onSurface,
                        borderRadius: `${theme.shapes.medium}px`,
                      }}
                      className="p-5 border space-y-3"
                    >
                      <h4
                        className="font-bold text-sm"
                        style={{ fontFamily: theme.typography.baseFontFamily }}
                      >
                        Outlined Card Token
                      </h4>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: currentColors.onSurfaceVariant }}
                      >
                        Outlined cards have a subtle perimeter boundary and no elevation shadow.
                      </p>
                      <div className="pt-2 flex justify-end">
                        <button
                          style={{
                            backgroundColor: currentColors.primary,
                            color: currentColors.onPrimary,
                            borderRadius: `${theme.shapes.extraLarge}px`,
                            fontSize: "12px",
                          }}
                          className="px-3.5 py-1.5 font-medium shadow-xs"
                        >
                          Action
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Inputs, Switches, Checkboxes */}
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                    Form Controls & Switches
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    {/* Input Field */}
                    <div className="space-y-1.5">
                      <label
                        className="text-xs font-medium block"
                        style={{ color: currentColors.onSurface }}
                      >
                        Text Field
                      </label>
                      <input
                        type="text"
                        placeholder="Material 3 Input..."
                        defaultValue="QuickForge Studio"
                        style={{
                          backgroundColor: currentColors.surfaceVariant,
                          color: currentColors.onSurface,
                          borderColor: currentColors.outline,
                          borderRadius: `${theme.shapes.small}px`,
                        }}
                        className="w-full text-xs px-3.5 py-2.5 border focus:outline-none"
                      />
                    </div>

                    {/* Switch & Checkbox */}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setSandboxSwitch(!sandboxSwitch)}>
                        <div
                          style={{
                            backgroundColor: sandboxSwitch
                              ? currentColors.primary
                              : currentColors.surfaceVariant,
                          }}
                          className="w-11 h-6 rounded-full p-1 transition-colors relative"
                        >
                          <div
                            style={{
                              backgroundColor: sandboxSwitch
                                ? currentColors.onPrimary
                                : currentColors.outline,
                            }}
                            className={`w-4 h-4 rounded-full transition-transform ${
                              sandboxSwitch ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </div>
                        <span className="text-xs font-medium" style={{ color: currentColors.onSurface }}>
                          Switch
                        </span>
                      </div>

                      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSandboxCheckbox(!sandboxCheckbox)}>
                        <div
                          style={{
                            backgroundColor: sandboxCheckbox
                              ? currentColors.primary
                              : "transparent",
                            borderColor: sandboxCheckbox
                              ? currentColors.primary
                              : currentColors.outline,
                            borderRadius: `${theme.shapes.extraSmall}px`,
                          }}
                          className="w-5 h-5 border-2 flex items-center justify-center transition"
                        >
                          {sandboxCheckbox && (
                            <Check
                              className="w-3.5 h-3.5 stroke-[3]"
                              style={{ color: currentColors.onPrimary }}
                            />
                          )}
                        </div>
                        <span className="text-xs font-medium" style={{ color: currentColors.onSurface }}>
                          Checkbox
                        </span>
                      </div>
                    </div>

                    {/* Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span style={{ color: currentColors.onSurface }}>Volume Slider</span>
                        <span className="font-mono text-[11px]" style={{ color: currentColors.primary }}>
                          {sandboxSlider}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={sandboxSlider}
                        onChange={(e) => setSandboxSlider(parseInt(e.target.value))}
                        style={{ accentColor: currentColors.primary }}
                        className="w-full cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: KOTLIN COMPOSE CODE */}
        {activeSubTab === "code" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-violet-600" />
                  <span>Generated Jetpack Compose Theme Files</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Production-grade Kotlin code exported directly to your Android Studio project under <code className="text-violet-600">ui/theme/</code>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition flex items-center gap-1.5 shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Code"}</span>
                </button>
              </div>
            </div>

            {/* File Switcher Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {(["Theme.kt", "Color.kt", "Type.kt", "Shape.kt"] as const).map((file) => {
                const isSelected = selectedCodeFile === file;
                return (
                  <button
                    key={file}
                    onClick={() => setSelectedCodeFile(file)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isSelected
                        ? "bg-violet-100 text-violet-800 border border-violet-200"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {file}
                  </button>
                );
              })}
            </div>

            {/* Code container */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#0F172A] shadow-inner">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                <span>app/src/main/java/{config.packageName.replace(/\./g, "/")}/ui/theme/{selectedCodeFile}</span>
                <span className="text-violet-400">Kotlin / Compose M3</span>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-[500px]">
                <code>{getCodeContent()}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
