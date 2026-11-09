import React, { useState, useRef, useCallback } from 'react';
import { soundEngine } from '../utils/audio';

// The 5 Acts of the Great Rann of Kutch
const ACTS_DATA = [
  {
    id: 'act-1',
    actNumber: 'ACT I',
    title: 'SILENCE',
    subtitle: 'THE INFINITE WHITE HALITE DESERT',
    detail: '7,505 SQ KM PURE CRYSTALLINE MINERAL CRUST',
    // Anchor position on the island (% relative to the 3D island container)
    anchor: { x: 28, y: 46 },
    // Leader line geometry and label placement
    side: 'left',
    labelPos: { top: '34%', left: '4%' },
    linePoints: 'M 28 46 L 16 38 L 4 38' // in % coordinates
  },
  {
    id: 'act-2',
    actNumber: 'ACT II',
    title: 'THE LAGOON',
    subtitle: 'HYPERSALINE TIDAL SANCTUARY',
    detail: 'VITAL INLET & CRADLE FOR 50,000+ GREATER FLAMINGOS',
    anchor: { x: 69, y: 52 },
    side: 'right',
    labelPos: { top: '56%', right: '4%' },
    linePoints: 'M 69 52 L 82 60 L 96 60'
  },
  {
    id: 'act-3',
    actNumber: 'ACT III',
    title: 'THE PASSAGE',
    subtitle: 'NOMADIC CAMEL CARAVAN',
    detail: 'ANCIENT DROMEDARY & KHARAI TRADE ROUTE',
    anchor: { x: 50, y: 46 },
    side: 'right',
    labelPos: { top: '32%', right: '4%' },
    linePoints: 'M 50 46 L 68 36 L 96 36'
  },
  {
    id: 'act-4',
    actNumber: 'ACT IV',
    title: 'THE BHUNGA',
    subtitle: 'RABARI EARTHEN ARCHITECTURE',
    detail: 'EARTHQUAKE-RESISTANT CYLINDRICAL MUD & LIPPAN ART',
    anchor: { x: 47, y: 19 },
    side: 'left',
    labelPos: { top: '12%', left: '8%' },
    linePoints: 'M 47 19 L 32 15 L 8 15'
  },
  {
    id: 'act-5',
    actNumber: 'ACT V',
    title: 'THE FOUNDATION',
    subtitle: 'SUBTERRANEAN TECTONIC BEDROCK',
    detail: 'GEOLOGICAL CRUST & ROOTS FLOATING ON ARABIAN SEA BRINE',
    anchor: { x: 44, y: 82 },
    side: 'left',
    labelPos: { bottom: '8%', left: '10%' },
    linePoints: 'M 44 82 L 30 89 L 10 89'
  }
];

