import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Users,
  Compass,
  Leaf,
  Trees,
  Sprout,
  Shield,
  Sparkles,
  Heart,
  Droplets,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Layers,
  MapPin,
  Waves,
  Zap,
  Lock,
  ArrowRight
} from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import Canopy3DCube from './Canopy3DCube';
import MinimalDualCurveGraph from './MinimalDualCurveGraph';
import PixelMatrixArtDisplay from './PixelMatrixArtDisplay';

// Verified Multi-Temporal NISAR Observation Months (Only genuine calibrated acquisitions)
const BANNI_ANNUAL_BIOMASS_DATA = [
  { month: 'JAN', primary: 6.2, secondary: 0.35, primaryDisplay: '6.2', secondaryDisplay: '0.3', phaseName: 'Winter Rest', narrative: 'Winter dormancy; dry residual halophyte grasses.' },
  { month: 'JUL', primary: 12.8, secondary: 0.75, primaryDisplay: '12.8', secondaryDisplay: '0.8', phaseName: 'Early Flush', narrative: 'Rapid vegetative flush; sweet grass stalks reach 0.8m.' },
  { month: 'AUG', primary: 21.4, secondary: 1.30, primaryDisplay: '21.4', secondaryDisplay: '1.3', phaseName: 'Monsoon Flush', narrative: 'Monsoon deluge crest; dense root mat stabilizes alluvial silt.' },
  { month: 'SEP', primary: 26.8, secondary: 1.65, primaryDisplay: '26.8', secondaryDisplay: '1.6', phaseName: 'Savanna Boom', narrative: 'Late monsoon savanna expansion across 2,500 km².' },
  { month: 'OCT', primary: 28.5, secondary: 1.80, primaryDisplay: '28.5', secondaryDisplay: '1.8', phaseName: 'Peak Biomass', narrative: 'Peak annual biomass harvest; 50,000 cattle graze without fences.' }
];

/**
 * 3D Interactive Bhunga Dot Matrix Component
 * Procedural point cloud representing a traditional circular Maldhari Bhunga hut.
 * Densely packed with over 6,800 tightly placed, glowing points occupying the whole space:
 * - Triple stepped concentric foundation plinth (Otta)
 * - Cylindrical rammed-mud wall (Kanthi) with authentic arched doorway & side jharokhas
 * - Inlaid sparkling Lipan mud-mirror diamond bands & starbursts
 * - Conical thatched roof (Chhatra) tapering up to a high apex (45° pitch)
 * - 16 radial timber rafters & crowning Kalash pinnacle
 * - Central supporting timber pillar (Thambha) visible within
 * - Smooth 360° interactive touch/mouse drag-to-rotate with idle rotation
 */
