import { useState, useCallback, useRef } from 'react';
import Grid from './components/Grid';
import Controls from './components/Controls';
import { runAlgorithm } from './algorithms';
import type { Node, AlgorithmType } from './types';
import './App.css';

const ROWS = 20;
const COLS = 50;
const START_ROW = 10;
const START_COL = 5;
const FINISH_ROW = 10;
const FINISH_COL = 45;

const createNode = (row: number, col: number): Node => ({
  row,
  col,
  isStart: row === START_ROW && col === START_COL,
  isFinish: row === FINISH_ROW && col === FINISH_COL,
  isWall: false,
  isVisited: false,
  isPath: false,
  distance: Infinity,
  previousNode: null
});

const createGrid = (): Node[][] => {
  const grid: Node[][] = [];
  for (let row = 0; row < ROWS; row++) {
    const currentRow: Node[] = [];
    for (let col = 0; col < COLS; col++) {
      currentRow.push(createNode(row, col));
    }
    grid.push(currentRow);
  }
  return grid;
};

function App() {
  const [grid, setGrid] = useState<Node[][]>(createGrid);
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('dijkstra');
  const [speed, setSpeed] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const isMouseDownRef = useRef(false);

  const handleMouseDown = useCallback((row: number, col: number) => {
    if (isRunning) return;
    const node = grid[row][col];
    if (node.isStart || node.isFinish) return;

    isMouseDownRef.current = true;
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((r) => r.map((n) => ({ ...n })));
      newGrid[row][col].isWall = !newGrid[row][col].isWall;
      return newGrid;
    });
  }, [grid, isRunning]);

  const handleMouseEnter = useCallback((row: number, col: number) => {
    if (!isMouseDownRef.current || isRunning) return;
    const node = grid[row][col];
    if (node.isStart || node.isFinish) return;

    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((r) => r.map((n) => ({ ...n })));
      newGrid[row][col].isWall = true;
      return newGrid;
    });
  }, [grid, isRunning]);

  const handleMouseUp = useCallback(() => {
    isMouseDownRef.current = false;
  }, []);

  const clearPath = useCallback(() => {
    setGrid((prevGrid) =>
      prevGrid.map((row) =>
        row.map((node) => ({
          ...node,
          isVisited: false,
          isPath: false,
          distance: Infinity,
          previousNode: null
        }))
      )
    );
    // Also clear DOM classes
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const element = document.getElementById(`node-${row}-${col}`);
        if (element) {
          element.classList.remove('node-visited', 'node-path');
        }
      }
    }
  }, []);

  const clearWalls = useCallback(() => {
    setGrid((prevGrid) =>
      prevGrid.map((row) =>
        row.map((node) => ({
          ...node,
          isWall: false,
          isVisited: false,
          isPath: false,
          distance: Infinity,
          previousNode: null
        }))
      )
    );
    // Clear DOM classes
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const element = document.getElementById(`node-${row}-${col}`);
        if (element) {
          element.classList.remove('node-visited', 'node-path', 'node-wall');
        }
      }
    }
  }, []);

  const generateMaze = useCallback(() => {
    clearWalls();
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((r) => r.map((n) => ({ ...n })));
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          if (
            !newGrid[row][col].isStart &&
            !newGrid[row][col].isFinish &&
            Math.random() < 0.3
          ) {
            newGrid[row][col].isWall = true;
          }
        }
      }
      return newGrid;
    });
  }, [clearWalls]);

  const animateAlgorithm = useCallback(
    (visitedNodesInOrder: Node[], shortestPath: Node[]) => {
      // Animate visited nodes
      for (let i = 0; i <= visitedNodesInOrder.length; i++) {
        if (i === visitedNodesInOrder.length) {
          // After visiting all nodes, animate the shortest path
          setTimeout(() => {
            animateShortestPath(shortestPath);
          }, speed * i);
          return;
        }
        setTimeout(() => {
          const node = visitedNodesInOrder[i];
          const element = document.getElementById(`node-${node.row}-${node.col}`);
          if (element && !node.isStart && !node.isFinish) {
            element.classList.add('node-visited');
          }
        }, speed * i);
      }
    },
    [speed]
  );

  const animateShortestPath = useCallback((shortestPath: Node[]) => {
    for (let i = 0; i < shortestPath.length; i++) {
      setTimeout(() => {
        const node = shortestPath[i];
        const element = document.getElementById(`node-${node.row}-${node.col}`);
        if (element && !node.isStart && !node.isFinish) {
          element.classList.remove('node-visited');
          element.classList.add('node-path');
        }
        // Mark as complete after last node
        if (i === shortestPath.length - 1) {
          setIsRunning(false);
        }
      }, 50 * i);
    }
    // If no path found
    if (shortestPath.length === 0) {
      setIsRunning(false);
    }
  }, []);

  const visualize = useCallback(() => {
    clearPath();
    setIsRunning(true);

    // Create a deep copy for the algorithm
    const gridCopy = grid.map((row) =>
      row.map((node) => ({
        ...node,
        isVisited: false,
        distance: Infinity,
        previousNode: null
      }))
    );

    const startNode = gridCopy[START_ROW][START_COL];
    const finishNode = gridCopy[FINISH_ROW][FINISH_COL];

    const { visitedNodesInOrder, shortestPath } = runAlgorithm(
      algorithm,
      gridCopy,
      startNode,
      finishNode
    );

    animateAlgorithm(visitedNodesInOrder, shortestPath);
  }, [algorithm, grid, clearPath, animateAlgorithm]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Pathfinding Visualizer</h1>
        <p>Click and drag to draw walls. Then visualize the algorithm!</p>
      </header>

      <Controls
        algorithm={algorithm}
        speed={speed}
        isRunning={isRunning}
        onAlgorithmChange={setAlgorithm}
        onSpeedChange={setSpeed}
        onVisualize={visualize}
        onClearPath={clearPath}
        onClearWalls={clearWalls}
        onGenerateMaze={generateMaze}
      />

      <div className="legend">
        <div className="legend-item">
          <div className="legend-box start"></div>
          <span>Start Node</span>
        </div>
        <div className="legend-item">
          <div className="legend-box finish"></div>
          <span>Finish Node</span>
        </div>
        <div className="legend-item">
          <div className="legend-box wall"></div>
          <span>Wall</span>
        </div>
        <div className="legend-item">
          <div className="legend-box visited"></div>
          <span>Visited</span>
        </div>
        <div className="legend-item">
          <div className="legend-box path"></div>
          <span>Shortest Path</span>
        </div>
      </div>

      <Grid
        grid={grid}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
}

export default App;
