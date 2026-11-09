// Authentic Procedural Audio & Ambient Sound Engine for SAANS
// 100% Web Audio API - Zero external dependencies, offline resilient, instant response

class SoundEngine {
  constructor() {
    this.ctx = null;
    // Sound is ON by default
    const saved = typeof window !== 'undefined' ? localStorage.getItem('saans_audio_muted') : null;
    this.isMuted = saved === 'true'; // false by default

    this.mode = 'globe'; // 'globe' | 'destination' | 'nisar'
    this.listeners = new Set();

    // Core audio nodes
    this.masterGain = null;
    this.spaceGain = null;
    this.kutchGain = null;
    this.nisarGain = null;

    // Orbit / Space audio sources
    this.spaceDrone1 = null;
    this.spaceDrone2 = null;
    this.spaceFilter = null;

    // Kutch Desert audio timers & state
    this.kutchIntervalId = null;
    this.tanpuraIntervalId = null;
    this.bellIntervalId = null;
    this.tanpuraIndex = 0;

    // NISAR Radar Telemetry timers & state
    this.nisarChirpIntervalId = null;
    this.nisarTelemetryIntervalId = null;

    // Breath of the Rann (Authentic Atmospheric Soundtrack for 5 Acts Island)
    this.rannAudio = null;
    if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
      try {
        this.rannAudio = new Audio('/Sounds/Home/Breath_of_the_Rann.mp3');
        this.rannAudio.loop = true;
        this.rannAudio.volume = 0.22; // gentle, delicate, non-distracting
        this.rannAudio.preload = 'auto';
      } catch (e) {}
    }

    this.isInitialized = false;

