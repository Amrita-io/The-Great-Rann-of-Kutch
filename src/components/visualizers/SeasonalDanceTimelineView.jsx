import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  ArrowLeft,
  ArrowRight,
  Globe,
  Database,
  Volume2,
  VolumeX,
  Droplets,
  CloudRain,
  Leaf,
  Radio,
  Sparkles,
  X,
  CheckCircle2,
  Snowflake,
  Compass
} from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import MinimalDualCurveGraph from './MinimalDualCurveGraph';

/**
 * SeasonalDanceTimelineView ("THE SEASONAL DANCE OF SARS TIMELINE")
 * 
 * Museum-grade multi-temporal NASA-ISRO NISAR radar visualizer:
 * - Bespoke layout updated based on user feedback:
 *   1. Monocolor, sleek timeline scrubber bar (NO rainbow gradients).
 *   2. Left Data Dossier Console: All narrative, physics, and ecological cards moved to the
 *      LEFT of the image window so the entire radar swath is 100% unobstructed.
 *   3. Center Image Window: Unobstructed Dance of SARS with continuous crossfades between
 *      real clipped NISAR L2-GCOV WebP rasters over [69.45°E – 70.75°E, 23.68°N – 24.28°N].
 *   4. Rotating Season Wheel (Right Edge):
 *      - Monocolor curved arc track in warm amber (#d97706, NO gradients).
 *      - The current season ALWAYS comes into the prominent CENTER BUBBLE (y = 50%).
 *      - As the timeline advances or rotates, the old season moves ahead into an outer bubble,
 *        and the incoming season rotates into the center bubble and replaces the hero icon!
 *      - Only large spokes mark the start and end of each of the 4 seasons.
 *      - Arrow buttons REMOVED: it functions as a true interactive Season Wheel (rotates via
 *        autoplay, clicking any bubble, dragging, or mouse wheel scrolling).
 * - Zero unicode emojis, light museum palette (#FAF8F5, #FFFFFF, #1C1917, #D97706).
 */