export default function KutchRealityDioramaView({ onReturnToOrbit }) {
  const [activeAct, setActiveAct] = useState(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Smooth 3D perspective mouse tracking
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;

    // Subtle, elegant tilt
    const tiltX = (ny - 0.5) * -14;
    const tiltY = (nx - 0.5) * 18;
    setTilt({ x: tiltX, y: tiltY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setActiveAct(null);
  }, []);

  return (
    <section
      ref={containerRef}
      id="sx-kutch-reality-section"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full min-h-screen bg-[#030508] text-[#f8fafc] font-['Montserrat',sans-serif] overflow-hidden select-none flex flex-col justify-between p-4 sm:p-6 md:p-8"
    >
      <style>{`
        /* Fine Cartography Micro-Grid */
        .sx-tech-grid-dark {
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
          background-size: 72px 72px;
        }

        /* Subtle Ambient Island Levitation Animation */
        .sx-island-float {
          animation: sx-island-hover 6s ease-in-out infinite alternate;
        }

        @keyframes sx-island-hover {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          100% {
            transform: translateY(-14px) rotate(0.4deg);
          }
        }

        /* Technical Pointer Square Box matching reference image: [ ■ ] */
        .sx-pointer-box {
          position: absolute;
          width: 14px;
          height: 14px;
          border: 1.5px solid rgba(255, 255, 255, 0.85);
          background: rgba(3, 5, 8, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translate(-50%, -50%);
          cursor: pointer;
          transition: all 0.25s ease;
          z-index: 35;
        }

        .sx-pointer-box::after {
          content: '';
          width: 5px;
          height: 5px;
          background: #ffffff;
        }

        .sx-pointer-box:hover, .sx-pointer-box.active {
          border-color: #38bdf8;
          box-shadow: 0 0 14px rgba(56, 189, 248, 0.8);
          transform: translate(-50%, -50%) scale(1.25);
        }

        .sx-pointer-box:hover::after, .sx-pointer-box.active::after {
          background: #38bdf8;
        }

        /* Leader Line SVG Glow */
        .sx-leader-line {
          stroke: rgba(255, 255, 255, 0.45);
          stroke-width: 1.25;
          fill: none;
          transition: all 0.3s ease;
        }

        .sx-leader-line.active {
          stroke: #38bdf8;
          stroke-width: 1.75;
          filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.8));
        }
      `}</style>

      {/* Atmospheric Background Gradient & Micro-Grid */}
      <div className="absolute inset-0 pointer-events-none z-0 sx-tech-grid-dark" />
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(20, 32, 54, 0.22) 0%, rgba(3, 5, 8, 0.95) 75%)'
        }}
      />

      {/* Technical Hairline Corner Crosshairs (+) */}
      <div className="absolute top-8 left-8 text-[11px] font-mono text-white/20 pointer-events-none">+</div>
      <div className="absolute top-8 right-8 text-[11px] font-mono text-white/20 pointer-events-none">+</div>
      <div className="absolute bottom-8 left-8 text-[11px] font-mono text-white/20 pointer-events-none">+</div>
      <div className="absolute bottom-8 right-8 text-[11px] font-mono text-white/20 pointer-events-none">+</div>
      <div className="absolute top-1/2 left-6 -translate-y-1/2 text-[11px] font-mono text-white/15 pointer-events-none">+</div>
      <div className="absolute top-1/2 right-6 -translate-y-1/2 text-[11px] font-mono text-white/15 pointer-events-none">+</div>

      {/* ========================================================
          1. MINIMALIST TOP HEADER
      ======================================================== */}
      <header className="relative z-20 flex items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="font-['Cinzel',serif] text-sm sm:text-base font-semibold tracking-[0.22em] uppercase text-white">
            GREAT RANN OF KUTCH
          </span>
          <span className="text-[9.5px] font-mono tracking-widest text-white/40 uppercase hidden sm:inline">
            // 5 ACTS CARTOGRAPHY
          </span>
        </div>

        <div className="flex items-center gap-4 text-[9px] font-mono tracking-widest uppercase text-white/60">
          <span className="hidden md:inline">23.83° N, 70.03° E • GUJARAT</span>
          {onReturnToOrbit && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onReturnToOrbit();
              }}
              onMouseEnter={() => soundEngine.playHover()}
              className="px-3.5 py-1 rounded-full border border-white/20 bg-white/[0.04] hover:bg-white/[0.12] text-[9.5px] font-mono tracking-widest uppercase text-white transition-all cursor-pointer"
            >
              ← Return to Orbit
            </button>
          )}
        </div>
      </header>

      {/* ========================================================
          2. CENTER STAGE: FLOATING 3D ISLAND & 5 ACTS LEADER LINES
      ======================================================== */}
      <div
        className="relative z-10 flex-1 flex items-center justify-center w-full max-w-7xl mx-auto my-auto min-h-[580px] sm:min-h-[660px]"
        style={{ perspective: 1200 }}
      >
        {/* Responsive 3D Pivot Wrapper */}
        <div
          className="relative w-full max-w-[820px] aspect-[1126/914] flex items-center justify-center transition-transform duration-300 ease-out"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Smooth Vector Ambient Contact Shadow (No glitchy rectangular box!) */}
          <div
            className="absolute -bottom-4 sm:-bottom-8 left-1/2 -translate-x-1/2 w-[72%] h-12 rounded-[100%] bg-black/85 blur-2xl pointer-events-none"
            style={{
              transform: 'translateZ(-40px) scale(0.95)'
            }}
          />

          {/* Central 3D Floating Island Image (Unchanged, pristine cutout) */}
          <div
            className="relative w-full h-full sx-island-float select-none"
            style={{ transform: 'translateZ(10px)' }}
          >
            <img
              src="/assets/kutch_island_3d.png"
              alt="Great Rann of Kutch 5-Acts Diorama"
              className="w-full h-full object-contain pointer-events-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.7)]"
              draggable={false}
            />

            {/* Subtle Specular Sheen Layer that glides with mouse tilt */}
            <div
              className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
              style={{
                background: `radial-gradient(circle at ${50 + tilt.y * 1.6}% ${50 - tilt.x * 1.6}%, rgba(255,255,255,0.4) 0%, transparent 60%)`
              }}
            />
          </div>

          {/* ========================================================
              FULL-STAGE VECTOR SVG FOR 5-ACT LEADER LINES
          ======================================================== */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-25 overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {ACTS_DATA.map((act) => {
              const isSelected = activeAct === act.id;
              return (
                <path
                  key={act.id}
                  d={act.linePoints}
                  className={`sx-leader-line ${isSelected ? 'active' : ''}`}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>

          {/* ========================================================
              POINTER SQUARE BOXES [ ■ ] ANCHORED DIRECTLY ON THE ISLAND
          ======================================================== */}
          {ACTS_DATA.map((act) => {
            const isSelected = activeAct === act.id;
            return (
              <div
                key={act.id}
                onClick={() => {
                  soundEngine.playClick();
                  setActiveAct(isSelected ? null : act.id);
                }}
                onMouseEnter={() => {
                  soundEngine.playHover();
                  setActiveAct(act.id);
                }}
                onMouseLeave={() => setActiveAct(null)}
                className={`sx-pointer-box ${isSelected ? 'active' : ''}`}
                style={{
                  left: `${act.anchor.x}%`,
                  top: `${act.anchor.y}%`,
                  transform: `translate(-50%, -50%) translateZ(30px) scale(${isSelected ? 1.3 : 1.0})`
                }}
                title={`Inspect ${act.actNumber} - ${act.title}`}
              />
            );
          })}
        </div>

        {/* ========================================================
            5-ACT LABELS RADIATING CLEANLY AROUND THE ISLAND
        ======================================================== */}
        {ACTS_DATA.map((act) => {
          const isSelected = activeAct === act.id;
          const isLeft = act.side === 'left';

          return (
            <div
              key={`label-${act.id}`}
              onClick={() => {
                soundEngine.playClick();
                setActiveAct(isSelected ? null : act.id);
              }}
              onMouseEnter={() => {
                soundEngine.playHover();
                setActiveAct(act.id);
              }}
              onMouseLeave={() => setActiveAct(null)}
              className={`absolute z-30 transition-all duration-300 cursor-pointer ${
                isLeft ? 'text-left' : 'text-right'
              }`}
              style={{
                ...act.labelPos,
                transform: `translateY(${isSelected ? '-3px' : '0px'})`
              }}
            >
              {/* Act Header Tag */}
              <div className="flex items-center gap-2 mb-0.5">
                {isLeft && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      isSelected ? 'bg-cyan-400' : 'bg-white/40'
                    }`}
                  />
                )}
                <span
                  className={`font-mono text-[9px] sm:text-[10px] tracking-[0.28em] font-bold uppercase transition-colors ${
                    isSelected ? 'text-cyan-300' : 'text-white/60'
                  }`}
                >
                  {act.actNumber} // {act.title}
                </span>
                {!isLeft && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-colors ml-auto ${
                      isSelected ? 'bg-cyan-400' : 'bg-white/40'
                    }`}
                  />
                )}
              </div>

              {/* Primary Subtitle */}
              <div
                className={`font-['Cinzel',serif] text-xs sm:text-sm font-medium tracking-wider uppercase transition-colors ${
                  isSelected ? 'text-white' : 'text-white/90'
                }`}
              >
                {act.subtitle}
              </div>

              {/* Detail Line */}
              <div className="font-mono text-[8px] sm:text-[8.5px] tracking-widest text-white/45 uppercase mt-0.5 max-w-[280px]">
                {act.detail}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================
          3. MINIMALIST FOOTER STATUS
      ======================================================== */}
      <footer className="relative z-20 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/10 text-[9px] font-mono text-white/40">
        <div>
          THE 5 ACTS OF KUTCH • TOPOGRAPHIC ISOLATION & HALITE DIORAMA
        </div>
        <div className="flex items-center gap-4">
          <span>HOVER OR CLICK ANY ACT BOX [ ■ ] TO INSPECT</span>
          <span>•</span>
          <span>WGS 84 DATUM</span>
        </div>
      </footer>
    </section>
  );
}
