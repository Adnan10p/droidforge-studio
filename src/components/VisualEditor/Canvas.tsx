import React, { useState, useEffect, useMemo } from "react";
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
  GripVertical,
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
  Star,
  KeyRound,
  Calendar,
  Clock,
  List,
  CircleDot,
  CheckSquare,
  ToggleLeft,
  Loader,
  Eye,
  EyeOff,
  Lock,
  ShieldAlert,
  Database,
  Cpu,
  Radio,
  MousePointerClick,
  Type,
  TextCursorInput,
  Music,
  Image as ImageIcon,
  Video,
  PlayCircle,
  Columns,
  Rows,
  SlidersHorizontal,
  Grid,
  Table,
  CreditCard,
  Box,
  Maximize,
  PanelTop,
  PlusCircle,
  MessageSquare,
  Phone,
  DollarSign,
  Megaphone,
  UserCheck,
  Home,
  Zap,
  Target,
  Mail,
} from "lucide-react";
import {
  AndroidComponent,
  AndroidScreen,
  DeviceType,
  Orientation,
  Material3Theme,
  BuilderIdeSettings,
  LogicBlock,
  LogicAction,
} from "../../types";
import { DEFAULT_M3_THEME } from "../../data/defaultTheme";
import { COMPONENT_DEFINITIONS, isNonVisibleComponent } from "../../data/componentRegistry";

interface CanvasProps {
  screen: AndroidScreen;
  screens?: AndroidScreen[];
  theme?: Material3Theme;
  deviceType: DeviceType;
  orientation: Orientation;
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  onDropNewComponent: (type: string, targetContainerId?: string, position?: "before" | "after") => void;
  onNavigateToScreen?: (screenId: string) => void;
  onOpenAiModal?: () => void;
  onToggleDeviceType?: (type: DeviceType) => void;
  onSelectScreen?: (screenId: string) => void;
  onOpenScreenManager?: () => void;
  onOpenNewScreenModal?: () => void;
  onDuplicateCurrentScreen?: () => void;
  onRenameCurrentScreen?: () => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onDeleteComponent?: (id: string) => void;
  onDuplicateComponent?: (id: string) => void;
  onReorderComponent?: (draggedId: string, targetId: string, position?: "before" | "after") => void;
  builderSettings?: BuilderIdeSettings;
}

