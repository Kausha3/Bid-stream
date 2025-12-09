// ============================================================
// PORTFOLIO - Main Application Script
// ============================================================

// ============================================================
// GLOBAL UTILITIES
// ============================================================

// Global terminal log function - used by all games and features
function log(text, type = '') {
    const termOutput = document.getElementById('term-output');
    if (!termOutput) return;
    const div = document.createElement('div');
    div.className = `terminal-line ${type}`;
    div.innerText = text;
    termOutput.appendChild(div);
    termOutput.scrollTop = termOutput.scrollHeight;
}

// ============================================================
// THREE.JS SCENE SETUP
// ============================================================

const canvas = document.getElementById('canvas');
const scene = new THREE.Scene();
const bgCol = 0x020406;
scene.background = new THREE.Color(bgCol);
scene.fog = new THREE.FogExp2(bgCol, 0.015);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 8, 22);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ============================================================
// POST PROCESSING (Enhanced Bloom)
// ============================================================

const composer = new THREE.EffectComposer(renderer);
const renderPass = new THREE.RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, 0.4, 0.85
);
bloomPass.threshold = 0;
bloomPass.strength = 2.0;
bloomPass.radius = 0.8;
composer.addPass(bloomPass);

// ============================================================
// WIREFRAME GRID
// ============================================================

const gridWidth = 100, gridDepth = 100, gridSegments = 80;
const gridGeo = new THREE.PlaneBufferGeometry(gridWidth, gridDepth, gridSegments, gridSegments);
const gridCount = gridGeo.attributes.position.count;

// Custom shader material for smooth edge fading
const gridVertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const gridFragmentShader = `
    uniform float uTime;
    uniform vec3 uColor;
    uniform vec3 uColor2;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
        vec2 center = vec2(0.5, 0.5);
        float distFromCenter = distance(vUv, center) * 2.0;
        float radialFade = 1.0 - smoothstep(0.5, 1.0, distFromCenter);
        float edgeFadeX = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
        float edgeFadeY = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);
        float edgeFade = edgeFadeX * edgeFadeY;
        float combinedFade = min(radialFade * 1.2, edgeFade);
        combinedFade = pow(combinedFade, 0.8);
        float colorMix = sin(vPosition.x * 0.1 + uTime * 0.3) * 0.5 + 0.5;
        colorMix *= sin(vPosition.y * 0.1 + uTime * 0.2) * 0.5 + 0.5;
        vec3 finalColor = mix(uColor, uColor2, colorMix * 0.3);
        float pulse = sin(distFromCenter * 10.0 - uTime * 2.0) * 0.1 + 0.9;
        float alpha = combinedFade * 0.2 * pulse;
        gl_FragColor = vec4(finalColor, alpha);
    }
`;

const gridMat = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x00ffcc) },
        uColor2: { value: new THREE.Color(0xff00ff) }
    },
    vertexShader: gridVertexShader,
    fragmentShader: gridFragmentShader,
    wireframe: true,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false
});

const gridMesh = new THREE.Mesh(gridGeo, gridMat);
gridMesh.rotation.x = -Math.PI / 2;
gridMesh.position.y = -2;
scene.add(gridMesh);

// Invisible plane for raycasting
const raycastPlane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(gridWidth, gridDepth),
    new THREE.MeshBasicMaterial({ visible: false })
);
raycastPlane.rotation.x = -Math.PI / 2;
raycastPlane.position.y = -2;
scene.add(raycastPlane);

// ============================================================
// NEURAL GLOBE SYSTEM
// ============================================================

const GLOBE_CONFIG = {
    nodeCount: 180,
    baseRadius: 8,
    connectionDistance: 3.5,
    maxConnections: 800,
    rotationSpeed: 0.08,
    pulseSpeed: 2.5,
    mouseInfluence: 2.5,
    colors: {
        primary: new THREE.Color(0x00ffcc),
        secondary: new THREE.Color(0xff00ff),
        accent: new THREE.Color(0x00aaff),
        signal: new THREE.Color(0xffffff)
    }
};

// Globe container for rotation
const globeGroup = new THREE.Group();
globeGroup.position.set(0, 6, 0);
scene.add(globeGroup);

// Generate Fibonacci Sphere Points
function fibonacciSphere(samples, radius) {
    const points = [];
    const phi = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < samples; i++) {
        const y = 1 - (i / (samples - 1)) * 2;
        const radiusAtY = Math.sqrt(1 - y * y);
        const theta = phi * i;

        points.push({
            x: Math.cos(theta) * radiusAtY * radius,
            y: y * radius,
            z: Math.sin(theta) * radiusAtY * radius,
            baseX: Math.cos(theta) * radiusAtY * radius,
            baseY: y * radius,
            baseZ: Math.sin(theta) * radiusAtY * radius,
            connections: [],
            size: 0.8 + Math.random() * 0.6,
            phase: Math.random() * Math.PI * 2,
            isHub: Math.random() < 0.15
        });
    }
    return points;
}

const nodes = fibonacciSphere(GLOBE_CONFIG.nodeCount, GLOBE_CONFIG.baseRadius);

// Mark hub nodes as larger
nodes.forEach(node => {
    if (node.isHub) node.size *= 1.8;
});

// Build Connection Graph
const connectionPairs = [];
for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].baseX - nodes[j].baseX;
        const dy = nodes[i].baseY - nodes[j].baseY;
        const dz = nodes[i].baseZ - nodes[j].baseZ;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

        if (dist < GLOBE_CONFIG.connectionDistance) {
            connectionPairs.push({ from: i, to: j, dist });
            nodes[i].connections.push(j);
            nodes[j].connections.push(i);
        }
    }
}

// Create Particle Geometry with Colors
const particleGeo = new THREE.BufferGeometry();
const particlePositions = new Float32Array(nodes.length * 3);
const particleColors = new Float32Array(nodes.length * 3);
const particleSizes = new Float32Array(nodes.length);

nodes.forEach((node, i) => {
    particlePositions[i * 3] = node.x;
    particlePositions[i * 3 + 1] = node.y;
    particlePositions[i * 3 + 2] = node.z;

    const t = (node.y / GLOBE_CONFIG.baseRadius + 1) / 2;
    const color = GLOBE_CONFIG.colors.primary.clone().lerp(GLOBE_CONFIG.colors.secondary, t);
    particleColors[i * 3] = color.r;
    particleColors[i * 3 + 1] = color.g;
    particleColors[i * 3 + 2] = color.b;

    particleSizes[i] = node.size;
});

particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
particleGeo.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

// Custom shader for particles
const particleVertexShader = `
    attribute float size;
    attribute vec3 color;
    varying vec3 vColor;
    varying float vSize;
    void main() {
        vColor = color;
        vSize = size;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const particleFragmentShader = `
    varying vec3 vColor;
    varying float vSize;
    void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float glow = 1.0 - smoothstep(0.0, 0.5, dist);
        glow = pow(glow, 1.5);
        vec3 finalColor = vColor * glow;
        gl_FragColor = vec4(finalColor, glow);
    }