function Bhunga3DModel() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const angleYRef = useRef(0.0); // Exactly front-faced facing arched doorway
  const angleXRef = useRef(0.03); // Level eye-line elevation (not tilted forward)
  const animRef = useRef(null);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 700, height: 560 });

  // Dynamically observe container size to ensure 100% space occupation
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 50 && rect.height > 50) {
        setDimensions({
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Generate ultra-dense procedural points for the circular Bhunga (6,800+ points)
  const points = useMemo(() => {
    const pts = [];
    const rCylinder = 160;
    const wallHeight = 145;
    const numWallRings = 42;
    const dotsPerRing = 92;

    // 1. Triple Stepped Concentric Foundation Plinth (Otta) - 340 points
    for (let step = 0; step < 3; step++) {
      const plinthR = rCylinder + 32 - step * 10;
      const plinthY = -14 + step * 4.5;
      const count = 110;
      for (let i = 0; i < count; i++) {
        const theta = (i / count) * Math.PI * 2;
        pts.push({
          x: plinthR * Math.cos(theta),
          y: plinthY,
          z: plinthR * Math.sin(theta),
          type: 'base'
        });
      }
    }

    // 2. Rammed Earth Cylindrical Walls (Kanthi) with Arched Doorway & Jharokhas (~3,200 points)
    for (let ring = 0; ring < numWallRings; ring++) {
      const y = (ring / (numWallRings - 1)) * wallHeight;
      for (let i = 0; i < dotsPerRing; i++) {
        const theta = (i / dotsPerRing) * Math.PI * 2;

        // Front Arched Doorway (theta around 0 rad, y < 100)
        const isDoor = Math.abs(theta) < 0.22 && y < 100;
        // Two Side Jharokha Ventilation Openings
        const isWindow1 = Math.abs(theta - 1.57) < 0.16 && y > 52 && y < 92;
        const isWindow2 = Math.abs(theta + 1.57) < 0.16 && y > 52 && y < 92;

        if (isDoor || isWindow1 || isWindow2) continue;

        // Sparkling Lipan Mud-Mirror Bands (diamond accents along rings 8, 16, 24, 32)
        const isLipanBand = (ring === 8 || ring === 16 || ring === 24 || ring === 32) && i % 3 === 0;
        const isLipanDiamond = (ring === 12 || ring === 20 || ring === 28) && (i % 6 === 0 || i % 6 === 2);

        pts.push({
          x: rCylinder * Math.cos(theta),
          y,
          z: rCylinder * Math.sin(theta),
          type: (isLipanBand || isLipanDiamond) ? 'mirror' : 'wall'
        });
      }
    }

    // Timber Doorway Lintel & Doorposts
    for (let dy = 0; dy <= 100; dy += 4.5) {
      pts.push({ x: rCylinder * Math.cos(-0.22), y: dy, z: rCylinder * Math.sin(-0.22), type: 'post' });
      pts.push({ x: rCylinder * Math.cos(0.22), y: dy, z: rCylinder * Math.sin(0.22), type: 'post' });
    }
    for (let dth = -0.22; dth <= 0.22; dth += 0.025) {
      pts.push({ x: rCylinder * Math.cos(dth), y: 100, z: rCylinder * Math.sin(dth), type: 'post' });
    }

    // 3. Conical Thatched Roof (Chhatra) - Steep 45° Pitch (~2,700 points)
    const roofBaseY = wallHeight;
    const roofApexY = wallHeight + 195;
    const numRoofTiers = 50;

    for (let tier = 0; tier < numRoofTiers; tier++) {
      const alpha = tier / (numRoofTiers - 1);
      const y = roofBaseY + alpha * (roofApexY - roofBaseY);
      const r = (1 - alpha) * (rCylinder + 16);
      const count = Math.max(1, Math.round((r / rCylinder) * dotsPerRing));

      for (let i = 0; i < count; i++) {
        const theta = (i / count) * Math.PI * 2;
        pts.push({
          x: r * Math.cos(theta),
          y,
          z: r * Math.sin(theta),
          type: 'roof'
        });
      }
    }

    // 4. Roof Timber Rafters (16 Radial Rafter Ribs from Apex to Eaves - 384 points)
    for (let rIdx = 0; rIdx < 16; rIdx++) {
      const theta = (rIdx / 16) * Math.PI * 2;
      for (let step = 0; step < 24; step++) {
        const alpha = step / 23;
        const y = roofApexY - alpha * (roofApexY - roofBaseY);
        const r = alpha * (rCylinder + 16);
        pts.push({
          x: r * Math.cos(theta),
          y,
          z: r * Math.sin(theta),
          type: 'rafter'
        });
      }
    }

    // 5. Crown Timber Finial (Kalash Pinnacle at Apex)
    for (let ky = roofApexY; ky <= roofApexY + 28; ky += 3) {
      pts.push({ x: 0, y: ky, z: 0, type: 'kalash' });
      pts.push({ x: 4 * Math.cos(ky), y: ky, z: 4 * Math.sin(ky), type: 'kalash' });
    }

    // 6. Central Timber Pillar (Thambha) Visible within
    for (let y = 0; y < roofApexY; y += 4.5) {
      pts.push({ x: 0, y, z: 0, type: 'post' });
    }

    return pts;
  }, []);

  // Pointer dragging to rotate 360°
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    angleYRef.current += dx * 0.006;
    angleXRef.current = Math.max(-0.06, Math.min(0.24, angleXRef.current + dy * 0.0035));
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Set high-DPI display canvas
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    const render = () => {
      if (!isDraggingRef.current) {
        angleYRef.current += 0.0018; // Very subtle, gentle rotation keeping front perspective readable
      }

      const w = dimensions.width;
      const h = dimensions.height;
      const cx = w / 2;

      // Calibrate FOV and camera distance so the entire hut (plinth to Kalash apex) fits cleanly in frame
      const minDim = Math.min(w, h);
      const fov = minDim * 0.78;
      const cameraDistance = 470;
      const baseScale = fov / cameraDistance;

      // Midpoint of model is at y ≈ 165; center the model vertically with breathing room
      const cy = (h / 2 - 10) + 165 * baseScale;

      ctx.clearRect(0, 0, w, h);

      // Radial Perspective Floor Grid under foundation plinth
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.12)';
      ctx.lineWidth = 1;
      for (let g = -220; g <= 220; g += 40) {
        ctx.beginPath();
        ctx.moveTo(cx + g * 0.85, cy + 10);
        ctx.lineTo(cx + g * 1.45, cy + 85);
        ctx.stroke();
      }

      const cosY = Math.cos(angleYRef.current);
      const sinY = Math.sin(angleYRef.current);
      const cosX = Math.cos(angleXRef.current);
      const sinX = Math.sin(angleXRef.current);

      // Transform & Project Points
      const projected = points.map((p) => {
        let px = p.x;
        let py = p.y;
        let pz = p.z;

        // Y-axis rotation
        const rx = px * cosY - pz * sinY;
        const rz = px * sinY + pz * cosY;

        // X-axis tilt
        const ry = py * cosX - rz * sinX;
        const rdepth = rz * cosX + py * sinX + cameraDistance;

        const scale = fov / Math.max(10, rdepth);
        const screenX = cx + rx * scale;
        const screenY = cy - ry * scale;

        return {
          screenX,
          screenY,
          depth: rdepth,
          scale,
          type: p.type
        };
      });

      // Sort back-to-front for proper depth occlusion
      projected.sort((a, b) => b.depth - a.depth);

      // Render glowing tightly packed dots
      projected.forEach((dot) => {
        const radius = Math.max(1.1, 2.2 * dot.scale);
        ctx.beginPath();
        ctx.arc(dot.screenX, dot.screenY, radius, 0, Math.PI * 2);

        if (dot.type === 'mirror') {
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 8;
        } else if (dot.type === 'kalash') {
          ctx.fillStyle = '#fde68a';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 8;
        } else if (dot.type === 'roof') {
          ctx.fillStyle = '#f59e0b';
          ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
          ctx.shadowBlur = 2.5;
        } else if (dot.type === 'rafter') {
          ctx.fillStyle = '#d97706';
          ctx.shadowColor = 'rgba(217, 119, 6, 0.3)';
          ctx.shadowBlur = 1.5;
        } else if (dot.type === 'post') {
          ctx.fillStyle = '#78350f';
          ctx.shadowBlur = 0;
        } else if (dot.type === 'base') {
          ctx.fillStyle = '#78716c';
          ctx.shadowBlur = 0;
        } else {
          // Rammed earth cylindrical wall
          ctx.fillStyle = '#b45309';
          ctx.shadowColor = 'rgba(180, 83, 9, 0.4)';
          ctx.shadowBlur = 2;
        }
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [points, dimensions]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="relative w-full h-full min-h-[380px] sm:min-h-[460px] rounded-2xl bg-stone-950 border border-amber-900/40 overflow-hidden shadow-2xl flex items-center justify-center select-none cursor-grab active:cursor-grabbing touch-none"
    >
      <canvas
        ref={canvasRef}
        style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
        className="w-full h-full block"
      />

      {/* Top Overlay Badge */}
      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/85 backdrop-blur-md border border-amber-500/40 text-[9.5px] font-mono text-amber-300 font-bold flex items-center gap-1.5 shadow-md">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        <span>3D BHUNGA MATRIX &bull; 6,800+ DENSE POINTS &bull; 100% SCALE</span>
      </div>

      {/* Doorway & Dimensions Label */}
      <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-black/70 border border-white/10 text-[9px] font-mono text-stone-300">
        Ø 5.4m Base &bull; 4.9m Apex &bull; 45° Pitch
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-3 right-3 text-[9px] font-mono text-stone-400/90 bg-black/70 px-2.5 py-1 rounded-md border border-white/10">
        DRAG TO ROTATE 360° &bull; HOOP TENSION CYLINDER
      </div>
    </div>
  );
}

const FAUNA_PROFILES = [
  {
    id: 'flamingo',
    claimId: 'CLM_FAUNA_FLAMINGO_COLONY',
    tabTitle: 'GREATER FLAMINGO',
    shortTag: 'Colony ~500k',
    name: 'Greater Flamingo (Phoenicopterus roseus)',
    tag: 'COLONY HISTORICALLY ~500,000',
    habitat: 'Flamingo City & Khadir Island Brine Shallows',
    radarSignature: 'Specular Null (< -20.0 dB) maps protective shallow water barrier',
    photoSrc: '/assets/flamingos_sunset.png',
    glanceTag: 'FLAMINGO CITY BRINE SHALLOWS',
    fieldTruth: 'Elevated bedrock island (bet) surrounded by the hypersaline Rann. Post-monsoon floodwaters create an impassable 1.5-meter natural brine moat around Flamingo City, shielding 500,000 nesting flamingos from desert jackals and foxes.',
    bioFact:
      'Breeds on elevated mud mounds in the Great Rann. Dr. Salim Ali (1945) estimated the breeding colony at approximately half a million birds. Seasonal shallow brine (0.5 to 1.5 m, Gujarat Forest Dept) isolates the colony, preventing terrestrial predators like jackals and desert foxes from raiding the mounds.',
    suggestedImages: 'Search: "Greater Flamingo Rann of Kutch Flamingo City"'
  },
  {
    id: 'khur',
    claimId: 'CLM_FAUNA_KHUR_CENSUS',
    tabTitle: 'INDIAN WILD ASS',
    shortTag: 'Khur (7,672 Head)',
    name: 'Indian Wild Ass (Equus hemionus khur / Ghudkhur)',
    tag: '7,672 INDIVIDUALS (2024 CENSUS)',
    habitat: 'Saline Mudflats & Southern Savanna Fringes',
    radarSignature: 'Cross-Polarized HV (-21.0 dB) over halophyte pastures',
    photoSrc: '/assets/wild_ass_herd.jpg',
    glanceTag: 'ENDANGERED GHUDKHUR HERD',
    fieldTruth: 'Official 2024 census documented 7,672 Indian Wild Asses (Ghudkhur) across 15,510 km². They can sprint up to 50 km/h across slick salt crusts and graze on Banni halophyte sweet grass corridors without fences.',
    bioFact:
      'Can sprint up to 50 km/h across slick salt crusts. The 2024 official census counted 7,672 individuals across 15,510 km² (up from 6,082 in 2020, Gujarat Forest Dept). Protected under Schedule I of the Wildlife (Protection) Act, 1972; IUCN status: Near Threatened.',
    suggestedImages: 'Search: "Indian Wild Ass Little Rann of Kutch Khur galloping"'
  },
  {
    id: 'fox',
    claimId: 'CLM_FAUNA_DESERT_FOX',
    tabTitle: 'DESERT FOX',
    shortTag: 'Nocturnal Stalker',
    name: 'White-Footed Desert Fox (Vulpes vulpes pusilla)',
    tag: 'NOCTURNAL CARNIVORE',
    habitat: 'Banni Dune Fringes & Dry Halite Polygons',
    radarSignature: 'Dry Crust Transparency; tracks natural water boundaries',
    photoSrc: '/assets/desert_fox.jpg',
    glanceTag: 'WHITE-FOOTED DESERT FOX ON DUNES',
    fieldTruth: 'Nocturnal desert carnivore (Vulpes vulpes pusilla) resting on desert sand at twilight. Prowls sandy dune fringes and saline scrub for desert gerbils and reptiles; deterred by seasonal water channels.',
    bioFact:
      'Prowls dry salt margins for desert gerbils and reptiles. Deterred by seasonal shallow water channels, which preserves avian nesting colonies on Khadir Bet.',
    suggestedImages: 'Search: "White footed desert fox Kutch wildlife"'
  },
  {
    id: 'lizard',
    claimId: 'CLM_FAUNA_SPINY_TAILED_LIZARD',
    tabTitle: 'SPINY-TAILED LIZARD',
    shortTag: 'Keystone Herbivore',
    name: 'Indian Spiny-Tailed Lizard (Saara hardwickii)',
    tag: 'KEYSTONE HERBIVORE',
    habitat: 'Saline Silt Beds & Clay Flats',
    radarSignature: 'Surface Roughness (s = 1.8 cm) altered by dense colony burrowing',
    photoSrc: '/assets/spiny_tailed_lizard.png',
    glanceTag: 'SPINY-TAILED LIZARD COLONY MOUND',
    fieldTruth: 'Indian Spiny-Tailed Lizard (Saara hardwickii) alert on an earthen mound. Digs sloping burrows up to 2 meters deep in tough saline mud, aerating clay soil and feeding exclusively on native grass shoots (Dichanthium, Cenchrus).',
    bioFact:
      'Digs sloping burrows up to 2 meters deep in tough saline mud. Lives in dense social colonies and feeds on native grass shoots (Dichanthium, Cenchrus).',
    suggestedImages: 'Search: "Spiny tailed lizard Kutch Banni grasslands"'
  }
];

export default function SavannaLivingSyncJourney({
  onProceedToReflection,
  activeStationIdx,
  onStationChange
}) {
  const [stationIdx, setInternalStationIdx] = useState(activeStationIdx !== undefined ? activeStationIdx : 0);
  const [visitedStations, setVisitedStations] = useState(new Set([0]));
  const [canopyHeight, setCanopyHeight] = useState(2.5); // 0.2m, 0.8m, 1.6m, 2.5m
  const [activeFaunaIdx, setActiveFaunaIdx] = useState(0);
  const [bhungaMode, setBhungaMode] = useState('matrix'); // 'matrix' | '3d'
  const [faunaViewMode, setFaunaViewMode] = useState('pixel'); // 'pixel' | 'radar'

  // Sync with parent station state if provided
  useEffect(() => {
    if (activeStationIdx !== undefined && activeStationIdx !== stationIdx) {
      setInternalStationIdx(activeStationIdx);
      setVisitedStations((prev) => new Set([...prev, activeStationIdx]));
    }
  }, [activeStationIdx]);

  // Maintain ambient soundtrack in sync across data pages
  useEffect(() => {
    soundEngine.playBreathOfTheRann(0.24);
  }, []);

  const handleSelectStation = (idx) => {
    try { soundEngine.playClick(); } catch (e) { }
    setInternalStationIdx(idx);
    setVisitedStations((prev) => new Set([...prev, idx]));
    if (onStationChange) onStationChange(idx);
  };

  const handleNext = () => {
    try { soundEngine.playTransitionSound(); } catch (e) { }
    if (stationIdx < 2) {
      const nextIdx = stationIdx + 1;
      setInternalStationIdx(nextIdx);
      setVisitedStations((prev) => new Set([...prev, nextIdx]));
      if (onStationChange) onStationChange(nextIdx);
    }
  };

  const handlePrev = () => {
    try { soundEngine.playClick(); } catch (e) { }
    if (stationIdx > 0) {
      const prevIdx = stationIdx - 1;
      setInternalStationIdx(prevIdx);
      if (onStationChange) onStationChange(prevIdx);
    }
  };

  const allVisited = visitedStations.size >= 3;

  // Station 01 Dynamic SAR Layer tied to 4-Tier Canopy Slicer
  const canopyData = useMemo(() => {
    if (canopyHeight >= 2.0) {
      return {
        levelId: 'L1',
        levelName: 'LEVEL 01: TREE CROWN & BUSH CANOPY',
        heightLabel: '2.5m Tree Crown',
        elevationM: '2.5m',
        depthMm: '0 cm',
        biomassMgHa: '28.5',
        grazingCapacity: '1.8 Cows/ha',
        backscatterDb: '-21.03 dB',
        polarization: 'Cross-Pol HV',
        image: '/assets/layers/nisar_october_hv_true.webp',
        channel: 'Cross-Polarized HV Volume Scatter (-21.03 dB)',
        biomassModel: '< 40-60 Mg/ha Saturation',
        scatterType: 'Volume Scattering',
        ratioDb: '+7.25 dB',
        whatItMeans:
          'Leaves and tangled tree twigs depolarize 24cm microwaves, twisting horizontal pulses into vertical echoes. The brighter the glow, the heavier the cattle fodder biomass.',
        everydayTakeaway:
          'Measures canopy leaf volume and forage density across ~2,618 km² of Banni savanna.'
      };
    } else if (canopyHeight >= 1.2) {
      return {
        levelId: 'L2',
        levelName: 'LEVEL 02: MID-STALK SAVANNA GRASS',
        heightLabel: '1.6m Mid-Stalk',
        elevationM: '1.6m',
        depthMm: '12 cm',
        biomassMgHa: '19.8',
        grazingCapacity: '1.3 Cows/ha',
        backscatterDb: '+7.25 dB',
        polarization: 'Dual-Pol Ratio (HH/HV)',
        image: '/assets/layers/nisar_october_polarimetric_ratio_true.webp',
        channel: 'Dual-Pol Ratio Matrix (HH / HV = +7.25 dB)',
        biomassModel: 'Herbaceous Decoupling',
        scatterType: 'Multiple Bounce',
        ratioDb: '+7.25 dB',
        whatItMeans:
          'Compares trunk specular bounce to volume leaf flutter. Mathematically isolates native sweet grasses from dense woody invasive shrubs.',
        everydayTakeaway:
          'Separates soft edible cow grass from prickly invasive Gando Baval bushes.'
      };
    } else if (canopyHeight >= 0.5) {
      return {
        levelId: 'L3',
        levelName: 'LEVEL 03: ROOT ZONE & HALOPHYTE STEMS',
        heightLabel: '0.8m Root Zone',
        elevationM: '0.8m',
        depthMm: '24 cm',
        biomassMgHa: '11.2',
        grazingCapacity: '0.8 Cows/ha',
        backscatterDb: '-23.45 dB',
        polarization: 'Cross-Pol HV',
        image: '/assets/layers/nisar_october_hv_true.webp',
        channel: 'Root Zone Depolarization (HV = -23.45 dB)',
        biomassModel: 'Fibrous Root Mat',
        scatterType: 'Dihedral / Volume',
        ratioDb: '+9.67 dB',
        whatItMeans:
          'Microwaves probe the dense fibrous root mat of perennial grasses holding sandy alluvial soils against post-monsoon wind erosion.',
        everydayTakeaway:
          'Detects living perennial grass root networks that anchor alluvial soil and prevent sandstorms.'
      };
    } else {
      return {
        levelId: 'L4',
        levelName: 'LEVEL 04: DIRECT SOIL SURFACE & DESICCATED SILT',
        heightLabel: '0.2m Ground Silt',
        elevationM: '0.2m',
        depthMm: '38 cm',
        biomassMgHa: '4.5',
        grazingCapacity: '0.3 Cows/ha',
        backscatterDb: '-13.78 dB',
        polarization: 'Co-Pol HH',
        image: '/assets/layers/nisar_october_hh_true.webp',
        channel: 'Co-Polarized Surface Reflectance (HH = -13.78 dB)',
        biomassModel: 'Surface Soil Model',
        scatterType: 'Surface Reflectance',
        ratioDb: '+10.98 dB',
        whatItMeans:
          '24cm microwaves pierce right past dried grass blades down to bare silt mud, measuring subsoil residual moisture and halite crystallization without leaf obstruction.',
        everydayTakeaway:
          'X-rays straight through dried grass to check if the soil underneath is damp or bone-dry.'
      };
    }
  }, [canopyHeight]);

  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between overflow-hidden bg-[#FAF8F5] text-stone-900 select-none">

      {/* MAIN INTERACTIVE OBSERVATORY (Unified Single Header, Zero Redundant Top Bars or Checklists) */}
      <div className="w-full flex-1 min-h-0 max-w-[1580px] mx-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch overflow-hidden">

        {/* ========================================================
            LEFT COLUMN (6 cols): 100% VISUAL & INTERACTIVE STAGE
            (Images, 3D point cloud animations, and interactive controls ONLY)
        ======================================================== */}
        <div className="lg:col-span-6 flex flex-col justify-between p-4 rounded-3xl bg-white border border-stone-200 shadow-xl overflow-hidden gap-3 text-left">

          {/* ----------------------------------------------------
              STATION 01: 3D VOLUMETRIC CANOPY PENETRATION CUBE
              Interactive 3D glass cube visually demonstrating 24cm microwave
              penetration from tree crowns down to hidden subsoil roots!
          ---------------------------------------------------- */}
          {stationIdx === 0 && (
            <div className="flex flex-col h-full justify-between gap-3">

              {/* 3D Volumetric Cube (Interactive 360° with Slicer) */}
              <div className="relative flex-1 w-full min-h-[350px] sm:min-h-[390px] rounded-2xl overflow-hidden shadow-2xl">
                <Canopy3DCube
                  canopyHeight={canopyHeight}
                  onHeightChange={setCanopyHeight}
                />
              </div>

              {/* 4 Quantitative Telemetry Data Boxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/90 shadow-sm">
                  <span className="text-[8.5px] text-emerald-800 block uppercase font-bold">BIOMASS MODEL</span>
                  <strong className="text-xs sm:text-sm text-stone-900 font-extrabold">{canopyData.biomassModel}</strong>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/90 shadow-sm">
                  <span className="text-[8.5px] text-emerald-800 block uppercase font-bold">HV VOLUME SCATTER</span>
                  <strong className="text-xs sm:text-sm text-stone-900 font-extrabold">-21.03 dB</strong>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/90 shadow-sm">
                  <span className="text-[8.5px] text-emerald-800 block uppercase font-bold">HH / HV RATIO</span>
                  <strong className="text-xs sm:text-sm text-stone-900 font-extrabold">{canopyData.ratioDb}</strong>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/90 shadow-sm">
                  <span className="text-[8.5px] text-emerald-800 block uppercase font-bold">SCATTERING REGIME</span>
                  <strong className="text-xs sm:text-sm text-emerald-800 font-extrabold">{canopyData.scatterType}</strong>
                </div>
              </div>

            </div>
          )}

          {/* ----------------------------------------------------
              STATION 02: DENSE 3D BHUNGA & COLORFUL LED MATRIX
          ---------------------------------------------------- */}
          {stationIdx === 1 && (
            <div className="flex flex-col h-full justify-between gap-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-stone-200">
                <span className="text-xs font-mono font-bold uppercase text-amber-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-600 animate-pulse" />
                  <span>TRADITIONAL BHUNGA &bull; MUD ARCHITECTURE</span>
                </span>

                {/* View Mode Toggle: Colorful LED Matrix vs 3D Turntable */}
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-stone-100 border border-stone-200">
                  <button
                    onClick={() => {
                      try { soundEngine.playClick(); } catch (e) { }
                      setBhungaMode('matrix');
                    }}
                    className={`px-2 py-0.5 rounded-md text-[9.5px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${bhungaMode === 'matrix'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                      }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>COLORFUL LED MATRIX</span>
                  </button>
                  <button
                    onClick={() => {
                      try { soundEngine.playClick(); } catch (e) { }
                      setBhungaMode('3d');
                    }}
                    className={`px-2 py-0.5 rounded-md text-[9.5px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${bhungaMode === '3d'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                      }`}
                  >
                    <Compass className="w-3 h-3" />
                    <span>3D TURNTABLE</span>
                  </button>
                </div>
              </div>

              {/* Viewport: Renders either the Interactive Colorful LED Matrix or 3D Structural Point Model */}
              <div className="relative flex-1 w-full min-h-[360px] sm:min-h-[440px] rounded-2xl overflow-hidden bg-stone-950 border border-amber-900/40 shadow-2xl flex items-center justify-center">
                {bhungaMode === 'matrix' ? (
                  <PixelMatrixArtDisplay
                    initialSubject="bhunga"
                    showSubjectSelector={false}
                  />
                ) : (
                  <Bhunga3DModel />
                )}
              </div>

              {/* Interaction Guide */}
              <div className="px-3 py-1.5 rounded-xl bg-amber-50/90 border border-amber-200/80 flex items-center justify-between text-[10px] font-mono text-amber-900">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                  <span>
                    {bhungaMode === 'matrix'
                      ? 'TOUCH OR HOVER TO TRIGGER MAGNETIC PARTICLE RIPPLE'
                      : 'TOUCH OR DRAG TO ROTATE 360°'}
                  </span>
                </span>
                <span className="text-stone-500 font-sans italic hidden sm:inline">
                  Continuous circular perimeter dissipates lateral seismic shear into perimeter hoop tension
                </span>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              STATION 03: WILDLIFE & FAUNA SPOTLIGHT (COLORFUL LED MATRIX)
          ---------------------------------------------------- */}
          {stationIdx === 2 && (
            <div className="flex flex-col h-full justify-between gap-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-stone-200">
                <span className="text-xs font-mono font-bold uppercase text-sky-900 flex items-center gap-2">
                  <Waves className="w-4 h-4 text-sky-600 animate-pulse" />
                  <span>WILDLIFE IN HARMONY &bull; KHADIR ISLAND &amp; DESERT FAUNA</span>
                </span>

                {/* Spectrum LED Status Badge (Radar Swath removed per user preference) */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-300 font-mono text-[9.5px] font-bold">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  <span>8,960 SPECTRUM BEADS</span>
                </div>
              </div>

              {/* Species Tabs: Proper legible titles & subtitles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {FAUNA_PROFILES.map((f, fIdx) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      try { soundEngine.playClick(); } catch (e) { }
                      setActiveFaunaIdx(fIdx);
                    }}
                    className={`p-2 sm:p-2.5 rounded-xl text-left font-mono transition-all cursor-pointer border flex flex-col justify-between gap-0.5 ${activeFaunaIdx === fIdx
                      ? 'bg-sky-600 text-white border-sky-400 shadow-sm font-bold ring-2 ring-sky-400/40'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                  >
                    <div className="font-bold text-[10px] sm:text-[11px] leading-tight truncate">{f.tabTitle}</div>
                    <div className={`text-[8.5px] truncate ${activeFaunaIdx === fIdx ? 'text-sky-100' : 'text-stone-500'}`}>{f.shortTag}</div>
                  </button>
                ))}
              </div>

              {/* Viewport: Interactive Colorful 8,960-Bead LED Matrix */}
              <div className="relative flex-1 min-h-[300px] sm:min-h-[360px] rounded-2xl overflow-hidden border border-stone-300 shadow-xl bg-stone-950 flex flex-col">
                <PixelMatrixArtDisplay
                  initialSubject={FAUNA_PROFILES[activeFaunaIdx]?.id || 'flamingo'}
                  showSubjectSelector={false}
                  onSubjectChange={(id) => {
                    const idx = FAUNA_PROFILES.findIndex(
                      (p) => p.id === id || (p.id === 'khur' && id === 'wild_ass') || (p.id === 'fox' && id === 'desert_fox')
                    );
                    if (idx !== -1) setActiveFaunaIdx(idx);
                  }}
                />
              </div>

              {/* Visual Radar Telemetry Indicator */}
              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-[10px] font-mono text-sky-900 flex items-center justify-between">
                <span>TARGET COORDINATES: 23.85°N, 70.32°E &bull; KHADIR CORRIDOR</span>
                <span className="font-bold text-sky-700">SPECULAR NULL &bull; MOAT INTACT</span>
              </div>
            </div>
          )}

        </div>

        {/* ========================================================
            RIGHT COLUMN (6 cols): 100% TEXT, DATA & LIVING SYNC DOSSIER
            (All quantitative data, physical explainers, and narratives)
        ======================================================== */}
        <div className="lg:col-span-6 flex flex-col justify-between p-4 sm:p-5 rounded-3xl bg-white border border-stone-200 shadow-xl overflow-y-auto max-h-[calc(100vh-140px)] gap-3 text-left">

          {/* Eyebrow and Main Title */}
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-amber-800 uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
              <span>STATION 0{stationIdx + 1} OF 03</span>
              <span className="text-stone-300">&bull;</span>
              <span className="text-stone-600">
                {stationIdx === 0
                  ? 'ACTIVE 24CM RADAR EYE'
                  : stationIdx === 1
                    ? 'INDIGENOUS CIVILIZATION'
                    : 'AVIAN & MAMMALIAN SANCTUARY'}
              </span>
            </div>
            <h2 className="font-['Cinzel',serif] text-base sm:text-lg md:text-xl font-bold text-stone-900 uppercase leading-snug">
              {stationIdx === 0
                ? 'THE CANOPY PENETRATION & BIOMASS SCALE'
                : stationIdx === 1
                  ? 'MALDHARI PASTORALISTS & EARTHQUAKE-PROOF BHUNGAS'
                  : 'FLAMINGO CITY & THE ENDANGERED GHUDKHUR'}
            </h2>
            <p className="text-xs sm:text-sm font-sans text-stone-600 font-normal mt-0.5">
              {stationIdx === 0
                ? 'How 24cm Microwaves Weigh Desert Grass From 747 km in Orbit'
                : stationIdx === 1
                  ? '600 Years of Rotational Pastoralism Without Fences'
                  : 'Nature’s Protective Water Moats Around Khadir Island'}
            </p>
          </div>

          {/* ----------------------------------------------------
              LEVEL SWITCHER OPTIONS & 24CM RADAR LAB CONSOLE (Station 01 Right Panel)
          ---------------------------------------------------- */}
          {stationIdx === 0 && (
            <div className="flex flex-col gap-2.5">

              {/* 4-Tier Interactive Strata Selector Deck */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { val: 2.5, id: 'L1', Icon: Leaf, title: 'TREE CROWN', elev: '2.5m', pol: 'HV Volume' },
                  { val: 1.6, id: 'L2', Icon: Trees, title: 'GRASS STALKS', elev: '1.6m', pol: 'Dual-Pol' },
                  { val: 0.8, id: 'L3', Icon: Layers, title: 'WOODY STEMS', elev: '0.8m', pol: 'Dihedral' },
                  { val: 0.2, id: 'L4', Icon: Sprout, title: 'SUBSOIL SILT', elev: '0.2m', pol: 'Co-Pol HH' }
                ].map((preset) => {
                  const isMatch = Math.abs(canopyHeight - preset.val) < 0.25;
                  const IconComp = preset.Icon;
                  return (
                    <button
                      key={preset.val}
                      onClick={() => {
                        try { soundEngine.playClick(); } catch (e) { }
                        setCanopyHeight(preset.val);
                      }}
                      className={`p-2 rounded-xl text-left font-mono transition-all cursor-pointer border flex flex-col justify-between gap-1 shadow-sm ${isMatch
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-400 ring-2 ring-emerald-400/40 shadow-md'
                        : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700'
                        }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${isMatch ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'}`}>{preset.id}</span>
                        <span className={`text-[8.5px] font-bold ${isMatch ? 'text-emerald-100' : 'text-emerald-700'}`}>{preset.elev}</span>
                      </div>
                      <div className="font-bold text-[10.5px] truncate flex items-center gap-1">
                        <IconComp className="w-3 h-3 shrink-0" />
                        <span>{preset.title}</span>
                      </div>
                      <div className={`text-[8px] truncate ${isMatch ? 'text-emerald-100/90' : 'text-stone-400'}`}>{preset.pol}</div>
                    </button>
                  );
                })}
              </div>

              {/* High-Tech 24cm Radar Laboratory Console */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-emerald-900/40 text-white shadow-xl flex flex-col sm:flex-row items-center gap-3">
                {/* Visual Radar Swath Channel with Scanline Reticle */}
                <div className="relative w-full sm:w-28 h-20 sm:h-24 rounded-xl overflow-hidden border border-emerald-500/40 shrink-0 bg-stone-900 shadow-md group">
                  <img
                    src={canopyData.image}
                    alt={canopyData.levelName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-emerald-950/20" />
                  <div className="absolute top-1 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[7.5px] font-mono text-emerald-300 font-bold border border-emerald-500/30">
                    NISAR L-BAND
                  </div>
                  <div className="absolute bottom-1 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[7.5px] font-mono text-stone-300">
                    &lambda; 24cm
                  </div>
                </div>

                {/* Real-Time Quantitative Radar Diagnostics */}
                <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-4 gap-2 text-left font-mono">
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-white/10">
                    <span className="text-[7.5px] text-stone-400 block uppercase font-bold">RADAR RETURN</span>
                    <strong className="text-xs sm:text-sm text-emerald-400 font-extrabold">{canopyData.backscatterDb}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-white/10">
                    <span className="text-[7.5px] text-stone-400 block uppercase font-bold">PENETRATION</span>
                    <strong className="text-xs sm:text-sm text-amber-400 font-extrabold">{canopyData.depthMm}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-white/10">
                    <span className="text-[7.5px] text-stone-400 block uppercase font-bold">FORAGE DENSITY</span>
                    <strong className="text-xs sm:text-sm text-white font-extrabold">{canopyData.biomassMgHa} Mg/ha</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-white/10">
                    <span className="text-[7.5px] text-stone-400 block uppercase font-bold">GRAZING HEAD</span>
                    <strong className="text-xs sm:text-sm text-teal-300 font-extrabold">{canopyData.grazingCapacity.split(' ')[0]} cows/ha</strong>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ----------------------------------------------------
              NATURAL GLANCE • REAL-WORLD GROUND TRUTH (IRL)
              (Station 01 retains authentic field ground truth; Stations 02, 03, 04 keep clean telemetry focus)
          ---------------------------------------------------- */}
          {stationIdx === 0 && (
            <div className="rounded-2xl overflow-hidden border border-emerald-200/90 shadow-sm bg-stone-900 group relative">
              <img
                src="/assets/wild_ass_herd.jpg"
                alt="Banni Grassland and Wild Ass Herd"
                className="w-full h-32 sm:h-36 object-cover object-center group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white font-mono text-[9px] font-bold flex items-center gap-1.5 shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>NATURAL GLANCE &bull; BANNI SAVANNA ECOSYSTEM (IRL)</span>
              </div>
              <div className="p-2.5 bg-stone-900/95 text-stone-200 border-t border-white/10 text-[10.5px] font-sans leading-snug">
                <strong className="text-emerald-400 font-mono">FIELD TRUTH: </strong>
                Vast 2,500 km² tropical savanna of Kutch. Native Desmostachya grasses flourish alongside thorny Acacia nilotica trees, providing forage for over 50,000 free-roaming indigenous cattle and endangered Indian Wild Asses (Khur) without fences.
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              DATA & METRICS SECTION (100% VERIFIED SCIENTIFIC TELEMETRY)
          ---------------------------------------------------- */}
          {stationIdx === 0 && (
            <div className="pt-1">
              <MinimalDualCurveGraph
                data={BANNI_ANNUAL_BIOMASS_DATA}
                primaryKey="primary"
                secondaryKey="secondary"
                primaryLabel="SAVANNA BIOMASS (Mg/ha)"
                secondaryLabel="PASTORAL GRAZING CAPACITY (Cows/ha)"
                primaryUnit="Mg/ha"
                secondaryUnit="Cows/ha"
                primaryColor="#10B981"
                secondaryColor="#F59E0B"
                height={115}
              />
            </div>
          )}

          {stationIdx === 1 && (
            <div data-claim-id="CLM_BHUNGA_NICEE_SEISMIC" className="grid grid-cols-4 gap-1.5 text-center font-mono">
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 shadow-sm">
                <span className="text-[8.5px] text-amber-800 block uppercase font-bold">SEISMIC COLLAPSE</span>
                <strong className="text-xs sm:text-sm text-emerald-700 font-extrabold">0%</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 shadow-sm">
                <span className="text-[8.5px] text-amber-800 block uppercase font-bold">SHEAR CORNERS</span>
                <strong className="text-xs sm:text-sm text-stone-900 font-extrabold">0 (Zero)</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 shadow-sm">
                <span className="text-[8.5px] text-amber-800 block uppercase font-bold">HOOP TENSION</span>
                <strong className="text-xs sm:text-sm text-amber-900 font-extrabold">360°</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 shadow-sm">
                <span className="text-[8.5px] text-amber-800 block uppercase font-bold">PASSIVE MASS</span>
                <strong className="text-xs sm:text-sm text-stone-900 font-extrabold">Thick Mud</strong>
              </div>
            </div>
          )}

          {stationIdx === 2 && (
            <div data-claim-id="CLM_FAUNA_TELEMETRY" className="grid grid-cols-4 gap-1.5 text-center font-mono">
              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 shadow-sm">
                <span className="text-[8.5px] text-sky-800 block uppercase font-bold">FLAMINGOS</span>
                <strong className="text-xs sm:text-sm text-sky-950 font-extrabold">~500k</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 shadow-sm">
                <span className="text-[8.5px] text-sky-800 block uppercase font-bold">WATER BARRIER</span>
                <strong className="text-xs sm:text-sm text-sky-950 font-extrabold">0.5 - 1.5m</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 shadow-sm">
                <span className="text-[8.5px] text-sky-800 block uppercase font-bold">RADAR NULL</span>
                <strong className="text-xs sm:text-sm text-emerald-700 font-extrabold">&lt; -20.0 dB</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 shadow-sm">
                <span className="text-[8.5px] text-sky-800 block uppercase font-bold">WILD ASS KHUR</span>
                <strong className="text-xs sm:text-sm text-amber-800 font-extrabold">7,672 Head</strong>
              </div>
            </div>
          )}

          {/* Layman Analogy & Everyday Insight */}
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/90 shadow-sm flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-900 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>IN SIMPLE WORDS (FOR ANYONE):</span>
            </div>
            <p className="text-xs sm:text-sm font-sans text-amber-950 italic leading-relaxed">
              {stationIdx === 0
                ? '“Optical cameras see only a blur of green leaves. NISAR shoots 24 cm microwaves that plunge directly through tree crowns and grass stalks, measuring the exact weight of cattle feed across 2,500 square kilometers.”'
                : stationIdx === 1
                  ? '“Maldharis do not own private land deeds. They manage the entire savanna as a shared commons. Their circular mud homes survived the devastating 2001 Gujarat earthquake while modern concrete buildings collapsed.”'
                  : '“Half a million flamingos raise vulnerable chicks on mud pillars in the Great Rann. They survive because temporary floodwaters form an impassable moat around Khadir Island, keeping jackals and predators away.”'}
            </p>
          </div>

          {/* Detailed Explainer Text Card */}
          {stationIdx === 0 && (
            <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col gap-1 text-[11.5px]">
              <div className="text-[10px] font-mono font-bold text-emerald-950 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>LABELED MICROWAVE EXPLAINER:</span>
              </div>
              <p className="text-stone-800 font-sans leading-snug">
                <strong className="text-emerald-900">{canopyData.whatItMeans}</strong>
              </p>
              <div className="text-[10.5px] text-emerald-900 italic font-sans bg-white/80 p-1.5 rounded-xl border border-emerald-100">
                Takeaway: &ldquo;{canopyData.everydayTakeaway}&rdquo;
              </div>
            </div>
          )}

          {stationIdx === 1 && (
            <div data-claim-id="CLM_BHUNGA_NICEE_SEISMIC" className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200 flex flex-col gap-1 text-[11.5px]">
              <div className="text-[10px] font-mono font-bold text-amber-950 uppercase flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-700" />
                <span>SEISMIC WAVE DISSIPATION & THERMAL MASS:</span>
              </div>
              <p className="text-stone-800 font-sans leading-snug">
                In the 2001 Bhuj Mw 7.6–7.7 earthquake, field investigations documented 0% structural collapse of circular Bhungas (NICEE / IIT Kanpur 2012). The circular cylinder eliminates stress concentrations at corners, distributing lateral ground motion into continuous perimeter hoop tension.
              </p>
              <div className="text-[10.5px] text-amber-950 italic font-sans bg-white/80 p-1.5 rounded-xl border border-amber-200">
                Maldhari Wisdom: Built from local clay, dung, and thatch—corner-free hoop tension prevents earthquake collapse, while thick mud walls provide passive thermal mass.
              </div>
            </div>
          )}

          {stationIdx === 2 && (
            <div data-claim-id="CLM_FAUNA_SPOTLIGHT" className="p-3 rounded-2xl bg-sky-50/80 border border-sky-200 flex flex-col gap-1.5 text-[11.5px]">
              <div className="flex items-center justify-between">
                <h4 className="font-['Cinzel',serif] text-sm font-bold text-sky-950">
                  {FAUNA_PROFILES[activeFaunaIdx].name}
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-mono text-[9px] font-bold">
                  {FAUNA_PROFILES[activeFaunaIdx].tag}
                </span>
              </div>
              <p className="text-stone-800 font-sans leading-snug">
                {FAUNA_PROFILES[activeFaunaIdx].bioFact}
              </p>
            </div>
          )}

          {/* 2 Deep Ecological & Cultural Sync Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold text-stone-800 uppercase">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  {stationIdx === 0
                    ? 'Why 24cm Waves Pierce Foliage'
                    : stationIdx === 1
                      ? 'Bhungas: Seismic Architecture'
                      : 'The Radar Moat Sentry'}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 font-sans leading-relaxed">
                {stationIdx === 0
                  ? 'Visible sunlight has tiny wavelengths that scatter off the first leaf they touch. NISAR’s 24 cm wave is longer than leaves, effortlessly penetrating to tree trunks and soil.'
                  : stationIdx === 1
                    ? 'Crafted from clay, dung, and thatch, traditional circular Bhungas dissipate seismic shockwaves evenly, preventing structural shear failure.'
                    : 'Calm water appears pitch-black on radar (< -22 dB). NISAR monitors the exact boundary of the protective moat around Flamingo City, alerting rangers if water dries early.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold text-stone-800 uppercase">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  {stationIdx === 0
                    ? 'The Cross-Polarization Twist'
                    : stationIdx === 1
                      ? 'Guiding Pastoral Panchayats'
                      : 'The Endangered Khur'}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 font-sans leading-relaxed">
                {stationIdx === 0
                  ? 'Bouncing radar waves off tangled twigs twists horizontal pulses into vertical echoes. The more lush the vegetation, the stronger this twisted echo.'
                  : stationIdx === 1
                    ? 'By mapping pasture biomass through clouds, radar informs herder panchayats which grazing corridors are lush, preventing pasture overgrazing.'
                    : 'Roaming the saline fringes at up to 50 km/h, the endangered Indian Wild Ass survives on brackish halophytes that would sicken normal horses.'}
              </p>
            </div>
          </div>

          {/* Bottom Topic Status Bar */}
          <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span className="text-[11px] font-mono font-bold text-stone-700 uppercase">
                {visitedStations.size} OF 3 TOPICS EXPLORED &bull; {stationIdx === 2 ? 'READY FOR CLIMATE REFLECTION' : `NEXT: 0${stationIdx + 2}`}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono text-stone-500">
              {[0, 1, 2].map((idx) => (
                <span
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${stationIdx === idx
                    ? 'bg-amber-600 ring-2 ring-amber-300'
                    : visitedStations.has(idx)
                      ? 'bg-emerald-500'
                      : 'bg-stone-300'
                    }`}
                />
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
