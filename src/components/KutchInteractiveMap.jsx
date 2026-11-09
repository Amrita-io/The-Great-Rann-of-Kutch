import React, { useState, useRef, useEffect } from 'react';
import { soundEngine } from '../utils/audio';

// Technical data for each terrain zone on the floating island diorama
const MAP_HOTSPOTS = [
  {
    id: 'lagoon',
    index: '01',
    code: 'AQUATIC // BIO-RESERVE',
    title: 'Flamingo Lagoon Inlets',
    tagline: 'SHALLOW BRACKISH CHANNELS & MIGRATORY HAVEN',
    desc: 'Western coastal depression carved by seasonal tidal sea waters. A critical hypersaline refuge for over 50,000 Lesser & Greater Flamingos feeding on Artemia brine shrimp.',
    nodePos: { x: 26, y: 46 }, // percentage on the island image
    cardPos: { x: 6, y: 18 },  // callout card location
    dogleg: { x: 18, y: 28 },  // elbow joint for line
    metrics: [
      { label: 'SALINITY', val: '45-120 PPT' },
      { label: 'SPECIES', val: 'PHOENICOPTERUS' }
    ]
  },
  {
    id: 'saltflat',
    index: '02',
    code: 'HALITE // CORE DEPOSIT',
    title: 'The Great Salt Flat',
    tagline: 'PURE CRYSTALLINE HALITE GEOMETRY',
    desc: 'The central hyper-arid plateau of hardened sodium chloride crust, formed by intense solar evaporation of an ancient arm of the Arabian Sea. Expands into an infinite blinding white horizon.',
    nodePos: { x: 50, y: 42 },
    cardPos: { x: 38, y: 4 },
    dogleg: { x: 44, y: 16 },
    metrics: [
      { label: 'TOTAL AREA', val: '7,505 KM²' },
      { label: 'ALBEDO', val: '0.84 HIGH' }
    ]
  },
  {
    id: 'bhunga',
    index: '03',
    code: 'HABITAT // VERNACULAR',
    title: 'Rabari Bhunga Plateau',
    tagline: 'EARTHQUAKE-RESISTANT CYLINDRICAL DWELLINGS',
    desc: 'North-eastern elevated rock terrace hosting traditional circular mud-and-thatch Bhungas. Interiors feature intricate hand-molded Lippan mirror work crafted by nomadic Rabari & Meghwal artisans.',
    nodePos: { x: 74, y: 26 },
    cardPos: { x: 72, y: 14 },
    dogleg: { x: 73, y: 20 },
    metrics: [
      { label: 'STRUCTURE', val: 'CIRCULAR CLAY' },
      { label: 'CRAFT', val: 'LIPPAN MIRROR' }
    ]
  },
  {
    id: 'saltbeds',
    index: '04',
    code: 'SOLAR // CRYSTALLIZATION',
    title: 'Agariya Solar Salt Pans',
    tagline: 'ARTISANAL GEOMETRIC BRINE BEDS',
    desc: 'South-eastern matrix of shallow rectangular evaporation pans enclosed by compacted mud dykes. Pumped groundwater brine crystalizes under intense desert winds and 45°C solar radiation.',
    nodePos: { x: 68, y: 64 },
    cardPos: { x: 70, y: 72 },
    dogleg: { x: 69, y: 68 },
    metrics: [
      { label: 'PROCESS', val: 'NATURAL SOLAR' },
      { label: 'GUILD', val: 'AGARIYA' }
    ]
  },
  {
    id: 'caravan',
    index: '05',
    code: 'CORRIDOR // ANCIENT ROUTE',
    title: 'Southern Camel Caravans',
    tagline: 'HISTORICAL NOMADIC PASSAGE',
    desc: 'Compacted arid silt and thorn-scrub ridges navigated by Dromedary camel caravans, carrying rock salt, natural indigo, and handwoven textiles across the Indo-Pak borderlands.',
    nodePos: { x: 43, y: 62 },
    cardPos: { x: 10, y: 72 },
    dogleg: { x: 28, y: 67 },
    metrics: [
      { label: 'TRANSIT', val: 'CAMELUS DROMEDARIUS' },
      { label: 'TERRAIN', val: 'ARID SILT / SCRUB' }
    ]
  }
];