`;

const particleMaterial = new THREE.ShaderMaterial({
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const particleSystem = new THREE.Points(particleGeo, particleMaterial);
globeGroup.add(particleSystem);

// Connection Lines with Gradient
const lineGeo = new THREE.BufferGeometry();
const linePositions = new Float32Array(GLOBE_CONFIG.maxConnections * 6);
const lineColors = new Float32Array(GLOBE_CONFIG.maxConnections * 6);
lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

const lineMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
});

const connectionLines = new THREE.LineSegments(lineGeo, lineMaterial);
globeGroup.add(connectionLines);

// ============================================================
// SIGNAL PULSE SYSTEM
// ============================================================

const signals = [];
const MAX_SIGNALS = 30;
const SIGNAL_SPAWN_RATE = 150;

class Signal {
    constructor(fromIdx, toIdx) {
        this.from = fromIdx;
        this.to = toIdx;
        this.progress = 0;
        this.speed = 0.8 + Math.random() * 0.8;
        this.alive = true;
        this.color = GLOBE_CONFIG.colors.signal.clone();
        this.size = 0.3 + Math.random() * 0.2;
    }

    update(delta) {
        this.progress += delta * this.speed;
        if (this.progress >= 1) {
            if (Math.random() < 0.6) {
                const nextConnections = nodes[this.to].connections;
                if (nextConnections.length > 0) {
                    const nextTarget = nextConnections[Math.floor(Math.random() * nextConnections.length)];
                    if (nextTarget !== this.from && signals.length < MAX_SIGNALS) {
                        signals.push(new Signal(this.to, nextTarget));
                    }
                }
            }
            this.alive = false;
        }
    }

    getPosition() {
        const fromNode = nodes[this.from];
        const toNode = nodes[this.to];
        const easeProgress = this.progress < 0.5
            ? 2 * this.progress * this.progress
            : 1 - Math.pow(-2 * this.progress + 2, 2) / 2;

        return {
            x: fromNode.x + (toNode.x - fromNode.x) * easeProgress,
            y: fromNode.y + (toNode.y - fromNode.y) * easeProgress,
            z: fromNode.z + (toNode.z - fromNode.z) * easeProgress
        };
    }
}

// Signal particles
const signalGeo = new THREE.BufferGeometry();
const signalPositions = new Float32Array(MAX_SIGNALS * 3);
const signalColors = new Float32Array(MAX_SIGNALS * 3);
const signalSizes = new Float32Array(MAX_SIGNALS);
signalGeo.setAttribute('position', new THREE.BufferAttribute(signalPositions, 3));
signalGeo.setAttribute('color', new THREE.BufferAttribute(signalColors, 3));
signalGeo.setAttribute('size', new THREE.BufferAttribute(signalSizes, 1));

const signalMaterial = new THREE.ShaderMaterial({
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const signalParticles = new THREE.Points(signalGeo, signalMaterial);
globeGroup.add(signalParticles);

// Spawn signals periodically
let lastSignalSpawn = 0;
function spawnSignal(time) {
    if (time - lastSignalSpawn > SIGNAL_SPAWN_RATE && signals.length < MAX_SIGNALS) {
        const hubNodes = nodes.map((n, i) => ({ node: n, idx: i })).filter(n => n.node.isHub);
        const sourceData = hubNodes.length > 0 && Math.random() < 0.7
            ? hubNodes[Math.floor(Math.random() * hubNodes.length)]
            : { node: nodes[Math.floor(Math.random() * nodes.length)], idx: Math.floor(Math.random() * nodes.length) };

        if (sourceData.node.connections.length > 0) {
            const targetIdx = sourceData.node.connections[Math.floor(Math.random() * sourceData.node.connections.length)];
            signals.push(new Signal(sourceData.idx, targetIdx));
            lastSignalSpawn = time;
        }
    }
}

// Ping ripple animation - sends a visible wave through the neural network
function triggerPingRipple() {
    const rippleDuration = 2000;
    const waveSpeed = 0.003;
    const startTime = performance.now();

    // Store original node states
    const originalStates = nodes.map(node => ({
        size: node.isHub ? 1.2 : 0.8,
        pulseOffset: node.pulseOffset
    }));

    // Spawn burst of signals from center outward
    const centerSignals = 25;
    for (let i = 0; i < centerSignals; i++) {
        setTimeout(() => {
            const sourceIdx = Math.floor(Math.random() * nodes.length);
            const source = nodes[sourceIdx];
            if (source.connections.length > 0) {
                const targetIdx = source.connections[Math.floor(Math.random() * source.connections.length)];
                const sig = new Signal(sourceIdx, targetIdx);
                sig.color = new THREE.Color(0x00ffcc);
                sig.size = 0.6;
                sig.speed = 1.2;
                signals.push(sig);
            }
        }, i * 40);
    }

    // Animate ripple through nodes
    function animateRipple() {
        const elapsed = performance.now() - startTime;
        const progress = elapsed / rippleDuration;

        if (progress >= 1) {
            // Reset nodes to original state
            nodes.forEach((node, i) => {
                node.rippleIntensity = 0;
            });
            return;
        }

        // Calculate ripple wave position (0 to max radius)
        const wavePosition = progress * GLOBE_CONFIG.baseRadius * 3;
        const waveWidth = GLOBE_CONFIG.baseRadius * 0.8;

        nodes.forEach((node, i) => {
            // Distance from center
            const dist = Math.sqrt(node.baseX * node.baseX + node.baseY * node.baseY + node.baseZ * node.baseZ);

            // Calculate if this node is within the ripple wave
            const distFromWave = Math.abs(dist - wavePosition);
            if (distFromWave < waveWidth) {
                const intensity = 1 - (distFromWave / waveWidth);
                node.rippleIntensity = intensity * (1 - progress * 0.5);
            } else {
                node.rippleIntensity = Math.max(0, (node.rippleIntensity || 0) - 0.05);
            }
        });

        requestAnimationFrame(animateRipple);
    }

    // Brief bloom flash
    gsap.to(bloomPass, { strength: 3.5, duration: 0.2, ease: "power2.out" });
    gsap.to(bloomPass, {
        strength: viewStates[currentView].bloomStrength,
        duration: 1.5,
        delay: 0.3,
        ease: "power2.inOut"
    });

    animateRipple();
}

// Matrix burst function
function triggerMatrixBurst() {
    signals.length = 0;
    const burstCount = 40;
    const hubNodes = nodes.map((n, i) => ({ node: n, idx: i })).filter(n => n.node.isHub);
    const allNodes = nodes.map((n, i) => ({ node: n, idx: i }));

    gsap.to(bloomPass, { strength: 5.0, duration: 0.15, ease: "power2.out" });

    for (let i = 0; i < burstCount; i++) {
        setTimeout(() => {
            const sourceList = i % 2 === 0 ? hubNodes : allNodes;
            const sourceData = sourceList[Math.floor(Math.random() * sourceList.length)];

            if (sourceData && sourceData.node.connections.length > 0) {
                const toIdx = sourceData.node.connections[Math.floor(Math.random() * sourceData.node.connections.length)];
                const sig = new Signal(sourceData.idx, toIdx);
                sig.size = 0.8 + Math.random() * 0.6;
                sig.speed = 1.5 + Math.random() * 1.0;
                signals.push(sig);
            }
        }, i * 20);
    }

    gsap.to(bloomPass, {
        strength: viewStates[currentView].bloomStrength,
        duration: 2.0,
        delay: 0.3,
        ease: "power2.inOut"
    });

    const originalSpeed = GLOBE_CONFIG.rotationSpeed;
    GLOBE_CONFIG.rotationSpeed = 0.5;
    setTimeout(() => {
        gsap.to(GLOBE_CONFIG, { rotationSpeed: originalSpeed, duration: 2 });
    }, 500);
}

// ============================================================
// FLOATING 3D SKILLS SYSTEM
// ============================================================

const SKILLS_CONFIG = {
    skills: SKILLS_LIST,
    count: 40,
    tunnelLength: 120,
    tunnelRadius: 25,
    speed: 25,
    colors: ['#00ffcc', '#ff00ff', '#00aaff', '#ffffff']
};

const skillSprites = [];
const skillMaterials = [];
let skillsVisible = false;

function createSkillTexture(text, color) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 52px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.3;
    ctx.fillText(text, centerX, centerY);

    ctx.shadowBlur = 6;
    ctx.globalAlpha = 0.5;
    ctx.fillText(text, centerX, centerY);

    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, centerX, centerY);

    ctx.globalAlpha = 0.7;
    ctx.fillStyle = color;
    ctx.fillText(text, centerX, centerY);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function initSkillSprites() {
    for (let i = 0; i < SKILLS_CONFIG.count; i++) {
        const skillName = SKILLS_CONFIG.skills[i % SKILLS_CONFIG.skills.length];
        const color = SKILLS_CONFIG.colors[Math.floor(Math.random() * SKILLS_CONFIG.colors.length)];

        const texture = createSkillTexture(skillName, color);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0,
            blending: THREE.NormalBlending,
            depthWrite: false,
            depthTest: true
        });

        const sprite = new THREE.Sprite(material);

        const angle = Math.random() * Math.PI * 2;
        const radius = 5 + Math.random() * SKILLS_CONFIG.tunnelRadius;
        sprite.position.x = Math.cos(angle) * radius;
        sprite.position.y = Math.sin(angle) * radius * 0.6 + 5;
        sprite.position.z = -20 - Math.random() * SKILLS_CONFIG.tunnelLength;

        const baseScale = 5 + Math.random() * 3;
        sprite.scale.set(baseScale, baseScale * 0.3, 1);

        sprite.userData = {
            baseSpeed: 0.5 + Math.random() * 0.5,
            wobblePhase: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.5 + Math.random() * 0.5,
            originalX: sprite.position.x,
            originalY: sprite.position.y
        };

        scene.add(sprite);
        skillSprites.push(sprite);
        skillMaterials.push(material);
    }
}

initSkillSprites();

function updateSkillSprites(elapsedTime, delta) {
    for (let i = 0; i < skillSprites.length; i++) {
        const sprite = skillSprites[i];
        const data = sprite.userData;

        sprite.position.z += SKILLS_CONFIG.speed * data.baseSpeed * delta;
        sprite.position.x = data.originalX + Math.sin(elapsedTime * data.wobbleSpeed + data.wobblePhase) * 2;
        sprite.position.y = data.originalY + Math.cos(elapsedTime * data.wobbleSpeed * 0.7 + data.wobblePhase) * 1;

        if (sprite.position.z > camera.position.z + 15) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 5 + Math.random() * SKILLS_CONFIG.tunnelRadius;
            sprite.position.x = Math.cos(angle) * radius;
            sprite.position.y = Math.sin(angle) * radius * 0.6 + 5;
            sprite.position.z = -SKILLS_CONFIG.tunnelLength - Math.random() * 20;

            data.originalX = sprite.position.x;
            data.originalY = sprite.position.y;
            data.baseSpeed = 0.5 + Math.random() * 0.5;
        }
    }
}

function setSkillsVisibility(visible, duration = 1.5) {
    skillsVisible = visible;
    const targetOpacity = visible ? 0.9 : 0;

    skillMaterials.forEach((mat, i) => {
        gsap.to(mat, {
            opacity: targetOpacity,
            duration: duration,
            delay: visible ? i * 0.02 : 0,
            ease: visible ? "power2.out" : "power2.in"
        });
    });
}

// ============================================================
// MOUSE INTERACTION
// ============================================================

const mouse = new THREE.Vector2();
const mouse3D = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
let mouseOnGlobe = false;

window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    const target = document.getElementById('cursor-target');
    const dot = document.getElementById('cursor-dot');
    target.style.left = e.clientX + 'px';
    target.style.top = e.clientY + 'px';
    dot.style.left = e.clientX + 'px';
    dot.style.top = e.clientY + 'px';

    raycaster.setFromCamera(mouse, camera);

    const globeWorldPos = new THREE.Vector3();
    globeGroup.getWorldPosition(globeWorldPos);
    const sphere = new THREE.Sphere(globeWorldPos, GLOBE_CONFIG.baseRadius * 1.5);
    const ray = raycaster.ray;
    const intersectPoint = new THREE.Vector3();

    if (ray.intersectSphere(sphere, intersectPoint)) {
        mouse3D.copy(intersectPoint).sub(globeWorldPos);
        mouseOnGlobe = true;
    } else {
        mouseOnGlobe = false;
    }
});

// ============================================================
// VIEW STATE & NAVIGATION
// ============================================================

let currentView = 0;
const viewStates = {
    0: { rotationSpeed: 0.08, pulseIntensity: 1.0, bloomStrength: 2.0, signalRate: 150, cameraPos: { x: 0, y: 8, z: 22 } },
    1: { rotationSpeed: 0.12, pulseIntensity: 1.5, bloomStrength: 2.5, signalRate: 80, cameraPos: { x: 0, y: 10, z: 28 } },
    2: { rotationSpeed: 0.15, pulseIntensity: 1.3, bloomStrength: 2.2, signalRate: 100, cameraPos: { x: 18, y: 8, z: 18 } },
    3: { rotationSpeed: 0.05, pulseIntensity: 2.0, bloomStrength: 3.0, signalRate: 50, cameraPos: { x: 0, y: 15, z: 15 } }
};

window.switchView = function(index) {
    currentView = index;
    const state = viewStates[index];

    document.querySelectorAll('.nav-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
    document.querySelectorAll('.panel-content').forEach(p => p.classList.remove('active'));
    setTimeout(() => {
        const p = document.getElementById(`panel-${index}`);
        if (p) p.classList.add('active');
    }, 100);

    gsap.to(camera.position, {
        x: state.cameraPos.x,
        y: state.cameraPos.y,
        z: state.cameraPos.z,
        duration: 2,
        ease: "power2.inOut"
    });

    gsap.to(bloomPass, {
        strength: state.bloomStrength,
        duration: 1
    });

    GLOBE_CONFIG.rotationSpeed = state.rotationSpeed;

    if (index === 2) {
        setSkillsVisibility(true, 1.5);
    } else {
        setSkillsVisibility(false, 1.0);
    }
};

// ============================================================
// TERMINAL LOGIC
// ============================================================

const termInput = document.getElementById('term-input');
const termOutput = document.getElementById('term-output');
const terminal = document.getElementById('terminal');
const terminalOverlay = document.getElementById('terminal-overlay');
const terminalExpandBtn = document.getElementById('terminal-expand-btn');
let terminalExpanded = false;

function toggleTerminalExpand() {
    terminalExpanded = !terminalExpanded;
    terminal.classList.toggle('expanded', terminalExpanded);
    terminalOverlay.classList.toggle('active', terminalExpanded);
    terminalExpandBtn.textContent = terminalExpanded ? '⤡' : '⤢';
    terminalExpandBtn.title = terminalExpanded ? 'Collapse (Esc)' : 'Expand';

    if (terminalExpanded) {
        termInput.focus();
    }
}

terminalExpandBtn.addEventListener('click', toggleTerminalExpand);
terminalOverlay.addEventListener('click', () => {
    if (terminalExpanded) toggleTerminalExpand();
});

// ============================================================
// EASTER EGG STATE
// ============================================================

let retroModeActive = false;
let matrixRainActive = false;
let hackerGameActive = false;
let hackerTarget = '';
let hackerScore = 0;
let hackerTimer = null;
let hackerTimeLeft = 0;
let hackerLevel = 1;
let hackerHighScore = parseInt(localStorage.getItem('hackerHighScore') || '0');

function getHackerWord(level) {
    if (level <= 2) return HACKER_WORDS.easy[Math.floor(Math.random() * HACKER_WORDS.easy.length)];
    if (level <= 5) return HACKER_WORDS.medium[Math.floor(Math.random() * HACKER_WORDS.medium.length)];
    if (level <= 8) return HACKER_WORDS.hard[Math.floor(Math.random() * HACKER_WORDS.hard.length)];
    return HACKER_WORDS.elite[Math.floor(Math.random() * HACKER_WORDS.elite.length)];
}

function getHackerTime(level) {
    return Math.max(2000, 5000 - (level - 1) * 300);
}

function startHackerTimer() {
    const timeLimit = getHackerTime(hackerLevel);
    hackerTimeLeft = timeLimit;

    const timerDiv = document.createElement('div');
    timerDiv.id = 'hacker-timer';
    timerDiv.innerHTML = `<div class="timer-bar" style="width: 100%"></div><span class="timer-text">${(timeLimit/1000).toFixed(1)}s</span>`;
    timerDiv.style.cssText = `
        position: relative; width: 100%; height: 6px;
        background: rgba(255,0,0,0.2); border-radius: 3px;
        margin: 5px 0; overflow: hidden;
    `;
    const bar = timerDiv.querySelector('.timer-bar');
    bar.style.cssText = `
        height: 100%; background: linear-gradient(90deg, #ff0000, #ff6600);
        transition: width 0.1s linear; box-shadow: 0 0 10px #ff0000;
    `;
    const text = timerDiv.querySelector('.timer-text');
    text.style.cssText = `
        position: absolute; right: 5px; top: -2px;
        font-size: 10px; color: #ff6600;
    `;
    termOutput.appendChild(timerDiv);
    termOutput.scrollTop = termOutput.scrollHeight;

    hackerTimer = setInterval(() => {
        hackerTimeLeft -= 100;
        const pct = (hackerTimeLeft / timeLimit) * 100;
        bar.style.width = pct + '%';
        text.textContent = (hackerTimeLeft / 1000).toFixed(1) + 's';

        if (hackerTimeLeft <= 1000) {
            bar.style.background = '#ff0000';
            text.style.color = '#ff0000';
        }

        if (hackerTimeLeft <= 0) {
            clearInterval(hackerTimer);
            hackerTimer = null;
            timerDiv.remove();
            log('⏱️ TIME OUT! Connection terminated.', 'error');
            endHackerGame(false);
        }
    }, 100);
}

function endHackerGame(success) {
    if (hackerTimer) {
        clearInterval(hackerTimer);
        hackerTimer = null;
    }
    const timerDiv = document.getElementById('hacker-timer');
    if (timerDiv) timerDiv.remove();

    if (success) {
        log('', '');
        log('██╗  ██╗ █████╗  ██████╗██╗  ██╗███████╗██████╗ ', 'success');
        log('██║  ██║██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗', 'success');
        log('███████║███████║██║     █████╔╝ █████╗  ██║  ██║', 'success');
        log('██╔══██║██╔══██║██║     ██╔═██╗ ██╔══╝  ██║  ██║', 'success');
        log('██║  ██║██║  ██║╚██████╗██║  ██╗███████╗██████╔╝', 'success');
        log('╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═════╝ ', 'success');
        log('', '');
        log('     >>>  S Y S T E M   B R E A C H E D  <<<', 'success');
        log('', '');
        log(`╔════════════════════════════════════════════╗`, 'success');
        log(`║  🔓 ROOT ACCESS GRANTED                    ║`, 'success');
        log(`║  📊 FIREWALLS BYPASSED: 10/10              ║`, 'success');
        log(`║  ⚡ FINAL LEVEL: ${hackerLevel.toString().padStart(2)}                        ║`, 'success');
        log(`╚════════════════════════════════════════════╝`, 'success');

        if (hackerScore > hackerHighScore) {
            hackerHighScore = hackerScore;
            localStorage.setItem('hackerHighScore', hackerHighScore.toString());
            log('', '');
            log('🏆 ═══ NEW HIGH SCORE ═══ 🏆', 'success');
        }

        // Visual celebration
        document.body.classList.add('screen-shake');
        setTimeout(() => document.body.classList.remove('screen-shake'), 800);
        gsap.to(bloomPass, { strength: 4, duration: 0.2, yoyo: true, repeat: 3 });
    } else {
        log('', '');
        log('╔══════════════════════════════════════╗', 'error');
        log('║  ⛔ INTRUSION DETECTED                ║', 'error');
        log('║  🔒 CONNECTION TERMINATED             ║', 'error');
        log('╠══════════════════════════════════════╣', 'error');
        log(`║  Firewalls Bypassed: ${hackerScore.toString().padStart(2)}/10            ║`, 'error');
        log(`║  Level Reached: ${hackerLevel.toString().padStart(2)}                   ║`, 'error');
        log(`║  High Score: ${hackerHighScore.toString().padStart(2)}                      ║`, 'error');
        log('╚══════════════════════════════════════╝', 'error');

        if (hackerScore > hackerHighScore) {
            hackerHighScore = hackerScore;
            localStorage.setItem('hackerHighScore', hackerHighScore.toString());
            log('', '');
            log('🏆 NEW HIGH SCORE!', 'warn');
        }

        document.body.classList.add('screen-shake');
        setTimeout(() => document.body.classList.remove('screen-shake'), 500);
    }

    hackerGameActive = false;
    hackerScore = 0;
    hackerLevel = 1;
}

function nextHackerWord() {
    const timerDiv = document.getElementById('hacker-timer');
    if (timerDiv) timerDiv.remove();
    if (hackerTimer) clearInterval(hackerTimer);

    hackerTarget = getHackerWord(hackerLevel);
    const timeLimit = getHackerTime(hackerLevel);
    log(`[LVL ${hackerLevel}] DECRYPT: ${hackerTarget} (${(timeLimit/1000).toFixed(1)}s)`, 'warn');
    startHackerTimer();
}

// ============================================================
// TERMINAL COMMAND HANDLER
// ============================================================

termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const cmd = termInput.value.toLowerCase().trim();
        termInput.value = '';
        log(`$ ${cmd}`);

        // Hacker game input
        if (hackerGameActive) {
            if (cmd.toUpperCase() === hackerTarget) {
                hackerScore++;
                hackerLevel++;
                const bonus = Math.ceil(hackerTimeLeft / 100);
                log(`✓ DECRYPTED! +${bonus} bonus | Score: ${hackerScore} | Level: ${hackerLevel}`, 'success');

                if (hackerScore >= 10) {
                    endHackerGame(true);
                } else {
                    nextHackerWord();
                }
            } else {
                log('✗ WRONG PASSPHRASE!', 'error');
                endHackerGame(false);
            }
            return;
        }

        // Regular commands
        switch(cmd) {
            case 'help':
                log('COMMANDS: cd, clear, ping, ls, resume, linkedin, matrix, hack, fortune, retro, gravity, secrets, games, archives', 'success');
                break;
            case 'ls':
                log('index.html  projects.json  stack.lib  contact.enc  neural.core  .secrets');
                break;
            case 'clear':
                termOutput.innerHTML = '';
                break;
            case 'ping':
                log('Pinging neural core...', 'warn');
                triggerPingRipple();
                setTimeout(() => log('Reply from GLOBE_CORE: nodes=180 connections=active latency=12ms', 'success'), 500);
                break;
            case 'matrix':
                if (matrixRainActive) {
                    log('Matrix rain deactivated.', 'warn');
                    stopMatrixRain();
                } else {
                    log('Entering the Matrix...', 'success');
                    startMatrixRain();
                }
                matrixRainActive = !matrixRainActive;
                break;
            case 'hack':
                log('', '');
                log('╔══════════════════════════════════════╗', 'warn');
                log('║  >>> BREACH PROTOCOL INITIATED <<<   ║', 'warn');
                log('║  Decrypt 10 passphrases to gain root ║', 'warn');
                log('║  Time decreases with each level!     ║', 'warn');
                log(`║  High Score: ${hackerHighScore.toString().padStart(2)}                       ║`, 'warn');
                log('╚══════════════════════════════════════╝', 'warn');
                hackerGameActive = true;
                hackerScore = 0;
                hackerLevel = 1;
                setTimeout(() => nextHackerWord(), 800);
                break;
            case 'fortune':
                const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
                log(`🔮 ${fortune}`, 'success');
                break;
            case 'retro':
                retroModeActive = !retroModeActive;
                document.body.classList.toggle('retro-mode', retroModeActive);
                log(`Retro mode ${retroModeActive ? 'activated' : 'deactivated'}.`, retroModeActive ? 'success' : 'warn');
                break;
            case 'gravity':
                log('Inverting gravity...', 'warn');
                document.body.classList.add('gravity-flip');
                setTimeout(() => {
                    document.body.classList.remove('gravity-flip');
                    log('Gravity restored.', 'success');
                }, 3000);
                break;
            case 'secrets':
                log('=== HIDDEN SECRETS ===', 'success');
                log('1. Konami Code (↑↑↓↓←→←→BA)', 'success');
                log('2. Morse SOS on spacebar (tap short-long-short)', 'success');
                log('3. Click rapidly 10 times', 'success');
                log('4. Visit at 12AM-5AM for night owl mode', 'success');
                log('5. Stay idle for 60 seconds', 'success');
                log('6. Speed Run: Visit all 4 sections in 5 seconds', 'success');
                log('7. Open DevTools for ASCII art', 'success');
                log('', '');
                log('=== HIDDEN GAMES ===', 'success');
                log('Type "games" to see all available games!', 'success');
                break;
            case 'typegame':
            case 'type':
                startTypingGame();
                break;
            case 'trivia':
            case 'quiz':
                startTriviaGame();
                break;
            case 'snake':
                startSnakeGame();
                break;
            case 'games':
                log('=== AVAILABLE GAMES ===', 'success');
                log('> snake    - Classic Snake game', 'success');
                log('> typegame - Typing speed challenge', 'success');
                log('> trivia   - Tech trivia quiz', 'success');
                log('> hack     - Hacker minigame', 'success');
                break;
            case 'archives':
            case 'archive':
                log('Accessing archives...', 'warn');
                setTimeout(() => {
                    log('ARCHIVE_VAULT unlocked.', 'success');
                    openArchives();
                }, 500);
                break;
            case 'exit':
                if (document.getElementById('archives-modal').classList.contains('active')) {
                    closeArchives();
                    log('Archives closed.', 'warn');
                } else {
                    log('Nothing to exit.', 'error');
                }
                break;
            case 'resume':
            case 'cv':
                log('Fetching credentials...', 'warn');
                setTimeout(() => {
                    log('████████████████████ 100%', 'success');
                    log('Opening resume...', 'success');
                    window.open('assets/Kausha_Trivedi_Resume.pdf', '_blank');
                }, 800);
                break;
            case 'linkedin':
                log('Establishing secure connection...', 'warn');
                setTimeout(() => {
                    log('Connection established.', 'success');
                    log('Redirecting to LinkedIn profile...', 'success');
                    window.open('https://www.linkedin.com/in/kaushat/', '_blank');
                }, 600);
                break;
            default:
                if (cmd.startsWith('cd ')) {
                    const arg = cmd.split(' ')[1];
                    if (arg === 'root') switchView(0);
                    else if (arg === 'projects') switchView(1);
                    else if (arg === 'stack') switchView(2);
                    else if (arg === 'contact') switchView(3);
                    else log(`Directory not found: ${arg}`, 'error');
                } else {
                    log(`Command not found: ${cmd}`, 'error');
                }
        }
    }
});

// ============================================================
// PROJECT MODAL SYSTEM
// ============================================================

const projectModal = document.getElementById('project-modal');
const projectsContainer = document.getElementById('projects-container');
let currentFilter = 'all';

function renderProjects(filter = 'all') {
    currentFilter = filter;
    const filteredProjects = filter === 'all'
        ? PROJECTS_DATA
        : PROJECTS_DATA.filter(p => p.category === filter);

    const html = filteredProjects.map((project) => {
        const actualIndex = PROJECTS_DATA.findIndex(p => p.id === project.id);
        const categoryLabel = project.category.toUpperCase();
        return `
            <div class="project-card" onclick="openProject(${actualIndex})">
                <span class="project-card-category">${categoryLabel}</span>
                <div class="project-card-title">${project.title}</div>
                <div class="project-card-desc">${project.shortDesc}</div>
                <span class="project-card-arrow">→</span>
            </div>
        `;
    }).join('');

    projectsContainer.style.opacity = '0';
    setTimeout(() => {
        projectsContainer.innerHTML = html;
        projectsContainer.style.opacity = '1';
    }, 150);
}

window.filterProjects = function(filter) {
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.filter === filter);
    });
    renderProjects(filter);
};

renderProjects('all');

window.openProject = function(index) {
    const project = PROJECTS_DATA[index];
    if (!project) return;

    document.getElementById('modal-title').textContent = project.title;
    document.getElementById('modal-subtitle').textContent = project.subtitle;
    document.getElementById('modal-description').textContent = project.description;

    document.getElementById('modal-tech-stack').innerHTML = project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('');
    document.getElementById('modal-features').innerHTML = project.features.map(f => `<div class="feature-item">${f}</div>`).join('');

    let linksHTML = '';
    if (project.github) {
        linksHTML += `<a href="${project.github}" target="_blank" class="modal-link">⬡ GitHub</a>`;
    }
    if (project.live) {
        linksHTML += `<a href="${project.live}" target="_blank" class="modal-link secondary">◈ Live Demo</a>`;
    }
    document.getElementById('modal-links').innerHTML = linksHTML;

    projectModal.classList.add('active');
    gsap.fromTo(projectModal.querySelector('.modal-content'),
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
    );

    gsap.to(bloomPass, { strength: 0.5, duration: 0.5 });
};

window.closeProject = function() {
    gsap.to(projectModal.querySelector('.modal-content'), {
        y: 30,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
            projectModal.classList.remove('active');
        }
    });
    gsap.to(bloomPass, { strength: viewStates[currentView].bloomStrength, duration: 0.5 });
};

// ============================================================
// ARCHIVES MODAL SYSTEM
// ============================================================

const archivesModal = document.getElementById('archives-modal');

window.openArchives = function() {
    const archivesBody = document.getElementById('archives-body');

    const html = ARCHIVES_DATA.map((archive, index) => `
        <div class="archive-item" style="animation-delay: ${index * 0.1}s" onclick="openArchiveProject(${index})">
            <div class="archive-item-header">
                <span class="archive-item-index">[${String(index).padStart(2, '0')}]</span>
                <span class="archive-item-title">${archive.title}</span>
                <span class="archive-item-arrow">→</span>
            </div>
            <div class="archive-item-subtitle">${archive.subtitle}</div>
            <div class="archive-item-desc">${archive.shortDesc}</div>
            <div class="archive-item-tech">
                ${archive.tech.map(t => `<span class="archive-tech-tag">${t}</span>`).join('')}
            </div>
        </div>
    `).join('');

    archivesBody.innerHTML = html;
    archivesModal.classList.add('active');

    gsap.fromTo(archivesModal.querySelector('.archives-content'),
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
    );

    gsap.to(bloomPass, { strength: 0.5, duration: 0.5 });
};

window.openArchiveProject = function(index) {
    const archive = ARCHIVES_DATA[index];
    if (!archive) return;

    // Close archives modal first
    archivesModal.classList.remove('active');

    // Populate project modal with archive data
    document.getElementById('modal-title').textContent = archive.title;
    document.getElementById('modal-subtitle').textContent = archive.subtitle;
    document.getElementById('modal-description').textContent = archive.description;

    document.getElementById('modal-tech-stack').innerHTML = archive.tech.map(t => `<span class="tech-tag">${t}</span>`).join('');
    document.getElementById('modal-features').innerHTML = archive.features.map(f => `<div class="feature-item">${f}</div>`).join('');

    let linksHTML = '';
    if (archive.github) {
        linksHTML += `<a href="${archive.github}" target="_blank" class="modal-link">⬡ GitHub</a>`;
    }
    if (archive.live) {
        linksHTML += `<a href="${archive.live}" target="_blank" class="modal-link secondary">◈ Live Demo</a>`;
    }
    document.getElementById('modal-links').innerHTML = linksHTML;

    // Open project modal
    projectModal.classList.add('active');
    gsap.fromTo(projectModal.querySelector('.modal-content'),
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
    );

    gsap.to(bloomPass, { strength: 0.5, duration: 0.5 });
};

window.closeArchives = function() {
    gsap.to(archivesModal.querySelector('.archives-content'), {
        y: 30,
        opacity: 0,
        scale: 0.95,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
            archivesModal.classList.remove('active');
        }
    });
    gsap.to(bloomPass, { strength: viewStates[currentView].bloomStrength, duration: 0.5 });
};

// ============================================================
// ANIMATION LOOP
// ============================================================

const clock = new THREE.Clock();
let lastTime = 0;

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();
    const delta = elapsedTime - lastTime;
    lastTime = elapsedTime;
    const time = elapsedTime * 1000;

    // Globe Rotation
    globeGroup.rotation.y += GLOBE_CONFIG.rotationSpeed * delta;

    // Update Node Positions
    const positions = particleSystem.geometry.attributes.position.array;
    const colors = particleSystem.geometry.attributes.color.array;
    const sizes = particleSystem.geometry.attributes.size.array;

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const i3 = i * 3;

        const breathe = Math.sin(elapsedTime * 0.5 + node.phase) * 0.15;
        const pulseScale = 1 + breathe;

        let x = node.baseX * pulseScale;
        let y = node.baseY * pulseScale;
        let z = node.baseZ * pulseScale;

        if (mouseOnGlobe) {
            const dx = x - mouse3D.x;
            const dy = y - mouse3D.y;
            const dz = z - mouse3D.z;
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

            if (dist < GLOBE_CONFIG.mouseInfluence && dist > 0) {
                const force = (GLOBE_CONFIG.mouseInfluence - dist) / GLOBE_CONFIG.mouseInfluence;
                const pushStrength = force * 1.5;
                x += (dx / dist) * pushStrength;
                y += (dy / dist) * pushStrength;
                z += (dz / dist) * pushStrength;
            }
        }

        node.x += (x - node.x) * 0.1;
        node.y += (y - node.y) * 0.1;
        node.z += (z - node.z) * 0.1;

        positions[i3] = node.x;
        positions[i3 + 1] = node.y;
        positions[i3 + 2] = node.z;

        // Ripple intensity effect from ping command
        const ripple = node.rippleIntensity || 0;
        if (ripple > 0) {
            // Brighten color during ripple
            colors[i3] = Math.min(1, GLOBE_CONFIG.colors.primary.r + ripple * 0.5);
            colors[i3 + 1] = Math.min(1, GLOBE_CONFIG.colors.primary.g + ripple * 0.8);
            colors[i3 + 2] = Math.min(1, GLOBE_CONFIG.colors.primary.b + ripple * 0.5);
            // Increase size during ripple
            sizes[i] = node.size * (1 + ripple * 1.5);
        } else if (node.isHub) {
            sizes[i] = node.size * (1 + Math.sin(elapsedTime * 3 + node.phase) * 0.3);
        }
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;
    particleSystem.geometry.attributes.size.needsUpdate = true;
    particleSystem.geometry.attributes.color.needsUpdate = true;

    // Update Connection Lines
    const linePos = connectionLines.geometry.attributes.position.array;
    const lineCol = connectionLines.geometry.attributes.color.array;

    for (let i = 0; i < connectionPairs.length && i < GLOBE_CONFIG.maxConnections; i++) {
        const pair = connectionPairs[i];
        const fromNode = nodes[pair.from];
        const toNode = nodes[pair.to];
        const i6 = i * 6;

        linePos[i6] = fromNode.x;
        linePos[i6 + 1] = fromNode.y;
        linePos[i6 + 2] = fromNode.z;
        linePos[i6 + 3] = toNode.x;
        linePos[i6 + 4] = toNode.y;
        linePos[i6 + 5] = toNode.z;

        const t1 = (fromNode.y / GLOBE_CONFIG.baseRadius + 1) / 2;
        const t2 = (toNode.y / GLOBE_CONFIG.baseRadius + 1) / 2;
        const c1 = GLOBE_CONFIG.colors.primary.clone().lerp(GLOBE_CONFIG.colors.secondary, t1);
        const c2 = GLOBE_CONFIG.colors.primary.clone().lerp(GLOBE_CONFIG.colors.secondary, t2);

        lineCol[i6] = c1.r * 0.5;
        lineCol[i6 + 1] = c1.g * 0.5;
        lineCol[i6 + 2] = c1.b * 0.5;
        lineCol[i6 + 3] = c2.r * 0.5;
        lineCol[i6 + 4] = c2.g * 0.5;
        lineCol[i6 + 5] = c2.b * 0.5;
    }
    connectionLines.geometry.attributes.position.needsUpdate = true;
    connectionLines.geometry.attributes.color.needsUpdate = true;

    // Spawn & Update Signals
    spawnSignal(time);

    const sigPos = signalParticles.geometry.attributes.position.array;
    const sigCol = signalParticles.geometry.attributes.color.array;
    const sigSizes = signalParticles.geometry.attributes.size.array;

    for (let i = signals.length - 1; i >= 0; i--) {
        signals[i].update(delta * GLOBE_CONFIG.pulseSpeed);
        if (!signals[i].alive) {
            signals.splice(i, 1);
        }
    }

    for (let i = 0; i < MAX_SIGNALS; i++) {
        if (i < signals.length) {
            const sig = signals[i];
            const pos = sig.getPosition();
            sigPos[i * 3] = pos.x;
            sigPos[i * 3 + 1] = pos.y;
            sigPos[i * 3 + 2] = pos.z;
            sigCol[i * 3] = 1;
            sigCol[i * 3 + 1] = 1;
            sigCol[i * 3 + 2] = 1;
            sigSizes[i] = sig.size * (1 + Math.sin(sig.progress * Math.PI) * 2);
        } else {
            sigPos[i * 3] = 0;
            sigPos[i * 3 + 1] = -1000;
            sigPos[i * 3 + 2] = 0;
            sigSizes[i] = 0;
        }
    }
    signalParticles.geometry.attributes.position.needsUpdate = true;
    signalParticles.geometry.attributes.color.needsUpdate = true;
    signalParticles.geometry.attributes.size.needsUpdate = true;

    // Update Grid Shader Time
    gridMat.uniforms.uTime.value = elapsedTime;

    // Grid Wave Animation
    raycaster.setFromCamera(mouse, camera);
    const gridIntersects = raycaster.intersectObject(raycastPlane);
    let gridImpact = new THREE.Vector3(1000, 0, 1000);
    if (gridIntersects.length > 0) gridImpact = gridIntersects[0].point;

    const gridPos = gridGeo.attributes.position;
    const t = elapsedTime;

    for (let i = 0; i < gridCount; i++) {
        const x = gridPos.getX(i);
        const y = gridPos.getY(i);

        const primaryWave = Math.sin(x * 0.08 + t * 0.3) * Math.cos(y * 0.06 + t * 0.25) * 1.2;
        const secondaryWave = Math.sin((x + y) * 0.1 + t * 0.5) * 0.6;
        const rippleWave = Math.sin(x * 0.25 + t * 1.5) * Math.sin(y * 0.25 + t * 1.2) * 0.25;
        const distFromCenter = Math.sqrt(x * x + y * y);
        const radialPulse = Math.sin(distFromCenter * 0.1 - t * 0.8) * 0.5 * Math.max(0, 1 - distFromCenter / 60);
        const travelingWave = Math.sin(y * 0.15 - t * 0.6) * 0.8;

        let z = primaryWave + secondaryWave + rippleWave + radialPulse + travelingWave;

        const dx = x - gridImpact.x;
        const dy = (-y) - gridImpact.z;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 20) {
            const rippleStrength = (20 - dist) / 20;
            z += Math.sin(dist * 0.6 - t * 5) * rippleStrength * 2.0;
        }

        const edgeX = Math.abs(x) / 50;
        const edgeY = Math.abs(y) / 50;
        const edgeFade = 1.0 - Math.pow(Math.max(edgeX, edgeY), 2);
        z *= Math.max(0.2, edgeFade);

        gridPos.setZ(i, z);
    }
    gridPos.needsUpdate = true;

    // Update Floating Skills
    updateSkillSprites(elapsedTime, delta);

    // Camera Look
    camera.lookAt(globeGroup.position);

    // Render
    composer.render();
}

animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

// ============================================================
// CONSOLIDATED KEYBOARD HANDLER
// ============================================================

// Konami code state
const KONAMI_SEQUENCE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
let konamiProgress = 0;
let konamiCooldown = false;

// Morse code state
let morseBuffer = [];
let morseTimeout = null;
let lastKeyTime = 0;
let morseIndicator = null;
let morseKeyPressed = false;
let holdTimerInterval = null;

// Snake game state (external)
let snakeGameActive = false;

document.addEventListener('keydown', (e) => {
    // ESC key handling
    if (e.key === 'Escape') {
        if (terminalExpanded && !snakeGameActive) {
            toggleTerminalExpand();
            return;
        }
        if (projectModal.classList.contains('active')) {
            closeProject();
            return;
        }
    }

    // Konami code detection (not in terminal input)
    if (document.activeElement !== termInput) {
        const expectedKey = KONAMI_SEQUENCE[konamiProgress];
        if (e.code === expectedKey) {
            konamiProgress++;
            if (konamiProgress > 0 && konamiProgress < KONAMI_SEQUENCE.length) {
                bloomPass.strength += 0.2;
            }
            if (konamiProgress === KONAMI_SEQUENCE.length) {
                konamiProgress = 0;
                if (!konamiCooldown) {
                    konamiCooldown = true;
                    triggerKonamiEffect();
                    setTimeout(() => { konamiCooldown = false; }, 12000);
                }
            }
        } else if (KONAMI_SEQUENCE.includes(e.code)) {
            konamiProgress = 0;
        }
    }

    // Morse code detection (spacebar, not in input)
    if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT' && !e.repeat) {
        e.preventDefault();
        if (!morseKeyPressed) {
            morseKeyPressed = true;
            lastKeyTime = Date.now();
            showMorseIndicator(`MORSE: ${morseBuffer.join('')}<span style="color: #ffff00;">_</span><br><small>HOLD for dash...</small>`);
            startHoldTimer();
        }
    }
});

document.addEventListener('keyup', (e) => {
    // Morse code on space release
    if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT' && morseKeyPressed) {
        morseKeyPressed = false;
        clearInterval(holdTimerInterval);

        const duration = Date.now() - lastKeyTime;
        const char = duration < 250 ? '.' : '-';
        morseBuffer.push(char);

        const charColor = char === '.' ? '#00ff00' : '#ff00ff';
        const charName = char === '.' ? 'DOT' : 'DASH';
        showMorseIndicator(`MORSE: ${morseBuffer.join('')}<br><small style="color: ${charColor};">+${charName} (${duration}ms)</small>`);

        clearTimeout(morseTimeout);
        morseTimeout = setTimeout(() => {
            const morse = morseBuffer.join('');
            const isValidSOS = morse.match(/^\.{2,4}-{2,4}\.{2,4}$/);

            if (isValidSOS || morse === '...---...') {
                console.log('>>> MORSE CODE DETECTED: SOS <<<');
                document.body.classList.add('screen-shake');
                setTimeout(() => document.body.classList.remove('screen-shake'), 800);

                if (morseIndicator) {
                    morseIndicator.style.background = '#00ffcc';
                    morseIndicator.style.color = '#000';
                    morseIndicator.innerHTML = '>>> SOS RECEIVED! <<<';
                }

                log('>>> MORSE CODE DETECTED: SOS - HELP IS ON THE WAY! <<<', 'success');
            }

            morseBuffer = [];
            setTimeout(() => {
                if (morseIndicator) {
                    morseIndicator.remove();
                    morseIndicator = null;
                }
            }, 1500);
        }, 1200);
    }
});

// Morse indicator helpers
function showMorseIndicator(text) {
    if (!morseIndicator) {
        morseIndicator = document.createElement('div');
        morseIndicator.style.cssText = `
            position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
            background: rgba(0,0,0,0.9); border: 2px solid #00ffcc; padding: 15px 30px;
            font-family: monospace; color: #00ffcc; font-size: 24px; z-index: 10000;
            border-radius: 8px; text-align: center;
        `;
        document.body.appendChild(morseIndicator);
    }
    morseIndicator.innerHTML = text;
}

function startHoldTimer() {
    clearInterval(holdTimerInterval);
    holdTimerInterval = setInterval(() => {
        if (morseKeyPressed && morseIndicator) {
            const elapsed = Date.now() - lastKeyTime;
            const isDash = elapsed >= 250;
            const color = isDash ? '#ff00ff' : '#00ff00';
            const type = isDash ? 'DASH (-)' : 'DOT (.)';
            morseIndicator.innerHTML = `MORSE: ${morseBuffer.join('')}<span style="color: ${color};">_</span><br><small style="color: ${color};">${type} - ${elapsed}ms</small>`;
        }
    }, 50);
}

// ============================================================
// KONAMI CODE EFFECTS
// ============================================================

function triggerKonamiEffect() {
    const effects = ['void', 'rain', 'shatter'];
    const effect = effects[Math.floor(Math.random() * effects.length)];
    console.log(`>>> KONAMI CODE: THE_${effect.toUpperCase()} <<<`);

    log('>>> SYSTEM BREACH DETECTED <<<', 'error');

    // Simplified dramatic effect
    const dataPanel = document.querySelector('.data-panel');

    gsap.to(bloomPass, { strength: 15, duration: 0.5, ease: "power2.in" });
    gsap.to(GLOBE_CONFIG, { rotationSpeed: 2, duration: 0.5 });

    setTimeout(() => {
        const msg = CRYPTIC_MESSAGES[Math.floor(Math.random() * CRYPTIC_MESSAGES.length)];
        log(msg, 'warn');

        gsap.to(bloomPass, { strength: viewStates[currentView].bloomStrength, duration: 2 });
        gsap.to(GLOBE_CONFIG, { rotationSpeed: viewStates[currentView].rotationSpeed, duration: 2 });

        triggerMatrixBurst();
    }, 1000);
}

// ============================================================
// MATRIX RAIN EFFECT
// ============================================================

let matrixCanvas = null;
let matrixCtx = null;
let matrixAnimationId = null;
let matrixDrops = [];

function startMatrixRain() {
    if (matrixCanvas) return;

    matrixCanvas = document.createElement('canvas');
    matrixCanvas.id = 'matrix-rain';
    document.body.appendChild(matrixCanvas);
    matrixCtx = matrixCanvas.getContext('2d');

    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charArray = chars.split('');
    const fontSize = 14;
    const columns = Math.floor(matrixCanvas.width / fontSize);

    matrixDrops = [];
    for (let i = 0; i < columns; i++) {
        matrixDrops[i] = Math.random() * -100;
    }

    function drawMatrix() {
        matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

        matrixCtx.fillStyle = '#00ff00';
        matrixCtx.font = `${fontSize}px monospace`;

        for (let i = 0; i < matrixDrops.length; i++) {
            const char = charArray[Math.floor(Math.random() * charArray.length)];
            const x = i * fontSize;
            const y = matrixDrops[i] * fontSize;

            if (matrixDrops[i] > 0) {
                matrixCtx.fillStyle = '#ffffff';
                matrixCtx.fillText(char, x, y);
                matrixCtx.fillStyle = '#00ff00';
            }

            matrixCtx.fillText(char, x, y);

            if (y > matrixCanvas.height && Math.random() > 0.975) {
                matrixDrops[i] = 0;
            }
            matrixDrops[i]++;
        }

        matrixAnimationId = requestAnimationFrame(drawMatrix);
    }

    drawMatrix();
}

function stopMatrixRain() {
    if (matrixAnimationId) {
        cancelAnimationFrame(matrixAnimationId);
        matrixAnimationId = null;
    }
    if (matrixCanvas) {
        matrixCanvas.remove();
        matrixCanvas = null;
        matrixCtx = null;
    }
}

// ============================================================
// TYPING SPEED GAME
// ============================================================

let typingGameActive = false;
let typingStartTime = null;
let currentChallenge = '';
let typingOverlay = null;

function startTypingGame() {
    log('=== TYPING SPEED CHALLENGE ===', 'success');
    log('Type the code snippet as fast as you can!', '');
    log('Press ESC to cancel.', '');
    log('', '');

    currentChallenge = TYPING_CHALLENGES[Math.floor(Math.random() * TYPING_CHALLENGES.length)];

    typingOverlay = document.createElement('div');
    typingOverlay.id = 'typing-game-overlay';
    typingOverlay.innerHTML = `
        <div class="typing-game-container">
            <div class="typing-game-header">⌨️ TYPING CHALLENGE</div>
            <div class="typing-game-target">${currentChallenge}</div>
            <input type="text" class="typing-game-input" placeholder="Start typing..." autocomplete="off" spellcheck="false">
            <div class="typing-game-stats">
                <span class="typing-wpm">WPM: --</span>
                <span class="typing-accuracy">Accuracy: --</span>
                <span class="typing-time">Time: 0.0s</span>
            </div>
            <div class="typing-game-hint">Press ESC to cancel</div>
        </div>
    `;
    typingOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.95); z-index: 10000;
        display: flex; align-items: center; justify-content: center;
    `;

    typingOverlay.querySelector('.typing-game-container').style.cssText = `
        background: linear-gradient(135deg, rgba(0,20,40,0.98), rgba(10,0,30,0.98));
        border: 2px solid #00ffcc; border-radius: 16px; padding: 40px;
        max-width: 800px; width: 90%; text-align: center;
        box-shadow: 0 0 50px rgba(0,255,204,0.3);
    `;

    typingOverlay.querySelector('.typing-game-header').style.cssText = `color: #00ffcc; font-size: 24px; margin-bottom: 30px; font-family: monospace;`;
    typingOverlay.querySelector('.typing-game-target').style.cssText = `
        background: rgba(0,0,0,0.5); padding: 20px; border-radius: 8px;
        font-family: 'Fira Code', monospace; font-size: 20px; color: #ff00ff;
        margin-bottom: 20px; letter-spacing: 1px; border: 1px solid #333;
    `;
    typingOverlay.querySelector('.typing-game-input').style.cssText = `
        width: 100%; padding: 15px; font-size: 18px; font-family: 'Fira Code', monospace;
        background: rgba(0,0,0,0.8); border: 2px solid #00ffcc; border-radius: 8px;
        color: #00ffcc; outline: none; margin-bottom: 20px;
    `;
    typingOverlay.querySelector('.typing-game-stats').style.cssText = `display: flex; justify-content: space-around; margin-bottom: 15px; font-family: monospace;`;
    typingOverlay.querySelectorAll('.typing-game-stats span').forEach(span => {
        span.style.cssText = 'color: #00ffcc; font-size: 16px;';
    });
    typingOverlay.querySelector('.typing-game-hint').style.cssText = `color: #666; font-size: 12px; font-family: monospace;`;

    document.body.appendChild(typingOverlay);

    const input = typingOverlay.querySelector('.typing-game-input');
    const timeDisplay = typingOverlay.querySelector('.typing-time');
    const wpmDisplay = typingOverlay.querySelector('.typing-wpm');
    const accDisplay = typingOverlay.querySelector('.typing-accuracy');

    input.focus();
    typingGameActive = true;
    typingStartTime = null;

    let timerInterval = null;
    let totalKeystrokes = 0;
    let errorCount = 0;
    let lastLength = 0;

    input.addEventListener('input', (e) => {
        if (!typingStartTime) {
            typingStartTime = Date.now();
            timerInterval = setInterval(() => {
                const elapsed = ((Date.now() - typingStartTime) / 1000).toFixed(1);
                timeDisplay.textContent = `Time: ${elapsed}s`;
            }, 100);
        }

        const typed = e.target.value;
        const target = currentChallenge;

        if (typed.length > lastLength) {
            totalKeystrokes++;
            const newCharIndex = typed.length - 1;
            if (typed[newCharIndex] !== target[newCharIndex]) {
                errorCount++;
                input.style.borderColor = '#ff0000';
                setTimeout(() => { input.style.borderColor = '#00ffcc'; }, 150);
            }
        }
        lastLength = typed.length;

        const accuracy = totalKeystrokes > 0 ? Math.round(((totalKeystrokes - errorCount) / totalKeystrokes) * 100) : 100;
        accDisplay.textContent = `Accuracy: ${accuracy}%`;

        const elapsed = (Date.now() - typingStartTime) / 1000 / 60;
        const words = typed.length / 5;
        const wpm = elapsed > 0 ? Math.round(words / elapsed) : 0;
        wpmDisplay.textContent = `WPM: ${wpm}`;

        if (typed === target) {
            clearInterval(timerInterval);
            const finalTime = ((Date.now() - typingStartTime) / 1000).toFixed(2);
            const finalWPM = wpm;
            const finalAccuracy = accuracy;

            input.style.borderColor = '#00ff00';
            input.style.background = 'rgba(0,255,0,0.1)';

            setTimeout(() => {
                typingOverlay.remove();
                typingGameActive = false;

                log('=== CHALLENGE COMPLETE! ===', 'success');
                log(`⏱️ Time: ${finalTime}s`, 'success');
                log(`⚡ Speed: ${finalWPM} WPM`, 'success');
                log(`🎯 Accuracy: ${finalAccuracy}% (${errorCount} errors)`, 'success');

                if (finalWPM >= 80 && finalAccuracy >= 95) {
                    log('🏆 LEGENDARY TYPIST!', 'success');
                } else if (finalWPM >= 60 && finalAccuracy >= 90) {
                    log('🥇 Speed Demon!', 'success');
                } else if (finalWPM >= 40) {
                    log('👍 Nice typing!', 'success');
                } else {
                    log('Keep practicing!', '');
                }
            }, 500);
        }
    });

    const escHandler = (e) => {
        if (e.key === 'Escape' && typingGameActive) {
            clearInterval(timerInterval);
            typingOverlay.remove();
            typingGameActive = false;
            log('Typing challenge cancelled.', 'warn');
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

// ============================================================
// TRIVIA QUIZ GAME
// ============================================================

let triviaActive = false;
let triviaScore = 0;
let triviaOverlay = null;

function startTriviaGame() {
    log('=== TECH TRIVIA QUIZ ===', 'success');
    log('5 random questions. How many can you get?', '');

    triviaActive = true;
    triviaScore = 0;

    const shuffled = [...TRIVIA_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);

    function showQuestion(index) {
        if (index >= shuffled.length) {
            log('', '');
            log('=== QUIZ COMPLETE ===', 'success');
            log(`Final Score: ${triviaScore}/${shuffled.length}`, 'success');

            if (triviaScore === 5) {
                log('🏆 PERFECT SCORE! You\'re a tech genius!', 'success');
            } else if (triviaScore >= 4) {
                log('🥇 Excellent! Almost perfect!', 'success');
            } else if (triviaScore >= 3) {
                log('👍 Good job!', 'success');
            } else {
                log('📚 Time to hit the docs!', '');
            }

            triviaActive = false;
            if (triviaOverlay) triviaOverlay.remove();
            return;
        }

        const q = shuffled[index];

        triviaOverlay = document.createElement('div');
        triviaOverlay.innerHTML = `
            <div class="trivia-container">
                <div class="trivia-header">📚 Question ${index + 1}/5</div>
                <div class="trivia-question">${q.q}</div>
                <div class="trivia-answers">
                    ${q.a.map((ans, i) => `<button class="trivia-btn" data-index="${i}">${String.fromCharCode(65 + i)}. ${ans}</button>`).join('')}
                </div>
                <div class="trivia-score">Score: ${triviaScore}/${index}</div>
            </div>
        `;
        triviaOverlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.95); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
        `;

        triviaOverlay.querySelector('.trivia-container').style.cssText = `
            background: linear-gradient(135deg, rgba(0,20,40,0.98), rgba(10,0,30,0.98));
            border: 2px solid #ff00ff; border-radius: 16px; padding: 40px;
            max-width: 600px; width: 90%; text-align: center;
            box-shadow: 0 0 50px rgba(255,0,255,0.3);
        `;

        triviaOverlay.querySelector('.trivia-header').style.cssText = `color: #ff00ff; font-size: 18px; margin-bottom: 20px; font-family: monospace;`;
        triviaOverlay.querySelector('.trivia-question').style.cssText = `color: #00ffcc; font-size: 22px; margin-bottom: 30px; font-family: monospace; line-height: 1.4;`;
        triviaOverlay.querySelector('.trivia-answers').style.cssText = `display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;`;

        triviaOverlay.querySelectorAll('.trivia-btn').forEach(btn => {
            btn.style.cssText = `
                padding: 15px 20px; font-size: 16px; font-family: monospace;
                background: rgba(0,0,0,0.5); border: 1px solid #00ffcc; border-radius: 8px;
                color: #00ffcc; cursor: pointer; text-align: left;
                transition: all 0.2s;
            `;
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'rgba(0,255,204,0.2)';
                btn.style.transform = 'translateX(10px)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'rgba(0,0,0,0.5)';
                btn.style.transform = 'translateX(0)';
            });
            btn.addEventListener('click', () => {
                const selected = parseInt(btn.dataset.index);
                const isCorrect = selected === q.correct;

                triviaOverlay.querySelectorAll('.trivia-btn').forEach((b, i) => {
                    b.style.pointerEvents = 'none';
                    if (i === q.correct) {
                        b.style.background = 'rgba(0,255,0,0.3)';
                        b.style.borderColor = '#00ff00';
                    } else if (i === selected && !isCorrect) {
                        b.style.background = 'rgba(255,0,0,0.3)';
                        b.style.borderColor = '#ff0000';
                    }
                });

                if (isCorrect) {
                    triviaScore++;
                    log(`Q${index + 1}: ✓ Correct!`, 'success');
                } else {
                    log(`Q${index + 1}: ✗ Wrong! Answer: ${q.a[q.correct]}`, 'error');
                }

                setTimeout(() => {
                    triviaOverlay.remove();
                    showQuestion(index + 1);
                }, 1500);
            });
        });

        triviaOverlay.querySelector('.trivia-score').style.cssText = `color: #666; font-size: 14px; font-family: monospace;`;

        document.body.appendChild(triviaOverlay);
    }

    showQuestion(0);
}

