import React, { useState } from 'react';
import { Droplets, Sliders, Activity, ArrowDown, ShieldCheck, Sun } from 'lucide-react';

export default function GreenerySubsoilVisualizer() {
  // Day post-monsoon: 0 (Oct 1) to 120 (Jan 31)
  // Default: Day 28 (October 28, matching NISAR L2 GCOV acquisition date)
  const [dayPostMonsoon, setDayPostMonsoon] = useState(28);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(1); // 0 = surface, 1 = root-zone, 2 = deep silt

  // Physics calculation based on dry-down days
  // Topsoil dries out very quickly (within 15 days)
  const topsoilMoisture = Math.max(3.2, 55 - dayPostMonsoon * 1.8).toFixed(1);
  const topsoilDielectric = (3.2 + (topsoilMoisture / 55) * 20).toFixed(1);

  // Root-zone retains moisture much longer (sponge effect of organic matter & roots)
  const rootZoneMoisture = Math.max(14.5, 62 - dayPostMonsoon * 0.71).toFixed(1);
  const rootZoneDielectric = (5.5 + (rootZoneMoisture / 62) * 32).toFixed(1);

  // Deep marine silt remains saturated for months due to clay impermeability
  const deepSiltMoisture = Math.max(48.0, 72 - dayPostMonsoon * 0.20).toFixed(1);
  const deepSiltDielectric = (12.0 + (deepSiltMoisture / 72) * 42).toFixed(1);

  const strata = [
    {
      name: 'DRY SURFACE SUN-CRUST (0 - 2 CM)',
      depth: '0 - 2 cm',
      moisture: `${topsoilMoisture}%`,
      dielectric: `ε′ ≈ ${topsoilDielectric}`,
      status: dayPostMonsoon > 15 ? 'Bone Dry Crust' : 'Drying Topsoil',
      color: '#e2e8f0',
      bgColor: 'bg-amber-950/20',
      borderColor: 'border-amber-400/40',
      radarBehavior: 'Transparent to 24cm microwaves (non-conductive mineral crust). Radar passes straight through without attenuation.'
    },
    {
      name: 'ACTIVE ROOT-ZONE RESERVOIR (2 - 15 CM)',
      depth: '2 - 15 cm',
      moisture: `${rootZoneMoisture}%`,
      dielectric: `ε′ ≈ ${rootZoneDielectric}`,
      status: 'Hydraulic Sponge',
      color: '#34d399',
      bgColor: 'bg-emerald-950/40',
      borderColor: 'border-emerald-400',
      radarBehavior: 'High microwave dielectric reflection (real permittivity ε′ > 20). Strong backscatter confirms persistent moisture feeding savanna grasses.'
    },
    {
      name: 'RELICT SALINE MARINE SILT (15 - 40+ CM)',
      depth: '15 - 40+ cm',
      moisture: `${deepSiltMoisture}%`,
      dielectric: `ε′ ≈ ${deepSiltDielectric}`,
      status: 'Anoxic Saturated Silt',
      color: '#38bdf8',
      bgColor: 'bg-sky-950/40',
      borderColor: 'border-sky-400/50',
      radarBehavior: 'High dielectric and conductive barrier. Acts as an impermeable floor retaining root-zone moisture.'
    }
  ];

  const activeStratum = strata[selectedLayerIndex];

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6 items-stretch">
      {/* LEFT: VERTICAL STRATA CUTAWAY (High-Rise Zoo Style) */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="relative aspect-square w-full max-w-[540px] mx-auto rounded-2xl overflow-hidden bg-[#030712] border-2 border-cyan-500/30 shadow-[0_0_40px_rgba(56,189,248,0.15)] p-5 flex flex-col justify-between">
          {/* Header */}
          <div className="flex justify-between items-center text-xs font-mono pb-2 border-b border-white/10">
            <span className="text-cyan-300 font-bold uppercase flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span>ROOT-ZONE HYDRAULIC SOUNDING STRATA</span>
            </span>
            <span className="text-white/60">DAY {dayPostMonsoon} OF 120</span>
          </div>

          {/* 3-Tier Isometric Strata Stack */}
          <div className="flex-1 flex flex-col justify-center gap-2.5 my-2">
            {strata.map((s, idx) => {
              const isSelected = selectedLayerIndex === idx;
              return (
                <div
                  key={s.name}
                  onClick={() => setSelectedLayerIndex(idx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${s.bgColor} ${isSelected
                      ? `${s.borderColor} shadow-[0_0_20px_rgba(56,189,248,0.3)] scale-[1.02]`
                      : 'border-white/10 hover:border-white/20'
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-mono font-bold text-white uppercase">{s.name}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-black/60 border border-white/10 text-white/80">
                      DEPTH: {s.depth}
                    </span>
                  </div>

                  {/* Visual moisture bar */}
                  <div className="w-full h-2 rounded-full bg-black/50 overflow-hidden flex">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${s.moisture}`,
                        backgroundColor: idx === 0 ? '#fbbf24' : idx === 1 ? '#10b981' : '#0ea5e9'
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] font-mono pt-1 text-white/70">
                    <span>MOISTURE: <strong className="text-white">{s.moisture}</strong></span>
                    <span>PERMITTIVITY: <strong className="text-cyan-300">{s.dielectric}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Microwave Penetration Vector Graphic */}
          <div className="p-2.5 rounded-xl bg-black/70 border border-white/10 flex items-center justify-between text-[9.5px] font-mono text-white/70">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <ArrowDown className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
              <span>24cm MICROWAVE PENETRATION: 15 CM DEEP</span>
            </span>
            <span>PASSES SURFACE CRUST &bull; REFLECTS OFF ROOT WATER</span>
          </div>
        </div>

        {/* 120-DAY POST-MONSOON DRY-DOWN TIMELINE SLIDER */}
        <div className="p-4 rounded-xl bg-[#070e1c] border border-cyan-500/30 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>POST-MONSOON DRY-DOWN TIMELINE (DAYS):</span>
            </span>
            <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs border border-cyan-400/30">
              DAY {dayPostMonsoon} (POST-MONSOON)
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="120"
            step="1"
            value={dayPostMonsoon}
            onChange={(e) => setDayPostMonsoon(parseInt(e.target.value, 10))}
            className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-white/50">
            <span>Day 0 (Floods Drain)</span>
            <span className="text-emerald-300 font-bold">Day 28 (NISAR Satellite Pass)</span>
            <span>Day 120 (Winter Salt Arrives)</span>
          </div>
        </div>
      </div>

      {/* RIGHT: DETAILED LAYER TELEMETRY & DAIRY COOPERATIVE IMPACT */}
      <div className="flex-1 flex flex-col justify-between gap-4">
        {/* TOP: ACTIVE STRATUM TELEMETRY */}
        <div className="p-4 rounded-xl bg-[#070e1c] border border-cyan-500/30 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono">
            <span className="text-cyan-400 font-bold uppercase">{activeStratum.name}</span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px]">
              {activeStratum.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-3 rounded-lg bg-black/40 border border-white/10">
              <div className="text-[9.5px] font-mono text-white/50 uppercase">VOLUMETRIC MOISTURE</div>
              <div className="text-xl font-mono font-bold text-cyan-300">{activeStratum.moisture}</div>
              <div className="text-[9px] text-white/60">Subsoil water content</div>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-white/10">
              <div className="text-[9.5px] font-mono text-white/50 uppercase">DIELECTRIC PERMITTIVITY</div>
              <div className="text-xl font-mono font-bold text-emerald-300">{activeStratum.dielectric}</div>
              <div className="text-[9px] text-white/60">Radar reflectivity index</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-black/50 border border-white/10 text-left space-y-1">
            <div className="text-[10px] font-mono text-cyan-300 font-bold uppercase">
              RADAR INTERACTION BEHAVIOR:
            </div>
            <p className="text-xs text-white/80 font-sans leading-relaxed">
              {activeStratum.radarBehavior}
            </p>
          </div>
        </div>

        {/* MIDDLE: THE HIDDEN WATER TABLE TELEMETRY CARD */}
        <div className="p-4 rounded-xl bg-[#040817] border-2 border-cyan-500/30 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono">
            <span className="text-white/60 uppercase">HYDRAULIC RESERVOIR METRICS</span>
            <span className="text-cyan-400 font-bold">120-DAY BUFFER</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-2.5 rounded-lg bg-black/50 border border-white/10">
              <div className="text-[9px] font-mono text-white/50 uppercase">ROOT-ZONE DEPTH</div>
              <div className="text-base font-mono font-bold text-white">2 - 15 cm</div>
              <div className="text-[8.5px] text-white/60">Grass root catchment</div>
            </div>
            <div className="p-2.5 rounded-lg bg-black/50 border border-white/10">
              <div className="text-[9px] font-mono text-white/50 uppercase">RETENTION CAPACITY</div>
              <div className="text-base font-mono font-bold text-emerald-300">42.1% Moisture</div>
              <div className="text-[8.5px] text-white/60">At October 28 pass</div>
            </div>
          </div>
        </div>

        {/* BOTTOM: WHY THIS MATTERS FOR HUMAN STAKEHOLDERS */}
        <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-400/30 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-left text-xs font-sans text-white/80 leading-relaxed">
            <strong className="text-cyan-300 font-mono uppercase block text-[11px] mb-0.5">
              DROUGHT EARLY WARNING FOR DAIRY COOPERATIVES
            </strong>
            Gujarat's dairy cooperatives (e.g. Sarhad Dairy) produce over 400,000 liters of milk daily from Kutch herds. By sounding root-zone moisture weeks before aboveground grasses visually show drought stress, cooperatives accurately forecast winter fodder reserves and schedule fodder shipments before milk yields drop.
          </div>
        </div>
      </div>
    </div>
  );
}

