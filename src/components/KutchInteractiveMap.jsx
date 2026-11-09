import React, { useState, useRef, useEffect, useCallback } from 'react';
import { soundEngine } from '../utils/audio';

// 5 Key Sequential Acts of the Kutch Narrative with NASA-ISRO NISAR Radar Observations
const TERRAIN_ZONES = [
  {
    id: 'act1_white_desert',
    index: '01',
    actRoman: 'ACT I',
    code: 'NASA-ISRO SAR // NISAR MISSION',
    title: 'Act I: Silence',
    subtitle: 'THE INFINITE WHITE DESERT // CAL/VAL SUPER-SITE',
    tagline: 'L-BAND (24cm) & S-BAND (9cm) DUAL-FREQUENCY POLARIMETRY',
    desc: 'The Great Rann of Kutch serves as NISAR’s premier global calibration super-site due to its ultra-flat topography (elevation variance < 0.3m across thousands of km²). Dual-frequency radar signals penetrate the crystalline halite crust to map subsurface saline aquifers and crust deformation with sub-millimeter precision.',
    nodePos: { x: 22.5, y: 48.0 }, // % coordinate on 1024x572 diorama
    regionCode: 'NISAR-CAL/VAL',
    region: { cx: 22.5, cy: 48.0, rx: 7.5, ry: 13, rotate: 0 },
    bounds: { x: 15.5, y: 34, w: 13.5, h: 28 },
    theme: {
      accent: '#ffffff', // crystalline halite white
      glow: 'rgba(255, 255, 255, 0.75)',
      glowSubtle: 'rgba(255, 255, 255, 0.28)',
      border: 'rgba(255, 255, 255, 0.85)',
      boxBg: 'rgba(255, 255, 255, 0.06)'
    },
    nisarMode: 'CAL/VAL RADAR SUPER-SITE',
    metrics: [
      { label: 'L-BAND BACKSCATTER', val: '-18.4 dB (HH)' },
      { label: 'S-BAND BACKSCATTER', val: '-12.1 dB (VV)' },
      { label: 'InSAR COHERENCE', val: '0.94 (HIGH)' },
      { label: 'CRUST DIELECTRIC', val: '3.2 εr (NACL)' },
      { label: 'SUB-SURFACE BRINE', val: '0.38M DEPTH' },
      { label: 'SURFACE DEFORMATION', val: '< 0.8 MM/YR' }
    ]
  },
  {
    id: 'act2_tidal_inlets',
    index: '02',
    actRoman: 'ACT II',
    code: 'NASA-ISRO SAR // HYDROLOGIC RADAR',
    title: 'Act II: Ancient Tidal Inlets',
    subtitle: 'COASTAL INUNDATION & HYPERSALINE CHANNELS',
    tagline: 'SPECULAR WATER BACKSCATTER & INUNDATION MAPPING',
    desc: 'NISAR’s quad-polarimetric synthetic aperture radar maps tidal water intrusion and soil saturation across Kutch’s coastal inlets. Water creates near-complete forward specular reflection (-24.8 dB), delineating exact tidal boundaries through cloud cover and darkness.',
    nodePos: { x: 35.0, y: 45.5 },
    regionCode: 'TIDAL-CHANNELS',
    region: { cx: 35.0, cy: 45.5, rx: 7.5, ry: 14, rotate: 0 },
    bounds: { x: 28.5, y: 32, w: 13.0, h: 30 },
    theme: {
      accent: '#38bdf8', // tidal cyan/azure
      glow: 'rgba(56, 189, 248, 0.65)',
      glowSubtle: 'rgba(14, 165, 233, 0.25)',
      border: 'rgba(56, 189, 248, 0.85)',
      boxBg: 'rgba(56, 189, 248, 0.06)'
    },
    nisarMode: 'INUNDATION & WATER EXTENT',
    metrics: [
      { label: 'WATER BACKSCATTER', val: '-24.8 dB (HH)' },
      { label: 'INUNDATION SWATH', val: '242 KM' },
      { label: 'WATER DIELECTRIC', val: '78.4 εr' },
      { label: 'TIDAL ACCURACY', val: '±2.5 CM' },
      { label: 'POLARIZATION', val: 'FULL QUAD-POL' },
      { label: 'REPEAT CYCLE', val: '12 DAYS' }
    ]
  },
  {
    id: 'act3_crystallization',
    index: '03',
    actRoman: 'ACT III',
    code: 'NASA-ISRO SAR // MINERAL DYNAMICS',
    title: 'Act III: Halite Crystallization',
    subtitle: 'AGARIYA SALT EVAPORATION MATRIX',
    tagline: 'SOLAR BRINE DIELECTRIC EVAPORATION GRADIENTS',
    desc: 'NISAR captures the dielectric permittivity transition as saturated brine crystallizes into solid halite salt in the Agariya pans. Dielectric constant drops from 45.2 εr (brine) to 3.2 εr (salt crust), revealing evaporation rates from space.',
    nodePos: { x: 46.5, y: 46.5 },
    regionCode: 'SALT-CRUSTING',
    region: { cx: 46.5, cy: 46.5, rx: 6.5, ry: 14, rotate: 0 },
    bounds: { x: 41.0, y: 32, w: 11.5, h: 30 },
    theme: {
      accent: '#2dd4bf', // brine aquamarine
      glow: 'rgba(45, 212, 191, 0.65)',
      glowSubtle: 'rgba(20, 184, 166, 0.25)',
      border: 'rgba(45, 212, 191, 0.85)',
      boxBg: 'rgba(45, 212, 191, 0.06)'
    },
    nisarMode: 'DIELECTRIC PERMITTIVITY',
    metrics: [
      { label: 'BRINE DIELECTRIC', val: '45.2 -> 3.2 εr' },
      { label: 'CRUST ACCRETION', val: '1.4 CM/WK' },
      { label: 'S-BAND PHASE SHIFT', val: '38.6 DEG' },
      { label: 'SURFACE ROUGHNESS', val: '0.6 CM' },
      { label: 'POLARIMETRY', val: 'HH + HV' },
      { label: 'CAL SITE STATUS', val: 'ACTIVE' }
    ]
  },
  {
    id: 'act4_living_oasis',
    index: '04',
    actRoman: 'ACT IV',
    code: 'NASA-ISRO SAR // WETLAND POLSAR BIOMASS',
    title: 'Act IV: Living Oasis & Nomadic Craft',
    subtitle: 'UNESCO BIOSPHERE & FLAMINGO SANCTUARY',
    tagline: 'POLARIMETRIC VOLUME SCATTERING & WILDLIFE HABITAT',
    desc: 'Using Polarimetric SAR (PolSAR) decomposition, NISAR separates ground-surface reflections from vegetative canopy volume scattering in the Flamingo wetland sanctuary, tracking seasonal habitat expansion and soil moisture supporting the Indian Wild Ass.',
    nodePos: { x: 63.0, y: 47.0 },
    regionCode: 'NOMADIC-BIOSPHERE',
    region: { cx: 63.0, cy: 47.0, rx: 11.5, ry: 18, rotate: 0 },
    bounds: { x: 51.5, y: 26, w: 22.5, h: 37 },
    theme: {
      accent: '#f59e0b', // desert gold & terracotta
      glow: 'rgba(245, 158, 11, 0.65)',
      glowSubtle: 'rgba(217, 119, 6, 0.25)',
      border: 'rgba(245, 158, 11, 0.85)',
      boxBg: 'rgba(245, 158, 11, 0.06)'
    },
    nisarMode: 'PolSAR BIOMASS & SOIL MOISTURE',
    metrics: [
      { label: 'VOLUME SCATTERING', val: '-14.2 dB (HV)' },
      { label: 'SOIL MOISTURE', val: '34.8% VOL' },
      { label: 'HABITAT EXTENT', val: '120 SQ KM' },
      { label: 'POLSAR ENTROPY', val: '0.72 H' },
      { label: 'BIOMASS DENSITY', val: '18.5 T/HA' },
      { label: 'RESOLUTION', val: '3M x 10M' }
    ]
  },
  {
    id: 'act5_renewable_horizon',
    index: '05',
    actRoman: 'ACT V',
    code: 'NASA-ISRO SAR // RENEWABLE INFRASTRUCTURE',
    title: 'Act V: The Renewable Horizon',
    subtitle: 'KHAVDA HYBRID ENERGY PARK',
    tagline: 'PHOTOVOLTAIC RADAR SIGNATURE & STRUCTURAL InSAR',
    desc: 'The Khavda Renewable Park produces high-intensity double-bounce radar dihedral returns from metallic photovoltaic mounting racks and wind turbine masts. InSAR monitors foundation subsidence across the salt platform with millimeter accuracy.',
    nodePos: { x: 79.0, y: 47.0 },
    regionCode: 'SOLAR-MATRIX',
    region: { cx: 79.0, cy: 47.0, rx: 7.0, ry: 13, rotate: 0 },
    bounds: { x: 73.0, y: 33, w: 12.5, h: 28 },
    theme: {
      accent: '#a5b4fc', // radiant energy cyber indigo
      glow: 'rgba(165, 180, 252, 0.70)',
      glowSubtle: 'rgba(129, 140, 248, 0.25)',
      border: 'rgba(165, 180, 252, 0.85)',
      boxBg: 'rgba(165, 180, 252, 0.06)'
    },
    nisarMode: 'DIHEDRAL SCATTER & InSAR DEFORMATION',
    metrics: [
      { label: 'DIHEDRAL RETURN', val: '-4.2 dB (HH)' },
      { label: 'InSAR SUBSIDENCE', val: '< 1.2 MM/YR' },
      { label: 'TARGET SWATH', val: '726 SQ KM' },
      { label: 'ARRAY COHERENCE', val: '0.88 HIGH' },
      { label: 'RADAR CROSS-SECTION', val: '42.5 M²' },
      { label: 'POWER CAPACITY', val: '30 GW GREEN' }
    ]
  }
];

