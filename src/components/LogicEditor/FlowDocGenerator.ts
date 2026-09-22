import { AndroidScreen, StateVariable } from "../../types";
import { FlowNode, FlowEdge } from "./types";

export function generateFlowDocumentationMarkdown(
  screen: AndroidScreen,
  nodes: FlowNode[],
  edges: FlowEdge[]
): string {
  const dateStr = new Date().toISOString().split("T")[0];
  const triggerNodes = nodes.filter((n) => n.type === "trigger");
  const conditionNodes = nodes.filter((n) => n.type === "condition");
  const actionNodes = nodes.filter((n) => n.type === "action" || n.type === "apiBranch");
  const noteNodes = nodes.filter((n) => n.type === "note");

  let md = `# Flow Documentation: ${screen.title || screen.name}\n\n`;
  md += `**Generated Date:** ${dateStr}  \n`;
  md += `**Screen Name:** \`${screen.name}\`  \n`;
  md += `**Total Logic Triggers:** ${triggerNodes.length}  \n`;
  md += `**Total Decision Conditions:** ${conditionNodes.length}  \n`;
  md += `**Total Flow Actions:** ${actionNodes.length}  \n\n`;

  md += `---\n\n`;

  // State Variables Section
  md += `## 1. State Variables & Scope\n\n`;
  const vars = screen.stateVariables || [];
  if (vars.length === 0) {
    md += `*No local state variables defined for this screen.*\n\n`;
  } else {
    md += `| Variable Name | Type | Initial Value | Description |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    vars.forEach((v) => {
      md += `| \`${v.name}\` | \`${v.type}\` | \`${v.initialValue || '""'}\` | ${v.description || "State variable"} |\n`;
    });
    md += `\n`;
  }

  md += `---\n\n`;

  // Documentation Notes
  if (noteNodes.length > 0) {
    md += `## 2. Business Logic Notes & Comments\n\n`;
    noteNodes.forEach((noteNode) => {
      const data = noteNode.data as any;
      md += `### 📌 ${data.title || "Note"}\n`;
      md += `${data.text || "No details."}\n\n`;
    });
    md += `---\n\n`;
  }

  // Trigger Flows Section
  md += `## 3. Event Triggers & Action Flow Graphs\n\n`;

  if (triggerNodes.length === 0) {
    md += `*No trigger events configured on this canvas yet.*\n\n`;
  } else {
    triggerNodes.forEach((tNode, idx) => {
      const tData = tNode.data as any;
      md += `### Flow ${idx + 1}: ⚡ \`${tData.componentName || "Component"}\` • \`${tData.event || "Click"}\`\n\n`;
      md += `- **Target Component ID:** \`${tData.componentId || "N/A"}\`\n`;
      md += `- **Event:** \`${tData.event || "Click"}\`\n`;
      md += `- **Status:** ${tData.enabled !== false ? "🟢 Enabled" : "🔴 Disabled"}\n\n`;

      md += `#### Connected Actions & Decision Branches:\n\n`;

      // Traverse graph from this trigger node
      const buildTreeDoc = (currentNodeId: string, depth: number = 1): string => {
        let treeText = "";
        const outEdges = edges.filter((e) => e.source === currentNodeId);

        outEdges.forEach((edge) => {
          const childNode = nodes.find((n) => n.id === edge.target);
          if (!childNode) return;
          const cData = childNode.data as any;
          const indent = "  ".repeat(depth);

          if (childNode.type === "action") {
            const act = cData.action || {};
            treeText += `${indent}- **Action:** \`${act.actionType || "setProperty"}\``;
            if (act.property && act.value) treeText += ` (Set \`${act.property}\` = \`${act.value}\`)`;
            if (act.message) treeText += ` (Message: "${act.message}")`;
            if (act.targetScreen) treeText += ` (Navigate to \`${act.targetScreen}\`)`;
            treeText += `\n`;
          } else if (childNode.type === "condition") {
            const cond = cData.condition || {};
            const branchLabel = edge.label || (edge.sourceHandle === "branch-yes" ? "YES ✓" : "NO ✕");
            treeText += `${indent}- **Condition Check [${branchLabel}]:** \`${cond.left} ${cond.operator} ${cond.right}\`\n`;
          } else if (childNode.type === "apiBranch") {
            const act = cData.action || {};
            const branchLabel = edge.label || (edge.sourceHandle === "branch-success" ? "SUCCESS 200" : "FAILURE");
            treeText += `${indent}- **API Endpoint [${branchLabel}]:** \`${act.method || "POST"} ${act.endpoint || "/api"}\`\n`;
          }

          treeText += buildTreeDoc(childNode.id, depth + 1);
        });

        return treeText;
      };

      const flowTree = buildTreeDoc(tNode.id);
      if (flowTree) {
        md += flowTree + `\n`;
      } else {
        md += `*No actions connected to this trigger yet.*\n\n`;
      }
    });
  }

  md += `---\n\n`;
  md += `*Documentation compiled automatically by DroidForge Studio Visual Logic Engine.*\n`;

  return md;
}
