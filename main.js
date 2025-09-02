// Audio Engine with Classical Guitar Sound
class AudioEngine {
    constructor() {
        this.audioEnabled = false;
        this.sampler = null;
        this.isInitialized = false;
        console.log('AudioEngine created');
    }

    async initializeAudio() {
        try {
            console.log('Starting audio initialization...');
            await Tone.start();
            console.log('Tone.js started');

            // Map every WAV file in /samples to its pitch
            const sampleMap = {
                "A#1": "samples/A#1.wav",
                "A#3": "samples/A#3.wav",
                "A#4": "samples/A#4.wav",
                "A#5": "samples/A#5.wav",
                "A1": "samples/A1.wav",
                "A2": "samples/A2.wav",
                "A3": "samples/A3.wav",
                "A4": "samples/A4.wav",
                "A5": "samples/A5.wav",
                "B1": "samples/B1.wav",
                "B2": "samples/B2.wav",
                "B3": "samples/B3.wav",
                "B4": "samples/B4.wav",
                "B5": "samples/B5.wav",
                "C#2": "samples/C#2.wav",
                "C#4": "samples/C#4.wav",
                "C#5": "samples/C#5.wav",
                "C2": "samples/C2.wav",
                "C3": "samples/C3.wav",
                "C4": "samples/C4.wav",
                "C5": "samples/C5.wav",
                "C6": "samples/C6.wav",
                "D#2": "samples/D#2.wav",
                "D#4": "samples/D#4.wav",
                "D#5": "samples/D#5.wav",
                "D2": "samples/D2.wav",
                "D3": "samples/D3.wav",
                "D4": "samples/D4.wav",
                "D5": "samples/D5.wav",
                "E2": "samples/E2.wav",
                "E3": "samples/E3.wav",
                "E4": "samples/E4.wav",
                "E5": "samples/E5.wav",
                "F#3": "samples/F#3.wav",
                "F#4": "samples/F#4.wav",
                "F#5": "samples/F#5.wav",
                "F2": "samples/F2.wav",
                "F3": "samples/F3.wav",
                "F4": "samples/F4.wav",
                "F5": "samples/F5.wav",
                "G#1": "samples/G#1.wav",
                "G#3": "samples/G#3.wav",
                "G#5": "samples/G#5.wav",
                "G1": "samples/G1.wav",
                "G2": "samples/G2.wav",
                "G3": "samples/G3.wav",
                "G4": "samples/G4.wav",
                "G5": "samples/G5.wav"
            };

            return new Promise((resolve, reject) => {
                this.sampler = new Tone.Sampler(sampleMap, {
                    onload: () => {
                        console.log('Sampler loaded and ready');
                        this.isInitialized = true;
                        resolve(true);
                    },
                    onerror: (error) => {
                        console.error('Error loading samples:', error);
                        reject(error);
                    }
                }).toDestination();
            });
        } catch (error) {
            console.error('Audio initialization failed:', error);
            return false;
        }
    }

    async enableAudio() {
        console.log('enableAudio() called');
        if (!this.isInitialized) {
            console.log('Audio not initialized, calling initializeAudio()');
            const success = await this.initializeAudio();
            if (!success) {
                console.error('Failed to initialize audio');
                return false;
            }
        }
        this.audioEnabled = true;
        console.log('Audio enabled successfully');
        return true;
    }

    playNote(pitch, duration = 0.5) {
        console.log(`playNote called: pitch=${pitch}, duration=${duration}, enabled=${this.audioEnabled}, initialized=${this.isInitialized}`);

        if (!this.audioEnabled || !this.isInitialized || pitch === 'rest') {
            console.log('Skipping note play - conditions not met');
            return;
        }

        try {
            this.sampler.triggerAttackRelease(pitch, duration);
            console.log(`Sample played: ${pitch}`);
        } catch (error) {
            console.error('Error playing note:', error);
            // If the note fails, try playing C4 as a fallback
            try {
                this.sampler.triggerAttackRelease('C4', duration);
                console.log(`Fallback to C4 for pitch: ${pitch}`);
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
            }
        }
    }

    // No longer needed: convertPitchToTone
}
// Event Bus Pattern
class EventBus {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
}

// Command Pattern
class Command {
    execute() { }
    undo() { }
}

class PlayCommand extends Command {
    constructor(player) {
        super();
        this.player = player;
    }
    execute() { this.player.play(); }
}

class PauseCommand extends Command {
    constructor(player) {
        super();
        this.player = player;
    }
    execute() { this.player.pause(); }
}

class ReplayCommand extends Command {
    constructor(player) {
        super();
        this.player = player;
        this.startPos = player.playPosition;
    }
    execute() {
        this.player.setPosition(this.startPos);
        this.player.play();
    }
}

