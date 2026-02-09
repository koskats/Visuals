let song;
let fft;
let amplitude;
let particles = [];
let mode = 1;
let angle = 0;

function preload() {
    // Μπορείς να φορτώσεις default track εδώ
    // song = loadSound('your-track.mp3');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 100);
    
    // Audio analysis
    fft = new p5.FFT(0.8, 512);
    amplitude = new p5.Amplitude();
    
    // Particles για mode 3
    for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
    }
    
    // Controls
    document.getElementById('audioFile').addEventListener('change', handleFile);
    document.getElementById('playBtn').addEventListener('click', () => {
        if (song && song.isLoaded()) {
            song.play();
        }
    });
    document.getElementById('pauseBtn').addEventListener('click', () => {
        if (song && song.isPlaying()) {
            song.pause();
        }
    });
    document.getElementById('mode1').addEventListener('click', () => mode = 1);
    document.getElementById('mode2').addEventListener('click', () => mode = 2);
    document.getElementById('mode3').addEventListener('click', () => mode = 3);
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
    background(0, 0, 0, 20);
    
    if (!song || !song.isPlaying()) {
        // Idle animation
        drawIdleState();
        return;
    }
    
    // Analyze audio
    let spectrum = fft.analyze();
    let level = amplitude.getLevel();
    
    translate(width / 2, height / 2);
    
    switch(mode) {
        case 1:
            drawCircularMode(spectrum, level);
            break;
        case 2:
            drawWaveformMode(spectrum, level);
            break;
        case 3:
            drawParticlesMode(spectrum, level);
            break;
    }
    
    angle += 0.01;
}

function drawCircularMode(spectrum, level) {
    // Ομόκεντροι κύκλοι που αντιδρούν στο audio
    let bassEnergy = fft.getEnergy("bass");
    let midEnergy = fft.getEnergy("mid");
    let trebleEnergy = fft.getEnergy("treble");
    
    // Εξωτερικός κύκλος (bass)
    push();
    rotate(angle);
    noFill();
    stroke(200, 100, 100, 80);
    strokeWeight(map(bassEnergy, 0, 255, 2, 20));
    let bassRadius = map(bassEnergy, 0, 255, 100, 400);
    circle(0, 0, bassRadius * 2);
    
    // Polygonal shapes
    beginShape();
    for (let i = 0; i < 8; i++) {
        let ang = TWO_PI / 8 * i;
        let r = bassRadius + sin(angle * 3 + i) * 50;
        let x = cos(ang) * r;
        let y = sin(ang) * r;
        vertex(x, y);
    }
    endShape(CLOSE);
    pop();
    
    // Μεσαίος κύκλος (mid)
    push();
    rotate(-angle * 1.5);
    stroke(120, 100, 100, 80);
    strokeWeight(map(midEnergy, 0, 255, 2, 15));
    let midRadius = map(midEnergy, 0, 255, 60, 250);
    for (let i = 0; i < 12; i++) {
        let ang = TWO_PI / 12 * i;
        let x1 = cos(ang) * midRadius;
        let y1 = sin(ang) * midRadius;
        let x2 = cos(ang) * (midRadius + 30);
        let y2 = sin(ang) * (midRadius + 30);
        line(x1, y1, x2, y2);
    }
    pop();
    
    // Εσωτερικός κύκλος (treble)
    push();
    rotate(angle * 2);
    stroke(300, 100, 100, 80);
    strokeWeight(map(trebleEnergy, 0, 255, 1, 10));
    let trebleRadius = map(trebleEnergy, 0, 255, 30, 150);
    
    beginShape();
    for (let i = 0; i < TWO_PI; i += 0.1) {
        let r = trebleRadius + sin(i * 5 + angle * 10) * 20;
        let x = cos(i) * r;
        let y = sin(i) * r;
        vertex(x, y);
    }
    endShape(CLOSE);
    pop();
    
    // Spectrum bars σε κύκλο
    for (let i = 0; i < spectrum.length; i += 4) {
        let amp = spectrum[i];
        let hue = map(i, 0, spectrum.length, 0, 360);
        let ang = map(i, 0, spectrum.length, 0, TWO_PI);
        
        push();
        rotate(ang);
        stroke(hue, 100, 100, 70);
        strokeWeight(3);
        let lineLength = map(amp, 0, 255, 0, 200);
        line(200, 0, 200 + lineLength, 0);
        pop();
    }
}

