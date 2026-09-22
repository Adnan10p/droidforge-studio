import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Sparkles,
  Plus,
  Trash2,
  Layers,
  Settings,
  Package,
  Code2,
  CheckCircle2,
  Check,
  Eye,
  Sliders,
  Type,
  Palette,
  ToggleLeft,
  Image as ImageIcon,
  Copy,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  Flame,
  MousePointerClick,
  PlayCircle,
  HelpCircle,
  Hash,
  ChevronDown,
  Info,
  CreditCard,
  Wand2,
  FileCode,
  ClipboardPaste,
  Bot,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  CustomComponentDefinition,
  CustomPropertyDef,
  CustomPropertyType,
  CustomComponentRequiredLib,
  CustomComponentVisualTemplate,
  ComponentCategory,
  AndroidDependency,
} from "../../types";
import { RECOMMENDED_ANDROID_LIBRARIES } from "../../data/defaultCustomComponents";
import { analyzeAndParseCustomCode } from "../../utils/customComponentParser";

interface CustomComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveComponent: (
    componentDef: CustomComponentDefinition,
    insertIntoScreen?: boolean
  ) => void;
  onDeleteComponent?: (componentId: string) => void;
  existingComponent?: CustomComponentDefinition | null;
  existingComponents?: CustomComponentDefinition[];
  projectDependencies?: AndroidDependency[];
}

const AVAILABLE_ICONS = [
  "Sparkles",
  "MousePointerClick",
  "Layers",
  "CreditCard",
  "PlayCircle",
  "Image",
  "Star",
  "ShieldCheck",
  "Flame",
  "Sliders",
  "Type",
  "Heart",
  "Package",
  "Bell",
  "Activity",
  "Tag",
];

const TEMPLATE_PRESETS: {
  id: CustomComponentVisualTemplate;
  label: string;
  desc: string;
  icon: any;
}[] = [
  { id: "card", label: "Card / Container", desc: "Surface with background, border, elevation, and optional child slots", icon: Layers },
  { id: "button", label: "Action Button", desc: "Interactive button with ripple, gradients, icons, and click events", icon: MousePointerClick },
  { id: "badge", label: "Status Badge / Chip", desc: "Compact pill or chip for live statuses, labels, and indicators", icon: Sparkles },
  { id: "banner", label: "Hero Banner", desc: "Wide promotional banner with gradient, title, subtitle, and CTA", icon: CreditCard },
  { id: "media", label: "Media / Avatar Display", desc: "Visual media container with image loading, blur, and aspect ratio", icon: ImageIcon },
  { id: "input", label: "Form Input Box", desc: "Custom styled text field with placeholder, floating label, and border", icon: Type },
];

