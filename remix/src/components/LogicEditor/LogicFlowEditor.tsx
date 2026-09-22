import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  MarkerType,
  useReactFlow,
} from "@xyflow/react";

import { TriggerNode } from "./nodes/TriggerNode";
import { ActionNode } from "./nodes/ActionNode";
import { ConditionNode } from "./nodes/ConditionNode";
import { ApiBranchNode } from "./nodes/ApiBranchNode";
import { NoteNode } from "./nodes/NoteNode";
import { InsertableEdge } from "./edges/InsertableEdge";

import { CanvasContextMenu } from "./menus/CanvasContextMenu";
import { NodeContextMenu } from "./menus/NodeContextMenu";
import { MultiSelectionContextMenu } from "./menus/MultiSelectionContextMenu";
import { EdgeInsertPickerModal, EdgeInsertOption } from "./menus/EdgeInsertPickerModal";
import { DeleteConfirmationModal, DeleteConfirmationType } from "./menus/DeleteConfirmationModal";
import { NodeKotlinModal } from "./menus/NodeKotlinModal";
import { TriggerHelpModal } from "./menus/TriggerHelpModal";

import { Toolbox } from "./Toolbox";
import { Toolbar } from "./Toolbar";
import { VariablesModal } from "./VariablesModal";
import { CodePreviewModal } from "./CodePreviewModal";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { calculateForceDirectedLayout } from "./layoutAlgorithm";
import { CodeSnippetTemplate } from "./snippetData";

import {
  convertBlocksToFlow,
  convertFlowToBlocks,
  getRecipePreset,
} from "./flowConversion";
import { FlowNode, FlowEdge } from "./types";
import { AndroidScreen, LogicBlock, LogicAction, StateVariable, BuilderIdeSettings } from "../../types";
import { useVariablesWatch } from "./useVariablesWatch";
import {
  Sparkles,
  Zap,
  Plus,
  Info,
  AlertTriangle,
  CheckCircle2,
  Bug,
  StepForward,
  Play,
  Square,
  Pause,
} from "lucide-react";

interface LogicFlowEditorProps {
  screen: AndroidScreen;
  screens: AndroidScreen[];
  onUpdateScreen: (updated: AndroidScreen) => void;
  targetComponentId?: string | null;
  onSelectScreen?: (screenId: string) => void;
  builderSettings?: BuilderIdeSettings;
}

