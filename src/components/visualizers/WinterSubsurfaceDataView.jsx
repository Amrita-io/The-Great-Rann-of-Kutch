import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Database,
  Radio,
  Volume2,
  VolumeX,
  Activity,
  Sparkles,
  MapPin,
  Eye,
  SlidersHorizontal,
  X,
  CheckCircle2,
  Layers,
  HelpCircle,
  ShieldCheck,
  Compass,
  Maximize2
} from 'lucide-react';
import { soundEngine } from '../../utils/audio';

/**
 * WinterSubsurfaceDataView ("THE GHOST OCEAN BENEATH THE SALT")
 * 
 * Museum-grade NASA-ISRO NISAR Winter Radar Observatory:
 * - Left Information Console: Dedicated side panel displaying pin photos, geological origin,
 *   microwave radar mechanics, layman analogy, and telemetry.
 * - Center Swath Viewport: 100% unobstructed 160km NISAR radar swath with interactive hotspot pins.
 * - Right Orbital Radar Depth Bar: Strictly matched to user asset sheet with apex satellite,
 *   cone of penetration wavefronts, satellite handle slider, fine scale ticks, and RF oscillation waveform.
 * - Uninterrupted, continuous audio synchronization with Breath of the Rann.
 * - Light Museum Palette (#FAF8F5, #FFFFFF, #1C1917, #D97706), zero unicode emojis.
 */

const GROUND_HOTSPOTS = [
  {
    id: 'allah-bund',
    number: '01',
    claimId: 'CLM_ALLAH_BUND_SCARP',
    name: '1819 ALLAH BUND SURFACE FAULT SCARP',
    coords: '24.25°N, 69.80°E',
    top: '28%',
    left: '26%',
    targetDepth: 0,
    depthLabel: 'Surface Landform (2-6m Relief)',
    backscatterDb: '-16.6 dB',
    dielectric: "ε' = 5.9 (Halite & Silt Relief)",
    title: 'THE 50-90 KM ALLAH BUND FAULT SCARP (1819)',
    laymanAnalogy: 'A giant natural earthen step raised across the flat desert like a levee.',
    description:
      'In 1819, an intraplate thrust earthquake (Mw 7.7–8.2, nominal 7.8) uplifted a 50 to 90 km long surface scarp 2 to 6 meters high (locally up to 9m), damming the Nara distributary of the Indus River. The scarp is an exposed surface feature. NISAR active microwave sounding maps roughness and dielectric contrast across this historic fault scarp.',
    image: '/assets/layers/nisar_october_hh_true.webp',
    imagePosition: '26% 28%',
    imageBadge: 'NISAR 24CM L-BAND • ALLAH BUND SURFACE SCARP',
    surfaceType: 'Exposed Tectonic Halite & Silt Scarp'
  },
  {
    id: 'ghost-sea',
    number: '02',
    claimId: 'CLM_CORE_BASIN_SPECULAR',
    name: 'CORE PLAYA & EVAPORITE BASIN',
    coords: '23.95°N, 70.15°E',
    top: '52%',
    left: '52%',
    targetDepth: 38,
    depthLabel: 'Subsurface Moisture Sounding',
    backscatterDb: '-25.7 dB',
    dielectric: "ε' ~ 70-80 (Conductive Brine Interface)",
    title: 'CALM WATER SPECULAR NULL & EVAPORITE BASIN',
    laymanAnalogy: 'Shining a flashlight at a mirror: calm water bounces waves away into space.',
    description:
      'Low backscatter (< -20 dB, dipping to -26.3 dB in Core Basin) marks specular reflection null where calm water or smooth brine reflects microwaves away from the satellite. In dry seasons, low-loss halite (eps\' ~ 5.9, tan delta < 1e-4) allows microwave penetration into dry evaporites before meeting conductive brine or moist subsoil.',
    image: '/assets/layers/act1_winter_dry.webp',
    imagePosition: 'center',
    imageBadge: 'CORE HALITE CRUST & CONDUCTIVE BRINE INTERFACE',
    surfaceType: 'Evaporite Halite Crust over Conductive Brine'
  },
  {
    id: 'khadir-ridge',
    number: '03',
    claimId: 'CLM_KHADIR_ISLAND_UPLAND',
    name: 'KHADIR ISLAND BEDROCK UPLAND',
    coords: '24.10°N, 70.40°E',
    top: '40%',
    left: '74%',
    targetDepth: 12,
    depthLabel: 'Mesozoic Sandstone Bedrock',
    backscatterDb: '-13.3 dB',
    dielectric: "ε' = 6.0 (Jurassic Sandstone Bedrock)",
    title: 'MESOZOIC BEDROCK ISLAND & FLAMINGO SANCTUARY',
    laymanAnalogy: 'A massive stone island rising out of low-lying seasonal mudflats.',
    description:
      'Ancient Jurassic bedrock islands (bets) rise above the low-lying salt flat. This elevated ground houses prehistoric Dholavira ruins and borders the seasonal Flamingo City breeding grounds. Shallow seasonal brine isolates the island, creating a natural water barrier that shields nesting flamingos from land predators.',
    image: '/assets/layers/act3_october_nisar.webp',
    imagePosition: 'center',
    imageBadge: 'JURASSIC BEDROCK RIDGE & FLAMINGO HABITAT',
    surfaceType: 'Jurassic Sandstone Bedrock'
  }
];

