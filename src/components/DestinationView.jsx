import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { soundEngine } from '../utils/audio';
import KutchRealityDioramaView from './KutchRealityDioramaView';
import KutchAct1View from './KutchAct1View';

export default function DestinationView({
  destination,
  onBackToOrbit,
  onOpenItinerary,
  onOpenBooking,
  onOpenCulture
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const navRef = useRef(null);
  const giantTitleRef = useRef(null);
  const bottomContentRef = useRef(null);

  // Discrete Screen Slabs: 'hero' | 'diorama'
  // (Zero halfway scrolling: the user is strictly in either this or that slab!)
  const [currentSlab, setCurrentSlab] = useState('hero');
  const [isSlabTransitioning, setIsSlabTransitioning] = useState(false);

  // Dedicated full-screen sub-view for Act 1: null | 'act-1'
  const [activeActView, setActiveActView] = useState(null);

  // Audio & Video Coordination:
  // 1. When video is playing (Home hero or Act-1 video): ZERO background music plays!
  // 2. When home hero video ends and user enters 5 Acts island:
  //    Play @Sounds/Home/Breath_of_the_Rann.mp3 gently in the background!
  useEffect(() => {
    if (activeActView || currentSlab === 'hero') {
      soundEngine.silenceAllBackgroundMusic();
      if (videoRef.current) {
        if (activeActView) {
          videoRef.current.pause();
        } else {
          videoRef.current.play().catch(() => {});
        }
      }
    } else if (currentSlab === 'diorama' && !activeActView) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      // User is exploring the 5 Acts island: play Breath of the Rann gently
      soundEngine.playBreathOfTheRann(0.22);
    }
  }, [activeActView, currentSlab]);

  // Clean discrete transition between Hero and Diorama slabs (Silent, smooth black cross-fade)
  const transitionToSlab = useCallback((targetSlab) => {
    if (isSlabTransitioning || currentSlab === targetSlab) return;
    setIsSlabTransitioning(true);

    setTimeout(() => {
      setCurrentSlab(targetSlab);
      setTimeout(() => {
        setIsSlabTransitioning(false);
      }, 100);
    }, 500);
  }, [currentSlab, isSlabTransitioning]);

  const goToDiorama = useCallback(() => {
    transitionToSlab('diorama');
  }, [transitionToSlab]);

  const goToHero = useCallback(() => {
    transitionToSlab('hero');
  }, [transitionToSlab]);

  // Wheel Gesture Interception: strictly moves between discrete slabs (zero halfway scrolling!)
  useEffect(() => {
    const handleWheel = (e) => {
      if (activeActView || isSlabTransitioning) return;

      if (currentSlab === 'hero' && e.deltaY > 25) {
        goToDiorama();
      } else if (currentSlab === 'diorama' && e.deltaY < -25) {
        goToHero();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentSlab, activeActView, isSlabTransitioning, goToDiorama, goToHero]);

  // Cinematic Choreography on Mount
  useEffect(() => {
    soundEngine.setMode('destination');

    if (videoRef.current) {
      videoRef.current.muted = soundEngine.isMuted;
      videoRef.current.volume = 0.75;
      videoRef.current.play().catch(() => {});
    }

    const unsub = soundEngine.subscribe((muted) => {
      if (videoRef.current) {
        videoRef.current.muted = muted;
      }
    });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      gsap.set(giantTitleRef.current, {
        opacity: 0,
        scale: 0.90,
        y: 25,
        filter: 'blur(16px)'
      });

      gsap.set(bottomContentRef.current, {
        opacity: 0,
        y: 35
      });

      gsap.set(navRef.current, {
        opacity: 0,
        y: -30
      });

      tl.to(giantTitleRef.current, {
        opacity: 0.95,
        scale: 1.0,
        y: 0,
        filter: 'blur(0px)',
        duration: 2.2,
        ease: 'power2.out',
        delay: 0.4
      })
      .to(bottomContentRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.4,
        ease: 'power2.out'
      }, "-=0.8")
      .to(navRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power2.out'
      }, "+=0.2");

    }, containerRef);

    return () => {
      unsub();
      ctx.revert();
    };
  }, []);

  const handleReturn = () => {
    soundEngine.silenceAllBackgroundMusic();
    soundEngine.setMode('globe');
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.in',
      onComplete: onBackToOrbit
    });
  };

  // Auto-switch to diorama when hero video is nearing completion
  const handleVideoTimeUpdate = () => {
    if (currentSlab !== 'hero' || !videoRef.current) return;
    const v = videoRef.current;
    if (v.duration && v.currentTime >= v.duration - 0.9) {
      goToDiorama();
    }
  };

  const handleVideoEnded = () => {
    if (currentSlab === 'hero') {
      goToDiorama();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-[#030508] text-[#f8fafc] font-['Montserrat',sans-serif] select-none"
    >
      <style>{`
        /* Pinned Fullscreen Hero Slab */
        .hero-slab {
          position: absolute;
          inset: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }

        /* Auto-playing Background Video */
        .bg-video {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: translate(-50%, -50%);
          z-index: 1;
        }

        /* Dark Vignette Overlay for Text Legibility */
        .vignette-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, transparent 35%, rgba(3, 5, 8, 0.55) 100%),
                      linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 22%, transparent 75%, rgba(3, 5, 8, 0.90) 100%);
          z-index: 2;
          pointer-events: none;
        }

        /* Top Navigation (Appears AT LAST) */
        .nav-bar {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          padding: 2.2rem 4rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 10;
          font-size: 0.78rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          font-weight: 400;
          pointer-events: auto;
          opacity: 0;
        }

        @media (max-width: 640px) {
          .nav-bar {
            padding: 1.5rem 1.25rem;
            font-size: 0.70rem;
            letter-spacing: 0.16em;
          }
        }

        .nav-links {
          display: flex;
          gap: 2.5rem;
          list-style: none;
        }

        @media (max-width: 640px) {
          .nav-links {
            gap: 1.25rem;
          }
        }

        .nav-links button, .nav-links a {
          color: rgba(255, 255, 255, 0.70);
          background: transparent;
          border: none;
          font-family: inherit;
          font-size: inherit;
          letter-spacing: inherit;
          text-transform: inherit;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .nav-links button:hover, .nav-links a:hover {
          color: #ffffff;
        }

        /* Giant Backdrop Title (Cleanly elevated in the clear dusk sky above musicians) */
        .giant-title {
          position: absolute;
          top: 16%;
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
          user-select: none;
        }

        .title-eyebrow {
          font-family: 'Inter', 'Montserrat', sans-serif;
          font-size: clamp(0.65rem, 0.85vw, 0.80rem);
          font-weight: 400;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.60);
          margin-bottom: 0.6rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .title-eyebrow-line {
          width: 24px;
          height: 1px;
          background: rgba(255, 255, 255, 0.25);
        }

        .title-hero {
          font-family: 'Cinzel', serif;
          font-size: clamp(2.2rem, 5.2vw, 4.8rem);
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          line-height: 1.05;
          color: #ffffff;
          text-shadow: 0 4px 28px rgba(0, 0, 0, 0.85);
          display: block;
        }

        .title-sub {
          font-family: 'Cinzel', serif;
          font-size: clamp(0.72rem, 1.1vw, 0.95rem);
          font-weight: 300;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: rgba(226, 232, 240, 0.80);
          margin-top: 0.5rem;
          text-shadow: 0 2px 14px rgba(0, 0, 0, 0.8);
          display: block;
        }

        @media (max-width: 768px) {
          .giant-title {
            top: 17%;
          }
          .title-eyebrow {
            font-size: 0.60rem;
            letter-spacing: 0.26em;
            margin-bottom: 0.4rem;
          }
          .title-hero {
            font-size: clamp(1.8rem, 8vw, 2.8rem);
            letter-spacing: 0.16em;
          }
          .title-sub {
            font-size: 0.68rem;
            letter-spacing: 0.24em;
            margin-top: 0.35rem;
          }
        }

        /* Foreground Bottom Subtitle & Action */
        .bottom-content {
          position: absolute;
          bottom: 5.5%;
          left: 50%;
          transform: translateX(-50%);
          z-index: 5;
          text-align: center;
          max-width: 720px;
          width: 90%;
          opacity: 0;
        }

        .tagline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(0.95rem, 1.35vw, 1.20rem);
          letter-spacing: 0.16em;
          line-height: 1.5;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.88);
          margin-bottom: 1.15rem;
          font-weight: 400;
          text-shadow: 0 2px 16px rgba(0, 0, 0, 0.95);
        }

        .discover-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.70rem 2.8rem;
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          color: #ffffff;
          font-family: 'Inter', 'Montserrat', sans-serif;
          font-size: 0.70rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
        }

        .discover-btn:hover {
          background: rgba(255, 255, 255, 0.18);
          border-color: rgba(255, 255, 255, 0.60);
          color: #ffffff;
          box-shadow: 0 0 24px rgba(255, 255, 255, 0.25), 0 8px 32px rgba(0, 0, 0, 0.7);
          transform: translateY(-1px);
        }

        .discover-btn:active {
          transform: translateY(0);
        }
      `}</style>

      {/* ========================================================
          SLAB 1: FULLSCREEN HERO SCENE (Pinned 100vh Slab)
      ======================================================== */}
      <section
        className={`hero-slab transition-opacity duration-500 ease-in-out ${
          currentSlab === 'hero' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
        }`}
      >
        {/* Native Video: Plays Once & Holds Final Frame */}
        <video
          ref={videoRef}
          src="/vid/WhatsApp%20Video%202026-11-09%20at%205.26.53%20PM.mp4"
          autoPlay
          playsInline
          muted={soundEngine.isMuted}
          className="bg-video"
          onTimeUpdate={handleVideoTimeUpdate}
          onEnded={(e) => {
            e.currentTarget.pause();
            handleVideoEnded();
          }}
        >
          <source src="/vid/WhatsApp%20Video%202026-11-09%20at%205.26.53%20PM.mp4" type="video/mp4" />
          <source src="/vid/kutch_hero.mp4" type="video/mp4" />
        </video>

        {/* Vignette Overlay for Text Legibility */}
        <div className="vignette-overlay" />

        {/* Top Navigation Bar */}
        <nav ref={navRef} className="nav-bar">
          <ul className="nav-links">
            <li>
              <button
                onClick={handleReturn}
                onMouseEnter={() => soundEngine.playHover()}
              >
                ← Return
              </button>
            </li>
            <li>
              <button
                onClick={goToDiorama}
                onMouseEnter={() => soundEngine.playHover()}
              >
                Kutch
              </button>
            </li>
          </ul>

          <ul className="nav-links">
            <li>
              <button
                onClick={goToDiorama}
                onMouseEnter={() => soundEngine.playHover()}
              >
                3D Diorama
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  soundEngine.playModalOpen();
                  onOpenCulture();
                }}
                onMouseEnter={() => soundEngine.playHover()}
              >
                Culture
              </button>
            </li>
          </ul>
        </nav>

        {/* Giant Title: Pure Editorial Typography Elevated in the Twilight Sky */}
        <div ref={giantTitleRef} className="giant-title">
          <div className="title-eyebrow">
            <span className="title-eyebrow-line" />
            <span>GUJARAT, INDIA • 23.83° N, 70.03° E</span>
            <span className="title-eyebrow-line" />
          </div>
          <h1 className="title-hero">
            GREAT RANN OF KUTCH
          </h1>
          <span className="title-sub">
            THE BREATHING DESERT
          </span>
        </div>

        {/* Bottom Tagline & Action Button */}
        <div ref={bottomContentRef} className="bottom-content">
          <p className="tagline">
            Where the salt desert meets infinite skies — immerse in the untamed stillness of Kutch.
          </p>
          <button 
            onClick={goToDiorama} 
            onMouseEnter={() => soundEngine.playHover()}
            className="discover-btn group"
          >
            <span>Discover</span>
            <span className="text-[10px] transform group-hover:translate-y-0.5 transition-transform duration-200">↓</span>
          </button>
        </div>
      </section>

      {/* ========================================================
          SLAB 2: KUTCH 3D REALITY DIORAMA (Pinned 100vh Slab)
          (Central Map with 5 Acts - Zero Halfway Scrolling!)
      ======================================================== */}
      <div
        className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${
          currentSlab === 'diorama' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
        }`}
      >
        <KutchRealityDioramaView
          onGoToHero={goToHero}
          onSelectAct={(actId) => {
            if (actId === 'act-1') {
              setActiveActView('act-1');
            }
          }}
          onReturnToOrbit={handleReturn}
        />
      </div>

      {/* ========================================================
          CINEMATIC BLACK CROSS-FADE OVERLAY BETWEEN SLABS
      ======================================================== */}
      <div
        className="fixed inset-0 z-40 bg-[#030508] pointer-events-none transition-opacity duration-600 ease-in-out"
        style={{
          opacity: isSlabTransitioning ? 1 : 0,
          visibility: isSlabTransitioning ? 'visible' : 'hidden'
        }}
      />

      {/* ========================================================
          DEDICATED SEPARATE PAGE FOR ACT 1 (SILENCE)
          (Contains Act-1 Hero Video + Radar Showcase just below it)
      ======================================================== */}
      {activeActView === 'act-1' && (
        <div className="fixed inset-0 z-50 w-screen h-screen">
          <KutchAct1View
            onBackToDiorama={() => setActiveActView(null)}
            onReturnToOrbit={handleReturn}
          />
        </div>
      )}
    </div>
  );
}
