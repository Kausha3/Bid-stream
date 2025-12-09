// ============================================================
// DATA ARRAYS - Externalized for maintainability
// ============================================================

// Project data
const PROJECTS_DATA = [
    // ============ FRONTEND PROJECTS ============
    {
        id: 'whiteboard',
        title: 'Collaborative Whiteboard',
        subtitle: '// REAL-TIME COLLABORATION',
        category: 'frontend',
        shortDesc: 'Real-time drawing & collaboration tool',
        description: `A powerful real-time collaborative drawing application that enables multiple users to sketch, annotate, and brainstorm together seamlessly. Built with modern web technologies, it features smooth drawing performance, live cursor tracking, and instant synchronization across all connected clients.

The whiteboard supports various drawing tools including freehand brush, shapes, text annotations, and color customization. Perfect for remote teams, online education, and creative collaboration.`,
        tech: ['React', 'Canvas API', 'WebSocket', 'Node.js', 'Vite', 'TypeScript'],
        features: [
            'Real-time multi-user collaboration with live cursors',
            'Smooth freehand drawing with pressure sensitivity',
            'Shape tools: rectangles, circles, lines, arrows',
            'Text annotations with custom fonts and colors',
            'Infinite canvas with pan and zoom',
            'Export to PNG/SVG formats',
            'Room-based sessions with shareable links',
            'Undo/Redo history for all users'
        ],
        github: 'https://github.com/kaushatrivedi',
        live: 'http://localhost:3002',
        image: null
    },
    {
        id: 'f1-dashboard',
        title: 'F1 Telemetry Dashboard',
        subtitle: '// REAL-TIME DATA VISUALIZATION',
        category: 'frontend',
        shortDesc: '60Hz real-time data visualization',
        description: `A high-performance Formula 1 telemetry visualization dashboard built with React and Canvas API. The system simulates a 60Hz data stream (mimicking real F1 telemetry) and renders live graphs, gauges, and metrics with zero frame drops.

Features a physics-based car simulator that generates realistic speed, RPM, gear shifts, throttle/brake inputs, and DRS activation. The dashboard supports live monitoring and historical replay with timeline scrubbing.`,
        tech: ['React', 'TypeScript', 'Canvas API', 'Tailwind CSS', 'Vite', 'Lucide Icons'],
        features: [
            'Real-time 60Hz data streaming simulation',
            'Live telemetry graphs (Speed, Throttle, Brake)',
            'Physics-based car simulator with gear ratios',
            'Giant gear indicator with RPM redline warning',
            'Throttle & brake pedal visualizations',
            'DRS activation indicator',
            'Replay mode with timeline scrubbing',
            '2000-frame circular buffer (~33 seconds)'
        ],
        github: 'https://github.com/kaushatrivedi',
        live: 'http://localhost:3001',
        image: null
    },

    // ============ BACKEND PROJECTS ============
    {
        id: 'rate-limitr',
        title: 'Rate-Limitr',
        subtitle: '// DISTRIBUTED RATE LIMITING',
        category: 'backend',
        shortDesc: 'Production-grade rate limiting service',
        description: `A production-grade distributed rate limiting service built with Spring Boot and Redis. Implements multiple rate limiting algorithms (Token Bucket, Sliding Window, Fixed Window) with a clean Strategy pattern architecture.

Designed for horizontal scaling with Redis as the distributed state store, featuring Docker containerization, Nginx load balancing, and comprehensive test coverage. Perfect for protecting APIs from abuse and ensuring fair resource allocation.`,
        tech: ['Java', 'Spring Boot', 'Redis', 'Docker', 'Nginx', 'JUnit'],
        features: [
            'Multiple algorithms: Token Bucket, Sliding Window, Fixed Window',
            'Strategy pattern for pluggable rate limiting logic',
            'Redis-backed distributed state management',
            'Horizontal scaling with Nginx load balancing',
            'RESTful API with comprehensive error handling',
            'Docker Compose for local development',
            'Extensive unit and integration tests',
            'Configurable rate limits per client/endpoint'
        ],
        github: 'https://github.com/kaushatrivedi',
        live: null,
        image: null
    },
    {
        id: 'taskqueue-pro',
        title: 'TaskQueue Pro',
        subtitle: '// DISTRIBUTED JOB QUEUE',
        category: 'backend',
        shortDesc: 'Enterprise job queue with priority scheduling',
        description: `A robust distributed job queue system built with Spring Boot, PostgreSQL, and Redis. Features priority-based scheduling, worker management, and reliable job processing with retry mechanisms and dead letter handling.

Supports multiple job types (Email, Payment, Report) with a pluggable processor architecture. Includes distributed locking for safe concurrent processing and comprehensive monitoring endpoints.`,
        tech: ['Java', 'Spring Boot', 'PostgreSQL', 'Redis', 'Docker', 'Flyway'],
        features: [
            'Priority-based job scheduling (HIGH, MEDIUM, LOW)',
            'Pluggable job processor architecture',
            'Distributed locking for concurrent safety',
            'Automatic retry with exponential backoff',
            'Worker heartbeat and health monitoring',
            'Queue pause/resume functionality',
            'Flyway database migrations',
            'Docker Compose with multi-service orchestration'
        ],
        github: 'https://github.com/kaushatrivedi',
        live: null,
        image: null
    },

    // ============ FULL-STACK PROJECTS ============
    {
        id: 'smart-pantry',
        title: 'SmartPantry',
        subtitle: '// AI-POWERED FOOD WASTE REDUCTION',
        category: 'fullstack',
        shortDesc: 'AI receipt scanner + recipe matcher',
        description: `An intelligent pantry management app that reduces food waste through AI-powered receipt scanning and smart recipe suggestions. The app uses a hybrid AI pipeline: Tesseract.js for OCR text extraction, then GPT-4 for semantic parsing and ingredient categorization.

The system automatically infers expiry dates based on food category (Produce: +7 days, Dairy: +14 days, Meat: +4 days) and suggests recipes that prioritize ingredients expiring soon. Features optimistic UI patterns showing estimated results while backend confirms confidence scores.`,
        tech: ['React', 'TypeScript', 'Tailwind CSS', 'Tesseract.js', 'OpenAI GPT-4', 'Python/FastAPI'],
        features: [
            'AI receipt scanning with OCR + GPT-4 parsing pipeline',
            'Smart expiry date inference by food category',
            'Recipe matching engine prioritizing expiring items',
            'Optimistic UI with confidence scores',
            'Mobile-first responsive design',
            'Real-time inventory management',
            '80% API cost reduction via Tesseract pre-processing',
            'LLM streaming debug visualization'
        ],
        github: 'https://github.com/kaushatrivedi',
        live: 'http://localhost:3003',
        image: null
    },
    {
        id: 'featureflag-manager',
        title: 'Feature Flag Manager',
        subtitle: '// PROGRESSIVE ROLLOUT PLATFORM',
        category: 'fullstack',
        shortDesc: 'Feature flag management with targeting rules',
        description: `A full-stack feature flag management platform enabling progressive rollouts and A/B testing. The React frontend provides a dashboard for creating, managing, and monitoring feature flags, while the Spring Boot backend handles flag evaluation with sophisticated targeting rules.

Supports percentage-based rollouts, user segmentation, and real-time analytics tracking. Features Redis caching for sub-millisecond flag evaluations and async analytics processing for high-throughput scenarios.`,
        tech: ['React', 'TypeScript', 'Vite', 'Java', 'Spring Boot', 'PostgreSQL', 'Redis'],
        features: [
            'Real-time feature flag toggle dashboard',
            'Percentage-based progressive rollouts',
            'User targeting rules (user ID, attributes)',
            'Redis-cached flag evaluations (<1ms latency)',
            'Async analytics with evaluation tracking',
            'Flag versioning and audit history',
            'RESTful evaluation API for client SDKs',
            'Flyway database migrations'
        ],
        github: 'https://github.com/kaushatrivedi',
        live: null,
        image: null
    }
];

