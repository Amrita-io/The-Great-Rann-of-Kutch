import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Sparkles, Radio, SlidersHorizontal, Compass, Layers, Leaf, Trees, Sprout } from 'lucide-react';

/**
 * Canopy3DCube
 * 
 * 3D Interactive Volumetric Radar Canopy Penetration Cuboid:
 * - Detailed Great Rann of Kutch & Banni Savanna landscape cuboid
 * - Sprawling flat-topped Acacia nilotica (Babool) umbrella trees
 * - Dense Banni sweet grass tussocks (Cenchrus ciliaris, Dichanthium)
 * - Polygonal halite (white salt crust) cracked desert surface
 * - Alluvial silt strata with roots and soil moisture gradient
 * - Side-by-side 360° horizontal rotation ONLY (pitch angle locked at fixed isometric elevation)
 * - Glowing 24cm L-Band microwave radar slice plane with live depolarization halos
 * - Zero unicode emojis (pure typography and Lucide icons)
 */
export default function Canopy3DCube({
  canopyHeight = 2.5, // 0.2m to 2.5m
  onHeightChange = () => { }
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  // Camera view angle looking DOWN from side of upper edges (elevated isometric 3/4 perspective)
  // angleY: horizontal turntable yaw. angleX: negative pitch tilts camera DOWN looking into top face
  const angleYRef = useRef(-0.65);
  const angleXRef = useRef(-0.38);
  const [dimensions, setDimensions] = useState({ width: 500, height: 420 });
  const [viewMode, setViewMode] = useState('kids'); // 'kids' | 'science'

  // Responsive resize observer
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

  // Generate 3D procedural elements for the Great Rann / Banni cuboid
  const sceneElements = useMemo(() => {
    const halfX = 145; // Width 290
    const halfY = 80;  // Height 160 (surface at y = 0)
    const halfZ = 115; // Depth 230

    const points = [];
    const halitePolygons = [];

    // 1. Great Rann White Halite Salt Crust Polygons on Surface (y = 0)
    // Procedural cracked salt polygon cells across the ground plane
    for (let gx = -halfX + 25; gx < halfX - 20; gx += 45) {
      for (let gz = -halfZ + 25; gz < halfZ - 20; gz += 45) {
        const polyPoints = [];
        const numSides = 5 + Math.floor(Math.random() * 2);
        const radius = 18 + Math.random() * 8;
        const jx = gx + (Math.random() - 0.5) * 12;
        const jz = gz + (Math.random() - 0.5) * 12;

        for (let s = 0; s < numSides; s++) {
          const angle = (s / numSides) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
          polyPoints.push({
            x: jx + Math.cos(angle) * radius,
            y: 0,
            z: jz + Math.sin(angle) * radius
          });
        }
        halitePolygons.push(polyPoints);
      }
    }

    // Surface Salt Micro-Crystals (Bright white retro-reflectors)
    for (let c = 0; c < 120; c++) {
      points.push({
        x: (Math.random() - 0.5) * (halfX * 1.8),
        y: 0,
        z: (Math.random() - 0.5) * (halfZ * 1.8),
        layer: 'salt',
        color: '#FFFFFF',
        size: 1.8,
        scatter: 'surface-return'
      });
    }

    // 2. Acacia nilotica (Babool) Sprawling Umbrella Trees
    // Characteristic flat-topped Kutch desert canopies
    const trees = [
      { x: -60, z: -30, trunkH: 46, crownR: 46, foliageCount: 140 },
      { x: 48, z: 22, trunkH: 54, crownR: 50, foliageCount: 160 },
      { x: -18, z: 45, trunkH: 40, crownR: 38, foliageCount: 110 },
      { x: 20, z: -50, trunkH: 36, crownR: 34, foliageCount: 95 }
    ];

    trees.forEach((tree) => {
      // Gnarled multi-branched woody trunk
      for (let ty = 0; ty <= tree.trunkH; ty += 4.5) {
        const lean = Math.sin(ty * 0.04) * 4;
        points.push({
          x: tree.x + lean + (Math.random() - 0.5) * 2,
          y: ty,
          z: tree.z + (Math.random() - 0.5) * 2,
          layer: 'trunk',
          color: '#B45309',
          size: 3.4,
          scatter: 'double-bounce'
        });
      }

      // Spreading lateral limb branches at trunk apex
      for (let b = 0; b < 7; b++) {
        const branchAngle = (b / 7) * Math.PI * 2;
        const bLen = tree.crownR * 0.8;
        for (let step = 0; step < 6; step++) {
          const frac = (step + 1) / 6;
          points.push({
            x: tree.x + Math.cos(branchAngle) * (bLen * frac),
            y: tree.trunkH + frac * 8,
            z: tree.z + Math.sin(branchAngle) * (bLen * frac),
            layer: 'trunk',
            color: '#92400E',
            size: 2.2,
            scatter: 'double-bounce'
          });
        }
      }

      // Flat-Topped Umbrella Foliage Canopy (Dense micro-points with realistic depth)
      for (let f = 0; f < tree.foliageCount; f++) {
        const r = Math.sqrt(Math.random()) * tree.crownR;
        const theta = Math.random() * Math.PI * 2;
        // Flat umbrella disc: wider in X/Z, narrow in Y
        const fy = tree.trunkH + 5 + (Math.random() - 0.5) * 14;

        points.push({
          x: tree.x + Math.cos(theta) * r,
          y: fy,
          z: tree.z + Math.sin(theta) * r,
          layer: 'crown',
          color: f % 4 === 0 ? '#10B981' : f % 4 === 1 ? '#34D399' : f % 4 === 2 ? '#059669' : '#047857',
          size: 2.8,
          scatter: 'volume'
        });
      }
    });

    // 3. Dense Banni Savanna Sweet Grass Stalks (Cenchrus & Dichanthium)
    // Tussocks rising from ground y=0 to y=18..36
    for (let t = 0; t < 95; t++) {
      const tx = (Math.random() - 0.5) * (halfX * 1.78);
      const tz = (Math.random() - 0.5) * (halfZ * 1.78);
      const tHeight = 16 + Math.random() * 22;

      // Cluster of 4-6 grass stalks per tussock
      for (let s = 0; s < 5; s++) {
        const spread = (Math.random() - 0.5) * 6;
        for (let gy = 0; gy < tHeight; gy += 6) {
          points.push({
            x: tx + spread + (gy * 0.08),
            y: gy,
            z: tz + spread,
            layer: 'grass',
            color: gy > 16 ? '#84CC16' : '#EAB308',
            size: 1.8,
            scatter: 'stem-flutter'
          });
        }
      }
    }

    // 4. Subsurface Silt, Alluvial Clay & Taproot Network (y: -halfY to 0)
    // Deep roots descending from tree trunks
    trees.forEach((tree) => {
      for (let ry = 0; ry >= -65; ry -= 6) {
        const spreadX = (Math.random() - 0.5) * (Math.abs(ry) * 0.45);
        const spreadZ = (Math.random() - 0.5) * (Math.abs(ry) * 0.45);
        points.push({
          x: tree.x + spreadX,
          y: ry,
          z: tree.z + spreadZ,
          layer: 'root',
          color: '#78350F',
          size: 2.5,
          scatter: 'surface-return'
        });
      }
    });

    // Subsurface Moisture Gradient & Alluvial Particles
    for (let sp = 0; sp < 140; sp++) {
      const sy = -Math.random() * halfY;
      points.push({
        x: (Math.random() - 0.5) * (halfX * 1.85),
        y: sy,
        z: (Math.random() - 0.5) * (halfZ * 1.85),
        layer: 'root',
        color: sy < -40 ? '#0284C7' : '#451A03', // Deeper blue moisture vs brown silt
        size: sy < -40 ? 1.6 : 1.4,
        scatter: 'surface-return'
      });
    }

    return { halfX, halfY, halfZ, points, halitePolygons };
  }, []);

  // Pointer drag handler: side-by-side horizontal rotation ONLY (ignore dy)
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    // Left-right yaw rotation ONLY. Pitch angle (angleX) is strictly locked!
    angleYRef.current += dx * 0.007;
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // 3D Canvas Projection & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    let waveOffset = 0;
    let animId;

    const render = () => {
      // Rotation is strictly user-controlled via horizontal drag
      waveOffset = (waveOffset + 0.8) % 50;

      const w = dimensions.width;
      const h = dimensions.height;
      const cx = w / 2;
      const cy = h / 2 + 10;
      const fov = Math.min(w, h) * 1.15;
      const cameraDist = 480;

      ctx.clearRect(0, 0, w, h);

      const cosY = Math.cos(angleYRef.current);
      const sinY = Math.sin(angleYRef.current);
      const cosX = Math.cos(angleXRef.current);
      const sinX = Math.sin(angleXRef.current);

      // Project 3D vector to 2D screen
      const project = (x, y, z) => {
        const rx = x * cosY - z * sinY;
        const rz = x * sinY + z * cosY;
        const ry = y * cosX - rz * sinX;
        const depth = rz * cosX + y * sinX + cameraDist;
        const scale = fov / Math.max(10, depth);
        return {
          sx: cx + rx * scale,
          sy: cy - ry * scale,
          depth,
          scale
        };
      };

      const { halfX, halfY, halfZ } = sceneElements;

      // Map canopyHeight (0.2m to 2.5m) to local Y:
      // 0.2m -> -40 (roots), 0.8m -> 10 (stems), 1.6m -> 35 (tall grass), 2.5m -> 65 (canopy top)
      const normH = (canopyHeight - 0.2) / (2.5 - 0.2); // 0 to 1
      const sliceY = -45 + normH * 115;

      // 1. Draw Subsurface Soil Base Grid (y = -halfY)
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.12)';
      ctx.lineWidth = 1;
      for (let g = -halfX; g <= halfX; g += 58) {
        const p1 = project(g, -halfY, -halfZ);
        const p2 = project(g, -halfY, halfZ);
        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.stroke();
      }

      // 2. Draw Translucent 3D Landscape Cuboid Framing Edges & Top Glass Face
      const corners = [
        project(-halfX, -halfY, -halfZ), project(halfX, -halfY, -halfZ),
        project(halfX, -halfY, halfZ), project(-halfX, -halfY, halfZ),
        project(-halfX, halfY, -halfZ), project(halfX, halfY, -halfZ),
        project(halfX, halfY, halfZ), project(-halfX, halfY, halfZ)
      ];

      // Top face subtle glass tint (viewed from above into the cuboid)
      ctx.fillStyle = 'rgba(245, 158, 11, 0.05)';
      ctx.beginPath();
      ctx.moveTo(corners[4].sx, corners[4].sy);
      ctx.lineTo(corners[5].sx, corners[5].sy);
      ctx.lineTo(corners[6].sx, corners[6].sy);
      ctx.lineTo(corners[7].sx, corners[7].sy);
      ctx.closePath();
      ctx.fill();

      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0], // Bottom edges (subsurface floor)
        [4, 5], [5, 6], [6, 7], [7, 4], // Top edges (sky boundary)
        [0, 4], [1, 5], [2, 6], [3, 7]  // Vertical column edges
      ];

      ctx.strokeStyle = 'rgba(217, 119, 6, 0.35)';
      ctx.lineWidth = 1.2;
      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(corners[i].sx, corners[i].sy);
        ctx.lineTo(corners[j].sx, corners[j].sy);
        ctx.stroke();
      });

      // 3. Draw Great Rann Polygonal Halite (White Salt) Cracked Crust at Surface (y = 0)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      sceneElements.halitePolygons.forEach((poly) => {
        if (poly.length === 0) return;
        ctx.beginPath();
        const first = project(poly[0].x, poly[0].y, poly[0].z);
        ctx.moveTo(first.sx, first.sy);
        for (let i = 1; i < poly.length; i++) {
          const pt = project(poly[i].x, poly[i].y, poly[i].z);
          ctx.lineTo(pt.sx, pt.sy);
        }
        ctx.closePath();
        ctx.stroke();
      });

      // 4. Project and Draw Volumetric Landscape Elements (Foliage, Grass, Trunks, Roots)
      const sortedPoints = sceneElements.points.map((p) => {
        const pr = project(p.x, p.y, p.z);
        return { ...p, ...pr };
      }).sort((a, b) => b.depth - a.depth);

      sortedPoints.forEach((p) => {
        const isNearSlice = Math.abs(p.y - sliceY) < 11;
        const rad = Math.max(1.0, p.size * p.scale);

        ctx.beginPath();
        ctx.arc(p.sx, p.sy, rad, 0, Math.PI * 2);

        if (isNearSlice) {
          // Point illuminated by active 24cm microwave radar slice
          ctx.fillStyle = '#F59E0B'; // Bright glowing amber
          ctx.shadowColor = '#F59E0B';
          ctx.shadowBlur = 8;
        } else if (p.y > sliceY) {
          // Points above slice plane (slightly transparent)
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 0.55;
          ctx.shadowBlur = 0;
        } else {
          // Points below slice plane
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 0.9;
          ctx.shadowBlur = 0;
        }

        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;

        // Microwave depolarization echo rings around active slice points
        if (isNearSlice && p.scatter === 'volume') {
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, rad + 3.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // 5. Draw Glowing 24cm Microwave Laser Radar Slice Plane (Horizontal Cut)
      const sliceCorners = [
        project(-halfX, sliceY, -halfZ),
        project(halfX, sliceY, -halfZ),
        project(halfX, sliceY, halfZ),
        project(-halfX, sliceY, halfZ)
      ];

      // Translucent amber slice plane fill
      ctx.fillStyle = 'rgba(217, 119, 6, 0.12)';
      ctx.beginPath();
      ctx.moveTo(sliceCorners[0].sx, sliceCorners[0].sy);
      ctx.lineTo(sliceCorners[1].sx, sliceCorners[1].sy);
      ctx.lineTo(sliceCorners[2].sx, sliceCorners[2].sy);
      ctx.lineTo(sliceCorners[3].sx, sliceCorners[3].sy);
      ctx.closePath();
      ctx.fill();

      // Glowing slice perimeter contour
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Slice inner gridlines
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.lineWidth = 0.8;
      for (let g = -halfX + 48; g < halfX; g += 48) {
        const gp1 = project(g, sliceY, -halfZ);
        const gp2 = project(g, sliceY, halfZ);
        ctx.beginPath();
        ctx.moveTo(gp1.sx, gp1.sy);
        ctx.lineTo(gp2.sx, gp2.sy);
        ctx.stroke();
      }

      // 6. Draw Animated Descending 24cm Radar Wavefronts
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
      ctx.lineWidth = 1.2;
      const waveY = halfY - waveOffset;
      if (waveY > sliceY) {
        const wp1 = project(-halfX * 0.75, waveY, 0);
        const wp2 = project(halfX * 0.75, waveY, 0);
        ctx.beginPath();
        ctx.moveTo(wp1.sx, wp1.sy);
        ctx.lineTo(wp2.sx, wp2.sy);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [dimensions, canopyHeight, sceneElements]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 shadow-2xl flex flex-col justify-between select-none"
    >
      {/* Top Telemetry Header */}
      <div className="p-3 bg-slate-950/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between text-xs font-mono z-10">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-amber-500 animate-pulse" />
          <span className="font-bold text-stone-100 tracking-wider">
            24CM CANOPY PENETRATION CUBOID
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/40">
            GREAT RANN &bull; BANNI
          </span>
        </div>

        {/* View Mode Toggle: For Everyone / Kids vs Scientists */}
        <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-xl border border-white/10">
          <button
            onClick={() => setViewMode('kids')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${viewMode === 'kids'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
              }`}
          >
            FOR EVERYONE
          </button>
          <button
            onClick={() => setViewMode('science')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${viewMode === 'science'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-stone-400 hover:text-stone-200'
              }`}
          >
            PHYSICS
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Stage */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative flex-1 w-full min-h-[220px] sm:min-h-[260px] cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Side-by-Side Turntable Rotation Notice */}
        <div className="absolute bottom-2 left-3 pointer-events-none text-[8.5px] font-mono text-stone-400 flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded-full border border-white/10">
          <Compass className="w-3 h-3 text-amber-500 animate-spin" style={{ animationDuration: '8s' }} />
          <span>DRAG HORIZONTALLY TO ROTATE 360°</span>
        </div>
      </div>

      {/* Educational Explainer Footer (Zero Emojis) */}
      <div className="p-3 bg-slate-950/90 border-t border-white/10 text-left">
        {viewMode === 'kids' ? (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold text-emerald-400 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>SUPERHERO X-RAY VISION (EVERYDAY EXPLANATION):</span>
            </div>
            <p className="text-[11px] text-stone-300 font-sans leading-snug">
              {canopyHeight >= 2.0
                ? 'TOP OF THE FOREST (2.5m): Normal optical cameras only see the outer leafy green roof! But NISAR sends 24cm radio waves (the size of a dinner plate!) that pierce through leaves, measuring aboveground cattle forage biomass.'
                : canopyHeight >= 1.2
                  ? 'SAVANNA GRASS STALKS (1.6m): The microwaves slip straight through upper leaf clusters and bounce repeatedly against tall grass stalks, depolarizing pulses to distinguish nutritious sweet grass from invasive thorny brush.'
                  : canopyHeight >= 0.5
                    ? 'WOODY STEMS & TRUNKS (0.8m): Waves double-bounce between rigid woody stems and the ground plane, measuring tree density even in barren scrub sectors.'
                    : 'SUBSURFACE ROOTS & SOIL (0.2m): 24cm L-band microwaves penetrate dry desert salt to image residual soil moisture and binding root networks.'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-amber-400 uppercase">
              <span>NASA NISAR L-BAND SCATTERING MECHANISM:</span>
              <span className="text-emerald-400">&lambda; = 24.0 cm &bull; 1.25 GHz</span>
            </div>
            <p className="text-[10.5px] font-mono text-stone-300 leading-snug">
              {canopyHeight >= 2.0
                ? 'VOLUME SCATTERING (HV = -21.03 dB): Random multiple reflections inside leafy foliage depolarize microwave pulses into the orthogonal channel, providing biomass sensitivity up to 40–60 Mg/ha.'
                : canopyHeight >= 1.2
                  ? 'BIOMASS ALLOMETRY (HV/HH = -6.8 dB): Ratio matrix effectively decouples structural woody branches from soft photosynthetic herbaceous sweet grass (Dicanthium).'
                  : canopyHeight >= 0.5
                    ? 'DOUBLE-BOUNCE CO-POLARIZED SCATTER: Orthogonal trunk-ground dihedral reflectors produce high HH coherence, mapping Acacia nilotica tree density.'
                    : 'SURFACE DIELECTRIC ATTENUATION: Microwaves pierce dry halite salt crust (real permittivity eps\' ≈ 5.9, Gorham et al., 2001) to sense moisture contrasts in underlying alluvial silt.'}
            </p>
          </div>
        )
        }
      </div >
    </div >
  );
}
