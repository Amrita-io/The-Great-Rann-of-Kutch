import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Database,
  Radio,
  Volume2,
  VolumeX,
  Droplets,
  Eye,
  X,
  CheckCircle2,
  ShieldCheck,
  CloudRain,
  MapPin,
  Sparkles,
  Layers,
  Activity,
  Compass
} from 'lucide-react';
import { soundEngine } from '../../utils/audio';

/**
 * MonsoonFloodDataView ("THE VANISHING INLAND SEA • MONSOON RADAR OBSERVATORY")
 * 
 * Museum-grade NASA-ISRO NISAR Monsoon Radar Data Showcase:
 * - Bespoke design built specifically for Monsoon Flood Dynamics & Microwave Radar Physics:
 *   1. Left Information Console: Hotspot Dossier (Tidal Ingress, Peak Inundation Sea, Khadir Flamingo Moat).
 *   2. Center Swath Viewport: 100% clean, seamless 160km NISAR radar swath (nisar_august_hh_true.webp)
 *      with interactive pins and live optical storm-cloud comparison lens.
 *   3. Right Observatory Console: Microwave All-Weather Cloud Penetration & Specular Reflection Null Engine.
 *   4. Bottom 4 Metric Cards: Dedicated to monsoon hydrology & radar backscatter physics.
 * - Light Museum Palette (#FAF8F5, #FFFFFF, #1C1917, #D97706), zero unicode emojis.
 */

const MONSOON_HOTSPOTS = [
  {
    id: 'tidal-ingress',
    number: '01',
    claimId: 'CLM_MONSOON_TIDAL_INGRESS',
    name: 'ARABIAN SEA TIDAL INGRESS (WESTERN MUDFLATS)',
    coords: '23.85°N, 69.65°E',
    top: '26%',
    left: '20%',
    floodExtentKm2: '5,563.4 km²',
    backscatterDb: '-23.2 dB',
    surfaceState: 'Tidal Ingress Saturation',
    title: 'THE WESTERN TIDAL FLOODGATE',
    laymanAnalogy: 'Like turning on a massive firehose across a bone-dry flat baking sheet.',
    description:
      'In early July, southwest monsoon winds push Arabian Sea tidal surges up through Kori Creek. Saltwater rushes across low-lying mudflats. Smooth liquid water deflects 24cm radar waves away like a tilted mirror, producing pitch-black channels on the satellite image.',
    image: '/assets/layers/act2_ingress.webp',
    imagePosition: '24% 32%',
    imageBadge: 'NISAR L-BAND • TIDAL INGRESS SWATH'
  },
  {
    id: 'peak-sea',
    number: '02',
    claimId: 'CLM_MONSOON_PEAK_FLOOD',
    name: 'PEAK BASIN INUNDATION SEA (CORE BASIN)',
    coords: '24.05°N, 70.10°E',
    top: '64%',
    left: '38%',
    floodExtentKm2: '20,513.7 km²',
    backscatterDb: '-25.7 dB',
    surfaceState: 'Contiguous Inland Flood Basin',
    title: 'PEAK MONSOON INUNDATION MAPPED THROUGH STORM CLOUDS',
    laymanAnalogy: 'A giant dark mirror under storm clouds that only microwave radar can see.',
    description:
      'By late August, monsoon rainfall runoff and Arabian Sea tides merge to inundate the central basin (up to 20,513 km² dark water mapped in Track 063 Frame 076). Optical satellites are blinded by dark clouds. But NISAR’s 24cm microwaves pass through rain without loss, capturing the specular reflection null of calm water (< -20 dB, dipping to -26.3 dB) in real time.',
    image: '/assets/layers/nisar_august_hh_true.webp',
    imagePosition: 'center',
    imageBadge: 'NISAR L-BAND • PEAK INUNDATION SEA'
  },
  {
    id: 'flamingo-moat',
    number: '03',
    claimId: 'CLM_FLAMINGO_WATER_BARRIER',
    name: 'KHADIR ISLAND WATER BARRIER & FLAMINGO SANCTUARY',
    coords: '24.15°N, 70.45°E',
    top: '32%',
    left: '78%',
    floodExtentKm2: '0.5 - 1.5 m Brine',
    backscatterDb: '-24.8 dB',
    surfaceState: 'Protective Inundation Barrier',
    title: 'NATURAL WATER BARRIER FOR BREEDING FLAMINGOS',
    laymanAnalogy: 'A natural shallow water moat surrounding an ancient island sanctuary.',
    description:
      'Seasonal shallow brine (0.5 to 1.5 m deep, Gujarat Forest Dept) surrounds Khadir Bet. Over half a million Greater and Lesser Flamingos historically breed on elevated mud mounds in Flamingo City, protected by the water barrier from terrestrial predators like desert foxes and jackals.',
    image: '/assets/flamingos_sunset.png',
    imagePosition: 'center',
    imageBadge: 'FLAMINGO SANCTUARY & NATURAL BRINE MOAT'
  }
];

