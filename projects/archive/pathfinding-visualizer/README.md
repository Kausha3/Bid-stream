# Pathfinding Visualizer

An interactive visualization of pathfinding algorithms including Dijkstra's, BFS, and DFS.

## Features

- **Multiple Algorithms**: Dijkstra's, Breadth-First Search, Depth-First Search
- **Wall Drawing**: Click and drag to create obstacles
- **Maze Generation**: Random maze generator
- **Speed Control**: Adjustable animation speed
- **Visual Feedback**: Animated visualization of node exploration and shortest path

## Tech Stack

- React 19 + TypeScript
- Vite (build tool)
- CSS3 Animations

## Key Learning Concepts

1. **Graph Algorithms**: Implementing Dijkstra, BFS, DFS from scratch
2. **Animation with setTimeout**: Staggered animations using delay increments
3. **2D Grid State**: Managing complex grid state in React
4. **CSS Animations**: Keyframe animations for visual effects
5. **DOM Manipulation**: Direct class manipulation for performance

## Algorithms Explained

### Dijkstra's Algorithm
- Guarantees shortest path
- Explores nodes in order of distance from start
- Time: O((V + E) log V) with priority queue

### Breadth-First Search (BFS)
- Guarantees shortest path (unweighted graphs)
- Explores layer by layer (level order)
- Time: O(V + E)

### Depth-First Search (DFS)
- Does NOT guarantee shortest path
- Explores deeply before backtracking
- Time: O(V + E)

## Project Structure

```
src/
├── algorithms/
│   ├── dijkstra.ts    # Dijkstra's algorithm
│   ├── bfs.ts         # Breadth-First Search
│   ├── dfs.ts         # Depth-First Search
│   └── index.ts       # Algorithm runner
├── components/
│   ├── Grid.tsx       # Grid container
│   ├── NodeComponent.tsx  # Individual node
│   └── Controls.tsx   # Control panel
├── types/
│   └── index.ts       # TypeScript interfaces
├── App.tsx            # Main app with state management
└── App.css            # Styles and animations
```

## How It Works

1. **Grid Creation**: 20x50 grid of nodes with start/finish positions
2. **Wall Drawing**: Mouse events toggle wall state
3. **Algorithm Execution**: Runs on grid copy, returns visited nodes in order
4. **Animation Loop**:
   ```javascript
   for (let i = 0; i < visitedNodesInOrder.length; i++) {
     setTimeout(() => {
       const node = visitedNodesInOrder[i];
       document.getElementById(`node-${node.row}-${node.col}`)
         .classList.add('node-visited');
     }, 10 * i); // Delay increases for each node
   }
   ```

## The Secret Sauce

**CSS Transitions**: The JavaScript only changes class names. The CSS handles the visual effects:

```css
.node-visited {
  animation: visitedAnimation 0.5s ease-out;
}

@keyframes visitedAnimation {
  0% { transform: scale(0.3); border-radius: 50%; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

This creates the satisfying "pop" effect as each node is visited.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:5173` and start visualizing!
