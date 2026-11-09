import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soundEngine } from '../utils/audio';

// Interactive Diorama Hotspots with authentic Kutchi cartographic context
const DIORAMA_ZONES = {
  bhunga: {
    id: 'bhunga',
    code: '01',
    category: 'VERNACULAR ARCHITECTURE',
    title: 'RABARI BHUNGA DWELLING',
    subtitle: 'EARTHQUAKE-RESISTANT CYLINDRICAL SHELTER',
    bullet1: 'MUD-AND-THATCH CYLINDER (AERODYNAMIC WINDBREAK)',
    bullet2: 'LIPPAN KAAM (INTERIOR CAMEL-DUNG & CONVEX MIRROR EMBED)',
    action: '-> ARTISANAL CLIMATE REGULATION (COOL IN 48°C SUMMER)',
    description:
      'Engineered over centuries by pastoral Rabari and Meghwal communities, the circular Bhunga survived the catastrophic 2001 Bhuj earthquake undamaged. Built from indigenous clay, straw, and cow dung, its conical thatch roof breathes naturally while intricate white clay Lippan mirror murals reflect desert lantern light.',
    loupeSrc: '/assets/kutch_loupe_bhunga.png',
    pos: { x: 50, y: 28 },
    loupePos: { top: '16%', left: '46%' }
  },
  salt: {
    id: 'salt',
    code: '02',
    category: 'HALITE BASIN',
    title: 'THE INFINITE WHITE DESERT',
    subtitle: '7,505 SQ KM PURE SODIUM CHLORIDE CRUST',
    bullet1: 'ANCIENT ARABIAN SEA ARM DESICCATION',
    bullet2: 'SPECULAR MICROWAVE RADAR MIRROR (RADAR NULL)',
    action: '-> PURE CRYSTALLINE REFLECTANCE UNDER MOONLIGHT',
    description:
      'As summer monsoons recede under fierce desert winds, solar evaporation crystallizes a subterranean hypersaline sea into a vast, blinding white blanket of pure sodium chloride (halite). With vertical relief under 30 cm across thousands of kilometers, it is Earth’s flattest natural surface and NASA/ISRO’s premier radar mirror.',
    loupeSrc: '/assets/kutch_loupe_salt.png',
    pos: { x: 30, y: 52 },
    loupePos: { top: '48%', left: '22%' }
  },
  lagoon: {
    id: 'lagoon',
    code: '03',
    category: 'HYPERSALINE INLET',
    title: 'FLAMINGO LAGOON & BRINE TIDAL VEIN',
    subtitle: 'VITAL SANCTUARY FOR 50,000+ MIGRATORY WADERS',
    bullet1: 'CAROTENOID-RICH ARTEMIA BRINE SHRIMP HABITAT',
    bullet2: 'TIDAL INGRESS VIA KORI CREEK AND ARABIAN GULF',
    action: '-> ASIA’S LARGEST GREATER & LESSER FLAMINGO BREEDING CRADLE',
    description:
      'Shallow brackish channels cut through the western salt crust, connecting the desert to the Arabian Sea. The hypersaline water explodes with carotenoid-rich Artemia salina (brine shrimp), feeding over 50,000 Greater and Lesser Flamingos that nest on isolated mud islands colloquially known as Flamingo City.',
    loupeSrc: '/assets/kutch_loupe_water.png',
    pos: { x: 70, y: 52 },
    loupePos: { top: '48%', left: '68%' }
  },
  caravan: {
    id: 'caravan',
    code: '04',
    category: 'NOMADIC PASSAGE',
    title: 'DROMEDARY CAMEL CARAVAN',
    subtitle: 'HISTORICAL SALT & NATURAL INDIGO CORRIDOR',
    bullet1: 'KUTCHI DROMEDARY & SWIMMING KHARAI CAMELS',
    bullet2: 'TRANS-BORDER TRADING TRAILS THROUGH SINDH',
    action: '-> ENDURING ALLIANCE OF JAT & RABARI PASTORALISTS',
    description:
      'Strings of hardy desert camels navigate compacted salt ridges and thorn-scrub verges, carrying hand-harvested rock salt, Ajrakh block-printed indigo textiles, and Kutchi shawls. The region also hosts the indigenous Kharai camel, uniquely adapted to swim up to three kilometers in mangrove seawater channels.',
    loupeSrc: '/assets/kutch_loupe_salt.png',
    pos: { x: 48, y: 48 },
    loupePos: { top: '44%', left: '44%' }
  },
  undercut: {
    id: 'undercut',
    code: '05',
    category: 'SUBTERRANEAN BASE',
    title: 'TECTONIC STRATIGRAPHY & ROOT BED',
    subtitle: 'EARTH CRUST SUSPENDED OVER HYPERSALINE BRINE',
    bullet1: 'GYPSUM, SILT & SEDIMENTARY ALLUVIAL VEINS',
    bullet2: 'ALLA BUND TECTONIC FAULT RIDGE BASELINE',
    action: '-> UNTETHERED DIORAMA FLOATING IN PERCEPTUAL SPACE',
    description:
      'Beneath the dazzling white halite surface lies a saturated geological matrix of compacted desert silt, gypsum veins, and subterranean brine aquifers. Suspended in perceptual 3D cartography, the undercut bedrock reveals exposed mineral stalactites, suspended salt pebbles, and deep geological roots.',
    loupeSrc: '/assets/kutch_loupe_bhunga.png',
    pos: { x: 50, y: 82 },
    loupePos: { top: '76%', left: '48%' }
  }
};

