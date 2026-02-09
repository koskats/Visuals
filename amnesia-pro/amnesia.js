// AMNESIA PROFESSIONAL VISUALIZER
// Advanced WebGL-powered techno visuals

let song;
let fft;
let amplitude;
let peakDetect;

// Logos
let amnesiaLogo;
let medusaLogo;
let logosLoaded = false;

// Visual modes
let currentMode = 1;
let intensity = 1;

// BPM detection
let lastBeatTime = 0;
let beatInterval = 0;
let bpm = 0;
let beatHistory = [];

// Effects
let strobeActive = false;
let strobeCounter = 0;

// Particles and systems
let tunnelSegments = [];
let laserBeams = [];
let matrixLines = [];
let infinityParticles = [];
let robotParts = [];
let neurons = [];
let connections = [];
let glitchBlocks = [];
let jellyfishes = [];
let fractals = [];
let pulseRings = [];
let eyeParticles = [];
let handFingers = [];
let portalLayers = [];

// Shader-like effects
let glowLayers = [];

// Time
let time = 0;

function preload() {
    amnesiaLogo = loadImage('images/amnes.png');
    medusaLogo = loadImage('images/medusa.png');
}

function setup() {
    logosLoaded = true;
    createCanvas(windowWidth, windowHeight, WEBGL);
    pixelDensity(1); // Performance optimization
    
    // Audio
    fft = new p5.FFT(0.9, 1024);
    amplitude = new p5.Amplitude();
    peakDetect = new p5.PeakDetect(20, 250, 0.6);
    
    // Initialize systems
    initTunnel();
    initLasers();
    initMatrix();
    initInfinity();
    initRobot();
    initNeural();
    initGlitch();
    initJellyfish();
    initFractal();
    initPulse();
    initEye();
    initHand();
    initPortal();
    
    // UI Controls
    setupControls();
}

function setupControls() {
    document.getElementById('audioFile').addEventListener('change', handleFile);
    document.getElementById('playBtn').addEventListener('click', () => {
        if (song && song.isLoaded()) {
            song.play();
        }
    });
    document.getElementById('pauseBtn').addEventListener('click', () => {
        if (song && song.isPlaying()) {
            song.pause();
        } else if (song) {
            song.play();
        }
    });
    
    document.getElementById('intensity').addEventListener('input', (e) => {
        intensity = parseFloat(e.target.value);
    });
    
    document.getElementById('mode1').addEventListener('click', () => setMode(1));
    document.getElementById('mode2').addEventListener('click', () => setMode(2));
    document.getElementById('mode3').addEventListener('click', () => setMode(3));
    document.getElementById('mode4').addEventListener('click', () => setMode(4));
    document.getElementById('mode5').addEventListener('click', () => setMode(5));
    document.getElementById('mode6').addEventListener('click', () => setMode(6));
    document.getElementById('mode7').addEventListener('click', () => setMode(7));
    document.getElementById('mode8').addEventListener('click', () => setMode(8));
    document.getElementById('mode9').addEventListener('click', () => setMode(9));
    document.getElementById('mode10').addEventListener('click', () => setMode(10));
    document.getElementById('mode11').addEventListener('click', () => setMode(11));
    document.getElementById('mode12').addEventListener('click', () => setMode(12));
    document.getElementById('mode13').addEventListener('click', () => setMode(13));
    document.getElementById('mode14').addEventListener('click', () => setMode(14));
    document.getElementById('mode15').addEventListener('click', () => setMode(15));
    document.getElementById('mode16').addEventListener('click', () => setMode(16));
    document.getElementById('mode17').addEventListener('click', () => setMode(17));
    
    document.getElementById('fullscreen').addEventListener('click', toggleFullscreen);
    document.getElementById('hideUI').addEventListener('click', toggleUI);
}

function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('button[id^="mode"]').forEach(btn => btn.classList.remove('active'));
    document.getElementById('mode' + mode).classList.add('active');
}

function getColor(hueBase = 0, saturation = 100, brightness = 100, alpha = 255) {
    return color(brightness, brightness, brightness, alpha);
}

function handleFile(event) {
    const file = event.target.files[0];
    if (file) {
        if (song) {
            song.stop();
        }
        song = loadSound(URL.createObjectURL(file), () => {
            console.log('Track loaded!');
        });
    }
}

function draw() {
    background(0);
    
    if (!song || !song.isPlaying()) {
        drawIdleState();
        return;
    }
    
    // Audio analysis
    let spectrum = fft.analyze();
    let level = amplitude.getLevel();
    let bass = fft.getEnergy("bass");
    let lowMid = fft.getEnergy("lowMid");
    let mid = fft.getEnergy("mid");
    let highMid = fft.getEnergy("highMid");
    let treble = fft.getEnergy("treble");
    
    // Beat detection
    peakDetect.update(fft);
    if (peakDetect.isDetected) {
        onBeat(bass);
    }
    
    // Strobe effect on heavy bass
    if (bass > 230 && currentMode === 4) {
        strobeEffect();
    }
    
    // Render based on mode
    push();
    
    switch(currentMode) {
        case 1:
            drawTunnelMode(spectrum, bass, mid, treble, level);
            break;
        case 2:
            drawLaserMode(spectrum, bass, mid, treble, level);
            break;
        case 3:
            drawMatrixMode(spectrum, bass, mid, treble, level);
            break;
        case 4:
            drawStrobeMode(spectrum, bass, mid, treble, level);
            break;
        case 5:
            drawInfinityMode(spectrum, bass, mid, treble, level);
            break;
        case 6:
            drawMedusaMode(spectrum, bass, mid, treble, level);
            break;
        case 7:
            drawHypnoticMode(spectrum, bass, mid, treble, level);
            break;
        case 8:
            drawVortexMode(spectrum, bass, mid, treble, level);
            break;
        case 9:
            drawCyberMode(spectrum, bass, mid, treble, level);
            break;
        case 10:
            drawNeuralMode(spectrum, bass, mid, treble, level);
            break;
        case 11:
            drawGlitchMode(spectrum, bass, mid, treble, level);
            break;
        case 12:
            drawJellyfishMode(spectrum, bass, mid, treble, level);
            break;
        case 13:
            drawFractalMode(spectrum, bass, mid, treble, level);
            break;
        case 14:
            drawPulseMode(spectrum, bass, mid, treble, level);
            break;
        case 15:
            drawEyeMode(spectrum, bass, mid, treble, level);
            break;
        case 16:
            drawHandMode(spectrum, bass, mid, treble, level);
            break;
        case 17:
            drawPortalMode(spectrum, bass, mid, treble, level);
            break;
    }
    
    pop();
    
    time += 0.01;
}

// MODE 1: TUNNEL - LED Screen aesthetic
function initTunnel() {
    for (let i = 0; i < 50; i++) {
        tunnelSegments.push({
            z: i * 100,
            rotation: 0,
            scale: 1
        });
    }
}

function drawTunnelMode(spectrum, bass, mid, treble, level) {
    // Camera movement
    let camZ = map(sin(time * 0.5), -1, 1, -500, 500);
    camera(0, 0, camZ, 0, 0, 0, 0, 1, 0);
    
    // Move through tunnel
    push();
    translate(0, 0, -time * 200 % 100);
    
    for (let i = 0; i < tunnelSegments.length; i++) {
        let seg = tunnelSegments[i];
        let z = seg.z - (time * 200 % 100);
        
        if (z < -500) continue;
        if (z > 2000) continue;
        
        push();
        translate(0, 0, z);
        
        // Rotation based on audio
        let rot = time * 0.5 + i * 0.1 + bass * 0.01;
        rotateZ(rot);
        
        // Size based on position and audio
        let size = map(z, -500, 2000, 400, 50);
        size *= 1 + level * intensity;
        
        // Color based on frequency
        let brightness = map(spectrum[i * 5 % spectrum.length], 0, 255, 50, 100);
        let hueBase = map(i, 0, tunnelSegments.length, 0, 360);
        
        // LED Screen aesthetic - sharp edges
        noFill();
        let col = getColor(hueBase, 100, brightness, 255);
        stroke(col);
        strokeWeight(map(z, -500, 2000, 4, 1));
        
        // Octagon shape (LED screen style)
        beginShape();
        for (let j = 0; j < 8; j++) {
            let angle = TWO_PI / 8 * j;
            let x = cos(angle) * size;
            let y = sin(angle) * size;
            vertex(x, y);
        }
        endShape(CLOSE);
        
        // Inner details
        if (bass > 200) {
            strokeWeight(1);
            let innerCol = getColor(hueBase + 60, 100, 80, 150);
            stroke(innerCol);
            beginShape();
            for (let j = 0; j < 8; j++) {
                let angle = TWO_PI / 8 * j;
                let x = cos(angle) * size * 0.7;
                let y = sin(angle) * size * 0.7;
                vertex(x, y);
            }
            endShape(CLOSE);
        }
        
        pop();
    }
    
    pop();
    
    // Foreground glow
    if (bass > 220) {
        push();
        let glowCol = getColor(0, 80, 100, map(bass, 220, 255, 0, 50));
        fill(glowCol);
        noStroke();
        ellipse(0, 0, width, height);
        pop();
    }
}

