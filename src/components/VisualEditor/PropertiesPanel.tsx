import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Layers,
  Trash2,
  Copy,
  Info,
  X,
  Sliders,
} from "lucide-react";
import { AndroidComponent, AndroidScreen, ScreenProperties, ProjectAsset } from "../../types";
import { ScreenPropertiesTab } from "./Properties/ScreenPropertiesTab";
import { ComponentPropertiesTab } from "./Properties/ComponentPropertiesTab";

interface PropertiesPanelProps {
  selectedComponent: AndroidComponent | null;
  currentScreen: AndroidScreen;
  assets?: ProjectAsset[];
  onUpdateComponentProps: (id: string, newProps: Record<string, any>) => void;
  onUpdateComponentName: (id: string, newName: string) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
  onOpenLogicEditorForComponent: (componentId: string) => void;
  onUpdateScreenProperties: (screenId: string, props: Partial<ScreenProperties>) => void;
  onUpdateScreenTitle: (screenId: string, title: string) => void;
  onDeselectComponent?: () => void;
  onDeleteScreen?: (screenId: string) => void;
  onDuplicateScreen?: (screenId: string) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedComponent,
  currentScreen,
  assets,
  onUpdateComponentProps,
  onUpdateComponentName,
  onDeleteComponent,
  onDuplicateComponent,
  onOpenLogicEditorForComponent,
  onUpdateScreenProperties,
  onUpdateScreenTitle,
  onDeselectComponent,
  onDeleteScreen,
  onDuplicateScreen,
}) => {
  // Determine active view: "component" vs "screen"
  const [activeView, setActiveView] = useState<"screen" | "component">(
    selectedComponent ? "component" : "screen"
  );

  // Automatically switch to component view whenever a component is selected
  useEffect(() => {
    if (selectedComponent) {
      setActiveView("component");
    } else {
      setActiveView("screen");
    }
  }, [selectedComponent]);

  return (
    <aside
      id="properties-panel-sidebar"
      style={{
        backgroundColor: "var(--ide-card-bg)",
        borderColor: "var(--ide-border)",
        color: "var(--ide-text)",
      }}
      className="w-80 border-l flex flex-col h-full shrink-0 select-none"
    >
      {/* 1. Header with Mode Tabs: [ Screen ] vs [ Component ] */}
      <div
        style={{
          backgroundColor: "var(--ide-card-bg)",
          borderColor: "var(--ide-border)",
        }}
        className="p-3 border-b sticky top-0 z-10 space-y-2"
      >
        {/* Dual Tab Switcher */}
        <div
          style={{
            backgroundColor: "var(--ide-card-inner-bg)",
            borderColor: "var(--ide-border)",
          }}
          className="flex items-center p-1 rounded-xl border"
        >
          <button
            type="button"
            onClick={() => setActiveView("screen")}
            style={{
              backgroundColor: activeView === "screen" ? "var(--ide-card-bg)" : "transparent",
              color: activeView === "screen" ? "var(--ide-text)" : "var(--ide-text-muted)",
            }}
            className="flex-1 py-1.5 px-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-violet-400" />
            <span>Screen Container</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (selectedComponent) setActiveView("component");
            }}
            disabled={!selectedComponent}
            style={{
              backgroundColor: activeView === "component" ? "var(--ide-card-bg)" : "transparent",
              color: activeView === "component" ? "var(--ide-text)" : "var(--ide-text-muted)",
            }}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
              selectedComponent ? "cursor-pointer" : "opacity-40 cursor-not-allowed"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-violet-400" />
            <span>Component</span>
          </button>
        </div>

        {/* Quick action strip for selected component */}
        {activeView === "component" && selectedComponent && (
          <div className="flex items-center justify-between pt-1 gap-2 min-w-0">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-100 text-violet-800 font-bold shrink-0 max-w-[110px] truncate"
                title={selectedComponent.type}
              >
                {selectedComponent.type}
              </span>
              <input
                type="text"
                value={selectedComponent.name}
                onChange={(e) => onUpdateComponentName(selectedComponent.id, e.target.value)}
                className="text-xs font-mono font-bold bg-transparent border border-transparent hover:border-slate-700 focus:border-violet-500 rounded px-1.5 py-0.5 outline-none truncate min-w-0 flex-1"
                style={{ color: "var(--ide-text)", backgroundColor: "var(--ide-card-inner-bg)" }}
                title="Click to rename component"
              />
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onDuplicateComponent(selectedComponent.id)}
                title="Duplicate Component"
                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onDeleteComponent(selectedComponent.id)}
                title="Delete Component"
                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {onDeselectComponent && (
                <button
                  type="button"
                  onClick={onDeselectComponent}
                  title="Deselect to view Screen Properties"
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Scrollable Body: Renders Screen or Component tab */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-200">
        {activeView === "screen" ? (
          <ScreenPropertiesTab
            screen={currentScreen}
            onUpdateScreenProperties={onUpdateScreenProperties}
            onUpdateScreenTitle={onUpdateScreenTitle}
            onDeleteScreen={onDeleteScreen}
            onDuplicateScreen={onDuplicateScreen}
          />
        ) : selectedComponent ? (
          <ComponentPropertiesTab
            component={selectedComponent}
            assets={assets}
            onUpdateProps={(newProps) => onUpdateComponentProps(selectedComponent.id, newProps)}
            onUpdateName={(newName) => onUpdateComponentName(selectedComponent.id, newName)}
            onOpenLogicEditor={onOpenLogicEditorForComponent}
            isRootComponent={selectedComponent.id === currentScreen.rootComponent.id}
            onSwitchToScreenProperties={() => setActiveView("screen")}
          />
        ) : (
          <div className="p-6 text-center text-slate-400 space-y-2">
            <Info className="w-6 h-6 mx-auto text-slate-300" />
            <p className="text-xs">No component selected. Click any component on canvas.</p>
          </div>
        )}
      </div>
    </aside>
  );
};
