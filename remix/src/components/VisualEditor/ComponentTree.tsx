import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  Layers,
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
  Search,
  Maximize2,
  Minimize2,
  X,
  Plus,
} from "lucide-react";
import { AndroidComponent } from "../../types";

interface ComponentTreeProps {
  rootComponent: AndroidComponent;
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  className?: string;
  onAddSubComponent?: (parentId: string) => void;
}

export const ComponentTree: React.FC<ComponentTreeProps> = ({
  rootComponent,
  selectedComponentId,
  onSelectComponent,
  onDeleteComponent,
  onDuplicateComponent,
  onMoveUp,
  onMoveDown,
  className = "",
}) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    [rootComponent.id]: true,
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Collect all component IDs for expand/collapse all
  const allComponentIds = useMemo(() => {
    const ids: string[] = [];
    const traverse = (node: AndroidComponent) => {
      ids.push(node.id);
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    traverse(rootComponent);
    return ids;
  }, [rootComponent]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    allComponentIds.forEach((id) => {
      next[id] = true;
    });
    setExpandedIds(next);
  };

  const collapseAll = () => {
    const next: Record<string, boolean> = { [rootComponent.id]: true };
    setExpandedIds(next);
  };

  const renderTreeItem = (comp: AndroidComponent, depth = 0) => {
    const isSelected = selectedComponentId === comp.id;
    const hasChildren = comp.children && comp.children.length > 0;
    const isExpanded = expandedIds[comp.id] ?? true;

    const matchesSearch =
      !searchQuery ||
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.type.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      <div key={comp.id} className="select-none">
        <div
          id={`tree-node-${comp.id}`}
          onClick={() => onSelectComponent(comp.id)}
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
          className={`group flex items-center justify-between py-1.5 pr-2 rounded-lg text-xs cursor-pointer transition relative ${
            isSelected
              ? "bg-violet-100 text-violet-950 font-semibold shadow-xs ring-1 ring-violet-300"
              : matchesSearch && searchQuery
              ? "bg-amber-50 text-amber-950 font-medium"
              : "text-slate-700 hover:bg-slate-200/60 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(comp.id);
                }}
                className="p-0.5 hover:bg-slate-200 text-slate-500 rounded transition"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            ) : (
              <div className="w-3 h-3" />
            )}

            <Layers
              className={`w-3 h-3 shrink-0 ${
                isSelected ? "text-violet-600" : "text-slate-400"
              }`}
            />
            <span className="truncate font-mono text-[11px]">{comp.name}</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full border truncate font-medium ${
                isSelected
                  ? "bg-violet-200/80 text-violet-800 border-violet-300"
                  : "bg-slate-100 text-slate-500 border-slate-200/80"
              }`}
            >
              {comp.type}
            </span>
          </div>

          {/* Action triggers */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition pl-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp(comp.id);
              }}
              title="Move Up"
              className="p-1 hover:bg-white rounded text-slate-500 hover:text-slate-800 shadow-2xs"
            >
              <MoveUp className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown(comp.id);
              }}
              title="Move Down"
              className="p-1 hover:bg-white rounded text-slate-500 hover:text-slate-800 shadow-2xs"
            >
              <MoveDown className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicateComponent(comp.id);
              }}
              title="Duplicate"
              className="p-1 hover:bg-white rounded text-slate-500 hover:text-slate-800 shadow-2xs"
            >
              <Copy className="w-3 h-3" />
            </button>
            {comp.id !== rootComponent.id && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteComponent(comp.id);
                }}
                title="Delete"
                className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-0.5 relative pl-1.5 border-l border-slate-200/70 ml-2.5">
            {comp.children!.map((child) => renderTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full bg-[#F8F7FB] overflow-hidden text-slate-800 ${className}`}>
      {/* Top Tree Toolbar & Search */}
      <div className="p-3 border-b border-slate-200/60 bg-[#F8F7FB] space-y-2 shrink-0">
        {/* Search within hierarchy */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search hierarchy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200/80 rounded-full pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-400 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tree Actions: Total count, Expand All, Collapse All */}
        <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">Nodes:</span>
            <span className="bg-slate-200/70 text-slate-700 px-1.5 py-0.2 rounded-full font-mono text-[10px]">
              {allComponentIds.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={expandAll}
              title="Expand All"
              className="p-1 hover:bg-slate-200/70 rounded text-slate-500 hover:text-slate-800 flex items-center gap-1 transition"
            >
              <Maximize2 className="w-3 h-3" />
              <span className="text-[10px]">Expand</span>
            </button>
            <button
              type="button"
              onClick={collapseAll}
              title="Collapse All"
              className="p-1 hover:bg-slate-200/70 rounded text-slate-500 hover:text-slate-800 flex items-center gap-1 transition"
            >
              <Minimize2 className="w-3 h-3" />
              <span className="text-[10px]">Collapse</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Tree List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-200">
        {renderTreeItem(rootComponent)}
      </div>

      {/* Footer Info */}
      <div className="p-2 border-t border-slate-200/60 bg-white/80 text-[10px] text-slate-400 flex items-center justify-between px-3 shrink-0">
        <span>Click node to inspect</span>
        <span className="font-mono text-[9px] text-slate-500">Jetpack Compose UI</span>
      </div>
    </div>
  );
};
