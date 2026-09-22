import React, { useEffect, useRef, useState } from "react";
import {
  Edit3,
  Calendar,
  Play,
  GitFork,
  Copy,
  Power,
  Eye,
  EyeOff,
  Code2,
  Trash2,
  HelpCircle,
  Clock,
  Shuffle,
  ChevronRight,
  Zap,
  Bug,
} from "lucide-react";
import { FlowNode } from "../types";

export interface NodeContextMenuProps {
  x: number;
  y: number;
  node: FlowNode;
  onClose: () => void;
  // Common actions
  onEdit: (node: FlowNode) => void;
  onDuplicate?: (node: FlowNode) => void;
  onToggleEnabled: (node: FlowNode) => void;
  onToggleBreakpoint?: (node: FlowNode) => void;
  onDelete: (node: FlowNode) => void;
  onViewKotlin: (node: FlowNode) => void;
  onTest?: (node: FlowNode) => void;
  onTestNode?: (node: FlowNode) => void;
  // Trigger specific
  onChangeEvent?: (node: FlowNode, event: string) => void;
  onAddActionBelow?: (node: FlowNode) => void;
  onAddConditionBelow?: (node: FlowNode) => void;
  onDuplicateFlow?: (node: FlowNode) => void;
  onCollapseFlow?: (node: FlowNode) => void;
  onToggleCollapseFlow?: (node: FlowNode) => void;
  onHelp?: (node: FlowNode) => void;
  onShowHelp?: (node: FlowNode) => void;
  // Action specific
  onInsertDelayBefore?: (node: FlowNode) => void;
  // Condition specific
  onInvertCondition?: (node: FlowNode) => void;
  onAddActionToYes?: (node: FlowNode) => void;
  onAddActionToNo?: (node: FlowNode) => void;
  onAddActionToBranch?: (node: FlowNode, branch: "branch-yes" | "branch-no") => void;
}