// ============================================================
// SNAKE GAME
// ============================================================

function startSnakeGame() {
    if (snakeGameActive) {
        log('Snake game already running!', 'warn');
        return;
    }

    log('=== 🐍 SNAKE GAME ===', 'success');
    log('Arrow keys / WASD to move', '');
    log('ESC to exit', '');

    snakeGameActive = true;

    // Hide UI elements
    const dataPanel = document.querySelector('.data-panel');
    const navRail = document.querySelector('.nav-rail');
    if (dataPanel) {
        dataPanel.style.transition = 'opacity 0.5s ease-out';
        dataPanel.style.opacity = '0';
        setTimeout(() => dataPanel.style.display = 'none', 500);
    }
    if (navRail) {
        navRail.style.transition = 'opacity 0.5s ease-out';
        navRail.style.opacity = '0';
        setTimeout(() => navRail.style.display = 'none', 500);
    }

    // Dim globe
    gsap.to(bloomPass, { strength: 0.5, duration: 0.5 });

    // Game config
    const GRID = 15;
    const CELL = 25;
    const WIDTH = GRID * CELL;
    const HEIGHT = GRID * CELL;

    // Game state
    let snake = [{ x: 7, y: 7 }];
    let food = { x: 10, y: 10 };
    let dir = { x: 0, y: 0 };
    let nextDir = { x: 0, y: 0 };
    let score = 0;
    let highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
    let gameOver = false;
    let lastMove = 0;
    let speed = 150;

    // Create game container
    const container = document.createElement('div');
    container.id = 'snake-game-container';
    container.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        z-index: 9999; pointer-events: all;
        background: radial-gradient(ellipse at center, rgba(0,30,0,0.3) 0%, transparent 70%);
    `;

    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.cssText = `
        border: 2px solid #00ff00; border-radius: 12px;
        box-shadow: 0 0 60px rgba(0,255,0,0.4);
        background: linear-gradient(180deg, rgba(0,20,0,0.95) 0%, rgba(0,10,0,0.98) 100%);
    `;
    const ctx = canvas.getContext('2d');

    const hud = document.createElement('div');
    hud.style.cssText = `
        color: #00ff00; font-family: 'Courier New', monospace; font-size: 20px;
        margin-bottom: 25px; text-align: center; text-shadow: 0 0 20px rgba(0,255,0,0.8);
    `;
    hud.innerHTML = `
        <div style="font-size: 28px; margin-bottom: 8px; letter-spacing: 4px; color: #00ffcc;">🐍 SNAKE</div>
        <div style="display: flex; gap: 30px; justify-content: center; font-size: 18px;">
            <span>SCORE: <span id="snakeScoreDisplay" style="color: #ffcc00;">${score}</span></span>
            <span>HIGH: <span style="color: #ff00ff;">${highScore}</span></span>
        </div>
    `;

    const hint = document.createElement('div');
    hint.style.cssText = `color: #00aa66; font-family: monospace; font-size: 13px; margin-top: 20px; opacity: 0.7;`;
    hint.textContent = '[ ← ↑ ↓ → ] or [ W A S D ] to move  •  [ ESC ] to exit';

    container.appendChild(hud);
    container.appendChild(canvas);
    container.appendChild(hint);
    document.body.appendChild(container);

    function spawnFood() {
        let valid = false;
        while (!valid) {
            food = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
            valid = !snake.some(s => s.x === food.x && s.y === food.y);
        }
    }
    spawnFood();

    function draw() {
        ctx.fillStyle = '#001208';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // Food
        const foodX = food.x * CELL + CELL / 2;
        const foodY = food.y * CELL + CELL / 2;
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#ff0055';
        ctx.beginPath();
        ctx.arc(foodX, foodY, CELL / 2 - 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Snake
        snake.forEach((seg, i) => {
            const isHead = i === 0;
            const cx = seg.x * CELL + CELL / 2;
            const cy = seg.y * CELL + CELL / 2;
            const radius = isHead ? CELL / 2 - 2 : CELL / 2 - 4;

            ctx.shadowColor = isHead ? '#00ffcc' : '#00ff00';
            ctx.shadowBlur = isHead ? 15 : 8;
            ctx.fillStyle = isHead ? '#00ffcc' : '#00ff00';
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();

            if (isHead) {
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#000';
                const eyeOffset = 4;
                ctx.beginPath();
                ctx.arc(cx - eyeOffset + dir.x * 2, cy - eyeOffset + dir.y * 2, 3, 0, Math.PI * 2);
                ctx.arc(cx + eyeOffset + dir.x * 2, cy - eyeOffset + dir.y * 2, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.shadowBlur = 0;

        if (gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
            ctx.fillStyle = '#ff3333';
            ctx.font = 'bold 32px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', WIDTH / 2, HEIGHT / 2 - 30);
            ctx.fillStyle = '#ffcc00';
            ctx.font = 'bold 24px "Courier New", monospace';
            ctx.fillText(`SCORE: ${score}`, WIDTH / 2, HEIGHT / 2 + 10);
            ctx.fillStyle = '#00ff00';
            ctx.font = '14px "Courier New", monospace';
            ctx.fillText('[ SPACE ] to restart', WIDTH / 2, HEIGHT / 2 + 50);
        }
    }

    function update(now) {
        if (gameOver) return;
        if (dir.x === 0 && dir.y === 0) {
            dir = nextDir;
            return;
        }
        if (now - lastMove < speed) return;
        lastMove = now;

        dir = nextDir.x !== 0 || nextDir.y !== 0 ? nextDir : dir;

        const newHead = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

        if (newHead.x < 0 || newHead.x >= GRID || newHead.y < 0 || newHead.y >= GRID) {
            endGame();
            return;
        }

        if (snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
            endGame();
            return;
        }

        snake.unshift(newHead);

        if (newHead.x === food.x && newHead.y === food.y) {
            score += 10;
            document.getElementById('snakeScoreDisplay').textContent = score;
            spawnFood();
            if (speed > 80) speed -= 3;
        } else {
            snake.pop();
        }
    }

    function endGame() {
        gameOver = true;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore.toString());
            log(`🏆 NEW HIGH SCORE: ${score}!`, 'success');
        }
        hint.textContent = 'SPACE to restart | ESC to exit';
    }

    function restart() {
        snake = [{ x: 7, y: 7 }];
        dir = { x: 0, y: 0 };
        nextDir = { x: 0, y: 0 };
        score = 0;
        speed = 150;
        gameOver = false;
        document.getElementById('snakeScoreDisplay').textContent = '0';
        hint.textContent = 'Arrow Keys / WASD to move | ESC to exit';
        spawnFood();
    }

    let animationId;
    function gameLoop(now) {
        if (!snakeGameActive) return;
        update(now);
        draw();
        animationId = requestAnimationFrame(gameLoop);
    }
    animationId = requestAnimationFrame(gameLoop);

    function cleanup() {
        cancelAnimationFrame(animationId);
        document.removeEventListener('keydown', keyHandler);
        container.remove();
        snakeGameActive = false;

        gsap.to(bloomPass, { strength: viewStates[currentView].bloomStrength, duration: 0.5 });

        if (dataPanel) {
            dataPanel.style.display = '';
            dataPanel.style.opacity = '1';
        }
        if (navRail) {
            navRail.style.display = '';
            navRail.style.opacity = '1';
        }

        log(`Game ended. Score: ${score}`, '');
    }

    function keyHandler(e) {
        if (!snakeGameActive) return;

        if (e.key === 'Escape') {
            cleanup();
            return;
        }

        if (e.key === ' ') {
            e.preventDefault();
            if (gameOver) restart();
            return;
        }

        if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && dir.y !== 1) {
            nextDir = { x: 0, y: -1 };
        } else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && dir.y !== -1) {
            nextDir = { x: 0, y: 1 };
        } else if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && dir.x !== 1) {
            nextDir = { x: -1, y: 0 };
        } else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && dir.x !== -1) {
            nextDir = { x: 1, y: 0 };
        }
    }

    document.addEventListener('keydown', keyHandler);
}

