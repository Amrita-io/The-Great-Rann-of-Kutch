import React, { useState, useRef, useEffect } from 'react';
import { soundEngine } from '../utils/audio';

// 5 Key Geographic & Cultural Hotspots on the Kutch Diorama Island
const TERRAIN_ZONES = [
  {
    id: 'lagoon',
    index: '01',
    code: 'AQUATIC // BIO-RESERVE',
    title: 'Flamingo Lagoon Inlets',
    tagline: 'SHALLOW BRACKISH CHANNELS & MIGRATORY HAVEN',
    desc: 'Western coastal depression sculpted by seasonal tidal sea waters. A vital hypersaline wetland harboring over 50,000 Lesser and Greater Flamingos feeding on carotenoid-rich Artemia brine shrimp.',
    nodePos: { x: 31, y: 44 }, // % coordinate on 2:1 transparent island
    lineEnd: { x: 62, y: 32 },  // target coordinate for HUD line connection
    metrics: [
      { label: 'SALINITY', val: '45-120 PPT' },
      { label: 'SPECIES', val: 'PHOENICOPTERUS' },
      { label: 'DEPTH', val: '0.2M - 1.2M' },
      { label: 'STATUS', val: 'PROTECTED BIOME' }
    ]
  },
  {
    id: 'saltflat',
    index: '02',
    code: 'HALITE // CORE DEPOSIT',
    title: 'The Great Salt Flat',
    tagline: 'PURE CRYSTALLINE HALITE GEOMETRY',
    desc: 'The central hyper-arid plateau of hardened sodium chloride crust, formed by intense solar evaporation of an ancient arm of the Arabian Sea. Extends into an infinite celestial white horizon under starlight.',
    nodePos: { x: 50, y: 41 },
    lineEnd: { x: 62, y: 32 },
    metrics: [
      { label: 'TOTAL AREA', val: '7,505 KM²' },
      { label: 'ALBEDO', val: '0.84 HIGH' },
      { label: 'THICKNESS', val: '0.15M - 0.40M' },
      { label: 'MINERAL', val: '98% NACL' }
    ]
  },
  {
    id: 'bhunga',
    index: '03',
    code: 'HABITAT // VERNACULAR',
    title: 'Rabari Bhunga Plateau',
    tagline: 'EARTHQUAKE-RESISTANT CYLINDRICAL DWELLINGS',
    desc: 'Elevated north-eastern rock terrace hosting ancestral circular mud Bhungas with conical thatched roofs. The thick clay walls insulate against 50°C summer heat, adorned with intricate Lippan mirror relief art.',
    nodePos: { x: 68, y: 25 },
    lineEnd: { x: 62, y: 32 },
    metrics: [
      { label: 'STRUCTURE', val: 'CIRCULAR CLAY' },
      { label: 'CRAFT', val: 'LIPPAN MIRROR' },
      { label: 'GUILD', val: 'RABARI / MEGHWAL' },
      { label: 'SEISMIC', val: 'HIGH RESILIENCE' }
    ]
  },
  {
    id: 'saltbeds',
    index: '04',
    code: 'SOLAR // CRYSTALLIZATION',
    title: 'Agariya Solar Salt Pans',
    tagline: 'ARTISANAL GEOMETRIC BRINE BEDS',
    desc: 'South-eastern matrix of shallow rectangular evaporation pans bounded by raised clay dykes. Indigenous Agariya salt farmers pump underground supersaturated brine, hand-raking salt crystals under the sun.',
    nodePos: { x: 65, y: 61 },
    lineEnd: { x: 62, y: 32 },
    metrics: [
      { label: 'PROCESS', val: 'SOLAR CRUSTING' },
      { label: 'FARMERS', val: 'AGARIYA GUILDS' },
      { label: 'OUTPUT', val: 'INLAND SALT 75%' },
      { label: 'CYCLE', val: '8 MONTH HARVEST' }
    ]
  },
  {
    id: 'caravan',
    index: '05',
    code: 'CORRIDOR // ANCIENT ROUTE',
    title: 'Southern Camel Caravans',
    tagline: 'HISTORICAL NOMADIC PASSAGE',
    desc: 'Compacted arid silt and thorn-scrub ridges navigated by Dromedary camel caravans, historically carrying rock salt, natural block-printed textiles, and spices across the Rann borderlands.',
    nodePos: { x: 44, y: 58 },
    lineEnd: { x: 62, y: 32 },
    metrics: [
      { label: 'TRANSIT', val: 'CAMELUS DROMEDARIUS' },
      { label: 'TERRAIN', val: 'ARID SILT / SCRUB' },
      { label: 'ROUTE', val: 'DHORDO-KAVDA' },
      { label: 'CLIMATE', val: 'DESERT TUNDRA' }
    ]
  }
];

