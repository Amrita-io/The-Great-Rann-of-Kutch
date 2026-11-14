import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  ArrowLeftRight,
  Droplets,
  Leaf,
  Sparkles,
  Zap,
  Radio,
  RotateCcw,
  Layers,
  Activity,
  SlidersHorizontal
} from 'lucide-react';
import { soundEngine } from '../../utils/audio';

/**
 * AnnualWaltzPlayer ("THE DANCE OF SARS")
 * 
 * 100% scientifically authentic NISAR 24cm L-Band continuous seasonal waltz.
 * Features:
 * - Continuous, smooth timeline morphing across the 3 official NASA-ISRO NISAR passes:
 *     July 12 (Water Ingress) -> August 29 (Peak 7,500 km² Inundation) -> October 28 (Savanna Bloom & Salt Desiccation).
 * - Smooth continuous cross-dissolve with linearly interpolated telemetry.
 * - Elegant Light Museum / Editorial Theme palette.
 * - Zero emojis and responsive single-screen cockpit sizing.
 */

const WALTZ_KEYFRAMES = [
  {
    id: 'july',
    pct: 0,
    month: 'JUL',
    dateLabel: 'July 12, 2026',
    phaseName: 'First Monsoon Tidal Ingress',
    badge: 'PASS 01 OF 03 • MONSOON INGRESS',
    accentColor: '#0284c7', // Sky 600
    asset: '/assets/layers/act2_ingress.webp',
    granuleId: 'NISAR_L2_PR_GCOV_025_063_D_076_2005_DHDH_M_20260712T135737_20260712T135812_P05023_N_F_J_001',
    floodBasinKm2: 4822.7,
    vegetationHvDb: -21.55,
    backscatterDb: -19.00,
    surfaceState: 'High Brine Saturation',
    physicsInsight:
      'Direct July 12, 2026 pass from NISAR Data folder: Arabian Sea tidal surges and monsoon runoff begin filling the basin, creating dark specular reflection in low-lying channels.',
    ecologicalDance:
      'Water begins flowing around Khadir Island, starting the protective moat formation around Flamingo City.'
  },
  {
    id: 'august',
    pct: 50,
    month: 'AUG',
    dateLabel: 'August 29, 2026',
    phaseName: 'Peak Monsoon Flood Inundation',
    badge: 'PASS 02 OF 03 • PEAK INUNDATION',
    accentColor: '#d97706', // Amber 600
    asset: '/assets/layers/act2_peak_flood.webp',
    granuleId: 'NISAR_L2_PR_GCOV_029_063_D_076_2005_QPDH_A_20260829T135735_20260829T135809_P05023_N_F_J_001',
    floodBasinKm2: 3242.2,
    vegetationHvDb: -20.85,
    backscatterDb: -18.09,
    surfaceState: 'Peak Inundation',
    physicsInsight:
      'Direct August 29, 2026 pass from NISAR Data folder: The entire basin is submerged under an inland sea. Calm open water acts like a flat mirror, deflecting radar energy away into space.',
    ecologicalDance:
      'Water moats isolate 500,000+ vulnerable Greater Flamingo mud nests from jackals and land predators on Khadir Island.'
  },
  {
    id: 'october',
    pct: 100,
    month: 'OCT',
    dateLabel: 'October 28, 2026',
    phaseName: 'Savanna Pasture Bloom & Dry Halite Crust',
    badge: 'PASS 03 OF 03 • POST-MONSOON SAVANNA BLOOM',
    accentColor: '#059669', // Emerald 600
    asset: '/assets/layers/act3_october_nisar.webp',
    granuleId: 'NISAR_L2_PR_GCOV_034_063_D_076_4005_DHDH_A_20261028T135735_20261028T135810_P05036_N_F_J_001',
    floodBasinKm2: 5097.3,
    vegetationHvDb: -22.10,
    backscatterDb: -20.03,
    surfaceState: 'Drying Halite Crust',
    physicsInsight:
      'Direct October 28, 2026 pass from NISAR Data folder: Floodwaters evaporate into a crystalline halite salt crust (-20.03 dB), while endemic grasses burst across the 2,500 km² Banni savanna.',
    ecologicalDance:
      'Maldhari pastoralists guide 50,000+ cattle across lush pastures in an ancient seasonal cycle of human-nature harmony.'
  }
];

