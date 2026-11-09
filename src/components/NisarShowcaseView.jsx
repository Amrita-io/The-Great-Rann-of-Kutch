import React, { useState, useRef, useEffect, useCallback } from 'react';
import { soundEngine } from '../utils/audio';

// NASA-ISRO NISAR Mission Cal/Val Calibration Datasets for Act I: The Great Rann of Kutch
const RADAR_MODES = {
  'L-BAND': {
    name: 'L-BAND SAR',
    agency: 'NASA JPL',
    wavelength: '24 cm (1.25 GHz)',
    role: 'Deep Subsurface Penetration & Aquifer Mapping',
    backscatter: '-18.4 dB (HH)',
    polarization: 'Quad-Pol (HH+HV+VH+VV)',
    penetration: '0.72 m into halite',
    coherence: '0.94 (Exceptional)',
    dielectric: '3.18 εr (Dry Halite)',
    color: '#38bdf8', // Cyan
    summary: 'Microwaves penetrate dry crystalline sodium chloride crust to detect the subterranean brine aquifer table at 0.38m depth. Near-zero surface vegetation yields world-record interferometric correlation.',
    frequency: '1,257.5 MHz',
    bandwidth: '80 MHz',
    snr: '28.4 dB'
  },
  'S-BAND': {
    name: 'S-BAND SAR',
    agency: 'ISRO SAC',
    wavelength: '9.3 cm (3.2 GHz)',
    role: 'Surface Roughness & Halite Crystal Geometry',
    backscatter: '-12.1 dB (VV)',
    polarization: 'Dual-Pol (VV+VH)',
    penetration: '0.14 m into crust',
    coherence: '0.91 (High)',
    dielectric: '3.25 εr (Polygonal Salt)',
    color: '#34d399', // Emerald
    summary: 'S-band captures fine-scale halite crystallization boundaries, hexagonal desiccation crack geometry, and surface roughness variance (RMS 0.84 cm) across the central salt plateau.',
    frequency: '3,200.0 MHz',
    bandwidth: '75 MHz',
    snr: '26.8 dB'
  },
  'InSAR': {
    name: 'InSAR INTERFEROMETRY',
    agency: 'NASA-ISRO JOINT',
    wavelength: 'Differential Phase (L+S Dual-Band)',
    role: 'Sub-Millimeter Crust Deformation & Tectonic Baseline',
    backscatter: 'Phase Coherence: 0.96',
    polarization: 'Interferometric Repeat-Pass',
    penetration: 'Millimeter Crust Stability',
    coherence: '0.96 (Near Perfect)',
    dielectric: 'Zero Spatial Decorrelation',
    color: '#c084fc', // Purple/Holographic
    summary: '12-day repeat-pass differential interferometry confirms the Rann of Kutch has vertical deformation rates < 0.6 mm/year, certifying it as the global baseline calibration mirror for all Earth observation satellites.',
    frequency: 'Dual L+S Phase',
    bandwidth: 'Repeat Pass',
    snr: '34.2 dB'
  }
};

// Subsurface Geological Stratigraphy Layers of the Kutch Salt Basin
const STRATA_LAYERS = [
  {
    id: 'layer-crust',
    depth: '0.00 – 0.05 m',
    title: 'Superficial Halite Crust (98.4% NaCl)',
    desc: 'Dense crystalline salt polygons formed by solar desiccation. Highly transparent to microwaves with low attenuation (0.12 dB/m).',
    dielectric: '3.18 εr',
    attenuation: '0.12 dB/m'
  },
  {
    id: 'layer-matrix',
    depth: '0.05 – 0.38 m',
    title: 'Compacted Gypsum & Silt Matrix',
    desc: 'Intermediate vadose stratum with micro-crystalline gypsum and fine desert silt. Acts as low-loss microwave propagation waveguide.',
    dielectric: '4.20 εr',
    attenuation: '0.45 dB/m'
  },
  {
    id: 'layer-aquifer',
    depth: '0.38 m+',
    title: 'Subterranean Hypersaline Brine Table',
    desc: 'Saturated groundwater brine table. Sharp dielectric contrast (εr > 68) causes intense specular microwave bounce, detected clearly by NASA JPL L-band radar.',
    dielectric: '68.5 εr',
    attenuation: 'High Reflection'
  }
];