const resolveComponentIcon = (iconName?: string, category?: string) => {
  switch (iconName) {
    case "MousePointerClick": return <MousePointerClick className="w-4 h-4 text-violet-500" />;
    case "Type": return <Type className="w-4 h-4 text-blue-500" />;
    case "TextCursorInput": return <TextCursorInput className="w-4 h-4 text-emerald-500" />;
    case "KeyRound": case "Key": return <KeyRound className="w-4 h-4 text-amber-500" />;
    case "CheckSquare": return <CheckSquare className="w-4 h-4 text-emerald-500" />;
    case "CircleDot": return <CircleDot className="w-4 h-4 text-indigo-500" />;
    case "ToggleLeft": return <ToggleLeft className="w-4 h-4 text-violet-500" />;
    case "Sliders": return <Sliders className="w-4 h-4 text-cyan-500" />;
    case "Star": return <Star className="w-4 h-4 text-amber-400 fill-amber-400" />;
    case "Loader": return <Loader className="w-4 h-4 text-violet-500 animate-spin" />;
    case "Calendar": return <Calendar className="w-4 h-4 text-rose-500" />;
    case "Clock": return <Clock className="w-4 h-4 text-blue-500" />;
    case "ChevronDown": return <ChevronDown className="w-4 h-4 text-slate-500" />;
    case "List": return <List className="w-4 h-4 text-indigo-500" />;
    case "Image": return <ImageIcon className="w-4 h-4 text-emerald-500" />;
    case "Music": return <Music className="w-4 h-4 text-pink-500" />;
    case "Video": case "PlayCircle": return <Video className="w-4 h-4 text-rose-500" />;
    case "Columns": return <Columns className="w-4 h-4 text-blue-500" />;
    case "Rows": return <Rows className="w-4 h-4 text-indigo-500" />;
    case "Grid": return <Grid className="w-4 h-4 text-violet-500" />;
    case "Table": return <Table className="w-4 h-4 text-amber-500" />;
    case "CreditCard": return <CreditCard className="w-4 h-4 text-emerald-500" />;
    case "Box": return <Box className="w-4 h-4 text-slate-500" />;
    case "Maximize": return <Maximize className="w-4 h-4 text-cyan-500" />;
    case "PanelTop": return <PanelTop className="w-4 h-4 text-violet-500" />;
    case "Search": return <Search className="w-4 h-4 text-blue-500" />;
    case "Globe": return <Globe className="w-4 h-4 text-teal-500" />;
    case "MessageSquare": return <MessageSquare className="w-4 h-4 text-violet-500" />;
    case "Sparkles": return <Sparkles className="w-4 h-4 text-amber-400" />;
    case "MapPin": return <MapPin className="w-4 h-4 text-red-500" />;
    case "Phone": return <Phone className="w-4 h-4 text-emerald-500" />;
    case "DollarSign": return <DollarSign className="w-4 h-4 text-emerald-600" />;
    case "Megaphone": return <Megaphone className="w-4 h-4 text-amber-500" />;
    case "UserCheck": return <UserCheck className="w-4 h-4 text-indigo-500" />;
    case "Bell": return <Bell className="w-4 h-4 text-amber-500" />;
    case "ShieldAlert": return <ShieldAlert className="w-4 h-4 text-rose-500" />;
    case "Database": return <Database className="w-4 h-4 text-blue-500" />;
    case "Cpu": return <Cpu className="w-4 h-4 text-violet-500" />;
    case "Radio": return <Radio className="w-4 h-4 text-indigo-500" />;
    default:
      if (category?.includes("Image") || category?.includes("Media")) return <ImageIcon className="w-4 h-4 text-emerald-500" />;
      if (category?.includes("Layout")) return <Layers className="w-4 h-4 text-blue-500" />;
      if (category?.includes("List")) return <List className="w-4 h-4 text-indigo-500" />;
      if (category?.includes("Nav")) return <PanelTop className="w-4 h-4 text-violet-500" />;
      if (category?.includes("Sensor") || category?.includes("Hardware")) return <Cpu className="w-4 h-4 text-amber-500" />;
      if (category?.includes("Map")) return <MapPin className="w-4 h-4 text-red-500" />;
      return <Sparkles className="w-4 h-4 text-violet-500" />;
  }
};

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
  onMoveUp,
  onMoveDown,
  onDeleteComponent,
  onDuplicateComponent,
  onReorderComponent,
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

  const executeActionList = (actionList: LogicAction[]) => {
    if (!actionList || actionList.length === 0) return;

    for (const act of actionList) {
      // 1. Condition evaluation
      if ((act.conditionEnabled && act.condition) || (act.subActions && act.subActions.length > 0)) {
        let conditionMet = true;
        if (act.condition) {
          const leftVal = interactiveValues[act.condition.left] ?? (act.condition.left === "isPasteMode" ? true : undefined);
          const rightVal = act.condition.right;

          if (act.condition.operator === "==") {
            conditionMet = String(leftVal) === String(rightVal);
          } else if (act.condition.operator === "!=") {
            conditionMet = String(leftVal) !== String(rightVal);
          } else if (act.condition.operator === "isEmpty") {
            conditionMet = !leftVal || String(leftVal).trim() === "";
          } else if (act.condition.operator === "isNotEmpty") {
            conditionMet = !!leftVal && String(leftVal).trim() !== "";
          }
        }

        if (conditionMet) {
          if (act.subActions) executeActionList(act.subActions);
        } else {
          if (act.elseActions) executeActionList(act.elseActions);
        }
        continue;
      }

      // 2. Action execution
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
        let val: any = act.variableValue;
        if (val === "true") val = true;
        if (val === "false") val = false;
        if (act.variableOperation === "toggle") {
          val = !interactiveValues[act.variableName];
        }
        setInteractiveValues((prev) => ({ ...prev, [act.variableName!]: val }));
      } else if (act.actionType === "setProperty") {
        let val: any = act.value;
        if (val === "true") val = true;
        if (val === "false") val = false;

        const targetIds = [act.targetId, "YouTubePlayer", "userSearchInputState", "ActionButton"].filter(Boolean) as string[];
        targetIds.forEach((tId) => {
          if (act.property) {
            setRuntimePropsOverrides((prev) => ({
              ...prev,
              [tId]: {
                ...(prev[tId] || {}),
                [act.property!]: val,
              },
            }));
          }
        });
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
      } else if (act.actionType === "hideKeyboard") {
        (document.activeElement as HTMLElement)?.blur();
        showToast("Software keyboard hidden");
      } else if (act.actionType === "showKeyboard") {
        showToast("Software keyboard opened");
      } else if (act.actionType === "moveTaskToBack") {
        showToast("App task moved to background");
      } else if (act.actionType === "setKeepScreenOn") {
        showToast("Screen wake lock enabled (Keep Screen Awake)");
      } else if (act.actionType === "share" && act.message) {
        if (navigator.share) {
          navigator.share({ title: "Share", text: act.message }).catch(() => {});
        } else {
          showToast(`Share: "${act.message}"`);
        }
      } else if (act.actionType === "openBrowser" && act.url) {
        window.open(act.url, "_blank");
      }
    }
  };

  const executeLogicBlock = (block: LogicBlock) => {
    if (!block || !block.actions || block.enabled === false) return;
    executeActionList(block.actions);
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

  const [dragOverInfo, setDragOverInfo] = useState<{
    targetId: string;
    targetName: string;
    position: "before" | "after";
  } | null>(null);

  const dragOverTargetId = dragOverInfo?.targetId || null;

  const isContainerComponent = (comp: AndroidComponent | null | undefined): boolean => {
    if (!comp) return false;
    if (comp.id === screen.rootComponent.id || comp.id === "root" || comp.type === "Screen" || comp.type === "Root") return true;

    const normType = comp.type.toLowerCase().replace(/[\s_-]+/g, "");

    // Explicit layouts
    if (
      normType.includes("layout") ||
      normType.includes("scroll") ||
      normType.includes("grid") ||
      normType.includes("card") ||
      normType.includes("container") ||
      normType.includes("frame") ||
      normType.includes("column") ||
      normType.includes("row") ||
      normType.includes("box")
    ) {
      if (normType !== "space" && !normType.includes("dynamicspace") && normType !== "spacelayout") {
        return true;
      }
    }

    const def = COMPONENT_DEFINITIONS.find((c) => c.type === comp.type || c.name === comp.name);
    if (def && def.isContainer !== undefined) {
      return def.isContainer;
    }

    return Array.isArray(comp.children) && comp.children.length > 0;
  };

  const findComponentAndParent = (
    targetId: string,
    current: AndroidComponent,
    parent: AndroidComponent | null = null
  ): { target: AndroidComponent; parent: AndroidComponent | null } | null => {
    if (current.id === targetId) {
      return { target: current, parent };
    }
    if (current.children) {
      for (const child of current.children) {
        const res = findComponentAndParent(targetId, child, current);
        if (res) return res;
      }
    }
    return null;
  };

  const resolveContainerTargetId = (targetId?: string): string => {
    const rawTarget = targetId || screen.rootComponent.id;
    const match = findComponentAndParent(rawTarget, screen.rootComponent);
    if (!match) return screen.rootComponent.id;

    let curr = match.target;
    let currParent = match.parent;

    while (curr && !isContainerComponent(curr)) {
      if (!currParent) return screen.rootComponent.id;
      const parentMatch = findComponentAndParent(currParent.id, screen.rootComponent);
      curr = currParent;
      currParent = parentMatch?.parent || null;
    }

    return curr.id;
  };

  // Handle Drag Over, Drag Leave & Drop with top/bottom relative position detection
  const handleDragOver = (e: React.DragEvent, compId?: string, compName?: string) => {
    e.preventDefault();
    e.stopPropagation();

    const isReorder =
      e.dataTransfer.types.includes("application/droidforge-reorder-id") ||
      Boolean((window as any).__droidforge_dragged_reorder_id);
    e.dataTransfer.dropEffect = isReorder ? "move" : "copy";

    const targetId = compId || screen.rootComponent.id;
    const targetName = compName || "Screen";

    const draggedId =
      e.dataTransfer.getData("application/droidforge-reorder-id") ||
      (window as any).__droidforge_dragged_reorder_id;

    if (draggedId && draggedId === targetId) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const relY = e.clientY - rect.top;
    const isTopHalf = relY < rect.height / 2;
    const position: "before" | "after" = isTopHalf ? "before" : "after";

    if (
      !dragOverInfo ||
      dragOverInfo.targetId !== targetId ||
      dragOverInfo.position !== position
    ) {
      setDragOverInfo({
        targetId,
        targetName,
        position,
      });
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverInfo(null);
  };

  const handleDrop = (e: React.DragEvent, fallbackTargetId?: string) => {
    e.preventDefault();
    e.stopPropagation();

    const info = dragOverInfo;
    setDragOverInfo(null);

    const reorderId =
      e.dataTransfer.getData("application/droidforge-reorder-id") ||
      (window as any).__droidforge_dragged_reorder_id;
    (window as any).__droidforge_dragged_reorder_id = null;

    const targetId = info?.targetId || fallbackTargetId || screen.rootComponent.id;
    const position = info?.position || "after";

    if (reorderId) {
      if (onReorderComponent) {
        onReorderComponent(reorderId, targetId, position);
      }
      return;
    }

    const type =
      e.dataTransfer.getData("application/droidforge-component") ||
      e.dataTransfer.getData("text/plain");
    if (type) {
      onDropNewComponent(type, targetId, position);
    }
  };

  const getAlignContainerStyle = (align?: string, layoutWidthProp?: any) => {
    const isFullWidth =
      layoutWidthProp === "match_parent" ||
      layoutWidthProp === "fill_max_width" ||
      layoutWidthProp === undefined ||
      layoutWidthProp === "100%";

    const widthClass = isFullWidth ? "w-full" : "w-auto max-w-full";

    switch (align) {
      case "top-left":
      case "center-left":
      case "left":
        return `${widthClass} flex justify-start items-center`;
      case "top-right":
      case "center-right":
      case "right":
        return `${widthClass} flex justify-end items-center`;
      case "top-center":
      case "center":
        return `${widthClass} flex justify-center items-center`;
      case "top-fill":
      case "bottom-fill":
      case "fill":
        return `${widthClass} w-full`;
      default:
        return widthClass;
    }
  };

  // Extract all non-visible components on the screen
  const nonVisibleComponents = useMemo(() => {
    const list: AndroidComponent[] = [];
    const traverse = (item: AndroidComponent) => {
      if (item.id !== screen.rootComponent.id && isNonVisibleComponent(item)) {
        list.push(item);
      }
      if (item.children) {
        item.children.forEach(traverse);
      }
    };
    traverse(screen.rootComponent);
    return list;
  }, [screen.rootComponent]);

  // Component renderer
  const renderInteractiveComponent = (comp: AndroidComponent, inHorizontal = false) => {
    if (comp.id !== screen.rootComponent.id && isNonVisibleComponent(comp)) {
      return null;
    }
    const isSelected = selectedComponentId === comp.id;
    const p = { ...comp.props, ...(runtimePropsOverrides[comp.id] || {}) };

    const isFullWidth =
      !inHorizontal && (
        p.layoutWidth === "match_parent" ||
        p.layoutWidth === "fill_max_width" ||
        p.layoutWidth === undefined ||
        p.layoutWidth === "100%"
      );

    const widthClass = inHorizontal
      ? (comp.type === "TextField" || comp.type === "Text Input" || comp.type === "Password Input" || p.layoutWidth === "match_parent" || p.layoutWidth === "100%" ? "flex-1 min-w-[100px]" : "flex-initial shrink-0 min-w-0")
      : (isFullWidth ? "w-full" : "w-auto max-w-full");

    const visMode = p.visibility || (p.visible === false ? "gone" : "visible");
    const isHiddenInEditor = visMode !== "visible";

    const outlineClass =
      builderSettings?.showComponentOutlines && !isSelected
        ? "outline outline-1 outline-blue-400/30 -outline-offset-1"
        : "";

    const visibilityClasses = isHiddenInEditor
      ? isSelected
        ? "opacity-60 ring-2 ring-amber-500 border-2 border-dashed border-amber-400"
        : "opacity-35 border border-dashed border-slate-400/80 grayscale-[30%]"
      : "";

    const commonClasses = `relative transition-all duration-150 cursor-grab active:cursor-grabbing ${widthClass} ${outlineClass} ${visibilityClasses} ${
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
          <div className={`${getAlignContainerStyle(p.align)} pointer-events-none`}>
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

      case "Horizontal Layout":
      case "HorizontalLayout":
      case "Horizontal Scroll Layout":
      case "HorizontalScrollLayout":
      case "Row": {
        const alignH = p.alignHorizontal || p.horizontalAlignment || "left";
        const alignV = p.alignVertical || p.verticalAlignment || "center";
        const justifyClass =
          alignH === "right"
            ? "justify-end"
            : alignH === "center"
            ? "justify-center"
            : alignH === "space-between"
            ? "justify-between"
            : "justify-start";
        const itemsClass =
          alignV === "bottom"
            ? "items-end"
            : alignV === "top"
            ? "items-start"
            : "items-center";

        content = (
          <div
            style={{
              padding: `${p.padding !== undefined ? p.padding : 8}px`,
              backgroundColor: p.backgroundColor || "transparent",
              borderRadius: `${p.cornerRadius !== undefined ? p.cornerRadius : 8}px`,
              margin: `${p.margin || 4}px 0`,
              minHeight: `${p.layoutHeight && typeof p.layoutHeight === "number" ? p.layoutHeight + 'px' : '52px'}`,
              borderColor: colors.outlineVariant,
            }}
            onDragOver={(e) => handleDragOver(e, comp.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, comp.id)}
            className={`w-full flex flex-row flex-wrap items-center gap-2 ${justifyClass} ${itemsClass} border border-dashed rounded-xl p-2.5 min-h-[52px] relative transition-colors ${
              dragOverTargetId === comp.id
                ? "border-violet-500 bg-violet-500/20 ring-2 ring-violet-500"
                : "border-violet-400/50 hover:border-violet-500"
            }`}
          >
            <div className="absolute -top-2.5 left-2 bg-violet-900/90 text-violet-200 text-[9px] font-mono px-1.5 py-0.2 rounded shadow-xs select-none pointer-events-none uppercase tracking-wider z-10">
              {comp.name || comp.type}
            </div>
            {comp.children && comp.children.length > 0 ? (
              comp.children.map((c) => renderInteractiveComponent(c, true))
            ) : (
              <div className="w-full py-3.5 text-center text-xs font-medium text-violet-400/80 border border-dashed border-violet-300/40 rounded-lg bg-violet-50/10 pointer-events-none select-none">
                + Drop components inside {comp.name || "Horizontal Layout"}
              </div>
            )}
          </div>
        );
        break;
      }

      case "Vertical Layout":
      case "VerticalLayout":
      case "Column": {
        const alignH = p.alignHorizontal || p.horizontalAlignment || "left";
        const alignV = p.alignVertical || p.verticalAlignment || "top";
        const itemsClass =
          alignH === "right"
            ? "items-end"
            : alignH === "center"
            ? "items-center"
            : "items-stretch";
        const justifyClass =
          alignV === "bottom"
            ? "justify-end"
            : alignV === "center"
            ? "justify-center"
            : alignV === "space-between"
            ? "justify-between"
            : "justify-start";

        content = (
          <div
            style={{
              padding: `${p.padding !== undefined ? p.padding : 8}px`,
              backgroundColor: p.backgroundColor || "transparent",
              borderRadius: `${p.cornerRadius || 8}px`,
              margin: `${p.margin || 4}px 0`,
              minHeight: `${p.layoutHeight && typeof p.layoutHeight === "number" ? p.layoutHeight + 'px' : '60px'}`,
              borderColor: colors.outlineVariant,
            }}
            onDragOver={(e) => handleDragOver(e, comp.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, comp.id)}
            className={`w-full flex flex-col gap-2 ${justifyClass} ${itemsClass} border border-dashed rounded-xl p-2.5 min-h-[60px] relative transition-colors ${
              dragOverTargetId === comp.id
                ? "border-indigo-500 bg-indigo-500/20 ring-2 ring-indigo-500"
                : "border-indigo-400/50 hover:border-indigo-500"
            }`}
          >
            <div className="absolute -top-2.5 left-2 bg-indigo-900/90 text-indigo-200 text-[9px] font-mono px-1.5 py-0.2 rounded shadow-xs select-none pointer-events-none uppercase tracking-wider z-10">
              {comp.name || comp.type}
            </div>
            {comp.children && comp.children.length > 0 ? (
              comp.children.map((c) => renderInteractiveComponent(c))
            ) : (
              <div className="w-full py-3.5 text-center text-xs font-medium text-indigo-400/80 border border-dashed border-indigo-300/40 rounded-lg bg-indigo-50/10 pointer-events-none select-none">
                + Drop components inside {comp.name || "Vertical Layout"}
              </div>
            )}
          </div>
        );
        break;
      }

      case "Card":
      case "Card Layout":
      case "CardLayout":
      case "Glassmorphism Card": {
        const radius = p.cornerRadius !== undefined ? p.cornerRadius : shapes.medium;
        content = (
          <div
            style={{
              backgroundColor: p.backgroundColor || colors.surface,
              color: colors.onSurface,
              borderRadius: `${radius}px`,
              padding: `${p.padding !== undefined ? p.padding : 16}px`,
              boxShadow: `0 ${(p.elevation || 2) * 2}px ${(p.elevation || 2) * 4}px rgba(0,0,0,0.06)`,
              margin: `${p.margin || 6}px 0`,
              borderColor: colors.surfaceVariant,
              fontFamily: typo.baseFontFamily,
            }}
            onDragOver={(e) => handleDragOver(e, comp.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, comp.id)}
            className={`flex flex-col gap-2.5 border min-h-[64px] relative transition-colors ${
              dragOverTargetId === comp.id
                ? "border-violet-500 bg-violet-500/10 ring-2 ring-violet-500"
                : "hover:border-violet-400"
            }`}
          >
            <div className="text-[9px] font-mono text-slate-400/80 select-none pointer-events-none uppercase tracking-wider">
              {comp.name || comp.type}
            </div>
            {comp.children && comp.children.length > 0 ? (
              comp.children.map((c) => renderInteractiveComponent(c))
            ) : (
              <div
                style={{ borderColor: colors.outlineVariant, color: colors.onSurfaceVariant }}
                className="p-4 border border-dashed rounded-xl text-center text-xs opacity-70 pointer-events-none select-none"
              >
                + Drop child components inside {comp.name || "Card"}
              </div>
            )}
          </div>
        );
        break;
      }

      case "ScrollView":
      case "Scroll Layout":
      case "ScrollLayout": {
        content = (
          <div
            style={{ padding: `${p.padding || 12}px` }}
            onDragOver={(e) => handleDragOver(e, comp.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, comp.id)}
            className={`flex flex-col gap-2.5 w-full h-full overflow-y-auto min-h-[80px] border border-dashed rounded-xl p-2.5 relative transition-colors ${
              dragOverTargetId === comp.id
                ? "border-blue-500 bg-blue-500/20 ring-2 ring-blue-500"
                : "border-blue-400/50 hover:border-blue-500"
            }`}
          >
            <div className="text-[9px] font-mono text-blue-500/80 select-none pointer-events-none uppercase tracking-wider">
              {comp.name || comp.type}
            </div>
            {comp.children && comp.children.length > 0 ? (
              comp.children.map((c) => renderInteractiveComponent(c))
            ) : (
              <div
                style={{ borderColor: colors.outlineVariant, color: colors.onSurfaceVariant }}
                className="p-6 border-2 border-dashed rounded-2xl text-center text-xs opacity-60 pointer-events-none select-none"
              >
                + Drop components inside {comp.name || "Scroll Layout"}
              </div>
            )}
          </div>
        );
        break;
      }

      case "Grid Layout":
      case "GridLayout":
      case "Table Layout":
      case "TableLayout":
      case "Frame Layout":
      case "FrameLayout":
      case "Box":
      case "Space Layout": {
        const columns = p.columns || 2;
        content = (
          <div
            style={{
              padding: `${p.padding !== undefined ? p.padding : 8}px`,
              backgroundColor: p.backgroundColor || "transparent",
              borderRadius: `${p.cornerRadius || 8}px`,
              margin: `${p.margin || 4}px 0`,
            }}
            onDragOver={(e) => handleDragOver(e, comp.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, comp.id)}
            className={`w-full ${
              comp.type.includes("Grid") || comp.type.includes("Table")
                ? `grid grid-cols-${Math.min(columns, 4)} gap-2`
                : "flex flex-col gap-2"
            } border border-dashed rounded-xl p-2.5 min-h-[60px] relative transition-colors ${
              dragOverTargetId === comp.id
                ? "border-teal-500 bg-teal-500/20 ring-2 ring-teal-500"
                : "border-teal-400/50 hover:border-teal-500"
            }`}
          >
            <div className="absolute -top-2.5 left-2 bg-teal-900/90 text-teal-200 text-[9px] font-mono px-1.5 py-0.2 rounded shadow-xs select-none pointer-events-none uppercase tracking-wider z-10">
              {comp.name || comp.type}
            </div>
            {comp.children && comp.children.length > 0 ? (
              comp.children.map((c) => renderInteractiveComponent(c))
            ) : (
              <div className="w-full py-4 text-center text-xs text-teal-500/80 border border-dashed border-teal-300/40 rounded-lg bg-teal-50/10 pointer-events-none select-none col-span-full">
                + Drop components inside {comp.name || comp.type}
              </div>
            )}
          </div>
        );
        break;
      }

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
      case "Text Label":
      case "TextLabel":
      case "Label":
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
              {p.text || comp.name || "Text Label"}
            </p>
          </div>
        );
        break;

      case "Image":
      case "Image View":
      case "ImageView":
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
                p.src ||
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

      case "TextField":
      case "Text Input":
      case "TextInput":
      case "Input": {
        const radius = p.cornerRadius !== undefined ? p.cornerRadius : shapes.extraSmall;
        content = (
          <div className="my-2 space-y-1">
            {p.label && (
              <span className="text-[11px] font-semibold text-slate-700 block" style={{ fontFamily: typo.baseFontFamily }}>
                {p.label}
              </span>
            )}
            <div
              style={{
                borderRadius: `${radius}px`,
                backgroundColor: colors.surface,
                borderColor: colors.outline,
                color: colors.onSurface,
              }}
              className="border px-3.5 py-2.5 text-xs flex items-center justify-between shadow-2xs transition focus-within:ring-2 focus-within:ring-violet-500"
            >
              <input
                type="text"
                placeholder={p.hint || p.placeholder || "Enter text..."}
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

      case "Password Input":
      case "PasswordInput": {
        const radius = p.cornerRadius !== undefined ? p.cornerRadius : shapes.extraSmall;
        const [showPass, setShowPass] = useState(false);
        content = (
          <div className="my-2 space-y-1">
            <div
              style={{
                borderRadius: `${radius}px`,
                backgroundColor: colors.surface,
                borderColor: colors.outline,
                color: colors.onSurface,
              }}
              className="border px-3.5 py-2.5 text-xs flex items-center justify-between shadow-2xs transition"
            >
              <input
                type={showPass ? "text" : "password"}
                placeholder={p.hint || "Enter password..."}
                value={interactiveValues[comp.id] ?? p.text ?? ""}
                onChange={(e) =>
                  setInteractiveValues((prev) => ({ ...prev, [comp.id]: e.target.value }))
                }
                style={{ color: colors.onSurface, fontFamily: typo.baseFontFamily }}
                className="w-full bg-transparent placeholder:opacity-50 outline-none pr-2 font-mono"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPass(!showPass);
                }}
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        );
        break;
      }

      case "Checkbox":
      case "Check Box":
      case "CheckBox": {
        const isChecked = interactiveValues[comp.id] ?? p.checked ?? false;
        const radius = `${shapes.extraSmall}px`;
        content = (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setInteractiveValues((prev) => ({ ...prev, [comp.id]: !isChecked }));
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
              className="w-4 h-4 flex items-center justify-center border transition shrink-0"
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

      case "Radio Button":
      case "RadioButton": {
        const isChecked = interactiveValues[comp.id] ?? p.checked ?? false;
        content = (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setInteractiveValues((prev) => ({ ...prev, [comp.id]: !isChecked }));
            }}
            className="flex items-center gap-2.5 py-1.5 cursor-pointer select-none"
          >
            <div
              style={{
                borderColor: isChecked ? colors.primary : colors.outline,
              }}
              className="w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition shrink-0"
            >
              {isChecked && (
                <div style={{ backgroundColor: colors.primary }} className="w-2.5 h-2.5 rounded-full" />
              )}
            </div>
            <span
              style={{ color: p.textColor || colors.onSurface, fontSize: `${p.fontSize || 14}px`, fontFamily: typo.baseFontFamily }}
              className="text-xs font-medium"
            >
              {p.text || "Radio Choice"}
            </span>
          </div>
        );
        break;
      }

      case "Switch":
      case "Toggle Switch":
      case "ToggleSwitch": {
        const isChecked = interactiveValues[comp.id] ?? p.checked ?? true;
        content = (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setInteractiveValues((prev) => ({ ...prev, [comp.id]: !isChecked }));
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

      case "Rating Bar":
      case "RatingBar": {
        const currentRating = interactiveValues[comp.id] ?? p.value ?? 4;
        const maxStars = p.max || 5;
        content = (
          <div className="py-2 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">RatingBar</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: maxStars }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setInteractiveValues((prev) => ({ ...prev, [comp.id]: idx + 1 }));
                  }}
                  className="p-0.5 hover:scale-110 transition cursor-pointer"
                >
                  <Star
                    className={`w-5 h-5 ${
                      idx < currentRating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-300"
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-mono font-bold text-slate-600 ml-1.5">({currentRating}.0)</span>
            </div>
          </div>
        );
        break;
      }

      case "Progress":
      case "Progress Bar":
      case "ProgressBar":
        content = (
          <div className="py-2 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>ProgressBar</span>
              <span>{p.progress || 65}%</span>
            </div>
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

      case "Circular Loader":
      case "CircularLoader":
      case "Spinner":
        content = (
          <div className="py-3 flex items-center justify-center gap-2">
            <Loader className="w-6 h-6 animate-spin text-violet-600" />
            <span className="text-xs font-medium text-slate-600 font-mono">Loading...</span>
          </div>
        );
        break;

      case "Date Picker":
      case "DatePicker":
        content = (
          <div className="my-2 space-y-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showToast("Date Picker Dialog opened");
              }}
              style={{
                borderRadius: `${shapes.extraSmall}px`,
                backgroundColor: colors.surface,
                borderColor: colors.outline,
                color: colors.onSurface,
              }}
              className="w-full border px-3.5 py-2.5 text-xs flex items-center justify-between shadow-2xs hover:bg-slate-50 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-600" />
                <span className="font-medium">{p.text || "Sep 19, 2026"}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Select Date</span>
            </button>
          </div>
        );
        break;

      case "Time Picker":
      case "TimePicker":
        content = (
          <div className="my-2 space-y-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showToast("Time Picker Dialog opened");
              }}
              style={{
                borderRadius: `${shapes.extraSmall}px`,
                backgroundColor: colors.surface,
                borderColor: colors.outline,
                color: colors.onSurface,
              }}
              className="w-full border px-3.5 py-2.5 text-xs flex items-center justify-between shadow-2xs hover:bg-slate-50 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-600" />
                <span className="font-medium">{p.text || "12:45 PM"}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Select Time</span>
            </button>
          </div>
        );
        break;

      case "Drop Down":
      case "Dropdown":
      case "DropDown": {
        const items = p.items || ["Option A", "Option B", "Option C"];
        const selected = items[interactiveValues[comp.id] ?? 0] || items[0];
        content = (
          <div className="my-2 space-y-1">
            <div
              style={{
                borderRadius: `${shapes.extraSmall}px`,
                backgroundColor: colors.surface,
                borderColor: colors.outline,
                color: colors.onSurface,
              }}
              className="border px-3.5 py-2.5 text-xs flex items-center justify-between shadow-2xs cursor-pointer"
            >
              <span className="font-medium">{selected}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        );
        break;
      }

      case "List Picker":
      case "ListPicker": {
        const items = p.items || ["Item 1 (Default)", "Item 2 (Option)", "Item 3 (Choice)"];
        content = (
          <div className="my-2 p-3 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-1 border-b border-slate-100">
              <span className="flex items-center gap-1.5">
                <List className="w-4 h-4 text-violet-600" />
                <span>{p.title || "List Picker Select"}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">{items.length} items</span>
            </div>
            <div className="space-y-1">
              {items.map((it: string, idx: number) => (
                <div
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setInteractiveValues((prev) => ({ ...prev, [comp.id]: idx }));
                    showToast(`List Picker selected: ${it}`);
                  }}
                  className={`p-2 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                    (interactiveValues[comp.id] ?? 0) === idx
                      ? "bg-violet-50 text-violet-700 font-bold border border-violet-200"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <span>{it}</span>
                  {(interactiveValues[comp.id] ?? 0) === idx && <Check className="w-3.5 h-3.5 text-violet-600 stroke-[3]" />}
                </div>
              ))}
            </div>
          </div>
        );
        break;
      }

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

      default: {
        const typeLower = comp.type.toLowerCase();
        const nameLower = comp.name.toLowerCase();
        const normType = comp.type.toLowerCase().replace(/[\s_-]+/g, "");
        const normName = comp.name.toLowerCase().replace(/[\s_-]+/g, "");

        // Detect Custom Component Archetype
        const isYouTube =
          normType.includes("youtube") ||
          normName.includes("youtube") ||
          normType.includes("ytplayer") ||
          (p.animationUrl && String(p.animationUrl).includes("youtube")) ||
          (p.url && String(p.url).includes("youtube"));

        const isLottie =
          normType.includes("lottie") ||
          normName.includes("lottie") ||
          normType.includes("animation") ||
          p.animationUrl ||
          p.animSource ||
          p.lottieUrl;

        const isChart =
          normType.includes("chart") ||
          normName.includes("chart") ||
          normType.includes("graph") ||
          p.lineColor ||
          p.chartTitle;

        const isPillNav =
          normType.includes("pillbottomnav") ||
          normType.includes("bottomnav") ||
          normName.includes("pillbottom") ||
          normType.includes("tabbar") ||
          (p.items && p.icons) ||
          p.selectedColor ||
          p.indicatorColor;

        const isGlassCard =
          normType.includes("glasscard") ||
          normName.includes("glass") ||
          normType.includes("frostedglass") ||
          normType.includes("glassmorphism") ||
          p.blurRadius ||
          p.accentColor;

        const isListView =
          normType.includes("listview") ||
          normType.includes("recycler") ||
          normName.includes("list") ||
          normType.includes("staggered") ||
          normType.includes("feed");

        const isCustomBtn =
          (normType.includes("button") || normName.includes("button")) &&
          !isPillNav;

        const isBannerAd =
          normType.includes("banner") ||
          normName.includes("banner");

        const isNativeAd =
          normType.includes("nativead") ||
          normName.includes("nativead") ||
          (normType.includes("native") && normType.includes("ad")) ||
          (normName.includes("native") && normName.includes("ad"));

        const isMediumRectangleAd =
          normType.includes("mediumrectangle") ||
          normName.includes("mediumrectangle") ||
          normType.includes("rectad");

        const isDynamicLabel =
          normType.includes("dynamiclabel") ||
          normName.includes("dynamiclabel");

        const isDynamicButton =
          normType.includes("dynamicbutton") ||
          normName.includes("dynamicbutton");

        const isDynamicImage =
          normType.includes("dynamicimage") ||
          normName.includes("dynamicimage");

        const isDynamicInput =
          normType.includes("dynamictextinput") ||
          normType.includes("dynamicinput") ||
          normName.includes("dynamictextinput");

        const isDynamicCard =
          normType.includes("dynamiccard") ||
          normName.includes("dynamiccard");

        const isDynamicSpace =
          normType.includes("dynamicspace") ||
          normName.includes("dynamicspace");

        const isSpace =
          comp.type === "Space" ||
          normType === "space" ||
          (normType.includes("space") && !normType.includes("dynamic"));

        const isEmailPicker =
          normType.includes("emailpicker") ||
          normName.includes("emailpicker") ||
          normType.includes("email");

        const isContactPicker =
          normType.includes("contactpicker") ||
          normName.includes("contactpicker") ||
          normType.includes("contact");

        const isPhonePicker =
          normType.includes("phonenumberpicker") ||
          normType.includes("phonepicker") ||
          normName.includes("phonepicker");

        const isDrawingCanvas =
          (normType.includes("canvas") || normName.includes("canvas")) &&
          !normType.includes("lottie");

        const isMap =
          (normType.includes("map") || normName.includes("map")) &&
          !normType.includes("bitmap");

        const isBarcodeScanner =
          normType.includes("scanner") ||
          normType.includes("barcode") ||
          normType.includes("qrcode");

        if (isYouTube) {
          const videoTitle = p.videoTitle || p.title || p.text || comp.name || "YouTube Video Player";
          const duration = p.duration || "10:24";
          const channel = p.channel || p.author || "DroidForge Studio";

          content = (
            <div className="my-2 rounded-2xl overflow-hidden border border-red-500/30 bg-[#0F0F0F] text-white shadow-xl select-none">
              <div className="px-3 py-2 bg-gradient-to-r from-red-950/80 via-black to-slate-900 border-b border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-red-600 flex items-center justify-center text-white shadow-xs">
                    <Play className="w-3 h-3 fill-white translate-x-0.5" />
                  </div>
                  <span className="font-bold tracking-tight text-[11px] text-red-400">YouTube Player</span>
                </div>
                <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/60">
                  4K ULTRA HD
                </span>
              </div>

              <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-zinc-900 to-black flex items-center justify-center group overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/30 via-violet-950/20 to-black opacity-80" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="relative z-10 w-14 h-10 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-2xl flex items-center justify-center transition-all duration-200 group-hover:scale-110 cursor-pointer border border-red-400/40">
                  <Play className="w-6 h-6 fill-white translate-x-0.5" />
                </div>

                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[10px] font-mono font-bold text-white border border-white/10">
                  {duration}
                </div>

                <div className="absolute top-2 left-2 right-2 text-xs font-semibold drop-shadow-md truncate text-slate-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                  <span className="truncate">{videoTitle}</span>
                </div>
              </div>

              <div className="px-3 py-2 bg-zinc-900/90 border-t border-white/5 space-y-2">
                <div className="relative w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="w-2/5 h-full bg-red-600 rounded-full" />
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <div className="flex items-center gap-2">
                    <button className="text-white hover:text-red-400 transition">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button className="hover:text-white transition">
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-[10px] text-zinc-400">03:42 / {duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
                    <span className="truncate max-w-[100px] text-[10px] text-zinc-400">by {channel}</span>
                    <Maximize2 className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          );
        } else if (isLottie) {
          const urlVal = p.animationUrl || p.animSource || p.lottieUrl || "https://assets9.lottiefiles.com/packages/lf20_myejig9g.json";
          const speedVal = p.speed !== undefined ? p.speed : 1;
          const isLooping = p.repeatCount !== false && p.loop !== false;

          content = (
            <div className="my-2 p-4 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80 text-white shadow-xl relative overflow-hidden select-none">
              <div className="absolute -right-8 -top-8 w-28 h-28 bg-violet-600/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -left-8 -bottom-8 w-28 h-28 bg-pink-600/20 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-violet-600/30 border border-violet-400/40 flex items-center justify-center text-violet-300 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: `${3 / speedVal}s` }} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-violet-200 leading-tight truncate">{comp.name || "Lottie Animation Viewer"}</h4>
                    <span className="text-[9px] font-mono text-violet-400 block truncate max-w-[160px]">
                      {urlVal}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-700/60">
                    {speedVal}x
                  </span>
                  {isLooping && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                      ∞ Loop
                    </span>
                  )}
                </div>
              </div>

              <div className="relative h-28 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:12px_12px] opacity-30" />
                
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-20 h-20 rounded-full border-2 border-violet-400/40 animate-ping" style={{ animationDuration: `${2 / speedVal}s` }} />
                  <div className="absolute w-16 h-16 rounded-full border border-pink-400/60 animate-pulse" />
                  
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-violet-600 to-pink-500 p-0.5 shadow-lg shadow-violet-500/50 flex items-center justify-center animate-bounce" style={{ animationDuration: `${1.5 / speedVal}s` }}>
                    <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-pink-300">
                      <PlayCircle className="w-6 h-6 fill-violet-500/20" />
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] font-mono text-slate-400 px-2 py-0.5 bg-black/60 rounded backdrop-blur-xs">
                  <span>FRAME 48/120</span>
                  <span className="text-emerald-400 font-bold">● ACTIVE ANIMATION</span>
                </div>
              </div>
            </div>
          );
        } else if (isChart) {
          const chartTitle = p.chartTitle || p.title || comp.name || "Weekly Revenue Growth";
          const lineColor = p.lineColor || "#10B981";
          const showFill = p.enableFill !== false;

          content = (
            <div className="my-2 p-3.5 rounded-2xl border border-slate-700/60 bg-[#0F172A] text-white shadow-xl select-none space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{chartTitle}</h4>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                    <span>▲ +24.8%</span>
                    <span className="text-slate-400 font-normal">this period</span>
                  </span>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                  MPAndroidChart
                </span>
              </div>

              <div className="relative h-28 w-full bg-slate-900/80 rounded-xl p-2 border border-slate-800 flex flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none opacity-20">
                  <div className="w-full border-b border-white" />
                  <div className="w-full border-b border-white" />
                  <div className="w-full border-b border-white" />
                </div>

                <svg className="w-full h-full overflow-visible z-10" viewBox="0 0 240 70" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id={`chart-grad-${comp.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={lineColor} stopOpacity={showFill ? "0.45" : "0"} />
                      <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {showFill && (
                    <path
                      d="M 0 50 Q 40 20, 80 40 T 160 15 T 240 25 L 240 70 L 0 70 Z"
                      fill={`url(#chart-grad-${comp.id})`}
                    />
                  )}

                  <path
                    d="M 0 50 Q 40 20, 80 40 T 160 15 T 240 25"
                    fill="none"
                    stroke={lineColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  <circle cx="0" cy="50" r="3.5" fill={lineColor} className="animate-ping opacity-75" />
                  <circle cx="80" cy="40" r="3.5" fill={lineColor} />
                  <circle cx="160" cy="15" r="4.5" fill="#FFFFFF" stroke={lineColor} strokeWidth="2.5" />
                  <circle cx="240" cy="25" r="3.5" fill={lineColor} />
                </svg>

                <div className="flex justify-between text-[9px] font-mono text-slate-400 z-10 pt-1 border-t border-slate-800">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>
          );
        } else if (isPillNav) {
          const rawItems = p.items ? (Array.isArray(p.items) ? p.items.join(",") : String(p.items)) : "Menu, Home, Settings, Search, Profile";
          const rawIcons = p.icons ? (Array.isArray(p.icons) ? p.icons.join(",") : String(p.icons)) : "menu, home, settings, search, person";

          const itemsList = rawItems.split(",").map((s: string) => s.trim()).filter(Boolean);
          const iconsList = rawIcons.split(",").map((s: string) => s.trim()).filter(Boolean);

          const activeIdx = typeof p.selectedIndex === "number" ? p.selectedIndex : 1;
          const bgColor = p.backgroundColor || "#000000";
          const selColor = p.selectedColor || "#FFFFFF";
          const unselColor = p.unselectedColor || "#94A3B8";
          const indColor = p.indicatorColor || "#222222";
          const showLabels = p.showLabels !== false;

          const getMaterialIcon = (icName?: string) => {
            const norm = (icName || "").toLowerCase();
            if (norm.includes("home")) return <Home className="w-4 h-4" />;
            if (norm.includes("search")) return <Search className="w-4 h-4" />;
            if (norm.includes("setting") || norm.includes("gear")) return <Settings className="w-4 h-4" />;
            if (norm.includes("person") || norm.includes("user") || norm.includes("profile")) return <UserCheck className="w-4 h-4" />;
            if (norm.includes("bell") || norm.includes("notif")) return <Bell className="w-4 h-4" />;
            if (norm.includes("menu")) return <Menu className="w-4 h-4" />;
            if (norm.includes("star")) return <Star className="w-4 h-4" />;
            if (norm.includes("heart")) return <Heart className="w-4 h-4" />;
            if (norm.includes("camera")) return <Camera className="w-4 h-4" />;
            return <Compass className="w-4 h-4" />;
          };

          content = (
            <div className="my-3 px-2 flex justify-center select-none">
              <div
                style={{ backgroundColor: bgColor }}
                className="rounded-full shadow-2xl border border-white/10 p-1.5 flex items-center justify-around gap-1 max-w-full overflow-x-auto scrollbar-none"
              >
                {itemsList.map((itemName: string, idx: number) => {
                  const isSel = idx === activeIdx;
                  const iconName = iconsList[idx] || "circle";
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectComponent(comp.id);
                        setRuntimePropsOverrides((prev) => ({
                          ...prev,
                          [comp.id]: { ...(prev[comp.id] || {}), selectedIndex: idx },
                        }));
                      }}
                      style={{
                        backgroundColor: isSel ? indColor : "transparent",
                        color: isSel ? selColor : unselColor,
                      }}
                      className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                        isSel ? "shadow-md scale-105" : "hover:opacity-80"
                      }`}
                    >
                      {getMaterialIcon(iconName)}
                      {showLabels && (
                        <span className={`text-[11px] font-medium tracking-tight ${!isSel ? "hidden sm:inline" : ""}`}>
                          {itemName}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        } else if (isGlassCard) {
          const glassTitle = p.title || p.text || comp.name || "Frosted Glass Surface";
          const blurVal = p.blurRadius !== undefined ? p.blurRadius : 16;
          const accentColor = p.accentColor || "#8B5CF6";

          content = (
            <div
              style={{
                backdropFilter: `blur(${blurVal}px)`,
                WebkitBackdropFilter: `blur(${blurVal}px)`,
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                borderColor: accentColor,
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, comp.id)}
              className="my-2 p-4 rounded-2xl border border-opacity-40 shadow-xl space-y-3 relative overflow-hidden select-none"
            >
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm tracking-tight" style={{ color: colors.onSurface }}>
                  {glassTitle}
                </h3>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/20 font-semibold backdrop-blur-xs">
                  Blur {blurVal}dp
                </span>
              </div>

              {comp.children && comp.children.length > 0 ? (
                <div className="space-y-2">
                  {comp.children.map((c) => renderInteractiveComponent(c))}
                </div>
              ) : (
                <div className="p-4 border border-white/20 border-dashed rounded-xl text-center text-xs opacity-70">
                  Drop child components inside Glass Card
                </div>
              )}
            </div>
          );
        } else if (isListView) {
          const listTitle = p.title || p.name || comp.name || "ListView Image Text";
          const count = p.itemsCount || p.itemCount || 4;
          const imgUrl = p.imageUrl || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809";
          const showBadges = p.showBadges !== false;
          const accentColor = p.accentColor || "#6750A4";

          const sampleItems = Array.from({ length: count }, (_, i) => ({
            id: i,
            title: i === 0 ? "Android Jetpack Compose Guide" : i === 1 ? "Material 3 Design Tokens" : i === 2 ? "Coil Async Image Loader" : `List Item Title #${i + 1}`,
            sub: `High-performance image & text row #${i + 1}`,
            rating: (4.9 - (i % 3) * 0.1).toFixed(1),
          }));

          content = (
            <div className="my-2 p-3 rounded-2xl border border-slate-700/60 bg-slate-900 text-white shadow-xl space-y-2 select-none">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4 text-violet-400" />
                  <h4 className="text-xs font-bold text-slate-100">{listTitle}</h4>
                </div>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-violet-300 border border-slate-700">
                  ListView ({count} items)
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {sampleItems.map((item) => (
                  <div key={item.id} className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 flex items-center justify-between transition">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0 relative">
                        <img src={imgUrl} alt="Thumb" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-semibold text-slate-200 truncate">{item.title}</h5>
                        <p className="text-[10px] text-slate-400 truncate">{item.sub}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {showBadges && (
                        <span
                          style={{ backgroundColor: `${accentColor}25`, color: accentColor, borderColor: `${accentColor}50` }}
                          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border flex items-center gap-0.5"
                        >
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>{item.rating}</span>
                        </span>
                      )}
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        } else if (isCustomBtn) {
          const btnText = p.text || p.label || comp.name || "Custom Action";
          content = (
            <div className={getAlignContainerStyle(p.align)}>
              <button
                style={{
                  backgroundColor: p.backgroundColor || colors.primary,
                  color: p.textColor || colors.onPrimary,
                  borderRadius: `${p.cornerRadius || 16}px`,
                  fontFamily: typo.baseFontFamily,
                }}
                className="px-5 py-2.5 font-medium transition flex items-center justify-center gap-2 shadow-md active:scale-95 hover:opacity-90 my-1"
              >
                <Sparkles className="w-4 h-4 stroke-[2]" />
                <span>{btnText}</span>
              </button>
            </div>
          );
        } else if (isBannerAd) {
          const adUnitId = p.adUnitId || "ca-app-pub-3904354314207361/6300978111";
          content = (
            <div className="my-2 p-2.5 rounded-xl bg-[#121212] border border-blue-500/30 text-white shadow-md flex items-center justify-between gap-3 select-none">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-extrabold text-[10px] text-white shrink-0 shadow-xs">
                  Ad
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-100 truncate">{comp.name || "Banner Ad"}</span>
                    <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-extrabold uppercase">320x50</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 block truncate">AdMob: {adUnitId}</span>
                </div>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] shrink-0 shadow-sm transition">
                INSTALL
              </button>
            </div>
          );
        } else if (isNativeAd) {
          content = (
            <div className="my-2 p-3.5 rounded-2xl bg-slate-900 border border-violet-500/30 text-white shadow-xl select-none space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-xs text-white shadow-md">
                    Ad
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs text-slate-100">{comp.name || "Native Ad Unit"}</h4>
                      <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-extrabold text-[8px]">SPONSORED</span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-medium">★★★★★ 4.9 • Google Play</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Build native Android applications with high speed component logic and visual blocks.
              </p>
              <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition">
                DOWNLOAD / INSTALL NOW
              </button>
            </div>
          );
        } else if (isMediumRectangleAd) {
          content = (
            <div className="my-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-white shadow-xl select-none space-y-2 max-w-[300px] mx-auto">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800">
                  Ad • Sponsored
                </span>
                <span className="font-mono text-slate-400">300x250 Medium Rect</span>
              </div>
              <div className="h-32 rounded-xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-white/10 flex flex-col items-center justify-center p-2 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:12px_12px] opacity-20" />
                <Megaphone className="w-7 h-7 text-violet-400 mb-1" />
                <span className="text-xs font-bold text-white relative z-10">{comp.name || "Medium Rectangle Ad"}</span>
                <span className="text-[9px] font-mono text-violet-300/70 relative z-10">AdMob 300x250 Surface</span>
              </div>
              <button className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition">
                LEARN MORE
              </button>
            </div>
          );
        } else if (isDynamicLabel) {
          content = (
            <div className="my-1.5 p-2.5 rounded-xl bg-violet-950/50 border border-violet-500/40 flex items-center justify-between text-xs select-none">
              <span className="text-violet-200 font-semibold">{p.text || comp.name || "Dynamic Label Output"}</span>
              <span className="px-2 py-0.5 rounded-full bg-violet-900 text-violet-300 font-mono text-[9px] font-bold border border-violet-700 flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 text-amber-400 fill-current" />
                DYNAMIC
              </span>
            </div>
          );
        } else if (isDynamicButton) {
          content = (
            <div className={getAlignContainerStyle(p.align)}>
              <button className="my-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-xs flex items-center gap-2 shadow-md active:scale-95 transition">
                <Zap className="w-4 h-4 fill-current text-amber-300" />
                <span>{p.text || comp.name || "Dynamic Action"}</span>
              </button>
            </div>
          );
        } else if (isDynamicImage) {
          content = (
            <div className="my-2 h-32 w-full rounded-2xl bg-slate-900 border border-violet-500/40 flex flex-col items-center justify-center text-violet-300 space-y-1 relative overflow-hidden select-none">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-950/40 to-transparent" />
              <ImageIcon className="w-8 h-8 text-violet-400" />
              <span className="text-xs font-bold">{comp.name || "Dynamic Image Slot"}</span>
              <span className="text-[9px] font-mono text-violet-400/70">Runtime Image URL Binding</span>
            </div>
          );
        } else if (isDynamicInput) {
          content = (
            <div className="my-1.5 p-3 rounded-xl bg-slate-900 border border-violet-500/40 flex items-center justify-between text-xs text-slate-300">
              <span className="text-slate-400">{p.hint || "Dynamic Input Field..."}</span>
              <span className="text-[9px] font-mono font-bold text-violet-400 bg-violet-950 px-2 py-0.5 rounded-full border border-violet-800 flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 text-amber-400 fill-current" />
                INPUT
              </span>
            </div>
          );
        } else if (isDynamicCard) {
          content = (
            <div
              onDragOver={(e) => handleDragOver(e, comp.id)}
              onDrop={(e) => handleDrop(e, comp.id)}
              className="my-2 p-3.5 rounded-2xl border-2 border-dashed border-violet-500/50 bg-violet-950/20 space-y-2"
            >
              <div className="flex items-center justify-between border-b border-violet-500/20 pb-1.5">
                <span className="text-xs font-bold text-violet-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  {comp.name || "Dynamic Card Container"}
                </span>
                <span className="text-[9px] font-mono text-violet-400">Dynamic UI</span>
              </div>
              {comp.children && comp.children.length > 0 ? (
                comp.children.map((c) => renderInteractiveComponent(c))
              ) : (
                <div className="p-3 text-center text-xs text-violet-400/60 font-mono">
                  + Drop child components inside Dynamic Card
                </div>
              )}
            </div>
          );
        } else if (isDynamicSpace) {
          content = (
            <div className="my-1 py-1.5 w-full border-t border-b border-dashed border-violet-500/30 bg-violet-950/10 text-center text-[9px] font-mono text-violet-400 select-none">
              ↕ Dynamic Space ({p.height || 16}dp)
            </div>
          );
        } else if (isDrawingCanvas) {
          content = (
            <div className="my-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-white shadow-xl select-none space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-pink-400" />
                  <span className="font-bold">{comp.name || "Drawing Canvas"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                </div>
              </div>
              <div className="h-36 rounded-xl bg-slate-900 border border-slate-800 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />
                <span className="text-xs font-mono text-slate-500">2D Touch Drawing Pad Canvas</span>
              </div>
            </div>
          );
        } else if (isMap) {
          content = (
            <div className="my-2 rounded-2xl overflow-hidden border border-emerald-500/30 bg-slate-900 text-white shadow-xl relative select-none">
              <div className="h-40 w-full bg-[#1A202C] relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] [background-size:24px_24px]" />
                <div className="absolute top-2 left-2 right-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 flex items-center gap-2 text-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-400">Search Google Maps...</span>
                </div>
                <div className="relative z-10 flex flex-col items-center">
                  <MapPin className="w-8 h-8 text-red-500 animate-bounce fill-red-500/20" />
                  <span className="text-[10px] font-bold font-mono bg-slate-900 px-2 py-0.5 rounded-full border border-slate-700 shadow-md">
                    {comp.name || "Google Maps Vector Engine"}
                  </span>
                </div>
              </div>
            </div>
          );
        } else if (isBarcodeScanner) {
          content = (
            <div className="my-2 h-40 rounded-2xl bg-black border border-emerald-500/40 relative flex items-center justify-center overflow-hidden select-none">
              <div className="absolute inset-4 border-2 border-emerald-500/80 rounded-xl flex items-center justify-center">
                <div className="w-full h-0.5 bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              </div>
              <span className="absolute bottom-2 text-[10px] font-mono text-emerald-400 font-bold bg-black/80 px-2 py-0.5 rounded">
                📷 {comp.name || "Barcode & QR Scanner Active"}
              </span>
            </div>
          );
        } else if (isSpace) {
          const spaceH = typeof p.layoutHeight === "number" ? p.layoutHeight : typeof p.height === "number" ? p.height : parseInt(String(p.layoutHeight || p.height || 16), 10) || 16;
          const spaceW = typeof p.layoutWidth === "number" ? p.layoutWidth : typeof p.width === "number" ? p.width : undefined;
          const heightPx = p.layoutHeight === "match_parent" ? "100%" : `${spaceH}px`;
          const widthPx = spaceW ? `${spaceW}px` : p.layoutWidth === "match_parent" ? "100%" : "100%";

          content = (
            <div
              style={{
                height: heightPx,
                width: widthPx,
                minHeight: isSelected ? "22px" : `${Math.max(1, spaceH)}px`,
              }}
              className={`transition-all relative w-full ${
                isSelected
                  ? "my-0.5 border border-dashed border-violet-400 bg-violet-500/10 rounded-lg flex items-center justify-center text-[10px] font-mono text-violet-400 select-none font-bold shadow-2xs"
                  : "bg-transparent select-none"
              }`}
            >
              {isSelected && (
                <span className="px-1.5 py-0.2 rounded bg-violet-950/80 text-violet-200 text-[9px] font-mono border border-violet-700/60 shadow-xs">
                  ↕ Space ({spaceH}dp)
                </span>
              )}
            </div>
          );
        } else if (isEmailPicker) {
          content = (
            <div className="my-2 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-md flex items-center justify-between select-none">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-violet-400" />
                <div>
                  <span className="text-xs font-bold text-slate-100 block">{comp.name || "Email Picker"}</span>
                  <span className="text-[10px] font-mono text-slate-400">{p.text || "Select Email Address"}</span>
                </div>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800">
                Contact UI
              </span>
            </div>
          );
        } else if (isPhonePicker) {
          content = (
            <div className="my-2 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-md flex items-center justify-between select-none">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-xs font-bold text-slate-100 block">{comp.name || "Phone Picker"}</span>
                  <span className="text-[10px] font-mono text-slate-400">{p.text || "Select Phone Number"}</span>
                </div>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Contact UI
              </span>
            </div>
          );
        } else if (isContactPicker) {
          content = (
            <div className="my-2 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-md flex items-center justify-between select-none">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center font-bold text-sm text-white">
                  JD
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Jane Doe</h5>
                  <span className="text-[10px] font-mono text-slate-400">+1 555-0199</span>
                </div>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800">
                Contact Component
              </span>
            </div>
          );
        } else {
          // Standard / Fallback Custom Component Renderer
          const def = COMPONENT_DEFINITIONS.find((d) => d.type === comp.type || d.name === comp.name);
          const iconName = def?.iconName || "Sparkles";
          const cat = def?.category || comp.category || "Custom Component";
          const iconEl = resolveComponentIcon(iconName, cat);
          const isContainerComp =
            comp.children !== undefined ||
            (def?.isContainer && comp.type !== "Space" && normType !== "space") ||
            (cat === "Layouts" && comp.type !== "Space" && normType !== "space" && !comp.type.includes("Space"));

          const displayProps = Object.entries(p).filter(
            ([k, v]) =>
              v !== undefined &&
              v !== "" &&
              typeof v !== "object" &&
              k !== "layoutWidth" &&
              k !== "layoutHeight" &&
              k !== "padding" &&
              k !== "margin" &&
              k !== "align" &&
              k !== "variant"
          ).slice(0, 3);

          content = (
            <div
              onDragOver={isContainerComp ? (e) => handleDragOver(e, comp.id) : undefined}
              onDragLeave={isContainerComp ? handleDragLeave : undefined}
              onDrop={isContainerComp ? (e) => handleDrop(e, comp.id) : undefined}
              className={`p-3.5 rounded-xl border bg-slate-900 text-slate-100 space-y-2 shadow-md my-1.5 transition relative ${
                dragOverTargetId === comp.id
                  ? "border-violet-400 bg-violet-950/60 ring-2 ring-violet-500"
                  : "border-violet-500/30 hover:border-violet-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-violet-900/50 border border-violet-700/50 flex items-center justify-center shrink-0">
                    {iconEl}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight text-white">{comp.name}</h4>
                    <span className="text-[10px] font-mono block text-violet-300">
                      {comp.type}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-semibold font-mono bg-violet-950 text-violet-300 border border-violet-800">
                  {cat}
                </span>
              </div>

              {displayProps.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1.5 border-t border-slate-800 text-[10px] font-mono">
                  {displayProps.map(([k, v]) => (
                    <span key={k} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {k}: <strong className="text-violet-300">{String(v)}</strong>
                    </span>
                  ))}
                </div>
              )}

              {isContainerComp && (
                <div className="pt-2 border-t border-violet-500/20 space-y-2">
                  {comp.children && comp.children.length > 0 ? (
                    comp.children.map((c) => renderInteractiveComponent(c))
                  ) : (
                    <div className="p-3 border border-violet-400/30 border-dashed rounded-lg text-center text-xs text-violet-300/70">
                      + Drop components inside {comp.name}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }
        break;
      }
    }

    const attachedBlocks = (screen.logicBlocks || []).filter(
      (b) => (b.componentId === comp.id || b.componentName === comp.name) && b.enabled !== false
    );

    const isTargetOfAction = (screen.logicBlocks || []).some((b) => {
      const checkAction = (a: any): boolean => {
        if (a.targetId === comp.id || a.targetId === comp.name) return true;
        if (a.subActions && a.subActions.some(checkAction)) return true;
        if (a.elseActions && a.elseActions.some(checkAction)) return true;
        return false;
      };
      return (b.actions || []).some(checkAction);
    });

    return (
      <div
        key={comp.id}
        id={`canvas-comp-${comp.id}`}
        onClick={handleClick}
        draggable={comp.id !== screen.rootComponent.id}
        onDragStart={(e) => {
          e.stopPropagation();
          (window as any).__droidforge_dragged_reorder_id = comp.id;
          e.dataTransfer.setData("application/droidforge-reorder-id", comp.id);
          e.dataTransfer.setData("text/plain", comp.id);
          e.dataTransfer.effectAllowed = "move";
        }}
        onDragEnd={() => {
          (window as any).__droidforge_dragged_reorder_id = null;
        }}
        onDragOver={(e) => handleDragOver(e, comp.id, comp.name || comp.type)}
        onDrop={(e) => handleDrop(e, comp.id)}
        className={commonClasses}
      >
        {/* Drop Target Visual Position Indicator (BEFORE / ABOVE) */}
        {dragOverInfo?.targetId === comp.id && dragOverInfo.position === "before" && comp.id !== screen.rootComponent.id && (
          <div className="absolute inset-x-0 -top-2 z-50 flex items-center justify-center pointer-events-none animate-in fade-in zoom-in-95 duration-150">
            <div className="w-full h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-400 rounded-full shadow-[0_0_14px_rgba(124,58,237,0.9)] relative flex items-center justify-center animate-pulse">
              <span className="bg-[#6750A4] text-white text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-violet-300 shadow-md transform -translate-y-1/2 uppercase tracking-wider flex items-center gap-1">
                ⬆ Insert Above ({dragOverInfo.targetName})
              </span>
            </div>
          </div>
        )}

        {/* Drop Target Visual Position Indicator (AFTER / BELOW) */}
        {dragOverInfo?.targetId === comp.id && dragOverInfo.position === "after" && comp.id !== screen.rootComponent.id && (
          <div className="absolute inset-x-0 -bottom-2 z-50 flex items-center justify-center pointer-events-none animate-in fade-in zoom-in-95 duration-150">
            <div className="w-full h-1.5 bg-gradient-to-r from-emerald-400 via-indigo-500 to-violet-500 rounded-full shadow-[0_0_14px_rgba(16,185,129,0.9)] relative flex items-center justify-center animate-pulse">
              <span className="bg-emerald-700 text-white text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-md transform translate-y-1/2 uppercase tracking-wider flex items-center gap-1">
                ⬇ Insert Below ({dragOverInfo.targetName})
              </span>
            </div>
          </div>
        )}

        {/* Component name & action badge on selection */}
        {isSelected && (
          <div className="absolute -top-4 left-1 bg-[#6750A4] text-white font-mono text-[9px] px-2 py-0.5 rounded-full shadow-md z-30 flex items-center gap-1.5 uppercase tracking-wider select-none cursor-grab active:cursor-grabbing">
            <GripVertical className="w-3 h-3 text-violet-200" />
            <span className="font-bold">{comp.name || comp.type.toLowerCase()}</span>
            {visMode !== "visible" && (
              <span className="px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-extrabold text-[8px] uppercase">{visMode}</span>
            )}
            {comp.id !== screen.rootComponent.id && (
              <>
                <span className="opacity-40">|</span>
                <button
                  type="button"
                  title="Move Component Up"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveUp?.(comp.id);
                  }}
                  className="hover:bg-white/20 px-1 py-0.2 rounded cursor-pointer transition font-bold text-[10px]"
                >
                  ▲
                </button>
                <button
                  type="button"
                  title="Move Component Down"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveDown?.(comp.id);
                  }}
                  className="hover:bg-white/20 px-1 py-0.2 rounded cursor-pointer transition font-bold text-[10px]"
                >
                  ▼
                </button>
                <button
                  type="button"
                  title="Duplicate Component"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateComponent?.(comp.id);
                  }}
                  className="hover:bg-white/20 px-1 py-0.2 rounded cursor-pointer transition font-bold"
                >
                  📋
                </button>
                <button
                  type="button"
                  title="Delete Component"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteComponent?.(comp.id);
                  }}
                  className="hover:bg-rose-500 px-1 py-0.2 rounded cursor-pointer transition font-bold"
                >
                  ✕
                </button>
              </>
            )}
          </div>
        )}

        {/* Visual Logic Indicators: Trigger Zap Badge */}
        {attachedBlocks.length > 0 && !isSelected && (
          <div className="absolute -top-2 -left-2 z-30 bg-amber-500 text-slate-950 font-extrabold text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-md border border-amber-300 pointer-events-none animate-pulse">
            <Zap className="w-3 h-3 fill-slate-950" />
            <span>TRIGGER</span>
          </div>
        )}

        {/* Visual Logic Indicators: Target Badge */}
        {isTargetOfAction && (
          <div className="absolute -bottom-2 -right-2 z-30 bg-blue-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-md border border-blue-400 pointer-events-none">
            <Target className="w-3 h-3" />
            <span>TARGET</span>
          </div>
        )}

        {content}
        {!isContainerComponent(comp) && comp.children && comp.children.length > 0 && (
          <div className="w-full mt-2 border-2 border-amber-500/60 border-dashed rounded-xl p-2 bg-amber-500/10 text-slate-100 select-none">
            <div className="text-[9px] font-mono text-amber-400 font-bold mb-1 flex items-center justify-between">
              <span>⚠️ Trapped Children inside ({comp.name}):</span>
              <span className="text-[8px] font-mono bg-amber-500 text-slate-950 px-1 rounded font-extrabold">Auto Fallback Render</span>
            </div>
            <div className="space-y-1.5">
              {comp.children.map((c) => renderInteractiveComponent(c, inHorizontal))}
            </div>
          </div>
        )}
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
        return "bg-[var(--ide-shell-bg)] transition-colors duration-200";
      case "isometric":
        return "bg-[#0B0F19] bg-[linear-gradient(30deg,#1E293B_12%,transparent_12.5%,transparent_87%,#1E293B_87.5%,#1E293B),linear-gradient(150deg,#1E293B_12%,transparent_12.5%,transparent_87%,#1E293B_87.5%,#1E293B),linear-gradient(30deg,#1E293B_12%,transparent_12.5%,transparent_87%,#1E293B_87.5%,#1E293B)] [background-size:40px_70px]";
      case "circuit":
        return "bg-[#060A14] bg-[radial-gradient(#38BDF8_1.2px,transparent_1.2px),linear-gradient(to_right,#1E293B_1px,transparent_1px),linear-gradient(to_bottom,#1E293B_1px,transparent_1px)] [background-size:32px_32px]";
      case "gradient":
        return "bg-[radial-gradient(ellipse_at_center,#1E1B4B_0%,#090D16_70%)]";
      case "crosshatch":
        return "bg-[#0F172A] bg-[linear-gradient(45deg,#1E293B_25%,transparent_25%),linear-gradient(-45deg,#1E293B_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1E293B_75%),linear-gradient(-45deg,transparent_75%,#1E293B_75%)] [background-size:24px_24px]";
      case "hexagon":
        return "bg-[#0A0E17] bg-[radial-gradient(circle,#6366F1_1.5px,transparent_1.5px)] [background-size:22px_22px]";
      case "dots":
      default:
        return "bg-[var(--ide-shell-bg)] bg-[radial-gradient(var(--ide-border)_1.2px,transparent_1.2px)] [background-size:16px_16px]";
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
            onDragOver={(e) => handleDragOver(e, screen.rootComponent.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, screen.rootComponent.id)}
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
            className={`flex-1 relative transition-colors ${
              dragOverTargetId === screen.rootComponent.id
                ? "bg-indigo-500/10 ring-2 ring-indigo-500 ring-inset"
                : ""
            } ${
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

      {/* Non-Visible Components Dock */}
      {nonVisibleComponents.length > 0 && (
        <div className="z-20 my-3 w-full max-w-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-2xl space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-200 tracking-tight">Non-Visible Components</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-violet-950 text-violet-300 border border-violet-800">
                {nonVisibleComponents.length}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Background services / sensors / logic</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin scrollbar-thumb-slate-700">
            {nonVisibleComponents.map((comp) => {
              const isSelected = selectedComponentId === comp.id;
              const def = COMPONENT_DEFINITIONS.find((d) => d.type === comp.type || d.name === comp.name);
              const iconName = def?.iconName || "Cpu";
              const cat = def?.category || comp.category || "Non-Visible";

              return (
                <div
                  key={comp.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectComponent(comp.id);
                  }}
                  className={`px-3 py-2 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all shrink-0 select-none ${
                    isSelected
                      ? "bg-violet-950/90 border-violet-400 ring-2 ring-violet-500/60 shadow-lg text-white"
                      : "bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                    isSelected
                      ? "bg-violet-600/40 border-violet-400 text-violet-200"
                      : "bg-slate-900 border-slate-700 text-slate-400"
                  }`}>
                    {resolveComponentIcon(iconName, cat)}
                  </div>
                  <div className="min-w-0 pr-1">
                    <div className="text-xs font-bold truncate leading-tight">{comp.name}</div>
                    <div className="text-[9px] font-mono text-violet-400/80 truncate">{comp.type}</div>
                  </div>

                  {isSelected && comp.id !== screen.rootComponent.id && (
                    <button
                      type="button"
                      title="Delete Component"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteComponent?.(comp.id);
                      }}
                      className="ml-1 p-1 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded transition font-bold text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

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
