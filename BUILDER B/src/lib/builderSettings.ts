import { BuilderIdeSettings, IdeTheme, IdeAccentColor, CustomThemeColors } from "../types";

export const BUILDER_SETTINGS_STORAGE_KEY = "droidforge_ide_preferences_v1";

export const DEFAULT_CUSTOM_THEME_COLORS: CustomThemeColors = {
  shellBg: "#0F172A",
  cardBg: "#1E293B",
  cardInnerBg: "#0F172A",
  borderColor: "#334155",
  textColor: "#F8FAFC",
  textMutedColor: "#94A3B8",
  tabBarBg: "#0B1120",
  tabActiveBg: "#6366F1",
  tabActiveText: "#FFFFFF",
  tabInactiveText: "#94A3B8",
  tabIndicatorColor: "#818CF8",
  accentColor: "#6366F1",
  accentTextColor: "#FFFFFF",
};

export interface CustomPalettePreset {
  id: string;
  name: string;
  desc: string;
  colors: CustomThemeColors;
}

export const CUSTOM_PALETTE_PRESETS: CustomPalettePreset[] = [
  {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    desc: "Neon cyan accents, hot pink tabs, and deep synthwave dark shell",
    colors: {
      shellBg: "#0D0C1D",
      cardBg: "#1A1830",
      cardInnerBg: "#100E24",
      borderColor: "#3D2B56",
      textColor: "#F0F3F4",
      textMutedColor: "#C4B5FD",
      tabBarBg: "#0E0A1E",
      tabActiveBg: "#EC4899",
      tabActiveText: "#FFFFFF",
      tabInactiveText: "#A78BFA",
      tabIndicatorColor: "#06B6D4",
      accentColor: "#06B6D4",
      accentTextColor: "#000000",
    },
  },
  {
    id: "emerald-matrix",
    name: "Emerald Forest",
    desc: "Lush botanical greens, jade tabs, and dark organic obsidian surfaces",
    colors: {
      shellBg: "#06140E",
      cardBg: "#0F281E",
      cardInnerBg: "#081B13",
      borderColor: "#1E4736",
      textColor: "#ECFDF5",
      textMutedColor: "#6EE7B7",
      tabBarBg: "#040F0A",
      tabActiveBg: "#059669",
      tabActiveText: "#FFFFFF",
      tabInactiveText: "#6EE7B7",
      tabIndicatorColor: "#34D399",
      accentColor: "#10B981",
      accentTextColor: "#06140E",
    },
  },
  {
    id: "sunset-glow",
    name: "Sunset Ember",
    desc: "Warm twilight purples, amber glowing tabs, and rich sunset contrast",
    colors: {
      shellBg: "#180D1D",
      cardBg: "#2B1633",
      cardInnerBg: "#1B0D21",
      borderColor: "#4F265D",
      textColor: "#FFF1F2",
      textMutedColor: "#F472B6",
      tabBarBg: "#120816",
      tabActiveBg: "#F59E0B",
      tabActiveText: "#180D1D",
      tabInactiveText: "#FDA4AF",
      tabIndicatorColor: "#F43F5E",
      accentColor: "#F43F5E",
      accentTextColor: "#FFFFFF",
    },
  },
  {
    id: "nordic-glacier",
    name: "Arctic Glacier",
    desc: "Frosty icy blue tones, polar white font, and chilled sapphire tabs",
    colors: {
      shellBg: "#0B132B",
      cardBg: "#1C2541",
      cardInnerBg: "#111C38",
      borderColor: "#3A506B",
      textColor: "#F0F8FF",
      textMutedColor: "#93C5FD",
      tabBarBg: "#080E21",
      tabActiveBg: "#3B82F6",
      tabActiveText: "#FFFFFF",
      tabInactiveText: "#93C5FD",
      tabIndicatorColor: "#60A5FA",
      accentColor: "#38BDF8",
      accentTextColor: "#0B132B",
    },
  },
  {
    id: "dracula-velvet",
    name: "Dracula Velvet",
    desc: "Vampiric dark charcoal with lavender typography and magenta tabs",
    colors: {
      shellBg: "#191622",
      cardBg: "#221C35",
      cardInnerBg: "#151221",
      borderColor: "#443963",
      textColor: "#F8F8F2",
      textMutedColor: "#BD93F9",
      tabBarBg: "#110E1B",
      tabActiveBg: "#BD93F9",
      tabActiveText: "#191622",
      tabInactiveText: "#9A87C4",
      tabIndicatorColor: "#FF79C6",
      accentColor: "#FF79C6",
      accentTextColor: "#191622",
    },
  },
  {
    id: "warm-sepia",
    name: "Warm Solarized",
    desc: "Gentle eye-friendly warm paper parchment with terracotta tabs and espresso text",
    colors: {
      shellBg: "#FDF6E3",
      cardBg: "#EEE8D5",
      cardInnerBg: "#FAF4E1",
      borderColor: "#D3C6AA",
      textColor: "#2E3440",
      textMutedColor: "#586E75",
      tabBarBg: "#E4DCBA",
      tabActiveBg: "#CB4B16",
      tabActiveText: "#FFFFFF",
      tabInactiveText: "#586E75",
      tabIndicatorColor: "#B58900",
      accentColor: "#268BD2",
      accentTextColor: "#FFFFFF",
    },
  },
  {
    id: "monochrome-pro",
    name: "Pure Monochrome",
    desc: "Ultra-crisp OLED pitch black, pure white typography, and silver steel tabs",
    colors: {
      shellBg: "#000000",
      cardBg: "#111111",
      cardInnerBg: "#080808",
      borderColor: "#2B2B2B",
      textColor: "#FFFFFF",
      textMutedColor: "#A3A3A3",
      tabBarBg: "#0A0A0A",
      tabActiveBg: "#FFFFFF",
      tabActiveText: "#000000",
      tabInactiveText: "#737373",
      tabIndicatorColor: "#A3A3A3",
      accentColor: "#E5E5E5",
      accentTextColor: "#000000",
    },
  },
];