export default function KutchInteractiveMap({ onReturnToOrbit }) {
  const [selectedIndex, setSelectedIndex] = useState(0); // Default to Act I (Act-1: Silence)
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [isHoveringIsland, setIsHoveringIsland] = useState(false);
  const [activeSarBand, setActiveSarBand] = useState('L-BAND'); // 'L-BAND' | 'S-BAND' | 'InSAR'
  
  // Element references for live sub-pixel vector line anchoring
  const stageRef = useRef(null);
  const nodeRefs = useRef([]);
  const cardPortRef = useRef(null);
  const sectionRef = useRef(null);
  const rafRef = useRef(null);

  // Line coordinates state
  const [lineData, setLineData] = useState(null);
  const [stageDimensions, setStageDimensions] = useState({ width: 1200, height: 650 });

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

    // Custom event listener for instant activation from "Discover" click / video auto-scroll
    const handleTrigger = () => setHasEnteredView(true);
    window.addEventListener('kutch:trigger-map-reveal', handleTrigger);

    return () => {
      observer.disconnect();
      window.removeEventListener('kutch:trigger-map-reveal', handleTrigger);
    };
  }, [hasEnteredView]);

  // Keyboard navigation across Acts (Arrow keys)
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

  // Dynamic Sub-Pixel CAD Leader Line Math (Calculated live in Stage Coordinate Space)
  const updateLineGeometry = useCallback(() => {
    if (!stageRef.current || !cardPortRef.current) return;
    const activeNodeEl = nodeRefs.current[selectedIndex];
    if (!activeNodeEl) return;

    const stageRect = stageRef.current.getBoundingClientRect();
    if (stageRect.width === 0 || stageRect.height === 0) return;

    setStageDimensions({ width: stageRect.width, height: stageRect.height });

    const nodeRect = activeNodeEl.getBoundingClientRect();
    const portRect = cardPortRef.current.getBoundingClientRect();

    // Live coordinates relative to stage
    const startX = nodeRect.left + nodeRect.width / 2 - stageRect.left;
    const startY = nodeRect.top + nodeRect.height / 2 - stageRect.top;

    const endX = portRect.left + portRect.width / 2 - stageRect.left;
    const endY = portRect.top + portRect.height / 2 - stageRect.top;

    // Desktop: Card is to the right of node
    if (endX > startX + 35) {
      const takeoffX = startX + 24;
      const takeoffY = startY;
      const dy = Math.abs(endY - startY);

      // Clean 45-degree angle
      let elbowX = takeoffX + dy;
      if (elbowX > endX - 35) {
        elbowX = Math.max(takeoffX + 16, endX - 35);
      }
      const elbowY = endY;

      const pathD = `M ${startX.toFixed(1)} ${startY.toFixed(1)} L ${takeoffX.toFixed(1)} ${takeoffY.toFixed(1)} L ${elbowX.toFixed(1)} ${elbowY.toFixed(1)} L ${endX.toFixed(1)} ${endY.toFixed(1)}`;

      setLineData({
        pathD,
        startX,
        startY,
        takeoffX,
        takeoffY,
        elbowX,
        elbowY,
        endX,
        endY,
        mode: 'horizontal'
      });
    } else {
      // Mobile / Stacked layout (Card is below the island)
      const takeoffX = startX;
      const takeoffY = startY + 20;
      const dx = Math.abs(endX - startX);

      let elbowY = takeoffY + dx;
      if (elbowY > endY - 25) {
        elbowY = Math.max(takeoffY + 15, endY - 25);
      }
      const elbowX = endX;

      const pathD = `M ${startX.toFixed(1)} ${startY.toFixed(1)} L ${takeoffX.toFixed(1)} ${takeoffY.toFixed(1)} L ${elbowX.toFixed(1)} ${elbowY.toFixed(1)} L ${endX.toFixed(1)} ${endY.toFixed(1)}`;

      setLineData({
        pathD,
        startX,
        startY,
        takeoffX,
        takeoffY,
        elbowX,
        elbowY,
        endX,
        endY,
        mode: 'vertical'
      });
    }
  }, [selectedIndex]);

  // Recalculate line geometry on state change, resize, and layout settlement
  useEffect(() => {
    if (!hasEnteredView) return;

    updateLineGeometry();
    const t1 = setTimeout(updateLineGeometry, 80);
    const t2 = setTimeout(updateLineGeometry, 260);

    const handleResize = () => updateLineGeometry();
    window.addEventListener('resize', handleResize);

    let resizeObserver = null;
    if (stageRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => updateLineGeometry());
      resizeObserver.observe(stageRef.current);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [hasEnteredView, selectedIndex, updateLineGeometry]);

  // Smooth subtle mouse tilt for 3D depth
  const handleMouseMove = (e) => {
    if (!sectionRef.current || !hasEnteredView) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseTilt({ x: nx * 6, y: ny * -5 });

    // Smoothly keep vector line locked during 3D parallax tilt
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(updateLineGeometry);
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
      className="sx-map-canvas relative w-full min-h-screen bg-[#030508] text-white overflow-hidden flex flex-col justify-between p-3 sm:p-6 md:p-8 select-none"
    >
      <style>{`
        /* Scoped Technical Blueprint & HUD Styles with sx- Prefix */
        .sx-map-canvas {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background-image: 
            radial-gradient(circle at 50% 45%, rgba(18, 28, 44, 0.55) 0%, rgba(3, 5, 8, 0.98) 78%),
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
          background: rgba(7, 10, 16, 0.90);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.16);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.85);
        }

        .sx-island-viewport {
          transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
          will-change: transform;
        }

        .sx-island-hover-float {
          animation: sx-float-bob 6.5s ease-in-out infinite alternate;
        }

        @keyframes sx-float-bob {
          0% { transform: translateY(-3px) rotate(0.15deg); }
          100% { transform: translateY(5px) rotate(-0.15deg); }
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

        /* Active Region Luminous Highlight & Breathing Animation */
        .sx-active-region-glow {
          animation: sx-glow-pulse 3s ease-in-out infinite alternate;
        }

        @keyframes sx-glow-pulse {
          0% {
            opacity: 0.70;
            transform: translate(-50%, -50%) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.04);
          }
        }

        /* Architectural CAD Region Box Animation */
        .sx-cad-region-box {
          animation: sx-box-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes sx-box-in {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Scanning Shimmer Beam Across Active Region */
        .sx-scanline-shimmer {
          animation: sx-shimmer-sweep 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @keyframes sx-shimmer-sweep {
          0% { transform: translateY(-100%); opacity: 0; }
          25% { opacity: 0.75; }
          75% { opacity: 0.75; }
          100% { transform: translateY(220%); opacity: 0; }
        }
      `}</style>

      {/* Decorative Blueprint Corner Crosshairs */}
      <div className="sx-crosshair-mark" style={{ top: '12%', left: '6%' }} />
      <div className="sx-crosshair-mark" style={{ top: '12%', right: '6%' }} />
      <div className="sx-crosshair-mark" style={{ bottom: '12%', left: '6%' }} />
      <div className="sx-crosshair-mark" style={{ bottom: '12%', right: '6%' }} />

      {/* ========================================================
          1. TOP ARCHITECTURAL HEADER & NISAR RADAR TELEMETRY
      ======================================================== */}
      <header className={`relative z-20 flex flex-wrap items-start justify-between gap-4 pt-1 pb-4 border-b border-white/10 transition-all duration-700 ${
        hasEnteredView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[9.5px] font-mono tracking-[0.32em] uppercase text-cyan-400">
              NASA-ISRO SYNTHETIC APERTURE RADAR (NISAR) // SCIENCE OBSERVATORY
            </span>
          </div>
          <h1 className="font-['Cinzel',serif] text-xl sm:text-2xl md:text-3xl text-white font-normal tracking-[0.14em]">
            GREAT RANN OF KUTCH
          </h1>
          <p className="text-[10px] font-mono tracking-[0.22em] text-white/50 uppercase mt-0.5">
            NISAR CAL/VAL SUPER-SITE • DUAL-BAND RADAR OBSERVATIONS ACROSS 5 ACTS
          </p>
        </div>

        {/* Center Specification Capsule */}
        <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/20 text-[9.5px] font-mono tracking-[0.24em] text-cyan-200">
          <span>MISSION: NISAR (NASA-ISRO)</span>
          <span className="w-1 h-1 rounded-full bg-cyan-400" />
          <span>ORBIT: 747 KM</span>
          <span className="w-1 h-1 rounded-full bg-cyan-400" />
          <span>CAL/VAL TARGET: ACT I SILENCE</span>
        </div>

        {/* Right Telemetry Block */}
        <div className="text-right font-mono text-[9.5px] text-white/50 space-y-0.5">
          <div className="text-white/85 tracking-widest">COORDINATES: 23.83° N, 70.03° E</div>
          <div className="tracking-wider text-cyan-400/90 font-medium">RADAR: L-BAND (NASA) + S-BAND (ISRO)</div>
          <div className="text-white/40 text-[8.5px] tracking-wider uppercase">SWATH: 242 KM • REPEAT: 12 DAYS</div>
        </div>
      </header>

      {/* ========================================================
          2. MAIN STAGE: FLOATING 5-ACT DIORAMA + NISAR HUD INSPECTOR
      ======================================================== */}
      <div
        ref={stageRef}
        className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-between my-2 md:my-3 w-full max-w-[1580px] mx-auto px-2 sm:px-6 gap-6 min-h-[580px] lg:min-h-[640px]"
      >
        {/* Full-Stage SVG Vector Leader Line Overlay */}
        {hasEnteredView && lineData && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
            viewBox={`0 0 ${stageDimensions.width || 1200} ${stageDimensions.height || 650}`}
          >
            <defs>
              <linearGradient id="sx-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
              </linearGradient>
            </defs>

            {/* Ambient Soft Glow Halo */}
            <path
              d={lineData.pathD}
              fill="none"
              stroke="rgba(56, 189, 248, 0.20)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Crisp Solid Architectural Hairline */}
            <path
              d={lineData.pathD}
              fill="none"
              stroke="url(#sx-line-grad)"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Origin Pip on Active Act Hotspot */}
            <rect
              x={lineData.startX - 5}
              y={lineData.startY - 5}
              width="10"
              height="10"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
            />
            <circle cx={lineData.startX} cy={lineData.startY} r="1.8" fill="#ffffff" />

            {/* Joint Elbow 1 (Takeoff) */}
            <circle cx={lineData.takeoffX} cy={lineData.takeoffY} r="1.8" fill="#38bdf8" />

            {/* Joint Elbow 2 (Dogleg) */}
            <circle cx={lineData.elbowX} cy={lineData.elbowY} r="2.2" fill="#ffffff" />

            {/* Docking Terminal at HUD Port */}
            <rect
              x={lineData.endX - 3}
              y={lineData.endY - 3}
              width="6"
              height="6"
              fill="#38bdf8"
            />

            {/* Streaming Telemetry Photon Packet */}
            <circle r="2.2" fill="#38bdf8">
              <animateMotion
                dur="2.4s"
                repeatCount="indefinite"
                path={lineData.pathD}
              />
            </circle>
            <circle r="5" fill="#38bdf8" opacity="0.3">
              <animateMotion
                dur="2.4s"
                repeatCount="indefinite"
                path={lineData.pathD}
              />
            </circle>
          </svg>
        )}

        {/* Left Flank: Technical Index (5 Acts Sequential List) */}
        <div className={`hidden md:flex flex-col space-y-2 z-20 w-56 transition-all duration-700 delay-200 shrink-0 ${
          hasEnteredView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 bg-cyan-400" />
            <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-white/50">
              [5 GEOLOGICAL ACTS]
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
                    ? 'bg-cyan-950/40 border-cyan-400/60 text-white shadow-lg translate-x-1'
                    : 'bg-white/[0.02] border-white/8 text-white/55 hover:text-white hover:border-white/25 hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={`font-mono text-[9px] font-bold ${isSelected ? 'text-cyan-300' : 'text-white/40'}`}>
                    {zone.actRoman}
                  </span>
                  <span className="font-sans text-[11px] tracking-wide truncate">
                    {zone.title.replace(/^Act [I|V|X]+: /, '')}
                  </span>
                </div>
                <span className={`font-mono text-[8px] tracking-widest ${isSelected ? 'opacity-100 text-cyan-400' : 'opacity-0 group-hover:opacity-60'}`}>
                  →
                </span>
              </button>
            );
          })}
        </div>

        {/* Center Canvas: Floating 5-Acts Diorama Map with Regional Highlighting */}
        <div className="relative flex-1 w-full flex items-center justify-center min-h-[460px] sm:min-h-[560px] lg:min-h-[620px] px-2 sm:px-4">
          
          {/* Celestial Ambient Backlight Aura (Illuminates the Island Silhouettes & Relief) */}
          <div className="absolute w-[92%] max-w-[1020px] h-[82%] -top-4 rounded-full bg-radial from-white/[0.09] via-cyan-400/[0.035] to-transparent blur-3xl pointer-events-none" />

          {/* Broad Ground Depth Shadow Beneath Floating Island */}
          <div className="absolute w-[88%] max-w-[920px] h-[95px] bottom-6 bg-radial from-black/92 via-black/45 to-transparent blur-2xl pointer-events-none" />

          {/* Interactive Floating Island Container with 3D Mouse Parallax */}
          <div
            className="sx-island-viewport relative w-full max-w-[1000px] xl:max-w-[1120px] 2xl:max-w-[1240px] aspect-[1024/572] flex items-center justify-center"
            style={{
              transform: `perspective(1400px) rotateX(${mouseTilt.y}deg) rotateY(${mouseTilt.x}deg)`
            }}
            onMouseEnter={() => setIsHoveringIsland(true)}
            onMouseLeave={() => setIsHoveringIsland(false)}
          >
            <div className={`sx-island-hover-float relative w-full h-full flex items-center justify-center transition-all duration-1000 ${
              hasEnteredView ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-6'
            }`}>
              
              {/* High-Resolution 5-Acts Diorama Map */}
              {hasEnteredView && (
                <img
                  src="/assets/kutch_5acts_diorama.webp"
                  alt="Great Rann of Kutch 5-Acts Stratum Diorama"
                  className="w-full h-full object-contain filter drop-shadow-[0_28px_56px_rgba(0,0,0,0.92)] drop-shadow-[0_0_35px_rgba(255,255,255,0.08)] contrast-[1.08] brightness-[1.06] pointer-events-none transition-all duration-500"
                  loading="lazy"
                />
              )}

              {/* ========================================================
                  ACTIVE ACT REGION HIGHLIGHT LAYERS
                  (Luminous Biome Glow + CAD Architectural Bounding Box)
              ======================================================== */}
              {hasEnteredView && activeZone && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  
                  {/* Layer 1: Luminous Topographic Biome Glow */}
                  <div
                    key={`glow-${activeZone.id}`}
                    className="absolute rounded-full transition-all duration-700 pointer-events-none sx-active-region-glow"
                    style={{
                      left: `${activeZone.region.cx}%`,
                      top: `${activeZone.region.cy}%`,
                      width: `${activeZone.region.rx * 2}%`,
                      height: `${activeZone.region.ry * 2}%`,
                      transform: `translate(-50%, -50%) rotate(${activeZone.region.rotate || 0}deg)`,
                      background: `radial-gradient(ellipse at center, ${activeZone.theme.glow} 0%, ${activeZone.theme.glowSubtle} 48%, transparent 76%)`,
                      filter: 'blur(9px)',
                      mixBlendMode: 'screen'
                    }}
                  />

                  {/* Layer 2: Precision Architectural CAD Bounding Box (SUTÈRA Style) */}
                  <div
                    key={`cad-${activeZone.id}`}
                    className="absolute transition-all duration-500 pointer-events-none border border-dashed rounded-[2px] sx-cad-region-box"
                    style={{
                      left: `${activeZone.bounds.x}%`,
                      top: `${activeZone.bounds.y}%`,
                      width: `${activeZone.bounds.w}%`,
                      height: `${activeZone.bounds.h}%`,
                      borderColor: activeZone.theme.border,
                      backgroundColor: activeZone.theme.boxBg,
                      boxShadow: `0 0 25px ${activeZone.theme.glowSubtle}`
                    }}
                  >
                    {/* 4 Precision Corner Brackets */}
                    <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2" style={{ borderColor: activeZone.theme.accent }} />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2" style={{ borderColor: activeZone.theme.accent }} />
                    <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2" style={{ borderColor: activeZone.theme.accent }} />
                    <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2" style={{ borderColor: activeZone.theme.accent }} />

                    {/* Sector Identification Capsule Header */}
                    <div className="absolute -top-4 left-2 px-1.5 py-0.5 rounded-[2px] bg-black/90 border border-white/20 font-mono text-[7px] tracking-wider uppercase text-white/90 flex items-center gap-1.5 shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: activeZone.theme.accent }} />
                      <span className="font-bold">{activeZone.actRoman}</span>
                      <span className="text-white/40">//</span>
                      <span className="text-white/70">{activeZone.regionCode}</span>
                    </div>

                    {/* Scanning Laser Shimmer Beam across Sector */}
                    <div className="absolute inset-0 overflow-hidden rounded-[2px]">
                      <div
                        className="w-full h-1/2 sx-scanline-shimmer"
                        style={{
                          background: `linear-gradient(to bottom, transparent, ${activeZone.theme.glowSubtle}, transparent)`
                        }}
                      />
                    </div>
                  </div>

                </div>
              )}

              {/* Interactive Target Reticles for each Act on the Surface */}
              {hasEnteredView && TERRAIN_ZONES.map((zone, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <div
                    key={zone.id}
                    ref={(el) => (nodeRefs.current[idx] = el)}
                    onClick={() => selectZone(idx)}
                    onMouseEnter={() => soundEngine.playHover()}
                    style={{
                      left: `${zone.nodePos.x}%`,
                      top: `${zone.nodePos.y}%`
                    }}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group"
                  >
                    {/* Pulsing Radar Ring when active */}
                    <span className={`absolute inset-0 w-8 h-8 -m-2 rounded-full border border-white/80 sx-pulse-ring pointer-events-none ${
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                    }`} />

                    {/* Precision Square Reticle with Center Dot */}
                    <div className={`relative flex items-center justify-center transition-all duration-300 ${
                      isSelected
                        ? 'w-4 h-4 border border-white bg-white/20 shadow-[0_0_16px_rgba(255,255,255,0.95)]'
                        : 'w-2.5 h-2.5 border border-white/50 bg-black/80 group-hover:border-white group-hover:scale-115'
                    }`}>
                      <div className={`w-1.5 h-1.5 ${isSelected ? 'bg-white' : 'bg-white/70 group-hover:bg-white'}`} />
                    </div>

                    {/* Architectural Micro-Annotation Tag */}
                    <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-1.5 flex flex-col items-center pointer-events-none transition-all duration-300 ${
                      isSelected ? 'opacity-100 scale-100' : 'opacity-55 group-hover:opacity-100 group-hover:scale-105'
                    }`}>
                      <span className={`px-1.5 py-0.5 rounded font-mono text-[7.5px] tracking-widest uppercase border whitespace-nowrap ${
                        isSelected
                          ? 'bg-white text-black font-bold border-white shadow-md'
                          : 'bg-black/85 text-white/70 border-white/15'
                      }`}>
                        {zone.actRoman} // {zone.title.replace(/^Act [I|V|X]+: /, '').split(' ')[0]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Flank: Dedicated NASA-ISRO NISAR Radar Science Inspector Panel */}
        <div className={`z-20 w-full lg:w-88 max-w-sm transition-all duration-700 delay-300 shrink-0 ${
          hasEnteredView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'
        }`}>
          <div className="sx-hud-glass p-5 rounded-xl border border-white/20 relative">
            
            {/* Dedicated Architectural Connector Port on Left Border (Where line docks!) */}
            <div
              ref={cardPortRef}
              className="absolute -left-[5px] top-10 w-2.5 h-2.5 rounded-[1px] bg-cyan-400 border border-black shadow-[0_0_12px_rgba(56,189,248,0.95)] flex items-center justify-center z-30 pointer-events-none"
            >
              <span className="w-1 h-1 bg-black" />
            </div>

            {/* Architectural Corner Accent Notches */}
            <div className="sx-corner-bracket top-1.5 left-1.5 border-t border-l" />
            <div className="sx-corner-bracket top-1.5 right-1.5 border-t border-r" />
            <div className="sx-corner-bracket bottom-1.5 left-1.5 border-b border-l" />
            <div className="sx-corner-bracket bottom-1.5 right-1.5 border-b border-r" />

            {/* Top NISAR Mission Status Ribbon */}
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2 mb-3 bg-cyan-950/20 px-2.5 py-1.5 rounded border border-cyan-500/20">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-mono text-[8.5px] font-bold tracking-[0.22em] uppercase text-cyan-300">
                  NASA-ISRO NISAR OBSERVATORY
                </span>
              </div>
              <span className="font-mono text-[8px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-500/30">
                L+S DUAL-BAND
              </span>
            </div>

            {/* Zone Title & Tagline */}
            <h2 className="font-['Cinzel',serif] text-base sm:text-lg text-white font-medium mb-1">
              {activeZone.title}
            </h2>
            <p className="font-mono text-[8px] tracking-[0.20em] uppercase text-cyan-400/80 mb-2">
              {activeZone.tagline}
            </p>

            {/* In-depth Radar Science Description */}
            <p className="text-xs text-slate-300 leading-relaxed font-light mb-3">
              {activeZone.desc}
            </p>

            {/* NISAR SAR Mode Selector */}
            <div className="flex items-center gap-1.5 mb-3 font-mono text-[8px]">
              <span className="text-white/40 uppercase tracking-wider text-[7.5px]">SAR BAND:</span>
              {['L-BAND', 'S-BAND', 'InSAR'].map((band) => (
                <button
                  key={band}
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveSarBand(band);
                  }}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    activeSarBand === band
                      ? 'bg-cyan-400 text-black font-bold shadow'
                      : 'bg-white/[0.04] text-white/50 border border-white/10 hover:text-white'
                  }`}
                >
                  {band}
                </button>
              ))}
            </div>

            {/* Key Telemetry Matrix Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-white/10 font-mono text-[8.5px] mb-4">
              {activeZone.metrics.map((m, idx) => (
                <div key={idx} className="bg-white/[0.04] p-2 rounded border border-white/5">
                  <span className="text-white/40 block tracking-widest text-[7.5px] mb-0.5 truncate">{m.label}</span>
                  <span className="text-cyan-200 font-medium tracking-wider">{m.val}</span>
                </div>
              ))}
            </div>

            {/* Quick Navigation Buttons (Prev / Next Act) */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[9px] font-mono">
              <button
                onClick={() => selectZone((selectedIndex - 1 + TERRAIN_ZONES.length) % TERRAIN_ZONES.length)}
                className="text-white/50 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded hover:bg-white/5"
              >
                ← PREV ACT
              </button>
              <span className="text-white/30">|</span>
              <button
                onClick={() => selectZone((selectedIndex + 1) % TERRAIN_ZONES.length)}
                className="text-white/50 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded hover:bg-white/5"
              >
                NEXT ACT →
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================
          3. BOTTOM CONTROLS & ACT SELECTOR CHIPS
          (Generous pl-32 padding ensures ZERO overlap with fixed Sound Control)
      ======================================================== */}
      <footer className={`relative z-20 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/10 transition-all duration-700 delay-400 pl-2 sm:pl-32 md:pl-36 ${
        hasEnteredView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        
        {/* Center/Left: Act Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/40 mr-1 hidden sm:inline">
            SELECT ACT:
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
                    ? 'bg-cyan-400 text-black font-semibold shadow-lg scale-105'
                    : 'bg-white/[0.05] border border-white/10 text-white/60 hover:text-white hover:border-white/30'
                }`}
              >
                {zone.actRoman} // {zone.title.replace(/^Act [I|V|X]+: /, '').split(' ')[0]}
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
