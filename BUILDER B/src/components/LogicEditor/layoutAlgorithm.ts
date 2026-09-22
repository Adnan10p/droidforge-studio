import * as d3 from "d3";
import { FlowNode, FlowEdge } from "./types";

interface D3LayoutNode extends d3.SimulationNodeDatum {
  id: string;
  originalNode: FlowNode;
  level: number;
  targetX: number;
  targetY: number;
  width: number;
  height: number;
}

interface D3LayoutLink extends d3.SimulationLinkDatum<D3LayoutNode> {
  source: string | D3LayoutNode;
  target: string | D3LayoutNode;
  branch?: string;
}

/**
 * Reorganizes all nodes and connections into a clean, hierarchical tree layout
 * using D3 force-directed simulation with topological layering and link constraints.
 * Maintains all existing connectivity while preventing node overlaps.
 */
export function calculateForceDirectedLayout(
  nodes: FlowNode[],
  edges: FlowEdge[],
  iterations: number = 100
): FlowNode[] {
  if (nodes.length === 0) return [];

  const nodeMap = new Map<string, FlowNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  // 1. Identify Root Triggers & Source-less Nodes
  const hasIncoming = new Set<string>();
  edges.forEach((e) => hasIncoming.add(e.target));

  const rootIds: string[] = [];
  nodes.forEach((n) => {
    if (n.type === "trigger" || !hasIncoming.has(n.id)) {
      rootIds.push(n.id);
    }
  });

  // If cycle or no clear root, fallback to first node
  if (rootIds.length === 0 && nodes.length > 0) {
    rootIds.push(nodes[0].id);
  }

  // 2. Compute Hierarchical Levels (Topological Leveling)
  const levelMap = new Map<string, number>();
  nodes.forEach((n) => {
    levelMap.set(n.id, n.type === "trigger" ? 0 : 1);
  });

  const queue: Array<{ id: string; level: number }> = [];
  rootIds.forEach((id) => {
    levelMap.set(id, 0);
    queue.push({ id, level: 0 });
  });

  const visited = new Set<string>();
  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);

    const outEdges = edges.filter((e) => e.source === id);
    for (const e of outEdges) {
      const nextLevel = level + 1;
      const currentMax = levelMap.get(e.target) ?? 0;
      if (nextLevel > currentMax) {
        levelMap.set(e.target, nextLevel);
      }
      queue.push({ id: e.target, level: nextLevel });
    }
  }

  // Group nodes by level
  const levels: Map<number, string[]> = new Map();
  nodes.forEach((n) => {
    const lvl = levelMap.get(n.id) ?? 0;
    if (!levels.has(lvl)) {
      levels.set(lvl, []);
    }
    levels.get(lvl)!.push(n.id);
  });

  // 3. Compute initial target coordinates with branch separation
  const targetCoords = new Map<string, { x: number; y: number }>();
  const VERTICAL_SPACING = 210;
  const HORIZONTAL_SPACING = 340;

  // Position root nodes spread out horizontally
  const maxLevel = Math.max(...Array.from(levels.keys()), 0);

  // Position levels systematically
  Array.from(levels.entries())
    .sort(([a], [b]) => a - b)
    .forEach(([lvl, nodeIdsInLevel]) => {
      const totalWidth = (nodeIdsInLevel.length - 1) * HORIZONTAL_SPACING;
      const startX = 300 - totalWidth / 2;

      nodeIdsInLevel.forEach((id, index) => {
        const node = nodeMap.get(id);
        const y = 80 + lvl * VERTICAL_SPACING;
        let x = startX + index * HORIZONTAL_SPACING;

        // Check if node is connected from a condition/api branch
        const inEdge = edges.find((e) => e.target === id);
        if (inEdge && inEdge.sourceHandle) {
          const parentCoord = targetCoords.get(inEdge.source);
          if (parentCoord) {
            if (inEdge.sourceHandle === "condition-true" || inEdge.sourceHandle === "branch-success") {
              x = parentCoord.x - 180;
            } else if (inEdge.sourceHandle === "condition-false" || inEdge.sourceHandle === "branch-failure") {
              x = parentCoord.x + 180;
            }
          }
        }

        targetCoords.set(id, { x, y });
      });
    });

  // 4. Create D3 Simulation Entities
  const d3Nodes: D3LayoutNode[] = nodes.map((node) => {
    const coords = targetCoords.get(node.id) || { x: node.position.x || 100, y: node.position.y || 100 };
    const lvl = levelMap.get(node.id) || 0;
    return {
      id: node.id,
      originalNode: node,
      level: lvl,
      targetX: coords.x,
      targetY: coords.y,
      x: coords.x,
      y: coords.y,
      width: 300,
      height: 120,
    };
  });

  const d3Links: D3LayoutLink[] = edges
    .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target))
    .map((e) => ({
      source: e.source,
      target: e.target,
      branch: e.sourceHandle || undefined,
    }));

  // 5. Run D3 Force Simulation
  // Using d3.forceSimulation with Coulomb repulsion, Hooke's link force, and hierarchical Y-gravity
  const simulation = d3
    .forceSimulation<D3LayoutNode>(d3Nodes)
    .force(
      "link",
      d3
        .forceLink<D3LayoutNode, D3LayoutLink>(d3Links)
        .id((d) => d.id)
        .distance(VERTICAL_SPACING * 0.95)
        .strength(0.7)
    )
    .force("charge", d3.forceManyBody().strength(-1200).distanceMax(900))
    .force("collide", d3.forceCollide<D3LayoutNode>().radius(170).strength(0.95))
    .force(
      "y",
      d3
        .forceY<D3LayoutNode>((d) => d.targetY)
        .strength(0.85)
    )
    .force(
      "x",
      d3
        .forceX<D3LayoutNode>((d) => d.targetX)
        .strength(0.4)
    )
    .stop();

  // Run synchronous ticks
  const tickCount = Math.max(iterations, 80);
  for (let i = 0; i < tickCount; i++) {
    simulation.tick();
  }

  // 6. Find minimum X and Y to normalize origin with comfortable margin
  let minX = Infinity;
  let minY = Infinity;
  d3Nodes.forEach((d) => {
    if (d.x !== undefined && d.x < minX) minX = d.x;
    if (d.y !== undefined && d.y < minY) minY = d.y;
  });

  const offsetX = minX < 80 ? 80 - minX : 0;
  const offsetY = minY < 60 ? 60 - minY : 0;

  // 7. Produce final arranged FlowNodes
  const resultMap = new Map<string, { x: number; y: number }>();
  d3Nodes.forEach((d) => {
    resultMap.set(d.id, {
      x: Math.round((d.x ?? d.targetX) + offsetX),
      y: Math.round((d.y ?? d.targetY) + offsetY),
    });
  });

  return nodes.map((node) => {
    const pos = resultMap.get(node.id);
    if (!pos) return node;
    return {
      ...node,
      position: {
        x: pos.x,
        y: pos.y,
      },
    };
  });
}
