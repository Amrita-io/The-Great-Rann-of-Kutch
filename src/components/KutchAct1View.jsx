import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { soundEngine } from '../utils/audio';
import NisarShowcaseView from './NisarShowcaseView';

export default function KutchAct1View({ onBackToDiorama, onReturnToOrbit }) {
  const containerRef = useRef(null);
  const heroSectionRef = useRef(null);
  const radarSectionRef = useRef(null);
  const videoRef = useRef(null);
  const cinematicTitleRef = useRef(null);
  const hasAutoScrolled = useRef(false);

  const [fadeState, setFadeState] = useState('fading-in'); // Black fade-in on mount
  const [isViewingRadar, setIsViewingRadar] = useState(false);

  // 1. SILENCE ALL BACKGROUND MUSIC WHEN ACT-1 HERO VIDEO IS ACTIVE
  const silenceAll = useCallback(() => {
    soundEngine.silenceAllBackgroundMusic();
  }, []);

  // 2. Lifecycle & Audio Management on Mount
  useEffect(() => {
    silenceAll();

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = soundEngine.isMuted;
      videoRef.current.play().catch(() => {});
    }

    const fadeTimer = setTimeout(() => {
      setFadeState('idle');
    }, 600);

    return () => {
      clearTimeout(fadeTimer);
      silenceAll();
    };
  }, [silenceAll]);

  // Keep video audio synced with global mute control
  useEffect(() => {
    const unsub = soundEngine.subscribe((muted) => {
      if (videoRef.current) {
        videoRef.current.muted = muted;
      }
      if (!muted && !isViewingRadar) {
        silenceAll();
      }
    });

    return () => unsub();
  }, [silenceAll, isViewingRadar]);

  // 3. Section Visibility Observer:
  // - While on Hero Section (video active): ZERO background music plays!
  // - When on Radar Showcase Section: video pauses, and @Sounds/Act-1/The_Vast_Salt_Mirror.mp3 plays gently
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.id === 'sx-act1-hero-section') {
            if (entry.isIntersecting) {
              setIsViewingRadar(false);
              soundEngine.pauseSaltMirrorMusic();
              soundEngine.silenceAllBackgroundMusic();
              if (videoRef.current) {
                videoRef.current.play().catch(() => {});
              }
            } else {
              if (videoRef.current) {
                videoRef.current.pause();
              }
            }
          } else if (entry.target.id === 'sx-act1-radar-section') {
            if (entry.isIntersecting) {
              setIsViewingRadar(true);
              if (videoRef.current) {
                videoRef.current.pause();
              }
              // Light, elegant background music for Act-1 Radar Showcase
              soundEngine.playSaltMirrorMusic(0.20);
            } else {
              soundEngine.pauseSaltMirrorMusic();
            }
          }
        });
      },
      { threshold: 0.45 }
    );

    if (heroSectionRef.current) observer.observe(heroSectionRef.current);
    if (radarSectionRef.current) observer.observe(radarSectionRef.current);

    return () => {
      observer.disconnect();
      soundEngine.pauseSaltMirrorMusic();
    };
  }, []);

  // 4. Cinematic Typographical Entrance Animation
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

  // Smooth scroll down to Radar Showcase
  const scrollToRadar = () => {
    radarSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Smooth scroll up to Act 1 Hero
  const scrollToHero = () => {
    heroSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // When Act 1 video is nearing completion (~1.2s before end)
  const handleVideoTimeUpdate = () => {
    if (hasAutoScrolled.current || !videoRef.current) return;
    const v = videoRef.current;
    if (v.duration && v.currentTime >= v.duration - 1.2) {
      hasAutoScrolled.current = true;
      scrollToRadar();
    }
  };

  const handleVideoEnded = () => {
    if (!hasAutoScrolled.current) {
      hasAutoScrolled.current = true;
      scrollToRadar();
    }
  };

  const handleReplayVideo = () => {
    hasAutoScrolled.current = false;
    scrollToHero();
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  // Return to Central 5-Acts Diorama via Black Fade-Out
  const handleReturnToDiorama = useCallback(() => {
    soundEngine.pauseSaltMirrorMusic();
    soundEngine.silenceAllBackgroundMusic();
    setFadeState('fading-out');

    setTimeout(() => {
      if (onBackToDiorama) {
        onBackToDiorama();
      }
    }, 700);
  }, [onBackToDiorama]);

  // Return to Orbit
  const handleReturnToOrbit = useCallback(() => {
    soundEngine.pauseSaltMirrorMusic();
    soundEngine.silenceAllBackgroundMusic();
    setFadeState('fading-out');

    setTimeout(() => {
      if (onReturnToOrbit) {
        onReturnToOrbit();
      }
    }, 700);
  }, [onReturnToOrbit]);

  return (
    <div
      ref={containerRef}
      id="sx-act1-unified-page"
      className="relative w-screen h-screen overflow-y-auto overflow-x-hidden bg-[#030508] text-[#f8fafc] select-none scroll-smooth snap-y snap-mandatory"
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
          top: 48%;
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

      {/* ========================================================
          SECTION 1: ACT-1 HERO CINEMATIC VIDEO (100vh Slab)
      ======================================================== */}
      <section
        ref={heroSectionRef}
        id="sx-act1-hero-section"
        className="relative w-full h-screen min-h-screen snap-start snap-always overflow-hidden font-['Cinzel',serif]"
      >
        {/* Fullscreen Video (Pure cinematic visuals with zero background interference) */}
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

        {/* Deep Filmic Vignette for Text Legibility */}
        <div className="sx-act1-vignette" />

        {/* Top Navigation Bar: Minimalist Luxury Inspired by Reference */}
        <nav className="relative z-30 flex items-center justify-between p-6 sm:p-8 md:p-10 font-sans text-xs tracking-[0.25em] uppercase text-white/70">
          <div className="flex items-center gap-6">
            <button
              onClick={handleReturnToDiorama}
              onMouseEnter={() => soundEngine.playHover()}
              className="text-white/70 hover:text-white transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>← RETURN</span>
            </button>
            <span className="text-white/30 hidden sm:inline">|</span>
            <span className="text-white/50 hidden sm:inline font-['Cinzel',serif] tracking-[0.2em]">
              ACT I • SILENCE
            </span>
          </div>

          <div className="flex items-center gap-6 sm:gap-8">
            <button
              onClick={scrollToRadar}
              onMouseEnter={() => soundEngine.playHover()}
              className="text-white/70 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              RADAR SHOWCASE ↓
            </button>
            <button
              onClick={handleReplayVideo}
              onMouseEnter={() => soundEngine.playHover()}
              className="text-white/50 hover:text-white transition-colors cursor-pointer hidden md:inline"
            >
              ↻ REPLAY
            </button>
            {onReturnToOrbit && (
              <button
                onClick={handleReturnToOrbit}
                onMouseEnter={() => soundEngine.playHover()}
                className="text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                ORBIT →
              </button>
            )}
          </div>
        </nav>

        {/* Monumental Cinematic Typography */}
        <div ref={cinematicTitleRef} className="sx-act1-center-cinematic">
          <span className="font-['Montserrat',sans-serif] text-xs sm:text-sm md:text-base font-light tracking-[0.65em] text-cyan-300 uppercase mb-3 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            A C T — I
          </span>

          <h1 className="font-['Cinzel',serif] text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-normal tracking-[0.28em] text-white uppercase leading-none drop-shadow-[0_4px_45px_rgba(0,0,0,0.98)]">
            SILENCE
          </h1>

          <div className="sx-cinematic-line h-[1.5px] bg-cyan-400/80 mt-6 rounded-full" />

          <span className="font-['Montserrat',sans-serif] text-[9.5px] sm:text-[11px] font-light tracking-[0.45em] uppercase text-white/80 mt-5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            THE INFINITE WHITE HORIZON
          </span>

          <p className="font-['Cormorant_Garamond',serif] text-sm sm:text-base md:text-lg italic text-slate-200/90 max-w-xl text-center mt-5 leading-relaxed drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
            "An ancient arm of the Arabian Sea surrendered to the sun, leaving behind a boundless crystalline crust. Under the desert moon, the boundaries between earth and sky quietly dissolve."
          </p>
        </div>

        {/* Bottom Discovery Pill: Guides user to the Radar section directly below */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
          <button
            onClick={scrollToRadar}
            onMouseEnter={() => soundEngine.playHover()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-cyan-400/40 bg-black/60 hover:bg-cyan-950/70 backdrop-blur-md text-[9.5px] font-mono tracking-widest text-cyan-200 transition-all cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.25)] group"
          >
            <span>EXPLORE NISAR RADAR DATA</span>
            <span className="text-cyan-400 transform group-hover:translate-y-0.5 transition-transform">↓</span>
          </button>
        </div>
      </section>

      {/* ========================================================
          SECTION 2: NISAR RADAR SHOWCASE (Just Below Act-1 Hero)
      ======================================================== */}
      <section
        ref={radarSectionRef}
        id="sx-act1-radar-section"
        className="relative w-full min-h-screen snap-start snap-always"
      >
        <NisarShowcaseView
          isActive={isViewingRadar}
          onBackToAct1={scrollToHero}
          onBackToDiorama={handleReturnToDiorama}
          onReturnToOrbit={handleReturnToOrbit}
        />
      </section>

      {/* ========================================================
          CINEMATIC BLACK FADE OVERLAY
      ======================================================== */}
      <div
        className="fixed inset-0 z-50 bg-[#030508] pointer-events-none transition-opacity duration-700 ease-in-out"
        style={{
          opacity: fadeState === 'idle' ? 0 : 1,
          visibility: fadeState === 'idle' ? 'hidden' : 'visible'
        }}
      />
    </div>
  );
}