// Archived projects data (displayed via terminal command)
const ARCHIVES_DATA = [
    {
        id: 'pathfinding-visualizer',
        title: 'Pathfinding Visualizer',
        subtitle: '// DIJKSTRA + BFS + DFS',
        shortDesc: 'Interactive graph algorithm visualization',
        description: `An interactive visualization tool for exploring classic graph traversal and pathfinding algorithms. Users can draw walls, set start/end points, and watch algorithms like Dijkstra's, BFS, and DFS find the optimal path in real-time.

The visualizer provides step-by-step animation showing how each algorithm explores nodes differently, making it an excellent educational tool for understanding algorithmic complexity and behavior.`,
        tech: ['React', 'TypeScript', 'Canvas API', 'Vite'],
        features: [
            'Dijkstra\'s shortest path algorithm',
            'Breadth-First Search (BFS) visualization',
            'Depth-First Search (DFS) visualization',
            'Interactive wall drawing with click & drag',
            'Adjustable animation speed',
            'Clear path and reset grid options',
            'Visual comparison of algorithm efficiency'
        ],
        github: 'https://github.com/kaushatrivedi'
    },
    {
        id: 'music-visualizer',
        title: 'Music Visualizer',
        subtitle: '// WEB AUDIO API + FFT',
        shortDesc: 'Real-time audio visualization with multiple modes',
        description: `A real-time audio visualizer using the Web Audio API with multiple visualization styles. Drag and drop any audio file to see frequency data transformed into stunning visual displays.

Uses FFT (Fast Fourier Transform) analysis via the AnalyserNode to extract frequency and waveform data, rendered at 60fps using the Canvas API with requestAnimationFrame.`,
        tech: ['React', 'TypeScript', 'Web Audio API', 'Canvas'],
        features: [
            'Drag & drop audio file upload',
            'Frequency bars visualization mode',
            'Real-time waveform oscilloscope view',
            'Circular radial frequency display',
            'Multiple color schemes (Rainbow, Gradient, Solid)',
            'Playback controls with seek and volume',
            '60fps smooth animations'
        ],
        github: 'https://github.com/kaushatrivedi'
    },
    {
        id: 'chat-app',
        title: 'Real-Time Chat',
        subtitle: '// SOCKET.IO + ROOMS',
        shortDesc: 'WebSocket chat with typing indicators',
        description: `A real-time chat application built with Socket.io for instant bi-directional communication. Features room-based conversations, live typing indicators, and message history.

Demonstrates WebSocket fundamentals including connection management, event-driven architecture, and real-time state synchronization across multiple clients.`,
        tech: ['React', 'Node.js', 'Socket.io', 'TypeScript'],
        features: [
            'Real-time message delivery via WebSockets',
            'Room-based chat with join/leave notifications',
            'Live typing indicators',
            'User presence status (online/offline)',
            'Message timestamps and read receipts',
            'Responsive mobile-friendly design'
        ],
        github: 'https://github.com/kaushatrivedi'
    },
    {
        id: 'mini-stackoverflow',
        title: 'Mini StackOverflow',
        subtitle: '// MONGODB RELATIONSHIPS + VOTING',
        shortDesc: 'Q&A platform with reputation system',
        description: `A simplified Stack Overflow clone demonstrating complex MongoDB relationships, reputation systems, and voting mechanics. Users can ask questions, post answers, and participate in community-driven content curation.

Features polymorphic references, compound unique indexes for vote tracking, and a points-based reputation system that rewards helpful contributions.`,
        tech: ['React', 'Node.js', 'MongoDB', 'JWT'],
        features: [
            'User authentication with JWT',
            'Upvote/downvote system for questions and answers',
            'Accept answer functionality for question authors',
            'Tag system with auto-creation',
            'Reputation system with point rewards',
            'Sort by newest, votes, or unanswered',
            'Compound indexes to prevent duplicate votes'
        ],
        github: 'https://github.com/kaushatrivedi'
    },
    {
        id: 'recipe-book',
        title: 'Recipe Book',
        subtitle: '// MERN + JWT AUTH',
        shortDesc: 'Full-stack recipe manager with authentication',
        description: `A full-stack MERN application for managing personal recipes with user authentication. Features a clean interface for creating, editing, and organizing recipes with ingredients and step-by-step instructions.

Implements JWT-based authentication with protected routes, ensuring users can only manage their own recipe collections.`,
        tech: ['React', 'Node.js', 'MongoDB', 'JWT'],
        features: [
            'User registration and login with JWT',
            'Create, read, update, delete recipes',
            'Ingredient list management',
            'Step-by-step cooking instructions',
            'Recipe categorization and filtering',
            'Protected routes for authenticated users'
        ],
        github: 'https://github.com/kaushatrivedi'
    },
    {
        id: 'expense-tracker',
        title: 'Expense Tracker',
        subtitle: '// CHART.JS + AGGREGATION',
        shortDesc: 'Financial tracking with data visualization',
        description: `A full-stack expense tracking application with data visualization using Chart.js and MongoDB aggregation pipelines. Track income and expenses with category breakdowns and trend analysis.

Leverages MongoDB's aggregation framework ($match, $group, $sort) for efficient server-side data analysis and Chart.js for interactive pie and bar chart visualizations.`,
        tech: ['React', 'Node.js', 'MongoDB', 'Chart.js'],
        features: [
            'Track income and expenses with categories',
            'Summary cards showing totals and balance',
            'Period filtering (week, month, year)',
            'Pie chart for category breakdown',
            'Bar chart for income vs expenses trend',
            'MongoDB aggregation for analytics'
        ],
        github: 'https://github.com/kaushatrivedi'
    },
    {
        id: 'weather-app',
        title: 'Weather App',
        subtitle: '// OPENWEATHERMAP API',
        shortDesc: 'Real-time weather with custom hooks',
        description: `A clean weather application fetching real-time data from the OpenWeatherMap API. Features location-based weather lookup with current conditions, forecasts, and atmospheric details.

Built with custom React hooks for data fetching and state management, demonstrating clean separation of concerns and reusable logic patterns.`,
        tech: ['React', 'TypeScript', 'Vite', 'REST API'],
        features: [
            'Current weather conditions display',
            'Location search by city name',
            'Temperature, humidity, wind speed data',
            'Weather icons and condition descriptions',
            'Custom useWeather hook for data fetching',
            'Error handling for API failures'
        ],
        github: 'https://github.com/kaushatrivedi'
    },
    {
        id: 'drowsiness-detection',
        title: 'Drowsiness Detection',
        subtitle: '// COMPUTER VISION + EAR',
        shortDesc: 'Real-time driver alertness monitoring',
        description: `A real-time drowsiness detection system using computer vision to monitor driver alertness and prevent accidents. Uses the Eye Aspect Ratio (EAR) algorithm with MediaPipe Face Mesh for facial landmark detection.

The system calculates eye openness from 6 landmarks per eye and triggers alerts when EAR drops below threshold for consecutive frames, with smoothing to prevent false positives from blinking.`,
        tech: ['Python', 'OpenCV', 'MediaPipe', 'NumPy'],
        features: [
            'Real-time webcam processing',
            'Eye Aspect Ratio (EAR) algorithm',
            'MediaPipe Face Mesh landmark detection',
            'Visual EAR display overlay',
            'Drowsiness alert with screen flash',
            'Adjustable sensitivity threshold',
            '30-frame rolling average for smoothing'
        ],
        github: 'https://github.com/kaushatrivedi'
    },
    {
        id: 'sorting-visualizer',
        title: 'Sorting Visualizer',
        subtitle: '// ALGORITHM ANIMATION',
        shortDesc: 'Bubble, Merge, Quick sort animations',
        description: `An interactive visualization tool for understanding sorting algorithms. Watch Bubble Sort, Merge Sort, and Quick Sort in action with step-by-step animations showing comparisons and swaps.

Great for learning algorithmic complexity differences—see how O(n²) algorithms compare to O(n log n) on various array sizes.`,
        tech: ['JavaScript', 'HTML', 'CSS'],
        features: [
            'Bubble Sort visualization',
            'Merge Sort visualization',
            'Quick Sort visualization',
            'Adjustable array size',
            'Variable animation speed',
            'Color-coded comparisons and swaps',
            'Generate new random arrays'
        ],
        github: 'https://github.com/kaushatrivedi'
    },
    {
        id: 'calculator',
        title: 'Calculator',
        subtitle: '// OOP DESIGN',
        shortDesc: 'Clean calculator with keyboard support',
        description: `A clean, functional calculator built with object-oriented JavaScript principles. Features a responsive design with both click and keyboard input support.

Demonstrates OOP patterns with a Calculator class managing state, operations, and display updates through encapsulated methods.`,
        tech: ['JavaScript', 'HTML', 'CSS'],
        features: [
            'Basic arithmetic operations (+, -, ×, ÷)',
            'Keyboard input support',
            'Clear and delete functionality',
            'Decimal number support',
            'Operation chaining',
            'OOP class-based architecture',
            'Responsive button layout'
        ],
        github: 'https://github.com/kaushatrivedi'
    },
    {
        id: 'todo-app',
        title: 'Todo App',
        subtitle: '// LOCALSTORAGE PERSISTENCE',
        shortDesc: 'Task manager with filters',
        description: `A task management application with localStorage persistence, ensuring tasks survive page refreshes. Features filtering by status (all, active, completed) and bulk actions.

Demonstrates client-side data persistence patterns and state management with vanilla JavaScript.`,
        tech: ['JavaScript', 'HTML', 'CSS'],
        features: [
            'Add, edit, delete tasks',
            'Mark tasks as complete',
            'Filter by All, Active, Completed',
            'LocalStorage persistence',
            'Clear completed tasks',
            'Task count display',
            'Responsive design'
        ],
        github: 'https://github.com/kaushatrivedi'
    }
];

