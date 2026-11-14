import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Activity,
  Sparkles,
  CheckCircle2,
  Info,
  Users,
  Eye,
  Radio,
  MapPin,
  Layers,
  HelpCircle,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { soundEngine } from '../../utils/audio';

/**
 * DedicatedLayerInspectionView
 * 
 * Museum-grade radar layer exploration console:
 * - Direct leader lines pointing from descriptive callout badges to exact radar features
 *   (e.g., PITCH BLACK = CALM WATER, BRIGHT WHITE = DRY SALT CRUST, MUTED GRAY = DAMP MUDFLAT)
 * - Interactive 24cm NISAR Radar vs Normal Optical Satellite POV Lens
 * - Visual Decibel & Brightness Decoder Key
 * - Plain English Layman Explanations (Everyday Analogy, What Radar Sees, Real-World Use)
 * - Verified NASA-ISRO NISAR L2-GCOV HDF5 Scientific Proof
 * - Authentic background atmosphere: Breath of the Rann
 */
export default function DedicatedLayerInspectionView({
  layer,
  onBackTo3D,
  onSelectNextLayer,
  hideTopBar = false
}) {
  const [activeTab, setActiveTab] = useState('layman'); // 'layman' | 'science'
  const [viewMode, setViewMode] = useState('radar'); // 'radar' | 'optical'
  const [selectedHotspotIdx, setSelectedHotspotIdx] = useState(0);

  // Play Breath of the Rann ambient audio on mount
  useEffect(() => {
    soundEngine.playBreathOfTheRann(0.24);
  }, []);

  // Authentic Layer Educational Profiles (Direct from NISAR Data matrices)
  const LAYER_PROFILES = {
    hh: {
      id: 'hh',
      number: '01',
      title: 'THE WATER & FLOOD DETECTOR (HH CHANNEL)',
      channelTag: 'CO-POLARIZED RADAR (HH)',
      sensor: 'NASA-ISRO NISAR LSAR • Track 063, Frame 076',
      wavelength: '24 cm L-Band (1.25 GHz) • Specular Surface Mirror Channel',
      tagline: 'Sees water as a dark mirror through storm clouds and maps dry salt retro-reflection.',
      radarImg: '/assets/layers/nisar_october_hh_true.webp',
      opticalImg: '/assets/layers/kutch_optical_satellite_true.jpg',
      whatEyesSee: 'A blinding white glare of salt and desert dust. Optical satellites see an impenetrable blanket of storm clouds during monsoons.',
      whatRadarSees: 'Water behaves like a mirror, deflecting radar waves into space (pitch-black voids). Sharp salt crystals bounce waves straight back (bright white).',
      hotspots: [
        {
          id: 'h1',
          number: '01',
          claimId: 'CLM_HH_WATER_SPECULAR',
          name: 'Specular Water Barrier',
          calloutTitle: 'PITCH BLACK: CALM WATER',
          calloutEcho: '-24.8 dB (Specular Null)',
          coords: '23.95°N, 69.80°E',
          targetX: 25,
          targetY: 38,
          badgeX: 4,
          badgeY: 15,
          elbowX: 18,
          elbowY: 20,
          badgeAnchorX: 22,
          badgeAnchorY: 20,
          radarEcho: '-24.8 dB (Specular Null Void)',
          whyItLooksLikeThis: 'Smooth water acts like a tilted mirror. Incoming 24cm microwaves reflect forward away into space, returning almost zero echo back to the satellite.',
          groundTruth: 'Seasonal shallow brine creates a natural water barrier around Khadir Bet, protecting nesting flamingos from land predators.'
        },
        {
          id: 'h2',
          number: '02',
          claimId: 'CLM_HH_HALITE_ROUGH',
          name: 'Crystalline Halite Salt Flats',
          calloutTitle: 'BRIGHT WHITE: DRY SALT CRUST',
          calloutEcho: '-14.0 dB (Surface Roughness)',
          coords: '24.05°N, 69.95°E',
          targetX: 68,
          targetY: 44,
          badgeX: 46,
          badgeY: 20,
          elbowX: 68,
          elbowY: 26,
          badgeAnchorX: 58,
          badgeAnchorY: 26,
          radarEcho: '-14.0 dB (Diffuse Roughness Echo)',
          whyItLooksLikeThis: 'Hexagonal halite salt crystals form faceted 3D surfaces. These facets act like bicycle reflectors, scattering radar energy straight back to the satellite.',
          groundTruth: 'Solid crystallized halite crust covering the Great Rann of Kutch basin.'
        },
        {
          id: 'h3',
          number: '03',
          claimId: 'CLM_HH_DAMP_SILT',
          name: 'Damp Silt & Evaporite Margin',
          calloutTitle: 'MUTED GRAY: DAMP SILT',
          calloutEcho: '-17.6 dB (Intermediate Silt)',
          coords: '23.85°N, 69.90°E',
          targetX: 42,
          targetY: 72,
          badgeX: 6,
          badgeY: 76,
          elbowX: 26,
          elbowY: 72,
          badgeAnchorX: 22,
          badgeAnchorY: 81,
          radarEcho: '-17.6 dB (Muted Silt Interface)',
          whyItLooksLikeThis: 'Moist silt mixes dielectric absorption with rough surface scattering, returning intermediate energy between calm water and dry salt.',
          groundTruth: 'Silt-clay evaporite basin with seasonal moisture transitions.'
        }
      ],
      colorKey: [
        { label: 'Dark Black (< -20 dB)', desc: 'Smooth Open Water & Seasonal Flood Null' },
        { label: 'Muted Gray (-18 dB)', desc: 'Moist Silt, Clay & Intermediate Evaporites' },
        { label: 'Bright White (> -14 dB)', desc: 'Rough Crystalline Halite Salt Crust' }
      ],
      layman: {
        analogy: 'A powerful flashlight shining at a tilted bathroom mirror vs. crushed sandpaper.',
        whatAreWeSeeing:
          'Calm water cannot bounce radar waves back—it reflects them forward into space like a tilted mirror. That makes every flood channel appear pitch-black. In contrast, sharp salt crystals bounce waves straight back, glowing bright white.',
        realWorldUse:
          'Disaster management authorities use 24cm L-band radar during cyclones and monsoons. Because microwaves pierce through clouds and heavy rain, emergency crews locate submerged roads and isolated villages without delay.',
        ruleOfThumb: 'Dark = Calm Standing Water; Bright = Rough Salt Flats & Ground.'
      },
      scientificProof: {
        granuleId: 'NISAR_L2_PR_GCOV_034_063_D_076_4005_DHDH_A_20261028T135735',
        polarization: 'Linear Co-Polarized (Horizontal Transmit / Horizontal Receive)',
        measuredWaterNull: '-24.8 dB to -26.3 dB in Core Basin specular water (measured.json)',
        frequency: '1.25 GHz (24 cm L-Band Microwave, 747 km orbit)',
        surfaceDielectric: 'Real permittivity eps\' ~ 5.9 in solid halite (Gorham et al. 2002); water threshold set at -20.0 dB'
      }
    },
    hv: {
      id: 'hv',
      number: '02',
      title: 'THE LIVING PLANT & BIOMASS GAUGE (HV CHANNEL)',
      channelTag: 'CROSS-POLARIZED VOLUME SCATTER (HV)',
      sensor: 'NASA-ISRO NISAR L2 GCOV • HV Cross-Polarization',
      wavelength: '24 cm L-Band (1.25 GHz) • Volumetric Canopy Scattering',
      tagline: 'Tracks living plant canopy volume and separates woody branches from soft grasses.',
      radarImg: '/assets/layers/nisar_october_hv_true.webp',
      opticalImg: '/assets/layers/kutch_optical_satellite_true.jpg',
      whatEyesSee: 'A confusing dusty yellowish landscape where dry yellow grass looks nearly identical to dead scrub and sand.',
      whatRadarSees: 'Tangled leaves and branches twist radar waves in all directions, turning them vertical. The brighter the glow, the heavier the cattle forage.',
      hotspots: [
        {
          id: 'h1',
          number: '01',
          claimId: 'CLM_HV_BANNI_PASTURE',
          name: 'Banni Savanna Grazing Range',
          calloutTitle: 'BRIGHT GLOW: SWEET GRASS',
          calloutEcho: '-21.0 dB (Volume Scatter)',
          coords: '23.75°N, 69.75°E',
          targetX: 34,
          targetY: 64,
          badgeX: 6,
          badgeY: 76,
          elbowX: 22,
          elbowY: 64,
          badgeAnchorX: 21,
          badgeAnchorY: 81,
          radarEcho: '-21.0 dB (Canopy Volume Scatter)',
          whyItLooksLikeThis: 'Blades of sweet grass and bushy acacia stems act like a pinball machine. Incoming horizontal pulses bounce repeatedly off branches, twisting into vertical echoes.',
          groundTruth: 'High-protein native pasture (Dichanthium, Cenchrus) supporting Maldhari pastoral herds across Banni.'
        },
        {
          id: 'h2',
          number: '02',
          claimId: 'CLM_HV_BARE_MUD',
          name: 'Sterile Saline Clay Bed',
          calloutTitle: 'DARK VOID: BARE SALINE MUD',
          calloutEcho: '-27.2 dB (Near Noise Floor)',
          coords: '24.10°N, 70.10°E',
          targetX: 72,
          targetY: 30,
          badgeX: 46,
          badgeY: 18,
          elbowX: 72,
          elbowY: 23,
          badgeAnchorX: 58,
          badgeAnchorY: 23,
          radarEcho: '-27.2 dB (Instrument Noise Floor)',
          whyItLooksLikeThis: 'Flat bare ground has no vertical stems or branches to depolarize radar waves. Without multiple reflections, cross-polarized energy drops to the noise floor.',
          groundTruth: 'Barren saline clay flats where no vegetation can take root.'
        },
        {
          id: 'h3',
          number: '03',
          claimId: 'CLM_HV_PROSOPIS_INVASION',
          name: 'Invasive Prosopis Scrub Thicket',
          calloutTitle: 'HIGH SCATTER: WOODY SCRUB',
          calloutEcho: '-18.2 dB (Depolarization)',
          coords: '23.82°N, 69.65°E',
          targetX: 22,
          targetY: 44,
          badgeX: 4,
          badgeY: 28,
          elbowX: 16,
          elbowY: 44,
          badgeAnchorX: 18,
          badgeAnchorY: 34,
          radarEcho: '-18.2 dB (Intense Branch Depolarization)',
          whyItLooksLikeThis: 'Rigid woody branches of invasive Prosopis juliflora produce intense volumetric depolarization, allowing scientists to separate weeds from soft native grasses.',
          groundTruth: 'Aggressive thorny bush invasion (spread from 6% in 1997 to 54% in 2015, GUIDE) tracked by forest rangers.'
        }
      ],
      colorKey: [
        { label: 'Dark Black (< -26 dB)', desc: 'Bare Mud, Calm Water & Near-Noise Floor' },
        { label: 'Muted Glow (-22 dB)', desc: 'Herbaceous Sweet Grasses & Seasonal Pasture' },
        { label: 'Bright White (> -19 dB)', desc: 'Dense Woody Thickets & Invasive Prosopis Scrub' }
      ],
      layman: {
        analogy: 'Throwing tennis balls into a thick thorn bush vs. bouncing them off flat pavement.',
        whatAreWeSeeing:
          'When radar waves hit flat ground or calm water, their wave direction stays horizontal. But inside grass stalks and tree branches, waves bounce repeatedly off stems like a pinball machine, twisting into a vertical echo. The satellite measures this twisted echo to weigh vegetation.',
        realWorldUse:
          'Maldhari pastoralists manage Banni as a shared commons (~2,618 km²). Cross-polarized radar helps monitor seasonal grass forage growth and tracks invasive woody scrub without expensive ground surveys.',
        ruleOfThumb: 'Dark = Bare Mud or Water; Bright = Dense Living Vegetation & Branches.'
      },
      scientificProof: {
        granuleId: 'NISAR_L2_PR_GCOV_034_063_D_076_4005_DHDH_A_20261028T135735',
        polarization: 'Linear Cross-Polarized (Horizontal Transmit / Vertical Receive)',
        meanCanopyScatter: '-21.03 dB across Banni Savanna pasture (Cycle 034 in measured.json)',
        biomassCorrelation: 'Volumetric depolarization maps aboveground biomass up to 40-60 Mg/ha saturation (Mitchard et al. 2009)',
        noiseFloor: 'L-band NESZ noise floor requirement is approximately -23 dB (measured noise floor down to -27.2 dB)'
      }
    },
    ratio: {
      id: 'ratio',
      number: '03',
      title: 'THE SMART LAND CLASSIFIER (DUAL-POL RATIO)',
      channelTag: 'POLARIMETRIC RATIO MATRIX (HH / HV)',
      sensor: 'NASA-ISRO Radiometric Polarimetric Decomposition',
      wavelength: '24 cm Microwave • Dual-Pol Covariance Matrix Division',
      tagline: 'Mathematical decomposition that separates water, salt crust, and living pasture.',
      radarImg: '/assets/layers/nisar_october_polarimetric_ratio_true.webp',
      opticalImg: '/assets/layers/kutch_optical_satellite_true.jpg',
      whatEyesSee: 'Human eyes get deceived by desert sunlight glare—sun-baked salt, bleached grass, and dry mud all look almost identical.',
      whatRadarSees: 'By dividing water reflection by plant bounce (HH / HV), radar discards surface glare and creates an automatic classification map.',
      hotspots: [
        {
          id: 'h1',
          number: '01',
          claimId: 'CLM_RATIO_SALT_CRUST',
          name: 'High Ratio: Crystalline Halite Crust',
          calloutTitle: 'HIGH RATIO: PURE SALT CRUST',
          calloutEcho: '+10.8 dB (Surface Echo)',
          coords: '24.15°N, 70.05°E',
          targetX: 62,
          targetY: 38,
          badgeX: 46,
          badgeY: 20,
          elbowX: 62,
          elbowY: 25,
          badgeAnchorX: 58,
          badgeAnchorY: 25,
          radarEcho: '+10.8 dB Ratio (Dominant Surface Return)',
          whyItLooksLikeThis: 'Halite salt produces strong mirror-like bounces (HH) but has zero foliage to twist the wave (HV). Dividing HH by HV creates a massive positive ratio.',
          groundTruth: 'Hard, walkable crystalline halite crust covering the Great Rann basin.'
        },
        {
          id: 'h2',
          number: '02',
          claimId: 'CLM_RATIO_PASTURE',
          name: 'Low Ratio: Living Sweet Grass Pasture',
          calloutTitle: 'LOW RATIO: LIVING PASTURE',
          calloutEcho: '+3.5 dB (Volume Echo)',
          coords: '23.70°N, 69.80°E',
          targetX: 32,
          targetY: 68,
          badgeX: 6,
          badgeY: 80,
          elbowX: 20,
          elbowY: 68,
          badgeAnchorX: 20,
          badgeAnchorY: 84,
          radarEcho: '+3.5 dB Ratio (Canopy Volume Depolarization)',
          whyItLooksLikeThis: 'Foliage generates high cross-polarized reflections (HV), bringing the ratio close to zero and cleanly isolating rich pasture.',
          groundTruth: 'Nutritious native Dichanthium annulatum grassland blooming after the monsoon.'
        },
        {
          id: 'h3',
          number: '03',
          claimId: 'CLM_RATIO_WATER_MARGIN',
          name: 'Boundary: Seasonal Water Margin',
          calloutTitle: 'SHARP TRANSITION: WATER MARGIN',
          calloutEcho: 'Water Boundary',
          coords: '24.00°N, 70.20°E',
          targetX: 46,
          targetY: 48,
          badgeX: 4,
          badgeY: 42,
          elbowX: 22,
          elbowY: 48,
          badgeAnchorX: 18,
          badgeAnchorY: 46,
          radarEcho: 'Sharp Specular Transition Zone',
          whyItLooksLikeThis: 'Clean mathematical step between specular water null and rough evaporite shoreline.',
          groundTruth: 'Natural shallow water barrier around Khadir Bet protecting nesting flamingos from land predators.'
        }
      ],
      colorKey: [
        { label: 'Low Ratio (+2 to +5 dB)', desc: 'Living Vegetation, Grassland & Woody Canopy' },
        { label: 'Mid Ratio (+6 to +8 dB)', desc: 'Damp Mudflats, Silt & Mixed Evaporites' },
        { label: 'High Ratio (+9 to +14 dB)', desc: 'Pure Crystalline Salt Flats & Exposed Bedrock' }
      ],
      layman: {
        analogy: 'An Earth X-Ray filter that separates hard bones from soft muscle.',
        whatAreWeSeeing:
          'Human eyes get confused when salt flats and dry grass both look yellowish or white in bright sun. By dividing the mirror bounce (HH) by the vegetation bounce (HV), we create a smart land mask. Hard crystalline salt has an extraordinarily high ratio (+11 dB) because it bounces radar directly. Soft grasses have low ratios (+3 dB) because foliage twists a huge portion of the wave.',
        realWorldUse:
          'Conservation ecologists use this ratio to track the invasive thorny shrub Prosopis juliflora (Gando Baval) and assist community restoration of endemic grasslands in Banni.',
        ruleOfThumb: 'High Ratio (+10 dB) = Hard Salt Crust; Low Ratio (+3 dB) = Natural Living Grassland.'
      },
      scientificProof: {
        granuleId: 'NISAR_L2_PR_GCOV_034_063_D_076_4005_DHDH_A_20261028T135735',
        formula: 'Polarimetric Ratio (dB) = 10 * log10(gamma0_HH) - 10 * log10(gamma0_HV)',
        dynamicRange: '0.0 dB (Pure isotropic volume scatter) to +14.0 dB (Strong surface bounce)',
        haliteReturn: '+8.5 dB to +12.0 dB (Halite facet retro-reflection)',
        savannaReturn: '+2.0 dB to +5.0 dB (Canopy volumetric depolarization)'
      }
    }
  };

  const profile = LAYER_PROFILES[layer?.id] || LAYER_PROFILES.hh;
  const currentHotspot = profile.hotspots[selectedHotspotIdx] || profile.hotspots[0];

  return (
    <div className="relative w-full h-full flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-[#FAF8F5] text-stone-900 font-sans select-none animate-in fade-in duration-200 p-3 sm:p-5 lg:p-6">
      <div className="w-full max-w-[1450px] mx-auto flex flex-col gap-4 text-left">

        {/* ========================================================
            1. OPTIONAL TOP BAR (Only shown when not integrated into parent header)
        ======================================================== */}
        {!hideTopBar && (
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200">
            {profile.index > 0 && (
              <button
                onClick={() => {
                  try { soundEngine.playReturnSound(); } catch (e) { }
                  onBackTo3D();
                }}
                className="px-4 py-2 rounded-full bg-white hover:bg-stone-50 border border-amber-600/40 text-stone-800 hover:text-amber-800 font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-102"
              >
                <ArrowLeft className="w-4 h-4 text-amber-600" />
                <span>BACK</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[11px] font-mono text-stone-500 uppercase tracking-widest hidden sm:inline">
                EXPLORING NISAR RADAR STRATUM
              </span>
            </div>
          </div>
        )}

        {/* ========================================================
            2. SENSOR METADATA & TELEMETRY STRIP (Single Title in Top Header)
        ======================================================== */}
        <div className="flex items-center justify-between pb-1.5 border-b border-stone-200 text-xs font-mono">
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono tracking-wider text-amber-800 uppercase font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            <span>{profile.channelTag}</span>
            <span className="text-stone-400">&bull;</span>
            <span className="text-stone-600">{profile.sensor}</span>
          </div>
          <span className="text-stone-500 font-sans text-[11px] hidden md:inline italic">
            {profile.tagline}
          </span>
        </div>

        {/* ========================================================
            3. MAIN 2-COLUMN STAGE:
               LEFT: Interactive Radar Hotspot Explorer with Leader Lines
               RIGHT: Layman Explanation, Everyday Analogy & Telemetry
        ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

          {/* LEFT COLUMN (7 COLS): INTERACTIVE RADAR EXPLORER & LEADER LINES */}
          <div className="lg:col-span-7 flex flex-col p-4 sm:p-5 rounded-3xl bg-white border border-stone-200 shadow-xl gap-4">

            {/* Header: Sensor Identity */}
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-stone-200 text-xs font-mono gap-2">
              <span className="flex items-center gap-1.5 text-amber-800 font-bold uppercase tracking-wider">
                <Radio className="w-4 h-4 text-amber-600" />
                <span>INTERACTIVE FEATURE EXPLORER</span>
              </span>

              {/* Sensor Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-mono text-[10.5px] font-bold">
                <Radio className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                <span>24CM NISAR L-BAND RADAR</span>
              </div>
            </div>

            {/* Radar Image Viewport with Dynamic Leader Lines & Callout Badges */}
            <div className="relative w-full aspect-square max-h-[480px] rounded-2xl overflow-hidden border border-stone-200 shadow-inner bg-stone-900 select-none group">
              <img
                src={profile.radarImg}
                alt={profile.title}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {/* Top Watermark & Sensor Identity */}
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 border border-stone-300 text-[10px] font-mono uppercase text-stone-800 shadow-sm backdrop-blur-md flex items-center gap-1.5 z-20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                <span>NISAR 24CM MICROWAVE MATRIX &bull; 160 KM SWATH</span>
              </div>

              {/* SVG Overlay: Physical Leader Lines pointing directly to radar features */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <filter id="leader-line-shadow" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.9" />
                  </filter>
                </defs>

                {profile.hotspots.map((hs, idx) => {
                  const isSelected = selectedHotspotIdx === idx;
                  const pts = `${hs.targetX},${hs.targetY} ${hs.elbowX},${hs.elbowY} ${hs.badgeAnchorX},${hs.badgeAnchorY}`;

                  return (
                    <g key={`leader-line-${hs.id}`}>
                      {/* Halo Stroke for active line */}
                      {isSelected && (
                        <polyline
                          points={pts}
                          fill="none"
                          stroke="#d97706"
                          strokeWidth="2.4"
                          strokeOpacity="0.45"
                          className="transition-all duration-300"
                        />
                      )}

                      {/* Main Leader Line with shadow filter */}
                      <polyline
                        points={pts}
                        fill="none"
                        stroke={isSelected ? '#d97706' : '#ffffff'}
                        strokeWidth={isSelected ? '1.0' : '0.6'}
                        strokeDasharray={isSelected ? 'none' : '1.8 1.2'}
                        strokeOpacity={isSelected ? 1.0 : 0.85}
                        filter="url(#leader-line-shadow)"
                        className="transition-all duration-300"
                      />

                      {/* Feature Anchor Target on the Radar Image */}
                      <circle
                        cx={hs.targetX}
                        cy={hs.targetY}
                        r={isSelected ? '2.0' : '1.4'}
                        fill={isSelected ? '#d97706' : '#ffffff'}
                        stroke="#000000"
                        strokeWidth="0.4"
                        filter="url(#leader-line-shadow)"
                        className="transition-all duration-300"
                      />

                      {/* Target Reticle Ticks */}
                      <circle
                        cx={hs.targetX}
                        cy={hs.targetY}
                        r={isSelected ? '4.2' : '3.0'}
                        fill="none"
                        stroke={isSelected ? '#d97706' : '#ffffff'}
                        strokeWidth="0.3"
                        strokeDasharray="1.5 1.5"
                      />

                      {/* Pulsing Beacon Ring */}
                      {isSelected && (
                        <circle
                          cx={hs.targetX}
                          cy={hs.targetY}
                          r="3.5"
                          fill="none"
                          stroke="#d97706"
                          strokeWidth="0.5"
                          className="animate-ping origin-center opacity-80"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Interactive Callout Badges with Descriptive Titles */}
              {profile.hotspots.map((hs, idx) => {
                const isSelected = selectedHotspotIdx === idx;
                return (
                  <button
                    key={`badge-${hs.id}`}
                    data-claim-id={hs.claimId}
                    onClick={() => {
                      try { soundEngine.playHover(); } catch (e) { }
                      setSelectedHotspotIdx(idx);
                    }}
                    style={{ left: `${hs.badgeX}%`, top: `${hs.badgeY}%` }}
                    className={`absolute z-20 cursor-pointer text-left p-2 sm:p-2.5 rounded-xl border transition-all duration-200 shadow-lg group focus:outline-none ${isSelected
                        ? 'bg-white text-stone-900 border-amber-600 scale-105 shadow-amber-950/20 ring-2 ring-amber-500/40'
                        : 'bg-white/95 text-stone-800 border-stone-300 hover:border-amber-500 hover:bg-white hover:scale-102 backdrop-blur-md'
                      }`}
                    title={`Inspect ${hs.name}`}
                  >
                    <div className="flex items-center gap-1.5 text-[8.5px] sm:text-[9px] font-mono uppercase tracking-wider mb-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-600 animate-pulse' : 'bg-stone-400'}`} />
                      <span className="font-bold text-amber-800">FEATURE {hs.number}</span>
                      <span className="text-stone-400">&bull;</span>
                      <span className="font-mono text-stone-600 text-[8px] sm:text-[8.5px]">{hs.calloutEcho}</span>
                    </div>
                    <div className="font-mono font-bold text-[10px] sm:text-[11.5px] text-stone-900 tracking-tight leading-snug group-hover:text-amber-800 transition-colors">
                      {hs.calloutTitle}
                    </div>
                  </button>
                );
              })}

              {/* Clickable transparent zones over target dots */}
              {profile.hotspots.map((hs, idx) => (
                <button
                  key={`dot-btn-${hs.id}`}
                  onClick={() => {
                    try { soundEngine.playHover(); } catch (e) { }
                    setSelectedHotspotIdx(idx);
                  }}
                  style={{
                    left: `${hs.targetX}%`,
                    top: `${hs.targetY}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  className="absolute w-8 h-8 rounded-full z-20 cursor-pointer focus:outline-none"
                  title={hs.name}
                />
              ))}
            </div>

            {/* Visual Brightness & Decibel Decoder Key */}
            <div className="p-3 rounded-2xl bg-white border border-stone-200 flex flex-col gap-1.5">
              <div className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider flex items-center justify-between">
                <span>RADAR BRIGHTNESS DECODER KEY:</span>
                <span className="text-amber-800 font-bold">LOW ECHO &rarr; HIGH ECHO</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {profile.colorKey.map((key, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-stone-50 border border-stone-200/70 flex flex-col gap-0.5">
                    <span className="text-[10px] font-mono font-bold text-stone-900">{key.label}</span>
                    <span className="text-[10.5px] font-sans text-stone-600 leading-tight">{key.desc}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (5 COLS): SIMPLE GUIDE & SCIENTIFIC DATA */}
          <div className="lg:col-span-5 flex flex-col gap-3.5 justify-start">

            {/* Mode Switcher Tabs (Zero bracketed text) */}
            <div className="p-1 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-between gap-1 shadow-inner">
              <button
                onClick={() => {
                  try { soundEngine.playHover(); } catch (e) { }
                  setActiveTab('layman');
                }}
                className={`flex-1 py-2 px-3 rounded-xl font-mono text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'layman'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                  }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>FOR EVERYONE</span>
              </button>

              <button
                onClick={() => {
                  try { soundEngine.playHover(); } catch (e) { }
                  setActiveTab('science');
                }}
                className={`flex-1 py-2 px-3 rounded-xl font-mono text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'science'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                  }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>FOR SCIENTISTS</span>
              </button>
            </div>

            {/* TAB CONTENT: ACCESSIBLE LAYMAN EXPLANATION */}
            {activeTab === 'layman' && profile.layman && (
              <div className="flex flex-col gap-3 animate-in fade-in duration-200">

                {/* 1. Selected Hotspot Spotlight Card (Visual Focus & Decibel Gauge) */}
                {currentHotspot && (
                  <div data-claim-id={currentHotspot.claimId} className="p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-amber-500/50 shadow-md flex flex-col gap-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-1 text-xs font-mono border-b border-stone-200/80 pb-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900 uppercase">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        <span>FEATURE {selectedHotspotIdx + 1}: {currentHotspot.name}</span>
                      </div>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {currentHotspot.coords}
                      </span>
                    </div>

                    {/* Visual Decibel Gauge Bar */}
                    <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/70 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-stone-600 font-bold uppercase tracking-wider">RADAR ECHO INTENSITY:</span>
                        <strong className="text-amber-900 font-bold">{currentHotspot.radarEcho}</strong>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden relative">
                        <div
                          className="h-full bg-amber-600 rounded-full transition-all duration-300"
                          style={{
                            width: currentHotspot.radarEcho.includes('-22')
                              ? '18%'
                              : currentHotspot.radarEcho.includes('-20')
                                ? '42%'
                                : currentHotspot.radarEcho.includes('-18')
                                  ? '60%'
                                  : currentHotspot.radarEcho.includes('-14')
                                    ? '88%'
                                    : '75%'
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[8.5px] font-mono text-stone-400">
                        <span>-26 dB (Mirror Null)</span>
                        <span>-18 dB (Moist)</span>
                        <span>-12 dB (Rough Crystal)</span>
                      </div>
                    </div>

                    <div className="text-xs text-stone-700 font-sans leading-relaxed">
                      <strong className="text-stone-900 font-semibold">How Radar Sees It: </strong>
                      {currentHotspot.whyItLooksLikeThis}
                    </div>

                    <div className="text-[11px] font-mono text-stone-600 bg-stone-50 p-2 rounded-xl border border-stone-200/70">
                      <strong className="text-amber-800">Ground Truth: </strong>
                      {currentHotspot.groundTruth}
                    </div>
                  </div>
                )}

                {/* 2. Everyday Analogy (Visual Quote Card) */}
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/90 flex flex-col gap-1 shadow-sm">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-800 uppercase tracking-widest">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>EVERYDAY ANALOGY:</span>
                  </div>
                  <p className="text-xs sm:text-sm font-sans text-amber-950 italic font-medium leading-relaxed">
                    "{profile.layman.analogy}"
                  </p>
                </div>

                {/* 3. What Does This Layer Show You (Visual Insight) */}
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-sky-700 uppercase tracking-wider">
                    <Info className="w-3.5 h-3.5 text-sky-600" />
                    <span>WHAT THIS LAYER UNLOCKS:</span>
                  </div>
                  <p className="text-xs text-stone-700 font-sans leading-relaxed">
                    {profile.layman.whatAreWeSeeing}
                  </p>
                </div>

                {/* 4. Real-World Value on Earth */}
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>REAL-WORLD APPLICATION:</span>
                  </div>
                  <p className="text-xs text-stone-700 font-sans leading-relaxed">
                    {profile.layman.realWorldUse}
                  </p>
                </div>

                {/* 5. Golden Rule of Thumb */}
                <div className="px-3.5 py-2.5 rounded-xl bg-stone-100 border border-stone-200 text-[10.5px] font-mono text-stone-800 flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-[9px] text-stone-500">RULE OF THUMB:</span>
                  <span className="font-semibold text-amber-900">{profile.layman.ruleOfThumb}</span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SCIENTIFIC TELEMETRY & DECIBELS */}
            {activeTab === 'science' && profile.scientificProof && (
              <div className="flex flex-col gap-3.5 animate-in fade-in duration-200">
                {/* Real Scientific Data Proof Box */}
                <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-800 uppercase">
                      <Activity className="w-4 h-4 text-amber-600" />
                      <span>AUTHENTIC HDF5 CALIBRATION PROOF</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-[9px] font-mono text-emerald-800 uppercase font-bold">
                      VERIFIED NISAR DATA
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-xs font-mono">
                    {Object.entries(profile.scientificProof).map(([k, val]) => (
                      <div key={k} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col gap-0.5">
                        <span className="text-[9.5px] text-stone-500 uppercase tracking-wider">
                          {k.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-stone-900 font-semibold">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
