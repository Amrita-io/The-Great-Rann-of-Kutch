import React, { useState, useEffect, useCallback } from 'react';
import { soundEngine } from '../utils/audio';

// 5 Acts Cartography Data with Authentic Geography & Cultural Narratives
const ACTS_DATA = [
  {
    id: 'act-1',
    actNumber: 'ACT I',
    code: '01',
    title: 'SILENCE',
    subtitle: 'THE INFINITE WHITE HALITE DESERT',
    detail: '7,505 SQ KM PURE CRYSTALLINE MINERAL CRUST',
    description:
      'A blinding expanse of pure salt where horizon and sky blur into one. Under the lunar glow, silence becomes a tangible presence reflecting 82% of cosmic radiation.',
    accentColor: '#38bdf8', // Electric Arctic Cyan
    accentGlow: 'rgba(56, 189, 248, 0.45)',
    loupeImg: '/assets/layers/act1_winter_dry.webp',
    anchor: { x: 456, y: 339 },
    linePoints: '456,339 310,280 60,280',
    side: 'left',
    textX: 60,
    textY: 175,
    textWidth: 380,
    textHeight: 100,
    isAct1: true
  },
  {
    id: 'act-2',
    actNumber: 'ACT II',
    code: '02',
    title: 'THE LAGOON',
    subtitle: 'HYPERSALINE TIDAL SANCTUARY',
    detail: 'VITAL INLET & CRADLE FOR 50,000+ GREATER FLAMINGOS',
    description:
      'Where Arabian Sea tides surge into the salt pan, transforming barren flats into pink shimmering breeding lagoons for massive colonies of migratory flamingos.',
    accentColor: '#34d399', // Emerald Cyan
    accentGlow: 'rgba(52, 211, 153, 0.45)',
    loupeImg: '/assets/layers/act2_peak_flood.webp',
    anchor: { x: 732, y: 373 },
    linePoints: '732,373 840,460 1140,460',
    side: 'right',
    textX: 760,
    textY: 355,
    textWidth: 380,
    textHeight: 100,
    isAct1: false
  },
  {
    id: 'act-3',
    actNumber: 'ACT III',
    code: '03',
    title: 'THE PASSAGE',
    subtitle: 'NOMADIC CAMEL CARAVAN',
    detail: 'ANCIENT DROMEDARY & KHARAI TRADE ROUTE',
    description:
      'For centuries, Rabari and Jat pastoralists have navigated these treacherous salt wastes guided only by celestial stars and Kharai swimming camels.',
    accentColor: '#fbbf24', // Warm Desert Amber
    accentGlow: 'rgba(251, 191, 36, 0.45)',
    loupeImg: '/assets/wild_ass_herd.jpg',
    anchor: { x: 618, y: 334 },
    linePoints: '618,334 780,240 1140,240',
    side: 'right',
    textX: 760,
    textY: 135,
    textWidth: 380,
    textHeight: 100,
    isAct1: false
  },
  {
    id: 'act-4',
    actNumber: 'ACT IV',
    code: '04',
    title: 'THE BHUNGA',
    subtitle: 'RABARI EARTHEN ARCHITECTURE',
    detail: 'EARTHQUAKE-RESISTANT CYLINDRICAL MUD & LIPPAN ART',
    description:
      'Aerodynamic cylindrical clay architecture engineered to deflect ferocious desert dust storms and withstand high-magnitude tremors, adorned with sacred Lippan mirror craft.',
    accentColor: '#fb923c', // Warm Terracotta Ochre
    accentGlow: 'rgba(251, 146, 60, 0.45)',
    loupeImg: '/assets/bhunga_real_photo.jpg',
    anchor: { x: 582, y: 202 },
    linePoints: '582,202 360,95 60,95',
    side: 'left',
    textX: 60,
    textY: 5,
    textWidth: 380,
    textHeight: 90,
    isAct1: false
  },
  {
    id: 'act-5',
    actNumber: 'ACT V',
    code: '05',
    title: 'THE FOUNDATION',
    subtitle: 'TECTONIC BEDROCK & ALLAH BUND SCARP',
    detail: 'GEOLOGICAL CRUST & ROOTS FLOATING OVER ARABIAN SEA BRINE',
    description:
      'A 50–90 km active surface fault scarp where the 1819 Mw 7.7–8.2 earthquake dammed the Nara and Puran rivers with 2–6 m of vertical relief (Bilham et al., 2007; SciRep 2024).',
    accentColor: '#c084fc', // Holographic Amethyst
    accentGlow: 'rgba(192, 132, 252, 0.45)',
    loupeImg: '/assets/layers/nisar_october_hh_true.webp',
    anchor: { x: 564, y: 524 },
    linePoints: '564,524 564,630 60,630',
    side: 'left',
    textX: 60,
    textY: 530,
    textWidth: 420,
    textHeight: 95,
    isAct1: false
  }
];