class GeneratePatternCommand extends Command {
    constructor(generator) {
        super();
        this.generator = generator;
    }
    execute() { this.generator.generateNewPattern(); }
}

// Note class
class Note {
    constructor(pitch, fret, string, x) {
        this.pitch = pitch;
        this.fret = fret;
        this.string = string;
        this.x = x;
        this.y = 0;
        this.active = false;
        this.played = false;
    }

    update(speed) {
        this.x -= speed;
    }

    draw() {
        // Draw note on staff
        push();
        if (this.active) {
            fill(255, 200, 100);
            stroke(255, 255, 100);
        } else if (this.played) {
            fill(100, 255, 100, 150);
            stroke(100, 255, 100);
        } else {
            fill(255);
            stroke(0);
        }

        strokeWeight(2);
        let noteY = this.getNoteY();
        ellipse(this.x, noteY, 20, 15);

        // Draw stem
        if (this.pitch !== 'rest') {
            stroke(this.active ? color(255, 255, 100) : 255);
            line(this.x + 8, noteY, this.x + 8, noteY - 40);
        }
        pop();
    }

    getNoteY() {
        // Simplified staff positioning
        const staffY = 150;
        const notePositions = {
            'E4': staffY + 40,  // 1st string open
            'F4': staffY + 35,
            'G4': staffY + 30,
            'A4': staffY + 25,
            'B4': staffY + 20,
            'C5': staffY + 15,
            'D5': staffY + 10,
            'E5': staffY + 5,
            'B3': staffY + 50,  // 2nd string open
            'C4': staffY + 45,
            'D4': staffY + 40,
            'G3': staffY + 60,  // 3rd string open
            'rest': staffY + 25
        };
        return notePositions[this.pitch] || staffY + 25;
    }
}

// Pattern Generator
class PatternGenerator {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.patterns = [
            // C Major arpeggio pattern
            [{ pitch: 'C4', fret: 1, string: 2 }, { pitch: 'E4', fret: 0, string: 1 },
            { pitch: 'G4', fret: 3, string: 1 }, { pitch: 'C5', fret: 8, string: 1 }],
            // A minor arpeggio
            [{ pitch: 'A4', fret: 5, string: 1 }, { pitch: 'C5', fret: 8, string: 1 },
            { pitch: 'E5', fret: 12, string: 1 }, { pitch: 'A4', fret: 5, string: 1 }],
            // Simple scale passage
            [{ pitch: 'G4', fret: 3, string: 1 }, { pitch: 'A4', fret: 5, string: 1 },
            { pitch: 'B4', fret: 7, string: 1 }, { pitch: 'C5', fret: 8, string: 1 }]
        ];
    }

    generateNewPattern() {
        const pattern = random(this.patterns);
        this.eventBus.emit('patternGenerated', pattern);
    }
}

// Player class
class Player {
    constructor(eventBus, audioEngine) {
        this.eventBus = eventBus;
        this.audioEngine = audioEngine;
        this.isPlaying = false;
        this.playPosition = 0;
        this.notes = [];
        this.tempo = 100;
        this.noteSpeed = 1;

        this.eventBus.on('patternGenerated', (pattern) => {
            this.loadPattern(pattern);
        });

        this.eventBus.on('tempoChanged', (tempo) => {
            this.tempo = tempo;
            this.noteSpeed = map(tempo, 60, 180, 0.5, 2);
        });
    }

    loadPattern(pattern) {
        this.notes = [];
        this.playPosition = 0;
        let spacing = 100;

        pattern.forEach((noteData, i) => {
            let note = new Note(
                noteData.pitch,
                noteData.fret,
                noteData.string,
                width + i * spacing
            );
            this.notes.push(note);
        });
    }

    play() {
        this.isPlaying = true;
        this.eventBus.emit('playStateChanged', true);
    }

    pause() {
        this.isPlaying = false;
        this.eventBus.emit('playStateChanged', false);
    }

    setPosition(pos) {
        this.playPosition = pos;
    }

    update() {
        if (!this.isPlaying) return;

        this.notes.forEach(note => {
            note.update(this.noteSpeed);

            // Check if note is at play line
            if (abs(note.x - 200) < 10 && !note.played) {
                note.active = true;
                // Play the note with tempo-based duration
                let noteDuration = 60 / this.tempo; // Quarter note duration in seconds
                this.audioEngine.playNote(note.pitch, noteDuration);

                setTimeout(() => {
                    note.active = false;
                    note.played = true;
                }, 500);
            }
        });
    }

