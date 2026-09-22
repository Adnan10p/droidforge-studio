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
  Cpu,
  Radio,
} from "lucide-react";
import { AndroidComponent } from "../../types";
import { isNonVisibleComponent, resolveContainerTargetId } from "../../data/componentRegistry";

interface ComponentTreeProps {
  rootComponent: AndroidComponent;
  screenName?: string;
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onReorderComponent?: (draggedId: string, targetId: string) => void;
  className?: string;
  onAddSubComponent?: (parentId: string) => void;
}

export const ComponentTree: React.FC<ComponentTreeProps> = ({
  rootComponent,
  screenName,
  selectedComponentId,
  onSelectComponent,
  onDeleteComponent,
  onDuplicateComponent,
  onMoveUp,
  onMoveDown,
  onReorderComponent,
  className = "",
}) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    [rootComponent.id]: true,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [nonVisExpanded, setNonVisExpanded] = useState(true);

  // Separate Visible UI Hierarchy vs Non-Visible Components
  const { visibleTreeRoot, nonVisibleList, allComponentIds } = useMemo(() => {
    const nonVis: AndroidComponent[] = [];
    const ids: string[] = [];

    const traverse = (node: AndroidComponent): AndroidComponent | null => {
      ids.push(node.id);
      if (isNonVisibleComponent(node)) {
        nonVis.push(node);
        return null;
      }
      const filteredChildren = node.children
        ? node.children.map(traverse).filter((c): c is AndroidComponent => c !== null)
        : undefined;

      return {
        ...node,
        children: filteredChildren,
      };
    };

    const root = traverse(rootComponent) || rootComponent;
    return { visibleTreeRoot: root, nonVisibleList: nonVis, allComponentIds: ids };
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

    // Display Screen name for root container or clean non-generic name
    const rawName = comp.name || "";
    const cleanDisplayName =
      depth === 0
        ? screenName || (rawName === "MainContainer" || rawName === "ScreenContainer" ? "HomeScreen" : rawName.replace(/Container$/i, "Screen"))
        : (rawName === "MainContainer" || rawName === "ScreenContainer" ? (screenName || "Screen") : rawName);

    const matchesSearch =
      !searchQuery ||
      cleanDisplayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.type.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      <div key={comp.id} className="select-none">
        <div
          id={`tree-node-${comp.id}`}
          onClick={() => onSelectComponent(comp.id)}
          draggable={depth > 0}
          onDragStart={(e) => {
            e.stopPropagation();
            (window as any).__droidforge_dragged_reorder_id = comp.id;
            e.dataTransfer.setData("application/droidforge-reorder-id", comp.id);
            e.dataTransfer.setData("text/plain", comp.id);
            e.dataTransfer.effectAllowed = "move";
          }}
          onDragEnd={() => {
            (window as any).__droidforge_dragged_reorder_id = null;
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = "move";
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const reorderId =
              e.dataTransfer.getData("application/droidforge-reorder-id") ||
              (window as any).__droidforge_dragged_reorder_id;
            (window as any).__droidforge_dragged_reorder_id = null;
            if (reorderId && onReorderComponent) {
              const targetContainerId = resolveContainerTargetId(comp.id, rootComponent);
              onReorderComponent(reorderId, targetContainerId);
            }
          }}
          style={{
            paddingLeft: `${depth * 14 + 8}px`,
            backgroundColor: isSelected ? "rgba(124, 58, 237, 0.2)" : matchesSearch && searchQuery ? "rgba(245, 158, 11, 0.15)" : "transparent",
            borderColor: isSelected ? "#A78BFA" : "transparent",
            color: isSelected ? "#C4B5FD" : "var(--ide-text)",
          }}
          className={`group flex items-center justify-between py-1.5 pr-2 rounded-lg text-xs cursor-pointer transition relative ${
            isSelected
              ? "font-semibold shadow-2xs ring-1 ring-violet-500/50"
              : matchesSearch && searchQuery
              ? "font-medium"
              : "hover:bg-slate-500/20"
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
                className="p-0.5 hover:bg-slate-500/30 text-slate-400 rounded transition"
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
                isSelected ? "text-violet-400" : "text-slate-400"
              }`}
            />
            <span className="truncate font-mono text-[11px]">{cleanDisplayName}</span>
            <span
              style={{
                backgroundColor: isSelected ? "rgba(124, 58, 237, 0.3)" : "var(--ide-card-inner-bg)",
                borderColor: isSelected ? "#A78BFA" : "var(--ide-border)",
                color: isSelected ? "#E9D5FF" : "var(--ide-text-muted)",
              }}
              className="text-[9px] px-1.5 py-0.2 rounded-full border truncate font-medium"
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
              className="p-1 hover:bg-slate-700/60 rounded text-slate-300 hover:text-white transition"
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
              className="p-1 hover:bg-slate-700/60 rounded text-slate-300 hover:text-white transition"
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
              className="p-1 hover:bg-slate-700/60 rounded text-slate-300 hover:text-white transition"
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
                className="p-1 hover:bg-rose-900/50 rounded text-slate-400 hover:text-rose-400 transition"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-0.5 relative pl-1.5 border-l border-slate-700/60 ml-2.5">
            {comp.children!.map((child) => renderTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        backgroundColor: "var(--ide-shell-bg)",
        color: "var(--ide-text)",
      }}
      className={`flex flex-col h-full overflow-hidden ${className}`}
    >
      {/* Top Tree Toolbar & Search */}
      <div
        style={{
          backgroundColor: "var(--ide-shell-bg)",
          borderColor: "var(--ide-border)",
        }}
        className="p-3 border-b space-y-2 shrink-0"
      >
        {/* Search within hierarchy */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search hierarchy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              backgroundColor: "var(--ide-card-bg)",
              color: "var(--ide-text)",
              borderColor: "var(--ide-border)",
            }}
            className="w-full border rounded-full pl-8 pr-7 py-1.5 text-xs placeholder:text-slate-400 shadow-xs focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-400 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tree Actions: Total count, Expand All, Collapse All */}
        <div className="flex items-center justify-between px-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span style={{ color: "var(--ide-text-muted)" }} className="font-semibold">Nodes:</span>
            <span
              style={{
                backgroundColor: "var(--ide-card-inner-bg)",
                borderColor: "var(--ide-border)",
                color: "var(--ide-text)",
              }}
              className="px-1.5 py-0.2 rounded-full font-mono text-[10px] border"
            >
              {allComponentIds.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={expandAll}
              title="Expand All"
              style={{ color: "var(--ide-text-muted)" }}
              className="p-1 hover:bg-slate-700/40 rounded flex items-center gap-1 transition cursor-pointer"
            >
              <Maximize2 className="w-3 h-3" />
              <span className="text-[10px]">Expand</span>
            </button>
            <button
              type="button"
              onClick={collapseAll}
              title="Collapse All"
              style={{ color: "var(--ide-text-muted)" }}
              className="p-1 hover:bg-slate-700/40 rounded flex items-center gap-1 transition cursor-pointer"
            >
              <Minimize2 className="w-3 h-3" />
              <span className="text-[10px]">Collapse</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Tree List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
        {/* Section 1: Visible UI Hierarchy */}
        <div>
          <div
            style={{ color: "var(--ide-text-muted)" }}
            className="text-[10px] uppercase font-bold tracking-wider px-2 pb-1 flex items-center justify-between"
          >
            <span>UI Screen Layout</span>
            <span className="font-mono text-[9px]">Visible</span>
          </div>
          {renderTreeItem(visibleTreeRoot)}
        </div>

        {/* Section 2: Non-Visible Components (Hardware, Sensors, Services) */}
        <div
          style={{ borderColor: "var(--ide-border)" }}
          className="pt-2 border-t"
        >
          <button
            type="button"
            onClick={() => setNonVisExpanded(!nonVisExpanded)}
            style={{
              backgroundColor: "rgba(168, 85, 247, 0.15)",
              borderColor: "rgba(168, 85, 247, 0.3)",
              color: "#E9D5FF",
            }}
            className="w-full flex items-center justify-between px-2 py-1 text-xs font-bold border rounded-lg hover:bg-purple-900/30 transition group mb-1.5 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>Non-Visible Components</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-purple-900/60 text-purple-200 font-bold border border-purple-500/40">
                {nonVisibleList.length}
              </span>
              {nonVisExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-purple-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
              )}
            </div>
          </button>

          {nonVisExpanded && (
            <div className="space-y-1 pl-1">
              {nonVisibleList.length > 0 ? (
                nonVisibleList.map((nv) => {
                  const isSelected = selectedComponentId === nv.id;
                  const matchesSearch =
                    !searchQuery ||
                    nv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    nv.type.toLowerCase().includes(searchQuery.toLowerCase());

                  return (
                    <div
                      key={nv.id}
                      onClick={() => onSelectComponent(nv.id)}
                      style={{
                        backgroundColor: isSelected ? "rgba(168, 85, 247, 0.3)" : "var(--ide-card-bg)",
                        borderColor: isSelected ? "#C084FC" : "var(--ide-border)",
                        color: isSelected ? "#F3E8FF" : "var(--ide-text)",
                      }}
                      className={`group flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs cursor-pointer transition relative border ${
                        isSelected
                          ? "font-semibold shadow-xs ring-1 ring-purple-500/40"
                          : matchesSearch && searchQuery
                          ? "font-medium"
                          : "hover:bg-purple-900/20"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-white" : "bg-purple-400"} animate-pulse shrink-0`} />
                        <span className="truncate font-mono text-[11px]">{nv.name}</span>
                        <span
                          style={{
                            backgroundColor: "rgba(168, 85, 247, 0.2)",
                            borderColor: "rgba(168, 85, 247, 0.4)",
                            color: "#E9D5FF",
                          }}
                          className="text-[9px] px-1.5 py-0.2 rounded-full border truncate font-medium"
                        >
                          {nv.type}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateComponent(nv.id);
                          }}
                          title="Duplicate Non-Visible Component"
                          className="p-1 rounded hover:bg-slate-700/60 text-slate-300 hover:text-white transition"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteComponent(nv.id);
                          }}
                          title="Delete Non-Visible Component"
                          className="p-1 rounded hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    backgroundColor: "var(--ide-card-inner-bg)",
                    borderColor: "var(--ide-border)",
                    color: "var(--ide-text-muted)",
                  }}
                  className="p-3 text-center text-[11px] rounded-xl border border-dashed"
                >
                  <p className="font-medium mb-0.5" style={{ color: "var(--ide-text)" }}>No Non-Visible Components</p>
                  <p className="text-[10px]">Add sensors, storage, audio or APIs from the Component Library.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div
        style={{
          backgroundColor: "var(--ide-card-bg)",
          borderColor: "var(--ide-border)",
          color: "var(--ide-text-muted)",
        }}
        className="p-2 border-t text-[10px] flex items-center justify-between px-3 shrink-0"
      >
        <span>Click node to inspect properties</span>
        <span className="font-mono text-[9px]">Hierarchy Drawer</span>
      </div>
    </div>
  );
};
