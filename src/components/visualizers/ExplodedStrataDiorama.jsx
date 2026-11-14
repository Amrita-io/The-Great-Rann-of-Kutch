import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Layers,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  Radio,
  Eye,
  Info
} from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import DedicatedLayerInspectionView from './DedicatedLayerInspectionView';

/**
 * ExplodedStrataDiorama
 * 
 * 100% scientifically authentic NISAR L-Band (24cm) SAR 3D Strata Stack.
 * Directly visualizes raw calibrated HDF5 matrices from the NISAR Data folder:
 * - Layer 01: The Water & Flood Detector (HH Co-Polarization)
 * - Layer 02: The Living Plant & Biomass Gauge (HV Cross-Polarization)
 * - Layer 03: The Smart Land Classifier (Dual-Pol Ratio Matrix HH/HV)
 * 
 * Key User Experience Upgrades:
 * - Centered Content Title & Description in header (no corner cramming).
 * - Real-time 3D projected SVG leader lines connecting slabs to cards (no floating stubs).
 * - Zero-jargon layman descriptions accessible to all ages and backgrounds.
 * - Light theme palette (#FAF8F5, #FFFFFF, #1C1917, #D97706).
 * - Stable, drift-free manual rotation with one-click reset.
 */
export default function ExplodedStrataDiorama({
  season = 'winter',
  onProceedToNext,
  activeInspectedLayer: externalInspectedLayer,
  setActiveInspectedLayer: externalSetInspectedLayer
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [internalInspectedLayer, setInternalInspectedLayer] = useState(null);
  const activeInspectedLayer = externalInspectedLayer !== undefined ? externalInspectedLayer : internalInspectedLayer;
  const setActiveInspectedLayer = externalSetInspectedLayer || setInternalInspectedLayer;
  const [hoveredLayerIndex, setHoveredLayerIndex] = useState(null);
  const [isRotating3D, setIsRotating3D] = useState(false);

  // Play Breath of the Rann ambient audio quietly on mount and whenever in 3D stack
  useEffect(() => {
    soundEngine.playBreathOfTheRann(0.12);
  }, [activeInspectedLayer]);

  const mountRef = useRef(null);
  const stageRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const strataGroupRef = useRef(null);
  const layerMeshesRef = useRef([]);
  const animFrameIdRef = useRef(null);
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  // Dynamic SVG Leader Line Refs for 60fps real-time projection
  const cardRefs = useRef([]);
  const linePathRefs = useRef([]);
  const beaconCircleRefs = useRef([]);
  const targetCircleRefs = useRef([]);

  // 3 Genuine NISAR Radar-Derived Layers (Zero Jargon + Scientific Rigor)
  const STRATA_LAYERS = [
    {
      id: 'hh',
      claimId: 'CLM_STRATA_HH',
      index: 0,
      number: '01',
      title: 'THE WATER & FLOOD DETECTOR',
      category: 'CO-POLARIZED RADAR (HH)',
      badge: '24 cm L-BAND HH',
      accentColor: '#0284c7', // Sky 600
      threeColor: 0x0284c7,
      imgSrc: '/assets/layers/nisar_october_hh_true.webp',
      baseY: 1.15,
      whatItIs: 'Calm water deflects radar beams away like a dark mirror.',
      laymanExplanation:
        'Water deflects radar pulses away into space, appearing pitch-black. This layer instantly detects hidden flash floods, overflowing rivers, and safe evacuation paths through storm clouds.'
    },
    {
      id: 'hv',
      claimId: 'CLM_STRATA_HV',
      index: 1,
      number: '02',
      title: 'THE LIVING PLANT & BIOMASS GAUGE',
      category: 'CROSS-POLARIZED VOLUME SCATTER (HV)',
      badge: 'HV CROSS-POL • 24 cm',
      accentColor: '#059669', // Emerald 600
      threeColor: 0x059669,
      imgSrc: '/assets/layers/nisar_october_hv_true.webp',
      baseY: 0.0,
      whatItIs: 'Tangled leaves and branches twist and scatter microwave echoes.',
      laymanExplanation:
        'Bushy tree crowns and tall grass stalks twist radar waves in all directions. The brighter the glow, the thicker the living pasture available for local Maldhari pastoral livestock.'
    },
    {
      id: 'ratio',
      claimId: 'CLM_STRATA_RATIO',
      index: 2,
      number: '03',
      title: 'THE SMART LAND CLASSIFIER',
      category: 'DUAL-POL RATIO MATRIX (HH / HV)',
      badge: 'RATIO DECOMPOSITION',
      accentColor: '#d97706', // Amber 600
      threeColor: 0xd97706,
      imgSrc: '/assets/layers/nisar_october_polarimetric_ratio_true.webp',
      baseY: -1.15,
      whatItIs: 'Mathematical ratio separating water bounce from plant bounce.',
      laymanExplanation:
        'Human eyes get confused by desert sun glare. By dividing water reflection by plant bounce, this layer cleanly separates hard crystalline salt flats from thorny invasive scrub.'
    }
  ];

  // 1. Initialize Three.js 3D Viewport
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(4.6, 2.7, 5.2);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Warm, crisp museum studio lighting
    scene.add(new THREE.AmbientLight(0xfff7ed, 1.3));

    const keyLight = new THREE.DirectionalLight(0xffedd5, 1.7);
    keyLight.position.set(6, 10, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    rimLight.position.set(-6, -4, -6);
    scene.add(rimLight);

    // Strata Group: Stable isometric perspective
    const strataGroup = new THREE.Group();
    strataGroup.position.set(0, 0, 0);
    strataGroup.rotation.set(0.24, -Math.PI / 4.4, 0);
    strataGroupRef.current = strataGroup;
    scene.add(strataGroup);

    // Ambient Reference Grid at base
    const strataGrid = new THREE.GridHelper(3.8, 12, 0xd97706, 0xd6d3d1);
    strataGrid.position.y = -1.9;
    strataGroup.add(strataGrid);

    // Build the 3 Genuine Beveled Radar Data Slabs
    const slabSize = 3.1;
    const slabThickness = 0.055;
    const slabGeo = new THREE.BoxGeometry(slabSize, slabThickness, slabSize);

    const textureLoader = new THREE.TextureLoader();
    const meshes = [];

    STRATA_LAYERS.forEach((layerCfg, idx) => {
      const tex = textureLoader.load(layerCfg.imgSrc);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;

      // Top texture + beveled metallic colored edges
      const materials = [
        new THREE.MeshStandardMaterial({ color: layerCfg.threeColor, metalness: 0.85, roughness: 0.2 }),
        new THREE.MeshStandardMaterial({ color: layerCfg.threeColor, metalness: 0.85, roughness: 0.2 }),
        new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35, metalness: 0.05 }),
        new THREE.MeshStandardMaterial({ color: 0xeeece6, roughness: 0.85 }),
        new THREE.MeshStandardMaterial({ color: layerCfg.threeColor, metalness: 0.85, roughness: 0.2 }),
        new THREE.MeshStandardMaterial({ color: layerCfg.threeColor, metalness: 0.85, roughness: 0.2 })
      ];

      const mesh = new THREE.Mesh(slabGeo, materials);
      mesh.position.y = (1 - idx) * 0.08;
      mesh.userData = { layerIndex: idx, layerId: layerCfg.id };

      // Perimeter Glowing Accent Wireframe
      const edgeGeo = new THREE.EdgesGeometry(slabGeo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(layerCfg.threeColor),
        transparent: true,
        opacity: 0.85
      });
      mesh.add(new THREE.LineSegments(edgeGeo, edgeMat));

      strataGroup.add(mesh);
      meshes.push(mesh);
    });

    layerMeshesRef.current = meshes;

    // Real-Time 3D -> 2D Projected Leader Line Updater (60 FPS, Zero React overhead)
    const tempVec = new THREE.Vector3();
    const updateLeaderLines = () => {
      if (!cameraRef.current || !rendererRef.current || !layerMeshesRef.current.length) return;
      const stage = stageRef.current;
      if (!stage) return;
      const stageRect = stage.getBoundingClientRect();
      const width = stageRect.width;
      const height = stageRect.height;
      if (width === 0 || height === 0) return;

      STRATA_LAYERS.forEach((layer, idx) => {
        const mesh = layerMeshesRef.current[idx];
        const cardEl = cardRefs.current[idx];
        const pathEl = linePathRefs.current[idx];
        const beaconEl = beaconCircleRefs.current[idx];
        const targetEl = targetCircleRefs.current[idx];

        if (!mesh || !cardEl || !pathEl) return;

        // Find the rightmost center edge of the slab in local space
        tempVec.set(1.55, 0, 0);
        tempVec.applyMatrix4(mesh.matrixWorld);
        tempVec.project(cameraRef.current);

        const slabX = (tempVec.x * 0.5 + 0.5) * width;
        const slabY = (-tempVec.y * 0.5 + 0.5) * height;

        const cardRect = cardEl.getBoundingClientRect();
        const cardX = cardRect.left - stageRect.left;
        const cardY = cardRect.top + cardRect.height / 2 - stageRect.top;

        // Smooth cubic bezier curve connecting slab edge to card anchor
        const dx = cardX - slabX;
        const c1X = slabX + dx * 0.45;
        const c1Y = slabY;
        const c2X = slabX + dx * 0.55;
        const c2Y = cardY;

        pathEl.setAttribute('d', `M ${slabX.toFixed(1)} ${slabY.toFixed(1)} C ${c1X.toFixed(1)} ${c1Y.toFixed(1)}, ${c2X.toFixed(1)} ${c2Y.toFixed(1)}, ${cardX.toFixed(1)} ${cardY.toFixed(1)}`);

        if (beaconEl) {
          beaconEl.setAttribute('cx', slabX.toFixed(1));
          beaconEl.setAttribute('cy', slabY.toFixed(1));
        }
        if (targetEl) {
          targetEl.setAttribute('cx', cardX.toFixed(1));
          targetEl.setAttribute('cy', cardY.toFixed(1));
        }
      });
    };

    // Render Loop
    const animate = () => {
      if (isRotating3D && !isDraggingRef.current && strataGroupRef.current) {
        strataGroupRef.current.rotation.y += 0.0018;
      }
      renderer.render(scene, camera);
      updateLeaderLines();
      animFrameIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || (window.innerHeight - 140);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      slabGeo.dispose();
    };
  }, []);

  // 2. Auto Expansion: smoothly expands and glides left
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExpanded(true);
      try { soundEngine.playTransitionSound(); } catch (e) { }
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let animId;
    const targetGap = isExpanded ? 1.0 : 0.08;
    const targetX = isExpanded ? -1.15 : 0.0;
    let currentGap = isExpanded ? 0.08 : 1.0;
    let currentX = isExpanded ? 0.0 : -1.15;

    const stepAnimation = () => {
      currentGap += (targetGap - currentGap) * 0.08;
      currentX += (targetX - currentX) * 0.08;

      if (strataGroupRef.current) {
        strataGroupRef.current.position.x = currentX;
      }

      if (layerMeshesRef.current) {
        layerMeshesRef.current.forEach((mesh, idx) => {
          const cfg = STRATA_LAYERS[idx];
          mesh.position.y = cfg.baseY * currentGap;
        });
      }

      if (Math.abs(targetGap - currentGap) > 0.005 || Math.abs(targetX - currentX) > 0.005) {
        animId = requestAnimationFrame(stepAnimation);
      }
    };

    animId = requestAnimationFrame(stepAnimation);
    return () => cancelAnimationFrame(animId);
  }, [isExpanded]);

  // Highlight hovered layer
  useEffect(() => {
    if (!layerMeshesRef.current) return;
    layerMeshesRef.current.forEach((mesh, idx) => {
      const isHovered = hoveredLayerIndex === idx;
      mesh.scale.set(isHovered ? 1.03 : 1.0, isHovered ? 1.2 : 1.0, isHovered ? 1.03 : 1.0);
    });
  }, [hoveredLayerIndex]);

  // Interactive 3D Rotation Controls
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    const container = mountRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (cameraRef.current && strataGroupRef.current) {
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(layerMeshesRef.current, false);
      if (intersects.length > 0) {
        const hoveredMesh = intersects[0].object;
        setHoveredLayerIndex(hoveredMesh.userData.layerIndex);
      } else if (!isDraggingRef.current) {
        setHoveredLayerIndex(null);
      }
    }

    if (!isDraggingRef.current || !strataGroupRef.current) return;
    const deltaX = e.clientX - prevMousePosRef.current.x;
    const deltaY = e.clientY - prevMousePosRef.current.y;

    strataGroupRef.current.rotation.y += deltaX * 0.008;
    strataGroupRef.current.rotation.x = Math.max(-0.4, Math.min(0.6, strataGroupRef.current.rotation.x + deltaY * 0.005));

    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleCanvasClick = (e) => {
    if (!cameraRef.current || !strataGroupRef.current) return;
    const container = mountRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(layerMeshesRef.current, false);
    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object;
      const layerCfg = STRATA_LAYERS[clickedMesh.userData.layerIndex];
      try { soundEngine.playHover(); } catch (err) { }
      setActiveInspectedLayer(layerCfg);
    }
  };

  return (
    <div className="relative w-full h-full flex-1 min-h-0 flex flex-col justify-between overflow-hidden font-sans select-none text-stone-900 bg-[#FAF8F5]">

      {/* 1. 3D STAGE & BEVELED CARDS (Hidden when actively inspecting a layer to prevent any overlap) */}
      <div
        ref={stageRef}
        style={{ display: activeInspectedLayer ? 'none' : 'flex' }}
        className="relative w-full h-full flex-1 min-h-0 overflow-hidden items-center justify-between"
      >

        {/* Subtle Ambient Radar Grid Pattern */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:28px_28px]" />

        {/* 3D WebGL Canvas */}
        <div
          ref={mountRef}
          onClick={handleCanvasClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-0"
        />

        {/* Floating Perspective Pill (Top Left) */}
        <div className="absolute top-4 left-6 sm:left-10 z-20 pointer-events-none">
          <span className="px-3.5 py-1.5 rounded-full bg-white/95 border border-stone-300 text-stone-800 text-[10px] font-mono tracking-widest uppercase shadow-sm">
            ISOMETRIC 3D RADAR STACK &bull; DRAG TO ROTATE
          </span>
        </div>

        {/* Floating Stack Action Controls (Top Right) */}
        <div className="absolute top-4 right-6 sm:right-10 z-20 flex items-center gap-2">
          <button
            onClick={() => {
              setIsExpanded(!isExpanded);
              try { soundEngine.playHover(); } catch (e) { }
            }}
            className="px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider bg-white/95 hover:bg-white text-stone-800 border border-stone-300 transition-all cursor-pointer shadow-sm hover:scale-102 flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-amber-700" />
            <span>{isExpanded ? 'COMPRESS STACK' : 'EXPLODE LAYERS'}</span>
          </button>

          <button
            onClick={() => {
              if (strataGroupRef.current) {
                strataGroupRef.current.rotation.set(0.24, -Math.PI / 4.4, 0);
              }
              setIsRotating3D(false);
            }}
            className="p-1.5 rounded-full bg-white/95 hover:bg-white border border-stone-300 text-stone-700 transition-all cursor-pointer shadow-sm"
            title="Reset Isometric Angle"
          >
            <RotateCcw className="w-4 h-4 text-amber-700" />
          </button>
        </div>

        {/* DYNAMIC SVG LEADER LINES: Physically Connects 3D Slabs to the Callout Cards */}
        <svg
          className={`absolute inset-0 w-full h-full pointer-events-none z-10 transition-opacity duration-500 ${isExpanded ? 'opacity-100' : 'opacity-0'
            }`}
        >
          {STRATA_LAYERS.map((layer, idx) => {
            const isHovered = hoveredLayerIndex === idx;
            return (
              <g key={`leader-group-${layer.id}`}>
                {/* Connecting Curved Leader Line */}
                <path
                  ref={(el) => (linePathRefs.current[idx] = el)}
                  fill="none"
                  stroke={layer.accentColor}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  strokeDasharray={isHovered ? 'none' : '6 4'}
                  strokeOpacity={isHovered ? 1.0 : 0.65}
                  className="transition-all duration-200"
                />

                {/* Beacon Circle physically anchored on the 3D Slab Right Edge */}
                <circle
                  ref={(el) => (beaconCircleRefs.current[idx] = el)}
                  r={isHovered ? 6 : 4.5}
                  fill={layer.accentColor}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />

                {/* Target Circle anchored on the Card's left connector */}
                <circle
                  ref={(el) => (targetCircleRefs.current[idx] = el)}
                  r={isHovered ? 5 : 3.5}
                  fill="#ffffff"
                  stroke={layer.accentColor}
                  strokeWidth="2"
                  className="transition-all duration-200"
                />
              </g>
            );
          })}
        </svg>

        {/* ========================================================
            3. BEVELED RADAR CALLOUT CARDS (Zero-Jargon Layman Copy)
        ======================================================== */}
        <div
          className={`absolute right-4 sm:right-8 md:right-10 top-1/2 -translate-y-1/2 z-20 w-full max-w-sm sm:max-w-md lg:max-w-lg flex flex-col justify-between gap-3 transition-all duration-700 pointer-events-auto ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12 pointer-events-none'
            }`}
        >
          <div className="text-[10px] sm:text-[10.5px] font-mono tracking-[0.25em] text-amber-800 uppercase font-bold pl-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            <span>3 BEVELED NISAR RADAR LAYERS &bull; SELECT TO INSPECT</span>
          </div>

          {STRATA_LAYERS.map((layer, idx) => {
            const isHovered = hoveredLayerIndex === idx;

            return (
              <div
                key={layer.id}
                data-claim-id={layer.claimId}
                ref={(el) => (cardRefs.current[idx] = el)}
                onMouseEnter={() => setHoveredLayerIndex(idx)}
                onMouseLeave={() => setHoveredLayerIndex(null)}
                onClick={() => {
                  try { soundEngine.playHover(); } catch (e) { }
                  setActiveInspectedLayer(layer);
                }}
                className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group shadow-sm ${isHovered
                    ? 'bg-white border-amber-500 shadow-lg scale-[1.02]'
                    : 'bg-white/95 border-stone-200/90 hover:border-amber-400 hover:bg-white'
                  }`}
              >
                <div className="flex items-start gap-3 text-left">
                  {/* Number Badge */}
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs border transition-colors shrink-0 mt-0.5"
                    style={{
                      backgroundColor: isHovered ? `${layer.accentColor}25` : 'rgba(0,0,0,0.04)',
                      borderColor: layer.accentColor,
                      color: layer.accentColor
                    }}
                  >
                    {layer.number}
                  </div>

                  <div>
                    {/* Layer Category Tag */}
                    <div className="text-[9.5px] font-mono uppercase tracking-widest font-bold text-stone-500 mb-0.5">
                      {layer.category}
                    </div>

                    {/* Simple Layman Title */}
                    <h4 className="font-['Cinzel',serif] text-xs sm:text-sm font-bold text-stone-900 uppercase group-hover:text-amber-800 transition-colors">
                      {layer.title}
                    </h4>

                    {/* What it is in plain layman terms */}
                    <div className="text-[10px] font-mono text-amber-900 font-semibold mt-0.5">
                      {layer.whatItIs}
                    </div>

                    {/* Simple narrative description */}
                    <p className="text-[10.5px] sm:text-[11px] text-stone-600 font-sans leading-tight mt-1 font-normal line-clamp-2">
                      {layer.laymanExplanation}
                    </p>
                  </div>
                </div>

                {/* Inspect Action Button */}
                <div className="flex items-center gap-1 shrink-0 ml-3">
                  <span
                    className="text-[9.5px] font-mono tracking-wider uppercase px-2.5 py-1.5 rounded-full border transition-all font-semibold"
                    style={{
                      borderColor: isHovered ? layer.accentColor : 'rgba(0,0,0,0.14)',
                      color: isHovered ? '#ffffff' : '#44403c',
                      backgroundColor: isHovered ? layer.accentColor : 'transparent'
                    }}
                  >
                    INSPECT &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* DEDICATED FULL-STAGE LAYER INSPECTION MODAL */}
      {activeInspectedLayer && (
        <DedicatedLayerInspectionView
          layer={activeInspectedLayer}
          hideTopBar={Boolean(externalInspectedLayer !== undefined)}
          onBackTo3D={() => setActiveInspectedLayer(null)}
          onSelectNextLayer={() => {
            const nextIdx = (activeInspectedLayer.index + 1) % STRATA_LAYERS.length;
            setActiveInspectedLayer(STRATA_LAYERS[nextIdx]);
          }}
        />
      )}

    </div>
  );
}
