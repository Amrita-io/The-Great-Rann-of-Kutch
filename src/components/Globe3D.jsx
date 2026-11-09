import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { Plus, Minus, RotateCcw, ArrowRight } from 'lucide-react';
import { latLonToVector3 } from '../utils/earthTexture';
import { DESTINATIONS } from '../data/destinations';
import { soundEngine } from '../utils/audio';

// Helper for shortest angular rotation (never spins wildly across full turns)
function getShortestAngle(from, to) {
  const diff = (to - from) % (Math.PI * 2);
  const normalized = ((diff + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  return from + normalized;
}

export default function Globe3D({ onSelectDestination, isTransitioning, setIsTransitioning, isReturning = false }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const worldEarthRigRef = useRef(null);
  const earthGroupRef = useRef(null);
  const cloudsRef = useRef(null);
  const markerGroupRef = useRef(null);
  const headMeshRef = useRef(null);
  const waveMeshRef = useRef(null);
  const waveMatRef = useRef(null);
  const waveMesh2Ref = useRef(null);
  const waveMat2Ref = useRef(null);
  const animFrameIdRef = useRef(null);

  // Capture initial return state on mount to avoid re-triggering WebGL canvas teardown
  const isReturningInitial = useRef(isReturning).current;

  // Intro Landing View State (Matches user reference image)
  const [isIntro, setIsIntro] = useState(true);
  const [isStoryStarting, setIsStoryStarting] = useState(isReturningInitial);

  // Interaction refs
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  
  // Base alignment angle to center Western India (Great Rann of Kutch: 23.83° N, 70.03° E)
  // Upright Earth (rotX = 0)
  const KUTCH_ROT_Y = -2.793;
  const KUTCH_ROT_X = 0.0;
  const KUTCH_WORLD_Y = 0.909;

  const targetRotationRef = useRef({ x: KUTCH_ROT_X, y: KUTCH_ROT_Y });
  const currentRotationRef = useRef({ x: KUTCH_ROT_X, y: KUTCH_ROT_Y });
  const isAutoRotatingRef = useRef(true);

  // 2D screen coordinate locked onto Kutch beacon
  const [pinScreenPos, setPinScreenPos] = useState({ x: 0, y: 0, visible: false });

  const featuredDest = DESTINATIONS[0]; // Great Rann of Kutch

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const aspect = width / height;

    // 1. Scene & Camera (Responsive FOV: adapts to mobile portrait & widescreen)
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const initialFov = aspect < 1.0 ? 46 : 38;
    const camera = new THREE.PerspectiveCamera(initialFov, aspect, 0.1, 1000);
    camera.position.set(0, isReturningInitial ? KUTCH_WORLD_Y : 0, isReturningInitial ? 2.70 : 6.2);
    cameraRef.current = camera;

    // 2. High-Performance WebGL Renderer (Photographically Calibrated Exposure)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0; // Clean photographic exposure (prevents white blowout)
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Balanced Celestial Sunlight from Upper-Right (Photorealistic Exposure)
    // Positive z lights the daytime hemisphere and gives rich blue oceans and atmospheric scattering
    const sunDirection = new THREE.Vector3(1.6, 1.0, 0.7).normalize();

    const sunLight = new THREE.DirectionalLight(0xfffaee, 2.4);
    sunLight.position.copy(sunDirection.clone().multiplyScalar(15));
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x0a1424, 0.85);
    scene.add(ambientLight);

    const rimLight = new THREE.DirectionalLight(0x182e4a, 0.35);
    rimLight.position.set(-5, -2, -3);
    scene.add(rimLight);

    // 4. Load Pristine Clean 2K Textures
    const textureLoader = new THREE.TextureLoader();
    const dayTexture = textureLoader.load('/assets/earth/earth_day_2k.jpg');
    const nightTexture = textureLoader.load('/assets/earth/earth_night_2k.jpg');
    const specularTexture = textureLoader.load('/assets/earth/earth_specular.jpg');
    const normalTexture = textureLoader.load('/assets/earth/earth_normal.jpg');
    const cloudsTexture = textureLoader.load('/assets/earth/earth_clouds_2k.jpg');

    [dayTexture, nightTexture, specularTexture, normalTexture, cloudsTexture].forEach(tex => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
    });

    // 5. Earth Sphere Group & Parent World Rig
    const worldEarthRig = new THREE.Group();
    worldEarthRigRef.current = worldEarthRig;
    scene.add(worldEarthRig);

    const earthGroup = new THREE.Group();
    earthGroupRef.current = earthGroup;
    worldEarthRig.add(earthGroup);

    // Initial positioning: In intro view, Earth sits in lower viewport; in orbit view, centered
    if (isReturningInitial) {
      worldEarthRig.position.y = 0.0;
    } else if (isIntro) {
      worldEarthRig.position.y = -3.28;
    } else {
      worldEarthRig.position.y = 0.0;
    }

    if (isReturningInitial) {
      // In reverse return from Kutch: start with UI hidden while camera pulls out
      setIsIntro(true);
      setIsStoryStarting(true);

      // Camera starts zoomed into Gujarat
      camera.position.set(0, KUTCH_WORLD_Y, 2.34);
      camera.fov = 22;
      camera.updateProjectionMatrix();

      worldEarthRig.position.y = 0.0;
      targetRotationRef.current.y = KUTCH_ROT_Y;
      currentRotationRef.current.y = KUTCH_ROT_Y;
      earthGroup.rotation.y = KUTCH_ROT_Y;

      // Ensure mountRef opacity is 1 and blur is cleared
      if (mountRef.current) {
        mountRef.current.style.opacity = '1';
        mountRef.current.style.filter = 'none';
        mountRef.current.style.transform = 'scale(1)';
      }

      // Reverse animation: Camera moves out of Gujarat, Earth lowers to bottom, and main intro view reappears
      const tl = gsap.timeline({
        onComplete: () => {
          setIsStoryStarting(false); // Main view with title and START button re-emerges!
        }
      });

      tl.to(camera.position, {
        x: 0,
        y: 0,
        z: 6.2,
        duration: 1.8,
        ease: 'power2.out'
      }, 0);

      tl.to(camera, {
        fov: aspect < 1.0 ? 46 : 38,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: () => camera.updateProjectionMatrix()
      }, 0);

      tl.to(worldEarthRig.position, {
        y: -3.28,
        duration: 1.8,
        ease: 'power2.inOut'
      }, 0.2);

      const startRotY = KUTCH_ROT_Y + 1.85;
      tl.to(targetRotationRef.current, {
        y: startRotY,
        duration: 1.8,
        ease: 'power2.inOut'
      }, 0.2);
    }

    const earthRadius = 2.25;
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 96, 96);

    const earthMaterial = new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: dayTexture },
        nightTexture: { value: nightTexture },
        specularMap: { value: specularTexture },
        normalMap: { value: normalTexture },
        sunDirection: { value: sunDirection }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform sampler2D specularMap;
        uniform sampler2D normalMap;
        uniform vec3 sunDirection;

        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vec3 N = normalize(vWorldNormal);
          vec3 L = normalize(sunDirection);
          vec3 V = normalize(cameraPosition - vWorldPosition);

          float NdotL = dot(N, L);

          // Smooth twilight / day transition across the globe
          float dayFactor   = smoothstep(-0.08, 0.22, NdotL);
          float nightFactor = 1.0 - smoothstep(-0.16, 0.10, NdotL);

          vec4 dayColor   = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);
          float specMask  = texture2D(specularMap, vUv).r;

          // Land mask: strictly 1.0 on land, 0.0 on ocean
          float isLand = 1.0 - smoothstep(0.04, 0.22, specMask);

          // Authentic incandescent city lights strictly on land
          float rawLight = max(nightColor.r, max(nightColor.g, nightColor.b));
          float lightVal = smoothstep(0.08, 0.85, rawLight) * isLand;

          vec3 amberGold = vec3(1.0, 0.72, 0.28);
          vec3 hotCore   = vec3(1.0, 0.96, 0.84);
          vec3 cityCol   = mix(amberGold, hotCore, smoothstep(0.35, 0.85, rawLight));
          vec3 cityLights = cityCol * (pow(lightVal, 1.25) * 5.2 + pow(smoothstep(0.40, 0.95, rawLight) * isLand, 2.0) * 3.5) * nightFactor;

          // Night / Twilight Base: deep rich sapphire navy ocean, dark natural terrain contours
          vec3 oceanNight = vec3(0.008, 0.018, 0.048) * specMask;
          vec3 landNight  = dayColor.rgb * 0.06 * isLand;
          vec3 nightBase  = (oceanNight + landNight) * nightFactor;

          // Sunlit Day side: rich, vibrant photographic blue marble (natural diffuse illumination, NO whiteout!)
          float diffuse = clamp(NdotL, 0.0, 1.0);
          vec3 dayEnhanced = dayColor.rgb;
          // Enhance rich oceanic sapphire tone
          dayEnhanced.b = mix(dayEnhanced.b, min(dayEnhanced.b * 1.12, 1.0), specMask);
          vec3 litDay = dayEnhanced * (diffuse * 0.92 + 0.08);

          // Ocean Specular Glint: sharp, focused photographic water reflection
          vec3 H = normalize(L + V);
          float specAngle = max(dot(N, H), 0.0);
          float specular = pow(specAngle, 64.0) * specMask * max(NdotL, 0.0);
          vec3 specColor = vec3(1.0, 0.97, 0.92) * (specular * 1.5);

          // Razor-thin Rayleigh atmospheric scattering along the horizon curvature
          float NdotV = max(dot(N, V), 0.0);
          float edgeFresnel = pow(1.0 - NdotV, 3.8);

          vec3 rimBlue = vec3(0.18, 0.58, 1.0);
          vec3 rimDawn = vec3(1.0, 0.80, 0.50);
          float dawnFactor = smoothstep(-0.06, 0.16, NdotL) * (1.0 - smoothstep(0.16, 0.42, NdotL));
          vec3 rimColor = mix(rimBlue, rimDawn, dawnFactor * 0.75);
          vec3 atmosGlow = rimColor * edgeFresnel * (dayFactor * 1.1 + 0.22);

          // Combine day, night, city lights, ocean sheen, and atmosphere
          vec3 surfaceColor = mix(nightBase + cityLights, litDay + cityLights * 0.12, dayFactor);
          vec3 finalColor = surfaceColor + specColor + atmosGlow;

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    });

    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earthMesh);

    // 6. Photorealistic Volumetric Clouds (Crisp white on day side, silvery wisps on night side)
    const cloudsGeometry = new THREE.SphereGeometry(earthRadius + 0.015, 96, 96);
    const cloudsMaterial = new THREE.ShaderMaterial({
      uniforms: {
        cloudTexture: { value: cloudsTexture },
        sunDirection: { value: sunDirection }
      },
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D cloudTexture;
        uniform vec3 sunDirection;

        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          float cloudVal = texture2D(cloudTexture, vUv).r;

          // High-contrast cloud masking: eliminates JPEG noise/gray fog completely (< 0.24 is 100% transparent!)
          float cloudDensity = smoothstep(0.24, 0.80, cloudVal);

          if (cloudDensity <= 0.005) {
            discard;
          }

          vec3 N = normalize(vWorldNormal);
          vec3 L = normalize(sunDirection);

          float NdotL = dot(N, L);
          float dayFactor = smoothstep(-0.08, 0.20, NdotL);

          // Clouds: crisp white with subtle self-shadowing on day side, dark slate wisps on night side
          vec3 dayClouds   = vec3(1.0, 1.0, 1.0) * (clamp(NdotL, 0.0, 1.0) * 0.35 + 0.65);
          vec3 nightClouds = vec3(0.04, 0.07, 0.14);
          vec3 cloudColor  = mix(nightClouds, dayClouds, dayFactor);

          // Natural cloud opacity: dense cloud masses reach ~0.85, wisps ~0.3
          float opacity = cloudDensity * (dayFactor * 0.62 + 0.26);

          gl_FragColor = vec4(cloudColor, opacity);
        }
      `
    });

    const cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    cloudsRef.current = cloudsMesh;
    earthGroup.add(cloudsMesh);

    // 7. Razor-Thin Rayleigh Atmospheric Rim Shell
    const atmosphereGeo = new THREE.SphereGeometry(earthRadius * 1.018, 96, 96);
    const atmosphereMat = new THREE.ShaderMaterial({
      uniforms: {
        sunDirection: { value: sunDirection }
      },
      vertexShader: `
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 sunDirection;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vec3 N = normalize(vWorldNormal);
          vec3 V = normalize(cameraPosition - vWorldPosition);
          vec3 L = normalize(sunDirection);

          // Razor-thin exponential limb falloff strictly at the outer perimeter
          float limb = 1.0 - abs(dot(N, V));
          float rimGlow = pow(clamp(limb, 0.0, 1.0), 4.2);

          // Sunlight alignment: atmosphere is brightly lit on the day/sunlit side
          float sunDot = dot(N, L);
          float daySide = smoothstep(-0.25, 0.35, sunDot);

          // Rayleigh scattering palette: electric cyan-blue with subtle golden sunrise tint near peak sun
          vec3 cyanAtmosphere = vec3(0.14, 0.58, 1.0);
          vec3 warmSunrise    = vec3(1.0, 0.92, 0.80);
          float sunAlignment  = max(dot(N, L), 0.0);
          vec3 atmosColor     = mix(cyanAtmosphere, warmSunrise, pow(sunAlignment, 3.5) * 0.55);

          // Intensity: crisp, razor-thin luminous arc on day side; faint, delicate night airglow
          float intensity = rimGlow * (daySide * 1.1 + 0.16);

          gl_FragColor = vec4(atmosColor, intensity);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    worldEarthRig.add(atmosphereMesh);

    // 8. Authentic Horizon Sunrise Starburst (Razor-sharp diffraction spikes on the horizon limb)
    const sunCanvas = document.createElement('canvas');
    sunCanvas.width = 256;
    sunCanvas.height = 256;
    const sctx = sunCanvas.getContext('2d');
    const cx = 128, cy = 128;

    // Soft warm outer aura
    const outerGrad = sctx.createRadialGradient(cx, cy, 0, cx, cy, 120);
    outerGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    outerGrad.addColorStop(0.08, 'rgba(255, 248, 220, 0.9)');
    outerGrad.addColorStop(0.25, 'rgba(180, 225, 255, 0.35)');
    outerGrad.addColorStop(0.55, 'rgba(56, 189, 248, 0.12)');
    outerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sctx.fillStyle = outerGrad;
    sctx.fillRect(0, 0, 256, 256);

    // Fine, razor-sharp optical diffraction spikes (anamorphic starburst)
    sctx.save();
    sctx.translate(cx, cy);
    sctx.rotate(-0.45); // Aligns along horizon curvature
    
    // Primary horizontal glint streak
    const streakGrad = sctx.createLinearGradient(-120, 0, 120, 0);
    streakGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    streakGrad.addColorStop(0.35, 'rgba(180, 225, 255, 0.25)');
    streakGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
    streakGrad.addColorStop(0.65, 'rgba(180, 225, 255, 0.25)');
    streakGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    sctx.fillStyle = streakGrad;
    sctx.fillRect(-120, -1.5, 240, 3);

    // Perpendicular cross spike
    const crossGrad = sctx.createLinearGradient(0, -60, 0, 60);
    crossGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    crossGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
    crossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    sctx.fillStyle = crossGrad;
    sctx.fillRect(-1, -60, 2, 120);

    // Diagonal 45-deg subtle rays
    sctx.rotate(Math.PI / 4);
    const diagGrad = sctx.createLinearGradient(-40, 0, 40, 0);
    diagGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    diagGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
    diagGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    sctx.fillStyle = diagGrad;
    sctx.fillRect(-40, -0.8, 80, 1.6);
    sctx.fillRect(-0.8, -40, 1.6, 80);

    sctx.restore();

    const sunFlareTex = new THREE.CanvasTexture(sunCanvas);
    const sunFlareMat = new THREE.SpriteMaterial({
      map: sunFlareTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false
    });
    const sunFlareSprite = new THREE.Sprite(sunFlareMat);
    sunFlareSprite.scale.set(0.75, 0.75, 1);
    // Positioned along the horizon curvature emerging naturally from behind the Earth limb
    sunFlareSprite.position.set(1.88, 1.05, 0.0);
    worldEarthRig.add(sunFlareSprite);

    // Dedicated Beacon Halo Texture (Pure Moonlight Alabaster)
    const beaconCanvas = document.createElement('canvas');
    beaconCanvas.width = 64;
    beaconCanvas.height = 64;
    const bctx = beaconCanvas.getContext('2d');
    const bgrad = bctx.createRadialGradient(32, 32, 1, 32, 32, 30);
    bgrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    bgrad.addColorStop(0.25, 'rgba(255, 255, 255, 0.45)');
    bgrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.10)');
    bgrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    bctx.fillStyle = bgrad;
    bctx.fillRect(0, 0, 64, 64);
    const beaconHaloTex = new THREE.CanvasTexture(beaconCanvas);

    // 9. Multi-Layer Celestial Starfield (Crisp stellar pinpricks & dense Milky Way band)
    const starCount = 3800;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const colorPalette = [
      new THREE.Color(0xffffff), // bright white
      new THREE.Color(0xbae6fd), // cool ice blue
      new THREE.Color(0x7dd3fc), // electric cyan
      new THREE.Color(0xfef08a), // warm star
      new THREE.Color(0x94a3b8)  // faint slate
    ];

    for (let i = 0; i < starCount; i++) {
      // 50% distributed globally, 50% concentrated along a galactic Milky Way band
      const isMilkyWay = i > starCount * 0.45;
      const r = 45 + Math.random() * 85;
      let x, y, z;

      if (isMilkyWay) {
        // Galactic plane angled across the sky behind Earth and intro title
        const angle = Math.random() * Math.PI * 2;
        const width = (Math.random() - 0.5) * 16;
        const height = (Math.random() - 0.5) * 9;
        x = r * Math.cos(angle);
        y = r * Math.sin(angle) * 0.42 + width;
        z = r * Math.sin(angle) * 0.88 + height;
      } else {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
      }

      starPositions[i * 3] = x;
      starPositions[i * 3 + 1] = y;
      starPositions[i * 3 + 2] = z;

      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.88
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // 10. ESTABLISHED, ANCHORED CELESTIAL BEACON (Western India: 23.83° N, 70.03° E)
    const markerGroup = new THREE.Group();
    markerGroupRef.current = markerGroup;

    const kutchLocalPos = latLonToVector3(featuredDest.coordinates.lat, featuredDest.coordinates.lon, earthRadius);
    markerGroup.position.copy(kutchLocalPos);

    const normal = kutchLocalPos.clone().normalize();
    markerGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

    // 10a. Precision Ground Target Reticle (Hugging Earth Surface at Coordinates)
    // Central micro-pip
    const anchorDotGeo = new THREE.CircleGeometry(0.007, 32);
    const anchorDotMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });
    const anchorDotMesh = new THREE.Mesh(anchorDotGeo, anchorDotMat);
    anchorDotMesh.rotation.x = Math.PI / 2;
    anchorDotMesh.position.y = 0.001;
    markerGroup.add(anchorDotMesh);

    // Inner precision hairline target ring
    const anchorGeoInner = new THREE.RingGeometry(0.015, 0.0175, 48);
    const anchorMatInner = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75
    });
    const anchorMeshInner = new THREE.Mesh(anchorGeoInner, anchorMatInner);
    anchorMeshInner.rotation.x = Math.PI / 2;
    anchorMeshInner.position.y = 0.001;
    markerGroup.add(anchorMeshInner);

    // Outer subtle framing hairline ring
    const anchorGeoOuter = new THREE.RingGeometry(0.027, 0.0285, 48);
    const anchorMatOuter = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.30
    });
    const anchorMeshOuter = new THREE.Mesh(anchorGeoOuter, anchorMatOuter);
    anchorMeshOuter.rotation.x = Math.PI / 2;
    anchorMeshOuter.position.y = 0.001;
    markerGroup.add(anchorMeshOuter);

    // 10b. Sleek Luminous Hairline Vector Needle
    const needleGeo = new THREE.CylinderGeometry(0.0008, 0.0018, 0.11, 16);
    const needleMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85
    });
    const needleMesh = new THREE.Mesh(needleGeo, needleMat);
    needleMesh.position.y = 0.055;
    markerGroup.add(needleMesh);

    // 10c. Apex Focal Pip (Precision Anchor Point for Floating HUD Callout)
    const apexGeo = new THREE.SphereGeometry(0.0055, 16, 16);
    const apexMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const apexMesh = new THREE.Mesh(apexGeo, apexMat);
    apexMesh.position.y = 0.11;
    headMeshRef.current = apexMesh;
    markerGroup.add(apexMesh);

    // 10d. Precision Sonar Pulse Waves (Harmonic Alabaster Radii)
    const waveGeo = new THREE.RingGeometry(0.015, 0.0175, 48);
    const waveMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45
    });
    waveMatRef.current = waveMat;
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    waveMesh.rotation.x = Math.PI / 2;
    waveMesh.position.y = 0.0015;
    waveMeshRef.current = waveMesh;
    markerGroup.add(waveMesh);

    const waveGeo2 = new THREE.RingGeometry(0.015, 0.0175, 48);
    const waveMat2 = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    waveMat2Ref.current = waveMat2;
    const waveMesh2 = new THREE.Mesh(waveGeo2, waveMat2);
    waveMesh2.rotation.x = Math.PI / 2;
    waveMesh2.position.y = 0.0015;
    waveMesh2Ref.current = waveMesh2;
    markerGroup.add(waveMesh2);

    // Soft celestial micro-glow sprite at apex
    const glowMat = new THREE.SpriteMaterial({
      map: beaconHaloTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.50
    });
    const glowSprite = new THREE.Sprite(glowMat);
    glowSprite.scale.set(0.08, 0.08, 1);
    glowSprite.position.y = 0.11;
    markerGroup.add(glowSprite);

    earthGroup.add(markerGroup);

    // 11. Initial Orientation: If intro, start rotated away from India so it rotates toward India on Start
    const startRotY = isIntro ? (KUTCH_ROT_Y + 1.85) : KUTCH_ROT_Y;
    targetRotationRef.current.y = startRotY;
    currentRotationRef.current.y = startRotY;
    targetRotationRef.current.x = 0.0;
    currentRotationRef.current.x = 0.0;
    earthGroup.rotation.y = startRotY;
    earthGroup.rotation.x = 0.0;

    // 12. Render Animation Loop (Gentle, Natural Rotation Around Vertical Axis)
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Slow, tranquil, natural orbital rotation of Earth
      if (isAutoRotatingRef.current && !isDraggingRef.current && !isTransitioning) {
        targetRotationRef.current.y += 0.00035;
      }

      // Natural atmospheric cloud drift
      if (cloudsRef.current) {
        cloudsRef.current.rotation.y += 0.00018;
      }

      // Precision cartographic sonar pulse waves (Smooth harmonic alabaster rings)
      if (waveMeshRef.current && waveMatRef.current) {
        const p = (elapsed * 0.70) % 1;
        const s = 1.0 + p * 2.2;
        waveMeshRef.current.scale.set(s, s, s);
        waveMatRef.current.opacity = (1 - p) * 0.40;
      }
      if (waveMesh2Ref.current && waveMat2Ref.current) {
        const p2 = ((elapsed * 0.70) + 0.5) % 1;
        const s2 = 1.0 + p2 * 2.2;
        waveMesh2Ref.current.scale.set(s2, s2, s2);
        waveMat2Ref.current.opacity = (1 - p2) * 0.28;
      }

      // Smooth damping (Earth remains strictly upright, rotX stays at 0)
      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.06;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.06;

      if (earthGroupRef.current) {
        earthGroupRef.current.rotation.x = currentRotationRef.current.x;
        earthGroupRef.current.rotation.y = currentRotationRef.current.y;
      }

      // Project 3D pin position to 2D Screen Coordinates (Dynamic exact bounding rect)
      if (headMeshRef.current && cameraRef.current && mountRef.current) {
        const pinWorldPos = new THREE.Vector3();
        headMeshRef.current.getWorldPosition(pinWorldPos);

        const pinNormal = pinWorldPos.clone().normalize();
        const camDir = cameraRef.current.position.clone().normalize();
        const dot = pinNormal.dot(camDir);

        if (dot > 0.12) {
          const rect = mountRef.current.getBoundingClientRect();
          const screenPos = pinWorldPos.clone().project(cameraRef.current);
          const x = (screenPos.x * 0.5 + 0.5) * rect.width;
          const y = (-(screenPos.y * 0.5) + 0.5) * rect.height;

          setPinScreenPos({ x, y, visible: true });
        } else {
          setPinScreenPos(prev => (prev.visible ? { ...prev, visible: false } : prev));
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      const newAspect = newWidth / newHeight;
      cameraRef.current.aspect = newAspect;
      // Responsive vertical FOV for mobile portrait vs widescreen desktop
      cameraRef.current.fov = newAspect < 1.0 ? 46 : 38;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Pointer drag controls: ROTATES NATURALLY AROUND VERTICAL AXIS
  const handlePointerDown = (e) => {
    if (isIntro || isStoryStarting) return; // In cinematic intro view, keep camera fixed on the frame
    isDraggingRef.current = true;
    isAutoRotatingRef.current = false;
    previousMousePositionRef.current = {
      x: e.clientX || (e.touches && e.touches[0].clientX),
      y: e.clientY || (e.touches && e.touches[0].clientY)
    };
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const deltaX = clientX - previousMousePositionRef.current.x;

    // Spin smoothly around vertical Y axis
    targetRotationRef.current.y += deltaX * 0.0035;
    targetRotationRef.current.x = 0.0; // Strictly upright!

    previousMousePositionRef.current = { 
      x: clientX, 
      y: e.clientY || (e.touches && e.touches[0].clientY) 
    };
  };

  // ONCE USER LEAVES OR RELEASES THE EARTH, IT STARTS AUTO ROTATING IMMEDIATELY
  const handlePointerUp = () => {
    isDraggingRef.current = false;
    isAutoRotatingRef.current = true; // Resumes auto-rotation immediately
  };

  const handlePointerLeave = () => {
    isDraggingRef.current = false;
    isAutoRotatingRef.current = true; // Resumes auto-rotation immediately
  };

  // Smooth mouse wheel zoom (Disabled in Intro phase!)
  const handleWheel = (e) => {
    if (!cameraRef.current || isTransitioning || isIntro || isStoryStarting) return;
    const currentZ = cameraRef.current.position.z;
    const delta = e.deltaY * 0.0035;
    const targetZ = Math.max(2.6, Math.min(8.5, currentZ + delta));
    cameraRef.current.position.z = targetZ;
  };

  // Sleek Side Zoom Controls
  const handleZoom = (direction) => {
    if (!cameraRef.current) return;
    const currentZ = cameraRef.current.position.z;
    const deltaZ = direction === 'in' ? -0.85 : 0.85;
    const targetZ = Math.max(2.6, Math.min(8.5, currentZ + deltaZ));

    gsap.to(cameraRef.current.position, {
      z: targetZ,
      duration: 0.6,
      ease: 'power2.out'
    });
    if (direction === 'in') {
      soundEngine.playZoomIn();
    } else {
      soundEngine.playZoomOut();
    }
  };

  const handleResetView = () => {
    if (!cameraRef.current) return;
    isAutoRotatingRef.current = true;
    soundEngine.playClick();
    const currentY = earthGroupRef.current ? earthGroupRef.current.rotation.y : currentRotationRef.current.y;
    const targetY = getShortestAngle(currentY, KUTCH_ROT_Y);

    gsap.to(targetRotationRef.current, {
      x: 0.0,
      y: targetY,
      duration: 1.0,
      ease: 'power2.inOut'
    });
    gsap.to(cameraRef.current.position, {
      x: 0,
      y: 0,
      z: 6.2,
      duration: 1.0,
      ease: 'power2.inOut'
    });
  };

  // CINEMATIC STORY EXPERIENCE TRIGGERED FROM INTRO:
  // 1. Earth comes in view (rises smoothly from y = -3.28 to y = 0.0)
  // 2. Earth rotates towards India (brings Western India into center view)
  // 3. Continuous orbital dive: starts gliding immediately, accelerates into Kutch salt desert
  // 4. Dynamic dolly-zoom (FOV 38° -> 22°) expands Great Rann of Kutch
  // 5. Seamless blur & crossfade into destination video
  const handleStartStory = useCallback(() => {
    if (isStoryStarting || isTransitioning) return;
    setIsStoryStarting(true);
    setIsTransitioning(true);
    isAutoRotatingRef.current = false;

    // Immediately mute/fade out orbit background music when user clicks Start Story!
    soundEngine.silenceAllBackgroundMusic();

    const currentY = earthGroupRef.current ? earthGroupRef.current.rotation.y : currentRotationRef.current.y;
    const targetY = getShortestAngle(currentY, KUTCH_ROT_Y);

    const tl = gsap.timeline({
      onComplete: () => {
        setIsIntro(false);
        setIsStoryStarting(false);
        onSelectDestination(featuredDest);
      }
    });

    // 1. Earth rises smoothly into center view
    if (worldEarthRigRef.current) {
      tl.to(worldEarthRigRef.current.position, {
        y: 0.0,
        duration: 1.6,
        ease: 'power2.inOut'
      }, 0);
    }

    // 2. Earth rotates towards India first
    tl.to(targetRotationRef.current, {
      x: 0.0,
      y: targetY,
      duration: 2.2,
      ease: 'power2.inOut'
    }, 0);

    // 3. Continuous orbital dive:
    // Immediate forward push-in to eliminate hesitation
    if (cameraRef.current) {
      tl.to(cameraRef.current.position, {
        z: 4.5,
        y: 0.35,
        duration: 1.3,
        ease: 'power1.inOut'
      }, 0);

      // Deep exhilarating acceleration straight towards Great Rann of Kutch
      tl.to(cameraRef.current.position, {
        x: 0,
        y: KUTCH_WORLD_Y,
        z: 2.34,
        duration: 1.4,
        ease: 'power3.in'
      }, 1.3);

      // Cinematic dolly-zoom (narrowing FOV dramatically expands the salt flats)
      tl.to(cameraRef.current, {
        fov: 22,
        duration: 1.4,
        ease: 'power2.in',
        onUpdate: () => cameraRef.current?.updateProjectionMatrix()
      }, 1.3);
    }

    // 4. Seamless blur & crossfade into destination
    if (mountRef.current) {
      tl.to(mountRef.current, {
        opacity: 0,
        scale: 1.08,
        filter: 'blur(10px)',
        duration: 0.65,
        ease: 'power2.out'
      }, 2.15);
    }
  }, [isStoryStarting, isTransitioning, onSelectDestination, featuredDest]);

  // CINEMATIC DIVE PRECISELY OVER GREAT RANN OF KUTCH, GUJARAT, INDIA
  const triggerTransitionToDestination = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    isAutoRotatingRef.current = false;

    // Immediately mute/fade out orbit background music
    soundEngine.silenceAllBackgroundMusic();

    const camera = cameraRef.current;
    
    // Shortest angular path to bring Kutch dead-center in front of camera
    const currentY = earthGroupRef.current ? earthGroupRef.current.rotation.y : currentRotationRef.current.y;
    const targetY = getShortestAngle(currentY, KUTCH_ROT_Y);

    const timeline = gsap.timeline({
      onComplete: () => {
        onSelectDestination(featuredDest);
      }
    });

    timeline.to(targetRotationRef.current, {
      x: 0.0,
      y: targetY,
      duration: 0.85,
      ease: 'power2.inOut'
    });

    // Camera dives DIRECTLY into Kutch (Y = 0.909, exactly where Gujarat is!)
    if (camera) {
      timeline.to(camera.position, {
        x: 0,
        y: KUTCH_WORLD_Y,
        z: 2.34,
        duration: 1.35,
        ease: 'power3.in',
      }, "-=0.35");

      timeline.to(camera, {
        fov: 22,
        duration: 1.35,
        ease: 'power2.in',
        onUpdate: () => camera.updateProjectionMatrix()
      }, "-=1.35");
    }

    timeline.to(mountRef.current, {
      opacity: 0,
      scale: 1.08,
      filter: 'blur(10px)',
      duration: 0.6,
      ease: 'power2.out'
    }, "-=0.4");

  }, [isTransitioning, onSelectDestination, setIsTransitioning]);

  return (
    <div 
      id="globe-container"
      className="relative w-full h-screen overflow-hidden bg-[#030408] flex items-center justify-center select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onWheel={handleWheel}
      style={{ cursor: isDraggingRef.current ? 'grabbing' : 'grab' }}
    >
      {/* 3D WebGL Canvas */}
      <div 
        ref={mountRef} 
        className="absolute inset-0 w-full h-full transition-opacity duration-300"
      />

      <div className="absolute inset-0 pointer-events-none bg-radial from-transparent via-black/15 to-black/85" />

      {/* ANCHORED CELESTIAL CALLOUT (Firmly locked over Kutch in Orbit mode) */}
      {!isIntro && pinScreenPos.visible && !isTransitioning && (
        <div
          className="absolute z-20 pointer-events-auto transform -translate-x-1/2 -translate-y-full pb-3 cursor-pointer group"
          style={{
            left: `${pinScreenPos.x}px`,
            top: `${pinScreenPos.y}px`,
          }}
          onClick={triggerTransitionToDestination}
          onMouseEnter={() => soundEngine.playBeaconPing()}
        >
          <div className="flex flex-col items-center">
            <div className="px-4 py-1.5 rounded-full bg-black/65 backdrop-blur-2xl border border-white/20 group-hover:border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.7)] transition-all duration-300 group-hover:scale-105 flex items-center space-x-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[9px] tracking-[0.25em] uppercase text-white/50 font-mono">
                23.83° N, 70.03° E
              </span>
              <span className="w-[1px] h-2.5 bg-white/20" />
              <span className="text-[10px] tracking-[0.22em] uppercase text-white font-medium">
                GREAT RANN OF KUTCH
              </span>
            </div>
            
            {/* Fine hairline vertical anchor needle */}
            <div className="w-[1px] h-3.5 bg-gradient-to-b from-white/60 to-transparent"></div>
          </div>
        </div>
      )}

      {/* SLEEK SIDE ZOOM CONTROLS (Right side floating glass pill in Orbit mode) */}
      {!isIntro && !isTransitioning && (
        <div className="absolute right-4 sm:right-7 top-1/2 transform -translate-y-1/2 z-20 flex flex-col space-y-2 pointer-events-auto animate-in fade-in duration-500">
          <button
            onClick={() => handleZoom('in')}
            title="Zoom In"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/35 hover:bg-black/65 backdrop-blur-2xl border border-white/12 hover:border-white/35 text-white/70 hover:text-white flex items-center justify-center transition-all duration-200 shadow-xl active:scale-90"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => handleZoom('out')}
            title="Zoom Out"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/35 hover:bg-black/65 backdrop-blur-2xl border border-white/12 hover:border-white/35 text-white/70 hover:text-white flex items-center justify-center transition-all duration-200 shadow-xl active:scale-90"
          >
            <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={handleResetView}
            title="Center Gujarat, India"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/35 hover:bg-black/65 backdrop-blur-2xl border border-white/12 hover:border-white/35 text-white/70 hover:text-white flex items-center justify-center transition-all duration-200 shadow-xl active:scale-90"
          >
            <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      )}

      {/* MINIMALIST, REFINED BOTTOM ACTION CTA (Orbit mode) */}
      {!isIntro && !isTransitioning && (
        <div className="absolute bottom-6 sm:bottom-10 left-1/2 transform -translate-x-1/2 z-20 pointer-events-auto animate-in fade-in duration-700 max-w-[92vw]">
          <button
            onClick={triggerTransitionToDestination}
            onMouseEnter={() => soundEngine.playBeaconPing()}
            className="flex items-center space-x-2.5 sm:space-x-3.5 px-6 sm:px-9 py-2.5 sm:py-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.14] backdrop-blur-2xl border border-white/20 hover:border-white/50 text-white text-[10px] sm:text-[11px] uppercase tracking-[0.26em] sm:tracking-[0.30em] font-sans font-medium shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:shadow-[0_0_24px_rgba(255,255,255,0.2)] hover:scale-102 active:scale-98 transition-all duration-300 group cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/80 group-hover:scale-125 transition-transform" />
            <span className="truncate">Discover Great Rann of Kutch</span>
            <ArrowRight className="w-3.5 h-3.5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
          </button>
        </div>
      )}

      {/* ========================================================
          CINEMATIC INTRO SCREEN (Ultra-Luxury Editorial Design)
      ======================================================== */}
      {isIntro && (
        <div
          className={`absolute top-0 left-0 w-full h-[72vh] sm:h-[74vh] z-30 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 text-center pointer-events-auto transition-all duration-1000 ${
            isStoryStarting
              ? 'opacity-0 -translate-y-12 pointer-events-none'
              : 'opacity-100 translate-y-0'
          }`}
        >
          {/* Architectural Eyebrow Kicker */}
          <div className="flex items-center gap-3 mb-3 sm:mb-4 select-none">
            <span className="w-6 sm:w-10 h-[1px] bg-white/20" />
            <span className="text-[10px] sm:text-[11px] font-sans uppercase tracking-[0.35em] text-white/50 font-normal">
              GUJARAT, INDIA • 23.83° N, 70.03° E
            </span>
            <span className="w-6 sm:w-10 h-[1px] bg-white/20" />
          </div>

          {/* Majestic Hero Title: Pure Crisp Alabaster White, No Artificial AI Gradients! */}
          <h1 className="font-['Cinzel',serif] text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[0.18em] sm:tracking-[0.22em] font-normal text-white select-none leading-none mb-3 sm:mb-4 drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] max-w-[94vw]">
            GREAT RANN OF KUTCH
          </h1>

          {/* Subtitle: THE BREATHING DESERT */}
          <h2 className="font-['Cinzel',serif] text-xs sm:text-sm md:text-base text-slate-300/80 tracking-[0.32em] font-light uppercase mb-4 sm:mb-5 select-none drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            THE BREATHING DESERT
          </h2>

          {/* Atmospheric Editorial Description */}
          <p className="max-w-xs sm:max-w-md md:max-w-lg text-[11px] sm:text-xs md:text-sm text-slate-400 font-light leading-relaxed tracking-wider mb-7 sm:mb-9 px-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Explore the vast, arid expanse and the quiet, enduring life within.
            <br className="hidden sm:inline" />
            <span className="sm:inline block mt-0.5 sm:mt-0"> A journey into the winds and sands.</span>
          </p>

          {/* Bespoke Luxury CTA Button: Crisp Frosted Capsule */}
          <button
            onClick={handleStartStory}
            onMouseEnter={() => soundEngine.playHover()}
            className="group relative px-9 sm:px-12 py-3 sm:py-3.5 rounded-full bg-white/[0.08] hover:bg-white/[0.18] active:bg-white/[0.25] backdrop-blur-2xl border border-white/25 hover:border-white/60 text-white font-sans font-medium text-[10px] sm:text-[11px] tracking-[0.30em] uppercase transition-all duration-300 ease-out shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:shadow-[0_0_24px_rgba(255,255,255,0.25)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span className="relative z-10 flex items-center gap-2.5">
              <span>START STORY</span>
              <span className="text-[10px] tracking-normal text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all">→</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
