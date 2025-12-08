import type { AlgorithmType } from '../types';
import { ALGORITHM_INFO } from '../algorithms';

interface ControlsProps {
  algorithm: AlgorithmType;
  speed: number;
  isRunning: boolean;
  onAlgorithmChange: (algorithm: AlgorithmType) => void;
  onSpeedChange: (speed: number) => void;
  onVisualize: () => void;
  onClearPath: () => void;
  onClearWalls: () => void;
  onGenerateMaze: () => void;
}

const Controls = ({
  algorithm,
  speed,
  isRunning,
  onAlgorithmChange,
  onSpeedChange,
  onVisualize,
  onClearPath,
  onClearWalls,
  onGenerateMaze
}: ControlsProps) => {
  const algorithms: AlgorithmType[] = ['dijkstra', 'bfs', 'dfs'];

  return (
    <div className="controls">
      <div className="control-group">
        <label>Algorithm</label>
        <select
          value={algorithm}
          onChange={(e) => onAlgorithmChange(e.target.value as AlgorithmType)}
          disabled={isRunning}
        >
          {algorithms.map((algo) => (
            <option key={algo} value={algo}>
              {ALGORITHM_INFO[algo].name}
            </option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label>Speed: {speed === 1 ? 'Fast' : speed === 5 ? 'Medium' : 'Slow'}</label>
        <input
          type="range"
          min="1"
          max="20"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          disabled={isRunning}
        />
      </div>

      <div className="button-group">
        <button
          className="btn btn-primary"
          onClick={onVisualize}
          disabled={isRunning}
        >
          {isRunning ? 'Visualizing...' : 'Visualize!'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={onClearPath}
          disabled={isRunning}
        >
          Clear Path
        </button>
        <button
          className="btn btn-secondary"
          onClick={onClearWalls}
          disabled={isRunning}
        >
          Clear Walls
        </button>
        <button
          className="btn btn-secondary"
          onClick={onGenerateMaze}
          disabled={isRunning}
        >
          Generate Maze
        </button>
      </div>

      <div className="algorithm-info">
        <strong>{ALGORITHM_INFO[algorithm].name}</strong>
        <p>{ALGORITHM_INFO[algorithm].description}</p>
      </div>
    </div>
  );
};

export default Controls;