    draw() {
        // Draw staff lines
        stroke(100);
        strokeWeight(1);
        for (let i = 0; i < 5; i++) {
            let y = 130 + i * 10;
            line(0, y, width, y);
        }

        // Draw play line
        stroke(255, 100, 100);
        strokeWeight(3);
        line(200, 100, 200, 200);

        // Draw notes
        this.notes.forEach(note => note.draw());
    }
}

// Fretboard Visualizer
class FretboardVisualizer {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.activeFrets = new Set();

        this.eventBus.on('noteActivated', (noteData) => {
            this.activeFrets.add(`${noteData.string}-${noteData.fret}`);
            setTimeout(() => {
                this.activeFrets.delete(`${noteData.string}-${noteData.fret}`);
            }, 500);
        });
    }

    draw() {
        push();
        translate(50, 250);

        // Draw fretboard
        fill(139, 69, 19); // Brown
        rect(0, 0, 300, 120);

        // Draw frets
        stroke(200);
        strokeWeight(2);
        for (let i = 1; i <= 12; i++) {
            let x = i * 25;
            line(x, 0, x, 120);
        }

        // Draw strings
        for (let i = 0; i < 6; i++) {
            let y = 10 + i * 20;
            strokeWeight(1 + i * 0.3);
            line(0, y, 300, y);
        }

        // Draw position markers
        fill(255);
        noStroke();
        [3, 5, 7, 9].forEach(fret => {
            let x = fret * 25 - 12.5;
            ellipse(x, 60, 8, 8);
        });

        // Double dots at 12th fret
        ellipse(12 * 25 - 12.5, 40, 8, 8);
        ellipse(12 * 25 - 12.5, 80, 8, 8);

        // Highlight active frets
        this.activeFrets.forEach(pos => {
            let [string, fret] = pos.split('-').map(Number);
            fill(255, 200, 100, 150);
            noStroke();
            ellipse(fret * 25 - 12.5, 10 + string * 20, 15, 15);
        });

        pop();
    }
}

// Global variables
let eventBus;
let audioEngine;
let player;
let fretboard;
let patternGenerator;
let commandHistory = [];

function setup() {
    let canvas = createCanvas(800, 400);
    canvas.parent('sketch-container');

    // Initialize components
    eventBus = new EventBus();
    audioEngine = new AudioEngine();
    player = new Player(eventBus, audioEngine);
    fretboard = new FretboardVisualizer(eventBus);
    patternGenerator = new PatternGenerator(eventBus);

    // Setup controls
    setupControls();

    // Generate initial pattern
    patternGenerator.generateNewPattern();
}

function setupControls() {
    document.getElementById('playBtn').onclick = () => {
        executeCommand(new PlayCommand(player));
    };

    document.getElementById('pauseBtn').onclick = () => {
        executeCommand(new PauseCommand(player));
    };

    document.getElementById('replayBtn').onclick = () => {
        executeCommand(new ReplayCommand(player));
    };

    document.getElementById('generateBtn').onclick = () => {
        executeCommand(new GeneratePatternCommand(patternGenerator));
    };

    document.getElementById('audioToggle').onclick = async () => {
        const btn = document.getElementById('audioToggle');
        console.log('Audio toggle clicked, current state:', audioEngine.audioEnabled);

        if (!audioEngine.audioEnabled) {
            btn.disabled = true;
            btn.textContent = 'Loading...';
            console.log('Attempting to enable audio...');

            const success = await audioEngine.enableAudio();
            console.log('Enable audio result:', success);

            if (success) {
                btn.textContent = 'Audio: ON';
                btn.style.background = '#0f6040';
                console.log('Audio enabled successfully');
            } else {
                btn.textContent = 'Audio Failed';
                btn.style.background = '#604040';
                console.log('Audio enable failed');
            }
            btn.disabled = false;
        } else {
            console.log('Disabling audio...');
            audioEngine.audioEnabled = false;
            btn.textContent = 'Enable Audio';
            btn.style.background = '#16213e';
            console.log('Audio disabled');
        }
    };

    document.getElementById('tempoSlider').oninput = (e) => {
        let tempo = e.target.value;
        document.getElementById('tempoValue').textContent = tempo;
        eventBus.emit('tempoChanged', parseInt(tempo));
    };
}

function executeCommand(command) {
    command.execute();
    commandHistory.push(command);
    // Keep history manageable
    if (commandHistory.length > 10) {
        commandHistory.shift();
    }
}

function draw() {
    background(26, 26, 46);

    // Update and draw player
    player.update();
    player.draw();

    // Draw fretboard
    fretboard.draw();

    // Draw title
    fill(255);
    textSize(16);
    text("Classical Guitar Sight Training", 20, 30);

    // Instructions
    textSize(12);
    fill(200);
    text("Notes flow from right to left. Watch the fretboard light up as notes cross the red play line.", 20, height - 20);
}
