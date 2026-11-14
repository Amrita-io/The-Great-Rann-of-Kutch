import React, { useState } from 'react';
import { Activity, Sliders, ShieldAlert, Sparkles, Compass, Eye, Waves } from 'lucide-react';

export default function WinterAllahBundVisualizer() {
  // Mode: 'sar' (calibrated intensity) or 'insar-fringes' (interferometric phase fringes)
  const [viewMode, setViewMode] = useState('insar-fringes');
  const [passOffsetDays, setPassOffsetDays] = useState(12); // 12-day repeat pass interval
  const [faultCrosshair, setFaultCrosshair] = useState('allah-bund-ridge');

  // Crust displacement rate
  const annualStrainMm = 0.38; // < 0.4 mm/yr
  const displacementMicrons = Math.round((annualStrainMm * 1000 * (passOffsetDays / 365)));

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6 items-stretch">
      {/* LEFT: SATELLITE FAULT SCARP & INTERFEROGRAM PHASE FRINGES */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="relative aspect-square w-full max-w-[540px] mx-auto rounded-2xl overflow-hidden bg-[#030712] border-2 border-rose-500/30 shadow-[0_0_40px_rgba(244,63,94,0.15)] group select-none">
          {/* Base Calibrated Radar Image */}
          <img
            src="/assets/layers/nisar_square_radar.webp"
            alt="Allah Bund Fault Radar"
            className="w-full h-full object-cover"
          />

          {/* Synthetic InSAR Phase Fringe Overlay */}
          {viewMode === 'insar-fringes' && (
            <div
              className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-80"
              style={{
                background: 'repeating-linear-gradient(45deg, rgba(244,63,94,0.3) 0px, rgba(56,189,248,0.3) 15px, rgba(52,211,153,0.3) 30px, rgba(251,191,36,0.3) 45px, rgba(244,63,94,0.3) 60px)'
              }}
            />
          )}

          {/* Fault Line Trace HUD */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 540 540">
            {/* 1819 Allah Bund 50-90 km Surface Fault Scarp line */}
            <path
              d="M 50 250 Q 180 215, 340 180 T 490 140"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="3.5"
              strokeDasharray="8 4"
            />
            {/* Tectonic Uplift Arrows */}
            <path d="M 180 215 L 180 185 M 175 192 L 180 185 L 185 192" stroke="#fbbf24" strokeWidth="2.5" />
            <text x="195" y="195" fill="#fbbf24" fontSize="10" fontFamily="monospace" fontWeight="bold">
              2-6M SURFACE UPLIFT (1819)
            </text>

            {/* Subsidence Lake Sindri Basin */}
            <path d="M 170 240 L 170 265 M 165 258 L 170 265 L 175 258" stroke="#38bdf8" strokeWidth="2.5" />
            <text x="90" y="280" fill="#38bdf8" fontSize="10" fontFamily="monospace">
              SUBSIDENCE (SINDRI BASIN)
            </text>
          </svg>

          {/* Calibrated HUD Reticle Overlay */}
          <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-rose-500/40 text-[10px] font-mono text-rose-300">
                <span className="font-bold">1819 ALLAH BUND FAULT</span> &bull; 50-90 KM SCARP
              </div>
              <div className="px-2.5 py-1 rounded bg-black/80 border border-white/20 text-[9px] font-mono text-white/70">
                REPEAT PASS: {passOffsetDays} DAYS
              </div>
            </div>

            {/* Bottom telemetry readout */}
            <div className="flex justify-between items-center text-[10px] font-mono text-white/80 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20">
              <span>LAT: 24°18'N &bull; LON: 69°52'E</span>
              <span className="text-rose-400 font-bold">&lt; 0.4 MM / YR ACTIVE STRAIN</span>
            </div>
          </div>
        </div>

        {/* INTERFEROGRAM DISPLAY TOGGLE & 12-DAY TIMELINE */}
        <div className="p-4 rounded-xl bg-[#070e1c] border border-rose-500/30 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-rose-300 uppercase flex items-center gap-2">
              <Sliders className="w-4 h-4 text-rose-400" />
              <span>INSAR REPEAT-PASS OBSERVATION MODE:</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setViewMode('sar')}
              className={`py-2 px-3 rounded-lg text-xs font-mono font-bold uppercase transition-all border ${viewMode === 'sar'
                ? 'bg-rose-500/30 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/5'
                }`}
            >
              CALIBRATED SAR INTENSITY
            </button>
            <button
              onClick={() => setViewMode('insar-fringes')}
              className={`py-2 px-3 rounded-lg text-xs font-mono font-bold uppercase transition-all border ${viewMode === 'insar-fringes'
                ? 'bg-rose-500/30 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/5'
                }`}
            >
              12-DAY INSAR PHASE FRINGES
            </button>
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-white/60 pt-1 border-t border-white/10">
            <span>REPEAT ORBIT: 12 DAYS EXACT REVISIT</span>
            <span className="text-rose-400 font-bold">{displacementMicrons} μm FAULT SLIP PER PASS</span>
          </div>
        </div>
      </div>

      {/* RIGHT: TECTONIC SEISMOLOGY & DISASTER RISK MITIGATION */}
      <div className="flex-1 flex flex-col justify-between gap-4">
        {/* TOP: 1819 HISTORIC EARTHQUAKE SUMMARY */}
        <div className="p-4 rounded-xl bg-[#070e1c] border border-rose-500/30 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono">
            <span className="text-rose-400 font-bold uppercase">THE 1819 RANN OF KUTCH EARTHQUAKE (MW 7.8)</span>
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px]">
              TECTONIC SCARP
            </span>
          </div>

          <p className="text-xs text-white/80 font-sans leading-relaxed text-left">
            On June 16, 1819, a massive intraplate earthquake ruptured this exact terrain, throwing up a 3-meter vertical wall across 90 kilometers named the "Allah Bund" ("Mound of God"). It completely blocked the Indus River branch, transforming fertile deltas into relict saltwater basins.
          </p>

          <div className="grid grid-cols-2 gap-3 text-left pt-2 border-t border-white/10">
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
              <div className="text-[9px] font-mono text-white/50 uppercase">FAULT LENGTH</div>
              <div className="text-base font-mono font-bold text-white">90 Kilometers</div>
              <div className="text-[8.5px] text-white/60">Continuous vertical scarp</div>
            </div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
              <div className="text-[9px] font-mono text-white/50 uppercase">VERTICAL DISPLACEMENT</div>
              <div className="text-base font-mono font-bold text-amber-300">3.0 Meters Uplift</div>
              <div className="text-[8.5px] text-white/60">Created Lake of Sindri</div>
            </div>
          </div>
        </div>

        {/* MIDDLE: HOW INSAR DETECTS SUB-MILLIMETER TECTONIC DRIFT */}
        <div className="p-4 rounded-xl bg-[#040817] border-2 border-rose-500/30 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono">
            <span className="text-white/60 uppercase">NISAR DIFFERENTIAL INTERFEROMETRY (DINSAR)</span>
            <span className="text-rose-400 font-bold">&lambda; = 24 CM</span>
          </div>

          <div className="p-3 rounded-lg bg-black/50 border border-white/10 text-left space-y-1.5">
            <div className="text-[10.5px] font-mono text-rose-300 font-bold uppercase">
              1 FRINGE CYCLE = 12 CM LINE-OF-SIGHT DISPLACEMENT
            </div>
            <p className="text-[11px] text-white/80 leading-relaxed font-sans">
              By measuring the microwave phase shift &Delta;&phi; between repeat passes 12 days apart, NISAR measures active crustal strain as tiny as 2 millimeters per year. This detects if the fault is quietly slipping or dangerously locked and building energy.
            </p>
          </div>
        </div>

        {/* BOTTOM: WHY THIS MATTERS FOR HUMAN STAKEHOLDERS */}
        <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-400/30 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-left text-xs font-sans text-white/80 leading-relaxed">
            <strong className="text-rose-300 font-mono uppercase block text-[11px] mb-0.5">
              SEISMIC EARLY WARNING & CRITICAL INFRASTRUCTURE
            </strong>
            Kutch hosts critical economic infrastructure: major seaports (Mundra and Kandla), crude oil refineries, and interstate gas pipelines.
            Continuous 12-day InSAR monitoring provides structural engineers and disaster agencies with high-precision surface crustal deformation tracking across active seismogenic zones.
          </div>
        </div>
      </div>
    </div>
  );
}

