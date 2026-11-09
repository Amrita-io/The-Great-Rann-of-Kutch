import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { soundEngine } from '../utils/audio';

export default function KutchAct1View({ onExploreMap }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const cinematicTitleRef = useRef(null);
  const hasShiftedToNISAR = useRef(false);
  const [hasEnteredView, setHasEnteredView] = useState(false);

  // 1. SILENCE ALL OTHER MUSIC WHEN THIS VIDEO PLAYS
  const silenceAllBackgroundMusic = useCallback(() => {
    try {
      if (soundEngine && soundEngine.ctx) {
        const t = soundEngine.ctx.currentTime;
        // Silence Kutch folk tanpura, flutes, and any bells
        if (soundEngine.kutchGain) {
          soundEngine.kutchGain.gain.cancelScheduledValues(t);
          soundEngine.kutchGain.gain.linearRampToValueAtTime(0.00001, t + 0.3);
        }
        // Silence any space ambient drones as well
        if (soundEngine.spaceGain) {
          soundEngine.spaceGain.gain.cancelScheduledValues(t);
          soundEngine.spaceGain.gain.linearRampToValueAtTime(0.00001, t + 0.3);
        }
      }
    } catch (e) {
      console.warn('Silencing background audio:', e);
    }
  }, []);

  // Restore ambient music only when moving away
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

  // 2. IntersectionObserver: Play video and trigger silence when user reaches Act-1
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEnteredView(true);
          silenceAllBackgroundMusic();
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.muted = soundEngine.isMuted;
            videoRef.current.play().catch(() => {});
          }
        } else {
          if (videoRef.current) {
            videoRef.current.pause();
          }
        }
      },
      { threshold: 0.35 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      restoreBackgroundMusic();
    };
  }, [silenceAllBackgroundMusic, restoreBackgroundMusic]);

  // Keep video audio synced with global mute button
  useEffect(() => {
    const unsub = soundEngine.subscribe((muted) => {
      if (videoRef.current) {
        videoRef.current.muted = muted;
      }
      if (!muted && hasEnteredView) {
        silenceAllBackgroundMusic();
      }
    });

    return () => unsub();
  }, [hasEnteredView, silenceAllBackgroundMusic]);

  // 3. FULL CINEMATIC "ACT-1 SILENCE" TYPOGRAPHY (Minimalist, Epic, Filmic)
  useEffect(() => {
    if (!hasEnteredView) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      // Initial State: Hidden
      gsap.set(cinematicTitleRef.current, {
        opacity: 0,
        scale: 0.94,
        y: 20,
        filter: 'blur(20px)'
      });

      // Majestic cinematic fade-in at t = 0.5s
      tl.to(cinematicTitleRef.current, {
        opacity: 1,
        scale: 1.0,
        y: 0,
        filter: 'blur(0px)',
        duration: 2.4,
        ease: 'power2.out',
        delay: 0.5
      });

    }, containerRef);

    return () => ctx.revert();
  }, [hasEnteredView]);

  // 4. SHIFT USER TO NISAR DATA AS VIDEO IS ALMOST ABOUT TO END
  const handleShiftToNISAR = useCallback(() => {
    if (hasShiftedToNISAR.current) return;
    hasShiftedToNISAR.current = true;

    soundEngine.playDiscoverSound();
    const mapEl = document.getElementById('sx-interactive-map');
    if (mapEl) {
      window.dispatchEvent(new CustomEvent('kutch:trigger-map-reveal'));
      mapEl.scrollIntoView({ behavior: 'smooth' });
    }
    if (onExploreMap) onExploreMap();
  }, [onExploreMap]);

  // Trigger shift at ~9.2s of 10s video (when video is almost about to end)
  const handleVideoTimeUpdate = () => {
    if (hasShiftedToNISAR.current || !videoRef.current) return;
    const v = videoRef.current;
    if (v.duration && v.currentTime >= v.duration - 0.8) {
      handleShiftToNISAR();
    }
  };

  const handleVideoEnded = () => {
    if (!hasShiftedToNISAR.current) {
      handleShiftToNISAR();
    }
  };

  return (
    <section
      ref={containerRef}
      id="sx-act1-section"
      onClick={handleShiftToNISAR}
      className="relative w-screen h-screen overflow-hidden bg-[#030508] text-[#f8fafc] font-['Cinzel',serif] selection:bg-white/20 select-none cursor-pointer"
      title="Click anytime to inspect NASA-ISRO NISAR Radar Data"
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
            radial-gradient(circle at center, transparent 38%, rgba(3, 5, 8, 0.65) 100%),
            linear-gradient(to bottom, rgba(0,0,0,0.50) 0%, transparent 25%, transparent 70%, rgba(3, 5, 8, 0.85) 100%);
          z-index: 2;
          pointer-events: none;
        }

        .sx-act1-center-cinematic {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          z-index: 3;
          pointer-events: none;
          width: 90%;
          max-width: 900px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0;
        }

        .sx-cinematic-line {
          animation: sx-line-glow-pulse 4s ease-in-out infinite alternate;
        }

        @keyframes sx-line-glow-pulse {
          0% { opacity: 0.35; width: 48px; }
          100% { opacity: 0.85; width: 84px; }
        }
      `}</style>

      {/* Act-1 Fullscreen Video (Pure visuals with background music silenced) */}
      <video
        ref={videoRef}
        src="/vid/Act-1/gemini_generated_video_adb97d98.mp4"
        playsInline
        muted={soundEngine.isMuted}
        onTimeUpdate={handleVideoTimeUpdate}
        onEnded={(e) => {
          e.currentTarget.pause();
          handleVideoEnded();
        }}
        className="sx-act1-video"
      >
        <source src="/vid/Act-1/gemini_generated_video_adb97d98.mp4" type="video/mp4" />
      </video>

      {/* Deep Filmic Vignette */}
      <div className="sx-act1-vignette" />

      {/* ========================================================
          FULL CINEMATIC CENTERPIECE: "ACT-1 SILENCE"
          (Clean, Monumental, Zero Clutter, Flawless Sync)
      ======================================================== */}
      <div ref={cinematicTitleRef} className="sx-act1-center-cinematic">
        
        {/* Act Number Header */}
        <span className="font-['Montserrat',sans-serif] text-xs sm:text-sm md:text-base font-light tracking-[0.65em] text-white/75 uppercase mb-3 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
          A C T — I
        </span>

        {/* Monumental Cinematic Title */}
        <h1 className="font-['Cinzel',serif] text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-normal tracking-[0.32em] text-white uppercase leading-none drop-shadow-[0_4px_45px_rgba(0,0,0,0.95)]">
          SILENCE
        </h1>

        {/* Subtle Atmospheric Divider Line */}
        <div className="sx-cinematic-line h-[1px] bg-white/50 mt-6 rounded-full" />

        {/* Minimal Subtitle */}
        <span className="font-['Montserrat',sans-serif] text-[9px] sm:text-[10.5px] font-light tracking-[0.42em] uppercase text-white/60 mt-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
          THE INFINITE WHITE HORIZON
        </span>

      </div>
    </section>
  );
}
