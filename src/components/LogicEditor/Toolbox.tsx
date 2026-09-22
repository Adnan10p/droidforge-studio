import React, { useState } from "react";
import {
  Zap,
  Type,
  Navigation,
  Bell,
  MessageSquare,
  Globe,
  Database,
  Vibrate,
  Clock,
  ExternalLink,
  GitBranch,
  StickyNote,
  Sliders,
  Flame,
  Search,
  Plus,
  Sparkles,
  MousePointerClick,
  Smartphone,
  ChevronDown,
  ChevronRight,
  Layers,
  Code2,
  Bookmark,
  CheckCircle2,
  Calculator,
  ListFilter,
  Palette,
  Box,
  Hash,
  FileText,
  Binary,
  Combine,
  FolderTree,
  BookOpen,
  Wrench,
  Cpu,
  Check,
  X,
  Play,
  ArrowRight,
  Maximize2,
  RotateCcw,
} from "lucide-react";
import { AndroidComponent, AndroidScreen, StateVariable } from "../../types";
import { FlowNode, FlowEdge } from "./types";
import { CodeSnippetTab } from "./CodeSnippetTab";
import { CodeSnippetTemplate } from "./snippetData";
import { VariablesWatchPanel } from "./VariablesWatchPanel";
import { VariableChangeRecord } from "./useVariablesWatch";
import {
  getComponentLogicMeta,
  getValidEventsForComponent,
  getValidPropertiesForComponent,
  getValidFunctionsForComponent,
} from "../../data/componentLogicMetadata";

interface ToolboxProps {
  components: AndroidComponent[];
  screens: AndroidScreen[];
  screen?: AndroidScreen;
  onAddBlockFromToolbox: (type: string, payload: any) => void;
  onApplyRecipe: (recipeId: "youtube_flow" | "hello_world" | "login_flow" | "counter_flow") => void;
  // Code Snippets
  currentNodes?: FlowNode[];
  edges?: FlowEdge[];
  onInsertSnippet?: (snippet: CodeSnippetTemplate) => void;
  onSaveCurrentAsSnippet?: (name: string, description: string, selectedNodeIds?: string[]) => void;
  // Variables Watch
  variables?: StateVariable[];
  simulatedValues?: Record<string, any>;
  isSimulating?: boolean;
  lastChangedVar?: string | null;
  changeHistory?: VariableChangeRecord[];
  onUpdateVariableValue?: (varName: string, nextValue: any) => void;
  onResetVariableValues?: () => void;
  onOpenVariablesModal?: () => void;
  onClearHistory?: () => void;
}