export default function KutchRealityDioramaView({ onReturnToOrbit }) {
  const [selectedZone, setSelectedZone] = useState('bhunga');
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to clean stark white editorial layout
  const [activeLoupe, setActiveLoupe] = useState('bhunga');
  const [timeStr, setTimeStr] = useState('08:00:00 AM');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHoveringIsland, setIsHoveringIsland] = useState(false);
  const containerRef = useRef(null);
  const islandRef = useRef(null);

  const currentZone = DIORAMA_ZONES[selectedZone];

  // Live ticking clock formatted to Bhuj, Gujarat (IST / UTC+5:30)
  useEffect(() => {
    const updateClock = () => {
      try {
        const now = new Date();
        const options = {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        };
        setTimeStr(new Intl.DateTimeFormat('en-US', options).format(now));
      } catch (e) {
        setTimeStr('08:00:24 AM');
      }
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Smooth 3D mouse parallax tracking
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width; // 0 to 1
    const ny = (e.clientY - rect.top) / rect.height; // 0 to 1

    // Moderate, elegant 3D tilt angles
    const tiltX = (ny - 0.5) * -18; // degrees
    const tiltY = (nx - 0.5) * 24;  // degrees
    setTilt({ x: tiltX, y: tiltY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setIsHoveringIsland(false);
  }, []);

  return (
    <section
      ref={containerRef}
      id="sx-kutch-reality-section"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full min-h-screen overflow-hidden transition-colors duration-500 select-none ${
        isDarkMode
          ? 'bg-[#06080d] text-[#f1f5f9]'
          : 'bg-[#fafafa] text-[#0f172a]'
      } font-['Inter',system-ui,sans-serif] p-4 sm:p-8 md:p-12 flex flex-col justify-between`}
    >
      <style>{`
        /* Fine Technical Hairline Grid */
        .sx-tech-grid-light {
          background-image: 
            linear-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
          background-size: 80px 80px;
        }

        .sx-tech-grid-dark {
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
          background-size: 80px 80px;
        }

        /* 3D Levitation & Tilt Physics */
        .sx-island-levitate {
          animation: sx-floating-island 6s ease-in-out infinite alternate;
        }

        @keyframes sx-floating-island {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          100% {
            transform: translateY(-16px) rotate(0.6deg);
          }
        }

        /* Technical Callout Pulsing Node */
        .sx-pointer-node {
          width: 8px;
          height: 8px;
          border: 1.5px solid currentColor;
          background: #fafafa;
          box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.1);
        }

        .sx-tech-card-glass {
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(15, 23, 42, 0.15);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.07);
        }

        .sx-tech-card-dark {
          background: rgba(12, 16, 25, 0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.65);
        }

        /* Frosted Glass Loupe Detail Frame */
        .sx-glass-loupe {
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 4px;
          border: 1.5px solid rgba(15, 23, 42, 0.35);
          backdrop-filter: blur(1.5px);
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
        }

        .sx-glass-loupe:hover {
          transform: scale(1.18) translateZ(40px);
          border-color: #0f172a;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.22);
          z-index: 40;
        }
      `}</style>

      {/* Background Micro Grid Layer */}
      <div
        className={`absolute inset-0 pointer-events-none z-0 ${
          isDarkMode ? 'sx-tech-grid-dark' : 'sx-tech-grid-light'
        }`}
      />

      {/* Grid Hairline Crosshairs (+) */}
      <div className="absolute top-12 left-12 text-[11px] font-mono text-current/30 pointer-events-none">+</div>
      <div className="absolute top-12 right-12 text-[11px] font-mono text-current/30 pointer-events-none">+</div>
      <div className="absolute bottom-12 left-12 text-[11px] font-mono text-current/30 pointer-events-none">+</div>
      <div className="absolute bottom-12 right-12 text-[11px] font-mono text-current/30 pointer-events-none">+</div>
      <div className="absolute top-1/2 left-8 -translate-y-1/2 text-[11px] font-mono text-current/25 pointer-events-none">+</div>
      <div className="absolute top-1/2 right-8 -translate-y-1/2 text-[11px] font-mono text-current/25 pointer-events-none">+</div>

      {/* ========================================================
          1. TOP NAVIGATION HEADER (Matching Sutēra / Reference Layout)
      ======================================================== */}
      <header className="relative z-20 flex items-center justify-between gap-4">
        {/* Brand / Chapter Tag */}
        <div className="flex items-center gap-3">
          <span className="font-['Cinzel',serif] text-sm md:text-base font-semibold tracking-[0.22em] uppercase text-current">
            SAANS
          </span>
          <span className="text-[10px] font-mono tracking-widest text-current/40 uppercase">
            // KUTCH DIORAMA
          </span>
        </div>

        {/* Center Pill: Mode Switcher & Coordinates */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playClick();
              setIsDarkMode(!isDarkMode);
            }}
            onMouseEnter={() => soundEngine.playHover()}
            className={`px-3 py-1 rounded-full border text-[9.5px] font-mono tracking-widest uppercase transition-all cursor-pointer flex items-center gap-2 ${
              isDarkMode
                ? 'border-white/20 bg-white/5 hover:bg-white/10 text-white'
                : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-sm'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>CHANGE REALITY</span>
            <span className="text-[8px] opacity-60">({isDarkMode ? 'DARK' : 'LIGHT'})</span>
          </button>
        </div>

        {/* Right Corner: Live Time & Options */}
        <div className="flex items-center gap-4 text-[9.5px] font-mono tracking-widest uppercase">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-current/45 text-[8px]">LOCAL TIME</span>
            <span className="font-semibold text-current">BHUJ {timeStr}</span>
          </div>

          {/* Return to Orbit Button */}
          {onReturnToOrbit && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onReturnToOrbit();
              }}
              onMouseEnter={() => soundEngine.playHover()}
              className={`px-3.5 py-1 rounded-md border text-[9px] font-mono tracking-widest uppercase transition-all cursor-pointer ${
                isDarkMode
                  ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-200 hover:bg-cyan-900/60'
                  : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100 shadow-sm'
              }`}
            >
              ← ORBIT
            </button>
          )}

          <div
            className={`w-6 h-6 rounded flex items-center justify-center border text-[10px] cursor-pointer ${
              isDarkMode ? 'border-white/20' : 'border-slate-300 bg-white'
            }`}
          >
            +
          </div>
        </div>
      </header>

      {/* ========================================================
          2. MASSIVE HERO HEADLINE (Top-Left, Matching Reference)
      ======================================================== */}
      <div className="relative z-10 mt-6 sm:mt-8 max-w-xl">
        <h1 className="font-['Cinzel',serif] text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-[-0.02em] uppercase leading-[0.92] text-current">
          REALITY,
          <br />
          BY DESIGN.
        </h1>
        <p className="mt-3 text-[10.5px] font-mono tracking-[0.24em] text-current/55 uppercase">
          GREAT RANN OF KUTCH // THE FLOATING HALITE DIORAMA
        </p>
      </div>

      {/* ========================================================
          3. CENTER 3D FLOATING ISLAND (With Multi-Layer Parallax & Loupes)
      ======================================================== */}
      <div
        className="relative z-10 flex-1 flex items-center justify-center my-4 sm:my-8 w-full max-w-6xl mx-auto"
        style={{ perspective: 1200 }}
      >
        {/* 3D Transform Pivot Stage */}
        <div
          ref={islandRef}
          className="relative flex items-center justify-center transition-transform duration-200 ease-out"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transformStyle: 'preserve-3d'
          }}
          onMouseEnter={() => setIsHoveringIsland(true)}
        >
          {/* Layer 0: Ground Contact Ambient Occlusion Shadow */}
          <div
            className="absolute -bottom-16 sm:-bottom-24 w-[120%] max-w-[780px] pointer-events-none transition-all duration-300"
            style={{
              transform: `translateZ(-60px) scale(${isHoveringIsland ? 0.94 : 1.0})`,
              opacity: isDarkMode ? 0.6 : 0.85
            }}
          >
            <img
              src="/assets/kutch_island_shadow.png"
              alt="Diorama Shadow"
              className="w-full h-auto object-contain select-none"
            />
          </div>

          {/* Layer 1: High-Resolution 3D Floating Island (Cutout with Enhanced Textures) */}
          <div
            className="relative z-20 sx-island-levitate cursor-pointer select-none"
            style={{
              transform: 'translateZ(10px)'
            }}
          >
            <img
              src="/assets/kutch_island_3d.png"
              alt="Great Rann of Kutch 3D Floating Island"
              className="w-[90vw] max-w-[620px] sm:max-w-[700px] md:max-w-[780px] h-auto object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.18)]"
              draggable={false}
            />

            {/* Dynamic Specular Sheen Layer that Glides with Mouse Tilt */}
            <div
              className="absolute inset-0 pointer-events-none mix-blend-overlay transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at ${50 + tilt.y * 1.5}% ${50 - tilt.x * 1.5}%, rgba(255,255,255,0.45) 0%, transparent 60%)`,
                opacity: isHoveringIsland ? 0.85 : 0.2
              }}
            />

            {/* ========================================================
                FROSTED GLASS INSPECTION LOUPES (Hover Magnifier Frames)
                (Exact feature from the reference image!)
            ======================================================== */}
            {/* Loupe 1: Bhunga Thatch & Lippan Art */}
            <div
              onClick={() => {
                soundEngine.playClick();
                setSelectedZone('bhunga');
                setActiveLoupe('bhunga');
              }}
              onMouseEnter={() => soundEngine.playHover()}
              className="sx-glass-loupe hidden sm:block top-[20%] left-[44%] border-current/40 hover:border-current cursor-pointer group"
              style={{ transform: 'translateZ(35px)' }}
              title="Click to inspect Rabari Bhunga Dwelling"
            >
              <img
                src="/assets/kutch_loupe_bhunga.png"
                alt="Bhunga Detail"
                className="w-full h-full object-cover transform group-hover:scale-125 transition-transform duration-500"
              />
              <span className="absolute bottom-0.5 right-1 text-[7px] font-mono bg-black/75 text-white px-1 rounded">
                01
              </span>
            </div>

            {/* Loupe 2: Crystalline White Halite Salt Flat */}
            <div
              onClick={() => {
                soundEngine.playClick();
                setSelectedZone('salt');
                setActiveLoupe('salt');
              }}
              onMouseEnter={() => soundEngine.playHover()}
              className="sx-glass-loupe hidden sm:block top-[45%] left-[26%] border-current/40 hover:border-current cursor-pointer group"
              style={{ transform: 'translateZ(30px)' }}
              title="Click to inspect Great Salt Flats"
            >
              <img
                src="/assets/kutch_loupe_salt.png"
                alt="Salt Detail"
                className="w-full h-full object-cover transform group-hover:scale-125 transition-transform duration-500"
              />
              <span className="absolute bottom-0.5 right-1 text-[7px] font-mono bg-black/75 text-white px-1 rounded">
                02
              </span>
            </div>

            {/* Loupe 3: Flamingo Lagoon Inlet */}
            <div
              onClick={() => {
                soundEngine.playClick();
                setSelectedZone('lagoon');
                setActiveLoupe('lagoon');
              }}
              onMouseEnter={() => soundEngine.playHover()}
              className="sx-glass-loupe hidden sm:block top-[45%] left-[68%] border-current/40 hover:border-current cursor-pointer group"
              style={{ transform: 'translateZ(30px)' }}
              title="Click to inspect Flamingo Lagoon Inlet"
            >
              <img
                src="/assets/kutch_loupe_water.png"
                alt="Lagoon Detail"
                className="w-full h-full object-cover transform group-hover:scale-125 transition-transform duration-500"
              />
              <span className="absolute bottom-0.5 right-1 text-[7px] font-mono bg-black/75 text-white px-1 rounded">
                03
              </span>
            </div>
          </div>

          {/* ========================================================
              TECHNICAL LEADER LINES & CALLOUT LABELS (Matching Reference)
          ======================================================== */}
          {/* Callout Left: "FROM DEEP ROOTS..." */}
          <div
            className="hidden lg:flex absolute top-[28%] -left-28 flex-col items-end text-right z-30 pointer-events-auto"
            style={{ transform: 'translateZ(40px)' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-[8.5px] font-mono tracking-widest text-current/70 max-w-[190px] leading-tight">
                FROM DEEP ROOTS, THE SALT BASIN DRAWS STILLNESS
              </span>
              <div className="w-16 h-[1px] bg-current/30" />
              <div
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedZone('salt');
                }}
                className="sx-pointer-node cursor-pointer hover:scale-125 transition-transform"
                title="Inspect Salt Flat"
              />
            </div>
          </div>

          {/* Callout Top-Right: "WHERE IMAGINATION..." */}
          <div
            className="hidden lg:flex absolute top-[14%] right-2 flex-col items-start z-30 pointer-events-auto"
            style={{ transform: 'translateZ(45px)' }}
          >
            <div className="flex items-center gap-3">
              <div
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedZone('bhunga');
                }}
                className="sx-pointer-node cursor-pointer hover:scale-125 transition-transform"
                title="Inspect Bhunga"
              />
              <div className="w-16 h-[1px] bg-current/30" />
              <span className="text-[8.5px] font-mono tracking-widest text-current/70 max-w-[210px] leading-tight">
                WHERE ARID DESERTS BRANCH INTO VIBRANT INDIGO & MUD ARCHITECTURE
              </span>
            </div>
          </div>

          {/* Callout Bottom: "FOUNDATION DESIGNED FOR GROWTH" */}
          <div
            className="hidden lg:flex absolute -bottom-6 left-1/2 -translate-x-1/2 flex-col items-center z-30 pointer-events-auto"
            style={{ transform: 'translateZ(30px)' }}
          >
            <div
              onClick={() => {
                soundEngine.playClick();
                setSelectedZone('undercut');
              }}
              className="sx-pointer-node cursor-pointer hover:scale-125 transition-transform mb-2"
              title="Inspect Subterranean Bedrock"
            />
            <div className="w-[1px] h-10 bg-current/30" />
            <div className="px-3 py-1 border border-current/25 rounded text-[8px] font-mono tracking-widest uppercase mt-2 bg-current/5">
              FOUNDATION CARVED BY ANCIENT ARABIAN TIDES
            </div>
          </div>

        </div>

        {/* ========================================================
            RIGHT FLOATING TECHNICAL CARD (Matching "SUTĒRA // 05" in Reference)
        ======================================================== */}
        <div
          className={`absolute top-4 sm:top-12 right-2 sm:right-6 md:right-10 z-40 w-72 sm:w-80 rounded-xl p-4 sm:p-5 transition-all ${
            isDarkMode ? 'sx-tech-card-dark' : 'sx-tech-card-glass'
          }`}
          style={{ transform: 'translateZ(50px)' }}
        >
          {/* Card Header Bar */}
          <div className="flex items-center justify-between border-b border-current/15 pb-2.5 mb-3">
            <span className="font-['Cinzel',serif] text-xs font-bold tracking-[0.2em] uppercase text-current">
              KUTCH
            </span>
            <span className="text-[9px] font-mono text-current/50 px-1.5 py-0.5 rounded border border-current/20">
              //{currentZone.code}
            </span>
          </div>

          {/* Zone Title & Dynamic Bullets */}
          <div className="space-y-1.5 font-mono text-[9px] tracking-wider text-current/80">
            <div className="flex items-center gap-1.5 font-semibold text-current">
              <span>•</span>
              <span>{currentZone.title}</span>
            </div>
            <div className="text-[8px] text-current/60 pl-3 leading-relaxed">
              {currentZone.subtitle}
            </div>
            <div className="text-[8px] text-current/75 pl-3">
              - {currentZone.bullet1}
            </div>
            <div className="text-[8.5px] font-semibold text-emerald-600 dark:text-emerald-400 pl-3 pt-1">
              {currentZone.action}
            </div>
          </div>

          {/* Description Prose */}
          <p className="mt-3.5 pt-3 border-t border-current/10 text-[10px] leading-relaxed text-current/75 font-light">
            {currentZone.description}
          </p>

          {/* Interactive Zone Switcher Buttons */}
          <div className="mt-4 pt-2.5 border-t border-current/10 flex items-center justify-between gap-1 text-[8px] font-mono">
            {Object.keys(DIORAMA_ZONES).map((zKey) => (
              <button
                key={zKey}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedZone(zKey);
                }}
                onMouseEnter={() => soundEngine.playHover()}
                className={`px-2 py-0.5 rounded uppercase tracking-wider transition-all cursor-pointer ${
                  selectedZone === zKey
                    ? 'bg-current text-white dark:text-black font-bold'
                    : 'text-current/50 hover:text-current'
                }`}
              >
                {DIORAMA_ZONES[zKey].code}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================
          4. BOTTOM ROW TECHNICAL CARDS (Matching Reference Layout)
      ======================================================== */}
      <footer className="relative z-20 flex flex-col md:flex-row items-stretch md:items-end justify-between gap-6 pt-4 border-t border-current/10">
        
        {/* Bottom-Left Block: [ CORE THREADS OF MY WORK ] */}
        <div className="flex flex-col gap-2 max-w-sm">
          <div className="text-[9.5px] font-mono tracking-[0.24em] uppercase text-current/70 font-semibold">
            [ CORE THREADS OF KUTCH CARTOGRAPHY ]
          </div>

          <div className="flex items-center gap-4">
            {/* Radar / Cartographic Icon Grid */}
            <div
              className={`w-12 h-12 rounded border flex items-center justify-center text-[8px] font-mono shrink-0 ${
                isDarkMode ? 'border-white/20 bg-white/5' : 'border-slate-300 bg-white'
              }`}
            >
              <div className="w-8 h-8 border border-current/30 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 border-t border-r border-current/60" />
              </div>
            </div>

            {/* List with Hatched Progress Bars */}
            <div className="flex-1 space-y-1 font-mono text-[8px] tracking-wider text-current/80">
              <div className="flex items-center justify-between">
                <span>01. HALITE CRUST // 7,505 SQ KM</span>
                <span className="text-current/40">100%</span>
              </div>
              <div className="w-full h-1 bg-current/10 rounded-full overflow-hidden">
                <div className="w-full h-full bg-current/40" />
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <span>02. VERNACULAR EMBODIMENT // BHUNGA</span>
                <span className="text-current/40">98%</span>
              </div>
              <div className="w-full h-1 bg-current/10 rounded-full overflow-hidden">
                <div className="w-[98%] h-full bg-current/40" />
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <span>03. TIDAL VEIN // PHOENICOPTERUS</span>
                <span className="text-current/40">92%</span>
              </div>
              <div className="w-full h-1 bg-current/10 rounded-full overflow-hidden">
                <div className="w-[92%] h-full bg-current/40" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom-Right Block: [ NOT A STUDIO — JUST ME / PROSE & LINKS ] */}
        <div
          className={`p-3.5 sm:p-4 rounded-xl border max-w-sm ${
            isDarkMode ? 'border-white/15 bg-white/[0.03]' : 'border-slate-300 bg-white/80'
          }`}
        >
          <div className="flex items-center justify-between border-b border-current/10 pb-1.5 mb-2">
            <span className="text-[8.5px] font-mono tracking-widest uppercase font-semibold text-current">
              TERRAIN // GUJARAT, INDIA
            </span>
            <span className="text-[8px] font-mono text-current/40">23.83° N, 70.03° E</span>
          </div>

          <p className="text-[9px] font-mono leading-relaxed text-current/75">
            The Great Rann is a living, breathing landscape carved by monsoon tides and intense solar crystallization. This 3D diorama encapsulates the halite flats, the cylindrical Bhunga sanctuaries, and the migratory flamingo waterways.
          </p>

          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-current/10">
            <button
              onClick={() => {
                soundEngine.playClick();
                setSelectedZone('salt');
              }}
              className="px-2 py-0.5 rounded border border-current/25 text-[8px] font-mono uppercase tracking-wider hover:bg-current/10 transition-colors"
            >
              [ HALITE ]
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setSelectedZone('bhunga');
              }}
              className="px-2 py-0.5 rounded border border-current/25 text-[8px] font-mono uppercase tracking-wider hover:bg-current/10 transition-colors"
            >
              [ BHUNGA ]
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setSelectedZone('lagoon');
              }}
              className="px-2 py-0.5 rounded border border-current/25 text-[8px] font-mono uppercase tracking-wider hover:bg-current/10 transition-colors"
            >
              [ LAGOON ]
            </button>
          </div>
        </div>

      </footer>
    </section>
  );
}
