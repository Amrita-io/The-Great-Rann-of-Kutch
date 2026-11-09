import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { soundEngine } from '../utils/audio';

export default function KutchAct1View({ onBackToDiorama, onReturnToOrbit }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const cinematicTitleRef = useRef(null);
  const [fadeState, setFadeState] = useState('fading-in'); // Starts with black fade-in on page mount

  // 1. SILENCE ALL BACKGROUND MUSIC ON ACT-1 PLAYBACK
  const silenceAllBackgroundMusic = useCallback(() => {
    try {
      if (soundEngine && soundEngine.ctx) {
        const t = soundEngine.ctx.currentTime;
        if (soundEngine.kutchGain) {
          soundEngine.kutchGain.gain.cancelScheduledValues(t);
          soundEngine.kutchGain.gain.linearRampToValueAtTime(0.00001, t + 0.3);
        }
        if (soundEngine.spaceGain) {
          soundEngine.spaceGain.gain.cancelScheduledValues(t);
          soundEngine.spaceGain.gain.linearRampToValueAtTime(0.00001, t + 0.3);
        }
      }
    } catch (e) {
      console.warn('Silencing background audio:', e);
    }
  }, []);

  const restoreBackgroundMusic = useCallback(() => {
    try {
      if (soundEngine && soundEngine.ctx && !soundEngine.isMuted) {
        const t = soundEngine.ctx.currentTime;
        if (soundEngine.kutchGain) {
          soundEngine.kutchGain.gain.cancelScheduledValues(t);
          soundEngine.kutchGain.gain.linearRampToValueAtTime(0.24, t + 0.8);
        }
      }
    } catch (e) {}
  }, []);

  // 2. Lifecycle: Auto-play, silence music, and handle black fade-in
  useEffect(() => {
    silenceAllBackgroundMusic();

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = soundEngine.isMuted;
      videoRef.current.play().catch(() => {});
    }

    // Fade in from black overlay
    const fadeTimer = setTimeout(() => {
      setFadeState('idle');
    }, 650);

    return () => {
      clearTimeout(fadeTimer);
      restoreBackgroundMusic();
    };
  }, [silenceAllBackgroundMusic, restoreBackgroundMusic]);

  // Keep video audio synced with global mute control
  useEffect(() => {
    const unsub = soundEngine.subscribe((muted) => {
      if (videoRef.current) {
        videoRef.current.muted = muted;
      }
      if (!muted) {
        silenceAllBackgroundMusic();
      }
    });

    return () => unsub();
  }, [silenceAllBackgroundMusic]);

  // 3. Cinematic Typographical Entrance Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      gsap.set(cinematicTitleRef.current, {
        opacity: 0,
        scale: 0.94,
        y: 24,
        filter: 'blur(20px)'
      });

      tl.to(cinematicTitleRef.current, {
        opacity: 1,
        scale: 1.0,
        y: 0,
        filter: 'blur(0px)',
        duration: 2.2,
        ease: 'power2.out',
        delay: 0.6
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // 4. Return to Central 5-Acts Diorama via Black Fade-Out
  const handleReturnToDiorama = useCallback(() => {
    soundEngine.playClick();
    setFadeState('fading-out');

    setTimeout(() => {
      if (onBackToDiorama) {
        onBackToDiorama();
      }
    }, 650);
  }, [onBackToDiorama]);

  const handleReplayVideo = () => {
    soundEngine.playClick();
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <section
      ref={containerRef}
      id="sx-act1-page"
      className="relative w-screen h-screen overflow-hidden bg-[#030508] text-[#f8fafc] font-['Cinzel',serif] selection:bg-white/20 select-none"
    >
      <style>{`
        .sx-act1-video {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: translate(-50%, -50%);
          z-index: 1;
        }

        .sx-act1-vignette {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at center, transparent 35%, rgba(3, 5, 8, 0.70) 100%),
            linear-gradient(to bottom, rgba(0,0,0,0.60) 0%, transparent 22%, transparent 70%, rgba(3, 5, 8, 0.90) 100%);
          z-index: 2;
          pointer-events: none;
        }

        .sx-act1-center-cinematic {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          z-index: 10;
          pointer-events: none;
          width: 90%;
          max-width: 960px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .sx-cinematic-line {
          animation: sx-line-glow-pulse 4s ease-in-out infinite alternate;
        }

        @keyframes sx-line-glow-pulse {
          0% { opacity: 0.35; width: 48px; }
          100% { opacity: 0.85; width: 90px; }
        }
      `}</style>

      {/* Act-1 Fullscreen Video (Pure cinematic visuals) */}
      <video
        ref={videoRef}
        src="/vid/Act-1/gemini_generated_video_adb97d98.mp4"
        playsInline
        muted={soundEngine.isMuted}
        onEnded={(e) => {
          e.currentTarget.pause();
        }}
        className="sx-act1-video"
      >
        <source src="/vid/Act-1/gemini_generated_video_adb97d98.mp4" type="video/mp4" />
      </video>

      {/* Deep Filmic Vignette for Text Legibility */}
      <div className="sx-act1-vignette" />

      {/* ========================================================
          TOP NAVIGATION BAR (Dedicated Page Navigation)
      ======================================================== */}
      <nav className="relative z-30 flex items-center justify-between p-4 sm:p-7 md:p-9 font-mono text-[9px] sm:text-[10px] tracking-widest uppercase text-white/80">
        <button
          onClick={handleReturnToDiorama}
          onMouseEnter={() => soundEngine.playHover()}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-black/40 hover:bg-white/15 backdrop-blur-md transition-all cursor-pointer text-white shadow-lg"
        >
          <span>← 5 ACTS DIORAMA</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReplayVideo}
            onMouseEnter={() => soundEngine.playHover()}
            className="px-3.5 py-1.5 rounded-full border border-white/15 bg-black/40 hover:bg-white/10 backdrop-blur-md transition-all cursor-pointer text-white/70 hover:text-white"
          >
            ↻ REPLAY
          </button>
          {onReturnToOrbit && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onReturnToOrbit();
              }}
              onMouseEnter={() => soundEngine.playHover()}
              className="px-3.5 py-1.5 rounded-full border border-white/15 bg-black/40 hover:bg-white/10 backdrop-blur-md transition-all cursor-pointer text-white/70 hover:text-white"
            >
              ORBIT →
            </button>
          )}
        </div>
      </nav>

      {/* ========================================================
          FULL CINEMATIC CENTERPIECE: "ACT-1 SILENCE"
          (Monumental Editorial Typography)
      ======================================================== */}
      <div ref={cinematicTitleRef} className="sx-act1-center-cinematic">
        
        {/* Act Number Header */}
        <span className="font-['Montserrat',sans-serif] text-xs sm:text-sm md:text-base font-light tracking-[0.65em] text-cyan-300 uppercase mb-3 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
          A C T — I
        </span>

        {/* Monumental Cinematic Title */}
        <h1 className="font-['Cinzel',serif] text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-normal tracking-[0.28em] text-white uppercase leading-none drop-shadow-[0_4px_45px_rgba(0,0,0,0.98)]">
          SILENCE
        </h1>

        {/* Subtle Atmospheric Divider Line */}
        <div className="sx-cinematic-line h-[1.5px] bg-cyan-400/80 mt-6 rounded-full" />

        {/* Subtitle */}
        <span className="font-['Montserrat',sans-serif] text-[9.5px] sm:text-[11px] font-light tracking-[0.45em] uppercase text-white/80 mt-5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
          THE INFINITE WHITE HORIZON
        </span>

        {/* Poetic Narrative Caption */}
        <p className="font-['Cormorant_Garamond',serif] text-sm sm:text-base md:text-lg italic text-slate-200/90 max-w-xl text-center mt-5 leading-relaxed drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
          "An ancient arm of the Arabian Sea surrendered to the sun, leaving behind a boundless crystalline crust. Under the desert moon, the boundaries between earth and sky quietly dissolve."
        </p>

      </div>

      {/* ========================================================
          CINEMATIC BLACK FADE OVERLAY
      ======================================================== */}
      <div
        className="fixed inset-0 z-50 bg-[#030508] pointer-events-none transition-opacity duration-650 ease-in-out"
        style={{
          opacity: fadeState === 'idle' ? 0 : 1,
          visibility: fadeState === 'idle' ? 'hidden' : 'visible'
        }}
      />
    </section>
  );
}
