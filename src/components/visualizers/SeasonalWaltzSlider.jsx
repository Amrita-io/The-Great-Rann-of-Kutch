import React, { useState, useRef, useCallback } from 'react';
import { SlidersHorizontal, ArrowLeftRight, Droplets, Leaf, Sparkles, Compass } from 'lucide-react';

/**
 * SeasonalWaltzSlider
 * 
 * Interactive Before / After seasonal split-screen comparison slider.
 * Lets the user wipe across the exact same geographic radar footprint
 * to experience the seasonal "dance" of the Great Rann of Kutch:
 * August Monsoon Flood <---> October Green Savanna <---> January White Salt Mirror
 */
export default function SeasonalWaltzSlider() {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 - 100
  const [leftSeason, setLeftSeason] = useState('monsoon'); // 'monsoon' | 'greenery' | 'winter'
  const [rightSeason, setRightSeason] = useState('greenery');
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);

  const seasonsData = {
    monsoon: {
      id: 'monsoon',
      title: 'AUGUST MONSOON FLOOD',
      subtitle: 'MEASURED INUNDATION BASIN',
      tag: 'SPECULAR WATER NULL (< -20.0 dB)',
      color: '#38bdf8',
      accentBg: 'bg-sky-500',
      badgeClass: 'text-sky-300 border-sky-400/40 bg-sky-950/60',
      imgSrc: '/assets/layers/nisar_square_monsoon_change.webp',
      dielectric: '78.2 εr (Saline Runoff)',
      roughness: '0.4 cm RMS (Micro-Smooth)',
      backscatter: '< -20.0 dB',
      significance: 'Calm water deflects microwaves away into space. Cloud-piercing SAR maps flood boundaries in real time.',
      icon: Droplets
    },
    greenery: {
      id: 'greenery',
      title: 'OCTOBER SAVANNA BLOOM',
      subtitle: '~2,618 KM² BANNI GRASSLAND',
      tag: 'HV VOLUME SCATTERING (-21.0 dB)',
      color: '#10b981',
      accentBg: 'bg-emerald-500',
      badgeClass: 'text-emerald-300 border-emerald-400/40 bg-emerald-950/60',
      imgSrc: '/assets/layers/nisar_square_biomass_carbon.webp',
      dielectric: '24.5 εr (Moist Organic Silt)',
      roughness: '2.4 cm RMS (Canopy Stalks)',
      backscatter: '-16.2 dB',
      significance: 'Microwaves bounce inside grass stems, rotating polarization into the HV channel to measure dry forage yield.',
      icon: Leaf
    },
    winter: {
      id: 'winter',
      title: 'JANUARY SALT CRUST',
      subtitle: 'THE WHITE DESERT & BRINE',
      tag: 'SUBSURFACE REFLECTION (-18.8 dB)',
      color: '#fbbf24',
      accentBg: 'bg-amber-500',
      badgeClass: 'text-amber-300 border-amber-400/40 bg-amber-950/60',
      imgSrc: '/assets/layers/nisar_subsurface_moisture.webp',
      dielectric: 'ε′ ≈ 5.9 (Dry Halite) / σ > 5 S/m (Brine)',
      roughness: '1.2 cm RMS (Halite Polygons)',
      backscatter: '-18.8 dB',
      significance: 'Low dielectric loss allows 24cm microwaves to penetrate dry surface salt crust to detect damp subsoil interfaces.',
      icon: Sparkles
    }
  };

  const leftInfo = seasonsData[leftSeason];
  const rightInfo = seasonsData[rightSeason];

  // Mouse / Touch drag handlers for smooth split wipe
  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedPct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(clampedPct);
  }, []);

  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    handleMove(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    handleMove(e.clientX);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="w-full flex flex-col gap-6 select-none text-left">

      {/* TOP COMPARISON SELECTOR PILLS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-white/10 gap-3">
        <div className="flex items-center gap-2 text-xs font-mono">
          <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
          <span className="text-white font-bold uppercase tracking-wider">SEASONAL TIME-WARP SLIDER:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-mono">
          <span className="text-white/50">COMPARE:</span>
          <button
            onClick={() => { setLeftSeason('monsoon'); setRightSeason('greenery'); }}
            className={`px-3 py-1 rounded-full border transition-all cursor-pointer ${leftSeason === 'monsoon' && rightSeason === 'greenery'
              ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
              : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/15'
              }`}
          >
            FLOOD vs SAVANNA
          </button>
          <button
            onClick={() => { setLeftSeason('monsoon'); setRightSeason('winter'); }}
            className={`px-3 py-1 rounded-full border transition-all cursor-pointer ${leftSeason === 'monsoon' && rightSeason === 'winter'
              ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
              : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/15'
              }`}
          >
            FLOOD vs SALT CRUST
          </button>
          <button
            onClick={() => { setLeftSeason('greenery'); setRightSeason('winter'); }}
            className={`px-3 py-1 rounded-full border transition-all cursor-pointer ${leftSeason === 'greenery' && rightSeason === 'winter'
              ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
              : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/15'
              }`}
          >
            SAVANNA vs SALT CRUST
          </button>
        </div>
      </div>

      {/* INTERACTIVE SPLIT-VIEW WIPE CONTAINER */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[520px] rounded-3xl overflow-hidden bg-black border-2 border-white/20 shadow-2xl cursor-ew-resize group"
      >
        {/* RIGHT LAYER (Background image) */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={rightInfo.imgSrc}
            alt={rightInfo.title}
            className="w-full h-full object-cover"
          />
          {/* Subtle radar grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        </div>

        {/* LEFT LAYER (Clipped overlay) */}
        <div
          className="absolute inset-0 h-full overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={leftInfo.imgSrc}
            alt={leftInfo.title}
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{
              width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
              height: '100%'
            }}
          />
          {/* Subtle radar grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        </div>

        {/* DIVIDER HANDLE */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize pointer-events-none shadow-[0_0_15px_rgba(255,255,255,0.8)] z-20"
          style={{ left: `${sliderPos}%` }}
        >
          {/* Center Grab Pip */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950 border-2 border-white text-white flex items-center justify-center shadow-2xl">
            <SlidersHorizontal className="w-4 h-4 text-cyan-300" />
          </div>
        </div>

        {/* HUD BADGES: Left side (Current Left Season) */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-1 items-start">
          <div className={`px-3 py-1 rounded-full border text-[10px] font-mono font-bold tracking-wider backdrop-blur-md uppercase ${leftInfo.badgeClass}`}>
            <span>◀ {leftInfo.title}</span>
          </div>
          <span className="text-[9.5px] font-mono text-white/80 bg-black/75 px-2 py-0.5 rounded backdrop-blur-md">
            {leftInfo.tag}
          </span>
        </div>

        {/* HUD BADGES: Right side (Current Right Season) */}
        <div className="absolute top-4 right-4 z-20 pointer-events-none flex flex-col gap-1 items-end">
          <div className={`px-3 py-1 rounded-full border text-[10px] font-mono font-bold tracking-wider backdrop-blur-md uppercase ${rightInfo.badgeClass}`}>
            <span>{rightInfo.title} ▶</span>
          </div>
          <span className="text-[9.5px] font-mono text-white/80 bg-black/75 px-2 py-0.5 rounded backdrop-blur-md">
            {rightInfo.tag}
          </span>
        </div>

        {/* Bottom Coordinates & Scale */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex items-center gap-2 px-3 py-1 rounded-full bg-black/80 border border-white/20 text-[9px] font-mono text-white/70 backdrop-blur-md">
          <Compass className="w-3.5 h-3.5 text-cyan-300" />
          <span>23°48'N, 69°50'E</span>
          <span className="text-white/30">•</span>
          <span>160 KM² CALIBRATED SWATH</span>
        </div>

        {/* Bottom Hint */}
        <div className="absolute bottom-4 right-4 z-20 pointer-events-none px-3 py-1 rounded-full bg-black/80 border border-white/20 text-[9px] font-mono text-white/70 backdrop-blur-md">
          <span>DRAG SLIDER TO REVEAL SEASONAL DANCE</span>
        </div>
      </div>

      {/* SIDE-BY-SIDE PHYSICAL ATTRIBUTE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Left Season Physical Profile */}
        <div className="p-4 rounded-2xl bg-black/50 border border-white/15 backdrop-blur-xl flex flex-col gap-2">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-mono font-bold tracking-wider" style={{ color: leftInfo.color }}>
              {leftInfo.title}
            </span>
            <span className="text-[9.5px] font-mono text-white/50">{leftInfo.subtitle}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono">
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[8.5px] text-white/50">BACKSCATTER</div>
              <div className="text-xs font-bold text-white mt-0.5">{leftInfo.backscatter}</div>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[8.5px] text-white/50">DIELECTRIC</div>
              <div className="text-xs font-bold text-white mt-0.5">{leftInfo.dielectric.split(' ')[0]}</div>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[8.5px] text-white/50">ROUGHNESS</div>
              <div className="text-xs font-bold text-white mt-0.5">{leftInfo.roughness.split(' ')[0]}</div>
            </div>
          </div>
          <p className="text-xs text-white/70 leading-relaxed font-sans mt-1">
            {leftInfo.significance}
          </p>
        </div>

        {/* Right Season Physical Profile */}
        <div className="p-4 rounded-2xl bg-black/50 border border-white/15 backdrop-blur-xl flex flex-col gap-2">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-mono font-bold tracking-wider" style={{ color: rightInfo.color }}>
              {rightInfo.title}
            </span>
            <span className="text-[9.5px] font-mono text-white/50">{rightInfo.subtitle}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono">
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[8.5px] text-white/50">BACKSCATTER</div>
              <div className="text-xs font-bold text-white mt-0.5">{rightInfo.backscatter}</div>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[8.5px] text-white/50">DIELECTRIC</div>
              <div className="text-xs font-bold text-white mt-0.5">{rightInfo.dielectric.split(' ')[0]}</div>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="text-[8.5px] text-white/50">ROUGHNESS</div>
              <div className="text-xs font-bold text-white mt-0.5">{rightInfo.roughness.split(' ')[0]}</div>
            </div>
          </div>
          <p className="text-xs text-white/70 leading-relaxed font-sans mt-1">
            {rightInfo.significance}
          </p>
        </div>

      </div>

    </div>
  );
}

