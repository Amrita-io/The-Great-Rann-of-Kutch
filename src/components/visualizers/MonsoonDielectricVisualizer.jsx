import React, { useState } from 'react';
import { Zap, Play, RotateCcw, Activity, Droplets } from 'lucide-react';

export default function MonsoonDielectricVisualizer() {
  const [activeMaterial, setActiveMaterial] = useState('water');
  const [pulseActive, setPulseActive] = useState(false);
  const [waveProgress, setWaveProgress] = useState(0);

  const materials = {
    water: {
      name: 'Saline Floodwater',
      dielectric: 78.2,
      conductivity: '4.8 S/m',
      reflectionPct: '94.2%',
      transmissionPct: '5.8%',
      dipoleResponse: 'Violent Molecular Rotation',
      color: '#38bdf8',
      desc: 'Liquid H₂O molecules are polar asymmetric dipoles. In the alternating 1.25 GHz microwave electric field, they oscillate vigorously, storing massive energy and causing intense radar reflectivity.'
    },
    'saturated-silt': {
      name: 'Saturated Marsh Silt',
      dielectric: 42.5,
      conductivity: '2.1 S/m',
      reflectionPct: '81.6%',
      transmissionPct: '18.4%',
      dipoleResponse: 'High Porewater Resonance',
      color: '#0ea5e9',
      desc: 'Porous silt saturated with saline floodwater holds high bound water fractions, producing high permittivity and moderate subsoil microwave attenuation.'
    },
    'moist-soil': {
      name: 'Moist Savanna Soil',
      dielectric: 18.5,
      conductivity: '0.4 S/m',
      reflectionPct: '53.8%',
      transmissionPct: '46.2%',
      dipoleResponse: 'Moderate Bound Water Dipoles',
      color: '#10b981',
      desc: 'Vegetated pasture soil in Banni with partial moisture saturation allows radar to penetrate 5–15 cm into the root zone.'
    },
    'dry-halite': {
      name: 'Dry Halite Salt Crust',
      dielectric: 5.9,
      conductivity: '< 0.0001 S/m',
      reflectionPct: '17.4%',
      transmissionPct: '82.6%',
      dipoleResponse: 'Ultra-Low Dielectric Loss (tan δ < 10⁻⁴)',
      color: '#fbbf24',
      desc: 'Pure crystalline halite (NaCl) has real permittivity ε′ ≈ 5.9 and ultra-low dielectric loss (tan δ < 10⁻⁴, Gorham et al., 2001). To 24cm microwaves, it allows high penetration into dry underlying sediment.'
    }
  };

  const curMat = materials[activeMaterial];

  const triggerPulse = () => {
    setPulseActive(true);
    setWaveProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      if (p > 100) {
        clearInterval(interval);
        setPulseActive(false);
      } else {
        setWaveProgress(p);
      }
    }, 40);
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6 items-stretch">
      {/* LEFT: ISOMETRIC DIELECTRIC ROADWAY (Inspired by Groww Image 3) */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[#030612] border-2 border-cyan-500/30 p-5 flex flex-col justify-between shadow-2xl">
          {/* Isometric Perspective Grid Track */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[10px] font-mono text-cyan-300">
            <span className="font-bold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>ISOMETRIC DIELECTRIC ROADWAY &bull; 1.25 GHz L-BAND PERMITTIVITY</span>
            </span>
            <span className="text-white/40">SPEED OF LIGHT: 300,000 KM/S</span>
          </div>

          {/* 4 Isometric Lanes */}
          <div className="relative w-full h-56 flex flex-col justify-around py-2">
            {Object.entries(materials).map(([key, mat], idx) => {
              const isSelected = activeMaterial === key;
              return (
                <div
                  key={key}
                  onClick={() => setActiveMaterial(key)}
                  className={`relative p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isSelected
                      ? 'bg-gradient-to-r from-sky-950/80 to-slate-900/90 border-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.3)] scale-[1.02]'
                      : 'bg-black/40 border-white/10 hover:border-white/25 opacity-70 hover:opacity-100'
                    }`}
                >
                  {/* Lane Label & Icon */}
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-bold bg-black/60 border border-white/20" style={{ color: mat.color }}>
                      0{idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold font-mono text-white flex items-center gap-2">
                        <span>{mat.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold" style={{ backgroundColor: `${mat.color}25`, color: mat.color }}>
                          &epsilon;r = {mat.dielectric}
                        </span>
                      </div>
                      <div className="text-[9.5px] font-mono text-white/50">{mat.dipoleResponse}</div>
                    </div>
                  </div>

                  {/* Reflection Percentage Bar */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-cyan-300">{mat.reflectionPct}</div>
                      <div className="text-[8.5px] font-mono text-white/40">Radar Echo</div>
                    </div>
                    <div className="w-24 h-2 bg-slate-900 rounded-full overflow-hidden border border-white/10 hidden sm:block">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: mat.reflectionPct, backgroundColor: mat.color }}
                      />
                    </div>
                  </div>

                  {/* Animated Wave traveling across this lane */}
                  {pulseActive && (
                    <div
                      className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-75 blur-sm pointer-events-none"
                      style={{ left: `${waveProgress}%` }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Trigger Microwave Pulse Button */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <span className="text-[10px] font-mono text-white/50">
              Click any lane to inspect molecular dipole reaction
            </span>
            <button
              onClick={triggerPulse}
              disabled={pulseActive}
              className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.5)]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{pulseActive ? 'EMITTING 1.25 GHz WAVE...' : 'EMIT 1.25 GHz MICROWAVE'}</span>
            </button>
          </div>
        </div>

        {/* MOLECULAR DIPOLE SIMULATOR VISUAL */}
        <div className="p-4 rounded-2xl bg-[#060b17] border border-cyan-500/20 text-left flex items-start gap-4">
          <div className="p-3 rounded-xl bg-black/60 border border-white/10 shrink-0 text-center">
            <div className="w-12 h-12 relative flex items-center justify-center">
              {/* Animated rotating dipole */}
              <div
                className={`w-10 h-10 rounded-full border-2 border-dashed border-cyan-400 flex items-center justify-center ${activeMaterial === 'water' ? 'animate-spin' : activeMaterial === 'saturated-silt' ? 'animate-[spin_3s_linear_infinite]' : ''
                  }`}
              >
                <div className="w-3 h-3 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]" />
              </div>
            </div>
            <div className="text-[8.5px] font-mono text-cyan-300 mt-1 font-bold">H₂O DIPOLE</div>
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-cyan-300 uppercase">
              {curMat.name}: {curMat.dipoleResponse}
            </div>
            <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
              {curMat.desc}
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT: SCIENTIFIC DIELECTRIC RECEIPT & ACCESSIBLE INFERENCES */}
      <div className="flex-1 flex flex-col gap-4 text-left">
        {/* BIG NUMERICAL METRICS */}
        <div className="p-5 rounded-2xl bg-[#060b17] border border-white/15 backdrop-blur-2xl shadow-xl flex flex-col gap-4">
          <div className="text-[10px] font-mono font-bold tracking-widest text-cyan-300 uppercase border-b border-white/10 pb-2">
            PHYSICAL DIELECTRIC PARAMETERS: {curMat.name}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="text-[9.5px] font-mono text-white/50 uppercase">Relative Permittivity (&epsilon;r)</div>
              <div className="text-2xl font-bold font-mono text-cyan-300 mt-0.5">{curMat.dielectric}</div>
              <div className="text-[9px] font-mono text-white/40 mt-1">Dielectric Storage Factor</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="text-[9.5px] font-mono text-white/50 uppercase">Electrical Conductivity (&sigma;)</div>
              <div className="text-2xl font-bold font-mono text-amber-300 mt-0.5">{curMat.conductivity}</div>
              <div className="text-[9px] font-mono text-white/40 mt-1">Saline Ion Mobility</div>
            </div>
          </div>

          {/* 3 CORE ACCESSIBLE EXPLANATIONS */}
          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-black/50 border border-cyan-400/20 text-xs">
              <div className="font-mono text-[10px] font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>1. WHAT THE RADAR SEES:</span>
              </div>
              <p className="text-white/80 font-sans mt-1 leading-relaxed">
                A massive 20x dielectric contrast between saturated floodwater (&epsilon;r ≈ 78.2) and dry mineral terrain (&epsilon;r ≈ 3.8). Water bodies glow in backscatter reflectivity!
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/50 border border-amber-400/20 text-xs">
              <div className="font-mono text-[10px] font-bold text-amber-300 uppercase flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>2. WHY IT HAPPENS (PHYSICAL PRINCIPLE):</span>
              </div>
              <p className="text-white/80 font-sans mt-1 leading-relaxed">
                Water molecules are natural electric dipoles. As the 1.25 GHz microwave wave oscillates, water molecules rotate frantically to realign, storing and reflecting immense electromagnetic energy.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/50 border border-emerald-400/20 text-xs">
              <div className="font-mono text-[10px] font-bold text-emerald-300 uppercase flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-emerald-400" />
                <span>3. WHAT PEOPLE CAN TAKE AWAY:</span>
              </div>
              <p className="text-white/80 font-sans mt-1 leading-relaxed">
                Hydrologists map soil water saturation across rural Kutch to guide post-monsoon sowing, while civil engineers verify ground bearing capacity for railway lines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