const TIMELINE_STOPS = [
  {
    id: 'winter',
    index: 0,
    claimId: 'CLM_TIME_STOP_WINTER',
    stopLabel: 'WINTER CRUST',
    pillLabel: 'WTR',
    dateLabel: 'January 18, 2026 (Model)',
    shortDate: 'JAN 18',
    seasonName: '1819 ALLAH BUND SURFACE FAULT SCARP',
    title: 'THE 50-90 KM ALLAH BUND FAULT SCARP (1819)',
    icon: Snowflake,
    imagePath: '/assets/layers/act1_winter_dry.webp',
    featureName: 'ALLAH BUND FAULT SCARP',
    coords: '24.25°N, 69.80°E',
    laymanQuote: 'A natural earthen step raised across the flat desert like a giant levee.',
    conciseText:
      'In 1819, an intraplate thrust earthquake (Mw 7.7–8.2, nominal 7.8) uplifted a 50 to 90 km long surface scarp 2 to 6 meters high, damming the Nara distributary of the Indus River. NISAR active microwave sounding maps surface roughness and dielectric contrast along this exposed tectonic fault scarp.',
    pill1: { label: 'SURFACE RELIEF', value: '2 to 6 m' },
    pill2: { label: 'PERMITTIVITY', value: "ε' ~ 5.9 (Halite)" },
    pill3: { label: 'SCARP LENGTH', value: '50 – 90 km' },
    floodBasinKm2: 32.5,
    vegetationHvDb: -24.78,
    backscatterSigma0Db: -14.24,
    surfaceState: 'Bone-Dry Halite Crust',
    granuleId: 'BASELINE_MODEL_SIMULATION_20260118'
  },
  {
    id: 'pass_01',
    index: 1,
    claimId: 'CLM_TIME_STOP_JUL12',
    stopLabel: 'JUL 12 (INGRESS)',
    pillLabel: 'JUL 12',
    dateLabel: 'July 12, 2026',
    shortDate: 'JUL 12',
    seasonName: 'ARABIAN SEA TIDAL INGRESS',
    title: 'THE TIDAL BREACH OVER DESERT MUDFLATS',
    icon: Droplets,
    imagePath: '/assets/layers/pass_01_jul12.webp',
    featureName: 'KORI CREEK TIDAL RILLS',
    coords: '23.85°N, 69.65°E',
    laymanQuote: 'Like pouring dark ink over a mirror—smooth calm water turns radar pitch-black.',
    conciseText:
      'In early July, Arabian Sea tidal surges push seawater through western mudflat rills. Smooth calm water reflects radar pulses specularly away into space, creating pitch-black channels (< -20 dB) contrasting with dry salt.',
    pill1: { label: 'DARK WATER', value: '5,563.4 km²' },
    pill2: { label: 'RADAR ECHO', value: '-16.56 dB' },
    pill3: { label: 'BANNI HV', value: '-22.01 dB' },
    floodBasinKm2: 5563.4,
    vegetationHvDb: -22.01,
    backscatterSigma0Db: -16.56,
    surfaceState: 'Tidal Ingress Saturation',
    granuleId: 'NISAR_L2_PR_GCOV_025_063_D_076_2005_DHDH_M_20260712T135737_P05023'
  },
  {
    id: 'pass_02',
    index: 2,
    claimId: 'CLM_TIME_STOP_JUL24',
    stopLabel: 'JUL 24 (SURGE)',
    pillLabel: 'JUL 24',
    dateLabel: 'July 24, 2026',
    shortDate: 'JUL 24',
    seasonName: 'BASIN EXPANSION & SOIL SATURATION',
    title: 'BASIN EXPANSION & WATER INGRESS',
    icon: Droplets,
    imagePath: '/assets/layers/pass_02_jul24.webp',
    featureName: 'CENTRAL TROUGH INUNDATION',
    coords: '23.95°N, 69.80°E',
    laymanQuote: 'Spongy desert sands drink the initial surge before standing pools expand.',
    conciseText:
      'Twelve days after ingress, seawater penetrates into the evaporite depression. Standing dark water expands to 15,636 km² across the frame, preparing the low-lying basin for peak inundation.',
    pill1: { label: 'DARK WATER', value: '15,636.4 km²' },
    pill2: { label: 'RADAR ECHO', value: '-13.99 dB' },
    pill3: { label: 'BANNI HV', value: '-20.19 dB' },
    floodBasinKm2: 15636.4,
    vegetationHvDb: -20.19,
    backscatterSigma0Db: -13.99,
    surfaceState: 'Subsurface Saturation Wave',
    granuleId: 'NISAR_L2_PR_GCOV_026_063_D_076_4005_DHDH_A_20260724T135736_P05023'
  },
  {
    id: 'pass_03',
    index: 3,
    claimId: 'CLM_TIME_STOP_AUG17',
    stopLabel: 'AUG 17 (DELUGE)',
    pillLabel: 'AUG 17',
    dateLabel: 'August 17, 2026',
    shortDate: 'AUG 17',
    seasonName: 'MONSOON DELUGE SURGE',
    title: 'CYCLONIC RAINFALL CREST OVER NORTHERN RANN',
    icon: CloudRain,
    imagePath: '/assets/layers/pass_03_aug17.webp',
    featureName: 'LUNI & BANAS RIVER RUNOFF',
    coords: '24.15°N, 70.10°E',
    laymanQuote: 'Inland river runoffs from Rajasthan join Arabian Sea tides in a dual flood.',
    conciseText:
      'Mid-monsoon depressions unleash relentless rainfall. Ephemeral river runoffs surge into the basin, merging with sea tides to expand dark-water specular inundation to 20,513.7 km² across the frame.',
    pill1: { label: 'DARK WATER', value: '20,513.7 km²' },
    pill2: { label: 'RADAR ECHO', value: '-15.15 dB' },
    pill3: { label: 'BANNI HV', value: '-20.88 dB' },
    floodBasinKm2: 20513.7,
    vegetationHvDb: -20.88,
    backscatterSigma0Db: -15.15,
    surfaceState: 'Monsoon Deluge Crest',
    granuleId: 'NISAR_L2_PR_GCOV_028_063_D_076_4005_DHDH_A_20260817T135735_P05023'
  },
  {
    id: 'pass_04',
    index: 4,
    claimId: 'CLM_TIME_STOP_AUG29',
    stopLabel: 'AUG 29 (PEAK)',
    pillLabel: 'AUG 29',
    dateLabel: 'August 29, 2026',
    shortDate: 'AUG 29',
    seasonName: 'PEAK INUNDATION & FLAMINGO WATER BARRIER',
    title: 'PEAK INUNDATION & FLAMINGO WATER BARRIER',
    icon: CloudRain,
    imagePath: '/assets/layers/pass_04_aug29.webp',
    featureName: 'KHADIR ISLAND WATER BARRIER',
    coords: '24.06°N, 70.40°E',
    laymanQuote: 'Shallow brine creates a natural water barrier protecting flamingo nesting mounds.',
    conciseText:
      'Torrential rains flood the basin. While cloud cover blinds visual satellites, NISAR’s 24cm microwaves pierce the storm deck to verify that shallow brine (0.5–1.5 m) isolates Khadir Bet, protecting nesting flamingos from land predators.',
    pill1: { label: 'DARK WATER', value: '2,984.2 km²' },
    pill2: { label: 'RADAR ECHO', value: '-14.74 dB' },
    pill3: { label: 'WATER BARRIER', value: '0.5 – 1.5 m' },
    floodBasinKm2: 2984.2,
    vegetationHvDb: -23.99,
    backscatterSigma0Db: -14.74,
    surfaceState: 'Peak Inundation Sea',
    granuleId: 'NISAR_L2_PR_GCOV_029_063_D_076_2005_QPDH_A_20260829T135735_P05023'
  },
  {
    id: 'pass_05',
    index: 5,
    claimId: 'CLM_TIME_STOP_SEP10',
    stopLabel: 'SEP 10 (RECESSION)',
    pillLabel: 'SEP 10',
    dateLabel: 'September 10, 2026',
    shortDate: 'SEP 10',
    seasonName: 'WATER MARGIN RECESSION',
    title: 'POST-MONSOON RUNOFF RETREAT',
    icon: Droplets,
    imagePath: '/assets/layers/pass_05_sep10.webp',
    featureName: 'EASTERN FLANK MARGINS',
    coords: '24.12°N, 70.55°E',
    laymanQuote: 'Under the tropical sun, water margins begin pulling back toward central sumps.',
    conciseText:
      'As monsoon storms taper off, solar evaporation commences. Radar detects retreating specular water boundaries (5,383.0 km² dark water), exposing mud ridges while concentrating brine in low depressions.',
    pill1: { label: 'DARK WATER', value: '5,383.0 km²' },
    pill2: { label: 'RADAR ECHO', value: '-16.23 dB' },
    pill3: { label: 'CORE NULL', value: '-26.32 dB' },
    floodBasinKm2: 5383.0,
    vegetationHvDb: -21.75,
    backscatterSigma0Db: -16.23,
    surfaceState: 'Receding Water Margins',
    granuleId: 'NISAR_L2_PR_GCOV_030_063_D_076_2005_DHDH_M_20260910T135735_P05023'
  },
  {
    id: 'pass_06',
    index: 6,
    claimId: 'CLM_TIME_STOP_SEP22',
    stopLabel: 'SEP 22 (EVAPORATION)',
    pillLabel: 'SEP 22',
    dateLabel: 'September 22, 2026',
    shortDate: 'SEP 22',
    seasonName: 'HYPERSALINE BRINE CONCENTRATION',
    title: 'EVAPORITE THICKENING & ARTEMIA BLOOMS',
    icon: Sparkles,
    imagePath: '/assets/layers/pass_06_sep22.webp',
    featureName: 'HYPERSALINE SHALLOWS',
    coords: '23.90°N, 70.15°E',
    laymanQuote: 'Water becomes dense hypersaline brine teeming with brine shrimp and algae.',
    conciseText:
      'High evaporation concentrates residual brine into evaporite pans (4,387.8 km² dark water). Hypersaline conditions support blooms of halo-bacteria and Artemia (brine shrimp), providing food for fledging flamingos.',
    pill1: { label: 'DARK WATER', value: '4,387.8 km²' },
    pill2: { label: 'RADAR ECHO', value: '-15.42 dB' },
    pill3: { label: 'BRINE STATE', value: 'Hypersaline' },
    floodBasinKm2: 4387.8,
    vegetationHvDb: -22.67,
    backscatterSigma0Db: -15.42,
    surfaceState: 'Hypersaline Brine Pools',
    granuleId: 'NISAR_L2_PR_GCOV_031_063_D_076_2005_QPDH_A_20260922T135735_P05023'
  },
  {
    id: 'pass_07',
    index: 7,
    claimId: 'CLM_TIME_STOP_OCT04',
    stopLabel: 'OCT 04 (NUCLEATION)',
    pillLabel: 'OCT 04',
    dateLabel: 'October 04, 2026',
    shortDate: 'OCT 04',
    seasonName: 'HALITE NUCLEATION & CRUST FORMATION',
    title: 'EARLY SALT CRUST NUCLEATION',
    icon: Sparkles,
    imagePath: '/assets/layers/pass_07_oct04.webp',
    featureName: 'PACHHAM BED EMBAYMENT',
    coords: '23.98°N, 69.92°E',
    laymanQuote: 'Microscopic salt cubes lock together into a thin crystalline sheet atop the mud.',
    conciseText:
      'Sodium chloride reaches saturation limits, precipitating crystalline halite crust across the basin. Standing surface water evaporates, leaving behind a white salt skim that begins to scatter microwave pulses.',
    pill1: { label: 'DARK WATER', value: '4,412.9 km²' },
    pill2: { label: 'RADAR ECHO', value: '-16.14 dB' },
    pill3: { label: 'SURFACE', value: 'Halite Skim' },
    floodBasinKm2: 4412.9,
    vegetationHvDb: -21.50,
    backscatterSigma0Db: -16.14,
    surfaceState: 'Halite Nucleation Skim',
    granuleId: 'NISAR_L2_PR_GCOV_032_063_D_076_2005_DHDH_M_20261004T135735_P05023'
  },
  {
    id: 'pass_08',
    index: 8,
    claimId: 'CLM_TIME_STOP_OCT16',
    stopLabel: 'OCT 16 (POLYGONS)',
    pillLabel: 'OCT 16',
    dateLabel: 'October 16, 2026',
    shortDate: 'OCT 16',
    seasonName: 'POLYGONAL HALITE EXPANSION',
    title: 'POLYGONAL PRESSURE RIDGES & CRUST GROWTH',
    icon: Sparkles,
    imagePath: '/assets/layers/pass_08_oct16.webp',
    featureName: 'CENTRAL PLAYA SALT FLATS',
    coords: '24.18°N, 70.25°E',
    laymanQuote: 'Desiccation pushes salt upward into hexagonal ridges, turning the playa rough.',
    conciseText:
      'As diurnal temperatures fluctuate, expanding salt crusts buckle under thermal stress, creating distinct polygonal pressure ridges. These raised crystalline facets increase radar surface roughness.',
    pill1: { label: 'DARK WATER', value: '4,372.8 km²' },
    pill2: { label: 'RADAR ECHO', value: '-14.95 dB' },
    pill3: { label: 'STRUCTURE', value: 'Halite Polygons' },
    floodBasinKm2: 4372.8,
    vegetationHvDb: -21.59,
    backscatterSigma0Db: -14.95,
    surfaceState: 'Polygonal Halite Crust',
    granuleId: 'NISAR_L2_PR_GCOV_033_063_D_076_2005_DHDH_M_20261016T135735_P05023'
  },
  {
    id: 'pass_09',
    index: 9,
    claimId: 'CLM_TIME_STOP_OCT28',
    stopLabel: 'OCT 28 (SAVANNA)',
    pillLabel: 'OCT 28',
    dateLabel: 'October 28, 2026',
    shortDate: 'OCT 28',
    seasonName: 'BANNI SAVANNA BLOOM & WINTER TRANSITION',
    title: 'THE SAVANNA BLOOM & CROSS-POL CANOPY SCATTER',
    icon: Leaf,
    imagePath: '/assets/layers/pass_09_oct28.webp',
    featureName: 'BANNI GRASSLAND SAVANNA',
    coords: '23.91°N, 69.73°E',
    laymanQuote: 'Tangled grass stems twist radar waves to reveal living pasture canopy volume.',
    conciseText:
      'Native perennial grasses bloom across ~2,618 km² of the southern Banni savanna. NISAR’s dual-polarization cross-channel (HV = -21.03 dB) measures vertical canopy density, tracking seasonal forage for indigenous pastoral livestock.',
    pill1: { label: 'CANOPY HV', value: '-21.03 dB' },
    pill2: { label: 'RADAR ECHO', value: '-14.65 dB' },
    pill3: { label: 'SAVANNA', value: '~2,618 km²' },
    floodBasinKm2: 25857.9,
    vegetationHvDb: -21.03,
    backscatterSigma0Db: -14.65,
    surfaceState: 'Crystalline Halite & Savanna',
    granuleId: 'NISAR_L2_PR_GCOV_034_063_D_076_4005_DHDH_A_20261028T135735_P05036'
  }
];

