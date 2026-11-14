import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Globe,
  Radio,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  Compass,
  Eye,
  Activity,
  Heart,
  Droplets,
  Leaf,
  Users,
  Shield,
  HelpCircle,
  RotateCcw,
  Volume2
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

// ========================================================
// 1. SEASON INTRO CARDS (Documentary Title Scenes)
// ========================================================
export function IntroCard({ season, onEnterRadar, onReturnToOrbit }) {
  const INTRO_CONTENT = {
    monsoon: {
      chapterTag: 'CHAPTER 01 OF 03 • MONSOON REGIME',
      title: 'THE VANISHING INLAND SEA',
      subtitle: 'AUGUST • SEASONAL MONSOON INUNDATION • GREAT RANN OF KUTCH',
      narration:
        'Monsoon depressions and Arabian Sea tidal surges inundate thousands of square kilometers of low-lying salt flats. Above, dense storm clouds completely blind optical satellites. But from 747 km in orbit, NISAR’s 24cm microwaves pierce through cloud cover to track dynamic flood boundaries in real time.',
      radarClue:
        'PHYSICAL PRINCIPLE: Calm water acts as a mirror, deflecting radar energy away into space (specular null < -20.0 dB).',
      accentColor: '#38bdf8',
      accentBorder: 'border-cyan-400/40',
      glowShadow: 'shadow-[0_0_35px_rgba(56,189,248,0.25)]',
      bgGradient: 'from-sky-950/40 via-black/70 to-slate-950/80',
      actionLabel: 'ENTER SEASON 01 RADAR OBSERVATORY'
    },
    greenery: {
      chapterTag: 'CHAPTER 02 OF 03 • POST-MONSOON FLORA',
      title: 'THE SAVANNA THAT BLOOMS FROM MUD',
      subtitle: 'OCTOBER • ~2,618 KM² BANNI SAVANNA & GRASSLAND • GUJARAT, INDIA',
      narration:
        'In a span of just three weeks, western India’s vast Banni grassland blooms into a sea of green. For pastoral livestock and Maldhari communities, this is the season of life. Satellite radar cross-polarization tracks grass forage canopy volume across thousands of square kilometers without obstruction.',
      radarClue:
        'PHYSICAL PRINCIPLE: 24cm microwaves bounce repeatedly inside grass canopies, depolarizing horizontal pulses into cross-polarized vertical echoes (HV volume scattering).',
      accentColor: '#10b981',
      accentBorder: 'border-emerald-400/40',
      glowShadow: 'shadow-[0_0_35px_rgba(16,185,129,0.25)]',
      bgGradient: 'from-emerald-950/40 via-black/70 to-slate-950/80',
      actionLabel: 'ENTER SEASON 02 RADAR OBSERVATORY'
    },
    winter: {
      chapterTag: 'CHAPTER 03 OF 03 • ARID CRYSTALLINE CRUST',
      title: 'THE GHOST OCEAN BENEATH THE SALT',
      subtitle: 'JANUARY • ARID HALITE CRUST & SUB-SURFACE INTERFACE',
      narration:
        'Millions of travelers see only an endless, dry white mirror stretching to the horizon. But 24cm microwaves pierce through dry halite salt crust (low loss tangent tan delta < 10^-4) to detect damp subsoil interfaces, while InSAR monitors active strain along the 50–90 km 1819 Allah Bund earthquake fault scarp (2–6 m relief).',
      radarClue:
        'PHYSICAL PRINCIPLE: Pure dry halite (real permittivity eps\' ≈ 5.9–6.0) has low dielectric absorption, allowing microwaves to reach conductive subsoil moisture interfaces (sigma > 5 S/m).',
      accentColor: '#fbbf24',
      accentBorder: 'border-amber-400/40',
      glowShadow: 'shadow-[0_0_35px_rgba(251,191,36,0.25)]',
      bgGradient: 'from-amber-950/40 via-black/70 to-slate-950/80',
      actionLabel: 'ENTER SEASON 03 RADAR OBSERVATORY'
    }
  };

  const data = INTRO_CONTENT[season] || INTRO_CONTENT.monsoon;

  return (
    <div className="relative w-full max-w-4xl mx-auto p-6 sm:p-10 rounded-3xl bg-slate-950/75 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col items-center text-center select-none animate-in fade-in zoom-in-95 duration-300">

      {/* Top Eyebrow */}
      <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono font-bold tracking-[0.3em] uppercase mb-2 text-cyan-300">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span>{data.chapterTag}</span>
      </div>

      {/* Main Cinematic Title */}
      <h1 className="font-['Cinzel',serif] text-2xl sm:text-4xl md:text-5xl font-bold tracking-wider text-white uppercase leading-tight mb-2 drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
        {data.title}
      </h1>

      {/* Geographic Coordinates */}
      <div className="text-[10px] sm:text-xs font-mono tracking-widest text-white/60 uppercase mb-6 flex items-center gap-2">
        <Compass className="w-3.5 h-3.5 text-cyan-400" />
        <span>{data.subtitle}</span>
      </div>

      {/* Narration Prose */}
      <p className="max-w-2xl text-xs sm:text-sm md:text-base text-white/80 font-sans leading-relaxed mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
        {data.narration}
      </p>

      {/* Physical Clue Pill */}
      <div className="w-full max-w-xl p-3 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md text-[11px] sm:text-xs font-mono text-cyan-200/90 leading-relaxed mb-8 flex items-start gap-2.5 text-left">
        <Sparkles className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
        <span>{data.radarClue}</span>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <button
          onClick={() => {
            try { soundEngine.playTransitionSound(); } catch (e) { }
            onEnterRadar();
          }}
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs sm:text-sm tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(56,189,248,0.5)] group hover:scale-102 active:scale-98"
        >
          <span>{data.actionLabel}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        {onReturnToOrbit && (
          <button
            onClick={() => {
              try { soundEngine.playReturnSound(); } catch (e) { }
              onReturnToOrbit();
            }}
            className="w-full sm:w-auto px-5 py-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/15 text-white/70 hover:text-white font-mono text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>RETURN TO ORBIT</span>
          </button>
        )}
      </div>

    </div>
  );
}