// ============================================================
// ADDITIONAL EASTER EGGS
// ============================================================

// Rage Click Detection
let clickTimes = [];
document.addEventListener('click', () => {
    const now = Date.now();
    clickTimes.push(now);
    clickTimes = clickTimes.filter(t => now - t < 2000);

    if (clickTimes.length >= 10) {
        console.log('>>> RAGE DETECTED <<<');
        document.body.classList.add('screen-shake');
        setTimeout(() => document.body.classList.remove('screen-shake'), 800);
        document.body.style.filter = 'hue-rotate(180deg)';
        setTimeout(() => document.body.style.filter = '', 300);

        const rageMessages = [
            '>>> CALM DOWN! RAGE DETECTED <<<',
            '>>> WHOA THERE! EASY ON THE CLICKS <<<',
            '>>> YOUR MOUSE DID NOTHING WRONG <<<',
            '>>> ANGER MANAGEMENT RECOMMENDED <<<'
        ];
        log(rageMessages[Math.floor(Math.random() * rageMessages.length)], 'error');
        clickTimes = [];
    }
});

// Idle Detection
let idleTimeout = null;
function resetIdleTimer() {
    clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => {
        console.log('>>> IDLE DETECTED <<<');
        const messages = [
            "Still there?", "*taps microphone*", "Hello? Anyone?",
            "I see you watching...", "The void stares back.",
            "WAKE UP!", "System entering sleep mode..."
        ];
        log(messages[Math.floor(Math.random() * messages.length)], 'warn');
    }, 60000);
}
['mousemove', 'keydown', 'click', 'scroll'].forEach(event => {
    document.addEventListener(event, resetIdleTimer);
});
resetIdleTimer();

