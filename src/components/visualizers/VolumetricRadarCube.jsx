import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Box, Scan, Sliders, RotateCcw, Activity, BookOpen, Layers, Sparkles } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

/**
 * VolumetricRadarCube
 * 
 * Interactive 3D TomoSAR (Tomographic Radar Slicing) visualizer.
 * Demonstrates how NISAR 24cm microwaves pierce the dense Banni Savanna canopy
 * to quantify vertical biomass distribution (Mg/ha) and uncover ground terrain.
 * 
 * Features:
 * - 3D Holographic Point Cloud (18,000 points) with dual-pol volume scattering colors.
 * - Dynamic 3D Laser Slicing Plane that physically moves up and down inside the cube.
 * - Live real-time elevation ($0.0m$ to $2.5m$) and cumulative biomass yield ($0.0$ to $28.5 Mg/ha$) calculation.
 * - Sensor mode comparison: Optical foliage block vs 24cm Microwave penetration.
 * - Integrated ecological tab dock (Fauna, Flora, Invasive Prosopis) + Encyclopedia trigger.
 * - Zero vertical scrolling: fits comfortably within single viewport height.
 */
export default function VolumetricRadarCube({ season = 'greenery', onOpenEncyclopedia }) {
  const mountRef = useRef(null);
  const [sliceDepth, setSliceDepth] = useState(1.0); // 0.15 = ground, 1.0 = full canopy
  const [viewMode, setViewMode] = useState('radar'); // 'optical' | 'radar'
  const [isRotating, setIsRotating] = useState(true);
  const [activeTab, setActiveTab] = useState('biomass'); // 'fauna' | 'biomass' | 'invasive'

  const sceneRef = useRef(null);
  const cubeGroupRef = useRef(null);
  const pointsRef = useRef(null);
  const laserPlaneRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });

  // Real-time calculated values based on slice slider
  const liveElevationM = useMemo(() => {
    // Map sliceDepth (0.15 to 1.0) to 0.0m - 2.5m
    const norm = Math.max(0, (sliceDepth - 0.15) / 0.85);
    return (norm * 2.5).toFixed(2);
  }, [sliceDepth]);

  const liveBiomassMgHa = useMemo(() => {
    // Map sliceDepth (0.15 to 1.0) to 0.0 - 28.5 Mg/ha
    const norm = Math.max(0, (sliceDepth - 0.15) / 0.85);
    return (Math.pow(norm, 1.4) * 28.5).toFixed(1);
  }, [sliceDepth]);

  const liveDepolDb = useMemo(() => {
    // -26.0 dB at ground to -11.2 dB at full canopy crown
    const norm = Math.max(0, (sliceDepth - 0.15) / 0.85);
    return (-26.0 + norm * 14.8).toFixed(1);
  }, [sliceDepth]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 440;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(4.6, 3.4, 5.6);
    camera.lookAt(0, -0.1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // 3. Central Cube Group
    const cubeGroup = new THREE.Group();
    cubeGroup.rotation.y = -Math.PI / 4;
    cubeGroupRef.current = cubeGroup;
    scene.add(cubeGroup);

    // 4. Outer Wireframe Bounding Box
    const boxSize = 3.0;
    const boxGeo = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    const boxEdges = new THREE.EdgesGeometry(boxGeo);
    const boxMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
    });
    const boxLine = new THREE.LineSegments(boxEdges, boxMat);
    cubeGroup.add(boxLine);

    // Corner reinforcement accents
    const cornerSize = 0.35;
    const cornerMat = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.9 });
    const cornerPositions = [
      [-1, -1, -1], [1, -1, -1], [-1, 1, -1], [1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1],
    ];
    cornerPositions.forEach(([x, y, z]) => {
      const g = new THREE.BufferGeometry();
      const hx = (boxSize / 2) * x;
      const hy = (boxSize / 2) * y;
      const hz = (boxSize / 2) * z;
      const pts = [
        hx, hy, hz, hx - x * cornerSize, hy, hz,
        hx, hy, hz, hx, hy - y * cornerSize, hz,
        hx, hy, hz, hx, hy, hz - z * cornerSize,
      ];
      g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      cubeGroup.add(new THREE.LineSegments(g, cornerMat));
    });

    // 5. Dynamic 3D Laser Slicing Plane
    const planeGeo = new THREE.PlaneGeometry(boxSize * 0.98, boxSize * 0.98, 12, 12);
    planeGeo.rotateX(-Math.PI / 2);
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      wireframe: true
    });
    const laserPlane = new THREE.Mesh(planeGeo, planeMat);

    // Laser plane glowing outer rim
    const rimGeo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(boxSize * 0.98, boxSize * 0.98).rotateX(-Math.PI / 2));
    const rimMat = new THREE.LineBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.85 });
    laserPlane.add(new THREE.LineSegments(rimGeo, rimMat));

    cubeGroup.add(laserPlane);
    laserPlaneRef.current = laserPlane;

    // 6. Procedural 3D Point Cloud (18,000 points)
    const count = 18000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const originalY = new Float32Array(count);
    const half = boxSize / 2;

    for (let i = 0; i < count; i++) {
      const isGround = i < count * 0.42;
      const x = (Math.random() - 0.5) * (boxSize * 0.92);
      const z = (Math.random() - 0.5) * (boxSize * 0.92);
      let y = 0;

      const col = new THREE.Color();

      if (isGround) {
        // Ground terrain with gentle undulations
        const wave = Math.sin(x * 2.5) * Math.cos(z * 2.5) * 0.15;
        y = -half + 0.12 + wave;
        // Deep blue to cyan ground moisture return (-22 dB to -16 dB)
        col.setHSL(0.58 + (y + half) * 0.2, 0.95, 0.45);
      } else {
        // Canopy vegetation clumps (Banni savanna grasses & scrub trees)
        const hubX = Math.sin(i % 7) * (boxSize * 0.35);
        const hubZ = Math.cos(i % 7) * (boxSize * 0.35);
        const dist = Math.hypot(x - hubX, z - hubZ);
        const treeHeight = Math.max(0.2, 1.8 - dist * 1.5);

        y = -half + 0.25 + Math.random() * treeHeight;
        // Canopy cross-polarization backscatter: Emerald green to golden amber
        const normH = (y - (-half)) / boxSize;
        col.setHSL(0.35 - normH * 0.22, 0.95, 0.52);
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      originalY[i] = y;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
    });

    const pMesh = new THREE.Points(pGeo, pMat);
    cubeGroup.add(pMesh);
    pointsRef.current = { mesh: pMesh, originalY, count, half, boxSize };

    // 7. Render Loop
    const animate = () => {
      if (isRotating && !isDraggingRef.current && cubeGroupRef.current) {
        cubeGroupRef.current.rotation.y += 0.0035;
      }
      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      pGeo.dispose();
      pMat.dispose();
      planeGeo.dispose();
      planeMat.dispose();
    };
  }, []);

  // Live update of point cloud and 3D Laser Plane on sliceDepth change
  useEffect(() => {
    if (!pointsRef.current) return;
    const { mesh, originalY, count, half, boxSize } = pointsRef.current;
    const pos = mesh.geometry.attributes.position;

    // Cutoff Y threshold
    const cutoffY = -half + boxSize * sliceDepth;

    // Move the 3D Laser Slicing Plane directly to cutoffY
    if (laserPlaneRef.current) {
      laserPlaneRef.current.position.y = cutoffY;
      laserPlaneRef.current.visible = viewMode === 'radar';
    }

    for (let i = 0; i < count; i++) {
      const origY = originalY[i];

      if (viewMode === 'optical') {
        // Optical only sees the outer top canopy foliage
        const isTop = origY > half - 0.45;
        pos.setY(i, isTop ? origY : -999);
      } else {
        // Radar slices down through the volume
        const isVisible = origY <= cutoffY;
        pos.setY(i, isVisible ? origY : -999);
      }
    }
    pos.needsUpdate = true;
  }, [sliceDepth, viewMode]);

  // Pointer drag controls for 3D orbit
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || !cubeGroupRef.current) return;
    const deltaX = e.clientX - prevMousePosRef.current.x;
    const deltaY = e.clientY - prevMousePosRef.current.y;

    cubeGroupRef.current.rotation.y += deltaX * 0.008;
    cubeGroupRef.current.rotation.x = Math.max(-0.5, Math.min(0.5, cubeGroupRef.current.rotation.x + deltaY * 0.005));

    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 items-stretch select-none max-w-[1450px] mx-auto text-left">
      
      {/* 3D POINT CLOUD CANOPY VIEWPORT */}
      <div className="flex-1 relative w-full h-[380px] sm:h-[440px] lg:h-[470px] rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950 via-[#030713] to-slate-950 border border-white/20 shadow-2xl group">
        
        <div
          ref={mountRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* HUD Top Left: Mode & Telemetry */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 border border-emerald-400/40 text-[10px] font-mono font-bold text-emerald-300 backdrop-blur-md">
            <Box className="w-3.5 h-3.5 text-emerald-400" />
            <span>3D TOMOSAR CANOPY PENETRATION BOX</span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setIsRotating(!isRotating)}
              className="px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-[10px] font-mono text-white/80 transition-all cursor-pointer backdrop-blur-md"
            >
              {isRotating ? 'PAUSE ROTATION' : 'AUTO-ROTATE'}
            </button>
            <button
              onClick={() => {
                if (cubeGroupRef.current) {
                  cubeGroupRef.current.rotation.set(0, -Math.PI / 4, 0);
                  setSliceDepth(1.0);
                  setViewMode('radar');
                }
              }}
              className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white/80 transition-all cursor-pointer backdrop-blur-md"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Calibrated Color Scale Bar */}
        <div className="absolute top-14 left-3 p-2 rounded-xl bg-black/80 border border-white/15 backdrop-blur-md flex flex-col gap-1 items-center pointer-events-none">
          <span className="text-[8px] font-mono text-white/60 font-bold uppercase">σ° dB</span>
          <div className="w-2 h-24 rounded-full bg-gradient-to-b from-amber-400 via-emerald-400 via-cyan-400 to-blue-700 shadow-inner" />
          <div className="flex flex-col justify-between h-24 text-[7px] font-mono text-white/70 py-0.5">
            <span>-6 dB</span>
            <span>-12 dB</span>
            <span>-18 dB</span>
            <span>-24 dB</span>
          </div>
        </div>

        {/* Live Laser Cut Marker */}
        {viewMode === 'radar' && (
          <div className="absolute bottom-10 left-3 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-400/40 backdrop-blur-md text-[9.5px] font-mono text-emerald-300 pointer-events-none flex items-center gap-1.5">
            <Scan className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>TOMOGRAPHIC CUT: Z = {liveElevationM}m ({Math.round(sliceDepth * 100)}%)</span>
          </div>
        )}

        {/* HUD Bottom Readout */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[9px] font-mono text-white/50 pointer-events-none">
          <span>18,000 VOLUMETRIC SCATTERING POINTS</span>
          <span className="text-emerald-300 font-bold">24cm L-BAND HV DEPOLARIZATION</span>
        </div>
      </div>

      {/* RIGHT: INTERACTIVE SLICER DOCK & INTEGRATED ECOLOGICAL HUD */}
      <div className="w-full lg:w-[420px] flex flex-col justify-between gap-2.5 text-left">
        
        {/* Sensor Mode Switcher */}
        <div className="p-3 rounded-2xl bg-black/60 border border-white/15 backdrop-blur-xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-white/60 tracking-wider uppercase">
            <span>SENSOR PENETRATION:</span>
            <span className="text-emerald-400">{viewMode === 'radar' ? '24cm PENETRATION ACTIVE' : 'SURFACE BLOCKED'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setViewMode('optical');
                setSliceDepth(1.0);
              }}
              className={`py-1.5 px-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border text-center ${
                viewMode === 'optical'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              OPTICAL VISUAL
            </button>
            <button
              onClick={() => {
                setViewMode('radar');
                setSliceDepth(1.0);
              }}
              className={`py-1.5 px-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border text-center ${
                viewMode === 'radar'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              24cm L-BAND SAR
            </button>
          </div>
        </div>

        {/* DRAMATIC LIVE TOMOSAR SLICE DEPTH SLIDER WITH REAL-TIME CALCULATION */}
        <div className="p-3.5 rounded-2xl bg-black/60 border border-emerald-500/30 backdrop-blur-xl flex flex-col gap-2 shadow-lg">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-300 font-bold flex items-center gap-1.5 uppercase">
              <Scan className="w-3.5 h-3.5 text-emerald-400" />
              <span>TOMOSAR SLICE ELEVATION:</span>
            </span>
            <span className="text-white font-mono font-bold">{liveElevationM} m</span>
          </div>

          <input
            type="range"
            min="0.15"
            max="1.0"
            step="0.02"
            value={sliceDepth}
            onChange={(e) => {
              setViewMode('radar');
              setSliceDepth(parseFloat(e.target.value));
            }}
            className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg transition-all"
          />

          {/* Dynamic Live Metric Readouts */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/10 text-center font-mono">
            <div className="p-1.5 rounded-lg bg-white/5">
              <div className="text-[8.5px] text-stone-400 uppercase">CUMULATIVE BIOMASS</div>
              <div className="text-xs font-bold text-emerald-300">{liveBiomassMgHa} Mg/ha</div>
            </div>
            <div className="p-1.5 rounded-lg bg-white/5">
              <div className="text-[8.5px] text-stone-400 uppercase">VOLUME RETURN</div>
              <div className="text-xs font-bold text-amber-200">{liveDepolDb} dB</div>
            </div>
            <div className="p-1.5 rounded-lg bg-white/5">
              <div className="text-[8.5px] text-stone-400 uppercase">CANOPY HEIGHT</div>
              <div className="text-xs font-bold text-white">{liveElevationM} / 2.5m</div>
            </div>
          </div>
        </div>

        {/* INTEGRATED ECOLOGICAL HUD TABS (Fauna, Flora, Invasive) */}
        <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-emerald-400/20 backdrop-blur-xl flex flex-col gap-2">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {['biomass', 'fauna', 'invasive'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    try { soundEngine.playHover(); } catch (e) {}
                    setActiveTab(tab);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase font-bold transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-emerald-400 text-stone-950'
                      : 'text-stone-400 hover:text-white bg-white/5'
                  }`}
                >
                  {tab === 'biomass' ? '01 Flora' : tab === 'fauna' ? '02 Fauna' : '03 Invasive'}
                </button>
              ))}
            </div>

            {/* Encyclopedia Button in Same Compact Row */}
            {onOpenEncyclopedia && (
              <button
                onClick={() => {
                  try { soundEngine.playHover(); } catch (e) {}
                  onOpenEncyclopedia();
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 text-[10px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <BookOpen className="w-3 h-3 text-stone-950" />
                <span>ENCYCLOPEDIA &rarr;</span>
              </button>
            )}
          </div>

          {/* Active Tab Description */}
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 min-h-[75px] flex flex-col justify-center">
            {activeTab === 'biomass' && (
              <div>
                <div className="text-xs font-semibold text-white mb-0.5">
                  28.5 Mg/ha Grassland Forage Yield
                </div>
                <p className="text-[11px] text-stone-300 leading-snug">
                  HV cross-pol volume scattering maps 2,500 km² of endemic sweet grasses (*Desmostachya bipinnata*), providing real-time grazing forecasts for 50,000+ Maldhari livestock.
                </p>
              </div>
            )}

            {activeTab === 'fauna' && (
              <div>
                <div className="text-xs font-semibold text-white mb-0.5">
                  Khadir Bet Moats & Wild Ass (*Ghudkhur*)
                </div>
                <p className="text-[11px] text-stone-300 leading-snug">
                  Over 500,000 Greater Flamingos nest on Khadir Island, protected by flooded mud barriers that radar maps continuously to keep predators out.
                </p>
              </div>
            )}

            {activeTab === 'invasive' && (
              <div>
                <div className="text-xs font-semibold text-white mb-0.5">
                  *Prosopis juliflora* (*Gando Baval*) Tracking
                </div>
                <p className="text-[11px] text-stone-300 leading-snug">
                  24cm radar differentiates soft native grass from woody invasive *Prosopis* scrub by branch geometry, enabling precision community ecological clearing.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
