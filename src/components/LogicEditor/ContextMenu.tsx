import React, { useEffect, useRef } from "react";
import {
  Zap,
  Plus,
  GitBranch,
  Sliders,
  Clipboard,
  Maximize,
  Grid,
  StickyNote,
  Edit3,
  Copy,
  Power,
  Play,
  Code2,
  Trash2,
  HelpCircle,
  ArrowDown,
  ArrowRight,
  RefreshCw,
  Layers,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  ArrowUpDown,
  ArrowLeftRight,
  Minimize2,
  Maximize2 as ExpandIcon,
  Repeat,
} from "lucide-react";
import { ContextMenuType } from "./types";

interface ContextMenuProps {
  menu: ContextMenuType | null;
  onClose: () => void;
  onAction: (actionId: string, payload?: any) => void;
  showGrid?: boolean;
  snapToGrid?: boolean;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  menu,
  onClose,
  onAction,
  showGrid = true,
  snapToGrid = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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

  if (!menu) return null;

  // Clamp popup within screen boundaries
  const menuStyle: React.CSSProperties = {
    position: "fixed",
    left: Math.min(menu.x, window.innerWidth - 240),
    top: Math.min(menu.y, window.innerHeight - 380),
    zIndex: 100,
  };

  const MenuItem = ({
    icon,
    label,
    actionId,
    destructive,
    shortcut,
    disabled,
  }: {
    icon: React.ReactNode;
    label: string;
    actionId: string;
    destructive?: boolean;
    shortcut?: string;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        onAction(actionId, menu);
        onClose();
      }}
      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
        destructive
          ? "hover:bg-rose-500/20 text-rose-300 hover:text-rose-100"
          : disabled
          ? "opacity-40 cursor-not-allowed text-slate-500"
          : "hover:bg-indigo-600/30 text-slate-200 hover:text-white"
      }`}
    >
      <div className="flex items-center gap-2 truncate">
        <span className="shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      {shortcut && (
        <span className="text-[10px] font-mono text-slate-400 ml-2 shrink-0">{shortcut}</span>
      )}
    </button>
  );

  const Divider = () => <div className="h-px bg-slate-800 my-1" />;

  return (
    <div
      ref={containerRef}
      style={menuStyle}
      className="w-56 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-1.5 select-none text-slate-200 animate-in fade-in zoom-in-95 duration-100"
    >
      {/* 1. EMPTY CANVAS CONTEXT MENU */}
      {menu.kind === "canvas" && (
        <>
          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Workspace Actions
          </div>
          <MenuItem icon={<Zap className="w-3.5 h-3.5 text-amber-400" />} label="Add Trigger" actionId="add_trigger" />
          <MenuItem icon={<Plus className="w-3.5 h-3.5 text-blue-400" />} label="Add Action" actionId="add_action" />
          <MenuItem icon={<GitBranch className="w-3.5 h-3.5 text-purple-400" />} label="Add Condition" actionId="add_condition" />
          <MenuItem icon={<Sliders className="w-3.5 h-3.5 text-emerald-400" />} label="Add Variable" actionId="add_variable" />
          <Divider />
          <MenuItem icon={<Clipboard className="w-3.5 h-3.5 text-slate-400" />} label="Paste" actionId="paste" shortcut="Ctrl+V" />
          <MenuItem icon={<Layers className="w-3.5 h-3.5 text-slate-400" />} label="Select All" actionId="select_all" shortcut="Ctrl+A" />
          <Divider />
          <MenuItem icon={<RefreshCw className="w-3.5 h-3.5 text-indigo-400" />} label="Clean Layout" actionId="clean_layout" />
          <MenuItem icon={<Maximize className="w-3.5 h-3.5 text-slate-400" />} label="Fit Flow to Screen" actionId="fit_flow" shortcut="F" />
          <MenuItem icon={<Maximize2 className="w-3.5 h-3.5 text-slate-400" />} label="Center Flow" actionId="center_flow" />
          <Divider />
          <MenuItem icon={<Grid className="w-3.5 h-3.5 text-slate-400" />} label={showGrid ? "Hide Grid" : "Show Grid"} actionId="toggle_grid" />
          <MenuItem icon={<Grid className="w-3.5 h-3.5 text-indigo-400" />} label={snapToGrid ? "Disable Snap to Grid" : "Snap to Grid"} actionId="toggle_snap" />
          <Divider />
          <MenuItem icon={<StickyNote className="w-3.5 h-3.5 text-amber-300" />} label="Add Comment" actionId="add_comment" />
        </>
      )}

      {/* 2. TRIGGER NODE CONTEXT MENU */}
      {menu.kind === "trigger" && (
        <>
          <div className="px-2 py-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            Trigger Node Menu
          </div>
          <MenuItem icon={<Edit3 className="w-3.5 h-3.5 text-indigo-400" />} label="Edit Trigger" actionId="edit_node" />
          <MenuItem icon={<Zap className="w-3.5 h-3.5 text-amber-400" />} label="Change Event" actionId="change_event" />
          <Divider />
          <MenuItem icon={<ArrowDown className="w-3.5 h-3.5 text-blue-400" />} label="Add Action Below" actionId="add_action_below" />
          <MenuItem icon={<GitBranch className="w-3.5 h-3.5 text-purple-400" />} label="Add Condition Below" actionId="add_condition_below" />
          <Divider />
          <MenuItem icon={<Copy className="w-3.5 h-3.5 text-cyan-400" />} label="Duplicate Flow" actionId="duplicate_flow" shortcut="Ctrl+D" />
          <MenuItem icon={<Power className="w-3.5 h-3.5 text-slate-400" />} label="Disable / Enable Trigger" actionId="toggle_disable" />
          <MenuItem icon={<Minimize2 className="w-3.5 h-3.5 text-slate-400" />} label="Collapse / Expand Flow" actionId="toggle_collapse" />
          <Divider />
          <MenuItem icon={<Play className="w-3.5 h-3.5 text-emerald-400" />} label="Test This Trigger" actionId="test_node" />
          <MenuItem icon={<Code2 className="w-3.5 h-3.5 text-indigo-300" />} label="View Generated Kotlin" actionId="view_kotlin" />
          <Divider />
          <MenuItem icon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />} label="Delete Trigger" actionId="delete_trigger" destructive />
          <MenuItem icon={<HelpCircle className="w-3.5 h-3.5 text-slate-400" />} label="Help" actionId="help" />
        </>
      )}

      {/* 3. ACTION NODE CONTEXT MENU */}
      {menu.kind === "action" && (
        <>
          <div className="px-2 py-1 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
            Action Node Menu
          </div>
          <MenuItem icon={<Edit3 className="w-3.5 h-3.5 text-indigo-400" />} label="Edit Action" actionId="edit_node" />
          <Divider />
          <MenuItem icon={<ArrowDown className="w-3.5 h-3.5 text-blue-400" />} label="Add Action Before" actionId="add_action_before" />
          <MenuItem icon={<ArrowRight className="w-3.5 h-3.5 text-blue-400" />} label="Add Action After" actionId="add_action_after" />
          <MenuItem icon={<GitBranch className="w-3.5 h-3.5 text-purple-400" />} label="Add Condition After" actionId="add_condition_after" />
          <Divider />
          <MenuItem icon={<Copy className="w-3.5 h-3.5 text-cyan-400" />} label="Duplicate" actionId="duplicate_node" shortcut="Ctrl+D" />
          <MenuItem icon={<Clipboard className="w-3.5 h-3.5 text-slate-400" />} label="Copy" actionId="copy_node" shortcut="Ctrl+C" />
          <MenuItem icon={<Power className="w-3.5 h-3.5 text-slate-400" />} label="Disable / Enable Action" actionId="toggle_disable" />
          <MenuItem icon={<Minimize2 className="w-3.5 h-3.5 text-slate-400" />} label="Collapse / Expand" actionId="toggle_collapse" />
          <Divider />
          <MenuItem icon={<Play className="w-3.5 h-3.5 text-emerald-400" />} label="Run From Here" actionId="test_node" />
          <MenuItem icon={<Code2 className="w-3.5 h-3.5 text-indigo-300" />} label="View Generated Kotlin" actionId="view_kotlin" />
          <Divider />
          <MenuItem icon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />} label="Delete" actionId="delete_node" destructive shortcut="Delete" />
          <MenuItem icon={<HelpCircle className="w-3.5 h-3.5 text-slate-400" />} label="Help" actionId="help" />
        </>
      )}

      {/* 4. CONDITION NODE CONTEXT MENU */}
      {menu.kind === "condition" && (
        <>
          <div className="px-2 py-1 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
            Condition Node Menu
          </div>
          <MenuItem icon={<Edit3 className="w-3.5 h-3.5 text-indigo-400" />} label="Edit Condition" actionId="edit_node" />
          <Divider />
          <MenuItem icon={<ArrowRight className="w-3.5 h-3.5 text-emerald-400" />} label="Add Action to TRUE" actionId="add_action_true" />
          <MenuItem icon={<ArrowRight className="w-3.5 h-3.5 text-rose-400" />} label="Add Action to FALSE" actionId="add_action_false" />
          <MenuItem icon={<Repeat className="w-3.5 h-3.5 text-purple-400" />} label="Swap TRUE / FALSE" actionId="swap_true_false" />
          <Divider />
          <MenuItem icon={<Copy className="w-3.5 h-3.5 text-cyan-400" />} label="Duplicate" actionId="duplicate_node" shortcut="Ctrl+D" />
          <MenuItem icon={<Power className="w-3.5 h-3.5 text-slate-400" />} label="Disable / Enable" actionId="toggle_disable" />
          <MenuItem icon={<Minimize2 className="w-3.5 h-3.5 text-slate-400" />} label="Collapse Branch" actionId="toggle_collapse" />
          <MenuItem icon={<ExpandIcon className="w-3.5 h-3.5 text-slate-400" />} label="Expand Branch" actionId="expand_branch" />
          <Divider />
          <MenuItem icon={<Code2 className="w-3.5 h-3.5 text-indigo-300" />} label="View Generated Kotlin" actionId="view_kotlin" />
          <MenuItem icon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />} label="Delete" actionId="delete_node" destructive shortcut="Delete" />
        </>
      )}

      {/* 5. EDGE / CONNECTION CONTEXT MENU */}
      {menu.kind === "edge" && (
        <>
          <div className="px-2 py-1 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
            Connection Edge
          </div>
          <MenuItem icon={<Plus className="w-3.5 h-3.5 text-blue-400" />} label="Insert Action" actionId="edge_insert_action" />
          <MenuItem icon={<GitBranch className="w-3.5 h-3.5 text-purple-400" />} label="Insert Condition" actionId="edge_insert_condition" />
          <MenuItem icon={<RefreshCw className="w-3.5 h-3.5 text-slate-400" />} label="Reconnect" actionId="edge_reconnect" />
          <Divider />
          <MenuItem icon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />} label="Delete Connection" actionId="edge_delete" destructive />
        </>
      )}

      {/* 6. MULTI-SELECTION CONTEXT MENU */}
      {menu.kind === "selection" && (
        <>
          <div className="px-2 py-1 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
            Multi-Selection ({menu.selectedNodeIds.length} Nodes)
          </div>
          <MenuItem icon={<Clipboard className="w-3.5 h-3.5 text-slate-400" />} label="Copy Selected" actionId="copy_selected" shortcut="Ctrl+C" />
          <MenuItem icon={<Copy className="w-3.5 h-3.5 text-cyan-400" />} label="Duplicate Selected" actionId="duplicate_selected" shortcut="Ctrl+D" />
          <Divider />
          <MenuItem icon={<Power className="w-3.5 h-3.5 text-emerald-400" />} label="Enable Selected" actionId="enable_selected" />
          <MenuItem icon={<Power className="w-3.5 h-3.5 text-rose-400" />} label="Disable Selected" actionId="disable_selected" />
          <Divider />
          <MenuItem icon={<Layers className="w-3.5 h-3.5 text-indigo-400" />} label="Group Selection" actionId="group_selection" />
          <MenuItem icon={<Minimize2 className="w-3.5 h-3.5 text-slate-400" />} label="Collapse Selection" actionId="collapse_selection" />
          <Divider />
          <MenuItem icon={<AlignLeft className="w-3.5 h-3.5 text-slate-400" />} label="Align Left" actionId="align_left" />
          <MenuItem icon={<AlignCenter className="w-3.5 h-3.5 text-slate-400" />} label="Align Center" actionId="align_center" />
          <MenuItem icon={<AlignRight className="w-3.5 h-3.5 text-slate-400" />} label="Align Right" actionId="align_right" />
          <MenuItem icon={<ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />} label="Distribute Horizontally" actionId="distribute_horiz" />
          <MenuItem icon={<ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />} label="Distribute Vertically" actionId="distribute_vert" />
          <Divider />
          <MenuItem icon={<RefreshCw className="w-3.5 h-3.5 text-indigo-400" />} label="Clean Up Selection" actionId="clean_selection" />
          <Divider />
          <MenuItem
            icon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
            label={`Delete Selected (${menu.selectedNodeIds.length})`}
            actionId="delete_selected"
            destructive
            shortcut="Delete"
          />
        </>
      )}
    </div>
  );
};
