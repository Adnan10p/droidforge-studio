import { Node, Edge, MarkerType } from "@xyflow/react";
import {
  LogicBlock,
  LogicAction,
  AndroidScreen,
  AndroidComponent,
  StateVariable,
} from "../../types";
import { FlowNode, FlowEdge } from "./types";

/**
 * Converts screen.logicBlocks into ReactFlow nodes and edges
 */
export function convertBlocksToFlow(
  logicBlocks: LogicBlock[],
  components: AndroidComponent[],
  screens: AndroidScreen[],
  stateVariables: StateVariable[] = []
): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];

  const usedNodeIds = new Set<string>();
  const makeUniqueNodeId = (baseId: string): string => {
    let finalId = baseId;
    let counter = 1;
    while (usedNodeIds.has(finalId)) {
      finalId = `${baseId}__${counter++}`;
    }
    usedNodeIds.add(finalId);
    return finalId;
  };

  const usedEdgeIds = new Set<string>();
  const makeUniqueEdgeId = (baseId: string): string => {
    let finalId = baseId;
    let counter = 1;
    while (usedEdgeIds.has(finalId)) {
      finalId = `${baseId}__${counter++}`;
    }
    usedEdgeIds.add(finalId);
    return finalId;
  };

  const componentsList = components.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
  }));

  const screensList = screens.map((s) => ({
    id: s.id,
    name: s.name,
    title: s.title || s.name,
  }));

  let blockStartX = 80;

  (logicBlocks || []).forEach((block, bIndex) => {
    // 1. Create Trigger Node
    const triggerId = makeUniqueNodeId(`trigger_${block.id}`);
    const triggerX = block.position?.x ?? blockStartX;
    const triggerY = block.position?.y ?? 60;

    nodes.push({
      id: triggerId,
      type: "trigger",
      position: { x: triggerX, y: triggerY },
      data: {
        blockId: block.id,
        componentId: block.componentId,
        componentName: block.componentName || "Component",
        event: block.event || "Click",
        eventCategory: block.eventCategory,
        description: block.description,
        enabled: block.enabled !== false,
        componentsList,
        availableEvents: ["Click", "LongClick", "OnCreate", "TextChanged", "ValueChanged"],
      },
    });

    let prevNodeId = triggerId;
    let prevHandleId: string | undefined = "trigger-out";
    let currentY = triggerY + 160;

    // 2. Iterate Actions and build chain / branches
    (block.actions || []).forEach((action, aIndex) => {
      // If action has conditionEnabled or is a condition decision
      if (action.conditionEnabled && action.condition) {
        const condId = makeUniqueNodeId(`cond_${action.id}`);
        nodes.push({
          id: condId,
          type: "condition",
          position: {
            x: action.position?.x ?? triggerX - 40,
            y: action.position?.y ?? currentY,
          },
          data: {
            blockId: block.id,
            actionId: action.id,
            title: `${action.condition.left} ${action.condition.operator}?`,
            condition: action.condition,
            componentsList,
            stateVariables,
          },
        });

        // Edge from previous node to condition
        edges.push({
          id: makeUniqueEdgeId(`edge_${prevNodeId}_to_${condId}`),
          source: prevNodeId,
          target: condId,
          sourceHandle: prevHandleId,
          targetHandle: "condition-in",
          type: "smoothstep",
          animated: false,
          style: { stroke: "#C084FC", strokeWidth: 2.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#C084FC" },
        });

        currentY += 210;

        // Sub-actions on YES branch
        if (action.subActions && action.subActions.length > 0) {
          action.subActions.forEach((subAct, sIdx) => {
            const subId = makeUniqueNodeId(`action_sub_${subAct.id}`);
            nodes.push({
              id: subId,
              type: "action",
              position: {
                x: subAct.position?.x ?? triggerX - 160,
                y: subAct.position?.y ?? currentY + sIdx * 170,
              },
              data: {
                blockId: block.id,
                actionId: subAct.id,
                action: subAct,
                componentsList,
                screensList,
                stateVariables,
              },
            });

            edges.push({
              id: makeUniqueEdgeId(`edge_${condId}_yes_to_${subId}`),
              source: condId,
              target: subId,
              sourceHandle: "branch-yes",
              targetHandle: "action-in",
              type: "smoothstep",
              label: "YES ✓",
              labelStyle: { fill: "#34D399", fontWeight: 800, fontSize: 11 },
              style: { stroke: "#10B981", strokeWidth: 2.5 },
              markerEnd: { type: MarkerType.ArrowClosed, color: "#10B981" },
            });
          });
        }

        // Sub-actions on NO / ELSE branch
        if (action.elseActions && action.elseActions.length > 0) {
          action.elseActions.forEach((elseAct, eIdx) => {
            const elseId = makeUniqueNodeId(`action_else_${elseAct.id}`);
            nodes.push({
              id: elseId,
              type: "action",
              position: {
                x: elseAct.position?.x ?? triggerX + 160,
                y: elseAct.position?.y ?? currentY + eIdx * 170,
              },
              data: {
                blockId: block.id,
                actionId: elseAct.id,
                action: elseAct,
                componentsList,
                screensList,
                stateVariables,
              },
            });

            edges.push({
              id: makeUniqueEdgeId(`edge_${condId}_no_to_${elseId}`),
              source: condId,
              target: elseId,
              sourceHandle: "branch-no",
              targetHandle: "action-in",
              type: "smoothstep",
              label: "NO ✕",
              labelStyle: { fill: "#FB7185", fontWeight: 800, fontSize: 11 },
              style: { stroke: "#F43F5E", strokeWidth: 2.5 },
              markerEnd: { type: MarkerType.ArrowClosed, color: "#F43F5E" },
            });
          });
        }

        prevNodeId = condId;
        prevHandleId = undefined;
        currentY += 190;
        return;
      }

      // Check if action is Call API with branching
      if (action.actionType === "callApi" && (action.subActions?.length || action.elseActions?.length)) {
        const apiNodeId = makeUniqueNodeId(`api_${action.id}`);
        nodes.push({
          id: apiNodeId,
          type: "apiBranch",
          position: {
            x: action.position?.x ?? triggerX,
            y: action.position?.y ?? currentY,
          },
          data: {
            blockId: block.id,
            actionId: action.id,
            action,
            screensList,
            stateVariables,
          },
        });

        edges.push({
          id: makeUniqueEdgeId(`edge_${prevNodeId}_to_${apiNodeId}`),
          source: prevNodeId,
          target: apiNodeId,
          sourceHandle: prevHandleId,
          targetHandle: "api-in",
          type: "smoothstep",
          style: { stroke: "#38BDF8", strokeWidth: 2.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#38BDF8" },
        });

        currentY += 210;

        // Success branch
        if (action.subActions && action.subActions.length > 0) {
          action.subActions.forEach((sAct, sIdx) => {
            const sId = makeUniqueNodeId(`action_succ_${sAct.id}`);
            nodes.push({
              id: sId,
              type: "action",
              position: {
                x: sAct.position?.x ?? triggerX - 150,
                y: sAct.position?.y ?? currentY + sIdx * 170,
              },
              data: {
                blockId: block.id,
                actionId: sAct.id,
                action: sAct,
                componentsList,
                screensList,
                stateVariables,
              },
            });

            edges.push({
              id: makeUniqueEdgeId(`edge_${apiNodeId}_succ_to_${sId}`),
              source: apiNodeId,
              target: sId,
              sourceHandle: "branch-success",
              targetHandle: "action-in",
              type: "smoothstep",
              label: "Success ✓",
              labelStyle: { fill: "#34D399", fontWeight: 800, fontSize: 11 },
              style: { stroke: "#10B981", strokeWidth: 2.5 },
              markerEnd: { type: MarkerType.ArrowClosed, color: "#10B981" },
            });
          });
        }

        // Failure branch
        if (action.elseActions && action.elseActions.length > 0) {
          action.elseActions.forEach((eAct, eIdx) => {
            const eId = makeUniqueNodeId(`action_fail_${eAct.id}`);
            nodes.push({
              id: eId,
              type: "action",
              position: {
                x: eAct.position?.x ?? triggerX + 150,
                y: eAct.position?.y ?? currentY + eIdx * 170,
              },
              data: {
                blockId: block.id,
                actionId: eAct.id,
                action: eAct,
                componentsList,
                screensList,
                stateVariables,
              },
            });

            edges.push({
              id: makeUniqueEdgeId(`edge_${apiNodeId}_fail_to_${eId}`),
              source: apiNodeId,
              target: eId,
              sourceHandle: "branch-failure",
              targetHandle: "action-in",
              type: "smoothstep",
              label: "Error ✕",
              labelStyle: { fill: "#FB7185", fontWeight: 800, fontSize: 11 },
              style: { stroke: "#F43F5E", strokeWidth: 2.5 },
              markerEnd: { type: MarkerType.ArrowClosed, color: "#F43F5E" },
            });
          });
        }

        prevNodeId = apiNodeId;
        prevHandleId = undefined;
        currentY += 190;
        return;
      }

      // Standard linear Action Node
      const actionNodeId = makeUniqueNodeId(`action_${action.id}`);
      nodes.push({
        id: actionNodeId,
        type: "action",
        position: {
          x: action.position?.x ?? triggerX,
          y: action.position?.y ?? currentY,
        },
        data: {
          blockId: block.id,
          actionId: action.id,
          action,
          componentsList,
          screensList,
          stateVariables,
        },
      });

      // Connect from previous node to this action node
      if (prevNodeId) {
        edges.push({
          id: makeUniqueEdgeId(`edge_${prevNodeId}_to_${actionNodeId}`),
          source: prevNodeId,
          target: actionNodeId,
          sourceHandle: prevHandleId,
          targetHandle: "action-in",
          type: "smoothstep",
          animated: false,
          style: { stroke: "#60A5FA", strokeWidth: 2.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#60A5FA" },
        });
      }

      prevNodeId = actionNodeId;
      prevHandleId = "action-out";
      currentY += 170;
    });

    // Advance X for next trigger block
    blockStartX += 420;
  });

  return { nodes, edges };
}

/**
 * Converts ReactFlow nodes and edges back into clean LogicBlock[]
 */
export function convertFlowToBlocks(
  nodes: FlowNode[],
  edges: FlowEdge[]
): LogicBlock[] {
  // 1. Group by triggers
  const triggerNodes = nodes.filter((n) => n.type === "trigger");
  const blocks: LogicBlock[] = [];

  triggerNodes.forEach((tNode) => {
    const tData = tNode.data as any;
    const blockId = tData.blockId || tNode.id.replace("trigger_", "");

    // Build the actions list by traversing outgoing edges from trigger
    const actions: LogicAction[] = [];

    // Helper to find targets connected to a node
    const getConnectedTargets = (sourceId: string, handleFilter?: string) => {
      return edges
        .filter((e) => e.source === sourceId && (!handleFilter || e.sourceHandle === handleFilter))
        .map((e) => nodes.find((n) => n.id === e.target))
        .filter(Boolean) as FlowNode[];
    };

    // Traverse chain
    const visited = new Set<string>();
    const queue: Array<{ node: FlowNode; branch?: string }> = [];

    const immediateTargets = getConnectedTargets(tNode.id);
    immediateTargets.forEach((tgt) => queue.push({ node: tgt }));

    while (queue.length > 0) {
      const item = queue.shift()!;
      const curr = item.node;
      if (visited.has(curr.id)) continue;
      visited.add(curr.id);

      const cData = curr.data as any;

      if (curr.type === "action") {
        const act: LogicAction = {
          ...(cData.action || {}),
          id: cData.actionId || curr.id.replace("action_", ""),
          position: curr.position,
        };
        actions.push(act);

        // Find next action
        const nexts = getConnectedTargets(curr.id, "action-out");
        nexts.forEach((nxt) => queue.push({ node: nxt }));
      } else if (curr.type === "condition") {
        // Condition decision node
        const yesTargets = getConnectedTargets(curr.id, "branch-yes");
        const noTargets = getConnectedTargets(curr.id, "branch-no");

        const subActions: LogicAction[] = yesTargets
          .filter((n) => n.type === "action")
          .map((n) => ({
            ...((n.data as any).action || {}),
            id: (n.data as any).actionId || n.id.replace("action_", ""),
            position: n.position,
          }));

        const elseActions: LogicAction[] = noTargets
          .filter((n) => n.type === "action")
          .map((n) => ({
            ...((n.data as any).action || {}),
            id: (n.data as any).actionId || n.id.replace("action_", ""),
            position: n.position,
          }));

        const conditionAction: LogicAction = {
          id: cData.actionId || curr.id.replace("cond_", ""),
          actionType: "setProperty",
          conditionEnabled: true,
          condition: cData.condition,
          position: curr.position,
          subActions,
          elseActions,
        };

        actions.push(conditionAction);
      } else if (curr.type === "apiBranch") {
        // API Branch Node with Success / Failure outputs
        const succTargets = getConnectedTargets(curr.id, "branch-success");
        const failTargets = getConnectedTargets(curr.id, "branch-failure");

        const subActions: LogicAction[] = succTargets
          .filter((n) => n.type === "action")
          .map((n) => ({
            ...((n.data as any).action || {}),
            id: (n.data as any).actionId || n.id.replace("action_", ""),
            position: n.position,
          }));

        const elseActions: LogicAction[] = failTargets
          .filter((n) => n.type === "action")
          .map((n) => ({
            ...((n.data as any).action || {}),
            id: (n.data as any).actionId || n.id.replace("action_", ""),
            position: n.position,
          }));

        const apiAction: LogicAction = {
          ...(cData.action || {}),
          id: cData.actionId || curr.id.replace("api_", ""),
          actionType: "callApi",
          position: curr.position,
          subActions,
          elseActions,
        };

        actions.push(apiAction);
      }
    }

    blocks.push({
      id: blockId,
      componentId: tData.componentId,
      componentName: tData.componentName || "Component",
      event: tData.event || "Click",
      eventCategory: tData.eventCategory,
      description: tData.description || `On ${tData.event} of ${tData.componentName}`,
      enabled: tData.enabled !== false,
      position: tNode.position,
      actions,
    });
  });

  return blocks;
}

/**
 * Built-in standard recipes representing user's requested scenarios
 */
export function getRecipePreset(
  recipeId: "hello_world" | "login_flow" | "counter_flow" | "youtube_flow",
  targetComponentId?: string
): LogicBlock {
  const ts = Date.now();

  if (recipeId === "youtube_flow") {
    return {
      id: `block_yt_${ts}`,
      componentId: targetComponentId || "actionButton",
      componentName: "ActionButton",
      event: "Click",
      description: "When Action Button is clicked, toggle between pasting URL and streaming YouTube video",
      enabled: true,
      position: { x: 120, y: 50 },
      actions: [
        {
          id: `act_cond_paste_${ts}`,
          actionType: "setVariable",
          conditionEnabled: true,
          condition: {
            left: "isPasteMode",
            operator: "==",
            right: "true",
          },
          position: { x: 120, y: 210 },
          subActions: [
            {
              id: `act_paste_val_${ts}`,
              actionType: "setProperty",
              property: "text",
              value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              message: "Paste Clipboard URL into Input",
              position: { x: -60, y: 390 },
            },
            {
              id: `act_btn_lbl_${ts}`,
              actionType: "setProperty",
              property: "text",
              value: "▶ Play YouTube Video",
              position: { x: -60, y: 530 },
            },
            {
              id: `act_set_flag_${ts}`,
              actionType: "setVariable",
              variableName: "isPasteMode",
              variableOperation: "assign",
              variableValue: "false",
              position: { x: -60, y: 670 },
            },
            {
              id: `act_toast_p_${ts}`,
              actionType: "toast",
              message: "Link pasted from clipboard! Tap Play to stream.",
              position: { x: -60, y: 810 },
            },
          ],
          elseActions: [
            {
              id: `act_stream_yt_${ts}`,
              actionType: "setProperty",
              property: "url",
              value: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
              position: { x: 320, y: 390 },
            },
            {
              id: `act_toast_pl_${ts}`,
              actionType: "toast",
              message: "Streaming YouTube Video in player...",
              position: { x: 320, y: 530 },
            },
          ],
        },
      ],
    };
  }

  if (recipeId === "hello_world") {
    return {
      id: `block_hello_${ts}`,
      componentId: targetComponentId || "helloButton",
      componentName: "helloButton",
      event: "Click",
      description: "When helloButton is clicked, update helloText to 'Hello World'",
      enabled: true,
      position: { x: 100, y: 60 },
      actions: [
        {
          id: `act_text_${ts}`,
          actionType: "setProperty",
          targetId: "helloText",
          property: "text",
          value: "Hello World",
          position: { x: 100, y: 220 },
        },
        {
          id: `act_toast_${ts}`,
          actionType: "toast",
          message: "Hello World greetings updated!",
          duration: "short",
          position: { x: 100, y: 390 },
        },
      ],
    };
  }

  if (recipeId === "login_flow") {
    return {
      id: `block_login_${ts}`,
      componentId: targetComponentId || "LoginButton",
      componentName: "LoginButton",
      event: "Click",
      description: "When LoginButton clicked, validate email and perform authentication API call",
      enabled: true,
      position: { x: 120, y: 50 },
      actions: [
        {
          id: `act_cond_email_${ts}`,
          actionType: "setProperty",
          conditionEnabled: true,
          condition: {
            left: "emailInput.text",
            operator: "isEmpty",
            right: "",
          },
          position: { x: 120, y: 210 },
          subActions: [
            {
              id: `act_err_${ts}`,
              actionType: "snackbar",
              message: "Please enter your email address",
              actionLabel: "DISMISS",
              position: { x: -40, y: 420 },
            },
          ],
          elseActions: [
            {
              id: `act_api_${ts}`,
              actionType: "callApi",
              method: "POST",
              endpoint: "/api/v1/auth/login",
              position: { x: 300, y: 420 },
              subActions: [
                {
                  id: `act_nav_${ts}`,
                  actionType: "navigate",
                  targetScreen: "HomeScreen",
                  transitionType: "slide",
                  position: { x: 180, y: 630 },
                },
              ],
              elseActions: [
                {
                  id: `act_fail_toast_${ts}`,
                  actionType: "toast",
                  message: "Invalid credentials or network error",
                  position: { x: 440, y: 630 },
                },
              ],
            },
          ],
        },
      ],
    };
  }

  // Counter Flow
  return {
    id: `block_counter_${ts}`,
    componentId: targetComponentId || "counterButton",
    componentName: "counterButton",
    event: "Click",
    description: "Increment counter variable and update label",
    enabled: true,
    position: { x: 100, y: 60 },
    actions: [
      {
        id: `act_inc_${ts}`,
        actionType: "setVariable",
        variableName: "counter",
        variableOperation: "increment",
        variableValue: "1",
        position: { x: 100, y: 220 },
      },
      {
        id: `act_update_txt_${ts}`,
        actionType: "setProperty",
        targetId: "counterLabel",
        property: "text",
        value: "Counter updated",
        position: { x: 100, y: 390 },
      },
      {
        id: `act_vibrate_${ts}`,
        actionType: "vibrate",
        hapticPattern: "click",
        position: { x: 100, y: 560 },
      },
    ],
  };
}
