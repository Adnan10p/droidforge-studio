import { FlowNode, FlowEdge } from "./types";
import { AndroidScreen, AndroidComponent, StateVariable } from "../../types";

export interface FlowValidationError {
  id: string;
  type: "missing_component" | "missing_variable" | "missing_screen" | "broken_connection" | "empty_condition";
  severity: "error" | "warning";
  nodeId: string;
  title: string;
  description: string;
  category: "MISSING COMPONENT" | "MISSING VARIABLE" | "MISSING SCREEN" | "BROKEN FLOW";
  actionText: string;
  quickFixType: "declare_variable" | "change_component" | "fix_screen";
  targetName?: string;
}

/**
 * Performs real-time static analysis on logic flow nodes and edges
 */
export function analyzeFlow(
  nodes: FlowNode[],
  edges: FlowEdge[],
  components: AndroidComponent[],
  screens: AndroidScreen[],
  stateVariables: StateVariable[] = []
): FlowValidationError[] {
  const errors: FlowValidationError[] = [];
  const compIdSet = new Set(components.map((c) => c.id));
  const compNameSet = new Set(components.map((c) => c.name.toLowerCase()));
  const varNameSet = new Set(stateVariables.map((v) => v.name));
  const screenIdSet = new Set((screens || []).map((s) => s.id));
  const screenNameSet = new Set((screens || []).map((s) => s.name.toLowerCase()));

  // Analyze each node
  nodes.forEach((node) => {
    const data = node.data as any;

    // 1. Trigger Node Validation
    if (node.type === "trigger") {
      const compId = data.componentId;
      const compName = data.componentName || compId;
      if (
        compId &&
        !compIdSet.has(compId) &&
        !compNameSet.has(String(compName).toLowerCase()) &&
        compId !== "screen" &&
        compId !== "system"
      ) {
        errors.push({
          id: `err_trig_comp_${node.id}`,
          type: "missing_component",
          severity: "error",
          nodeId: node.id,
          title: "Missing Component Target",
          description: `Trigger references component "${compName}" (${compId}), which no longer exists in this screen layout.`,
          category: "MISSING COMPONENT",
          actionText: "Change Component",
          quickFixType: "change_component",
          targetName: compName,
        });
      }
    }

    // 2. Action Node Validation
    if (node.type === "action") {
      const action = data.action || {};

      // Property Setter / Target component check
      if (
        action.actionType === "setProperty" &&
        action.targetId &&
        !action.conditionEnabled &&
        !compIdSet.has(action.targetId) &&
        !compNameSet.has(String(action.targetId).toLowerCase())
      ) {
        errors.push({
          id: `err_act_comp_${node.id}`,
          type: "missing_component",
          severity: "error",
          nodeId: node.id,
          title: "Missing Component Target",
          description: `Action targets component "${action.targetId}", which no longer exists in screen layout.`,
          category: "MISSING COMPONENT",
          actionText: "Change Component",
          quickFixType: "change_component",
          targetName: action.targetId,
        });
      }

      // State Variable Setter check
      if (action.actionType === "setVariable" && action.variableName) {
        const varName = action.variableName;
        if (!varNameSet.has(varName)) {
          errors.push({
            id: `err_act_var_${node.id}`,
            type: "missing_variable",
            severity: "error",
            nodeId: node.id,
            title: "Undeclared Variable",
            description: `Variable "${varName}" is referenced but does not exist in State Variables.`,
            category: "MISSING VARIABLE",
            actionText: `Declare variable "${varName}"`,
            quickFixType: "declare_variable",
            targetName: varName,
          });
        }
      }

      // Navigation Target Screen check
      if (action.actionType === "navigate" && action.targetScreen) {
        const tgtScreen = action.targetScreen;
        if (!screenIdSet.has(tgtScreen) && !screenNameSet.has(String(tgtScreen).toLowerCase())) {
          errors.push({
            id: `err_act_scr_${node.id}`,
            type: "missing_screen",
            severity: "error",
            nodeId: node.id,
            title: "Missing Target Screen",
            description: `Navigation action references screen "${tgtScreen}", which does not exist in project.`,
            category: "MISSING SCREEN",
            actionText: "Set Target Screen",
            quickFixType: "fix_screen",
            targetName: tgtScreen,
          });
        }
      }
    }

    // 3. Condition Node Validation
    if (node.type === "condition") {
      const cond = data.condition || {};
      const leftOperand = cond.left || "";
      // Check if left operand references a variable name before dot or direct
      const rootVar = leftOperand.split(".")[0];
      if (
        rootVar &&
        !varNameSet.has(rootVar) &&
        !compIdSet.has(rootVar) &&
        !compNameSet.has(rootVar.toLowerCase()) &&
        rootVar !== "input" &&
        rootVar !== "screen"
      ) {
        errors.push({
          id: `err_cond_var_${node.id}`,
          type: "missing_variable",
          severity: "warning",
          nodeId: node.id,
          title: "Undeclared Reference in Condition",
          description: `Condition references operand "${rootVar}", which is not declared in State Variables.`,
          category: "MISSING VARIABLE",
          actionText: `Declare variable "${rootVar}"`,
          quickFixType: "declare_variable",
          targetName: rootVar,
        });
      }

      // Check unhandled output branches
      const outEdges = edges.filter((e) => e.source === node.id);
      if (outEdges.length === 0) {
        errors.push({
          id: `err_cond_unhandled_${node.id}`,
          type: "broken_connection",
          severity: "warning",
          nodeId: node.id,
          title: "Unhandled Decision Branch",
          description: `Decision condition "${data.title || "Check"}" has no connected YES or NO branches.`,
          category: "BROKEN FLOW",
          actionText: "Connect Branch",
          quickFixType: "change_component",
        });
      }
    }
  });

  return errors;
}