// ========================================================
// 2. TRANSITION BRIDGES (Connecting Seasons)
// ========================================================
export function BridgeCard({ bridgeId, onProceed }) {
  const BRIDGES = {
    'monsoon-to-greenery': {
      eyebrow: 'TRANSITION BRIDGE 01 -> 02',
      title: 'THE WATERS RECEDE, THE ROOTS AWAKEN',
      subtitle: 'SEPTEMBER – OCTOBER • SUBSOIL HYDRAULIC RECHARGE',
      narrative:
        'Under the autumn heat, the seasonal flood begins to evaporate. But the water has not truly vanished: moisture has soaked into the alluvial silt, re-charging the root zone. Dormant grass seeds buried for months now sense the moisture and prepare to germinate.',
      radarBridge:
        'RADAR TRANSFORMATION: What happens when bare mud transforms into dense grass stalks? Microwave physics completely inverts from specular reflection to volume depolarization.',
      btnLabel: 'CONTINUE TO SEASON 02: THE SAVANNA BLOOM',
      accentColor: '#10b981'
    },
    'greenery-to-winter': {
      eyebrow: 'TRANSITION BRIDGE 02 -> 03',
      title: 'THE SUN BAKES THE CRUST, CRYSTALS FORM',
      subtitle: 'NOVEMBER – DECEMBER • THE ARID CRYSTALLIZATION',
      narrative:
        'As winter arrives, rainfall ceases entirely. The desert sun bakes the saline mudflats, drawing brine upward through capillary action. Water evaporates rapidly, leaving behind blinding white geometric halite polygons. To human eyes, life appears to freeze. But underneath, a hidden ocean remains.',
      radarBridge:
        'RADAR TRANSFORMATION: Dry crystalline halite has near-zero electrical conductivity. 24cm microwaves treat dry salt like clear glass, revealing what lies beneath.',
      btnLabel: 'CONTINUE TO SEASON 03: THE WHITE DESERT',
      accentColor: '#fbbf24'
    },
    'winter-to-inferences': {
      eyebrow: 'SYNTHESIS BRIDGE',
      title: 'BEYOND RAW PIXELS: THE LIVING TRIAD',
      subtitle: 'CONNECTING RADAR SCATTERING TO ANIMALS, VEGETATION & HUMAN SURVIVAL',
      narrative:
        'Radar remote sensing is far more than satellite backscatter in decibels. It is the rhythmic heartbeat of an entire ecosystem. See how the seasonal pulse of water and salt dictates the survival of flamingos, nomadic herds, and coastal cities.',
      radarBridge:
        'INFERENCE SYNTHESIS: Exploring the triadic connections between active radar telemetry, wildlife sanctuaries, savanna flora, and human civilization.',
      btnLabel: 'OPEN LIVING INFERENCES CONSOLE',
      accentColor: '#38bdf8'
    }
  };

  const b = BRIDGES[bridgeId] || BRIDGES['monsoon-to-greenery'];

  return (
    <div className="relative w-full max-w-3xl mx-auto p-6 sm:p-10 rounded-3xl bg-slate-950/75 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col items-center text-center select-none animate-in fade-in zoom-in-95 duration-300">

      <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono font-bold tracking-[0.3em] uppercase mb-2 text-cyan-300">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span>{b.eyebrow}</span>
      </div>

      <h2 className="font-['Cinzel',serif] text-xl sm:text-3xl md:text-4xl font-bold tracking-wider text-white uppercase leading-tight mb-2">
        {b.title}
      </h2>

      <div className="text-[10px] sm:text-xs font-mono tracking-widest text-white/50 uppercase mb-5">
        {b.subtitle}
      </div>

      <p className="text-xs sm:text-sm text-white/80 font-sans leading-relaxed mb-6 max-w-xl">
        {b.narrative}
      </p>

      <div className="w-full max-w-lg p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-[10.5px] font-mono text-cyan-200/90 leading-relaxed mb-8 flex items-start gap-2 text-left">
        <Sparkles className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
        <span>{b.radarBridge}</span>
      </div>

      <button
        onClick={() => {
          try { soundEngine.playTransitionSound(); } catch (e) { }
          onProceed();
        }}
        className="px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs sm:text-sm tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(56,189,248,0.5)] group hover:scale-102 active:scale-98"
      >
        <span>{b.btnLabel}</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>

    </div>
  );
}

