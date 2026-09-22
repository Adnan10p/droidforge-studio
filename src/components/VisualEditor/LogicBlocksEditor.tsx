import React from "react";
import {
  AndroidScreen,
  LogicBlock,
  StateVariable,
  BuilderIdeSettings,
} from "../../types";
import { LogicFlowEditor } from "../LogicEditor/LogicFlowEditor";

export interface LogicBlocksEditorProps {
  screen: AndroidScreen;
  screens: AndroidScreen[];
  onAddLogicBlock?: (block: LogicBlock) => void;
  onUpdateLogicBlock?: (block: LogicBlock) => void;
  onDeleteLogicBlock?: (blockId: string) => void;
  onOpenAiAssistant?: (prompt?: string) => void;
  targetComponentId?: string | null;
  onUpdateStateVariables?: (vars: StateVariable[]) => void;
  builderSettings?: BuilderIdeSettings;
  onUpdateScreen?: (updated: AndroidScreen) => void;
  onSelectScreen?: (screenId: string) => void;
}

/**
 * Visual Logic & Event Flow Studio powered by @xyflow/react
 * Replaces old form/dropdown interaction model with true visual drag & drop nodes,
 * connecting wires, conditions, decisions, and action sequences.
 */
export const LogicBlocksEditor: React.FC<LogicBlocksEditorProps> = ({
  screen,
  screens,
  onAddLogicBlock,
  onUpdateLogicBlock,
  onDeleteLogicBlock,
  targetComponentId,
  onUpdateStateVariables,
  builderSettings,
  onUpdateScreen,
  onSelectScreen,
}) => {
  const handleUpdateScreen = (updated: AndroidScreen) => {
    if (onUpdateScreen) {
      onUpdateScreen(updated);
    } else {
      if (onUpdateStateVariables && updated.stateVariables) {
        onUpdateStateVariables(updated.stateVariables);
      }
      if (updated.logicBlocks && onUpdateLogicBlock) {
        updated.logicBlocks.forEach((block) => onUpdateLogicBlock(block));
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden select-none">
      <LogicFlowEditor
        screen={screen}
        screens={screens}
        onUpdateScreen={handleUpdateScreen}
        targetComponentId={targetComponentId}
        onSelectScreen={onSelectScreen}
        builderSettings={builderSettings}
      />
    </div>
  );
};