export default function KutchRealityDioramaView({ onSelectAct, onGoToHero, onReturnToOrbit }) {
  const [activeActId, setActiveActId] = useState('act-1');
  const [hoveredAct, setHoveredAct] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Background atmosphere music verification
  useEffect(() => {
    soundEngine.playBreathOfTheRann(0.22);
  }, []);

  const activeActIndex = ACTS_DATA.findIndex((a) => a.id === activeActId);
  const selectedAct = ACTS_DATA.find((a) => a.id === (hoveredAct || activeActId)) || ACTS_DATA[0];

  // Navigate between acts
  const handleSelectAct = useCallback((actId) => {
    soundEngine.playClick();
    setActiveActId(actId);
  }, []);

  // Primary Action: Start Act
  const handleStartAct = useCallback(() => {
    soundEngine.playClick();
    setIsTransitioning(true);
    setTimeout(() => {
      if (onSelectAct) {
        onSelectAct('act-1');
      }
      setTimeout(() => {
        setIsTransitioning(false);
      }, 150);
    }, 650);
  }, [onSelectAct]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        const nextIdx = (activeActIndex + 1) % ACTS_DATA.length;
        handleSelectAct(ACTS_DATA[nextIdx].id);
      } else if (e.key === 'ArrowLeft') {
        const prevIdx = (activeActIndex - 1 + ACTS_DATA.length) % ACTS_DATA.length;
        handleSelectAct(ACTS_DATA[prevIdx].id);
      } else if (e.key === 'Enter' || e.key === ' ') {
        handleStartAct();
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const targetAct = ACTS_DATA[parseInt(e.key, 10) - 1];
        if (targetAct) handleSelectAct(targetAct.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeActIndex, handleSelectAct, handleStartAct]);

  return (
    <section
      id="sx-kutch-reality-section"
      className="relative w-full h-screen min-h-[680px] bg-[#030610] text-[#f8fafc] font-sans overflow-hidden select-none flex flex-col justify-between"
    >
      <style>{`
        /* STRICT ZERO FILL GUARANTEE ON ALL SVG LINES */
        polyline, path {
          fill: none !important;
        }

        /* Cartography Micro-Grid */
        .sx-carto-grid {
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 72px 72px;
        }

        /* Floating Island Levitation in Air */
        @keyframes sx-island-float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-9px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        .sx-floating-island {
          animation: sx-island-float 6.5s ease-in-out infinite;
        }

        /* Ground Pedestal Counter-Pulse */
        @keyframes sx-pedestal-breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 0.45;
          }
          50% {
            transform: scale(0.96);
            opacity: 0.30;
          }
        }

        .sx-pedestal-shadow {
          transform-origin: 600px 515px;
          animation: sx-pedestal-breathe 6.5s ease-in-out infinite;
        }

        /* Sonar Beacon Pulse Rings for Act 1 */
        @keyframes sx-act1-sonar {
          0% {
            r: 10px;
            opacity: 0.95;
            stroke-width: 1.5px;
          }
          100% {
            r: 34px;
            opacity: 0;
            stroke-width: 0.5px;
          }
        }

        .sx-beacon-ring {
          animation: sx-act1-sonar 2.4s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
        }
        .sx-beacon-ring-delayed {
          animation: sx-act1-sonar 2.4s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
          animation-delay: 1.2s;
        }

        /* Smooth, Natural Act Cross-fade Transition */
        @keyframes sx-act-crossfade {
          0% {
            opacity: 0;
            transform: translateY(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0px);
          }
        }

        .sx-act-fade {
          animation: sx-act-crossfade 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Sleek Minimalist Pill Button */
        .sx-sleek-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 1.8rem;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          background: rgba(10, 16, 28, 0.45);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          color: rgba(255, 255, 255, 0.95);
          font-family: 'Inter', sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        }

        .sx-sleek-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.65);
          color: #ffffff;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 255, 255, 0.12);
          transform: translateY(-1px);
        }

        .sx-sleek-btn:active {
          transform: translateY(0);
        }
      `}</style>

      {/* Atmospheric Background & Cartographic Mesh */}
      <div className="absolute inset-0 pointer-events-none z-0 sx-carto-grid" />
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 46% 48%, rgba(14, 34, 68, 0.40) 0%, rgba(8, 20, 42, 0.22) 45%, #030610 82%)'
        }}
      />

      {/* Corner Reticles */}
      <div className="absolute top-5 left-6 w-3 h-3 border-t border-l border-white/20 pointer-events-none" />
      <div className="absolute top-5 right-6 w-3 h-3 border-t border-r border-white/20 pointer-events-none" />
      <div className="absolute bottom-5 left-6 w-3 h-3 border-b border-l border-white/20 pointer-events-none" />
      <div className="absolute bottom-5 right-6 w-3 h-3 border-b border-r border-white/20 pointer-events-none" />

      {/* ========================================================
          2. MINIMALIST TOP HEADER (MATCHING REFERENCE IMAGE)
      ======================================================== */}
      <header className="relative z-30 flex items-center justify-between gap-6 px-8 pt-7 pb-2 font-sans text-xs tracking-[0.25em] uppercase text-white/70">
        {/* Left: Return & Branding */}
        <div className="flex items-center gap-6 sm:gap-8">
          {onGoToHero && (
            <button
              onClick={onGoToHero}
              onMouseEnter={() => soundEngine.playHover()}
              className="text-white/70 hover:text-white transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>← RETURN</span>
            </button>
          )}
          <span className="text-white/25 hidden sm:inline">|</span>
          <span className="font-['Cinzel',serif] tracking-[0.22em] text-white/90 hidden sm:inline">
            GREAT RANN OF KUTCH
          </span>
        </div>

        {/* Center: Minimalist Chapter Text Links (Pure Typography) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {ACTS_DATA.map((act) => {
            const isSelected = activeActId === act.id;
            return (
              <button
                key={act.id}
                onClick={() => handleSelectAct(act.id)}
                onMouseEnter={() => {
                  soundEngine.playHover();
                  setHoveredAct(act.id);
                }}
                onMouseLeave={() => setHoveredAct(null)}
                className={`relative py-1 transition-all duration-200 cursor-pointer text-[11px] tracking-[0.22em] font-medium uppercase ${isSelected ? 'text-white' : 'text-white/45 hover:text-white/80'
                  }`}
              >
                <span>{act.code} {act.title}</span>
                {isSelected && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[1.5px] rounded-full transition-all duration-300"
                    style={{ backgroundColor: act.accentColor, boxShadow: `0 0 8px ${act.accentColor}` }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Orbit Return */}
        <div className="flex items-center gap-6">
          {onReturnToOrbit && (
            <button
              onClick={onReturnToOrbit}
              onMouseEnter={() => soundEngine.playHover()}
              className="text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              ORBIT →
            </button>
          )}
        </div>
      </header>

      {/* ========================================================
          3. MAIN STAGE: FLOATING 3D ISLAND + REFINED EDITORIAL RIGHT BOX
      ======================================================== */}
      <div className="relative z-10 flex-1 min-h-0 w-full max-w-[1640px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8 px-4 lg:px-8 py-1">

        {/* ========================================================
            LEFT/CENTER CANVAS: FLOATING ISLAND & DOTTED LEADER LINES
        ======================================================== */}
        <div className="relative flex-1 min-w-0 w-full h-full flex items-center justify-center">
          <svg
            viewBox="0 0 1200 750"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full max-h-[76vh] overflow-visible select-none"
          >
            <defs>
              <linearGradient id="pedestal-radial" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(56, 189, 248, 0.35)" />
                <stop offset="50%" stopColor="rgba(14, 165, 233, 0.08)" />
                <stop offset="100%" stopColor="rgba(56, 189, 248, 0.0)" />
              </linearGradient>
            </defs>

            {/* Grounding Holographic Pedestal & Ellipses */}
            <g className="sx-pedestal-shadow" opacity="0.45" pointerEvents="none">
              <ellipse cx="600" cy="515" rx="370" ry="118" fill="none" stroke="rgba(255, 255, 255, 0.07)" strokeWidth="1" strokeDasharray="6 6" />
              <ellipse cx="600" cy="515" rx="285" ry="90" fill="none" stroke="url(#pedestal-radial)" strokeWidth="1.5" />
              <ellipse cx="600" cy="515" rx="195" ry="62" fill="none" stroke="rgba(56, 189, 248, 0.16)" strokeWidth="1" />
              <line x1="230" y1="515" x2="350" y2="515" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
              <line x1="850" y1="515" x2="970" y2="515" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
              <text x="600" y="390" textAnchor="middle" fill="rgba(255, 255, 255, 0.28)" fontSize="8.5" fontFamily="monospace" letterSpacing="2">N 000°</text>
              <text x="985" y="518" textAnchor="start" fill="rgba(255, 255, 255, 0.28)" fontSize="8.5" fontFamily="monospace" letterSpacing="2">E 090°</text>
              <text x="600" y="645" textAnchor="middle" fill="rgba(255, 255, 255, 0.28)" fontSize="8.5" fontFamily="monospace" letterSpacing="2">S 180°</text>
              <text x="215" y="518" textAnchor="end" fill="rgba(255, 255, 255, 0.28)" fontSize="8.5" fontFamily="monospace" letterSpacing="2">W 270°</text>
            </g>

            {/* Central 3D Island Artwork - Floating in Air (Non-Interactive) */}
            <g className="sx-floating-island" pointerEvents="none">
              <image
                href="/assets/layers/act3_october_nisar.webp"
                xlinkHref="/assets/layers/act3_october_nisar.webp"
                x="300"
                y="115"
                width="600"
                height="487"
                preserveAspectRatio="xMidYMid meet"
                className="rounded-3xl opacity-90"
              />
            </g>

            {/* ========================================================
                DOTTED & HIGHLIGHTED LEADER LINES (KEEPING ALL PRECISE LINES!)
            ======================================================== */}
            {ACTS_DATA.map((act) => {
              const isSelected = activeActId === act.id;
              const isHovered = hoveredAct === act.id;
              const isHighlighted = isSelected || isHovered;

              return (
                <polyline
                  key={`line-${act.id}`}
                  points={act.linePoints}
                  fill="none"
                  stroke={isHighlighted ? act.accentColor : 'rgba(255, 255, 255, 0.38)'}
                  strokeWidth={isHighlighted ? '2' : '1.1'}
                  strokeDasharray={isHighlighted ? 'none' : '4 3'}
                  style={{
                    transition: 'stroke 0.25s ease, stroke-width 0.25s ease, filter 0.25s ease',
                    filter: isHighlighted ? `drop-shadow(0 0 6px ${act.accentColor})` : 'none'
                  }}
                />
              );
            })}

            {/* ========================================================
                ISLAND ANCHORS & BEACONS (Non-Interactive, Visual Pinning)
            ======================================================== */}
            {ACTS_DATA.map((act) => {
              const isSelected = activeActId === act.id;
              const isHovered = hoveredAct === act.id;
              const isHighlighted = isSelected || isHovered;
              const isAct1 = act.isAct1;
              const x = act.anchor.x;
              const y = act.anchor.y;

              return (
                <g key={`anchor-${act.id}`} pointerEvents="none">
                  {/* Outer Reticle Halo Ring */}
                  <circle
                    cx={x}
                    cy={y}
                    r="9"
                    fill="#030610"
                    stroke={isHighlighted ? act.accentColor : 'rgba(255, 255, 255, 0.75)'}
                    strokeWidth="1.5"
                    style={{
                      transition: 'all 0.25s ease',
                      filter: isHighlighted ? `drop-shadow(0 0 8px ${act.accentColor})` : 'none'
                    }}
                  />

                  {/* Inner Core Pip */}
                  <circle
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill={isHighlighted ? act.accentColor : '#ffffff'}
                    style={{ transition: 'all 0.25s ease' }}
                  />

                  {/* Pulsating Sonar Beacon Rings for Act 1 */}
                  {isAct1 && (
                    <>
                      <circle
                        cx={x}
                        cy={y}
                        fill="none"
                        stroke="#38bdf8"
                        className="sx-beacon-ring"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        fill="none"
                        stroke="#38bdf8"
                        className="sx-beacon-ring-delayed"
                      />
                    </>
                  )}

                  {/* Expanding Halo when highlighted */}
                  {!isAct1 && isHighlighted && (
                    <circle
                      cx={x}
                      cy={y}
                      r="16"
                      fill="none"
                      stroke={act.accentColor}
                      strokeWidth="1"
                      opacity="0.6"
                      className="animate-ping"
                    />
                  )}
                </g>
              );
            })}

            {/* ========================================================
                ARCHITECTURAL CALLOUT LABELS ON CANVAS (Interactive selection)
            ======================================================== */}
            {ACTS_DATA.map((act) => {
              const isSelected = activeActId === act.id;
              const isHovered = hoveredAct === act.id;
              const isHighlighted = isSelected || isHovered;
              const isLeft = act.side === 'left';
              const isAct1 = act.isAct1;

              return (
                <foreignObject
                  key={`label-${act.id}`}
                  x={act.textX}
                  y={act.textY}
                  width={act.textWidth}
                  height={act.textHeight}
                  className="overflow-visible"
                >
                  <div
                    onClick={() => handleSelectAct(act.id)}
                    onMouseEnter={() => {
                      soundEngine.playHover();
                      setHoveredAct(act.id);
                    }}
                    onMouseLeave={() => setHoveredAct(null)}
                    className={`select-none transition-all duration-300 cursor-pointer ${isLeft ? 'text-left' : 'text-right'
                      }`}
                    style={{ pointerEvents: 'auto' }}
                  >
                    {/* Category Pill / Act Subtitle */}
                    <div
                      className={`flex items-center gap-2 mb-1 ${isLeft ? 'justify-start' : 'justify-end'
                        }`}
                    >
                      {isLeft && (
                        <span
                          className="w-2 h-2 rounded-full transition-transform duration-300"
                          style={{
                            backgroundColor: act.accentColor,
                            boxShadow: isHighlighted ? `0 0 10px ${act.accentColor}` : 'none',
                            transform: isHighlighted ? 'scale(1.3)' : 'scale(1)'
                          }}
                        />
                      )}

                      <span
                        className={`font-mono text-[10px] tracking-[0.24em] font-semibold uppercase transition-colors ${isHighlighted ? 'text-white' : 'text-white/60'
                          }`}
                      >
                        {act.actNumber} // {act.title}
                      </span>

                      {!isLeft && (
                        <span
                          className="w-2 h-2 rounded-full transition-transform duration-300"
                          style={{
                            backgroundColor: act.accentColor,
                            boxShadow: isHighlighted ? `0 0 10px ${act.accentColor}` : 'none',
                            transform: isHighlighted ? 'scale(1.3)' : 'scale(1)'
                          }}
                        />
                      )}

                      {/* Act 1 Pulse Indicator */}
                      {isAct1 && isHighlighted && (
                        <span className="px-2 py-0.5 rounded-full text-[7.5px] font-mono tracking-widest uppercase bg-cyan-950/90 border border-cyan-400/60 text-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.35)] animate-pulse ml-1 font-bold">
                          READY
                        </span>
                      )}
                    </div>

                    {/* Main Headline */}
                    <h3
                      className={`font-['Cinzel',serif] text-[13.5px] font-semibold tracking-[0.16em] uppercase transition-colors drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] leading-tight ${isHighlighted ? 'text-white' : 'text-white/80'
                        }`}
                    >
                      {act.subtitle}
                    </h3>

                    {/* Scientific Metric Caption */}
                    <p className="font-mono text-[8.5px] tracking-[0.18em] uppercase text-white/50 mt-1 leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                      {act.detail}
                    </p>
                  </div>
                </foreignObject>
              );
            })}
          </svg>
        </div>

        {/* ========================================================
            RIGHT SIDE WINDOW: CLEAN EDITORIAL CHAPTER CARD
            Consistent fixed dimensions (w-[380px] h-[500px]) across all acts
        ======================================================== */}
        <aside className="w-full lg:w-[380px] shrink-0 h-full flex flex-col justify-center">
          <div className="w-full max-w-[380px] h-[500px] flex flex-col justify-between p-6 rounded-2xl bg-[#050814]/75 backdrop-blur-2xl border border-white/12 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">

            {/* 1. Natural High-Res Photograph (Fixed Height: 168px) */}
            <div className="relative w-full h-[168px] shrink-0 rounded-xl overflow-hidden border border-white/10 group">
              <img
                key={selectedAct.loupeImg}
                src={selectedAct.loupeImg}
                alt={selectedAct.title}
                className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050814]/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 text-[9px] font-mono tracking-widest text-white/70 uppercase">
                GUJARAT, INDIA • 23.83° N, 70.03° E
              </div>
            </div>

            {/* 2. Editorial Typography with Fixed-Height Slots (Zero Layout Shift) */}
            <div key={selectedAct.id} className="sx-act-fade flex flex-col justify-between flex-1 py-1">

              {/* Eyebrow: Fixed Height 20px */}
              <div className="h-5 flex items-center">
                <span
                  className="text-[10px] font-mono tracking-[0.28em] font-semibold uppercase transition-colors"
                  style={{ color: selectedAct.accentColor }}
                >
                  {selectedAct.actNumber} // {selectedAct.title}
                </span>
              </div>

              {/* Title: Fixed Height 50px (Accommodates 1 or 2 lines cleanly) */}
              <div className="h-[50px] flex items-center">
                <h3 className="font-['Cinzel',serif] text-base sm:text-[17px] font-normal tracking-[0.14em] text-white leading-snug">
                  {selectedAct.subtitle}
                </h3>
              </div>

              {/* Description: Fixed Height 62px (Uniform 3 lines) */}
              <div className="h-[62px] flex items-start">
                <p className="text-xs text-white/65 font-sans leading-relaxed line-clamp-3 font-light">
                  {selectedAct.description}
                </p>
              </div>

              {/* Detail Metadata: Fixed Height 26px */}
              <div className="border-t border-white/10 pt-2 h-[26px] flex items-center">
                <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-white/50 truncate w-full">
                  {selectedAct.detail}
                </p>
              </div>
            </div>

            {/* 3. Minimalist Stepper & Sleek Start Act Action (Fixed Height: 46px) */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 shrink-0 h-[46px]">
              <div className="flex items-center gap-3 font-mono text-[10px] tracking-widest text-white/40">
                <span>{selectedAct.code} / 05</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const prevIdx = (activeActIndex - 1 + ACTS_DATA.length) % ACTS_DATA.length;
                      handleSelectAct(ACTS_DATA[prevIdx].id);
                    }}
                    onMouseEnter={() => soundEngine.playHover()}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Previous"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => {
                      const nextIdx = (activeActIndex + 1) % ACTS_DATA.length;
                      handleSelectAct(ACTS_DATA[nextIdx].id);
                    }}
                    onMouseEnter={() => soundEngine.playHover()}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Next"
                  >
                    →
                  </button>
                </div>
              </div>

              <button
                onClick={handleStartAct}
                onMouseEnter={() => soundEngine.playHover()}
                className="sx-sleek-btn group"
                aria-label="Start Act"
              >
                <span className="tracking-[0.25em]">START ACT</span>
                <span className="text-xs transition-transform duration-300 group-hover:translate-x-0.5">→</span>
              </button>
            </div>

          </div>
        </aside>
      </div>

      {/* ========================================================
          4. MINIMAL ARCHITECTURAL FOOTER
      ======================================================== */}
      <footer className="relative z-30 flex items-center justify-between gap-4 px-8 py-3 border-t border-white/10 text-[9px] font-mono text-white/40">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-white/70">
            {selectedAct.actNumber}: {selectedAct.subtitle}
          </span>
          <span className="text-white/30 hidden sm:inline">•</span>
          <span className="hidden sm:inline text-white/40">USE [←] [→] OR [1]–[5] TO NAVIGATE CHAPTERS</span>
        </div>
        <div className="flex items-center gap-4 text-white/50">
          <span>LAT: 23° 49' 48" N • LON: 70° 01' 48" E</span>
          <span>•</span>
          <span className="text-cyan-300/70">WGS84 EPSG:4326</span>
        </div>
      </footer>

      {/* ========================================================
          5. CINEMATIC BLACK FADE OUT OVERLAY
      ======================================================== */}
      <div
        className="fixed inset-0 z-50 bg-[#020408] pointer-events-none transition-opacity duration-600 ease-in-out"
        style={{
          opacity: isTransitioning ? 1 : 0,
          visibility: isTransitioning ? 'visible' : 'hidden'
        }}
      />
    </section>
  );
}