export default function KutchInteractiveMap({ onReturnToOrbit }) {
  const [selectedIndex, setSelectedIndex] = useState(1); // Default to Salt Flat
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [isHoveringIsland, setIsHoveringIsland] = useState(false);
  const sectionRef = useRef(null);

  const activeZone = TERRAIN_ZONES[selectedIndex];

  // Lazy Initialization: Only load and animate when user arrives at the terrain section!
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasEnteredView) {
          setHasEnteredView(true);
        }
      },
      { threshold: 0.12 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    // Custom event listener for instant activation from "Discover" click
    const handleTrigger = () => setHasEnteredView(true);
    window.addEventListener('kutch:trigger-map-reveal', handleTrigger);

    return () => {
      observer.disconnect();
      window.removeEventListener('kutch:trigger-map-reveal', handleTrigger);
    };
  }, [hasEnteredView]);

  // Keyboard navigation across regions (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!hasEnteredView) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        soundEngine.playClick();
        setSelectedIndex((prev) => (prev + 1) % TERRAIN_ZONES.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        soundEngine.playClick();
        setSelectedIndex((prev) => (prev - 1 + TERRAIN_ZONES.length) % TERRAIN_ZONES.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasEnteredView]);

  // Smooth subtle mouse tilt for 3D depth
  const handleMouseMove = (e) => {
    if (!sectionRef.current || !hasEnteredView) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseTilt({ x: nx * 10, y: ny * -8 });
  };

  const selectZone = (index) => {
    soundEngine.playClick();
    setSelectedIndex(index);
  };

  return (
    <section
      ref={sectionRef}
      id="sx-interactive-map"
      onMouseMove={handleMouseMove}
      className="sx-map-canvas relative w-full min-h-screen bg-[#030508] text-white overflow-hidden flex flex-col justify-between p-4 sm:p-7 md:p-9 select-none"
    >
      <style>{`
        /* Scoped Technical Blueprint & HUD Styles with sx- Prefix */
        .sx-map-canvas {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background-image: 
            radial-gradient(circle at center, rgba(12, 18, 28, 0.45) 0%, rgba(3, 5, 8, 0.98) 80%),
            linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
          background-size: 100% 100%, 40px 40px, 40px 40px;
        }

        .sx-crosshair-mark {
          position: absolute;
          width: 9px;
          height: 9px;
          pointer-events: none;
        }
        .sx-crosshair-mark::before {
          content: '';
          position: absolute;
          top: 4px;
          left: 0;
          width: 9px;
          height: 1px;
          background: rgba(255, 255, 255, 0.22);
        }
        .sx-crosshair-mark::after {
          content: '';
          position: absolute;
          left: 4px;
          top: 0;
          width: 1px;
          height: 9px;
          background: rgba(255, 255, 255, 0.22);
        }

        .sx-hud-glass {
          background: rgba(7, 10, 16, 0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.16);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.85);
        }

        .sx-island-viewport {
          transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
          will-change: transform;
        }

        .sx-island-hover-float {
          animation: sx-float-bob 6.5s ease-in-out infinite alternate;
        }

        @keyframes sx-float-bob {
          0% { transform: translateY(-3px) rotate(0.15deg); }
          100% { transform: translateY(5px) rotate(-0.15deg); }
        }

        .sx-draw-line {
          stroke-dasharray: 4 4;
          animation: sx-line-flow 12s linear infinite;
        }

        @keyframes sx-line-flow {
          to { stroke-dashoffset: -120; }
        }

        .sx-pulse-ring {
          animation: sx-ping-wave 2.2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes sx-ping-wave {
          0% { transform: scale(0.9); opacity: 0.85; }
          75%, 100% { transform: scale(2.6); opacity: 0; }
        }

        .sx-corner-bracket {
          position: absolute;
          width: 6px;
          height: 6px;
          border-color: rgba(255, 255, 255, 0.65);
        }
      `}</style>

      {/* Decorative Blueprint Corner Crosshairs */}
      <div className="sx-crosshair-mark" style={{ top: '12%', left: '8%' }} />
      <div className="sx-crosshair-mark" style={{ top: '12%', right: '8%' }} />
      <div className="sx-crosshair-mark" style={{ bottom: '12%', left: '8%' }} />
      <div className="sx-crosshair-mark" style={{ bottom: '12%', right: '8%' }} />

      {/* ========================================================
          1. TOP ARCHITECTURAL HEADER & TELEMETRY
      ======================================================== */}
      <header className={`relative z-20 flex flex-wrap items-start justify-between gap-4 pt-1 pb-4 border-b border-white/10 transition-all duration-700 ${
        hasEnteredView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[9.5px] font-mono tracking-[0.32em] uppercase text-white/55">
              TOPOGRAPHIC SURVEY // 3D PROJECTION
            </span>
          </div>
          <h1 className="font-['Cinzel',serif] text-xl sm:text-2xl md:text-3xl text-white font-normal tracking-[0.14em]">
            GREAT RANN OF KUTCH
          </h1>
          <p className="text-[10px] font-mono tracking-[0.22em] text-white/45 uppercase mt-0.5">
            ISLAND TOPOLOGY • HALITE BASIN & SALT MARSH INTERFACE
          </p>
        </div>

        {/* Center Specification Capsule */}
        <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/15 bg-white/[0.03] text-[9.5px] font-mono tracking-[0.24em] text-white/70">
          <span>MODEL: DIORAMA ISLAND</span>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span>SCALE: 1:2500</span>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span>VIEW: ORTHO 3D</span>
        </div>

        {/* Right Telemetry Block */}
        <div className="text-right font-mono text-[9.5px] text-white/50 space-y-0.5">
          <div className="text-white/85 tracking-widest">COORDINATES: 23.83° N, 70.03° E</div>
          <div className="tracking-wider">SURVEY: WGS 84 • ALT: +1.5M</div>
          <div className="text-white/35 text-[8.5px] tracking-wider uppercase">READY FOR HIGH-POLY MESH DROP-IN</div>
        </div>
      </header>

      {/* ========================================================
          2. MAIN STAGE: FLOATING 3D ISLAND + CLEAN HUD INSPECTOR
      ======================================================== */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-between my-2 md:my-4 w-full max-w-7xl mx-auto gap-6 min-h-[520px]">
        
        {/* Left Flank: Technical Index (SUTÈRA Inspired Index Column) */}
        <div className={`hidden md:flex flex-col space-y-2.5 z-20 w-64 transition-all duration-700 delay-200 ${
          hasEnteredView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 bg-white/60" />
            <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-white/50">
              [TERRAIN ECO-ZONES]
            </span>
          </div>

          {TERRAIN_ZONES.map((zone, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={zone.id}
                onClick={() => selectZone(idx)}
                onMouseEnter={() => soundEngine.playHover()}
                className={`group flex items-center justify-between p-2.5 rounded-lg border text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-white/[0.12] border-white/50 text-white shadow-lg translate-x-1'
                    : 'bg-white/[0.02] border-white/8 text-white/55 hover:text-white hover:border-white/25 hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={`font-mono text-[9px] font-bold ${isSelected ? 'text-white' : 'text-white/40'}`}>
                    {zone.index}
                  </span>
                  <span className="font-sans text-[11px] tracking-wide truncate">
                    {zone.title}
                  </span>
                </div>
                <span className={`font-mono text-[8px] tracking-widest ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}>
                  →
                </span>
              </button>
            );
          })}
        </div>

        {/* Center Canvas: Floating Transparent Island with Connecting Vector Line */}
        <div className="relative flex-1 w-full flex items-center justify-center min-h-[380px] sm:min-h-[460px]">
          
          {/* Ambient Ground Depth Shadow Beneath Floating Island */}
          <div className="absolute w-[80%] max-w-[650px] h-[75px] bottom-10 bg-radial from-black/85 via-black/40 to-transparent blur-2xl pointer-events-none" />

          {/* SVG Vector Leader Line (Cleanly connects the active node to the inspector card) */}
          {hasEnteredView && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <g className="transition-all duration-300">
                {/* Clean Dogleg Polyline */}
                <polyline
                  points={`
                    ${activeZone.nodePos.x},${activeZone.nodePos.y} 
                    ${activeZone.nodePos.x > 50 ? activeZone.nodePos.x + 8 : activeZone.nodePos.x - 8},${activeZone.nodePos.y - 12} 
                    ${activeZone.lineEnd.x},${activeZone.lineEnd.y}
                  `}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="0.28"
                  className="sx-draw-line"
                />

                {/* Node Target Box Joint */}
                <rect
                  x={activeZone.nodePos.x - 0.75}
                  y={activeZone.nodePos.y - 0.75}
                  width="1.5"
                  height="1.5"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="0.3"
                />

                {/* Elbow Pivot Joint Pip */}
                <circle
                  cx={activeZone.nodePos.x > 50 ? activeZone.nodePos.x + 8 : activeZone.nodePos.x - 8}
                  cy={activeZone.nodePos.y - 12}
                  r="0.45"
                  fill="#ffffff"
                />
              </g>
            </svg>
          )}

          {/* Interactive Floating Island Container with 3D Mouse Parallax */}
          <div
            className="sx-island-viewport relative w-full max-w-[780px] aspect-[2/1] flex items-center justify-center"
            style={{
              transform: `perspective(1400px) rotateX(${mouseTilt.y}deg) rotateY(${mouseTilt.x}deg)`
            }}
            onMouseEnter={() => setIsHoveringIsland(true)}
            onMouseLeave={() => setIsHoveringIsland(false)}
          >
            <div className={`sx-island-hover-float relative w-full h-full flex items-center justify-center transition-all duration-1000 ${
              hasEnteredView ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-6'
            }`}>
              
              {/* High-Resolution Transparent Island Diorama */}
              {hasEnteredView && (
                <img
                  src="/assets/kutch_island_transparent.png"
                  alt="Great Rann of Kutch Floating 3D Island Diorama"
                  className="w-full h-full object-contain filter drop-shadow-[0_20px_45px_rgba(0,0,0,0.85)] pointer-events-none"
                  loading="lazy"
                />
              )}

              {/* Interactive Target Reticles on the Island Surface */}
              {hasEnteredView && TERRAIN_ZONES.map((zone, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <div
                    key={zone.id}
                    onClick={() => selectZone(idx)}
                    onMouseEnter={() => soundEngine.playHover()}
                    style={{
                      left: `${zone.nodePos.x}%`,
                      top: `${zone.nodePos.y}%`
                    }}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group"
                  >
                    {/* Pulsing Radar Ring when active */}
                    <span className={`absolute inset-0 w-6 h-6 -m-1.5 rounded-full border border-white/80 sx-pulse-ring ${
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                    }`} />

                    {/* Precision Square Reticle with Corner Brackets */}
                    <div className={`relative w-3.5 h-3.5 border transition-all duration-300 flex items-center justify-center ${
                      isSelected
                        ? 'border-white bg-white scale-125 shadow-[0_0_16px_rgba(255,255,255,0.95)]'
                        : 'border-white/55 bg-black/85 group-hover:border-white group-hover:scale-115'
                    }`}>
                      <div className={`w-1 h-1 ${isSelected ? 'bg-black' : 'bg-white/80'}`} />
                    </div>

                    {/* Index Tag */}
                    <span className={`absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-1.5 py-0.5 rounded font-mono text-[7.5px] tracking-widest uppercase transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-white text-black font-bold shadow-md'
                        : 'bg-black/90 text-white/50 border border-white/10 group-hover:text-white'
                    }`}>
                      {zone.index}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Flank: Dedicated Technical Inspector Panel (SUTÈRA Style) */}
        <div className={`z-20 w-full lg:w-80 max-w-sm transition-all duration-700 delay-300 ${
          hasEnteredView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'
        }`}>
          <div className="sx-hud-glass p-5 rounded-xl border border-white/20 relative">
            
            {/* Architectural Corner Accent Notches */}
            <div className="sx-corner-bracket top-1.5 left-1.5 border-t border-l" />
            <div className="sx-corner-bracket top-1.5 right-1.5 border-t border-r" />
            <div className="sx-corner-bracket bottom-1.5 left-1.5 border-b border-l" />
            <div className="sx-corner-bracket bottom-1.5 right-1.5 border-b border-r" />

            {/* Inspector Header */}
            <div className="flex items-center justify-between border-b border-white/12 pb-2.5 mb-3">
              <span className="font-mono text-[9px] tracking-[0.26em] uppercase text-white/50">
                {activeZone.code}
              </span>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-white border border-white/20">
                /{activeZone.index}
              </span>
            </div>

            {/* Zone Title & Tagline */}
            <h2 className="font-['Cinzel',serif] text-base sm:text-lg text-white font-medium mb-1">
              {activeZone.title}
            </h2>
            <p className="font-mono text-[8px] tracking-[0.20em] uppercase text-white/45 mb-3">
              {activeZone.tagline}
            </p>

            {/* In-depth Geologic / Cultural Description */}
            <p className="text-xs text-slate-300 leading-relaxed font-light mb-4">
              {activeZone.desc}
            </p>

            {/* Key Telemetry Matrix Grid */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 font-mono text-[8.5px] mb-4">
              {activeZone.metrics.map((m, idx) => (
                <div key={idx} className="bg-white/[0.04] p-2 rounded border border-white/5">
                  <span className="text-white/40 block tracking-widest text-[8px] mb-0.5">{m.label}</span>
                  <span className="text-white/95 font-medium tracking-wider">{m.val}</span>
                </div>
              ))}
            </div>

            {/* Quick Navigation Buttons (Prev / Next) */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[9px] font-mono">
              <button
                onClick={() => selectZone((selectedIndex - 1 + TERRAIN_ZONES.length) % TERRAIN_ZONES.length)}
                className="text-white/50 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded hover:bg-white/5"
              >
                ← PREV REGION
              </button>
              <span className="text-white/30">|</span>
              <button
                onClick={() => selectZone((selectedIndex + 1) % TERRAIN_ZONES.length)}
                className="text-white/50 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded hover:bg-white/5"
              >
                NEXT REGION →
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================
          3. BOTTOM CONTROLS & ZONE FILTER TABS
          (Generous pl-32 padding ensures ZERO overlap with fixed Sound Control)
      ======================================================== */}
      <footer className={`relative z-20 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/10 transition-all duration-700 delay-400 pl-2 sm:pl-32 md:pl-36 ${
        hasEnteredView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        
        {/* Center/Left: Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/40 mr-1 hidden sm:inline">
            ZONE SELECTOR:
          </span>
          {TERRAIN_ZONES.map((zone, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={zone.id}
                onClick={() => selectZone(idx)}
                onMouseEnter={() => soundEngine.playHover()}
                className={`px-3 py-1 rounded-full font-mono text-[9px] tracking-wider uppercase transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-black font-semibold shadow-lg scale-105'
                    : 'bg-white/[0.05] border border-white/10 text-white/60 hover:text-white hover:border-white/30'
                }`}
              >
                {zone.index} // {zone.title.split(' ')[0]}
              </button>
            );
          })}
        </div>

        {/* Right: Return to Orbit Button */}
        {onReturnToOrbit && (
          <button
            onClick={() => {
              soundEngine.playReturnSound();
              onReturnToOrbit();
            }}
            onMouseEnter={() => soundEngine.playHover()}
            className="flex items-center gap-2 px-5 py-2 rounded-full border border-white/20 bg-white/[0.06] hover:bg-white/[0.16] text-white text-[10px] font-sans tracking-[0.24em] uppercase transition-all cursor-pointer shadow-lg active:scale-95"
          >
            <span>Return to Orbit</span>
            <span className="text-white/60">↑</span>
          </button>
        )}
      </footer>
    </section>
  );
}
