import React, { useState } from 'react';
import { soundEngine } from '../utils/audio';

// The 5 Acts of the Great Rann of Kutch
// Precise coordinate geometry: anchors on island surface & clear offset labels
const ACTS_DATA = [
  {
    id: 'act-1',
    actNumber: 'ACT I',
    title: 'SILENCE',
    subtitle: 'THE INFINITE WHITE HALITE DESERT',
    detail: '7,505 SQ KM PURE CRYSTALLINE MINERAL CRUST',
    // Anchor on the island (% of island container)
    anchor: { x: 26, y: 46 },
    // Leader line in viewBox 0 0 100 100
    // Starts at anchor (26, 46) -> angles left-up to (14, 38) -> horizontal to (0, 38)
    linePoints: 'M 26 46 L 14 38 L 0 38',
    side: 'left',
    labelPos: { top: '33%', left: '2%' },
    isAct1: true
  },
  {
    id: 'act-2',
    actNumber: 'ACT II',
    title: 'THE LAGOON',
    subtitle: 'HYPERSALINE TIDAL SANCTUARY',
    detail: 'VITAL INLET & CRADLE FOR 50,000+ GREATER FLAMINGOS',
    anchor: { x: 72, y: 53 },
    // Starts at anchor (72, 53) -> angles right-down to (86, 64) -> horizontal to (100, 64)
    linePoints: 'M 72 53 L 86 64 L 100 64',
    side: 'right',
    labelPos: { top: '59%', right: '2%' },
    isAct1: false
  },
  {
    id: 'act-3',
    actNumber: 'ACT III',
    title: 'THE PASSAGE',
    subtitle: 'NOMADIC CAMEL CARAVAN',
    detail: 'ANCIENT DROMEDARY & KHARAI TRADE ROUTE',
    anchor: { x: 52, y: 45 },
    // Starts at anchor (52, 45) -> angles right-up to (66, 32) -> horizontal to (100, 32)
    linePoints: 'M 52 45 L 66 32 L 100 32',
    side: 'right',
    labelPos: { top: '27%', right: '2%' },
    isAct1: false
  },
  {
    id: 'act-4',
    actNumber: 'ACT IV',
    title: 'THE BHUNGA',
    subtitle: 'RABARI EARTHEN ARCHITECTURE',
    detail: 'EARTHQUAKE-RESISTANT CYLINDRICAL MUD & LIPPAN ART',
    anchor: { x: 47, y: 18 },
    // Starts at anchor (47, 18) -> angles left-up to (32, 10) -> horizontal to (0, 10)
    linePoints: 'M 47 18 L 32 10 L 0 10',
    side: 'left',
    labelPos: { top: '5%', left: '3%' },
    isAct1: false
  },
  {
    id: 'act-5',
    actNumber: 'ACT V',
    title: 'THE FOUNDATION',
    subtitle: 'SUBTERRANEAN TECTONIC BEDROCK',
    detail: 'GEOLOGICAL CRUST & ROOTS OVER ARABIAN SEA BRINE',
    anchor: { x: 44, y: 84 },
    // Starts at anchor (44, 84) -> angles left-down to (30, 92) -> horizontal to (0, 92)
    linePoints: 'M 44 84 L 30 92 L 0 92',
    side: 'left',
    labelPos: { bottom: '3%', left: '3%' },
    isAct1: false
  }
];

