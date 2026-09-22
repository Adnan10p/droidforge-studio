import React, { useState } from "react";
import {
  Code2,
  Plus,
  Bookmark,
  Sparkles,
  Trash2,
  Copy,
  ChevronRight,
  ExternalLink,
  Layers,
  ArrowRight,
  Save,
  Check,
  GripVertical,
  CheckSquare,
  Search,
} from "lucide-react";
import { BUILT_IN_SNIPPETS, CodeSnippetTemplate } from "./snippetData";
import { FlowNode, FlowEdge } from "./types";

interface CodeSnippetTabProps {
  onInsertSnippet: (snippet: CodeSnippetTemplate) => void;
  currentNodes: FlowNode[];
  edges?: FlowEdge[];
  onSaveCurrentAsSnippet?: (name: string, description: string, selectedNodeIds?: string[]) => void;
}

export const CodeSnippetTab: React.FC<CodeSnippetTabProps> = ({
  onInsertSnippet,
  currentNodes,
  edges = [],
  onSaveCurrentAsSnippet,
}) => {
  const [snippets, setSnippets] = useState<CodeSnippetTemplate[]>(() => {
    try {
      const saved = localStorage.getItem("logic_snippets_custom");
      if (saved) {
        return [...BUILT_IN_SNIPPETS, ...JSON.parse(saved)];
      }
    } catch (e) {
      // ignore
    }
    return BUILT_IN_SNIPPETS;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [snippetName, setSnippetName] = useState("");
  const [snippetDesc, setSnippetDesc] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Selected nodes vs all nodes
  const selectedNodes = currentNodes.filter((n) => n.selected);
  const targetNodesToSave = selectedNodes.length > 0 ? selectedNodes : currentNodes;
  const targetNodeIds = new Set(targetNodesToSave.map((n) => n.id));

  // Edges connecting target nodes
  const targetEdgesToSave = edges.filter(
    (e) => targetNodeIds.has(e.source) && targetNodeIds.has(e.target)
  );

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snippetName.trim()) return;

    const name = snippetName.trim();
    const desc = snippetDesc.trim() || `Pattern containing ${targetNodesToSave.length} flow nodes`;

    if (onSaveCurrentAsSnippet) {
      onSaveCurrentAsSnippet(
        name,
        desc,
        selectedNodes.length > 0 ? selectedNodes.map((n) => n.id) : undefined
      );
    }

    // Normalize positions relative to top-left of the selection
    const minX = Math.min(...targetNodesToSave.map((n) => n.position.x));
    const minY = Math.min(...targetNodesToSave.map((n) => n.position.y));

    const normalizedNodes = targetNodesToSave.map((n) => ({
      ...n,
      position: {
        x: n.position.x - minX,
        y: n.position.y - minY,
      },
    }));

    const newSnip: CodeSnippetTemplate = {
      id: `custom_${Date.now()}`,
      name,
      description: desc,
      category: "custom",
      tags: ["Custom", `${targetNodesToSave.length} Nodes`],
      nodes: normalizedNodes,
      edges: targetEdgesToSave,
      isCustom: true,
    };

    const updated = [newSnip, ...snippets];
    setSnippets(updated);

    try {
      const customs = updated.filter((s) => s.isCustom);
      localStorage.setItem("logic_snippets_custom", JSON.stringify(customs));
    } catch (err) {
      // ignore
    }

    setIsSaving(false);
    setSnippetName("");
    setSnippetDesc("");
  };

  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = snippets.filter((s) => s.id !== id);
    setSnippets(updated);
    try {
      const customs = updated.filter((s) => s.isCustom);
      localStorage.setItem("logic_snippets_custom", JSON.stringify(customs));
    } catch (err) {
      // ignore
    }
  };

  const handleDragStart = (e: React.DragEvent, snip: CodeSnippetTemplate) => {
    e.dataTransfer.setData("application/logic-snippet", JSON.stringify(snip));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleApply = (snippet: CodeSnippetTemplate) => {
    onInsertSnippet(snippet);
    setCopiedId(snippet.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredSnippets = snippets.filter((s) => {
    if (selectedCategory !== "all") {
      if (selectedCategory === "custom" && !s.isCustom) return false;
      if (selectedCategory !== "custom" && s.category !== selectedCategory) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden text-slate-300">
      {/* Save Action Banner */}
      <div className="p-2.5 border-b border-slate-800 bg-slate-900/40">
        {!isSaving ? (
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => setIsSaving(true)}
              className="w-full py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer hover:border-indigo-400"
            >
              <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {selectedNodes.length > 0
                  ? `Save Selection (${selectedNodes.length} nodes) as Snippet`
                  : `Save Current Flow (${currentNodes.length} nodes) as Snippet`}
              </span>
            </button>
            {selectedNodes.length > 0 && (
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-mono">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckSquare className="w-3 h-3" /> {selectedNodes.length} nodes selected
                </span>
                <span className="text-slate-500">{targetEdgesToSave.length} connected edges</span>
              </div>
            )}
          </div>
        ) : (
          <form
            onSubmit={handleSaveCustom}
            className="space-y-2 p-2.5 bg-slate-950 rounded-xl border border-indigo-500/40 shadow-xl"
          >
            <div className="text-xs font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-1 text-indigo-300">
                <Bookmark className="w-3.5 h-3.5" /> Save Named Template
              </span>
              <button
                type="button"
                onClick={() => setIsSaving(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Saving {targetNodesToSave.length} node{targetNodesToSave.length === 1 ? "" : "s"} and{" "}
              {targetEdgesToSave.length} edge{targetEdgesToSave.length === 1 ? "" : "s"}
            </div>
            <input
              type="text"
              placeholder="Template Name (e.g. Validation Guard, Auth Flow)"
              value={snippetName}
              onChange={(e) => setSnippetName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              autoFocus
            />
            <input
              type="text"
              placeholder="Description (Optional)"
              value={snippetDesc}
              onChange={(e) => setSnippetDesc(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
            />
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsSaving(false)}
                className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!snippetName.trim()}
                className="flex-1 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Template</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Category Filter Pills & Search */}
      <div className="p-2 border-b border-slate-800 space-y-1.5 bg-slate-900/20">
        <div className="relative">
          <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-lg pl-7 pr-2 py-1 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[10px] font-semibold no-scrollbar">
          {[
            { id: "all", label: "All" },
            { id: "custom", label: "My Snippets" },
            { id: "network", label: "Network" },
            { id: "validation", label: "Validation" },
            { id: "state", label: "State" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2 py-0.5 rounded-md whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-indigo-600 text-white font-bold"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Snippet Template Cards (Draggable!) */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
          <span>Drag onto Canvas or Click Add</span>
          <span>{filteredSnippets.length}</span>
        </div>

        {filteredSnippets.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            No snippets found matching your query.
          </div>
        ) : (
          filteredSnippets.map((snip) => {
            const isCopied = copiedId === snip.id;
            const nodeCount = snip.nodes?.length || 0;
            const edgeCount = snip.edges?.length || 0;

            return (
              <div
                key={snip.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, snip)}
                className="group relative p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/60 transition shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing select-none"
                title="Drag onto canvas or click Insert"
              >
                {/* Drag Grip + Header */}
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition shrink-0" />
                    <span className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition">
                      {snip.name}
                    </span>
                    {snip.isCustom && (
                      <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Custom
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {snip.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCustom(snip.id, e)}
                        title="Delete custom template"
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleApply(snip)}
                      title="Insert Template into Flow"
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                        isCopied
                          ? "bg-emerald-600 text-white"
                          : "bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3" /> Added
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" /> Add
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[11px] text-slate-400 line-clamp-2 pl-5">
                  {snip.description}
                </p>

                {/* Meta details: Node count & tags */}
                <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 pl-5">
                  <span className="flex items-center gap-1 font-mono text-slate-400">
                    <Layers className="w-3 h-3 text-indigo-400" />
                    {nodeCount} node{nodeCount === 1 ? "" : "s"}
                    {edgeCount > 0 ? ` • ${edgeCount} edge${edgeCount === 1 ? "" : "s"}` : ""}
                  </span>
                  <span className="text-slate-400 font-mono text-[9px]">
                    Drag to canvas ↘
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
