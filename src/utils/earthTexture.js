import * as THREE from 'three';

/**
 * Generates high-definition procedural Earth textures:
 * - Day / Landmass texture with topographical relief, deserts, and borders
 * - Night / City lights glow map
 * - Atmosphere / Cloud layer with soft transparency
 */

export function createProceduralEarthTexture() {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Helper to convert lat/lon to canvas coordinates
  const toXY = (lat, lon) => {
    return [
      ((lon + 180) / 360) * width,
      ((90 - lat) / 180) * height
    ];
  };

  // 1. Deep Ocean Base with radial gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#040b17');
  oceanGrad.addColorStop(0.3, '#061325');
  oceanGrad.addColorStop(0.5, '#071830');
  oceanGrad.addColorStop(0.7, '#061325');
  oceanGrad.addColorStop(1, '#040b17');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle ocean bathymetry / coastal shelves
  ctx.fillStyle = 'rgba(12, 38, 70, 0.4)';
  ctx.lineWidth = 1;

  // 2. Graticule Lines (Coordinate Grid)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
  ctx.lineWidth = 0.8;

  // Parallels (every 30 degrees)
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = ((90 - lat) / 180) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Meridians (every 30 degrees)
  for (let lon = -150; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Highlight Tropic of Cancer (23.43° N) - exact latitude line passing through Kutch!
  const tropicY = ((90 - 23.436) / 180) * height;
  ctx.strokeStyle = 'rgba(223, 168, 95, 0.25)';
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(0, tropicY);
  ctx.lineTo(width, tropicY);
  ctx.stroke();
  ctx.setLineDash([]); // reset

  // 3. Draw Continents and Major Landmasses with rich geographic contours
  const drawPolygon = (coords, fillStyle, strokeStyle = 'rgba(56, 189, 248, 0.25)') => {
    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    coords.forEach(([lat, lon], idx) => {
      const [x, y] = toXY(lat, lon);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  // Land color themes
  const landGreen = '#142921';
  const desertGold = '#3a2c16';
  const kutchWhite = '#888f9e';

  // Eurasia (Europe + Asia major block)
  drawPolygon([
    [70, -10], [72, 30], [70, 60], [72, 100], [70, 140], [65, 170],
    [55, 160], [45, 140], [35, 120], [22, 115], [10, 105], [5, 100],
    [15, 95], [22, 90], [28, 88], [25, 80], [20, 75], [15, 73],
    [8, 77], [10, 80], [15, 80], [20, 85], [26, 88], [28, 80],
    [32, 75], [35, 65], [28, 60], [25, 55], [28, 50], [30, 48],
    [32, 35], [37, 36], [42, 28], [36, 22], [38, 15], [36, -5],
    [43, -9], [50, -5], [58, 5], [60, 25], [65, 20], [60, 5], [70, -10]
  ], landGreen);

  // Indian Subcontinent (Detailed contour highlighting Gujarat / Kutch peninsula)
  drawPolygon([
    [35, 74], [34, 76], [32, 78], [28, 88], [26, 92], [24, 91],
    [22, 89], [20, 86], [16, 82], [13, 80], [10, 79], [8.1, 77.5], // Kanyakumari
    [10, 76], [13, 74.8], [15, 73.8], [19, 72.8], [21, 72.6], // Gulf of Khambhat
    [20.8, 71.0], [21.5, 69.5], [22.4, 69.0], // Saurashtra Peninsula
    [22.8, 70.0], [23.3, 68.8], // Gulf of Kutch
    [23.83, 70.03], // Great Rann of Kutch
    [24.5, 68.5], [24.8, 69.5], [25.5, 71.0], [27.0, 71.5], // Thar border
    [30.0, 72.0], [32.5, 74.0], [35, 74]
  ], desertGold, 'rgba(245, 158, 11, 0.45)');

  // Special Highlight on Rann of Kutch: Luminous white salt bed polygon
  const [kutchX, kutchY] = toXY(23.83, 70.03);
  const kutchGrad = ctx.createRadialGradient(kutchX, kutchY, 2, kutchX, kutchY, 18);
  kutchGrad.addColorStop(0, '#ffffff');
  kutchGrad.addColorStop(0.4, 'rgba(235, 245, 255, 0.85)');
  kutchGrad.addColorStop(0.8, 'rgba(223, 168, 95, 0.5)');
  kutchGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = kutchGrad;
  ctx.beginPath();
  ctx.arc(kutchX, kutchY, 18, 0, Math.PI * 2);
  ctx.fill();

  // Africa
  drawPolygon([
    [36, -5], [37, 10], [32, 25], [31, 32], [22, 37], [12, 44],
    [11, 51], [0, 42], [-10, 40], [-25, 33], [-34, 18], [-34, 25],
    [-30, 30], [-20, 35], [-5, 12], [5, 2], [4, -8], [15, -17],
    [25, -15], [35, -7], [36, -5]
  ], desertGold);

  // North America
  drawPolygon([
    [70, -165], [70, -130], [60, -85], [55, -55], [45, -60],
    [35, -75], [25, -80], [18, -90], [15, -95], [20, -105],
    [30, -115], [38, -123], [48, -125], [58, -140], [65, -168], [70, -165]
  ], landGreen);

  // South America
  drawPolygon([
    [12, -72], [10, -60], [0, -50], [-10, -37], [-23, -42],
    [-35, -53], [-55, -67], [-52, -75], [-35, -73], [-20, -70],
    [-5, -80], [5, -78], [12, -72]
  ], landGreen);

  // Australia
  drawPolygon([
    [-12, 131], [-15, 136], [-12, 142], [-22, 150], [-32, 152],
    [-38, 145], [-35, 117], [-25, 113], [-20, 118], [-15, 125], [-12, 131]
  ], desertGold);

  // Antarctica
  drawPolygon([
    [-70, -170], [-72, -100], [-68, -40], [-65, 0], [-68, 60],
    [-66, 120], [-72, 160], [-80, 180], [-85, 0], [-70, -170]
  ], '#d8e4f0');

  // 4. City Light clusters / Starlight glow nodes
  const majorCities = [
    [23.83, 70.03, 3.5, '#ffffff'], // Kutch / Gujarat hub (super bright)
    [19.07, 72.87, 2.5, '#ffd166'], // Mumbai
    [28.61, 77.20, 2.5, '#ffd166'], // Delhi
    [51.50, -0.12, 2.2, '#ffd166'], // London
    [40.71, -74.00, 2.5, '#ffd166'], // NYC
    [35.67, 139.65, 2.5, '#ffd166'], // Tokyo
    [25.20, 55.27, 2.5, '#ffd166'], // Dubai
    [1.35, 103.81, 2.2, '#ffd166'], // Singapore
    [31.23, 121.47, 2.5, '#ffd166'], // Shanghai
  ];

  majorCities.forEach(([lat, lon, r, col]) => {
    const [cx, cy] = toXY(lat, lon);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 4);
    grad.addColorStop(0, col);
    grad.addColorStop(0.3, 'rgba(255, 215, 0, 0.8)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Random sparkle scatter across continents for night-lights effect
  ctx.fillStyle = 'rgba(255, 235, 170, 0.4)';
  for (let i = 0; i < 400; i++) {
    const rx = Math.random() * width;
    const ry = Math.random() * height;
    // Don't put lights in deep southern ocean / polar ends
    if (ry > 150 && ry < 800) {
      ctx.fillRect(rx, ry, 1, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates a procedural semi-transparent clouds texture
 */
export function createProceduralCloudsTexture() {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, width, height);

  // Soft flowing cloud bands
  for (let i = 0; i < 60; i++) {
    const cx = Math.random() * width;
    const cy = 60 + Math.random() * (height - 120);
    const rx = 40 + Math.random() * 120;
    const ry = 15 + Math.random() * 35;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((Math.random() - 0.5) * 0.4);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Converts Latitude and Longitude to 3D Cartesian Vector on a sphere of radius R
 * @param {number} lat Latitude in degrees (-90 to 90)
 * @param {number} lon Longitude in degrees (-180 to 180)
 * @param {number} radius Sphere radius
 */
export function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

