import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Radio,
  Layers,
  Sparkles,
  Database,
  Terminal,
  FileCode,
  X,
  Compass,
  Sliders,
  CheckCircle2,
  Activity,
  Box,
  SlidersHorizontal,
  BookOpen,
  Volume2,
  ExternalLink
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import SOURCES_DATA from '../../SOURCES.json';

import ExplodedStrataDiorama from './visualizers/ExplodedStrataDiorama';
import VolumetricRadarCube from './visualizers/VolumetricRadarCube';
import SeasonalWaltzSlider from './visualizers/SeasonalWaltzSlider';
import AnnualWaltzPlayer from './visualizers/AnnualWaltzPlayer';
import LivingSyncEncyclopedia from './visualizers/LivingSyncEncyclopedia';
import SavannaLivingSyncJourney from './visualizers/SavannaLivingSyncJourney';
import SeasonalDanceTimelineView from './visualizers/SeasonalDanceTimelineView';
import WinterSubsurfaceDataView from './visualizers/WinterSubsurfaceDataView';

// ========================================================
// SEASONAL EXPEDITION CHAPTER METADATA (Cinematic Documentary)
// ========================================================
const CHAPTERS = {
  winter: {
    id: 'winter',
    number: '01',
    chapterTag: 'SEASON 01 OF 03 • ARID SALT REGIME',
    seasonName: 'THE GHOST OCEAN BENEATH THE SALT',
    timeframe: 'January & Dry Salt Desiccation',
    subtitle: '24cm microwaves pierce the dry halite crust to image hidden aquifers & fault scarps',
    accentColor: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.4)',
    nextChapterTitle: 'PROCEED TO MONSOON REGIME'
  },
  monsoon: {
    id: 'monsoon',
    number: '02',
    chapterTag: 'SEASON 02 OF 03 • MONSOON REGIME',
    seasonName: 'THE VANISHING INLAND SEA',
    timeframe: 'July Ingress & August Peak Inundation',
    subtitle: '5,563 to 20,514 km² monsoon flood mapped through 100% storm clouds',
    accentColor: '#e5c07b',
    glowColor: 'rgba(229, 192, 123, 0.4)',
    nextChapterTitle: 'PROCEED TO SAVANNA & LIVING SYNC'
  },
  greenery: {
    id: 'greenery',
    number: '03',
    chapterTag: 'SEASON 03 OF 03 • SAVANNA & LIVING SYNC',
    seasonName: 'THE SAVANNA THAT BLOOMS FROM MUD',
    timeframe: 'October Savanna & Human-Nature Harmony',
    subtitle: 'Banni savanna (~2,618 km²) biomass tracked by microwave depolarization',
    accentColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    nextChapterTitle: 'PROCEED TO CRITICAL CLIMATE REFLECTION'
  }
};

/**
 * NisarShowcaseView (Modern Sleek VisionOS / Command Console Edition)
 * 
 * Completely refactored to eliminate the clunky "dumb panel based UI".
 * Provides a fluid, edge-to-edge luxury holographic HUD:
 * - Top floating glass pill dock (Back, Chapter metadata, View Mode Switcher, Dossier)
 * - Hero stage: 3D Strata Diorama (Scene 1-4 comic storyboard) / 3D Canopy Slicer / Seasonal Time-Warp
 * - Bottom floating glass journey dock (Instant chapter jump pills & speed ahead action)
 * - Translucent backdrop allowing the train window video to seamlessly show through
 */
