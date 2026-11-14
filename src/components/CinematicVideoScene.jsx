import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Globe,
  Sparkles,
  Compass,
  Radio,
  Film
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

/**
 * CinematicVideoScene
 * 
 * Replaces popup modal cards with a true Fullscreen Cinematic Video Player.
 * - Primary video source points to user's custom clip path (e.g. /vid/season1_intro.mp4).
 * - Automatic fallback to verified local video assets if custom file is missing.
 * - Sleek documentary lower-third title & logline overlay (NO POPUP BOXES).
 * - Warm luxury editorial palette (Champagne Gold, Ivory, Desert Stone).
 * - Audio controls & video progress bar.
 * - Smooth auto-advance on video end OR manual click to advance.
 */
export default function CinematicVideoScene({
  primarySrc,
  fallbackSrc = '/vid/train-ani.mp4',
  loopSrc, // Optional seamless continuation loop (e.g. /vid/rain_loop.mp4)
  chapterTag,
  title,
  subtitle,
  logline,
  physicsClue,
  actionLabel = 'CONTINUE TO RADAR OBSERVATORY',
  onAdvance,
  onBack,
  onReturnToOrbit,
  autoAdvanceOnEnd = false
}) {
  const videoRef = useRef(null);
  const loopVideoRef = useRef(null);
  const [currentSrc, setCurrentSrc] = useState(primarySrc);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);
  const [isLoopingActive, setIsLoopingActive] = useState(false);

  // Silence ALL background music during any cinematic video / intro section
  useEffect(() => {
    soundEngine.silenceAllBackgroundMusic();
  }, []);

  // If primarySrc changes, reset and try primary
  useEffect(() => {
    soundEngine.silenceAllBackgroundMusic();
    setCurrentSrc(primarySrc);
    setHasTriedFallback(false);
    setIsLoopingActive(false);
  }, [primarySrc]);

  // Video error handling: gracefully fall back without breaking
  const handleVideoError = useCallback(() => {
    if (!hasTriedFallback && fallbackSrc && currentSrc !== fallbackSrc) {
      console.warn(`[CinematicVideoScene] Primary video "${currentSrc}" unavailable. Falling back to "${fallbackSrc}".`);
      setHasTriedFallback(true);
      setCurrentSrc(fallbackSrc);
    }
  }, [currentSrc, fallbackSrc, hasTriedFallback]);

  // Sync mute state with soundEngine for both primary and loop video
  useEffect(() => {
    const unsub = soundEngine.subscribe((muted) => {
      setIsMuted(muted);
      if (videoRef.current) {
        videoRef.current.muted = muted;
      }
      if (loopVideoRef.current) {
        loopVideoRef.current.muted = muted;
      }
    });
    return () => unsub();
  }, []);

  // Primary video autoplay management
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    v.muted = soundEngine.isMuted;
    v.volume = 0.85;

    const playPromise = v.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          if (v) {
            v.muted = true;
            setIsMuted(true);
            v.play()
              .then(() => setIsPlaying(true))
              .catch(() => setIsPlaying(false));
          }
        });
    }
  }, [currentSrc]);

  // Seamless trigger to transition into continuation loop with audio cross-fade
  const startLoopTransition = useCallback(() => {
    if (isLoopingActive || !loopSrc) return;
    setIsLoopingActive(true);

    const v1 = videoRef.current;
    const v2 = loopVideoRef.current;

    if (v2) {
      v2.currentTime = 0;
      v2.muted = soundEngine.isMuted;
      v2.volume = 0; // Start at 0 for smooth volume fade-in
      const playPromise = v2.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            if (v2) {
              v2.muted = true;
              v2.play().then(() => setIsPlaying(true)).catch(() => {});
            }
          });
      }
    }

    // Audio Cross-fade over 600ms to eliminate any click/pop
    const fadeSteps = 15;
    const stepInterval = 40; // 15 * 40ms = 600ms
    let step = 0;

    const crossFadeTimer = setInterval(() => {
      step++;
      const ratio = Math.min(1, step / fadeSteps);
      if (v1 && !soundEngine.isMuted) {
        v1.volume = Math.max(0, 0.85 * (1 - ratio));
      }
      if (v2 && !soundEngine.isMuted) {
        v2.volume = Math.min(0.85, 0.85 * ratio);
      }

      if (step >= fadeSteps) {
        clearInterval(crossFadeTimer);
        if (v1) {
          v1.pause();
          v1.volume = 0;
        }
        if (v2 && !soundEngine.isMuted) {
          v2.volume = 0.85;
        }
      }
    }, stepInterval);
  }, [isLoopingActive, loopSrc]);

  const togglePlay = () => {
    const activeV = isLoopingActive && loopVideoRef.current ? loopVideoRef.current : videoRef.current;
    if (!activeV) return;
    if (activeV.paused) {
      activeV.play();
      setIsPlaying(true);
    } else {
      activeV.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    soundEngine.toggleMute();
    const nextMuted = soundEngine.isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
    if (loopVideoRef.current) {
      loopVideoRef.current.muted = nextMuted;
    }
  };

  const handleTimeUpdate = () => {
    if (isLoopingActive) return;
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    if (v.duration) {
      setDuration(v.duration);
      setProgress((v.currentTime / v.duration) * 100);

      // Pre-trigger loop transition 450ms before end for seamless cross-dissolve
      if (loopSrc && v.currentTime >= v.duration - 0.5) {
        startLoopTransition();
      }
    }
  };

  const handleVideoEnded = () => {
    if (loopSrc) {
      startLoopTransition();
      return;
    }
    if (autoAdvanceOnEnd && onAdvance) {
      onAdvance();
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black select-none text-stone-100 font-sans flex flex-col justify-between">
      
      {/* ========================================================
          FULLSCREEN VIDEO LAYER (Primary Intro Video)
      ======================================================== */}
      <video
        ref={videoRef}
        key={currentSrc}
        src={currentSrc}
        playsInline
        autoPlay
        muted={isMuted}
        onError={handleVideoError}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnded}
        className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-700 ${
          isLoopingActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <source src={currentSrc} type="video/mp4" />
      </video>

      {/* ========================================================
          CONTINUATION SEAMLESS LOOP VIDEO (e.g. /vid/rain_loop.mp4)
      ======================================================== */}
      {loopSrc && (
        <video
          ref={loopVideoRef}
          src={loopSrc}
          playsInline
          loop
          preload="auto"
          muted={isMuted}
          className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-700 ${
            isLoopingActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <source src={loopSrc} type="video/mp4" />
        </video>
      )}

      {/* Atmospheric Widescreen Film Grain & Cinematic Vignette */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black/95 via-black/20 to-black/60" />
      <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.85)]" />

      {/* Top spacer (leaves the view open for DestinationView's floating minimal navigation) */}
      <div className="relative z-20 w-full h-20 pointer-events-none" />

      {/* ========================================================
          LOWER-THIRD CINEMATIC TITLE & DOCUMENTARY LOGLINE
          Directly rendered over the video frame — NO POPUP BOX!
      ======================================================== */}
      <div className="relative z-20 w-full max-w-5xl px-6 sm:px-12 pb-8 flex flex-col justify-end text-left select-none">
        
        {/* Chapter Eyebrow */}
        {chapterTag && (
          <div className="flex items-center gap-2.5 text-[11px] sm:text-xs font-mono font-bold tracking-[0.35em] text-amber-300/95 uppercase mb-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            <span>{chapterTag}</span>
          </div>
        )}

        {/* Cinematic Film Title */}
        <h1 className="font-['Cinzel',serif] text-3xl sm:text-5xl md:text-6xl font-light tracking-[0.1em] text-[#faf7f2] uppercase leading-[1.08] mb-3 drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
          {title}
        </h1>

        {/* Subtitle / Geographic Coordinates */}
        {subtitle && (
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono tracking-[0.28em] text-stone-400 uppercase mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            <Compass className="w-3.5 h-3.5 text-amber-300/70" />
            <span>{subtitle}</span>
          </div>
        )}

        {/* Documentary Logline Prose */}
        {logline && (
          <p className="max-w-3xl text-sm sm:text-base text-stone-300/95 font-sans font-light leading-relaxed mb-5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            {logline}
          </p>
        )}

        {/* Radar Physics Clue: Minimalist Editorial Hairline (NO HEAVY BOX) */}
        {physicsClue && (
          <div className="border-l-2 border-amber-400/60 pl-4 py-1 text-xs font-mono text-stone-300/90 leading-relaxed mb-6 max-w-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            <span className="text-amber-300/95 font-semibold tracking-wider uppercase block text-[10px] mb-0.5">
              PHYSICAL PRINCIPLE
            </span>
            <span>{physicsClue}</span>
          </div>
        )}

        {/* Video Scrubber & Film Control Bar */}
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
          
          {/* Time & Scrubber */}
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <button
              onClick={togglePlay}
              className="p-2 rounded-full bg-stone-900/60 hover:bg-stone-800 border border-stone-700/50 text-stone-300 hover:text-amber-200 transition-all cursor-pointer backdrop-blur-sm"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={toggleMute}
              className="p-2 rounded-full bg-stone-900/60 hover:bg-stone-800 border border-stone-700/50 text-stone-300 hover:text-amber-200 transition-all cursor-pointer backdrop-blur-sm"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400/90" /> : <Volume2 className="w-3.5 h-3.5 text-amber-300/90" />}
            </button>

            <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-400">
              {isLoopingActive ? (
                <span className="text-amber-300/90 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] tracking-wider uppercase">CONTINUOUS RAIN LOOP</span>
                </span>
              ) : (
                <>
                  <span>{formatTime(currentTime)}</span>
                  <span className="text-stone-600">/</span>
                  <span>{formatTime(duration)}</span>
                </>
              )}
            </div>

            {/* Video Progress Line */}
            <div className="flex-1 sm:w-44 h-[2px] bg-white/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-300 transition-all duration-150"
                style={{ width: `${isLoopingActive ? 100 : progress}%` }}
              />
            </div>
          </div>

          {/* Action Advance Button: Sleek Dark Stone & Champagne Border */}
          {onAdvance && (
            <button
              onClick={() => {
                try { soundEngine.playTransitionSound(); } catch (e) {}
                onAdvance();
              }}
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-stone-950/85 hover:bg-stone-900 border border-amber-300/40 hover:border-amber-300 text-stone-200 hover:text-amber-100 font-mono text-xs tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer backdrop-blur-md flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(212,175,55,0.18)] hover:scale-102 active:scale-98 group"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-300 group-hover:translate-x-1 transition-transform" />
            </button>
          )}

        </div>

      </div>

    </div>
  );
}
