import React, { useState } from 'react';
import { Layers, Activity, Sparkles, Scale, Info, Sliders } from 'lucide-react';

export default function GreeneryBiomassVisualizer() {
  // Biomass density in Mg/ha (megagrams / metric tons per hectare)
  // Calibrated default from NASA-ISRO L2 GCOV Track 063: 28.5 Mg/ha
  const [biomassMgHa, setBiomassMgHa] = useState(28.5);
  const [selectedCanopyType, setSelectedCanopyType] = useState('mixed-savanna'); // 'native-grass' | 'mixed-savanna' | 'prosopis-thicket'

  // Physical cross-polarization backscatter modeling:
  // Depolarized return sigma0_HV = f(biomass)
  // At 0 Mg/ha (bare ground): -34.0 dB
  // At 28.5 Mg/ha (Banni mean): -24.56 dB
  // At 60 Mg/ha (dense Prosopis): -18.2 dB
  const hvBackscatterDb = (-34.0 + (biomassMgHa / 60.0) * 15.8).toFixed(2);

  // Carrying capacity model calculation (scenario/model):
  // 1 adult indigenous cattle / buffalo requires ~3.5 tons forage dry matter per season
  // Across ~2,618 km² Banni Savanna = 261,800 hectares (ICAR / GUIDE)
  const totalBiomassMegatons = ((biomassMgHa * 261800) / 1000000).toFixed(2);
  const livestockSupported = Math.round((biomassMgHa * 261800) / 3.5);

  const canopies = {
    'native-grass': {
      title: 'NATIVE DESERT GRASSLANDS (DICHANTHIUM)',
      height: '0.4 - 0.8 meters',
      stalkOrientation: 'Vertical Stems',
      depolarizationRatio: 'Low-Medium (-28.2 dB)',
      forageValue: 'Prime palatable forage for Maldhari pastoral herds.',
      biomassDefault: 14.5
    },
    'mixed-savanna': {
      title: 'BANNI SAVANNA MOSAIC (GRASS + SCRUB)',
      height: '1.2 - 2.5 meters',
      stalkOrientation: 'Random Multi-Angle Branching',
      depolarizationRatio: 'High Volume Scatter (-24.56 dB)',
      forageValue: 'Balanced seasonal grazing zone supporting 50,000+ livestock.',
      biomassDefault: 28.5
    },
    'prosopis-thicket': {
      title: 'INVASIVE PROSOPIS JULIFLORA THICKET',
      height: '3.0 - 5.5 meters',
      stalkOrientation: 'Dense Woody Lignified Canopy',
      depolarizationRatio: 'Very High Scatter (-18.4 dB)',
      forageValue: 'Non-palatable invasive canopy crowding native biodiversity.',
      biomassDefault: 52.0
    }
  };

  const curCanopy = canopies[selectedCanopyType];

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6 items-stretch">
      {/* LEFT: CALIBRATED SATELLITE IMAGE + INTERACTIVE RAY TRACING */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="relative aspect-square w-full max-w-[540px] mx-auto rounded-2xl overflow-hidden bg-[#030712] border-2 border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)] group">
          {/* Calibrated October Greenery Biomass Satellite Layer */}
          <img
            src="/assets/layers/nisar_square_biomass_carbon.webp"
            alt="October Banni Savanna Biomass SAR"
            className="w-full h-full object-cover"
          />

          {/* Calibrated HUD Reticle Overlay */}
          <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-emerald-500/40 text-[10px] font-mono text-emerald-300">
                <span className="font-bold">NASA-ISRO L2 GCOV</span> &bull; 24cm L-BAND HV
              </div>
              <div className="px-2.5 py-1 rounded bg-black/80 border border-white/20 text-[9px] font-mono text-white/70">
                OCTOBER 28 &bull; TRACK 063
              </div>
            </div>

            {/* Simulated microwave volume bounce ray tracer */}
            <div className="relative w-full h-44 rounded-xl bg-black/75 backdrop-blur-md border border-emerald-500/30 p-3 flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between items-center text-[10px] font-mono text-emerald-300">
                <span className="font-bold">MICROWAVE VOLUME SCATTER RAY TRACER</span>
                <span className="text-white/60">H-POL TRANSMIT &rarr; HV CROSS-POL RETURN</span>
              </div>

              {/* Schematic Ray-Path SVG */}
              <svg className="w-full h-24 overflow-visible" viewBox="0 0 400 90">
                {/* Ground Line */}
                <line x1="20" y1="80" x2="380" y2="80" stroke="#065f46" strokeWidth="2" strokeDasharray="4 2" />
                <text x="25" y="88" fill="#10b981" fontSize="8" fontFamily="monospace">SOIL BOUNDARY</text>

                {/* Stalks / Branches based on biomass */}
                {Array.from({ length: Math.min(22, Math.floor(biomassMgHa / 2.5) + 4) }).map((_, i) => {
                  const x = 50 + i * 15;
                  const h = 25 + (i % 5) * 8 + (biomassMgHa * 0.4);
                  return (
                    <g key={i}>
                      <line
                        x1={x}
                        y1="80"
                        x2={x + ((i % 3) - 1) * 6}
                        y2={80 - h}
                        stroke="#34d399"
                        strokeWidth="1.5"
                        opacity="0.85"
                      />
                      {/* Leaf / branch nodes */}
                      <circle cx={x + ((i % 3) - 1) * 6} cy={80 - h} r="2" fill="#10b981" />
                    </g>
                  );
                })}

                {/* Incident Radar Pulse (Horizontal H-pol, Cyan) */}
                <path
                  d="M 60 10 L 140 45 L 180 65"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />
                <circle cx="60" cy="10" r="3" fill="#38bdf8" />
                <text x="70" y="16" fill="#38bdf8" fontSize="8" fontFamily="monospace">TRANSMITTED H-POL (24cm)</text>

                {/* Multiple Bounces inside canopy */}
                <path
                  d="M 180 65 L 210 50 L 235 68 L 260 40"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2"
                  strokeDasharray="2 2"
                />
                <circle cx="210" cy="50" r="2" fill="#fbbf24" />
                <circle cx="235" cy="68" r="2" fill="#fbbf24" />

                {/* Depolarized Echo (Vertical V-pol return -> HV Channel, Emerald) */}
                <path
                  d="M 260 40 L 320 10"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />
                <circle cx="320" cy="10" r="3" fill="#10b981" />
                <text x="270" y="22" fill="#10b981" fontSize="8" fontFamily="monospace">DEPOLARIZED HV ECHO</text>
              </svg>

              <div className="flex justify-between items-center text-[9.5px] font-mono pt-1 border-t border-white/10">
                <span className="text-white/60">RANDOM ORIENTATIONS ROTATE WAVE POLARIZATION</span>
                <span className="text-emerald-400 font-bold">{hvBackscatterDb} dB ECHO</span>
              </div>
            </div>

            {/* Bottom telemetry readout */}
            <div className="flex justify-between items-center text-[10px] font-mono text-white/80 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20">
              <span>LAT: 23°43'N &bull; LON: 69°50'E</span>
              <span className="text-emerald-300 font-bold">CALIBRATED GCOV PIXEL VALUE</span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE BIOMASS DENSITY SLIDER */}
        <div className="p-4 rounded-xl bg-[#070e1c] border border-emerald-500/30 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-emerald-300 uppercase flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>SIMULATE CANOPY ABOVEGROUND BIOMASS DENSITY:</span>
            </span>
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs border border-emerald-400/30">
              {biomassMgHa} Mg / ha
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="60"
            step="0.5"
            value={biomassMgHa}
            onChange={(e) => setBiomassMgHa(parseFloat(e.target.value))}
            className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-white/50">
            <span>0 Mg/ha (Bare Silt)</span>
            <span className="text-emerald-300 font-bold">28.5 Mg/ha (October Mean)</span>
            <span>60 Mg/ha (Dense Jungle)</span>
          </div>
        </div>
      </div>

      {/* RIGHT: PICTORIAL CANOPY ARCHITECTURE & MALDHARI FORAGE IMPACT */}
      <div className="flex-1 flex flex-col justify-between gap-4">
        {/* TOP: CANOPY SELECTOR */}
        <div className="p-4 rounded-xl bg-[#070e1c] border border-emerald-500/30 flex flex-col gap-3">
          <div className="text-xs font-mono text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>CANOPY STRUCTURAL REGIMES IN BANNI SAVANNA:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {Object.keys(canopies).map((k) => {
              const item = canopies[k];
              const isSelected = selectedCanopyType === k;
              return (
                <button
                  key={k}
                  onClick={() => {
                    setSelectedCanopyType(k);
                    setBiomassMgHa(item.biomassDefault);
                  }}
                  className={`p-3 rounded-lg text-left transition-all border ${isSelected
                      ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'bg-black/30 border-white/10 text-white/70 hover:bg-white/5'
                    }`}
                >
                  <div className="text-[10px] font-mono font-bold uppercase mb-1">
                    {k.replace('-', ' ')}
                  </div>
                  <div className="text-[9px] text-white/50">{item.height}</div>
                </button>
              );
            })}
          </div>

          <div className="p-3 rounded-lg bg-black/40 border border-white/10 text-left space-y-1.5">
            <div className="text-xs font-bold text-white uppercase">{curCanopy.title}</div>
            <p className="text-[11px] text-white/80 leading-relaxed font-sans">{curCanopy.forageValue}</p>
            <div className="flex justify-between text-[10px] font-mono text-emerald-300/80 pt-1 border-t border-white/10">
              <span>SCATTER REGIME: {curCanopy.stalkOrientation}</span>
              <span>{curCanopy.depolarizationRatio}</span>
            </div>
          </div>
        </div>

        {/* MIDDLE: QUANTITATIVE TELEMETRY RECEIPT (Costco Treemap / Data Receipt Style) */}
        <div className="p-4 rounded-xl bg-[#040817] border-2 border-emerald-500/30 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono">
            <span className="text-white/60 uppercase">NASA-ISRO L2 GCOV TELEMETRY RECEIPT</span>
            <span className="text-emerald-400 font-bold">2,500 KM² SAVANNA</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-black/50 border border-white/10">
              <div className="text-[9.5px] font-mono text-white/50 uppercase">HV CROSS-POL ECHO</div>
              <div className="text-lg font-mono font-bold text-emerald-300">{hvBackscatterDb} dB</div>
              <div className="text-[9px] text-white/60">Volume depolarization return</div>
            </div>

            <div className="p-3 rounded-lg bg-black/50 border border-white/10">
              <div className="text-[9.5px] font-mono text-white/50 uppercase">TOTAL BASIN BIOMASS</div>
              <div className="text-lg font-mono font-bold text-emerald-300">{totalBiomassMegatons} Megatons</div>
              <div className="text-[9px] text-white/60">Aboveground dry matter</div>
            </div>

            <div className="p-3 rounded-lg bg-black/50 border border-white/10">
              <div className="text-[9.5px] font-mono text-white/50 uppercase">CARRYING CAPACITY</div>
              <div className="text-lg font-mono font-bold text-amber-300">{livestockSupported.toLocaleString()}</div>
              <div className="text-[9px] text-white/60">Livestock supported for winter</div>
            </div>

            <div className="p-3 rounded-lg bg-black/50 border border-white/10">
              <div className="text-[9.5px] font-mono text-white/50 uppercase">INDIGENOUS BREEDS</div>
              <div className="text-lg font-mono font-bold text-cyan-300">Kankrej & Banni</div>
              <div className="text-[9px] text-white/60">Hardy desert-adapted cattle</div>
            </div>
          </div>
        </div>

        {/* BOTTOM: WHY THIS MATTERS FOR HUMAN STAKEHOLDERS */}
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-400/30 flex items-start gap-3">
          <Scale className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-left text-xs font-sans text-white/80 leading-relaxed">
            <strong className="text-emerald-300 font-mono uppercase block text-[11px] mb-0.5">
              NON-DESTRUCTIVE REGIONAL FORAGE INVENTORY
            </strong>
            Prior to satellite radar, estimating forage required clipping and weighing grass quadrats across 2,500 km².
            NISAR provides Maldhari pastoralists with instant carrying capacity metrics, ensuring cattle herds survive the dry winter months without overgrazing.
          </div>
        </div>
      </div>
    </div>
  );
}

