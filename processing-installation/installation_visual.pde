// PROCESSING INSTALLATION VISUAL
// Geometric Morphing Structures - Techno Installation Style
// Save as: installation_visual.pde

import ddf.minim.*;
import ddf.minim.analysis.*;

Minim minim;
AudioInput in;
FFT fft;

ArrayList<Structure> structures;
PVector center;
float time = 0;
float rotationAngle = 0;

void setup() {
  fullScreen(P3D);
  // size(1920, 1080, P3D);
  
  colorMode(HSB, 360, 100, 100, 100);
  center = new PVector(width/2, height/2, 0);
  
  // Audio setup
  minim = new Minim(this);
  in = minim.getLineIn();
  fft = new FFT(in.bufferSize(), in.sampleRate());
  
  // Δημιουργία structures
  structures = new ArrayList<Structure>();
  for (int i = 0; i < 5; i++) {
    structures.add(new Structure(i * 100, i));
  }
}

void draw() {
  background(0);
  
  // Analyze audio
  fft.forward(in.mix);
  float bass = fft.calcAvg(20, 150);
  float mid = fft.calcAvg(150, 5000);
  float treble = fft.calcAvg(5000, 15000);
  float overallLevel = in.mix.level();
  
  // Lights
  lights();
  ambientLight(50, 50, 50);
  
  // Camera movement
  float camX = width/2 + sin(time * 0.1) * 300;
  float camY = height/2 + cos(time * 0.15) * 200;
  float camZ = 800 + sin(time * 0.05) * 400;
  camera(camX, camY, camZ, width/2, height/2, 0, 0, 1, 0);
  
  // Grid floor
  drawGrid(bass);
  
  // Draw structures
  for (Structure s : structures) {
    s.update(bass, mid, treble, overallLevel);
    s.display();
  }
  
  // Particle system για beat hits
  if (bass > 0.3) {
    for (int i = 0; i < 10; i++) {
      float angle = random(TWO_PI);
      float radius = random(200, 500);
      float x = width/2 + cos(angle) * radius;
      float y = height/2 + sin(angle) * radius;
      
      pushMatrix();
      translate(x, y, random(-200, 200));
      noStroke();
      fill(random(360), 100, 100, 50);
      sphere(random(5, 20));
      popMatrix();
    }
  }
  
  time += 0.01;
  rotationAngle += 0.005;
  
  // FPS counter
  fill(255);
  textSize(16);
  text("FPS: " + int(frameRate), 20, 30);
  text("Bass: " + nf(bass, 1, 2), 20, 50);
}

void drawGrid(float bass) {
  pushMatrix();
  translate(width/2, height/2 + 300, 0);
  rotateX(HALF_PI);
  
  stroke(200, 100, 100, 20);
  strokeWeight(1);
  noFill();
  
  int gridSize = 50;
  int gridCount = 40;
  
  for (int i = -gridCount; i < gridCount; i++) {
    for (int j = -gridCount; j < gridCount; j++) {
      float x = i * gridSize;
      float z = j * gridSize;
      
      // Κυματισμός από το bass
      float dist = dist(0, 0, x, z);
      float wave = sin(dist * 0.01 - time * 2) * bass * 100;
      
      pushMatrix();
      translate(x, wave, z);
      
      // Μικρά κουτάκια στο grid
      if (random(1) < 0.01) {
        fill(180, 100, 100, 30);
        box(5);
      }
      popMatrix();
    }
  }
  
  // Grid lines
  for (int i = -gridCount; i <= gridCount; i++) {
    beginShape();
    for (int j = -gridCount; j <= gridCount; j++) {
      float x = i * gridSize;
      float z = j * gridSize;
      float dist = dist(0, 0, x, z);
      float wave = sin(dist * 0.01 - time * 2) * bass * 100;
      vertex(x, wave, z);
    }
    endShape();
    
    beginShape();
    for (int j = -gridCount; j <= gridCount; j++) {
      float x = j * gridSize;
      float z = i * gridSize;
      float dist = dist(0, 0, x, z);
      float wave = sin(dist * 0.01 - time * 2) * bass * 100;
      vertex(x, wave, z);
    }
    endShape();
  }
  
  popMatrix();
}

class Structure {
  PVector pos;
  float radius;
  float hue;
  int sides;
  ArrayList<PVector> points;
  float rotation;
  int id;
  
  Structure(float r, int idx) {
    pos = new PVector(width/2, height/2, 0);
    radius = r + 100;
    hue = (idx * 60) % 360;
    sides = 6 + idx * 2;
    id = idx;
    rotation = 0;
    
    points = new ArrayList<PVector>();
    for (int i = 0; i < sides; i++) {
      float angle = TWO_PI / sides * i;
      float x = cos(angle) * radius;
      float y = sin(angle) * radius;
      points.add(new PVector(x, y, 0));
    }
  }
  
  void update(float bass, float mid, float treble, float level) {
    // Αλλαγή μεγέθους με το audio
    radius = 100 + id * 100 + bass * 200;
    
    // Update points
    for (int i = 0; i < sides; i++) {
      float angle = TWO_PI / sides * i + rotation;
      
      // Morphing effect
      float r = radius;
      r += sin(angle * 3 + time * 2) * mid * 50;
      r += cos(angle * 5 + time * 3) * treble * 30;
      
      float x = cos(angle) * r;
      float y = sin(angle) * r;
      float z = sin(angle * 2 + time) * level * 100;
      
      points.get(i).set(x, y, z);
    }
    
    rotation += 0.001 + level * 0.01;
  }
  
  void display() {
    pushMatrix();
    translate(pos.x, pos.y, pos.z);
    
    // Περιστροφή στο 3D space
    rotateX(rotationAngle + id * 0.3);
    rotateY(time * 0.5 + id * 0.2);
    rotateZ(rotation);
    
    // Draw structure με lines
    strokeWeight(2);
    stroke(hue, 100, 100, 80);
    noFill();
    
    beginShape();
    for (PVector p : points) {
      vertex(p.x, p.y, p.z);
    }
    endShape(CLOSE);
    
    // Connect to center
    for (PVector p : points) {
      stroke(hue, 100, 100, 30);
      line(0, 0, 0, p.x, p.y, p.z);
    }
    
    // Connect adjacent structures (3D web)
    for (int i = 0; i < points.size(); i++) {
      PVector p1 = points.get(i);
      PVector p2 = points.get((i + 1) % points.size());
      
      stroke(hue, 100, 100, 20);
      strokeWeight(1);
      line(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
      
      // Draw spheres at vertices
      pushMatrix();
      translate(p1.x, p1.y, p1.z);
      noStroke();
      fill(hue, 100, 100, 60);
      sphere(5);
      popMatrix();
    }
    
    popMatrix();
  }
}

void stop() {
  in.close();
  minim.stop();
  super.stop();
}

// Keyboard controls
void keyPressed() {
  if (key == 'r' || key == 'R') {
    // Reset
    structures.clear();
    for (int i = 0; i < 5; i++) {
      structures.add(new Structure(i * 100, i));
    }
  }
  
  if (key == '+') {
    structures.add(new Structure(structures.size() * 100, structures.size()));
  }
  
  if (key == '-' && structures.size() > 1) {
    structures.remove(structures.size() - 1);
  }
}
