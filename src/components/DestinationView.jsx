import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { soundEngine } from '../utils/audio';

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

  // Cinematic Choreography on Mount:
  // 1. Immediately stops space drone & white noise, starts authentic Kutchi ambient.
  // 2. Video auto-plays with audio synced to soundEngine.
  // 3. The text 'SAANS' appears FIRST, slowly and fully like cinematography.
  // 4. The bottom tagline and Discover button emerge.
  // 5. The menu and everything else appear AT LAST.
  useEffect(() => {
    // Stop space drones and start authentic Kutchi audio
    soundEngine.setMode('destination');

    // Sync video audio with soundEngine
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

      // Initial States: Hidden
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

      // 1. FIRST: Title emerges smoothly and majestically like an opening film title
      tl.to(giantTitleRef.current, {
        opacity: 0.95,
        scale: 1.0,
        y: 0,
        filter: 'blur(0px)',
        duration: 2.2,
        ease: 'power2.out',
        delay: 0.4
      })

      // 2. NEXT: The bottom tagline and Discover button gently rise into frame
      .to(bottomContentRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.4,
        ease: 'power2.out'
      }, "-=0.8")

      // 3. AT LAST: The navigation menu appears gracefully across the top
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
    soundEngine.playReturnSound();
    soundEngine.setMode('globe');
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.in',
      onComplete: onBackToOrbit
    });
  };

  const handleDiscoverScroll = () => {
    soundEngine.playDiscoverSound();
    const el = document.getElementById('chapter1');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      soundEngine.playModalOpen();
      onOpenItinerary();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#030508] text-[#f8fafc] font-['Montserrat',sans-serif] overflow-x-hidden selection:bg-white/20 selection:text-white"
    >
      <style>{`
        /* Pinned Fullscreen Hero Container */
        .hero-container {
          position: relative;
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
          FULLSCREEN HERO SCENE (Auto-Play Video & Cinematic Staging)
      ======================================================== */}
      <section className="hero-container">
        
        {/* Native Video: Plays Once & Holds Final Frame (No Repeat Plays!) */}
        <video
          ref={videoRef}
          src="/vid/WhatsApp%20Video%202026-11-09%20at%205.26.53%20PM.mp4"
          autoPlay
          playsInline
          muted={soundEngine.isMuted}
          className="bg-video"
          onEnded={(e) => {
            e.currentTarget.pause();
          }}
        >
          <source src="/vid/WhatsApp%20Video%202026-11-09%20at%205.26.53%20PM.mp4" type="video/mp4" />
          <source src="/vid/kutch_hero.mp4" type="video/mp4" />
        </video>

        {/* Vignette Overlay for Text Legibility */}
        <div className="vignette-overlay" />

        {/* Top Navigation Bar (Revealed AT LAST) */}
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
                onClick={handleDiscoverScroll}
                onMouseEnter={() => soundEngine.playHover()}
              >
                Kutch
              </button>
            </li>
          </ul>

          <ul className="nav-links">
            <li>
              <button
                onClick={() => {
                  soundEngine.playModalOpen();
                  onOpenItinerary();
                }}
                onMouseEnter={() => soundEngine.playHover()}
              >
                Expeditions
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
            <li>
              <button
                onClick={() => {
                  soundEngine.playModalOpen();
                  onOpenBooking();
                }}
                onMouseEnter={() => soundEngine.playHover()}
              >
                Contact
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

        {/* Bottom Tagline & Action Button (Appears Next) */}
        <div ref={bottomContentRef} className="bottom-content">
          <p className="tagline">
            Where the salt desert meets infinite skies — immerse in the untamed stillness of Kutch.
          </p>
          <button 
            onClick={handleDiscoverScroll} 
            onMouseEnter={() => soundEngine.playHover()}
            className="discover-btn group"
          >
            <span>Discover</span>
            <span className="text-[10px] transform group-hover:translate-y-0.5 transition-transform duration-200">↓</span>
          </button>
        </div>

      </section>

      {/* ========================================================
          FOLLOWING SECTION: CHAPTER I - THE INFINITE EXPANSE
      ======================================================== */}
      <section 
        id="chapter1"
        className="relative z-20 min-h-screen bg-[#03060a] flex flex-col items-center justify-center px-6 sm:px-16 py-28 text-center border-t border-white/[0.08]"
      >
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-[1px] bg-white/20" />
            <span className="text-[10px] font-sans tracking-[0.32em] uppercase text-white/50 font-normal">
              23.83° N, 70.03° E • GUJARAT, INDIA
            </span>
            <span className="w-8 h-[1px] bg-white/20" />
          </div>

          <h2 className="font-['Cinzel',serif] text-3xl sm:text-5xl lg:text-6xl text-white font-normal tracking-[0.10em] mb-6 drop-shadow-lg">
            Chapter I: The Infinite Expanse
          </h2>

          <p className="max-w-2xl text-sm sm:text-base text-slate-300/80 leading-relaxed font-light mb-14">
            An ancient arm of the Arabian Sea surrendered to the sun, leaving behind a 7,505 square-kilometer canvas of pure crystalline halite. Under the desert moon, the boundaries of time and horizons quietly dissolve.
          </p>

          {/* Minimalist 3 Expedition Cards: Architectural Frosted Glass */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
            
            {/* Card 1 */}
            <div 
              onClick={() => {
                soundEngine.playModalOpen();
                onOpenItinerary();
              }}
              onMouseEnter={() => soundEngine.playHover()}
              className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/35 hover:bg-white/[0.06] hover:shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all duration-300 cursor-pointer group"
            >
              <span className="text-[9px] tracking-[0.26em] uppercase text-white/45 font-sans block mb-2.5">
                01 • EXPEDITION
              </span>
              <h3 className="font-['Cinzel',serif] text-lg text-white mb-2 group-hover:text-slate-100 transition-colors font-medium">
                The White Desert Trail
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light mb-6">
                Traverse the vast salt crust at twilight and witness the legendary moonlit halo over Dhordo.
              </p>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/70 group-hover:text-white font-medium transition-colors">
                <span>View Itinerary</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            {/* Card 2 */}
            <div 
              onClick={() => {
                soundEngine.playModalOpen();
                onOpenCulture();
              }}
              onMouseEnter={() => soundEngine.playHover()}
              className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/35 hover:bg-white/[0.06] hover:shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all duration-300 cursor-pointer group"
            >
              <span className="text-[9px] tracking-[0.26em] uppercase text-white/45 font-sans block mb-2.5">
                02 • LIVING CRAFT
              </span>
              <h3 className="font-['Cinzel',serif] text-lg text-white mb-2 group-hover:text-slate-100 transition-colors font-medium">
                Rogan & Mirror Heritage
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light mb-6">
                Encounter 400-year-old castor oil art in Nirona and master needlework by nomadic Rabari guilds.
              </p>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/70 group-hover:text-white font-medium transition-colors">
                <span>Explore Culture</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            {/* Card 3 */}
            <div 
              onClick={() => {
                soundEngine.playModalOpen();
                onOpenBooking();
              }}
              onMouseEnter={() => soundEngine.playHover()}
              className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/35 hover:bg-white/[0.06] hover:shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all duration-300 cursor-pointer group"
            >
              <span className="text-[9px] tracking-[0.26em] uppercase text-white/45 font-sans block mb-2.5">
                03 • SANCTUARY
              </span>
              <h3 className="font-['Cinzel',serif] text-lg text-white mb-2 group-hover:text-slate-100 transition-colors font-medium">
                Royal Bhunga Living
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light mb-6">
                Circular hand-crafted mud bhungas decorated with Lippan mirror art under Bortle 1 night skies.
              </p>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/70 group-hover:text-white font-medium transition-colors">
                <span>Reserve Stay</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

          </div>

          {/* Return to Main View Link */}
          <div className="mt-20 pt-8 border-t border-white/10 w-full flex items-center justify-between text-xs text-slate-400">
            <span>© Great Rann of Kutch • The Breathing Desert</span>
            <button
              onClick={handleReturn}
              onMouseEnter={() => soundEngine.playHover()}
              className="text-white/70 hover:text-white uppercase tracking-[0.2em] text-[10px] transition-colors cursor-pointer"
            >
              Return to Orbit ↑
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