export const DEFAULT_BUILDER_SETTINGS: BuilderIdeSettings = {
  // Appearance & Personalization
  theme: "slate",
  customThemeColors: { ...DEFAULT_CUSTOM_THEME_COLORS },
  accentColor: "indigo",
  density: "comfortable",
  uiFont: "system",
  canvasBackground: "dots",
  interfaceScaling: 100,
  reducedMotion: false,

  // Code Studio Preferences
  codeEditorTheme: "vs-dark",
  codeFontSize: 13,
  codeTabSize: 2,
  codeLineNumbers: true,
  codeMinimap: false,
  codeWordWrap: true,

  // Visual Editor / Canvas IDE behavior
  snapToGrid: true,
  gridSize: 16,
  showComponentOutlines: true,
  smartAlignmentGuides: true,
  touchTargetIndicators: false,

  // Workflow & Feedback
  soundEffects: false,
  autoSaveInterval: "instant",
};

export const ACCENT_COLOR_MAP: Record<
  IdeAccentColor,
  {
    name: string;
    hex: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    ringClass: string;
  }
> = {
  indigo: {
    name: "Electric Indigo",
    hex: "#6366F1",
    bgClass: "bg-indigo-600",
    textClass: "text-indigo-600",
    borderClass: "border-indigo-500",
    ringClass: "focus:ring-indigo-500",
  },
  blue: {
    name: "Material Ocean",
    hex: "#2563EB",
    bgClass: "bg-blue-600",
    textClass: "text-blue-600",
    borderClass: "border-blue-500",
    ringClass: "focus:ring-blue-500",
  },
  violet: {
    name: "Jetpack Purple",
    hex: "#7C3AED",
    bgClass: "bg-violet-600",
    textClass: "text-violet-600",
    borderClass: "border-violet-500",
    ringClass: "focus:ring-violet-500",
  },
  emerald: {
    name: "Android Mint",
    hex: "#059669",
    bgClass: "bg-emerald-600",
    textClass: "text-emerald-600",
    borderClass: "border-emerald-500",
    ringClass: "focus:ring-emerald-500",
  },
  amber: {
    name: "Studio Amber",
    hex: "#D97706",
    bgClass: "bg-amber-600",
    textClass: "text-amber-600",
    borderClass: "border-amber-500",
    ringClass: "focus:ring-amber-500",
  },
  rose: {
    name: "Ruby Crimson",
    hex: "#E11D48",
    bgClass: "bg-rose-600",
    textClass: "text-rose-600",
    borderClass: "border-rose-500",
    ringClass: "focus:ring-rose-500",
  },
  cyan: {
    name: "Cyber Cyan",
    hex: "#0891B2",
    bgClass: "bg-cyan-600",
    textClass: "text-cyan-600",
    borderClass: "border-cyan-500",
    ringClass: "focus:ring-cyan-500",
  },
  custom: {
    name: "Custom Hex",
    hex: "#6366F1",
    bgClass: "bg-indigo-600",
    textClass: "text-indigo-600",
    borderClass: "border-indigo-500",
    ringClass: "focus:ring-indigo-500",
  },
};