export default function NisarShowcaseView({ onBackToAct1, onBackToDiorama, onReturnToOrbit, isActive = false }) {
  const [selectedMode, setSelectedMode] = useState('L-BAND');
  const [selectedPol, setSelectedPol] = useState('HH');
  const [activeLayer, setActiveLayer] = useState(null);
  const [showRaster, setShowRaster] = useState(true);
  const [showSweep, setShowSweep] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [probePos, setProbePos] = useState({ x: 50, y: 50 });
  const [isHoveringRadar, setIsHoveringRadar] = useState(false);
  const [fadeState, setFadeState] = useState('idle');
  const radarCanvasRef = useRef(null);
  const rasterImgRef = useRef(null);
  const animationFrameRef = useRef(null);

  const modeData = RADAR_MODES[selectedMode];

  // Activate NASA-ISRO NISAR high-tech telemetry sound track ONLY when viewing radar section
  useEffect(() => {
    if (isActive) {
      soundEngine.setMode('nisar');
    }
  }, [isActive]);

  const handleNavigate = (callback) => {
    setFadeState('fading-out');
    setTimeout(() => {
      if (callback) callback();
    }, 700);
  };

  // Preload high-res calibrated SAR Granule overlay
  useEffect(() => {
    const img = new Image();
    img.src = '/assets/kutch_act1_silence_overlay.png';
    img.onload = () => {
      rasterImgRef.current = img;
    };
  }, []);

  // Dynamic Canvas Rendering for Synthetic Aperture Radar Simulation
  useEffect(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    const render = () => {
      t += 0.02;
      const w = canvas.width;
      const h = canvas.height;

      // Dark radar screen background
      ctx.fillStyle = '#04070d';
      ctx.fillRect(0, 0, w, h);

      // Draw real calibrated SAR Granule overlay (specular null & halite basin)
      if (showRaster && rasterImgRef.current) {
        ctx.save();
        ctx.globalAlpha = 0.82;
        ctx.drawImage(rasterImgRef.current, 0, 0, w, h);
        ctx.restore();
      }

      if (selectedMode === 'L-BAND') {
        // L-Band: Deep radar penetration with subsurface aquifer contours
        const grad = ctx.createRadialGradient(w * 0.48, h * 0.5, 20, w * 0.5, h * 0.5, w * 0.55);
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.40)');
        grad.addColorStop(0.35, 'rgba(14, 116, 144, 0.22)');
        grad.addColorStop(0.75, 'rgba(6, 40, 60, 0.12)');
        grad.addColorStop(1, 'rgba(4, 7, 13, 0.98)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Subsurface dielectric wave contours (Aquifer boundary)
        ctx.strokeStyle = activeLayer === 'layer-aquifer' ? 'rgba(56, 189, 248, 0.75)' : 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = activeLayer === 'layer-aquifer' ? 2 : 1;
        for (let r = 35; r < w * 0.55; r += 30) {
          ctx.beginPath();
          for (let a = 0; a <= Math.PI * 2; a += 0.08) {
            const rad = r + Math.sin(a * 4 + t) * 7 + Math.cos(a * 6 - t) * 4;
            const x = w * 0.48 + Math.cos(a) * rad;
            const y = h * 0.5 + Math.sin(a) * (rad * 0.58);
            if (a === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

      } else if (selectedMode === 'S-BAND') {
        // S-Band: Hexagonal polygonal salt desiccation crack matrix
        ctx.strokeStyle = activeLayer === 'layer-crust' ? 'rgba(52, 211, 153, 0.65)' : 'rgba(52, 211, 153, 0.32)';
        ctx.lineWidth = activeLayer === 'layer-crust' ? 1.8 : 1.2;
        const hexSize = 28;
        for (let y = 15; y < h + 20; y += hexSize * 1.5) {
          for (let x = 15; x < w + 20; x += hexSize * 1.732) {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const angle = (i * Math.PI) / 3 + 0.5;
              const hx = x + hexSize * Math.cos(angle);
              const hy = y + hexSize * Math.sin(angle);
              if (i === 0) ctx.moveTo(hx, hy);
              else ctx.lineTo(hx, hy);
            }
            ctx.closePath();
            ctx.stroke();
          }
        }

        // Halite crystal specular highlights (Salt grain backscatter)
        ctx.fillStyle = 'rgba(167, 243, 208, 0.75)';
        for (let i = 0; i < 45; i++) {
          const px = ((i * 73 + t * 18) % (w - 40)) + 20;
          const py = ((i * 47) % (h - 40)) + 20;
          ctx.fillRect(px, py, 2.5, 2.5);
        }

      } else {
        // InSAR: Holographic interference phase fringes (Rainbow contour fringes)
        const numFringes = 13;
        for (let i = numFringes; i >= 1; i--) {
          const r = i * 25 + Math.sin(t + i) * 5;
          const hue = (i * 32 + t * 40) % 360;
          ctx.strokeStyle = `hsla(${hue}, 82%, 65%, 0.45)`;
          ctx.lineWidth = 3.2;
          ctx.beginPath();
          ctx.ellipse(w * 0.5, h * 0.5, r * 1.6, r, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Radar Azimuth & Range Grid Lines
      if (showGrid) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 55) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += 55) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      }

      // Sweeping Radar Azimuth Scan Beam
      if (showSweep) {
        const scanX = ((t * 85) % w);
        const scanGrad = ctx.createLinearGradient(scanX - 60, 0, scanX, 0);
        scanGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        scanGrad.addColorStop(1, 'rgba(56, 189, 248, 0.35)');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(scanX - 60, 0, 60, h);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.moveTo(scanX, 0);
        ctx.lineTo(scanX, h);
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [selectedMode, showRaster, showSweep, showGrid, activeLayer]);

  // Handle probe crosshair movement over radar viewer
  const handleMouseMove = (e) => {
    if (!radarCanvasRef.current) return;
    const rect = radarCanvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setProbePos({ x, y });
  };

  // Real-time calculated telemetry under the crosshair probe
  const probeLat = (23.75 + (probePos.y / 100) * 0.18).toFixed(4);
  const probeLon = (69.95 + (probePos.x / 100) * 0.22).toFixed(4);
  const liveDb = (-18.4 + (probePos.x - 50) * 0.05).toFixed(1);
  const liveCoherence = (0.94 - Math.abs(probePos.x - 50) * 0.0008).toFixed(3);
  const liveDepth = (0.72 - (probePos.y / 100) * 0.12).toFixed(2);

  return (
    <section
      id="sx-nisar-showcase"
      className="relative w-full min-h-screen bg-[#030508] text-white p-4 sm:p-6 md:p-8 flex flex-col justify-between select-none font-['Inter',system-ui,sans-serif]"
    >
      <style>{`
        .sx-hud-glass-dark {
          background: rgba(7, 12, 20, 0.88);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.85);
        }

        .sx-corner-notch {
          position: absolute;
          width: 8px;
          height: 8px;
          border-color: rgba(56, 189, 248, 0.6);
        }
      `}</style>

      {/* ========================================================
          1. TOP NAVIGATION & MISSION TELEMETRY HEADER
      ======================================================== */}
      <header className="relative z-20 flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          {/* Mission Identity Badges */}
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 rounded text-[8.5px] font-mono tracking-widest uppercase bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold">
              NASA JPL × ISRO SAC
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[9.5px] font-mono tracking-[0.28em] uppercase text-white/55">
              NISAR OBSERVATORY // ACT-I: SILENCE
            </span>
          </div>

          <h1 className="font-['Cinzel',serif] text-2xl sm:text-3xl md:text-4xl text-white font-medium tracking-[0.10em]">
            THE WHITE DESERT RADAR SHOWCASE
          </h1>
          <p className="text-[10px] font-mono tracking-[0.22em] text-cyan-400/80 uppercase mt-1">
            GREAT RANN OF KUTCH CALIBRATION & VALIDATION (CAL/VAL) SUPER-SITE
          </p>
        </div>

        {/* Orbit Flight Capsule */}
        <div className="hidden lg:flex items-center gap-4 px-4 py-2 rounded-full border border-white/15 bg-white/[0.03] text-[9.5px] font-mono tracking-[0.20em] text-white/80">
          <span>ALT: 747 KM POLAR ORBIT</span>
          <span className="w-1 h-1 rounded-full bg-cyan-400" />
          <span>SWATH: 242 KM</span>
          <span className="w-1 h-1 rounded-full bg-cyan-400" />
          <span>CYCLE: 12-DAY REPEAT</span>
        </div>

        {/* Action Buttons & GIS Exports */}
        <div className="flex items-center gap-2.5">
          <a
            href="/assets/kutch_act1_silence_clipped.tif"
            download="kutch_act1_silence_clipped.tif"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-[9.5px] font-mono tracking-wider uppercase text-cyan-200 transition-all"
            title="Download Clipped GeoTIFF (WGS84 EPSG:4326) for QGIS/ArcGIS"
          >
            <span>⤓ GeoTIFF (GIS)</span>
          </a>
          <a
            href="/assets/kutch_act1_silence_overlay.png"
            download="kutch_act1_silence_overlay.png"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/[0.12] text-[9.5px] font-mono tracking-wider uppercase text-white/80 hover:text-white transition-all"
            title="Download High-Res Transparent Web Map Overlay"
          >
            <span>⤓ PNG Overlay</span>
          </a>
          {onBackToDiorama && (
            <button
              onClick={() => handleNavigate(onBackToDiorama)}
              onMouseEnter={() => soundEngine.playHover()}
              className="px-3.5 py-1.5 rounded-full border border-white/20 bg-white/[0.04] hover:bg-white/[0.12] text-[10px] font-mono tracking-widest uppercase text-white transition-all cursor-pointer"
            >
              ← 5 Acts Diorama
            </button>
          )}
          {onBackToAct1 && (
            <button
              onClick={onBackToAct1}
              onMouseEnter={() => soundEngine.playHover()}
              className="px-3.5 py-1.5 rounded-full border border-white/20 bg-white/[0.04] hover:bg-white/[0.12] text-[10px] font-mono tracking-widest uppercase text-white transition-all cursor-pointer"
            >
              ↑ Act-1 Video
            </button>
          )}
          {onReturnToOrbit && (
            <button
              onClick={onReturnToOrbit}
              onMouseEnter={() => soundEngine.playHover()}
              className="px-3.5 py-1.5 rounded-full border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-[10px] font-mono tracking-widest uppercase text-cyan-200 transition-all cursor-pointer"
            >
              Orbit →
            </button>
          )}
        </div>
      </header>

      {/* ========================================================
          2. CORE INTERACTION: RADAR SPECTRAL EXPLORER + LIVE DATA VIEWER
      ======================================================== */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-stretch justify-between gap-6 my-6 max-w-7xl mx-auto w-full">
        
        {/* Left Column: Synthetic Aperture Radar Visualizer */}
        <div className="relative flex-1 sx-hud-glass-dark rounded-2xl p-5 border border-white/15 flex flex-col justify-between overflow-hidden min-h-[480px]">
          
          {/* Corner Notches */}
          <div className="sx-corner-notch top-2 left-2 border-t border-l" />
          <div className="sx-corner-notch top-2 right-2 border-t border-r" />
          <div className="sx-corner-notch bottom-2 left-2 border-b border-l" />
          <div className="sx-corner-notch bottom-2 right-2 border-b border-r" />

          {/* Canvas Header & Band Selector Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 z-20">
            <div className="flex items-center gap-2 font-mono text-[9px] tracking-widest uppercase text-white/70">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: modeData.color }} />
              <span>RADAR SYNTHETIC VIEW // {modeData.name}</span>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-2">
              {Object.keys(RADAR_MODES).map((modeKey) => (
                <button
                  key={modeKey}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedMode(modeKey);
                  }}
                  onMouseEnter={() => soundEngine.playHover()}
                  className={`px-3 py-1 rounded-md text-[9px] font-mono tracking-wider transition-all cursor-pointer ${
                    selectedMode === modeKey
                      ? 'bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/30'
                      : 'bg-white/[0.05] border border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  {modeKey}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Radar Canvas */}
          <div
            className="relative flex-1 w-full rounded-xl overflow-hidden cursor-crosshair border border-white/10 min-h-[300px]"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHoveringRadar(true)}
            onMouseLeave={() => setIsHoveringRadar(false)}
          >
            <canvas
              ref={radarCanvasRef}
              width={760}
              height={420}
              className="w-full h-full object-cover"
            />

            {/* Target Reticle Cursor Overlay */}
            {isHoveringRadar && (
              <div
                className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-30"
                style={{ left: `${probePos.x}%`, top: `${probePos.y}%` }}
              >
                <div className="w-9 h-9 border border-cyan-400/80 rounded-full flex items-center justify-center animate-spin">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 rounded bg-black/95 border border-cyan-500/40 font-mono text-[8px] tracking-wider whitespace-nowrap text-cyan-200 shadow-xl">
                  <div>LAT: {probeLat}°N | LON: {probeLon}°E</div>
                  <div className="text-white/70">σ°: {liveDb} dB | γ: {liveCoherence} | DEPTH: {liveDepth}m</div>
                </div>
              </div>
            )}

            {/* Top-Right Canvas Quick Overlay Controls */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowRaster(!showRaster);
                }}
                className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-wider border cursor-pointer ${
                  showRaster
                    ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                    : 'bg-black/60 border-white/10 text-white/40'
                }`}
              >
                GRANULE {showRaster ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowSweep(!showSweep);
                }}
                className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-wider border cursor-pointer ${
                  showSweep
                    ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                    : 'bg-black/60 border-white/10 text-white/40'
                }`}
              >
                SWEEP {showSweep ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowGrid(!showGrid);
                }}
                className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-wider border cursor-pointer ${
                  showGrid
                    ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                    : 'bg-black/60 border-white/10 text-white/40'
                }`}
              >
                GRID {showGrid ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Bottom-left Radar Map Metadata */}
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/85 backdrop-blur-md border border-white/15 font-mono text-[8.5px] text-white/70 space-y-0.5 pointer-events-none z-20">
              <div>TARGET: KUTCH HALITE FLATS (CAL/VAL ZONE 01)</div>
              <div>RESOLUTION: 3M × 10M STRIPMAP | POLARIZATION: {selectedPol}</div>
              <div className="text-cyan-400">SURFACE COHERENCE: {modeData.coherence}</div>
            </div>
          </div>

          {/* Subsurface Stratigraphy Selector Pills */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[8.5px] tracking-widest uppercase text-white/50">
                INTERACTIVE SUBSURFACE CORE STRATIGRAPHY (HALITE BASIN)
              </span>
              <span className="font-mono text-[8px] text-cyan-400">
                CLICK TO HIGHLIGHT REFLECTION
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {STRATA_LAYERS.map((layer) => {
                const isSelected = activeLayer === layer.id;
                return (
                  <button
                    key={layer.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setActiveLayer(isSelected ? null : layer.id);
                    }}
                    onMouseEnter={() => soundEngine.playHover()}
                    className={`p-2 rounded-lg text-left transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-400 shadow-md shadow-cyan-500/20'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[8px] text-cyan-300 mb-0.5">
                      <span>{layer.depth}</span>
                      <span>{layer.dielectric}</span>
                    </div>
                    <div className="text-[10px] font-semibold text-white truncate">
                      {layer.title}
                    </div>
                    <div className="text-[8.5px] text-white/50 line-clamp-1 mt-0.5">
                      {layer.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode Summary Footer */}
          <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between text-[9px] font-mono text-white/60">
            <div>DEVELOPED BY: <span className="text-white font-semibold">{modeData.agency}</span></div>
            <div>WAVELENGTH: <span className="text-white font-semibold">{modeData.wavelength}</span></div>
            <div>RADAR ROLE: <span className="text-cyan-300 font-semibold">{modeData.role}</span></div>
          </div>
        </div>

        {/* Right Column: Mission Telemetry & Calibration Matrix */}
        <div className="w-full lg:w-96 flex flex-col justify-between gap-4">
          
          {/* Card 1: Key Instrument Telemetry Matrix */}
          <div className="sx-hud-glass-dark rounded-2xl p-5 border border-white/15 relative">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <span className="font-mono text-[9px] tracking-[0.24em] uppercase text-cyan-400 font-bold">
                RADAR TELEMETRY MATRIX
              </span>
              <span className="font-mono text-[8.5px] px-2 py-0.5 rounded bg-white/10 text-white/80">
                ACT-I / HALITE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 font-mono">
              <div className="bg-white/[0.03] p-2.5 rounded-lg border border-white/5">
                <span className="text-white/40 block text-[7.5px] tracking-widest uppercase mb-1">RADAR BACKSCATTER</span>
                <span className="text-cyan-300 font-bold text-sm">{modeData.backscatter}</span>
              </div>
              <div className="bg-white/[0.03] p-2.5 rounded-lg border border-white/5">
                <span className="text-white/40 block text-[7.5px] tracking-widest uppercase mb-1">InSAR COHERENCE</span>
                <span className="text-white font-bold text-sm">{modeData.coherence.split(' ')[0]}</span>
              </div>
              <div className="bg-white/[0.03] p-2.5 rounded-lg border border-white/5">
                <span className="text-white/40 block text-[7.5px] tracking-widest uppercase mb-1">HALITE DIELECTRIC</span>
                <span className="text-white font-bold text-sm">{modeData.dielectric.split(' ')[0]}</span>
              </div>
              <div className="bg-white/[0.03] p-2.5 rounded-lg border border-white/5">
                <span className="text-white/40 block text-[7.5px] tracking-widest uppercase mb-1">CRUST PENETRATION</span>
                <span className="text-cyan-300 font-bold text-sm">{modeData.penetration.split(' ')[0]}</span>
              </div>
            </div>

            {/* Polarization Filter Switcher */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[7.5px] font-mono tracking-widest uppercase text-white/50">
                  POLARIZATION CHANNEL:
                </span>
                <span className="text-[8px] font-mono text-cyan-300">{selectedPol}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[8.5px]">
                {['HH', 'HV', 'VV', 'QUAD'].map((pol) => (
                  <button
                    key={pol}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedPol(pol);
                    }}
                    onMouseEnter={() => soundEngine.playHover()}
                    className={`flex-1 py-1 rounded text-center transition-all cursor-pointer ${
                      selectedPol === pol
                        ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200 font-bold'
                        : 'bg-white/[0.04] border border-white/10 text-white/50 hover:text-white'
                    }`}
                  >
                    {pol}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed font-light mt-4 pt-3 border-t border-white/10">
              {modeData.summary}
            </p>
          </div>

          {/* Card 2: Why Kutch is NISAR's Global Cal/Val Super-Site */}
          <div className="sx-hud-glass-dark rounded-2xl p-5 border border-cyan-500/20 bg-cyan-950/20 relative flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-cyan-300 font-bold">
                  WHY THE RANN OF KUTCH?
                </span>
              </div>

              <h2 className="font-['Cinzel',serif] text-sm text-white font-medium mb-2">
                Earth’s Ultimate Planetary Radar Mirror
              </h2>

              <p className="text-[11px] text-slate-300 leading-relaxed font-light">
                With an elevation variance of less than 30 centimeters over 7,500 square kilometers and zero vegetative clutter, the salt crust reflects microwaves with theoretical mathematical purity. NASA and ISRO use Kutch to calibrate NISAR’s dual-frequency radar phased-array before worldwide deployment.
              </p>
            </div>

            {/* Validation Specs */}
            <div className="mt-4 pt-3 border-t border-cyan-500/20 font-mono text-[8.5px] flex items-center justify-between text-cyan-200">
              <span>ACCURACY: ±0.4 MM DISPLACEMENT</span>
              <span>CAL STATUS: VERIFIED 2026</span>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================
          3. FOOTER TELEMETRY
      ======================================================== */}
      <footer className="relative z-20 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10 text-[9px] font-mono text-white/50">
        <div className="flex items-center gap-3">
          <span>COORDINATES: 23.83° N, 70.03° E</span>
          <span>•</span>
          <span>DATUM: WGS 84</span>
          <span>•</span>
          <span>SPATIAL DOMAIN: GUJARAT HALITE BASIN</span>
        </div>

        <div>
          MISSION DATA PROVIDED BY NASA JPL & ISRO SAC EARTH SCIENCE
        </div>
      </footer>

      {/* ========================================================
          CINEMATIC BLACK FADE OVERLAY
      ======================================================== */}
      <div
        className="fixed inset-0 z-50 bg-[#030508] pointer-events-none transition-opacity duration-700 ease-in-out"
        style={{
          opacity: fadeState === 'idle' ? 0 : 1,
          visibility: fadeState === 'idle' ? 'hidden' : 'visible'
        }}
      />
    </section>
  );
}
