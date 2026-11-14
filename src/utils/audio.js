// Authentic Procedural Audio & Ambient Sound Engine for SAANS
// 100% Web Audio API - Zero external dependencies, offline resilient, instant response

class SoundEngine {
  constructor() {
    this.ctx = null;
    // Sound is ON by default
    this.isMuted = false;

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

    // Breath of the High Plateau (Atmospheric Soundtrack for Orbit View)
    this.orbitAudio = null;
    this.orbitFadeTimer = null;
    // Breath of the Rann (Authentic Atmospheric Soundtrack for 5 Acts Island)
    this.rannAudio = null;
    // The Vast Salt Mirror (Light Background Music for Act-1 Radar Showcase)
    this.saltMirrorAudio = null;
    // Authentic Regional Desert Folk Soundtrack for Terminal Station Outro
    this.outroAudio = null;

    if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
      try {
        this.orbitAudio = new Audio('/Sounds/Orbit/Breath_of_the_High_Plateau.mp3');
        this.orbitAudio.loop = true;
        this.orbitAudio.volume = 0.25; // ambient, majestic, cosmic
        this.orbitAudio.preload = 'auto';

        // Auto fallback if path isn't reached
        this.orbitAudio.addEventListener('error', () => {
          if (this.orbitAudio && !this.orbitAudio.src.includes('/Sounds/Home/')) {
            this.orbitAudio.src = '/Sounds/Home/Breath_of_the_High_Plateau.mp3';
            this.orbitAudio.load();
            if (this.mode === 'globe' && !this.isMuted) {
              this.playOrbitMusic(0.25);
            }
          }
        });

        this.rannAudio = new Audio('/Sounds/Home/Breath_of_the_Rann.mp3');
        this.rannAudio.loop = true;
        this.rannAudio.volume = 0.12; // gentle, delicate, quiet ambient background atmosphere
        this.rannAudio.preload = 'auto';

        this.saltMirrorAudio = new Audio('/Sounds/Act-1/The_Vast_Salt_Mirror.mp3');
        this.saltMirrorAudio.loop = true;
        this.saltMirrorAudio.volume = 0.20; // light, delicate, atmospheric
        this.saltMirrorAudio.preload = 'auto';

        this.outroAudio = new Audio('/Sounds/Home/Hero_Musicians_Live.mp3');
        this.outroAudio.loop = true;
        this.outroAudio.volume = 0.32;
        this.outroAudio.preload = 'auto';
      } catch (e) {}
    }

    this.isInitialized = false;

    // Fresh Load Autoplay & User Activation Setup
    if (typeof window !== 'undefined') {
      const triggerInitialPlay = () => {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        if (this.mode === 'globe' && !this.isMuted) {
          this.playOrbitMusic(0.25);
        }
      };

      // 1. Attempt immediate playback on instantiation
      triggerInitialPlay();

      // 2. Attempt on DOM ready and window load
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        triggerInitialPlay();
      } else {
        window.addEventListener('DOMContentLoaded', triggerInitialPlay, { once: true });
        window.addEventListener('load', triggerInitialPlay, { once: true });
      }

      // 3. User activation listener (capture phase on genuine activation events)
      const onUserActivation = () => {
        triggerInitialPlay();
        if (this.orbitAudio && !this.orbitAudio.paused) {
          ['pointerdown', 'mousedown', 'touchstart', 'click', 'keydown'].forEach(evt => {
            window.removeEventListener(evt, onUserActivation, true);
            document.removeEventListener(evt, onUserActivation, true);
          });
        }
      };

