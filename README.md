# 🎨 Techno Visuals - Generative Art Collection

Συλλογή καλλιτεχνικών / generative visuals για techno υπερθέαμα με p5.js και Processing.

## 📁 Περιεχόμενα

### 1️⃣ p5.js Audio Reactive Visualizer
**Φάκελος:** `p5js-audio-reactive/`

Πλήρως reactive audio visualizer με 3 modes:
- **Circular Mode**: Ομόκεντροι κύκλοι που αντιδρούν σε bass/mid/treble
- **Waveform Mode**: Κυματομορφές με multiple layers
- **Particles Mode**: Particle system που αντιδρά στο beat

#### Χαρακτηριστικά:
✅ Φόρτωση custom audio track  
✅ Real-time FFT analysis  
✅ Mouse interaction  
✅ Beat detection  
✅ 3 διαφορετικά visual modes  

#### Πώς να το τρέξεις:
```bash
cd p5js-audio-reactive
# Άνοιξε το index.html σε browser
# Φόρτωσε ένα techno track και απόλαυσε!
```

**Live Server (προτείνεται):**
```bash
python3 -m http.server 8000
# Άνοιξε http://localhost:8000
```

---

### 2️⃣ p5.js Generative Flow Field
**Φάκελος:** `p5js-generative/`

Generative art με flow field και Perlin noise:
- 5000 particles που ακολουθούν flow field
- Perlin noise για organic movement
- Mouse interaction (repulsion)
- Pulsing rings για techno aesthetic

#### Χαρακτηριστικά:
✅ Flow field με Perlin noise  
✅ 5000 animated particles  
✅ Mouse repulsion effect  
✅ Trail effects  
✅ Infinite generative patterns  

#### Πώς να το τρέξεις:
```bash
cd p5js-generative
# Άνοιξε το index.html σε browser
# Κίνησε το mouse για interaction
# Click για reset
```

---

### 3️⃣ Processing 3D Installation Visual
**Φάκελος:** `processing-installation/`

3D geometric structures για video art / installation:
- Morphing geometric shapes σε 3D space
- Audio reactive animation
- Grid floor με wave effects
- Camera movement automation

#### Χαρακτηριστικά:
✅ 3D geometric morphing  
✅ Audio reactive (microphone input)  
✅ Animated camera  
✅ Grid floor με audio waves  
✅ Particle explosions on beats  
✅ Fullscreen support  

#### Requirements:
```
Processing 4.x
Minim library (για audio)
```

#### Εγκατάσταση Minim library:
1. Άνοιξε το Processing
2. Sketch → Import Library → Add Library
3. Αναζήτησε "Minim"
4. Εγκατέστησε

#### Πώς να το τρέξεις:
```
1. Άνοιξε το Processing
2. File → Open → installation_visual.pde
3. Run (Ctrl/Cmd + R)
```

#### Keyboard Controls:
- `R`: Reset structures
- `+`: Προσθήκη structure
- `-`: Αφαίρεση structure

---

## 🎛️ Tips για Techno Performance

### Audio Setup (p5.js)
1. Χρησιμοποίησε high-quality audio files (320kbps+)
2. Για live performance, route το DJ output στο browser με virtual audio cable
3. Adjust FFT smoothing για πιο smooth ή aggressive reactions

### Performance Optimization
- **p5.js**: Μείωσε particles αν κολλάει (line 46-48 σε sketch.js)
- **Processing**: Μείωσε grid resolution αν drop frames (line 94)

### Live Performance
- Fullscreen: `F11` στο browser ή `Cmd+Shift+F` στο Processing
- Dual screen: Βγάλε το visual σε projector/LED wall
- MIDI control: Μπορείς να προσθέσεις MIDI mapping για mode switching

---

## 🎨 Customization Ideas

### Colors
Άλλαξε το `colorMode` και τα hue values για διαφορετική παλέτα:
```javascript
// p5.js
colorMode(HSB, 360, 100, 100, 100);
// Άλλαξε τα hue values (0-360) για άλλα χρώματα
```

### Speed
Άλλαξε το animation speed:
```javascript
// p5.js: line με zoff += 0.003
zoff += 0.005; // πιο γρήγορο

// Processing: line με time += 0.01
time += 0.02; // πιο γρήγορο
```

### Particle Count
```javascript
// p5.js generative: line 26
for (let i = 0; i < 10000; i++) { // περισσότερα particles
```

---

## 🚀 Advanced: Combining με Video Mapping

Για installation/video art projection:

1. **Export frames από Processing:**
```java
// Προσθήκη στο draw():
saveFrame("output/frame-####.png");
```

2. **Χρήση με Resolume/MadMapper:**
- Import τα visuals ως video source
- Apply effects layers
- Map σε 3D surfaces

3. **OSC Control:**
- Πρόσθεσε OSC library για control από Ableton/Resolume
- Real-time parameter control

---

## 📚 Resources

### Learning
- [p5.js Reference](https://p5js.org/reference/)
- [Processing Reference](https://processing.org/reference/)
- [The Coding Train - YouTube](https://www.youtube.com/thecodingtrain) (generative art tutorials)

### Inspiration
- [OpenProcessing](https://openprocessing.org/) - community sketches
- [Chrome Experiments](https://experiments.withgoogle.com/) - web experiments

### Libraries
- [p5.sound](https://p5js.org/reference/#/libraries/p5.sound) - audio
- [Minim](http://code.compartmental.net/tools/minim/) - Processing audio
- [toxiclibs](http://toxiclibs.org/) - advanced geometry

---

## 🎯 Επόμενα Βήματα

1. **Combine με MIDI controller** για live control
2. **Add shader effects** για πιο advanced graphics
3. **Integration με Ableton Link** για tempo sync
4. **WebGL shaders** στο p5.js για GPU acceleration
5. **Syphon/Spout** output για professional VJ software

---

## 🐛 Troubleshooting

### p5.js δεν παίζει ήχος
- Check browser permissions για microphone
- Φόρτωσε track από local file
- Chrome μπορεί να block autoplay - click play button

### Processing crashes
- Μείωσε particle count
- Disable antialiasing: `noSmooth()`
- Χρησιμοποίησε `P2D` renderer αντί για `P3D` αν δεν χρειάζεται

### Low FPS
- Μείωσε resolution
- Μείωσε particle count
- Close άλλα programs

---

## 📝 License

Free to use για personal/commercial projects.  
Credit appreciated αλλά όχι required.

---

**Enjoy creating techno visuals! 🎵✨**
