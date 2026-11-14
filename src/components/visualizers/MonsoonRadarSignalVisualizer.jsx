import React, { useState } from 'react';
import { Satellite, CloudRain, Eye, ShieldCheck, Waves, Sparkles } from 'lucide-react';

export default function MonsoonRadarSignalVisualizer() {
  const [selectedSensor, setSelectedSensor] = useState('l-band'); // 'optical' | 'c-band' | 'l-band'

  const sensors = {
    optical: {
      name: 'Optical Satellite Camera (e.g. Landsat / Sentinel-2)',
      wavelength: '0.5 μm (Visible Light)',
      cloudPenetration: '0%',
      rainAttenuation: '100% Blocked',
      groundResolution: 'Completely Obscured by Monsoon Clouds',
      color: '#f87171',
      status: 'BLINDED BY STORM CLOUDS',
      physics: 'Visible light waves are smaller than cloud water droplets (10–30 μm). Droplets scatter light in all directions (Mie scattering), creating a blinding white wall of clouds that blocks the ground.'
    },
    'c-band': {
      name: 'C-Band Radar (e.g. Sentinel-1 SAR)',
      wavelength: '5.6 cm (5.4 GHz)',
      cloudPenetration: '85%',
      rainAttenuation: '35% Attenuated in Tropical Torrential Downpours',
      groundResolution: 'Moderate Attenuation in Heavy Monsoon Rain Cells',
      color: '#fbbf24',
      status: 'PARTIAL MONSOON ATTENUATION',
      physics: 'C-band microwaves penetrate thin clouds, but heavy tropical rain droplets and intense monsoon storm cells cause noticeable path delay and signal attenuation.'
    },
    'l-band': {
      name: 'NASA-ISRO NISAR L-Band SAR',
      wavelength: '24.0 cm (1.25 GHz)',
      cloudPenetration: '100%',
      rainAttenuation: '0% (Completely Rain-Proof)',
      groundResolution: 'Crystal-Clear 10-Meter Resolution 24/7',
      color: '#34d399',
      status: '100% ALL-WEATHER PENETRATION',
      physics: '24cm microwaves are over 10,000 times larger than rain and cloud droplets. Because Rayleigh scattering falls as 1/λ⁴, microwaves pass right through dense monsoons without any distortion!'
    }
  };

  const curSensor = sensors[selectedSensor];

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6 items-stretch">
      {/* LEFT: ATMOSPHERIC EXPLODED PENETRATION COLUMN (Inspired by High-Rise Zoo) */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-[#030612] border-2 border-cyan-500/30 p-4 flex flex-col justify-between shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 border-b border-white/10 pb-2">
            <span className="font-bold flex items-center gap-1.5">
              <Satellite className="w-3.5 h-3.5 text-cyan-400" />
              <span>ATMOSPHERIC PENETRATION COLUMN &bull; 747 KM TO SURFACE</span>
            </span>
            <span className="text-white/40">RAYLEIGH SCATTERING &prop; 1/&lambda;&sup4;</span>
          </div>

          {/* Vertical Strata Scene */}
          <div className="relative flex-1 flex flex-col justify-between py-2 overflow-hidden">
            {/* Level 1: Satellite Orbit (747 km) */}
            <div className="p-3 rounded-xl bg-black/80 border border-cyan-400/30 flex items-center justify-between z-10">
              <div className="flex items-center gap-2.5">
                <Satellite className="w-5 h-5 text-cyan-300 animate-pulse" />
                <div>
                  <div className="text-xs font-bold font-mono text-white">ORBIT: 747 KM ALTITUDE</div>
                  <div className="text-[9.5px] font-mono text-cyan-300">NASA-ISRO NISAR OBSERVATORY</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-400/40 text-cyan-300 font-bold">
                {selectedSensor.toUpperCase()} MODE
              </span>
            </div>

            {/* Simulated Pulse Beams Passing Downward */}
            <div className="relative h-28 my-2 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
              {/* Cloud Layer Representation */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-800/80 via-slate-700/90 to-slate-900/95 flex items-center justify-center">
                <div className="flex items-center gap-2 text-white/50 text-[11px] font-mono font-bold uppercase">
                  <CloudRain className="w-5 h-5 text-sky-400 animate-bounce" />
                  <span>DENSE MONSOON STORM CLOUDS (10–30 &mu;m RAIN DROPLETS)</span>
                </div>
              </div>

              {/* Beam Penetration Effect */}
              {selectedSensor === 'optical' && (
                <div className="absolute inset-0 bg-white/95 flex items-center justify-center text-rose-600 font-mono text-xs font-bold shadow-inner">
                  BLOCKED BY CLOUDS (0% GROUND VISIBILITY)
                </div>
              )}

              {selectedSensor === 'c-band' && (
                <div className="absolute inset-0 bg-amber-400/20 backdrop-blur-sm flex items-center justify-center text-amber-300 font-mono text-xs font-bold">
                  MODERATE RAIN ATTENUATION (65% TRANSMISSION)
                </div>
              )}

              {selectedSensor === 'l-band' && (
                <div className="absolute inset-0 bg-emerald-500/25 flex items-center justify-center text-emerald-300 font-mono text-xs font-bold shadow-[inset_0_0_30px_rgba(52,211,153,0.5)]">
                  100% MICROWAVE PENETRATION &bull; ZERO CLOUD ATTENUATION
                </div>
              )}
            </div>

            {/* Level 3: Ground Surface (Khadir Island & Flamingo City) */}
            <div className="p-3 rounded-xl bg-black/80 border border-emerald-400/30 flex items-center justify-between z-10">
              <div className="flex items-center gap-2.5">
                <Waves className="w-5 h-5 text-emerald-300" />
                <div>
                  <div className="text-xs font-bold font-mono text-white">GROUND: KHADIR BET SANCTUARY</div>
                  <div className="text-[9.5px] font-mono text-emerald-300">500,000+ BREEDING FLAMINGOS PROTECTED</div>
                </div>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                selectedSensor === 'optical' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-400/40'
              }`}>
                {selectedSensor === 'optical' ? 'GROUND HIDDEN' : '10M GROUND RESOLUTION'}
              </span>
            </div>
          </div>

          {/* Sensor Switcher Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
            {Object.entries(sensors).map(([k, s]) => {
              const isSel = selectedSensor === k;
              return (
                <button
                  key={k}
                  onClick={() => setSelectedSensor(k)}
                  className={`p-2 rounded-xl text-left border cursor-pointer transition-all ${
                    isSel
                      ? 'bg-white/15 border-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                      : 'bg-black/40 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-[10px] font-mono font-bold uppercase truncate" style={{ color: s.color }}>
                    {k.toUpperCase()}
                  </div>
                  <div className="text-[8.5px] font-mono text-white/50">{s.wavelength}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* WAVELENGTH SCALE COMPARISON */}
        <div className="p-4 rounded-2xl bg-[#060b17] border border-cyan-500/20 text-left">
          <div className="text-[10px] font-mono font-bold text-cyan-300 uppercase mb-2">
            PHYSICAL SCALE COMPARISON: 24cm RADAR VS. 20 &mu;m RAIN DROPLET
          </div>
          <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-white font-bold">NISAR Microwave: </span>
              <span className="text-emerald-300">240,000 &mu;m (24 cm)</span>
            </div>
            <span className="text-cyan-400 font-bold">&gt;&gt; 10,000x LARGER &gt;&gt;</span>
            <div>
              <span className="text-white font-bold">Rain Droplet: </span>
              <span className="text-amber-300">20 &mu;m</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: SCIENTIFIC DATASET & HUMAN TAKEAWAYS */}
      <div className="flex-1 flex flex-col gap-4 text-left">
        <div className="p-5 rounded-2xl bg-[#060b17] border border-white/15 backdrop-blur-2xl shadow-xl flex flex-col gap-3.5">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-300 uppercase">
              RADAR PENETRATION STATUS: {curSensor.status}
            </span>
            <span className="text-[9px] font-mono text-white/40">{curSensor.wavelength}</span>
          </div>

          <h3 className="font-['Cinzel',serif] text-base sm:text-lg font-bold text-white">
            {curSensor.name}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="text-[9px] font-mono text-white/50 uppercase">Cloud Penetration</div>
              <div className="text-xl font-bold font-mono text-emerald-300 mt-0.5">{curSensor.cloudPenetration}</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="text-[9px] font-mono text-white/50 uppercase">Rain Attenuation</div>
              <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">{curSensor.rainAttenuation}</div>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-black/50 border border-cyan-400/20 text-xs">
              <div className="font-mono text-[10px] font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>1. WHAT THE RADAR SEES:</span>
              </div>
              <p className="text-white/80 font-sans mt-1 leading-relaxed">
                Flawless 10-meter ground resolution 24 hours a day. While optical satellites see only a solid white wall of clouds, NISAR reveals the entire flood landscape as if the clouds were completely invisible.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/50 border border-amber-400/20 text-xs">
              <div className="font-mono text-[10px] font-bold text-amber-300 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>2. WHY IT HAPPENS (PHYSICAL PRINCIPLE):</span>
              </div>
              <p className="text-white/80 font-sans mt-1 leading-relaxed">
                {curSensor.physics}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/50 border border-emerald-400/20 text-xs">
              <div className="font-mono text-[10px] font-bold text-emerald-300 uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>3. WHAT PEOPLE CAN TAKE AWAY:</span>
              </div>
              <p className="text-white/80 font-sans mt-1 leading-relaxed">
                Coastal emergency responders maintain continuous situational awareness during torrential cyclones and monsoonal depressions, while wildlife rangers track flamingo colonies without blackout periods.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
