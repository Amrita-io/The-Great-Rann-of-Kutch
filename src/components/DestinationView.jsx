import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowRight,
  Globe,
  Compass,
  Volume2
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import NisarShowcaseView from './NisarShowcaseView';
import SeasonalDanceTimelineView from './visualizers/SeasonalDanceTimelineView';
import MonsoonFloodDataView from './visualizers/MonsoonFloodDataView';
import CinematicVideoScene from './CinematicVideoScene';
import ClimateSyncReflectionScene from './ClimateSyncReflectionScene';
import {
  OutroStationView
} from './ExpeditionStoryFlow';

/**
 * DestinationView (Documentary Sequential Journey Conductor)
 * 
 * Flow requested by user:
 * orbit view
 *   ↓
 * train scene (/vid/train.mp4)
 *   ↓
 * winter NISAR data (Season 01: Arid Salt Crust & Subsurface Interface)
 *   ↓
 * monsoon intro vid (/vid/monsoon_ride.mp4 -> /vid/rain_loop.mp4)
 *   ↓
 * monsoon NISAR data (Season 02: The Vanishing Inland Sea & Flood Dynamics)
 *   ↓
 * vegetation intro vid (/vid/veg.mp4)
 *   ↓
 * vegetation data + picture encyclopedia (Season 03: Canopy Slicer & Banni Biosphere Sync)
 *   ↓
 * scene + text: "Is this sync between nature and biological life changing?" (ClimateSyncReflectionScene)
 *   ↓
 * end video / outro station (/vid/kutch-scroll.mp4 + Gujarati folk music)
 *   ↓
 * back to orbit view
 */