// MODE 2: LASER - Scanning laser beams
function initLasers() {
    for (let i = 0; i < 20; i++) {
        laserBeams.push({
            angle: random(TWO_PI),
            speed: random(0.01, 0.05),
            length: random(500, 1000)
        });
    }
}

function drawLaserMode(spectrum, bass, mid, treble, level) {
    // Ambient smoke/haze effect
    push();
    fill(0, 20);
    rect(-width/2, -height/2, width, height);
    pop();
    
    // Rotating lasers
    for (let i = 0; i < laserBeams.length; i++) {
        let laser = laserBeams[i];
        
        push();
        
        // Rotation
        laser.angle += laser.speed * (1 + bass * 0.01);
        rotateZ(laser.angle);
        
        // Length modulation
        let len = laser.length * (1 + spectrum[i * 10 % spectrum.length] / 255);
        
        // Laser beam
        let laserHue = i * 18; // Different color per laser
        let laserCol = getColor(laserHue, 100, 100, 200);
        stroke(laserCol);
        strokeWeight(3);
        line(0, 0, len, 0);
        
        // Glow effect
        strokeWeight(8);
        let glowCol = getColor(laserHue, 100, 100, 50);
        stroke(glowCol);
        line(0, 0, len, 0);
        
        strokeWeight(15);
        let glowCol2 = getColor(laserHue, 100, 100, 20);
        stroke(glowCol2);
        line(0, 0, len, 0);
        
        // Endpoint flash
        let endCol = getColor(laserHue, 100, 100, 255);
        fill(endCol);
        noStroke();
        ellipse(len, 0, 20, 20);
        
        pop();
    }
    
    // Central scanner
    push();
    let scanAngle = time * 5;
    for (let i = 0; i < 360; i += 30) {
        rotateZ(radians(i) + scanAngle);
        let scanCol = getColor(i, 100, 100, map(treble, 0, 255, 50, 200));
        stroke(scanCol);
        strokeWeight(2);
        line(0, 0, 800, 0);
    }
    pop();
    
    // Bass flash
    if (bass > 220) {
        push();
        let flashCol = getColor(0, 100, 100, map(bass, 220, 255, 0, 100));
        fill(flashCol);
        noStroke();
        rect(-width/2, -height/2, width, height);
        pop();
    }
}

// MODE 3: MATRIX - Digital rain style
function initMatrix() {
    let cols = floor(width / 20);
    for (let i = 0; i < cols; i++) {
        matrixLines.push({
            x: i * 20 - width/2,
            y: random(-height, 0),
            speed: random(5, 15),
            length: random(50, 200)
        });
    }
}

function drawMatrixMode(spectrum, bass, mid, treble, level) {
    // Fade trail
    push();
    fill(0, 30);
    rect(-width/2, -height/2, width, height);
    pop();
    
    // Update and draw matrix lines
    for (let i = 0; i < matrixLines.length; i++) {
        let line = matrixLines[i];
        
        // Speed modulation
        line.speed = 10 + mid * 0.1 * intensity;
        line.y += line.speed;
        
        if (line.y > height/2 + line.length) {
            line.y = -height/2;
            line.length = random(50, 200) * (1 + level);
        }
        
        // Draw line segments
        push();
        translate(line.x, line.y);
        
        for (let j = 0; j < line.length; j += 5) {
            let alpha = map(j, 0, line.length, 255, 0);
            let brightness = map(spectrum[i % spectrum.length], 0, 255, 50, 100);
            let matrixHue = map(j, 0, line.length, 0, 120);
            
            let matrixCol = getColor(matrixHue, 100, brightness, alpha);
            stroke(matrixCol);
            strokeWeight(2);
            point(0, -j);
            
            // Digital glitch effect
            if (random() < 0.05) {
                strokeWeight(4);
                let glitchCol = getColor(matrixHue + 60, 100, 100, alpha);
                stroke(glitchCol);
                point(random(-5, 5), -j);
            }
        }
        
        pop();
    }
    
    // Grid overlay
    if (bass > 200) {
        push();
        let gridCol = getColor(120, 100, 80, 30);
        stroke(gridCol);
        strokeWeight(1);
        
        for (let x = -width/2; x < width/2; x += 50) {
            line(x, -height/2, x, height/2);
        }
        for (let y = -height/2; y < height/2; y += 50) {
            line(-width/2, y, width/2, y);
        }
        
        pop();
    }
    
    // Center focal point
    push();
    translate(0, 0);
    noFill();
    let centerCol = getColor(150, 100, 100, 150);
    stroke(centerCol);
    strokeWeight(2);
    let size = 50 + bass * 2;
    rect(-size/2, -size/2, size, size);
    pop();
}

// MODE 4: STROBE - Heavy strobe effects
function drawStrobeMode(spectrum, bass, mid, treble, level) {
    strobeCounter++;
    
    // Heavy bass strobe
    if (bass > 230 && strobeCounter % 2 === 0) {
        let strobeCol = getColor(0, 80, 100, 255);
        background(strobeCol);
    } else {
        background(0);
    }
    
    // Geometric patterns
    push();
    
    for (let i = 0; i < 10; i++) {
        let size = i * 80 + bass;
        let alpha = map(i, 0, 10, 255, 0);
        let shapeHue = i * 36;
        
        noFill();
        let shapeCol = getColor(shapeHue, 100, 100, alpha);
        stroke(shapeCol);
        strokeWeight(3);
        
        if (strobeCounter % 3 === 0) {
            rect(-size/2, -size/2, size, size);
        } else {
            ellipse(0, 0, size, size);
        }
    }
    
    pop();
    
    // Vertical bars
    if (mid > 180) {
        for (let x = -width/2; x < width/2; x += 40) {
            let h = map(spectrum[floor(map(x, -width/2, width/2, 0, spectrum.length))], 0, 255, 0, height);
            let barHue = map(x, -width/2, width/2, 0, 360);
            
            let barCol = getColor(barHue, 100, 100, 255);
            fill(barCol);
            noStroke();
            rect(x, -h/2, 30, h);
        }
    }
}

// MODE 5: INFINITY - Recursive patterns
function initInfinity() {
    for (let i = 0; i < 200; i++) {
        infinityParticles.push({
            angle: random(TWO_PI),
            radius: random(100, 500),
            speed: random(0.01, 0.03),
            size: random(2, 8)
        });
    }
}

function drawInfinityMode(spectrum, bass, mid, treble, level) {
    // Recursive circles
    push();
    
    let maxDepth = floor(5 + bass * 0.02);
    drawRecursiveCircle(0, 0, 400 + bass * 2, maxDepth, spectrum);
    
    pop();
    
    // Particle spiral
    for (let p of infinityParticles) {
        p.angle += p.speed * (1 + level * intensity);
        
        let x = cos(p.angle) * p.radius;
        let y = sin(p.angle) * p.radius;
        
        push();
        translate(x, y);
        
        let particleHue = p.angle * 57.3; // Convert to degrees
        let particleCol = getColor(particleHue, 100, 100, 200);
        fill(particleCol);
        noStroke();
        ellipse(0, 0, p.size, p.size);
        
        // Trail
        let trailCol = getColor(particleHue, 100, 80, 50);
        stroke(trailCol);
        strokeWeight(1);
        let prevX = cos(p.angle - 0.1) * p.radius;
        let prevY = sin(p.angle - 0.1) * p.radius;
        line(0, 0, prevX - x, prevY - y);
        
        pop();
    }
    
    // Central vortex
    push();
    noFill();
    strokeWeight(2);
    
    for (let i = 0; i < 20; i++) {
        let size = i * 30 + sin(time * 3 + i) * 20;
        let vortexHue = i * 18 + time * 20;
        let vortexCol = getColor(vortexHue, 100, 100, 150);
        stroke(vortexCol);
        rotateZ(time + i * 0.1);
        ellipse(0, 0, size, size);
    }
    
    pop();
}

function drawRecursiveCircle(x, y, size, depth, spectrum) {
    if (depth <= 0 || size < 10) return;
    
    let specIndex = floor(map(depth, 0, 10, 0, spectrum.length - 1));
    let brightness = map(spectrum[specIndex], 0, 255, 50, 100);
    let recursiveHue = map(depth, 0, 10, 0, 360);
    
    push();
    translate(x, y);
    
    noFill();
    let recursiveCol = getColor(recursiveHue + time * 30, 100, brightness, 255);
    stroke(recursiveCol);
    strokeWeight(2);
    ellipse(0, 0, size, size);
    
    // Recursive children
    let children = 4;
    for (let i = 0; i < children; i++) {
        let angle = TWO_PI / children * i + time;
        let newX = cos(angle) * size * 0.25;
        let newY = sin(angle) * size * 0.25;
        
        drawRecursiveCircle(newX, newY, size * 0.5, depth - 1, spectrum);
    }
    
    pop();
}

