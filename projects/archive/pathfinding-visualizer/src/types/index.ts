export interface Node {
  row: number;
  col: number;
  isStart: boolean;
  isFinish: boolean;
  isWall: boolean;
  isVisited: boolean;
  isPath: boolean;
  distance: number;
  previousNode: Node | null;
}

export type AlgorithmType = 'dijkstra' | 'bfs' | 'dfs' | 'astar';

export interface AlgorithmResult {
  visitedNodesInOrder: Node[];
  shortestPath: Node[];
}
