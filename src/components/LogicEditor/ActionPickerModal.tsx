import React, { useState, useMemo } from "react";
import {
  Search,
  Zap,
  Sparkles,
  Type,
  Navigation,
  Sliders,
  GitBranch,
  Globe,
  Database,
  Smartphone,
  Music,
  Bot,
  Bell,
  MessageSquare,
  Vibrate,
  Clock,
  ExternalLink,
  Flame,
  X,
  Plus,
  Play,
} from "lucide-react";
import { AndroidComponent, AndroidScreen, StateVariable } from "../../types";
import { getValidFunctionsForComponent } from "../../data/componentLogicMetadata";

export interface ActionOption {
  id: string;
  category: "Recommended" | "Custom Methods" | "UI" | "Navigation" | "Variables" | "Logic" | "API" | "Data" | "Device" | "Media" | "AI";
  actionType: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  payload: Record<string, any>;
  recommendedReason?: string;
}

interface ActionPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (payload: any) => void;
  selectedComponent?: AndroidComponent | null;
  currentScreen?: AndroidScreen;
  screens?: AndroidScreen[];
  stateVariables?: StateVariable[];
}

export const ActionPickerModal: React.FC<ActionPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
  selectedComponent,
  currentScreen,
  screens = [],
  stateVariables = [],
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Recommended");

  const allActions: ActionOption[] = useMemo(() => {
    const list: ActionOption[] = [];

    // Dynamically inject @SimpleFunction method options for selectedComponent if available
    if (selectedComponent) {
      const customFns = getValidFunctionsForComponent(selectedComponent.type);
      customFns.forEach((fn) => {
        list.push({
          id: `custom_fn_${selectedComponent.id}_${fn.id}`,
          category: "Recommended",
          actionType: "callMethod",
          title: `Call ${selectedComponent.name}.${fn.id}()`,
          subtitle: fn.description || `Invoke ${fn.id} method on ${selectedComponent.name}`,
          icon: <Play className="w-4 h-4 text-emerald-400" />,
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
          payload: {
            actionType: "callMethod",
            targetId: selectedComponent.id,
            methodName: fn.id,
            methodArgs: {},
          },
          recommendedReason: `@SimpleFunction method on '${selectedComponent.type}'`,
        });

        list.push({
          id: `custom_fn_cat_${selectedComponent.id}_${fn.id}`,
          category: "Custom Methods",
          actionType: "callMethod",
          title: `Call ${selectedComponent.name}.${fn.id}()`,
          subtitle: fn.description || `Invoke ${fn.id} method on ${selectedComponent.name}`,
          icon: <Play className="w-4 h-4 text-emerald-400" />,
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
          payload: {
            actionType: "callMethod",
            targetId: selectedComponent.id,
            methodName: fn.id,
            methodArgs: {},
          },
        });
      });
    }

    list.push(
      // Recommended Contextual Actions
      {
        id: "rec_change_text",
        category: "Recommended",
        actionType: "setProperty",
        title: `Set Text on ${selectedComponent?.name || "Widget"}`,
        subtitle: "Dynamically update component text prop",
        icon: <Type className="w-4 h-4" />,
        color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
        payload: {
          actionType: "setProperty",
          targetId: selectedComponent?.id || "widget",
          property: "text",
          value: "Updated Value",
        },
        recommendedReason: selectedComponent ? `Matches selected '${selectedComponent.type}' component` : "Common UI step",
      },
      {
        id: "rec_nav",
        category: "Recommended",
        actionType: "navigate",
        title: `Navigate to ${screens[1]?.name || "HomeScreen"}`,
        subtitle: "Switch screens with smooth transition",
        icon: <Navigation className="w-4 h-4" />,
        color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
        payload: {
          actionType: "navigate",
          targetScreen: screens[1]?.name || "HomeScreen",
          transitionType: "slide",
        },
        recommendedReason: "Primary screen navigation flow",
      },
      {
        id: "rec_toast",
        category: "Recommended",
        actionType: "toast",
        title: "Show Flash Toast",
        subtitle: "Displays instant bottom feedback notification",
        icon: <Bell className="w-4 h-4" />,
        color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        payload: {
          actionType: "toast",
          message: "Action completed successfully!",
        },
        recommendedReason: "Best for instant user feedback",
      },

      // UI Actions
      {
        id: "ui_set_prop",
        category: "UI",
        actionType: "setProperty",
        title: "Set Component Property",
        subtitle: "Modify text, color, visibility or enabled state",
        icon: <Type className="w-4 h-4" />,
        color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
        payload: { actionType: "setProperty", property: "text", value: "New Text" },
      },
      {
        id: "ui_toast",
        category: "UI",
        actionType: "toast",
        title: "Show Toast Message",
        subtitle: "Short popup notification toast",
        icon: <Bell className="w-4 h-4" />,
        color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        payload: { actionType: "toast", message: "Toast notification" },
      },
      {
        id: "ui_snackbar",
        category: "UI",
        actionType: "snackbar",
        title: "Show Material Snackbar",
        subtitle: "Interactive notification banner with action button",
        icon: <MessageSquare className="w-4 h-4" />,
        color: "text-orange-400 bg-orange-500/10 border-orange-500/30",
        payload: { actionType: "snackbar", message: "Item saved", actionLabel: "UNDO" },
      },

      // Navigation Actions
      {
        id: "nav_screen",
        category: "Navigation",
        actionType: "navigate",
        title: "Navigate to Screen",
        subtitle: "Push screen onto navigation backstack",
        icon: <Navigation className="w-4 h-4" />,
        color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
        payload: { actionType: "navigate", targetScreen: "HomeScreen" },
      },
      {
        id: "nav_pop",
        category: "Navigation",
        actionType: "popBack",
        title: "Pop Backstack",
        subtitle: "Navigate back to previous screen",
        icon: <Navigation className="w-4 h-4" />,
        color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
        payload: { actionType: "popBack" },
      },

      // Variables Actions
      {
        id: "var_set",
        category: "Variables",
        actionType: "setVariable",
        title: "Assign / Update Variable",
        subtitle: "Assign, increment, decrement or toggle state variable",
        icon: <Sliders className="w-4 h-4" />,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        payload: {
          actionType: "setVariable",
          variableName: stateVariables[0]?.name || "counter",
          variableOperation: "increment",
          variableValue: "1",
        },
      },

      // Logic Actions
      {
        id: "logic_delay",
        category: "Logic",
        actionType: "delay",
        title: "Coroutines Delay Timer",
        subtitle: "Pause flow execution for set duration in ms",
        icon: <Clock className="w-4 h-4" />,
        color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
        payload: { actionType: "delay", delayMs: 1000 },
      },
      {
        id: "logic_cond",
        category: "Logic",
        actionType: "condition",
        title: "◇ Branching Condition",
        subtitle: "Split flow path based on variable or input check",
        icon: <GitBranch className="w-4 h-4" />,
        color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
        payload: { left: "emailInput.text", operator: "isNotEmpty", right: "" },
      },

      // API Actions
      {
        id: "api_rest",
        category: "API",
        actionType: "callApi",
        title: "Call REST API Endpoint",
        subtitle: "Issue HTTP GET/POST request with response binding",
        icon: <Globe className="w-4 h-4" />,
        color: "text-sky-400 bg-sky-500/10 border-sky-500/30",
        payload: { actionType: "callApi", method: "POST", endpoint: "/api/v1/auth/login" },
      },

      // Data Actions
      {
        id: "data_firebase",
        category: "Data",
        actionType: "firebaseWrite",
        title: "Firebase Firestore Write",
        subtitle: "Write reactive document payload to cloud collection",
        icon: <Flame className="w-4 h-4" />,
        color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        payload: { actionType: "firebaseWrite", collectionName: "app_records" },
      },
      {
        id: "data_db",
        category: "Data",
        actionType: "databaseInsert",
        title: "Room SQLite Insert",
        subtitle: "Insert record into local encrypted SQLite database",
        icon: <Database className="w-4 h-4" />,
        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
        payload: { actionType: "databaseInsert", tableName: "users" },
      },

      // Device Actions
      {
        id: "dev_haptic",
        category: "Device",
        actionType: "vibrate",
        title: "Haptic Feedback Vibrate",
        subtitle: "Trigger tactile phone vibration effect",
        icon: <Vibrate className="w-4 h-4" />,
        color: "text-pink-400 bg-pink-500/10 border-pink-500/30",
        payload: { actionType: "vibrate", hapticPattern: "click" },
      },
      {
        id: "dev_browser",
        category: "Device",
        actionType: "openBrowser",
        title: "Open Web Browser",
        subtitle: "Launch external Intent URL in Chrome",
        icon: <ExternalLink className="w-4 h-4" />,
        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
        payload: { actionType: "openBrowser", url: "https://android.com" },
      },

      // Media Actions
      {
        id: "media_audio",
        category: "Media",
        actionType: "playAudio",
        title: "Play Sound Effect",
        subtitle: "Play asset audio file or audio stream",
        icon: <Music className="w-4 h-4" />,
        color: "text-violet-400 bg-violet-500/10 border-violet-500/30",
        payload: { actionType: "playAudio", url: "click_sound.mp3" },
      },

      // AI Actions
      {
        id: "ai_query",
        category: "AI",
        actionType: "aiQuery",
        title: "On-Device Gemini AI Query",
        subtitle: "Send prompt to LLM and handle text completion",
        icon: <Bot className="w-4 h-4" />,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        payload: { actionType: "aiQuery", message: "Summarize text input" },
      }
    );
    return list;
  }, [selectedComponent, screens, stateVariables]);

  const categories = ["Recommended", "Custom Methods", "UI", "Navigation", "Variables", "Logic", "API", "Data", "Device", "Media", "AI"];

  const filteredActions = useMemo(() => {
    return allActions.filter((a) => {
      const matchCat = activeCategory === "Recommended" ? a.category === "Recommended" : a.category === activeCategory;
      const matchQuery =
        !searchQuery ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [allActions, activeCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] select-none text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Action Picker Studio</h2>
              <p className="text-[11px] text-slate-400">Context-aware event action library</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search actions (e.g. Set Text, Navigate, Call API, Vibrate...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 text-xs text-slate-200 pl-9 pr-4 py-2 rounded-xl border border-slate-800 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="flex items-center gap-1 p-2 overflow-x-auto border-b border-slate-800 bg-slate-950/60 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
              }`}
            >
              {cat === "Recommended" && <Sparkles className="w-3 h-3 text-amber-300" />}
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Action Grid / List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredActions.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              <Zap className="w-8 h-8 mx-auto opacity-30 mb-2" />
              <p>No actions found matching "{searchQuery}" in {activeCategory}.</p>
            </div>
          ) : (
            filteredActions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onSelectAction(opt.payload);
                  onClose();
                }}
                className="w-full p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/60 text-left transition flex items-center justify-between group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${opt.color}`}
                  >
                    {opt.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 truncate">
                        {opt.title}
                      </span>
                      {opt.recommendedReason && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[9px] font-mono text-amber-300 font-bold shrink-0">
                          ★ Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{opt.subtitle}</p>
                  </div>
                </div>

                <Plus className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