export const CustomComponentModal: React.FC<CustomComponentModalProps> = ({
  isOpen,
  onClose,
  onSaveComponent,
  onDeleteComponent,
  existingComponent,
  existingComponents = [],
  projectDependencies = [],
}) => {
  const [activeTab, setActiveTab] = useState<"properties" | "libraries" | "general" | "code">("properties");

  // Basic Info
  const [name, setName] = useState("");
  const [typeId, setTypeId] = useState("");
  const [category, setCategory] = useState<ComponentCategory>("Basic UI");
  const [description, setDescription] = useState("");
  const [iconName, setIconName] = useState("Sparkles");
  const [isContainer, setIsContainer] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [visualTemplate, setVisualTemplate] = useState<CustomComponentVisualTemplate>("card");

  // Properties Builder
  const [properties, setProperties] = useState<CustomPropertyDef[]>([]);
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});

  // Libraries / Dependencies
  const [selectedLibraries, setSelectedLibraries] = useState<CustomComponentRequiredLib[]>([]);
  const [customDepInput, setCustomDepInput] = useState("");
  const [customDepName, setCustomDepName] = useState("");

  // New Property Drawer State
  const [newPropKey, setNewPropKey] = useState("");
  const [newPropLabel, setNewPropLabel] = useState("");
  const [newPropType, setNewPropType] = useState<CustomPropertyType>("text");
  const [newPropDefault, setNewPropDefault] = useState("");
  const [newPropDesc, setNewPropDesc] = useState("");

  // Code Editor & AI Analyzer State
  const [isManualCodeEdit, setIsManualCodeEdit] = useState(false);
  const [customComposeCode, setCustomComposeCode] = useState("");
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [aiAnalysisSuccess, setAiAnalysisSuccess] = useState(false);
  const [copiedCodeNotice, setCopiedCodeNotice] = useState(false);

  // Populate state on open or edit
  useEffect(() => {
    if (!isOpen) return;

    setAiAnalysisResult(null);
    setAiAnalysisSuccess(false);
    setCopiedCodeNotice(false);

    if (existingComponent) {
      setName(existingComponent.name);
      setTypeId(existingComponent.type);
      setCategory(existingComponent.category);
      setDescription(existingComponent.description || "");
      setIconName(existingComponent.iconName || "Sparkles");
      setIsContainer(existingComponent.isContainer);
      setIsVisible(existingComponent.isVisible !== undefined ? existingComponent.isVisible : true);
      setVisualTemplate(existingComponent.visualTemplate || "card");
      setProperties(existingComponent.properties || []);
      setSelectedLibraries(existingComponent.requiredLibraries || []);

      if (existingComponent.composeCodeSnippet) {
        setCustomComposeCode(existingComponent.composeCodeSnippet);
        setIsManualCodeEdit(true);
      } else {
        setIsManualCodeEdit(false);
        setCustomComposeCode("");
      }

      const pVals: Record<string, any> = {};
      (existingComponent.properties || []).forEach((p) => {
        pVals[p.key] = existingComponent.defaultProps?.[p.key] ?? p.defaultValue;
      });
      setPreviewValues(pVals);
    } else {
      setIsManualCodeEdit(false);
      setCustomComposeCode("");
      // Default new component setup
      setName("Custom Badge Card");
      setTypeId("CustomBadgeCard");
      setCategory("Basic UI");
      setDescription("Custom UI component ready for Jetpack Compose and visual drag & drop.");
      setIconName("Sparkles");
      setIsContainer(true);
      setIsVisible(true);
      setVisualTemplate("card");

      const defaultPropsList: CustomPropertyDef[] = [
        {
          id: `p_${Date.now()}_1`,
          key: "title",
          label: "Card Title",
          type: "text",
          defaultValue: "Featured Announcement",
          description: "Primary headline label",
        },
        {
          id: `p_${Date.now()}_2`,
          key: "subtitle",
          label: "Subtitle Description",
          type: "text",
          defaultValue: "Custom component with dynamic properties & libraries",
          description: "Supportive text",
        },
        {
          id: `p_${Date.now()}_3`,
          key: "badgeText",
          label: "Status Tag",
          type: "text",
          defaultValue: "NEW",
          description: "Pill status text in the corner",
        },
        {
          id: `p_${Date.now()}_4`,
          key: "accentColor",
          label: "Theme Accent Color",
          type: "color",
          defaultValue: "#6366F1",
          description: "Gradient or highlight color",
        },
        {
          id: `p_${Date.now()}_5`,
          key: "cornerRadius",
          label: "Corner Radius (dp)",
          type: "number",
          defaultValue: 16,
          min: 0,
          max: 36,
          description: "Rounded corners radius",
        },
      ];

      setProperties(defaultPropsList);
      setSelectedLibraries([
        {
          id: "lib_compose_m3",
          name: "Compose Material 3",
          group: "androidx.compose.material3",
          artifact: "material3",
          version: "1.3.1",
          description: "Material 3 tokens, surface and colors",
          required: true,
          category: "Compose",
        },
      ]);

      const initialVals: Record<string, any> = {};
      defaultPropsList.forEach((p) => {
        initialVals[p.key] = p.defaultValue;
      });
      setPreviewValues(initialVals);
    }
  }, [isOpen, existingComponent]);

  // Synchronize programmatic type when name changes (for new components)
  const handleNameChange = (val: string) => {
    setName(val);
    if (!existingComponent) {
      const sanitized = val
        .replace(/[^a-zA-Z0-9]/g, "")
        .replace(/^[0-9]+/, "");
      setTypeId(sanitized ? `Custom${sanitized}` : "CustomComponent");
    }
  };

  // Add a property to list
  const handleAddProperty = () => {
    if (!newPropKey.trim() || !newPropLabel.trim()) return;

    const safeKey = newPropKey
      .trim()
      .replace(/[^a-zA-Z0-9_]/g, "")
      .replace(/^[0-9]+/, "");

    let parsedDefault: any = newPropDefault;
    if (newPropType === "number") {
      parsedDefault = Number(newPropDefault) || 0;
    } else if (newPropType === "boolean") {
      parsedDefault = newPropDefault === "true" || newPropDefault === "1";
    } else if (newPropType === "color" && !newPropDefault) {
      parsedDefault = "#6366F1";
    }

    const newProp: CustomPropertyDef = {
      id: `prop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      key: safeKey,
      label: newPropLabel.trim(),
      type: newPropType,
      defaultValue: parsedDefault,
      description: newPropDesc.trim() || undefined,
    };

    setProperties((prev) => [...prev, newProp]);
    setPreviewValues((prev) => ({ ...prev, [safeKey]: parsedDefault }));

    // Reset inputs
    setNewPropKey("");
    setNewPropLabel("");
    setNewPropType("text");
    setNewPropDefault("");
    setNewPropDesc("");
  };

  // Remove a property
  const handleRemoveProperty = (id: string, key: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
    setPreviewValues((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // Quick preset property buttons
  const handleAddQuickProp = (type: "color" | "text" | "number" | "boolean" | "icon") => {
    if (type === "color") {
      const key = `color_${properties.length + 1}`;
      const newProp: CustomPropertyDef = {
        id: `prop_${Date.now()}`,
        key,
        label: `Accent Color ${properties.length + 1}`,
        type: "color",
        defaultValue: "#3B82F6",
      };
      setProperties((prev) => [...prev, newProp]);
      setPreviewValues((prev) => ({ ...prev, [key]: "#3B82F6" }));
    } else if (type === "text") {
      const key = `text_${properties.length + 1}`;
      const newProp: CustomPropertyDef = {
        id: `prop_${Date.now()}`,
        key,
        label: `Custom Label ${properties.length + 1}`,
        type: "text",
        defaultValue: "Custom Value",
      };
      setProperties((prev) => [...prev, newProp]);
      setPreviewValues((prev) => ({ ...prev, [key]: "Custom Value" }));
    } else if (type === "boolean") {
      const key = `enableFeature_${properties.length + 1}`;
      const newProp: CustomPropertyDef = {
        id: `prop_${Date.now()}`,
        key,
        label: `Enable Feature ${properties.length + 1}`,
        type: "boolean",
        defaultValue: true,
      };
      setProperties((prev) => [...prev, newProp]);
      setPreviewValues((prev) => ({ ...prev, [key]: true }));
    } else if (type === "number") {
      const key = `size_${properties.length + 1}`;
      const newProp: CustomPropertyDef = {
        id: `prop_${Date.now()}`,
        key,
        label: `Size / Padding (dp)`,
        type: "number",
        defaultValue: 16,
        min: 0,
        max: 64,
      };
      setProperties((prev) => [...prev, newProp]);
      setPreviewValues((prev) => ({ ...prev, [key]: 16 }));
    }
  };

  // Toggle required library
  const handleToggleLibrary = (lib: CustomComponentRequiredLib) => {
    setSelectedLibraries((prev) => {
      const exists = prev.some((l) => l.group === lib.group && l.artifact === lib.artifact);
      if (exists) {
        return prev.filter((l) => !(l.group === lib.group && l.artifact === lib.artifact));
      } else {
        return [...prev, { ...lib, required: true }];
      }
    });
  };

  // Remove / Detach a library dependency
  const handleRemoveLibrary = (libId?: string, group?: string, artifact?: string) => {
    setSelectedLibraries((prev) =>
      prev.filter(
        (l) =>
          !(libId && l.id === libId) &&
          !(group && artifact && l.group === group && l.artifact === artifact)
      )
    );
  };

  // Add custom maven dependency
  const handleAddCustomDependency = () => {
    if (!customDepInput.trim()) return;
    const parts = customDepInput.trim().split(":");
    if (parts.length < 3) {
      alert("Please enter Gradle dependency in format: group:artifact:version (e.g. com.example:lib:1.0.0)");
      return;
    }

    const [group, artifact, version] = parts;
    const newLib: CustomComponentRequiredLib = {
      id: `lib_custom_${Date.now()}`,
      name: customDepName.trim() || artifact,
      group,
      artifact,
      version,
      description: "Custom user-specified Gradle Maven dependency",
      required: true,
      category: "Utility",
    };

    setSelectedLibraries((prev) => [...prev, newLib]);
    setCustomDepInput("");
    setCustomDepName("");
  };

  // Generate Compose Code snippet live
  const generatedComposeSnippet = useMemo(() => {
    const paramsList = properties.map((p) => {
      let ktType = "String";
      let defVal = `"${p.defaultValue}"`;
      if (p.type === "number") {
        ktType = "Int";
        defVal = `${p.defaultValue}`;
      } else if (p.type === "boolean") {
        ktType = "Boolean";
        defVal = `${p.defaultValue}`;
      } else if (p.type === "color") {
        ktType = "Color";
        defVal = `Color(android.graphics.Color.parseColor("${p.defaultValue || "#6366F1"}"))`;
      }
      return `    ${p.key}: ${ktType} = ${defVal}`;
    });

    const isContainerComponent = isContainer;
    const contentParam = isContainerComponent ? `,\n    content: @Composable ColumnScope.() -> Unit = {}` : "";

    if (!isVisible) {
      // Non-Visible Background Runtime Controller Snippet
      const propDeps = properties.map((p) => p.key).join(", ");
      return `package com.droidforge.ui.components

import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext

/**
 * Non-Visible Custom Component: ${name}
 * ${description || "Background runtime controller component (SDK manager, DB helper, or service)"}
 * Non-Visible Mode: Operates in background at runtime without rendering UI surface.
 */
@Composable
fun ${typeId || "CustomComponent"}(
${paramsList.join(",\n")}${paramsList.length > 0 ? ",\n" : ""}    onInitialized: () -> Unit = {},
    onError: (String) -> Unit = {}
) {
    val context = LocalContext.current

    // Background Runtime Effect (Runs automatically on screen load / parameter change)
    LaunchedEffect(${propDeps || "Unit"}) {
        try {
            // ${name} Background Manager Execution
            onInitialized()
        } catch (e: Exception) {
            onError(e.message ?: "${name} initialization error")
        }
    }
}
`;
    }

    // Visible UI Component Snippet
    return `package com.droidforge.ui.components

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.text.font.FontWeight

/**
 * Custom Component: ${name}
 * ${description || "Auto-generated Jetpack Compose component ready for DroidForge Studio"}
 */
@Composable
fun ${typeId || "CustomComponent"}(
${paramsList.join(",\n")}${contentParam}
) {
    ElevatedCard(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 4.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.elevatedCardColors(containerColor = Color.White),
        elevation = CardDefaults.elevatedCardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(
                text = ${properties.find((p) => p.key === "title") ? "title" : `"${name}"`},
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = ${properties.find((p) => p.key === "subtitle") ? "subtitle" : `"${description || "Component View"}"`},
                fontSize = 12.sp,
                color = Color.Gray
            )
            ${isContainerComponent ? "\n            content()" : ""}
        }
    }
}
`;
  }, [name, typeId, description, properties, isContainer, isVisible]);

  // Current effective Compose code (either user-edited custom code or auto-generated)
  const effectiveComposeCode = isManualCodeEdit && customComposeCode
    ? customComposeCode
    : generatedComposeSnippet;

  // AI Code Analyzer & Auto-Configurator:
  // Parses Kotlin / Compose code, automatically extracts parameters, detects required Maven libraries,
  // sets appropriate category & UI template, and syncs preview values.
  const handleRunAiCodeAnalysis = (codeToAnalyze?: string) => {
    const targetCode = (codeToAnalyze ?? customComposeCode).trim();
    if (!targetCode) {
      setAiAnalysisResult("Please paste or write your Kotlin Compose code in the editor first.");
      setAiAnalysisSuccess(false);
      return;
    }

    try {
      const parsed = analyzeAndParseCustomCode(targetCode);

      // Auto-populate all configurations
      if (parsed.name && (!name || name === "Custom Badge Card" || name === "Custom Component")) {
        setName(parsed.name);
        setTypeId(parsed.typeId);
      } else if (parsed.typeId) {
        setTypeId(parsed.typeId);
      }

      setCategory(parsed.category);
      setVisualTemplate(parsed.visualTemplate);
      setIsContainer(parsed.isContainer);
      if (parsed.description) {
        setDescription(parsed.description);
      }

      // Merge and auto-add libraries without duplicates
      setSelectedLibraries((prev) => {
        const merged = [...prev];
        parsed.libraries.forEach((newLib) => {
          if (!merged.some((existing) => existing.group === newLib.group && existing.artifact === newLib.artifact)) {
            merged.push(newLib);
          }
        });
        return merged;
      });

      // Update properties list
      if (parsed.properties && parsed.properties.length > 0) {
        setProperties(parsed.properties);

        // Update preview values
        const newPreviewVals: Record<string, any> = {};
        parsed.properties.forEach((p) => {
          newPreviewVals[p.key] = p.defaultValue;
        });
        setPreviewValues((prev) => ({ ...prev, ...newPreviewVals }));
      }

      // Ensure manual mode is preserved with this code
      setCustomComposeCode(targetCode);
      setIsManualCodeEdit(true);

      setAiAnalysisResult(parsed.aiExplanation);
      setAiAnalysisSuccess(true);
    } catch (err: any) {
      setAiAnalysisResult(`AI Analysis encountered an issue: ${err?.message || "Invalid syntax"}`);
      setAiAnalysisSuccess(false);
    }
  };

  // Handle Copy Code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(effectiveComposeCode);
    setCopiedCodeNotice(true);
    setTimeout(() => setCopiedCodeNotice(false), 2000);
  };

  // Handle Paste from clipboard into editor
  const handlePasteCode = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText && clipText.trim()) {
        setCustomComposeCode(clipText);
        setIsManualCodeEdit(true);
        // Automatically trigger AI analysis on paste for immediate seamless experience!
        handleRunAiCodeAnalysis(clipText);
      }
    } catch {
      // In case clipboard permission is restricted
      const manual = prompt("Paste your Jetpack Compose Kotlin code here:");
      if (manual && manual.trim()) {
        setCustomComposeCode(manual);
        setIsManualCodeEdit(true);
        handleRunAiCodeAnalysis(manual);
      }
    }
  };

  // Handle Save
  const handleSave = (insertIntoScreen = false) => {
    if (!name.trim()) {
      alert("Please enter a component name");
      return;
    }

    const cleanTypeId = (typeId.trim() || `Custom${name.replace(/[^a-zA-Z0-9]/g, "")}`)
      .replace(/^[0-9]+/, "");

    // Run full code analysis to extract @SimpleFunction and @SimpleEvent logic schemas
    const parsed = analyzeAndParseCustomCode(effectiveComposeCode);

    const defaultPropsMap: Record<string, any> = {};
    properties.forEach((p) => {
      defaultPropsMap[p.key] = p.defaultValue;
    });

    const finalizedDef: CustomComponentDefinition & { parsedEvents?: any[]; parsedFunctions?: any[] } = {
      id: existingComponent?.id || `custom_comp_${cleanTypeId.toLowerCase()}_${Date.now()}`,
      type: cleanTypeId,
      name: name.trim(),
      category,
      description: description.trim() || `${name} custom Android component`,
      iconName,
      isContainer,
      isVisible,
      visualTemplate,
      properties,
      defaultProps: defaultPropsMap,
      requiredLibraries: selectedLibraries,
      supportedEvents: parsed.events && parsed.events.length > 0 ? parsed.events : ["Click"],
      parsedEvents: parsed.parsedEvents,
      parsedFunctions: parsed.parsedFunctions,
      composeCodeSnippet: effectiveComposeCode,
      createdAt: existingComponent?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveComponent(finalizedDef, insertIntoScreen);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="custom-component-maker-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div
        id="custom-component-maker-modal"
        className="rounded-2xl border shadow-2xl w-full max-w-5xl h-[92vh] max-h-[850px] flex flex-col overflow-hidden"
        style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}
      >
        {/* Header */}
        <div className="p-4 px-6 border-b flex items-center justify-between shrink-0" style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold" style={{ color: "var(--ide-text)" }}>
                  {existingComponent ? "Edit Custom Component" : "Custom Component Studio & Maker"}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Jetpack Compose & Kotlin
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: "var(--ide-text-muted)" }}>
                Define dynamic properties, choose Android libraries & dependencies, and live preview on canvas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg transition hover:opacity-80 cursor-pointer"
              style={{ color: "var(--ide-text-muted)" }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center px-6 border-b gap-2 shrink-0 overflow-x-auto" style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)" }}>
          <button
            type="button"
            onClick={() => setActiveTab("properties")}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === "properties"
                ? "border-violet-500 rounded-t-lg font-extrabold shadow-2xs"
                : "border-transparent hover:opacity-90"
            }`}
            style={
              activeTab === "properties"
                ? { backgroundColor: "var(--ide-card-bg)", color: "var(--ide-text)", borderColor: "var(--ide-accent)" }
                : { color: "var(--ide-text-muted)" }
            }
          >
            <Sliders className="w-3.5 h-3.5 text-violet-400" />
            <span>Component Properties ({properties.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("libraries")}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === "libraries"
                ? "border-violet-500 rounded-t-lg font-extrabold shadow-2xs"
                : "border-transparent hover:opacity-90"
            }`}
            style={
              activeTab === "libraries"
                ? { backgroundColor: "var(--ide-card-bg)", color: "var(--ide-text)", borderColor: "var(--ide-accent)" }
                : { color: "var(--ide-text-muted)" }
            }
          >
            <Package className="w-3.5 h-3.5 text-indigo-400" />
            <span>Android Libraries & Dependencies ({selectedLibraries.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === "general"
                ? "border-violet-500 rounded-t-lg font-extrabold shadow-2xs"
                : "border-transparent hover:opacity-90"
            }`}
            style={
              activeTab === "general"
                ? { backgroundColor: "var(--ide-card-bg)", color: "var(--ide-text)", borderColor: "var(--ide-accent)" }
                : { color: "var(--ide-text-muted)" }
            }
          >
            <Settings className="w-3.5 h-3.5 text-emerald-400" />
            <span>General & Visual Template</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === "code"
                ? "border-violet-500 rounded-t-lg font-extrabold shadow-2xs"
                : "border-transparent hover:opacity-90"
            }`}
            style={
              activeTab === "code"
                ? { backgroundColor: "var(--ide-card-bg)", color: "var(--ide-text)", borderColor: "var(--ide-accent)" }
                : { color: "var(--ide-text-muted)" }
            }
          >
            <Code2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Compose Kotlin Studio</span>
            {isManualCodeEdit && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Custom code active" />
            )}
          </button>
        </div>

        {/* Modal Main Content: Split into Editor (Left) & Live Preview (Right) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden" style={{ backgroundColor: "var(--ide-card-bg)" }}>
          {/* Left Panel: Active Tab Form */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 border-r" style={{ borderColor: "var(--ide-border)" }}>
            {/* TAB 1: PROPERTIES BUILDER */}
            {activeTab === "properties" && (
              <div className="space-y-4">
                {/* AI Import Code Helper banner in Properties */}
                <div className="p-3 rounded-xl border flex items-center justify-between gap-3 text-xs shadow-2xs" style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}>
                  <div className="flex items-center gap-2" style={{ color: "var(--ide-text)" }}>
                    <Bot className="w-4 h-4 text-violet-400 shrink-0" />
                    <span>Have Kotlin / Compose code? Paste it in the <strong className="text-violet-300">Compose Kotlin Studio</strong> and click <strong className="text-amber-300">AI Auto-Sync</strong> to configure properties, libraries, and category automatically!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("code")}
                    className="shrink-0 px-2.5 py-1 text-xs font-bold bg-violet-600 hover:bg-violet-700 active:scale-95 text-white rounded-lg shadow-2xs flex items-center gap-1 transition cursor-pointer"
                  >
                    <Wand2 className="w-3 h-3 text-amber-300" />
                    <span>Open Code Studio</span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Configured Properties</h4>
                    <p className="text-[11px] text-slate-500">
                      These properties appear in the Properties Panel when this component is selected on the canvas.
                    </p>
                  </div>

                  {/* Quick Add Presets */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick Add:</span>
                    <button
                      type="button"
                      onClick={() => handleAddQuickProp("text")}
                      className="px-2 py-1 text-[11px] font-semibold rounded-md shadow-2xs transition cursor-pointer hover:opacity-90"
                      style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}
                    >
                      + Text
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuickProp("color")}
                      className="px-2 py-1 text-[11px] font-semibold rounded-md shadow-2xs transition cursor-pointer hover:opacity-90"
                      style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}
                    >
                      + Color
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuickProp("number")}
                      className="px-2 py-1 text-[11px] font-semibold rounded-md shadow-2xs transition cursor-pointer hover:opacity-90"
                      style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}
                    >
                      + Number
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuickProp("boolean")}
                      className="px-2 py-1 text-[11px] font-semibold rounded-md shadow-2xs transition cursor-pointer hover:opacity-90"
                      style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}
                    >
                      + Toggle
                    </button>
                  </div>
                </div>

                {/* Existing Properties List */}
                <div className="space-y-2">
                  {properties.map((prop) => (
                    <div
                      key={prop.id}
                      className="p-3 border rounded-xl flex items-center justify-between gap-3 shadow-2xs transition"
                      style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0" style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)" }}>
                          {prop.type === "color" ? (
                            <span
                              className="w-4 h-4 rounded-full border border-black/10 inline-block shadow-2xs"
                              style={{ backgroundColor: previewValues[prop.key] || prop.defaultValue }}
                            />
                          ) : prop.type === "number" ? (
                            <Hash className="w-4 h-4 text-emerald-400" />
                          ) : prop.type === "boolean" ? (
                            <ToggleLeft className="w-4 h-4 text-violet-400" />
                          ) : (
                            <Type className="w-4 h-4 text-blue-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold" style={{ color: "var(--ide-text)" }}>{prop.label}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded" style={{ backgroundColor: "var(--ide-card-bg)", color: "var(--ide-text-muted)" }}>
                              {prop.key}
                            </span>
                            <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 bg-violet-500/20 text-violet-300 rounded-full border border-violet-500/30">
                              {prop.type}
                            </span>
                          </div>
                          <span className="text-[11px] block mt-0.5" style={{ color: "var(--ide-text-muted)" }}>
                            Default: {String(prop.defaultValue)} {prop.description ? `• ${prop.description}` : ""}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveProperty(prop.id, prop.key)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 rounded-md hover:bg-rose-500/20 transition cursor-pointer"
                          title="Remove Property"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {properties.length === 0 && (
                    <div className="p-8 text-center border border-dashed rounded-xl text-xs" style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text-muted)" }}>
                      No custom properties added yet. Click "+ Text" or use the form below to add properties.
                    </div>
                  )}
                </div>

                {/* Add New Property Card */}
                <div className="p-4 rounded-xl border space-y-3 shadow-2xs" style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}>
                  <span className="text-xs font-bold text-violet-400 block flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-violet-400" />
                    <span>Add New Dynamic Property</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold mb-1" style={{ color: "var(--ide-text-muted)" }}>
                        Property Key (ID)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. badgeCount"
                        value={newPropKey}
                        onChange={(e) => setNewPropKey(e.target.value)}
                        className="w-full text-xs font-mono px-2.5 py-1.5 rounded-lg outline-none border focus:ring-1 focus:ring-violet-500"
                        style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold mb-1" style={{ color: "var(--ide-text-muted)" }}>
                        Display Label
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Badge Count"
                        value={newPropLabel}
                        onChange={(e) => setNewPropLabel(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg outline-none border focus:ring-1 focus:ring-violet-500"
                        style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold mb-1" style={{ color: "var(--ide-text-muted)" }}>
                        Property Type
                      </label>
                      <select
                        value={newPropType}
                        onChange={(e) => setNewPropType(e.target.value as CustomPropertyType)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg outline-none border focus:ring-1 focus:ring-violet-500"
                        style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}
                      >
                        <option value="text">Text (String)</option>
                        <option value="number">Number (Integer / Dp)</option>
                        <option value="color">Color (Hex Color)</option>
                        <option value="boolean">Toggle (Boolean)</option>
                        <option value="icon">Vector Icon</option>
                        <option value="image_url">Image URL</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold mb-1" style={{ color: "var(--ide-text-muted)" }}>
                        Default Initial Value
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 5, #FF0055, or Active"
                        value={newPropDefault}
                        onChange={(e) => setNewPropDefault(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg outline-none border focus:ring-1 focus:ring-violet-500"
                        style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">
                        Help Hint / Description
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Controls number of active notifications"
                        value={newPropDesc}
                        onChange={(e) => setNewPropDesc(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-violet-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddProperty}
                    disabled={!newPropKey.trim() || !newPropLabel.trim()}
                    className="w-full py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Property to Component</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: LIBRARIES & DEPENDENCIES */}
            {activeTab === "libraries" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold" style={{ color: "var(--ide-text)" }}>
                    Component Libraries & Gradle Dependencies ({selectedLibraries.length})
                  </h4>
                  <p className="text-[11px]" style={{ color: "var(--ide-text-muted)" }}>
                    Manage Android & Jetpack Compose libraries linked to this component and project. Automatically synced to Code Studio <code className="px-1.5 py-0.5 rounded font-mono border" style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-accent)" }}>app/build.gradle.kts</code>, Version Control, and APK Build.
                  </p>
                </div>

                {/* Attached Component Dependencies List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: "var(--ide-text-muted)" }}>
                      Active / Attached Dependencies ({selectedLibraries.length})
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 font-semibold">
                      Synced with Project
                    </span>
                  </div>

                  {selectedLibraries.length === 0 ? (
                    <div className="p-6 text-center border border-dashed rounded-xl text-xs" style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text-muted)" }}>
                      No custom libraries attached yet. Add a Maven dependency below or select from core Android libraries.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedLibraries.map((lib, idx) => {
                        const isAlreadyInProject = (projectDependencies || []).some(
                          (d) => d && d.group === lib.group && d.artifact === lib.artifact && d.enabled !== false
                        );

                        return (
                          <div
                            key={lib.id || `selected_lib_${idx}`}
                            className="p-3 rounded-xl border flex flex-col justify-between transition shadow-2xs"
                            style={{
                              backgroundColor: "var(--ide-card-inner-bg)",
                              borderColor: "var(--ide-border)",
                              color: "var(--ide-text)",
                            }}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="text-xs font-bold" style={{ color: "var(--ide-text)" }}>
                                  {lib.name}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {isAlreadyInProject ? (
                                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-semibold border border-emerald-500/30">
                                      In Project
                                    </span>
                                  ) : (
                                    <span className="text-[9px] px-1.5 py-0.2 bg-violet-500/20 text-violet-300 rounded font-semibold border border-violet-500/30">
                                      Attached
                                    </span>
                                  )}
                                  
                                  {/* Delete Dependency Trash Icon */}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveLibrary(lib.id, lib.group, lib.artifact)}
                                    className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-md transition cursor-pointer"
                                    title="Delete/Detach Dependency"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <p className="text-[11px] leading-tight" style={{ color: "var(--ide-text-muted)" }}>
                                {lib.description || "Android Jetpack Compose component dependency"}
                              </p>
                            </div>

                            <div className="pt-2 mt-2 border-t flex items-center justify-between text-[10px] font-mono" style={{ borderColor: "var(--ide-border)" }}>
                              <span className="truncate max-w-[170px]" style={{ color: "var(--ide-text-muted)" }}>
                                {lib.group}:{lib.artifact}
                              </span>
                              <span className="text-violet-400 font-bold">v{lib.version}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Add Custom Maven / JitPack Dependency Form */}
                <div className="p-4 rounded-xl border space-y-3 shadow-2xs" style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-violet-400" />
                      <span className="text-xs font-bold" style={{ color: "var(--ide-text)" }}>
                        Add Custom Maven / JitPack Dependency
                      </span>
                    </div>
                    <span className="text-[10px] font-mono" style={{ color: "var(--ide-text-muted)" }}>
                      Gradle / Maven Coordinate
                    </span>
                  </div>

                  <p className="text-[11px]" style={{ color: "var(--ide-text-muted)" }}>
                    Enter any standard Maven dependency coordinate string from GitHub, MavenCentral, or Google Maven Repository:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold mb-1" style={{ color: "var(--ide-text-muted)" }}>
                        Library Title / Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. YouTube Player"
                        value={customDepName}
                        onChange={(e) => setCustomDepName(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg outline-none border focus:ring-1 focus:ring-violet-500 font-medium"
                        style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold mb-1" style={{ color: "var(--ide-text-muted)" }}>
                        Coordinate String (group:artifact:version)
                      </label>
                      <input
                        type="text"
                        placeholder="group:artifact:version (e.g. com.pierfrancescosoffritti.androidyoutubeplayer:chromecast-sender:0.28)"
                        value={customDepInput}
                        onChange={(e) => setCustomDepInput(e.target.value)}
                        className="w-full text-xs font-mono px-2.5 py-1.5 rounded-lg outline-none border focus:ring-1 focus:ring-violet-500"
                        style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCustomDependency}
                    disabled={!customDepInput.trim()}
                    className="w-full py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Attach Custom Dependency to Component</span>
                  </button>
                </div>

                {/* Quick Attach Core Libraries Picker */}
                <div className="p-4 rounded-xl border space-y-2.5" style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)" }}>
                  <span className="text-xs font-bold block" style={{ color: "var(--ide-text)" }}>
                    Quick Attach Recommended Core Android Libraries
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {RECOMMENDED_ANDROID_LIBRARIES.map((lib) => {
                      const isAttached = (selectedLibraries || []).some(
                        (l) => l && l.group === lib.group && l.artifact === lib.artifact
                      );

                      return (
                        <div
                          key={`quick_lib_${lib.id}`}
                          onClick={() => handleToggleLibrary(lib)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition select-none flex items-center justify-between ${
                            isAttached
                              ? "bg-violet-500/20 border-violet-500/50 text-white"
                              : "hover:bg-slate-800/40"
                          }`}
                          style={{
                            backgroundColor: isAttached ? undefined : "var(--ide-card-bg)",
                            borderColor: isAttached ? undefined : "var(--ide-border)",
                            color: "var(--ide-text)",
                          }}
                        >
                          <div>
                            <span className="text-xs font-bold block">{lib.name}</span>
                            <span className="text-[10px] font-mono" style={{ color: "var(--ide-text-muted)" }}>
                              {lib.group}:{lib.artifact} (v{lib.version})
                            </span>
                          </div>

                          <button
                            type="button"
                            className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                              isAttached
                                ? "bg-violet-600 text-white"
                                : "bg-slate-700/60 hover:bg-slate-700 text-slate-200"
                            }`}
                          >
                            {isAttached ? "Attached ✓" : "+ Attach"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: GENERAL & VISUAL TEMPLATE */}
            {activeTab === "general" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: "var(--ide-text)" }}>
                      Component Name (Display)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Gradient Action Card"
                      className="w-full text-xs font-bold px-3 py-2 rounded-xl outline-none border focus:ring-2 focus:ring-violet-500"
                      style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: "var(--ide-text)" }}>
                      Kotlin Type Identifier
                    </label>
                    <input
                      type="text"
                      value={typeId}
                      onChange={(e) => setTypeId(e.target.value)}
                      placeholder="e.g. CustomActionCard"
                      className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl outline-none border focus:ring-2 focus:ring-violet-500 text-violet-400"
                      style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)" }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: "var(--ide-text)" }}>
                      Palette Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ComponentCategory)}
                      className="w-full text-xs px-3 py-2 rounded-xl outline-none border focus:ring-2 focus:ring-violet-500"
                      style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}
                    >
                      <option value="Basic UI">Basic UI</option>
                      <option value="Layouts">Layouts & Containers</option>
                      <option value="Advanced UI">Advanced UI</option>
                      <option value="Images & Media UI">Images & Media UI</option>
                      <option value="Custom UI">Custom UI</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: "var(--ide-text)" }}>
                      Icon
                    </label>
                    <select
                      value={iconName}
                      onChange={(e) => setIconName(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl outline-none border focus:ring-2 focus:ring-violet-500"
                      style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}
                    >
                      {AVAILABLE_ICONS.map((ic) => (
                        <option key={ic} value={ic}>
                          {ic}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: "var(--ide-text)" }}>
                    Component Description & Documentation
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe how and when to use this component..."
                    className="w-full text-xs px-3 py-2 rounded-xl outline-none border focus:ring-2 focus:ring-violet-500"
                    style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}
                  />
                </div>

                {/* Visible vs Non-Visible Component Type Selector */}
                <div className="p-3.5 rounded-xl border space-y-2 shadow-2xs" style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}>
                  <div>
                    <span className="text-xs font-bold block" style={{ color: "var(--ide-text)" }}>
                      Component Visibility Mode
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--ide-text-muted)" }}>
                      Choose whether this component renders UI on screen (Visible) or works as a runtime controller (Non-Visible).
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsVisible(true)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                        isVisible
                          ? "bg-violet-500/20 border-violet-500 text-violet-300 ring-2 ring-violet-500/30 font-bold"
                          : "hover:bg-slate-800/40"
                      }`}
                      style={{
                        backgroundColor: isVisible ? undefined : "var(--ide-card-bg)",
                        borderColor: isVisible ? undefined : "var(--ide-border)",
                        color: "var(--ide-text)",
                      }}
                    >
                      <Eye className="w-4 h-4 text-violet-400 shrink-0" />
                      <div>
                        <span className="text-xs font-bold block">👁️ Visible Component</span>
                        <span className="text-[10px] font-normal" style={{ color: "var(--ide-text-muted)" }}>Renders UI on canvas (e.g. Card, Button, Banner, Chart)</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsVisible(false)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                        !isVisible
                          ? "bg-purple-500/20 border-purple-500 text-purple-300 ring-2 ring-purple-500/30 font-bold"
                          : "hover:bg-slate-800/40"
                      }`}
                      style={{
                        backgroundColor: !isVisible ? undefined : "var(--ide-card-bg)",
                        borderColor: !isVisible ? undefined : "var(--ide-border)",
                        color: "var(--ide-text)",
                      }}
                    >
                      <Layers className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <span className="text-xs font-bold block">🧩 Non-Visible Component</span>
                        <span className="text-[10px] font-normal" style={{ color: "var(--ide-text-muted)" }}>Runs in background at runtime (e.g. StartIo Ads SDK, Room DB, Telephony)</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Container Switch */}
                <div className="p-3 rounded-xl border flex items-center justify-between" style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)" }}>
                  <div>
                    <span className="text-xs font-bold block" style={{ color: "var(--ide-text)" }}>
                      Can hold child components (Container)?
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--ide-text-muted)" }}>
                      If enabled, users can drop other buttons, labels, and images inside this component.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isContainer}
                    onChange={(e) => setIsContainer(e.target.checked)}
                    className="w-4 h-4 text-violet-600 rounded"
                  />
                </div>

                {/* Visual Template Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold" style={{ color: "var(--ide-text)" }}>
                    Visual Layout Template
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TEMPLATE_PRESETS.map((tmpl) => {
                      const IconComp = tmpl.icon;
                      const isCurrent = visualTemplate === tmpl.id;
                      return (
                        <div
                          key={tmpl.id}
                          onClick={() => setVisualTemplate(tmpl.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition select-none flex flex-col items-start gap-1.5 ${
                            isCurrent
                              ? "bg-violet-500/20 border-violet-500 ring-2 ring-violet-500/30"
                              : "hover:border-violet-400/40"
                          }`}
                          style={{
                            backgroundColor: isCurrent ? undefined : "var(--ide-card-bg)",
                            borderColor: isCurrent ? undefined : "var(--ide-border)",
                            color: "var(--ide-text)",
                          }}
                        >
                          <div className={`p-1.5 rounded-lg ${isCurrent ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-300"}`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold" style={{ color: "var(--ide-text)" }}>{tmpl.label}</span>
                          <span className="text-[10px] line-clamp-2" style={{ color: "var(--ide-text-muted)" }}>{tmpl.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: JETPACK COMPOSE CODE - FULL STUDIO EDITOR & AI ASSIST */}
            {activeTab === "code" && (
              <div className="space-y-4">
                {/* Header & Controls Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border" style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}>
                  <div>
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-violet-400" />
                      <h4 className="text-sm font-bold" style={{ color: "var(--ide-text)" }}>Jetpack Compose Kotlin Studio</h4>
                      {isManualCodeEdit ? (
                        <span className="text-[10px] px-2 py-0.5 font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Custom Code Mode
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Auto-Generated Live
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--ide-text-muted)" }}>
                      Edit, copy, or paste any Compose / AIX code. Click <strong>AI Auto-Sync</strong> to instantly extract properties, linked libraries, and UI category.
                    </p>
                  </div>

                  {/* Actions: Copy, Paste, AI Auto-Sync, Reset */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                      style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}
                      title="Copy Kotlin Composable code"
                    >
                      {copiedCodeNotice ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handlePasteCode}
                      className="px-2.5 py-1.5 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 flex items-center gap-1.5 transition active:scale-95"
                      title="Paste Kotlin code from clipboard"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Paste Code</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRunAiCodeAnalysis()}
                      className="px-3 py-1.5 text-xs font-bold bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg shadow-xs flex items-center gap-1.5 transition active:scale-95"
                      title="Analyze code with AI to auto-create properties, libraries and category"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                      <span>AI Auto-Sync & Extract</span>
                    </button>

                    {isManualCodeEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Reset to auto-generated code template based on configured properties?")) {
                            setIsManualCodeEdit(false);
                            setCustomComposeCode("");
                            setAiAnalysisResult(null);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        title="Revert to auto-generated Compose template"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* AI Assistant Output Banner */}
                {aiAnalysisResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 transition-all ${
                      aiAnalysisSuccess
                        ? "bg-violet-50/90 border-violet-200 text-violet-950"
                        : "bg-amber-50/90 border-amber-200 text-amber-900"
                    }`}
                  >
                    <Bot className={`w-4 h-4 mt-0.5 shrink-0 ${aiAnalysisSuccess ? "text-violet-600" : "text-amber-600"}`} />
                    <div className="flex-1 whitespace-pre-line font-sans text-xs">
                      {aiAnalysisResult}
                    </div>
                    <button
                      type="button"
                      onClick={() => setAiAnalysisResult(null)}
                      className="text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Interactive Kotlin Code Editor Area */}
                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      ui/components/{typeId || "CustomComponent"}.kt
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isManualCodeEdit ? "Custom User Kotlin" : "Synchronized with Properties"}
                    </span>
                  </div>

                  <textarea
                    value={effectiveComposeCode}
                    onChange={(e) => {
                      setCustomComposeCode(e.target.value);
                      setIsManualCodeEdit(true);
                    }}
                    placeholder="// Paste your Jetpack Compose @Composable fun or Android Extension code here..."
                    rows={16}
                    spellCheck={false}
                    className="w-full p-4 bg-slate-950 text-emerald-300 font-mono text-xs leading-relaxed outline-none resize-y border-none selection:bg-violet-800 selection:text-white"
                  />

                  {/* Fast Action Footer */}
                  <div className="px-3 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {effectiveComposeCode.split("\n").length} lines &bull; Ready for APK packaging
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRunAiCodeAnalysis()}
                        className="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 hover:underline"
                      >
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        Sync Properties from Code
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Live Interactive Preview */}
          <div className="w-full md:w-80 lg:w-96 p-5 flex flex-col justify-between shrink-0 border-l" style={{ backgroundColor: "var(--ide-card-inner-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: "var(--ide-border)" }}>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-bold" style={{ color: "var(--ide-text)" }}>Live Component Preview</span>
                </div>
                <span className="text-[10px] font-mono" style={{ color: "var(--ide-text-muted)" }}>Android Canvas</span>
              </div>

              {/* Rendered Component Simulation */}
              <div className="p-4 rounded-2xl flex flex-col items-center justify-center min-h-[200px] border shadow-inner" style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)" }}>
                {visualTemplate === "button" ? (
                  <button
                    style={{
                      borderRadius: `${previewValues.cornerRadius ?? 24}px`,
                      background: previewValues.startColor && previewValues.endColor
                        ? `linear-gradient(135deg, ${previewValues.startColor}, ${previewValues.endColor})`
                        : (previewValues.accentColor || "#6366F1"),
                      color: previewValues.textColor || "#FFFFFF",
                    }}
                    className="w-full py-3 px-5 font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{previewValues.text || previewValues.title || name || "Button Action"}</span>
                  </button>
                ) : visualTemplate === "badge" ? (
                  <div
                    style={{
                      borderColor: previewValues.badgeColor || previewValues.accentColor || "#10B981",
                      backgroundColor: `${previewValues.badgeColor || previewValues.accentColor || "#10B981"}18`,
                    }}
                    className="py-1.5 px-3 rounded-full border flex items-center gap-2 shadow-xs"
                  >
                    <span
                      style={{ backgroundColor: previewValues.badgeColor || previewValues.accentColor || "#10B981" }}
                      className="w-2.5 h-2.5 rounded-full animate-pulse"
                    />
                    <span
                      style={{ color: previewValues.badgeColor || previewValues.accentColor || "#10B981" }}
                      className="text-xs font-bold"
                    >
                      {previewValues.label || previewValues.badgeText || "Active Status"}
                    </span>
                  </div>
                ) : visualTemplate === "banner" ? (
                  <div
                    style={{
                      borderRadius: `${previewValues.cornerRadius ?? 16}px`,
                      background: previewValues.gradientStart && previewValues.gradientEnd
                        ? `linear-gradient(135deg, ${previewValues.gradientStart}, ${previewValues.gradientEnd})`
                        : "linear-gradient(135deg, #6366F1, #EC4899)",
                    }}
                    className="w-full p-4 text-white shadow-md space-y-1.5"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block">
                      {previewValues.badgeText || "PRO"}
                    </span>
                    <h5 className="text-sm font-bold">{previewValues.title || name}</h5>
                    <p className="text-xs opacity-90">{previewValues.subtitle || description}</p>
                  </div>
                ) : (
                  /* Standard Card Layout */
                  <div
                    style={{
                      borderRadius: `${previewValues.cornerRadius ?? 16}px`,
                      backgroundColor: "var(--ide-card-inner-bg)",
                      borderColor: "var(--ide-border)",
                      color: "var(--ide-text)",
                    }}
                    className="w-full overflow-hidden border shadow-sm"
                  >
                    {/* Optional top accent stripe */}
                    <div
                      style={{
                        background: previewValues.gradientStart && previewValues.gradientEnd
                          ? `linear-gradient(90deg, ${previewValues.gradientStart}, ${previewValues.gradientEnd})`
                          : (previewValues.accentColor || "#6366F1"),
                      }}
                      className="h-2 w-full"
                    />

                    <div className="p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold" style={{ color: "var(--ide-text)" }}>
                          {previewValues.title || name}
                        </span>
                        {(previewValues.showBadge !== false && (previewValues.badgeText || "PRO")) && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                            {previewValues.badgeText || "PRO"}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] leading-snug" style={{ color: "var(--ide-text-muted)" }}>
                        {previewValues.subtitle || description || "Custom dynamic component rendering live."}
                      </p>

                      {isContainer && (
                        <div className="p-2.5 mt-2 border border-dashed rounded-lg text-center text-[10px]" style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text-muted)" }}>
                          + Drop Child Components Here
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Interactive Property Tweaker for Live Preview */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--ide-text-muted)" }}>
                  Quick Live Property Testing
                </span>

                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {properties.slice(0, 5).map((prop) => (
                    <div key={prop.id} className="flex items-center justify-between text-xs">
                      <span className="truncate max-w-[120px]" style={{ color: "var(--ide-text-muted)" }}>{prop.label}:</span>
                      {prop.type === "color" ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={previewValues[prop.key] || prop.defaultValue || "#6366F1"}
                            onChange={(e) => setPreviewValues((v) => ({ ...v, [prop.key]: e.target.value }))}
                            className="w-6 h-6 rounded cursor-pointer border"
                            style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)" }}
                          />
                          <span className="text-[10px] font-mono" style={{ color: "var(--ide-text-muted)" }}>{previewValues[prop.key] || prop.defaultValue}</span>
                        </div>
                      ) : prop.type === "boolean" ? (
                        <input
                          type="checkbox"
                          checked={previewValues[prop.key] ?? prop.defaultValue}
                          onChange={(e) => setPreviewValues((v) => ({ ...v, [prop.key]: e.target.checked }))}
                          className="w-4 h-4 text-violet-600 rounded cursor-pointer"
                        />
                      ) : prop.type === "number" ? (
                        <input
                          type="number"
                          value={previewValues[prop.key] ?? prop.defaultValue}
                          onChange={(e) => setPreviewValues((v) => ({ ...v, [prop.key]: Number(e.target.value) }))}
                          className="w-20 px-2 py-0.5 text-xs text-right border rounded outline-none"
                          style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}
                        />
                      ) : (
                        <input
                          type="text"
                          value={previewValues[prop.key] ?? prop.defaultValue}
                          onChange={(e) => setPreviewValues((v) => ({ ...v, [prop.key]: e.target.value }))}
                          className="w-28 px-2 py-0.5 text-xs border rounded outline-none"
                          style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-2 pt-4 border-t" style={{ borderColor: "var(--ide-border)" }}>
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Save & Add to Current Screen</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  className="flex-1 py-2 rounded-xl font-semibold text-xs border transition cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: "var(--ide-card-bg)", borderColor: "var(--ide-border)", color: "var(--ide-text)" }}
                >
                  Save to Library
                </button>

                {existingComponent && onDeleteComponent && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete custom component "${existingComponent.name}"?`)) {
                        onDeleteComponent(existingComponent.id);
                        onClose();
                      }
                    }}
                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition cursor-pointer"
                    title="Delete Component"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
