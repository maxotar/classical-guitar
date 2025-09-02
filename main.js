// Audio Engine with Classical Guitar Sound
class AudioEngine {
    constructor() {
        this.audioEnabled = false;
        this.synth = null;
        this.reverb = null;
        this.isInitialized = false;
        console.log('AudioEngine created');
    }

    async initializeAudio() {
        try {
            console.log('Starting audio initialization...');
            console.log('Tone context state before start:', Tone.context.state);

            // Wait for user interaction before initializing
            await Tone.start();
            console.log('Tone.start() completed');
            console.log('Tone context state after start:', Tone.context.state);

            // Classical guitar-inspired synthesizer
            console.log('Creating PluckSynth...');
            this.synth = new Tone.PluckSynth({
                attackNoise: 1,
                dampening: 4000,
                resonance: 0.9,
                release: 1
            });
            console.log('PluckSynth created:', this.synth);

            // Add some reverb for classical guitar ambience
            console.log('Creating Reverb...');
            this.reverb = new Tone.Reverb({
                decay: 1.5,
                wet: 0.2
            });
            console.log('Reverb created:', this.reverb);

            // Connect to reverb then to destination
            console.log('Connecting audio chain...');
            this.synth.connect(this.reverb);
            this.reverb.toDestination();
            console.log('Audio chain connected');

            // Test audio immediately
            console.log('Testing audio with C4...');
            this.synth.triggerAttackRelease('C4', '8n');
            console.log('Test note triggered');

            this.isInitialized = true;
            console.log('Audio initialization complete!');
            return true;
        } catch (error) {
            console.error('Audio initialization failed:', error);
            console.error('Error stack:', error.stack);
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
            // Convert to Tone.js format
            let note = this.convertPitchToTone(pitch);
            console.log(`Playing note: ${pitch} -> ${note}, duration: ${duration}`);
            console.log('Synth state:', this.synth);
            console.log('Tone context state:', Tone.context.state);

            this.synth.triggerAttackRelease(note, duration);
            console.log('Note triggered successfully');
        } catch (error) {
            console.error('Error playing note:', error);
            console.error('Error details:', error.message);
        }
    }

    convertPitchToTone(pitch) {
        // Convert our pitch notation to Tone.js format
        const pitchMap = {
            'E4': 'E4',
            'F4': 'F4',
            'G4': 'G4',
            'A4': 'A4',
            'B4': 'B4',
            'C5': 'C5',
            'D5': 'D5',
            'E5': 'E5',
            'B3': 'B3',
            'C4': 'C4',
            'D4': 'D4',
            'G3': 'G3'
        };
        const result = pitchMap[pitch] || 'C4';
        console.log(`Pitch conversion: ${pitch} -> ${result}`);
        return result;
    }
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