// MODE 6: MEDUSA - Logo with animated snake tentacles
function drawMedusaMode(spectrum, bass, mid, treble, level) {
    // Dark background with subtle glow
    push();
    fill(0, 30);
    rect(-width/2, -height/2, width, height);
    pop();
    
    // Rotating snake tentacles emanating from center
    push();
    let snakeCount = 24;
    for (let i = 0; i < snakeCount; i++) {
        let angle = (TWO_PI / snakeCount * i) + time * 0.5;
        let specValue = spectrum[i * floor(spectrum.length / snakeCount)];
        
        push();
        rotate(angle);
        
        // Draw snake tentacle
        noFill();
        stroke(255, 200);
        strokeWeight(2);
        
        let lastWave = 0;
        let lastDist = 0;
        
        beginShape();
        for (let j = 0; j < 15; j++) {
            let dist = j * 40 + 100;
            let waveOffset = sin(time * 3 + j * 0.5 + i * 0.2) * 30;
            let audioInfluence = map(specValue, 0, 255, 0, 50);
            
            vertex(waveOffset + audioInfluence, dist);
            
            lastWave = waveOffset + audioInfluence;
            lastDist = dist;
            
            // Draw segments
            if (j % 3 === 0) {
                strokeWeight(1);
                stroke(255, 150);
                line(waveOffset - 10, dist, waveOffset + 10, dist);
                strokeWeight(2);
                stroke(255, 200);
            }
        }
        endShape();
        
        // Snake head glow
        if (bass > 200) {
            fill(255, map(bass, 200, 255, 50, 150));
            noStroke();
            ellipse(lastWave, lastDist, 10 + level * 20, 10 + level * 20);
        }
        
        pop();
    }
    pop();
    
    // Central logo
    if (logosLoaded && medusaLogo) {
        push();
        imageMode(CENTER);
        tint(255, 255);
        
        // Scale based on bass - maintain aspect ratio
        let logoSize = 250 + bass * 0.5;
        let aspectRatio = medusaLogo.width / medusaLogo.height;
        let w = logoSize * aspectRatio;
        let h = logoSize;
        
        // Rotation
        rotate(sin(time * 0.5) * 0.1);
        
        image(medusaLogo, 0, 0, w, h);
        
        // Glow effect on bass
        if (bass > 220) {
            tint(255, map(bass, 220, 255, 0, 100));
            image(medusaLogo, 0, 0, w * 1.2, h * 1.2);
        }
        
        pop();
    }
    
    // Circular rings pulsing
    push();
    noFill();
    for (let i = 0; i < 5; i++) {
        let ringSize = 150 + i * 80 + bass * (i + 1) * 0.3;
        stroke(255, 100 - i * 15);
        strokeWeight(1);
        ellipse(0, 0, ringSize, ringSize);
    }
    pop();
}

// MODE 7: HYPNOTIC - Amnesia logo with spiral patterns
function drawHypnoticMode(spectrum, bass, mid, treble, level) {
    // Fade trail
    push();
    fill(0, 20);
    rect(-width/2, -height/2, width, height);
    pop();
    
    // Spiral patterns
    push();
    
    let spirals = 3;
    for (let s = 0; s < spirals; s++) {
        push();
        rotate(time * (s % 2 === 0 ? 1 : -1) * 0.5 + s * TWO_PI / spirals);
        
        noFill();
        stroke(255, 150);
        strokeWeight(2);
        
        beginShape();
        for (let i = 0; i < 200; i++) {
            let angle = i * 0.3;
            let radius = i * 3 + sin(time * 2 + i * 0.1) * 20;
            let specIndex = floor(map(i, 0, 200, 0, spectrum.length - 1));
            radius += spectrum[specIndex] * 0.3;
            
            let x = cos(angle) * radius;
            let y = sin(angle) * radius;
            vertex(x, y);
        }
        endShape();
        
        pop();
    }
    
    pop();
    
    // Geometric grid rotating
    push();
    rotateZ(time * 0.3);
    
    noFill();
    stroke(255, 80);
    strokeWeight(1);
    
    for (let i = 0; i < 8; i++) {
        let size = i * 60 + 100;
        rect(-size/2, -size/2, size, size);
    }
    
    pop();
    
    // Central Amnesia logo
    if (logosLoaded && amnesiaLogo) {
        push();
        imageMode(CENTER);
        
        // Pulsing scale - maintain aspect ratio
        let logoSize = 220 + sin(time * 2) * 20 + bass * 0.4;
        let aspectRatio = amnesiaLogo.width / amnesiaLogo.height;
        let w = logoSize * aspectRatio;
        let h = logoSize;
        
        // Subtle rotation
        rotate(sin(time * 0.3) * 0.05);
        
        tint(255, 255);
        image(amnesiaLogo, 0, 0, w, h);
        
        // Bass glow
        if (bass > 210) {
            for (let i = 0; i < 3; i++) {
                tint(255, map(bass, 210, 255, 0, 30) / (i + 1));
                image(amnesiaLogo, 0, 0, w * (1 + 0.1 * (i + 1)), h * (1 + 0.1 * (i + 1)));
            }
        }
        
        pop();
    }
    
    // Particle orbits
    if (mid > 180) {
        for (let i = 0; i < 50; i++) {
            let angle = time * 2 + i * 0.5;
            let radius = 250 + sin(time * 3 + i) * 50;
            let x = cos(angle) * radius;
            let y = sin(angle) * radius;
            
            fill(255, 200);
            noStroke();
            ellipse(x, y, 3, 3);
        }
    }
}

// MODE 8: VORTEX - Both logos rotating vortex
function drawVortexMode(spectrum, bass, mid, treble, level) {
    // Background
    background(0);
    
    // Tunnel effect
    push();
    
    for (let z = 0; z < 10; z++) {
        let zDepth = z * 0.1;
        let scaleAmount = 1 - zDepth;
        
        push();
        scale(scaleAmount);
        rotate(time * (1 + z * 0.1) + z);
        
        noFill();
        stroke(255, 255 * scaleAmount * 0.5);
        strokeWeight(2);
        
        // Octagon
        beginShape();
        for (let i = 0; i < 8; i++) {
            let angle = TWO_PI / 8 * i;
            let radius = 300 + bass * z * 0.5;
            let x = cos(angle) * radius;
            let y = sin(angle) * radius;
            vertex(x, y);
        }
        endShape(CLOSE);
        
        pop();
    }
    
    pop();
    
    // Alternating logos at different depths
    if (logosLoaded && amnesiaLogo && medusaLogo) {
        // Background Medusa
        push();
        imageMode(CENTER);
        rotate(time * 0.5);
        tint(255, 100);
        let bgSize = 450 + bass * 0.8;
        let medusaAspect = medusaLogo.width / medusaLogo.height;
        let bgW = bgSize * medusaAspect;
        let bgH = bgSize;
        image(medusaLogo, 0, 0, bgW, bgH);
        pop();
        
        // Foreground Amnesia
        push();
        imageMode(CENTER);
        rotate(-time * 0.7);
        tint(255, 255);
        let fgSize = 250 + sin(time * 2) * 30 + bass * 0.5;
        let amnesiaAspect = amnesiaLogo.width / amnesiaLogo.height;
        let fgW = fgSize * amnesiaAspect;
        let fgH = fgSize;
        image(amnesiaLogo, 0, 0, fgW, fgH);
        
        // Strobe flash on heavy bass
        if (bass > 230) {
            tint(255, map(bass, 230, 255, 0, 150));
            image(amnesiaLogo, 0, 0, fgW * 1.3, fgH * 1.3);
        }
        
        pop();
    }
    
    // Radiating lines
    push();
    let lineCount = 36;
    for (let i = 0; i < lineCount; i++) {
        let angle = TWO_PI / lineCount * i + time;
        let specValue = spectrum[i * floor(spectrum.length / lineCount)];
        let lineLength = map(specValue, 0, 255, 100, 500);
        
        push();
        rotate(angle);
        stroke(255, 150);
        strokeWeight(1);
        line(150, 0, 150 + lineLength, 0);
        
        // Line endpoint glow
        fill(255, 200);
        noStroke();
        ellipse(150 + lineLength, 0, 5, 5);
        
        pop();
    }
    pop();
    
    // Corner accents on beat
    if (bass > 220) {
        push();
        stroke(255, map(bass, 220, 255, 0, 200));
        strokeWeight(3);
        noFill();
        
        // Top left
        line(-width/2, -height/2, -width/2 + 100, -height/2);
        line(-width/2, -height/2, -width/2, -height/2 + 100);
        
        // Top right
        line(width/2, -height/2, width/2 - 100, -height/2);
        line(width/2, -height/2, width/2, -height/2 + 100);
        
        // Bottom left
        line(-width/2, height/2, -width/2 + 100, height/2);
        line(-width/2, height/2, -width/2, height/2 - 100);
        
        // Bottom right
        line(width/2, height/2, width/2 - 100, height/2);
        line(width/2, height/2, width/2, height/2 - 100);
        
        pop();
    }
}

