import React, { useState, useEffect } from "react";
import {
  Wifi,
  BatteryCharging,
  Signal,
  ArrowLeft,
  Search,
  MapPin,
  Camera,
  Play,
  Share2,
  Bell,
  Volume2,
  Compass,
  Check,
  Globe,
  Sliders,
  Sparkles,
  Smartphone,
  Laptop,
  ChevronDown,
  Menu,
  MoreVertical,
  Maximize2,
  ZoomIn,
  ZoomOut,
  AlignVerticalSpaceAround,
  Plus,
  Heart,
  Send,
  Settings,
  ArrowRight,
  Split,
  Edit3,
  Sun,
  Moon,
  Palette,
  Layers,
  Copy,
} from "lucide-react";
import {
  AndroidComponent,
  AndroidScreen,
  DeviceType,
  Orientation,
  Material3Theme,
  BuilderIdeSettings,
  LogicBlock,
} from "../../types";
import { DEFAULT_M3_THEME } from "../../data/defaultTheme";

interface CanvasProps {
  screen: AndroidScreen;
  screens?: AndroidScreen[];
  theme?: Material3Theme;
  deviceType: DeviceType;
  orientation: Orientation;
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  onDropNewComponent: (type: string, targetContainerId?: string) => void;
  onNavigateToScreen?: (screenId: string) => void;
  onOpenAiModal?: () => void;
  onToggleDeviceType?: (type: DeviceType) => void;
  onSelectScreen?: (screenId: string) => void;
  onOpenScreenManager?: () => void;
  onOpenNewScreenModal?: () => void;
  onDuplicateCurrentScreen?: () => void;
  onRenameCurrentScreen?: () => void;
  builderSettings?: BuilderIdeSettings;
}

