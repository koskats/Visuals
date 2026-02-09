// Generative Flow Field - Techno Installation Style
let particles = [];
let flowField = [];
let cols, rows;
let scl = 20;
let zoff = 0;
let time = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 100);
    
    cols = floor(width / scl);
    rows = floor(height / scl);
    
    flowField = new Array(cols * rows);
    
    // Δημιουργία particles
    for (let i = 0; i < 5000; i++) {
        particles.push(new FlowParticle());
    }
    
    background(0);
}

function draw() {
    // Fade effect αντί για clear
    fill(0, 0, 0, 5);
    noStroke();
    rect(0, 0, width, height);
    
    // Update flow field με Perlin noise
    let yoff = 0;
    for (let y = 0; y < rows; y++) {
        let xoff = 0;
        for (let x = 0; x < cols; x++) {
            let index = x + y * cols;
            let angle = noise(xoff, yoff, zoff) * TWO_PI * 4;
            let v = p5.Vector.fromAngle(angle);
            v.setMag(0.5);
            flowField[index] = v;
            xoff += 0.1;
            
            // Debug: draw flow field (uncomment to see)
            // push();
            // translate(x * scl, y * scl);
            // rotate(v.heading());
            // stroke(0, 0, 100, 20);
            // strokeWeight(1);
            // line(0, 0, scl, 0);
            // pop();
        }
        yoff += 0.1;
    }
    zoff += 0.003;
    
    // Update και draw particles
    particles.forEach(p => {
        p.follow(flowField);
        p.update();
        p.edges();
        p.show();
    });
    
    // Pulsing rings - techno aesthetic
    drawPulsingRings();
    
    time += 0.01;
}

function drawPulsingRings() {
    push();
    translate(width / 2, height / 2);
    noFill();
    
    for (let i = 0; i < 5; i++) {
        let size = sin(time * 2 + i * 0.5) * 100 + 300 + i * 100;
        let alpha = map(sin(time * 2 + i * 0.5), -1, 1, 10, 30);
        let hue = (time * 50 + i * 60) % 360;
        
        stroke(hue, 100, 100, alpha);
        strokeWeight(1);
        circle(0, 0, size);
    }
    pop();
}

class FlowParticle {
    constructor() {
        this.pos = createVector(random(width), random(height));
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.maxSpeed = 3;
        this.prevPos = this.pos.copy();
        this.hue = random(360);
        this.life = random(50, 150);
        this.maxLife = this.life;
    }
    
    follow(vectors) {
        let x = floor(this.pos.x / scl);
        let y = floor(this.pos.y / scl);
        let index = x + y * cols;
        
        if (index >= 0 && index < vectors.length) {
            let force = vectors[index];
            this.applyForce(force);
        }
    }
    
    applyForce(force) {
        this.acc.add(force);
    }
    
    update() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
        
        // Mouse attraction/repulsion
        let mouse = createVector(mouseX, mouseY);
        let distance = p5.Vector.dist(this.pos, mouse);
        
        if (distance < 100) {
            let force = p5.Vector.sub(this.pos, mouse);
            force.setMag(0.5);
            this.applyForce(force);
        }
        
        this.life--;
        if (this.life <= 0) {
            this.respawn();
        }
    }
    
    respawn() {
        this.pos = createVector(random(width), random(height));
        this.vel = createVector(0, 0);
        this.prevPos = this.pos.copy();
        this.hue = (this.hue + random(30, 60)) % 360;
        this.life = random(50, 150);
        this.maxLife = this.life;
    }
    
    edges() {
        if (this.pos.x > width) {
            this.pos.x = 0;
            this.updatePrev();
        }
        if (this.pos.x < 0) {
            this.pos.x = width;
            this.updatePrev();
        }
        if (this.pos.y > height) {
            this.pos.y = 0;
            this.updatePrev();
        }
        if (this.pos.y < 0) {
            this.pos.y = height;
            this.updatePrev();
        }
    }
    
    updatePrev() {
        this.prevPos.x = this.pos.x;
        this.prevPos.y = this.pos.y;
    }
    
    show() {
        let alpha = map(this.life, 0, this.maxLife, 0, 100);
        stroke(this.hue, 100, 100, alpha);
        strokeWeight(1);
        line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
        this.updatePrev();
    }
}

function mouseClicked() {
    background(0);
    particles = [];
    for (let i = 0; i < 5000; i++) {
        particles.push(new FlowParticle());
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    cols = floor(width / scl);
    rows = floor(height / scl);
    flowField = new Array(cols * rows);
    background(0);
}