// MODE 9: CYBER - Robot/Mechanical Wireframe
function initRobot() {
    // Robot body parts as wireframe cubes
    robotParts = [
        { x: 0, y: -150, z: 0, w: 100, h: 120, d: 80, name: 'head', rotation: 0 },
        { x: 0, y: 0, z: 0, w: 150, h: 180, d: 100, name: 'torso', rotation: 0 },
        { x: -100, y: -50, z: 0, w: 40, h: 150, d: 40, name: 'armL', rotation: 0 },
        { x: 100, y: -50, z: 0, w: 40, h: 150, d: 40, name: 'armR', rotation: 0 },
        { x: -50, y: 200, z: 0, w: 50, h: 150, d: 50, name: 'legL', rotation: 0 },
        { x: 50, y: 200, z: 0, w: 50, h: 150, d: 50, name: 'legR', rotation: 0 }
    ];
}

function drawCyberMode(spectrum, bass, mid, treble, level) {
    background(0);
    
    // Grid floor
    push();
    translate(0, 400, 0);
    rotateX(HALF_PI);
    stroke(0, 255, 255, 100);
    strokeWeight(1);
    noFill();
    
    for (let i = -10; i <= 10; i++) {
        line(i * 50, -500, i * 50, 500);
        line(-500, i * 50, 500, i * 50);
    }
    pop();
    
    // Rotating camera
    let camAngle = time * 0.3;
    let camX = sin(camAngle) * 500;
    let camZ = cos(camAngle) * 500;
    camera(camX, -100, camZ, 0, 0, 0, 0, 1, 0);
    
    // Robot wireframe
    push();
    
    for (let part of robotParts) {
        push();
        translate(part.x, part.y, part.z);
        
        // Animation based on audio
        if (part.name === 'head') {
            rotateY(sin(time * 2) * 0.3 + treble * 0.01);
            part.rotation = time * 2;
        } else if (part.name === 'armL') {
            rotateZ(sin(time * 3) * 0.5 + mid * 0.01);
        } else if (part.name === 'armR') {
            rotateZ(-sin(time * 3) * 0.5 - mid * 0.01);
        } else if (part.name === 'legL') {
            rotateX(sin(time * 4) * 0.3);
        } else if (part.name === 'legR') {
            rotateX(-sin(time * 4) * 0.3);
        }
        
        // Draw wireframe box
        stroke(0, 255, 255, 200);
        strokeWeight(2);
        noFill();
        box(part.w, part.h, part.d);
        
        // Inner details
        if (bass > 200) {
            stroke(255, 0, 255, 150);
            strokeWeight(1);
            box(part.w * 0.7, part.h * 0.7, part.d * 0.7);
        }
        
        // Energy lines
        let energyLines = floor(map(spectrum[robotParts.indexOf(part) * 20 % spectrum.length], 0, 255, 3, 15));
        stroke(0, 255, 255, 100);
        strokeWeight(1);
        for (let i = 0; i < energyLines; i++) {
            let y = map(i, 0, energyLines, -part.h/2, part.h/2);
            line(-part.w/2, y, part.d/2, part.w/2, y, part.d/2);
            line(-part.w/2, y, -part.d/2, part.w/2, y, -part.d/2);
        }
        
        pop();
    }
    
    pop();
    
    // Floating data/code fragments
    push();
    textSize(12);
    textAlign(CENTER);
    fill(0, 255, 0, 200);
    
    for (let i = 0; i < 20; i++) {
        let angle = time + i * 0.5;
        let radius = 300 + sin(time * 2 + i) * 100;
        let x = cos(angle) * radius;
        let z = sin(angle) * radius;
        let y = -200 + sin(time * 3 + i) * 150;
        
        push();
        translate(x, y, z);
        rotateY(-camAngle);
        text(['01001', '11010', 'SYS', 'INIT', 'CORE'][i % 5], 0, 0);
        pop();
    }
    pop();
    
    // HUD overlay - back to 2D
    camera();
    push();
    
    // Corner brackets
    stroke(0, 255, 255, 200);
    strokeWeight(2);
    noFill();
    
    let bracketSize = 40;
    // Top left
    line(-width/2 + 20, -height/2 + 20, -width/2 + 20 + bracketSize, -height/2 + 20);
    line(-width/2 + 20, -height/2 + 20, -width/2 + 20, -height/2 + 20 + bracketSize);
    
    // Top right
    line(width/2 - 20, -height/2 + 20, width/2 - 20 - bracketSize, -height/2 + 20);
    line(width/2 - 20, -height/2 + 20, width/2 - 20, -height/2 + 20 + bracketSize);
    
    // Bottom left
    line(-width/2 + 20, height/2 - 20, -width/2 + 20 + bracketSize, height/2 - 20);
    line(-width/2 + 20, height/2 - 20, -width/2 + 20, height/2 - 20 - bracketSize);
    
    // Bottom right
    line(width/2 - 20, height/2 - 20, width/2 - 20 - bracketSize, height/2 - 20);
    line(width/2 - 20, height/2 - 20, width/2 - 20, height/2 - 20 - bracketSize);
    
    // System text
    textSize(14);
    fill(0, 255, 255, 180);
    textAlign(LEFT);
    text('CYBER SYSTEM ONLINE', -width/2 + 30, -height/2 + 60);
    text('BASS: ' + floor(bass), -width/2 + 30, -height/2 + 80);
    
    // Scanning line
    let scanY = map(sin(time * 3), -1, 1, -height/2, height/2);
    stroke(0, 255, 255, 100);
    strokeWeight(1);
    line(-width/2, scanY, width/2, scanY);
    
    pop();
}

// MODE 10: NEURAL - Brain/Network Connections
function initNeural() {
    neurons = [];
    connections = [];
    
    // Create neurons in 3D space
    for (let i = 0; i < 100; i++) {
        neurons.push({
            x: random(-400, 400),
            y: random(-400, 400),
            z: random(-400, 400),
            size: random(5, 15),
            charge: 0,
            active: false
        });
    }
    
    // Create connections
    for (let i = 0; i < neurons.length; i++) {
        for (let j = i + 1; j < neurons.length; j++) {
            let d = dist(neurons[i].x, neurons[i].y, neurons[i].z, 
                        neurons[j].x, neurons[j].y, neurons[j].z);
            if (d < 200) {
                connections.push({ from: i, to: j, strength: 0 });
            }
        }
    }
}

function drawNeuralMode(spectrum, bass, mid, treble, level) {
    background(0);
    
    // Camera orbit
    let camAngle = time * 0.2;
    let camRadius = 600 + sin(time) * 100;
    let camX = sin(camAngle) * camRadius;
    let camZ = cos(camAngle) * camRadius;
    let camY = sin(time * 0.3) * 200;
    camera(camX, camY, camZ, 0, 0, 0, 0, 1, 0);
    
    // Activate neurons based on audio
    for (let i = 0; i < neurons.length; i++) {
        let specIndex = floor(map(i, 0, neurons.length, 0, spectrum.length - 1));
        neurons[i].charge = spectrum[specIndex] / 255;
        neurons[i].active = spectrum[specIndex] > 150;
    }
    
    // Draw connections
    for (let conn of connections) {
        let n1 = neurons[conn.from];
        let n2 = neurons[conn.to];
        
        if (n1.active && n2.active) {
            conn.strength = lerp(conn.strength, 1, 0.1);
        } else {
            conn.strength = lerp(conn.strength, 0, 0.05);
        }
        
        if (conn.strength > 0.1) {
            stroke(100, 200, 255, conn.strength * 200);
            strokeWeight(conn.strength * 2);
            line(n1.x, n1.y, n1.z, n2.x, n2.y, n2.z);
        }
    }
    
    // Draw neurons
    for (let neuron of neurons) {
        push();
        translate(neuron.x, neuron.y, neuron.z);
        
        if (neuron.active) {
            // Active neuron glow
            for (let i = 3; i > 0; i--) {
                fill(255, 100, 200, 100 / i);
                noStroke();
                sphere(neuron.size * i * 1.5);
            }
        } else {
            // Dormant neuron
            fill(100, 150, 200, 150);
            noStroke();
            sphere(neuron.size);
        }
        
        pop();
    }
    
    // Central logo
    camera();
    if (logosLoaded && amnesiaLogo) {
        push();
        imageMode(CENTER);
        tint(255, 150);
        let logoSize = 200 + bass * 0.5;
        let aspectRatio = amnesiaLogo.width / amnesiaLogo.height;
        image(amnesiaLogo, 0, 0, logoSize * aspectRatio, logoSize);
        pop();
    }
    
    // Neural pulses on beat
    if (bass > 220) {
        push();
        noFill();
        stroke(255, 0, 100, map(bass, 220, 255, 0, 200));
        strokeWeight(3);
        let pulseSize = map(bass, 220, 255, 200, 500);
        ellipse(0, 0, pulseSize, pulseSize);
        pop();
    }
}

// MODE 11: GLITCH - Digital Corruption
function initGlitch() {
    glitchBlocks = [];
    for (let i = 0; i < 50; i++) {
        glitchBlocks.push({
            x: random(-width/2, width/2),
            y: random(-height/2, height/2),
            w: random(50, 200),
            h: random(10, 50),
            speedX: random(-5, 5),
            life: random(10, 50)
        });
    }
}

