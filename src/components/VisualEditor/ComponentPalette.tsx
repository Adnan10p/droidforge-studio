import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Type,
  MousePointerClick,
  Image as ImageIcon,
  Video,
  Globe,
  CreditCard,
  List,
  SlidersHorizontal,
  TextCursorInput,
  CheckSquare,
  ToggleLeft,
  Sliders,
  Loader,
  AlertCircle,
  Sheet,
  PanelTop,
  Menu,
  MapPin,
  Camera,
  FolderOpen,
  Volume2,
  PlayCircle,
  Bell,
  Bluetooth,
  Wifi,
  Navigation,
  Compass,
  Users,
  Share2,
  ExternalLink,
  Plus,
  Info,
  X,
  Code2,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronRight,
  CircleDot,
  PlusCircle,
  Tag,
  Split,
  Edit3,
  Layers,
  Link2,
  Languages,
  Settings,
  Star,
  Calendar,
  Clock,
  KeyRound,
  Columns,
  Rows,
  Grid,
  Table,
  Box,
  Maximize,
  Music,
  MessageSquare,
  Activity,
  Sun,
  Smartphone,
  Gauge,
  Thermometer,
  Droplets,
  Mic,
  Database,
  HardDrive,
  FileText,
  Cloud,
  Download,
  Upload,
  Usb,
  Cpu,
  Battery,
  Lock,
  Copy,
  Terminal,
  ShieldCheck,
  DollarSign,
  ShoppingBag,
  Eye,
  EyeOff,
  Radio,
  Scan,
  QrCode,
  Trash2,
} from "lucide-react";
import {
  COMPONENT_DEFINITIONS,
  ComponentDefinition,
  VISIBLE_CATEGORIES,
  NON_VISIBLE_CATEGORIES,
  ALL_CATEGORIES,
  isNonVisibleCategory,
  isNonVisibleComponent,
} from "../../data/componentRegistry";
import { AndroidComponent, ComponentCategory, CustomComponentDefinition } from "../../types";
import { ComponentTree } from "./ComponentTree";