// Inner Canvas Component (inside ReactFlowProvider)
const LogicFlowCanvas: React.FC<LogicFlowEditorProps> = ({
  screen,
  screens,
  onUpdateScreen,
  targetComponentId,
  onSelectScreen,
  builderSettings,
}) => {
  const reactFlowInstance = useReactFlow();

  // Define custom node types
  const nodeTypes = useMemo(
    () => ({
      trigger: TriggerNode,
      action: ActionNode,
      condition: ConditionNode,
      apiBranch: ApiBranchNode,
      note: NoteNode,
    }),
    []
  );

  // Define custom edge types with floating '+' node insertion
  const edgeTypes = useMemo(
    () => ({
      smoothstep: InsertableEdge,
      default: InsertableEdge,
      insertable: InsertableEdge,
    }),
    []
  );

  // Generate initial nodes and edges from screen.logicBlocks
  const initialFlow = useMemo(() => {
    return convertBlocksToFlow(
      screen.logicBlocks || [],
      screen.components || [],
      screens || [],
      screen.stateVariables || []
    );
  }, [screen.id, screen.logicBlocks]);

  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(initialFlow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>(initialFlow.edges);

  // Sync nodes & edges when screen.logicBlocks changes from Code Studio or screen switch
  const lastBlocksCountRef = useRef(screen.logicBlocks?.length || 0);
  useEffect(() => {
    const flow = convertBlocksToFlow(
      screen.logicBlocks || [],
      screen.components || [],
      screens || [],
      screen.stateVariables || []
    );
    setNodes(flow.nodes);
    setEdges(flow.edges);
    lastBlocksCountRef.current = screen.logicBlocks?.length || 0;
  }, [screen.id, screen.logicBlocks]);

  // Modals & simulation state
  const [isVariablesOpen, setIsVariablesOpen] = useState(false);
  const [isCodePreviewOpen, setIsCodePreviewOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSimulationPaused, setIsSimulationPaused] = useState(false);
  const [pausedNodeId, setPausedNodeId] = useState<string | null>(null);
  const [simulationLog, setSimulationLog] = useState<string | null>(null);
  const [currentSimStepIndex, setCurrentSimStepIndex] = useState(0);
  const [totalSimSteps, setTotalSimSteps] = useState(0);

  // Simulation execution tracking refs
  const simTimerRef = useRef<NodeJS.Timeout | null>(null);
  const execPathRef = useRef<FlowNode[]>([]);
  const currentStepRef = useRef<number>(0);

  // Canvas visual settings
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [clipboardNodes, setClipboardNodes] = useState<FlowNode[]>([]);

  // Context menus state
  const [canvasContextMenu, setCanvasContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [nodeContextMenu, setNodeContextMenu] = useState<{ x: number; y: number; node: FlowNode } | null>(null);
  const [multiSelectionContextMenu, setMultiSelectionContextMenu] = useState<{
    x: number;
    y: number;
    nodes: FlowNode[];
  } | null>(null);

  // Edge Insert Node Picker state
  const [edgeInsertPicker, setEdgeInsertPicker] = useState<{
    edgeId: string;
    flowPos: { x: number; y: number };
    screenPos: { x: number; y: number };
  } | null>(null);

  // Deletion confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: DeleteConfirmationType;
    nodeTitle: string;
    downstreamCount: number;
    targetNodeId?: string;
    targetNodeIds?: string[];
  }>({
    isOpen: false,
    type: "trigger",
    nodeTitle: "",
    downstreamCount: 0,
  });

  // Dedicated Modals for Node context menu actions
  const [selectedKotlinNode, setSelectedKotlinNode] = useState<FlowNode | null>(null);
  const [isKotlinModalOpen, setIsKotlinModalOpen] = useState(false);
  const [isTriggerHelpOpen, setIsTriggerHelpOpen] = useState(false);

  // Global Search Modal state (Ctrl+F)
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Reactive Variables Watch Hook
  const variablesWatch = useVariablesWatch(screen.stateVariables || [], isSimulating);

  // Global Keyboard Shortcuts (Ctrl+F for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sync back to screen.logicBlocks when nodes or edges change
  const syncTimeoutRef = useRef<any>(null);

  const persistFlowToScreen = useCallback(
    (currentNodes: FlowNode[], currentEdges: FlowEdge[]) => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        const blocks = convertFlowToBlocks(currentNodes, currentEdges);
        onUpdateScreen({
          ...screen,
          logicBlocks: blocks,
        });
      }, 300);
    },
    [screen, onUpdateScreen]
  );

  // Downstream connected node discovery algorithm
  const getDownstreamNodeIds = useCallback((startNodeId: string, currentEdges: FlowEdge[]): string[] => {
    const visited = new Set<string>();
    const queue = [startNodeId];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      const outEdges = currentEdges.filter((e) => e.source === curr);
      for (const e of outEdges) {
        if (!visited.has(e.target)) {
          visited.add(e.target);
          queue.push(e.target);
        }
      }
    }
    return Array.from(visited);
  }, []);

  // Execution: Delete single node
  const executeDeleteSingle = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const targetNode = nds.find((n) => n.id === nodeId);
        const nextNodes = nds.filter((n) => n.id !== nodeId);

        setEdges((eds) => {
          // If action node with single incoming and single outgoing edge, reconnect them smoothly
          const inEdges = eds.filter((e) => e.target === nodeId);
          const outEdges = eds.filter((e) => e.source === nodeId);

          let nextEdges = eds.filter((e) => e.source !== nodeId && e.target !== nodeId);

          if (targetNode?.type === "action" && inEdges.length === 1 && outEdges.length === 1) {
            const inEdge = inEdges[0];
            const outEdge = outEdges[0];
            const bridgedEdge: FlowEdge = {
              id: `edge_${inEdge.source}_to_${outEdge.target}_${Date.now()}`,
              source: inEdge.source,
              target: outEdge.target,
              sourceHandle: inEdge.sourceHandle,
              targetHandle: outEdge.targetHandle,
              type: "smoothstep",
              style: { stroke: "#60A5FA", strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: "#60A5FA" },
            };
            nextEdges.push(bridgedEdge);
          }

          persistFlowToScreen(nextNodes as FlowNode[], nextEdges);
          return nextEdges;
        });

        return nextNodes;
      });
      setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
    },
    [persistFlowToScreen]
  );

  // Execution: Delete cascade flow (node + downstream connected nodes)
  const executeDeleteCascade = useCallback(
    (nodeId: string) => {
      const downstreamIds = new Set(getDownstreamNodeIds(nodeId, edges).concat(nodeId));
      setNodes((nds) => {
        const nextNodes = nds.filter((n) => !downstreamIds.has(n.id));
        setEdges((eds) => {
          const nextEdges = eds.filter((e) => !downstreamIds.has(e.source) && !downstreamIds.has(e.target));
          persistFlowToScreen(nextNodes as FlowNode[], nextEdges);
          return nextEdges;
        });
        return nextNodes;
      });
      setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
    },
    [edges, getDownstreamNodeIds, persistFlowToScreen]
  );

  // Execution: Delete multiple selected nodes
  const executeDeleteMultiple = useCallback(
    (nodeIds: string[]) => {
      const toDelete = new Set(nodeIds);
      setNodes((nds) => {
        const nextNodes = nds.filter((n) => !toDelete.has(n.id));
        setEdges((eds) => {
          const nextEdges = eds.filter((e) => !toDelete.has(e.source) && !toDelete.has(e.target));
          persistFlowToScreen(nextNodes as FlowNode[], nextEdges);
          return nextEdges;
        });
        return nextNodes;
      });
      setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
    },
    [persistFlowToScreen]
  );

  // Request node deletion with downstream connection inspection
  const requestDeleteNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const downstreamIds = getDownstreamNodeIds(nodeId, edges);
      if (downstreamIds.length > 0) {
        const nodeTitle =
          node.type === "trigger"
            ? `Trigger: ${(node.data as any).componentName || "Trigger"}`
            : node.type === "condition"
            ? `Condition: ${(node.data as any).title || "Condition"}`
            : `Action: ${(node.data as any).action?.actionType || "Action"}`;

        setDeleteConfirm({
          isOpen: true,
          type: node.type === "trigger" ? "trigger" : node.type === "condition" ? "condition" : "action",
          nodeTitle,
          downstreamCount: downstreamIds.length,
          targetNodeId: nodeId,
        });
      } else {
        executeDeleteSingle(nodeId);
      }
    },
    [nodes, edges, getDownstreamNodeIds, executeDeleteSingle]
  );

  // Global Node Action Handlers exposed to custom nodes & edges
  useEffect(() => {
    (window as any).__onFlowUpdateNode = (nodeId: string, patchData: any) => {
      setNodes((nds) => {
        const next = nds.map((n) => {
          if (n.id === nodeId) {
            return {
              ...n,
              data: {
                ...n.data,
                ...patchData,
              },
            };
          }
          return n;
        });
        persistFlowToScreen(next as FlowNode[], edges);
        return next;
      });
    };

    (window as any).__onFlowDeleteNode = (nodeId: string) => {
      requestDeleteNode(nodeId);
    };

    (window as any).__onFlowInsertOnEdge = (
      edgeId: string,
      flowPos: { x: number; y: number },
      clientX: number,
      clientY: number
    ) => {
      setCanvasContextMenu(null);
      setNodeContextMenu(null);
      setMultiSelectionContextMenu(null);
      setEdgeInsertPicker({
        edgeId,
        flowPos,
        screenPos: { x: clientX, y: clientY },
      });
    };

    (window as any).__onFlowDuplicateNode = (nodeId: string) => {
      const targetNode = nodes.find((n) => n.id === nodeId);
      if (!targetNode) return;
      const newId = `${targetNode.type}_${Date.now()}`;
      const duplicate: FlowNode = {
        ...targetNode,
        id: newId,
        position: {
          x: targetNode.position.x + 40,
          y: targetNode.position.y + 40,
        },
        data: {
          ...targetNode.data,
          actionId: `${Date.now()}`,
          blockId: (targetNode.data as any).blockId || `${Date.now()}`,
        },
      } as FlowNode;

      setNodes((nds) => {
        const next = [...nds, duplicate];
        persistFlowToScreen(next as FlowNode[], edges);
        return next;
      });
    };

    (window as any).__onFlowAddConnectedAction = (
      sourceNodeId: string,
      sourceHandleId: string = "action-out"
    ) => {
      const sourceNode = nodes.find((n) => n.id === sourceNodeId);
      if (!sourceNode) return;

      const actId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newActionNodeId = `action_${actId}`;

      // Calculate position below source node
      let newX = sourceNode.position.x;
      let newY = sourceNode.position.y + 190;

      if (sourceHandleId === "branch-yes") {
        newX = sourceNode.position.x - 160;
        newY = sourceNode.position.y + 220;
      } else if (sourceHandleId === "branch-no") {
        newX = sourceNode.position.x + 160;
        newY = sourceNode.position.y + 220;
      } else if (sourceHandleId === "branch-success") {
        newX = sourceNode.position.x - 160;
        newY = sourceNode.position.y + 220;
      } else if (sourceHandleId === "branch-failure") {
        newX = sourceNode.position.x + 160;
        newY = sourceNode.position.y + 220;
      }

      const newAction: LogicAction = {
        id: actId,
        actionType: "setProperty",
        targetId: (screen.components || [])[0]?.id || "widget",
        property: "text",
        value: "New Action",
      };

      const newActionNode: FlowNode = {
        id: newActionNodeId,
        type: "action",
        position: { x: newX, y: newY },
        data: {
          blockId: (sourceNode.data as any).blockId || `block_${Date.now()}`,
          actionId: actId,
          action: newAction,
          componentsList: (screen.components || []).map((c) => ({
            id: c.id,
            name: c.name,
            type: c.type,
          })),
          screensList: (screens || []).map((s) => ({
            id: s.id,
            name: s.name,
            title: s.title || s.name,
          })),
          stateVariables: screen.stateVariables || [],
        },
      };

      const isBranchYes = sourceHandleId === "branch-yes" || sourceHandleId === "branch-success";
      const isBranchNo = sourceHandleId === "branch-no" || sourceHandleId === "branch-failure";

      const newEdge: FlowEdge = {
        id: `edge_${sourceNodeId}_to_${newActionNodeId}`,
        source: sourceNodeId,
        target: newActionNodeId,
        sourceHandle: sourceHandleId,
        targetHandle: "action-in",
        type: "smoothstep",
        label: isBranchYes ? "YES ✓" : isBranchNo ? "NO ✕" : undefined,
        labelStyle: isBranchYes
          ? { fill: "#10B981", fontWeight: 700, fontSize: 11 }
          : isBranchNo
          ? { fill: "#F43F5E", fontWeight: 700, fontSize: 11 }
          : undefined,
        style: {
          stroke: isBranchYes ? "#10B981" : isBranchNo ? "#F43F5E" : "#60A5FA",
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isBranchYes ? "#10B981" : isBranchNo ? "#F43F5E" : "#60A5FA",
        },
      };

      setNodes((nds) => {
        const nextNodes = [...nds, newActionNode];
        setEdges((eds) => {
          const nextEdges = [...eds, newEdge];
          persistFlowToScreen(nextNodes as FlowNode[], nextEdges);
          return nextEdges;
        });
        return nextNodes;
      });
    };

    return () => {
      delete (window as any).__onFlowUpdateNode;
      delete (window as any).__onFlowDeleteNode;
      delete (window as any).__onFlowDuplicateNode;
      delete (window as any).__onFlowAddConnectedAction;
    };
  }, [nodes, edges, screen, screens, persistFlowToScreen]);

  // Handle connection creation between handles
  const onConnect = useCallback(
    (connection: Connection) => {
      const isYes = connection.sourceHandle === "branch-yes" || connection.sourceHandle === "branch-success";
      const isNo = connection.sourceHandle === "branch-no" || connection.sourceHandle === "branch-failure";

      const newEdge: FlowEdge = {
        id: `edge_${connection.source}_${connection.target}_${Date.now()}`,
        source: connection.source!,
        target: connection.target!,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        type: "smoothstep",
        label: isYes ? "YES ✓" : isNo ? "NO ✕" : undefined,
        labelStyle: isYes
          ? { fill: "#10B981", fontWeight: 700, fontSize: 11 }
          : isNo
          ? { fill: "#F43F5E", fontWeight: 700, fontSize: 11 }
          : undefined,
        style: {
          stroke: isYes ? "#10B981" : isNo ? "#F43F5E" : "#60A5FA",
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isYes ? "#10B981" : isNo ? "#F43F5E" : "#60A5FA",
        },
      };

      setEdges((eds) => {
        const next = addEdge(newEdge, eds);
        persistFlowToScreen(nodes as FlowNode[], next);
        return next;
      });
    },
    [nodes, persistFlowToScreen]
  );

  // Add block from Toolbox (Click or Drag-and-drop)
  const handleAddBlockFromToolbox = useCallback(
    (type: string, payload: any, dropPosition?: { x: number; y: number }) => {
      const pos = dropPosition || {
        x: 100 + Math.random() * 80,
        y: 80 + Math.random() * 80,
      };
      const ts = Date.now();

      let newNode: FlowNode;

      if (type === "trigger") {
        const blockId = `block_${ts}`;
        newNode = {
          id: `trigger_${blockId}`,
          type: "trigger",
          position: pos,
          data: {
            blockId,
            componentId: payload.componentId || "button",
            componentName: payload.componentName || "Button",
            event: payload.event || "Click",
            enabled: true,
            componentsList: (screen.components || []).map((c) => ({
              id: c.id,
              name: c.name,
              type: c.type,
            })),
            availableEvents: ["Click", "LongClick", "OnCreate", "TextChanged", "ValueChanged"],
          },
        };
      } else if (type === "condition") {
        newNode = {
          id: `cond_${ts}`,
          type: "condition",
          position: pos,
          data: {
            blockId: `block_${ts}`,
            title: "Condition Check",
            condition: {
              left: payload.left || "emailInput.text",
              operator: payload.operator || "isEmpty",
              right: payload.right || "",
            },
            componentsList: (screen.components || []).map((c) => ({
              id: c.id,
              name: c.name,
              type: c.type,
            })),
            stateVariables: screen.stateVariables || [],
          },
        };
      } else if (type === "apiBranch") {
        newNode = {
          id: `api_${ts}`,
          type: "apiBranch",
          position: pos,
          data: {
            blockId: `block_${ts}`,
            actionId: `act_${ts}`,
            action: {
              id: `act_${ts}`,
              actionType: "callApi",
              method: payload.method || "POST",
              endpoint: payload.endpoint || "/api/v1/auth/login",
            },
            screensList: (screens || []).map((s) => ({
              id: s.id,
              name: s.name,
              title: s.title || s.name,
            })),
            stateVariables: screen.stateVariables || [],
          },
        };
      } else if (type === "note") {
        newNode = {
          id: `note_${ts}`,
          type: "note",
          position: pos,
          data: {
            title: payload.title || "Note",
            text: payload.text || "Flow logic note...",
          },
        };
      } else {
        // Standard Action node
        const actionId = `act_${ts}_${Math.random().toString(36).substring(2, 7)}`;
        newNode = {
          id: `action_${actionId}`,
          type: "action",
          position: pos,
          data: {
            blockId: `block_${ts}`,
            actionId,
            action: {
              id: actionId,
              actionType: payload.actionType || "setProperty",
              targetId: payload.targetId || (screen.components || [])[0]?.id || "widget",
              property: payload.property || "text",
              value: payload.value ?? "Hello World",
              message: payload.message,
              targetScreen: payload.targetScreen,
              endpoint: payload.endpoint,
              method: payload.method,
              variableName: payload.variableName,
              variableOperation: payload.variableOperation,
              variableValue: payload.variableValue,
              delayMs: payload.delayMs,
              hapticPattern: payload.hapticPattern,
            },
            componentsList: (screen.components || []).map((c) => ({
              id: c.id,
              name: c.name,
              type: c.type,
            })),
            screensList: (screens || []).map((s) => ({
              id: s.id,
              name: s.name,
              title: s.title || s.name,
            })),
            stateVariables: screen.stateVariables || [],
          },
        };
      }

      setNodes((nds) => {
        const next = [...nds, newNode];
        persistFlowToScreen(next as FlowNode[], edges);
        return next;
      });
    },
    [screen, screens, edges, persistFlowToScreen]
  );

  // Drag-and-drop onto the canvas (Blocks & Snippet Templates)
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Insert code snippet template at given or default canvas position
  const handleInsertSnippetAtPosition = useCallback(
    (snippet: CodeSnippetTemplate, dropPosition?: { x: number; y: number }) => {
      const rawNodes = snippet.nodes || [];
      const rawEdges = snippet.edges || [];
      if (rawNodes.length === 0) return;

      const basePos = dropPosition || { x: 180, y: 160 };

      // Calculate bounding box offset
      const minX = Math.min(...rawNodes.map((n) => n.position?.x ?? 0));
      const minY = Math.min(...rawNodes.map((n) => n.position?.y ?? 0));

      const idMap = new Map<string, string>();
      const ts = Date.now();

      const clonedNodes: FlowNode[] = rawNodes.map((orig, idx) => {
        const newId = `${orig.type || "node"}_snip_${ts}_${idx}`;
        if (orig.id) {
          idMap.set(orig.id, newId);
        }
        const origX = orig.position?.x ?? 0;
        const origY = orig.position?.y ?? 0;
        const posX = basePos.x + (origX - minX);
        const posY = basePos.y + (origY - minY);

        return {
          ...orig,
          id: newId,
          type: orig.type || "action",
          position: { x: Math.round(posX), y: Math.round(posY) },
          selected: true,
          data: {
            ...orig.data,
            blockId: `block_snip_${ts}_${idx}`,
            actionId: `act_snip_${ts}_${idx}`,
            componentsList: (screen.components || []).map((c) => ({
              id: c.id,
              name: c.name,
              type: c.type,
            })),
            screensList: (screens || []).map((s) => ({
              id: s.id,
              name: s.name,
              title: s.title || s.name,
            })),
            stateVariables: screen.stateVariables || [],
          },
        } as FlowNode;
      });

      const clonedEdges: FlowEdge[] = rawEdges
        .filter((e) => e.source && e.target && idMap.has(e.source) && idMap.has(e.target))
        .map((e, idx) => ({
          ...e,
          id: `edge_snip_${ts}_${idx}`,
          source: idMap.get(e.source!)!,
          target: idMap.get(e.target!)!,
          type: e.type || "smoothstep",
          style: e.style || { stroke: "#60A5FA", strokeWidth: 2 },
        } as FlowEdge));

      setNodes((nds) => {
        const unselected = nds.map((n) => ({ ...n, selected: false }));
        const nextNodes = [...unselected, ...clonedNodes];
        setEdges((eds) => {
          const nextEdges = [...eds, ...clonedEdges];
          persistFlowToScreen(nextNodes, nextEdges);
          return nextEdges;
        });
        return nextNodes;
      });

      setSimulationLog(`✓ Added logic template "${snippet.name}" (${clonedNodes.length} nodes)`);
      setTimeout(() => setSimulationLog(null), 3000);
    },
    [screen, screens, persistFlowToScreen, setNodes, setEdges]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      // Check for snippet drag payload first
      const snippetDataRaw = event.dataTransfer.getData("application/logic-snippet");
      if (snippetDataRaw) {
        try {
          const snippet: CodeSnippetTemplate = JSON.parse(snippetDataRaw);
          const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          });
          handleInsertSnippetAtPosition(snippet, position);
          return;
        } catch (err) {
          console.error("Failed to parse snippet drag payload", err);
        }
      }

      // Standard toolbox block drop
      const nodeType = event.dataTransfer.getData("application/reactflow/type");
      const rawPayload = event.dataTransfer.getData("application/reactflow/payload");

      if (!nodeType) return;

      let payload = {};
      try {
        payload = JSON.parse(rawPayload);
      } catch (err) {
        payload = {};
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      handleAddBlockFromToolbox(nodeType, payload, position);
    },
    [reactFlowInstance, handleAddBlockFromToolbox, handleInsertSnippetAtPosition]
  );

  // Apply 1-Click Recipe Flow Preset
  const handleApplyRecipe = useCallback(
    (recipeId: "hello_world" | "login_flow" | "counter_flow" | "youtube_flow") => {
      const presetBlock = getRecipePreset(recipeId, targetComponentId || undefined);
      // For youtube_flow replace existing blocks or append
      const newBlocks = recipeId === "youtube_flow" ? [presetBlock] : [...(screen.logicBlocks || []), presetBlock];

      // Convert and replace
      const { nodes: newNodes, edges: newEdges } = convertBlocksToFlow(
        newBlocks,
        screen.components || [],
        screens || [],
        screen.stateVariables || []
      );

      setNodes(newNodes);
      setEdges(newEdges);
      persistFlowToScreen(newNodes, newEdges);

      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2 });
      }, 100);
    },
    [screen, screens, targetComponentId, persistFlowToScreen, reactFlowInstance, setNodes, setEdges]
  );

  // Auto-Arrange Layout Algorithm using force-directed physics
  const handleAutoLayout = useCallback(() => {
    const arrangedNodes = calculateForceDirectedLayout(nodes, edges, 90);

    setNodes(arrangedNodes);
    persistFlowToScreen(arrangedNodes, edges);
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
    }, 50);
  }, [nodes, edges, persistFlowToScreen, reactFlowInstance, setNodes]);

  // Breakpoint Toggle on any node
  const handleToggleNodeBreakpoint = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const next = nds.map((n) => {
          if (n.id === nodeId) {
            const hasBp = Boolean((n.data as any)?.breakpoint);
            return {
              ...n,
              data: {
                ...n.data,
                breakpoint: !hasBp,
              },
            };
          }
          return n;
        });
        persistFlowToScreen(next, edges);
        return next;
      });
      setNodeContextMenu(null);
    },
    [edges, persistFlowToScreen, setNodes]
  );

  // Stop / Reset simulation
  const handleStopSimulation = useCallback(() => {
    if (simTimerRef.current) {
      clearTimeout(simTimerRef.current);
      simTimerRef.current = null;
    }
    setIsSimulating(false);
    setIsSimulationPaused(false);
    setPausedNodeId(null);
    setSimulationLog(null);
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isSimulatingActive: false,
          isPausedAtBreakpoint: false,
        },
      }))
    );
    setEdges((eds) => eds.map((e) => ({ ...e, animated: false, className: "" })));
  }, [setNodes, setEdges]);

  // Execute single simulation step with Breakpoint detection & Variables Watch
  const executeSimStep = useCallback(
    (stepIndex: number, bypassBreakpoint: boolean = false) => {
      const execPath = execPathRef.current;
      if (stepIndex >= execPath.length) {
        if (simTimerRef.current) clearTimeout(simTimerRef.current);
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            data: {
              ...n.data,
              isSimulatingActive: false,
              isPausedAtBreakpoint: false,
            },
          }))
        );
        setIsSimulationPaused(false);
        setPausedNodeId(null);
        setSimulationLog("✓ Flow execution completed successfully! All steps verified.");
        setTimeout(() => {
          handleStopSimulation();
          reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
        }, 2800);
        return;
      }

      const currentNode = execPath[stepIndex];
      const data = currentNode.data as any;
      const hasBreakpoint = Boolean(data.breakpoint);

      currentStepRef.current = stepIndex;
      setCurrentSimStepIndex(stepIndex);

      // Check if paused at breakpoint
      if (hasBreakpoint && !bypassBreakpoint) {
        if (simTimerRef.current) clearTimeout(simTimerRef.current);
        setIsSimulationPaused(true);
        setPausedNodeId(currentNode.id);

        // Highlight node with active breakpoint pulsing styling
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            data: {
              ...n.data,
              isSimulatingActive: n.id === currentNode.id,
              isPausedAtBreakpoint: n.id === currentNode.id,
            },
          }))
        );

        reactFlowInstance.setCenter(
          currentNode.position.x + 140,
          currentNode.position.y + 60,
          { zoom: 1.15, duration: 300 }
        );

        const nodeLabel =
          currentNode.type === "trigger"
            ? `${data.componentName || "Component"} • ${data.event}`
            : currentNode.type === "condition"
            ? data.title || "Condition Check"
            : currentNode.type === "apiBranch"
            ? `API: ${data.action?.method || "GET"} ${data.action?.endpoint || ""}`
            : `Action: ${data.action?.actionType || "Action"}`;

        setSimulationLog(
          `⏸ Breakpoint reached at: ${nodeLabel} (Step ${stepIndex + 1} of ${execPath.length})`
        );
        return;
      }

      // Continuing execution past breakpoint
      setIsSimulationPaused(false);
      setPausedNodeId(null);

      // Highlight active node with animated glow effect
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: {
            ...n.data,
            isSimulatingActive: n.id === currentNode.id,
            isPausedAtBreakpoint: false,
          },
        }))
      );

      reactFlowInstance.setCenter(
        currentNode.position.x + 140,
        currentNode.position.y + 60,
        { zoom: 1.1, duration: 300 }
      );

      if (currentNode.type === "trigger") {
        setSimulationLog(`⚡ [TRIGGER] ${data.componentName || "Event"} • ${data.event} fired!`);
      } else if (currentNode.type === "action") {
        const action = data.action;
        setSimulationLog(
          `▶ [ACTION] Executed: ${action?.actionType || "Action"} (${
            action?.value || action?.message || action?.variableName || "OK"
          })`
        );
        // Reactive state update in Variables Watch hook
        variablesWatch.observeStep(action);
      } else if (currentNode.type === "condition") {
        setSimulationLog(`◇ [DECISION] Evaluated Condition: ${data.title || "Check"} ➔ YES branch taken`);
      } else if (currentNode.type === "apiBranch") {
        setSimulationLog(
          `🌐 [API] HTTP ${data.action?.method || "GET"} ${data.action?.endpoint || "/api"} ➔ 200 OK (Success)`
        );
      }

      simTimerRef.current = setTimeout(() => {
        executeSimStep(stepIndex + 1, false);
      }, 1000);
    },
    [reactFlowInstance, variablesWatch, handleStopSimulation, setNodes]
  );

  // Interactive Flow Simulation Runner with Animated Glow, Pulsing Edges & Real-Time Variables Watch
  const handleToggleSimulation = useCallback(() => {
    if (isSimulating) {
      handleStopSimulation();
      return;
    }

    // Build topological execution path starting from triggers
    const triggers = nodes.filter(
      (n) => n.type === "trigger" && (n.data as any)?.enabled !== false
    );
    const startList = triggers.length > 0 ? triggers : nodes.filter((n) => n.type !== "note");

    const visited = new Set<string>();
    const path: FlowNode[] = [];
    const queue: FlowNode[] = [...startList];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (!visited.has(curr.id)) {
        visited.add(curr.id);
        path.push(curr);
        const outEdges = edges.filter((e) => e.source === curr.id);
        for (const e of outEdges) {
          const next = nodes.find((n) => n.id === e.target);
          if (next && !visited.has(next.id) && next.type !== "note") {
            queue.push(next);
          }
        }
      }
    }

    for (const n of nodes) {
      if (!visited.has(n.id) && n.type !== "note" && (n.data as any)?.enabled !== false) {
        visited.add(n.id);
        path.push(n);
      }
    }

    if (path.length === 0) {
      setSimulationLog("⚠️ No active flow nodes to simulate.");
      setTimeout(() => setSimulationLog(null), 3000);
      return;
    }

    execPathRef.current = path;
    setTotalSimSteps(path.length);
    currentStepRef.current = 0;
    setCurrentSimStepIndex(0);
    setIsSimulating(true);
    setIsSimulationPaused(false);
    setPausedNodeId(null);
    setSimulationLog("⚡ Starting visual simulation of active logic flow...");

    // Set animated glow classes on edges
    setEdges((eds) => eds.map((e) => ({ ...e, animated: true, className: "animating-sim" })));

    // Start step 0
    executeSimStep(0, false);
  }, [isSimulating, nodes, edges, handleStopSimulation, executeSimStep, setEdges]);

  // Resume paused simulation from current breakpoint
  const handleResumeSimulation = useCallback(() => {
    if (!isSimulating || !isSimulationPaused) return;
    executeSimStep(currentStepRef.current, true);
  }, [isSimulating, isSimulationPaused, executeSimStep]);

  // Step forward: execute current step and pause at immediate next node
  const handleStepSimulation = useCallback(() => {
    if (!isSimulating) return;
    const nextStep = currentStepRef.current + 1;
    executeSimStep(nextStep, false);
  }, [isSimulating, executeSimStep]);

  // Variables Save Handler
  const handleSaveVariables = useCallback(
    (newVariables: StateVariable[]) => {
      onUpdateScreen({
        ...screen,
        stateVariables: newVariables,
      });
    },
    [screen, onUpdateScreen]
  );

  // Handle Insert on Connection Edge Floating '+' Button
  const handleInsertOnEdge = useCallback(
    (option: EdgeInsertOption) => {
      if (!edgeInsertPicker) return;
      const { edgeId } = edgeInsertPicker;
      const targetEdge = edges.find((e) => e.id === edgeId);
      if (!targetEdge) return;

      const sourceNode = nodes.find((n) => n.id === targetEdge.source);
      const targetNode = nodes.find((n) => n.id === targetEdge.target);
      if (!sourceNode || !targetNode) return;

      const posX = Math.round((sourceNode.position.x + targetNode.position.x) / 2);
      const posY = Math.round((sourceNode.position.y + targetNode.position.y) / 2);
      const randSuffix = Math.random().toString(36).substring(2, 6);
      const ts = `${Date.now()}_${randSuffix}`;

      let newNode: FlowNode;
      let inHandle = "action-in";
      let outHandle = "action-out";

      if (option.type === "condition") {
        inHandle = "condition-in";
        outHandle = "branch-yes";
        newNode = {
          id: `cond_${ts}`,
          type: "condition",
          position: { x: posX, y: posY },
          data: {
            blockId: (sourceNode.data as any).blockId || `block_${ts}`,
            title: "Decision Check",
            condition: {
              left: "input.text",
              operator: "isNotEmpty",
              right: "",
            },
            componentsList: (screen.components || []).map((c) => ({
              id: c.id,
              name: c.name,
              type: c.type,
            })),
            stateVariables: screen.stateVariables || [],
          },
        };
      } else if (option.type === "callApi") {
        inHandle = "api-in";
        outHandle = "branch-success";
        newNode = {
          id: `api_${ts}`,
          type: "apiBranch",
          position: { x: posX, y: posY },
          data: {
            blockId: (sourceNode.data as any).blockId || `block_${ts}`,
            actionId: `act_${ts}`,
            action: {
              id: `act_${ts}`,
              actionType: "callApi",
              method: "GET",
              endpoint: "/api/data",
            },
            screensList: (screens || []).map((s) => ({
              id: s.id,
              name: s.name,
              title: s.title || s.name,
            })),
            stateVariables: screen.stateVariables || [],
          },
        };
      } else if (option.type === "delay") {
        newNode = {
          id: `action_act_delay_${ts}`,
          type: "action",
          position: { x: posX, y: posY },
          data: {
            blockId: (sourceNode.data as any).blockId || `block_${ts}`,
            actionId: `act_delay_${ts}`,
            action: {
              id: `act_delay_${ts}`,
              actionType: "delay",
              delayMs: 1000,
              value: "1000",
            },
            componentsList: (screen.components || []).map((c) => ({
              id: c.id,
              name: c.name,
              type: c.type,
            })),
            screensList: (screens || []).map((s) => ({
              id: s.id,
              name: s.name,
              title: s.title || s.name,
            })),
            stateVariables: screen.stateVariables || [],
          },
        };
      } else {
        const actionType = option.subType || "setProperty";
        newNode = {
          id: `action_act_${ts}`,
          type: "action",
          position: { x: posX, y: posY },
          data: {
            blockId: (sourceNode.data as any).blockId || `block_${ts}`,
            actionId: `act_${ts}`,
            action: {
              id: `act_${ts}`,
              actionType: actionType as any,
              message: actionType === "showToast" ? "Operation succeeded!" : undefined,
              targetScreen: actionType === "navigate" ? screens[0]?.id : undefined,
              property: "text",
              value: "Updated Value",
            },
            componentsList: (screen.components || []).map((c) => ({
              id: c.id,
              name: c.name,
              type: c.type,
            })),
            screensList: (screens || []).map((s) => ({
              id: s.id,
              name: s.name,
              title: s.title || s.name,
            })),
            stateVariables: screen.stateVariables || [],
          },
        };
      }

      // Reconnect incoming and outgoing
      const inEdge: FlowEdge = {
        id: `edge_${targetEdge.source}_to_${newNode.id}`,
        source: targetEdge.source,
        target: newNode.id,
        sourceHandle: targetEdge.sourceHandle,
        targetHandle: inHandle,
        type: "smoothstep",
        label: targetEdge.label,
        labelStyle: targetEdge.labelStyle,
        style: targetEdge.style || { stroke: "#60A5FA", strokeWidth: 2 },
        markerEnd: targetEdge.markerEnd || { type: MarkerType.ArrowClosed, color: "#60A5FA" },
      };

      const outEdge: FlowEdge = {
        id: `edge_${newNode.id}_to_${targetEdge.target}`,
        source: newNode.id,
        target: targetEdge.target,
        sourceHandle: outHandle,
        targetHandle: targetEdge.targetHandle,
        type: "smoothstep",
        label: option.type === "condition" ? "YES ✓" : option.type === "callApi" ? "Success ✓" : undefined,
        labelStyle:
          option.type === "condition" || option.type === "callApi"
            ? { fill: "#10B981", fontWeight: 700, fontSize: 11 }
            : undefined,
        style: {
          stroke: option.type === "condition" || option.type === "callApi" ? "#10B981" : "#60A5FA",
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: option.type === "condition" || option.type === "callApi" ? "#10B981" : "#60A5FA",
        },
      };

      const nextEdges = edges.filter((e) => e.id !== targetEdge.id).concat(inEdge, outEdge);
      const nextNodes = [...nodes, newNode];

      // Shift downstream nodes down to make clean space
      const downstreamIds = new Set(getDownstreamNodeIds(targetNode.id, edges).concat(targetNode.id));
      const adjustedNodes = nextNodes.map((n) => {
        if (downstreamIds.has(n.id) && n.id !== newNode.id) {
          return {
            ...n,
            position: {
              x: n.position.x,
              y: n.position.y + 170,
            },
          };
        }
        return n;
      });

      setNodes(adjustedNodes);
      setEdges(nextEdges);
      persistFlowToScreen(adjustedNodes, nextEdges);
      setEdgeInsertPicker(null);
    },
    [edgeInsertPicker, edges, nodes, screen, screens, getDownstreamNodeIds, persistFlowToScreen]
  );

  // Multi-Selection Alignment Operations
  const handleAlign = useCallback(
    (alignment: "left" | "center" | "right" | "top" | "middle" | "bottom") => {
      const selected = nodes.filter((n) => n.selected);
      if (selected.length < 2) return;

      let nextNodes = [...nodes];

      if (alignment === "left") {
        const minX = Math.min(...selected.map((n) => n.position.x));
        nextNodes = nextNodes.map((n) => (n.selected ? { ...n, position: { ...n.position, x: minX } } : n));
      } else if (alignment === "right") {
        const maxX = Math.max(...selected.map((n) => n.position.x));
        nextNodes = nextNodes.map((n) => (n.selected ? { ...n, position: { ...n.position, x: maxX } } : n));
      } else if (alignment === "center") {
        const avgX = selected.reduce((sum, n) => sum + n.position.x, 0) / selected.length;
        nextNodes = nextNodes.map((n) => (n.selected ? { ...n, position: { ...n.position, x: Math.round(avgX) } } : n));
      } else if (alignment === "top") {
        const minY = Math.min(...selected.map((n) => n.position.y));
        nextNodes = nextNodes.map((n) => (n.selected ? { ...n, position: { ...n.position, y: minY } } : n));
      } else if (alignment === "bottom") {
        const maxY = Math.max(...selected.map((n) => n.position.y));
        nextNodes = nextNodes.map((n) => (n.selected ? { ...n, position: { ...n.position, y: maxY } } : n));
      } else if (alignment === "middle") {
        const avgY = selected.reduce((sum, n) => sum + n.position.y, 0) / selected.length;
        nextNodes = nextNodes.map((n) => (n.selected ? { ...n, position: { ...n.position, y: Math.round(avgY) } } : n));
      }

      setNodes(nextNodes);
      persistFlowToScreen(nextNodes, edges);
      setMultiSelectionContextMenu(null);
    },
    [nodes, edges, persistFlowToScreen]
  );

  // Multi-Selection Distribution Operations
  const handleDistribute = useCallback(
    (axis: "horizontal" | "vertical") => {
      const selected = nodes.filter((n) => n.selected);
      if (selected.length < 3) return;

      let nextNodes = [...nodes];

      if (axis === "horizontal") {
        const sorted = [...selected].sort((a, b) => a.position.x - b.position.x);
        const minX = sorted[0].position.x;
        const maxX = sorted[sorted.length - 1].position.x;
        const step = (maxX - minX) / (sorted.length - 1);

        const newPosMap = new Map<string, number>();
        sorted.forEach((n, idx) => {
          newPosMap.set(n.id, Math.round(minX + idx * step));
        });

        nextNodes = nextNodes.map((n) =>
          newPosMap.has(n.id) ? { ...n, position: { ...n.position, x: newPosMap.get(n.id)! } } : n
        );
      } else {
        const sorted = [...selected].sort((a, b) => a.position.y - b.position.y);
        const minY = sorted[0].position.y;
        const maxY = sorted[sorted.length - 1].position.y;
        const step = (maxY - minY) / (sorted.length - 1);

        const newPosMap = new Map<string, number>();
        sorted.forEach((n, idx) => {
          newPosMap.set(n.id, Math.round(minY + idx * step));
        });

        nextNodes = nextNodes.map((n) =>
          newPosMap.has(n.id) ? { ...n, position: { ...n.position, y: newPosMap.get(n.id)! } } : n
        );
      }

      setNodes(nextNodes);
      persistFlowToScreen(nextNodes, edges);
      setMultiSelectionContextMenu(null);
    },
    [nodes, edges, persistFlowToScreen]
  );

  // Group Selection Action
  const handleGroupSelection = useCallback(() => {
    const selected = nodes.filter((n) => n.selected);
    if (selected.length === 0) return;

    const minX = Math.min(...selected.map((n) => n.position.x));
    const minY = Math.min(...selected.map((n) => n.position.y));

    const noteNode: FlowNode = {
      id: `note_group_${Date.now()}`,
      type: "note",
      position: { x: minX - 30, y: minY - 70 },
      data: {
        title: "Grouped Flow Section",
        text: `Group containing ${selected.length} connected logic blocks.`,
      },
    };

    setNodes((nds) => {
      const next = [noteNode, ...nds];
      persistFlowToScreen(next, edges);
      return next;
    });
    setMultiSelectionContextMenu(null);
  }, [nodes, edges, persistFlowToScreen]);

  // Duplicate Multiple Selected Nodes
  const handleDuplicateSelected = useCallback(() => {
    const selected = nodes.filter((n) => n.selected);
    if (selected.length === 0) return;

    const idMap = new Map<string, string>();
    const duplicatedNodes: FlowNode[] = selected.map((n) => {
      const newId = `${n.type}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      idMap.set(n.id, newId);
      return {
        ...n,
        id: newId,
        selected: true,
        position: { x: n.position.x + 50, y: n.position.y + 50 },
        data: {
          ...n.data,
          blockId: `block_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          actionId: `act_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        },
      };
    });

    const unselectedOriginals = nodes.map((n) => ({ ...n, selected: false }));
    const nextNodes = [...unselectedOriginals, ...duplicatedNodes];

    const selectedIds = new Set(selected.map((n) => n.id));
    const newEdges: FlowEdge[] = [];
    edges.forEach((e) => {
      if (selectedIds.has(e.source) && selectedIds.has(e.target)) {
        newEdges.push({
          ...e,
          id: `edge_${idMap.get(e.source)}_to_${idMap.get(e.target)}_${Date.now()}`,
          source: idMap.get(e.source)!,
          target: idMap.get(e.target)!,
        });
      }
    });

    const nextEdges = [...edges, ...newEdges];
    setNodes(nextNodes);
    setEdges(nextEdges);
    persistFlowToScreen(nextNodes, nextEdges);
    setMultiSelectionContextMenu(null);
  }, [nodes, edges, persistFlowToScreen]);

  // Delete Multiple Selected Nodes
  const handleDeleteSelected = useCallback(() => {
    const selected = nodes.filter((n) => n.selected);
    if (selected.length === 0) return;

    setMultiSelectionContextMenu(null);
    setDeleteConfirm({
      isOpen: true,
      type: "multi",
      nodeTitle: `${selected.length} Selected Nodes`,
      downstreamCount: selected.length,
      targetNodeIds: selected.map((n) => n.id),
    });
  }, [nodes]);

  // Right-Click Context Menus Handlers
  const handlePaneContextMenu = useCallback((event: React.MouseEvent | MouseEvent) => {
    event.preventDefault();
    setNodeContextMenu(null);
    setMultiSelectionContextMenu(null);
    setEdgeInsertPicker(null);
    setCanvasContextMenu({ x: (event as any).clientX, y: (event as any).clientY });
  }, []);

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: FlowNode) => {
      event.preventDefault();
      event.stopPropagation();
      setCanvasContextMenu(null);
      setEdgeInsertPicker(null);

      const selected = nodes.filter((n) => n.selected);
      if (selected.length > 1 && selected.some((n) => n.id === node.id)) {
        setNodeContextMenu(null);
        setMultiSelectionContextMenu({
          x: event.clientX,
          y: event.clientY,
          nodes: selected,
        });
      } else {
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            selected: n.id === node.id,
          }))
        );
        setMultiSelectionContextMenu(null);
        setNodeContextMenu({
          x: event.clientX,
          y: event.clientY,
          node,
        });
      }
    },
    [nodes]
  );

  const handleSelectionContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const selected = nodes.filter((n) => n.selected);
    if (selected.length > 1) {
      setCanvasContextMenu(null);
      setNodeContextMenu(null);
      setEdgeInsertPicker(null);
      setMultiSelectionContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodes: selected,
      });
    }
  }, [nodes]);

  const handlePaneClick = useCallback(() => {
    setCanvasContextMenu(null);
    setNodeContextMenu(null);
    setMultiSelectionContextMenu(null);
    setEdgeInsertPicker(null);
  }, []);

  // Node Menu Actions
  const handleNodeEdit = useCallback(() => {
    if (!nodeContextMenu) return;
    const { node } = nodeContextMenu;
    setSimulationLog(`Editing node ${node.id}`);
    setNodeContextMenu(null);
  }, [nodeContextMenu]);

  const handleNodeChangeEvent = useCallback(
    (newEvent: string) => {
      if (!nodeContextMenu) return;
      const { node } = nodeContextMenu;
      setNodes((nds) => {
        const next = nds.map((n) => {
          if (n.id === node.id) {
            return {
              ...n,
              data: {
                ...n.data,
                event: newEvent,
              },
            };
          }
          return n;
        });
        persistFlowToScreen(next, edges);
        return next;
      });
      setNodeContextMenu(null);
    },
    [nodeContextMenu, edges, persistFlowToScreen]
  );

  const handleNodeAddActionBelow = useCallback(() => {
    if (!nodeContextMenu) return;
    const { node } = nodeContextMenu;
    setNodeContextMenu(null);
    if (typeof (window as any).__onFlowAddConnectedAction === "function") {
      (window as any).__onFlowAddConnectedAction(node.id, "action-out");
    }
  }, [nodeContextMenu]);

  const handleNodeAddConditionBelow = useCallback(() => {
    if (!nodeContextMenu) return;
    const { node } = nodeContextMenu;
    const ts = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const condNode: FlowNode = {
      id: `cond_${ts}`,
      type: "condition",
      position: { x: node.position.x, y: node.position.y + 190 },
      data: {
        blockId: (node.data as any).blockId || `block_${ts}`,
        title: "Check Condition",
        condition: {
          left: "input.text",
          operator: "isNotEmpty",
          right: "",
        },
        componentsList: (screen.components || []).map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
        })),
        stateVariables: screen.stateVariables || [],
      },
    };

    const edge: FlowEdge = {
      id: `edge_${node.id}_to_${condNode.id}`,
      source: node.id,
      target: condNode.id,
      sourceHandle: "action-out",
      targetHandle: "condition-in",
      type: "smoothstep",
      style: { stroke: "#60A5FA", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#60A5FA" },
    };

    setNodes((nds) => {
      const next = [...nds, condNode];
      setEdges((eds) => {
        const nextEds = [...eds, edge];
        persistFlowToScreen(next, nextEds);
        return nextEds;
      });
      return next;
    });
    setNodeContextMenu(null);
  }, [nodeContextMenu, edges, screen, persistFlowToScreen]);

  const handleNodeDuplicateFlow = useCallback(() => {
    if (!nodeContextMenu) return;
    const { node } = nodeContextMenu;
    const downstreamIds = getDownstreamNodeIds(node.id, edges);
    const allNodeIds = [node.id, ...downstreamIds];
    const nodesToDuplicate = nodes.filter((n) => allNodeIds.includes(n.id));

    const idMap = new Map<string, string>();
    const newNodes: FlowNode[] = nodesToDuplicate.map((n) => {
      const newId = `${n.type}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      idMap.set(n.id, newId);
      return {
        ...n,
        id: newId,
        position: { x: n.position.x + 80, y: n.position.y + 80 },
        data: {
          ...n.data,
          blockId: `block_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          actionId: `act_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        },
      };
    });

    const newEdges: FlowEdge[] = [];
    edges.forEach((e) => {
      if (idMap.has(e.source) && idMap.has(e.target)) {
        newEdges.push({
          ...e,
          id: `edge_${idMap.get(e.source)}_to_${idMap.get(e.target)}_${Date.now()}`,
          source: idMap.get(e.source)!,
          target: idMap.get(e.target)!,
        });
      }
    });

    setNodes((nds) => {
      const next = [...nds, ...newNodes];
      setEdges((eds) => {
        const nextEds = [...eds, ...newEdges];
        persistFlowToScreen(next, nextEds);
        return nextEds;
      });
      return next;
    });
    setNodeContextMenu(null);
  }, [nodeContextMenu, nodes, edges, getDownstreamNodeIds, persistFlowToScreen]);

  const handleNodeToggleEnabled = useCallback(() => {
    if (!nodeContextMenu) return;
    const { node } = nodeContextMenu;
    const currentEnabled = (node.data as any).enabled !== false;
    setNodes((nds) => {
      const next = nds.map((n) => {
        if (n.id === node.id) {
          return {
            ...n,
            data: {
              ...n.data,
              enabled: !currentEnabled,
            },
          };
        }
        return n;
      });
      persistFlowToScreen(next, edges);
      return next;
    });
    setNodeContextMenu(null);
  }, [nodeContextMenu, edges, persistFlowToScreen]);

  const handleNodeCollapseFlow = useCallback(() => {
    if (!nodeContextMenu) return;
    const { node } = nodeContextMenu;
    const downstreamIds = new Set(getDownstreamNodeIds(node.id, edges));
    setNodes((nds) =>
      nds.map((n) => {
        if (downstreamIds.has(n.id)) {
          return {
            ...n,
            hidden: !n.hidden,
          };
        }
        return n;
      })
    );
    setNodeContextMenu(null);
  }, [nodeContextMenu, edges, getDownstreamNodeIds]);

  const handleNodeTest = useCallback(() => {
    if (!nodeContextMenu) return;
    const { node } = nodeContextMenu;
    const data = node.data as any;

    if (node.type === "trigger") {
      setSimulationLog(`⚡ [TRIGGER TEST] Fired event: ${data.componentName} • ${data.event}`);
    } else if (node.type === "condition") {
      setSimulationLog(`◇ [CONDITION TEST] Evaluated condition: ${data.title} ➔ YES branch taken`);
    } else if (node.type === "action") {
      setSimulationLog(
        `▶ [ACTION TEST] Executed action: ${data.action?.actionType} (Value: ${
          data.action?.value || data.action?.message || "OK"
        })`
      );
    } else {
      setSimulationLog(`⚡ [TEST] Tested node: ${node.id}`);
    }
    setNodeContextMenu(null);
  }, [nodeContextMenu]);

  const handleNodeViewKotlin = useCallback(() => {
    if (!nodeContextMenu) return;
    setSelectedKotlinNode(nodeContextMenu.node);
    setIsKotlinModalOpen(true);
    setNodeContextMenu(null);
  }, [nodeContextMenu]);

  const handleNodeDelete = useCallback(() => {
    if (!nodeContextMenu) return;
    const { node } = nodeContextMenu;
    setNodeContextMenu(null);
    requestDeleteNode(node.id);
  }, [nodeContextMenu, requestDeleteNode]);

  const handleNodeHelp = useCallback(() => {
    setNodeContextMenu(null);
    setIsTriggerHelpOpen(true);
  }, []);

  const handleNodeInvertCondition = useCallback(() => {
    if (!nodeContextMenu) return;
    const { node } = nodeContextMenu;
    // Swap yes/no outgoing edges
    setEdges((eds) => {
      const next = eds.map((e) => {
        if (e.source === node.id) {
          if (e.sourceHandle === "branch-yes") {
            return {
              ...e,
              sourceHandle: "branch-no",
              label: "NO ✕",
              labelStyle: { fill: "#F43F5E", fontWeight: 700, fontSize: 11 },
              style: { stroke: "#F43F5E", strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: "#F43F5E" },
            };
          } else if (e.sourceHandle === "branch-no") {
            return {
              ...e,
              sourceHandle: "branch-yes",
              label: "YES ✓",
              labelStyle: { fill: "#10B981", fontWeight: 700, fontSize: 11 },
              style: { stroke: "#10B981", strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: "#10B981" },
            };
          }
        }
        return e;
      });
      persistFlowToScreen(nodes, next);
      return next;
    });
    setNodeContextMenu(null);
  }, [nodeContextMenu, nodes, persistFlowToScreen]);

  const handleNodeInsertDelayBefore = useCallback(() => {
    if (!nodeContextMenu) return;
    const { node } = nodeContextMenu;
    const inEdge = edges.find((e) => e.target === node.id);
    const ts = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const posX = node.position.x;
    const posY = Math.max(0, node.position.y - 120);

    const delayNode: FlowNode = {
      id: `action_act_delay_${ts}`,
      type: "action",
      position: { x: posX, y: posY },
      data: {
        blockId: (node.data as any).blockId || `block_${ts}`,
        actionId: `act_delay_${ts}`,
        action: {
          id: `act_delay_${ts}`,
          actionType: "delay",
          delayMs: 1000,
          value: "1000",
        },
        componentsList: (screen.components || []).map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
        })),
        screensList: (screens || []).map((s) => ({
          id: s.id,
          name: s.name,
          title: s.title || s.name,
        })),
        stateVariables: screen.stateVariables || [],
      },
    };

    let nextEdges = [...edges];
    if (inEdge) {
      nextEdges = nextEdges.filter((e) => e.id !== inEdge.id);
      nextEdges.push({
        id: `edge_${inEdge.source}_to_${delayNode.id}`,
        source: inEdge.source,
        target: delayNode.id,
        sourceHandle: inEdge.sourceHandle,
        targetHandle: "action-in",
        type: "smoothstep",
        style: { stroke: "#60A5FA", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#60A5FA" },
      });
    }

    nextEdges.push({
      id: `edge_${delayNode.id}_to_${node.id}`,
      source: delayNode.id,
      target: node.id,
      sourceHandle: "action-out",
      targetHandle: "action-in",
      type: "smoothstep",
      style: { stroke: "#60A5FA", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#60A5FA" },
    });

    const nextNodes = [...nodes, delayNode];
    setNodes(nextNodes);
    setEdges(nextEdges);
    persistFlowToScreen(nextNodes, nextEdges);
    setNodeContextMenu(null);
  }, [nodeContextMenu, edges, nodes, screen, screens, persistFlowToScreen]);

  // Canvas Menu Operations
  const handleAddTriggerCanvas = useCallback(() => {
    if (!canvasContextMenu) return;
    const pos = reactFlowInstance.screenToFlowPosition({
      x: canvasContextMenu.x,
      y: canvasContextMenu.y,
    });
    handleAddBlockFromToolbox(
      "trigger",
      {
        componentId: (screen.components || [])[0]?.id || "button",
        componentName: (screen.components || [])[0]?.name || "Button",
        event: "Click",
      },
      pos
    );
    setCanvasContextMenu(null);
  }, [canvasContextMenu, reactFlowInstance, handleAddBlockFromToolbox, screen]);

  const handleAddActionCanvas = useCallback(() => {
    if (!canvasContextMenu) return;
    const pos = reactFlowInstance.screenToFlowPosition({
      x: canvasContextMenu.x,
      y: canvasContextMenu.y,
    });
    handleAddBlockFromToolbox("action", { actionType: "setProperty" }, pos);
    setCanvasContextMenu(null);
  }, [canvasContextMenu, reactFlowInstance, handleAddBlockFromToolbox]);

  const handleAddConditionCanvas = useCallback(() => {
    if (!canvasContextMenu) return;
    const pos = reactFlowInstance.screenToFlowPosition({
      x: canvasContextMenu.x,
      y: canvasContextMenu.y,
    });
    handleAddBlockFromToolbox("condition", {}, pos);
    setCanvasContextMenu(null);
  }, [canvasContextMenu, reactFlowInstance, handleAddBlockFromToolbox]);

  const handleAddVariableCanvas = useCallback(() => {
    setCanvasContextMenu(null);
    setIsVariablesOpen(true);
  }, []);

  const handlePasteCanvas = useCallback(() => {
    if (!canvasContextMenu) return;
    const pos = reactFlowInstance.screenToFlowPosition({
      x: canvasContextMenu.x,
      y: canvasContextMenu.y,
    });

    const nodesToPaste = clipboardNodes.length > 0 ? clipboardNodes : nodes.filter((n) => n.selected);
    if (nodesToPaste.length === 0) {
      setCanvasContextMenu(null);
      return;
    }

    const newNodes: FlowNode[] = nodesToPaste.map((n, idx) => ({
      ...n,
      id: `${n.type}_${Date.now()}_${idx}`,
      selected: true,
      position: { x: pos.x + idx * 40, y: pos.y + idx * 40 },
      data: {
        ...n.data,
        blockId: `block_${Date.now()}_${idx}`,
        actionId: `act_${Date.now()}_${idx}`,
      },
    }));

    const unselected = nodes.map((n) => ({ ...n, selected: false }));
    const nextNodes = [...unselected, ...newNodes];
    setNodes(nextNodes);
    persistFlowToScreen(nextNodes, edges);
    setCanvasContextMenu(null);
  }, [canvasContextMenu, clipboardNodes, nodes, edges, reactFlowInstance, persistFlowToScreen]);

  const handleSelectAllCanvas = useCallback(() => {
    setNodes((nds) => nds.map((n) => ({ ...n, selected: true })));
    setCanvasContextMenu(null);
  }, []);

  const handleCleanLayoutCanvas = useCallback(() => {
    handleAutoLayout();
    setCanvasContextMenu(null);
  }, [handleAutoLayout]);

  const handleFitFlowCanvas = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.2 });
    setCanvasContextMenu(null);
  }, [reactFlowInstance]);

  const handleCenterFlowCanvas = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.3 });
    setCanvasContextMenu(null);
  }, [reactFlowInstance]);

  const handleToggleGridCanvas = useCallback(() => {
    setShowGrid((prev) => !prev);
    setCanvasContextMenu(null);
  }, []);

  const handleToggleSnapCanvas = useCallback(() => {
    setSnapToGrid((prev) => !prev);
    setCanvasContextMenu(null);
  }, []);

  const handleAddCommentCanvas = useCallback(() => {
    if (!canvasContextMenu) return;
    const pos = reactFlowInstance.screenToFlowPosition({
      x: canvasContextMenu.x,
      y: canvasContextMenu.y,
    });
    handleAddBlockFromToolbox(
      "note",
      {
        title: "Comment Note",
        text: "Add instructions or architectural comments...",
      },
      pos
    );
    setCanvasContextMenu(null);
  }, [canvasContextMenu, reactFlowInstance, handleAddBlockFromToolbox]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden relative">
      {/* Top Toolbar */}
      <Toolbar
        currentScreen={screen}
        screens={screens}
        onSelectScreen={onSelectScreen}
        onZoomIn={() => reactFlowInstance.zoomIn()}
        onZoomOut={() => reactFlowInstance.zoomOut()}
        onFitView={() => reactFlowInstance.fitView({ padding: 0.2 })}
        onAutoLayout={handleAutoLayout}
        isSimulating={isSimulating}
        isSimulationPaused={isSimulationPaused}
        onToggleSimulation={handleToggleSimulation}
        onResumeSimulation={handleResumeSimulation}
        onStepSimulation={handleStepSimulation}
        onOpenVariables={() => setIsVariablesOpen(true)}
        onOpenCodePreview={() => setIsCodePreviewOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onAddTrigger={() =>
          handleAddBlockFromToolbox("trigger", {
            componentId: (screen.components || [])[0]?.id || "button",
            componentName: (screen.components || [])[0]?.name || "Button",
            event: "Click",
          })
        }
        totalBlocks={nodes.filter((n) => n.type === "trigger").length}
      />

      {/* Main Flow Editor Workspace: Left Sidebar + Canvas */}
      <div className="flex-1 flex h-[calc(100%-48px)] overflow-hidden">
        {/* Left Toolbox */}
        <Toolbox
          components={screen.components || []}
          screens={screens || []}
          onAddBlockFromToolbox={handleAddBlockFromToolbox}
          onApplyRecipe={handleApplyRecipe}
          currentNodes={nodes}
          edges={edges}
          onInsertSnippet={(snippet) => handleInsertSnippetAtPosition(snippet)}
          onSaveCurrentAsSnippet={(name, description) => {
            // Snippets are saved locally in CodeSnippetTab
          }}
          variables={screen.stateVariables || []}
          simulatedValues={variablesWatch.values}
          isSimulating={isSimulating}
          lastChangedVar={variablesWatch.lastChangedVar}
          changeHistory={variablesWatch.changeHistory}
          onUpdateVariableValue={variablesWatch.setVariableValue}
          onResetVariableValues={variablesWatch.resetToDefaults}
          onClearHistory={variablesWatch.clearHistory}
          onOpenVariablesModal={() => setIsVariablesOpen(true)}
        />

        {/* Canvas Area */}
        <div
          className="flex-1 h-full relative bg-slate-950 transition-colors duration-200"
          style={{ backgroundColor: "var(--logic-canvas-bg, #050811)" }}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onContextMenu={handlePaneContextMenu}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            snapToGrid={snapToGrid}
            snapGrid={[20, 20]}
            onPaneClick={handlePaneClick}
            onPaneContextMenu={handlePaneContextMenu}
            onNodeContextMenu={handleNodeContextMenu}
            onSelectionContextMenu={handleSelectionContextMenu}
            fitView
            minZoom={0.2}
            maxZoom={2}
            defaultEdgeOptions={{
              type: "smoothstep",
              style: { stroke: "var(--logic-edge-stroke, #38BDF8)", strokeWidth: 2.5 },
            }}
            proOptions={{ hideAttribution: true }}
            style={{ backgroundColor: "var(--logic-canvas-bg, #050811)" }}
            className="transition-colors duration-200"
          >
            {showGrid && <Background color="var(--logic-canvas-grid, #334155)" gap={20} size={1.2} />}
            <Controls className="!bg-slate-900/90 !border-slate-800 !text-white backdrop-blur-md shadow-xl" />
            <MiniMap
              nodeColor={(n) => {
                if (n.type === "trigger") return "#10B981"; // Emerald for triggers
                if (n.type === "condition") return "#F59E0B"; // Warm amber for logic conditions
                if (n.type === "apiBranch") return "#38BDF8"; // Sky cyan for API
                if (n.type === "note") return "#8B5CF6"; // Purple for comments/notes
                return "#3B82F6"; // Cool blue for UI actions
              }}
              className="!bg-slate-900/90 !border-slate-800 !rounded-xl overflow-hidden shadow-xl hidden sm:block backdrop-blur-md"
            />
          </ReactFlow>

          {/* Simulation Notification & Breakpoint Banner */}
          {simulationLog && (
            <div
              className={`absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2.5 rounded-2xl border text-xs font-mono font-bold shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-150 ${
                isSimulationPaused
                  ? "bg-slate-900/98 border-rose-500 text-rose-200 ring-2 ring-rose-500/30 shadow-rose-900/40"
                  : "bg-slate-900/95 border-indigo-500 text-white"
              }`}
            >
              {isSimulationPaused ? (
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-full bg-rose-600 text-white animate-bounce">
                    <Bug className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span className="text-white">{simulationLog}</span>
                  <div className="w-px h-4 bg-slate-700 mx-1" />
                  <button
                    type="button"
                    onClick={handleResumeSimulation}
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Resume</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleStepSimulation}
                    className="flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition"
                  >
                    <StepForward className="w-3 h-3" />
                    <span>Step</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleStopSimulation}
                    className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 cursor-pointer transition"
                    title="Stop Simulation"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>{simulationLog}</span>
                </>
              )}
            </div>
          )}

          {/* Context Menus */}
          {canvasContextMenu && (
            <CanvasContextMenu
              x={canvasContextMenu.x}
              y={canvasContextMenu.y}
              onClose={() => setCanvasContextMenu(null)}
              onAddTrigger={handleAddTriggerCanvas}
              onAddAction={handleAddActionCanvas}
              onAddCondition={handleAddConditionCanvas}
              onAddVariable={handleAddVariableCanvas}
              onPaste={handlePasteCanvas}
              onSelectAll={handleSelectAllCanvas}
              onCleanLayout={handleCleanLayoutCanvas}
              onFitFlowToScreen={handleFitFlowCanvas}
              onCenterFlow={handleCenterFlowCanvas}
              onToggleGrid={handleToggleGridCanvas}
              onToggleSnap={handleToggleSnapCanvas}
              onAddComment={handleAddCommentCanvas}
              showGrid={showGrid}
              snapToGrid={snapToGrid}
            />
          )}

          {nodeContextMenu && (
            <NodeContextMenu
              x={nodeContextMenu.x}
              y={nodeContextMenu.y}
              node={nodeContextMenu.node}
              onClose={() => setNodeContextMenu(null)}
              onEdit={handleNodeEdit}
              onChangeEvent={handleNodeChangeEvent}
              onAddActionBelow={handleNodeAddActionBelow}
              onAddConditionBelow={handleNodeAddConditionBelow}
              onDuplicateFlow={handleNodeDuplicateFlow}
              onToggleEnabled={handleNodeToggleEnabled}
              onCollapseFlow={handleNodeCollapseFlow}
              onTest={handleNodeTest}
              onViewKotlin={handleNodeViewKotlin}
              onDelete={handleNodeDelete}
              onHelp={handleNodeHelp}
              onInvertCondition={handleNodeInvertCondition}
              onAddActionToYes={handleNodeAddActionBelow}
              onAddActionToNo={handleNodeAddActionBelow}
              onInsertDelayBefore={handleNodeInsertDelayBefore}
              onToggleBreakpoint={(node) => handleToggleNodeBreakpoint(node.id)}
            />
          )}

          {multiSelectionContextMenu && (
            <MultiSelectionContextMenu
              x={multiSelectionContextMenu.x}
              y={multiSelectionContextMenu.y}
              selectedNodes={multiSelectionContextMenu.nodes}
              onClose={() => setMultiSelectionContextMenu(null)}
              onGroupSelection={handleGroupSelection}
              onAlign={handleAlign}
              onDistribute={handleDistribute}
              onDuplicateSelected={handleDuplicateSelected}
              onDeleteSelected={handleDeleteSelected}
            />
          )}

          {/* Edge Insert Picker Modal */}
          {edgeInsertPicker && (
            <EdgeInsertPickerModal
              isOpen={true}
              onClose={() => setEdgeInsertPicker(null)}
              onSelectOption={handleInsertOnEdge}
              position={edgeInsertPicker.screenPos}
            />
          )}

          {/* Downstream Aware Deletion Confirmation Modal */}
          <DeleteConfirmationModal
            isOpen={deleteConfirm.isOpen}
            type={deleteConfirm.type}
            nodeTitle={deleteConfirm.nodeTitle}
            downstreamCount={deleteConfirm.downstreamCount}
            onCancel={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
            onDeleteOnlyThis={() => {
              if (deleteConfirm.targetNodeId) {
                executeDeleteSingle(deleteConfirm.targetNodeId);
              }
            }}
            onDeleteCompleteFlow={() => {
              if (deleteConfirm.type === "multi" && deleteConfirm.targetNodeIds) {
                executeDeleteMultiple(deleteConfirm.targetNodeIds);
              } else if (deleteConfirm.targetNodeId) {
                executeDeleteCascade(deleteConfirm.targetNodeId);
              }
            }}
          />

          {/* Dedicated Modals: Node Kotlin Code Preview & Trigger Guide */}
          <NodeKotlinModal
            isOpen={isKotlinModalOpen}
            node={selectedKotlinNode}
            onClose={() => {
              setIsKotlinModalOpen(false);
              setSelectedKotlinNode(null);
            }}
          />

          <TriggerHelpModal
            isOpen={isTriggerHelpOpen}
            onClose={() => setIsTriggerHelpOpen(false)}
          />

          {/* Empty Canvas Friendly Welcome State */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 max-w-md text-center pointer-events-auto shadow-2xl backdrop-blur-md space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg">
                  <Zap className="w-6 h-6 fill-current" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">Visual Logic & Flow Studio</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Build event-driven reactive logic for Android apps using drag & drop nodes,
                    connection wires, conditions, and actions.
                  </p>
                </div>

                {/* 1-Click Starter Flows */}
                <div className="space-y-2 pt-2 text-left">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Choose a starter flow to begin:
                  </span>

                  <button
                    type="button"
                    onClick={() => handleApplyRecipe("hello_world")}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/40 hover:border-amber-400 flex items-center justify-between text-xs font-bold text-amber-300 transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>⚡ Hello World Flow (helloButton ➔ Change Text)</span>
                    </div>
                    <Plus className="w-4 h-4 text-amber-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyRecipe("login_flow")}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-purple-500/40 hover:border-purple-400 flex items-center justify-between text-xs font-bold text-purple-300 transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <span>⚡ Complex Login Flow (Validate ➔ API ➔ Branch)</span>
                    </div>
                    <Plus className="w-4 h-4 text-purple-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyRecipe("counter_flow")}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-emerald-500/40 hover:border-emerald-400 flex items-center justify-between text-xs font-bold text-emerald-300 transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <span>⚡ Counter App Flow (Increment ➔ Haptic)</span>
                    </div>
                    <Plus className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* State Variables Management Modal */}
      <VariablesModal
        isOpen={isVariablesOpen}
        onClose={() => setIsVariablesOpen(false)}
        variables={screen.stateVariables || []}
        onSave={handleSaveVariables}
      />

      {/* Jetpack Compose Kotlin Code Preview Modal */}
      <CodePreviewModal
        isOpen={isCodePreviewOpen}
        onClose={() => setIsCodePreviewOpen(false)}
        screen={screen}
        blocks={screen.logicBlocks || []}
      />

      {/* Global Search Modal (Ctrl+F) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        nodes={nodes}
        components={screen.components || []}
        variables={screen.stateVariables || []}
        onSelectNode={(nodeId) => {
          const targetNode = nodes.find((n) => n.id === nodeId);
          if (targetNode) {
            setNodes((nds) =>
              nds.map((n) => ({
                ...n,
                selected: n.id === nodeId,
              }))
            );
            reactFlowInstance.setCenter(
              targetNode.position.x + 140,
              targetNode.position.y + 60,
              { zoom: 1.2, duration: 400 }
            );
          }
        }}
        onSelectVariable={(varName) => {
          setIsVariablesOpen(true);
        }}
      />
    </div>
  );
};

// Root Exported Component with ReactFlowProvider
export const LogicFlowEditor: React.FC<LogicFlowEditorProps> = (props) => {
  return (
    <ReactFlowProvider>
      <LogicFlowCanvas {...props} />
    </ReactFlowProvider>
  );
};
