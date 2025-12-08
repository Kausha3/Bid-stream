import type { Node } from '../types';

interface NodeComponentProps {
  node: Node;
  onMouseDown: (row: number, col: number) => void;
  onMouseEnter: (row: number, col: number) => void;
  onMouseUp: () => void;
}

const NodeComponent = ({ node, onMouseDown, onMouseEnter, onMouseUp }: NodeComponentProps) => {
  const { row, col, isStart, isFinish, isWall, isVisited, isPath } = node;

  const getClassName = () => {
    const classes = ['node'];
    if (isStart) classes.push('node-start');
    else if (isFinish) classes.push('node-finish');
    else if (isPath) classes.push('node-path');
    else if (isVisited) classes.push('node-visited');
    if (isWall) classes.push('node-wall');
    return classes.join(' ');
  };

  return (
    <div
      id={`node-${row}-${col}`}
      className={getClassName()}
      onMouseDown={() => onMouseDown(row, col)}
      onMouseEnter={() => onMouseEnter(row, col)}
      onMouseUp={onMouseUp}
    />
  );
};

export default NodeComponent;