// Fortune messages for terminal
const FORTUNES = [
    "A semicolon a day keeps the bugs away... wait, wrong language.",
    "Your code will compile on the first try today. (Just kidding.)",
    "The mass of the documentation is directly proportional to the simplicity of the change.",
    "A SQL query walks into a bar, walks up to two tables and asks 'Can I join you?'",
    "There are only 10 types of people: those who understand binary and those who don't.",
    "To understand recursion, you must first understand recursion.",
    "It's not a bug, it's an undocumented feature.",
    "99 bugs in the code, 99 bugs... patch one down, 127 bugs in the code.",
    "The best thing about a boolean is even if you're wrong, you're only off by a bit.",
    "Why do programmers prefer dark mode? Because light attracts bugs."
];

// Hacker game words by difficulty
const HACKER_WORDS = {
    easy: ['HACK', 'ROOT', 'SUDO', 'BASH', 'PING', 'PORT', 'CODE', 'DATA'],
    medium: ['KERNEL', 'BUFFER', 'DAEMON', 'SOCKET', 'CIPHER', 'BREACH', 'BINARY', 'PACKET', 'PROXY', 'SHELL', 'CHMOD', 'CRASH'],
    hard: ['FIREWALL', 'ENCRYPT', 'DECRYPT', 'EXPLOIT', 'PAYLOAD', 'ROOTKIT', 'MALWARE', 'QUANTUM', 'TROJAN', 'BOTNET', 'PHISHING', 'KEYLOGGER'],
    elite: ['CRYPTOGRAPHY', 'VULNERABILITY', 'AUTHENTICATION', 'RANSOMWARE', 'BLOCKCHAIN', 'PENETRATION', 'OBFUSCATION', 'POLYMORPHIC']
};

