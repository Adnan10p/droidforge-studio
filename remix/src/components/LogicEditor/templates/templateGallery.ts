import { FlowNode, FlowEdge } from "../types";
import { MarkerType } from "@xyflow/react";

export interface TemplateBlockFlow {
  id: string;
  name: string;
  category: "auth" | "form" | "network" | "lifecycle" | "timing" | "hardware";
  description: string;
  tags: string[];
  nodeCount: number;
  iconName: string;
  generateSubGraph: (originX: number, originY: number, screenId?: string) => {
    nodes: FlowNode[];
    edges: FlowEdge[];
  };
}

export const TEMPLATE_GALLERY: TemplateBlockFlow[] = [
  {
    id: "auth_flow",
    name: "User Authentication & Guard Flow",
    category: "auth",
    description: "Validates email presence, issues API login request, navigates to Home on 200 OK or alerts on error.",
    tags: ["Auth", "API", "Condition", "Validation"],
    nodeCount: 6,
    iconName: "ShieldCheck",
    generateSubGraph: (startX, startY) => {
      const ts = Date.now();
      const triggerId = `trigger_auth_${ts}`;
      const condId = `cond_auth_${ts}`;
      const noToastId = `act_toast_err_${ts}`;
      const apiId = `api_login_${ts}`;
      const successNavId = `act_nav_home_${ts}`;
      const failSnackbarId = `act_snack_fail_${ts}`;

      const nodes: FlowNode[] = [
        {
          id: triggerId,
          type: "trigger",
          position: { x: startX, y: startY },
          data: {
            blockId: `block_${ts}`,
            componentId: "loginButton",
            componentName: "LoginButton",
            event: "Click",
            enabled: true,
            componentsList: [],
            availableEvents: ["Click", "LongClick"],
          },
        },
        {
          id: condId,
          type: "condition",
          position: { x: startX, y: startY + 160 },
          data: {
            blockId: `block_${ts}`,
            title: "Email Not Empty?",
            condition: {
              left: "emailInput.text",
              operator: "isNotEmpty",
              right: "",
            },
            componentsList: [],
            stateVariables: [],
          },
        },
        // NO Branch ➔ Show Toast
        {
          id: noToastId,
          type: "action",
          position: { x: startX + 220, y: startY + 340 },
          data: {
            blockId: `block_${ts}`,
            actionId: `toast_${ts}`,
            action: {
              id: `toast_${ts}`,
              actionType: "toast",
              message: "Please enter a valid email address.",
            },
            componentsList: [],
            screensList: [],
            stateVariables: [],
          },
        },
        // YES Branch ➔ Call API
        {
          id: apiId,
          type: "apiBranch",
          position: { x: startX - 160, y: startY + 340 },
          data: {
            blockId: `block_${ts}`,
            actionId: `api_${ts}`,
            action: {
              id: `api_${ts}`,
              actionType: "callApi",
              method: "POST",
              endpoint: "/api/v1/auth/login",
            },
            screensList: [],
            stateVariables: [],
          },
        },
        // API Success ➔ Navigate HomeScreen
        {
          id: successNavId,
          type: "action",
          position: { x: startX - 280, y: startY + 540 },
          data: {
            blockId: `block_${ts}`,
            actionId: `nav_${ts}`,
            action: {
              id: `nav_${ts}`,
              actionType: "navigate",
              targetScreen: "HomeScreen",
              transitionType: "slide",
            },
            componentsList: [],
            screensList: [],
            stateVariables: [],
          },
        },
        // API Failure ➔ Show Snackbar with RETRY
        {
          id: failSnackbarId,
          type: "action",
          position: { x: startX - 40, y: startY + 540 },
          data: {
            blockId: `block_${ts}`,
            actionId: `snack_${ts}`,
            action: {
              id: `snack_${ts}`,
              actionType: "snackbar",
              message: "Invalid credentials. Please retry.",
              actionLabel: "RETRY",
            },
            componentsList: [],
            screensList: [],
            stateVariables: [],
          },
        },
      ];

      const edges: FlowEdge[] = [
        {
          id: `edge_${triggerId}_to_${condId}`,
          source: triggerId,
          target: condId,
          sourceHandle: "trigger-out",
          targetHandle: "condition-in",
          type: "smoothstep",
          style: { stroke: "#818CF8", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#818CF8" },
        },
        {
          id: `edge_${condId}_no_to_${noToastId}`,
          source: condId,
          target: noToastId,
          sourceHandle: "branch-no",
          targetHandle: "action-in",
          type: "smoothstep",
          label: "NO ✕",
          labelStyle: { fill: "#F43F5E", fontWeight: 700, fontSize: 11 },
          style: { stroke: "#F43F5E", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#F43F5E" },
        },
        {
          id: `edge_${condId}_yes_to_${apiId}`,
          source: condId,
          target: apiId,
          sourceHandle: "branch-yes",
          targetHandle: "api-in",
          type: "smoothstep",
          label: "YES ✓",
          labelStyle: { fill: "#10B981", fontWeight: 700, fontSize: 11 },
          style: { stroke: "#10B981", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#10B981" },
        },
        {
          id: `edge_${apiId}_succ_to_${successNavId}`,
          source: apiId,
          target: successNavId,
          sourceHandle: "branch-success",
          targetHandle: "action-in",
          type: "smoothstep",
          label: "SUCCESS ✓",
          labelStyle: { fill: "#10B981", fontWeight: 700, fontSize: 11 },
          style: { stroke: "#10B981", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#10B981" },
        },
        {
          id: `edge_${apiId}_fail_to_${failSnackbarId}`,
          source: apiId,
          target: failSnackbarId,
          sourceHandle: "branch-failure",
          targetHandle: "action-in",
          type: "smoothstep",
          label: "ERROR ✕",
          labelStyle: { fill: "#F43F5E", fontWeight: 700, fontSize: 11 },
          style: { stroke: "#F43F5E", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#F43F5E" },
        },
      ];

      return { nodes, edges };
    },
  },
  {
    id: "form_validation",
    name: "Form Validation & Submit Flow",
    category: "form",
    description: "Evaluates password strength and input constraints before triggering secure network submission and toast confirmation.",
    tags: ["Form", "Condition", "State", "Toast"],
    nodeCount: 5,
    iconName: "CheckSquare",
    generateSubGraph: (startX, startY) => {
      const ts = Date.now();
      const triggerId = `trigger_form_${ts}`;
      const condId = `cond_form_${ts}`;
      const errToastId = `act_err_toast_${ts}`;
      const setVarId = `act_var_submitting_${ts}`;
      const successToastId = `act_succ_toast_${ts}`;

      const nodes: FlowNode[] = [
        {
          id: triggerId,
          type: "trigger",
          position: { x: startX, y: startY },
          data: {
            blockId: `block_${ts}`,
            componentId: "submitButton",
            componentName: "SubmitButton",
            event: "Click",
            enabled: true,
            componentsList: [],
            availableEvents: ["Click"],
          },
        },
        {
          id: condId,
          type: "condition",
          position: { x: startX, y: startY + 160 },
          data: {
            blockId: `block_${ts}`,
            title: "Password >= 8 chars?",
            condition: {
              left: "passwordInput.text.length",
              operator: ">=",
              right: "8",
            },
            componentsList: [],
            stateVariables: [],
          },
        },
        {
          id: errToastId,
          type: "action",
          position: { x: startX + 200, y: startY + 340 },
          data: {
            blockId: `block_${ts}`,
            actionId: `err_${ts}`,
            action: {
              id: `err_${ts}`,
              actionType: "toast",
              message: "Password must be at least 8 characters long.",
            },
            componentsList: [],
            screensList: [],
            stateVariables: [],
          },
        },
        {
          id: setVarId,
          type: "action",
          position: { x: startX - 160, y: startY + 340 },
          data: {
            blockId: `block_${ts}`,
            actionId: `setv_${ts}`,
            action: {
              id: `setv_${ts}`,
              actionType: "setVariable",
              variableName: "isSubmitting",
              variableOperation: "assign",
              variableValue: "true",
            },
            componentsList: [],
            screensList: [],
            stateVariables: [],
          },
        },
        {
          id: successToastId,
          type: "action",
          position: { x: startX - 160, y: startY + 520 },
          data: {
            blockId: `block_${ts}`,
            actionId: `done_${ts}`,
            action: {
              id: `done_${ts}`,
              actionType: "toast",
              message: "Form successfully submitted!",
            },
            componentsList: [],
            screensList: [],
            stateVariables: [],
          },
        },
      ];

      const edges: FlowEdge[] = [
        {
          id: `edge_${triggerId}_${condId}`,
          source: triggerId,
          target: condId,
          sourceHandle: "trigger-out",
          targetHandle: "condition-in",
          type: "smoothstep",
          style: { stroke: "#818CF8", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#818CF8" },
        },
        {
          id: `edge_${condId}_no_${errToastId}`,
          source: condId,
          target: errToastId,
          sourceHandle: "branch-no",
          targetHandle: "action-in",
          type: "smoothstep",
          label: "NO ✕",
          labelStyle: { fill: "#F43F5E", fontWeight: 700, fontSize: 11 },
          style: { stroke: "#F43F5E", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#F43F5E" },
        },
        {
          id: `edge_${condId}_yes_${setVarId}`,
          source: condId,
          target: setVarId,
          sourceHandle: "branch-yes",
          targetHandle: "action-in",
          type: "smoothstep",
          label: "YES ✓",
          labelStyle: { fill: "#10B981", fontWeight: 700, fontSize: 11 },
          style: { stroke: "#10B981", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#10B981" },
        },
        {
          id: `edge_${setVarId}_${successToastId}`,
          source: setVarId,
          target: successToastId,
          sourceHandle: "action-out",
          targetHandle: "action-in",
          type: "smoothstep",
          style: { stroke: "#60A5FA", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#60A5FA" },
        },
      ];

      return { nodes, edges };
    },
  },
  {
    id: "deep_link_handling",
    name: "Deep Link Handling Flow",
    category: "lifecycle",
    description: "Intercepts Android Intent data on screen launch, parses parameters, routes to target screen with flash toast.",
    tags: ["Intent", "DeepLink", "Lifecycle", "Navigation"],
    nodeCount: 4,
    iconName: "ExternalLink",
    generateSubGraph: (startX, startY) => {
      const ts = Date.now();
      const triggerId = `trigger_deep_${ts}`;
      const condId = `cond_deep_${ts}`;
      const navId = `act_nav_deep_${ts}`;
      const toastId = `act_toast_deep_${ts}`;

      const nodes: FlowNode[] = [
        {
          id: triggerId,
          type: "trigger",
          position: { x: startX, y: startY },
          data: {
            blockId: `block_${ts}`,
            componentId: "screen_lifecycle",
            componentName: "Screen Lifecycle",
            event: "OnCreate",
            enabled: true,
            componentsList: [],
            availableEvents: ["OnCreate", "OnResume"],
          },
        },
        {
          id: condId,
          type: "condition",
          position: { x: startX, y: startY + 160 },
          data: {
            blockId: `block_${ts}`,
            title: "Intent URL Present?",
            condition: {
              left: "intent.dataString",
              operator: "isNotEmpty",
              right: "",
            },
            componentsList: [],
            stateVariables: [],
          },
        },
        {
          id: navId,
          type: "action",
          position: { x: startX - 160, y: startY + 340 },
          data: {
            blockId: `block_${ts}`,
            actionId: `nav_${ts}`,
            action: {
              id: `nav_${ts}`,
              actionType: "navigate",
              targetScreen: "DetailsScreen",
              transitionType: "fade",
            },
            componentsList: [],
            screensList: [],
            stateVariables: [],
          },
        },
        {
          id: toastId,
          type: "action",
          position: { x: startX - 160, y: startY + 520 },
          data: {
            blockId: `block_${ts}`,
            actionId: `toast_${ts}`,
            action: {
              id: `toast_${ts}`,
              actionType: "toast",
              message: "Deep link resolved successfully",
            },
            componentsList: [],
            screensList: [],
            stateVariables: [],
          },
        },
      ];

      const edges: FlowEdge[] = [
        {
          id: `edge_${triggerId}_${condId}`,
          source: triggerId,
          target: condId,
          sourceHandle: "trigger-out",
          targetHandle: "condition-in",
          type: "smoothstep",
          style: { stroke: "#818CF8", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#818CF8" },
        },
        {
          id: `edge_${condId}_${navId}`,
          source: condId,
          target: navId,
          sourceHandle: "branch-yes",
          targetHandle: "action-in",
          type: "smoothstep",
          label: "YES ✓",
          labelStyle: { fill: "#10B981", fontWeight: 700, fontSize: 11 },
          style: { stroke: "#10B981", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#10B981" },
        },
        {
          id: `edge_${navId}_${toastId}`,
          source: navId,
          target: toastId,
          sourceHandle: "action-out",
          targetHandle: "action-in",
          type: "smoothstep",
          style: { stroke: "#60A5FA", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#60A5FA" },
        },
      ];

      return { nodes, edges };
    },
  },
  {
    id: "network_retry_loop",
    name: "Network Sync & Retry Flow",
    category: "network",
    description: "Sets loading indicator, introduces backoff delay, requests REST endpoint with dual error/success fallbacks.",
    tags: ["Network", "Retry", "Delay", "Snackbar"],
    nodeCount: 5,
    iconName: "RefreshCw",
    generateSubGraph: (startX, startY) => {
      const ts = Date.now();
      const triggerId = `trigger_retry_${ts}`;
      const delayId = `act_delay_${ts}`;
      const apiId = `api_fetch_${ts}`;
      const toastOkId = `act_toast_ok_${ts}`;
      const snackRetryId = `act_snack_retry_${ts}`;

      const nodes: FlowNode[] = [
        {
          id: triggerId,
          type: "trigger",
          position: { x: startX, y: startY },
          data: {
            blockId: `block_${ts}`,
            componentId: "retryButton",
            componentName: "RetryButton",
            event: "Click",
            enabled: true,
            componentsList: [],
            availableEvents: ["Click"],
          },
        },
        {
          id: delayId,
          type: "action",
          position: { x: startX, y: startY + 160 },
          data: {
            blockId: `block_${ts}`,
            actionId: `delay_${ts}`,
            action: {
              id: `delay_${ts}`,
              actionType: "delay",
              delayMs: 1500,
            },
            componentsList: [],
            screensList: [],
            stateVariables: [],
          },
        },
        {
          id: apiId,
          type: "apiBranch",
          position: { x: startX, y: startY + 340 },
          data: {
            blockId: `block_${ts}`,
            actionId: `api_${ts}`,
            action: {
              id: `api_${ts}`,
              actionType: "callApi",
              method: "GET",
              endpoint: "/api/v1/feed",
            },
            screensList: [],
            stateVariables: [],
          },
        },
        {
          id: toastOkId,
          type: "action",
          position: { x: startX - 160, y: startY + 540 },
          data: {
            blockId: `block_${ts}`,
            actionId: `tok_${ts}`,
            action: {
              id: `tok_${ts}`,
              actionType: "toast",
              message: "Feed refreshed successfully!",
            },
            componentsList: [],
            screensList: [],
            stateVariables: [],
          },
        },
        {
          id: snackRetryId,
          type: "action",
          position: { x: startX + 160, y: startY + 540 },
          data: {
            blockId: `block_${ts}`,
            actionId: `snk_${ts}`,
            action: {
              id: `snk_${ts}`,
              actionType: "snackbar",
              message: "Network unreachable. Retry?",
              actionLabel: "TRY AGAIN",
            },
            componentsList: [],
            screensList: [],
            stateVariables: [],
          },
        },
      ];

      const edges: FlowEdge[] = [
        {
          id: `edge_${triggerId}_${delayId}`,
          source: triggerId,
          target: delayId,
          sourceHandle: "trigger-out",
          targetHandle: "action-in",
          type: "smoothstep",
          style: { stroke: "#818CF8", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#818CF8" },
        },
        {
          id: `edge_${delayId}_${apiId}`,
          source: delayId,
          target: apiId,
          sourceHandle: "action-out",
          targetHandle: "api-in",
          type: "smoothstep",
          style: { stroke: "#60A5FA", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#60A5FA" },
        },
        {
          id: `edge_${apiId}_succ_${toastOkId}`,
          source: apiId,
          target: toastOkId,
          sourceHandle: "branch-success",
          targetHandle: "action-in",
          type: "smoothstep",
          label: "SUCCESS ✓",
          labelStyle: { fill: "#10B981", fontWeight: 700, fontSize: 11 },
          style: { stroke: "#10B981", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#10B981" },
        },
        {
          id: `edge_${apiId}_fail_${snackRetryId}`,
          source: apiId,
          target: snackRetryId,
          sourceHandle: "branch-failure",
          targetHandle: "action-in",
          type: "smoothstep",
          label: "ERROR ✕",
          labelStyle: { fill: "#F43F5E", fontWeight: 700, fontSize: 11 },
          style: { stroke: "#F43F5E", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#F43F5E" },
        },
      ];

      return { nodes, edges };
    },
  },
  {
    id: "timer_countdown_flow",
    name: "Timer & Haptic Countdown Flow",
    category: "timing",
    description: "Decrements state variable countdown on tick with physical haptic feedback until zero.",
    tags: ["Timer", "Loop", "Haptics", "Vibrate"],
    nodeCount: 4,
    iconName: "Clock",
    generateSubGraph: (startX, startY) => {
      const ts = Date.now();
      const triggerId = `trigger_timer_${ts}`;
      const delayId = `act_delay_1s_${ts}`;
      const decVarId = `act_dec_time_${ts}`;
      const vibrateId = `act_vib_${ts}`;

      const nodes: FlowNode[] = [
        {
          id: triggerId,
          type: "trigger",
          position: { x: startX, y: startY },
          data: {
            blockId: `block_${ts}`,
            componentId: "startTimerButton",
            componentName: "StartTimerButton",
            event: "Click",
            enabled: true,
            componentsList: [],
            availableEvents: ["Click"],
          },
        },
        {
          id: delayId,
          type: "action",
          position: { x: startX, y: startY + 160 },
          data: {
            blockId: `block_${ts}`,
            actionId: `del_${ts}`,
            action: {
              id: `del_${ts}`,
              actionType: "delay",
              delayMs: 1000,
            },
            componentsList: [],
            screensList: [],
            stateVariables: [],
          },
        },
        {
          id: decVarId,
          type: "action",
          position: { x: startX, y: startY + 340 },
          data: {
            blockId: `block_${ts}`,
            actionId: `dec_${ts}`,
            action: {
              id: `dec_${ts}`,
              actionType: "setVariable",
              variableName: "timeRemaining",
              variableOperation: "decrement",
              variableValue: "1",
            },
            componentsList: [],
            screensList: [],
            stateVariables: [],
          },
        },
        {
          id: vibrateId,
          type: "action",
          position: { x: startX, y: startY + 520 },
          data: {
            blockId: `block_${ts}`,
            actionId: `vib_${ts}`,
            action: {
              id: `vib_${ts}`,
              actionType: "vibrate",
              hapticPattern: "tick",
            },
            componentsList: [],
            screensList: [],
            stateVariables: [],
          },
        },
      ];

      const edges: FlowEdge[] = [
        {
          id: `edge_${triggerId}_${delayId}`,
          source: triggerId,
          target: delayId,
          sourceHandle: "trigger-out",
          targetHandle: "action-in",
          type: "smoothstep",
          style: { stroke: "#818CF8", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#818CF8" },
        },
        {
          id: `edge_${delayId}_${decVarId}`,
          source: delayId,
          target: decVarId,
          sourceHandle: "action-out",
          targetHandle: "action-in",
          type: "smoothstep",
          style: { stroke: "#60A5FA", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#60A5FA" },
        },
        {
          id: `edge_${decVarId}_${vibrateId}`,
          source: decVarId,
          target: vibrateId,
          sourceHandle: "action-out",
          targetHandle: "action-in",
          type: "smoothstep",
          style: { stroke: "#60A5FA", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#60A5FA" },
        },
      ];

      return { nodes, edges };
    },
  },
  {
    id: "youtube_stream_flow",
    name: "YouTube Link Paste & Play Streamer Flow",
    category: "form",
    description: "When ActionButton is clicked: If isPasteMode==true, paste clipboard URL into InputField and change button to Play; else play YouTube video in player.",
    tags: ["YouTube", "Clipboard", "Condition", "Dynamic Button", "Player"],
    nodeCount: 7,
    iconName: "PlayCircle",
    generateSubGraph: (startX, startY) => {
      const ts = Date.now();
      const triggerId = `trigger_yt_${ts}`;
      const condId = `cond_paste_${ts}`;
      // YES branch nodes
      const pasteActionId = `act_paste_${ts}`;
      const changeBtnId = `act_change_btn_${ts}`;
      const setVarId = `act_var_mode_${ts}`;
      const toastPastedId = `act_toast_pasted_${ts}`;
      // NO branch nodes
      const playStreamId = `act_play_stream_${ts}`;
      const toastPlayingId = `act_toast_play_${ts}`;

      const nodes: FlowNode[] = [
        {
          id: triggerId,
          type: "trigger",
          position: { x: startX, y: startY },
          data: {
            blockId: `block_yt_${ts}`,
            componentId: "actionButton",
            componentName: "ActionButton",
            event: "Click",
            enabled: true,
            componentsList: [],
            availableEvents: ["Click", "LongClick"],
          },
        },
        {
          id: condId,
          type: "condition",
          position: { x: startX, y: startY + 160 },
          data: {
            blockId: `block_yt_${ts}`,
            title: "isPasteMode == true?",
            condition: {
              left: "isPasteMode",
              operator: "==",
              right: "true",
            },
            componentsList: [],
            stateVariables: [],
          },
        },
        // YES BRANCH: Paste link & Change Button to Play
        {
          id: pasteActionId,
          type: "action",
          position: { x: startX - 220, y: startY + 340 },
          data: {
            blockId: `block_yt_${ts}`,
            actionId: `act_paste_id_${ts}`,
            action: {
              id: `act_paste_id_${ts}`,
              actionType: "setProperty",
              property: "text",
              value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              message: "Paste Clipboard URL into Input",
            },
            componentsList: [],
            screensList: [],
            stateVariables: [],
          },
        },
        {
          id: changeBtnId,
          type: "action",
          position: { x: startX - 220, y: startY + 500 },
          data: {
            blockId: `block_yt_${ts}`,
            actionId: `act_btn_id_${ts}`,
            action: {
              id: `act_btn_id_${ts}`,
              actionType: "setProperty",
              property: "text",
              value: "▶ Play YouTube Video",
            },
            componentsList: [],
            screensList: [],
            stateVariables: [],
          },
        },
        {
          id: setVarId,
          type: "action",
          position: { x: startX - 220, y: startY + 660 },
          data: {
            blockId: `block_yt_${ts}`,
            actionId: `act_var_id_${ts}`,
            action: {
              id: `act_var_id_${ts}`,
              actionType: "setVariable",
              variableName: "isPasteMode",
              variableOperation: "assign",
              variableValue: "false",
            },
            componentsList: [],
            screensList: [],
            stateVariables: [],
          },
        },
        {
          id: toastPastedId,
          type: "action",
          position: { x: startX - 220, y: startY + 820 },
          data: {
            blockId: `block_yt_${ts}`,
            actionId: `act_toast_p_${ts}`,
            action: {
              id: `act_toast_p_${ts}`,
              actionType: "toast",
              message: "Link pasted from clipboard! Tap Play to stream.",
            },
            componentsList: [],
            screensList: [],
            stateVariables: [],
          },
        },
        // NO BRANCH: Play Video in Player
        {
          id: playStreamId,
          type: "action",
          position: { x: startX + 220, y: startY + 340 },
          data: {
            blockId: `block_yt_${ts}`,
            actionId: `act_stream_id_${ts}`,
            action: {
              id: `act_stream_id_${ts}`,
              actionType: "setProperty",
              property: "url",
              value: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
            },
            componentsList: [],
            screensList: [],
            stateVariables: [],
          },
        },
        {
          id: toastPlayingId,
          type: "action",
          position: { x: startX + 220, y: startY + 500 },
          data: {
            blockId: `block_yt_${ts}`,
            actionId: `act_toast_pl_${ts}`,
            action: {
              id: `act_toast_pl_${ts}`,
              actionType: "toast",
              message: "Playing YouTube Video in player...",
            },
            componentsList: [],
            screensList: [],
            stateVariables: [],
          },
        },
      ];

      const edges: FlowEdge[] = [
        {
          id: `edge_${triggerId}_to_${condId}`,
          source: triggerId,
          target: condId,
          sourceHandle: "trigger-out",
          targetHandle: "condition-in",
          type: "smoothstep",
          style: { stroke: "#A855F7", strokeWidth: 2.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#A855F7" },
        },
        // YES branch edges
        {
          id: `edge_${condId}_yes_to_${pasteActionId}`,
          source: condId,
          target: pasteActionId,
          sourceHandle: "branch-yes",
          targetHandle: "action-in",
          type: "smoothstep",
          label: "YES (Paste Mode)",
          labelStyle: { fill: "#10B981", fontWeight: 800, fontSize: 11 },
          style: { stroke: "#10B981", strokeWidth: 2.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#10B981" },
        },
        {
          id: `edge_${pasteActionId}_to_${changeBtnId}`,
          source: pasteActionId,
          target: changeBtnId,
          sourceHandle: "action-out",
          targetHandle: "action-in",
          type: "smoothstep",
          style: { stroke: "#10B981", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#10B981" },
        },
        {
          id: `edge_${changeBtnId}_to_${setVarId}`,
          source: changeBtnId,
          target: setVarId,
          sourceHandle: "action-out",
          targetHandle: "action-in",
          type: "smoothstep",
          style: { stroke: "#10B981", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#10B981" },
        },
        {
          id: `edge_${setVarId}_to_${toastPastedId}`,
          source: setVarId,
          target: toastPastedId,
          sourceHandle: "action-out",
          targetHandle: "action-in",
          type: "smoothstep",
          style: { stroke: "#10B981", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#10B981" },
        },
        // NO branch edges
        {
          id: `edge_${condId}_no_to_${playStreamId}`,
          source: condId,
          target: playStreamId,
          sourceHandle: "branch-no",
          targetHandle: "action-in",
          type: "smoothstep",
          label: "NO (Play Mode)",
          labelStyle: { fill: "#EF4444", fontWeight: 800, fontSize: 11 },
          style: { stroke: "#EF4444", strokeWidth: 2.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#EF4444" },
        },
        {
          id: `edge_${playStreamId}_to_${toastPlayingId}`,
          source: playStreamId,
          target: toastPlayingId,
          sourceHandle: "action-out",
          targetHandle: "action-in",
          type: "smoothstep",
          style: { stroke: "#EF4444", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#EF4444" },
        },
      ];

      return { nodes, edges };
    },
  },
];