export const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  x,
  y,
  node,
  onClose,
  onEdit,
  onDuplicate,
  onToggleEnabled,
  onDelete,
  onViewKotlin,
  onTest,
  onTestNode,
  onChangeEvent,
  onAddActionBelow,
  onAddConditionBelow,
  onDuplicateFlow,
  onCollapseFlow,
  onToggleCollapseFlow,
  onHelp,
  onShowHelp,
  onInsertDelayBefore,
  onInvertCondition,
  onAddActionToYes,
  onAddActionToNo,
  onAddActionToBranch,
  onToggleBreakpoint,
}) => {
  const isBreakpoint = !!(node.data as any)?.breakpoint;

  const triggerTest = () => {
    if (onTest) onTest(node);
    else if (onTestNode) onTestNode(node);
  };

  const triggerHelp = () => {
    if (onHelp) onHelp(node);
    else if (onShowHelp) onShowHelp(node);
  };

  const triggerCollapseFlow = () => {
    if (onCollapseFlow) onCollapseFlow(node);
    else if (onToggleCollapseFlow) onToggleCollapseFlow(node);
  };
  const menuRef = useRef<HTMLDivElement>(null);
  const [showEventsSubmenu, setShowEventsSubmenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const adjustedX = Math.max(10, Math.min(x, window.innerWidth - 240));
  const adjustedY = Math.max(10, Math.min(y, window.innerHeight - 440));

  const nodeData = node.data as any;
  const isEnabled = nodeData.enabled !== false;
  const isCollapsed = Boolean(nodeData.isCollapsed);

  const availableEvents = [
    "Click",
    "LongClick",
    "OnCreate",
    "TextChanged",
    "ValueChanged",
  ];

  return (
    <div
      ref={menuRef}
      style={{ left: adjustedX, top: adjustedY }}
      className="fixed z-50 w-56 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl py-1.5 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-100 font-sans select-none"
    >
      {/* Menu Header with Type Badge */}
      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 mb-1 flex items-center justify-between">
        <span className="truncate max-w-[140px]">
          {node.type === "trigger"
            ? `Trigger: ${nodeData.componentName || "Component"}`
            : node.type === "condition"
            ? "Decision Condition"
            : node.type === "apiBranch"
            ? "API Request"
            : `Action: ${nodeData.action?.actionType || "Action"}`}
        </span>
        <span
          className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
            node.type === "trigger"
              ? "bg-amber-500/20 text-amber-300"
              : node.type === "condition"
              ? "bg-purple-500/20 text-purple-300"
              : "bg-blue-500/20 text-blue-300"
          }`}
        >
          {node.type}
        </span>
      </div>

      {/* ======================= TRIGGER NODE MENU ======================= */}
      {node.type === "trigger" && (
        <>
          <button
            type="button"
            onClick={() => {
              onEdit(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white text-left transition cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-amber-400" />
            <span className="flex-1 font-medium">Edit Trigger</span>
          </button>

          {/* Change Event Submenu */}
          <div
            className="relative"
            onMouseEnter={() => setShowEventsSubmenu(true)}
            onMouseLeave={() => setShowEventsSubmenu(false)}
          >
            <button
              type="button"
              className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-slate-800 hover:text-white text-left transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="font-medium">Change Event</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showEventsSubmenu && (
              <div className="absolute left-full top-0 ml-1 w-40 bg-slate-900 border border-slate-700/80 rounded-xl shadow-xl py-1 z-50">
                {availableEvents.map((evt) => (
                  <button
                    key={evt}
                    type="button"
                    onClick={() => {
                      onChangeEvent?.(node, evt);
                      onClose();
                    }}
                    className={`w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-slate-800 transition cursor-pointer ${
                      nodeData.event === evt ? "text-amber-400 font-bold" : "text-slate-300"
                    }`}
                  >
                    <span>{evt}</span>
                    {nodeData.event === evt && <span className="text-amber-400">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-px bg-slate-800 my-1 mx-2" />

          <button
            type="button"
            onClick={() => {
              onAddActionBelow?.(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-blue-500/15 hover:text-blue-300 text-left transition cursor-pointer"
          >
            <Play className="w-4 h-4 text-blue-400" />
            <span className="flex-1 font-medium">Add Action Below</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onAddConditionBelow?.(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-purple-500/15 hover:text-purple-300 text-left transition cursor-pointer"
          >
            <GitFork className="w-4 h-4 text-purple-400" />
            <span className="flex-1 font-medium">Add Condition Below</span>
          </button>

          <div className="h-px bg-slate-800 my-1 mx-2" />

          <button
            type="button"
            onClick={() => {
              onDuplicateFlow?.(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white text-left transition cursor-pointer"
          >
            <Copy className="w-4 h-4 text-slate-400" />
            <span className="flex-1 font-medium">Duplicate Flow</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleEnabled(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white text-left transition cursor-pointer"
          >
            <Power className={`w-4 h-4 ${isEnabled ? "text-amber-400" : "text-slate-500"}`} />
            <span className="flex-1 font-medium">
              {isEnabled ? "Disable Trigger" : "Enable Trigger"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleBreakpoint?.(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-rose-500/15 hover:text-rose-300 text-left transition cursor-pointer"
          >
            <Bug className={`w-4 h-4 ${isBreakpoint ? "text-rose-400" : "text-slate-400"}`} />
            <span className="flex-1 font-medium">
              {isBreakpoint ? "Remove Breakpoint" : "Toggle Breakpoint"}
            </span>
            {isBreakpoint && (
              <span className="text-[9px] font-mono text-rose-400 font-bold bg-rose-500/20 px-1 py-0.5 rounded">
                Active
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              triggerCollapseFlow();
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white text-left transition cursor-pointer"
          >
            {isCollapsed ? (
              <Eye className="w-4 h-4 text-slate-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-slate-400" />
            )}
            <span className="flex-1 font-medium">
              {isCollapsed ? "Expand Flow" : "Collapse Flow"}
            </span>
          </button>

          <div className="h-px bg-slate-800 my-1 mx-2" />

          <button
            type="button"
            onClick={() => {
              triggerTest();
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-emerald-500/15 hover:text-emerald-300 text-left transition cursor-pointer"
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="flex-1 font-medium">Test This Trigger</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onViewKotlin(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white text-left transition cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span className="flex-1 font-medium">View Generated Kotlin</span>
          </button>

          <div className="h-px bg-slate-800 my-1 mx-2" />

          <button
            type="button"
            onClick={() => {
              onDelete(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-left transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span className="flex-1 font-medium">Delete Trigger</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHelp();
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-800 text-slate-400 hover:text-slate-300 text-left transition cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span className="flex-1">Help</span>
          </button>
        </>
      )}

      {/* ======================= ACTION NODE MENU ======================= */}
      {(node.type === "action" || node.type === "apiBranch") && (
        <>
          <button
            type="button"
            onClick={() => {
              onEdit(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white text-left transition cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-blue-400" />
            <span className="flex-1 font-medium">Edit Action</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onAddActionBelow?.(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-blue-500/15 hover:text-blue-300 text-left transition cursor-pointer"
          >
            <Play className="w-4 h-4 text-blue-400" />
            <span className="flex-1 font-medium">Add Action Below</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onAddConditionBelow?.(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-purple-500/15 hover:text-purple-300 text-left transition cursor-pointer"
          >
            <GitFork className="w-4 h-4 text-purple-400" />
            <span className="flex-1 font-medium">Add Condition Below</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onInsertDelayBefore?.(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-amber-500/15 hover:text-amber-300 text-left transition cursor-pointer"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="flex-1 font-medium">Insert Delay Before</span>
          </button>

          <div className="h-px bg-slate-800 my-1 mx-2" />

          <button
            type="button"
            onClick={() => {
              onDuplicate(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white text-left transition cursor-pointer"
          >
            <Copy className="w-4 h-4 text-slate-400" />
            <span className="flex-1 font-medium">Duplicate Action</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleEnabled(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white text-left transition cursor-pointer"
          >
            <Power className={`w-4 h-4 ${isEnabled ? "text-emerald-400" : "text-slate-500"}`} />
            <span className="flex-1 font-medium">
              {isEnabled ? "Disable Action" : "Enable Action"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleBreakpoint?.(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-rose-500/15 hover:text-rose-300 text-left transition cursor-pointer"
          >
            <Bug className={`w-4 h-4 ${isBreakpoint ? "text-rose-400" : "text-slate-400"}`} />
            <span className="flex-1 font-medium">
              {isBreakpoint ? "Remove Breakpoint" : "Toggle Breakpoint"}
            </span>
            {isBreakpoint && (
              <span className="text-[9px] font-mono text-rose-400 font-bold bg-rose-500/20 px-1 py-0.5 rounded">
                Active
              </span>
            )}
          </button>

          <div className="h-px bg-slate-800 my-1 mx-2" />

          <button
            type="button"
            onClick={() => {
              triggerTest();
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-emerald-500/15 hover:text-emerald-300 text-left transition cursor-pointer"
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="flex-1 font-medium">Test This Action</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onViewKotlin(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white text-left transition cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span className="flex-1 font-medium">View Kotlin</span>
          </button>

          <div className="h-px bg-slate-800 my-1 mx-2" />

          <button
            type="button"
            onClick={() => {
              onDelete(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-left transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span className="flex-1 font-medium">Delete Action</span>
          </button>
        </>
      )}

      {/* ======================= CONDITION NODE MENU ======================= */}
      {node.type === "condition" && (
        <>
          <button
            type="button"
            onClick={() => {
              onEdit(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white text-left transition cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-purple-400" />
            <span className="flex-1 font-medium">Edit Condition</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onInvertCondition?.(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-purple-500/15 hover:text-purple-300 text-left transition cursor-pointer"
          >
            <Shuffle className="w-4 h-4 text-purple-400" />
            <span className="flex-1 font-medium">Invert Condition (YES ⇄ NO)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onAddActionToYes) onAddActionToYes(node);
              else onAddActionToBranch?.(node, "branch-yes");
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-emerald-500/15 hover:text-emerald-300 text-left transition cursor-pointer"
          >
            <Play className="w-4 h-4 text-emerald-400" />
            <span className="flex-1 font-medium">Add Action to YES</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onAddActionToNo) onAddActionToNo(node);
              else onAddActionToBranch?.(node, "branch-no");
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-rose-500/15 hover:text-rose-300 text-left transition cursor-pointer"
          >
            <Play className="w-4 h-4 text-rose-400" />
            <span className="flex-1 font-medium">Add Action to NO</span>
          </button>

          <div className="h-px bg-slate-800 my-1 mx-2" />

          <button
            type="button"
            onClick={() => {
              onDuplicate(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white text-left transition cursor-pointer"
          >
            <Copy className="w-4 h-4 text-slate-400" />
            <span className="flex-1 font-medium">Duplicate Condition</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleEnabled(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white text-left transition cursor-pointer"
          >
            <Power className={`w-4 h-4 ${isEnabled ? "text-purple-400" : "text-slate-500"}`} />
            <span className="flex-1 font-medium">
              {isEnabled ? "Disable Condition" : "Enable Condition"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleBreakpoint?.(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-rose-500/15 hover:text-rose-300 text-left transition cursor-pointer"
          >
            <Bug className={`w-4 h-4 ${isBreakpoint ? "text-rose-400" : "text-slate-400"}`} />
            <span className="flex-1 font-medium">
              {isBreakpoint ? "Remove Breakpoint" : "Toggle Breakpoint"}
            </span>
            {isBreakpoint && (
              <span className="text-[9px] font-mono text-rose-400 font-bold bg-rose-500/20 px-1 py-0.5 rounded">
                Active
              </span>
            )}
          </button>

          <div className="h-px bg-slate-800 my-1 mx-2" />

          <button
            type="button"
            onClick={() => {
              triggerTest();
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-emerald-500/15 hover:text-emerald-300 text-left transition cursor-pointer"
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="flex-1 font-medium">Test Condition</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onViewKotlin(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white text-left transition cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span className="flex-1 font-medium">View Kotlin</span>
          </button>

          <div className="h-px bg-slate-800 my-1 mx-2" />

          <button
            type="button"
            onClick={() => {
              onDelete(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-left transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span className="flex-1 font-medium">Delete Condition</span>
          </button>
        </>
      )}

      {/* ======================= NOTE NODE MENU ======================= */}
      {node.type === "note" && (
        <>
          <button
            type="button"
            onClick={() => {
              onEdit(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white text-left transition cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-amber-400" />
            <span className="flex-1 font-medium">Edit Note</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onDuplicate(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-slate-800 hover:text-white text-left transition cursor-pointer"
          >
            <Copy className="w-4 h-4 text-slate-400" />
            <span className="flex-1 font-medium">Duplicate Note</span>
          </button>

          <div className="h-px bg-slate-800 my-1 mx-2" />

          <button
            type="button"
            onClick={() => {
              onDelete(node);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-left transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span className="flex-1 font-medium">Delete Note</span>
          </button>
        </>
      )}
    </div>
  );
};