function drawGlitchMode(spectrum, bass, mid, treble, level) {
    // Clear background properly
    background(0);
    
    // RGB split effect on logo
    if (logosLoaded && medusaLogo) {
        push();
        imageMode(CENTER);
        
        let logoSize = 300 + bass * 0.8;
        let aspectRatio = medusaLogo.width / medusaLogo.height;
        let w = logoSize * aspectRatio;
        let h = logoSize;
        
        // Glitch offset
        let glitchAmount = bass > 220 ? random(-20, 20) : 0;
        
        // Red channel
        tint(255, 0, 0, 150);
        image(medusaLogo, glitchAmount, 0, w, h);
        
        // Green channel
        tint(0, 255, 0, 150);
        image(medusaLogo, -glitchAmount/2, 0, w, h);
        
        // Blue channel
        tint(0, 0, 255, 150);
        image(medusaLogo, 0, glitchAmount/2, w, h);
        
        // White overlay
        tint(255, 255);
        image(medusaLogo, 0, 0, w, h);
        
        pop();
    }
    
    // Glitch blocks
    for (let block of glitchBlocks) {
        block.x += block.speedX;
        block.life--;
        
        if (block.life <= 0 || block.x > width/2 || block.x < -width/2) {
            block.x = random(-width/2, width/2);
            block.y = random(-height/2, height/2);
            block.w = random(50, 200);
            block.h = random(10, 50);
            block.speedX = random(-10, 10);
            block.life = random(10, 50);
        }
        
        // Random glitch color
        if (random() < 0.5) {
            fill(255, 0, 0, 150);
        } else if (random() < 0.5) {
            fill(0, 255, 0, 150);
        } else {
            fill(0, 0, 255, 150);
        }
        
        noStroke();
        rect(block.x, block.y, block.w, block.h);
    }
    
    // Spawn more on bass
    if (bass > 220 && frameCount % 3 === 0) {
        glitchBlocks.push({
            x: random(-width/2, width/2),
            y: random(-height/2, height/2),
            w: random(100, 400),
            h: random(5, 30),
            speedX: random(-20, 20),
            life: random(5, 20)
        });
    }
    
    // Scanlines
    push();
    stroke(255, 50);
    strokeWeight(1);
    for (let y = -height/2; y < height/2; y += 4) {
        line(-width/2, y, width/2, y);
    }
    pop();
    
    // Spectrum analyzer bars
    push();
    let barWidth = width / spectrum.length * 4;
    for (let i = 0; i < spectrum.length; i += 4) {
        let x = map(i, 0, spectrum.length, -width/2, width/2);
        let h = map(spectrum[i], 0, 255, 0, height/2);
        
        // Glitch color
        if (i % 3 === 0) fill(255, 0, 0, 200);
        else if (i % 3 === 1) fill(0, 255, 0, 200);
        else fill(0, 0, 255, 200);
        
        noStroke();
        rect(x, height/2 - h, barWidth, h);
    }
    pop();
    
    // Random pixel corruption
    if (bass > 210) {
        for (let i = 0; i < 100; i++) {
            let x = random(-width/2, width/2);
            let y = random(-height/2, height/2);
            fill(random(255), random(255), random(255), 200);
            rect(x, y, random(2, 10), random(2, 10));
        }
    }
    
    // Digital text corruption
    if (frameCount % 10 === 0) {
        push();
        textSize(random(20, 60));
        fill(random(255), random(255), random(255), 200);
        textAlign(CENTER);
        let glitchText = ['ERROR', 'CORRUPT', '01010', 'GLITCH', 'SYS.FAIL', 'AMNESIA'][floor(random(6))];
        text(glitchText, random(-width/4, width/4), random(-height/4, height/4));
        pop();
    }
}

// MODE 12: JELLYFISH - Organic Cyber Creatures
function initJellyfish() {
    jellyfishes = [];
    for (let i = 0; i < 8; i++) {
        jellyfishes.push({
            x: random(-300, 300),
            y: random(-400, 0),
            z: random(-300, 300),
            size: random(50, 150),
            tentacles: floor(random(12, 24)),
            phase: random(TWO_PI),
            speed: random(0.02, 0.05),
            floatOffset: random(100)
        });
    }
}

function drawJellyfishMode(spectrum, bass, mid, treble, level) {
    // Deep ocean atmosphere
    background(0, 5, 20);
    
    // Camera movement
    let camAngle = time * 0.1;
    let camX = sin(camAngle) * 400;
    let camZ = cos(camAngle) * 400;
    let camY = sin(time * 0.15) * 100;
    camera(camX, camY, camZ, 0, 0, 0, 0, 1, 0);
    
    // Ambient particles (plankton)
    push();
    for (let i = 0; i < 200; i++) {
        let px = sin(time + i) * 500;
        let py = cos(time * 0.7 + i * 0.5) * 400;
        let pz = sin(time * 0.5 + i * 0.3) * 500;
        
        let specValue = spectrum[i % spectrum.length];
        let brightness = map(specValue, 0, 255, 50, 255);
        
        push();
        translate(px, py, pz);
        fill(100, 200, 255, brightness * 0.5);
        noStroke();
        sphere(2);
        pop();
    }
    pop();
    
    // Draw jellyfishes
    for (let jelly of jellyfishes) {
        // Update position - floating
        jelly.y += sin(time * 2 + jelly.phase) * jelly.speed * 20;
        jelly.floatOffset = sin(time + jelly.phase) * 100;
        
        // Keep in bounds
        if (jelly.y > 300) jelly.y = -400;
        if (jelly.y < -400) jelly.y = 300;
        
        push();
        translate(jelly.x, jelly.y + jelly.floatOffset, jelly.z);
        
        // Bell/head of jellyfish
        push();
        let bellSize = jelly.size * (1 + level * 0.3);
        
        // Outer glow
        for (let i = 3; i > 0; i--) {
            fill(150, 200, 255, 30 / i);
            noStroke();
            sphere(bellSize * i * 0.4);
        }
        
        // Main bell
        fill(100, 180, 255, 150);
        noStroke();
        sphere(bellSize * 0.3);
        
        // Bell rim
        rotateX(HALF_PI);
        fill(120, 200, 255, 100);
        torus(bellSize * 0.35, bellSize * 0.1);
        
        pop();
        
        // Tentacles
        let tentacleIndex = jellyfishes.indexOf(jelly);
        for (let t = 0; t < jelly.tentacles; t++) {
            let angle = TWO_PI / jelly.tentacles * t;
            let specValue = spectrum[floor(map(t, 0, jelly.tentacles, 0, spectrum.length - 1))];
            
            push();
            rotate(angle);
            
            // Tentacle curve
            noFill();
            stroke(100, 220, 255, 200);
            strokeWeight(2);
            
            beginShape();
            for (let i = 0; i < 20; i++) {
                let dist = i * 20;
                let wave = sin(time * 3 + i * 0.3 + t * 0.2 + jelly.phase) * 15;
                let audioWave = map(specValue, 0, 255, 0, 20);
                
                vertex(wave + audioWave, dist, 0);
                
                // Glowing points along tentacle
                if (i % 3 === 0) {
                    push();
                    translate(wave + audioWave, dist, 0);
                    fill(150, 230, 255, 150);
                    noStroke();
                    sphere(3);
                    pop();
                }
            }
            endShape();
            
            pop();
        }
        
        pop();
    }
    
    // Central logo integration
    camera();
    if (logosLoaded && medusaLogo) {
        push();
        imageMode(CENTER);
        
        // Underwater glow effect
        tint(100, 200, 255, 180);
        let logoSize = 200 + sin(time * 2) * 20 + bass * 0.5;
        let aspectRatio = medusaLogo.width / medusaLogo.height;
        
        rotate(sin(time * 0.5) * 0.1);
        image(medusaLogo, 0, 0, logoSize * aspectRatio, logoSize);
        
        // Pulse on bass
        if (bass > 220) {
            tint(150, 230, 255, map(bass, 220, 255, 0, 150));
            image(medusaLogo, 0, 0, logoSize * 1.3 * aspectRatio, logoSize * 1.3);
        }
        
        pop();
    }
    
    // Caustics/light rays from surface
    camera(camX, camY, camZ, 0, 0, 0, 0, 1, 0);
    if (treble > 180) {
        push();
        translate(0, -500, 0);
        for (let i = 0; i < 10; i++) {
            let angle = time + i * 0.5;
            let x = sin(angle) * 200;
            let z = cos(angle) * 200;
            
            stroke(150, 220, 255, 50);
            strokeWeight(3);
            line(x, 0, z, x * 2, 600, z * 2);
        }
        pop();
    }
}

// MODE 13: FRACTAL - Infinite Geometric Patterns
function initFractal() {
    fractals = [];
}