interface ComponentPaletteProps {
  onSelectComponentType: (type: string) => void;
  activeRailTab?: string;
  onSelectRailTab?: (tab: string) => void;
  onOpenAiModal?: () => void;
  onOpenAppProperties?: () => void;
  onOpenBuilderSettings?: () => void;
  onOpenCustomComponentModal?: (existing?: CustomComponentDefinition | null) => void;
  customComponents?: CustomComponentDefinition[];
  onDeleteCustomComponent?: (id: string) => void;
  rootComponent?: AndroidComponent;
  screenName?: string;
  selectedComponentId?: string | null;
  onSelectComponent?: (id: string) => void;
  onDeleteComponent?: (id: string) => void;
  onDuplicateComponent?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onReorderComponent?: (draggedId: string, targetId: string) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Button: <MousePointerClick className="w-4 h-4" />,
  IconButton: <CircleDot className="w-4 h-4" />,
  FAB: <PlusCircle className="w-4 h-4" />,
  ExtendedFAB: <Edit3 className="w-4 h-4" />,
  SplitButton: <Split className="w-4 h-4" />,
  Chip: <Tag className="w-4 h-4" />,
  CreditCard: <CreditCard className="w-4 h-4" />,
  SlidersHorizontal: <SlidersHorizontal className="w-4 h-4" />,
  List: <List className="w-4 h-4" />,
  PanelTop: <PanelTop className="w-4 h-4" />,
  Sheet: <Sheet className="w-4 h-4" />,
  Menu: <Menu className="w-4 h-4" />,
  AlertCircle: <AlertCircle className="w-4 h-4" />,
  Type: <Type className="w-4 h-4" />,
  Image: <ImageIcon className="w-4 h-4" />,
  Video: <Video className="w-4 h-4" />,
  Globe: <Globe className="w-4 h-4" />,
  TextCursorInput: <TextCursorInput className="w-4 h-4" />,
  CheckSquare: <CheckSquare className="w-4 h-4" />,
  ToggleLeft: <ToggleLeft className="w-4 h-4" />,
  Sliders: <Sliders className="w-4 h-4" />,
  Loader: <Loader className="w-4 h-4" />,
  MapPin: <MapPin className="w-4 h-4" />,
  Camera: <Camera className="w-4 h-4" />,
  FolderOpen: <FolderOpen className="w-4 h-4" />,
  Volume2: <Volume2 className="w-4 h-4" />,
  PlayCircle: <PlayCircle className="w-4 h-4" />,
  Bell: <Bell className="w-4 h-4" />,
  Bluetooth: <Bluetooth className="w-4 h-4" />,
  Wifi: <Wifi className="w-4 h-4" />,
  Navigation: <Navigation className="w-4 h-4" />,
  Compass: <Compass className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  Share2: <Share2 className="w-4 h-4" />,
  ExternalLink: <ExternalLink className="w-4 h-4" />,
  Star: <Star className="w-4 h-4" />,
  Calendar: <Calendar className="w-4 h-4" />,
  Clock: <Clock className="w-4 h-4" />,
  KeyRound: <KeyRound className="w-4 h-4" />,
  Columns: <Columns className="w-4 h-4" />,
  Rows: <Rows className="w-4 h-4" />,
  Grid: <Grid className="w-4 h-4" />,
  Table: <Table className="w-4 h-4" />,
  Box: <Box className="w-4 h-4" />,
  Maximize: <Maximize className="w-4 h-4" />,
  Music: <Music className="w-4 h-4" />,
  MessageSquare: <MessageSquare className="w-4 h-4" />,
  Activity: <Activity className="w-4 h-4" />,
  Sun: <Sun className="w-4 h-4" />,
  Smartphone: <Smartphone className="w-4 h-4" />,
  Gauge: <Gauge className="w-4 h-4" />,
  Thermometer: <Thermometer className="w-4 h-4" />,
  Droplets: <Droplets className="w-4 h-4" />,
  Mic: <Mic className="w-4 h-4" />,
  Database: <Database className="w-4 h-4" />,
  HardDrive: <HardDrive className="w-4 h-4" />,
  FileText: <FileText className="w-4 h-4" />,
  Cloud: <Cloud className="w-4 h-4" />,
  Download: <Download className="w-4 h-4" />,
  Upload: <Upload className="w-4 h-4" />,
  Usb: <Usb className="w-4 h-4" />,
  Cpu: <Cpu className="w-4 h-4" />,
  Battery: <Battery className="w-4 h-4" />,
  Lock: <Lock className="w-4 h-4" />,
  Copy: <Copy className="w-4 h-4" />,
  Terminal: <Terminal className="w-4 h-4" />,
  ShieldCheck: <ShieldCheck className="w-4 h-4" />,
  DollarSign: <DollarSign className="w-4 h-4" />,
  ShoppingBag: <ShoppingBag className="w-4 h-4" />,
  Radio: <Radio className="w-4 h-4" />,
  Scan: <Scan className="w-4 h-4" />,
  QrCode: <QrCode className="w-4 h-4" />,
};

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({
  onSelectComponentType,
  activeRailTab = "components",
  onSelectRailTab,
  onOpenAiModal,
  onOpenAppProperties,
  onOpenBuilderSettings,
  onOpenCustomComponentModal,
  customComponents = [],
  onDeleteCustomComponent,
  rootComponent,
  screenName,
  selectedComponentId,
  onSelectComponent,
  onDeleteComponent,
  onDuplicateComponent,
  onMoveUp,
  onMoveDown,
  onReorderComponent,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibilityTab, setVisibilityTab] = useState<"all" | "visible" | "non-visible">("all");

  // Accordions state: open categories
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    "Basic UI": true,
    Layouts: true,
    "Images & Media UI": false,
    Lists: false,
    "Navigation UI": false,
    "Advanced UI": false,
    "Device Sensors": true,
    Location: false,
    "Camera & Scanning": false,
    Audio: false,
    "Files & Storage": false,
    "Backend Services": false,
    Networking: false,
    "Cloud / Modern Backend": false,
  });

  // Tooltip Popover state
  const [activeInfoDef, setActiveInfoDef] = useState<ComponentDefinition | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [isPinned, setIsPinned] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const computePosition = (targetEl: HTMLElement) => {
    const rect = targetEl.getBoundingClientRect();
    const tooltipWidth = 340;
    const tooltipEstimatedHeight = 360;

    let left = rect.right + 12;
    if (left + tooltipWidth > window.innerWidth) {
      left = Math.max(10, rect.left - tooltipWidth - 12);
    }

    let top = rect.top - 16;
    if (top + tooltipEstimatedHeight > window.innerHeight - 20) {
      top = Math.max(16, window.innerHeight - tooltipEstimatedHeight - 20);
    }
    if (top < 16) top = 16;

    return { top, left };
  };

  const handleToggleInfo = (def: ComponentDefinition, event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (activeInfoDef?.type === def.type && isPinned) {
      setActiveInfoDef(null);
      setIsPinned(false);
    } else {
      const pos = computePosition(event.currentTarget);
      setTooltipPos(pos);
      setActiveInfoDef(def);
      setIsPinned(true);
    }
  };

  const handleMouseEnterInfo = (def: ComponentDefinition, event: React.MouseEvent<HTMLElement>) => {
    if (isPinned) return;
    const currentTarget = event.currentTarget;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      const pos = computePosition(currentTarget);
      setTooltipPos(pos);
      setActiveInfoDef(def);
    }, 150);
  };

  const handleMouseLeaveInfo = () => {
    if (isPinned) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveInfoDef(null);
    }, 200);
  };

  const closeTooltip = () => {
    setActiveInfoDef(null);
    setIsPinned(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const activeCategories =
    visibilityTab === "visible"
      ? VISIBLE_CATEGORIES
      : visibilityTab === "non-visible"
      ? NON_VISIBLE_CATEGORIES
      : ALL_CATEGORIES;

  const filteredComponents = COMPONENT_DEFINITIONS.filter((item) => {
    if (visibilityTab === "visible" && !item.isVisible) return false;
    if (visibilityTab === "non-visible" && item.isVisible) return false;

    if (!searchTerm) return true;
    return (
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="flex h-full shrink-0 select-none">
      {/* 1. Far Left Tool Rail */}
      <nav
        id="tool-rail-sidebar"
        style={{
          backgroundColor: "var(--ide-card-bg)",
          borderColor: "var(--ide-border)",
          color: "var(--ide-text)",
        }}
        className="w-12 border-r flex flex-col items-center justify-between py-3 z-10"
      >
        <div className="flex flex-col items-center gap-2">
          {/* Add Component Pill */}
          <button
            onClick={() => onSelectRailTab && onSelectRailTab("components")}
            title="Components Library"
            style={{
              backgroundColor: activeRailTab === "components" ? "var(--ide-accent)" : "transparent",
              color: activeRailTab === "components" ? "var(--ide-accent-text)" : "var(--ide-text-muted)",
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer hover:opacity-90"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Component Layers / Tree */}
          <button
            onClick={() => onSelectRailTab && onSelectRailTab("layers")}
            title="Component Tree Hierarchy"
            style={{
              backgroundColor: activeRailTab === "layers" ? "var(--ide-accent)" : "transparent",
              color: activeRailTab === "layers" ? "var(--ide-accent-text)" : "var(--ide-text-muted)",
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer hover:opacity-90"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Create Custom Component Tab */}
          <button
            id="rail-create-custom-component-btn"
            onClick={() => {
              if (onSelectRailTab) onSelectRailTab("custom");
              if (onOpenCustomComponentModal) {
                onOpenCustomComponentModal();
              }
            }}
            title="Create Custom Component (Studio & Maker)"
            style={{
              backgroundColor: activeRailTab === "custom" ? "var(--ide-accent)" : "transparent",
              color: activeRailTab === "custom" ? "var(--ide-accent-text)" : "var(--ide-text-muted)",
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer hover:opacity-90"
          >
            <Code2 className="w-4 h-4" />
          </button>

          {/* AI Generator Trigger */}
          <button
            onClick={onOpenAiModal}
            title="Ask AI Assistant"
            style={{ color: "var(--ide-accent)" }}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer hover:bg-violet-500/10"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Rail Actions */}
        <div className="flex flex-col items-center gap-2">
          <button
            title="Localization & Languages"
            style={{ color: "var(--ide-text-muted)" }}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-500/20 transition cursor-pointer"
          >
            <Languages className="w-4 h-4" />
          </button>
          <button
            id="rail-open-builder-settings-btn"
            onClick={onOpenBuilderSettings || onOpenAppProperties}
            title="Builder Settings (Appearance, Themes, Canvas Snapping, Code Studio)"
            style={{ color: "var(--ide-text-muted)" }}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-500/20 transition cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* 2. Components Library & Hierarchy Drawer */}
      <aside
        id="component-palette-sidebar"
        style={{
          backgroundColor: "var(--ide-shell-bg)",
          borderColor: "var(--ide-border)",
          color: "var(--ide-text)",
        }}
        className="w-72 sm:w-80 border-r flex flex-col h-full overflow-hidden"
      >
        {/* Top Header with Tab Switcher between Components, Hierarchy & Custom */}
        <div
          style={{
            backgroundColor: "var(--ide-card-bg)",
            borderColor: "var(--ide-border)",
          }}
          className="p-2.5 pb-2 border-b shrink-0"
        >
          <div
            style={{
              backgroundColor: "var(--ide-card-inner-bg)",
              borderColor: "var(--ide-border)",
            }}
            className="flex p-0.5 rounded-full text-xs font-semibold border"
          >
            <button
              id="sidebar-tab-components"
              type="button"
              onClick={() => onSelectRailTab && onSelectRailTab("components")}
              style={{
                backgroundColor:
                  activeRailTab !== "layers" && activeRailTab !== "custom"
                    ? "var(--ide-card-bg)"
                    : "transparent",
                color:
                  activeRailTab !== "layers" && activeRailTab !== "custom"
                    ? "var(--ide-text)"
                    : "var(--ide-text-muted)",
              }}
              className="flex-1 py-1 px-2 rounded-full transition flex items-center justify-center gap-1 text-[11px] font-bold cursor-pointer"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" />
              <span>Components</span>
            </button>
            <button
              id="sidebar-tab-hierarchy"
              type="button"
              onClick={() => onSelectRailTab && onSelectRailTab("layers")}
              style={{
                backgroundColor: activeRailTab === "layers" ? "var(--ide-card-bg)" : "transparent",
                color: activeRailTab === "layers" ? "var(--ide-text)" : "var(--ide-text-muted)",
              }}
              className="flex-1 py-1 px-2 rounded-full transition flex items-center justify-center gap-1 text-[11px] font-bold cursor-pointer"
            >
              <Layers className="w-3 h-3 text-violet-400" />
              <span>Hierarchy</span>
            </button>
            <button
              id="sidebar-tab-custom"
              type="button"
              onClick={() => onSelectRailTab && onSelectRailTab("custom")}
              style={{
                backgroundColor: activeRailTab === "custom" ? "var(--ide-card-bg)" : "transparent",
                color: activeRailTab === "custom" ? "var(--ide-text)" : "var(--ide-text-muted)",
              }}
              className="flex-1 py-1 px-2 rounded-full transition flex items-center justify-center gap-1 text-[11px] font-bold cursor-pointer"
            >
              <Code2 className="w-3 h-3 text-violet-400" />
              <span>Custom</span>
            </button>
          </div>
        </div>

        {/* View 1: Component Tree Hierarchy */}
        {activeRailTab === "layers" ? (
          rootComponent ? (
            <div className="flex-1 overflow-hidden h-full flex flex-col">
              <ComponentTree
                rootComponent={rootComponent}
                screenName={screenName}
                selectedComponentId={selectedComponentId || null}
                onSelectComponent={(id) => onSelectComponent?.(id)}
                onDeleteComponent={(id) => onDeleteComponent?.(id)}
                onDuplicateComponent={(id) => onDuplicateComponent?.(id)}
                onMoveUp={(id) => onMoveUp?.(id)}
                onMoveDown={(id) => onMoveDown?.(id)}
                onReorderComponent={(draggedId, targetId) => onReorderComponent?.(draggedId, targetId)}
              />
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center h-full">
              <Layers className="w-8 h-8 text-slate-300 mb-2" />
              <p>No active screen hierarchy available</p>
            </div>
          )
        ) : activeRailTab === "custom" ? (
          /* View 2: Custom Component Studio & Maker Drawer */
          <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Custom Component Maker</span>
                <span className="text-[10px] text-slate-500">Kotlin & Jetpack Compose Studio</span>
              </div>
              <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                100% Gradle Auto-Linked
              </span>
            </div>

            {/* Create Custom Component Button */}
            <button
              onClick={() => onOpenCustomComponentModal?.()}
              className="w-full py-2.5 px-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Create Custom Component</span>
            </button>

            {/* Custom Components List & Empty State */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider block" style={{ color: "var(--ide-text-muted)" }}>
                Available Custom Components ({customComponents?.length || 0})
              </span>

              {(!customComponents || customComponents.length === 0) && (
                <div
                  className="p-4 rounded-xl border border-dashed text-center space-y-2 select-none"
                  style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)" }}
                >
                  <Code2 className="w-6 h-6 mx-auto text-violet-400 opacity-80" />
                  <p className="text-xs font-semibold" style={{ color: "var(--ide-text)" }}>
                    No Custom Components Yet
                  </p>
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--ide-text-muted)" }}>
                    Click <strong>+ Create Custom Component</strong> above to build your own Jetpack Compose Kotlin component.
                  </p>
                </div>
              )}

              {(customComponents || []).map((comp) => (
                <div
                  key={comp.id || comp.type}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("application/droidforge-component", comp.type);
                    e.dataTransfer.setData("text/plain", comp.type);
                  }}
                  className="p-3 rounded-xl border shadow-2xs space-y-2 hover:border-violet-400 transition cursor-grab active:cursor-grabbing group"
                  style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center justify-center shrink-0">
                        <Code2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs" style={{ color: "var(--ide-text)" }}>{comp.name}</h4>
                        <span className="text-[10px] font-mono" style={{ color: "var(--ide-text-muted)" }}>{comp.type}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] line-clamp-2" style={{ color: "var(--ide-text-muted)" }}>{comp.description}</p>

                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="px-1.5 py-0.5 rounded font-medium border" style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}>
                      {(comp.properties || []).length} Props
                    </span>
                    <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-mono font-medium">
                      {(comp.requiredLibraries || []).length} Dependencies
                    </span>
                  </div>

                  <div className="pt-1.5 flex items-center gap-1.5 border-t" style={{ borderColor: "var(--ide-border)" }}>
                    <button
                      type="button"
                      onClick={() => onSelectComponentType(comp.type)}
                      className="flex-1 py-1 px-2 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white rounded-lg font-semibold text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add to Screen</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenCustomComponentModal?.(comp)}
                      className="py-1 px-2 rounded-lg font-semibold text-[10px] flex items-center justify-center gap-1 border transition cursor-pointer hover:opacity-90"
                      style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}
                      title="Edit Kotlin Code & Visual Properties"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    {onDeleteCustomComponent && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete custom component "${comp.name}"?`)) {
                            onDeleteCustomComponent(comp.id);
                          }
                        }}
                        className="p-1 px-1.5 rounded-lg text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition cursor-pointer"
                        title={`Delete ${comp.name}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Default: Components Library Drawer with Search & Visible/Non-Visible Pills */
          <>
            {/* Search & Filter Controls */}
            <div
              style={{
                backgroundColor: "var(--ide-shell-bg)",
                borderColor: "var(--ide-border)",
              }}
              className="p-3 border-b shrink-0 space-y-2"
            >
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="component-palette-search"
                  type="text"
                  placeholder="Search 178+ components..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    backgroundColor: "var(--ide-card-bg)",
                    color: "var(--ide-text)",
                    borderColor: "var(--ide-border)",
                  }}
                  className="w-full border rounded-full pl-8 pr-7 py-1.5 text-xs placeholder:text-slate-400 shadow-xs focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-400 transition"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Visible vs Non-Visible Pill Filter Bar */}
              <div
                style={{
                  backgroundColor: "var(--ide-card-inner-bg)",
                  borderColor: "var(--ide-border)",
                }}
                className="flex items-center gap-1 p-0.5 rounded-full text-[10px] font-medium border"
              >
                <button
                  onClick={() => setVisibilityTab("all")}
                  style={{
                    backgroundColor: visibilityTab === "all" ? "var(--ide-card-bg)" : "transparent",
                    color: visibilityTab === "all" ? "var(--ide-text)" : "var(--ide-text-muted)",
                  }}
                  className="flex-1 py-1 rounded-full text-center transition font-bold cursor-pointer"
                >
                  All ({COMPONENT_DEFINITIONS.length})
                </button>
                <button
                  onClick={() => setVisibilityTab("visible")}
                  style={{
                    backgroundColor: visibilityTab === "visible" ? "var(--ide-card-bg)" : "transparent",
                    color: visibilityTab === "visible" ? "var(--ide-text)" : "var(--ide-text-muted)",
                  }}
                  className="flex-1 py-1 rounded-full text-center transition font-bold cursor-pointer"
                >
                  Visible ({COMPONENT_DEFINITIONS.filter((c) => c.isVisible).length})
                </button>
                <button
                  onClick={() => setVisibilityTab("non-visible")}
                  style={{
                    backgroundColor: visibilityTab === "non-visible" ? "var(--ide-card-bg)" : "transparent",
                    color: visibilityTab === "non-visible" ? "var(--ide-text)" : "var(--ide-text-muted)",
                  }}
                  className="flex-1 py-1 rounded-full text-center transition font-bold cursor-pointer"
                >
                  Non-Visible ({COMPONENT_DEFINITIONS.filter((c) => !c.isVisible).length})
                </button>
              </div>
            </div>

            {/* Accordion List */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
              {activeCategories.map((cat) => {
                const items = filteredComponents.filter((c) => c.category === cat.id);
                if (items.length === 0 && searchTerm) return null;
                const isOpen = searchTerm ? true : openCategories[cat.id] ?? false;

                return (
                  <div key={cat.id} className="space-y-1">
                    {/* Accordion Header */}
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      style={{ color: "var(--ide-text)" }}
                      className="w-full flex items-center justify-between px-2 py-1 text-xs font-semibold rounded-lg hover:bg-slate-800/40 transition group cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 group-hover:text-slate-200 transition">
                          {isOpen ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </span>
                        <span>{cat.label}</span>
                        {isNonVisibleCategory(cat.id) && (
                          <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-500/40">
                            Non-Visible
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{items.length}</span>
                    </button>

                    {/* 2-Column Grid Cards for Components */}
                    {isOpen && (
                      <div className="grid grid-cols-2 gap-1.5 pt-0.5 pb-1">
                        {items.map((def: ComponentDefinition) => {
                          const isCurrentActive = activeInfoDef?.type === def.type;

                          return (
                            <div
                              key={def.type}
                              id={`palette-item-${def.type.toLowerCase().replace(/[^a-z0-9]/g, "_")}`}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData("application/droidforge-component", def.type);
                                e.dataTransfer.setData("text/plain", def.type);
                              }}
                              onClick={() => onSelectComponentType(def.type)}
                              style={{
                                backgroundColor: "var(--ide-card-bg)",
                                borderColor: isCurrentActive ? "#818CF8" : "var(--ide-border)",
                                color: "var(--ide-text)",
                              }}
                              className={`group relative border rounded-xl p-2 flex flex-col items-center justify-center text-center cursor-grab active:cursor-grabbing transition shadow-2xs hover:shadow-xs ${
                                isCurrentActive
                                  ? "ring-2 ring-violet-400/30"
                                  : "hover:border-violet-500/50"
                              }`}
                            >
                              {/* Info Button Top-Right */}
                              <button
                                type="button"
                                id={`info-btn-${def.type.toLowerCase().replace(/[^a-z0-9]/g, "_")}`}
                                onClick={(e) => handleToggleInfo(def, e)}
                                onMouseEnter={(e) => handleMouseEnterInfo(def, e)}
                                onMouseLeave={handleMouseLeaveInfo}
                                aria-label={`Show usage info for ${def.name}`}
                                title="Component usage & best scenarios"
                                className="absolute top-1 right-1 p-0.5 text-slate-400 group-hover:text-slate-200 hover:text-violet-400 rounded transition cursor-pointer"
                              >
                                <Info className="w-3 h-3" />
                              </button>

                              {/* Component Icon */}
                              <div
                                style={{
                                  backgroundColor: "var(--ide-card-inner-bg)",
                                  color: "var(--ide-text)",
                                }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition mt-0.5"
                              >
                                {ICON_MAP[def.iconName] || ICON_MAP[def.type] || <Type className="w-4 h-4" />}
                              </div>

                              {/* Component Label */}
                              <span
                                style={{ color: "var(--ide-text)" }}
                                className="text-[10px] font-medium mt-1 leading-tight truncate w-full px-0.5"
                              >
                                {def.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredComponents.length === 0 && (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No components match "{searchTerm}"
                </div>
              )}
            </div>
          </>
        )}
      </aside>

      {/* Floating Detailed Tooltip / Usage & Best Scenarios Popover */}
      {activeInfoDef && (
        <div
          id="component-info-tooltip"
          style={{
            top: `${tooltipPos.top}px`,
            left: `${tooltipPos.left}px`,
          }}
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          }}
          onMouseLeave={handleMouseLeaveInfo}
          className="fixed z-50 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150 text-slate-800 pointer-events-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-700 border border-violet-100 flex items-center justify-center shrink-0">
                {ICON_MAP[activeInfoDef.iconName] || ICON_MAP[activeInfoDef.type] || <Type className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{activeInfoDef.name}</span>
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-medium text-violet-700 bg-violet-50 px-1.5 py-0.2 rounded-full border border-violet-100">
                    {activeInfoDef.category}
                  </span>
                  {!activeInfoDef.isVisible && (
                    <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-100">
                      Non-Visible
                    </span>
                  )}
                  {activeInfoDef.isContainer && (
                    <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-100">
                      Container
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={closeTooltip}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition"
              title="Close tooltip"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Usage Explanation */}
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-violet-700 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Usage & Architecture</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {activeInfoDef.usageExplanation}
            </p>
          </div>

          {/* Best Scenarios */}
          <div className="space-y-1 bg-violet-50/50 p-2.5 rounded-xl border border-violet-100/80">
            <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>Best Scenarios</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed font-normal">
              {activeInfoDef.bestScenarios}
            </p>
          </div>

          {/* Jetpack Compose Equivalent */}
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1">
              <Code2 className="w-3 h-3" />
              <span>Jetpack Compose Equivalent</span>
            </div>
            <div className="bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 font-mono text-[10px] text-violet-300 overflow-x-auto whitespace-nowrap">
              {activeInfoDef.composeEquivalent}
            </div>
          </div>

          {/* Add to Canvas Quick Button */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <span className="text-[10px] text-slate-400">
              {isPinned ? "📌 Pinned" : "💡 Click (i) to pin"}
            </span>
            <button
              onClick={() => {
                onSelectComponentType(activeInfoDef.type);
                closeTooltip();
              }}
              className="flex items-center gap-1 bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-semibold px-3 py-1 rounded-full transition shadow-xs active:scale-95"
            >
              <Plus className="w-3 h-3" />
              <span>Add to Screen</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