export const Toolbox: React.FC<ToolboxProps> = ({
  components,
  screens,
  onAddBlockFromToolbox,
  onApplyRecipe,
  currentNodes = [],
  edges = [],
  onInsertSnippet,
  onSaveCurrentAsSnippet,
  variables = [],
  simulatedValues = {},
  isSimulating = false,
  lastChangedVar,
  changeHistory = [],
  onUpdateVariableValue,
  onResetVariableValues,
  onOpenVariablesModal,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<"blocks" | "snippets">("blocks");
  const [blocksSubTab, setBlocksSubTab] = useState<"components" | "builtin" | "presets">("components");
  const [searchQuery, setSearchQuery] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    recipes: true,
    triggers: true,
    decisions: true,
    actions: true,
    components: true,
    // Built-in categories
    control: true,
    logic: true,
    math: false,
    text: false,
    lists: false,
    dictionaries: false,
    colors: false,
    variables: true,
    procedures: false,
  });

  const [expandedComponentId, setExpandedComponentId] = useState<string | null>(
    components[0]?.id || null
  );

  const toggleSection = (sec: string) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const onDragStart = (e: React.DragEvent, nodeType: string, payload: any) => {
    e.dataTransfer.setData("application/reactflow/type", nodeType);
    e.dataTransfer.setData("application/reactflow/payload", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "move";
  };

  // ---------------------------------------------------------------------------
  // BUILT-IN BLOCK CATEGORIES DEFINITIONS (Control, Logic, Math, Text, Lists, etc.)
  // ---------------------------------------------------------------------------

  const builtInCategories = [
    {
      id: "control",
      name: "Control",
      icon: <Cpu className="w-3.5 h-3.5 text-amber-400" />,
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      description: "Conditionals, loops, screen navigation, and timers",
      blocks: [
        {
          type: "condition",
          title: "◇ If / Else Condition",
          subtitle: "Split flow path based on condition",
          payload: { left: "input.text", operator: "isNotEmpty", right: "" },
          icon: <GitBranch className="w-3.5 h-3.5" />,
          color: "border-purple-500/30 text-purple-400 bg-purple-500/10",
        },
        {
          type: "action",
          title: "⏱️ Delay Timer",
          subtitle: "Pause execution for X milliseconds",
          payload: { actionType: "delay", delayMs: 1000 },
          icon: <Clock className="w-3.5 h-3.5" />,
          color: "border-yellow-500/30 text-yellow-400 bg-yellow-500/10",
        },
        {
          type: "action",
          title: "🧭 Navigate Screen",
          subtitle: "Switch to another screen with transition",
          payload: { actionType: "navigate", targetScreen: screens[1]?.name || "HomeScreen", transitionType: "slide" },
          icon: <Navigation className="w-3.5 h-3.5" />,
          color: "border-indigo-500/30 text-indigo-400 bg-indigo-500/10",
        },
        {
          type: "action",
          title: "🛑 Pop Screen Back",
          subtitle: "Return to previous screen in stack",
          payload: { actionType: "popBack" },
          icon: <Navigation className="w-3.5 h-3.5 rotate-180" />,
          color: "border-indigo-500/30 text-indigo-400 bg-indigo-500/10",
        },
        {
          type: "action",
          title: "🌐 Open Browser URL",
          subtitle: "Launch web link in external browser",
          payload: { actionType: "openBrowser", url: "https://android.com" },
          icon: <ExternalLink className="w-3.5 h-3.5" />,
          color: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
        },
      ],
    },

    {
      id: "logic",
      name: "Logic",
      icon: <GitBranch className="w-3.5 h-3.5 text-purple-400" />,
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      description: "Booleans, comparison operators, and AND/OR checks",
      blocks: [
        {
          type: "condition",
          title: "✓ True Constant",
          subtitle: "Boolean value true",
          payload: { left: "true", operator: "==", right: "true" },
          icon: <Check className="w-3.5 h-3.5" />,
          color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
        },
        {
          type: "condition",
          title: "✕ False Constant",
          subtitle: "Boolean value false",
          payload: { left: "false", operator: "==", right: "true" },
          icon: <X className="w-3.5 h-3.5" />,
          color: "border-rose-500/30 text-rose-400 bg-rose-500/10",
        },
        {
          type: "condition",
          title: "== Equals Check",
          subtitle: "Check if left equals right value",
          payload: { left: "varA", operator: "==", right: "varB" },
          icon: <GitBranch className="w-3.5 h-3.5" />,
          color: "border-purple-500/30 text-purple-400 bg-purple-500/10",
        },
        {
          type: "condition",
          title: "!= Not Equal Check",
          subtitle: "Check if left is not equal to right",
          payload: { left: "varA", operator: "!=", right: "varB" },
          icon: <GitBranch className="w-3.5 h-3.5" />,
          color: "border-purple-500/30 text-purple-400 bg-purple-500/10",
        },
        {
          type: "condition",
          title: "∅ Is Empty Check",
          subtitle: "Check if field or string is empty",
          payload: { left: "emailInput.text", operator: "isEmpty", right: "" },
          icon: <GitBranch className="w-3.5 h-3.5" />,
          color: "border-purple-500/30 text-purple-400 bg-purple-500/10",
        },
      ],
    },

    {
      id: "math",
      name: "Math",
      icon: <Calculator className="w-3.5 h-3.5 text-blue-400" />,
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      description: "Numbers, arithmetic (+ - * / %), min/max, random",
      blocks: [
        {
          type: "action",
          title: "🔢 Set Number Value",
          subtitle: "Assign numeric integer or decimal value",
          payload: { actionType: "setVariable", variableOperation: "assign", variableValue: "10" },
          icon: <Hash className="w-3.5 h-3.5" />,
          color: "border-blue-500/30 text-blue-400 bg-blue-500/10",
        },
        {
          type: "action",
          title: "➕ Increment Value (+1)",
          subtitle: "Increase numeric state variable by 1",
          payload: { actionType: "setVariable", variableOperation: "increment", variableValue: "1" },
          icon: <Plus className="w-3.5 h-3.5" />,
          color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
        },
        {
          type: "action",
          title: "➖ Decrement Value (-1)",
          subtitle: "Decrease numeric state variable by 1",
          payload: { actionType: "setVariable", variableOperation: "decrement", variableValue: "1" },
          icon: <Sliders className="w-3.5 h-3.5" />,
          color: "border-rose-500/30 text-rose-400 bg-rose-500/10",
        },
      ],
    },

    {
      id: "text",
      name: "Text",
      icon: <FileText className="w-3.5 h-3.5 text-cyan-400" />,
      badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
      description: "Strings, text join, contains, length, and casing",
      blocks: [
        {
          type: "action",
          title: "📝 Set Text Property",
          subtitle: "Update widget string text label",
          payload: { actionType: "setProperty", property: "text", value: "New Text String" },
          icon: <Type className="w-3.5 h-3.5" />,
          color: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
        },
        {
          type: "action",
          title: "📋 Copy to Clipboard",
          subtitle: "Copy string to device system clipboard",
          payload: { actionType: "copyToClipboard", value: "Copied Text" },
          icon: <FileText className="w-3.5 h-3.5" />,
          color: "border-sky-500/30 text-sky-400 bg-sky-500/10",
        },
        {
          type: "action",
          title: "🔊 Text To Speech (TTS)",
          subtitle: "Speak aloud text string using system voice",
          payload: { actionType: "textToSpeech", ttsText: "Welcome to DroidForge App" },
          icon: <Bell className="w-3.5 h-3.5" />,
          color: "border-teal-500/30 text-teal-400 bg-teal-500/10",
        },
      ],
    },

    {
      id: "lists",
      name: "Lists",
      icon: <ListFilter className="w-3.5 h-3.5 text-emerald-400" />,
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      description: "Arrays, list items, append, index lookup",
      blocks: [
        {
          type: "action",
          title: "📋 Add Item to List",
          subtitle: "Append element to end of list variable",
          payload: { actionType: "setVariable", variableOperation: "assign", variableValue: "[\"Item 1\", \"Item 2\"]" },
          icon: <ListFilter className="w-3.5 h-3.5" />,
          color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
        },
        {
          type: "action",
          title: "🗄️ Query Database List",
          subtitle: "Fetch records list from local Room DB",
          payload: { actionType: "databaseQuery", tableName: "users" },
          icon: <Database className="w-3.5 h-3.5" />,
          color: "border-teal-500/30 text-teal-400 bg-teal-500/10",
        },
      ],
    },

    {
      id: "dictionaries",
      name: "Dictionaries",
      icon: <FolderTree className="w-3.5 h-3.5 text-orange-400" />,
      badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/30",
      description: "Key-value JSON maps, dictionary getters and setters",
      blocks: [
        {
          type: "action",
          title: "🔑 Set Dictionary Key Value",
          subtitle: "Store key-value pair in state object",
          payload: { actionType: "preferencesSave", variableName: "user_session", value: "{}" },
          icon: <FolderTree className="w-3.5 h-3.5" />,
          color: "border-orange-500/30 text-orange-400 bg-orange-500/10",
        },
        {
          type: "action",
          title: "🔥 Firestore Doc Read",
          subtitle: "Fetch key-value document from Firebase",
          payload: { actionType: "firebaseRead", collectionName: "profiles" },
          icon: <Flame className="w-3.5 h-3.5" />,
          color: "border-amber-500/30 text-amber-400 bg-amber-500/10",
        },
      ],
    },

    {
      id: "colors",
      name: "Colors",
      icon: <Palette className="w-3.5 h-3.5 text-pink-400" />,
      badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/30",
      description: "Hex colors, Material 3 theme primary & surface tokens",
      blocks: [
        {
          type: "action",
          title: "🎨 Change Background Color",
          subtitle: "Update component container background hex",
          payload: { actionType: "setProperty", property: "backgroundColor", value: "#4F46E5" },
          icon: <Palette className="w-3.5 h-3.5" />,
          color: "border-indigo-500/30 text-indigo-400 bg-indigo-500/10",
        },
        {
          type: "action",
          title: "✏️ Change Text Color",
          subtitle: "Update component foreground text color",
          payload: { actionType: "setProperty", property: "textColor", value: "#FFFFFF" },
          icon: <Type className="w-3.5 h-3.5" />,
          color: "border-pink-500/30 text-pink-400 bg-pink-500/10",
        },
      ],
    },

    {
      id: "variables",
      name: "Variables",
      icon: <Sliders className="w-3.5 h-3.5 text-emerald-400" />,
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      description: "State variables, assign, toggle, increment",
      blocks: [
        {
          type: "action",
          title: "✏️ Set State Variable",
          subtitle: "Assign new value to screen state variable",
          payload: { actionType: "setVariable", variableName: "counter", variableOperation: "assign", variableValue: "0" },
          icon: <Sliders className="w-3.5 h-3.5" />,
          color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
        },
        {
          type: "action",
          title: "🔄 Toggle Boolean Variable",
          subtitle: "Flip boolean state variable (true ↔ false)",
          payload: { actionType: "setVariable", variableName: "isLoggedIn", variableOperation: "toggle" },
          icon: <RotateCcw className="w-3.5 h-3.5" />,
          color: "border-teal-500/30 text-teal-400 bg-teal-500/10",
        },
      ],
    },

    {
      id: "procedures",
      name: "Procedures",
      icon: <Wrench className="w-3.5 h-3.5 text-violet-400" />,
      badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/30",
      description: "Custom functions, API calls, and native actions",
      blocks: [
        {
          type: "action",
          title: "⚡ Call REST API",
          subtitle: "Execute HTTP REST GET/POST request",
          payload: { actionType: "callApi", method: "GET", endpoint: "/api/v1/data" },
          icon: <Globe className="w-3.5 h-3.5" />,
          color: "border-sky-500/30 text-sky-400 bg-sky-500/10",
        },
        {
          type: "action",
          title: "📳 Haptic Vibration",
          subtitle: "Trigger tactile vibration pattern",
          payload: { actionType: "vibrate", hapticPattern: "click" },
          icon: <Vibrate className="w-3.5 h-3.5" />,
          color: "border-pink-500/30 text-pink-400 bg-pink-500/10",
        },
        {
          type: "action",
          title: "💬 Show Toast Message",
          subtitle: "Display quick bottom toast popup",
          payload: { actionType: "toast", message: "Success!" },
          icon: <Bell className="w-3.5 h-3.5" />,
          color: "border-amber-500/30 text-amber-400 bg-amber-500/10",
        },
        {
          type: "action",
          title: "💬 Show Alert Dialog",
          subtitle: "Pop up modal confirmation dialog",
          payload: { actionType: "dialog", dialogTitle: "Confirm", dialogBody: "Are you sure?" },
          icon: <MessageSquare className="w-3.5 h-3.5" />,
          color: "border-purple-500/30 text-purple-400 bg-purple-500/10",
        },
      ],
    },
  ];

  return (
    <aside className="w-64 md:w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden select-none shrink-0">
      {/* Header with Main Navigation Tabs */}
      <div className="p-2 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("blocks")}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "blocks"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Logic Blocks</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("snippets")}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "snippets"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-300" />
            <span>Code Snippets</span>
          </button>
        </div>

        {activeTab === "blocks" && (
          <div className="flex items-center gap-1 mt-2 bg-slate-900 p-0.5 rounded-lg border border-slate-800/80">
            <button
              type="button"
              onClick={() => setBlocksSubTab("components")}
              className={`flex-1 py-1 text-[11px] font-bold rounded-md transition flex items-center justify-center gap-1 cursor-pointer ${
                blocksSubTab === "components"
                  ? "bg-cyan-600/30 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>Components ({components.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setBlocksSubTab("builtin")}
              className={`flex-1 py-1 text-[11px] font-bold rounded-md transition flex items-center justify-center gap-1 cursor-pointer ${
                blocksSubTab === "builtin"
                  ? "bg-purple-600/30 text-purple-300 border border-purple-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Cpu className="w-3 h-3 text-purple-400" />
              <span>Built-In (9)</span>
            </button>
            <button
              type="button"
              onClick={() => setBlocksSubTab("presets")}
              className={`flex-1 py-1 text-[11px] font-bold rounded-md transition flex items-center justify-center gap-1 cursor-pointer ${
                blocksSubTab === "presets"
                  ? "bg-amber-600/30 text-amber-300 border border-amber-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Presets</span>
            </button>
          </div>
        )}
      </div>

      {activeTab === "snippets" ? (
        <div className="flex-1 overflow-hidden">
          <CodeSnippetTab
            onInsertSnippet={onInsertSnippet || (() => {})}
            currentNodes={currentNodes}
            edges={edges}
            onSaveCurrentAsSnippet={onSaveCurrentAsSnippet || (() => {})}
          />
        </div>
      ) : (
        <>
          {/* Search Filter */}
          <div className="p-2 border-b border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search blocks, events, properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Toolbox Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-3.5 text-slate-300">
            {/* SUB-TAB 1: DYNAMIC ACTIVE SCREEN COMPONENTS */}
            {blocksSubTab === "components" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Screen Components ({components.length})</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Events & Props</span>
                </div>

                {components.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-300">No components on screen</p>
                    <p className="text-[11px] text-slate-500">Add components from the Visual Canvas palette to see their events and logic blocks here!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {components
                      .filter(
                        (comp) =>
                          !searchQuery ||
                          comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          comp.type.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((comp, compIdx) => {
                        const isRootScreen =
                          compIdx === 0 ||
                          (screen && comp.id === (screen as any).rootComponent?.id) ||
                          comp.id.startsWith("root") ||
                          (screen && comp.name === (screen as any).title) ||
                          (screen && comp.name === (screen as any).name) ||
                          comp.name === "Screen1" ||
                          comp.type === "Screen" ||
                          comp.name.toLowerCase().includes("screen");

                        const effectiveType = isRootScreen ? "Screen" : comp.type;

                        const meta = getComponentLogicMeta(effectiveType);
                        const events = getValidEventsForComponent(effectiveType);
                        const properties = getValidPropertiesForComponent(effectiveType);
                        const functions = getValidFunctionsForComponent(effectiveType);
                        const isExpanded = expandedComponentId === comp.id;

                        return (
                          <div
                            key={comp.id}
                            className="rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition overflow-hidden"
                          >
                            {/* Component Header Card */}
                            <button
                              type="button"
                              onClick={() => setExpandedComponentId(isExpanded ? null : comp.id)}
                              className="w-full p-2.5 flex items-center justify-between text-left hover:bg-slate-900/60 cursor-pointer"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 text-xs font-mono font-bold">
                                  {comp.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-mono font-bold text-slate-100 truncate">
                                    {comp.name}
                                  </div>
                                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                                    <span className="text-cyan-400/90">{isRootScreen ? "Screen" : comp.type}</span>
                                    <span>•</span>
                                    <span>{events.length} Events</span>
                                    <span>•</span>
                                    <span>{properties.length} Props</span>
                                    {functions.length > 0 && (
                                      <>
                                        <span>•</span>
                                        <span className="text-purple-400">{functions.length} Methods</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                            </button>

                            {/* Component Expanded Blocks Drawer */}
                            {isExpanded && (
                              <div className="p-2 pt-0 border-t border-slate-800/80 space-y-2.5 bg-slate-950/40 text-xs">
                                {/* 1. EVENTS / TRIGGERS */}
                                <div className="space-y-1 mt-2">
                                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    <span>⚡ Events (Triggers)</span>
                                  </div>
                                  {events.map((ev) => (
                                    <div
                                      key={ev.id}
                                      draggable
                                      onDragStart={(e) =>
                                        onDragStart(e, "trigger", {
                                          componentId: comp.id,
                                          componentName: comp.name,
                                          event: ev.id,
                                        })
                                      }
                                      onClick={() =>
                                        onAddBlockFromToolbox("trigger", {
                                          componentId: comp.id,
                                          componentName: comp.name,
                                          event: ev.id,
                                        })
                                      }
                                      className="p-1.5 px-2 rounded-lg bg-slate-900 border border-amber-500/30 hover:border-amber-400 transition cursor-grab active:cursor-grabbing flex items-center justify-between group"
                                    >
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <MousePointerClick className="w-3 h-3 text-amber-400 shrink-0" />
                                        <span className="font-mono text-[11px] text-amber-200 group-hover:text-amber-100 truncate">
                                          When {comp.name}.{ev.id}
                                        </span>
                                      </div>
                                      <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 shrink-0" />
                                    </div>
                                  ))}
                                </div>

                                {/* 2. PROPERTY SETTERS (ACTIONS) */}
                                <div className="space-y-1">
                                  <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                                    <Sliders className="w-3 h-3" />
                                    <span>⚙️ Set Properties (Actions)</span>
                                  </div>
                                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                                    {properties.slice(0, 8).map((prop) => (
                                      <div
                                        key={prop.name}
                                        draggable
                                        onDragStart={(e) =>
                                          onDragStart(e, "action", {
                                            actionType: "setProperty",
                                            targetId: comp.id,
                                            property: prop.name,
                                            value: prop.defaultValue,
                                          })
                                        }
                                        onClick={() =>
                                          onAddBlockFromToolbox("action", {
                                            actionType: "setProperty",
                                            targetId: comp.id,
                                            property: prop.name,
                                            value: prop.defaultValue,
                                          })
                                        }
                                        className="p-1.5 px-2 rounded-lg bg-slate-900 border border-blue-500/30 hover:border-blue-400 transition cursor-grab active:cursor-grabbing flex items-center justify-between group"
                                      >
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <Type className="w-3 h-3 text-blue-400 shrink-0" />
                                          <span className="font-mono text-[11px] text-blue-200 group-hover:text-blue-100 truncate">
                                            Set {comp.name}.{prop.name}
                                          </span>
                                        </div>
                                        <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 shrink-0" />
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* 3. COMPONENT METHODS / FUNCTIONS */}
                                {functions.length > 0 && (
                                  <div className="space-y-1">
                                    <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                                      <Wrench className="w-3 h-3" />
                                      <span>⚡ Methods / Functions</span>
                                    </div>
                                    {functions.map((fn) => (
                                      <div
                                        key={fn.id}
                                        draggable
                                        onDragStart={(e) =>
                                          onDragStart(e, "action", {
                                            actionType: "callMethod",
                                            targetId: comp.id,
                                            methodName: fn.id,
                                          })
                                        }
                                        onClick={() =>
                                          onAddBlockFromToolbox("action", {
                                            actionType: "callMethod",
                                            targetId: comp.id,
                                            methodName: fn.id,
                                          })
                                        }
                                        className="p-1.5 px-2 rounded-lg bg-slate-900 border border-purple-500/30 hover:border-purple-400 transition cursor-grab active:cursor-grabbing flex items-center justify-between group"
                                      >
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <Zap className="w-3 h-3 text-purple-400 shrink-0" />
                                          <span className="font-mono text-[11px] text-purple-200 group-hover:text-purple-100 truncate">
                                            Call {comp.name}.{fn.name}()
                                          </span>
                                        </div>
                                        <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 shrink-0" />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 2: BUILT-IN BLOCK CATEGORIES (Control, Logic, Math, Text, Lists, etc.) */}
            {blocksSubTab === "builtin" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Built-In Block Categories (9)</span>
                  </span>
                </div>

                <div className="space-y-2">
                  {builtInCategories
                    .filter(
                      (cat) =>
                        !searchQuery ||
                        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        cat.blocks.some((b) => b.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map((cat) => {
                      const isOpen = openSections[cat.id] ?? false;
                      return (
                        <div
                          key={cat.id}
                          className="rounded-xl bg-slate-950/80 border border-slate-800 overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() => toggleSection(cat.id)}
                            className="w-full p-2.5 flex items-center justify-between hover:bg-slate-900/60 cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${cat.badgeColor}`}
                              >
                                {cat.icon}
                              </div>
                              <div className="text-left">
                                <div className="text-xs font-bold text-slate-200">
                                  {cat.name}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {cat.description}
                                </div>
                              </div>
                            </div>
                            {isOpen ? (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>

                          {isOpen && (
                            <div className="p-2 pt-0 border-t border-slate-800/80 space-y-1.5 bg-slate-950/40">
                              {cat.blocks.map((block, idx) => (
                                <div
                                  key={idx}
                                  draggable
                                  onDragStart={(e) => onDragStart(e, block.type, block.payload)}
                                  onClick={() => onAddBlockFromToolbox(block.type, block.payload)}
                                  className={`p-2 rounded-xl border hover:border-indigo-400 transition cursor-grab active:cursor-grabbing flex items-center justify-between group shadow-2xs ${block.color}`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="shrink-0">{block.icon}</div>
                                    <div className="min-w-0">
                                      <div className="text-xs font-bold text-slate-100 truncate">
                                        {block.title}
                                      </div>
                                      <div className="text-[10px] text-slate-400 truncate">
                                        {block.subtitle}
                                      </div>
                                    </div>
                                  </div>
                                  <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-300 shrink-0" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* SUB-TAB 3: PRESETS & 1-CLICK FLOW RECIPES */}
            {blocksSubTab === "presets" && (
              <div className="space-y-3">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1-Click Preset Flow Recipes</span>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => onApplyRecipe("youtube_flow")}
                    className="w-full p-2.5 rounded-xl bg-slate-950/80 border border-red-500/40 hover:border-red-400 text-left transition group cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-red-200 group-hover:text-red-100">
                      <span>⚡ YouTube Paste & Play Flow</span>
                      <Plus className="w-3.5 h-3.5 text-red-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      ActionButton • Click ➔ Paste URL ➔ Switch to Play ➔ Stream Video
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onApplyRecipe("hello_world")}
                    className="w-full p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 hover:border-amber-400 text-left transition group cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-amber-200 group-hover:text-amber-100">
                      <span>⚡ "Hello World" Flow</span>
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Button • Click ➔ Change Text ("Hello World") ➔ Toast Notification
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onApplyRecipe("login_flow")}
                    className="w-full p-2.5 rounded-xl bg-slate-950/80 border border-purple-500/30 hover:border-purple-400 text-left transition group cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-purple-200 group-hover:text-purple-100">
                      <span>⚡ Complex Login Flow</span>
                      <Plus className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      LoginButton • Click ➔ ◇ Email Empty? ➔ Call API ➔ ◇ Success?
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onApplyRecipe("counter_flow")}
                    className="w-full p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 hover:border-emerald-400 text-left transition group cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-200 group-hover:text-emerald-100">
                      <span>⚡ Counter & Haptic Flow</span>
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      countButton • Click ➔ count += 1 ➔ Update Label ➔ Haptic Vibrate
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Sticky Documentation Note Block */}
            <div className="pt-2">
              <div
                draggable
                onDragStart={(e) =>
                  onDragStart(e, "note", {
                    title: "Flow Note",
                    text: "Add business logic documentation or comments here...",
                  })
                }
                onClick={() =>
                  onAddBlockFromToolbox("note", {
                    title: "Flow Note",
                    text: "Add business logic documentation or comments here...",
                  })
                }
                className="p-2 rounded-xl bg-amber-500/10 border border-amber-400/30 hover:border-amber-400 text-left transition cursor-grab active:cursor-grabbing flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-amber-200">Sticky Note</div>
                    <div className="text-[10px] text-slate-400">Documentation card</div>
                  </div>
                </div>
                <Plus className="w-3.5 h-3.5 text-amber-400" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Variables Watch Panel - Real-time state monitor */}
      <VariablesWatchPanel
        variables={variables}
        simulatedValues={simulatedValues}
        isSimulating={isSimulating}
        lastChangedVar={lastChangedVar}
        changeHistory={changeHistory}
        onUpdateValue={onUpdateVariableValue}
        onResetValues={onResetVariableValues}
        onOpenModal={onOpenVariablesModal}
        onClearHistory={onClearHistory}
      />
    </aside>
  );
};
