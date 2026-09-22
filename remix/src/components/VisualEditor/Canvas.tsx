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
  User,
  ShoppingBag,
  Bookmark,
  Filter,
  RefreshCw,
  X,
  Home,
  Square,
  Circle,
  Zap,
  Workflow,
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
  const [activeBottomNavIndex, setActiveBottomNavIndex] = useState<number>(screen.properties?.bottomNavActiveIndex ?? 0);
  const [isSplashPlaying, setIsSplashPlaying] = useState<boolean>(false);
  const [showLogicIndicators, setShowLogicIndicators] = useState<boolean>(true);

  // Synchronize bottom nav active index if prop changes
  useEffect(() => {
    if (screen.properties?.bottomNavActiveIndex !== undefined) {
      setActiveBottomNavIndex(screen.properties.bottomNavActiveIndex);
    }
  }, [screen.properties?.bottomNavActiveIndex]);

  // Count total components with attached logic
  const totalActiveLogicCount = React.useMemo(() => {
    let count = 0;
    const checkComp = (c: AndroidComponent) => {
      const hasDirect = (screen.logicBlocks || []).some(
        (b) =>
          b.enabled !== false &&
          (b.componentId === c.id ||
            (b.componentName && c.name && b.componentName.toLowerCase() === c.name.toLowerCase()) ||
            (b.componentId === "actionButton" &&
              (c.type === "Button" ||
                c.name.toLowerCase().includes("button") ||
                c.props?.text?.toLowerCase()?.includes("paste"))) ||
            (b.componentId.toLowerCase().includes("button") && c.type === "Button"))
      );
      const isTarget = (screen.logicBlocks || []).some((b) =>
        (b.actions || []).some((a) => {
          const checkAct = (act: any): boolean => {
            if (!act) return false;
            if (act.targetId === c.id) return true;
            if (
              (c.type === "WebView" || c.type === "YouTubePlayer") &&
              (act.property === "url" ||
                String(act.value || "").includes("embed") ||
                String(act.value || "").includes("youtube"))
            )
              return true;
            if (
              (c.type === "TextField" || c.type === "OutlinedTextField") &&
              (act.property === "text" || String(act.value || "").includes("http"))
            )
              return true;
            if (act.subActions?.some(checkAct)) return true;
            if (act.elseActions?.some(checkAct)) return true;
            return false;
          };
          return checkAct(a);
        })
      );
      if (hasDirect || isTarget) count++;
      c.children?.forEach(checkComp);
    };
    if (screen.rootComponent) checkComp(screen.rootComponent);
    return count;
  }, [screen.logicBlocks, screen.rootComponent]);

  // Trigger live splash screen simulation when requested
  useEffect(() => {
    if (screen.properties?.showSplashScreenPreview) {
      setIsSplashPlaying(true);
      const timer = setTimeout(() => {
        setIsSplashPlaying(false);
      }, screen.properties?.splashDuration || 2200);
      return () => clearTimeout(timer);
    }
  }, [screen.properties?.showSplashScreenPreview, screen.properties?.splashDuration]);

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

    const executeAction = (act: any) => {
      if (!act) return;

      // Handle Condition Branching (e.g., isPasteMode == true?)
      if (act.conditionEnabled && act.condition) {
        const leftVar = act.condition.left;
        const currentVal =
          interactiveValues[leftVar] !== undefined
            ? interactiveValues[leftVar]
            : leftVar === "isPasteMode"
            ? true
            : undefined;

        let rightVal: any = act.condition.right;
        if (rightVal === "true") rightVal = true;
        if (rightVal === "false") rightVal = false;

        let isMet = false;
        if (act.condition.operator === "==") {
          isMet = String(currentVal) === String(rightVal);
        } else if (act.condition.operator === "!=") {
          isMet = String(currentVal) !== String(rightVal);
        }

        const nextBranch = isMet ? act.subActions || [] : act.elseActions || [];
        for (const sub of nextBranch) {
          executeAction(sub);
        }
        return;
      }

      if (act.actionType === "toast" && act.message) {
        showToast(act.message);
      } else if (act.actionType === "snackbar" && act.message) {
        setActiveSnackbar({ message: act.message, actionLabel: act.actionLabel || "DISMISS" });
        setTimeout(() => setActiveSnackbar(null), 3500);
      } else if (act.actionType === "dialog") {
        setActiveDialog({ title: act.dialogTitle || "Alert", body: act.dialogBody || "" });
      } else if (act.actionType === "navigate" && act.targetScreen && onNavigateToScreen) {
        onNavigateToScreen(act.targetScreen);
      } else if (act.actionType === "setVariable" && act.variableName) {
        let vVal: any = act.variableValue;
        if (vVal === "true") vVal = true;
        if (vVal === "false") vVal = false;
        setInteractiveValues((prev) => ({ ...prev, [act.variableName!]: vVal }));
      } else if (act.actionType === "setProperty" && act.property) {
        let val: any = act.value;
        if (val === "true") val = true;
        if (val === "false") val = false;

        if (act.targetId) {
          setRuntimePropsOverrides((prev) => ({
            ...prev,
            [act.targetId!]: {
              ...(prev[act.targetId!] || {}),
              [act.property!]: val,
            },
          }));
        } else {
          // Dynamic target resolution by component type
          if (act.property === "text") {
            const btn = (screen.components || []).find((c) => c.type === "Button");
            if (btn) {
              setRuntimePropsOverrides((prev) => ({
                ...prev,
                [btn.id]: {
                  ...(prev[btn.id] || {}),
                  text: val,
                  backgroundColor: String(val).includes("Play") ? "#DC2626" : undefined,
                },
              }));
            }
          } else if (act.property === "url") {
            const player = (screen.components || []).find((c) => c.type === "WebView" || c.type === "YouTubePlayer");
            if (player) {
              setRuntimePropsOverrides((prev) => ({
                ...prev,
                [player.id]: {
                  ...(prev[player.id] || {}),
                  url: val,
                },
              }));
            }
          }
        }
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

      // Execute non-conditional subActions
      if (!act.conditionEnabled && act.subActions && act.subActions.length > 0) {
        for (const sub of act.subActions) {
          executeAction(sub);
        }
      }
    };

    for (const act of block.actions) {
      executeAction(act);
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

    // Find attached logic blocks for this component
    const attachedBlocks = (screen.logicBlocks || []).filter(
      (b) =>
        b.enabled !== false &&
        (b.componentId === comp.id ||
          (b.componentName && comp.name && b.componentName.toLowerCase() === comp.name.toLowerCase()) ||
          (b.componentId === "actionButton" &&
            (comp.type === "Button" ||
              comp.name.toLowerCase().includes("button") ||
              comp.props?.text?.toLowerCase()?.includes("paste"))) ||
          (b.componentId.toLowerCase().includes("button") && comp.type === "Button"))
    );

    // Also check if component is an active target of logic actions (e.g. textfield updated by paste, webview updated by stream URL)
    const isTargetOfAction = (screen.logicBlocks || []).some((b) =>
      (b.actions || []).some((a) => {
        const checkAction = (act: any): boolean => {
          if (!act) return false;
          if (act.targetId === comp.id) return true;
          if (
            (comp.type === "WebView" || comp.type === "YouTubePlayer") &&
            (act.property === "url" ||
              String(act.value || "").includes("embed") ||
              String(act.value || "").includes("youtube"))
          )
            return true;
          if (
            (comp.type === "TextField" || comp.type === "OutlinedTextField") &&
            (act.property === "text" || String(act.value || "").includes("http"))
          )
            return true;
          if (act.subActions?.some(checkAction)) return true;
          if (act.elseActions?.some(checkAction)) return true;
          return false;
        };
        return checkAction(a);
      })
    );

    const hasDirectLogic = attachedBlocks.length > 0;
    const hasAttachedLogic = hasDirectLogic || isTargetOfAction;

    let logicAccentClasses = "";
    if (showLogicIndicators && hasAttachedLogic && !isSelected) {
      if (hasDirectLogic) {
        logicAccentClasses =
          "ring-2 ring-amber-500/80 shadow-[0_0_14px_rgba(245,158,11,0.25)] rounded-xl";
      } else if (isTargetOfAction) {
        logicAccentClasses =
          "ring-1.5 ring-cyan-500/70 shadow-[0_0_10px_rgba(6,182,212,0.2)] rounded-xl";
      }
    }

    const outlineClass =
      builderSettings?.showComponentOutlines && !isSelected && !hasAttachedLogic
        ? "outline outline-1 outline-blue-400/30 -outline-offset-1"
        : "";

    const commonClasses = `relative transition-all duration-150 cursor-pointer ${outlineClass} ${logicAccentClasses} ${
      isSelected
        ? "ring-2 ring-[#6750A4] ring-offset-2 ring-offset-white z-20 rounded-xl"
        : "hover:outline-dashed hover:outline-1 hover:outline-violet-400/70"
    }`;

    // Click handler that dispatches visual selection and any interactive logic
    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelectComponent(comp.id);

      // Check if this component has logic blocks
      const matchingBlocks = attachedBlocks.filter(
        (b) => b.event === "Click" || !b.event || b.event === "Tap"
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
        const val = interactiveValues[comp.id] ?? p.text ?? "";
        content = (
          <div className="my-2 space-y-1">
            <div
              style={{
                borderRadius: `${radius}px`,
                backgroundColor: colors.surface,
                borderColor: colors.outline,
                color: colors.onSurface,
              }}
              className="border px-3 py-2 text-xs flex items-center justify-between shadow-2xs transition gap-2"
            >
              <input
                type="text"
                placeholder={p.hint || "Enter text..."}
                value={val}
                onChange={(e) =>
                  setInteractiveValues((prev) => ({ ...prev, [comp.id]: e.target.value }))
                }
                style={{ color: colors.onSurface, fontFamily: typo.baseFontFamily }}
                className="w-full bg-transparent placeholder:opacity-50 outline-none"
              />
              <button
                type="button"
                title="Paste from clipboard"
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const clipText = await navigator.clipboard.readText();
                    if (clipText) {
                      setInteractiveValues((prev) => ({ ...prev, [comp.id]: clipText }));
                    }
                  } catch {
                    const fallback = prompt("Paste your YouTube URL here:", val || "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
                    if (fallback) {
                      setInteractiveValues((prev) => ({ ...prev, [comp.id]: fallback }));
                    }
                  }
                }}
                className="shrink-0 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium flex items-center gap-1 transition"
              >
                <Copy className="w-3 h-3" />
                <span>Paste</span>
              </button>
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

      case "WebView":
      case "YouTubePlayer": {
        let videoId = "dQw4w9WgXcQ";
        const rawUrl =
          interactiveValues[comp.id] ||
          p.url ||
          (interactiveValues["comp_yt_url_input"] ?? "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        const match = String(rawUrl).match(
          /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
        );
        if (match && match[1]) {
          videoId = match[1];
        }
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`;

        content = (
          <div
            style={{
              height: `${p.layoutHeight || 230}px`,
              borderRadius: `${p.cornerRadius || 14}px`,
            }}
            className="w-full bg-black flex flex-col items-center justify-center text-white relative overflow-hidden my-2 shadow-md"
          >
            <iframe
              src={embedUrl}
              title={p.title || "YouTube Video Player"}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        );
        break;
      }

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
          <div className="absolute -top-3.5 left-2 bg-[#6750A4] text-white font-mono text-[9px] px-2 py-0.5 rounded-full shadow-sm z-30 uppercase tracking-wider flex items-center gap-1.5">
            <span>=</span>
            <span>{comp.type.toLowerCase()}</span>
            {hasDirectLogic && (
              <span className="flex items-center gap-1 text-amber-300 font-bold ml-1 pl-1.5 border-l border-white/25 normal-case font-sans">
                <Zap className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                <span>Active Logic ({attachedBlocks.length})</span>
              </span>
            )}
            {!hasDirectLogic && isTargetOfAction && (
              <span className="flex items-center gap-1 text-cyan-200 font-bold ml-1 pl-1.5 border-l border-white/25 normal-case font-sans">
                <Workflow className="w-2.5 h-2.5 text-cyan-200" />
                <span>Logic Target</span>
              </span>
            )}
          </div>
        )}

        {/* Visual Indicator: Direct Attached Logic Blocks (e.g. Button with Click Flow) */}
        {showLogicIndicators && hasDirectLogic && !isSelected && (
          <div
            className="absolute -top-2.5 right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-[9px] px-2 py-0.5 rounded-full shadow-md z-30 flex items-center gap-1 border border-amber-200/70 select-none tracking-tight animate-pulse pointer-events-none"
            title={`⚡ ${attachedBlocks.length} Active Logic Block(s): ${attachedBlocks.map((b) => b.event || "Click").join(", ")}`}
          >
            <Zap className="w-2.5 h-2.5 fill-slate-950 text-slate-950 stroke-[2.5]" />
            <span>Logic: {attachedBlocks[0]?.event || "Click"}</span>
            {attachedBlocks.length > 1 && (
              <span className="bg-slate-950/25 text-[8px] px-1 rounded-full text-slate-900 font-black">
                +{attachedBlocks.length - 1}
              </span>
            )}
          </div>
        )}

        {/* Visual Indicator: Action Target Component (e.g. YouTube Video Player or Input Field) */}
        {showLogicIndicators && isTargetOfAction && !hasDirectLogic && !isSelected && (
          <div
            className="absolute -top-2.5 right-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold text-[9px] px-2 py-0.5 rounded-full shadow-md z-30 flex items-center gap-1 border border-cyan-300/40 select-none pointer-events-none"
            title={
              comp.type === "WebView" || comp.type === "YouTubePlayer"
                ? "⚡ YouTube Video Player (Stream Target for active URL)"
                : "⚡ Input Field (Target for Clipboard Paste)"
            }
          >
            <Workflow className="w-2.5 h-2.5 text-cyan-200" />
            <span>
              {comp.type === "WebView" || comp.type === "YouTubePlayer"
                ? "Video Stream Player"
                : "Logic Target"}
            </span>
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

        {/* Visual Logic Indicators Toggle & Counter Badge */}
        <button
          type="button"
          onClick={() => setShowLogicIndicators(!showLogicIndicators)}
          title={`Visual Logic Indicators (${showLogicIndicators ? "Visible" : "Hidden"} - click to toggle)`}
          className={`backdrop-blur-md shadow-sm border rounded-full px-2.5 py-1 flex items-center gap-1.5 transition text-[11px] font-semibold select-none cursor-pointer ${
            showLogicIndicators
              ? "bg-amber-500/10 text-amber-800 border-amber-300/80 hover:bg-amber-500/20"
              : "bg-white/95 text-slate-500 border-slate-200/80 hover:bg-slate-50"
          }`}
        >
          <Zap
            className={`w-3.5 h-3.5 transition-colors ${
              showLogicIndicators ? "text-amber-500 fill-amber-500" : "text-slate-400"
            }`}
          />
          <span>Active Logic</span>
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
              showLogicIndicators
                ? "bg-amber-500 text-white shadow-2xs"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {totalActiveLogicCount}
          </span>
        </button>
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

          {/* Screen Title / Top App Bar */}
          {(screen.properties?.appBarVisible ?? screen.properties?.titleVisible ?? true) && (() => {
            const sp = screen.properties;
            const variant = sp?.appBarVariant || "small";
            const titleText = sp?.appBarTitle !== undefined ? sp.appBarTitle : (sp?.title || screen.title || screen.name);
            const subtitleText = sp?.appBarSubtitle;
            const navIcon = sp?.appBarNavIcon || "back";
            const showAppIcon = sp?.appBarShowAppIcon;
            const appIconUrl = sp?.appBarAppIconUrl;
            const actions = sp?.appBarActions || [
              { id: "act-search", title: "Search", icon: "search" },
              { id: "act-more", title: "More", icon: "more-vertical" },
            ];
            const barBg = sp?.appBarBackgroundColor || sp?.primaryColor || colors.primary;
            const contentColor = sp?.appBarTextColor || "#FFFFFF";
            const elevation = sp?.appBarElevation ?? 1;

            const renderNavIconComp = () => {
              if (navIcon === "none") return null;
              const iconClasses = "w-4 h-4 stroke-[2.2]";
              let IconC = ArrowLeft;
              if (navIcon === "menu") IconC = Menu;
              else if (navIcon === "close") IconC = X;
              else if (navIcon === "home") IconC = Home;
              else if (navIcon === "search") IconC = Search;

              return (
                <button
                  type="button"
                  className="p-1.5 rounded-full hover:bg-white/15 active:scale-90 transition shrink-0"
                  title={`${navIcon} navigation`}
                >
                  <IconC className={iconClasses} style={{ color: contentColor }} />
                </button>
              );
            };

            const renderActionIconComp = (iconName: string) => {
              const iconClasses = "w-4 h-4 stroke-[2]";
              const style = { color: contentColor };
              switch (iconName) {
                case "search":
                  return <Search className={iconClasses} style={style} />;
                case "bell":
                  return <Bell className={iconClasses} style={style} />;
                case "heart":
                  return <Heart className={iconClasses} style={style} />;
                case "share":
                case "share-2":
                  return <Share2 className={iconClasses} style={style} />;
                case "settings":
                  return <Settings className={iconClasses} style={style} />;
                case "refresh":
                case "refresh-cw":
                  return <RefreshCw className={iconClasses} style={style} />;
                case "filter":
                  return <Filter className={iconClasses} style={style} />;
                case "more-vertical":
                default:
                  return <MoreVertical className={iconClasses} style={style} />;
              }
            };

            const shadowClass =
              elevation === 0
                ? "shadow-none"
                : elevation <= 2
                ? "shadow-xs"
                : elevation <= 4
                ? "shadow-md"
                : "shadow-lg";

            // Variant: Medium or Large (2-row M3 top app bar)
            if (variant === "medium" || variant === "large") {
              return (
                <div
                  style={{
                    backgroundColor: barBg,
                    color: contentColor,
                  }}
                  className={`px-3 py-2 flex flex-col justify-between z-10 shrink-0 select-none ${shadowClass} ${
                    variant === "large" ? "min-h-[96px]" : "min-h-[76px]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5">
                      {renderNavIconComp()}
                      {showAppIcon && (
                        <div className="w-5 h-5 rounded-md overflow-hidden bg-white/20 flex items-center justify-center shrink-0">
                          {appIconUrl ? (
                            <img src={appIconUrl} alt="App Icon" className="w-full h-full object-cover" />
                          ) : (
                            <Smartphone className="w-3.5 h-3.5" style={{ color: contentColor }} />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5">
                      {actions.map((act) => (
                        <button
                          key={act.id}
                          type="button"
                          title={act.title || act.icon}
                          className="p-1.5 rounded-full hover:bg-white/15 active:scale-90 transition"
                        >
                          {renderActionIconComp(act.icon)}
                        </button>
                      ))}
                      {sp?.showAboutInMenu !== false && (
                        <button
                          type="button"
                          title="More options"
                          className="p-1.5 rounded-full hover:bg-white/15 active:scale-90 transition"
                        >
                          <MoreVertical className="w-4 h-4" style={{ color: contentColor }} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Prominent Expanded Title row */}
                  <div className="pt-2 px-1">
                    <h2
                      className={`font-bold truncate leading-tight tracking-tight ${
                        variant === "large" ? "text-base font-extrabold" : "text-sm font-bold"
                      }`}
                    >
                      {titleText}
                    </h2>
                    {subtitleText && (
                      <p className="text-[10px] opacity-80 truncate leading-tight">{subtitleText}</p>
                    )}
                  </div>
                </div>
              );
            }

            // Variant: Center-Aligned
            if (variant === "center-aligned") {
              return (
                <div
                  style={{
                    backgroundColor: barBg,
                    color: contentColor,
                  }}
                  className={`px-3 py-2 flex items-center justify-between z-10 shrink-0 select-none ${shadowClass}`}
                >
                  <div className="flex items-center gap-1 min-w-[36px]">
                    {renderNavIconComp()}
                  </div>

                  <div className="flex-1 text-center px-2 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1.5">
                      {showAppIcon && (
                        <div className="w-4 h-4 rounded overflow-hidden bg-white/20 flex items-center justify-center shrink-0">
                          {appIconUrl ? (
                            <img src={appIconUrl} alt="App Icon" className="w-full h-full object-cover" />
                          ) : (
                            <Smartphone className="w-3 h-3" style={{ color: contentColor }} />
                          )}
                        </div>
                      )}
                      <span className="font-bold text-xs truncate max-w-[170px]">{titleText}</span>
                    </div>
                    {subtitleText && (
                      <span className="text-[10px] opacity-80 truncate max-w-[170px]">{subtitleText}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5 min-w-[36px] justify-end">
                    {actions.map((act) => (
                      <button
                        key={act.id}
                        type="button"
                        title={act.title || act.icon}
                        className="p-1.5 rounded-full hover:bg-white/15 active:scale-90 transition"
                      >
                        {renderActionIconComp(act.icon)}
                      </button>
                    ))}
                    {sp?.showAboutInMenu !== false && (
                      <button
                        type="button"
                        title="More options"
                        className="p-1.5 rounded-full hover:bg-white/15 active:scale-90 transition"
                      >
                        <MoreVertical className="w-4 h-4" style={{ color: contentColor }} />
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            // Variant: Small (Standard single line M3)
            return (
              <div
                style={{
                  backgroundColor: barBg,
                  color: contentColor,
                }}
                className={`px-3 py-2 flex items-center justify-between z-10 shrink-0 select-none ${shadowClass}`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {renderNavIconComp()}
                  {showAppIcon && (
                    <div className="w-5 h-5 rounded-md overflow-hidden bg-white/20 flex items-center justify-center shrink-0">
                      {appIconUrl ? (
                        <img src={appIconUrl} alt="App Icon" className="w-full h-full object-cover" />
                      ) : (
                        <Smartphone className="w-3.5 h-3.5" style={{ color: contentColor }} />
                      )}
                    </div>
                  )}
                  <div className="flex flex-col truncate">
                    <span className="font-bold text-xs truncate leading-tight">{titleText}</span>
                    {subtitleText && (
                      <span className="text-[9px] opacity-80 truncate leading-tight">{subtitleText}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  {actions.map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      title={act.title || act.icon}
                      className="p-1.5 rounded-full hover:bg-white/15 active:scale-90 transition"
                    >
                      {renderActionIconComp(act.icon)}
                    </button>
                  ))}
                  {sp?.showAboutInMenu !== false && (
                    <button
                      type="button"
                      title="More options"
                      className="p-1.5 rounded-full hover:bg-white/15 active:scale-90 transition"
                    >
                      <MoreVertical className="w-4 h-4" style={{ color: contentColor }} />
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

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

          {/* Android Bottom Navigation Bar (Material 3 Nav Bar) */}
          {screen.properties?.showBottomNavBar && (() => {
            const sp = screen.properties;
            const items = sp.bottomNavItems || [
              { id: "nav-1", label: "Home", icon: "home" },
              { id: "nav-2", label: "Search", icon: "search" },
              { id: "nav-3", label: "Explore", icon: "compass", badge: "NEW" },
              { id: "nav-4", label: "Notifications", icon: "bell", badge: "3" },
              { id: "nav-5", label: "Profile", icon: "user" },
            ];
            const navStyle = sp.bottomNavStyle || "material3";
            const showLabels = sp.bottomNavShowLabels || "always";
            const navBg = sp.bottomNavBackgroundColor || colors.surface;
            const activeColor = sp.bottomNavActiveColor || colors.primary;
            const inactiveColor = sp.bottomNavInactiveColor || "#64748B";
            const indicatorColor = sp.bottomNavIndicatorColor || (previewThemeMode === "dark" ? "#334155" : "#EEF2FF");

            const renderNavTabIcon = (iconName: string, isCurrent: boolean) => {
              const iconClasses = "w-4 h-4";
              const style = { color: isCurrent ? activeColor : inactiveColor };
              switch (iconName) {
                case "home":
                  return <Home className={iconClasses} style={style} />;
                case "search":
                  return <Search className={iconClasses} style={style} />;
                case "compass":
                  return <Compass className={iconClasses} style={style} />;
                case "bell":
                  return <Bell className={iconClasses} style={style} />;
                case "user":
                  return <User className={iconClasses} style={style} />;
                case "heart":
                  return <Heart className={iconClasses} style={style} />;
                case "bookmark":
                  return <Bookmark className={iconClasses} style={style} />;
                case "shopping-bag":
                  return <ShoppingBag className={iconClasses} style={style} />;
                case "settings":
                  return <Settings className={iconClasses} style={style} />;
                default:
                  return <Home className={iconClasses} style={style} />;
              }
            };

            return (
              <div
                style={{
                  backgroundColor: navBg,
                }}
                className={`w-full z-20 shrink-0 border-t border-black/5 select-none transition-all ${
                  navStyle === "pills"
                    ? "py-1.5 px-3 mx-auto max-w-[94%] my-1.5 rounded-2xl shadow-md"
                    : "py-1 px-1 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-around">
                  {items.map((tab, idx) => {
                    const isSelected = idx === activeBottomNavIndex;
                    const showLabel =
                      showLabels === "always" || (showLabels === "selected" && isSelected);

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveBottomNavIndex(idx)}
                        className="flex-1 flex flex-col items-center justify-center py-1 relative group transition-all"
                      >
                        {/* Tab Pill Indicator for Material 3 style */}
                        <div
                          style={{
                            backgroundColor:
                              isSelected && navStyle === "material3" ? indicatorColor : "transparent",
                          }}
                          className={`px-3.5 py-1 rounded-full flex items-center justify-center relative transition-all ${
                            isSelected && navStyle === "material3" ? "scale-105" : ""
                          }`}
                        >
                          {renderNavTabIcon(tab.icon, isSelected)}

                          {/* Badge indicator */}
                          {tab.badge && (
                            <span
                              style={{
                                backgroundColor: activeColor,
                                color: "#FFFFFF",
                              }}
                              className="absolute -top-1 -right-1 px-1.5 min-w-[14px] h-3.5 text-[8px] font-bold rounded-full flex items-center justify-center shadow-xs"
                            >
                              {tab.badge}
                            </span>
                          )}
                        </div>

                        {/* Label text */}
                        {showLabel && (
                          <span
                            style={{
                              color: isSelected ? activeColor : inactiveColor,
                            }}
                            className={`text-[10px] truncate max-w-[56px] leading-tight mt-0.5 ${
                              isSelected ? "font-bold" : "font-medium opacity-80"
                            }`}
                          >
                            {tab.label}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Android System Navigation Bar (Gesture vs 3-Button) */}
          {screen.properties?.showNavigationBar !== false && (
            <div
              style={{
                backgroundColor: screen.properties?.navigationBarColor || colors.surface,
              }}
              className="h-6 flex items-center justify-center z-20 shrink-0 select-none border-t border-black/5"
            >
              {screen.properties?.systemNavMode === "3-button" ? (
                /* Classic Android 3-Button Navigation Bar */
                <div className="w-full px-10 flex items-center justify-between opacity-60">
                  {/* Back Triangle */}
                  <button
                    type="button"
                    title="Back"
                    className="p-1 hover:opacity-100 transition active:scale-90"
                    style={{
                      color: screen.properties?.navigationBarLightIcons ? "#FFFFFF" : colors.onSurface,
                    }}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  {/* Home Circle */}
                  <button
                    type="button"
                    title="Home"
                    className="p-1 hover:opacity-100 transition active:scale-90"
                    style={{
                      color: screen.properties?.navigationBarLightIcons ? "#FFFFFF" : colors.onSurface,
                    }}
                  >
                    <Circle className="w-3.5 h-3.5 fill-current" />
                  </button>
                  {/* Recents Square */}
                  <button
                    type="button"
                    title="Overview / Recents"
                    className="p-1 hover:opacity-100 transition active:scale-90"
                    style={{
                      color: screen.properties?.navigationBarLightIcons ? "#FFFFFF" : colors.onSurface,
                    }}
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              ) : (
                /* Gesture Navigation Pill Line */
                <div
                  style={{
                    backgroundColor: screen.properties?.navigationBarLightIcons
                      ? "#FFFFFF"
                      : colors.onSurface,
                  }}
                  className="w-28 h-1 rounded-full opacity-40"
                />
              )}
            </div>
          )}

          {/* Cold-Start Splash Screen Live Simulation Overlay */}
          {isSplashPlaying && (
            <div
              style={{
                backgroundColor: screen.properties?.splashBackgroundColor || "#0F172A",
              }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-between p-8 text-white select-none animate-in fade-in duration-300"
            >
              {/* Skip Simulation Button */}
              <div className="w-full flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsSplashPlaying(false)}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold rounded-full flex items-center gap-1 transition"
                >
                  <X className="w-3 h-3" />
                  <span>Skip</span>
                </button>
              </div>

              {/* Center Logo Branding */}
              <div className="flex flex-col items-center justify-center text-center my-auto animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-2xl flex items-center justify-center p-3 mb-4 ring-4 ring-white/10">
                  {screen.properties?.splashImage ? (
                    <img
                      src={screen.properties.splashImage}
                      alt="Splash Graphic"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Smartphone className="w-10 h-10 text-white" />
                  )}
                </div>

                <h1 className="text-lg font-extrabold tracking-tight text-white mb-1 drop-shadow-sm">
                  {screen.properties?.splashTitle || screen.properties?.appBarTitle || screen.title || screen.name}
                </h1>

                {screen.properties?.splashTagline && (
                  <p className="text-xs text-violet-200 font-medium opacity-90 max-w-[220px]">
                    {screen.properties.splashTagline}
                  </p>
                )}
              </div>

              {/* Bottom Progress Spinner */}
              <div className="flex flex-col items-center justify-center gap-2">
                {screen.properties?.splashShowProgress !== false && (
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                )}
                <span className="text-[10px] text-white/50 tracking-widest uppercase font-mono">
                  Android 15 Ready
                </span>
              </div>
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