    // Browser autoplay unlock
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        ['click', 'pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(evt => {
          window.removeEventListener(evt, unlockAudio);
        });
      };

      ['click', 'pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(evt => {
        window.addEventListener(evt, unlockAudio, { passive: true, once: true });
      });
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach(cb => {
      try {
        cb(this.isMuted);
      } catch (e) {}
    });
  }

  init() {
    if (this.isInitialized) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    try {
      this.ctx = new AudioContext();
      this.isInitialized = true;

      // Master gain
      this.masterGain = this.ctx.createGain();
      const initialVol = this.isMuted ? 0.0001 : 1.0;
      this.masterGain.gain.setValueAtTime(initialVol, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // 1. Orbit Space Ambient Layer (ONLY active in Globe view)
      this.setupSpaceAmbient();

      // 2. Authentic Kutchi Desert Acoustic Layer (ONLY active in Destination view - NO white/brown noise!)
      this.setupKutchDesertAmbient();

      // 3. NISAR Synthetic Aperture Radar Telemetry Layer (Cal/Val orbital scientific acoustic)
      this.setupNisarTelemetryAmbient();

      // Route initial mode
      this.setMode(this.mode);
    } catch (e) {
      console.warn('AudioContext initialization failed:', e);
    }
  }

  // ==========================================================
  // ORBIT SPACE AMBIENT (Active ONLY in globe mode)
  // ==========================================================
  setupSpaceAmbient() {
    if (!this.ctx) return;

    this.spaceGain = this.ctx.createGain();
    this.spaceGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.spaceGain.connect(this.masterGain);

    // Deep sub-bass fundamental (55 Hz / A1)
    this.spaceDrone1 = this.ctx.createOscillator();
    this.spaceDrone1.type = 'sine';
    this.spaceDrone1.frequency.setValueAtTime(55, this.ctx.currentTime);

    // Fifth harmonic overtone (82.4 Hz / E2)
    this.spaceDrone2 = this.ctx.createOscillator();
    this.spaceDrone2.type = 'triangle';
    this.spaceDrone2.frequency.setValueAtTime(82.4, this.ctx.currentTime);

    // Warm resonant lowpass filter
    this.spaceFilter = this.ctx.createBiquadFilter();
    this.spaceFilter.type = 'lowpass';
    this.spaceFilter.frequency.setValueAtTime(140, this.ctx.currentTime);
    this.spaceFilter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    const overtoneGain = this.ctx.createGain();
    overtoneGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    this.spaceDrone1.connect(subGain);
    this.spaceDrone2.connect(overtoneGain);

    subGain.connect(this.spaceFilter);
    overtoneGain.connect(this.spaceFilter);
    this.spaceFilter.connect(this.spaceGain);

    this.spaceDrone1.start();
    this.spaceDrone2.start();

    // Gentle slow cosmic modulation
    setInterval(() => {
      if (!this.ctx || this.isMuted || this.mode !== 'globe') return;
      const targetFreq = 120 + Math.random() * 60;
      this.spaceFilter.frequency.linearRampToValueAtTime(targetFreq, this.ctx.currentTime + 4);
    }, 5000);
  }

  // ==========================================================
  // AUTHENTIC KUTCHI DESERT ACOUSTICS (Active in Destination mode)
  // 100% RELEVANT KUTCH MUSIC:
  // - Meditative Indian Classical Tanpura Drone (Pa-Sa-Sa-Sa strings)
  // - Soulful Desert Bamboo Flute / Jodiya Pawa Melodic Phrases
  // - Crystalline Desert Temple Singing Bells
  // - ZERO white noise, ZERO hissing static, ZERO sci-fi space drone!
  // ==========================================================
  setupKutchDesertAmbient() {
    if (!this.ctx) return;

    this.kutchGain = this.ctx.createGain();
    this.kutchGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.kutchGain.connect(this.masterGain);

    // Start rhythmic Tanpura cycle: Plucks strings sequentially
    // Strings: Pa (A2 = 110 Hz), Sa (D3 = 146.83 Hz), Sa (D3 = 147.2 Hz with jivari acoustic buzz), Kharaj (D2 = 73.41 Hz)
    const tanpuraStrings = [110.0, 146.83, 147.2, 73.41];

    this.tanpuraIntervalId = setInterval(() => {
      if (!this.ctx || this.isMuted || this.mode !== 'destination') return;

      const freq = tanpuraStrings[this.tanpuraIndex % tanpuraStrings.length];
      this.tanpuraIndex++;
      this.pluckTanpuraString(freq);
    }, 1650);

    // Periodic soulful desert flute phrases (every 8 to 11 seconds)
    const fluteMelodies = [
      // Melody 1: D4 -> F#4 -> A4 -> F#4 -> D4
      [
        { note: 293.66, delay: 0, dur: 1.4 },
        { note: 369.99, delay: 900, dur: 1.5 },
        { note: 440.00, delay: 1800, dur: 2.2 },
        { note: 369.99, delay: 3000, dur: 1.6 },
        { note: 293.66, delay: 4200, dur: 2.8 }
      ],
      // Melody 2: A4 -> B4 -> D5 -> B4 -> A4
      [
        { note: 440.00, delay: 0, dur: 1.2 },
        { note: 493.88, delay: 800, dur: 1.4 },
        { note: 587.33, delay: 1600, dur: 2.4 },
        { note: 493.88, delay: 2800, dur: 1.5 },
        { note: 440.00, delay: 3800, dur: 2.5 }
      ],
      // Melody 3: F#4 -> A4 -> B4 -> A4 -> F#4
      [
        { note: 369.99, delay: 0, dur: 1.3 },
        { note: 440.00, delay: 850, dur: 1.6 },
        { note: 493.88, delay: 1800, dur: 2.0 },
        { note: 440.00, delay: 2800, dur: 1.5 },
        { note: 369.99, delay: 3700, dur: 2.6 }
      ]
    ];

    let melodyIdx = 0;
    this.kutchIntervalId = setInterval(() => {
      if (!this.ctx || this.isMuted || this.mode !== 'destination') return;

      const phrase = fluteMelodies[melodyIdx % fluteMelodies.length];
      melodyIdx++;

      phrase.forEach(({ note, delay, dur }) => {
        setTimeout(() => {
          if (this.mode === 'destination' && !this.isMuted) {
            this.playDesertFluteNote(note, dur);
          }
        }, delay);
      });
    }, 9500);

    // Periodic desert crystal bell (every 16 seconds)
    this.bellIntervalId = setInterval(() => {
      if (!this.ctx || this.isMuted || this.mode !== 'destination') return;
      this.playDesertSingingBell(1174.66, 3.8); // D6 crystal bell
    }, 16000);
  }

  // Synthesizes a rich, acoustic Indian Tanpura string pluck
  pluckTanpuraString(fundamentalFreq) {
    if (!this.ctx || !this.kutchGain) return;
    try {
      const t = this.ctx.currentTime;

      // 1. Fundamental oscillator
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(fundamentalFreq, t);

      // 2. Harmonic overtone with acoustic string warmth
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(fundamentalFreq * 2.0, t);

      // Resonant acoustic body filter (simulates hollow wooden gourd of tanpura)
      const bodyFilter = this.ctx.createBiquadFilter();
      bodyFilter.type = 'bandpass';
      bodyFilter.frequency.setValueAtTime(Math.min(fundamentalFreq * 4.5, 1400), t);
      bodyFilter.Q.setValueAtTime(3.2, t);

      // Lowpass to tame harshness
      const warmFilter = this.ctx.createBiquadFilter();
      warmFilter.type = 'lowpass';
      warmFilter.frequency.setValueAtTime(950, t);

      // Pluck envelope: sharp acoustic attack (12ms), long ringing acoustic decay (3.2s)
      const pluckGain = this.ctx.createGain();
      pluckGain.gain.setValueAtTime(0.0001, t);
      pluckGain.gain.linearRampToValueAtTime(0.18, t + 0.015);
      pluckGain.gain.exponentialRampToValueAtTime(0.04, t + 0.6);
      pluckGain.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);

      osc1.connect(bodyFilter);
      osc2.connect(bodyFilter);
      bodyFilter.connect(warmFilter);
      warmFilter.connect(pluckGain);
      pluckGain.connect(this.kutchGain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 3.3);
      osc2.stop(t + 3.3);
    } catch (e) {}
  }

  // Synthesizes a warm, meditative bamboo flute (Jodiya Pawa / Bansuri) note
  playDesertFluteNote(freq, duration = 2.0) {
    if (!this.ctx || !this.kutchGain) return;
    try {
      const t = this.ctx.currentTime;

      // Primary tone
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      // Natural flute vibrato (5 Hz subtle modulation)
      const vibrato = this.ctx.createOscillator();
      const vibratoGain = this.ctx.createGain();
      vibrato.frequency.setValueAtTime(4.8, t);
      vibratoGain.gain.setValueAtTime(freq * 0.012, t); // Subtle pitch bend
      vibrato.connect(osc.frequency);

      // Soft harmonic overtone (triangle)
      const overtone = this.ctx.createOscillator();
      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(freq * 2.0, t);

      const overtoneGain = this.ctx.createGain();
      overtoneGain.gain.setValueAtTime(0.06, t);

      // Flute body resonance
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, t);
      filter.Q.setValueAtTime(1.5, t);

      // Breath envelope (soft attack, sustained breath, gentle release)
      const noteGain = this.ctx.createGain();
      noteGain.gain.setValueAtTime(0.0001, t);
      noteGain.gain.linearRampToValueAtTime(0.12, t + 0.12);
      noteGain.gain.setValueAtTime(0.11, t + duration * 0.6);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(filter);
      overtone.connect(overtoneGain);
      overtoneGain.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.kutchGain);

      vibrato.start(t);
      osc.start(t);
      overtone.start(t);

      vibrato.stop(t + duration);
      osc.stop(t + duration);
      overtone.stop(t + duration);
    } catch (e) {}
  }

  // Crystalline desert temple bell ringing out over the salt flats
  playDesertSingingBell(freq = 1174.66, duration = 3.5) {
    if (!this.ctx || !this.kutchGain) return;
    try {
      const t = this.ctx.currentTime;

      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, t);

      // Shimmering octave harmonic
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2.01, t);

      const bellGain = this.ctx.createGain();
      bellGain.gain.setValueAtTime(0.0001, t);
      bellGain.gain.linearRampToValueAtTime(0.08, t + 0.015);
      bellGain.gain.exponentialRampToValueAtTime(0.015, t + 1.2);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc1.connect(bellGain);
      osc2.connect(bellGain);
      bellGain.connect(this.kutchGain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + duration);
      osc2.stop(t + duration);
    } catch (e) {}
  }

  // ==========================================================
  // NASA-ISRO NISAR RADAR TELEMETRY ACOUSTIC LAYER
  // High-Tech Orbital Satellite Telemetry Sound Track:
  // - Deep Carrier Hum (Dual L+S Band Sub-harmonic frequencies)
  // - Periodic Microwave Radar Chirp / Frequency Sweep (every 3.8s)
  // - Sub-second telemetry heartbeat pulse
  // ==========================================================
  setupNisarTelemetryAmbient() {
    if (!this.ctx) return;

    this.nisarGain = this.ctx.createGain();
    this.nisarGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.nisarGain.connect(this.masterGain);

    try {
      // 1. Dual-carrier satellite hum: 58 Hz and 125.75 Hz (L-Band subharmonic)
      const subOsc = this.ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(58.0, this.ctx.currentTime);

      const harmonicOsc = this.ctx.createOscillator();
      harmonicOsc.type = 'triangle';
      harmonicOsc.frequency.setValueAtTime(125.75, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

      const carrierGain = this.ctx.createGain();
      carrierGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

      subOsc.connect(carrierGain);
      harmonicOsc.connect(carrierGain);
      carrierGain.connect(filter);
      filter.connect(this.nisarGain);

      subOsc.start();
      harmonicOsc.start();

      // 2. Periodic Radar Chirp / Microwave Ping (every 3.8s)
      this.nisarChirpIntervalId = setInterval(() => {
        if (!this.ctx || this.isMuted || this.mode !== 'nisar') return;
        this.playRadarSweepChirp();
      }, 3800);

      // 3. Telemetry Data Tick (every 1.9s)
      this.nisarTelemetryIntervalId = setInterval(() => {
        if (!this.ctx || this.isMuted || this.mode !== 'nisar') return;
        this.playTelemetryPulse();
      }, 1900);
    } catch (e) {}
  }

  // Radar microwave chirp sweep
  playRadarSweepChirp() {
    if (!this.ctx || !this.nisarGain) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Chirp frequency sweep: 640 Hz -> 1380 Hz
      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, t);
      osc.frequency.exponentialRampToValueAtTime(1380, t + 0.16);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(960, t);
      filter.Q.setValueAtTime(3.5, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.07, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.nisarGain);

      osc.start(t);
      osc.stop(t + 0.45);
    } catch (e) {}
  }

  // Telemetry data heartbeat pulse
  playTelemetryPulse() {
    if (!this.ctx || !this.nisarGain) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2200, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.022, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);

      osc.connect(gain);
      gain.connect(this.nisarGain);

      osc.start(t);
      osc.stop(t + 0.09);
    } catch (e) {}
  }

  // ==========================================================
  // BREATH OF THE RANN (Soundtrack for 5 Acts Island Exploration)
  // Gentle, authentic, non-distracting background atmosphere
  // ==========================================================
  playBreathOfTheRann(targetVol = 0.22) {
    if (!this.rannAudio) return;
    try {
      this.rannAudio.muted = this.isMuted;
      this.rannAudio.volume = 0.01;
      const p = this.rannAudio.play();
      if (p !== undefined) {
        p.then(() => {
          let vol = 0.01;
          const fadeTimer = setInterval(() => {
            if (!this.rannAudio) {
              clearInterval(fadeTimer);
              return;
            }
            vol += 0.02;
            if (vol >= targetVol) {
              this.rannAudio.volume = targetVol;
              clearInterval(fadeTimer);
            } else {
              this.rannAudio.volume = vol;
            }
          }, 80);
        }).catch(() => {});
      }
    } catch (e) {}
  }

  pauseBreathOfTheRann() {
    if (!this.rannAudio) return;
    try {
      let vol = this.rannAudio.volume;
      const fadeOutTimer = setInterval(() => {
        if (!this.rannAudio) {
          clearInterval(fadeOutTimer);
          return;
        }
        vol -= 0.03;
        if (vol <= 0.01) {
          this.rannAudio.volume = 0;
          this.rannAudio.pause();
          clearInterval(fadeOutTimer);
        } else {
          this.rannAudio.volume = Math.max(0, vol);
        }
      }, 40);
    } catch (e) {
      if (this.rannAudio) this.rannAudio.pause();
    }
  }

  // Ensures ZERO background music or sounds play anywhere on the site when any video is playing
  silenceAllBackgroundMusic() {
    if (this.rannAudio) {
      this.rannAudio.pause();
      this.rannAudio.currentTime = 0;
    }
    if (this.ctx) {
      const t = this.ctx.currentTime;
      if (this.kutchGain) {
        this.kutchGain.gain.cancelScheduledValues(t);
        this.kutchGain.gain.linearRampToValueAtTime(0.00001, t + 0.1);
      }
      if (this.spaceGain) {
        this.spaceGain.gain.cancelScheduledValues(t);
        this.spaceGain.gain.linearRampToValueAtTime(0.00001, t + 0.1);
      }
      if (this.nisarGain) {
        this.nisarGain.gain.cancelScheduledValues(t);
        this.nisarGain.gain.linearRampToValueAtTime(0.00001, t + 0.1);
      }
    }
  }

  // ==========================================================
  // MODE SWITCHING: Seamlessly handles globe, destination, and nisar!
  // ==========================================================
  setMode(mode) {
    this.mode = mode;
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    if (mode === 'nisar') {
      // 1. Cut off Kutch acoustic music & Breath of the Rann
      this.pauseBreathOfTheRann();
      if (this.kutchGain) {
        this.kutchGain.gain.cancelScheduledValues(t);
        this.kutchGain.gain.linearRampToValueAtTime(0.00001, t + 0.3);
      }
      // 2. Cut off orbit space drones
      if (this.spaceGain) {
        this.spaceGain.gain.cancelScheduledValues(t);
        this.spaceGain.gain.linearRampToValueAtTime(0.00001, t + 0.3);
      }
      // 3. Fade in authentic NISAR radar telemetry sound track
      if (this.nisarGain) {
        this.nisarGain.gain.cancelScheduledValues(t);
        this.nisarGain.gain.linearRampToValueAtTime(0.26, t + 0.8);
      }

    } else if (mode === 'destination') {
      // 1. Cut off space drones & NISAR telemetry
      if (this.spaceGain) {
        this.spaceGain.gain.cancelScheduledValues(t);
        this.spaceGain.gain.linearRampToValueAtTime(0.00001, t + 0.3);
      }
      if (this.nisarGain) {
        this.nisarGain.gain.cancelScheduledValues(t);
        this.nisarGain.gain.linearRampToValueAtTime(0.00001, t + 0.3);
      }
      // Note: Breath of the Rann is played exclusively when exploring the 5 Acts island!

    } else {
      // globe mode: return to orbit
      // 1. Cut off Kutch music & Breath of the Rann & NISAR telemetry
      this.pauseBreathOfTheRann();
      if (this.kutchGain) {
        this.kutchGain.gain.cancelScheduledValues(t);
        this.kutchGain.gain.linearRampToValueAtTime(0.00001, t + 0.6);
      }
      if (this.nisarGain) {
        this.nisarGain.gain.cancelScheduledValues(t);
        this.nisarGain.gain.linearRampToValueAtTime(0.00001, t + 0.4);
      }

      // 2. Restore space ambient for globe
      if (this.spaceGain) {
        this.spaceGain.gain.cancelScheduledValues(t);
        this.spaceGain.gain.linearRampToValueAtTime(0.18, t + 1.2);
      }
    }
  }

  // Toggle Mute / Unmute
  toggleMute() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('saans_audio_muted', this.isMuted ? 'true' : 'false');
    } catch (e) {}

    if (this.rannAudio) {
      this.rannAudio.muted = this.isMuted;
    }

    if (this.masterGain && this.ctx) {
      const t = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(t);
      this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0.0001 : 1.0, t + 0.25);
    }

    // Play feedback tone
    if (!this.isMuted) {
      this.playMuteFeedback(true);
    } else {
      this.playMuteFeedback(false);
    }

    this.notify();
    return !this.isMuted;
  }

  setMuted(muted) {
    if (this.isMuted === muted) return;
    this.toggleMute();
  }

  // Feedback tone when toggling sound
  playMuteFeedback(isUnmuting) {
    if (!this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'sine';
      if (isUnmuting) {
        osc.frequency.setValueAtTime(659.25, t);
        osc.frequency.setValueAtTime(880.0, t + 0.08);
      } else {
        osc.frequency.setValueAtTime(440.0, t);
        osc.frequency.setValueAtTime(329.63, t + 0.06);
      }

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.30);
    } catch (e) {}
  }

  // Standard harmonic chime
  playChime(freq = 440, type = 'sine', duration = 1.2, volume = 0.18) {
    if (this.isMuted) return;
    try {
      this.init();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(volume, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + duration);
    } catch (e) {}
  }

  // Authentic Kutchi Acoustic Percussion Strike:
  // Combines warm earthen clay pot (Ghada / Matka) resonance with crystalline brass Manjira (finger cymbal) chime.
  playClick() {
    if (this.isMuted) return;
    try {
      this.init();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const t = this.ctx.currentTime;

      // -------------------------------------------------------------
      // 1. Earthen Clay Pot / Dholak Membrane Tap (Ghada Resonance)
      // -------------------------------------------------------------
      const clayOsc = this.ctx.createOscillator();
      clayOsc.type = 'sine';
      clayOsc.frequency.setValueAtTime(285, t);
      clayOsc.frequency.exponentialRampToValueAtTime(185, t + 0.04);

      const clayFilter = this.ctx.createBiquadFilter();
      clayFilter.type = 'bandpass';
      clayFilter.frequency.setValueAtTime(260, t);
      clayFilter.Q.setValueAtTime(3.6, t);

      const clayGain = this.ctx.createGain();
      clayGain.gain.setValueAtTime(0.0001, t);
      clayGain.gain.linearRampToValueAtTime(0.18, t + 0.003);
      clayGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.095);

      clayOsc.connect(clayFilter);
      clayFilter.connect(clayGain);
      clayGain.connect(this.masterGain);

      clayOsc.start(t);
      clayOsc.stop(t + 0.10);

      // -------------------------------------------------------------
      // 2. Crystalline Brass Manjira (Kutchi Finger Cymbal) Shimmer
      // -------------------------------------------------------------
      const brassOsc1 = this.ctx.createOscillator();
      brassOsc1.type = 'sine';
      brassOsc1.frequency.setValueAtTime(1318.5, t);

      const brassOsc2 = this.ctx.createOscillator();
      brassOsc2.type = 'sine';
      brassOsc2.frequency.setValueAtTime(1975.5, t);

      const brassFilter = this.ctx.createBiquadFilter();
      brassFilter.type = 'highpass';
      brassFilter.frequency.setValueAtTime(1100, t);

      const brassGain = this.ctx.createGain();
      brassGain.gain.setValueAtTime(0.0001, t);
      brassGain.gain.linearRampToValueAtTime(0.065, t + 0.002);
      brassGain.gain.exponentialRampToValueAtTime(0.012, t + 0.04);
      brassGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);

      brassOsc1.connect(brassFilter);
      brassOsc2.connect(brassFilter);
      brassFilter.connect(brassGain);
      brassGain.connect(this.masterGain);

      brassOsc1.start(t);
      brassOsc2.start(t);
      brassOsc1.stop(t + 0.17);
      brassOsc2.stop(t + 0.17);
    } catch (e) {}
  }

  // Whisper-soft desert starlight & brass wind-chime shimmer (Kutchi Ghungroo / Bell harmonic)
  playHover() {
    if (this.isMuted) return;
    try {
      this.init();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const t = this.ctx.currentTime;

      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1174.66, t);

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1760.0, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.024, t + 0.016);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.12);
      osc2.stop(t + 0.12);
    } catch (e) {}
  }

  // Majestic Kutchi Bloom for the Hero DISCOVER CTA:
  // Resonant Tanpura root bloom + cascading brass desert temple chimes
  playDiscoverSound() {
    if (this.isMuted) return;
    try {
      this.init();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const t = this.ctx.currentTime;

      // 1. Resonant Indian Tanpura String Pluck (Sa = 146.83 Hz)
      this.pluckTanpuraString(146.83);

      // 2. Cascading brass chime arpeggio: A4 (440Hz), D5 (587.33Hz), A5 (880Hz), D6 (1174.66Hz)
      const chimeNotes = [440.0, 587.33, 880.0, 1174.66];
      chimeNotes.forEach((freq, idx) => {
        const noteTime = t + idx * 0.045;

        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        const overtone = this.ctx.createOscillator();
        overtone.type = 'sine';
        overtone.frequency.setValueAtTime(freq * 2.01, noteTime);

        const bellGain = this.ctx.createGain();
        bellGain.gain.setValueAtTime(0.0001, noteTime);
        bellGain.gain.linearRampToValueAtTime(0.09 - idx * 0.015, noteTime + 0.012);
        bellGain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.6);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.8);

        osc.connect(bellGain);
        overtone.connect(bellGain);
        bellGain.connect(this.masterGain);

        osc.start(noteTime);
        overtone.start(noteTime);
        osc.stop(noteTime + 1.9);
        overtone.stop(noteTime + 1.9);
      });
    } catch (e) {}
  }

  // Zoom In UI sound
  playZoomIn() {
    if (this.isMuted) return;
    try {
      this.init();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const t = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, t);
      osc.frequency.exponentialRampToValueAtTime(960, t + 0.08);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.13);
    } catch (e) {}
  }

  // Zoom Out UI sound
  playZoomOut() {
    if (this.isMuted) return;
    try {
      this.init();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const t = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(840, t);
      osc.frequency.exponentialRampToValueAtTime(420, t + 0.08);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.13);
    } catch (e) {}
  }

  // Crystalline celestial double-ping on beacon hover
  playBeaconPing() {
    if (this.isMuted) return;
    try {
      this.init();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      this.playChime(880.0, 'sine', 1.4, 0.14);
      setTimeout(() => {
        this.playChime(1318.5, 'sine', 1.8, 0.10);
      }, 55);
    } catch (e) {}
  }

  // Atmospheric rushing cloud penetration sound (soft air rush with resonant sweep)
  playCloudPass() {
    if (this.isMuted) return;
    try {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      const t = this.ctx.currentTime;

      const bufferSize = Math.floor(this.ctx.sampleRate * 1.6);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.45;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320, t);
      filter.frequency.linearRampToValueAtTime(680, t + 0.7);
      filter.frequency.exponentialRampToValueAtTime(220, t + 1.5);
      filter.Q.setValueAtTime(2.2, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(t);
      noise.stop(t + 1.6);
    } catch (e) {}
  }

  // Ascending cinematic chord on dive into Kutch
  playTransitionSound() {
    if (this.isMuted) return;
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();

    const notes = [146.83, 220.0, 293.66, 369.99, 440.0, 587.33];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playChime(freq, 'sine', 2.4 - idx * 0.15, 0.16);
      }, idx * 110);
    });

    // Switch mode to authentic Kutch music (kills space drone!)
    setTimeout(() => {
      this.setMode('destination');
    }, 700);
  }

  // Descending chord on return to orbit
  playReturnSound() {
    if (this.isMuted) return;
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();

    const notes = [587.33, 440.0, 369.99, 293.66, 220.0, 146.83];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playChime(freq, 'sine', 2.2, 0.14);
      }, idx * 100);
    });

    // Switch mode back to orbit space ambient
    setTimeout(() => {
      this.setMode('globe');
    }, 600);
  }

  // Ascending Kutchi Raga Chime (Sa - Ga - Pa) for modal drawers
  playModalOpen() {
    if (this.isMuted) return;
    try {
      this.init();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const t = this.ctx.currentTime;

      // Notes: D4 (293.66 Hz), F#4 (369.99 Hz), A4 (440.00 Hz)
      const triad = [293.66, 369.99, 440.00];
      triad.forEach((freq, idx) => {
        const noteTime = t + idx * 0.055;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        // Soft acoustic harmonic overtone
        const overtone = this.ctx.createOscillator();
        overtone.type = 'triangle';
        overtone.frequency.setValueAtTime(freq * 2.0, noteTime);

        const overtoneGain = this.ctx.createGain();
        overtoneGain.gain.setValueAtTime(0.02, noteTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.0001, noteTime);
        gain.gain.linearRampToValueAtTime(0.09, noteTime + 0.018);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.85);

        osc.connect(gain);
        overtone.connect(overtoneGain);
        overtoneGain.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteTime);
        overtone.start(noteTime);
        osc.stop(noteTime + 0.90);
        overtone.stop(noteTime + 0.90);
      });
    } catch (e) {}
  }

  // Descending earthen clay resolve for modal closing
  playModalClose() {
    if (this.isMuted) return;
    try {
      this.init();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const t = this.ctx.currentTime;

      // Descending Pa -> Sa with clay acoustic body
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440.0, t);
      osc.frequency.exponentialRampToValueAtTime(293.66, t + 0.12);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.08, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.24);
    } catch (e) {}
  }
}

export const soundEngine = new SoundEngine();