export default function KutchRealityDioramaView({ onSelectAct, onGoToHero, onReturnToOrbit }) {
  const [hoveredAct, setHoveredAct] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Trigger smooth cinematic black fade-out before opening Act-1 (silent transition)
  const handleActClick = (act) => {
    if (isTransitioning) return;

    if (act.id === 'act-1') {
      setIsTransitioning(true);
      setTimeout(() => {
        if (onSelectAct) {
          onSelectAct('act-1');
        }
        setTimeout(() => {
          setIsTransitioning(false);
        }, 150);
      }, 650);
    }
  };

  return (
    <section
      id="sx-kutch-reality-section"
      className="relative w-full min-h-screen bg-[#030508] text-[#f8fafc] font-['Montserrat',sans-serif] overflow-hidden select-none flex flex-col justify-between p-4 sm:p-7 md:p-10"
    >
      <style>{`
        /* Fine Cartography Micro-Grid */
        .sx-tech-grid-dark {
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 70px 70px;
        }

        /* Act-1 Beacon Pulse Animation (Magnetic Visual Attraction) */
        @keyframes sx-act1-ring {
          0% {
            transform: translate(-50%, -50%) scale(0.85);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2.6);
            opacity: 0;
          }
        }

        .sx-beacon-ring {
          position: absolute;
          width: 22px;
          height: 22px;
          border-radius: 999px;
          border: 1.5px solid #38bdf8;
          animation: sx-act1-ring 2.2s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
          pointer-events: none;
        }

        .sx-beacon-ring-delayed {
          animation-delay: 1.1s;
        }

        /* Technical Pointer Square Box matching reference: [ ■ ] */
        .sx-pointer-box {
          position: absolute;
          width: 15px;
          height: 15px;
          border: 1.5px solid rgba(255, 255, 255, 0.85);
          background: rgba(3, 5, 8, 0.92);
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
          box-shadow: 0 0 16px rgba(56, 189, 248, 0.9);
          transform: translate(-50%, -50%) scale(1.3);
        }

        .sx-pointer-box:hover::after, .sx-pointer-box.active::after {
          background: #38bdf8;
        }

        /* Special Active Attraction for Act-1 */
        .sx-pointer-box.act1-highlight {
          border-color: #38bdf8;
          box-shadow: 0 0 14px rgba(56, 189, 248, 0.7);
        }
        .sx-pointer-box.act1-highlight::after {
          background: #38bdf8;
        }

        /* Leader Line SVG Styling */
        .sx-leader-line {
          stroke: rgba(255, 255, 255, 0.35);
          stroke-width: 1.25;
          fill: none;
          transition: stroke 0.3s ease, stroke-width 0.3s ease;
        }

        .sx-leader-line.active {
          stroke: #38bdf8;
          stroke-width: 2.0;
          filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.9));
        }

        .sx-leader-line.act1-idle {
          stroke: rgba(56, 189, 248, 0.65);
          stroke-dasharray: 4, 3;
          animation: sx-line-flow 16s linear infinite;
        }

        @keyframes sx-line-flow {
          to { stroke-dashoffset: -100; }
        }
      `}</style>

      {/* Atmospheric Background & Cartographic Micro-Grid */}
      <div className="absolute inset-0 pointer-events-none z-0 sx-tech-grid-dark" />
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(20, 32, 54, 0.28) 0%, rgba(3, 5, 8, 0.98) 75%)'
        }}
      />

      {/* Hairline Corner & Center Crosshairs (+) */}
      <div className="absolute top-8 left-8 text-[11px] font-mono text-white/20 pointer-events-none">+</div>
      <div className="absolute top-8 right-8 text-[11px] font-mono text-white/20 pointer-events-none">+</div>
      <div className="absolute bottom-8 left-8 text-[11px] font-mono text-white/20 pointer-events-none">+</div>
      <div className="absolute bottom-8 right-8 text-[11px] font-mono text-white/20 pointer-events-none">+</div>

      {/* ========================================================
          1. MINIMALIST TOP HEADER
      ======================================================== */}
      <header className="relative z-20 flex items-center justify-between gap-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="font-['Cinzel',serif] text-sm sm:text-base md:text-lg font-semibold tracking-[0.22em] uppercase text-white">
            GREAT RANN OF KUTCH
          </span>
          <span className="text-[9.5px] font-mono tracking-widest text-cyan-400/70 uppercase hidden sm:inline">
            // 5 ACTS CARTOGRAPHY
          </span>
        </div>

        <div className="flex items-center gap-4 text-[9px] font-mono tracking-widest uppercase text-white/60">
          <span className="hidden md:inline">23.83° N, 70.03° E • GUJARAT</span>
          {onGoToHero && (
            <button
              onClick={onGoToHero}
              onMouseEnter={() => soundEngine.playHover()}
              className="px-4 py-1.5 rounded-full border border-white/20 bg-white/[0.04] hover:bg-white/[0.12] text-[9.5px] font-mono tracking-widest uppercase text-white transition-all cursor-pointer"
            >
              ↑ Hero
            </button>
          )}
          {onReturnToOrbit && (
            <button
              onClick={onReturnToOrbit}
              onMouseEnter={() => soundEngine.playHover()}
              className="px-4 py-1.5 rounded-full border border-white/20 bg-white/[0.04] hover:bg-white/[0.12] text-[9.5px] font-mono tracking-widest uppercase text-white transition-all cursor-pointer"
            >
              ← Orbit
            </button>
          )}
        </div>
      </header>

      {/* ========================================================
          2. CENTER STAGE: FIXED 3D ISLAND & 5 ACT LEADER LINES
          (Island is completely rock-solid fixed, ZERO mouse tilt!)
      ======================================================== */}
      <div className="relative z-10 flex-1 flex items-center justify-center w-full max-w-6xl mx-auto my-auto min-h-[580px] sm:min-h-[640px]">
        
        {/* Island Stage: Scaled appropriately with generous margins for texts */}
        <div className="relative w-full max-w-[620px] aspect-[1126/914] flex items-center justify-center">
          
          {/* Smooth Soft Vector Ambient Shadow (Zero blocky glitches!) */}
          <div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[68%] h-12 rounded-[100%] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(0, 0, 0, 0.80) 0%, transparent 70%)',
              filter: 'blur(12px)'
            }}
          />

          {/* Central 3D Island Image (Fixed, Rock-Solid, Unchanged!) */}
          <img
            src="/assets/kutch_island_3d.png"
            alt="Great Rann of Kutch 3D Diorama Island"
            className="w-full h-full object-contain pointer-events-none drop-shadow-[0_20px_45px_rgba(0,0,0,0.8)] select-none"
            draggable={false}
          />

          {/* ========================================================
              FULL-STAGE VECTOR SVG FOR 5-ACT LEADER LINES
          ======================================================== */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-25 overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {ACTS_DATA.map((act) => {
              const isSelected = hoveredAct === act.id;
              const isAct1 = act.isAct1;

              return (
                <path
                  key={act.id}
                  d={act.linePoints}
                  className={`sx-leader-line ${isSelected ? 'active' : ''} ${
                    isAct1 && !isSelected ? 'act1-idle' : ''
                  }`}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>

          {/* ========================================================
              POINTER SQUARE BOXES [ ■ ] ANCHORED ON THE ISLAND
          ======================================================== */}
          {ACTS_DATA.map((act) => {
            const isSelected = hoveredAct === act.id;
            const isAct1 = act.isAct1;

            return (
              <div
                key={act.id}
                onClick={() => handleActClick(act)}
                onMouseEnter={() => {
                  soundEngine.playHover();
                  setHoveredAct(act.id);
                }}
                onMouseLeave={() => setHoveredAct(null)}
                className={`sx-pointer-box ${isSelected ? 'active' : ''} ${
                  isAct1 ? 'act1-highlight' : ''
                }`}
                style={{
                  left: `${act.anchor.x}%`,
                  top: `${act.anchor.y}%`
                }}
                title={isAct1 ? 'Click to enter Act I: Silence' : act.title}
              >
                {/* Magnetic Beacon Pulsing Rings for Act-1 */}
                {isAct1 && (
                  <>
                    <span className="sx-beacon-ring" />
                    <span className="sx-beacon-ring sx-beacon-ring-delayed" />
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* ========================================================
            5-ACT TEXT LABELS (Offset Cleanly in 5 Quadrants with Zero Overlap)
        ======================================================== */}
        {ACTS_DATA.map((act) => {
          const isSelected = hoveredAct === act.id;
          const isLeft = act.side === 'left';
          const isAct1 = act.isAct1;

          return (
            <div
              key={`label-${act.id}`}
              onClick={() => handleActClick(act)}
              onMouseEnter={() => {
                soundEngine.playHover();
                setHoveredAct(act.id);
              }}
              onMouseLeave={() => setHoveredAct(null)}
              className={`absolute z-30 transition-all duration-300 max-w-[310px] sm:max-w-[340px] ${
                isLeft ? 'text-left' : 'text-right'
              } ${isAct1 ? 'cursor-pointer group' : 'cursor-default'}`}
              style={{
                ...act.labelPos,
                transform: isSelected ? 'translateY(-2px)' : 'translateY(0)'
              }}
            >
              {/* Header Pill & Act Tag */}
              <div
                className={`flex items-center gap-2 mb-1 ${
                  isLeft ? 'justify-start' : 'justify-end'
                }`}
              >
                {isLeft && (
                  <span
                    className={`w-2 h-2 rounded-full transition-colors ${
                      isAct1
                        ? 'bg-cyan-400 animate-pulse shadow-[0_0_10px_#38bdf8]'
                        : isSelected
                        ? 'bg-cyan-400'
                        : 'bg-white/40'
                    }`}
                  />
                )}

                <span
                  className={`font-mono text-[9px] sm:text-[10px] tracking-[0.26em] font-bold uppercase transition-colors ${
                    isAct1
                      ? 'text-cyan-300 group-hover:text-cyan-200'
                      : isSelected
                      ? 'text-cyan-300'
                      : 'text-white/60'
                  }`}
                >
                  {act.actNumber} // {act.title}
                </span>

                {!isLeft && (
                  <span
                    className={`w-2 h-2 rounded-full transition-colors ${
                      isSelected ? 'bg-cyan-400' : 'bg-white/40'
                    }`}
                  />
                )}

                {/* Pulsing Visual Attraction Badge for Act 1 */}
                {isAct1 && (
                  <span className="px-2 py-0.5 rounded-full text-[7.5px] font-mono tracking-widest uppercase bg-cyan-950/80 border border-cyan-400/60 text-cyan-300 animate-pulse ml-1 shadow-[0_0_12px_rgba(56,189,248,0.35)]">
                    CLICK TO ENTER →
                  </span>
                )}
              </div>

              {/* Main Subtitle */}
              <div
                className={`font-['Cinzel',serif] text-xs sm:text-sm font-semibold tracking-wider uppercase transition-colors ${
                  isAct1
                    ? 'text-white group-hover:text-cyan-100 drop-shadow-[0_2px_12px_rgba(56,189,248,0.4)]'
                    : isSelected
                    ? 'text-white'
                    : 'text-white/90'
                }`}
                style={{ textShadow: '0 2px 14px rgba(0,0,0,0.95)' }}
              >
                {act.subtitle}
              </div>

              {/* Detail Line */}
              <div
                className="font-mono text-[8px] sm:text-[8.5px] tracking-widest text-white/50 uppercase mt-0.5 leading-relaxed"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.95)' }}
              >
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
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>CENTRAL 5-ACTS MAP // SELECT ACT-I TO EXPLORE</span>
        </div>
        <div className="flex items-center gap-4">
          <span>THE BREATHING DESERT</span>
          <span>•</span>
          <span>GUJARAT, INDIA</span>
        </div>
      </footer>

      {/* ========================================================
          CINEMATIC BLACK FADE OUT OVERLAY
      ======================================================== */}
      <div
        className="fixed inset-0 z-50 bg-[#030508] pointer-events-none transition-opacity duration-600 ease-in-out"
        style={{
          opacity: isTransitioning ? 1 : 0,
          visibility: isTransitioning ? 'visible' : 'hidden'
        }}
      />
    </section>
  );
}
