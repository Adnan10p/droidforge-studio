import React from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Play,
  Square,
  Sparkles,
  Sliders,
  Code2,
  RefreshCw,
  Plus,
  HelpCircle,
  Smartphone,
  Layers,
  Search,
  Network,
  Wand2,
  Bug,
  StepForward,
} from "lucide-react";
import { AndroidScreen } from "../../types";

interface ToolbarProps {
  currentScreen: AndroidScreen;
  screens: AndroidScreen[];
  onSelectScreen?: (screenId: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onAutoLayout: () => void;
  isSimulating: boolean;
  isSimulationPaused?: boolean;
  onToggleSimulation: () => void;
  onResumeSimulation?: () => void;
  onStepSimulation?: () => void;
  onOpenVariables: () => void;
  onOpenCodePreview: () => void;
  onAddTrigger: () => void;
  onOpenSearch?: () => void;
  totalBlocks: number;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentScreen,
  screens,
  onSelectScreen,
  onZoomIn,
  onZoomOut,
  onFitView,
  onAutoLayout,
  isSimulating,
  isSimulationPaused = false,
  onToggleSimulation,
  onResumeSimulation,
  onStepSimulation,
  onOpenVariables,
  onOpenCodePreview,
  onAddTrigger,
  onOpenSearch,
  totalBlocks,
}) => {
  return (
    <header className="h-12 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between gap-2 select-none text-slate-200 z-10">
      {/* Left: Screen Identity & Status */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
          <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400">Screen:</span>
          {screens.length > 1 && onSelectScreen ? (
            <select
              value={currentScreen.id}
              onChange={(e) => onSelectScreen(e.target.value)}
              className="bg-transparent text-white font-bold cursor-pointer focus:outline-none"
            >
              {screens.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                  {s.title || s.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-white font-bold truncate max-w-[140px]">
              {currentScreen.title || currentScreen.name}
            </span>
          )}
        </div>

        <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 font-mono px-2 py-0.5 rounded-md bg-slate-950/60 border border-slate-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>{totalBlocks} Flow Trigger{totalBlocks === 1 ? "" : "s"}</span>
        </div>
      </div>

      {/* Center: Canvas Viewport Navigation & Auto-Layout */}
      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-2xs">
        <button
          type="button"
          onClick={onZoomIn}
          title="Zoom In"
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          title="Zoom Out"
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onFitView}
          title="Fit All Nodes into View"
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-800 mx-0.5" />
        <button
          type="button"
          onClick={onAutoLayout}
          title="Auto-Arrange Flow (Force-directed graph layout to prevent node overlap)"
          className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
        >
          <Network className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Auto-Arrange Flow</span>
        </button>
      </div>

      {/* Right: Search, Simulation, State Variables & Code Preview */}
      <div className="flex items-center gap-1.5">
        {/* Global Search (Ctrl+F) Button */}
        {onOpenSearch && (
          <button
            type="button"
            onClick={onOpenSearch}
            title="Global Search Flow Nodes, Variables & Components (Ctrl+F)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            <Search className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden xl:inline">Find</span>
            <kbd className="hidden sm:inline px-1 py-0.2 text-[9px] font-mono bg-slate-900 border border-slate-700 rounded text-slate-400">
              Ctrl+F
            </kbd>
          </button>
        )}

        {/* + Add Trigger Fast Action */}
        <button
          type="button"
          onClick={onAddTrigger}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold transition shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Trigger</span>
        </button>

        {/* State Variables Button */}
        <button
          type="button"
          onClick={onOpenVariables}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition cursor-pointer"
          title="Manage Screen State Variables"
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden md:inline">Variables</span>
          {(currentScreen.stateVariables || []).length > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono flex items-center justify-center font-bold">
              {currentScreen.stateVariables?.length}
            </span>
          )}
        </button>

        {/* Live Simulation Runner & Breakpoint Controls */}
        {isSimulating && isSimulationPaused ? (
          <div className="flex items-center gap-1 bg-slate-900 border border-rose-500/60 p-0.5 rounded-xl shadow-xs">
            <button
              type="button"
              onClick={onResumeSimulation}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              title="Resume simulation until next breakpoint"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume</span>
            </button>
            <button
              type="button"
              onClick={onStepSimulation}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              title="Step into next node"
            >
              <StepForward className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Step</span>
            </button>
            <button
              type="button"
              onClick={onToggleSimulation}
              className="p-1.5 rounded-lg hover:bg-rose-600/30 text-rose-400 hover:text-rose-200 transition cursor-pointer"
              title="Stop simulation"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onToggleSimulation}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm ${
              isSimulating
                ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
            }`}
            title={isSimulating ? "Stop Simulation" : "Simulate Flow Execution"}
          >
            {isSimulating ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Simulate Flow</span>
              </>
            )}
          </button>
        )}

        {/* Kotlin Compose Code Drawer Toggle */}
        <button
          type="button"
          onClick={onOpenCodePreview}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition cursor-pointer"
          title="Preview Generated Kotlin Code"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Compose Code</span>
        </button>
      </div>
    </header>
  );
};
