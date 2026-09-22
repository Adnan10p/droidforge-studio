import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Zap,
  Sliders,
  Play,
  Check,
  Code2,
  Component,
  GitBranch,
  FileText,
  ArrowRight,
  X,
  CornerDownLeft,
} from "lucide-react";
import { FlowNode } from "./types";
import { StateVariable, AndroidComponent } from "../../types";

export interface SearchResultItem {
  id: string;
  type: "node" | "variable" | "component";
  title: string;
  subtitle: string;
  category: string;
  badge: string;
  badgeColor: string;
  nodeId?: string;
  variable?: StateVariable;
  component?: AndroidComponent;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: FlowNode[];
  variables: StateVariable[];
  components: AndroidComponent[];
  onSelectNode: (nodeId: string) => void;
  onSelectVariable: (variable: StateVariable) => void;
  onSelectComponent: (componentId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  nodes,
  variables,
  components,
  onSelectNode,
  onSelectVariable,
  onSelectComponent,
}) => {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "nodes" | "variables" | "components">("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build searchable items
  const items: SearchResultItem[] = [];

  // 1. Nodes
  nodes.forEach((n) => {
    const data = n.data as any;
    let title = n.id;
    let subtitle = n.type || "node";
    let badge = "NODE";
    let badgeColor = "bg-blue-500/20 text-blue-300 border-blue-500/40";

    if (n.type === "trigger") {
      title = `⚡ ${data.componentName || "Component"} • ${data.event || "Click"}`;
      subtitle = `Trigger block (${data.componentId || "widget"})`;
      badge = "TRIGGER";
      badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
    } else if (n.type === "action") {
      const act = data.action || {};
      title = `▶ ${act.actionType || "Action"}`;
      subtitle = act.property
        ? `Property: ${act.property} = "${act.value ?? ""}"`
        : act.message
        ? `Message: "${act.message}"`
        : act.targetScreen
        ? `Target: ${act.targetScreen}`
        : act.variableName
        ? `Variable: ${act.variableName} (${act.variableOperation || "assign"} ${act.variableValue || ""})`
        : "Logic Action Step";
      badge = "ACTION";
      badgeColor = "bg-blue-500/20 text-blue-300 border-blue-500/40";
    } else if (n.type === "condition") {
      const cond = data.condition || {};
      title = `◇ ${data.title || "Condition Check"}`;
      subtitle = `${cond.left || "Value"} ${cond.operator || "=="} ${cond.right || ""}`;
      badge = "DECISION";
      badgeColor = "bg-purple-500/20 text-purple-300 border-purple-500/40";
    } else if (n.type === "apiBranch") {
      const act = data.action || {};
      title = `🌐 ${act.method || "POST"} ${act.endpoint || "/api"}`;
      subtitle = "API Network Request & Response Branching";
      badge = "API";
      badgeColor = "bg-sky-500/20 text-sky-300 border-sky-500/40";
    } else if (n.type === "note") {
      title = `📝 ${data.title || "Note / Comment"}`;
      subtitle = (data.text || "Comment note").slice(0, 60);
      badge = "NOTE";
      badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    }

    items.push({
      id: `node_${n.id}`,
      type: "node",
      title,
      subtitle,
      category: "Logic Nodes",
      badge,
      badgeColor,
      nodeId: n.id,
    });
  });

  // 2. Variables
  variables.forEach((v) => {
    items.push({
      id: `var_${v.id}`,
      type: "variable",
      title: `📊 ${v.name}`,
      subtitle: `Type: ${v.type} • Initial: ${JSON.stringify(v.initialValue ?? "")}`,
      category: "State Variables",
      badge: "VARIABLE",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      variable: v,
    });
  });

  // 3. Components
  components.forEach((c) => {
    items.push({
      id: `comp_${c.id}`,
      type: "component",
      title: `📱 ${c.name}`,
      subtitle: `Type: ${c.type} • ID: ${c.id}`,
      category: "UI Components",
      badge: "COMPONENT",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
      component: c,
    });
  });

  // Filter items
  const cleanQ = query.trim().toLowerCase();
  const filtered = items.filter((item) => {
    if (filterType !== "all") {
      if (filterType === "nodes" && item.type !== "node") return false;
      if (filterType === "variables" && item.type !== "variable") return false;
      if (filterType === "components" && item.type !== "component") return false;
    }
    if (!cleanQ) return true;
    return (
      item.title.toLowerCase().includes(cleanQ) ||
      item.subtitle.toLowerCase().includes(cleanQ) ||
      item.category.toLowerCase().includes(cleanQ) ||
      item.badge.toLowerCase().includes(cleanQ)
    );
  });

  const handleSelect = (item: SearchResultItem) => {
    if (item.type === "node" && item.nodeId) {
      onSelectNode(item.nodeId);
    } else if (item.type === "variable" && item.variable) {
      onSelectVariable(item.variable);
    } else if (item.type === "component" && item.component) {
      onSelectComponent(item.component.id);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < filtered.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : Math.max(0, filtered.length - 1)));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="p-3 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search nodes, state variables, or UI components (Press Enter to jump)..."
            className="w-full bg-transparent text-white text-sm placeholder-slate-500 focus:outline-none"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700 rounded shadow-xs">
              ESC
            </kbd>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="px-3 py-2 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            {(
              [
                { id: "all", label: "All Elements", count: items.length },
                { id: "nodes", label: "Nodes", count: nodes.length },
                { id: "variables", label: "Variables", count: variables.length },
                { id: "components", label: "Components", count: components.length },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setFilterType(tab.id);
                  setSelectedIndex(0);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  filterType === tab.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] px-1 py-0.2 rounded-full bg-black/20 text-slate-300">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-500 hidden sm:inline">
            {filtered.length} matching result{filtered.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-indigo-400" />
              <p className="text-sm font-semibold">No elements match your search</p>
              <p className="text-xs text-slate-600 mt-1">
                Try searching for button names, variable keys, or action types.
              </p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition ${
                    isSelected
                      ? "bg-indigo-600/25 border border-indigo-500/50 text-white"
                      : "hover:bg-slate-800/60 border border-transparent text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate">
                          {item.title}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md border font-semibold ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[11px] text-slate-500 hidden md:inline font-mono">
                      {item.category}
                    </span>
                    {isSelected ? (
                      <div className="flex items-center gap-1 text-xs text-indigo-300 font-semibold bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-500/40">
                        <span>Jump</span>
                        <CornerDownLeft className="w-3 h-3" />
                      </div>
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-3 py-2 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">
                ↑
              </kbd>{" "}
              <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">
                ↓
              </kbd>{" "}
              Navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">
                ↵
              </kbd>{" "}
              Select / Jump
            </span>
            <span>
              <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">
                ESC
              </kbd>{" "}
              Close
            </span>
          </div>
          <span className="text-indigo-400 font-mono">Ctrl + F</span>
        </div>
      </div>
    </div>
  );
};