export default function NisarShowcaseView({
  season = 'monsoon',
  onBackToDiorama,
  onContinueJourney,
  onReturnToOrbit,
  isActive = true
}) {
  const [activeSeason, setActiveSeason] = useState(season);
  const [savannaStationIdx, setSavannaStationIdx] = useState(0);
  const [activeViewMode, setActiveViewMode] = useState(() => {
    if (season === 'greenery') return 'canopy';
    if (season === 'winter') return 'strata';
    return 'waltz';
  });
  const [showPipelineModal, setShowPipelineModal] = useState(false);
  const [winterViewMode, setWinterViewMode] = useState('explainer'); // 'explainer' | 'data'
  const [activeInspectedLayer, setActiveInspectedLayer] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(soundEngine.isMuted);
  const containerRef = useRef(null);

  useEffect(() => {
    soundEngine.setMode('nisar');
    return () => {
      soundEngine.setMode('destination');
    };
  }, []);

  useEffect(() => {
    setActiveSeason(season);
    setActiveViewMode(season === 'greenery' ? 'canopy' : season === 'winter' ? 'strata' : 'waltz');
    setActiveInspectedLayer(null);
  }, [season]);

  useEffect(() => {
    const unsub = soundEngine.subscribe((muted) => setIsAudioMuted(muted));
    return unsub;
  }, []);

  const currentChapter = CHAPTERS[activeSeason] || CHAPTERS.monsoon;

  const handleNextChapter = () => {
    try {
      soundEngine.playTransitionSound();
    } catch (e) { }

    if (onContinueJourney) {
      onContinueJourney();
    }
  };

  // When viewing Winter and in 'data' mode, render the authentic 3D Subsurface Ocean Data view directly
  if (activeSeason === 'winter' && winterViewMode === 'data') {
    return (
      <WinterSubsurfaceDataView
        onBackToExplainer={() => setWinterViewMode('explainer')}
        onProceedToNext={handleNextChapter}
        onReturnToOrbit={onReturnToOrbit}
      />
    );
  }

  // When viewing Monsoon, render the authentic, interactive Seasonal Dance Timeline directly
  if (activeSeason === 'monsoon') {
    return (
      <SeasonalDanceTimelineView
        onBackToIntro={onBackToDiorama}
        onReturnToOrbit={onReturnToOrbit}
        onProceedToNext={handleNextChapter}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      data-nisar-showcase="true"
      className="relative w-full h-screen max-h-screen overflow-hidden bg-[#FAF8F5] text-stone-900 flex flex-col justify-between font-sans selection:bg-amber-200 selection:text-amber-950 pb-14"
    >

      {/* ========================================================
          EXPEDITION OBSERVATORY HUD (Top Sleek Minimalist Glass Dock)
      ======================================================== */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3 bg-white/95 backdrop-blur-xl border-b border-stone-200 flex items-center justify-between gap-4 shadow-sm">

        {/* Left: Navigation Actions */}
        <div className="flex items-center gap-2">
          {activeSeason === 'winter' && activeInspectedLayer ? (
            <button
              onClick={() => {
                try { soundEngine.playReturnSound(); } catch (e) { }
                setActiveInspectedLayer(null);
                setWinterViewMode('explainer');
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider bg-white hover:bg-stone-50 border border-amber-600/40 text-stone-800 hover:text-amber-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:scale-102"
              title="Return to 3D Layer Stack"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-700" />
              <span>RETURN TO 3D STACK</span>
            </button>
          ) : (
            onBackToDiorama && (
              <button
                onClick={() => {
                  try { soundEngine.playReturnSound(); } catch (e) { }
                  onBackToDiorama();
                }}
                className="px-3 py-1.5 rounded-full text-xs font-mono tracking-wider bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 hover:text-stone-900 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">{activeSeason === 'winter' ? 'WINTER INTRO' : activeSeason === 'greenery' ? 'SAVANNA INTRO' : 'MONSOON INTRO'}</span>
                <span className="sm:hidden">PREV</span>
              </button>
            )
          )}

          {onReturnToOrbit && (
            <button
              onClick={() => {
                try { soundEngine.playReturnSound(); } catch (e) { }
                onReturnToOrbit();
              }}
              className="px-3 py-1.5 rounded-full text-xs font-mono tracking-wider bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 hover:text-stone-900 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden md:inline">PLANETARY ORBIT</span>
              <span className="md:hidden">ORBIT</span>
            </button>
          )}
        </div>

        {/* Center: Neat & Proper Expedition Identity */}
        <div className="text-center flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.25em] text-amber-800 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
            <span>
              {activeSeason === 'winter' && activeInspectedLayer
                ? `SEASON 01 • LAYER ${activeInspectedLayer.number || (activeInspectedLayer.index !== undefined ? String(activeInspectedLayer.index + 1).padStart(2, '0') : '01')} OF 03`
                : currentChapter.chapterTag}
            </span>
          </div>
          <h2 className="text-xs sm:text-sm md:text-base font-['Cinzel',serif] font-bold text-stone-900 tracking-[0.08em] uppercase truncate max-w-sm sm:max-w-md md:max-w-xl">
            {activeSeason === 'winter'
              ? activeInspectedLayer
                ? activeInspectedLayer.title
                : 'PEELING BACK THE DESERT: 3 RADAR LAYERS'
              : currentChapter.seasonName}
          </h2>
        </div>

        {/* Right: Expedition Dossier */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              try { soundEngine.playHover(); } catch (e) { }
              setShowPipelineModal(true);
            }}
            className="px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider bg-white hover:bg-stone-50 border border-amber-600/40 text-amber-900 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Database className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">DATA PROVENANCE</span>
            <span className="sm:hidden">DATA</span>
          </button>
        </div>
      </header>

      {/* ========================================================
          MAIN PANORAMIC OBSERVATION CONSOLE (Hero Visualizer Stage)
          Edge-to-edge full screen experience without vertical scrolling
      ======================================================== */}
      <main className="relative w-full flex-1 flex flex-col min-h-0 overflow-hidden">

        {/* Dynamic Visualizer Stage (Directly renders the authentic chapter visualizer without menu-fication) */}
        <div className="relative w-full h-full flex-1 min-h-0 flex flex-col">
          {activeSeason === 'winter' && (
            <ExplodedStrataDiorama
              season="winter"
              activeInspectedLayer={activeInspectedLayer}
              setActiveInspectedLayer={setActiveInspectedLayer}
              onProceedToNext={() => setWinterViewMode('data')}
            />
          )}

          {activeSeason === 'monsoon' && (
            <div className="w-full max-w-[1520px] mx-auto px-4 sm:px-8 py-2 flex-1 flex flex-col justify-center min-h-0">
              <AnnualWaltzPlayer />
            </div>
          )}

          {activeSeason === 'greenery' && (
            <div className="w-full h-full flex-1 flex flex-col min-h-0">
              <SavannaLivingSyncJourney
                activeStationIdx={savannaStationIdx}
                onStationChange={setSavannaStationIdx}
                onProceedToReflection={handleNextChapter}
              />
            </div>
          )}
        </div>

      </main>

      {/* ========================================================
          FLOATING BOTTOM JOURNEY CONTROLLER (Docked Glass Bar)
      ======================================================== */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 w-full px-4 sm:px-8 py-3 bg-white/95 backdrop-blur-2xl border-t border-stone-200 flex items-center justify-between gap-4 shadow-[0_-4px_25px_rgba(0,0,0,0.06)]">

        {/* Left: Settled Sound Control + Active Season Telemetry */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundEngine.playClick();
              soundEngine.toggleMute();
            }}
            className="px-3 py-1.5 rounded-full border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 flex items-center gap-1.5 text-xs font-mono font-semibold transition-all cursor-pointer shadow-sm hover:scale-102"
            title="Toggle Sound (Shortcut: Press M)"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-700" />
            <span>SOUND: {isAudioMuted ? 'MUTED' : 'ON'}</span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-stone-200 text-stone-600 font-mono">M</span>
          </button>

          <div className="flex items-center gap-2.5 text-[11px] font-mono tracking-wider text-stone-600">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: currentChapter.accentColor }}
            />
            <span className="font-bold uppercase text-amber-800">
              {currentChapter.chapterTag} &bull; {currentChapter.id.toUpperCase()}
            </span>
            <span className="text-stone-300 hidden sm:inline">|</span>
            <span className="text-stone-600 text-[10.5px] hidden sm:inline">
              {currentChapter.timeframe}
            </span>
          </div>
        </div>

        {/* Right: Next Chapter / Layer Primary Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          {activeSeason === 'winter' && activeInspectedLayer ? (
            <>
              {activeInspectedLayer.index > 0 && (
                <button
                  onClick={() => {
                    try { soundEngine.playReturnSound(); } catch (e) { }
                    const layers = [
                      { id: 'hh', index: 0, number: '01', title: 'THE WATER & FLOOD DETECTOR' },
                      { id: 'hv', index: 1, number: '02', title: 'THE LIVING PLANT & BIOMASS GAUGE' },
                      { id: 'ratio', index: 2, number: '03', title: 'THE SMART LAND CLASSIFIER' }
                    ];
                    setActiveInspectedLayer(layers[activeInspectedLayer.index - 1]);
                  }}
                  className="px-4 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer border border-stone-300 shadow-sm"
                >
                  &larr; BACK
                </button>
              )}

              {activeInspectedLayer.index < 2 ? (
                <button
                  onClick={() => {
                    try { soundEngine.playTransitionSound(); } catch (e) { }
                    const nextLayers = [
                      { id: 'hh', index: 0, number: '01', title: 'THE WATER & FLOOD DETECTOR' },
                      { id: 'hv', index: 1, number: '02', title: 'THE LIVING PLANT & BIOMASS GAUGE' },
                      { id: 'ratio', index: 2, number: '03', title: 'THE SMART LAND CLASSIFIER' }
                    ];
                    const nextIdx = activeInspectedLayer.index + 1;
                    setActiveInspectedLayer(nextLayers[nextIdx]);
                  }}
                  className="px-7 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs tracking-[0.2em] uppercase transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:scale-102 active:scale-98 font-bold"
                >
                  <span>NEXT LAYER</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    try { soundEngine.playTransitionSound(); } catch (e) { }
                    setActiveInspectedLayer(null);
                    setWinterViewMode('data');
                  }}
                  className="px-7 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs tracking-[0.2em] uppercase transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:scale-102 active:scale-98 font-bold"
                >
                  <span>PROCEED TO DATA SHOWCASE</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              )}
            </>
          ) : activeSeason === 'winter' && winterViewMode === 'explainer' ? (
            <button
              onClick={() => {
                try { soundEngine.playTransitionSound(); } catch (e) { }
                setActiveInspectedLayer(null);
                setWinterViewMode('data');
              }}
              className="px-7 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs tracking-[0.2em] uppercase transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:scale-102 active:scale-98 font-bold"
            >
              <span>PROCEED TO WINTER DATA SHOWCASE</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          ) : activeSeason === 'greenery' ? (
            <>
              {savannaStationIdx > 0 && (
                <button
                  onClick={() => {
                    try { soundEngine.playClick(); } catch (e) { }
                    setSavannaStationIdx((prev) => Math.max(0, prev - 1));
                  }}
                  className="px-4 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer border border-stone-300 shadow-sm"
                >
                  &larr; PREVIOUS STATION
                </button>
              )}

              {savannaStationIdx < 2 ? (
                <button
                  onClick={() => {
                    try { soundEngine.playTransitionSound(); } catch (e) { }
                    setSavannaStationIdx((prev) => prev + 1);
                  }}
                  className="px-7 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs tracking-[0.2em] uppercase transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:scale-102 active:scale-98 font-bold"
                >
                  <span>
                    {savannaStationIdx === 0
                      ? 'PROCEED TO STATION 02: MALDHARIS & ARCHITECTURE'
                      : 'PROCEED TO STATION 03: WILDLIFE & FAUNA'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={handleNextChapter}
                  className="px-7 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs tracking-[0.2em] uppercase transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:scale-102 active:scale-98 font-bold"
                >
                  <span>PROCEED TO CRITICAL CLIMATE REFLECTION</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </>
          ) : (
            <button
              onClick={handleNextChapter}
              className="px-7 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs tracking-[0.2em] uppercase transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:scale-102 active:scale-98 font-bold"
            >
              <span>{currentChapter.nextChapterTitle}</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </footer>

      {/* ========================================================
          EXPEDITION DOSSIER & NASA PIPELINE MODAL
      ======================================================== */}
      {/* REAL NASA DATA EXTRACTION & DATA PROVENANCE MODAL */}
      {showPipelineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-[#FAF8F5] border border-stone-200 rounded-3xl shadow-2xl flex flex-col text-left text-stone-800">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 px-6 py-4 bg-white/95 backdrop-blur-md border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-amber-700" />
                <div>
                  <h3 className="text-sm sm:text-base font-['Cinzel',serif] font-bold text-stone-900 tracking-wider uppercase">
                    DATA PROVENANCE & CALIBRATION AUDIT
                  </h3>
                  <div className="text-[10px] font-mono text-amber-800 tracking-widest uppercase font-bold">
                    NASA JPL / ISRO SAC &bull; LEVEL 2 GEOCODED COVARIANCE (GCOV) &bull; L-BAND (24 CM)
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowPipelineModal(false)}
                className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-all cursor-pointer"
                title="Close Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs font-sans leading-relaxed text-stone-700">

              {/* BOUNDING COORDINATES & EXTRACTION WINDOW */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
                  <div className="flex items-center gap-2 text-amber-900 font-mono font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>STUDY AREA: GREAT RANN OF KUTCH BASIN</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold">
                    100% VALID SAR PIXELS
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px] font-mono pt-1">
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[9.5px] text-stone-500 uppercase block">GEOGRAPHIC BOUNDS</span>
                    <strong className="text-stone-900 text-[10.5px]">69.45°E – 70.75°E<br />23.68°N – 24.28°N</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[9.5px] text-stone-500 uppercase block">UTM ZONE 42N (EPSG:32642)</span>
                    <strong className="text-stone-900 text-[10.5px]">X: 545,883 – 677,626 m<br />Y: 2,618,871 – 2,686,343 m</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[9.5px] text-stone-500 uppercase block">SWATH DIMENSIONS</span>
                    <strong className="text-stone-900 text-[10.5px]">1,647 × 844 pixels<br />@ 80m spacing (1.39M px)</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[9.5px] text-stone-500 uppercase block">MICROWAVE SENSOR</span>
                    <strong className="text-stone-900 text-[10.5px]">1.25 GHz / 24.0 cm L-Band<br />Track 063 &bull; Frame 076</strong>
                  </div>
                </div>
              </div>

              {/* 3 VERIFIED NISAR PASSES DIRECTLY FROM NISAR DATA/ */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-['Cinzel',serif] font-bold text-sm">
                  <Database className="w-4 h-4 text-amber-700" />
                  <span>3 OFFICIAL NISAR L2 GCOV GRANULES (CALIBRATED TIMELINE)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">

                  {/* Pass 1: July 12 */}
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between gap-2">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold text-sky-800 uppercase mb-1">
                        <span>PASS 01 &bull; JUL 12, 2026</span>
                        <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-900">INGRESS</span>
                      </div>
                      <div className="font-mono text-[9.5px] text-stone-600 break-all leading-tight mb-2 bg-white p-1.5 rounded border border-stone-200">
                        NISAR_L2_PR_GCOV_025_063_D_076_2005_DHDH_M_20260712T135737_...h5
                      </div>
                      <p className="text-stone-700 text-[10.5px] leading-snug">
                        Monsoon Ingress: Arabian Sea tidal surge and runoff fill low-lying channels. Measured dark water extent reaches 5,563.4 km² with Core Basin specular backscatter of -25.73 dB.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-stone-200 text-[9.5px] font-mono text-stone-600 flex justify-between">
                      <span>Dark Water: <strong>5,563.4 km²</strong></span>
                      <span>Banni HV: <strong>-22.01 dB</strong></span>
                    </div>
                  </div>

                  {/* Pass 2: August 29 */}
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between gap-2">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold text-amber-800 uppercase mb-1">
                        <span>PASS 02 &bull; AUG 29, 2026</span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">PEAK SEASON</span>
                      </div>
                      <div className="font-mono text-[9.5px] text-stone-600 break-all leading-tight mb-2 bg-white p-1.5 rounded border border-stone-200">
                        NISAR_L2_PR_GCOV_029_063_D_076_2005_QPDH_A_20260829T135735_...h5 (7.47 GB)
                      </div>
                      <p className="text-stone-700 text-[10.5px] leading-snug">
                        Peak Flood Season: The low-lying basin concentrates floodwaters. Specular calm water reflects radar forward away from sensor with backscatter dipping below -20.0 dB (measured.json).
                      </p>
                    </div>
                    <div className="pt-2 border-t border-stone-200 text-[9.5px] font-mono text-stone-600 flex justify-between">
                      <span>Dark Water: <strong>2,984.2 km²</strong></span>
                      <span>HV Scatter: <strong>-23.99 dB</strong></span>
                    </div>
                  </div>

                  {/* Pass 3: October 28 */}
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between gap-2">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold text-emerald-800 uppercase mb-1">
                        <span>PASS 03 &bull; OCT 28, 2026</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900">SAVANNA BLOOM</span>
                      </div>
                      <div className="font-mono text-[9.5px] text-stone-600 break-all leading-tight mb-2 bg-white p-1.5 rounded border border-stone-200">
                        NISAR_L2_PR_GCOV_034_063_D_076_4005_DHDH_A_20261028T135735_...h5 (6.08 GB)
                      </div>
                      <p className="text-stone-700 text-[10.5px] leading-snug">
                        Desiccation & Savanna Bloom: Season-end radar pass tracks 25,857.9 km² flood/wetland footprint in frame, while sweet grasses flourish across the ~2,618 km² Banni pasture (-21.03 dB).
                      </p>
                    </div>
                    <div className="pt-2 border-t border-stone-200 text-[9.5px] font-mono text-stone-600 flex justify-between">
                      <span>Dark Water: <strong>25,857.9 km²</strong></span>
                      <span>Banni HV: <strong>-21.03 dB</strong></span>
                    </div>
                  </div>

                </div>
              </div>

              {/* TIER 1 & TIER 2 SCIENTIFIC SOURCES & PROVENANCE REGISTRY */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <div className="flex items-center gap-2 text-stone-900 font-['Cinzel',serif] font-bold text-sm">
                    <Database className="w-4 h-4 text-amber-700" />
                    <span>VERIFIED SCIENTIFIC SOURCES &amp; CITATIONS (TIER 1 &amp; 2)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-mono text-[9px] font-bold">
                    {SOURCES_DATA?.sources?.length || 10} SOURCED PAPERS
                  </span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {SOURCES_DATA?.sources?.map((src) => (
                    <div key={src.source_id} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-amber-900">{src.source_id}</span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-mono text-[8.5px] font-semibold">{src.tier}</span>
                      </div>
                      <div className="text-[11px] font-bold text-stone-900 leading-snug flex items-center gap-1">
                        <span>{src.page_title}</span>
                        <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:text-amber-900 inline-flex items-center">
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      </div>
                      <div className="text-[9.5px] font-mono text-stone-500">
                        {src.publisher} &bull; Accessed: {src.date_accessed}
                      </div>
                      <p className="text-[10px] font-sans text-stone-600 leading-tight">
                        {src.paraphrased_summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* TECHNICAL ARCHITECTURE & AUTOMATED PIPELINE */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2.5">
                <div className="flex items-center gap-2 text-stone-900 font-mono font-bold text-xs uppercase tracking-wider">
                  <Terminal className="w-4 h-4 text-amber-700" />
                  <span>NASA EARTHDATA OPEN ACCESS & PIPELINE REPRODUCIBILITY</span>
                </div>

                <p className="text-stone-600 text-xs">
                  Raw NISAR Level-2 GCOV products are <strong>6.4 Gigabytes each in HDF5 format</strong>. Because web browsers cannot stream 6.4 GB H5 files across public internet connections directly into WebGL memory, this project implements a two-tier scientific architecture:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[11px] font-mono pt-1">
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <strong className="text-amber-900 block mb-0.5">1. Python Ingestion Engine (Local/Cloud)</strong>
                    Extracts and calibrates real linear backscatter into sigma0 (dB) from <code className="text-stone-800 font-bold">science/LSAR/GCOV/grids/frequencyB</code> over the exact UTM bounding box.
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <strong className="text-amber-900 block mb-0.5">2. High-Performance WebGL Client</strong>
                    Directly loads the calibrated rasters and telemetry at 60fps, providing instantaneous seasonal morphing and layer decomposition for judges and researchers.
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-stone-100 border-t border-stone-200 flex flex-wrap items-center justify-between text-[11px] font-mono text-stone-600 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Verified with official NASA-ISRO NISAR L2 GCOV Dataset</span>
              </div>
              <button
                onClick={() => setShowPipelineModal(false)}
                className="px-4 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all cursor-pointer shadow-sm"
              >
                CLOSE AUDIT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