// Typing game challenges
const TYPING_CHALLENGES = [
    "const future = await imagination.build();",
    "while(alive) { code(); sleep(); repeat(); }",
    "git commit -m 'fixed bug that was a feature'",
    "console.log('Hello, World!');",
    "npm install everything --save-dev",
    "sudo rm -rf bugs/* && npm run success",
    "function coffee() { return productivity++; }",
    "if (tired) { drinkCoffee(); } else { keepCoding(); }",
    "const life = new Promise((resolve) => code(resolve));",
    "try { succeed(); } catch(e) { learnFrom(e); retry(); }"
];

// Trivia questions
const TRIVIA_QUESTIONS = [
    { q: "What does 'CSS' stand for?", a: ["Cascading Style Sheets", "Computer Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"], correct: 0 },
    { q: "Which company created JavaScript?", a: ["Microsoft", "Netscape", "Google", "Apple"], correct: 1 },
    { q: "What year was Git created?", a: ["2003", "2005", "2007", "2010"], correct: 1 },
    { q: "Who created Linux?", a: ["Bill Gates", "Steve Jobs", "Linus Torvalds", "Dennis Ritchie"], correct: 2 },
    { q: "What does API stand for?", a: ["Application Program Interface", "Applied Programming Interface", "Application Protocol Interface", "Advanced Program Integration"], correct: 0 },
    { q: "Which is NOT a JavaScript framework?", a: ["React", "Angular", "Django", "Vue"], correct: 2 },
    { q: "What does SQL stand for?", a: ["Structured Query Language", "Simple Query Language", "Standard Query Language", "Sequential Query Language"], correct: 0 },
    { q: "What is the time complexity of binary search?", a: ["O(n)", "O(log n)", "O(n²)", "O(1)"], correct: 1 },
    { q: "Which HTTP status code means 'Not Found'?", a: ["401", "403", "404", "500"], correct: 2 },
    { q: "What port does HTTPS typically use?", a: ["80", "443", "8080", "22"], correct: 1 }
];

// Cryptic messages for Konami code effects
const CRYPTIC_MESSAGES = [
    "REALITY IS A CONSTRUCT",
    "THE SYSTEM KNOWS YOUR NAME",
    "ACCESS GRANTED: LEVEL 99",
    "YOU FOUND THE BACKDOOR",
    "DECRYPTION COMPLETE",
    "WELCOME TO THE VOID",
    "SYSTEM FAILURE IMMINENT",
    "CONSCIOUSNESS UPLOADING..."
];

// Skills for floating 3D display
const SKILLS_LIST = [
    // Web Dev
    'React', 'Next.js', 'Node.js', 'TypeScript', 'Tailwind',
    // Cloud/DevOps
    'AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD',
    // Data/AI
    'Python', 'TensorFlow', 'PostgreSQL', 'MongoDB',
    // Extras
    'GraphQL', 'Redis', 'Three.js', 'Linux'
];