export const Canvas: React.FC<CanvasProps> = ({
  screen,
  screens = [],
  theme,
  deviceType,
  orientation,
  selectedComponentId,
  onSelectComponent,
  onDropNewComponent,
  onNavigateToScreen,
  onOpenAiModal,
  onToggleDeviceType,
  onSelectScreen,
  onOpenScreenManager,
  onOpenNewScreenModal,
  onDuplicateCurrentScreen,
  onRenameCurrentScreen,
  builderSettings,
}) => {
  const [activeToast, setActiveToast] = useState<string | null>(null);
  const [activeSnackbar, setActiveSnackbar] = useState<{ message: string; actionLabel?: string } | null>(null);
  const [activeDialog, setActiveDialog] = useState<{ title: string; body: string } | null>(null);
  const [runtimePropsOverrides, setRuntimePropsOverrides] = useState<Record<string, Record<string, any>>>({});
  const [interactiveValues, setInteractiveValues] = useState<Record<string, any>>({});
  const [zoomLevel, setZoomLevel] = useState<number>(81);
  const [screenMenuOpen, setScreenMenuOpen] = useState(false);

  const activeTheme = theme || DEFAULT_M3_THEME;
  const [previewThemeMode, setPreviewThemeMode] = useState<"light" | "dark">(activeTheme.mode || "light");
  const colors = previewThemeMode === "light" ? activeTheme.lightColors : activeTheme.darkColors;
  const shapes = activeTheme.shapes;
  const typo = activeTheme.typography;

  const showToast = (msg: string) => {
    setActiveToast(msg);
    setTimeout(() => setActiveToast(null), 3000);
  };

  const executeLogicBlock = (block: LogicBlock) => {
    if (!block || !block.actions || block.enabled === false) return;
    for (const act of block.actions) {
      if (act.actionType === "toast" && act.message) {
        showToast(act.message);
      } else if (act.actionType === "snackbar" && act.message) {
        setActiveSnackbar({ message: act.message, actionLabel: act.actionLabel || "DISMISS" });
        setTimeout(() => setActiveSnackbar(null), 3500);
      } else if (act.actionType === "dialog") {
        setActiveDialog({ title: act.dialogTitle || "Alert", body: act.dialogBody || "" });
      } else if (act.actionType === "navigate" && act.targetScreen && onNavigateToScreen) {
        onNavigateToScreen(act.targetScreen);
      } else if (act.actionType === "setProperty" && act.targetId && act.property) {
        let val: any = act.value;
        if (val === "true") val = true;
        if (val === "false") val = false;
        setRuntimePropsOverrides((prev) => ({
          ...prev,
          [act.targetId!]: {
            ...(prev[act.targetId!] || {}),
            [act.property!]: val,
          },
        }));
      } else if (act.actionType === "vibrate") {
        try {
          navigator.vibrate?.(200);
        } catch {
          // ignore
        }
      } else if (act.actionType === "copyToClipboard" && act.value) {
        try {
          navigator.clipboard?.writeText(act.value);
          showToast(`Copied to clipboard: "${act.value}"`);
        } catch {
          showToast(`Copied: "${act.value}"`);
        }
      }
    }
  };

  // Run screen load logic blocks if any
  useEffect(() => {
    const loadBlocks = (screen.logicBlocks || []).filter(
      (b) => (b.event === "OnScreenLoad" || b.event === "OnResume") && b.enabled !== false
    );
    for (const block of loadBlocks) {
      executeLogicBlock(block);
    }
  }, [screen.id]);

  // Dimensions based on device & orientation
  let frameWidth = 380;
  let frameHeight = 780;

  if (deviceType === "tablet") {
    frameWidth = orientation === "portrait" ? 640 : 880;
    frameHeight = orientation === "portrait" ? 880 : 580;
  } else {
    // phone
    frameWidth = orientation === "portrait" ? 380 : 740;
    frameHeight = orientation === "portrait" ? 780 : 380;
  }

  // Handle Drag Over & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent, targetContainerId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    const type = e.dataTransfer.getData("application/droidforge-component");
    if (type) {
      onDropNewComponent(type, targetContainerId);
    }
  };

  const getAlignContainerStyle = (align?: string) => {
    switch (align) {
      case "top-left":
        return "flex justify-start items-start";
      case "top-center":
        return "flex justify-center items-start";
      case "top-right":
        return "flex justify-end items-start";
      case "top-fill":
        return "flex w-full";
      case "center-left":
        return "flex justify-start items-center";
      case "center-right":
        return "flex justify-end items-center";
      case "bottom-fill":
        return "flex w-full";
      case "center":
      default:
        return "flex justify-center items-center";
    }
  };

  // Component renderer
  const renderInteractiveComponent = (comp: AndroidComponent) => {
    const isSelected = selectedComponentId === comp.id;
    const p = { ...comp.props, ...(runtimePropsOverrides[comp.id] || {}) };

    const outlineClass =
      builderSettings?.showComponentOutlines && !isSelected
        ? "outline outline-1 outline-blue-400/30 -outline-offset-1"
        : "";

    const commonClasses = `relative transition-all duration-150 cursor-pointer ${outlineClass} ${
      isSelected
        ? "ring-2 ring-[#6750A4] ring-offset-2 ring-offset-white z-20 rounded-xl"
        : "hover:outline-dashed hover:outline-1 hover:outline-violet-400/70"
    }`;

    // Click handler that dispatches visual selection and any interactive logic
    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelectComponent(comp.id);

      // Check if this component has logic blocks
      const matchingBlocks = (screen.logicBlocks || []).filter(
        (b) => b.componentId === comp.id && (b.event === "Click" || !b.event || b.event === "Tap") && b.enabled !== false
      );
      for (const block of matchingBlocks) {
        executeLogicBlock(block);
      }
    };

    let content: React.ReactNode = null;

    switch (comp.type) {
      // 1. Actions (Material 3 Theme Token Integration)
      case "Button": {
        const variant = p.variant || "filled";
        const radius = p.cornerRadius !== undefined ? p.cornerRadius : shapes.extraLarge;
        let buttonBg = colors.primary;
        let buttonText = colors.onPrimary;
        let buttonBorder = "none";
        let shadow = "0 1px 2px rgba(0,0,0,0.08)";

        if (variant === "tonal") {
          buttonBg = colors.secondaryContainer;
          buttonText = colors.onSecondaryContainer;
        } else if (variant === "elevated") {
          buttonBg = colors.surface;
          buttonText = colors.primary;
          buttonBorder = `1px solid ${colors.surfaceVariant}`;
          shadow = "0 2px 4px rgba(0,0,0,0.12)";
        } else if (variant === "outlined") {
          buttonBg = "transparent";
          buttonText = colors.primary;
          buttonBorder = `1px solid ${colors.outline}`;
          shadow = "none";
        } else if (variant === "text") {
          buttonBg = "transparent";
          buttonText = colors.primary;
          shadow = "none";
        }

        const widthStyle = p.fixedWidth
          ? { width: `${p.fixedWidth}px` }
          : p.layoutWidth === "match_parent"
          ? { width: "100%" }
          : undefined;

        content = (
          <div className={getAlignContainerStyle(p.align)}>
            <button
              style={{
                borderRadius: `${radius}px`,
                fontSize: `${p.fontSize || 14}px`,
                backgroundColor: p.backgroundColor || buttonBg,
                color: p.textColor || buttonText,
                border: buttonBorder,
                boxShadow: shadow,
                fontFamily: typo.baseFontFamily,
                ...widthStyle,
              }}
              className="px-5 py-2.5 font-medium transition flex items-center justify-center gap-2 active:scale-95 hover:opacity-90"
            >
              {p.hasIcon !== false && (
                <Plus className="w-4 h-4 stroke-[2.5]" />
              )}
              <span>{p.text || "Button"}</span>
            </button>
          </div>
        );
        break;
      }

      case "IconButton": {
        content = (
          <div className={getAlignContainerStyle(p.align)}>
            <button
              style={{
                width: `${p.layoutWidth || 44}px`,
                height: `${p.layoutHeight || 44}px`,
                borderRadius: `${p.cornerRadius || 22}px`,
                backgroundColor: p.backgroundColor || colors.secondaryContainer,
                color: p.textColor || colors.onSecondaryContainer,
              }}
              className="flex items-center justify-center shadow-xs hover:opacity-90 active:scale-95 transition"
            >
              <Heart className="w-4 h-4 fill-current" />
            </button>
          </div>
        );
        break;
      }

      case "FAB": {
        const radius = p.cornerRadius !== undefined ? p.cornerRadius : shapes.large;
        content = (
          <div className={getAlignContainerStyle(p.align)}>
            <button
              style={{
                width: `${p.layoutWidth || 56}px`,
                height: `${p.layoutHeight || 56}px`,
                borderRadius: `${radius}px`,
                backgroundColor: p.backgroundColor || colors.primaryContainer,
                color: p.textColor || colors.onPrimaryContainer,
              }}
              className="flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95 transition"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>
        );
        break;
      }

      case "ExtendedFAB": {
        const radius = p.cornerRadius !== undefined ? p.cornerRadius : shapes.large;
        content = (
          <div className={getAlignContainerStyle(p.align)}>
            <button
              style={{
                borderRadius: `${radius}px`,
                backgroundColor: p.backgroundColor || colors.primaryContainer,
                color: p.textColor || colors.onPrimaryContainer,
                fontFamily: typo.baseFontFamily,
              }}
              className="px-5 py-3 shadow-md hover:shadow-lg flex items-center gap-2.5 active:scale-95 transition font-medium text-xs"
            >
              <Edit3 className="w-4 h-4 stroke-[2]" />
              <span>{p.text || "Compose"}</span>
            </button>
          </div>
        );
        break;
      }

      case "SplitButton": {
        const radius = `${shapes.extraLarge}px`;
        content = (
          <div className={getAlignContainerStyle(p.align)}>
            <div
              style={{
                borderRadius: radius,
                backgroundColor: colors.primary,
                color: colors.onPrimary,
                fontFamily: typo.baseFontFamily,
              }}
              className="inline-flex overflow-hidden shadow-xs text-xs"
            >
              <button className="px-4 py-2 hover:opacity-90 font-medium transition">
                {p.text || "Save & Deploy"}
              </button>
              <div className="w-[1px] bg-white/20" />
              <button className="px-2.5 py-2 hover:opacity-90 transition">
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
        break;
      }

      case "Chip": {
        const radius = p.cornerRadius !== undefined ? p.cornerRadius : shapes.small;
        content = (
          <div className={getAlignContainerStyle(p.align)}>
            <button
              style={{
                borderRadius: `${radius}px`,
                backgroundColor: colors.secondaryContainer,
                color: colors.onSecondaryContainer,
                borderColor: colors.outlineVariant,
                fontFamily: typo.baseFontFamily,
              }}
              className="px-3 py-1.5 border text-xs font-medium flex items-center gap-1.5 shadow-2xs hover:opacity-90 transition"
            >
              <Check className="w-3 h-3 stroke-[3]" />
              <span>{p.text || "Filter Active"}</span>
            </button>
          </div>
        );
        break;
      }

      // 2. Navigation
      case "Toolbar":
        content = (
          <div
            style={{
              backgroundColor: p.backgroundColor || colors.surface,
              color: p.textColor || colors.onSurface,
              borderBottom: `1px solid ${colors.surfaceVariant}`,
              fontFamily: typo.baseFontFamily,
            }}
            className="flex items-center justify-between px-4 py-3 select-none"
          >
            <div className="flex items-center gap-3">
              {p.showBackButton ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    showToast("Navigation Back (Pop Stack)");
                  }}
                  className="p-1 hover:opacity-80 rounded-full transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              ) : (
                <Menu className="w-5 h-5 opacity-80" />
              )}
              <h1 className="font-semibold text-sm tracking-tight truncate max-w-[200px]">
                {p.title || screen.title}
              </h1>
            </div>
            <div className="flex items-center gap-1 opacity-70">
              <Search className="w-4 h-4 hover:opacity-100 cursor-pointer mr-1" />
              <MoreVertical className="w-4 h-4 hover:opacity-100 cursor-pointer" />
            </div>
          </div>
        );
        break;

      case "Card": {
        const radius = p.cornerRadius !== undefined ? p.cornerRadius : shapes.medium;
        content = (
          <div
            style={{
              backgroundColor: p.backgroundColor || colors.surface,
              color: colors.onSurface,
              borderRadius: `${radius}px`,
              padding: `${p.padding || 16}px`,
              boxShadow: `0 ${(p.elevation || 2) * 2}px ${(p.elevation || 2) * 4}px rgba(0,0,0,0.06)`,
              margin: `${p.margin || 6}px 0`,
              borderColor: colors.surfaceVariant,
              fontFamily: typo.baseFontFamily,
            }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, comp.id)}
            className="space-y-3 border"
          >
            {comp.children && comp.children.length > 0 ? (
              comp.children.map((c) => renderInteractiveComponent(c))
            ) : (
              <div
                style={{ borderColor: colors.outlineVariant, color: colors.onSurfaceVariant }}
                className="p-4 border border-dashed rounded-xl text-center text-xs opacity-70"
              >
                Drop child components inside this Card
              </div>
            )}
          </div>
        );
        break;
      }

      case "ScrollView":
        content = (
          <div
            style={{ padding: `${p.padding || 12}px` }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, comp.id)}
            className="space-y-2.5 h-full overflow-y-auto"
          >
            {comp.children && comp.children.length > 0 ? (
              comp.children.map((c) => renderInteractiveComponent(c))
            ) : (
              <div
                style={{ borderColor: colors.outlineVariant, color: colors.onSurfaceVariant }}
                className="p-8 border-2 border-dashed rounded-2xl text-center text-xs opacity-60"
              >
                Drag components from the left palette onto this screen
              </div>
            )}
          </div>
        );
        break;

      case "Recycler/List": {
        const items = p.items || ["Item 1", "Item 2", "Item 3"];
        const radius = `${shapes.medium}px`;
        content = (
          <div className="space-y-1.5 my-2">
            <span
              style={{ color: colors.outline }}
              className="text-[10px] font-mono uppercase tracking-wider block px-1"
            >
              LazyColumn / RecyclerView
            </span>
            {items.map((it: string, idx: number) => (
              <div
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  showToast(`Selected: ${it}`);
                }}
                style={{
                  backgroundColor: colors.surface,
                  color: colors.onSurface,
                  borderColor: colors.surfaceVariant,
                  borderRadius: radius,
                  fontFamily: typo.baseFontFamily,
                }}
                className="p-3 border shadow-xs flex items-center justify-between text-xs font-medium hover:opacity-90 transition cursor-pointer"
              >
                <span>{it}</span>
                <span style={{ color: colors.outline }} className="text-[10px] font-mono">#{idx + 1}</span>
              </div>
            ))}
          </div>
        );
        break;
      }

      case "Text":
        content = (
          <div className={getAlignContainerStyle(p.align)}>
            <p
              style={{
                fontSize: `${p.fontSize || 16}px`,
                fontWeight: p.fontWeight === "bold" ? 700 : p.fontWeight === "medium" ? 500 : 400,
                color: p.textColor || colors.onSurface,
                textAlign: p.textAlign || "left",
                margin: `${p.margin || 4}px 0`,
                fontFamily: typo.baseFontFamily,
              }}
              className="leading-snug max-w-full break-words"
            >
              {p.text || "Heading Text"}
            </p>
          </div>
        );
        break;

      case "Image":
        content = (
          <div
            style={{
              height: `${p.layoutHeight || 180}px`,
              borderRadius: `${p.cornerRadius || 16}px`,
            }}
            className="w-full bg-slate-100 overflow-hidden relative shadow-xs my-2 border border-slate-200/60"
          >
            <img
              src={
                p.url ||
                "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=600&auto=format&fit=crop&q=80"
              }
              alt={p.alt || "Android app preview"}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono backdrop-blur-xs">
              Coil AsyncImage
            </div>
          </div>
        );
        break;

      case "TextField": {
        const radius = p.cornerRadius !== undefined ? p.cornerRadius : shapes.extraSmall;
        content = (
          <div className="my-2 space-y-1">
            <div
              style={{
                borderRadius: `${radius}px`,
                backgroundColor: colors.surface,
                borderColor: colors.outline,
                color: colors.onSurface,
              }}
              className="border px-3 py-2 text-xs flex items-center justify-between shadow-2xs transition"
            >
              <input
                type="text"
                placeholder={p.hint || "Enter text..."}
                value={interactiveValues[comp.id] ?? p.text ?? ""}
                onChange={(e) =>
                  setInteractiveValues((prev) => ({ ...prev, [comp.id]: e.target.value }))
                }
                style={{ color: colors.onSurface, fontFamily: typo.baseFontFamily }}
                className="w-full bg-transparent placeholder:opacity-50 outline-none"
              />
            </div>
          </div>
        );
        break;
      }

      case "Checkbox": {
        const isChecked = interactiveValues[comp.id] ?? p.checked;
        const radius = `${shapes.extraSmall}px`;
        content = (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setInteractiveValues((prev) => ({ ...prev, [comp.id]: !prev[comp.id] }));
            }}
            className="flex items-center gap-2.5 py-1.5 cursor-pointer select-none"
          >
            <div
              style={{
                borderRadius: radius,
                backgroundColor: isChecked ? colors.primary : colors.surface,
                borderColor: isChecked ? colors.primary : colors.outline,
                color: colors.onPrimary,
              }}
              className="w-4 h-4 flex items-center justify-center border transition"
            >
              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span
              style={{ color: p.textColor || colors.onSurface, fontSize: `${p.fontSize || 14}px`, fontFamily: typo.baseFontFamily }}
              className="text-xs font-medium"
            >
              {p.text || "Option Checkbox"}
            </span>
          </div>
        );
        break;
      }

      case "Switch": {
        const isChecked = interactiveValues[comp.id] ?? p.checked;
        content = (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setInteractiveValues((prev) => ({ ...prev, [comp.id]: !prev[comp.id] }));
            }}
            className="flex items-center justify-between py-2 cursor-pointer select-none"
          >
            <span style={{ color: p.textColor || colors.onSurface, fontFamily: typo.baseFontFamily }} className="text-xs font-medium">
              {p.text || "Toggle switch"}
            </span>
            <div
              style={{
                backgroundColor: isChecked ? colors.primary : colors.surfaceVariant,
              }}
              className="w-10 h-6 rounded-full transition-colors relative flex items-center px-0.5"
            >
              <div
                style={{
                  backgroundColor: colors.surface,
                }}
                className={`w-5 h-5 rounded-full shadow-xs transition-transform duration-200 transform ${
                  isChecked ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
          </div>
        );
        break;
      }

      case "Slider":
        content = (
          <div className="py-2 space-y-1">
            <div className="flex items-center justify-between text-[11px]" style={{ color: colors.onSurfaceVariant }}>
              <span className="font-medium" style={{ fontFamily: typo.baseFontFamily }}>Continuous Value</span>
              <span className="font-mono font-bold" style={{ color: colors.primary }}>
                {interactiveValues[comp.id] ?? p.value ?? 70}%
              </span>
            </div>
            <input
              type="range"
              min={p.min || 0}
              max={p.max || 100}
              value={interactiveValues[comp.id] ?? p.value ?? 70}
              onChange={(e) =>
                setInteractiveValues((prev) => ({
                  ...prev,
                  [comp.id]: Number(e.target.value),
                }))
              }
              style={{
                accentColor: colors.primary,
                backgroundColor: colors.surfaceVariant,
              }}
              className="w-full h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        );
        break;

      case "Progress":
        content = (
          <div className="py-2 space-y-1">
            <div
              style={{ backgroundColor: colors.surfaceVariant }}
              className="w-full rounded-full h-2 overflow-hidden"
            >
              <div
                style={{
                  width: `${p.progress || 65}%`,
                  backgroundColor: p.backgroundColor || colors.primary,
                }}
                className="h-full rounded-full transition-all duration-300"
              />
            </div>
          </div>
        );
        break;

      case "Map":
        content = (
          <div
            style={{
              height: `${p.layoutHeight || 200}px`,
              borderRadius: `${p.cornerRadius || 16}px`,
            }}
            className="w-full bg-emerald-50 border border-emerald-200/80 overflow-hidden relative shadow-xs flex flex-col justify-between p-3 my-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-800 bg-white/90 px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-500" />
                <span>Google Maps SDK v18</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                Live GPS
              </span>
            </div>
            <div className="bg-white/90 backdrop-blur-xs p-2 rounded-xl text-[11px] text-slate-800 shadow-sm">
              <span className="font-semibold block">Marker: San Francisco, CA</span>
              <span className="text-slate-500 text-[10px]">Lat: 37.7749°, Lon: -122.4194°</span>
            </div>
          </div>
        );
        break;

      case "Camera":
        content = (
          <div
            style={{
              height: `${p.layoutHeight || 180}px`,
              borderRadius: `${p.cornerRadius || 16}px`,
            }}
            className="w-full bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-slate-400 relative overflow-hidden my-2"
          >
            <Camera className="w-8 h-8 text-violet-400 mb-2 stroke-1" />
            <span className="text-xs font-mono text-slate-200 font-medium">CameraX Live Viewfinder</span>
            <span className="text-[10px] text-slate-400">60 FPS • 1080p Stream</span>
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-red-600 text-[10px] text-white flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </div>
          </div>
        );
        break;

      case "ExoPlayer":
      case "Video":
        content = (
          <div
            style={{
              height: `${p.layoutHeight || 180}px`,
              borderRadius: `${p.cornerRadius || 14}px`,
            }}
            className="w-full bg-black flex flex-col items-center justify-center text-white relative overflow-hidden my-2 group shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-[#6750A4] flex items-center justify-center shadow-lg group-hover:scale-110 transition">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-slate-300">
              <span>01:24 / 04:30</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded">Media3 ExoPlayer</span>
            </div>
          </div>
        );
        break;

      default:
        content = (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between shadow-2xs my-1">
            <span className="font-medium text-slate-800">{comp.name}</span>
            <span className="text-[10px] font-mono text-slate-400">{comp.type}</span>
          </div>
        );
        break;
    }

    return (
      <div
        key={comp.id}
        id={`canvas-comp-${comp.id}`}
        onClick={handleClick}
        className={commonClasses}
      >
        {/* Component name badge on selection (Matches Reference Image) */}
        {isSelected && (
          <div className="absolute -top-3.5 left-2 bg-[#6750A4] text-white font-mono text-[9px] px-2 py-0.5 rounded-full shadow-sm z-30 uppercase tracking-wider flex items-center gap-1">
            <span>=</span>
            <span>{comp.type.toLowerCase()}</span>
          </div>
        )}
        {content}
      </div>
    );
  };

  const canvasBgClass = (() => {
    switch (builderSettings?.canvasBackground) {
      case "blueprint":
        return "bg-[#0B192C] bg-[linear-gradient(to_right,#1E3E62_1px,transparent_1px),linear-gradient(to_bottom,#1E3E62_1px,transparent_1px)] [background-size:20px_20px]";
      case "dark-grid":
        return "bg-[#0F141C] bg-[linear-gradient(to_right,#1E293B_1px,transparent_1px),linear-gradient(to_bottom,#1E293B_1px,transparent_1px)] [background-size:24px_24px]";
      case "solid":
        return "bg-[#EFEFF4]";
      case "dots":
      default:
        return "bg-[#F4F3F8] bg-[radial-gradient(#CBD5E1_1.2px,transparent_1.2px)] [background-size:16px_16px]";
    }
  })();

  return (
    <main
      id="canvas-viewport-container"
      className={`flex-1 ${canvasBgClass} flex flex-col items-center justify-between p-4 overflow-auto relative select-none transition-colors duration-200`}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, screen.rootComponent.id)}
    >
      {/* 1. Top Device Switcher & Screen Pill (Matches Reference Image) */}
      <div className="z-20 mb-3 flex items-center gap-2">
        <div className="bg-white/95 backdrop-blur-md shadow-sm border border-slate-200/80 rounded-full px-2 py-1 flex items-center gap-1.5">
          {/* Phone Icon */}
          <button
            type="button"
            onClick={() => onToggleDeviceType && onToggleDeviceType("phone")}
            title="Mobile Phone View"
            className={`p-1.5 rounded-full transition ${
              deviceType === "phone"
                ? "bg-[#6750A4] text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>

          {/* Desktop/Tablet Icon */}
          <button
            type="button"
            onClick={() => onToggleDeviceType && onToggleDeviceType("tablet")}
            title="Tablet / Large Screen View"
            className={`p-1.5 rounded-full transition ${
              deviceType === "tablet"
                ? "bg-[#6750A4] text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-slate-200 mx-1" />

          {/* Screen Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setScreenMenuOpen(!screenMenuOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 px-2 py-1 rounded-full hover:bg-slate-100 transition"
            >
              <span>{screen.title || screen.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {screenMenuOpen && screens.length > 0 && (
              <div className="absolute top-full left-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Screen
                </div>
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {screens.map((sc) => (
                    <button
                      key={sc.id}
                      onClick={() => {
                        if (onSelectScreen) onSelectScreen(sc.id);
                        setScreenMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                        sc.id === screen.id
                          ? "bg-violet-50 text-violet-900 font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate">{sc.title || sc.name}</span>
                      {sc.id === screen.id && <Check className="w-3.5 h-3.5 text-violet-700 shrink-0" />}
                    </button>
                  ))}
                </div>

                <div className="h-[1px] bg-slate-100 my-1.5" />

                <div className="space-y-0.5">
                  {onRenameCurrentScreen && (
                    <button
                      onClick={() => {
                        setScreenMenuOpen(false);
                        onRenameCurrentScreen();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition text-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Rename Current Screen</span>
                    </button>
                  )}

                  {onDuplicateCurrentScreen && (
                    <button
                      onClick={() => {
                        setScreenMenuOpen(false);
                        onDuplicateCurrentScreen();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition text-xs"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Duplicate Current Screen</span>
                    </button>
                  )}

                  {onOpenNewScreenModal && (
                    <button
                      onClick={() => {
                        setScreenMenuOpen(false);
                        onOpenNewScreenModal();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-400" />
                      <span>New Screen...</span>
                    </button>
                  )}

                  {onOpenScreenManager && (
                    <button
                      onClick={() => {
                        setScreenMenuOpen(false);
                        onOpenScreenManager();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-violet-700 font-semibold hover:bg-violet-50 transition text-xs"
                    >
                      <Layers className="w-3.5 h-3.5 text-violet-600" />
                      <span>Manage All Screens...</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Theme Mode Toggle & Badge */}
        <div className="bg-white/95 backdrop-blur-md shadow-sm border border-slate-200/80 rounded-full px-2.5 py-1 flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-2xs"
              style={{ backgroundColor: colors.primary }}
            />
            <span className="text-[11px] font-medium text-slate-600">
              {activeTheme.name}
            </span>
          </div>

          <div className="w-[1px] h-3.5 bg-slate-200" />

          <button
            type="button"
            onClick={() => setPreviewThemeMode(previewThemeMode === "light" ? "dark" : "light")}
            title={`Toggle Theme Preview (Currently: ${previewThemeMode})`}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 px-1.5 py-0.5 rounded-full hover:bg-slate-100 transition"
          >
            {previewThemeMode === "light" ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="capitalize">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span className="capitalize">Dark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Toast Notification Simulation */}
      {activeToast && (
        <div className="absolute top-16 z-50 bg-slate-900/95 text-white border border-slate-700 px-4 py-2 rounded-full shadow-2xl text-xs font-medium flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{activeToast}</span>
        </div>
      )}

      {/* 2. Realistic Google Pixel 9 Pro Device Frame (Matches Reference Image) */}
      <div
        id="simulated-android-device"
        style={{
          width: `${frameWidth}px`,
          height: `${frameHeight}px`,
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: "center center",
        }}
        className="bg-[#2A2831] rounded-[46px] p-2.5 shadow-2xl border-4 border-[#1E1C22] flex flex-col relative transition-all duration-200 shrink-0 my-auto"
      >
        {/* Physical buttons on right bezel */}
        <div className="absolute -right-1.5 top-28 w-1 h-10 bg-slate-600 rounded-r-md" />
        <div className="absolute -right-1.5 top-42 w-1 h-16 bg-slate-600 rounded-r-md" />

        {/* Screen Display */}
        <div
          style={{
            backgroundColor: screen.properties?.backgroundColor || colors.background,
            backgroundImage: screen.properties?.backgroundImage
              ? `url(${screen.properties.backgroundImage})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: colors.onBackground,
            fontFamily: typo.baseFontFamily,
          }}
          className="w-full h-full rounded-[38px] overflow-hidden flex flex-col relative border border-slate-200/40"
        >
          {/* Status Bar */}
          {screen.properties?.showStatusBar !== false && (
            <div
              style={{
                backgroundColor: screen.properties?.statusBarColor || colors.surface,
                color: screen.properties?.statusBarLightIcons ? "#FFFFFF" : colors.onSurface,
              }}
              className="h-7 px-5 flex items-center justify-between text-[11px] font-semibold z-20 shrink-0 select-none border-b border-black/5"
            >
              <span className="font-mono text-xs">9:41</span>

              {/* Camera Punch Hole */}
              <div className="w-3.5 h-3.5 rounded-full bg-black flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-slate-800" />
              </div>

              <div className="flex items-center gap-1.5 opacity-80">
                <span className="text-[10px] font-bold">5G</span>
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <BatteryCharging className="w-3 h-3" />
              </div>
            </div>
          )}

          {/* Screen Title Bar (if titleVisible) */}
          {screen.properties?.titleVisible !== false && (
            <div
              style={{
                backgroundColor: screen.properties?.primaryColor || colors.surface,
                color: "#FFFFFF",
              }}
              className="px-4 py-2 flex items-center justify-between shadow-2xs z-10 shrink-0 select-none"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs truncate">
                  {screen.properties?.title || screen.title || screen.name}
                </span>
              </div>
              {screen.properties?.showAboutInMenu !== false && (
                <MoreVertical className="w-3.5 h-3.5 opacity-80 cursor-pointer" />
              )}
            </div>
          )}

          {/* Screen Content Area */}
          <div
            id="android-screen-content-area"
            style={{
              backgroundColor: screen.properties?.backgroundColor || "transparent",
              color: colors.onBackground,
              fontSize: screen.properties?.bigDefaultText ? "1.12em" : undefined,
              filter: screen.properties?.highContrast ? "contrast(1.25)" : undefined,
              display: "flex",
              flexDirection: "column",
              alignItems:
                screen.properties?.alignHorizontal === "center"
                  ? "center"
                  : screen.properties?.alignHorizontal === "right"
                  ? "flex-end"
                  : "stretch",
              justifyContent:
                screen.properties?.alignVertical === "center"
                  ? "center"
                  : screen.properties?.alignVertical === "bottom"
                  ? "flex-end"
                  : "flex-start",
            }}
            className={`flex-1 relative ${
              screen.properties?.scrollable !== false
                ? "overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200"
                : "overflow-hidden"
            }`}
          >
            {renderInteractiveComponent(screen.rootComponent)}

            {/* Real-time Android Toast Overlay */}
            {activeToast && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg z-50 pointer-events-none max-w-[85%] text-center backdrop-blur-sm border border-white/10 transition-all">
                {activeToast}
              </div>
            )}

            {/* Android Material 3 Snackbar Overlay */}
            {activeSnackbar && (
              <div className="absolute bottom-6 left-3 right-3 bg-slate-900 text-white text-xs px-3.5 py-2.5 rounded-xl shadow-xl z-50 flex items-center justify-between border border-slate-700">
                <span className="truncate pr-2 font-medium">{activeSnackbar.message}</span>
                <button
                  type="button"
                  onClick={() => setActiveSnackbar(null)}
                  className="text-violet-400 font-bold hover:text-violet-300 shrink-0 text-[11px] uppercase tracking-wider px-1 py-0.5"
                >
                  {activeSnackbar.actionLabel || "DISMISS"}
                </button>
              </div>
            )}

            {/* Android Material Dialog Overlay */}
            {activeDialog && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl p-5 shadow-2xl w-full max-w-[280px] border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-sm mb-1.5">{activeDialog.title}</h4>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">{activeDialog.body}</p>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveDialog(null)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Android Gesture Navigation Pill Bar */}
          {screen.properties?.showNavigationBar !== false && (
            <div
              style={{
                backgroundColor: screen.properties?.navigationBarColor || colors.surface,
              }}
              className="h-5 flex items-center justify-center z-20 shrink-0"
            >
              <div
                style={{
                  backgroundColor: screen.properties?.navigationBarLightIcons
                    ? "#FFFFFF"
                    : colors.onSurface,
                }}
                className="w-28 h-1 rounded-full opacity-40"
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Floating Controls (Matches Reference Image) */}
      <div className="w-full max-w-4xl flex items-center justify-between px-4 z-20 pt-3">
        {/* Left: Ask an AI BETA Button */}
        <button
          type="button"
          onClick={onOpenAiModal}
          id="ask-ai-floating-pill"
          className="bg-white/95 backdrop-blur-md shadow-md hover:shadow-lg border border-slate-200/80 rounded-full px-4 py-2 flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 active:scale-95 transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-600" />
          <span>Ask an AI</span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-pink-700 bg-pink-50 border border-pink-200 px-1.5 py-0.2 rounded-full">
            BETA
          </span>
        </button>

        {/* Right: Floating Canvas Tools Pill */}
        <div
          id="canvas-tools-floating-pill"
          className="bg-white/95 backdrop-blur-md shadow-md border border-slate-200/80 rounded-full px-3 py-1.5 flex items-center gap-2 text-slate-600"
        >
          {/* Check / Status */}
          <button
            title="Auto-saved state"
            className="p-1 hover:text-slate-900 rounded-full transition"
          >
            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
          </button>

          <div className="w-[1px] h-3.5 bg-slate-200" />

          {/* Snap / Margin toggle */}
          <button
            title="Snap to margins & baseline"
            className="p-1 hover:text-slate-900 rounded-full transition"
          >
            <AlignVerticalSpaceAround className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-3.5 bg-slate-200" />

          {/* Zoom Out */}
          <button
            onClick={() => setZoomLevel((prev) => Math.max(50, prev - 10))}
            title="Zoom Out"
            className="p-1 hover:text-slate-900 rounded-full transition text-xs font-bold"
          >
            −
          </button>

          {/* Zoom Percent Readout */}
          <span className="text-xs font-mono font-medium text-slate-700 min-w-[32px] text-center">
            {zoomLevel}%
          </span>

          {/* Zoom In */}
          <button
            onClick={() => setZoomLevel((prev) => Math.min(150, prev + 10))}
            title="Zoom In"
            className="p-1 hover:text-slate-900 rounded-full transition text-xs font-bold"
          >
            +
          </button>

          <div className="w-[1px] h-3.5 bg-slate-200" />

          {/* Fit to Viewport */}
          <button
            onClick={() => setZoomLevel(81)}
            title="Reset Zoom / Fit to Screen"
            className="p-1 hover:text-slate-900 rounded-full transition"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </main>
  );
};
