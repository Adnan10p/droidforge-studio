import React, { useState } from "react";
import {
  Type,
  Maximize2,
  Sliders,
  Palette,
  Eye,
  Smile,
  Heart,
  Send,
  ArrowRight,
  Sparkles,
  Settings,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Check,
  Camera,
  MapPin,
  Image as ImageIcon,
  Layers,
  ChevronDown,
  ChevronUp,
  Workflow,
  Shield,
  Clock,
  Video,
  Globe,
  SlidersHorizontal,
  ToggleLeft,
  CheckSquare,
  Radio,
  Square,
  Search,
  Plus,
  Star,
  Play,
  Volume2,
  Bell,
  Wifi,
  Bluetooth,
  Compass,
  Share2,
  Users,
  FolderOpen,
  Smartphone,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Trash2,
  List as ListIcon,
} from "lucide-react";
import { AndroidComponent } from "../../../types";

interface ComponentPropertiesTabProps {
  component: AndroidComponent;
  onUpdateProps: (newProps: Record<string, any>) => void;
  onUpdateName: (newName: string) => void;
  onOpenLogicEditor: (componentId: string) => void;
  isRootComponent?: boolean;
  onSwitchToScreenProperties?: () => void;
}

const PRESET_ICONS = [
  { id: "Smile", label: "Smile", icon: Smile },
  { id: "Heart", label: "Heart", icon: Heart },
  { id: "Send", label: "Send", icon: Send },
  { id: "ArrowRight", label: "Arrow", icon: ArrowRight },
  { id: "Sparkles", label: "Sparkles", icon: Sparkles },
  { id: "Settings", label: "Settings", icon: Settings },
  { id: "Check", label: "Check", icon: Check },
  { id: "Plus", label: "Plus", icon: Plus },
  { id: "Star", label: "Star", icon: Star },
  { id: "Search", label: "Search", icon: Search },
  { id: "Play", label: "Play", icon: Play },
  { id: "Camera", label: "Camera", icon: Camera },
];

