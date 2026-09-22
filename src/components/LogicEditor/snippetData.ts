import { FlowNode, FlowEdge } from "./types";

export interface CodeSnippetTemplate {
  id: string;
  name: string;
  category: "network" | "validation" | "state" | "navigation" | "custom";
  description: string;
  tags: string[];
  nodes: Partial<FlowNode>[];
  edges: Partial<FlowEdge>[];
  isCustom?: boolean;
}

export const BUILT_IN_SNIPPETS: CodeSnippetTemplate[] = [
  {
    id: "api_fetch_and_parse",
    name: "API Fetch and Parse",
    category: "network",
    description: "Calls REST endpoint, evaluates HTTP status, parses JSON response, and updates UI",
    tags: ["API", "REST", "Network", "JSON"],
    nodes: [
      {
        id: "snip_trigger",
        type: "trigger",
        position: { x: 100, y: 60 },
        data: {
          blockId: "block_snip_api",
          componentId: "fetchButton",
          componentName: "FetchButton",
          event: "Click",
          enabled: true,
          componentsList: [],
          availableEvents: ["Click"],
        },
      },
      {
        id: "snip_api",
        type: "apiBranch",
        position: { x: 100, y: 240 },
        data: {
          blockId: "block_snip_api",
          actionId: "act_api_fetch",
          action: {
            id: "act_api_fetch",
            actionType: "callApi",
            method: "GET",
            endpoint: "/api/v1/users/profile",
          },
          screensList: [],
          stateVariables: [],
        },
      },
      {
        id: "snip_success_toast",
        type: "action",
        position: { x: -60, y: 440 },
        data: {
          blockId: "block_snip_api",
          actionId: "act_toast_succ",
          action: {
            id: "act_toast_succ",
            actionType: "toast",
            message: "User data loaded successfully!",
          },
          componentsList: [],
          screensList: [],
          stateVariables: [],
        },
      },
      {
        id: "snip_err_toast",
        type: "action",
        position: { x: 260, y: 440 },
        data: {
          blockId: "block_snip_api",
          actionId: "act_toast_err",
          action: {
            id: "act_toast_err",
            actionType: "toast",
            message: "Network error: Unable to fetch data",
          },
          componentsList: [],
          screensList: [],
          stateVariables: [],
        },
      },
    ],
    edges: [
      {
        id: "snip_e1",
        source: "snip_trigger",
        target: "snip_api",
        type: "smoothstep",
        style: { stroke: "#60A5FA", strokeWidth: 2 },
      },
      {
        id: "snip_e2",
        source: "snip_api",
        target: "snip_success_toast",
        sourceHandle: "branch-success",
        type: "smoothstep",
        label: "SUCCESS (200 OK)",
        style: { stroke: "#10B981", strokeWidth: 2 },
      },
      {
        id: "snip_e3",
        source: "snip_api",
        target: "snip_err_toast",
        sourceHandle: "branch-failure",
        type: "smoothstep",
        label: "ERROR",
        style: { stroke: "#F43F5E", strokeWidth: 2 },
      },
    ],
  },
  {
    id: "input_validation",
    name: "Input Validation Guard",
    category: "validation",
    description: "Validates form fields, checks for empty string, blocks navigation with warning toast",
    tags: ["Form", "Validation", "Condition", "Guard"],
    nodes: [
      {
        id: "snip_submit_trigger",
        type: "trigger",
        position: { x: 100, y: 60 },
        data: {
          blockId: "block_snip_val",
          componentId: "submitButton",
          componentName: "SubmitButton",
          event: "Click",
          enabled: true,
          componentsList: [],
          availableEvents: ["Click"],
        },
      },
      {
        id: "snip_cond_empty",
        type: "condition",
        position: { x: 100, y: 240 },
        data: {
          blockId: "block_snip_val",
          title: "Input Text Empty?",
          condition: {
            left: "emailField.text",
            operator: "isEmpty",
            right: "",
          },
          componentsList: [],
          stateVariables: [],
        },
      },
      {
        id: "snip_val_fail_toast",
        type: "action",
        position: { x: -60, y: 440 },
        data: {
          blockId: "block_snip_val",
          actionId: "act_err_msg",
          action: {
            id: "act_err_msg",
            actionType: "toast",
            message: "Validation Error: Please fill in required fields",
          },
          componentsList: [],
          screensList: [],
          stateVariables: [],
        },
      },
      {
        id: "snip_val_pass_nav",
        type: "action",
        position: { x: 260, y: 440 },
        data: {
          blockId: "block_snip_val",
          actionId: "act_nav_next",
          action: {
            id: "act_nav_next",
            actionType: "navigate",
            targetScreen: "DashboardScreen",
            transitionType: "slide",
          },
          componentsList: [],
          screensList: [],
          stateVariables: [],
        },
      },
    ],
    edges: [
      {
        id: "snip_ve1",
        source: "snip_submit_trigger",
        target: "snip_cond_empty",
        type: "smoothstep",
        style: { stroke: "#60A5FA", strokeWidth: 2 },
      },
      {
        id: "snip_ve2",
        source: "snip_cond_empty",
        target: "snip_val_fail_toast",
        sourceHandle: "branch-yes",
        type: "smoothstep",
        label: "YES (Empty)",
        style: { stroke: "#F43F5E", strokeWidth: 2 },
      },
      {
        id: "snip_ve3",
        source: "snip_cond_empty",
        target: "snip_val_pass_nav",
        sourceHandle: "branch-no",
        type: "smoothstep",
        label: "NO (Valid)",
        style: { stroke: "#10B981", strokeWidth: 2 },
      },
    ],
  },
  {
    id: "state_counter_haptic",
    name: "Counter with Haptic Feedback",
    category: "state",
    description: "Increments integer state variable and triggers device vibration click",
    tags: ["State", "Haptics", "Counter", "Variable"],
    nodes: [
      {
        id: "snip_btn_trigger",
        type: "trigger",
        position: { x: 100, y: 60 },
        data: {
          blockId: "block_snip_counter",
          componentId: "incrementButton",
          componentName: "IncrementButton",
          event: "Click",
          enabled: true,
          componentsList: [],
          availableEvents: ["Click"],
        },
      },
      {
        id: "snip_act_incr",
        type: "action",
        position: { x: 100, y: 240 },
        data: {
          blockId: "block_snip_counter",
          actionId: "act_inc_var",
          action: {
            id: "act_inc_var",
            actionType: "setVariable",
            variableName: "counter",
            variableOperation: "increment",
            variableValue: "1",
          },
          componentsList: [],
          screensList: [],
          stateVariables: [],
        },
      },
      {
        id: "snip_act_vib",
        type: "action",
        position: { x: 100, y: 420 },
        data: {
          blockId: "block_snip_counter",
          actionId: "act_vib_feedback",
          action: {
            id: "act_vib_feedback",
            actionType: "vibrate",
            hapticPattern: "click",
          },
          componentsList: [],
          screensList: [],
          stateVariables: [],
        },
      },
    ],
    edges: [
      {
        id: "snip_ce1",
        source: "snip_btn_trigger",
        target: "snip_act_incr",
        type: "smoothstep",
        style: { stroke: "#60A5FA", strokeWidth: 2 },
      },
      {
        id: "snip_ce2",
        source: "snip_act_incr",
        target: "snip_act_vib",
        type: "smoothstep",
        style: { stroke: "#60A5FA", strokeWidth: 2 },
      },
    ],
  },
];