function drawFractalMode(spectrum, bass, mid, treble, level) {
    background(0);
    
    // Recursive fractal shapes
    push();
    
    let maxDepth = floor(6 + bass * 0.02);
    let baseSize = 500 + mid * 2;
    
    // Multiple fractal layers
    for (let layer = 0; layer < 3; layer++) {
        push();
        rotateZ(time * (layer % 2 === 0 ? 0.2 : -0.2) + layer);
        drawFractalShape(0, 0, baseSize - layer * 100, maxDepth - layer, spectrum, layer);
        pop();
    }
    
    pop();
    
    // Sacred geometry overlay
    push();
    noFill();
    stroke(255, 150);
    strokeWeight(1);
    
    for (let i = 0; i < 6; i++) {
        let size = 100 + i * 60 + sin(time * 2 + i) * 30;
        
        push();
        rotate(time * 0.5 + i * 0.3);
        
        // Hexagon
        beginShape();
        for (let j = 0; j < 6; j++) {
            let angle = TWO_PI / 6 * j;
            let x = cos(angle) * size;
            let y = sin(angle) * size;
            vertex(x, y);
        }
        endShape(CLOSE);
        
        // Connect to center
        for (let j = 0; j < 6; j++) {
            let angle = TWO_PI / 6 * j;
            let x = cos(angle) * size;
            let y = sin(angle) * size;
            line(0, 0, x, y);
        }
        
        pop();
    }
    pop();
    
    // Logo in center
    if (logosLoaded && amnesiaLogo) {
        push();
        imageMode(CENTER);
        tint(255, 200);
        let logoSize = 150 + bass * 0.4;
        let aspectRatio = amnesiaLogo.width / amnesiaLogo.height;
        image(amnesiaLogo, 0, 0, logoSize * aspectRatio, logoSize);
        pop();
    }
    
    // Mandala rings
    if (bass > 210) {
        push();
        noFill();
        stroke(255, map(bass, 210, 255, 0, 200));
        strokeWeight(2);
        
        for (let r = 1; r < 5; r++) {
            let radius = r * 100 + bass * r;
            ellipse(0, 0, radius * 2, radius * 2);
        }
        pop();
    }
}

function drawFractalShape(x, y, size, depth, spectrum, layer) {
    if (depth <= 0 || size < 5) return;
    
    let specIndex = floor(map(depth, 0, 6, 0, spectrum.length - 1));
    let brightness = map(spectrum[specIndex], 0, 255, 100, 255);
    
    push();
    translate(x, y);
    
    // Draw shape based on layer
    noFill();
    stroke(255, brightness * 0.8);
    strokeWeight(map(depth, 0, 6, 1, 3));
    
    if (layer % 3 === 0) {
        // Triangle
        let offset = size / 2;
        triangle(-offset, offset, offset, offset, 0, -offset);
        
        // Recursive children
        drawFractalShape(0, -offset / 2, size * 0.5, depth - 1, spectrum, layer);
        drawFractalShape(-offset / 2, offset / 2, size * 0.5, depth - 1, spectrum, layer);
        drawFractalShape(offset / 2, offset / 2, size * 0.5, depth - 1, spectrum, layer);
    } else if (layer % 3 === 1) {
        // Square
        rect(-size/2, -size/2, size, size);
        
        // Recursive corners
        let newSize = size * 0.4;
        drawFractalShape(-size/3, -size/3, newSize, depth - 1, spectrum, layer);
        drawFractalShape(size/3, -size/3, newSize, depth - 1, spectrum, layer);
        drawFractalShape(-size/3, size/3, newSize, depth - 1, spectrum, layer);
        drawFractalShape(size/3, size/3, newSize, depth - 1, spectrum, layer);
    } else {
        // Pentagon
        beginShape();
        for (let i = 0; i < 5; i++) {
            let angle = TWO_PI / 5 * i - HALF_PI;
            let px = cos(angle) * size / 2;
            let py = sin(angle) * size / 2;
            vertex(px, py);
        }
        endShape(CLOSE);
        
        // Recursive pentagons
        for (let i = 0; i < 5; i++) {
            let angle = TWO_PI / 5 * i - HALF_PI;
            let px = cos(angle) * size / 3;
            let py = sin(angle) * size / 3;
            drawFractalShape(px, py, size * 0.4, depth - 1, spectrum, layer);
        }
    }
    
    pop();
}

// MODE 14: PULSE - Energy Wave Explosions
function initPulse() {
    pulseRings = [];
}

function drawPulseMode(spectrum, bass, mid, treble, level) {
    // Fade background
    push();
    fill(0, 30);
    rect(-width/2, -height/2, width, height);
    pop();
    
    // Create new pulse on beat
    if (bass > 220 && frameCount % 5 === 0) {
        pulseRings.push({
            size: 0,
            maxSize: random(400, 800),
            life: 1,
            speed: random(5, 15),
            thickness: random(2, 8),
            segments: floor(random(3, 9))
        });
    }
    
    // Update and draw pulses
    for (let i = pulseRings.length - 1; i >= 0; i--) {
        let pulse = pulseRings[i];
        
        pulse.size += pulse.speed;
        pulse.life = 1 - (pulse.size / pulse.maxSize);
        
        if (pulse.life <= 0) {
            pulseRings.splice(i, 1);
            continue;
        }
        
        push();
        
        // Multiple rings per pulse
        for (let r = 0; r < 3; r++) {
            let ringSize = pulse.size + r * 30;
            let alpha = pulse.life * 255 / (r + 1);
            
            stroke(255, alpha);
            strokeWeight(pulse.thickness / (r + 1));
            noFill();
            
            if (pulse.segments > 5) {
                // Full circle
                ellipse(0, 0, ringSize * 2, ringSize * 2);
            } else {
                // Segmented circle
                for (let s = 0; s < pulse.segments; s++) {
                    let startAngle = TWO_PI / pulse.segments * s;
                    let endAngle = startAngle + TWO_PI / pulse.segments * 0.8;
                    arc(0, 0, ringSize * 2, ringSize * 2, startAngle, endAngle);
                }
            }
        }
        
        pop();
    }
    
    // Spectrum circular visualizer
    push();
    let bars = 128;
    for (let i = 0; i < bars; i++) {
        let angle = map(i, 0, bars, 0, TWO_PI);
        let specValue = spectrum[floor(map(i, 0, bars, 0, spectrum.length))];
        let barHeight = map(specValue, 0, 255, 50, 300);
        
        push();
        rotate(angle);
        
        // Bar
        stroke(255, 200);
        strokeWeight(3);
        line(150, 0, 150 + barHeight, 0);
        
        // Bar tip glow
        fill(255);
        noStroke();
        ellipse(150 + barHeight, 0, 5, 5);
        
        pop();
    }
    pop();
    
    // Central core
    push();
    let coreSize = 80 + bass * 0.8;
    
    // Outer glow
    for (let i = 4; i > 0; i--) {
        fill(255, 255, 255, 50 / i);
        noStroke();
        ellipse(0, 0, coreSize * i, coreSize * i);
    }
    
    // Core
    fill(255);
    ellipse(0, 0, coreSize, coreSize);
    
    // Logo
    if (logosLoaded && amnesiaLogo) {
        imageMode(CENTER);
        tint(0, 0, 0, 255);
        let logoSize = coreSize * 0.6;
        let aspectRatio = amnesiaLogo.width / amnesiaLogo.height;
        image(amnesiaLogo, 0, 0, logoSize * aspectRatio, logoSize);
    }
    
    pop();
    
    // Energy particles
    if (mid > 180) {
        for (let i = 0; i < 100; i++) {
            let angle = random(TWO_PI);
            let dist = random(100, 400);
            let x = cos(angle) * dist;
            let y = sin(angle) * dist;
            
            fill(255, random(150, 255));
            noStroke();
            ellipse(x, y, random(2, 6), random(2, 6));
        }
    }
    
    // Beat flash
    if (bass > 230) {
        push();
        fill(255, map(bass, 230, 255, 0, 100));
        rect(-width/2, -height/2, width, height);
        pop();
    }
}

// MODE 15: EYE - All-Seeing Eye
function initEye() {
    eyeParticles = [];
    for (let i = 0; i < 360; i += 3) {
        eyeParticles.push({
            angle: radians(i),
            radius: 200,
            targetRadius: 200,
            speed: random(0.01, 0.03)
        });
    }
}

