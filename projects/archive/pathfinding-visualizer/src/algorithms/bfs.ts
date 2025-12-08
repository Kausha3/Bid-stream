import type { Node, AlgorithmResult } from '../types';

export const bfs = (
  grid: Node[][],
  startNode: Node,
  finishNode: Node
): AlgorithmResult => {
  const visitedNodesInOrder: Node[] = [];
  const queue: Node[] = [startNode];
  startNode.isVisited = true;

  while (queue.length > 0) {
    const currentNode = queue.shift()!;

    // Skip walls
    if (currentNode.isWall) continue;

    visitedNodesInOrder.push(currentNode);

    // Found the finish
    if (currentNode === finishNode) {
      return {
        visitedNodesInOrder,
        shortestPath: getShortestPath(finishNode)
      };
    }

    // Add unvisited neighbors to queue
    const neighbors = getUnvisitedNeighbors(currentNode, grid);
    for (const neighbor of neighbors) {
      neighbor.isVisited = true;
      neighbor.previousNode = currentNode;
      queue.push(neighbor);
    }
  }

  return { visitedNodesInOrder, shortestPath: [] };
};

const getUnvisitedNeighbors = (node: Node, grid: Node[][]): Node[] => {
  const neighbors: Node[] = [];
  const { row, col } = node;

  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);

  return neighbors.filter((neighbor) => !neighbor.isVisited && !neighbor.isWall);
};

const getShortestPath = (finishNode: Node): Node[] => {
  const path: Node[] = [];
  let currentNode: Node | null = finishNode;
  while (currentNode !== null) {
    path.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return path;
};
