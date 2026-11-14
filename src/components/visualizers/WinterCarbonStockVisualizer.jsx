import React, { useState } from 'react';
import { Zap, Layers, Sparkles, Scale, Info, CheckCircle2 } from 'lucide-react';

export default function WinterCarbonStockVisualizer() {
  const [selectedPool, setSelectedPool] = useState('anoxic-silt');

  // Biomass of Life inspiration: Voxel representation
  // Total: 1.42M tons CO2e = 142 voxel cubes (each cube = 10,000 metric tons CO2e)
  const pools = {
    'perennial-grass': {
      name: 'PERENNIAL DESERT GRASSES',
      tonsCO2e: '0.22 Million Tons',
      density: '2.1 t C / ha',
      pct: '15.5%',
      voxels: 22,
      color: '#34d399',
      bgColor: 'bg-emerald-950/30',
      borderColor: 'border-emerald-400',
      radarSource: 'Calibrated from October HV cross-polarization (-24.56 dB) multi-bounce volume scattering.',
      carbonMechanism: 'Fast-growing C4 drought-adapted grasses (Dichanthium, Cenchrus) that convert monsoon moisture into aboveground carbon.'
    },
    'woody-scrub': {
      name: 'WOODY SCRUB & PROSOPIS CANOPY',
      tonsCO2e: '0.38 Million Tons',
      density: '3.6 t C / ha',
      pct: '26.8%',
      voxels: 38,
      color: '#fbbf24',
      bgColor: 'bg-amber-950/30',
      borderColor: 'border-amber-400',
      radarSource: 'Derived from dual-pol RGB ratio and L-band penetration through dense woody thickets.',
      carbonMechanism: 'Perennial lignified stems and taproots that survive 48°C summer heat, locking carbon above and below the surface.'
    },
    'root-crowns': {
      name: 'ROOT CROWNS & FIBROUS PEAT',
      tonsCO2e: '0.28 Million Tons',
      density: '2.6 t C / ha',
      pct: '19.7%',
      voxels: 28,
      color: '#06b6d4',
      bgColor: 'bg-cyan-950/30',
      borderColor: 'border-cyan-400',
      radarSource: 'Estimated via root-zone hydraulic retention (42.1% moisture) in the 2-15 cm subsoil layer.',
      carbonMechanism: 'Dense subsurface fibrous root biomass that stabilizes sandy silt against winter dust storms and monsoonal erosion.'
    },
    'anoxic-silt': {
      name: 'DEEP ANOXIC SALINE SEDIMENTS',
      tonsCO2e: '0.54 Million Tons',
      density: '5.1 t C / ha',
      pct: '38.0%',
      voxels: 54,
      color: '#38bdf8',
      bgColor: 'bg-sky-950/40',
      borderColor: 'border-sky-400',
      radarSource: 'Monsoon silt flood deposition (seasonal wetland basin) sealed beneath the non-conductive winter halite crust.',
      carbonMechanism: 'Extremely high salinity and permanent anaerobic conditions shut down microbial decomposition, permanently entombing organic carbon for centuries.'
    }
  };

  const curPool = pools[selectedPool];

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6 items-stretch">
      {/* LEFT: ISOMETRIC VOXEL CUBE STACK (Biomass of Life Inspiration) */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="relative aspect-square w-full max-w-[540px] mx-auto rounded-2xl overflow-hidden bg-[#030712] border-2 border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)] p-5 flex flex-col justify-between select-none">
          {/* Header */}
          <div className="flex justify-between items-center text-xs font-mono pb-2 border-b border-white/10">
            <span className="text-emerald-300 font-bold uppercase flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>ECOSYSTEM BIOMASS CARBON POOL</span>
            </span>
            <span className="text-white/60">1 VOXEL = 10,000 TONS CO₂e</span>
          </div>

          {/* Isometric Voxel Grid Display */}
          <div className="flex-1 flex flex-col justify-center items-center py-4">
            <div className="w-full max-w-[420px] p-4 rounded-xl bg-black/60 border border-white/10 flex flex-col gap-3">
              <div className="text-[10px] font-mono text-white/60 uppercase flex justify-between">
                <span>142 CUMULATIVE VOXELS</span>
                <span className="text-emerald-400 font-bold">1.42 MILLION TONS TOTAL</span>
              </div>

              {/* Voxel Cubes Display */}
              <div className="grid grid-cols-12 gap-1.5 p-2 rounded-lg bg-black/80 border border-white/10 max-h-56 overflow-y-auto">
                {/* 54 Anoxic Silt Voxels */}
                {Array.from({ length: 54 }).map((_, i) => (
                  <div
                    key={`silt-${i}`}
                    onClick={() => setSelectedPool('anoxic-silt')}
                    className={`aspect-square rounded-[3px] transition-all cursor-pointer ${selectedPool === 'anoxic-silt'
                        ? 'bg-sky-400 shadow-[0_0_8px_#38bdf8] scale-110 z-10'
                        : 'bg-sky-800/80 hover:bg-sky-600'
                      }`}
                    title="Deep Anoxic Saline Silt (10k tons)"
                  />
                ))}

                {/* 28 Root Crowns Voxels */}
                {Array.from({ length: 28 }).map((_, i) => (
                  <div
                    key={`root-${i}`}
                    onClick={() => setSelectedPool('root-crowns')}
                    className={`aspect-square rounded-[3px] transition-all cursor-pointer ${selectedPool === 'root-crowns'
                        ? 'bg-cyan-400 shadow-[0_0_8px_#06b6d4] scale-110 z-10'
                        : 'bg-cyan-800/80 hover:bg-cyan-600'
                      }`}
                    title="Root Crowns & Peat (10k tons)"
                  />
                ))}

                {/* 38 Woody Scrub Voxels */}
                {Array.from({ length: 38 }).map((_, i) => (
                  <div
                    key={`scrub-${i}`}
                    onClick={() => setSelectedPool('woody-scrub')}
                    className={`aspect-square rounded-[3px] transition-all cursor-pointer ${selectedPool === 'woody-scrub'
                        ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24] scale-110 z-10'
                        : 'bg-amber-700/80 hover:bg-amber-600'
                      }`}
                    title="Woody Scrub Canopy (10k tons)"
                  />
                ))}

                {/* 22 Perennial Grass Voxels */}
                {Array.from({ length: 22 }).map((_, i) => (
                  <div
                    key={`grass-${i}`}
                    onClick={() => setSelectedPool('perennial-grass')}
                    className={`aspect-square rounded-[3px] transition-all cursor-pointer ${selectedPool === 'perennial-grass'
                        ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] scale-110 z-10'
                        : 'bg-emerald-800/80 hover:bg-emerald-600'
                      }`}
                    title="Perennial Grass Biomass (10k tons)"
                  />
                ))}
              </div>

              {/* Voxel Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[9px] font-mono">
                <div className="flex items-center gap-1.5 text-sky-300">
                  <div className="w-2.5 h-2.5 rounded-[2px] bg-sky-400" />
                  <span>Silt (38%)</span>
                </div>
                <div className="flex items-center gap-1.5 text-cyan-300">
                  <div className="w-2.5 h-2.5 rounded-[2px] bg-cyan-400" />
                  <span>Roots (20%)</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-300">
                  <div className="w-2.5 h-2.5 rounded-[2px] bg-amber-400" />
                  <span>Scrub (27%)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-300">
                  <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400" />
                  <span>Grass (15%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom telemetry readout */}
          <div className="flex justify-between items-center text-[10px] font-mono text-white/80 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20">
            <span>MULTI-SEASONAL NISAR SYNTHESIS</span>
            <span className="text-emerald-300 font-bold">13.4 t C / HA REGIONAL STOCK</span>
          </div>
        </div>

        {/* POOL SELECTOR BUTTON ROW */}
        <div className="p-3.5 rounded-xl bg-[#070e1c] border border-emerald-500/30 flex flex-col gap-2">
          <div className="text-xs font-mono font-bold text-white/80 uppercase">
            EXPLORE CARBON COMPARTMENTS:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.keys(pools).map((k) => {
              const item = pools[k];
              const isCur = selectedPool === k;
              return (
                <button
                  key={k}
                  onClick={() => setSelectedPool(k)}
                  className={`py-2 px-2.5 rounded-lg text-left transition-all border ${isCur
                      ? `${item.bgColor} ${item.borderColor} text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]`
                      : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/5'
                    }`}
                >
                  <div className="text-[9.5px] font-mono font-bold uppercase truncate">{item.name.split(' ')[0]}</div>
                  <div className="text-[8.5px] text-white/50">{item.pct}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT: DETAILED MECHANISM & CARBON CREDIT IMPACT */}
      <div className="flex-1 flex flex-col justify-between gap-4">
        {/* TOP: ACTIVE POOL DETAILS */}
        <div className="p-4 rounded-xl bg-[#070e1c] border border-emerald-500/30 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono">
            <span className="text-emerald-400 font-bold uppercase">{curPool.name}</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
              {curPool.pct} OF TOTAL
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-3 rounded-lg bg-black/40 border border-white/10">
              <div className="text-[9.5px] font-mono text-white/50 uppercase">STORED CO₂ EQUIVALENT</div>
              <div className="text-xl font-mono font-bold text-emerald-300">{curPool.tonsCO2e}</div>
              <div className="text-[9px] text-white/60">{curPool.voxels} voxel blocks</div>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-white/10">
              <div className="text-[9.5px] font-mono text-white/50 uppercase">CARBON DENSITY</div>
              <div className="text-xl font-mono font-bold text-cyan-300">{curPool.density}</div>
              <div className="text-[9px] text-white/60">Tons elemental carbon / ha</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-black/50 border border-white/10 text-left space-y-1">
            <div className="text-[10px] font-mono text-emerald-300 font-bold uppercase">
              SEQUESTRATION MECHANISM:
            </div>
            <p className="text-xs text-white/80 font-sans leading-relaxed">
              {curPool.carbonMechanism}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 text-left text-[10px] font-mono text-white/60">
            <span className="text-white/40 uppercase">RADAR DERIVATION: </span>
            <span>{curPool.radarSource}</span>
          </div>
        </div>

        {/* MIDDLE: CUMULATIVE MULTI-SEASONAL SYNTHESIS RECEIPT */}
        <div className="p-4 rounded-xl bg-[#040817] border-2 border-emerald-500/30 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono">
            <span className="text-white/60 uppercase">IPCC WETLAND CARBON ACCOUNTING</span>
            <span className="text-emerald-400 font-bold">CERTIFIED BASELINE</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-left">
            <div className="p-2.5 rounded-lg bg-black/50 border border-white/10">
              <div className="text-[8.5px] font-mono text-white/50 uppercase">SANCTUARY AREA</div>
              <div className="text-sm font-mono font-bold text-white">7,505 km²</div>
            </div>
            <div className="p-2.5 rounded-lg bg-black/50 border border-white/10">
              <div className="text-[8.5px] font-mono text-white/50 uppercase">MEAN CARBON DENSITY</div>
              <div className="text-sm font-mono font-bold text-emerald-300">13.4 t C / ha</div>
            </div>
            <div className="p-2.5 rounded-lg bg-black/50 border border-white/10">
              <div className="text-[8.5px] font-mono text-white/50 uppercase">ANNUAL FLUX</div>
              <div className="text-sm font-mono font-bold text-cyan-300">+48,000 t / yr</div>
            </div>
          </div>
        </div>

        {/* BOTTOM: WHY THIS MATTERS FOR INTERNATIONAL CLIMATE FINANCING */}
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-400/30 flex items-start gap-3">
          <Scale className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-left text-xs font-sans text-white/80 leading-relaxed">
            <strong className="text-emerald-300 font-mono uppercase block text-[11px] mb-0.5">
              INTERNATIONAL CARBON CREDIT VERIFICATION
            </strong>
            Under Article 6 of the Paris Agreement, developing nations can monetize verified wetland carbon sinks.
            By providing transparent, tamper-proof satellite radar monitoring of carbon stocks across all seasons, NISAR enables Gujarat to secure certified carbon financing to fund pastoral habitat restoration.
          </div>
        </div>
      </div>
    </div>
  );
}