export default function WinterSubsurfaceDataView({
  onBackToExplainer,
  onProceedToNext,
  onReturnToOrbit
}) {
  // Subsurface Sounding Depth Model (Relative Scale)
  const [penetrationDepth, setPenetrationDepth] = useState(38);
  const [selectedHotspot, setSelectedHotspot] = useState(GROUND_HOTSPOTS[1]);
  const [showProvenanceModal, setShowProvenanceModal] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(soundEngine.isMuted);

  const verticalTrackRef = useRef(null);
  const isDraggingTrackRef = useRef(false);

  // Maintain continuous sync of Breath of the Rann quietly
  useEffect(() => {
    soundEngine.playBreathOfTheRann(0.12);
  }, []);

  // Sync mute state
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

  // Depth-dependent microwave metrics
  const depthFraction = penetrationDepth / 38;
  const currentBackscatter = (-19.5 + depthFraction * 5.3).toFixed(2);
  const currentPermittivity = (3.2 + depthFraction * 78.2).toFixed(1);

  // Vertical Depth Track Pointer Handler
  const updateDepthFromClientY = (clientY) => {
    if (!verticalTrackRef.current) return;
    const rect = verticalTrackRef.current.getBoundingClientRect();
    const relativeY = Math.max(0, Math.min(rect.height, clientY - rect.top));
    const newDepth = Math.round((relativeY / rect.height) * 38);
    setPenetrationDepth(newDepth);
    try { soundEngine.playHover(); } catch (err) { }
  };

  const handleTrackPointerDown = (e) => {
    isDraggingTrackRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateDepthFromClientY(e.clientY);
  };

  const handleTrackPointerMove = (e) => {
    if (!isDraggingTrackRef.current) return;
    updateDepthFromClientY(e.clientY);
  };

  const handleTrackPointerUp = (e) => {
    isDraggingTrackRef.current = false;
  };

  return (
    <div className="relative w-full h-screen max-h-screen overflow-hidden bg-[#FAF8F5] text-stone-900 flex flex-col justify-between font-sans selection:bg-amber-200 selection:text-amber-950 pb-14 select-none">

      {/* ========================================================
          1. TOP HEADER BAR
      ======================================================== */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-2.5 bg-white/95 backdrop-blur-xl border-b border-stone-200 flex items-center justify-between gap-4 shadow-sm shrink-0">

        {/* Left: Navigation Actions */}
        <div className="flex items-center gap-2">
          {onBackToExplainer && (
            <button
              onClick={() => {
                try { soundEngine.playTransitionSound(); } catch (e) { }
                onBackToExplainer();
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 hover:text-stone-900 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-700" />
              <span>3D LAYER EXPLAINER</span>
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
            <span>SEASON 01 OF 03 &bull; ARID SALT REGIME</span>
          </div>
          <h1 className="text-xs sm:text-sm md:text-base font-['Cinzel',serif] font-bold text-stone-900 tracking-[0.08em] uppercase truncate max-w-sm sm:max-w-md md:max-w-xl">
            THE GHOST OCEAN BENEATH THE SALT
          </h1>
          <div className="hidden lg:flex items-center gap-3 text-[9px] font-mono text-stone-500 uppercase tracking-widest mt-0.5">
            <span>24CM RADAR PENETRATION &bull; IMAGING HIDDEN WATER THROUGH DRY HALITE</span>
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
          2. MAIN OBSERVATORY STAGE
             - Top Quick-Control Capsule
             - 3-Column Layout:
               [ LEFT: Dedicated Pin Information Console ]
               [ CENTER: Unobstructed Hero Radar Swath Map ]
               [ RIGHT: Asset-Matched Orbital Radar Depth Slicer ]
             - Bottom 4 Metric Cards
      ======================================================== */}
      <main className="relative w-full flex-1 min-h-0 flex flex-col justify-between p-2.5 sm:p-4 max-w-[1600px] mx-auto overflow-hidden">

        {/* Top Control Bar (Clean Capsule Header) */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2.5 p-2 sm:p-2.5 rounded-2xl bg-white border border-stone-200 shadow-sm mb-2 shrink-0">

          {/* Left: Microwave Depth Gauge & Surface Status */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-mono text-xs font-bold flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
              <span>RADAR PENETRATION:</span>
              <span className="text-amber-800 text-sm font-extrabold">{penetrationDepth} cm</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-stone-600 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
              <span>{penetrationDepth === 0 ? 'Surface Salt Crust' : penetrationDepth < 25 ? 'Halite Subsurface Ingress' : 'Deep Brine Reservoir'}</span>
            </div>
          </div>

          {/* Right: NASA-ISRO Active Sensor Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 font-mono text-xs">
            <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span className="font-bold">24CM L-BAND SUBSURFACE PROBE</span>
            <span className="text-stone-400">|</span>
            <span className="text-stone-600 text-[11px]">Active Microwave Sounding</span>
          </div>

        </div>

        {/* ========================================================
            3-COLUMN STAGE
            LEFT: Dedicated Pin Information Console (with Image & Details)
            CENTER: Unobstructed Hero Radar Swath Map
            RIGHT: Orbital Radar Depth Bar (Satellite + Penetration Cone + Handle)
        ======================================================== */}
        <div className="flex flex-col lg:flex-row items-stretch gap-3 w-full flex-1 min-h-[420px] sm:min-h-[460px] lg:min-h-[490px] mb-2 overflow-hidden">

          {/* ========================================================
              LEFT COLUMN: DEDICATED PIN INFORMATION CONSOLE
              Elongated full-height layout with Stratification & Radar Physics
          ======================================================== */}
          <aside className="w-full lg:w-[420px] xl:w-[460px] p-4 rounded-3xl bg-white border border-stone-200 shadow-xl flex flex-col justify-between shrink-0 h-full min-h-[580px] lg:min-h-0 overflow-y-auto text-left gap-3">

            <div className="space-y-3">

              {/* Pin Switcher Tabs */}
              <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-800 font-bold uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>HOTSPOT DOSSIER</span>
                </div>

                {/* 3 Pin Switcher Buttons */}
                <div className="flex items-center gap-1">
                  {GROUND_HOTSPOTS.map((h) => {
                    const isCurrent = selectedHotspot.id === h.id;
                    return (
                      <button
                        key={h.id}
                        onClick={() => {
                          try { soundEngine.playClick(); } catch (e) { }
                          setSelectedHotspot(h);
                          setPenetrationDepth(h.targetDepth);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[9.5px] font-mono uppercase transition-all cursor-pointer font-bold ${isCurrent
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                      >
                        PIN {h.number}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pin Feature Image Card */}
              <div className="relative w-full h-36 sm:h-40 rounded-2xl overflow-hidden border border-stone-200 shadow-inner bg-stone-900 group select-none">
                <img
                  src={selectedHotspot.image}
                  alt={selectedHotspot.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ objectPosition: selectedHotspot.imagePosition }}
                />

                {/* Top Badge: Sensor & Feature Origin */}
                <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[9px] font-mono text-amber-900 font-bold border border-stone-300 shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                  <span>{selectedHotspot.imageBadge}</span>
                </div>

                {/* Bottom GPS Coordinates Badge */}
                <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[9px] font-mono text-stone-200 border border-white/20">
                  {selectedHotspot.coords}
                </div>
              </div>

              {/* Pin Title & Identification */}
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

              {/* Microwave Ground Truth Narrative */}
              <p className="text-[11px] text-stone-700 font-sans leading-relaxed">
                {selectedHotspot.description}
              </p>

              {/* Subsurface Dielectric Stratification Diagram */}
              <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                <div className="flex items-center justify-between text-[9px] font-mono font-bold text-amber-900 uppercase">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3 text-amber-600" />
                    <span>DIELECTRIC STRATIFICATION</span>
                  </span>
                  <span className="text-amber-700 font-bold">&lambda; = 24 cm</span>
                </div>

                <div className="space-y-1 text-[9.5px] font-mono">
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-amber-100/60 border border-amber-300/60">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                      <span className="text-stone-800 font-semibold">0 - 8 cm &bull; Halite Salt Crust</span>
                    </div>
                    <span className="text-amber-900 font-bold">&epsilon;&apos; = 3.18</span>
                  </div>

                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-sky-50 border border-sky-200">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                      <span className="text-stone-800 font-semibold">Porous Salt Silt</span>
                    </div>
                    <span className="text-sky-900 font-bold">&epsilon;&apos; &asymp; 4.0 - 5.5</span>
                  </div>

                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-indigo-50 border border-indigo-200">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                      <span className="text-stone-800 font-semibold">Conductive Brine Interface</span>
                    </div>
                    <span className="text-indigo-900 font-bold">&sigma; &gt; 5 S/m</span>
                  </div>
                </div>

                <p className="text-[9px] font-mono text-stone-600 leading-tight">
                  Dry halite crust (low loss tan &delta; &lt; 10⁻⁴) allows 24cm microwaves to probe damp subsoil moisture interfaces.
                </p>
              </div>

            </div>

            {/* Bottom Telemetry Badges (Radar Echo, Permittivity, Depth) */}
            <div className="grid grid-cols-3 gap-1.5 pt-2.5 border-t border-stone-200 mt-2 shrink-0">
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-center">
                <span className="text-[8.5px] font-mono text-stone-500 uppercase block">RADAR ECHO</span>
                <strong className="text-[10.5px] font-mono text-stone-900 font-bold">{selectedHotspot.backscatterDb}</strong>
              </div>
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-center">
                <span className="text-[8.5px] font-mono text-stone-500 uppercase block">PERMITTIVITY</span>
                <strong className="text-[10.5px] font-mono text-sky-800 font-bold">{selectedHotspot?.dielectric || "ε' = 18.5"}</strong>
              </div>
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-center">
                <span className="text-[8.5px] font-mono text-stone-500 uppercase block">DEPTH</span>
                <strong className="text-[10.5px] font-mono text-amber-800 font-bold">{selectedHotspot.depthLabel}</strong>
              </div>
            </div>

          </aside>

          {/* ========================================================
              CENTER COLUMN: UNOBSTRUCTED HERO RADAR SWATH MAP
          ======================================================== */}
          <div className="relative flex-1 rounded-3xl overflow-hidden border border-stone-200 shadow-xl bg-stone-900 select-none">

            {/* Base Layer: Real Calibrated NISAR Radar Dry Pass */}
            <img
              src="/assets/layers/nisar_october_hh_true.webp"
              alt="NISAR 24cm L-Band Dry Season Microwave Swath"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none"
              style={{
                opacity: 0.45 + depthFraction * 0.55,
                filter: `contrast(${105 + depthFraction * 15}%) brightness(${95 + depthFraction * 10}%)`
              }}
            />

            {/* Subsurface Ratio Decomposition Layer (Fades in at deep penetration) */}
            <img
              src="/assets/layers/nisar_october_polarimetric_ratio_true.webp"
              alt="NISAR Polarimetric Ratio Decomposition"
              className="absolute inset-0 w-full h-full object-cover mix-blend-screen transition-opacity duration-500 pointer-events-none"
              style={{
                opacity: penetrationDepth > 15 ? ((penetrationDepth - 15) / 23) * 0.75 : 0
              }}
            />

            {/* Top-Right Badge: Calibrated Swath & Physical Telemetry */}
            <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-1.5 pointer-events-none">
              <div className="px-3.5 py-1.5 rounded-full bg-white/95 border border-stone-300 text-[10px] font-mono text-amber-900 uppercase tracking-widest flex items-center gap-1.5 shadow-sm font-bold backdrop-blur-md">
                <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>NISAR 24CM L-BAND &bull; 160 KM SWATH</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/90 border border-stone-200 text-[9.5px] font-mono text-stone-700 shadow-sm font-semibold backdrop-blur-md">
                {currentBackscatter} dB &bull; &epsilon;&prime; = {currentPermittivity}
              </div>
            </div>

            {/* Top-Left Subtle Watermark */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
              <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[9.5px] font-mono text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>UTM ZONE 42N &bull; TRACK 063 FRAME 076</span>
              </div>
            </div>

            {/* Interactive Geographical Hotspot Pins on the Radar Map */}
            {GROUND_HOTSPOTS.map((hotspot) => {
              const isSelected = selectedHotspot.id === hotspot.id;
              return (
                <button
                  key={hotspot.id}
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) { }
                    setSelectedHotspot(hotspot);
                    setPenetrationDepth(hotspot.targetDepth);
                  }}
                  style={{ top: hotspot.top, left: hotspot.left }}
                  className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-all cursor-pointer group flex items-center gap-2 ${isSelected ? 'scale-110 z-40' : 'hover:scale-105'
                    }`}
                >
                  {/* Pin Icon Pill */}
                  <div
                    className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border transition-all text-xs font-mono font-bold ${isSelected
                      ? 'bg-amber-600 text-white border-amber-400 ring-4 ring-amber-400/30'
                      : 'bg-white/95 text-stone-800 border-stone-300 hover:bg-stone-50'
                      }`}
                  >
                    <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-amber-600'}`} />
                    <span>PIN {hotspot.number}</span>
                  </div>

                  {/* Pulsing Beacon Ring */}
                  <div
                    className={`absolute -inset-1 rounded-full pointer-events-none transition-all ${isSelected ? 'border-2 border-amber-500 animate-ping opacity-75' : 'opacity-0'
                      }`}
                  />
                </button>
              );
            })}

            {/* Bottom Swath Legend Pill */}
            <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
              <div className="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-stone-200 text-[10px] font-mono text-stone-700 shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                <span>ACTIVE TARGET: <strong className="text-stone-900">{selectedHotspot.name}</strong></span>
              </div>
            </div>

          </div>

          {/* ========================================================
              RIGHT COLUMN: HIGH-PRECISION ORBITAL RADAR DEPTH SOUNDER
              Redesigned high-fidelity aerospace instrument console:
              - Satellite Apex & Animated Microwave Wavefront Beam
              - Precision Millimeter Track & Interactive Satellite Cursor
              - Calibrated Dielectric Strata Cards (Surface, Subsoil, Brine Interface)
              - Live Subsurface Sounding Telemetry
          ======================================================== */}
          <aside className="w-full lg:w-56 xl:w-60 p-3.5 rounded-3xl bg-white border border-stone-200 shadow-xl flex flex-col justify-between select-none shrink-0 text-stone-900">

            {/* 1. Header: Orbital Instrument Identity */}
            <div className="w-full pb-2 border-b border-stone-100 flex flex-col items-center gap-0.5">
              <div className="text-[10px] font-mono font-bold tracking-widest text-amber-900 uppercase flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>ORBITAL RADAR DEPTH</span>
              </div>
              <div className="text-[8.5px] font-mono text-stone-400 uppercase tracking-wider">
                1.25 GHz &bull; 24CM L-BAND SOUNDER
              </div>
            </div>

            {/* 2. SATELLITE APEX & ANIMATED MICROWAVE RADAR CONE */}
            <div className="relative w-full flex flex-col items-center pt-1 pb-1">
              <svg viewBox="0 0 180 105" className="w-44 h-24 overflow-visible">
                <defs>
                  {/* Radar Microwave Beam Gradient */}
                  <linearGradient id="apex-beam-glow" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#d97706" stopOpacity="0.8" />
                    <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.05" />
                  </linearGradient>

                  {/* Solar Array Gold Cells */}
                  <linearGradient id="solar-cell-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#b45309" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#78350f" />
                  </linearGradient>

                  <filter id="wave-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#d97706" floodOpacity="0.6" />
                  </filter>
                </defs>

                {/* --- CONE OF PENETRATION --- */}
                <polygon points="90,44 26,104 154,104" fill="url(#apex-beam-glow)" />

                {/* Cone Perspective Outer Boundaries */}
                <line x1="90" y1="44" x2="26" y2="104" stroke="#d97706" strokeWidth="1" strokeDasharray="3 2" strokeOpacity="0.75" />
                <line x1="90" y1="44" x2="154" y2="104" stroke="#d97706" strokeWidth="1" strokeDasharray="3 2" strokeOpacity="0.75" />
                <line x1="90" y1="44" x2="90" y2="104" stroke="#d97706" strokeWidth="0.8" strokeDasharray="2 3" strokeOpacity="0.35" />

                {/* Spherical Wavefront Arcs propagating downwards */}
                <path d="M 74 58 Q 90 66 106 58" fill="none" stroke="#d97706" strokeWidth="1.5" strokeOpacity="0.9" filter="url(#wave-glow)" />
                <path d="M 58 74 Q 90 86 122 74" fill="none" stroke="#d97706" strokeWidth="1.5" strokeOpacity="0.75" />
                <path d="M 42 90 Q 90 106 138 90" fill="none" stroke="#d97706" strokeWidth="1.5" strokeOpacity="0.55" />
                <path d="M 30 102 Q 90 120 150 102" fill="none" stroke="#d97706" strokeWidth="1.5" strokeOpacity="0.35" />

                {/* --- SATELLITE BODY (Tilted, Gold Panels, Dish Reflector) --- */}
                <g transform="rotate(-10, 90, 28)">
                  {/* Left Solar Panel Array (3 segments) */}
                  <g>
                    <rect x="18" y="20" width="36" height="15" rx="2" fill="url(#solar-cell-gold)" stroke="#1c1917" strokeWidth="1" />
                    <line x1="30" y1="20" x2="30" y2="35" stroke="#1c1917" strokeWidth="0.8" />
                    <line x1="42" y1="20" x2="42" y2="35" stroke="#1c1917" strokeWidth="0.8" />
                    <line x1="18" y1="27.5" x2="54" y2="27.5" stroke="#fef3c7" strokeWidth="0.4" strokeOpacity="0.7" />
                    <line x1="54" y1="27.5" x2="72" y2="27.5" stroke="#78716c" strokeWidth="2.2" />
                  </g>

                  {/* Right Solar Panel Array (3 segments) */}
                  <g>
                    <rect x="108" y="20" width="36" height="15" rx="2" fill="url(#solar-cell-gold)" stroke="#1c1917" strokeWidth="1" />
                    <line x1="120" y1="20" x2="120" y2="35" stroke="#1c1917" strokeWidth="0.8" />
                    <line x1="132" y1="20" x2="132" y2="35" stroke="#1c1917" strokeWidth="0.8" />
                    <line x1="108" y1="27.5" x2="144" y2="27.5" stroke="#fef3c7" strokeWidth="0.4" strokeOpacity="0.7" />
                    <line x1="92" y1="27.5" x2="108" y2="27.5" stroke="#78716c" strokeWidth="2.2" />
                  </g>

                  {/* Central Satellite Avionics Bus */}
                  <rect x="72" y="14" width="20" height="27" rx="3" fill="#292524" stroke="#1c1917" strokeWidth="1.2" />
                  <rect x="74" y="18" width="16" height="5" fill="#f59e0b" stroke="#b45309" strokeWidth="0.5" />
                  <rect x="74" y="27" width="16" height="4" fill="#f59e0b" stroke="#b45309" strokeWidth="0.5" />

                  {/* Parabolic Radar Reflector Dish (Mounted on apex) */}
                  <g transform="translate(82, 3)">
                    <line x1="-3" y1="12" x2="0" y2="0" stroke="#78716c" strokeWidth="1" />
                    <line x1="3" y1="12" x2="0" y2="0" stroke="#78716c" strokeWidth="1" />
                    <path d="M -13 6 Q 0 17 13 6" fill="#44403c" stroke="#d97706" strokeWidth="1.8" />
                    <circle cx="0" cy="1" r="1.8" fill="#d97706" stroke="#ffffff" strokeWidth="0.6" />
                  </g>
                </g>
              </svg>
            </div>

            {/* 3. DEPTH SLIDER TRACK & SCALE WITH SATELLITE HANDLE & STRATA CARDS */}
            <div className="relative w-full h-[280px] my-1 select-none">

              {/* Vertical Capsule Slider Bar with Amber Liquid Fill */}
              <div
                ref={verticalTrackRef}
                onPointerDown={handleTrackPointerDown}
                onPointerMove={handleTrackPointerMove}
                onPointerUp={handleTrackPointerUp}
                className="absolute left-4 top-0 bottom-0 w-6 rounded-full bg-stone-100 border-2 border-stone-300 shadow-inner cursor-pointer p-0.5 touch-none"
                title="Drag or click to adjust 24cm radar penetration depth"
              >
                {/* Glowing Amber Column (Penetration Fill) */}
                <div
                  className="w-full rounded-full bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700 shadow-sm transition-all duration-75"
                  style={{ height: `${Math.max(4, (penetrationDepth / 38) * 100)}%` }}
                />

                {/* --- SATELLITE HANDLE (ACTIVE POINTER) --- */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none transition-all duration-75 z-30"
                  style={{ top: `${(penetrationDepth / 38) * 100}%` }}
                >
                  {/* Concentric Microwave Pulse Rings */}
                  <div className="absolute -inset-2.5 rounded-full border border-amber-500/60 animate-ping opacity-75" />

                  {/* Satellite Mini-Handle Node */}
                  <div className="relative flex flex-col items-center">
                    <span className="text-[7px] text-amber-800 font-bold leading-none -mb-0.5">▲</span>

                    <div className="px-1.5 py-0.5 rounded-md bg-stone-900 border border-amber-500 shadow-lg flex items-center gap-0.5">
                      <div className="w-1.5 h-1.5 rounded-sm bg-amber-500" />
                      <div className="w-2.5 h-2 rounded-sm bg-stone-100 flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-amber-600" />
                      </div>
                      <div className="w-1.5 h-1.5 rounded-sm bg-amber-500" />
                    </div>

                    <span className="text-[7px] text-amber-800 font-bold leading-none -mt-0.5">▼</span>
                  </div>
                </div>

              </div>

              {/* Fine Scale Ticks Column with Intermediate Ticks */}
              <div className="absolute left-12 top-0 bottom-0 w-8 pointer-events-none">
                {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 19, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38].map((cm) => {
                  const topPct = (cm / 38) * 100;
                  const isMajor = cm === 0 || cm === 10 || cm === 19 || cm === 30 || cm === 38;
                  const isActive = Math.abs(penetrationDepth - cm) <= 1;

                  return (
                    <div
                      key={`tick-${cm}`}
                      className="absolute left-0 flex items-center gap-1 -translate-y-1/2"
                      style={{ top: `${topPct}%` }}
                    >
                      <span
                        className={`block transition-all ${isMajor
                          ? cm === 19 || cm === 38
                            ? 'w-3 h-0.5 bg-amber-700'
                            : 'w-2.5 h-0.5 bg-stone-600'
                          : 'w-1.5 h-[1px] bg-stone-300'
                          }`}
                      />
                      {isMajor && (
                        <span
                          className={`text-[8.5px] font-mono leading-none ${isActive
                            ? 'text-amber-900 font-extrabold'
                            : cm === 19 || cm === 38
                              ? 'text-amber-800 font-bold'
                              : 'text-stone-400 font-medium'
                            }`}
                        >
                          {cm}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* High-Tech Strata Interactive Cards Column */}
              <div className="absolute right-0 top-0 bottom-0 w-32 flex flex-col justify-between">

                {/* 1. CRUST (0 CM) at Exact Top */}
                <div className="relative -translate-y-1/4">
                  <button
                    onClick={() => {
                      setPenetrationDepth(0);
                      try { soundEngine.playHover(); } catch (e) { }
                    }}
                    className={`w-full text-left p-1.5 rounded-xl border transition-all cursor-pointer shadow-sm ${penetrationDepth === 0
                      ? 'bg-amber-600 text-white border-amber-500 shadow-md ring-2 ring-amber-500/30'
                      : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800'
                      }`}
                  >
                    <div className="flex items-center justify-between text-[8px] font-mono font-bold uppercase mb-0.5">
                      <span>CRUST (SURFACE)</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${penetrationDepth === 0 ? 'bg-white' : 'bg-stone-400'}`} />
                    </div>
                    <div className={`text-[7.5px] font-mono truncate ${penetrationDepth === 0 ? 'text-amber-100' : 'text-stone-500'}`}>
                      Halite &bull; &epsilon;&prime;&asymp;5.9
                    </div>
                  </button>
                </div>

                {/* 2. SUBSOIL with RF Waveform in Middle */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setPenetrationDepth(19);
                      try { soundEngine.playHover(); } catch (e) { }
                    }}
                    className={`w-full text-left p-1.5 rounded-xl border transition-all cursor-pointer shadow-sm ${penetrationDepth >= 14 && penetrationDepth <= 24
                      ? 'bg-amber-600 text-white border-amber-500 shadow-md ring-2 ring-amber-500/30'
                      : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800'
                      }`}
                  >
                    <div className="flex items-center justify-between text-[8px] font-mono font-bold uppercase mb-0.5">
                      <span>SUBSOIL LAYER</span>
                      <svg viewBox="0 0 20 6" className={`w-4 h-1.5 ${penetrationDepth >= 14 && penetrationDepth <= 24 ? 'text-white' : 'text-amber-600'} animate-pulse`}>
                        <path d="M 0 3 Q 2.5 0, 5 3 T 10 3 T 15 3 T 20 3" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className={`text-[7.5px] font-mono truncate ${penetrationDepth >= 14 && penetrationDepth <= 24 ? 'text-amber-100' : 'text-stone-500'}`}>
                      Porous Silt &bull; &epsilon;&prime;&asymp;4.8
                    </div>
                  </button>
                </div>

                {/* 3. BRINE INTERFACE at Bottom */}
                <div className="relative translate-y-1/4">
                  <button
                    onClick={() => {
                      setPenetrationDepth(38);
                      try { soundEngine.playHover(); } catch (e) { }
                    }}
                    className={`w-full text-left p-1.5 rounded-xl border transition-all cursor-pointer shadow-sm ${penetrationDepth === 38
                      ? 'bg-amber-600 text-white border-amber-500 shadow-md ring-2 ring-amber-500/30'
                      : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800'
                      }`}
                  >
                    <div className="flex items-center justify-between text-[8px] font-mono font-bold uppercase mb-0.5">
                      <span>BRINE INTERFACE</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${penetrationDepth === 38 ? 'bg-white' : 'bg-stone-400'}`} />
                    </div>
                    <div className={`text-[7.5px] font-mono truncate ${penetrationDepth === 38 ? 'text-amber-100' : 'text-stone-500'}`}>
                      Saline Layer &bull; &sigma;&gt;5 S/m
                    </div>
                  </button>
                </div>

              </div>

            </div>

            {/* 4. Bottom Depth Telemetry Readout */}
            <div className="w-full mt-2 pt-2 border-t border-stone-200 flex flex-col gap-0.5 text-stone-900">
              <div className="flex items-center justify-between text-[9px] font-mono">
                <span className="text-stone-500 uppercase">ACTIVE DEPTH:</span>
                <strong className="text-amber-900 font-extrabold">{penetrationDepth}.0 CM</strong>
              </div>
              <div className="flex items-center justify-between text-[8px] font-mono text-stone-500">
                <span>RADAR ECHO:</span>
                <span className="text-amber-800 font-semibold">
                  {penetrationDepth === 0 ? '-14.2 dB (Salt)' : penetrationDepth < 30 ? '-18.1 dB (Clay)' : '-22.8 dB (Brine)'}
                </span>
              </div>
            </div>

          </aside>

        </div>

        {/* ========================================================
            4. 4 METRIC CARDS: DIELECTRIC MICROWAVE TELEMETRY
        ======================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full shrink-0">

          {/* Card 1: Crust Dielectric Loss */}
          <div data-claim-id="CLM_HALITE_LOSS" className="p-2.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
              <span className="text-emerald-700 font-bold uppercase tracking-wider">HALITE LOSS (tan &delta;)</span>
              <span className="text-[9px] text-stone-400">LOW-LOSS</span>
            </div>
            <div className="mt-0.5">
              <div className="text-base sm:text-lg font-mono font-bold text-emerald-900">
                &lt; 10⁻⁴
                <span className="text-[10px] font-normal text-stone-500 ml-1">loss tangent</span>
              </div>
              <div className="text-[9px] font-mono text-stone-600 truncate">
                Pure halite ε&apos; ~ 5.9 (Gorham 2002)
              </div>
            </div>
          </div>

          {/* Card 2: Penetration Depth */}
          <div data-claim-id="CLM_RADAR_SOUNDING_DEPTH" className="p-2.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
              <span className="text-amber-800 font-bold uppercase tracking-wider">RADAR PENETRATION</span>
              <span className="text-[9px] text-stone-400">24CM L-BAND</span>
            </div>
            <div className="mt-0.5">
              <div className="text-base sm:text-lg font-mono font-bold text-amber-900">
                {penetrationDepth}.0
                <span className="text-[10px] font-normal text-stone-500 ml-1">cm model depth</span>
              </div>
              <div className="text-[9px] font-mono text-stone-600 truncate">
                Low-loss penetration in dry crust
              </div>
            </div>
          </div>

          {/* Card 3: Specular Water Null */}
          <div data-claim-id="CLM_CORE_BASIN_SPECULAR" className="p-2.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
              <span className="text-sky-700 font-bold uppercase tracking-wider">SPECULAR NULL</span>
              <span className="text-[9px] text-stone-400">&lt; -20 dB</span>
            </div>
            <div className="mt-0.5">
              <div className="text-base sm:text-lg font-mono font-bold text-sky-900">
                -25.7
                <span className="text-[10px] font-normal text-stone-500 ml-1">dB echo</span>
              </div>
              <div className="text-[9px] font-mono text-stone-600 truncate">
                Specular mirror null in Core Basin
              </div>
            </div>
          </div>

          {/* Card 4: Allah Bund Surface Scarp */}
          <div data-claim-id="CLM_ALLAH_BUND_SCARP" className="p-2.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
              <span className="text-stone-800 font-bold uppercase tracking-wider">ALLAH BUND SCARP</span>
              <span className="text-[9px] text-stone-400">1819 FAULT</span>
            </div>
            <div className="mt-0.5">
              <div className="text-base sm:text-lg font-mono font-bold text-stone-900">
                2 to 6
                <span className="text-[10px] font-normal text-stone-500 ml-1">m surface relief</span>
              </div>
              <div className="text-[9px] font-mono text-stone-600 truncate">
                50-90 km surface fault scarp
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* ========================================================
          5. SETTLED FOOTER BAR (Single Arrow Action)
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
              SEASON 01 &bull; WINTER RADAR DATA SHOWCASE
            </span>
            <span className="text-stone-300 hidden sm:inline">|</span>
            <span className="text-stone-600 text-[10.5px] hidden sm:inline">
              {selectedHotspot.name} ({penetrationDepth} cm Subsurface Depth)
            </span>
          </div>
        </div>

        {/* Right: Proceed to Monsoon (Single crisp arrow, zero duplicate &rarr;) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              try { soundEngine.playTransitionSound(); } catch (e) { }
              onProceedToNext();
            }}
            className="px-7 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs tracking-[0.2em] uppercase transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:scale-102 active:scale-98 font-bold"
          >
            <span>PROCEED TO MONSOON REGIME</span>
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

            {/* Modal Header */}
            <div className="sticky top-0 z-10 px-6 py-4 bg-white/95 backdrop-blur-md border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-amber-700" />
                <div>
                  <h3 className="text-sm sm:text-base font-['Cinzel',serif] font-bold text-stone-900 tracking-wider uppercase">
                    DATA PROVENANCE & CALIBRATION AUDIT
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

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs font-sans leading-relaxed text-stone-700">
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
                  <div className="flex items-center gap-2 text-amber-900 font-mono font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>STUDY AREA: GREAT RANN OF KUTCH BASIN</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold">
                    100% VALID SAR PIXELS
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px] font-mono pt-1">
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[9.5px] text-stone-500 uppercase block">GEOGRAPHIC BOUNDS</span>
                    <strong className="text-stone-900 text-[10.5px]">69.45°E – 70.75°E<br />23.68°N – 24.28°N</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[9.5px] text-stone-500 uppercase block">UTM ZONE 42N (EPSG:32642)</span>
                    <strong className="text-stone-900 text-[10.5px]">X: 545,883 – 677,626 m<br />Y: 2,618,871 – 2,686,343 m</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[9.5px] text-stone-500 uppercase block">SWATH DIMENSIONS</span>
                    <strong className="text-stone-900 text-[10.5px]">1,647 × 844 pixels<br />@ 80m spacing (1.39M px)</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[9.5px] text-stone-500 uppercase block">MICROWAVE SENSOR</span>
                    <strong className="text-stone-900 text-[10.5px]">NISAR 24cm L-Band<br />Track 063, Frame 076</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-950 space-y-1">
                <div className="font-mono font-bold text-xs uppercase flex items-center gap-1.5 text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>NASA-ISRO VERIFICATION PRINCIPLE</span>
                </div>
                <p className="text-[11.5px]">
                  Unlike optical satellites that only see reflected surface sunlight, active L-band radar penetrates dry halite salt crystals because dry solid salt has a low loss factor (tan &delta; &lt; 10⁻⁴, Gorham et al., 2001). When the microwave pulse strikes conductive subsoil brine (&sigma; &gt; 5 S/m), the sharp dielectric boundary reflects coherent echoes back to orbit.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