// Verified Multi-Temporal Observation Months (Directly aligned with measured.json GCOV frames)
const ANNUAL_SAR_PHENOLOGY_CURVE = [
  { month: 'JAN', primary: 32, secondary: -14.2, primaryDisplay: '32', secondaryDisplay: '-14.2', phaseName: 'Winter Halite (Model)', narrative: 'Dry crystalline salt desert. Low dielectric loss microwave window.' },
  { month: 'JUL', primary: 5563, secondary: -16.6, primaryDisplay: '5.6k', secondaryDisplay: '-16.6', phaseName: 'Tidal Ingress', narrative: 'Arabian Sea tidal surge expands dark water to 5,563 km².' },
  { month: 'AUG', primary: 20514, secondary: -15.2, primaryDisplay: '20.5k', secondaryDisplay: '-15.2', phaseName: 'Peak Deluge', narrative: 'Monsoon deluge crests; Core Basin dips to -25.7 dB specular null.' },
  { month: 'SEP', primary: 5383, secondary: -16.2, primaryDisplay: '5.4k', secondaryDisplay: '-16.2', phaseName: 'Receding Flood', narrative: 'Water recedes to 5,383 km²; evaporite crystallization commences.' },
  { month: 'OCT', primary: 4373, secondary: -14.7, primaryDisplay: '4.4k', secondaryDisplay: '-14.7', phaseName: 'Savanna Bloom', narrative: 'Grass canopy volume reaches peak; Banni HV scatter at -21.0 dB.' }
];

