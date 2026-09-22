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
import { AndroidComponent, AndroidScreen, ScreenProperties } from "../../types";
import { ScreenPropertiesTab } from "./Properties/ScreenPropertiesTab";
import { ComponentPropertiesTab } from "./Properties/ComponentPropertiesTab";

interface PropertiesPanelProps {
  selectedComponent: AndroidComponent | null;
  currentScreen: AndroidScreen;
  onUpdateComponentProps: (id: string, newProps: Record<string, any>) => void;
  onUpdateComponentName: (id: string, newName: string) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
  onOpenLogicEditorForComponent: (componentId: string) => void;
  onUpdateScreenProperties: (screenId: string, props: Partial<ScreenProperties>) => void;
  onUpdateScreenTitle: (screenId: string, title: string) => void;
  onDeselectComponent?: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedComponent,
  currentScreen,
  onUpdateComponentProps,
  onUpdateComponentName,
  onDeleteComponent,
  onDuplicateComponent,
  onOpenLogicEditorForComponent,
  onUpdateScreenProperties,
  onUpdateScreenTitle,
  onDeselectComponent,
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
  }, [selectedComponent?.id]);

  return (
    <aside
      id="properties-panel-sidebar"
      className="w-80 bg-white border-l border-slate-200/80 flex flex-col h-full shrink-0 select-none text-slate-800"
    >
      {/* 1. Header with Mode Tabs: [ Screen ] vs [ Component ] */}
      <div className="p-3 border-b border-slate-200/70 bg-white sticky top-0 z-10 backdrop-blur-md space-y-2">
        {/* Dual Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveView("screen")}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeView === "screen"
                ? "bg-white text-violet-700 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Screen Container</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (selectedComponent) setActiveView("component");
            }}
            disabled={!selectedComponent}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeView === "component"
                ? "bg-white text-violet-700 shadow-xs"
                : selectedComponent
                ? "text-slate-500 hover:text-slate-800"
                : "text-slate-300 cursor-not-allowed"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Component</span>
          </button>
        </div>

        {/* Quick action strip for selected component */}
        {activeView === "component" && selectedComponent && (
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-slate-900 truncate max-w-[130px]">
                {selectedComponent.name}
              </span>
            </div>

            <div className="flex items-center gap-1">
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
          />
        ) : selectedComponent ? (
          <ComponentPropertiesTab
            component={selectedComponent}
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
