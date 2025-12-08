import { dijkstra } from './dijkstra';
import { bfs } from './bfs';
import { dfs } from './dfs';
import type { Node, AlgorithmType, AlgorithmResult } from '../types';

export const runAlgorithm = (
  algorithm: AlgorithmType,
  grid: Node[][],
  startNode: Node,
  finishNode: Node
): AlgorithmResult => {
  switch (algorithm) {
    case 'dijkstra':
      return dijkstra(grid, startNode, finishNode);
    case 'bfs':
      return bfs(grid, startNode, finishNode);
    case 'dfs':
      return dfs(grid, startNode, finishNode);
    default:
      return dijkstra(grid, startNode, finishNode);
  }
};

export const ALGORITHM_INFO: Record<AlgorithmType, { name: string; description: string }> = {
  dijkstra: {
    name: "Dijkstra's Algorithm",
    description: 'Guarantees shortest path. Explores in order of distance from start.'
  },
  bfs: {
    name: 'Breadth-First Search',
    description: 'Guarantees shortest path (unweighted). Explores layer by layer.'
  },
  dfs: {
    name: 'Depth-First Search',
    description: 'Does NOT guarantee shortest path. Explores deeply before backtracking.'
  },
  astar: {
    name: 'A* Search',
    description: 'Uses heuristics to find optimal path efficiently.'
  }
};