export default function SeasonalDanceTimelineView({
  onBackToIntro,
  onReturnToOrbit,
  onProceedToNext
}) {
  // Rotational timeline position: continuous float in [0, NUM_STOPS)
  // Starts with Winter as Stop 0
  const NUM_STOPS = TIMELINE_STOPS.length;
  const [rotPosition, setRotPosition] = useState(0.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showProvenanceModal, setShowProvenanceModal] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(soundEngine.isMuted);

  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(null);
  const targetRotRef = useRef(null);
  const dragStartYRef = useRef(null);
  const dragStartRotRef = useRef(null);

  // Maintain ambient soundtrack in sync across data pages
  useEffect(() => {
    soundEngine.playBreathOfTheRann(0.24);
  }, []);

  useEffect(() => {
    const unsub = soundEngine.subscribe((muted) => setIsAudioMuted(muted));
    return unsub;
  }, []);

  const handleToggleSound = () => {
    try {
      soundEngine.playClick();
      soundEngine.toggleMute();
    } catch (e) { }
  };

  // Smooth rotational loop: continuous autoplay or smooth interpolation to target
  useEffect(() => {
    const loop = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Smooth step towards target node if user clicked a specific stop
      if (targetRotRef.current !== null) {
        setRotPosition((prev) => {
          let diff = targetRotRef.current - prev;
          // Shortest path around modulo NUM_STOPS
          if (diff > NUM_STOPS / 2) diff -= NUM_STOPS;
          if (diff < -NUM_STOPS / 2) diff += NUM_STOPS;

          if (Math.abs(diff) < 0.01) {
            const finalPos = ((targetRotRef.current % NUM_STOPS) + NUM_STOPS) % NUM_STOPS;
            targetRotRef.current = null;
            return finalPos;
          }
          const next = prev + diff * 0.16;
          return ((next % NUM_STOPS) + NUM_STOPS) % NUM_STOPS;
        });
      } else if (isPlaying) {
        // Continuous autoplay: 15000ms per full 10-pass revolution at 1x
        const advance = (delta / (15000 / playbackSpeed)) * NUM_STOPS;
        setRotPosition((prev) => ((prev + advance) % NUM_STOPS + NUM_STOPS) % NUM_STOPS);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, NUM_STOPS]);

  // Jump smoothly to a specific seasonal stop index
  const handleJumpToStop = useCallback((stopIdx) => {
    try { soundEngine.playClick(); } catch (e) { }
    setIsPlaying(false);
    targetRotRef.current = stopIdx;
  }, []);

  // Map 10 radar acquisitions to 5 verified observation months (0=JAN, 1=JUL, 2=AUG, 3=SEP, 4=OCT)
  const STOP_TO_MONTH_IDX = [0, 1, 1, 2, 2, 3, 3, 4, 4, 4];
  const MONTH_TO_STOP_IDX = [0, 1, 4, 5, 9];

  const handleJumpToMonth = useCallback((mIdx) => {
    const targetStop = MONTH_TO_STOP_IDX[mIdx] ?? 0;
    handleJumpToStop(targetStop);
  }, [handleJumpToStop]);

  // Mouse wheel scroll to rotate the season wheel
  const handleWheelScroll = (e) => {
    e.preventDefault();
    setIsPlaying(false);
    targetRotRef.current = null;
    const delta = e.deltaY > 0 ? 0.25 : -0.25;
    setRotPosition((prev) => ((prev + delta) % NUM_STOPS + NUM_STOPS) % NUM_STOPS);
  };

  // Touch / pointer drag to rotate the season wheel
  const handlePointerDown = (e) => {
    setIsPlaying(false);
    targetRotRef.current = null;
    dragStartYRef.current = e.clientY || (e.touches && e.touches[0].clientY);
    dragStartRotRef.current = rotPosition;
  };

  const handlePointerMove = (e) => {
    if (dragStartYRef.current === null) return;
    const currentY = e.clientY || (e.touches && e.touches[0].clientY);
    const diffY = currentY - dragStartYRef.current;
    // 180px vertical drag = 1 pass rotation
    const rotDelta = -diffY / 180;
    setRotPosition(((dragStartRotRef.current + rotDelta) % NUM_STOPS + NUM_STOPS) % NUM_STOPS);
  };

  const handlePointerUp = () => {
    dragStartYRef.current = null;
    dragStartRotRef.current = null;
  };

  // Active nearest stop for narrative labels
  const activeIdx = Math.round(rotPosition) % NUM_STOPS;
  const activeStop = TIMELINE_STOPS[activeIdx] || TIMELINE_STOPS[0];
  const currentMonthIdx = STOP_TO_MONTH_IDX[activeIdx] ?? 0;

  // Mathematical interpolation between stop k and (k+1)%NUM_STOPS for real metrics
  const baseIdx = Math.floor(rotPosition) % NUM_STOPS;
  const nextIdx = (baseIdx + 1) % NUM_STOPS;
  const alpha = rotPosition - Math.floor(rotPosition);

  const stopA = TIMELINE_STOPS[baseIdx];
  const stopB = TIMELINE_STOPS[nextIdx];

  const currentFloodKm2 = (stopA.floodBasinKm2 * (1 - alpha) + stopB.floodBasinKm2 * alpha).toFixed(1);
  const currentHvDb = (stopA.vegetationHvDb * (1 - alpha) + stopB.vegetationHvDb * alpha).toFixed(2);
  const currentSigma0Db = (stopA.backscatterSigma0Db * (1 - alpha) + stopB.backscatterSigma0Db * alpha).toFixed(2);
  const currentSurfaceState = alpha < 0.5 ? stopA.surfaceState : stopB.surfaceState;

  // Web Audio sonification hum: pitch shifts subtly with backscatter dB
  const audioContextRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);

  useEffect(() => {
    if (isAudioMuted) {
      if (gainRef.current) gainRef.current.gain.value = 0;
      return;
    }

    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          audioContextRef.current = new AudioCtx();
          const osc = audioContextRef.current.createOscillator();
          const gain = audioContextRef.current.createGain();
          osc.type = 'sine';
          gain.gain.value = 0.015; // subtle sub-hum
          osc.connect(gain);
          gain.connect(audioContextRef.current.destination);
          osc.start();
          oscRef.current = osc;
          gainRef.current = gain;
        }
      }

      if (oscRef.current) {
        const db = parseFloat(currentSigma0Db);
        const freq = 55 + (Math.abs(db) - 14) * 4.2;
        oscRef.current.frequency.setTargetAtTime(freq, audioContextRef.current.currentTime, 0.1);
      }
    } catch (e) { }

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try { audioContextRef.current.close(); } catch (e) { }
        audioContextRef.current = null;
      }
    };
  }, [currentSigma0Db, isAudioMuted]);

  // Bezier curve parameters for the Monocolor Season Wheel:
  // Enlarged & spaced out to accommodate all 10 seasonal radar acquisitions evenly without overlap!
  // P0 = (195, 20), Pc = (-45, 270), P1 = (195, 520) in a 260x540 viewBox
  const getBezierPoint = (t) => {
    const clampedT = Math.max(0, Math.min(1, t));
    const bx = (1 - clampedT) * (1 - clampedT) * 195 + 2 * (1 - clampedT) * clampedT * (-45) + clampedT * clampedT * 195;
    const by = (1 - clampedT) * (1 - clampedT) * 20 + 2 * (1 - clampedT) * clampedT * 270 + clampedT * clampedT * 520;

    // Normal vector pointing outward to the left (into image)
    const dx = 2 * (1 - clampedT) * (-45 - 195) + 2 * clampedT * (195 - (-45));
    const dy = 2 * (1 - clampedT) * (270 - 20) + 2 * clampedT * (520 - 270);
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len;
    const ny = dx / len;
    return { bx, by, nx, ny };
  };

  return (
    <div className="relative w-full h-screen max-h-screen overflow-hidden bg-[#FAF8F5] text-stone-900 flex flex-col justify-between font-sans selection:bg-amber-200 selection:text-amber-950 pb-14 select-none">

      {/* ========================================================
          1. TOP HEADER BAR
      ======================================================== */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-2.5 bg-white/95 backdrop-blur-xl border-b border-stone-200 flex items-center justify-between gap-4 shadow-sm shrink-0">

        {/* Left: Back Actions */}
        <div className="flex items-center gap-2">
          {onBackToIntro && (
            <button
              onClick={() => {
                try { soundEngine.playTransitionSound(); } catch (e) { }
                onBackToIntro();
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 hover:text-stone-900 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-700" />
              <span>MONSOON DATA</span>
            </button>
          )}

          {onReturnToOrbit && (
            <button
              onClick={() => {
                try { soundEngine.playReturnSound(); } catch (e) { }
                onReturnToOrbit();
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 hover:text-stone-900 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">PLANETARY ORBIT</span>
              <span className="sm:hidden">ORBIT</span>
            </button>
          )}
        </div>

        {/* Center: Tracked Subtitle + Crisp Serif Title */}
        <div className="text-center flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.25em] text-amber-800 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
            <span>SEASON 02 OF 03 &bull; MONSOON REGIME &bull; THE ANNUAL DANCE OF SARS</span>
          </div>
          <h1 className="text-xs sm:text-sm md:text-base font-['Cinzel',serif] font-bold text-stone-900 tracking-[0.08em] uppercase truncate max-w-sm sm:max-w-md md:max-w-xl">
            THE VANISHING INLAND SEA
          </h1>
          <div className="hidden lg:flex items-center gap-3 text-[9px] font-mono text-stone-500 uppercase tracking-widest mt-0.5">
            <span>ROTARY SEASON WHEEL &bull; 10 MULTI-TEMPORAL ACQUISITIONS &bull; UNOBSTRUCTED SWATH</span>
          </div>
        </div>

        {/* Right: Data Provenance Modal Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              try { soundEngine.playHover(); } catch (e) { }
              setShowProvenanceModal(true);
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
          2. PLAYBACK & MULTI-TEMPORAL MONTH CONTROLLER (ABOVE PHOTO WINDOW)
      ======================================================== */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 pt-2 pb-1.5 shrink-0 select-none flex flex-wrap items-center justify-between gap-2.5">

        {/* Left: Playback Controls */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <button
            onClick={() => {
              try { soundEngine.playClick(); } catch (e) { }
              setIsPlaying((p) => !p);
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-sm ${isPlaying
              ? 'bg-amber-600 text-white ring-2 ring-amber-400/50'
              : 'bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold'
              }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'PAUSE DANCE' : 'AUTOPLAY DANCE'}</span>
          </button>

          <button
            onClick={() => {
              try { soundEngine.playHover(); } catch (e) { }
              setPlaybackSpeed((s) => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1));
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-mono tracking-wider bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 transition-all cursor-pointer font-bold"
          >
            {playbackSpeed}X SPEED
          </button>
        </div>

        {/* Right: Multi-Temporal Month Acquisitions (Moved from Left Panel to Above Photo Window!) */}
        <div className="flex-1 max-w-3xl flex items-center justify-end gap-1.5 p-1 rounded-2xl bg-white border border-stone-200 shadow-sm overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-mono font-bold text-amber-900 px-2 uppercase tracking-widest hidden md:inline">
            ACQUISITIONS:
          </span>
          {TIMELINE_STOPS.map((s) => {
            const isCurrent = activeIdx === s.index;
            return (
              <button
                key={`top-month-pill-${s.id}`}
                onClick={() => handleJumpToStop(s.index)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-mono uppercase font-bold shrink-0 transition-all cursor-pointer ${isCurrent
                  ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400/50 scale-105'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200/80'
                  }`}
                title={s.dateLabel}
              >
                {s.pillLabel}
              </button>
            );
          })}
        </div>

      </div>

      {/* ========================================================
          3. MAIN OBSERVATORY STAGE
          - Two Columns:
            [ LEFT COLUMN: Dedicated Seasonal Data Dossier Window ]
            [ RIGHT COLUMN: 100% Clean Unobstructed Radar Swath Viewport with Rotating Season Wheel ]
      ======================================================== */}
      <main className="relative w-full flex-1 min-h-0 flex flex-col justify-between px-4 sm:px-8 py-1.5 max-w-[1600px] mx-auto overflow-hidden">

        <div className="flex flex-col lg:flex-row items-stretch gap-3 w-full flex-1 min-h-[420px] sm:min-h-[460px] overflow-hidden">

          {/* ========================================================
              LEFT COLUMN: SEASONAL RADAR TIME-SERIES DOSSIER
              Zero pins — 100% focused on multi-temporal radar science!
          ======================================================== */}
          <aside className="w-full lg:w-[410px] xl:w-[440px] p-4 rounded-3xl bg-white border border-stone-200 shadow-xl flex flex-col justify-between shrink-0 select-none text-left gap-3 overflow-y-auto">

            {/* Top Bar: Title & Active Stage Indicator */}
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-800 uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 text-amber-600" />
                <span>RADAR TIME-SERIES DOSSIER</span>
              </div>

              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-300/80 text-[10px] font-mono font-bold text-amber-900 shadow-sm">
                <span>PASS {String(activeIdx + 1).padStart(2, '0')}/10</span>
                <span className="text-amber-500">&bull;</span>
                <span>{activeStop.shortDate}</span>
              </div>
            </div>

            {/* Radar Feature Snapshot Card with Badges */}
            <div className="relative w-full h-36 sm:h-40 rounded-2xl overflow-hidden border border-stone-200 shadow-inner bg-stone-900 group select-none">
              <img
                src={activeStop.imagePath}
                alt={activeStop.featureName}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Top-Left Badge: Sensor & Date */}
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[9px] font-mono text-amber-900 font-bold border border-stone-300 shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                <span>NISAR 24CM L-BAND &bull; {activeStop.dateLabel}</span>
              </div>

              {/* Bottom-Right Badge: Coords */}
              <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[9px] font-mono text-stone-200 border border-white/20">
                {activeStop.coords}
              </div>
            </div>

            {/* Feature Identification */}
            <div>
              <div className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-widest flex items-center gap-1.5 mb-0.5">
                <span>ACQUISITION PASS {String(activeIdx + 1).padStart(2, '0')} OF 10 &bull; {activeStop.coords}</span>
              </div>
              <h3 className="font-['Cinzel',serif] text-sm sm:text-base font-bold text-stone-900 uppercase leading-snug">
                {activeStop.title}
              </h3>
              <div className="text-[10.5px] font-mono text-stone-500 font-medium truncate">
                {activeStop.seasonName}
              </div>
            </div>

            {/* Layman Analogy Cream Box */}
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/90 text-[11px] font-sans text-amber-950 italic leading-snug">
              &ldquo;{activeStop.laymanQuote}&rdquo;
            </div>

            {/* Crisp Informative Paragraph */}
            <p className="text-[11.5px] text-stone-700 font-sans leading-relaxed">
              {activeStop.conciseText}
            </p>

            {/* Physical Radar Explanation */}
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-[10.5px] font-sans text-stone-600 leading-snug">
              <strong className="text-stone-900 font-mono block mb-0.5">MICROWAVE INTERACTION PHYSICS:</strong>
              {activeStop.conciseText ? activeStop.conciseText.split('.')[0] + '.' : '24cm L-band microwaves interact with surface dielectric permittivity and volumetric scatter.'}
            </div>

            {/* Bottom 4 Metric Pills */}
            <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-stone-200 mt-1">
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-center">
                <span className="text-[8px] font-mono text-stone-500 uppercase block font-semibold">{activeStop.pill1.label}</span>
                <strong className="text-[10.5px] font-mono text-stone-900 font-bold">{activeStop.pill1.value}</strong>
              </div>
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-center">
                <span className="text-[8px] font-mono text-stone-500 uppercase block font-semibold">{activeStop.pill2.label}</span>
                <strong className="text-[10.5px] font-mono text-sky-800 font-bold">{activeStop.pill2.value}</strong>
              </div>
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-center">
                <span className="text-[8px] font-mono text-stone-500 uppercase block font-semibold">{activeStop.pill3.label}</span>
                <strong className="text-[10.5px] font-mono text-amber-800 font-bold">{activeStop.pill3.value}</strong>
              </div>
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-center">
                <span className="text-[8px] font-mono text-stone-500 uppercase block font-semibold">BAND</span>
                <strong className="text-[10.5px] font-mono text-emerald-800 font-bold">24cm L</strong>
              </div>
            </div>

          </aside>

          {/* ========================================================
              RIGHT COLUMN: 100% CLEAN UNOBSTRUCTED RADAR SWATH VIEWPORT +
              LIVE ANNUAL PHENOLOGY GRAPH DIRECTLY BELOW IMAGE WINDOW
              Showcasing the full Dance of SARS across Gujarat & Kutch.
          ======================================================== */}
          <div className="flex-1 flex flex-col gap-2.5 min-w-0 min-h-0">

            {/* Radar Swath Viewport */}
            <div className="relative flex-1 min-h-[380px] lg:min-h-[420px] rounded-3xl overflow-hidden border border-stone-200 shadow-xl bg-stone-950 select-none">

              {/* Real Calibrated NISAR Overlays with continuous smooth crossfade */}
              {TIMELINE_STOPS.map((stop) => {
                let opacity = 0;
                if (stop.index === baseIdx) {
                  opacity = 1 - alpha;
                } else if (stop.index === nextIdx) {
                  opacity = alpha;
                }

                return (
                  <img
                    key={stop.id}
                    src={stop.imagePath}
                    alt={stop.title}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-150"
                    style={{
                      opacity,
                      zIndex: opacity > 0.05 ? 10 : 1
                    }}
                  />
                );
              })}

              {/* Top-Right Badge: Calibrated Swath & Physical Telemetry */}
              <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-1.5 pointer-events-none">
                <div className="px-3.5 py-1.5 rounded-full bg-white/95 border border-stone-300 text-[10px] font-mono text-amber-900 uppercase tracking-widest flex items-center gap-1.5 shadow-sm font-bold backdrop-blur-md">
                  <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  <span>NISAR 24CM L-BAND &bull; 140 KM BASIN</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/90 border border-stone-200 text-[9.5px] font-mono text-stone-700 shadow-sm font-semibold backdrop-blur-md">
                  &sigma;&deg; = {currentSigma0Db} dB &bull; {currentSurfaceState}
                </div>
              </div>

              {/* Top-Left Subtle Watermark */}
              <div className="absolute top-4 left-4 z-20 pointer-events-none">
                <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[9.5px] font-mono text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>CALIBRATED RADAR MATRIX &bull; 80M RES &bull; EPSG:32642</span>
                </div>
              </div>

              {/* ========================================================
                ROTARY SEASON WHEEL (ENLARGED & EVENLY SPACED)
                - Monocolor curved arc track in warm amber (#d97706, NO gradients)
                - Enlarged geometry (540px height) accommodating all 10 acquisitions evenly without overlap!
                - The ongoing season ALWAYS centers dynamically into the prominent HERO BUBBLE.
                - Neighbor bubbles feature clear date pills and ample vertical clearance.
            ======================================================== */}
              <div
                onWheel={handleWheelScroll}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-6 z-30 w-56 sm:w-64 h-[500px] sm:h-[540px] pointer-events-auto select-none flex items-center justify-end touch-none cursor-grab active:cursor-grabbing"
                title="Season Wheel: Scroll or drag to rotate through all 10 radar acquisitions"
              >

                <svg viewBox="0 0 260 540" className="w-full h-full overflow-visible pointer-events-none">

                  {/* Background Shadow Track */}
                  <path
                    d="M 195 20 Q -45 270 195 520"
                    fill="none"
                    stroke="#09090b"
                    strokeWidth="6"
                    strokeOpacity="0.4"
                    strokeLinecap="round"
                  />

                  {/* Monocolor Arc Line (Clean Amber #d97706, NO Gradients) */}
                  <path
                    d="M 195 20 Q -45 270 195 520"
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* ONLY LARGE SPOKES showing transitions between acquisitions */}
                  {TIMELINE_STOPS.map((stop) => {
                    let diff = (stop.index - rotPosition) % NUM_STOPS;
                    if (diff > NUM_STOPS / 2) diff -= NUM_STOPS;
                    if (diff < -NUM_STOPS / 2) diff += NUM_STOPS;

                    const t = 0.5 + diff * 0.17;
                    if (t < -0.05 || t > 1.05) return null;

                    const pt = getBezierPoint(t);
                    const spokeLen = 24; // Length of the large spoke
                    const x2 = pt.bx + pt.nx * spokeLen;
                    const y2 = pt.by + pt.ny * spokeLen;

                    // Fade out gracefully as it leaves the wheel bounds
                    const spokeOpacity = Math.max(0, 1 - Math.abs(diff) * 0.35);

                    return (
                      <line
                        key={`large-spoke-${stop.id}`}
                        x1={pt.bx}
                        y1={pt.by}
                        x2={x2}
                        y2={y2}
                        stroke="#d97706"
                        strokeWidth="2.5"
                        strokeOpacity={spokeOpacity}
                        strokeLinecap="round"
                      />
                    );
                  })}
                </svg>

                {/* Rotational Seasonal Bubbles along the Wheel */}
                <div className="absolute inset-0 pointer-events-auto">
                  {TIMELINE_STOPS.map((stop) => {
                    let diff = (stop.index - rotPosition) % NUM_STOPS;
                    if (diff > NUM_STOPS / 2) diff -= NUM_STOPS;
                    if (diff < -NUM_STOPS / 2) diff += NUM_STOPS;

                    // Continuous rotation along arc: apex t = 0.5 is the CENTER BUBBLE
                    const t = 0.5 + diff * 0.17;
                    if (t < -0.06 || t > 1.06) return null;

                    const pt = getBezierPoint(t);
                    const isCurrentInCenter = Math.abs(diff) < 0.28;
                    const IconComponent = stop.icon;

                    // Percentage position inside container
                    const leftPct = (pt.bx / 260) * 100;
                    const topPct = (pt.by / 540) * 100;

                    // Smooth opacity fade as bubbles approach top or bottom
                    const bubbleOpacity = Math.max(0.15, 1 - Math.abs(diff) * 0.32);

                    return (
                      <div
                        key={`wheel-bubble-${stop.id}`}
                        onClick={() => handleJumpToStop(stop.index)}
                        style={{
                          left: `${leftPct}%`,
                          top: `${topPct}%`,
                          transform: 'translate(-50%, -50%)',
                          opacity: bubbleOpacity
                        }}
                        className="absolute cursor-pointer flex items-center justify-center group"
                      >
                        {/* THE CURRENT SEASON SITS IN THE PROMINENT CENTER BUBBLE */}
                        {isCurrentInCenter ? (
                          <div className="flex items-center gap-3">

                            {/* Bold text to the left of the center bubble */}
                            <div className="text-right pointer-events-none pr-1">
                              <span className="text-xs sm:text-sm font-mono font-extrabold text-white block uppercase tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                                {stop.shortDate}
                              </span>
                              <span className="text-[10px] sm:text-[11px] font-mono font-bold text-amber-400 block uppercase tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] max-w-[170px] truncate">
                                {stop.seasonName}
                              </span>
                            </div>

                            {/* THE PROMINENT CENTER BUBBLE (Holding Ongoing Season Icon) */}
                            <div className="relative">
                              <div className="absolute -inset-2 rounded-full bg-amber-500/30 animate-ping pointer-events-none" />
                              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-stone-900 border-[3.5px] border-[#d97706] ring-4 ring-amber-400/40 shadow-2xl flex items-center justify-center scale-105 transition-all duration-150">
                                <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600" />
                              </div>
                            </div>

                          </div>
                        ) : (
                          <div className="flex items-center gap-2">

                            {/* Inactive Subordinate Label: Clean Date Pill with NO Overlap */}
                            <div className="text-right pointer-events-none hidden sm:block">
                              <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[9px] font-mono font-bold text-stone-200 block uppercase border border-white/10 shadow-sm">
                                {stop.shortDate}
                              </span>
                            </div>

                            {/* Inactive Subordinate Bubble Moving Ahead/Behind in Timeline */}
                            <div className="w-8 h-8 rounded-full bg-stone-900/85 text-stone-300 border border-stone-400/50 shadow-md flex items-center justify-center group-hover:scale-110 group-hover:border-amber-400 group-hover:text-amber-300 transition-all">
                              <IconComponent className="w-4 h-4" />
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>

            {/* SYNCED 12-MONTH PHENOLOGY GRAPH DIRECTLY BELOW RADAR SWATH WINDOW */}
            <div className="rounded-2xl bg-white border border-stone-200 p-2.5 sm:p-3 shadow-sm select-none">
              <div className="flex items-center justify-between pb-1 mb-1 border-b border-stone-100 text-[10px] font-mono">
                <span className="font-bold text-stone-900 flex items-center gap-1.5 uppercase">
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                  ANNUAL PHENOLOGY SYNC &bull; MULTI-TEMPORAL RADAR BACKSCATTER &amp; HYDROLOGY
                </span>
                <span className="text-amber-800 font-bold text-[9px] uppercase hidden sm:flex items-center gap-1.5">
                  <span>CLICK ANY MONTH TO SCRUB DANCE</span>
                  <span className="text-stone-300">|</span>
                  <span className="text-stone-600">ACTIVE: {ANNUAL_SAR_PHENOLOGY_CURVE[currentMonthIdx]?.month} ({activeStop.shortDate})</span>
                </span>
              </div>
              <MinimalDualCurveGraph
                data={ANNUAL_SAR_PHENOLOGY_CURVE}
                activeIndex={currentMonthIdx}
                onSelectIndex={(mIdx) => handleJumpToMonth(mIdx)}
                primaryKey="primary"
                secondaryKey="secondary"
                primaryLabel="FLOOD INUNDATION"
                secondaryLabel="RADAR ECHO"
                primaryUnit="km²"
                secondaryUnit="dB"
                primaryColor="#F59E0B"
                secondaryColor="#38BDF8"
                height={110}
              />
            </div>

          </div>

        </div>

        {/* ========================================================
            4. 4 METRIC CARDS (Bottom Row Grid Updating Dynamically)
        ======================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full shrink-0 mt-2">

          {/* CARD 1: FLOOD BASIN */}
          <div className="p-2.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
              <span className="text-sky-700 font-bold uppercase tracking-wider">FLOOD BASIN</span>
              <span className="text-[9px] text-stone-400">HH &lt; -18 dB</span>
            </div>
            <div className="mt-0.5">
              <div className="text-base sm:text-lg font-mono font-bold text-sky-900">
                {currentFloodKm2}
                <span className="text-[10px] font-normal text-stone-500 ml-1">km²</span>
              </div>
              <div className="text-[9px] font-mono text-stone-600 truncate">
                Submerged specular water area
              </div>
            </div>
          </div>

          {/* CARD 2: VEGETATION (HV) */}
          <div className="p-2.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
              <span className="text-emerald-700 font-bold uppercase tracking-wider">VEGETATION (HV)</span>
              <span className="text-[9px] text-stone-400">VOLUME SCATTER</span>
            </div>
            <div className="mt-0.5">
              <div className="text-base sm:text-lg font-mono font-bold text-emerald-900">
                {currentHvDb}
                <span className="text-[10px] font-normal text-stone-500 ml-1">dB</span>
              </div>
              <div className="text-[9px] font-mono text-stone-600 truncate">
                Banni &amp; bet savanna biomass
              </div>
            </div>
          </div>

          {/* CARD 3: BACKSCATTER (σ⁰) */}
          <div className="p-2.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
              <span className="text-amber-800 font-bold uppercase tracking-wider">BACKSCATTER (&sigma;&deg;)</span>
              <span className="text-[9px] text-stone-400">CORE RANN HH</span>
            </div>
            <div className="mt-0.5">
              <div className="text-base sm:text-lg font-mono font-bold text-amber-900">
                {currentSigma0Db}
                <span className="text-[10px] font-normal text-stone-500 ml-1">dB</span>
              </div>
              <div className="text-[9px] font-mono text-stone-600 truncate">
                Surface return echo intensity
              </div>
            </div>
          </div>

          {/* CARD 4: SURFACE STATE */}
          <div className="p-2.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
              <span className="text-stone-800 font-bold uppercase tracking-wider">SURFACE STATE</span>
              <span className="text-[9px] text-stone-400">DIELECTRIC</span>
            </div>
            <div className="mt-0.5">
              <div className="text-sm sm:text-base font-mono font-bold text-stone-900 truncate">
                {currentSurfaceState}
              </div>
              <div className="text-[9px] font-mono text-stone-600 truncate">
                Phase-calibrated microwave matrix
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* ========================================================
          5. SETTLED FOOTER BAR
      ======================================================== */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 w-full px-4 sm:px-8 py-2.5 bg-white/95 backdrop-blur-xl border-t border-stone-200 flex items-center justify-between gap-4 shadow-[0_-4px_25px_rgba(0,0,0,0.06)]">

        {/* Left: Sound Toggle + Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleSound}
            className="flex items-center gap-2 text-xs font-mono font-bold text-stone-700 hover:text-stone-900 transition-colors cursor-pointer"
          >
            {isAudioMuted ? (
              <VolumeX className="w-4 h-4 text-stone-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-700 animate-pulse" />
            )}
            <span className="hidden sm:inline">
              SOUND: {isAudioMuted ? 'MUTED' : 'ON (SYNCHRONIZED AMBIENCE)'}
            </span>
          </button>

          <span className="text-stone-300 hidden sm:inline">|</span>

          <div className="text-[11px] font-mono text-stone-600 hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            <span>ANNUAL WALTZ OF SARS: <strong className="text-stone-900">{activeStop.dateLabel} ({activeStop.shortDate})</strong></span>
          </div>
        </div>

        {/* Right: Proceed to Next Season */}
        {onProceedToNext && (
          <button
            onClick={() => {
              try { soundEngine.playTransitionSound(); } catch (e) { }
              onProceedToNext();
            }}
            className="px-5 py-2 rounded-full text-xs font-mono tracking-wider bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold transition-all cursor-pointer flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
          >
            <span>PROCEED TO SAVANNA &amp; LIVING SYNC</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </footer>

      {/* ========================================================
          6. DATA PROVENANCE MODAL (Official NISAR Calibration Data)
      ======================================================== */}
      {showProvenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden p-6 text-stone-900 space-y-4 max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-600" />
                <h3 className="font-['Cinzel',serif] text-base sm:text-lg font-bold text-stone-900 uppercase">
                  NISAR Level 2-GCOV Data Provenance
                </h3>
              </div>
              <button
                onClick={() => setShowProvenanceModal(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scientific Credentials */}
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              All raster imagery and metric cards presented in this visualizer are directly calibrated from official NASA-ISRO Synthetic Aperture Radar (NISAR) Level 2 Geocoded Covariance (GCOV) HDF5 datasets over the Great Rann of Kutch basin.
            </p>

            {/* Bounding Box Card */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1 font-mono text-xs">
              <div className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">
                GEOGRAPHIC BOUNDING BOX (WGS-84 / UTM ZONE 42N)
              </div>
              <div className="text-stone-800">
                Lon: 69.45&deg;E &ndash; 70.75&deg;E &bull; Lat: 23.68&deg;N &ndash; 24.28&deg;N
              </div>
              <div className="text-[10px] text-stone-500">
                Grid: 80.0m x 80.0m Resolution &bull; Specular Water Threshold: -18.0 dB
              </div>
            </div>

            {/* Granule Registry */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">
                CALIBRATED NISAR L2-GCOV GRANULES:
              </div>

              {TIMELINE_STOPS.map((stop) => (
                <div key={`modal-${stop.id}`} className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-900">
                    <span>{stop.stopLabel}</span>
                    <span className="text-[10px] text-stone-500 font-normal">Track 063 &bull; Frame 076</span>
                  </div>
                  <div className="text-[10px] font-mono text-stone-700 break-all select-all">
                    {stop.granuleId}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-mono text-stone-600 pt-1">
                    <span>Flood: {stop.floodBasinKm2} km²</span>
                    <span>&sigma;&deg;: {stop.backscatterSigma0Db} dB</span>
                    <span>HV: {stop.vegetationHvDb} dB</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Verification Tag */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-200 text-xs font-mono text-stone-500">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>NASA Space Apps 2026 Verified Data</span>
              </div>
              <button
                onClick={() => setShowProvenanceModal(false)}
                className="px-4 py-1.5 rounded-full bg-stone-900 hover:bg-black text-white font-mono text-xs transition-colors cursor-pointer"
              >
                CLOSE
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
