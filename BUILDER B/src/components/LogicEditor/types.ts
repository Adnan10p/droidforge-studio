import { Node, Edge } from "@xyflow/react";
import {
  LogicBlock,
  LogicAction,
  LogicCondition,
  AndroidComponent,
  AndroidScreen,
  StateVariable,
} from "../../types";

export type LogicNodeType = "trigger" | "action" | "condition" | "apiBranch" | "note";

export type TriggerNodeData = {
  blockId: string;
  componentId: string;
  componentName: string;
  event: string;
  eventCategory?: string;
  description?: string;
  enabled?: boolean;
  componentsList: Array<{ id: string; name: string; type: string }>;
  availableEvents: string[];
  [key: string]: any;
};

export type ActionNodeData = {
  blockId: string;
  actionId: string;
  action: LogicAction;
  componentsList: Array<{ id: string; name: string; type: string }>;
  screensList: Array<{ id: string; name: string; title: string }>;
  stateVariables: StateVariable[];
  [key: string]: any;
};

export type ConditionNodeData = {
  blockId: string;
  actionId?: string;
  title: string;
  condition: LogicCondition;
  componentsList: Array<{ id: string; name: string; type: string }>;
  stateVariables: StateVariable[];
  [key: string]: any;
};

export type ApiBranchNodeData = {
  blockId: string;
  actionId: string;
  action: LogicAction;
  screensList: Array<{ id: string; name: string; title: string }>;
  stateVariables: StateVariable[];
  [key: string]: any;
};

export type NoteNodeData = {
  title: string;
  text: string;
  color?: "yellow" | "blue" | "purple" | "emerald";
  [key: string]: any;
};

export type FlowNodeData =
  | TriggerNodeData
  | ActionNodeData
  | ConditionNodeData
  | ApiBranchNodeData
  | NoteNodeData;

export type FlowNode = Node<FlowNodeData>;

export type FlowEdge = Edge;

export interface FlowToolboxItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "trigger" | "action" | "condition" | "network" | "hardware" | "navigation";
  actionType?: LogicAction["actionType"];
  eventType?: string;
  iconName: string;
  defaultData: Record<string, any>;
  badgeColor: string;
}
