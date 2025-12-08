import type { Node, AlgorithmResult } from '../types';

export const dijkstra = (
  grid: Node[][],
  startNode: Node,
  finishNode: Node
): AlgorithmResult => {
  const visitedNodesInOrder: Node[] = [];
  startNode.distance = 0;
  const unvisitedNodes = getAllNodes(grid);

  while (unvisitedNodes.length > 0) {
    sortNodesByDistance(unvisitedNodes);
    const closestNode = unvisitedNodes.shift()!;

    // If we encounter a wall, skip it
    if (closestNode.isWall) continue;

    // If the closest node is at distance Infinity, we're trapped
    if (closestNode.distance === Infinity) {
      return { visitedNodesInOrder, shortestPath: [] };
    }

    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);

    // If we reached the finish, reconstruct the path
    if (closestNode === finishNode) {
      return {
        visitedNodesInOrder,
        shortestPath: getShortestPath(finishNode)
      };
    }

    updateUnvisitedNeighbors(closestNode, grid);
  }

  return { visitedNodesInOrder, shortestPath: [] };
};

const getAllNodes = (grid: Node[][]): Node[] => {
  const nodes: Node[] = [];
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node);
    }
  }
  return nodes;
};

const sortNodesByDistance = (unvisitedNodes: Node[]): void => {
  unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
};

const updateUnvisitedNeighbors = (node: Node, grid: Node[][]): void => {
  const neighbors = getUnvisitedNeighbors(node, grid);
  for (const neighbor of neighbors) {
    neighbor.distance = node.distance + 1;
    neighbor.previousNode = node;
  }
};

const getUnvisitedNeighbors = (node: Node, grid: Node[][]): Node[] => {
  const neighbors: Node[] = [];
  const { row, col } = node;

  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);

  return neighbors.filter((neighbor) => !neighbor.isVisited);
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
