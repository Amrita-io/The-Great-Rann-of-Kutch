import React, { useState } from 'react';
import { Split, Droplet, ArrowDown, Activity, Sparkles, Scale, Sliders } from 'lucide-react';

export default function WinterSaltOceanVisualizer() {
  // Slider position (0 = all optical salt crust, 100 = full radar subsurface moisture interface revealed)
  const [sliderPos, setSliderPos] = useState(50);

  // Permittivity metrics (Gorham et al. 2001; Ulaby et al.)
  const saltCrustDielectric = '5.9 - 6.0';
  const brineConductivity = '> 5 S/m';

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6 items-stretch" data-claim-id="CLM_WINTER_SALT_OCEAN_VIS">
      {/* LEFT: INTERACTIVE SPLIT SLIDER (PEEL CRUST TO REVEAL SUBSURFACE INTERFACE) */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="relative aspect-square w-full max-w-[540px] mx-auto rounded-2xl overflow-hidden bg-[#030712] border-2 border-cyan-500/30 shadow-[0_0_40px_rgba(56,189,248,0.15)] group select-none">
          {/* Base Layer: Radar Subsurface Moisture Interface (Calibrated Moisture Layer) */}
          <img
            src="/assets/layers/nisar_square_moisture.webp"
            alt="24cm Radar Subsurface Moisture Interface"
            className="w-full h-full object-cover"
          />

          {/* Top Layer: Optical White Salt Crust (Clipped by slider) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src="/assets/layers/nisar_square_radar.webp"
              alt="Optical White Salt Crust"
              className="absolute inset-0 w-full h-full object-cover max-w-none"
              style={{ width: '540px', height: '540px' }}
            />
            {/* Split edge line */}
            <div className="absolute top-0 right-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee]" />
          </div>

          {/* Floating Slider Divider Handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-cyan-400 text-cyan-300 flex items-center justify-center shadow-[0_0_20px_#22d3ee]">
              <Split className="w-5 h-5" />
            </div>
            <div className="mt-1 px-2 py-0.5 rounded bg-black/80 text-[9px] font-mono text-cyan-300 uppercase border border-cyan-400/40">
              DRAG TO PEEL
            </div>
          </div>

          {/* Calibrated HUD Reticle Overlay */}
          <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
                <span className="font-bold">OPTICAL SALT</span> vs <span className="text-emerald-300 font-bold">24cm RADAR</span>
              </div>
              <div className="px-2.5 py-1 rounded bg-black/80 border border-white/20 text-[9px] font-mono text-white/70">
                L-BAND (1.25 GHz)
              </div>
            </div>

            {/* Bottom telemetry readout */}
            <div className="flex justify-between items-center text-[10px] font-mono text-white/80 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20">
              <span>LAT: 24°06'N &bull; LON: 70°42'E</span>
              <span className="text-cyan-300 font-bold">SHALLOW BRINE INTERFACE</span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE PEEL SLIDER CONTROL */}
        <div className="p-4 rounded-xl bg-[#070e1c] border border-cyan-500/30 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>PEEL OPTICAL SALT CRUST &rarr; REVEAL RADAR MOISTURE:</span>
            </span>
            <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs border border-cyan-400/30">
              {sliderPos}% REVEALED
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(parseInt(e.target.value, 10))}
            className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-white/50">
            <span>0% (Blinding White Salt Crust)</span>
            <span className="text-cyan-300 font-bold">50% (Split View)</span>
            <span className="text-emerald-300">100% (Subsurface Moisture Interface)</span>
          </div>
        </div>
      </div>

      {/* RIGHT: STRATA ARCHITECTURE & AGARIYA SALT HARVESTERS */}
      <div className="flex-1 flex flex-col justify-between gap-4">
        {/* TOP: 3-LEVEL ARCHITECTURAL CUTAWAY */}
        <div className="p-4 rounded-xl bg-[#070e1c] border border-cyan-500/30 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono">
            <span className="text-cyan-400 font-bold uppercase flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>SUBSURFACE DIELECTRIC PROFILE</span>
            </span>
            <span className="text-white/60">1.25 GHz L-BAND (NISAR)</span>
          </div>

          {/* Level 1: White Salt Crust */}
          <div className="p-3 rounded-lg bg-white/5 border border-white/20 text-left space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-white uppercase">
                1. DRY HALITE SALT CRUST
              </span>
              <span className="text-[10px] font-mono text-amber-300 font-bold">
                Real Permittivity &epsilon;&prime; &asymp; {saltCrustDielectric} &bull; tan &delta; &lt; 10⁻⁴
              </span>
            </div>
            <p className="text-[11px] text-white/70 font-sans leading-relaxed">
              Pure crystalline halite has low dielectric loss (Gorham et al., 2001). To 24cm microwaves, it is relatively transparent, allowing penetration into the subsoil.
            </p>
          </div>

          {/* Level 2: Subsurface Silt Matrix */}
          <div className="p-3 rounded-lg bg-black/40 border border-white/10 text-left space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-white uppercase">
                2. SUBSURFACE POROUS SILT
              </span>
              <span className="text-[10px] font-mono text-cyan-300 font-bold">
                GRADUAL ATTENUATION
              </span>
            </div>
            <p className="text-[11px] text-white/70 font-sans leading-relaxed">
              Microwaves propagate through dry porous sediment with minimal absorption until encountering conductive moisture boundaries.
            </p>
          </div>

          {/* Level 3: Shallow Brine Interface */}
          <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-400 text-left space-y-1 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase">
                3. SHALLOW CONDUCTIVE BRINE INTERFACE
              </span>
              <span className="text-[10px] font-mono text-emerald-300 font-bold">
                Conductivity &sigma; {brineConductivity} &bull; Skin Depth &lt; 1 cm
              </span>
            </div>
            <p className="text-[11px] text-white/80 font-sans leading-relaxed">
              Hyper-saline moisture creates an abrupt conductive boundary. Microwaves reflect off this moisture discontinuity, mapping the subsoil hydrologic interface from orbit.
            </p>
          </div>
        </div>

        {/* MIDDLE: QUANTITATIVE TELEMETRY RECEIPT */}
        <div className="p-4 rounded-xl bg-[#040817] border-2 border-cyan-500/30 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono">
            <span className="text-white/60 uppercase">CALIBRATED RADAR MEASUREMENTS</span>
            <span className="text-cyan-400 font-bold">TRACK 063 &bull; FRAME 076</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-2.5 rounded-lg bg-black/50 border border-white/10">
              <div className="text-[9px] font-mono text-white/50 uppercase">DIELECTRIC BOUNDARY</div>
              <div className="text-lg font-mono font-bold text-cyan-300">Skin Depth Model</div>
              <div className="text-[8.5px] text-white/60">Conductivity contrast</div>
            </div>

            <div className="p-2.5 rounded-lg bg-black/50 border border-white/10">
              <div className="text-[9px] font-mono text-white/50 uppercase">BRINE CONDUCTIVITY</div>
              <div className="text-lg font-mono font-bold text-emerald-300">&sigma; &gt; 5 S/m</div>
              <div className="text-[8.5px] text-white/60">Super-saturated NaCl brine</div>
            </div>

            <div className="p-2.5 rounded-lg bg-black/50 border border-white/10">
              <div className="text-[9px] font-mono text-white/50 uppercase">HH BACKSCATTER</div>
              <div className="text-lg font-mono font-bold text-white">-14.0 to -24.8 dB</div>
              <div className="text-[8.5px] text-white/60">Rough halite to specular null</div>
            </div>

            <div className="p-2.5 rounded-lg bg-black/50 border border-white/10">
              <div className="text-[9px] font-mono text-white/50 uppercase">HV CROSS-POL ECHO</div>
              <div className="text-lg font-mono font-bold text-white">&lt; -21.0 dB</div>
              <div className="text-[8.5px] text-white/60">Near radar noise floor</div>
            </div>
          </div>
        </div>

        {/* BOTTOM: WHY THIS MATTERS FOR AGARIYA HARVESTERS */}
        <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-400/30 flex items-start gap-3">
          <Scale className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-left text-xs font-sans text-white/80 leading-relaxed">
            <strong className="text-cyan-300 font-mono uppercase block text-[11px] mb-0.5">
              ECOLOGICAL CONTEXT FOR AGARIYA SALT HARVESTERS
            </strong>
            Traditional Agariya pastoralists and salt workers pump subsoil brine into shallow pans to produce solar salt.
            NISAR L-band SAR maps surface roughness, soil salinity, and moisture interfaces across the 140 km swath without cloud obstruction.
          </div>
        </div>
      </div>
    </div>
  );
}