function drawWaveformMode(spectrum, level) {
    // Κυματομορφή με multiple layers
    push();
    translate(-width / 2, 0);
    
    for (let layer = 0; layer < 5; layer++) {
        beginShape();
        noFill();
        let hue = (angle * 50 + layer * 60) % 360;
        stroke(hue, 100, 100, 50);
        strokeWeight(2);
        
        for (let i = 0; i < spectrum.length; i += 2) {
            let x = map(i, 0, spectrum.length, 0, width);
            let y = map(spectrum[i], 0, 255, -200, 200);
            y += sin(i * 0.05 + angle * 2 + layer) * 50;
            y += layer * 20 - 40;
            vertex(x, y);
        }
        endShape();
    }
    pop();
    
    // Κάθετες γραμμές για beat detection
    let bass = fft.getEnergy("bass");
    if (bass > 200) {
        for (let i = 0; i < 10; i++) {
            let x = random(-width / 2, width / 2);
            stroke(random(360), 100, 100, 30);
            strokeWeight(random(1, 5));
            line(x, -height / 2, x, height / 2);
        }
    }
}

function drawParticlesMode(spectrum, level) {
    // Update και draw particles
    let bassEnergy = fft.getEnergy("bass");
    
    particles.forEach(p => {
        p.update(spectrum, level, bassEnergy);
        p.show();
    });
    
    // Spawn νέα particles στο beat
    if (bassEnergy > 220 && frameCount % 5 === 0) {
        particles.push(new Particle());
    }
    
    // Καθαρισμός παλιών particles
    if (particles.length > 300) {
        particles.splice(0, 50);
    }
}

function drawIdleState() {
    push();
    translate(width / 2, height / 2);
    
    // Απλό idle animation
    for (let i = 0; i < 3; i++) {
        noFill();
        stroke(120 * i, 100, 100, 30);
        strokeWeight(2);
        let r = 100 + i * 50 + sin(angle * 2 + i) * 20;
        circle(0, 0, r * 2);
    }
    
    // Text
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(24);
    text('Load a track to start', 0, 0);
    
    pop();
    angle += 0.02;
}

class Particle {
    constructor() {
        this.pos = createVector(0, 0);
        this.vel = p5.Vector.random2D().mult(random(1, 5));
        this.acc = createVector(0, 0);
        this.size = random(2, 8);
        this.hue = random(360);
        this.alpha = 100;
        this.life = 255;
    }
    
    update(spectrum, level, bassEnergy) {
        // Force από το audio
        let force = p5.Vector.random2D();
        force.mult(level * 5);
        this.acc.add(force);
        
        // Bass pulse
        if (bassEnergy > 200) {
            let pulse = p5.Vector.fromAngle(this.pos.heading());
            pulse.mult(map(bassEnergy, 200, 255, 0, 10));
            this.acc.add(pulse);
        }
        
        this.vel.add(this.acc);
        this.vel.limit(10);
        this.pos.add(this.vel);
        this.acc.mult(0);
        
        this.life -= 2;
        this.alpha = map(this.life, 0, 255, 0, 100);
        
        // Wrap around
        if (this.pos.x > width / 2) this.pos.x = -width / 2;
        if (this.pos.x < -width / 2) this.pos.x = width / 2;
        if (this.pos.y > height / 2) this.pos.y = -height / 2;
        if (this.pos.y < -height / 2) this.pos.y = height / 2;
    }
    
    show() {
        if (this.life <= 0) return;
        
        push();
        translate(this.pos.x, this.pos.y);
        
        // Glow effect
        for (let i = 3; i > 0; i--) {
            fill(this.hue, 100, 100, this.alpha / i);
            noStroke();
            circle(0, 0, this.size * i);
        }
        
        // Trail
        stroke(this.hue, 100, 100, this.alpha * 0.5);
        strokeWeight(1);
        line(0, 0, -this.vel.x * 3, -this.vel.y * 3);
        
        pop();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// Mouse interaction
function mouseMoved() {
    if (mode === 3) {
        for (let i = 0; i < 3; i++) {
            let p = new Particle();
            p.pos.set(mouseX - width / 2, mouseY - height / 2);
            particles.push(p);
        }
    }
}