export const THEME_PREVIEW_MAP: Record<
  IdeTheme,
  {
    name: string;
    desc: string;
    shellBg: string;
    cardBg: string;
    cardInnerBg: string;
    textColor: string;
    textMuted: string;
    border: string;
  }
> = {
  slate: {
    name: "Slate Studio",
    desc: "Default balanced dark-slate IDE for extended sessions",
    shellBg: "#0F172A",
    cardBg: "#1E293B",
    cardInnerBg: "#0F172A",
    textColor: "#F8FAFC",
    textMuted: "#94A3B8",
    border: "#334155",
  },
  midnight: {
    name: "Midnight Obsidian",
    desc: "Deep OLED black for minimal eye strain and high focus",
    shellBg: "#09090B",
    cardBg: "#18181B",
    cardInnerBg: "#09090B",
    textColor: "#FAFAFA",
    textMuted: "#A1A1AA",
    border: "#27272A",
  },
  light: {
    name: "Crisp Paper",
    desc: "Ultra-clean high contrast light workstation environment",
    shellBg: "#F8FAFC",
    cardBg: "#FFFFFF",
    cardInnerBg: "#F1F5F9",
    textColor: "#0F172A",
    textMuted: "#64748B",
    border: "#E2E8F0",
  },
  nordic: {
    name: "Nordic Frost",
    desc: "Cool arctic navy hue with softened highlights",
    shellBg: "#0F141C",
    cardBg: "#18202F",
    cardInnerBg: "#0F141C",
    textColor: "#E2E8F0",
    textMuted: "#94A3B8",
    border: "#2B374E",
  },
  "high-contrast": {
    name: "High Contrast Pro",
    desc: "Maximum optical clarity with distinct borders for accessibility",
    shellBg: "#000000",
    cardBg: "#121212",
    cardInnerBg: "#1E1E1E",
    textColor: "#FFFFFF",
    textMuted: "#E5E5E5",
    border: "#525252",
  },
  custom: {
    name: "Custom Studio",
    desc: "Personalized workspace with custom theme, fonts, tabs, and accent colors",
    shellBg: "#0F172A",
    cardBg: "#1E293B",
    cardInnerBg: "#0F172A",
    textColor: "#F8FAFC",
    textMuted: "#94A3B8",
    border: "#334155",
  },
};

export const loadBuilderSettings = (): BuilderIdeSettings => {
  try {
    const raw = localStorage.getItem(BUILDER_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return {
        ...DEFAULT_BUILDER_SETTINGS,
        customThemeColors: { ...DEFAULT_CUSTOM_THEME_COLORS },
      };
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_BUILDER_SETTINGS,
      ...parsed,
      customThemeColors: {
        ...DEFAULT_CUSTOM_THEME_COLORS,
        ...(parsed.customThemeColors || {}),
      },
    };
  } catch (err) {
    console.warn("Could not load builder settings from storage", err);
    return {
      ...DEFAULT_BUILDER_SETTINGS,
      customThemeColors: { ...DEFAULT_CUSTOM_THEME_COLORS },
    };
  }
};

export const saveBuilderSettings = (settings: BuilderIdeSettings): void => {
  try {
    localStorage.setItem(BUILDER_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error("Failed to persist builder settings", err);
  }
};

export const resetBuilderSettings = (): BuilderIdeSettings => {
  try {
    localStorage.removeItem(BUILDER_SETTINGS_STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear builder settings from storage", err);
  }
  return { ...DEFAULT_BUILDER_SETTINGS };
};

// Subtle Web Audio synthesizer for IDE sound feedback (only if soundEffects: true)
export const playIdeSound = (type: "click" | "toggle" | "action" = "click") => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === "click") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === "toggle") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.06);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    } else {
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch {
    // Ignore audio permission errors
  }
};
