import type { Node, AlgorithmResult } from '../types';

export const dfs = (
  grid: Node[][],
  startNode: Node,
  finishNode: Node
): AlgorithmResult => {
  const visitedNodesInOrder: Node[] = [];
  const stack: Node[] = [startNode];

  while (stack.length > 0) {
    const currentNode = stack.pop()!;

    // Skip if already visited or is a wall
    if (currentNode.isVisited || currentNode.isWall) continue;

    currentNode.isVisited = true;
    visitedNodesInOrder.push(currentNode);

    // Found the finish
    if (currentNode === finishNode) {
      return {
        visitedNodesInOrder,
        shortestPath: getShortestPath(finishNode)
      };
    }

    // Add unvisited neighbors to stack
    const neighbors = getUnvisitedNeighbors(currentNode, grid);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        neighbor.previousNode = currentNode;
        stack.push(neighbor);
      }
    }
  }

  return { visitedNodesInOrder, shortestPath: [] };
};

const getUnvisitedNeighbors = (node: Node, grid: Node[][]): Node[] => {
  const neighbors: Node[] = [];
  const { row, col } = node;

  // Add in reverse order so we explore in a more natural direction
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (row > 0) neighbors.push(grid[row - 1][col]);

  return neighbors.filter((neighbor) => !neighbor.isWall);
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
