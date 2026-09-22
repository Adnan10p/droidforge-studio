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
} from "lucide-react";
import { AndroidComponent, AndroidScreen, StateVariable } from "../../types";
import { FlowNode, FlowEdge } from "./types";
import { CodeSnippetTab } from "./CodeSnippetTab";
import { CodeSnippetTemplate } from "./snippetData";
import { VariablesWatchPanel } from "./VariablesWatchPanel";
import { VariableChangeRecord } from "./useVariablesWatch";

interface ToolboxProps {
  components: AndroidComponent[];
  screens: AndroidScreen[];
  onAddBlockFromToolbox: (type: string, payload: any) => void;
  onApplyRecipe: (recipeId: "hello_world" | "login_flow" | "counter_flow") => void;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    recipes: true,
    triggers: true,
    decisions: true,
    actions: true,
    components: true,
  });

  const toggleSection = (sec: string) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const onDragStart = (e: React.DragEvent, nodeType: string, payload: any) => {
    e.dataTransfer.setData("application/reactflow/type", nodeType);
    e.dataTransfer.setData("application/reactflow/payload", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "move";
  };

  const actionPalette = [
    {
      type: "action",
      payload: { actionType: "setProperty", property: "text", value: "Hello World" },
      title: "Change Text",
      subtitle: "Update text or widget property",
      icon: <Type className="w-3.5 h-3.5" />,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    },
    {
      type: "action",
      payload: { actionType: "setVariable", variableName: "counter", variableOperation: "increment", variableValue: "1" },
      title: "Set Variable",
      subtitle: "Assign or increment state value",
      icon: <Sliders className="w-3.5 h-3.5" />,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    },
    {
      type: "action",
      payload: { actionType: "navigate", targetScreen: screens[1]?.name || "HomeScreen", transitionType: "slide" },
      title: "Navigate Screen",
      subtitle: "Open another screen with transition",
      icon: <Navigation className="w-3.5 h-3.5" />,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
    },
    {
      type: "action",
      payload: { actionType: "toast", message: "Action succeeded!" },
      title: "Show Toast",
      subtitle: "Quick bottom flash notification",
      icon: <Bell className="w-3.5 h-3.5" />,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    },
    {
      type: "action",
      payload: { actionType: "snackbar", message: "Action completed", actionLabel: "UNDO" },
      title: "Show Snackbar",
      subtitle: "Notification with action button",
      icon: <MessageSquare className="w-3.5 h-3.5" />,
      color: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    },
    {
      type: "action",
      payload: { actionType: "callApi", method: "GET", endpoint: "/api/v1/data" },
      title: "Call API (REST)",
      subtitle: "HTTP request to backend API",
      icon: <Globe className="w-3.5 h-3.5" />,
      color: "text-sky-400 bg-sky-500/10 border-sky-500/30",
    },
    {
      type: "action",
      payload: { actionType: "vibrate", hapticPattern: "click" },
      title: "Haptic Vibrate",
      subtitle: "Trigger tactile phone vibration",
      icon: <Vibrate className="w-3.5 h-3.5" />,
      color: "text-pink-400 bg-pink-500/10 border-pink-500/30",
    },
    {
      type: "action",
      payload: { actionType: "delay", delayMs: 1000 },
      title: "Delay Timer",
      subtitle: "Pause execution for milliseconds",
      icon: <Clock className="w-3.5 h-3.5" />,
      color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    },
    {
      type: "action",
      payload: { actionType: "openBrowser", url: "https://android.com" },
      title: "Open Browser",
      subtitle: "Launch external URL in Chrome",
      icon: <ExternalLink className="w-3.5 h-3.5" />,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    },
    {
      type: "action",
      payload: { actionType: "firebaseWrite", collectionName: "app_records" },
      title: "Firebase Write",
      subtitle: "Save document to Cloud Firestore",
      icon: <Flame className="w-3.5 h-3.5" />,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    },
  ];

  const decisionPalette = [
    {
      type: "condition",
      payload: { left: "emailInput.text", operator: "isEmpty", right: "" },
      title: "◇ Condition / Check",
      subtitle: "Split flow with YES / NO outputs",
      icon: <GitBranch className="w-3.5 h-3.5" />,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    },
    {
      type: "apiBranch",
      payload: { method: "POST", endpoint: "/api/v1/auth/login" },
      title: "Call API (Success / Fail)",
      subtitle: "API request with dual branch paths",
      icon: <Globe className="w-3.5 h-3.5" />,
      color: "text-sky-400 bg-sky-500/10 border-sky-500/30",
    },
  ];

  return (
    <aside className="w-64 md:w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden select-none shrink-0">
      {/* Header with Navigation Tabs */}
      <div className="p-2 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("blocks")}
            className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "blocks"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Blocks</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("snippets")}
            className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "snippets"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-300" />
            <span>Code Snippets</span>
          </button>
        </div>
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
                placeholder="Search triggers, actions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Toolbox Items Container */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-3.5 text-slate-300">
        {/* Quick 1-Click Recipe Flows (Requested by user prompt) */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection("recipes")}
            className="w-full flex items-center justify-between text-[11px] font-bold text-amber-300 uppercase tracking-wider py-1 hover:text-white cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>1-Click Preset Flows</span>
            </span>
            {openSections.recipes ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>

          {openSections.recipes && (
            <div className="space-y-1.5 mt-1.5">
              <button
                type="button"
                onClick={() => onApplyRecipe("hello_world")}
                className="w-full p-2 rounded-xl bg-slate-950/60 border border-amber-500/30 hover:border-amber-400 text-left transition group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs font-bold text-amber-200 group-hover:text-amber-100">
                  <span>⚡ "Hello World" Flow</span>
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  helloButton • Click ➔ Change Text ("Hello World")
                </p>
              </button>

              <button
                type="button"
                onClick={() => onApplyRecipe("login_flow")}
                className="w-full p-2 rounded-xl bg-slate-950/60 border border-purple-500/30 hover:border-purple-400 text-left transition group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs font-bold text-purple-200 group-hover:text-purple-100">
                  <span>⚡ Complex Login Flow</span>
                  <Plus className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  LoginButton • Click ➔ ◇ Email Empty? ➔ Call API ➔ ◇ Success?
                </p>
              </button>

              <button
                type="button"
                onClick={() => onApplyRecipe("counter_flow")}
                className="w-full p-2 rounded-xl bg-slate-950/60 border border-emerald-500/30 hover:border-emerald-400 text-left transition group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs font-bold text-emerald-200 group-hover:text-emerald-100">
                  <span>⚡ Counter & Haptic Flow</span>
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  countButton • Click ➔ count += 1 ➔ Update Label ➔ Vibrate
                </p>
              </button>
            </div>
          )}
        </div>

        {/* Triggers & Events */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection("triggers")}
            className="w-full flex items-center justify-between text-[11px] font-bold text-amber-400 uppercase tracking-wider py-1 hover:text-white cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              <span>⚡ Triggers & Events</span>
            </span>
            {openSections.triggers ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>

          {openSections.triggers && (
            <div className="space-y-1.5 mt-1.5">
              <div
                draggable
                onDragStart={(e) =>
                  onDragStart(e, "trigger", {
                    componentId: components[0]?.id || "button",
                    componentName: components[0]?.name || "button",
                    event: "Click",
                  })
                }
                onClick={() =>
                  onAddBlockFromToolbox("trigger", {
                    componentId: components[0]?.id || "button",
                    componentName: components[0]?.name || "button",
                    event: "Click",
                  })
                }
                className="p-2 rounded-xl bg-slate-950/80 border border-amber-500/30 hover:border-amber-400 text-left transition cursor-grab active:cursor-grabbing flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                    <MousePointerClick className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300">
                      ⚡ Button Click Trigger
                    </div>
                    <div className="text-[10px] text-slate-400">On Click Event</div>
                  </div>
                </div>
                <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
              </div>

              <div
                draggable
                onDragStart={(e) =>
                  onDragStart(e, "trigger", {
                    componentId: "screen_lifecycle",
                    componentName: "Screen",
                    event: "OnCreate",
                  })
                }
                onClick={() =>
                  onAddBlockFromToolbox("trigger", {
                    componentId: "screen_lifecycle",
                    componentName: "Screen",
                    event: "OnCreate",
                  })
                }
                className="p-2 rounded-xl bg-slate-950/80 border border-amber-500/30 hover:border-amber-400 text-left transition cursor-grab active:cursor-grabbing flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300">
                      ⚡ Screen Lifecycle Trigger
                    </div>
                    <div className="text-[10px] text-slate-400">OnCreate / OnResume</div>
                  </div>
                </div>
                <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
              </div>
            </div>
          )}
        </div>

        {/* Screen Components (Drag any component to create its trigger) */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection("components")}
            className="w-full flex items-center justify-between text-[11px] font-bold text-cyan-400 uppercase tracking-wider py-1 hover:text-white cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3 h-3" />
              <span>Screen Components ({components.length})</span>
            </span>
            {openSections.components ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>

          {openSections.components && (
            <div className="space-y-1.5 mt-1.5 max-h-40 overflow-y-auto">
              {components.map((comp) => (
                <div
                  key={comp.id}
                  draggable
                  onDragStart={(e) =>
                    onDragStart(e, "trigger", {
                      componentId: comp.id,
                      componentName: comp.name,
                      event: comp.type === "Button" ? "Click" : "ValueChanged",
                    })
                  }
                  onClick={() =>
                    onAddBlockFromToolbox("trigger", {
                      componentId: comp.id,
                      componentName: comp.name,
                      event: comp.type === "Button" ? "Click" : "ValueChanged",
                    })
                  }
                  className="p-1.5 px-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-cyan-400/60 text-left transition cursor-grab active:cursor-grabbing flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="text-xs font-mono font-medium text-slate-200 group-hover:text-cyan-300 truncate">
                      {comp.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {comp.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Decisions & Branching (Condition Nodes) */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection("decisions")}
            className="w-full flex items-center justify-between text-[11px] font-bold text-purple-400 uppercase tracking-wider py-1 hover:text-white cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <GitBranch className="w-3 h-3" />
              <span>◇ Decisions & Logic</span>
            </span>
            {openSections.decisions ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>

          {openSections.decisions && (
            <div className="space-y-1.5 mt-1.5">
              {decisionPalette.map((item, idx) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={(e) => onDragStart(e, item.type, item.payload)}
                  onClick={() => onAddBlockFromToolbox(item.type, item.payload)}
                  className="p-2 rounded-xl bg-slate-950/80 border border-purple-500/30 hover:border-purple-400 text-left transition cursor-grab active:cursor-grabbing flex items-center justify-between group shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200 group-hover:text-purple-300">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-400">{item.subtitle}</div>
                    </div>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions Palette */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection("actions")}
            className="w-full flex items-center justify-between text-[11px] font-bold text-blue-400 uppercase tracking-wider py-1 hover:text-white cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Type className="w-3 h-3" />
              <span>⚙️ Actions & Steps</span>
            </span>
            {openSections.actions ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>

          {openSections.actions && (
            <div className="space-y-1.5 mt-1.5">
              {actionPalette
                .filter(
                  (a) =>
                    !searchQuery ||
                    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    a.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((item, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={(e) => onDragStart(e, item.type, item.payload)}
                    onClick={() => onAddBlockFromToolbox(item.type, item.payload)}
                    className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-blue-400/80 text-left transition cursor-grab active:cursor-grabbing flex items-center justify-between group shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${item.color}`}
                      >
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-200 group-hover:text-blue-300 truncate">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 shrink-0" />
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Documentation Note Block */}
        <div>
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