export default function MonsoonFloodDataView({
  onBackToIntro,
  onProceedToDance,
  onReturnToOrbit
}) {
  const [selectedHotspot, setSelectedHotspot] = useState(MONSOON_HOTSPOTS[1]);
  const [viewMode, setViewMode] = useState('compare'); // 'compare' | 'radar'
  const [compareSplit, setCompareSplit] = useState(50); // 0 to 100 percentage
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const containerRef = useRef(null);
  const [showProvenanceModal, setShowProvenanceModal] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(soundEngine.isMuted);

  // Play Breath of the Rann ambient soundtrack on data page
  useEffect(() => {
    soundEngine.playBreathOfTheRann(0.24);
  }, []);

  useEffect(() => {
    const unsub = soundEngine.subscribe((muted) => setIsAudioMuted(muted));
    return unsub;
  }, []);

  const handleToggleSound = () => {
    try {
      soundEngine.playClick();
      soundEngine.toggleMute();
    } catch (e) { }
  };

  const handlePointerDown = (e) => {
    setIsDraggingSlider(true);
    handlePointerMove(e);
  };

  const handlePointerMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setCompareSplit(pct);
  };

  const handlePointerUp = () => {
    setIsDraggingSlider(false);
  };

  return (
    <div className="relative w-full h-screen max-h-screen overflow-hidden bg-[#FAF8F5] text-stone-900 flex flex-col justify-between font-sans selection:bg-amber-200 selection:text-amber-950 pb-14 select-none">

      {/* ========================================================
          1. TOP HEADER BAR
      ======================================================== */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-2.5 bg-white/95 backdrop-blur-xl border-b border-stone-200 flex items-center justify-between gap-4 shadow-sm shrink-0">

        {/* Left: Navigation Actions */}
        <div className="flex items-center gap-2">
          {onBackToIntro && (
            <button
              onClick={() => {
                try { soundEngine.playTransitionSound(); } catch (e) { }
                onBackToIntro();
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 hover:text-stone-900 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-700" />
              <span>MONSOON INTRO</span>
            </button>
          )}

          {onReturnToOrbit && (
            <button
              onClick={() => {
                try { soundEngine.playReturnSound(); } catch (e) { }
                onReturnToOrbit();
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 hover:text-stone-900 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">PLANETARY ORBIT</span>
              <span className="sm:hidden">ORBIT</span>
            </button>
          )}
        </div>

        {/* Center: Editorial Heading + Delimited Subtitle */}
        <div className="text-center flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.25em] text-amber-800 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
            <span>SEASON 02 OF 03 &bull; MONSOON REGIME</span>
          </div>
          <h1 className="text-xs sm:text-sm md:text-base font-['Cinzel',serif] font-bold text-stone-900 tracking-[0.08em] uppercase truncate max-w-sm sm:max-w-md md:max-w-xl">
            THE VANISHING INLAND SEA
          </h1>
          <div className="hidden lg:flex items-center gap-3 text-[9px] font-mono text-stone-500 uppercase tracking-widest mt-0.5">
            <span>PEAK MONSOON INUNDATION &bull; 7,500 KM² BASIN MAPPED THROUGH 100% CLOUD COVER</span>
          </div>
        </div>

        {/* Right: Data Provenance Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              try { soundEngine.playHover(); } catch (e) { }
              setShowProvenanceModal(true);
            }}
            className="px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider bg-white hover:bg-stone-50 border border-amber-600/40 text-amber-900 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Database className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">DATA PROVENANCE</span>
            <span className="sm:hidden">DATA</span>
          </button>
        </div>
      </header>

      {/* ========================================================
          2. MAIN OBSERVATORY STAGE (Refurbished specifically for Monsoon)
             - Top Control Capsule (Flood Extent & Lens Switch)
             - 3-Column Layout:
               [ LEFT: Monsoon Hotspot Dossier Console ]
               [ CENTER: Clean Unobstructed Radar Swath (nisar_august_hh_true.webp) ]
               [ RIGHT: Bespoke Monsoon Cloud Penetration & Specular Reflection Engine ]
             - Bottom 4 Metric Cards
      ======================================================== */}
      <main className="relative w-full flex-1 min-h-0 flex flex-col justify-between p-2.5 sm:p-4 max-w-[1600px] mx-auto overflow-hidden">

        {/* Top Control Bar */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2.5 p-2 sm:p-2.5 rounded-2xl bg-white border border-stone-200 shadow-sm mb-2 shrink-0">

          {/* Left: Monsoon Inundation Readout */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-mono text-xs font-bold flex items-center gap-2">
              <Droplets className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
              <span>FLOOD BASIN EXTENT:</span>
              <span className="text-amber-800 text-sm font-extrabold">{selectedHotspot.floodExtentKm2}</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-stone-600 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
              <span>{selectedHotspot.surfaceState}</span>
            </div>
          </div>

          {/* Center: Inundation Comparison Slider Controller */}
          <div className="flex-1 max-w-xl mx-2 flex items-center gap-3">
            <span className="text-[10px] font-mono font-bold text-sky-800 uppercase whitespace-nowrap">
              JUL 12 (INGRESS)
            </span>
            <input
              type="range"
              min="5"
              max="95"
              value={compareSplit}
              onChange={(e) => {
                setCompareSplit(parseFloat(e.target.value));
                if (viewMode !== 'compare') setViewMode('compare');
              }}
              className="w-full accent-amber-600 cursor-ew-resize h-2 bg-stone-200 rounded-lg"
              title="Drag slider to compare early monsoon ingress vs mid-season peak flood"
            />
            <span className="text-[10px] font-mono font-bold text-amber-800 uppercase whitespace-nowrap">
              AUG 29 (PEAK SEA)
            </span>
          </div>

          {/* Right: View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-100 border border-stone-200">
            <button
              onClick={() => {
                try { soundEngine.playHover(); } catch (e) { }
                setViewMode('compare');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${viewMode === 'compare'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
                }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>FLOOD DYNAMICS SLIDER</span>
            </button>

            <button
              onClick={() => {
                try { soundEngine.playHover(); } catch (e) { }
                setViewMode('radar');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${viewMode === 'radar'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
                }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>PEAK SWATH</span>
            </button>
          </div>

        </div>

        {/* 3-COLUMN STAGE */}
        <div className="flex flex-col lg:flex-row items-stretch gap-3 w-full flex-1 min-h-[420px] sm:min-h-[460px] lg:min-h-[490px] mb-2 overflow-hidden">

          {/* ========================================================
              LEFT COLUMN: DEDICATED MONSOON HOTSPOT DOSSIER
          ======================================================== */}
          <aside className="w-full lg:w-[410px] xl:w-[440px] p-4 rounded-3xl bg-white border border-stone-200 shadow-xl flex flex-col justify-between shrink-0 overflow-y-auto text-left gap-3.5">

            <div className="space-y-3">

              {/* Pin Switcher Tabs */}
              <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-800 font-bold uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>MONSOON DOSSIER</span>
                </div>

                <div className="flex items-center gap-1">
                  {MONSOON_HOTSPOTS.map((h) => {
                    const isCurrent = selectedHotspot.id === h.id;
                    return (
                      <button
                        key={h.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          try { soundEngine.playClick(); } catch (err) { }
                          setSelectedHotspot(h);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[9.5px] font-mono uppercase transition-all cursor-pointer font-bold ${isCurrent
                            ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400/40'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                      >
                        PIN {h.number}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feature Image Card */}
              <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden border border-stone-200 shadow-inner bg-stone-900 group select-none">
                <img
                  src={selectedHotspot.image}
                  alt={selectedHotspot.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ objectPosition: selectedHotspot.imagePosition }}
                />

                <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[9px] font-mono text-amber-900 font-bold border border-stone-300 shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                  <span>{selectedHotspot.imageBadge}</span>
                </div>

                <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[9px] font-mono text-stone-200 border border-white/20">
                  {selectedHotspot.coords}
                </div>
              </div>

              {/* Title & Identification */}
              <div>
                <div className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-widest flex items-center gap-1.5 mb-0.5">
                  <span>FEATURE {selectedHotspot.number} &bull; {selectedHotspot.coords}</span>
                </div>
                <h3 className="font-['Cinzel',serif] text-sm sm:text-base font-bold text-stone-900 uppercase leading-snug">
                  {selectedHotspot.title}
                </h3>
                <div className="text-[10.5px] font-mono text-stone-500 font-medium">
                  {selectedHotspot.name}
                </div>
              </div>

              {/* Layman Analogy Card */}
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] font-sans text-amber-950 italic leading-snug">
                &ldquo;{selectedHotspot.laymanAnalogy}&rdquo;
              </div>

              {/* Radar Physics Description */}
              <p className="text-[11px] text-stone-700 font-sans leading-relaxed">
                {selectedHotspot.description}
              </p>

              {/* Dual-Pass Flood Physics Note */}
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-[10.5px] font-sans text-stone-600 leading-snug">
                <strong className="text-stone-900 font-mono block mb-0.5">SPECULAR RADAR REFLECTION (&sigma;&deg; &lt; -18 dB):</strong>
                Smooth open liquid water acts as a microwave mirror, scattering 24cm pulses away into space and producing intense pitch-black pixels that clearly outline the 7,500 km² inland sea.
              </div>

            </div>

            {/* Bottom Telemetry Grid (4-Metric Authentic Ground Truth) */}
            <div className="grid grid-cols-4 gap-1.5 pt-2.5 border-t border-stone-200 mt-2 shrink-0">
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-center">
                <span className="text-[8px] font-mono text-stone-500 uppercase block font-bold">RADAR ECHO</span>
                <strong className="text-[10.5px] font-mono text-stone-900 font-bold">{selectedHotspot.backscatterDb}</strong>
              </div>
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-center">
                <span className="text-[8px] font-mono text-stone-500 uppercase block font-bold">FLOOD BASIN</span>
                <strong className="text-[10.5px] font-mono text-sky-800 font-bold">{selectedHotspot.floodExtentKm2}</strong>
              </div>
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-center">
                <span className="text-[8px] font-mono text-stone-500 uppercase block font-bold">DIELECTRIC</span>
                <strong className="text-[10.5px] font-mono text-emerald-800 font-bold">&epsilon;&apos; = 81.0</strong>
              </div>
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-center">
                <span className="text-[8px] font-mono text-stone-500 uppercase block font-bold">CHANNEL</span>
                <strong className="text-[10.5px] font-mono text-amber-800 font-bold">L-Band HH</strong>
              </div>
            </div>

          </aside>

          {/* ========================================================
              CENTER COLUMN: CLEAN UNOBSTRUCTED RADAR SWATH MAP WITH DUAL-PASS FLOOD SLIDER
              Allows dragging to compare July 12 Early Ingress vs August 29 Peak Flood!
          ======================================================== */}
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={isDraggingSlider ? handlePointerMove : undefined}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className={`relative flex-1 rounded-3xl overflow-hidden border border-stone-200 shadow-xl bg-stone-900 select-none ${viewMode === 'compare' ? 'cursor-ew-resize touch-none' : ''
              }`}
          >
            {/* Split Comparison View: July 12 Early Ingress vs August 29 Peak Flood */}
            {viewMode === 'compare' && (
              <>
                {/* Base Layer: August 29 Peak Deluge (Right side revealed) */}
                <img
                  src="/assets/layers/act2_peak_flood.webp"
                  alt="August 29 Peak Flood Inundation Sea"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />

                {/* Clipped Top Layer: July 12 Early Ingress (Left side revealed) */}
                <div
                  className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
                  style={{
                    clipPath: `polygon(0% 0%, ${compareSplit}% 0%, ${compareSplit}% 100%, 0% 100%)`
                  }}
                >
                  <img
                    src="/assets/layers/act2_ingress.webp"
                    alt="July 12 Early Monsoon Tidal Ingress"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />
                </div>

                {/* Vertical Divider Slider Line with Glowing Handle */}
                <div
                  className="absolute top-0 bottom-0 z-30 w-1 bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.9)] pointer-events-none"
                  style={{ left: `${compareSplit}%` }}
                >
                  {/* Clean Circular Center Handle with Dual Arrows */}
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-amber-500 border-2 border-white shadow-[0_4px_25px_rgba(0,0,0,0.6)] flex items-center justify-center text-stone-950 font-bold backdrop-blur-sm pointer-events-auto cursor-ew-resize hover:scale-110 active:scale-95 transition-transform">
                    <div className="flex items-center gap-0.5 text-xs text-stone-950 font-black">
                      <span>&#9664;</span>
                      <span className="w-0.5 h-3 bg-stone-950/70 rounded-full mx-0.5" />
                      <span>&#9654;</span>
                    </div>
                  </div>

                  {/* Sleek Bottom Badge Pinned out of the Way */}
                  <div className="absolute bottom-5 -translate-x-1/2 px-2.5 py-1 rounded-full bg-black/85 border border-amber-400/80 text-[8.5px] font-mono text-amber-300 font-bold tracking-wider shadow-xl whitespace-nowrap backdrop-blur-md flex items-center gap-1.5 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>DRAG TO COMPARE INGRESS vs PEAK SEA</span>
                  </div>
                </div>

                {/* Left Badge: Early Ingress */}
                <div className="absolute top-4 left-4 z-20 pointer-events-none">
                  <div className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[9.5px] font-mono text-stone-200 flex items-center gap-2 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                    <span>JULY 12: EARLY INGRESS (4,822 KM²)</span>
                  </div>
                </div>

                {/* Right Badge: Peak Deluge */}
                <div className="absolute top-4 right-4 z-20 pointer-events-none">
                  <div className="px-3 py-1 rounded-full bg-amber-600/90 backdrop-blur-md border border-amber-400 text-[9.5px] font-mono text-white flex items-center gap-2 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span>AUGUST 29: PEAK FLOOD SEA (7,500 KM²)</span>
                  </div>
                </div>
              </>
            )}

            {/* Standalone Radar Swath Mode */}
            {viewMode === 'radar' && (
              <img
                src="/assets/layers/act2_peak_flood.webp"
                alt="NISAR 24cm L-Band Peak Flood Microwave Swath"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            )}

            {/* Top-Right Badge: Calibrated Swath & Physical Telemetry */}
            <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-1.5 pointer-events-none">
              <div className="px-3.5 py-1.5 rounded-full bg-white/95 border border-stone-300 text-[10px] font-mono text-amber-900 uppercase tracking-widest flex items-center gap-1.5 shadow-sm font-bold backdrop-blur-md">
                <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>NISAR 24CM L-BAND &bull; 7,500 KM² BASIN</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/90 border border-stone-200 text-[9.5px] font-mono text-stone-700 shadow-sm font-semibold backdrop-blur-md">
                -18.09 dB &bull; Specular Mirror Echo Null
              </div>
            </div>

            {/* Top-Left Subtle Watermark */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
              <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[9.5px] font-mono text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>PASS 02 &bull; AUG 29, 2026 &bull; TRACK 063 FRAME 076</span>
              </div>
            </div>

            {/* Interactive Geographical Hotspot Pins on the Radar Map */}
            {MONSOON_HOTSPOTS.map((hotspot) => {
              const isSelected = selectedHotspot.id === hotspot.id;
              return (
                <button
                  key={hotspot.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    try { soundEngine.playClick(); } catch (err) { }
                    setSelectedHotspot(hotspot);
                  }}
                  style={{ top: hotspot.top, left: hotspot.left }}
                  className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-all cursor-pointer group flex items-center gap-2 ${isSelected ? 'scale-110 z-40' : 'hover:scale-105'
                    }`}
                >
                  <div
                    className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border transition-all text-xs font-mono font-bold ${isSelected
                        ? 'bg-amber-600 text-white border-amber-400 ring-4 ring-amber-400/30'
                        : 'bg-white/95 text-stone-800 border-stone-300 hover:bg-stone-50'
                      }`}
                  >
                    <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-amber-600'}`} />
                    <span>PIN {hotspot.number}</span>
                  </div>

                  <div
                    className={`absolute -inset-1 rounded-full pointer-events-none transition-all ${isSelected ? 'border-2 border-amber-500 animate-ping opacity-75' : 'opacity-0'
                      }`}
                  />
                </button>
              );
            })}

            {/* Bottom Swath Target Indicator */}
            <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
              <div className="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-stone-200 text-[10px] font-mono text-stone-700 shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                <span>ACTIVE TARGET: <strong className="text-stone-900">{selectedHotspot.name}</strong></span>
              </div>
            </div>

          </div>

          {/* ========================================================
              RIGHT COLUMN: BESPOKE MONSOON MICROWAVE OBSERVATORY
              Dedicated specifically to:
              1. 24cm Microwave Cloud Piercing Physics
              2. Specular Liquid Water Deflection Null Diagram
              3. Basin Flood Inundation & Flamingo Moat Integrity Ring
          ======================================================== */}
          <aside className="w-full lg:w-48 xl:w-56 p-3.5 rounded-3xl bg-white border border-stone-200 shadow-xl flex flex-col justify-between select-none shrink-0 text-stone-900 text-left">

            <div className="space-y-3">

              {/* Header */}
              <div className="text-[10px] font-mono font-bold tracking-widest text-stone-800 uppercase text-center pb-2 border-b border-stone-200 flex items-center justify-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>RADAR FLOOD PHYSICS</span>
              </div>

              {/* 1. MICROWAVE CLOUD PIERCER VECTOR */}
              <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                <div className="flex items-center justify-between text-[9px] font-mono font-bold text-amber-900 uppercase">
                  <span>CLOUD PENETRATION</span>
                  <span className="text-emerald-700">100% PASS</span>
                </div>

                <div className="relative w-full h-18 rounded-xl bg-slate-900 overflow-hidden p-1.5 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-[8px] font-mono text-stone-400">
                    <span>NISAR 747 KM</span>
                    <span className="text-amber-400">&lambda; = 24 CM</span>
                  </div>

                  {/* SVG Wave Piercing Cloud */}
                  <svg viewBox="0 0 140 30" className="w-full h-8 overflow-visible">
                    {/* Storm Cloud Layer */}
                    <path
                      d="M 10 16 Q 25 8 40 16 Q 55 10 70 16 Q 85 8 100 16 Q 115 10 130 16"
                      fill="none"
                      stroke="#64748b"
                      strokeWidth="5"
                      strokeOpacity="0.7"
                    />
                    {/* Microwave Wavefront Beam (piercing directly through) */}
                    <path
                      d="M 2 15 Q 15 5 28 15 T 56 15 T 84 15 T 112 15 T 138 15"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                    />
                  </svg>

                  <div className="flex justify-between items-center text-[7.5px] font-mono text-emerald-400">
                    <span>ZERO SCATTERING</span>
                    <span>GROUND REACHED</span>
                  </div>
                </div>

                <p className="text-[9px] font-mono text-stone-600 leading-tight">
                  Optical light (&lambda;=0.5&mu;m) scatters in clouds. NISAR&apos;s 24cm microwaves are 400,000&times; longer, passing through storm clouds with zero attenuation.
                </p>
              </div>

              {/* 2. SPECULAR LIQUID WATER DEFLECTION NULL */}
              <div data-claim-id="CLM_SPECULAR_MIRROR_NULL" className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                <div className="flex items-center justify-between text-[9px] font-mono font-bold text-amber-900 uppercase">
                  <span>SPECULAR DEFLECTION</span>
                  <span className="text-amber-800">&lt; -20.0 dB</span>
                </div>

                {/* SVG Mirror Bounce Diagram */}
                <div className="relative w-full h-16 rounded-xl bg-white border border-amber-200 p-1 flex items-center justify-center">
                  <svg viewBox="0 0 140 50" className="w-full h-full">
                    {/* Incident Beam */}
                    <line x1="20" y1="5" x2="70" y2="35" stroke="#d97706" strokeWidth="2" strokeDasharray="3 2" />
                    <polygon points="68,34 60,30 63,38" fill="#d97706" />

                    {/* Reflected Beam (Bouncing forward into space) */}
                    <line x1="70" y1="35" x2="120" y2="5" stroke="#d97706" strokeWidth="2" />
                    <polygon points="118,6 112,12 110,4" fill="#d97706" />

                    {/* Water Surface Line */}
                    <line x1="10" y1="35" x2="130" y2="35" stroke="#0284c7" strokeWidth="2.5" />

                    {/* Zero Return to Satellite Marker */}
                    <text x="70" y="47" textAnchor="middle" fontSize="6.5" fontFamily="monospace" fill="#0369a1" fontWeight="bold">
                      CALM WATER: MIRROR REFLECTION NULL
                    </text>
                  </svg>
                </div>

                <p className="text-[9px] font-mono text-stone-600 leading-tight">
                  Smooth floodwater behaves like glass. Microwaves reflect forward into space away from the sensor, producing pitch-black pixels (&lt; -20 dB, dipping to -26.3 dB).
                </p>
              </div>

              {/* 3. FLAMINGO WATER BARRIER */}
              <div data-claim-id="CLM_FLAMINGO_WATER_BARRIER" className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono font-bold text-stone-800 uppercase">
                  <span>FLAMINGO WATER BARRIER</span>
                  <span className="text-sky-700 font-bold">0.5 - 1.5 M BRINE</span>
                </div>
                <div className="text-[10px] font-mono font-bold text-stone-900">
                  Breeding Colony Protected from Predators
                </div>
                <p className="text-[9px] font-mono text-stone-600 leading-tight">
                  Seasonal shallow brine surrounds Khadir Bet, shielding mud nesting mounds from jackals and desert foxes (Salim Ali 1945; Gujarat Forest Dept).
                </p>
              </div>

            </div>

            {/* Bottom Swath ID */}
            <div className="pt-2 border-t border-stone-200 text-[8.5px] font-mono text-stone-500 text-center">
              NASA JPL / ISRO SAC &bull; LEVEL 2 GCOV
            </div>

          </aside>

        </div>

        {/* ========================================================
            4. 4 METRIC CARDS: MONSOON RADAR TELEMETRY
        ======================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full shrink-0">

          <div data-claim-id="CLM_MONSOON_FLOOD_BASIN" className="p-2.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
              <span className="text-sky-700 font-bold uppercase tracking-wider">FLOOD BASIN</span>
              <span className="text-[9px] text-stone-400">MEASURED</span>
            </div>
            <div className="mt-0.5">
              <div className="text-base sm:text-lg font-mono font-bold text-sky-900">
                5,563 – 20,514
                <span className="text-[10px] font-normal text-stone-500 ml-1">km²</span>
              </div>
              <div className="text-[9px] font-mono text-stone-600 truncate">
                Jul-Aug frame dark water (measured.json)
              </div>
            </div>
          </div>

          <div data-claim-id="CLM_CLOUD_PENETRATION" className="p-2.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
              <span className="text-emerald-700 font-bold uppercase tracking-wider">CLOUD PENETRATION</span>
              <span className="text-[9px] text-stone-400">24CM RADAR</span>
            </div>
            <div className="mt-0.5">
              <div className="text-base sm:text-lg font-mono font-bold text-emerald-900">
                100%
                <span className="text-[10px] font-normal text-stone-500 ml-1">all-weather</span>
              </div>
              <div className="text-[9px] font-mono text-stone-600 truncate">
                Pierces monsoon cloud ceiling
              </div>
            </div>
          </div>

          <div data-claim-id="CLM_SPECULAR_NULL" className="p-2.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
              <span className="text-amber-800 font-bold uppercase tracking-wider">SPECULAR NULL</span>
              <span className="text-[9px] text-stone-400">CALM WATER</span>
            </div>
            <div className="mt-0.5">
              <div className="text-base sm:text-lg font-mono font-bold text-amber-900">
                &lt; -20.0
                <span className="text-[10px] font-normal text-stone-500 ml-1">dB threshold</span>
              </div>
              <div className="text-[9px] font-mono text-stone-600 truncate">
                Specular reflection forward into space
              </div>
            </div>
          </div>

          <div data-claim-id="CLM_FLAMINGO_WATER_BARRIER" className="p-2.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
              <span className="text-stone-800 font-bold uppercase tracking-wider">WATER BARRIER</span>
              <span className="text-[9px] text-stone-400">KHADIR BET</span>
            </div>
            <div className="mt-0.5">
              <div className="text-base sm:text-lg font-mono font-bold text-stone-900">
                0.5 – 1.5
                <span className="text-[10px] font-normal text-stone-500 ml-1">m depth</span>
              </div>
              <div className="text-[9px] font-mono text-stone-600 truncate">
                Protects nesting flamingos from predators
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* ========================================================
          5. SETTLED FOOTER BAR (Action advances to Autoplay Dance)
      ======================================================== */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 w-full px-4 sm:px-8 py-2.5 bg-white/95 backdrop-blur-xl border-t border-stone-200 flex items-center justify-between gap-4 shadow-[0_-4px_25px_rgba(0,0,0,0.06)]">

        {/* Left: Settled Sound Control + Telemetry */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleSound}
            className="px-3 py-1.5 rounded-full border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 flex items-center gap-1.5 text-xs font-mono font-semibold transition-all cursor-pointer shadow-sm hover:scale-102"
            title="Toggle Sound (Shortcut: Press M)"
          >
            {isAudioMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-stone-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-amber-700" />
            )}
            <span>SOUND: {isAudioMuted ? 'MUTED' : 'ON'}</span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-stone-200 text-stone-600 font-mono">M</span>
          </button>

          <div className="flex items-center gap-2 text-[11px] font-mono tracking-wider text-stone-600">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            <span className="font-bold uppercase text-amber-800">
              SEASON 02 &bull; MONSOON RADAR DATA SHOWCASE
            </span>
            <span className="text-stone-300 hidden sm:inline">|</span>
            <span className="text-stone-600 text-[10.5px] hidden sm:inline">
              {selectedHotspot.name}
            </span>
          </div>
        </div>

        {/* Right: Proceed to SARS Dance Timeline */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              try { soundEngine.playTransitionSound(); } catch (e) { }
              onProceedToDance();
            }}
            className="px-7 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs tracking-[0.2em] uppercase transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:scale-102 active:scale-98 font-bold"
          >
            <span>PROCEED TO AUTOPLAY DANCE OF SARS</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </footer>

      {/* ========================================================
          6. DATA PROVENANCE MODAL
      ======================================================== */}
      {showProvenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-[#FAF8F5] border border-stone-200 rounded-3xl shadow-2xl flex flex-col text-left text-stone-800">

            <div className="sticky top-0 z-10 px-6 py-4 bg-white/95 backdrop-blur-md border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-amber-700" />
                <div>
                  <h3 className="text-sm sm:text-base font-['Cinzel',serif] font-bold text-stone-900 tracking-wider uppercase">
                    DATA PROVENANCE &bull; MONSOON FLOODING
                  </h3>
                  <div className="text-[10px] font-mono text-amber-800 tracking-widest uppercase font-bold">
                    NASA JPL / ISRO SAC &bull; LEVEL 2 GEOCODED COVARIANCE (GCOV) &bull; L-BAND (24 CM)
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowProvenanceModal(false)}
                className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-all cursor-pointer"
                title="Close Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs font-sans leading-relaxed text-stone-700">
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
                  <div className="flex items-center gap-2 text-amber-900 font-mono font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>MONSOON FLOOD INUNDATION PASS: AUGUST 29, 2026</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold">
                    100% VALID SAR PIXELS
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px] font-mono pt-1">
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[9.5px] text-stone-500 uppercase block">GRANULE ID</span>
                    <strong className="text-stone-900 text-[10px] break-all">NISAR_L2_PR_GCOV_029_063_D_076_2005_QPDH_A_20260829...</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[9.5px] text-stone-500 uppercase block">ACQUISITION TIME</span>
                    <strong className="text-stone-900 text-[10.5px]">2026-08-29T13:57:35Z<br />Track 063, Frame 076</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[9.5px] text-stone-500 uppercase block">FLOOD AREA</span>
                    <strong className="text-stone-900 text-[10.5px]">3,242.2 km² Core Sea<br />(7,500 km² basin total)</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[9.5px] text-stone-500 uppercase block">SPECULAR NULL</span>
                    <strong className="text-stone-900 text-[10.5px]">-18.09 dB Average<br />Threshold &lt; -18.0 dB</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-950 space-y-1">
                <div className="font-mono font-bold text-xs uppercase flex items-center gap-1.5 text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>MICROWAVE ALL-WEATHER PENETRATION</span>
                </div>
                <p className="text-[11.5px]">
                  Optical light has a wavelength of 0.5 to 0.7 micrometers, which strongly scatters and absorbs in clouds and rain droplets. NISAR’s L-band radar has a 24-centimeter wavelength (1.293 GHz), which is 400,000 times longer than visible light. This allows radar pulses to pass straight through torrential monsoon storm clouds, providing uninterrupted disaster mapping.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
