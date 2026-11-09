import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { soundEngine } from '../utils/audio';

export default function KutchAct1View({ onExploreMap, onBackToHero, onReturnToOrbit }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const giantTitleRef = useRef(null);
  const bottomContentRef = useRef(null);
  const navRef = useRef(null);
  const hasAutoScrolledToMap = useRef(false);
  const [hasEnteredView, setHasEnteredView] = useState(false);

  // Ethereal Crystalline Audio Layer for Act-1
  const audioContextRef = useRef(null);
  const bellIntervalRef = useRef(null);
  const windGainRef = useRef(null);

  // 1. Setup Ethereal Crystalline Ambient Sound for Act-1 (Cold, vast, crystalline halite vibe)
  const setupAct1Audio = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      // Shimmering sub-bass desert wind
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(42, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(110, ctx.currentTime);

      const gain = ctx.createGain();
      const initialVol = soundEngine.isMuted ? 0.0001 : 0.15;
      gain.gain.setValueAtTime(initialVol, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      windGainRef.current = gain;

      // Periodic ethereal crystal bell (representing pure white halite crystal vibration)
      const playCrystalShimmer = () => {
        if (soundEngine.isMuted || !audioContextRef.current) return;
        const c = audioContextRef.current;
        const t = c.currentTime;

        const b1 = c.createOscillator();
        b1.type = 'sine';
        b1.frequency.setValueAtTime(1174.66, t); // D6 crystal bell

        const b2 = c.createOscillator();
        b2.type = 'sine';
        b2.frequency.setValueAtTime(2349.32, t); // D7 octave harmonic

        const bGain = c.createGain();
        bGain.gain.setValueAtTime(0.0001, t);
        bGain.gain.linearRampToValueAtTime(0.06, t + 0.02);
        bGain.gain.exponentialRampToValueAtTime(0.0001, t + 3.8);

        b1.connect(bGain);
        b2.connect(bGain);
        bGain.connect(c.destination);

        b1.start(t);
        b2.start(t);
        b1.stop(t + 4.0);
        b2.stop(t + 4.0);
      };

      bellIntervalRef.current = setInterval(playCrystalShimmer, 7500);
      setTimeout(playCrystalShimmer, 1200);
    } catch (e) {
      console.warn('Act-1 audio initialization:', e);
    }
  }, []);

  const cleanupAct1Audio = useCallback(() => {
    if (bellIntervalRef.current) {
      clearInterval(bellIntervalRef.current);
      bellIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close().catch(() => {});
      } catch (e) {}
      audioContextRef.current = null;
    }
  }, []);

  // 2. IntersectionObserver: triggers play and animations when user reaches Act-1
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEnteredView(true);
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.muted = soundEngine.isMuted;
            videoRef.current.play().catch(() => {});
          }
          setupAct1Audio();
        } else {
          if (videoRef.current) {
            videoRef.current.pause();
          }
          cleanupAct1Audio();
        }
      },
      { threshold: 0.35 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      cleanupAct1Audio();
    };
  }, [setupAct1Audio, cleanupAct1Audio]);

  // 3. Audio Mute Synchronization with Global SoundEngine
  useEffect(() => {
    const unsub = soundEngine.subscribe((muted) => {
      if (videoRef.current) {
        videoRef.current.muted = muted;
      }
      if (windGainRef.current && audioContextRef.current) {
        const t = audioContextRef.current.currentTime;
        windGainRef.current.gain.cancelScheduledValues(t);
        windGainRef.current.gain.linearRampToValueAtTime(muted ? 0.0001 : 0.15, t + 0.2);
      }
    });

    return () => unsub();
  }, []);

  // 4. Masterfully Timed Cinematic Typography Choreography (GSAP)
  useEffect(() => {
    if (!hasEnteredView) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Initial States: Hidden
      gsap.set(giantTitleRef.current, {
        opacity: 0,
        scale: 0.92,
        y: 28,
        filter: 'blur(16px)'
      });

      gsap.set(bottomContentRef.current, {
        opacity: 0,
        y: 35
      });

      gsap.set(navRef.current, {
        opacity: 0,
        y: -25
      });

      // Step 1 (t = 0.4s): Giant Act-1 Title emerges majestically
      tl.to(giantTitleRef.current, {
        opacity: 1,
        scale: 1.0,
        y: 0,
        filter: 'blur(0px)',
        duration: 2.0,
        ease: 'power2.out',
        delay: 0.35
      })

      // Step 2 (t = 1.6s): Poetic narrative and explore CTA emerge smoothly
      .to(bottomContentRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.4,
        ease: 'power2.out'
      }, '-=0.8')

      // Step 3 (t = 2.2s): Top chapter navigation appears gracefully
      .to(navRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'power2.out'
      }, '+=0.1');

    }, containerRef);

    return () => ctx.revert();
  }, [hasEnteredView]);

  // 5. Auto-scroll transition into 5-Acts Diorama Map
  const handleTransitionToMap = useCallback(() => {
    if (hasAutoScrolledToMap.current) return;
    hasAutoScrolledToMap.current = true;

    soundEngine.playDiscoverSound();
    const mapEl = document.getElementById('sx-interactive-map');
    if (mapEl) {
      window.dispatchEvent(new CustomEvent('kutch:trigger-map-reveal'));
      mapEl.scrollIntoView({ behavior: 'smooth' });
    }
    if (onExploreMap) onExploreMap();
  }, [onExploreMap]);

  // Auto-scroll when Act-1 video is nearing completion (~9.2s of 10s video)
  const handleVideoTimeUpdate = () => {
    if (hasAutoScrolledToMap.current || !videoRef.current) return;
    const v = videoRef.current;
    if (v.duration && v.currentTime >= v.duration - 0.8) {
      handleTransitionToMap();
    }
  };

  const handleVideoEnded = () => {
    if (!hasAutoScrolledToMap.current) {
      handleTransitionToMap();
    }
  };

  return (
    <section
      ref={containerRef}
      id="sx-act1-section"
      className="relative w-screen h-screen overflow-hidden bg-[#030508] text-[#f8fafc] font-['Montserrat',sans-serif] selection:bg-white/20 select-none"
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
            radial-gradient(circle at center, transparent 35%, rgba(3, 5, 8, 0.60) 100%),
            linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 22%, transparent 72%, rgba(3, 5, 8, 0.95) 100%);
          z-index: 2;
          pointer-events: none;
        }

        .sx-act1-title {
          position: absolute;
          top: 17%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Cinzel', serif;
          text-align: center;
          z-index: 3;
          pointer-events: none;
          width: 92%;
          max-width: 1200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0;
        }

        @media (max-width: 768px) {
          .sx-act1-title {
            top: 18%;
          }
        }
      `}</style>

      {/* Act-1 Native Video (Fullscreen & Cinematic) */}
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

      {/* High-Contrast Vignette for Editorial Legibility */}
      <div className="sx-act1-vignette" />

      {/* Top Chapter Navigation Bar */}
      <nav ref={navRef} className="absolute top-0 left-0 w-full px-6 sm:px-16 py-8 flex justify-between items-center z-10 text-[11px] font-mono tracking-[0.24em] uppercase text-white/70">
        <div className="flex items-center gap-6">
          {onBackToHero && (
            <button
              onClick={onBackToHero}
              onMouseEnter={() => soundEngine.playHover()}
              className="hover:text-white transition-colors cursor-pointer"
            >
              ↑ Hero
            </button>
          )}
          {onReturnToOrbit && (
            <button
              onClick={onReturnToOrbit}
              onMouseEnter={() => soundEngine.playHover()}
              className="hidden sm:inline hover:text-white transition-colors cursor-pointer"
            >
              ← Orbit
            </button>
          )}
        </div>

        {/* Center Act Badge */}
        <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/15 bg-black/40 backdrop-blur-md text-[9.5px] text-white">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="tracking-[0.28em]">ACT I OF V • THE INFINITE WHITE DESERT</span>
        </div>

        {/* Right Forward Link */}
        <button
          onClick={handleTransitionToMap}
          onMouseEnter={() => soundEngine.playHover()}
          className="hover:text-white transition-colors cursor-pointer"
        >
          Terrain Map ↓
        </button>
      </nav>

      {/* Giant Cinematic Title (In Sync with Visual Atmosphere) */}
      <div ref={giantTitleRef} className="sx-act1-title">
        <div className="flex items-center gap-3 mb-2 text-[10px] font-mono tracking-[0.34em] text-white/65 uppercase">
          <span className="w-6 h-[1px] bg-white/30" />
          <span>CHAPTER I // 23.83° N, 70.03° E • GUJARAT, INDIA</span>
          <span className="w-6 h-[1px] bg-white/30" />
        </div>

        <h1 className="font-['Cinzel',serif] text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-[0.20em] uppercase text-white leading-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
          THE INFINITE EXPANSE
        </h1>

        <span className="font-['Cinzel',serif] text-xs sm:text-sm md:text-base font-light tracking-[0.32em] text-white/75 uppercase mt-2 drop-shadow-[0_2px_14px_rgba(0,0,0,0.8)]">
          7,505 SQ KM OF PURE CRYSTALLINE HALITE GEOLOGY
        </span>
      </div>

      {/* Bottom Poetic Narrative & Forward Action Button */}
      <div ref={bottomContentRef} className="absolute bottom-[6%] left-1/2 -translate-x-1/2 z-10 text-center max-w-2xl w-[90%] opacity-0">
        <p className="font-['Cormorant_Garamond',serif] text-sm sm:text-base md:text-lg tracking-[0.14em] leading-relaxed uppercase text-white/90 mb-5 font-normal drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          An ancient arm of the Arabian Sea surrendered to the sun, leaving behind a boundless crystalline crust. Under the desert moon, the boundaries between earth and sky quietly dissolve.
        </p>

        <button
          onClick={handleTransitionToMap}
          onMouseEnter={() => soundEngine.playHover()}
          className="group inline-flex items-center gap-3 px-8 py-3 rounded-full border border-white/30 bg-black/50 hover:bg-white/[0.18] backdrop-blur-md text-[11px] font-sans tracking-[0.26em] uppercase text-white transition-all cursor-pointer shadow-2xl active:scale-95"
        >
          <span>Explore 5-Acts Cartography</span>
          <span className="text-[10px] transform group-hover:translate-y-0.5 transition-transform duration-200">↓</span>
        </button>
      </div>
    </section>
  );
}