// Night Owl Mode
let owlElement = null;
function checkNightOwlMode() {
    const hour = new Date().getHours();
    const isNightOwl = hour >= 0 && hour < 5;
    const brand = document.querySelector('.brand');

    if (isNightOwl && !document.body.classList.contains('night-owl-mode')) {
        document.body.classList.add('night-owl-mode');
        console.log('>>> NIGHT OWL DETECTED <<<');

        if (brand && !owlElement) {
            owlElement = document.createElement('span');
            owlElement.innerText = ' 🦉';
            owlElement.style.cssText = 'animation: owlBounce 1s ease-in-out infinite; display: inline-block;';
            brand.appendChild(owlElement);
        }

        log('🦉 Night owl detected! Why are you up so late?', 'warn');
    } else if (!isNightOwl && document.body.classList.contains('night-owl-mode')) {
        document.body.classList.remove('night-owl-mode');
        if (owlElement) {
            owlElement.remove();
            owlElement = null;
        }
    }
}
checkNightOwlMode();
setInterval(checkNightOwlMode, 60000);

// Speed Run Challenge
let speedRunStart = null;
let speedRunViews = new Set();
const originalSwitchView = window.switchView;

window.switchView = function(index) {
    originalSwitchView(index);

    if (!speedRunStart) {
        speedRunStart = Date.now();
        speedRunViews.clear();
    }

    speedRunViews.add(index);

    if (speedRunViews.size === 4) {
        const elapsed = (Date.now() - speedRunStart) / 1000;
        if (elapsed <= 5) {
            console.log(`>>> SPEED RUN COMPLETE: ${elapsed.toFixed(2)}s <<<`);
            log(`>>> SPEED RUN: ${elapsed.toFixed(2)}s - ACHIEVEMENT UNLOCKED! <<<`, 'success');
        }
        speedRunStart = null;
        speedRunViews.clear();
    }

    setTimeout(() => {
        if (speedRunStart && Date.now() - speedRunStart > 5000) {
            speedRunStart = null;
            speedRunViews.clear();
        }
    }, 5100);
};

// Console Secrets
console.log('%c' + `
██╗  ██╗ █████╗ ██╗   ██╗███████╗██╗  ██╗ █████╗
██║ ██╔╝██╔══██╗██║   ██║██╔════╝██║  ██║██╔══██╗
█████╔╝ ███████║██║   ██║███████╗███████║███████║
██╔═██╗ ██╔══██║██║   ██║╚════██║██╔══██║██╔══██║
██║  ██╗██║  ██║╚██████╔╝███████║██║  ██║██║  ██║
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
`, 'color: #00ffcc; font-family: monospace;');
console.log('%cYou found the console! Here\'s a cookie: 🍪', 'color: #00ffcc; font-size: 16px;');
console.log('%cSecret commands in terminal:', 'color: #ff00ff; font-size: 14px;');
console.log('%c> hack    - Start hacker minigame\n> matrix  - Toggle matrix rain\n> fortune - Get a programming fortune\n> retro   - Toggle retro mode\n> gravity - Flip gravity\n> secrets - List all easter eggs', 'color: #00ffcc;');
console.log('%c👀 Curious, are we?', 'color: #ff00ff; font-size: 20px;');
console.log('>>> SYSTEM BACKDOOR ACTIVE <<<');