function drawEyeMode(spectrum, bass, mid, treble, level) {
    background(0);
    
    // Eye outer glow
    push();
    for (let i = 5; i > 0; i--) {
        fill(255, 255, 255, 20 / i);
        noStroke();
        ellipse(0, 0, 600 * i, 400 * i);
    }
    pop();
    
    // Iris - outer circle
    push();
    let irisSize = 300 + bass * 0.8;
    
    // Iris texture rings
    for (let r = 10; r > 0; r--) {
        let ringSize = irisSize * (r / 10);
        let alpha = map(r, 0, 10, 50, 200);
        
        noFill();
        stroke(150, 150, 200, alpha);
        strokeWeight(2);
        ellipse(0, 0, ringSize, ringSize);
    }
    
    // Iris patterns
    for (let i = 0; i < 360; i += 10) {
        let angle = radians(i) + time;
        let x1 = cos(angle) * (irisSize * 0.3);
        let y1 = sin(angle) * (irisSize * 0.3);
        let x2 = cos(angle) * (irisSize * 0.5);
        let y2 = sin(angle) * (irisSize * 0.5);
        
        stroke(100, 100, 180, 150);
        strokeWeight(1);
        line(x1, y1, x2, y2);
    }
    
    pop();
    
    // Pupil
    push();
    let pupilSize = 100 + sin(time * 2) * 20 - mid * 0.3;
    pupilSize = constrain(pupilSize, 60, 200);
    
    // Pupil glow
    for (let i = 3; i > 0; i--) {
        fill(0, 0, 0, 200 / i);
        noStroke();
        ellipse(0, 0, pupilSize * i, pupilSize * i);
    }
    
    // Deep black pupil
    fill(0);
    ellipse(0, 0, pupilSize, pupilSize);
    
    // Logo in pupil
    if (logosLoaded && amnesiaLogo) {
        imageMode(CENTER);
        tint(255, 200);
        let logoSize = pupilSize * 0.6;
        let aspectRatio = amnesiaLogo.width / amnesiaLogo.height;
        image(amnesiaLogo, 0, 0, logoSize * aspectRatio, logoSize);
    }
    
    pop();
    
    // Eyelid top and bottom
    push();
    let blinkAmount = bass > 230 ? map(bass, 230, 255, 0, 150) : 0;
    
    // Top eyelid
    fill(0);
    noStroke();
    arc(0, -blinkAmount, 700, 500, PI, TWO_PI);
    
    // Bottom eyelid  
    arc(0, blinkAmount, 700, 500, 0, PI);
    
    // Eyelashes
    stroke(255, 200);
    strokeWeight(2);
    for (let i = 0; i < 20; i++) {
        let angle = map(i, 0, 20, PI, TWO_PI);
        let x1 = cos(angle) * 350;
        let y1 = sin(angle) * 250 - blinkAmount;
        let x2 = cos(angle) * 400;
        let y2 = sin(angle) * 280 - blinkAmount;
        line(x1, y1, x2, y2);
    }
    
    pop();
    
    // Energy particles orbiting
    for (let i = 0; i < eyeParticles.length; i++) {
        let p = eyeParticles[i];
        
        // Update radius based on audio
        let specIndex = floor(map(i, 0, eyeParticles.length, 0, spectrum.length - 1));
        p.targetRadius = 250 + spectrum[specIndex] * 0.5;
        p.radius = lerp(p.radius, p.targetRadius, 0.1);
        
        p.angle += p.speed;
        
        let x = cos(p.angle) * p.radius;
        let y = sin(p.angle) * p.radius * 0.7;
        
        push();
        fill(200, 200, 255, 200);
        noStroke();
        ellipse(x, y, 3, 3);
        pop();
    }
    
    // Mystic symbols around eye
    if (treble > 200) {
        push();
        textSize(30);
        textAlign(CENTER, CENTER);
        fill(255, map(treble, 200, 255, 100, 255));
        
        let symbols = ['◬', '◭', '◮', '◯', '◰', '◱', '◲', '◳'];
        for (let i = 0; i < symbols.length; i++) {
            let angle = TWO_PI / symbols.length * i + time;
            let x = cos(angle) * 450;
            let y = sin(angle) * 300;
            
            push();
            translate(x, y);
            rotate(angle + HALF_PI);
            text(symbols[i], 0, 0);
            pop();
        }
        pop();
    }
}

// MODE 16: HAND - Mystic Hand
function initHand() {
    handFingers = [
        { name: 'thumb', segments: 2, angle: -0.4 },
        { name: 'index', segments: 3, angle: -0.2 },
        { name: 'middle', segments: 3, angle: 0 },
        { name: 'ring', segments: 3, angle: 0.2 },
        { name: 'pinky', segments: 3, angle: 0.4 }
    ];
}

function drawHandMode(spectrum, bass, mid, treble, level) {
    background(0);
    
    // Mystical aura around hand
    push();
    for (let i = 5; i > 0; i--) {
        fill(100, 50, 150, 15 / i);
        noStroke();
        ellipse(0, 100, 500 * i, 600 * i);
    }
    pop();
    
    // Palm
    push();
    translate(0, 100);
    
    // Palm glow
    for (let i = 3; i > 0; i--) {
        fill(200, 180, 255, 50 / i);
        noStroke();
        ellipse(0, 0, 200 * i, 250 * i);
    }
    
    // Palm base
    fill(180, 180, 200, 200);
    stroke(255, 200);
    strokeWeight(2);
    ellipse(0, 0, 180, 220);
    
    // Palm lines
    stroke(150, 150, 200, 150);
    strokeWeight(2);
    
    // Life line
    beginShape();
    for (let i = 0; i < 20; i++) {
        let x = map(i, 0, 20, -60, 40);
        let y = map(i, 0, 20, -80, 100) + sin(time * 2 + i * 0.3) * 5;
        vertex(x, y);
    }
    endShape();
    
    // Heart line  
    beginShape();
    for (let i = 0; i < 20; i++) {
        let x = map(i, 0, 20, -70, 60);
        let y = map(i, 0, 20, -40, -20) + sin(time * 3 + i * 0.2) * 3;
        vertex(x, y);
    }
    endShape();
    
    // Head line
    beginShape();
    for (let i = 0; i < 20; i++) {
        let x = map(i, 0, 20, -60, 70);
        let y = map(i, 0, 20, 0, 20) + sin(time * 4 + i * 0.4) * 4;
        vertex(x, y);
    }
    endShape();
    
    // Center eye symbol
    if (logosLoaded && medusaLogo) {
        imageMode(CENTER);
        tint(255, 180);
        let logoSize = 80 + bass * 0.3;
        let aspectRatio = medusaLogo.width / medusaLogo.height;
        image(medusaLogo, 0, -20, logoSize * aspectRatio, logoSize);
    }
    
    pop();
    
    // Fingers
    push();
    translate(0, 100);
    
    for (let f = 0; f < handFingers.length; f++) {
        let finger = handFingers[f];
        let specValue = spectrum[f * 20 % spectrum.length];
        let fingerBend = map(specValue, 0, 255, 0, 0.3);
        
        push();
        
        // Position at top of palm
        let startX = finger.angle * 60;
        translate(startX, -110);
        rotate(finger.angle * 0.5);
        
        // Draw finger segments
        for (let s = 0; s < finger.segments; s++) {
            push();
            
            // Segment rotation based on audio
            rotate(-fingerBend * (s + 1));
            
            // Segment
            let segLength = finger.name === 'thumb' ? 40 : 50;
            let segWidth = map(s, 0, finger.segments, 25, 12);
            
            fill(180, 180, 200, 200);
            stroke(255, 200);
            strokeWeight(2);
            rect(-segWidth/2, 0, segWidth, segLength, 5);
            
            // Joint
            fill(200, 200, 220, 200);
            noStroke();
            ellipse(0, 0, segWidth * 0.8, segWidth * 0.8);
            
            // Energy lines on segments
            if (mid > 180) {
                stroke(255, 100, 200, 150);
                strokeWeight(1);
                line(-segWidth/3, 10, -segWidth/3, segLength - 10);
                line(segWidth/3, 10, segWidth/3, segLength - 10);
            }
            
            translate(0, segLength);
            
            pop();
        }
        
        // Fingertip glow
        let tipY = finger.segments * (finger.name === 'thumb' ? 40 : 50);
        push();
        translate(0, tipY);
        
        for (let i = 3; i > 0; i--) {
            fill(255, 200, 255, 50 / i);
            noStroke();
            ellipse(0, 0, 20 * i, 20 * i);
        }
        
        fill(255, 150, 255);
        ellipse(0, 0, 8, 8);
        pop();
        
        pop();
    }
    
    pop();
    
    // Energy streams from fingertips on bass
    if (bass > 220) {
        push();
        translate(0, 100);
        
        for (let f = 0; f < handFingers.length; f++) {
            let finger = handFingers[f];
            let startX = finger.angle * 60;
            let tipY = -110 - finger.segments * (finger.name === 'thumb' ? 40 : 50);
            
            // Lightning from finger
            stroke(255, 150, 255, map(bass, 220, 255, 0, 200));
            strokeWeight(2);
            
            let x = startX;
            let y = tipY;
            
            for (let i = 0; i < 10; i++) {
                let nextX = x + random(-30, 30);
                let nextY = y - random(20, 50);
                line(x, y, nextX, nextY);
                x = nextX;
                y = nextY;
            }
        }
        
        pop();
    }
    
    // Mystic circle background
    push();
    noFill();
    stroke(150, 100, 200, 100);
    strokeWeight(2);
    
    for (let r = 1; r < 6; r++) {
        let radius = r * 100 + sin(time * 2 + r) * 20;
        ellipse(0, 100, radius * 2, radius * 2);
    }
    
    // Runes around hand
    if (treble > 190) {
        textSize(25);
        textAlign(CENTER, CENTER);
        fill(200, 150, 255, map(treble, 190, 255, 100, 255));
        
        let runes = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ'];
        for (let i = 0; i < runes.length; i++) {
            let angle = TWO_PI / runes.length * i + time * 0.5;
            let x = cos(angle) * 400;
            let y = sin(angle) * 400 + 100;
            
            push();
            translate(x, y);
            rotate(angle + HALF_PI);
            text(runes[i], 0, 0);
            pop();
        }
    }
    
    pop();
}

