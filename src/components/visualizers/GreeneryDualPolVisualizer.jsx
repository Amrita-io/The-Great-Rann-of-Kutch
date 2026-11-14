import React, { useState } from 'react';
import { Eye, Layers, Compass, Sliders, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function GreeneryDualPolVisualizer() {
  // Channel state: 'composite' | 'red' | 'green' | 'blue'
  const [activeChannel, setActiveChannel] = useState('composite');
  const [probeLocation, setProbeLocation] = useState('prosopis'); // 'prosopis' | 'native-grass' | 'saline-silt'

  const channelInfo = {
    composite: {
      name: 'DUAL-POL RGB COMPOSITE (NASA STANDARD)',
      r: 'HH Co-Pol (Roughness)',
      g: 'HV Cross-Pol (Canopy Volume)',
      b: 'HH/HV Ratio (Moisture)',
      desc: 'Combines all three physical scattering mechanisms into a single high-contrast image. Green indicates dense vegetative foliage, Red indicates rough soil or crust, and Blue indicates high soil moisture or calm forward reflections.'
    },
    red: {
      name: 'RED CHANNEL • HH CO-POLARIZATION',
      r: 'Transmitted Horizontal &rarr; Received Horizontal',
      g: 'Disabled',
      b: 'Disabled',
      desc: 'Measures single-bounce surface reflections from rough bare ground, rock ridges, and elevated salt crusts. Flat surfaces appear dark, while rough tectonic scarps appear bright red.'
    },
    green: {
      name: 'GREEN CHANNEL • HV CROSS-POLARIZATION',
      r: 'Disabled',
      g: 'Transmitted Horizontal &rarr; Received Vertical',
      b: 'Disabled',
      desc: 'Measures multiple-bounce volume scattering within dense vegetation. Only randomized plant stalks, twigs, and leaves can rotate the polarization from horizontal to vertical, making foliage glow bright green.'
    },
    blue: {
      name: 'BLUE CHANNEL • POLARIMETRIC RATIO (HH / HV)',
      r: 'Disabled',
      g: 'Disabled',
      b: 'Permittivity & Moisture Gradient',
      desc: 'Highlights dielectric moisture variations and smooth water-saturated zones where cross-polarization is minimal, mapping ground moisture retention.'
    }
  };

  const probes = {
    'prosopis': {
      label: 'INVASIVE PROSOPIS THICKET',
      coords: "23°44'N, 69°48'E",
      colorTag: '#10b981',
      rgbValues: { r: 42, g: 215, b: 35 },
      interpretation: 'Dominant Green signature indicates multi-bounce volume scattering within dense woody scrub. Forest departments use this to plan invasive eradication zones.'
    },
    'native-grass': {
      label: 'NATIVE DICHANTHIUM PASTURE',
      coords: "23°38'N, 69°55'E",
      colorTag: '#fbbf24',
      rgbValues: { r: 145, g: 170, b: 60 },
      interpretation: 'Yellow-amber blend of moderate HH roughness and moderate HV canopy. Indicates palatable native perennial grass vital for pastoral milk production.'
    },
    'saline-silt': {
      label: 'RELICT SALINE PLAYA',
      coords: "23°52'N, 70°05'E",
      colorTag: '#38bdf8',
      rgbValues: { r: 30, g: 45, b: 185 },
      interpretation: 'Predominantly Blue-Black signature. High salinity and calm surface water prevent volume scattering, deflecting radar energy specularly forward.'
    }
  };

  const curChannel = channelInfo[activeChannel];
  const curProbe = probes[probeLocation];

  // Visual filter styles depending on active channel
  const getFilterStyle = () => {
    switch (activeChannel) {
      case 'red':
        return 'contrast(1.4) hue-rotate(-90deg) saturate(2.5)';
      case 'green':
        return 'contrast(1.4) hue-rotate(40deg) saturate(3)';
      case 'blue':
        return 'contrast(1.4) hue-rotate(180deg) saturate(2.5)';
      default:
        return 'none';
    }
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6 items-stretch">
      {/* LEFT: CALIBRATED NASA DUAL-POL SATELLITE IMAGE */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="relative aspect-square w-full max-w-[540px] mx-auto rounded-2xl overflow-hidden bg-[#030712] border-2 border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)] group">
          {/* Calibrated October Dual-Pol False Color Satellite Layer */}
          <img
            src="/assets/layers/nisar_square_false_color.webp"
            alt="October Dual-Pol RGB Composite SAR"
            className="w-full h-full object-cover transition-all duration-500"
            style={{ filter: getFilterStyle() }}
          />

          {/* Calibrated HUD Reticle Overlay */}
          <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-emerald-500/40 text-[10px] font-mono text-emerald-300">
                <span className="font-bold">POLARIMETRIC DECOMPOSITION</span> &bull; RGB
              </div>
              <div className="px-2.5 py-1 rounded bg-black/80 border border-white/20 text-[9px] font-mono text-white/70">
                ACTIVE: {activeChannel.toUpperCase()}
              </div>
            </div>

            {/* Target Reticle Pin */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-400 animate-ping opacity-60" />
              <div className="w-4 h-4 -mt-6 rounded-full bg-cyan-400 border border-white shadow-[0_0_15px_#22d3ee]" />
              <div className="mt-1 px-2 py-0.5 rounded bg-black/80 text-[9px] font-mono text-white border border-cyan-400/50">
                {curProbe.label}
              </div>
            </div>

            {/* Bottom telemetry readout */}
            <div className="flex justify-between items-center text-[10px] font-mono text-white/80 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20">
              <span>{curProbe.coords}</span>
              <span className="text-emerald-300 font-bold">NASA-ISRO CALIBRATION TARGET</span>
            </div>
          </div>
        </div>

        {/* CHANNEL ISOLATOR BUTTON BAR */}
        <div className="p-3.5 rounded-xl bg-[#070e1c] border border-emerald-500/30 flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-white/80 uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>ISOLATE POLARIZATION SCATTER CHANNEL:</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setActiveChannel('composite')}
              className={`py-2 px-3 rounded-lg text-[10px] font-mono font-bold uppercase transition-all border ${
                activeChannel === 'composite'
                  ? 'bg-emerald-500/30 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/5'
              }`}
            >
              RGB COMPOSITE
            </button>
            <button
              onClick={() => setActiveChannel('red')}
              className={`py-2 px-3 rounded-lg text-[10px] font-mono font-bold uppercase transition-all border ${
                activeChannel === 'red'
                  ? 'bg-rose-500/30 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                  : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/5'
              }`}
            >
              RED: HH ROUGHNESS
            </button>
            <button
              onClick={() => setActiveChannel('green')}
              className={`py-2 px-3 rounded-lg text-[10px] font-mono font-bold uppercase transition-all border ${
                activeChannel === 'green'
                  ? 'bg-emerald-500/30 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/5'
              }`}
            >
              GREEN: HV CANOPY
            </button>
            <button
              onClick={() => setActiveChannel('blue')}
              className={`py-2 px-3 rounded-lg text-[10px] font-mono font-bold uppercase transition-all border ${
                activeChannel === 'blue'
                  ? 'bg-sky-500/30 border-sky-400 text-white shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                  : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/5'
              }`}
            >
              BLUE: RATIO / MOISTURE
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: PICTORIAL CHANNEL SCIENCE & BOTANICAL PROBE */}
      <div className="flex-1 flex flex-col justify-between gap-4">
        {/* TOP: ACTIVE CHANNEL EXPLANATION */}
        <div className="p-4 rounded-xl bg-[#070e1c] border border-emerald-500/30 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono">
            <span className="text-emerald-400 font-bold uppercase">{curChannel.name}</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
              CALIBRATED
            </span>
          </div>

          <p className="text-xs text-white/80 font-sans leading-relaxed text-left">
            {curChannel.desc}
          </p>

          <div className="grid grid-cols-3 gap-2 text-left pt-2 border-t border-white/10">
            <div className="p-2.5 rounded-lg bg-black/40 border border-rose-500/20">
              <div className="text-[9px] font-mono text-rose-300 font-bold">RED (HH)</div>
              <div className="text-[10px] text-white/70 truncate">{curChannel.r}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-emerald-500/20">
              <div className="text-[9px] font-mono text-emerald-300 font-bold">GREEN (HV)</div>
              <div className="text-[10px] text-white/70 truncate">{curChannel.g}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-sky-500/20">
              <div className="text-[9px] font-mono text-sky-300 font-bold">BLUE (RATIO)</div>
              <div className="text-[10px] text-white/70 truncate">{curChannel.b}</div>
            </div>
          </div>
        </div>

        {/* MIDDLE: BOTANICAL TELEMETRY PROBES */}
        <div className="p-4 rounded-xl bg-[#040817] border-2 border-emerald-500/30 shadow-xl flex flex-col gap-3">
          <div className="text-xs font-mono text-white/60 uppercase tracking-wider flex items-center justify-between">
            <span>SELECT GROUND TRUTH PROBE TARGET:</span>
            <span className="text-emerald-400 font-bold">3 SITES</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {Object.keys(probes).map((k) => {
              const p = probes[k];
              const isCur = probeLocation === k;
              return (
                <button
                  key={k}
                  onClick={() => setProbeLocation(k)}
                  className={`p-2.5 rounded-lg text-left transition-all border ${
                    isCur
                      ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                      : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/5'
                  }`}
                >
                  <div className="text-[10px] font-mono font-bold uppercase truncate">{p.label.split(' ')[0]}</div>
                  <div className="text-[9px] text-white/50">{p.coords}</div>
                </button>
              );
            })}
          </div>

          <div className="p-3 rounded-lg bg-black/50 border border-white/10 text-left space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-white uppercase">
              <span>{curProbe.label}</span>
              <span className="text-[10px] font-mono text-emerald-300">
                RGB ({curProbe.rgbValues.r}, {curProbe.rgbValues.g}, {curProbe.rgbValues.b})
              </span>
            </div>
            <p className="text-[11px] text-white/80 leading-relaxed font-sans">
              {curProbe.interpretation}
            </p>
          </div>
        </div>

        {/* BOTTOM: WHY THIS MATTERS FOR CONSERVATION */}
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-400/30 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-left text-xs font-sans text-white/80 leading-relaxed">
            <strong className="text-emerald-300 font-mono uppercase block text-[11px] mb-0.5">
              FOREST DEPARTMENT INVASIVE SPECIES MAPPING
            </strong>
            The alien shrub *Prosopis juliflora* has invaded over 50% of the native Banni grassland. By decomposing polarimetric channels, Gujarat forest rangers automatically distinguish native low-growth grass from high-density woody thorny scrub without entering harsh desert terrain.
          </div>
        </div>
      </div>
    </div>
  );
}

