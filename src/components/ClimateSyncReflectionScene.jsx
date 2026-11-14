import React, { useState } from 'react';
import {
  HelpCircle,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Leaf,
  Users,
  Droplets,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

/**
 * ClimateSyncReflectionScene
 * 
 * Thought-provoking philosophical & ecological reflection scene:
 * "Is this ancient sync between nature and biological life changing?"
 */
export default function ClimateSyncReflectionScene({
  onProceedToOutro,
  onBackToVegetation
}) {
  const [selectedResponse, setSelectedResponse] = useState('pastoralists');

  const REFLECTION_PILLARS = [
    {
      id: 'pastoralists',
      claimId: 'CLM_REFL_PASTORAL',
      title: 'PROTECT MALDHARI PASTORAL RESILIENCE',
      badge: 'INDIGENOUS SUSTENANCE',
      accentColor: '#f59e0b',
      icon: Users,
      urgency: 'Critical • Pastoral Commons',
      summary:
        'Provide seasonal vegetation and moisture mapping across Banni’s ~2,618 km² commons, supporting Maldhari pastoralists in managing rotational grazing and sustaining the recognized Banni Buffalo breed.'
    },
    {
      id: 'flamingos',
      claimId: 'CLM_REFL_FLAMINGO',
      title: 'SAFEGUARD FLAMINGO CITY WATER BOUNDARIES',
      badge: 'AVIAN BREEDING RESCUE',
      accentColor: '#38bdf8',
      icon: Droplets,
      urgency: 'Seasonal Wetland • Khadir Bet',
      summary:
        'Track water extent around Khadir Bet. If seasonal shallow brine evaporates prematurely before chicks fledge, wildlife wardens receive timely spatial alerts to safeguard breeding mounds against terrestrial predators.'
    },
    {
      id: 'eradication',
      claimId: 'CLM_REFL_PROSOPIS',
      title: 'RESTORE ENDEMIC GRASSLAND & CURB PROSOPIS',
      badge: 'ECOSYSTEM RESTORATION',
      accentColor: '#10b981',
      icon: Leaf,
      urgency: 'Invasive Weed (54% Cover, GUIDE)',
      summary:
        'Leverage L-band cross-polarization to distinguish dense invasive Prosopis juliflora thickets (expanded from 6% in 1997 to 54% in 2015) from native sweet grasses (Dichanthium, Cenchrus), guiding community restoration.'
    }
  ];

  return (
    <div className="relative w-full min-h-screen overflow-y-auto overflow-x-hidden flex items-center justify-center p-4 sm:p-8 select-none font-sans bg-[#020409]">

      {/* Background Atmosphere: Subtle ambient radar mesh */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-black to-[#010308] pointer-events-none" />
      <div className="absolute inset-0 z-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-4xl p-6 sm:p-10 rounded-3xl bg-stone-950/85 border border-white/15 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500 my-8">

        {/* Eyebrow Indicator */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-[10.5px] font-mono font-bold tracking-[0.3em] uppercase mb-4 text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>THE UNRAVELING WALTZ &bull; A CRITICAL REFLECTION</span>
        </div>

        {/* Primary Provocative Question */}
        <h1 className="font-['Cinzel',serif] text-2xl sm:text-4xl md:text-5xl font-normal tracking-wide text-[#faf7f2] uppercase leading-tight mb-4 drop-shadow-[0_4px_25px_rgba(0,0,0,0.95)]">
          IS THIS ANCIENT SYNC CHANGING?
        </h1>

        {/* Deep Context Narrative */}
        <p className="max-w-2xl text-xs sm:text-sm text-stone-300 font-sans leading-relaxed mb-8 font-light text-center">
          For five millennia, the Great Rann of Kutch has danced to an unbroken clockwork: <strong className="text-amber-200 font-normal">Winter salt &rarr; Monsoon flood &rarr; Sweet grass bloom &rarr; Buffalo grazing &rarr; Salt return</strong>.
          <br className="hidden sm:block" />
          <span className="mt-2 block text-stone-400">
            Today, erratic monsoon depressions, severe heatwaves, and invasive monocultures threaten to shatter this balance. When Earth’s natural rhythm fractures, biological life faces an unprecedented crossroads.
          </span>
        </p>

        {/* 3 Interactive Priority Paths */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 w-full mb-8 text-left">
          {REFLECTION_PILLARS.map((item) => {
            const isSelected = selectedResponse === item.id;
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                data-claim-id={item.claimId}
                onClick={() => {
                  try { soundEngine.playHover(); } catch (e) { }
                  setSelectedResponse(item.id);
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${isSelected
                    ? 'bg-stone-900 border-amber-400/90 shadow-[0_0_25px_rgba(245,158,11,0.25)] scale-[1.02]'
                    : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
                  }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: `${item.accentColor}15`,
                        borderColor: `${item.accentColor}40`,
                        color: item.accentColor
                      }}
                    >
                      {item.badge}
                    </span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'border-amber-400 bg-amber-400' : 'border-white/30'
                        }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-stone-950" />}
                    </span>
                  </div>

                  <h4 className="font-['Cinzel',serif] text-xs sm:text-sm font-bold text-white uppercase mb-2 group-hover:text-amber-200 transition-colors">
                    {item.title}
                  </h4>

                  <p className="text-[11px] text-stone-300 font-sans leading-relaxed font-light mb-3">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9.5px] font-mono text-stone-400">
                  <span>Urgency:</span>
                  <span className="text-amber-300/90 font-bold">{item.urgency}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {onBackToVegetation && (
            <button
              onClick={onBackToVegetation}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-stone-900/60 hover:bg-stone-800 border border-white/10 text-stone-300 hover:text-white font-mono text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              &larr; BACK TO VEGETATION
            </button>
          )}

          <button
            onClick={() => {
              try { soundEngine.playTransitionSound(); } catch (e) { }
              onProceedToOutro();
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-stone-900 hover:bg-stone-850 border border-amber-300/60 hover:border-amber-300 text-stone-100 hover:text-amber-100 font-mono text-xs tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer backdrop-blur-md flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(212,175,55,0.25)] hover:scale-102 active:scale-98 group font-bold"
          >
            <span>PROCEED TO FINAL OUTRO &amp; MUSIC</span>
            <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>

    </div>
  );
}