// MODE 17: PORTAL - Dimensional Gateway
function initPortal() {
    portalLayers = [];
    for (let i = 0; i < 15; i++) {
        portalLayers.push({
            radius: i * 40 + 50,
            rotation: 0,
            speed: random(0.01, 0.03) * (i % 2 === 0 ? 1 : -1),
            segments: floor(random(6, 12))
        });
    }
}

function drawPortalMode(spectrum, bass, mid, treble, level) {
    background(0);
    
    // Portal depth effect
    push();
    for (let z = 0; z < 20; z++) {
        let depth = z / 20;
        let portalSize = map(z, 0, 20, 50, 600);
        let alpha = map(z, 0, 20, 200, 20);
        
        push();
        scale(1 - depth * 0.3);
        rotate(time * (z % 2 === 0 ? 0.5 : -0.5));
        
        noFill();
        stroke(100 + z * 8, 50 + z * 5, 200 - z * 5, alpha);
        strokeWeight(map(z, 0, 20, 3, 1));
        
        // Portal ring
        ellipse(0, 0, portalSize, portalSize);
        
        // Cross pattern
        line(-portalSize/2, 0, portalSize/2, 0);
        line(0, -portalSize/2, 0, portalSize/2);
        
        pop();
    }
    pop();
    
    // Rotating portal layers
    for (let layer of portalLayers) {
        layer.rotation += layer.speed * (1 + level * 2);
        
        let specIndex = floor(map(portalLayers.indexOf(layer), 0, portalLayers.length, 0, spectrum.length - 1));
        let radiusMod = map(spectrum[specIndex], 0, 255, 0, 30);
        
        push();
        rotate(layer.rotation);
        
        noFill();
        stroke(150, 100, 255, 150);
        strokeWeight(2);
        
        // Segmented ring
        for (let s = 0; s < layer.segments; s++) {
            let angle1 = TWO_PI / layer.segments * s;
            let angle2 = angle1 + TWO_PI / layer.segments * 0.7;
            
            arc(0, 0, (layer.radius + radiusMod) * 2, (layer.radius + radiusMod) * 2, 
                angle1, angle2);
        }
        
        // Connecting lines
        for (let s = 0; s < layer.segments; s++) {
            let angle = TWO_PI / layer.segments * s;
            let x = cos(angle) * (layer.radius + radiusMod);
            let y = sin(angle) * (layer.radius + radiusMod);
            
            stroke(100, 150, 255, 100);
            strokeWeight(1);
            line(0, 0, x, y);
        }
        
        pop();
    }
    
    // Portal center vortex
    push();
    let vortexSize = 100 + bass * 0.8;
    
    // Vortex spiral
    stroke(200, 150, 255, 200);
    strokeWeight(2);
    noFill();
    
    beginShape();
    for (let i = 0; i < 100; i++) {
        let angle = i * 0.3 + time * 3;
        let radius = i * 2 + sin(time * 2 + i * 0.1) * 10;
        
        if (radius > vortexSize) break;
        
        let x = cos(angle) * radius;
        let y = sin(angle) * radius;
        vertex(x, y);
    }
    endShape();
    
    // Center logo
    if (logosLoaded && amnesiaLogo) {
        imageMode(CENTER);
        tint(200, 150, 255, 230);
        let logoSize = vortexSize * 0.8;
        let aspectRatio = amnesiaLogo.width / amnesiaLogo.height;
        rotate(time * 0.5);
        image(amnesiaLogo, 0, 0, logoSize * aspectRatio, logoSize);
    }
    
    pop();
    
    // Energy particles being sucked into portal
    for (let i = 0; i < 50; i++) {
        let angle = time * 2 + i * 0.5;
        let radius = 400 + sin(time * 3 + i) * 100;
        let speed = map(sin(time + i), -1, 1, 2, 8);
        
        radius -= speed;
        if (radius < 50) radius = 500;
        
        let x = cos(angle) * radius;
        let y = sin(angle) * radius;
        
        let size = map(radius, 50, 500, 2, 8);
        let alpha = map(radius, 50, 500, 50, 255);
        
        fill(150, 100, 255, alpha);
        noStroke();
        ellipse(x, y, size, size);
        
        // Particle trail
        stroke(100, 50, 200, alpha * 0.5);
        strokeWeight(1);
        let prevX = cos(angle - 0.1) * (radius + 10);
        let prevY = sin(angle - 0.1) * (radius + 10);
        line(x, y, prevX, prevY);
    }
    
    // Dimensional rifts on heavy bass
    if (bass > 230) {
        push();
        stroke(255, 100, 255, map(bass, 230, 255, 0, 255));
        strokeWeight(4);
        
        for (let i = 0; i < 8; i++) {
            let angle = random(TWO_PI);
            let x1 = cos(angle) * 100;
            let y1 = sin(angle) * 100;
            let x2 = cos(angle) * 500;
            let y2 = sin(angle) * 500;
            
            line(x1, y1, x2, y2);
        }
        pop();
    }
    
    // Outer hex pattern
    push();
    noFill();
    stroke(100, 80, 200, 80);
    strokeWeight(1);
    
    for (let h = 0; h < 3; h++) {
        push();
        rotate(time * 0.2 + h);
        let hexSize = 300 + h * 100;
        
        beginShape();
        for (let i = 0; i < 6; i++) {
            let angle = TWO_PI / 6 * i;
            let x = cos(angle) * hexSize;
            let y = sin(angle) * hexSize;
            vertex(x, y);
        }
        endShape(CLOSE);
        pop();
    }
    pop();
}

function strobeEffect() {
    strobeActive = true;
    setTimeout(() => strobeActive = false, 50);
}

function onBeat(bassLevel) {
    // BPM calculation
    let currentTime = millis();
    if (lastBeatTime > 0) {
        beatInterval = currentTime - lastBeatTime;
        beatHistory.push(beatInterval);
        
        if (beatHistory.length > 10) {
            beatHistory.shift();
        }
        
        let avgInterval = beatHistory.reduce((a, b) => a + b) / beatHistory.length;
        bpm = Math.round(60000 / avgInterval);
        
        document.getElementById('bpm').textContent = bpm;
    }
    
    lastBeatTime = currentTime;
    
    // Visual beat indicator
    let indicator = document.getElementById('beatIndicator');
    indicator.classList.add('beat');
    setTimeout(() => indicator.classList.remove('beat'), 100);
}

function drawIdleState() {
    // Minimal idle animation
    push();
    
    noFill();
    strokeWeight(1);
    
    for (let i = 0; i < 5; i++) {
        let size = 100 + i * 50 + sin(time * 2 + i) * 20;
        let idleHue = i * 72;
        let idleCol = getColor(idleHue, 80, 80, 50);
        stroke(idleCol);
        ellipse(0, 0, size, size);
    }
    
    // AMNESIA logo
    let logoCol = getColor(0, 60, 100, 255);
    fill(logoCol);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(48);
    text('AMNESIA', 0, 0);
    
    textSize(14);
    let subCol = getColor(180, 60, 80, 100);
    fill(subCol);
    text('LOAD A TRACK TO START', 0, 40);
    
    pop();
    
    time += 0.02;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    
    // Reinit matrix for new size
    matrixLines = [];
    initMatrix();
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function toggleUI() {
    document.getElementById('controls').classList.toggle('hidden');
    document.getElementById('bpm-display').style.display = 
        document.getElementById('bpm-display').style.display === 'none' ? 'block' : 'none';
    document.getElementById('info').style.display = 
        document.getElementById('info').style.display === 'none' ? 'block' : 'none';
}

// Keyboard shortcuts
function keyPressed() {
    if (key === 'h' || key === 'H') {
        toggleUI();
    }
    
    if (key === ' ') {
        if (song && song.isPlaying()) {
            song.pause();
        } else if (song) {
            song.play();
        }
    }
    
    if (key === 'v' || key === 'V') {
        toggleFullscreen();
    }
    
    // Letter shortcuts for modes
    if (key === 'q' || key === 'Q') setMode(1);
    if (key === 'w' || key === 'W') setMode(2);
    if (key === 'e' || key === 'E') setMode(3);
    if (key === 'r' || key === 'R') setMode(4);
    if (key === 't' || key === 'T') setMode(5);
    if (key === 'y' || key === 'Y') setMode(6);
    if (key === 'u' || key === 'U') setMode(7);
    if (key === 'i' || key === 'I') setMode(8);
    if (key === 'o' || key === 'O') setMode(9);
    if (key === 'p' || key === 'P') setMode(10);
    if (key === 'a' || key === 'A') setMode(11);
    if (key === 's' || key === 'S') setMode(12);
    if (key === 'd' || key === 'D') setMode(13);
    if (key === 'f' || key === 'F') setMode(14);
    if (key === 'g' || key === 'G') setMode(15);
    if (key === 'z' || key === 'Z') setMode(16);
    if (key === 'x' || key === 'X') setMode(17);
    
    // Keep number shortcuts too
    if (key >= '1' && key <= '9') {
        setMode(parseInt(key));
    }
    if (key === '0') {
        setMode(10);
    }
}