const PRESET_COLORS = [
  "#FFFFFF",
  "#F8FAFC",
  "#F1F5F9",
  "#0F172A",
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

export const ComponentPropertiesTab: React.FC<ComponentPropertiesTabProps> = ({
  component,
  onUpdateProps,
  onUpdateName,
  onOpenLogicEditor,
  isRootComponent = false,
  onSwitchToScreenProperties,
}) => {
  const p = component.props || {};

  const handlePropChange = (key: string, value: any) => {
    onUpdateProps({ [key]: value });
  };

  // State for adding arbitrary custom properties
  const [newPropKey, setNewPropKey] = useState("");
  const [newPropValue, setNewPropValue] = useState("");
  const [showCustomProps, setShowCustomProps] = useState(false);

  // Categorize component type
  const type = component.type.toLowerCase();
  const rawType = component.type;

  const isIconButton = type.includes("iconbutton") || (type.includes("button") && type.includes("icon"));
  const isFAB = (type.includes("fab") || type.includes("floatingaction")) && !type.includes("extended");
  const isExtendedFAB = type.includes("extendedfab") || (type.includes("extended") && type.includes("fab"));
  const isSplitButton = type.includes("split");
  const isChip = type.includes("chip") || type.includes("tag");
  const isButton =
    (type.includes("button") || rawType === "Button") &&
    !isIconButton &&
    !isFAB &&
    !isExtendedFAB &&
    !isSplitButton &&
    !type.includes("radio") &&
    !type.includes("switch");

  const isText =
    (type.includes("text") || type.includes("headline") || type.includes("label") || type.includes("caption") || rawType === "Text") &&
    !type.includes("input") &&
    !type.includes("field") &&
    !type.includes("edit");

  const isTextInput = type.includes("input") || type.includes("edit") || type.includes("field") || rawType === "TextField";
  const isImage = type.includes("image");
  const isSlider = type.includes("slider");
  const isSwitch = type.includes("switch");
  const isCheckbox = type.includes("checkbox");
  const isRadio = type.includes("radio");
  const isCard = type.includes("card") || type.includes("surface");
  const isProgress = type.includes("progress") || type.includes("loader");
  const isToolbar = type.includes("toolbar") || type.includes("appbar") || type.includes("topbar");
  const isList = type.includes("list") || type.includes("recycler");
  const isDialog = type.includes("dialog") || type.includes("alert");
  const isVideo = type.includes("video") || type.includes("exoplayer");
  const isWebView = type.includes("webview") || type.includes("browser");
  const isAudio = type.includes("audio") || type.includes("player");
  const isCamera = type.includes("camera");
  const isMap = type.includes("map");

  const isHardwareOrNative =
    type.includes("bluetooth") ||
    type.includes("wifi") ||
    type.includes("wi-fi") ||
    type.includes("location") ||
    type.includes("gps") ||
    type.includes("sensor") ||
    type.includes("notification") ||
    type.includes("contacts") ||
    type.includes("share") ||
    type.includes("file");

  const isContainer =
    isRootComponent ||
    type.includes("scroll") ||
    type.includes("column") ||
    type.includes("row") ||
    type.includes("box") ||
    type.includes("layout") ||
    type.includes("container") ||
    type.includes("sheet") ||
    type.includes("drawer") ||
    rawType === "ScrollView" ||
    rawType === "ScrollColumn" ||
    rawType === "Column" ||
    rawType === "Row" ||
    rawType === "Box" ||
    rawType === "Bottom Sheet" ||
    rawType === "Drawer";

  return (
    <div className="space-y-4 text-xs text-slate-700 pb-8">
      {/* 1. Component Identification Header */}
      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 font-bold">
              {component.type}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">id: {component.id}</span>
          </div>
          {isRootComponent && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-600 text-white shadow-2xs">
              Root Layout
            </span>
          )}
        </div>

        {/* Rename Component Identifier */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Component Identifier
          </label>
          <input
            type="text"
            value={component.name}
            onChange={(e) => onUpdateName(e.target.value)}
            className="w-full text-xs font-mono font-bold px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* 2. Root Screen Container Banner (if isRootComponent) */}
      {isRootComponent && (
        <div className="p-3 bg-linear-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-violet-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-violet-900 block">Screen Container Layout</span>
              <span className="text-[10px] text-violet-700">
                You are viewing the root container of this screen.
              </span>
            </div>
          </div>
          {onSwitchToScreenProperties && (
            <button
              type="button"
              onClick={onSwitchToScreenProperties}
              className="w-full py-1.5 px-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Open Full Screen Properties (Title, Status Bar, Animations)</span>
            </button>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. CONTAINER / SCREEN CONTAINER SPECIFIC PROPERTIES       */}
      {/* ========================================================= */}
      {isContainer && (
        <div className="border border-slate-200/80 rounded-xl p-3.5 bg-white shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
            <Layers className="w-3.5 h-3.5 text-violet-600" />
            <span>Container Layout & Alignment</span>
          </div>

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
                  onClick={() => handlePropChange("alignHorizontal", align)}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg border capitalize transition cursor-pointer ${
                    (p.alignHorizontal || "left") === align
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
                  onClick={() => handlePropChange("alignVertical", valign)}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg border capitalize transition cursor-pointer ${
                    (p.alignVertical || "top") === valign
                      ? "bg-violet-600 text-white border-violet-600 shadow-2xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {valign}
                </button>
              ))}
            </div>
          </div>

          {/* Background Color */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-700">
                Container Background Color
              </label>
              <span className="text-[10px] font-mono text-slate-400">
                {p.backgroundColor || "#FFFFFF"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={p.backgroundColor || "#FFFFFF"}
                onChange={(e) => handlePropChange("backgroundColor", e.target.value)}
                className="w-7 h-7 rounded-lg border border-slate-300 p-0.5 cursor-pointer shrink-0"
              />
              <input
                type="text"
                value={p.backgroundColor || "#FFFFFF"}
                onChange={(e) => handlePropChange("backgroundColor", e.target.value)}
                className="flex-1 text-xs font-mono px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
            {/* Presets */}
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handlePropChange("backgroundColor", c)}
                  style={{ backgroundColor: c }}
                  className={`w-5 h-5 rounded-md border transition cursor-pointer ${
                    p.backgroundColor === c
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
              Background Image (URL)
            </label>
            <input
              type="text"
              value={p.backgroundImage || p.url || ""}
              onChange={(e) => {
                handlePropChange("backgroundImage", e.target.value);
                handlePropChange("url", e.target.value);
              }}
              placeholder="https://... or @drawable/bg"
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {/* Scrollable & Fill Parent */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[11px] font-medium text-slate-700">Scrollable</span>
              <input
                type="checkbox"
                checked={p.scrollable ?? true}
                onChange={(e) => handlePropChange("scrollable", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[11px] font-medium text-slate-700">Full Width</span>
              <input
                type="checkbox"
                checked={p.layoutWidth === "match_parent"}
                onChange={(e) =>
                  handlePropChange("layoutWidth", e.target.checked ? "match_parent" : "wrap_content")
                }
                className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Corner Radius & Elevation */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-700">Corner Radius</label>
                <span className="text-[10px] font-mono text-slate-400">{p.cornerRadius ?? 0}dp</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={p.cornerRadius ?? 0}
                onChange={(e) => handlePropChange("cornerRadius", Number(e.target.value))}
                className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-700">Elevation</label>
                <span className="text-[10px] font-mono text-slate-400">{p.elevation ?? 0}dp</span>
              </div>
              <input
                type="range"
                min={0}
                max={16}
                value={p.elevation ?? 0}
                onChange={(e) => handlePropChange("elevation", Number(e.target.value))}
                className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. BUTTON COMPONENT SPECIFIC PROPERTIES                  */}
      {/* ========================================================= */}
      {isButton && (
        <div className="border border-slate-200/80 rounded-xl p-3.5 bg-white shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
            <Sliders className="w-3.5 h-3.5 text-violet-600" />
            <span>Button Settings</span>
          </div>

          {/* Button Text */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Button Label
            </label>
            <input
              type="text"
              value={p.text || ""}
              onChange={(e) => handlePropChange("text", e.target.value)}
              placeholder="Button Title"
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 focus:bg-white"
            />
          </div>

          {/* Material 3 Variant */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Material 3 Style Variant
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(["filled", "tonal", "elevated", "outlined", "text"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handlePropChange("variant", v)}
                  className={`py-1 text-xs font-medium rounded-lg border capitalize transition cursor-pointer ${
                    (p.variant || "filled") === v
                      ? "bg-violet-600 text-white border-violet-600 shadow-2xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Button Icon
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handlePropChange("icon", undefined)}
                className={`px-2 py-1 text-[11px] rounded-lg border cursor-pointer ${
                  !p.icon
                    ? "bg-violet-100 text-violet-900 border-violet-300 font-bold"
                    : "bg-slate-50 text-slate-500 border-slate-200"
                }`}
              >
                None
              </button>
              {PRESET_ICONS.map((item) => {
                const IconCmp = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handlePropChange("icon", item.id)}
                    title={item.label}
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                      p.icon === item.id
                        ? "bg-violet-600 text-white border-violet-600 shadow-2xs scale-105"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <IconCmp className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Button Colors */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Button Color
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={p.backgroundColor || "#6750A4"}
                  onChange={(e) => handlePropChange("backgroundColor", e.target.value)}
                  className="w-7 h-7 rounded-lg border border-slate-300 p-0.5 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={p.backgroundColor || "#6750A4"}
                  onChange={(e) => handlePropChange("backgroundColor", e.target.value)}
                  className="w-full text-xs font-mono px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Text Color
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={p.textColor || "#FFFFFF"}
                  onChange={(e) => handlePropChange("textColor", e.target.value)}
                  className="w-7 h-7 rounded-lg border border-slate-300 p-0.5 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={p.textColor || "#FFFFFF"}
                  onChange={(e) => handlePropChange("textColor", e.target.value)}
                  className="w-full text-xs font-mono px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Corner Radius & Elevation */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-700">Corner Radius</label>
                <span className="text-[10px] font-mono text-slate-400">{p.cornerRadius ?? 24}dp</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={p.cornerRadius ?? 24}
                onChange={(e) => handlePropChange("cornerRadius", Number(e.target.value))}
                className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-700">Elevation</label>
                <span className="text-[10px] font-mono text-slate-400">{p.elevation ?? 2}dp</span>
              </div>
              <input
                type="range"
                min={0}
                max={16}
                value={p.elevation ?? 2}
                onChange={(e) => handlePropChange("elevation", Number(e.target.value))}
                className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. ICON BUTTON & FAB & EXTENDED FAB                      */}
      {/* ========================================================= */}
      {(isIconButton || isFAB || isExtendedFAB || isSplitButton) && (
        <div className="border border-slate-200/80 rounded-xl p-3.5 bg-white shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>
              {isIconButton
                ? "Icon Button Settings"
                : isFAB
                ? "Floating Action Button (FAB)"
                : isExtendedFAB
                ? "Extended FAB Settings"
                : "Split Button Settings"}
            </span>
          </div>

          {/* Label for Extended FAB & SplitButton */}
          {(isExtendedFAB || isSplitButton) && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Label Text</label>
              <input
                type="text"
                value={p.text || ""}
                onChange={(e) => handlePropChange("text", e.target.value)}
                placeholder="Action Title"
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          )}

          {/* Icon Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Icon</label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {PRESET_ICONS.map((item) => {
                const IconCmp = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handlePropChange("icon", item.id)}
                    title={item.label}
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                      p.icon === item.id
                        ? "bg-violet-600 text-white border-violet-600 shadow-2xs scale-105"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <IconCmp className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Background & Tint Color */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Background
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={p.backgroundColor || "#6750A4"}
                  onChange={(e) => handlePropChange("backgroundColor", e.target.value)}
                  className="w-7 h-7 rounded-lg border border-slate-300 p-0.5 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={p.backgroundColor || "#6750A4"}
                  onChange={(e) => handlePropChange("backgroundColor", e.target.value)}
                  className="w-full text-xs font-mono px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Icon Tint / Text
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={p.textColor || "#FFFFFF"}
                  onChange={(e) => handlePropChange("textColor", e.target.value)}
                  className="w-7 h-7 rounded-lg border border-slate-300 p-0.5 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={p.textColor || "#FFFFFF"}
                  onChange={(e) => handlePropChange("textColor", e.target.value)}
                  className="w-full text-xs font-mono px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Size / Corner Radius */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-700">Corner Radius</label>
                <span className="text-[10px] font-mono text-slate-400">{p.cornerRadius ?? 20}dp</span>
              </div>
              <input
                type="range"
                min={0}
                max={36}
                value={p.cornerRadius ?? 20}
                onChange={(e) => handlePropChange("cornerRadius", Number(e.target.value))}
                className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {isIconButton && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-700">Size</label>
                  <span className="text-[10px] font-mono text-slate-400">{p.layoutWidth || 44}dp</span>
                </div>
                <input
                  type="range"
                  min={24}
                  max={64}
                  value={p.layoutWidth || 44}
                  onChange={(e) => {
                    const sz = Number(e.target.value);
                    handlePropChange("layoutWidth", sz);
                    handlePropChange("layoutHeight", sz);
                  }}
                  className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. CHIP COMPONENT PROPERTIES                             */}
      {/* ========================================================= */}
      {isChip && (
        <div className="border border-slate-200/80 rounded-xl p-3.5 bg-white shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
            <CheckSquare className="w-3.5 h-3.5 text-violet-600" />
            <span>Material Chip Settings</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Chip Label</label>
            <input
              type="text"
              value={p.text || ""}
              onChange={(e) => handlePropChange("text", e.target.value)}
              placeholder="Tag / Filter label"
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Chip Variant</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(["assist", "filter", "input", "suggestion"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handlePropChange("variant", v)}
                  className={`py-1 text-xs font-medium rounded-lg border capitalize transition cursor-pointer ${
                    (p.variant || "assist") === v
                      ? "bg-violet-600 text-white border-violet-600 shadow-2xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] font-medium text-slate-700">Selected / Filter Active</span>
            <input
              type="checkbox"
              checked={p.selected ?? false}
              onChange={(e) => handlePropChange("selected", e.target.checked)}
              className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. TEXT & TYPOGRAPHY PROPERTIES                           */}
      {/* ========================================================= */}
      {isText && (
        <div className="border border-slate-200/80 rounded-xl p-3.5 bg-white shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
            <Type className="w-3.5 h-3.5 text-violet-600" />
            <span>Typography & Content</span>
          </div>

          {/* Text Content */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Text Content
            </label>
            <textarea
              rows={3}
              value={p.text || ""}
              onChange={(e) => handlePropChange("text", e.target.value)}
              placeholder="Enter text string"
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 focus:bg-white resize-none"
            />
          </div>

          {/* Font Size Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-700">Font Size (sp)</label>
              <span className="text-[10px] font-mono text-slate-400">{p.fontSize || 16}sp</span>
            </div>
            <input
              type="range"
              min={10}
              max={48}
              value={p.fontSize || 16}
              onChange={(e) => handlePropChange("fontSize", Number(e.target.value))}
              className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Font Weight & Alignment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Font Weight
              </label>
              <select
                value={p.fontWeight || "normal"}
                onChange={(e) => handlePropChange("fontWeight", e.target.value)}
                className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none cursor-pointer"
              >
                <option value="normal">Normal (400)</option>
                <option value="medium">Medium (500)</option>
                <option value="bold">Bold (700)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Text Alignment
              </label>
              <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                {(["left", "center", "right"] as const).map((al) => (
                  <button
                    key={al}
                    type="button"
                    onClick={() => handlePropChange("textAlign", al)}
                    className={`flex-1 py-1 rounded flex items-center justify-center transition cursor-pointer ${
                      (p.textAlign || "left") === al
                        ? "bg-violet-600 text-white shadow-2xs"
                        : "text-slate-500 hover:bg-slate-200/60"
                    }`}
                  >
                    {al === "left" && <AlignLeft className="w-3.5 h-3.5" />}
                    {al === "center" && <AlignCenter className="w-3.5 h-3.5" />}
                    {al === "right" && <AlignRight className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Text Color */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Text Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={p.textColor || "#0F172A"}
                onChange={(e) => handlePropChange("textColor", e.target.value)}
                className="w-7 h-7 rounded-lg border border-slate-300 p-0.5 cursor-pointer"
              />
              <input
                type="text"
                value={p.textColor || "#0F172A"}
                onChange={(e) => handlePropChange("textColor", e.target.value)}
                className="flex-1 text-xs font-mono px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. TEXTINPUT / TEXTFIELD COMPONENT PROPERTIES             */}
      {/* ========================================================= */}
      {isTextInput && (
        <div className="border border-slate-200/80 rounded-xl p-3.5 bg-white shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-violet-600" />
            <span>TextField / Input Settings</span>
          </div>

          {/* Placeholder / Hint */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Hint / Placeholder Text
            </label>
            <input
              type="text"
              value={p.placeholder || p.hint || ""}
              onChange={(e) => {
                handlePropChange("placeholder", e.target.value);
                handlePropChange("hint", e.target.value);
              }}
              placeholder="e.g. Enter your email..."
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {/* Default Value */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Default Value
            </label>
            <input
              type="text"
              value={p.text || ""}
              onChange={(e) => handlePropChange("text", e.target.value)}
              placeholder="Pre-filled text"
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {/* Helper / Error Text */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Helper Text
            </label>
            <input
              type="text"
              value={p.helperText || ""}
              onChange={(e) => handlePropChange("helperText", e.target.value)}
              placeholder="Help message under input"
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {/* Input Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Input Type (Keyboard)
            </label>
            <select
              value={p.inputType || (p.isPassword ? "password" : "text")}
              onChange={(e) => {
                const val = e.target.value;
                handlePropChange("inputType", val);
                handlePropChange("isPassword", val === "password");
              }}
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="text">Plain Text</option>
              <option value="email">Email Address</option>
              <option value="password">Password (Masked)</option>
              <option value="number">Numeric (Digits only)</option>
              <option value="phone">Phone Number</option>
              <option value="multiline">Multiline Area</option>
            </select>
          </div>

          {/* Single Line & ReadOnly Toggles */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[11px] font-medium text-slate-700">Single Line</span>
              <input
                type="checkbox"
                checked={p.singleLine ?? true}
                onChange={(e) => handlePropChange("singleLine", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[11px] font-medium text-slate-700">Read Only</span>
              <input
                type="checkbox"
                checked={p.readOnly ?? false}
                onChange={(e) => handlePropChange("readOnly", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. IMAGE COMPONENT PROPERTIES                            */}
      {/* ========================================================= */}
      {isImage && (
        <div className="border border-slate-200/80 rounded-xl p-3.5 bg-white shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
            <ImageIcon className="w-3.5 h-3.5 text-violet-600" />
            <span>Image Settings</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Image URL / Source
            </label>
            <input
              type="text"
              value={p.url || p.src || ""}
              onChange={(e) => {
                handlePropChange("url", e.target.value);
                handlePropChange("src", e.target.value);
              }}
              placeholder="https://images.unsplash.com/..."
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Content Scale (Crop Mode)
            </label>
            <select
              value={p.contentScale || "crop"}
              onChange={(e) => handlePropChange("contentScale", e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="crop">Crop (CenterCrop)</option>
              <option value="fit">Fit (FitCenter)</option>
              <option value="fillBounds">Fill Bounds</option>
              <option value="inside">Inside</option>
              <option value="center">Center</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-700">Corner Radius</label>
                <span className="text-[10px] font-mono text-slate-400">{p.cornerRadius ?? 12}dp</span>
              </div>
              <input
                type="range"
                min={0}
                max={60}
                value={p.cornerRadius ?? 12}
                onChange={(e) => handlePropChange("cornerRadius", Number(e.target.value))}
                className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-700">Alpha (Opacity)</label>
                <span className="text-[10px] font-mono text-slate-400">
                  {Math.round((p.alpha ?? 1) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={Math.round((p.alpha ?? 1) * 100)}
                onChange={(e) => handlePropChange("alpha", Number(e.target.value) / 100)}
                className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 10. SLIDER COMPONENT PROPERTIES                           */}
      {/* ========================================================= */}
      {isSlider && (
        <div className="border border-slate-200/80 rounded-xl p-3.5 bg-white shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
            <Sliders className="w-3.5 h-3.5 text-violet-600" />
            <span>Slider Settings</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-700">Current Value</label>
              <span className="text-[10px] font-mono text-slate-500 font-bold">{p.value ?? 50}</span>
            </div>
            <input
              type="range"
              min={p.min ?? 0}
              max={p.max ?? 100}
              value={p.value ?? 50}
              onChange={(e) => handlePropChange("value", Number(e.target.value))}
              className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Min Value</label>
              <input
                type="number"
                value={p.min ?? 0}
                onChange={(e) => handlePropChange("min", Number(e.target.value))}
                className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Max Value</label>
              <input
                type="number"
                value={p.max ?? 100}
                onChange={(e) => handlePropChange("max", Number(e.target.value))}
                className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 11. SWITCH, CHECKBOX & RADIO PROPERTIES                   */}
      {/* ========================================================= */}
      {(isSwitch || isCheckbox || isRadio) && (
        <div className="border border-slate-200/80 rounded-xl p-3.5 bg-white shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
            <ToggleLeft className="w-3.5 h-3.5 text-violet-600" />
            <span>Selection Control</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Label Text
            </label>
            <input
              type="text"
              value={p.text || ""}
              onChange={(e) => handlePropChange("text", e.target.value)}
              placeholder="Option description"
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] font-medium text-slate-700">Checked by Default</span>
            <input
              type="checkbox"
              checked={p.checked ?? false}
              onChange={(e) => handlePropChange("checked", e.target.checked)}
              className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 12. CARD & SURFACE PROPERTIES                             */}
      {/* ========================================================= */}
      {isCard && (
        <div className="border border-slate-200/80 rounded-xl p-3.5 bg-white shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
            <Square className="w-3.5 h-3.5 text-violet-600" />
            <span>Card Container Settings</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={p.backgroundColor || "#FFFFFF"}
                onChange={(e) => handlePropChange("backgroundColor", e.target.value)}
                className="w-7 h-7 rounded-lg border border-slate-300 p-0.5 cursor-pointer"
              />
              <input
                type="text"
                value={p.backgroundColor || "#FFFFFF"}
                onChange={(e) => handlePropChange("backgroundColor", e.target.value)}
                className="flex-1 text-xs font-mono px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-700">Corner Radius</label>
                <span className="text-[10px] font-mono text-slate-400">{p.cornerRadius ?? 16}dp</span>
              </div>
              <input
                type="range"
                min={0}
                max={36}
                value={p.cornerRadius ?? 16}
                onChange={(e) => handlePropChange("cornerRadius", Number(e.target.value))}
                className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-700">Elevation</label>
                <span className="text-[10px] font-mono text-slate-400">{p.elevation ?? 2}dp</span>
              </div>
              <input
                type="range"
                min={0}
                max={16}
                value={p.elevation ?? 2}
                onChange={(e) => handlePropChange("elevation", Number(e.target.value))}
                className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 13. RECYCLER / LIST VIEW PROPERTIES                       */}
      {/* ========================================================= */}
      {isList && (
        <div className="border border-slate-200/80 rounded-xl p-3.5 bg-white shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
            <ListIcon className="w-3.5 h-3.5 text-violet-600" />
            <span>List & Recycler Settings</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Item Layout Style</label>
            <select
              value={p.itemLayout || "two_line"}
              onChange={(e) => handlePropChange("itemLayout", e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
            >
              <option value="single_line">Single Line (Title only)</option>
              <option value="two_line">Two Line (Title + Subtitle)</option>
              <option value="card_item">Card Item (Icon + Text + Action)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-700">Preview Item Count</label>
              <span className="text-[10px] font-mono text-slate-400">{p.itemCount ?? 4} items</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={p.itemCount ?? 4}
              onChange={(e) => handlePropChange("itemCount", Number(e.target.value))}
              className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] font-medium text-slate-700">Show Dividers</span>
            <input
              type="checkbox"
              checked={p.showDividers ?? true}
              onChange={(e) => handlePropChange("showDividers", e.target.checked)}
              className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 14. DIALOG PROPERTIES                                     */}
      {/* ========================================================= */}
      {isDialog && (
        <div className="border border-slate-200/80 rounded-xl p-3.5 bg-white shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
            <AlertCircle className="w-3.5 h-3.5 text-violet-600" />
            <span>Dialog Settings</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Dialog Title</label>
            <input
              type="text"
              value={p.title || ""}
              onChange={(e) => handlePropChange("title", e.target.value)}
              placeholder="Confirm Action"
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Dialog Message</label>
            <textarea
              rows={2}
              value={p.message || ""}
              onChange={(e) => handlePropChange("message", e.target.value)}
              placeholder="Are you sure you want to proceed?"
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Confirm Button</label>
              <input
                type="text"
                value={p.confirmText || "OK"}
                onChange={(e) => handlePropChange("confirmText", e.target.value)}
                className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cancel Button</label>
              <input
                type="text"
                value={p.cancelText || "Cancel"}
                onChange={(e) => handlePropChange("cancelText", e.target.value)}
                className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 15. VIDEO & AUDIO PROPERTIES                              */}
      {/* ========================================================= */}
      {(isVideo || isAudio) && (
        <div className="border border-slate-200/80 rounded-xl p-3.5 bg-white shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
            {isVideo ? <Video className="w-3.5 h-3.5 text-violet-600" /> : <Volume2 className="w-3.5 h-3.5 text-violet-600" />}
            <span>{isVideo ? "Video Player Settings" : "Audio Player Settings"}</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Media Stream URL
            </label>
            <input
              type="text"
              value={p.url || p.src || ""}
              onChange={(e) => {
                handlePropChange("url", e.target.value);
                handlePropChange("src", e.target.value);
              }}
              placeholder="https://commondatastorage.googleapis.com/..."
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[11px] font-medium text-slate-700">Auto Play</span>
              <input
                type="checkbox"
                checked={p.autoPlay ?? false}
                onChange={(e) => handlePropChange("autoPlay", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[11px] font-medium text-slate-700">Loop</span>
              <input
                type="checkbox"
                checked={p.loop ?? false}
                onChange={(e) => handlePropChange("loop", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 16. WEBVIEW & BROWSER PROPERTIES                          */}
      {/* ========================================================= */}
      {isWebView && (
        <div className="border border-slate-200/80 rounded-xl p-3.5 bg-white shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
            <Globe className="w-3.5 h-3.5 text-violet-600" />
            <span>WebView Browser Settings</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Home URL</label>
            <input
              type="text"
              value={p.homeUrl || p.url || "https://google.com"}
              onChange={(e) => {
                handlePropChange("homeUrl", e.target.value);
                handlePropChange("url", e.target.value);
              }}
              placeholder="https://example.com"
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[11px] font-medium text-slate-700">JavaScript</span>
              <input
                type="checkbox"
                checked={p.enableJavaScript ?? true}
                onChange={(e) => handlePropChange("enableJavaScript", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[11px] font-medium text-slate-700">Zoom</span>
              <input
                type="checkbox"
                checked={p.enableZoom ?? true}
                onChange={(e) => handlePropChange("enableZoom", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 17. HARDWARE, SENSORS & NATIVE MODULES                     */}
      {/* ========================================================= */}
      {isHardwareOrNative && (
        <div className="border border-slate-200/80 rounded-xl p-3.5 bg-white shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
            <Shield className="w-3.5 h-3.5 text-violet-600" />
            <span>Native Hardware & Sensors</span>
          </div>

          {type.includes("sensor") && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Sensor Type</label>
              <select
                value={p.sensorType || "accelerometer"}
                onChange={(e) => handlePropChange("sensorType", e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="accelerometer">Accelerometer</option>
                <option value="gyroscope">Gyroscope</option>
                <option value="light">Ambient Light</option>
                <option value="proximity">Proximity</option>
              </select>
            </div>
          )}

          {(type.includes("location") || type.includes("gps")) && (
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[11px] font-medium text-slate-700">High Accuracy (GPS)</span>
              <input
                type="checkbox"
                checked={p.highAccuracy ?? true}
                onChange={(e) => handlePropChange("highAccuracy", e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded cursor-pointer"
              />
            </div>
          )}

          {type.includes("notification") && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Channel ID</label>
              <input
                type="text"
                value={p.channelId || "default_channel"}
                onChange={(e) => handlePropChange("channelId", e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 18. PROGRESS INDICATOR PROPERTIES                         */}
      {/* ========================================================= */}
      {isProgress && (
        <div className="border border-slate-200/80 rounded-xl p-3.5 bg-white shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
            <Clock className="w-3.5 h-3.5 text-violet-600" />
            <span>Progress Indicator</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] font-medium text-slate-700">Indeterminate (Spinning)</span>
            <input
              type="checkbox"
              checked={p.indeterminate ?? true}
              onChange={(e) => handlePropChange("indeterminate", e.target.checked)}
              className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
            />
          </div>

          {!p.indeterminate && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-700">Progress</label>
                <span className="text-[10px] font-mono text-slate-400">{p.progress ?? 45}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={p.progress ?? 45}
                onChange={(e) => handlePropChange("progress", Number(e.target.value))}
                className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 19. TOOLBAR / TOP APP BAR PROPERTIES                      */}
      {/* ========================================================= */}
      {isToolbar && (
        <div className="border border-slate-200/80 rounded-xl p-3.5 bg-white shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
            <Layers className="w-3.5 h-3.5 text-violet-600" />
            <span>TopAppBar / Toolbar</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={p.title || ""}
              onChange={(e) => handlePropChange("title", e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] font-medium text-slate-700">Show Back Button</span>
            <input
              type="checkbox"
              checked={p.showBackButton ?? true}
              onChange={(e) => handlePropChange("showBackButton", e.target.checked)}
              className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 20. CAMERA & MAP PROPERTIES                               */}
      {/* ========================================================= */}
      {isCamera && (
        <div className="border border-slate-200/80 rounded-xl p-3.5 bg-white shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
            <Camera className="w-3.5 h-3.5 text-violet-600" />
            <span>Camera Settings</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Lens Facing</label>
            <select
              value={p.lensFacing || "back"}
              onChange={(e) => handlePropChange("lensFacing", e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value="back">Back Camera (Main)</option>
              <option value="front">Front Camera (Selfie)</option>
            </select>
          </div>
        </div>
      )}

      {isMap && (
        <div className="border border-slate-200/80 rounded-xl p-3.5 bg-white shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
            <MapPin className="w-3.5 h-3.5 text-violet-600" />
            <span>Google Maps View</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Latitude</label>
              <input
                type="number"
                step="0.001"
                value={p.latitude ?? 37.7749}
                onChange={(e) => handlePropChange("latitude", Number(e.target.value))}
                className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Longitude</label>
              <input
                type="number"
                step="0.001"
                value={p.longitude ?? -122.4194}
                onChange={(e) => handlePropChange("longitude", Number(e.target.value))}
                className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 21. UNIVERSAL DIMENSIONS & LAYOUT SECTION                 */}
      {/* ========================================================= */}
      <div className="border border-slate-200/80 rounded-xl p-3.5 bg-white shadow-2xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
          <Maximize2 className="w-3.5 h-3.5 text-violet-600" />
          <span>Layout & Dimensions</span>
        </div>

        {/* Layout Width & Height */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Width</label>
            <select
              value={
                p.layoutWidth === "match_parent"
                  ? "match_parent"
                  : p.layoutWidth === "wrap_content"
                  ? "wrap_content"
                  : "custom"
              }
              onChange={(e) => handlePropChange("layoutWidth", e.target.value)}
              className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
            >
              <option value="wrap_content">Wrap Content</option>
              <option value="match_parent">Match Parent (Full)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Height</label>
            <select
              value={
                p.layoutHeight === "match_parent"
                  ? "match_parent"
                  : p.layoutHeight === "wrap_content"
                  ? "wrap_content"
                  : "custom"
              }
              onChange={(e) => handlePropChange("layoutHeight", e.target.value)}
              className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
            >
              <option value="wrap_content">Wrap Content</option>
              <option value="match_parent">Match Parent (Full)</option>
            </select>
          </div>
        </div>

        {/* Padding & Margin */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-700">Padding</label>
              <span className="text-[10px] font-mono text-slate-400">{p.padding ?? 8}dp</span>
            </div>
            <input
              type="range"
              min={0}
              max={32}
              value={p.padding ?? 8}
              onChange={(e) => handlePropChange("padding", Number(e.target.value))}
              className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-700">Margin</label>
              <span className="text-[10px] font-mono text-slate-400">{p.margin ?? 4}dp</span>
            </div>
            <input
              type="range"
              min={0}
              max={32}
              value={p.margin ?? 4}
              onChange={(e) => handlePropChange("margin", Number(e.target.value))}
              className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Enabled & Visibility */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] font-medium text-slate-700">Enabled</span>
            <input
              type="checkbox"
              checked={p.enabled ?? true}
              onChange={(e) => handlePropChange("enabled", e.target.checked)}
              className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] font-medium text-slate-700">Visible</span>
            <input
              type="checkbox"
              checked={p.visibility !== "gone" && p.visibility !== "invisible"}
              onChange={(e) =>
                handlePropChange("visibility", e.target.checked ? "visible" : "gone")
              }
              className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 22. DYNAMIC CUSTOM PROPERTIES INSPECTOR                  */}
      {/* ========================================================= */}
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => setShowCustomProps(!showCustomProps)}
          className="w-full px-3.5 py-2.5 bg-slate-50 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-100 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-violet-600" />
            <span>All Custom Component Properties</span>
          </div>
          {showCustomProps ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {showCustomProps && (
          <div className="p-3.5 space-y-3 border-t border-slate-100">
            {/* List all properties currently in component.props */}
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {Object.entries(p).map(([key, val]) => (
                <div key={key} className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono font-bold text-slate-600 block truncate">{key}</span>
                    <input
                      type="text"
                      value={typeof val === "object" ? JSON.stringify(val) : String(val ?? "")}
                      onChange={(e) => {
                        let parsedVal: any = e.target.value;
                        if (val === true || val === false || e.target.value === "true" || e.target.value === "false") {
                          parsedVal = e.target.value === "true";
                        } else if (!isNaN(Number(e.target.value)) && e.target.value !== "") {
                          parsedVal = Number(e.target.value);
                        }
                        handlePropChange(key, parsedVal);
                      }}
                      className="w-full text-xs font-mono px-2 py-0.5 bg-white border border-slate-200 rounded mt-0.5"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add a new custom property */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Add Custom Property</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="property key"
                  value={newPropKey}
                  onChange={(e) => setNewPropKey(e.target.value)}
                  className="w-1/2 text-xs font-mono px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="value"
                  value={newPropValue}
                  onChange={(e) => setNewPropValue(e.target.value)}
                  className="w-1/2 text-xs font-mono px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (newPropKey.trim()) {
                    handlePropChange(newPropKey.trim(), newPropValue);
                    setNewPropKey("");
                    setNewPropValue("");
                  }
                }}
                disabled={!newPropKey.trim()}
                className="w-full py-1 text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-lg transition disabled:opacity-40 cursor-pointer"
              >
                + Add Property
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 23. INTERACTIVITY & LOGIC BLOCKS BUTTON                   */}
      {/* ========================================================= */}
      <button
        type="button"
        onClick={() => onOpenLogicEditor(component.id)}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-violet-50 hover:bg-violet-100/80 border border-violet-200/70 text-violet-900 transition group text-left cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0">
            <Workflow className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold block">Open Logic Blocks</span>
            <span className="text-[10px] text-violet-700/80 font-normal">
              Configure click events & actions
            </span>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-violet-600 group-hover:translate-x-0.5 transition" />
      </button>
    </div>
  );
};
