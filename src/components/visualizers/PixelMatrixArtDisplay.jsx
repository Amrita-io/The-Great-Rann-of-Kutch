import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Sparkles, Radio, Eye, RefreshCw, Sliders, Maximize2 } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

/**
 * PixelMatrixArtDisplay
 * 
 * Museum-grade Interactive Colorful LED / Phosphor Dot Matrix Display:
 * - Renders traditional Kutch mud Bhungas and indigenous wildlife (Flamingo, Wild Ass, Fox, Chinkara)
 *   as an illuminated physical pegboard / LED phosphor matrix.
 * - Interactive magnetic repulsion: touching or hovering near dots dynamically shifts and illuminates them.
 * - Real-time microwave radar scanline sweep.
 * - Smooth morphing transitions when switching subjects.
 * - Display modes: Full Spectrum LED vs Authentic NISAR Radar Phosphor.
 */

const SUBJECTS = {
  bhunga: {
    id: 'bhunga',
    name: 'TRADITIONAL MUD BHUNGA',
    subtitle: 'Hodka Village • Ancient Seismic Architecture',
    paletteTag: 'GOLDEN THATCH, CLAY & LIPAN MIRROR MANDALAS',
    imageSrc: '/assets/bhunga_real_photo.jpg',
    draw: (ctx, w, h) => {
      // Clear desert sky gradient (daylight sun as in authentic Kutch field photo)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.62);
      skyGrad.addColorStop(0, '#38bdf8');
      skyGrad.addColorStop(0.35, '#7dd3fc');
      skyGrad.addColorStop(0.75, '#bae6fd');
      skyGrad.addColorStop(1, '#fef3c7');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.62);

      // Distant pale desert horizon
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(0, h * 0.60, w, h * 0.04);

      // Sunlit earthen desert sand courtyard in foreground
      const gndGrad = ctx.createLinearGradient(0, h * 0.62, 0, h);
      gndGrad.addColorStop(0, '#fde68a');
      gndGrad.addColorStop(0.35, '#f59e0b');
      gndGrad.addColorStop(0.7, '#d97706');
      gndGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = gndGrad;
      ctx.fillRect(0, h * 0.62, w, h * 0.38);

      const cx = w * 0.5;
      const cyBase = h * 0.77;
      const baseR = w * 0.38;

      // Circular Foundation Plinth (White-painted base rim, as in photo)
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(cx, cyBase + 4, baseR + 4, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Cylindrical Rammed Mud Wall (Warm terracotta ochre clay)
      const wallH = h * 0.23;
      const wallTop = cyBase - wallH;
      const wallGrad = ctx.createLinearGradient(cx - baseR, 0, cx + baseR, 0);
      wallGrad.addColorStop(0, '#78350f');
      wallGrad.addColorStop(0.2, '#9a3412');
      wallGrad.addColorStop(0.5, '#b45309');
      wallGrad.addColorStop(0.8, '#a16207');
      wallGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(cx - baseR, wallTop, baseR * 2, wallH);

      // Wall curved base & top
      ctx.beginPath();
      ctx.ellipse(cx, cyBase, baseR, 12, 0, 0, Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx, wallTop, baseR, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Lower White Border Band running along the base of the wall
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - baseR, cyBase - 8, baseR * 2, 8);
      ctx.beginPath();
      ctx.ellipse(cx, cyBase, baseR, 10, 0, 0, Math.PI);
      ctx.fill();

      // Conical Thatched Straw Roof (Chhatra) - High conical pitch
      const apexY = wallTop - h * 0.36;
      const roofOverhang = baseR * 1.15;
      const roofGrad = ctx.createLinearGradient(cx - roofOverhang, 0, cx + roofOverhang, 0);
      roofGrad.addColorStop(0, '#854d0e');
      roofGrad.addColorStop(0.25, '#ca8a04');
      roofGrad.addColorStop(0.5, '#eab308');
      roofGrad.addColorStop(0.75, '#facc15');
      roofGrad.addColorStop(1, '#713f12');
      ctx.fillStyle = roofGrad;
      ctx.beginPath();
      ctx.moveTo(cx, apexY);
      ctx.lineTo(cx + roofOverhang, wallTop + 6);
      ctx.ellipse(cx, wallTop + 6, roofOverhang, 14, 0, 0, Math.PI);
      ctx.lineTo(cx, apexY);
      ctx.closePath();
      ctx.fill();

      // Overhanging thatched straw fringe (ragged natural fringe edge)
      ctx.fillStyle = '#a16207';
      for (let fx = cx - roofOverhang; fx <= cx + roofOverhang; fx += 6) {
        ctx.beginPath();
        ctx.moveTo(fx, wallTop + 4);
        ctx.lineTo(fx + 3, wallTop + 11 + (Math.abs(fx % 5)));
        ctx.lineTo(fx + 6, wallTop + 4);
        ctx.fill();
      }

      // Fine Thatch Texture Fibers (Radial straw ribs)
      ctx.strokeStyle = 'rgba(113, 63, 18, 0.45)';
      ctx.lineWidth = 1.2;
      for (let i = -14; i <= 14; i++) {
        ctx.beginPath();
        ctx.moveTo(cx, apexY);
        ctx.lineTo(cx + (i / 14) * roofOverhang, wallTop + 6);
        ctx.stroke();
      }

      // Horizontal thatch binding rings
      ctx.strokeStyle = 'rgba(202, 138, 4, 0.5)';
      ctx.lineWidth = 1;
      for (let ring = 0.2; ring <= 0.85; ring += 0.15) {
        const ry = apexY + ring * (wallTop - apexY);
        const rx = ring * roofOverhang;
        ctx.beginPath();
        ctx.ellipse(cx, ry, rx, rx * 0.12, 0, 0, Math.PI);
        ctx.stroke();
      }

      // Dark Apex Cap Finial (Top cap as seen in user photo)
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.roundRect(cx - 5, apexY - 6, 10, 8, [3, 3, 0, 0]);
      ctx.fill();

      // Front Centered Rectangular Doorway with Decorative Plaster Border
      const doorW = baseR * 0.32;
      const doorH = wallH * 0.78;
      const doorX = cx - doorW / 2;
      const doorY = cyBase - doorH;

      // Decorative White Plaster Arch surround around doorway
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(doorX - 7, doorY - 6, doorW + 14, doorH + 6);

      // Festive Chevron / Scallop Motifs on Doorframe (Red, Green, Blue)
      const colors = ['#dc2626', '#16a34a', '#2563eb'];
      for (let py = doorY; py < cyBase - 4; py += 7) {
        ctx.fillStyle = colors[Math.floor(py / 7) % colors.length];
        ctx.fillRect(doorX - 5.5, py, 3.5, 3.5);
        ctx.fillRect(doorX + doorW + 2, py, 3.5, 3.5);
      }

      // Yellow Painted Wooden Doorframe
      ctx.fillStyle = '#eab308';
      ctx.fillRect(doorX - 2, doorY - 1, doorW + 4, doorH + 1);

      // Deep Dark Interior
      ctx.fillStyle = '#09090b';
      ctx.fillRect(doorX + 2, doorY + 3, doorW - 4, doorH - 3);

      // Left Window with Yellow Shutter & White Decorative Frame
      const winW = baseR * 0.22;
      const winH = wallH * 0.44;
      const winY = cyBase - wallH * 0.65;
      const winLeftX = cx - baseR * 0.72;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(winLeftX - 4, winY - 4, winW + 8, winH + 8);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(winLeftX, winY, winW, winH);
      ctx.fillStyle = '#09090b';
      ctx.fillRect(winLeftX + 2, winY + 2, winW - 4, winH - 4);
      // Window shutters open outward
      ctx.fillStyle = '#facc15';
      ctx.fillRect(winLeftX - 7, winY + 1, 6, winH - 2);

      // Right Window with Yellow Shutter & White Decorative Frame
      const winRightX = cx + baseR * 0.72 - winW;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(winRightX - 4, winY - 4, winW + 8, winH + 8);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(winRightX, winY, winW, winH);
      ctx.fillStyle = '#09090b';
      ctx.fillRect(winRightX + 2, winY + 2, winW - 4, winH - 4);
      // Window shutters open outward
      ctx.fillStyle = '#facc15';
      ctx.fillRect(winRightX + winW + 1, winY + 1, 6, winH - 2);

      // Two Prominent Circular Lipan Mud-Mirror Flower Mandalas (As in user photo!)
      // Helper to draw an 8-petal multi-colored flower medallion inside a white circle
      const drawLipanMandala = (mx, my, radius) => {
        // Outer clean white circle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(mx, my, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 8 radiating colorful petals (alternating blue, red, green, yellow)
        const petalColors = ['#2563eb', '#dc2626', '#16a34a', '#eab308'];
        for (let p = 0; p < 8; p++) {
          const angle = (p / 8) * Math.PI * 2;
          const px = mx + Math.cos(angle) * (radius * 0.58);
          const py = my + Math.sin(angle) * (radius * 0.58);
          ctx.fillStyle = petalColors[p % petalColors.length];
          ctx.beginPath();
          ctx.ellipse(px, py, radius * 0.42, radius * 0.18, angle, 0, Math.PI * 2);
          ctx.fill();
        }

        // Sparkling center mirror disc
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(mx, my, radius * 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      };

      // Left Mandala between doorway and left window
      const mandalaR = baseR * 0.14;
      const mandalaY = cyBase - wallH * 0.42;
      drawLipanMandala(cx - baseR * 0.35, mandalaY, mandalaR);

      // Right Mandala between doorway and right window
      drawLipanMandala(cx + baseR * 0.35, mandalaY, mandalaR);
    }
  },

  maldhari: {
    id: 'maldhari',
    name: 'MALDHARIS & CATTLE',
    subtitle: 'Banni Pastoralists • Rotational Grazing System',
    paletteTag: 'CRIMSON PAGDIS, WHITE ATTIRE & KANKREJ CATTLE',
    imageSrc: '/assets/maldhari_cattle.png',
    draw: (ctx, w, h) => {
      ctx.fillStyle = '#b45309';
      ctx.fillRect(0, 0, w, h);
    }
  },

  flamingo: {
    id: 'flamingo',
    name: 'GREATER FLAMINGOS IN FLIGHT',
    subtitle: 'Phoenicopterus roseus • Running on Shallow Brine',
    paletteTag: 'SCARLET WINGS, JET BLACK TIPS & WATER REFLECTION',
    imageSrc: '/assets/flamingos_sunset.png',
    draw: (ctx, w, h) => {
      // 1. Brilliant azure blue sky (as in authentic Kutch flamingo photo)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.44);
      skyGrad.addColorStop(0, '#0284c7');
      skyGrad.addColorStop(0.55, '#38bdf8');
      skyGrad.addColorStop(0.9, '#7dd3fc');
      skyGrad.addColorStop(1, '#bae6fd');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.44);

      // 2. Horizon line of lush green wetland marsh reeds (reeds in background)
      const reedY = h * 0.42;
      ctx.fillStyle = '#166534';
      ctx.fillRect(0, reedY - 14, w, 18);
      // Fine vertical reed stalk silhouettes
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 1.2;
      for (let rx = 0; rx < w; rx += 4) {
        ctx.beginPath();
        ctx.moveTo(rx, reedY + 4);
        ctx.lineTo(rx + (rx % 3 - 1), reedY - 18 - (rx % 7));
        ctx.stroke();
      }

      // 3. Deep cyan and blue lake water surface
      const waterGrad = ctx.createLinearGradient(0, reedY, 0, h);
      waterGrad.addColorStop(0, '#075985');
      waterGrad.addColorStop(0.35, '#0284c7');
      waterGrad.addColorStop(0.7, '#0369a1');
      waterGrad.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, reedY, w, h - reedY);

      // Gentle horizontal surface water ripples
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;
      for (let y = reedY + 12; y < h; y += 10) {
        ctx.beginPath();
        ctx.moveTo(w * 0.05, y);
        ctx.lineTo(w * 0.95, y);
        ctx.stroke();
      }

      // Helper function to draw a running flamingo with spread wings and reflection
      const drawRunningFlamingo = (fx, fy, scale, hasReflection = true) => {
        // A. Water Reflection (drawn inverted below the water line)
        if (hasReflection) {
          ctx.save();
          ctx.globalAlpha = 0.35;
          ctx.translate(fx, fy + 58 * scale);
          ctx.scale(1, -0.75); // Inverted vertical reflection

          // Mirrored body & scarlet wings
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.ellipse(0, 0, 24 * scale, 14 * scale, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fbcfe8';
          ctx.beginPath();
          ctx.ellipse(10 * scale, -10 * scale, 12 * scale, 8 * scale, 0.3, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
          ctx.globalAlpha = 1.0;
        }

        // B. Running Legs (pink stilt legs striding through water)
        const footY = fy + 56 * scale;
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2.4 * scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        // Left trailing leg (kicking back)
        ctx.moveTo(fx - 4 * scale, fy + 14 * scale);
        ctx.lineTo(fx - 24 * scale, fy + 36 * scale);
        ctx.lineTo(fx - 34 * scale, footY - 4 * scale);
        // Right forward leg (stepping down into water)
        ctx.moveTo(fx + 6 * scale, fy + 14 * scale);
        ctx.lineTo(fx + 4 * scale, fy + 38 * scale);
        ctx.lineTo(fx + 18 * scale, footY);
        ctx.stroke();

        // Water splashing droplets at feet
        ctx.fillStyle = '#ffffff';
        for (let sp = 0; sp < 7; sp++) {
          ctx.beginPath();
          ctx.arc(fx - 30 * scale + sp * 8 * scale, footY - 2 * scale - (sp % 3) * 4 * scale, 1.4 * scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // C. Main Oval Body (Snow white with soft blush pink)
        const bodyGrad = ctx.createRadialGradient(fx, fy, 4 * scale, fx, fy, 28 * scale);
        bodyGrad.addColorStop(0, '#ffffff');
        bodyGrad.addColorStop(0.45, '#fce7f3');
        bodyGrad.addColorStop(0.85, '#f472b6');
        bodyGrad.addColorStop(1, '#e11d48');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(fx, fy, 28 * scale, 16 * scale, -0.15, 0, Math.PI * 2);
        ctx.fill();

        // D. Spread Wings (Wings raised high above body, actively flapping!)
        // Left/Back Wing raised upwards-left
        ctx.fillStyle = '#dc2626'; // Vivid scarlet red upper wing coverts
        ctx.beginPath();
        ctx.moveTo(fx - 12 * scale, fy - 6 * scale);
        ctx.lineTo(fx - 38 * scale, fy - 52 * scale);
        ctx.lineTo(fx - 18 * scale, fy - 46 * scale);
        ctx.lineTo(fx - 4 * scale, fy - 10 * scale);
        ctx.closePath();
        ctx.fill();
        // Jet black flight feathers along outer trailing edge
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.moveTo(fx - 38 * scale, fy - 52 * scale);
        ctx.lineTo(fx - 48 * scale, fy - 62 * scale);
        ctx.lineTo(fx - 28 * scale, fy - 54 * scale);
        ctx.lineTo(fx - 18 * scale, fy - 46 * scale);
        ctx.closePath();
        ctx.fill();

        // Right/Front Wing raised wide open upwards-right
        ctx.fillStyle = '#dc2626'; // Crimson scarlet
        ctx.beginPath();
        ctx.moveTo(fx + 2 * scale, fy - 8 * scale);
        ctx.lineTo(fx + 16 * scale, fy - 60 * scale);
        ctx.lineTo(fx + 38 * scale, fy - 48 * scale);
        ctx.lineTo(fx + 14 * scale, fy - 6 * scale);
        ctx.closePath();
        ctx.fill();
        // Jet black outer flight feathers
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.moveTo(fx + 16 * scale, fy - 60 * scale);
        ctx.lineTo(fx + 26 * scale, fy - 74 * scale);
        ctx.lineTo(fx + 48 * scale, fy - 58 * scale);
        ctx.lineTo(fx + 38 * scale, fy - 48 * scale);
        ctx.closePath();
        ctx.fill();

        // E. Long Slender Neck (Gracefully reaching forward)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5.5 * scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(fx + 22 * scale, fy - 4 * scale);
        ctx.bezierCurveTo(fx + 38 * scale, fy - 14 * scale, fx + 52 * scale, fy - 16 * scale, fx + 62 * scale, fy - 4 * scale);
        ctx.stroke();

        // Delicate head
        ctx.fillStyle = '#fce7f3';
        ctx.beginPath();
        ctx.ellipse(fx + 64 * scale, fy - 4 * scale, 7 * scale, 5 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Eye
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(fx + 63 * scale, fy - 6 * scale, 1.4 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(fx + 63 * scale, fy - 6 * scale, 0.7 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Curved beak (Pink base, hooked black tip)
        ctx.fillStyle = '#fda4af';
        ctx.beginPath();
        ctx.moveTo(fx + 68 * scale, fy - 4 * scale);
        ctx.lineTo(fx + 76 * scale, fy - 1 * scale);
        ctx.lineTo(fx + 78 * scale, fy + 7 * scale);
        ctx.lineTo(fx + 72 * scale, fy + 2 * scale);
        ctx.closePath();
        ctx.fill();
        // Black tip
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.moveTo(fx + 74 * scale, fy);
        ctx.lineTo(fx + 78 * scale, fy + 7 * scale);
        ctx.lineTo(fx + 72 * scale, fy + 2 * scale);
        ctx.closePath();
        ctx.fill();
      };

      // Background secondary flamingo 1 (running left)
      drawRunningFlamingo(w * 0.22, h * 0.44, 0.62, true);

      // Background secondary flamingo 2 (taking off right)
      drawRunningFlamingo(w * 0.78, h * 0.43, 0.65, true);

      // Foreground Hero Flamingo (centered, high wings, powerful stride!)
      drawRunningFlamingo(w * 0.48, h * 0.48, 1.05, true);
    }
  },

  wild_ass: {
    id: 'wild_ass',
    name: 'INDIAN WILD ASS (KHUR)',
    subtitle: 'Equus hemionus khur • Saline Mudflat Champion',
    paletteTag: 'CHESTNUT, TAWNY GOLD & CRYSTALLINE SALT',
    imageSrc: '/assets/wild_ass_herd.jpg',
    draw: (ctx, w, h) => {
      // Vast Rann horizon at daylight
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.5);
      skyGrad.addColorStop(0, '#0284c7');
      skyGrad.addColorStop(0.7, '#bae6fd');
      skyGrad.addColorStop(1, '#fef08a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.5);

      // Endless white-gold salt playa
      const playaGrad = ctx.createLinearGradient(0, h * 0.5, 0, h);
      playaGrad.addColorStop(0, '#fef9c3');
      playaGrad.addColorStop(0.4, '#ffffff');
      playaGrad.addColorStop(1, '#d6d3d1');
      ctx.fillStyle = playaGrad;
      ctx.fillRect(0, h * 0.5, w, h * 0.5);

      // Salt polygon desiccation lines
      ctx.strokeStyle = 'rgba(214, 211, 209, 0.7)';
      ctx.lineWidth = 1.2;
      for (let x = 0; x < w; x += 22) {
        ctx.strokeRect(x, h * 0.65 + (x % 9) * 4, 26, 16);
      }

      const ax = w * 0.52;
      const ay = h * 0.52;

      // Ground Cast Shadow
      ctx.fillStyle = 'rgba(68, 64, 60, 0.35)';
      ctx.beginPath();
      ctx.ellipse(ax + 5, ay + 78, 54, 12, 0.05, 0, Math.PI * 2);
      ctx.fill();

      // Slender Athletic Legs
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      // Back legs
      ctx.moveTo(ax - 32, ay + 15);
      ctx.lineTo(ax - 38, ay + 45);
      ctx.lineTo(ax - 35, ay + 75);
      ctx.moveTo(ax - 22, ay + 15);
      ctx.lineTo(ax - 26, ay + 48);
      ctx.lineTo(ax - 22, ay + 75);
      // Front legs
      ctx.moveTo(ax + 24, ay + 15);
      ctx.lineTo(ax + 28, ay + 48);
      ctx.lineTo(ax + 26, ay + 75);
      ctx.moveTo(ax + 34, ay + 15);
      ctx.lineTo(ax + 40, ay + 48);
      ctx.lineTo(ax + 38, ay + 75);
      ctx.stroke();

      // Dark hooves
      ctx.fillStyle = '#292524';
      [ax - 35, ax - 22, ax + 26, ax + 38].forEach((hx) => {
        ctx.fillRect(hx - 3, ay + 73, 6, 5);
      });

      // Muscular Torso (Tawny Chestnut upper coat, white belly)
      const bodyGrad = ctx.createLinearGradient(ax, ay - 24, ax, ay + 20);
      bodyGrad.addColorStop(0, '#78350f');
      bodyGrad.addColorStop(0.35, '#b45309');
      bodyGrad.addColorStop(0.7, '#d97706');
      bodyGrad.addColorStop(1, '#ffffff');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(ax, ay + 5, 42, 22, 0.02, 0, Math.PI * 2);
      ctx.fill();

      // Muscular Neck reaching upward
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.moveTo(ax + 24, ay - 4);
      ctx.lineTo(ax + 44, ay - 42);
      ctx.lineTo(ax + 30, ay - 48);
      ctx.lineTo(ax + 12, ay - 10);
      ctx.closePath();
      ctx.fill();

      // Erect Dark Dorsal Mane
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(ax + 14, ay - 10);
      ctx.lineTo(ax + 34, ay - 46);
      ctx.stroke();

      // Head & White Muzzle
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.ellipse(ax + 45, ay - 50, 16, 10, -0.3, 0, Math.PI * 2);
      ctx.fill();
      // White muzzle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(ax + 56, ay - 46, 8, 6, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Alert Upright Ears
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(ax + 34, ay - 55);
      ctx.lineTo(ax + 38, ay - 74);
      ctx.lineTo(ax + 42, ay - 57);
      ctx.closePath();
      ctx.fill();

      // Dark Eye & Nostril
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(ax + 46, ay - 52, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.arc(ax + 60, ay - 46, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Tail with dark tassel
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(ax - 40, ay + 2);
      ctx.bezierCurveTo(ax - 52, ay + 15, ax - 48, ay + 42, ax - 45, ay + 55);
      ctx.stroke();
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.ellipse(ax - 45, ay + 56, 4, 8, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  desert_fox: {
    id: 'desert_fox',
    name: 'WHITE-FOOTED DESERT FOX',
    subtitle: 'Vulpes vulpes pusilla • Twilight Dune Stalker',
    paletteTag: 'SANDY BUFF, AMBER GLOW & BUSHY WHITE TIP',
    imageSrc: '/assets/desert_fox.jpg',
    draw: (ctx, w, h) => {
      // Twilight dusk over savanna scrub
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
      skyGrad.addColorStop(0, '#312e81');
      skyGrad.addColorStop(0.5, '#701a75');
      skyGrad.addColorStop(0.85, '#c2410c');
      skyGrad.addColorStop(1, '#f59e0b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.6);

      // Sandy desert dune
      const duneGrad = ctx.createLinearGradient(0, h * 0.55, 0, h);
      duneGrad.addColorStop(0, '#92400e');
      duneGrad.addColorStop(0.5, '#b45309');
      duneGrad.addColorStop(1, '#451a03');
      ctx.fillStyle = duneGrad;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.58);
      ctx.bezierCurveTo(w * 0.4, h * 0.52, w * 0.7, h * 0.62, w, h * 0.56);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      const fx = w * 0.5;
      const fy = h * 0.58;

      // Shadow
      ctx.fillStyle = 'rgba(28, 25, 23, 0.4)';
      ctx.beginPath();
      ctx.ellipse(fx, fy + 58, 48, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Slender Legs with White Paws
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(fx - 18, fy + 15);
      ctx.lineTo(fx - 22, fy + 56);
      ctx.moveTo(fx - 8, fy + 15);
      ctx.lineTo(fx - 12, fy + 56);
      ctx.moveTo(fx + 14, fy + 15);
      ctx.lineTo(fx + 16, fy + 56);
      ctx.moveTo(fx + 24, fy + 15);
      ctx.lineTo(fx + 28, fy + 56);
      ctx.stroke();

      // White Socks / Paws
      ctx.fillStyle = '#ffffff';
      [-22, -12, 16, 28].forEach((px) => {
        ctx.beginPath();
        ctx.ellipse(fx + px, fy + 56, 3.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Bushy Plumed Tail with Signature White Tip
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(fx - 36, fy + 24, 26, 12, -0.45, 0, Math.PI * 2);
      ctx.fill();
      // White tail tip
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(fx - 56, fy + 33, 9, 6, -0.45, 0, Math.PI * 2);
      ctx.fill();

      // Sleek Torso (Golden fawn coat)
      const bodyGrad = ctx.createLinearGradient(fx - 24, fy - 10, fx + 24, fy + 10);
      bodyGrad.addColorStop(0, '#b45309');
      bodyGrad.addColorStop(0.5, '#f59e0b');
      bodyGrad.addColorStop(1, '#ffffff');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(fx, fy + 12, 28, 16, 0.05, 0, Math.PI * 2);
      ctx.fill();

      // Chest & White Bib
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(fx + 18, fy + 4, 10, 14, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Triangular Head
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(fx + 16, fy - 8);
      ctx.lineTo(fx + 42, fy - 4);
      ctx.lineTo(fx + 26, fy - 22);
      ctx.closePath();
      ctx.fill();

      // White cheek patches
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(fx + 26, fy - 6, 8, 5, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Prominent Desert Fox Ears (Large adaptive heat-radiators)
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(fx + 14, fy - 18);
      ctx.lineTo(fx + 18, fy - 48);
      ctx.lineTo(fx + 28, fy - 22);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(fx + 26, fy - 22);
      ctx.lineTo(fx + 34, fy - 50);
      ctx.lineTo(fx + 40, fy - 20);
      ctx.closePath();
      ctx.fill();

      // White inner ear fuzz
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(fx + 17, fy - 22);
      ctx.lineTo(fx + 19, fy - 42);
      ctx.lineTo(fx + 25, fy - 24);
      ctx.closePath();
      ctx.fill();

      // Inquisitive Golden Eyes
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(fx + 28, fy - 14, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(fx + 28, fy - 14, 1.4, 0, Math.PI * 2);
      ctx.fill();

      // Black Nose tip
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(fx + 42, fy - 4, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  chinkara: {
    id: 'chinkara',
    name: 'INDIAN GAZELLE (CHINKARA)',
    subtitle: 'Gazella bennettii • Savanna Grassland Sprinter',
    paletteTag: 'FAWN BUFF, LYRE HORNS & EMERALD SAVANNA',
    draw: (ctx, w, h) => {
      // Golden Savanna sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.55);
      skyGrad.addColorStop(0, '#0369a1');
      skyGrad.addColorStop(0.6, '#38bdf8');
      skyGrad.addColorStop(1, '#fef08a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.55);

      // Lush Banni sweet grass pasture
      const grassGrad = ctx.createLinearGradient(0, h * 0.55, 0, h);
      grassGrad.addColorStop(0, '#065f46');
      grassGrad.addColorStop(0.3, '#047857');
      grassGrad.addColorStop(0.7, '#10b981');
      grassGrad.addColorStop(1, '#064e3b');
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, h * 0.55, w, h * 0.45);

      // Tall vertical grass stalks
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.2;
      for (let x = 0; x < w; x += 10) {
        ctx.beginPath();
        ctx.moveTo(x, h);
        ctx.quadraticCurveTo(x + (x % 5) * 2, h * 0.72, x + 4, h * 0.58);
        ctx.stroke();
      }

      const gx = w * 0.48;
      const gy = h * 0.52;

      // Shadow
      ctx.fillStyle = 'rgba(6, 78, 59, 0.45)';
      ctx.beginPath();
      ctx.ellipse(gx + 2, gy + 72, 46, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Slender Gazelle Legs
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(gx - 24, ay => gy + 15);
      ctx.lineTo(gx - 28, gy + 42);
      ctx.lineTo(gx - 26, gy + 70);
      ctx.moveTo(gx - 14, gy + 15);
      ctx.lineTo(gx - 16, gy + 44);
      ctx.lineTo(gx - 14, gy + 70);
      ctx.moveTo(gx + 18, gy + 15);
      ctx.lineTo(gx + 22, gy + 44);
      ctx.lineTo(gx + 20, gy + 70);
      ctx.moveTo(gx + 28, gy + 15);
      ctx.lineTo(gx + 32, gy + 44);
      ctx.lineTo(gx + 30, gy + 70);
      ctx.stroke();

      // White underside & belly
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(gx + 2, gy + 12, 28, 12, 0.05, 0, Math.PI * 2);
      ctx.fill();

      // Graceful Torso (Rich fawn & cinnamon coat)
      const bodyGrad = ctx.createLinearGradient(gx, gy - 20, gx, gy + 12);
      bodyGrad.addColorStop(0, '#78350f');
      bodyGrad.addColorStop(0.4, '#b45309');
      bodyGrad.addColorStop(0.8, '#d97706');
      bodyGrad.addColorStop(1, '#ffffff');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(gx, gy + 4, 34, 18, -0.05, 0, Math.PI * 2);
      ctx.fill();

      // Long Graceful Slender Neck
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.moveTo(gx + 18, gy - 2);
      ctx.lineTo(gx + 34, gy - 40);
      ctx.lineTo(gx + 22, gy - 44);
      ctx.lineTo(gx + 8, gy - 6);
      ctx.closePath();
      ctx.fill();

      // Delicate Head
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(gx + 34, gy - 48, 14, 9, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Dark Facial Eye Stripes
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(gx + 30, gy - 54);
      ctx.lineTo(gx + 44, gy - 46);
      ctx.stroke();

      // Large Liquid Dark Eyes
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(gx + 32, gy - 51, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(gx + 33, gy - 52, 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Distinct S-Curved Ringed Lyre Horns
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      // Back horn
      ctx.moveTo(gx + 26, gy - 54);
      ctx.bezierCurveTo(gx + 22, gy - 74, gx + 26, gy - 88, gx + 34, gy - 98);
      // Front horn
      ctx.moveTo(gx + 30, gy - 54);
      ctx.bezierCurveTo(gx + 26, gy - 76, gx + 32, gy - 92, gx + 42, gy - 102);
      ctx.stroke();

      // Horn transverse ridges
      ctx.strokeStyle = '#78716c';
      ctx.lineWidth = 1;
      for (let h = 0; h < 5; h++) {
        ctx.beginPath();
        ctx.moveTo(gx + 24 + h * 2, gy - 64 - h * 6);
        ctx.lineTo(gx + 28 + h * 2, gy - 62 - h * 6);
        ctx.stroke();
      }
    }
  },

  lizard: {
    id: 'lizard',
    name: 'SPINY-TAILED LIZARD',
    subtitle: 'Saara hardwickii • Keystone Herbivorous Reptile',
    paletteTag: 'EARTHEN OCHRE, TAIL SPINES & BANNI CLAY',
    imageSrc: '/assets/spiny_tailed_lizard.png',
    draw: (ctx, w, h) => {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, 0, w, h);
    }
  }
};

// Aliases for seamless fauna synchronization
SUBJECTS.khur = SUBJECTS.wild_ass;
SUBJECTS.fox = SUBJECTS.desert_fox;

export default function PixelMatrixArtDisplay({
  initialSubject = 'bhunga',
  showSubjectSelector = true,
  onSubjectChange
}) {
  const [currentSubjectKey, setCurrentSubjectKey] = useState(initialSubject);
  const colorMode = 'spectrum'; // Locked strictly to authentic full-spectrum LED color
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const mousePosRef = useRef({ x: -999, y: -999, active: false });
  const [dimensions, setDimensions] = useState({ width: 560, height: 420 });

  // Ultra High-Definition Grid resolution: 112 cols x 80 rows = 8,960 responsive LED phosphor beads!
  const COLS = 112;
  const ROWS = 80;

  // Preload and cache authentic high-resolution photographs
  const [cachedImages, setCachedImages] = useState({});

  useEffect(() => {
    Object.entries(SUBJECTS).forEach(([key, s]) => {
      if (s.imageSrc) {
        const img = new Image();
        img.src = s.imageSrc;
        img.onload = () => {
          setCachedImages((prev) => ({
            ...prev,
            [key]: img,
            [s.id]: img
          }));
        };
      }
    });
  }, []);

  // Offscreen buffer canvas to sample raw pixel data directly from photo or vector artwork
  const sampleData = useMemo(() => {
    const offscreen = document.createElement('canvas');
    offscreen.width = COLS;
    offscreen.height = ROWS;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return [];

    const subject = SUBJECTS[currentSubjectKey] || SUBJECTS.bhunga;
    offCtx.clearRect(0, 0, COLS, ROWS);

    const loadedImg = cachedImages[currentSubjectKey] || (subject?.id && cachedImages[subject.id]);
    if (loadedImg && loadedImg.complete && loadedImg.naturalWidth > 0) {
      const imgW = loadedImg.naturalWidth;
      const imgH = loadedImg.naturalHeight;

      // True edge-to-edge cover: image covers 100% of the grid with zero letterbox / background margin
      const scale = Math.max(COLS / imgW, ROWS / imgH);
      const dw = imgW * scale;
      const dh = imgH * scale;
      const dx = (COLS - dw) / 2;
      const dy = (ROWS - dh) / 2;
      offCtx.drawImage(loadedImg, dx, dy, dw, dh);
    } else {
      subject.draw(offCtx, COLS, ROWS);
    }

    const imgData = offCtx.getImageData(0, 0, COLS, ROWS).data;
    const pixels = [];

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const idx = (r * COLS + c) * 4;
        const red = imgData[idx];
        const green = imgData[idx + 1];
        const blue = imgData[idx + 2];
        const alpha = imgData[idx + 3] / 255;
        // Perceptual luminance
        const lum = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

        pixels.push({
          col: c,
          row: r,
          r: red,
          g: green,
          b: blue,
          alpha,
          lum
        });
      }
    }
    return pixels;
  }, [currentSubjectKey, cachedImages]);

  // Keep state synced with prop
  useEffect(() => {
    if (initialSubject && SUBJECTS[initialSubject]) {
      setCurrentSubjectKey(initialSubject);
    }
  }, [initialSubject]);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 50 && rect.height > 50) {
        setDimensions({
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Main Render Animation Loop with Magnetic Interaction (Zero Scanline Overlay)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    let animId;

    const render = () => {
      const w = dimensions.width;
      const h = dimensions.height;
      ctx.clearRect(0, 0, w, h);

      // Dark obsidian matrix substrate background
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, w, h);

      const cellW = w / COLS;
      const cellH = h / ROWS;
      const maxR = Math.min(cellW, cellH) * 0.44;

      const mx = mousePosRef.current.x;
      const my = mousePosRef.current.y;
      const isMouseActive = mousePosRef.current.active;

      // Draw all illuminated LED matrix elements
      sampleData.forEach((p) => {
        const baseCx = (p.col + 0.5) * cellW;
        const baseCy = (p.row + 0.5) * cellH;

        // Interactive Magnetic Displacement Physics
        let cx = baseCx;
        let cy = baseCy;
        let mouseDistFactor = 0;

        if (isMouseActive) {
          const dx = baseCx - mx;
          const dy = baseCy - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 80;

          if (dist < maxDist && dist > 0.1) {
            // Magnetic repulsive force pushing dots away from touch/cursor
            const force = (1 - dist / maxDist) * 7.5;
            cx += (dx / dist) * force;
            cy += (dy / dist) * force;
            mouseDistFactor = (1 - dist / maxDist);
          }
        }

        // Base dot radius determined by luminance
        let dotRadius = Math.max(1.1, maxR * (0.62 + p.lum * 0.38));
        if (mouseDistFactor > 0) dotRadius = Math.min(maxR * 1.35, dotRadius * (1 + mouseDistFactor * 0.45));

        // Full spectrum authentic photographic color with interactive magnetic radiance
        const r = Math.min(255, Math.round(p.r * (1 + mouseDistFactor * 0.35)));
        const g = Math.min(255, Math.round(p.g * (1 + mouseDistFactor * 0.35)));
        const b = Math.min(255, Math.round(p.b * (1 + mouseDistFactor * 0.35)));
        const dotFill = `rgba(${r}, ${g}, ${b}, ${Math.max(0.60, p.alpha)})`;

        // Phosphor Core Bead
        ctx.fillStyle = dotFill;
        ctx.beginPath();
        ctx.arc(cx, cy, dotRadius, 0, Math.PI * 2);
        ctx.fill();

        // High-energy highlight reflection on bright dots (glass phosphor peg glint)
        if (mouseDistFactor > 0.3 || p.lum > 0.70) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.70)';
          ctx.beginPath();
          ctx.arc(cx - dotRadius * 0.25, cy - dotRadius * 0.25, Math.max(0.6, dotRadius * 0.28), 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [dimensions, sampleData]);

  // Pointer event handlers for magnetic interaction
  const handlePointerMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true
    };
  };

  const handlePointerLeave = () => {
    mousePosRef.current = { x: -999, y: -999, active: false };
  };

  const currentProfile = SUBJECTS[currentSubjectKey] || SUBJECTS.bhunga;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 shadow-2xl flex flex-col justify-between select-none font-sans"
    >
      {/* Top Header: Subject Title & Spectrum LED Badge (Zero Mode Switcher) */}
      <div className="p-3 bg-stone-900/95 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 z-10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <div>
            <div className="text-[11px] font-mono font-bold tracking-wider text-white uppercase">
              {currentProfile.name}
            </div>
            <div className="text-[9px] font-mono text-amber-400">
              {currentProfile.subtitle}
            </div>
          </div>
        </div>

        {/* Locked Spectrum LED Mode Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 font-mono text-[9.5px] font-bold">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>SPECTRUM LED MATRIX</span>
        </div>
      </div>

      {/* Main Interactive Canvas Matrix Stage */}
      <div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative flex-1 w-full min-h-[220px] sm:min-h-[260px] flex items-center justify-center overflow-hidden cursor-crosshair"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Interaction Hint Badge */}
        <div className="absolute bottom-2 left-3 pointer-events-none text-[8.5px] font-mono text-stone-300 flex items-center gap-1.5 bg-black/85 px-3 py-1 rounded-full border border-amber-500/30 shadow-lg backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span>8,960 HIGH-DENSITY INTERACTIVE BEADS &bull; TOUCH OR HOVER TO TRIGGER MAGNETIC RIPPLE</span>
        </div>
      </div>

      {/* Optional Subject Switcher Strip */}
      {showSubjectSelector && (
        <div className="p-2 bg-stone-900/90 border-t border-white/10 flex items-center justify-between gap-1 overflow-x-auto z-10">
          {Object.values(SUBJECTS).map((sub) => {
            const isActive = currentSubjectKey === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => {
                  try { soundEngine.playClick(); } catch (e) {}
                  setCurrentSubjectKey(sub.id);
                  if (onSubjectChange) onSubjectChange(sub.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-[9.5px] font-mono font-bold transition-all cursor-pointer truncate flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'bg-black/40 hover:bg-black/60 text-stone-300 border border-white/5'
                }`}
              >
                <span>{sub.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