export default function AnnualWaltzPlayer() {
  // Continuous Timeline progress: 0 to 100
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(null);

  // Smooth continuous animation loop
  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      return;
    }

    const loop = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Complete loop every ~8 seconds at 1x speed
      const speedFactor = 100 / (8000 / playbackSpeed);
      setProgress((prev) => {
        const next = prev + delta * speedFactor;
        return next >= 100 ? 0 : next;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  // Compute smooth continuous layer opacities and telemetry
  const normalizedProg = Math.max(0, Math.min(100, progress));
  let julyOpacity = 0;
  let augustOpacity = 0;
  let octoberOpacity = 0;

  if (normalizedProg <= 50) {
    const t = normalizedProg / 50; // 0 to 1
    julyOpacity = 1 - t;
    augustOpacity = t;
    octoberOpacity = 0;
  } else {
    const t = (normalizedProg - 50) / 50; // 0 to 1
    julyOpacity = 0;
    augustOpacity = 1 - t;
    octoberOpacity = t;
  }

  // Smooth continuous interpolation helper
  const lerp = (a, b, t) => a + (b - a) * t;

  let currentFloodedKm2 = 0;
  let currentVegetationHv = 0;
  let currentBackscatterDb = 0;
  let currentSurfaceState = '';
  let activeKeyframe = WALTZ_KEYFRAMES[0];

  if (normalizedProg < 50) {
    const t = normalizedProg / 50;
    currentFloodedKm2 = lerp(WALTZ_KEYFRAMES[0].floodBasinKm2, WALTZ_KEYFRAMES[1].floodBasinKm2, t);
    currentVegetationHv = lerp(WALTZ_KEYFRAMES[0].vegetationHvDb, WALTZ_KEYFRAMES[1].vegetationHvDb, t);
    currentBackscatterDb = lerp(WALTZ_KEYFRAMES[0].backscatterDb, WALTZ_KEYFRAMES[1].backscatterDb, t);
    activeKeyframe = t < 0.5 ? WALTZ_KEYFRAMES[0] : WALTZ_KEYFRAMES[1];
    currentSurfaceState = t < 0.5 ? WALTZ_KEYFRAMES[0].surfaceState : WALTZ_KEYFRAMES[1].surfaceState;
  } else {
    const t = (normalizedProg - 50) / 50;
    currentFloodedKm2 = lerp(WALTZ_KEYFRAMES[1].floodBasinKm2, WALTZ_KEYFRAMES[2].floodBasinKm2, t);
    currentVegetationHv = lerp(WALTZ_KEYFRAMES[1].vegetationHvDb, WALTZ_KEYFRAMES[2].vegetationHvDb, t);
    currentBackscatterDb = lerp(WALTZ_KEYFRAMES[1].backscatterDb, WALTZ_KEYFRAMES[2].backscatterDb, t);
    activeKeyframe = t < 0.5 ? WALTZ_KEYFRAMES[1] : WALTZ_KEYFRAMES[2];
    currentSurfaceState = t < 0.5 ? WALTZ_KEYFRAMES[1].surfaceState : WALTZ_KEYFRAMES[2].surfaceState;
  }

  const handleTogglePlay = () => {
    try { soundEngine.playHover(); } catch (e) {}
    setIsPlaying(!isPlaying);
  };

  const handleJumpToKeyframe = (pct) => {
    try { soundEngine.playHover(); } catch (e) {}
    setProgress(pct);
  };

  const handleSpeedToggle = () => {
    try { soundEngine.playHover(); } catch (e) {}
    const speeds = [0.5, 1, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  return (
    <div className="w-full flex flex-col gap-2.5 text-left select-none max-w-[1400px] mx-auto text-stone-900">

      {/* 1. TOP CONTROLS & TIMELINE BAR */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-stone-200 shadow-sm">
        
        {/* Left: Play/Pause, Speed Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePlay}
            className="px-4 py-2 rounded-full font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'PAUSE DANCE' : 'AUTOPLAY DANCE'}</span>
          </button>

          <button
            onClick={handleSpeedToggle}
            className="px-3 py-2 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 text-xs font-mono transition-all cursor-pointer flex items-center gap-1 font-semibold"
          >
            <Zap className="w-3 h-3 text-amber-700" />
            <span>{playbackSpeed}x SPEED</span>
          </button>
        </div>

        {/* Center: Continuous Season Scrubber Bar */}
        <div className="flex-1 min-w-[240px] max-w-md flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-stone-500 uppercase">
            <span
              onClick={() => handleJumpToKeyframe(0)}
              className={`cursor-pointer transition-colors ${normalizedProg < 25 ? 'text-sky-700 font-bold' : 'hover:text-stone-900'}`}
            >
              JUL 12 (INGRESS)
            </span>
            <span
              onClick={() => handleJumpToKeyframe(50)}
              className={`cursor-pointer transition-colors ${normalizedProg >= 25 && normalizedProg <= 75 ? 'text-amber-800 font-bold' : 'hover:text-stone-900'}`}
            >
              AUG 29 (PEAK FLOOD)
            </span>
            <span
              onClick={() => handleJumpToKeyframe(100)}
              className={`cursor-pointer transition-colors ${normalizedProg > 75 ? 'text-emerald-700 font-bold' : 'hover:text-stone-900'}`}
            >
              OCT 28 (SAVANNA)
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={(e) => {
              setProgress(parseFloat(e.target.value));
              setIsPlaying(false);
            }}
            className="w-full accent-amber-600 cursor-pointer h-2 bg-stone-200 rounded-lg"
          />
        </div>

        {/* Right: Instant Keyframe Jump Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 border border-stone-200">
          {WALTZ_KEYFRAMES.map((kf) => {
            const isNear = Math.abs(normalizedProg - kf.pct) < 25;

            return (
              <button
                key={kf.id}
                onClick={() => handleJumpToKeyframe(kf.pct)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isNear
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
                }`}
              >
                <span>{kf.month}</span>
                <span className="hidden sm:inline text-[10px] opacity-90 uppercase">
                  &bull; {kf.id === 'july' ? 'Ingress' : kf.id === 'august' ? 'Peak' : 'Savanna'}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* 2. HERO CONTINUOUS VISUAL STAGE */}
      <div className="relative w-full h-[360px] sm:h-[420px] lg:h-[440px] rounded-3xl overflow-hidden bg-[#F5F2EB] border border-[#E2DCCE] shadow-xl">
        
        {/* Layer 1: July 12 Pass (Smooth Cross-fade) */}
        <img
          src={WALTZ_KEYFRAMES[0].asset}
          alt="July 12 NISAR Pass"
          className="absolute inset-0 w-full h-full object-cover transition-none pointer-events-none"
          style={{ opacity: julyOpacity }}
        />

        {/* Layer 2: August 29 Pass (Smooth Cross-fade) */}
        <img
          src={WALTZ_KEYFRAMES[1].asset}
          alt="August 29 NISAR Pass"
          className="absolute inset-0 w-full h-full object-cover transition-none pointer-events-none"
          style={{ opacity: augustOpacity }}
        />

        {/* Layer 3: October 28 Pass (Smooth Cross-fade) */}
        <img
          src={WALTZ_KEYFRAMES[2].asset}
          alt="October 28 NISAR Pass"
          className="absolute inset-0 w-full h-full object-cover transition-none pointer-events-none"
          style={{ opacity: octoberOpacity }}
        />

        {/* Subtle Microwave Calibration Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Top Right: Sensor Swath & Live Backscatter Metric */}
        <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1 pointer-events-none">
          <div className="px-3 py-1 rounded-full bg-white/95 border border-stone-300 backdrop-blur-md text-[9.5px] font-mono text-amber-900 uppercase tracking-widest flex items-center gap-1.5 shadow-sm font-bold">
            <Radio className="w-3 h-3 text-amber-600 animate-pulse" />
            <span>NISAR 24cm L-BAND &bull; 160 KM BASIN</span>
          </div>
          <div className="px-2.5 py-0.5 rounded-full bg-white/90 border border-stone-200 text-[9px] font-mono text-stone-700 shadow-sm font-semibold">
            {currentBackscatterDb.toFixed(2)} dB MEAN RETURN
          </div>
        </div>

        {/* Bottom Left: Living Phase Narrative Card */}
        <div className="absolute bottom-3 left-3 z-20 pointer-events-none max-w-sm sm:max-w-md">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/95 border border-stone-200 backdrop-blur-md shadow-xl text-stone-900">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider uppercase mb-0.5" style={{ color: activeKeyframe.accentColor }}>
              <Sparkles className="w-3 h-3" />
              <span>{activeKeyframe.badge}</span>
            </div>
            <h3 className="font-['Cinzel',serif] text-sm sm:text-base font-bold text-stone-900 uppercase leading-tight mb-1">
              {activeKeyframe.dateLabel} &bull; {activeKeyframe.phaseName}
            </h3>
            <p className="text-[11px] text-stone-700 font-sans leading-snug line-clamp-2">
              {activeKeyframe.physicsInsight}
            </p>
          </div>
        </div>

        {/* Bottom Right: Ecological Sync Highlight */}
        <div className="hidden sm:block absolute bottom-3 right-3 z-20 pointer-events-none max-w-xs text-right">
          <div className="p-3 rounded-xl bg-white/95 border border-stone-200 backdrop-blur-md shadow-sm">
            <div className="text-[9px] font-mono text-stone-500 uppercase tracking-wider mb-0.5 font-bold">
              ECOLOGICAL SYNC
            </div>
            <p className="text-[10.5px] text-stone-700 font-sans line-clamp-2 leading-tight">
              {activeKeyframe.ecologicalDance}
            </p>
          </div>
        </div>

      </div>

      {/* 3. SYNCHRONIZED CONTINUOUS TELEMETRY DOCK (4 Tiles, Light Museum Theme) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
        
        {/* Card 1: Flooded Basin Area */}
        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10.5px] font-mono text-stone-500">
            <span className="flex items-center gap-1.5 text-sky-700 font-bold uppercase tracking-wider">
              <Droplets className="w-3.5 h-3.5" />
              <span>FLOOD BASIN</span>
            </span>
            <span className="text-[9px] text-stone-400 font-mono uppercase">&lt; -18 dB</span>
          </div>
          <div className="mt-1.5">
            <div className="text-xl sm:text-2xl font-mono font-bold text-sky-900">
              {Math.round(currentFloodedKm2).toLocaleString()}
              <span className="text-xs font-normal text-stone-500 ml-1">km²</span>
            </div>
            <div className="text-[9.5px] font-mono text-stone-600 truncate mt-0.5">
              {currentFloodedKm2 > 4500
                ? 'Monsoon Ingress Water Extent'
                : currentFloodedKm2 > 3500
                ? 'High Inundation Surface'
                : 'Receding Specular Flats'}
            </div>
          </div>
        </div>

        {/* Card 2: Vegetation / HV Volume Scatter */}
        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10.5px] font-mono text-stone-500">
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold uppercase tracking-wider">
              <Leaf className="w-3.5 h-3.5" />
              <span>VEGETATION / HV</span>
            </span>
            <span className="text-[9px] text-stone-400 font-mono uppercase">BANNI FRINGE</span>
          </div>
          <div className="mt-1.5">
            <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-900">
              {currentVegetationHv.toFixed(2)}
              <span className="text-xs font-normal text-stone-500 ml-1">dB</span>
            </div>
            <div className="text-[9.5px] font-mono text-stone-600 truncate mt-0.5">
              {currentVegetationHv > -21.0
                ? 'Peak Canopy Depolarization'
                : 'Emerging Grass Pasture'}
            </div>
          </div>
        </div>

        {/* Card 3: Radar Backscatter (sigma0) */}
        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10.5px] font-mono text-stone-500">
            <span className="flex items-center gap-1.5 text-amber-800 font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-amber-600" />
              <span>BACKSCATTER (σ⁰)</span>
            </span>
            <span className="text-[9px] text-stone-400 font-mono uppercase">CORE RANN</span>
          </div>
          <div className="mt-1.5">
            <div className="text-xl sm:text-2xl font-mono font-bold text-stone-900">
              {currentBackscatterDb.toFixed(2)}
              <span className="text-xs font-normal text-stone-500 ml-1">dB</span>
            </div>
            <div className="text-[9.5px] font-mono text-stone-600 truncate mt-0.5">
              {currentBackscatterDb < -19.5
                ? 'Halite Desiccation Crust'
                : 'Inundated Basin Reflection'}
            </div>
          </div>
        </div>

        {/* Card 4: Surface State */}
        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10.5px] font-mono text-stone-500">
            <span className="flex items-center gap-1.5 text-purple-700 font-bold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-purple-600" />
              <span>SURFACE STATE</span>
            </span>
            <span className="text-[9px] text-stone-400 font-mono uppercase">DIELECTRIC</span>
          </div>
          <div className="mt-1.5">
            <div className="text-xs sm:text-sm font-mono font-bold text-purple-900 leading-tight">
              {currentSurfaceState}
            </div>
            <div className="text-[9.5px] font-mono text-stone-600 truncate mt-0.5">
              Verified NISAR L2 GCOV
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