// ========================================================
// 3. INFERENCES: THE LIVING TRIAD (Animals, Vegetation, Humans)
// ========================================================
export function InferencesView({ onProceedToQuestion, onReturnToOrbit }) {
  const [activeTab, setActiveTab] = useState('animals');

  const INFERENCES = {
    animals: {
      id: 'animals',
      pillar: '01. ANIMALS (FAUNA)',
      title: 'THE FLAMINGO SANCTUARY & SEASONAL BRINE BARRIERS',
      subtitle: 'Khadir Bet & Greater Flamingo Breeding Grounds',
      icon: Heart,
      accentColor: '#38bdf8',
      radarEvidence: 'Specular forward reflection null (< -20.0 dB) delineates continuous shallow brine water barriers surrounding Khadir Bet.',
      finding:
        'Greater and Lesser Flamingos nest on Khadir Bet ("Flamingo City", historical benchmark of ~500,000 birds by Dr. Salim Ali in 1945) because 0.5–1.5 m seasonal brine water barriers deter jackals, feral dogs, and desert foxes from reaching vulnerable nesting mounds.',
      impact:
        'Ecologists use all-weather L-band SAR to track water barrier integrity during critical incubation weeks without disturbing nesting colonies with low-altitude aircraft.'
    },
    vegetation: {
      id: 'vegetation',
      pillar: '02. VEGETATION (FLORA)',
      title: 'THE SAVANNA HYDRAULIC PULSE',
      subtitle: 'Banni Pasture Forage Yield & Invasive Species Tracking',
      icon: Leaf,
      accentColor: '#10b981',
      radarEvidence: 'HV cross-polarization volume scattering decouples woody Prosopis canopy from native sweet grasses up to 40–60 Mg/ha biomass saturation.',
      finding:
        'Receding floodwaters charge the subsoil with moisture, creating a 120-day vegetative window across ~2,618 km² of Banni grassland. L-band radar differentiates palatable native grasses (Dichanthium, Cenchrus) from invasive Prosopis juliflora (Gando Baval) scrub, which has spread to 54% cover.',
      impact:
        'The Gujarat Forest Department targets mechanical clearing of invasive Prosopis scrub along natural drainage corridors to restore native grassland carrying capacity.'
    },
    humans: {
      id: 'humans',
      pillar: '03. HUMANS (CIVILIZATION)',
      title: 'PASTORAL HERDS, BRINE HARVESTERS & FAULT SAFETY',
      subtitle: 'Maldhari Buffalo Herds, Agariya Salt Pans & Allah Bund Fault Scarp',
      icon: Users,
      accentColor: '#fbbf24',
      radarEvidence: 'Low-loss halite transmission maps shallow subsoil moisture contrasts; InSAR monitors surface deformation along the 50–90 km fault scarp.',
      finding:
        'Three human communities depend directly on this radar insight:\n• Maldhari pastoralists rely on biomass forecasts to protect 50,000+ livestock across Banni commons.\n• Traditional Agariya families identify shallow conductive brine interfaces without blind exploratory trenching.\n• Civil engineers monitor tectonic strain across the 50–90 km 1819 Allah Bund fault scarp (Mw 7.7–8.2) to safeguard regional infrastructure.',
      impact:
        'Transforms raw spaceborne microwave physics into real-world economic survival, food security, and seismic disaster mitigation.'
    }
  };

  const cur = INFERENCES[activeTab];

  return (
    <div className="relative w-full max-w-5xl mx-auto p-6 sm:p-10 rounded-3xl bg-slate-950/75 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col justify-between select-none animate-in fade-in zoom-in-95 duration-300 text-left">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-amber-300 uppercase mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>SYNTHESIS &bull; THE LIVING TRIAD</span>
          </div>
          <h2 className="font-['Cinzel',serif] text-xl sm:text-3xl font-light tracking-wider text-[#faf7f2] uppercase">
            CONNECTING RADAR TO LIFE
          </h2>
        </div>

        {/* 3 Pillar Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-stone-900/60 border border-stone-700/50 backdrop-blur-xl">
          {Object.values(INFERENCES).map((item) => {
            const isSel = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  try { soundEngine.playHover(); } catch (e) { }
                  setActiveTab(item.id);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${isSel
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'text-stone-400 hover:text-stone-200'
                  }`}
              >
                <span>{item?.pillar?.split(' ')[1] || item?.pillar}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="py-6 flex flex-col gap-5">
        <div>
          <div className="text-[10.5px] font-mono text-amber-300/90 uppercase tracking-wider font-bold mb-1">
            {cur.subtitle}
          </div>
          <h3 className="font-['Cinzel',serif] text-xl sm:text-2xl font-normal text-[#faf7f2] uppercase">
            {cur.title}
          </h3>
        </div>

        {/* Radar Telemetry Evidence Box */}
        <div className="p-3.5 rounded-2xl bg-stone-900/40 border border-stone-800/80 flex items-start gap-2.5 text-xs font-mono text-stone-300">
          <Activity className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
          <span><strong className="text-amber-200">RADAR EVIDENCE:</strong> {cur.radarEvidence}</span>
        </div>

        {/* In-depth Narrative */}
        <div className="text-xs sm:text-sm text-stone-300/90 font-sans leading-relaxed whitespace-pre-line">
          {cur.finding}
        </div>

        {/* Societal & Ecological Takeaway */}
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-400/30 text-xs text-emerald-200 font-sans flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-mono text-[10.5px] uppercase tracking-wider block text-emerald-300 mb-0.5">
              REAL-WORLD HUMAN & ECOLOGICAL IMPACT
            </strong>
            <span>{cur.impact}</span>
          </div>
        </div>
      </div>

      {/* Footer Navigation Action */}
      <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-[10px] font-mono text-stone-400">
          STEP 12 OF 14 &bull; INFERENCES SYNTHESIS COMPLETE
        </div>

        <button
          onClick={() => {
            try { soundEngine.playTransitionSound(); } catch (e) { }
            onProceedToQuestion();
          }}
          className="w-full sm:w-auto px-8 py-3 rounded-full bg-stone-950/85 hover:bg-stone-900 border border-amber-300/40 hover:border-amber-300 text-stone-200 hover:text-amber-100 font-mono text-xs tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer backdrop-blur-md flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(212,175,55,0.18)] hover:scale-102 active:scale-98 group"
        >
          <span>PROCEED TO FINAL REFLECTION</span>
          <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
}

// ========================================================
// 4. FINAL ENDING QUESTION (Reflective Climax)
// ========================================================
export function FinalQuestionView({ onProceedToOutro }) {
  const [selectedResponse, setSelectedResponse] = useState(null);

  const OPTIONS = [
    {
      id: 'ecosystems',
      title: 'PROTECT ENDANGERED ECOSYSTEMS',
      summary: 'Use cloud-piercing radar to map wetland loss, flamingo breeding moats, and invasive scrub across vulnerable global biomes.'
    },
    {
      id: 'agriculture',
      title: 'CLIMATE-RESILIENT FORAGE & WATER',
      summary: 'Deliver weekly biomass and subsoil moisture maps to rural pastoralists, ensuring drought resilience for 50,000+ livestock.'
    },
    {
      id: 'infrastructure',
      title: 'EARLY SEISMIC HAZARD WARNING',
      summary: 'Monitor millimeter-scale crust deformation along active blind thrust faults to safeguard pipelines, railway bridges, and human lives.'
    }
  ];

  return (
    <div className="relative w-full max-w-4xl mx-auto p-6 sm:p-10 rounded-3xl bg-slate-950/75 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col items-center text-center select-none animate-in fade-in zoom-in-95 duration-300">

      <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono font-bold tracking-[0.3em] uppercase mb-2 text-amber-300">
        <HelpCircle className="w-4 h-4 text-amber-400" />
        <span>THE DANCE OF EARTH &bull; A FINAL QUESTION</span>
      </div>

      <h1 className="font-['Cinzel',serif] text-2xl sm:text-4xl md:text-5xl font-light tracking-wider text-[#faf7f2] uppercase leading-tight mb-3 drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
        WHAT WILL YOU DO WITH THE POWER TO SEE?
      </h1>

      <p className="max-w-2xl text-xs sm:text-sm text-stone-300 font-sans leading-relaxed mb-6 font-light">
        For millennia, the Great Rann of Kutch has danced to these seasonal rhythms—flood, bloom, and salt. But as global climate extremes intensify and groundwater tables shift, the rhythm is changing. With NASA-ISRO NISAR in orbit, humanity no longer watches in blindness.
      </p>

      {/* 3 Interactive Choice Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full mb-8 text-left">
        {OPTIONS.map((opt) => {
          const isSelected = selectedResponse === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => {
                try { soundEngine.playHover(); } catch (e) { }
                setSelectedResponse(opt.id);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${isSelected
                ? 'bg-stone-900 border-amber-400/80 shadow-[0_0_20px_rgba(212,175,55,0.2)] scale-[1.02]'
                : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20'
                }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                    PRIORITY
                  </span>
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-amber-400 bg-amber-400' : 'border-white/30'}`}>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-stone-950" />}
                  </span>
                </div>
                <h4 className="font-['Cinzel',serif] text-sm font-bold text-white uppercase mb-1.5">
                  {opt.title}
                </h4>
                <p className="text-[11px] text-stone-300 font-sans leading-relaxed">
                  {opt.summary}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => {
          try { soundEngine.playTransitionSound(); } catch (e) { }
          onProceedToOutro();
        }}
        className="px-8 py-3.5 rounded-full bg-stone-950/85 hover:bg-stone-900 border border-amber-300/40 hover:border-amber-300 text-stone-200 hover:text-amber-100 font-mono text-xs tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer backdrop-blur-md flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(212,175,55,0.18)] hover:scale-102 active:scale-98 group"
      >
        <span>ARRIVE AT TERMINAL STATION & PLAY OUTRO MUSIC</span>
        <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
      </button>

    </div>
  );
}

// ========================================================
// 5. OUTRO STATION & REGIONAL FOLK MUSIC SCREEN
// Plays /vid/outro-2.mp4, then automatically /vid/credits.mp4,
// and finally returns to the Planetary Orbit view.
// 100% clean and unobstructed: zero overlapping header pills, zero timeline clutter.
// ========================================================
const OUTRO_SEQUENCE = [
  '/vid/outro-2.mp4',
  '/vid/credits.mp4'
];

export function OutroStationView({ onReturnToOrbit, onRestartJourney, onBackToPrevious }) {
  const [videoIndex, setVideoIndex] = useState(0);
  const [videoSrc, setVideoSrc] = useState(OUTRO_SEQUENCE[0]);
  const [isFading, setIsFading] = useState(false);
  const videoRef = useRef(null);
  const hasFinishedRef = useRef(false);
  const isAdvancingRef = useRef(false);

  // Sync video source whenever the playlist advances
  useEffect(() => {
    setVideoSrc(OUTRO_SEQUENCE[videoIndex] || OUTRO_SEQUENCE[0]);
  }, [videoIndex]);

  // Enforce zero extraneous audio while /vid/outro-2.mp4 is playing!
  useEffect(() => {
    soundEngine.silenceAllBackgroundMusic();
    if (videoIndex === 0) {
      soundEngine.pauseRegionalOutroMusic();
    }
  }, [videoIndex]);

  const handleFinish = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setIsFading(true);
    setTimeout(() => {
      soundEngine.silenceAllBackgroundMusic();
      soundEngine.pauseRegionalOutroMusic();
      try { soundEngine.playReturnSound(); } catch (e) { }
      onReturnToOrbit();
    }, 600);
  }, [onReturnToOrbit]);

  const transitionToCredits = useCallback(() => {
    if (isAdvancingRef.current) return;
    isAdvancingRef.current = true;
    setIsFading(true);

    setTimeout(() => {
      setVideoIndex(1);
      soundEngine.playRegionalOutroMusic(0.4);
      setTimeout(() => {
        setIsFading(false);
        isAdvancingRef.current = false;
      }, 150);
    }, 700);
  }, []);

  const advanceOrFinish = useCallback(() => {
    if (videoIndex === 0) {
      try { soundEngine.playTransitionSound(); } catch (e) { }
      transitionToCredits();
    } else {
      handleFinish();
    }
  }, [videoIndex, transitionToCredits, handleFinish]);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    if (videoIndex === 0) {
      // Fade out smoothly right before outro-1 ends
      if (v.duration && v.currentTime >= v.duration - 0.6) {
        transitionToCredits();
      }
    } else {
      // Credits video complete -> return to planetary orbit
      if (v.duration && v.currentTime >= v.duration - 0.3) {
        handleFinish();
      }
    }
  };

  const handleVideoError = () => {
    advanceOrFinish();
  };

  // Keyboard shortcut: Space, Enter, or Escape advances or returns to orbit
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
        advanceOrFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [advanceOrFinish]);

  return (
    <div
      onClick={advanceOrFinish}
      className="fixed inset-0 z-50 w-full h-full overflow-hidden bg-black select-none cursor-pointer flex flex-col justify-between"
      title={videoIndex === 0 ? "Click anywhere to advance to documentary credits" : "Click anywhere to return to planetary orbit"}
    >
      {/* Top Sleek Minimalist Editorial Navigation Bar without background or enclosing container */}
      <div className="absolute top-6 left-8 right-8 z-40 flex items-center justify-between select-none pointer-events-auto">

        {/* Left: Previous Section & Orbit return actions */}
        <div className="flex items-center gap-3">
          {onBackToPrevious && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundEngine.pauseRegionalOutroMusic();
                try { soundEngine.playReturnSound(); } catch (err) { }
                onBackToPrevious();
              }}
              className="group flex items-center gap-1.5 text-[11px] font-mono tracking-[0.25em] text-stone-300 hover:text-amber-200 transition-colors cursor-pointer uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
              title="Return to Savanna"
            >
              <span className="text-amber-300/90 group-hover:-translate-x-1 transition-transform font-bold">←</span>
              <span>PREV</span>
            </button>
          )}

          <span className="text-stone-500 font-mono text-[10px]">|</span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFinish();
            }}
            className="text-[11px] font-mono tracking-[0.25em] text-stone-400 hover:text-amber-200 transition-colors cursor-pointer uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
            title="Return to planetary orbit"
          >
            <span>ORBIT</span>
          </button>
        </div>

        {/* Center: Typographic Waypoint Storyboard with 04. OUTRO active */}
        <div className="hidden md:flex items-center gap-6 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
          <span className="text-[10px] font-mono tracking-[0.25em] text-stone-500 uppercase">01. WINTER</span>
          <span className="text-[10px] font-mono tracking-[0.25em] text-stone-500 uppercase">02. MONSOON</span>
          <span className="text-[10px] font-mono tracking-[0.25em] text-stone-500 uppercase">03. SAVANNA</span>
          <span className="relative py-1 text-[10px] font-mono tracking-[0.25em] text-amber-200 font-bold uppercase">
            <span>04. OUTRO</span>
            <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
          </span>
        </div>

        {/* Right: Expedition Branding */}
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.3em] text-stone-400 uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-pulse" />
          <span>JOURNEY TERMINUS</span>
        </div>

      </div>

      {/* Fullscreen Outro Video (Plays Part 1, fades out to black, then plays Part 2 as Credits) */}
      <video
        ref={videoRef}
        key={videoSrc}
        src={videoSrc}
        autoPlay
        playsInline
        muted={soundEngine.isMuted}
        onTimeUpdate={handleTimeUpdate}
        onEnded={advanceOrFinish}
        onError={handleVideoError}
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Cinematic Fade to Black Overlay Between Videos & at Orbit Return */}
      <div
        className={`absolute inset-0 z-40 bg-black pointer-events-none transition-opacity duration-700 ease-in-out ${isFading ? 'opacity-100' : 'opacity-0'
          }`}
      />

      {/* Credits Cinematic Documentary Overlay for Part 2 */}
      {videoIndex === 1 && (
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 sm:p-14 pointer-events-none bg-gradient-to-t from-black/90 via-black/35 to-transparent">
          <div className="max-w-3xl space-y-2 animate-in fade-in duration-1000">
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.35em] text-amber-400 uppercase font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>EXPEDITION CREDITS &bull; SAANS OBSERVATORY</span>
            </div>
            <h2 className="font-['Cinzel',serif] text-xl sm:text-3xl text-white font-light tracking-[0.12em] uppercase">
              THE LIVING HEARTBEATS OF KUTCH
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px] font-mono text-stone-300 pt-1">
              <div>
                <span className="text-amber-400/90 uppercase block text-[9px] font-bold">RADAR OBSERVATION:</span>
                NASA-ISRO NISAR L-Band (1.25 GHz &bull; 24 cm)
              </div>
              <div>
                <span className="text-amber-400/90 uppercase block text-[9px] font-bold">DATA PROVENANCE:</span>
                NASA JPL & ISRO SAC &bull; Track 063 Frame 076
              </div>
              <div>
                <span className="text-amber-400/90 uppercase block text-[9px] font-bold">ECOSYSTEM:</span>
                Great Rann of Kutch &bull; Banni Tropical Savanna
              </div>
              <div>
                <span className="text-amber-400/90 uppercase block text-[9px] font-bold">SOUNDTRACK:</span>
                Authentic Kutchi Folk &bull; Hero Musicians Live
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discreet bottom-right skip prompt */}
      <div className="absolute bottom-6 right-8 z-30 pointer-events-none opacity-40 hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-mono tracking-[0.25em] text-white/70 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          {videoIndex === 0 ? 'CLICK TO ADVANCE TO CREDITS →' : 'CLICK TO RETURN TO ORBIT →'}
        </span>
      </div>
    </div>
  );
}