      ['pointerdown', 'mousedown', 'touchstart', 'click', 'keydown'].forEach(evt => {
        window.addEventListener(evt, onUserActivation, { capture: true, passive: true });
        document.addEventListener(evt, onUserActivation, { capture: true, passive: true });
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

  notifySubscribers() {
    this.notify();
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
  // BREATH OF THE HIGH PLATEAU (Soundtrack for Orbit View)
  // Atmospheric, celestial, cosmic soundtrack - plays on fresh site open!
  // ==========================================================
  playOrbitMusic(targetVol = 0.25) {
    if (!this.orbitAudio) return;
    try {
      if (this.isMuted) return;

      if (this.orbitFadeTimer) {
        clearInterval(this.orbitFadeTimer);
        this.orbitFadeTimer = null;
      }

      // If already playing unmuted with volume, keep playing
      if (!this.orbitAudio.paused && !this.orbitAudio.muted) {
        this.orbitAudio.volume = targetVol;
        return;
      }

      this.orbitAudio.muted = false;
      this.orbitAudio.volume = targetVol;

      // 1. Attempt unmuted playback directly
      const p = this.orbitAudio.play();
      if (p !== undefined) {
        p.then(() => {
          if (this.orbitAudio) {
            this.orbitAudio.muted = false;
            this.orbitAudio.volume = targetVol;
          }
        }).catch(() => {
          // 2. If browser autoplay policy requires user gesture,
          // listen to genuine user activation events to play unmuted immediately
          const handleFirstActivation = () => {
            if (!this.orbitAudio || this.isMuted || this.mode !== 'globe') return;
            this.init();
            if (this.ctx && this.ctx.state === 'suspended') {
              this.ctx.resume().catch(() => {});
            }
            this.orbitAudio.muted = false;
            this.orbitAudio.volume = targetVol;
            const retryPlay = this.orbitAudio.play();
            if (retryPlay !== undefined) {
              retryPlay.then(() => {
                ['pointerdown', 'mousedown', 'touchstart', 'click', 'keydown'].forEach(evt => {
                  window.removeEventListener(evt, handleFirstActivation, true);
                  document.removeEventListener(evt, handleFirstActivation, true);
                });
              }).catch(() => {});
            }
          };

          ['pointerdown', 'mousedown', 'touchstart', 'click', 'keydown'].forEach(evt => {
            window.addEventListener(evt, handleFirstActivation, { capture: true, passive: true });
            document.addEventListener(evt, handleFirstActivation, { capture: true, passive: true });
          });
        });
      }
    } catch (e) {}
  }

  pauseOrbitMusic() {
    if (!this.orbitAudio) return;
    try {
      if (this.orbitFadeTimer) {
        clearInterval(this.orbitFadeTimer);
        this.orbitFadeTimer = null;
      }
      let vol = this.orbitAudio.volume;
      this.orbitFadeTimer = setInterval(() => {
        if (!this.orbitAudio) {
          clearInterval(this.orbitFadeTimer);
          this.orbitFadeTimer = null;
          return;
        }
        vol -= 0.04;
        if (vol <= 0.01) {
          this.orbitAudio.volume = 0;
          this.orbitAudio.pause();
          clearInterval(this.orbitFadeTimer);
          this.orbitFadeTimer = null;
        } else {
          this.orbitAudio.volume = Math.max(0, vol);
        }
      }, 40);
    } catch (e) {
      if (this.orbitAudio) this.orbitAudio.pause();
    }
  }

  // ==========================================================
  // BREATH OF THE RANN (Soundtrack for 5 Acts Island Exploration)
  // Gentle, authentic, quiet ambient background atmosphere
  // ==========================================================
  playBreathOfTheRann(targetVol = 0.12) {
    if (!this.rannAudio) return;
    try {
      this.rannAudio.muted = this.isMuted;
      // Continuous sync across 3D stack, layer inspection, and winter data showcase:
      // If already playing, keep playing seamlessly without restarting or fading down!
      if (!this.rannAudio.paused) {
        this.rannAudio.volume = targetVol;
        return;
      }
      this.rannAudio.volume = targetVol;
      const p = this.rannAudio.play();
      if (p !== undefined) {
        p.catch(() => {});
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

  // ==========================================================
  // THE VAST SALT MIRROR (Light Background Music for Act-1 Radar Showcase)
  // Delicate, spatial, atmospheric soundtrack
  // ==========================================================
  playSaltMirrorMusic(targetVol = 0.20) {
    if (!this.saltMirrorAudio) return;
    try {
      this.saltMirrorAudio.muted = this.isMuted;
      this.saltMirrorAudio.volume = 0.01;
      const p = this.saltMirrorAudio.play();
      if (p !== undefined) {
        p.then(() => {
          let vol = 0.01;
          const fadeTimer = setInterval(() => {
            if (!this.saltMirrorAudio) {
              clearInterval(fadeTimer);
              return;
            }
            vol += 0.02;
            if (vol >= targetVol) {
              this.saltMirrorAudio.volume = targetVol;
              clearInterval(fadeTimer);
            } else {
              this.saltMirrorAudio.volume = vol;
            }
          }, 80);
        }).catch(() => {});
      }
    } catch (e) {}
  }

  pauseSaltMirrorMusic() {
    if (!this.saltMirrorAudio) return;
    try {
      let vol = this.saltMirrorAudio.volume;
      const fadeOutTimer = setInterval(() => {
        if (!this.saltMirrorAudio) {
          clearInterval(fadeOutTimer);
          return;
        }
        vol -= 0.03;
        if (vol <= 0.01) {
          this.saltMirrorAudio.volume = 0;
          this.saltMirrorAudio.pause();
          clearInterval(fadeOutTimer);
        } else {
          this.saltMirrorAudio.volume = Math.max(0, vol);
        }
      }, 40);
    } catch (e) {
      if (this.saltMirrorAudio) this.saltMirrorAudio.pause();
    }
  }

  // ==========================================================
  // REGIONAL OUTRO MUSIC (Hero Musicians Live - Kutch Folk)
  // Plays at the terminal station arrival & celebration
  // ==========================================================
  playRegionalOutroMusic(targetVol = 0.35) {
    if (!this.outroAudio) return;
    try {
      this.outroAudio.muted = this.isMuted;
      this.outroAudio.volume = 0.01;
      const p = this.outroAudio.play();
      if (p !== undefined) {
        p.then(() => {
          let vol = 0.01;
          const fadeTimer = setInterval(() => {
            if (!this.outroAudio) {
              clearInterval(fadeTimer);
              return;
            }
            vol += 0.03;
            if (vol >= targetVol) {
              this.outroAudio.volume = targetVol;
              clearInterval(fadeTimer);
            } else {
              this.outroAudio.volume = vol;
            }
          }, 80);
        }).catch(() => {});
      }
    } catch (e) {}
  }

  pauseRegionalOutroMusic() {
    if (!this.outroAudio) return;
    try {
      let vol = this.outroAudio.volume;
      const fadeOutTimer = setInterval(() => {
        if (!this.outroAudio) {
          clearInterval(fadeOutTimer);
          return;
        }
        vol -= 0.04;
        if (vol <= 0.01) {
          this.outroAudio.volume = 0;
          this.outroAudio.pause();
          clearInterval(fadeOutTimer);
        } else {
          this.outroAudio.volume = Math.max(0, vol);
        }
      }, 40);
    } catch (e) {
      if (this.outroAudio) this.outroAudio.pause();
    }
  }

  // Ensures ZERO background music or sounds play anywhere on the site when any video is playing
  silenceAllBackgroundMusic() {
    if (this.orbitAudio) {
      this.orbitAudio.pause();
      this.orbitAudio.currentTime = 0;
    }
    if (this.rannAudio) {
      this.rannAudio.pause();
      this.rannAudio.currentTime = 0;
    }
    if (this.saltMirrorAudio) {
      this.saltMirrorAudio.pause();
      this.saltMirrorAudio.currentTime = 0;
    }
    if (this.outroAudio) {
      this.outroAudio.pause();
      this.outroAudio.currentTime = 0;
    }
    if (this.ctx) {
      const t = this.ctx.currentTime;
      if (this.spaceGain) {
        this.spaceGain.gain.cancelScheduledValues(t);
        this.spaceGain.gain.setValueAtTime(0.00001, t);
      }
      if (this.kutchGain) {
        this.kutchGain.gain.cancelScheduledValues(t);
        this.kutchGain.gain.setValueAtTime(0.00001, t);
      }
      if (this.nisarGain) {
        this.nisarGain.gain.cancelScheduledValues(t);
        this.nisarGain.gain.setValueAtTime(0.00001, t);
      }
    }
  }

  // ==========================================================
  // MODE SWITCHING: Seamlessly handles globe, destination, and nisar!
  // ==========================================================
  setMode(mode) {
    this.mode = mode;
    this.notify();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    if (mode === 'nisar') {
      // 1. Cut off orbit music & Kutch acoustic music
      this.pauseOrbitMusic();
      // 2. Play Breath of the Rann quietly on data pages as instructed by user
      this.playBreathOfTheRann(0.12);
      if (this.kutchGain) {
        this.kutchGain.gain.cancelScheduledValues(t);
        this.kutchGain.gain.linearRampToValueAtTime(0.00001, t + 0.3);
      }
      // 3. Cut off orbit space drones
      if (this.spaceGain) {
        this.spaceGain.gain.cancelScheduledValues(t);
        this.spaceGain.gain.linearRampToValueAtTime(0.00001, t + 0.3);
      }
      // 4. Fade in authentic NISAR radar telemetry sound track
      if (this.nisarGain) {
        this.nisarGain.gain.cancelScheduledValues(t);
        this.nisarGain.gain.linearRampToValueAtTime(0.26, t + 0.8);
      }

    } else if (mode === 'destination') {
      // 1. Cut off orbit music & space drones & NISAR telemetry
      this.pauseOrbitMusic();
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
      this.pauseSaltMirrorMusic();
      if (this.kutchGain) {
        this.kutchGain.gain.cancelScheduledValues(t);
        this.kutchGain.gain.linearRampToValueAtTime(0.00001, t + 0.6);
      }
      if (this.nisarGain) {
        this.nisarGain.gain.cancelScheduledValues(t);
        this.nisarGain.gain.linearRampToValueAtTime(0.00001, t + 0.4);
      }

      // 2. Restore space ambient for globe & play Breath of the High Plateau
      if (this.spaceGain) {
        this.spaceGain.gain.cancelScheduledValues(t);
        this.spaceGain.gain.linearRampToValueAtTime(0.18, t + 1.2);
      }
      this.playOrbitMusic(0.25);
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

    if (this.orbitAudio) {
      this.orbitAudio.muted = this.isMuted;
    }
    if (this.rannAudio) {
      this.rannAudio.muted = this.isMuted;
    }
    if (this.saltMirrorAudio) {
      this.saltMirrorAudio.muted = this.isMuted;
    }
    if (this.outroAudio) {
      this.outroAudio.muted = this.isMuted;
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

  // Smooth acoustic transition pulse (preserves active continuous soundtrack)
  playTransitionSound() {
    if (this.isMuted) return;
    try {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.12);
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.15);
    } catch (e) {}
  }

  playTransition() {
    this.playTransitionSound();
  }

  // Silent return to orbit
  playReturnSound() {
    this.silenceAllBackgroundMusic();
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

  // 1. High-Tech Satellite Coordinate Target Lock Sound
  // Triggered when user clicks START STORY: telemetry blips + resonant target acquisition chime
  playLocateTargetSound() {
    if (this.isMuted) return;
    try {
      this.init();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const t = this.ctx.currentTime;

      // Telemetry frequency acquisition sweep: 4 rapid micro-pulses
      const frequencies = [659.25, 880.0, 1174.66, 1567.98];
      frequencies.forEach((freq, idx) => {
        const stepTime = t + idx * 0.052;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, stepTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.04, stepTime + 0.04);

        gain.gain.setValueAtTime(0.0001, stepTime);
        gain.gain.linearRampToValueAtTime(0.09, stepTime + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, stepTime + 0.048);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(stepTime);
        osc.stop(stepTime + 0.05);
      });

      // Resonant coordinate lock confirmation chime at t + 0.24s
      const lockTime = t + 0.24;
      const lockOsc = this.ctx.createOscillator();
      const lockFilter = this.ctx.createBiquadFilter();
      const lockGain = this.ctx.createGain();

      lockOsc.type = 'triangle';
      lockOsc.frequency.setValueAtTime(1760.0, lockTime);

      lockFilter.type = 'bandpass';
      lockFilter.frequency.setValueAtTime(1760.0, lockTime);
      lockFilter.Q.setValueAtTime(4.0, lockTime);

      lockGain.gain.setValueAtTime(0.0001, lockTime);
      lockGain.gain.linearRampToValueAtTime(0.14, lockTime + 0.015);
      lockGain.gain.exponentialRampToValueAtTime(0.0001, lockTime + 0.75);

      lockOsc.connect(lockFilter);
      lockFilter.connect(lockGain);
      lockGain.connect(this.masterGain);

      lockOsc.start(lockTime);
      lockOsc.stop(lockTime + 0.8);
    } catch (e) {}
  }

  // 2. Exhilarating Orbital Atmospheric Zoom Dive Sound Effect
  // Aerodynamic re-entry rush + sub-bass acceleration dive into Kutch salt desert (Majestic Orbital Descent)
  playOrbitalZoomDive(customDuration = 3.6) {
    if (this.isMuted) return;
    try {
      this.init();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const t = this.ctx.currentTime;
      const duration = customDuration;

      // Layer A: Aerodynamic atmospheric wind rush
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.55;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(140, t);
      filter.frequency.exponentialRampToValueAtTime(780, t + duration * 0.6);
      filter.frequency.exponentialRampToValueAtTime(160, t + duration);
      filter.Q.setValueAtTime(1.6, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.0001, t);
      noiseGain.gain.linearRampToValueAtTime(0.18, t + duration * 0.4);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noiseSource.start(t);
      noiseSource.stop(t + duration);

      // Layer B: Kinetic sub-bass propulsion sweep (55 Hz -> 92 Hz -> 38 Hz)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(55, t);
      subOsc.frequency.linearRampToValueAtTime(92, t + duration * 0.5);
      subOsc.frequency.exponentialRampToValueAtTime(38, t + duration);

      subGain.gain.setValueAtTime(0.0001, t);
      subGain.gain.linearRampToValueAtTime(0.22, t + duration * 0.35);
      subGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);

      subOsc.start(t);
      subOsc.stop(t + duration);
    } catch (e) {}
  }

  // Atmospheric Cloud Tearing & Supersonic Breakthrough
  // Synthesizes the rushing condensation vapor, atmospheric turbulence, and triumphant sonic cloudbreak
  playAtmosphericCloudBreak() {
    if (this.isMuted) return;
    try {
      this.init();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const t = this.ctx.currentTime;
      const duration = 2.8;

      // 1. Turbulent Rushing Cloud Vapor (Stereo Pinkish Noise)
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = (Math.random() * 2 - 1) * 0.4;
          b0 = 0.99765 * b0 + white * 0.0990460;
          b1 = 0.96300 * b1 + white * 0.1600000;
          b2 = 0.57000 * b2 + white * 0.4600000;
          data[i] = (b0 + b1 + b2 + white * 0.08) * 0.65;
        }
      }

      const cloudNoise = this.ctx.createBufferSource();
      cloudNoise.buffer = buffer;

      // Sweeping resonant bandpass filter simulating piercing through dense cumulus deck
      const cloudFilter = this.ctx.createBiquadFilter();
      cloudFilter.type = 'lowpass';
      cloudFilter.frequency.setValueAtTime(280, t);
      cloudFilter.frequency.exponentialRampToValueAtTime(2400, t + 1.2); // Tearing through the clouds
      cloudFilter.frequency.exponentialRampToValueAtTime(450, t + duration); // Settling into calm desert air

      const cloudGain = this.ctx.createGain();
      cloudGain.gain.setValueAtTime(0.0001, t);
      cloudGain.gain.linearRampToValueAtTime(0.24, t + 0.8);
      cloudGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      cloudNoise.connect(cloudFilter);
      cloudFilter.connect(cloudGain);
      cloudGain.connect(this.masterGain);

      cloudNoise.start(t);
      cloudNoise.stop(t + duration);

      // 2. Deep Sub-Sonic Sonic Boom / Cloudbreak Thud
      const thudOsc = this.ctx.createOscillator();
      thudOsc.type = 'sine';
      thudOsc.frequency.setValueAtTime(110, t + 0.9);
      thudOsc.frequency.exponentialRampToValueAtTime(32, t + 2.2);

      const thudGain = this.ctx.createGain();
      thudGain.gain.setValueAtTime(0.0001, t + 0.9);
      thudGain.gain.linearRampToValueAtTime(0.28, t + 1.1);
      thudGain.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);

      thudOsc.connect(thudGain);
      thudGain.connect(this.masterGain);

      thudOsc.start(t + 0.9);
      thudOsc.stop(t + 2.4);

      // 3. Shimmering Crystal Air Bloom (Emerging into the sunlit White Desert)
      [587.33, 880.0, 1174.66, 1760.0].forEach((freq, idx) => {
        const chime = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();
        chime.type = 'sine';
        chime.frequency.setValueAtTime(freq, t + 1.3 + idx * 0.08);

        chimeGain.gain.setValueAtTime(0.0001, t + 1.3 + idx * 0.08);
        chimeGain.gain.linearRampToValueAtTime(0.06, t + 1.4 + idx * 0.08);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + 2.7);

        chime.connect(chimeGain);
        chimeGain.connect(this.masterGain);

        chime.start(t + 1.3 + idx * 0.08);
        chime.stop(t + 2.7);
      });
    } catch (e) {}
  }

  // 3. Cinematic "Destination Arrived" Touchdown & Horizon Reveal Sound
  // Awe-inspiring destination arrival: warm deceleration sough, grounding sub, harmonic chord bloom, and crystal confirmation chime
  playDestinationArrivedSound() {
    if (this.isMuted) return;
    try {
      this.init();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const t = this.ctx.currentTime;

      // Layer 1: Deceleration Touchdown Air Sough (smooth atmospheric settling)
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.95);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.40;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const airFilter = this.ctx.createBiquadFilter();
      airFilter.type = 'lowpass';
      airFilter.frequency.setValueAtTime(750, t);
      airFilter.frequency.exponentialRampToValueAtTime(140, t + 0.85);

      const airGain = this.ctx.createGain();
      airGain.gain.setValueAtTime(0.0001, t);
      airGain.gain.linearRampToValueAtTime(0.14, t + 0.08);
      airGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.95);

      noiseSource.connect(airFilter);
      airFilter.connect(airGain);
      airGain.connect(this.masterGain);

      noiseSource.start(t);
      noiseSource.stop(t + 0.95);

      // Layer 2: Warm Earthen Touchdown Foundation (58 Hz -> 42 Hz sub settle)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(58, t);
      subOsc.frequency.exponentialRampToValueAtTime(42, t + 0.7);

      subGain.gain.setValueAtTime(0.0001, t);
      subGain.gain.linearRampToValueAtTime(0.18, t + 0.04);
      subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);
      subOsc.start(t);
      subOsc.stop(t + 0.9);

      // Layer 3: Celestial "Destination Arrived" Harmonic Chord (D Major Pentatonic Bloom)
      // D3 (146.83 Hz), A3 (220.00 Hz), F#4 (369.99 Hz), D5 (587.33 Hz)
      const chordFrequencies = [
        { freq: 146.83, delay: 0.00, vol: 0.12, decay: 1.15, type: 'sine' },
        { freq: 220.00, delay: 0.02, vol: 0.10, decay: 1.20, type: 'triangle' },
        { freq: 369.99, delay: 0.04, vol: 0.09, decay: 1.25, type: 'sine' },
        { freq: 587.33, delay: 0.06, vol: 0.08, decay: 1.30, type: 'triangle' },
      ];

      chordFrequencies.forEach(note => {
        const noteTime = t + note.delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = note.type;
        osc.frequency.setValueAtTime(note.freq, noteTime);

        gain.gain.setValueAtTime(0.0001, noteTime);
        gain.gain.linearRampToValueAtTime(note.vol, noteTime + 0.035);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + note.decay);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteTime);
        osc.stop(noteTime + note.decay + 0.05);
      });

      // Layer 4: Glassy High Confirmation Chime (Tactile "Destination Arrived" dual tone)
      // Plays two crisp, shimmering crystalline notes: 880 Hz (A5) -> 1320 Hz (E6)
      const chimes = [
        { freq: 880.0, timeOffset: 0.07, vol: 0.09 },
        { freq: 1320.0, timeOffset: 0.16, vol: 0.11 }
      ];

      chimes.forEach(chime => {
        const chimeTime = t + chime.timeOffset;
        const chimeOsc = this.ctx.createOscillator();
        const chimeFilter = this.ctx.createBiquadFilter();
        const chimeGain = this.ctx.createGain();

        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(chime.freq, chimeTime);

        chimeFilter.type = 'bandpass';
        chimeFilter.frequency.setValueAtTime(chime.freq, chimeTime);
        chimeFilter.Q.setValueAtTime(6.0, chimeTime);

        chimeGain.gain.setValueAtTime(0.0001, chimeTime);
        chimeGain.gain.linearRampToValueAtTime(chime.vol, chimeTime + 0.012);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, chimeTime + 0.85);

        chimeOsc.connect(chimeFilter);
        chimeFilter.connect(chimeGain);
        chimeGain.connect(this.masterGain);

        chimeOsc.start(chimeTime);
        chimeOsc.stop(chimeTime + 0.9);
      });

    } catch (e) {}
  }

  // Backward compatible alias
  playTransitImpactSound() {
    this.playDestinationArrivedSound();
  }
}

export const soundEngine = new SoundEngine();
