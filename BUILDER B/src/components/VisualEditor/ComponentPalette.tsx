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
  Palette,
  LayoutGrid,
  Link2,
  Languages,
  Settings,
} from "lucide-react";
import { COMPONENT_DEFINITIONS, ComponentDefinition } from "../../data/componentRegistry";
import { AndroidComponent, ComponentCategory } from "../../types";
import { ComponentTree } from "./ComponentTree";

interface ComponentPaletteProps {
  onSelectComponentType: (type: string) => void;
  activeRailTab?: string;
  onSelectRailTab?: (tab: string) => void;
  onOpenAiModal?: () => void;
  onOpenAppProperties?: () => void;
  onOpenBuilderSettings?: () => void;
  rootComponent?: AndroidComponent;
  selectedComponentId?: string | null;
  onSelectComponent?: (id: string) => void;
  onDeleteComponent?: (id: string) => void;
  onDuplicateComponent?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
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
};

const CATEGORIES: { id: ComponentCategory; label: string }[] = [
  { id: "Actions", label: "Actions" },
  { id: "Navigation", label: "Navigation" },
  { id: "Containment", label: "Containment" },
  { id: "Inputs", label: "Inputs" },
  { id: "Content", label: "Content" },
  { id: "Progress", label: "Progress" },
  { id: "Hardware & Native", label: "Hardware & Native" },
];

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({
  onSelectComponentType,
  activeRailTab = "components",
  onSelectRailTab,
  onOpenAiModal,
  onOpenAppProperties,
  onOpenBuilderSettings,
  rootComponent,
  selectedComponentId,
  onSelectComponent,
  onDeleteComponent,
  onDuplicateComponent,
  onMoveUp,
  onMoveDown,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  // Accordions state: open categories
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    Actions: true,
    Navigation: true,
    Containment: true,
    Inputs: true,
    Content: false,
    Progress: false,
    "Hardware & Native": false,
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

  const filteredComponents = COMPONENT_DEFINITIONS.filter((item) => {
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
      {/* 1. Far Left Tool Rail (Matches Reference Image) */}
      <nav
        id="tool-rail-sidebar"
        className="w-12 bg-white border-r border-slate-200/80 flex flex-col items-center justify-between py-3 text-slate-500 z-10"
      >
        <div className="flex flex-col items-center gap-2">
          {/* Add Component Pill */}
          <button
            onClick={() => onSelectRailTab && onSelectRailTab("components")}
            title="Components Library"
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
              activeRailTab === "components"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Component Layers / Tree */}
          <button
            onClick={() => onSelectRailTab && onSelectRailTab("layers")}
            title="Component Tree Hierarchy"
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
              activeRailTab === "layers"
                ? "bg-violet-100 text-violet-900"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Theme & Palette */}
          <button
            onClick={() => onSelectRailTab && onSelectRailTab("theme")}
            title="Material 3 Theme & Colors"
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
              activeRailTab === "theme"
                ? "bg-violet-100 text-violet-900"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Layout Grid & Constraints */}
          <button
            onClick={() => onSelectRailTab && onSelectRailTab("grid")}
            title="Layout Spacing & Grid"
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
              activeRailTab === "grid"
                ? "bg-violet-100 text-violet-900"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          {/* Typography Tokens */}
          <button
            onClick={() => onSelectRailTab && onSelectRailTab("typography")}
            title="Typography & Fonts"
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
              activeRailTab === "typography"
                ? "bg-violet-100 text-violet-900"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Type className="w-4 h-4" />
          </button>

          {/* Navigation & Event Links */}
          <button
            onClick={() => onSelectRailTab && onSelectRailTab("links")}
            title="Screen Links & Navigation"
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
              activeRailTab === "links"
                ? "bg-violet-100 text-violet-900"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Link2 className="w-4 h-4" />
          </button>

          {/* AI Generator Trigger */}
          <button
            onClick={onOpenAiModal}
            title="Ask AI Assistant"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-violet-600 hover:bg-violet-50 transition"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Rail Actions */}
        <div className="flex flex-col items-center gap-2">
          <button
            title="Localization & Languages"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <Languages className="w-4 h-4" />
          </button>
          <button
            id="rail-open-builder-settings-btn"
            onClick={onOpenBuilderSettings || onOpenAppProperties}
            title="Builder Settings (Appearance, Themes, Canvas Snapping, Code Studio)"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 transition"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* 2. Components Library & Hierarchy Drawer (Matches Reference Image) */}
      <aside
        id="component-palette-sidebar"
        className="w-72 sm:w-80 bg-[#F8F7FB] border-r border-slate-200/80 flex flex-col h-full overflow-hidden text-slate-800"
      >
        {/* Top Header with Tab Switcher between Components & Hierarchy */}
        <div className="p-2.5 pb-2 border-b border-slate-200/80 bg-white shrink-0">
          <div className="flex bg-slate-100 p-0.5 rounded-full text-xs font-semibold">
            <button
              id="sidebar-tab-components"
              type="button"
              onClick={() => onSelectRailTab && onSelectRailTab("components")}
              className={`flex-1 py-1 px-3 rounded-full transition flex items-center justify-center gap-1.5 text-xs ${
                activeRailTab !== "layers" &&
                activeRailTab !== "theme" &&
                activeRailTab !== "grid" &&
                activeRailTab !== "typography" &&
                activeRailTab !== "links"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Components</span>
            </button>
            <button
              id="sidebar-tab-hierarchy"
              type="button"
              onClick={() => onSelectRailTab && onSelectRailTab("layers")}
              className={`flex-1 py-1 px-3 rounded-full transition flex items-center justify-center gap-1.5 text-xs ${
                activeRailTab === "layers"
                  ? "bg-white text-violet-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-violet-600" />
              <span>Hierarchy</span>
            </button>
          </div>
        </div>

        {/* View 1: Component Tree Hierarchy */}
        {activeRailTab === "layers" ? (
          rootComponent ? (
            <div className="flex-1 overflow-hidden h-full flex flex-col">
              <ComponentTree
                rootComponent={rootComponent}
                selectedComponentId={selectedComponentId || null}
                onSelectComponent={(id) => onSelectComponent?.(id)}
                onDeleteComponent={(id) => onDeleteComponent?.(id)}
                onDuplicateComponent={(id) => onDuplicateComponent?.(id)}
                onMoveUp={(id) => onMoveUp?.(id)}
                onMoveDown={(id) => onMoveDown?.(id)}
              />
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center h-full">
              <Layers className="w-8 h-8 text-slate-300 mb-2" />
              <p>No active screen hierarchy available</p>
            </div>
          )
        ) : activeRailTab === "theme" ? (
          /* View 2: Material 3 Theme Tokens */
          <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-800">Material 3 Theme</span>
              <span className="text-[10px] font-mono text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                Baseline
              </span>
            </div>
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                Primary Colors
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl bg-violet-700 text-white flex flex-col justify-between h-14">
                  <span className="font-semibold text-[11px]">Primary</span>
                  <span className="text-[10px] opacity-80 font-mono">#6750A4</span>
                </div>
                <div className="p-2 rounded-xl bg-violet-100 text-violet-900 border border-violet-200 flex flex-col justify-between h-14">
                  <span className="font-semibold text-[11px]">PrimaryContainer</span>
                  <span className="text-[10px] opacity-80 font-mono">#EADDFF</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-700 text-white flex flex-col justify-between h-14">
                  <span className="font-semibold text-[11px]">Secondary</span>
                  <span className="text-[10px] opacity-80 font-mono">#625B71</span>
                </div>
                <div className="p-2 rounded-xl bg-rose-700 text-white flex flex-col justify-between h-14">
                  <span className="font-semibold text-[11px]">Tertiary</span>
                  <span className="text-[10px] opacity-80 font-mono">#7D5260</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                Surface & Background
              </span>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 flex justify-between items-center shadow-2xs">
                <span className="font-medium">Surface</span>
                <span className="font-mono text-[10px] text-slate-500">#FEF7FF</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 flex justify-between items-center shadow-2xs">
                <span className="font-medium">Surface Variant</span>
                <span className="font-mono text-[10px] text-slate-500">#E7E0EC</span>
              </div>
            </div>
          </div>
        ) : activeRailTab === "grid" ? (
          /* View 3: Layout Grid & Spacing */
          <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-800">Spacing & Grid</span>
              <span className="text-[10px] font-mono text-slate-500">8dp Grid</span>
            </div>
            <div className="space-y-2">
              {[
                { label: "Compact / Extra Small", value: "4.dp", use: "Icon paddings, chip gaps" },
                { label: "Small Spacing", value: "8.dp", use: "List items spacing, card margins" },
                { label: "Medium Spacing", value: "16.dp", use: "Screen boundary margins" },
                { label: "Large Spacing", value: "24.dp", use: "Major section headers" },
                { label: "Extra Large", value: "32.dp", use: "Hero illustrations and FABs" },
              ].map((token) => (
                <div
                  key={token.label}
                  className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col gap-0.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">{token.label}</span>
                    <span className="font-mono text-[11px] font-bold text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded">
                      {token.value}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">{token.use}</span>
                </div>
              ))}
            </div>
          </div>
        ) : activeRailTab === "typography" ? (
          /* View 4: Typography Tokens */
          <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-800">Typography Scale</span>
              <span className="text-[10px] font-mono text-slate-500">Roboto / Sans</span>
            </div>
            <div className="space-y-2">
              {[
                { name: "Display Large", size: "57sp", weight: "Regular", sample: "Hero Text" },
                { name: "Headline Medium", size: "28sp", weight: "SemiBold", sample: "Section Title" },
                { name: "Title Medium", size: "16sp", weight: "Medium", sample: "Card Header" },
                { name: "Body Large", size: "16sp", weight: "Regular", sample: "Regular paragraph body" },
                { name: "Label Small", size: "11sp", weight: "Medium", sample: "CAPTION / BADGE" },
              ].map((font) => (
                <div
                  key={font.name}
                  className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1"
                >
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span className="font-semibold text-slate-700">{font.name}</span>
                    <span className="font-mono">{font.size} • {font.weight}</span>
                  </div>
                  <div className="text-slate-900 truncate font-sans">{font.sample}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Default: Components Library Drawer with Search & Accordion */
          <>
            {/* Rounded Search Bar */}
            <div className="p-3 border-b border-slate-200/60 bg-[#F8F7FB] shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="component-palette-search"
                  type="text"
                  placeholder="Search components..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200/80 rounded-full pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-400 transition"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Accordion List */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2 scrollbar-thin scrollbar-thumb-slate-200">
              {CATEGORIES.map((cat) => {
                const items = filteredComponents.filter((c) => c.category === cat.id);
                if (items.length === 0 && searchTerm) return null;
                const isOpen = searchTerm ? true : openCategories[cat.id] ?? false;

                return (
                  <div key={cat.id} className="space-y-1">
                    {/* Accordion Header */}
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className="w-full flex items-center justify-between px-2 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-200/50 transition group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 group-hover:text-slate-600 transition">
                          {isOpen ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </span>
                        <span>{cat.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {items.length}
                      </span>
                    </button>

                    {/* 2-Column Grid Cards for Components (Matches Reference Image) */}
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
                              }}
                              onClick={() => onSelectComponentType(def.type)}
                              className={`group relative bg-white hover:bg-violet-50/70 border rounded-xl p-2.5 flex flex-col items-center justify-center text-center cursor-grab active:cursor-grabbing transition shadow-2xs hover:shadow-xs ${
                                isCurrentActive
                                  ? "border-violet-500 ring-2 ring-violet-400/30"
                                  : "border-slate-200/80 hover:border-violet-300"
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
                                className="absolute top-1 right-1 p-0.5 text-slate-300 group-hover:text-slate-400 hover:text-violet-600 rounded transition"
                              >
                                <Info className="w-3 h-3" />
                              </button>

                              {/* Component Icon */}
                              <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-violet-100/70 text-slate-600 group-hover:text-violet-700 flex items-center justify-center transition mt-0.5">
                                {ICON_MAP[def.iconName] || <Type className="w-4 h-4" />}
                              </div>

                              {/* Component Label */}
                              <span className="text-[11px] font-medium text-slate-700 group-hover:text-violet-950 mt-1.5 leading-tight truncate w-full px-0.5">
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
                {ICON_MAP[activeInfoDef.iconName] || <Type className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{activeInfoDef.name}</span>
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-medium text-violet-700 bg-violet-50 px-1.5 py-0.2 rounded-full border border-violet-100">
                    {activeInfoDef.category}
                  </span>
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
              <span>Add to Canvas</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