export default function KutchInteractiveMap({ onReturnToOrbit }) {
  const [activeSpot, setActiveSpot] = useState(MAP_HOTSPOTS[1]); // Default to White Salt Flat
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Parallax tilt effect on mouse move
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseOffset({ x: nx * 14, y: ny * -10 });
  };

  const handleSelectSpot = (spot) => {
    soundEngine.playClick();
    setActiveSpot(spot);
  };

  return (
    <section 
      ref={containerRef}
      id="sx-interactive-map"
      onMouseMove={handleMouseMove}
      className="sx-map-wrapper relative w-full min-h-screen bg-[#040609] text-white overflow-hidden flex flex-col justify-between p-4 sm:p-8 select-none"
    >
      <style>{`
        /* Scoped Technical HUD Styles with sx- Prefix */
        .sx-map-wrapper {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background-image: 
            radial-gradient(circle at center, rgba(15, 23, 42, 0.45) 0%, rgba(4, 6, 9, 0.95) 75%),
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 100% 100%, 48px 48px, 48px 48px;
        }

        .sx-crosshair {
          position: absolute;
          width: 9px;
          height: 9px;
          pointer-events: none;
        }
        .sx-crosshair::before {
          content: '';
          position: absolute;
          top: 4px;
          left: 0;
          width: 9px;
          height: 1px;
          background: rgba(255, 255, 255, 0.25);
        }
        .sx-crosshair::after {
          content: '';
          position: absolute;
          left: 4px;
          top: 0;
          width: 1px;
          height: 9px;
          background: rgba(255, 255, 255, 0.25);
        }

        .sx-hud-card {
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          background: rgba(8, 11, 18, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.18);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sx-hud-card:hover, .sx-hud-card-active {
          border-color: rgba(255, 255, 255, 0.65);
          background: rgba(12, 16, 26, 0.92);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.8), 0 0 24px rgba(255, 255, 255, 0.15);
        }

        .sx-line-pulse {
          stroke-dasharray: 6 3;
          animation: sx-dash-flow 16s linear infinite;
        }

        @keyframes sx-dash-flow {
          to { stroke-dashoffset: -180; }
        }

        .sx-island-container {
          transition: transform 0.25s ease-out;
          will-change: transform;
        }

        .sx-island-float {
          animation: sx-island-bob 7s ease-in-out infinite alternate;
        }

        @keyframes sx-island-bob {
          0% { transform: translateY(-4px) rotate(0.2deg); }
          100% { transform: translateY(6px) rotate(-0.2deg); }
        }

        .sx-node-pulse {
          animation: sx-ping-subtle 2.2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes sx-ping-subtle {
          0% { transform: scale(0.9); opacity: 0.9; }
          70%, 100% { transform: scale(2.6); opacity: 0; }
        }
      `}</style>

      {/* Decorative Technical Crosshair Ticks at Grid Intersections */}
      <div className="sx-crosshair" style={{ top: '15%', left: '12%' }} />
      <div className="sx-crosshair" style={{ top: '15%', right: '12%' }} />
      <div className="sx-crosshair" style={{ bottom: '15%', left: '12%' }} />
      <div className="sx-crosshair" style={{ bottom: '15%', right: '12%' }} />
      <div className="sx-crosshair" style={{ top: '50%', left: '4%' }} />
      <div className="sx-crosshair" style={{ top: '50%', right: '4%' }} />

      {/* ========================================================
          TOP TELEMETRY BAR (Technical HUD Header - SUTÈRA Style)
      ======================================================== */}
      <header className="relative z-20 flex flex-wrap items-start justify-between gap-4 pt-2 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-mono tracking-[0.30em] uppercase text-white/60">
              TERRAIN PROJECTION // 3D CARTOGRAPHY
            </span>
          </div>
          <h1 className="font-['Cinzel',serif] text-xl sm:text-3xl text-white font-normal tracking-[0.14em]">
            GREAT RANN OF KUTCH
          </h1>
          <p className="text-[10px] font-mono tracking-[0.22em] text-white/40 uppercase mt-0.5">
            ISLAND TOPOLOGY • HALITE BASIN & SALT MARSH INTERFACE
          </p>
        </div>

        {/* Center Mode Tag */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded border border-white/15 bg-white/[0.03] text-[9.5px] font-mono tracking-[0.24em] text-white/70">
          <span>MODEL: DIORAMA ISLAND</span>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span>SCALE: 1:2500</span>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span>VERTICES: 420K</span>
        </div>

        {/* Right Telemetry Block */}
        <div className="text-right font-mono text-[9.5px] text-white/50 space-y-0.5">
          <div className="text-white/80 tracking-widest">COORDINATES: 23.83° N, 70.03° E</div>
          <div className="tracking-wider">DATUM: WGS 84 • ALT: +1.5M</div>
          <div className="text-white/35 text-[8.5px]">AWAITING HIGH-POLY 3D MESH DROP-IN</div>
        </div>
      </header>

      {/* ========================================================
          CENTER STAGE: 3D FLOATING ISLAND & INTERACTIVE LEADER LINES
      ======================================================== */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-4 min-h-[580px] w-full max-w-7xl mx-auto">
        
        {/* SVG Canvas for Angular Leader Lines (Connects Nodes to Floating HUD Cards) */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {MAP_HOTSPOTS.map((spot) => {
            const isSelected = activeSpot.id === spot.id;
            return (
              <g key={spot.id} className="transition-opacity duration-300">
                {/* Dogleg Leader Line */}
                <polyline
                  points={`
                    ${spot.nodePos.x},${spot.nodePos.y} 
                    ${spot.dogleg.x},${spot.dogleg.y} 
                    ${spot.cardPos.x + 8},${spot.cardPos.y + 4}
                  `}
                  fill="none"
                  stroke={isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.28)'}
                  strokeWidth={isSelected ? '0.35' : '0.2'}
                  className={isSelected ? 'sx-line-pulse' : ''}
                />
                
                {/* Elbow Joint Dot */}
                <circle
                  cx={spot.dogleg.x}
                  cy={spot.dogleg.y}
                  r={isSelected ? '0.45' : '0.3'}
                  fill={isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'}
                />
              </g>
            );
          })}
        </svg>

        {/* 3D Floating Island Diorama Mesh Container */}
        <div 
          className="sx-island-container relative w-full max-w-[820px] aspect-[16/9] flex items-center justify-center"
          style={{
            transform: `perspective(1200px) rotateX(${mouseOffset.y}deg) rotateY(${mouseOffset.x}deg)`
          }}
        >
          <div className="sx-island-float relative w-full h-full flex items-center justify-center">
            {/* High-Resolution 3D Island Diorama Render */}
            <img
              src="/assets/kutch_island_diorama.jpg"
              alt="Great Rann of Kutch Floating 3D Island Diorama"
              className="w-full h-auto max-h-[90%] object-contain filter drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)]"
            />

            {/* Target Reticle Nodes on the Island Surface */}
            {MAP_HOTSPOTS.map((spot) => {
              const isSelected = activeSpot.id === spot.id;
              return (
                <div
                  key={spot.id}
                  onClick={() => handleSelectSpot(spot)}
                  onMouseEnter={() => soundEngine.playHover()}
                  style={{
                    left: `${spot.nodePos.x}%`,
                    top: `${spot.nodePos.y}%`
                  }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                >
                  {/* Subtle Radar Pulse Ring */}
                  <span className={`absolute inset-0 w-5 h-5 -m-1 rounded-full border border-white/60 sx-node-pulse ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`} />

                  {/* Square Anchor Pip (SUTÈRA Style) */}
                  <div className={`w-3 h-3 rounded-none border transition-all duration-200 flex items-center justify-center ${
                    isSelected
                      ? 'bg-white border-white scale-125 shadow-[0_0_12px_rgba(255,255,255,0.9)]'
                      : 'bg-black/90 border-white/60 group-hover:border-white group-hover:scale-110'
                  }`}>
                    <div className={`w-1 h-1 ${isSelected ? 'bg-black' : 'bg-white/80'}`} />
                  </div>

                  {/* Micro Index Pill */}
                  <span className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.2 rounded font-mono text-[7.5px] tracking-widest uppercase transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-white text-black font-bold'
                      : 'bg-black/80 text-white/50 border border-white/10 group-hover:text-white'
                  }`}>
                    {spot.index}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            POPPING TECHNICAL HUD CALLOUT CARDS (SUTÈRA Architecture)
        ======================================================== */}
        {MAP_HOTSPOTS.map((spot) => {
          const isSelected = activeSpot.id === spot.id;
          return (
            <div
              key={spot.id}
              onClick={() => handleSelectSpot(spot)}
              style={{
                left: `${spot.cardPos.x}%`,
                top: `${spot.cardPos.y}%`
              }}
              className={`absolute z-30 w-72 max-w-[85vw] p-4 rounded-xl sx-hud-card cursor-pointer transform -translate-x-4 sm:translate-x-0 ${
                isSelected ? 'sx-hud-card-active scale-102 ring-1 ring-white/50' : 'opacity-70 hover:opacity-100'
              }`}
            >
              {/* Card Header & Index */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                <span className="font-mono text-[9px] tracking-[0.24em] uppercase text-white/50">
                  {spot.code}
                </span>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/15">
                  /{spot.index}
                </span>
              </div>

              {/* Title & Tagline */}
              <h3 className="font-['Cinzel',serif] text-sm sm:text-base text-white font-medium mb-0.5 leading-snug">
                {spot.title}
              </h3>
              <p className="font-mono text-[8px] tracking-[0.18em] uppercase text-white/40 mb-2">
                {spot.tagline}
              </p>

              {/* Detailed Description */}
              <p className="text-[11px] text-slate-300 leading-relaxed font-light mb-3">
                {spot.desc}
              </p>

              {/* Key Technical Telemetry Metrics */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 font-mono text-[8.5px]">
                {spot.metrics.map((m, idx) => (
                  <div key={idx} className="bg-white/[0.04] p-1.5 rounded border border-white/5">
                    <span className="text-white/40 block tracking-widest">{m.label}</span>
                    <span className="text-white/90 font-medium tracking-wider">{m.val}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

      </div>

      {/* ========================================================
          BOTTOM HUD CONTROLS & ZONE FILTER TABS
      ======================================================== */}
      <footer className="relative z-20 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/10">
        
        {/* Left: Zone Selection Chips */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/40 mr-1">
            REGIONS:
          </span>
          {MAP_HOTSPOTS.map((spot) => (
            <button
              key={spot.id}
              onClick={() => handleSelectSpot(spot)}
              onMouseEnter={() => soundEngine.playHover()}
              className={`px-3 py-1 rounded-full font-mono text-[9px] tracking-wider uppercase transition-all cursor-pointer ${
                activeSpot.id === spot.id
                  ? 'bg-white text-black font-semibold shadow-md'
                  : 'bg-white/[0.05] border border-white/10 text-white/60 hover:text-white hover:border-white/30'
              }`}
            >
              {spot.index} // {spot.title.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Right: Return to Orbit Button */}
        {onReturnToOrbit && (
          <button
            onClick={() => {
              soundEngine.playReturnSound();
              onReturnToOrbit();
            }}
            onMouseEnter={() => soundEngine.playHover()}
            className="flex items-center gap-2 px-5 py-2 rounded-full border border-white/20 bg-white/[0.06] hover:bg-white/[0.16] text-white text-[10px] font-sans tracking-[0.24em] uppercase transition-all cursor-pointer shadow-lg"
          >
            <span>Return to Orbit</span>
            <span className="text-white/60">↑</span>
          </button>
        )}
      </footer>
    </section>
  );
}