export default function DestinationView({
  destination,
  onBackToOrbit,
  onOpenItinerary,
  onOpenBooking,
  onOpenCulture
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const monsoonVideoRef = useRef(null);
  const savannaVideoRef = useRef(null);

  // Flow State Machine:
  // 'train-transit' -> 'winter-nisar' -> 'monsoon-intro' -> 'monsoon-nisar' ->
  // 'vegetation-intro' -> 'vegetation-nisar' ->
  // 'sync-reflection' -> 'outro-station'
  const [flowStep, setFlowStep] = useState('train-transit');
  const [isSlabTransitioning, setIsSlabTransitioning] = useState(false);
  const [trainTime, setTrainTime] = useState(0);

  // Transition controller with sound effect & cinematic cross-fade
  const navigateToStep = useCallback((stepId) => {
    let nextStep = stepId;
    if (stepId === 'winter-intro') nextStep = 'train-transit';

    try {
      soundEngine.playTransitionSound();
    } catch (e) { }

    setIsSlabTransitioning(true);

    setTimeout(() => {
      setFlowStep(nextStep);
      if (nextStep === 'train-transit') {
        setTrainTime(0);
      }

      // STRICT AUDIO ENFORCEMENT:
      // Pause any ongoing train transit video whenever leaving train-transit
      if (videoRef.current && nextStep !== 'train-transit') {
        videoRef.current.pause();
      }

      // Music plays ONLY on data presentation pages!
      // In any intro scene or video, silence all background music!
      // While outro-2.mp4 plays, make sure NO other audio or video plays with it until it ends!
      if (nextStep === 'outro-station') {
        soundEngine.silenceAllBackgroundMusic();
        soundEngine.pauseRegionalOutroMusic();
      } else if (
        nextStep === 'winter-nisar' ||
        nextStep === 'monsoon-data' ||
        nextStep === 'monsoon-dance' ||
        nextStep === 'vegetation-nisar'
      ) {
        soundEngine.playBreathOfTheRann(0.24);
      } else {
        // Any intro video or transition ('train-transit', 'monsoon-intro', 'vegetation-intro', 'sync-reflection')
        soundEngine.silenceAllBackgroundMusic();
        if (nextStep === 'train-transit') {
          const v = videoRef.current;
          if (v) {
            v.currentTime = 0;
            v.muted = soundEngine.isMuted;
            v.volume = 0.85;
            v.play().catch(() => { });
          }
        }
      }

      setTimeout(() => {
        setIsSlabTransitioning(false);
      }, 250);
    }, 350);
  }, []);

  // When train video ends or is skipped, advance to Winter NISAR
  const handleTrainVideoEnded = useCallback(() => {
    const v = videoRef.current;
    if (v) v.pause();
    navigateToStep('winter-nisar');
  }, [navigateToStep]);

  // Handle train video time updates
  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v || flowStep !== 'train-transit') return;
    setTrainTime(v.currentTime);
    if (v.duration && v.currentTime >= v.duration - 0.25) {
      handleTrainVideoEnded();
    }
  }, [flowStep, handleTrainVideoEnded]);

  // Keyboard shortcut to skip train scene
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
      if (flowStep === 'train-transit' && (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight')) {
        handleTrainVideoEnded();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flowStep, handleTrainVideoEnded]);

  // Video autoplay & background music initialization
  useEffect(() => {
    soundEngine.silenceAllBackgroundMusic();
    soundEngine.setMode('destination');

    const v = videoRef.current;
    if (v) {
      v.muted = soundEngine.isMuted;
      v.volume = 0.85;
      const playPromise = v.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (v) {
            v.muted = true;
            v.play().catch(() => { });
          }
        });
      }
    }

    const unsub = soundEngine.subscribe((muted) => {
      if (videoRef.current) videoRef.current.muted = muted;
    });

    return () => unsub();
  }, []);

  // Waypoints for the top typographic bar (4 Seasonal Stations)
  const WAYPOINTS = [
    { id: 'winter-intro', label: '01. WINTER' },
    { id: 'monsoon-intro', label: '02. MONSOON' },
    { id: 'vegetation-intro', label: '03. SAVANNA' },
    { id: 'outro-station', label: '04. OUTRO' }
  ];

  const getActiveWaypointId = () => {
    if (flowStep === 'train-transit' || flowStep === 'winter-nisar') return 'winter-intro';
    if (flowStep === 'monsoon-intro' || flowStep === 'monsoon-data' || flowStep === 'monsoon-dance' || flowStep === 'monsoon-nisar') return 'monsoon-intro';
    if (flowStep === 'vegetation-intro' || flowStep === 'vegetation-nisar') return 'vegetation-intro';
    if (flowStep === 'outro-station' || flowStep === 'sync-reflection') return 'outro-station';
    return 'winter-intro';
  };

  const activeWaypointId = getActiveWaypointId();

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-black text-[#faf7f2] font-sans select-none"
    >

      {/* ========================================================
          BACKGROUND: Train Video (/vid/train-ani.mp4)
      ======================================================== */}
      <video
        ref={videoRef}
        src="/vid/train-ani.mp4"
        playsInline
        muted={soundEngine.isMuted}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrainVideoEnded}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${flowStep === 'train-transit' ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
          }`}
      >
        <source src="/vid/train-ani.mp4" type="video/mp4" />
      </video>

      {/* Ambient window vignette & tint for train transit */}
      {flowStep === 'train-transit' && (
        <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-b from-black/55 via-transparent to-black/80" />
      )}

      {/* ========================================================
          SLEEK MINIMALIST EDITORIAL TOP NAVIGATION
          Header like train scene occurring on top of every section's intro:
          - Winter train transit (train-transit)
          - Monsoon intro (monsoon-intro)
          - Savanna intro (vegetation-intro)
          - Outro (outro-station)
      ======================================================== */}
      {(flowStep === 'train-transit' ||
        flowStep === 'monsoon-intro' ||
        flowStep === 'vegetation-intro') && (
          <div
            className={`fixed top-6 left-8 right-8 z-[60] flex items-center justify-between transition-opacity duration-700 select-none ${flowStep === 'train-transit' && trainTime < 1.0
              ? 'opacity-0 pointer-events-none'
              : 'opacity-100 pointer-events-auto'
              }`}
          >

            {/* Left: Previous Section & Orbit return actions */}
            <div className="pointer-events-auto flex items-center gap-3">
              <button
                onClick={() => {
                  try { soundEngine.playReturnSound(); } catch (e) { }
                  if (flowStep === 'vegetation-nisar') navigateToStep('vegetation-intro');
                  else if (flowStep === 'vegetation-intro') navigateToStep('monsoon-dance');
                  else if (flowStep === 'monsoon-dance') navigateToStep('monsoon-data');
                  else if (flowStep === 'monsoon-data') navigateToStep('monsoon-intro');
                  else if (flowStep === 'monsoon-intro') navigateToStep('winter-nisar');
                  else if (flowStep === 'winter-nisar') navigateToStep('train-transit');
                  else onBackToOrbit();
                }}
                className="group flex items-center gap-1.5 text-[11px] font-mono tracking-[0.25em] text-stone-300 hover:text-amber-200 transition-colors cursor-pointer uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
                title="Return to previous section"
              >
                <span className="text-amber-300/90 group-hover:-translate-x-1 transition-transform font-bold">←</span>
                <span>PREV</span>
              </button>

              <span className="text-stone-500 font-mono text-[10px]">|</span>

              <button
                onClick={() => {
                  soundEngine.pauseRegionalOutroMusic();
                  try { soundEngine.playReturnSound(); } catch (e) { }
                  onBackToOrbit();
                }}
                className="text-[11px] font-mono tracking-[0.25em] text-stone-400 hover:text-amber-200 transition-colors cursor-pointer uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
              >
                <span>ORBIT</span>
              </button>
            </div>

            {/* Center: Typographic Waypoint Storyboard (No pills, no heavy background) */}
            <div className="hidden md:flex items-center gap-6 pointer-events-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              {WAYPOINTS.map((wp) => {
                const active = activeWaypointId === wp.id;

                return (
                  <button
                    key={wp.id}
                    onClick={() => navigateToStep(wp.id)}
                    className={`relative py-1 text-[10px] font-mono tracking-[0.25em] transition-all cursor-pointer whitespace-nowrap uppercase ${active
                      ? 'text-amber-200 font-bold'
                      : 'text-stone-400/70 hover:text-stone-200'
                      }`}
                  >
                    <span>{wp.label}</span>
                    {active && (
                      <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right: Expedition Branding */}
            <div className="pointer-events-auto flex items-center gap-2 text-[10px] font-mono tracking-[0.3em] text-stone-400 uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-pulse" />
              <span>KUTCH EXPRESS</span>
            </div>

          </div>
        )}

      {/* ========================================================
          FLOW STEP 01: TRAIN SCENE OVERLAY (/vid/train.mp4)
          Smoothly dissolves as camera shifts into the bright window
      ======================================================== */}
      {flowStep === 'train-transit' && (
        <div
          onClick={handleTrainVideoEnded}
          className="absolute inset-0 z-20 select-none cursor-pointer"
          title="Click anywhere to skip train transit"
        >
          {/* Centered Presentation Stage: Shared dead-center coordinate space for sequential titles */}
          <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-12 pointer-events-none">

            {/* Title Block 1: DANCING WITH SARS (Cabin Intro - Original timing 0 to 2.5s, centered) */}
            <div
              className={`absolute max-w-4xl px-4 flex flex-col items-center justify-center text-center transition-all duration-1000 ${trainTime < 2.5
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
                }`}
            >
              <div className="text-[11px] font-mono tracking-[0.45em] text-amber-300/90 uppercase mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>CAR 01 &bull; OBSERVATION LOUNGE</span>
              </div>
              <h1 className="font-['Cinzel',serif] text-4xl sm:text-6xl md:text-7xl font-light tracking-[0.14em] text-[#faf7f2] uppercase mb-4 drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
                DANCING WITH SARS
              </h1>
              <div className="text-[10px] sm:text-[11px] font-mono tracking-[0.35em] text-stone-300/90 uppercase font-light drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                THE SEASONAL WALTZ OF THE GREAT RANN OF KUTCH &bull; GUJARAT, INDIA
              </div>
            </div>

            {/* Title Block 2: THE GHOST OCEAN (Season 01 Winter Intro - Smoothly dissolves in at 3.0s as Dancing with SARs finishes dissolving) */}
            <div
              className={`absolute max-w-4xl px-4 flex flex-col items-center justify-center text-center transition-all duration-1000 ${trainTime >= 3.0 && trainTime < 7.5
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
                }`}
            >
              <div className="text-[11px] font-mono tracking-[0.45em] text-amber-300/90 uppercase mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>SEASON 01 &bull; ARID SALT REGIME</span>
              </div>
              <h1 className="font-['Cinzel',serif] text-4xl sm:text-6xl md:text-7xl font-light tracking-[0.14em] text-[#faf7f2] uppercase mb-4 drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
                THE GHOST OCEAN
              </h1>
              <div className="text-[10px] sm:text-[11px] font-mono tracking-[0.35em] text-stone-300/90 uppercase font-light drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                JANUARY &bull; 24CM MICROWAVES PIERCE THE DRY CRUST &bull; GREAT RANN OF KUTCH
              </div>
            </div>

          </div>

          {/* Minimalist discreet skip prompt pinned cleanly to bottom right */}
          <div
            className={`absolute bottom-6 right-6 sm:bottom-8 sm:right-10 transition-opacity duration-700 pointer-events-none ${trainTime >= 3.5 ? 'opacity-60 hover:opacity-100' : 'opacity-0'
              }`}
          >
            <span className="text-[10px] font-mono tracking-[0.25em] text-stone-300/80 uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              CLICK ANYWHERE TO SKIP &rarr;
            </span>
          </div>
        </div>
      )}

      {/* ========================================================
          FLOW STEP 02: WINTER NISAR DATA (Season 01: Arid Salt & Subsurface Ocean)
          Enters directly from the train window view of the white salt flats
      ======================================================== */}
      {flowStep === 'winter-nisar' && (
        <div className="fixed inset-0 z-50 w-full h-full overflow-hidden bg-[#02050e]/80 backdrop-blur-2xl">
          <NisarShowcaseView
            season="winter"
            onBackToDiorama={() => navigateToStep('train-transit')}
            onContinueJourney={() => navigateToStep('monsoon-intro')}
            onReturnToOrbit={onBackToOrbit}
            isActive={true}
          />
        </div>
      )}

      {/* ========================================================
          FLOW STEP 03: MONSOON INTRO SCENE (/vid/monsoon-stat.mp4)
          Cinematic video intro just like Winter and Savanna intros.
          Typography centered behind/with the rain train scene.
          Zero buttons, zero jargon. Simple and cinematic.
      ======================================================== */}
      {flowStep === 'monsoon-intro' && (
        <div
          onClick={() => navigateToStep('monsoon-data')}
          className="fixed inset-0 z-50 w-full h-full overflow-hidden bg-black select-none cursor-pointer"
          title="Click anywhere to skip intro"
        >
          <video
            ref={monsoonVideoRef}
            src="/vid/monsoon-stat.mp4"
            autoPlay
            playsInline
            muted={soundEngine.isMuted}
            onEnded={() => navigateToStep('monsoon-data')}
            onTimeUpdate={() => {
              const v = monsoonVideoRef.current;
              if (v && v.duration && v.currentTime >= v.duration - 0.25) {
                navigateToStep('monsoon-data');
              }
            }}
            className="absolute inset-0 w-full h-full object-cover z-0"
          >
            <source src="/vid/monsoon-stat.mp4" type="video/mp4" />
            <source src="/vid/monsoon_ride.mp4" type="video/mp4" />
          </video>

          {/* Atmospheric Cinematic Depth Vignette */}
          <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-black/55 via-transparent to-black/80" />

          {/* Centered Typography Appearing Behind/Around the Train */}
          <div className="absolute inset-0 z-20 flex items-center justify-center p-6 sm:p-12 pointer-events-none">
            <div className="max-w-4xl px-4 flex flex-col items-center justify-center text-center animate-in fade-in duration-1000">
              <div className="text-[11px] font-mono tracking-[0.45em] text-sky-300/90 uppercase mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                <span>SEASON 02 &bull; MONSOON REGIME</span>
              </div>
              <h1 className="font-['Cinzel',serif] text-4xl sm:text-6xl md:text-7xl font-light tracking-[0.14em] text-[#faf7f2] uppercase mb-4 drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
                THE VANISHING INLAND SEA
              </h1>
              <div className="text-[10px] sm:text-[11px] font-mono tracking-[0.35em] text-stone-300/90 uppercase font-light drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                AUGUST &bull; SEASONAL MONSOON INUNDATION &bull; GREAT RANN OF KUTCH
              </div>
            </div>
          </div>

          {/* Minimalist discreet skip prompt pinned cleanly to bottom right */}
          <div className="absolute bottom-6 right-8 z-30 pointer-events-none opacity-60 hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-mono tracking-[0.25em] text-stone-300/80 uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              CLICK ANYWHERE TO SKIP &rarr;
            </span>
          </div>
        </div>
      )}

      {/* ========================================================
          FLOW STEP 04A: MONSOON RADAR DATA SHOWCASE (Data First)
      ======================================================== */}
      {flowStep === 'monsoon-data' && (
        <div className="fixed inset-0 z-50 w-full h-full overflow-hidden bg-[#FAF8F5]">
          <MonsoonFloodDataView
            onBackToIntro={() => navigateToStep('monsoon-intro')}
            onProceedToDance={() => navigateToStep('monsoon-dance')}
            onReturnToOrbit={onBackToOrbit}
          />
        </div>
      )}

      {/* ========================================================
          FLOW STEP 04B: THE SEASONAL DANCE OF SARS TIMELINE (Curved Arc)
      ======================================================== */}
      {(flowStep === 'monsoon-dance' || flowStep === 'monsoon-nisar') && (
        <div className="fixed inset-0 z-50 w-full h-full overflow-hidden bg-[#FAF8F5]">
          <SeasonalDanceTimelineView
            onBackToIntro={() => navigateToStep('monsoon-data')}
            onReturnToOrbit={onBackToOrbit}
            onProceedToNext={() => navigateToStep('vegetation-intro')}
          />
        </div>
      )}

      {/* ========================================================
          FLOW STEP 05: SAVANNA INTRO SCENE (/vid/Savana.mp4)
          Cinematic video intro with typography behind/with the train,
          automatically moving to vegetation data on video end.
          Zero buttons, zero jargon. Simple as the Winter intro.
      ======================================================== */}
      {flowStep === 'vegetation-intro' && (
        <div
          onClick={() => navigateToStep('vegetation-nisar')}
          className="fixed inset-0 z-50 w-full h-full overflow-hidden bg-black select-none cursor-pointer"
          title="Click anywhere to skip intro"
        >
          <video
            ref={savannaVideoRef}
            src="/vid/Savana.mp4"
            autoPlay
            playsInline
            muted={soundEngine.isMuted}
            onEnded={() => navigateToStep('vegetation-nisar')}
            onTimeUpdate={() => {
              const v = savannaVideoRef.current;
              if (v && v.duration && v.currentTime >= v.duration - 0.25) {
                navigateToStep('vegetation-nisar');
              }
            }}
            className="absolute inset-0 w-full h-full object-cover z-0"
          >
            <source src="/vid/Savana.mp4" type="video/mp4" />
          </video>

          {/* Atmospheric Cinematic Depth Vignette */}
          <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-black/50 via-transparent to-black/75" />

          {/* Centered Typography Appearing Behind/Around the Train */}
          <div className="absolute inset-0 z-20 flex items-center justify-center p-6 sm:p-12 pointer-events-none">
            <div className="max-w-4xl px-4 flex flex-col items-center justify-center text-center animate-in fade-in duration-1000">
              <div className="text-[11px] font-mono tracking-[0.45em] text-emerald-300/90 uppercase mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>SEASON 03 &bull; POST-MONSOON SAVANNA</span>
              </div>
              <h1 className="font-['Cinzel',serif] text-4xl sm:text-6xl md:text-7xl font-light tracking-[0.14em] text-[#faf7f2] uppercase mb-4 drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
                THE SAVANNA THAT BLOOMS FROM MUD
              </h1>
              <div className="text-[10px] sm:text-[11px] font-mono tracking-[0.35em] text-stone-300/90 uppercase font-light drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                OCTOBER &bull; 2,500 KM² BANNI TROPICAL SAVANNA &bull; GUJARAT, INDIA
              </div>
            </div>
          </div>

          {/* Minimalist discreet skip prompt pinned cleanly to bottom right */}
          <div className="absolute bottom-6 right-8 z-30 pointer-events-none opacity-60 hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-mono tracking-[0.25em] text-stone-300/80 uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              CLICK ANYWHERE TO SKIP &rarr;
            </span>
          </div>
        </div>
      )}

      {/* ========================================================
          FLOW STEP 06: VEGETATION DATA + LIVING ENCYCLOPEDIA (Canopy Slicer & Savanna Sync)
      ======================================================== */}
      {flowStep === 'vegetation-nisar' && (
        <div className="fixed inset-0 z-50 w-full h-full overflow-hidden bg-[#02050e]/80 backdrop-blur-2xl">
          <NisarShowcaseView
            season="greenery"
            onBackToDiorama={() => navigateToStep('vegetation-intro')}
            onContinueJourney={() => navigateToStep('outro-station')}
            onReturnToOrbit={onBackToOrbit}
            isActive={true}
          />
        </div>
      )}

      {/* ========================================================
          FLOW STEP 07: ECOLOGICAL REFLECTION SCENE
          "Is this sync between nature and biological life changing?"
      ======================================================== */}
      {flowStep === 'sync-reflection' && (
        <div className="fixed inset-0 z-50 w-full h-full overflow-y-auto overflow-x-hidden bg-[#020409]">
          <ClimateSyncReflectionScene
            onProceedToOutro={() => navigateToStep('outro-station')}
            onBackToVegetation={() => navigateToStep('vegetation-nisar')}
          />
        </div>
      )}

      {/* ========================================================
          FLOW STEP 08: END VIDEO / OUTRO & REGIONAL FOLK MUSIC
      ======================================================== */}
      {flowStep === 'outro-station' && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black">
          <OutroStationView
            onReturnToOrbit={onBackToOrbit}
            onRestartJourney={() => navigateToStep('train-transit')}
            onBackToPrevious={() => navigateToStep('vegetation-nisar')}
          />
        </div>
      )}

      {/* ========================================================
          CINEMATIC BLACK CROSS-FADE TRANSITION OVERLAY
      ======================================================== */}
      <div
        className="fixed inset-0 z-50 bg-[#02050e] pointer-events-none transition-opacity duration-300 ease-in-out"
        style={{
          opacity: isSlabTransitioning ? 1 : 0,
          visibility: isSlabTransitioning ? 'visible' : 'hidden'
        }}
      />

    </div>
  );
}
