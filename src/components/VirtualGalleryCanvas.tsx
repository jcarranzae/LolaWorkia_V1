'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Gallery3DArtwork } from '@/types';
import { getProxiedImageUrl } from '@/utils/imageUtils';
import { 
  Eye, 
  RotateCcw, 
  Maximize2, 
  Volume2, 
  VolumeX,
  Compass, 
  Sparkles, 
  Layers, 
  ChevronLeft, 
  ChevronRight,
  Move,
  Info,
  Footprints,
  Sun,
  SunMedium,
  Lightbulb
} from 'lucide-react';

interface VirtualGalleryCanvasProps {
  roomName: string;
  roomAtmosphere: string;
  roomSubtitle: string;
  artworks: (Gallery3DArtwork & { priceEth?: string; editionSize?: string })[];
  onSelectArtwork: (artwork: Gallery3DArtwork) => void;
}

export function VirtualGalleryCanvas({
  roomName,
  roomAtmosphere,
  roomSubtitle,
  artworks,
  onSelectArtwork,
}: VirtualGalleryCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const onSelectArtworkRef = useRef(onSelectArtwork);
  onSelectArtworkRef.current = onSelectArtwork;

  const [selectedArtworkIndex, setSelectedArtworkIndex] = useState<number>(0);
  const [hoveredArtwork, setHoveredArtwork] = useState<Gallery3DArtwork | null>(null);
  const [lightingTheme, setLightingTheme] = useState<'warm' | 'daylight' | 'cyber'>('daylight');
  const [exposureLevel, setExposureLevel] = useState<number>(1.5); // Bright default
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [navTipVisible, setNavTipVisible] = useState<boolean>(true);

  // References for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const paintingMeshesRef = useRef<{ mesh: THREE.Mesh; artwork: Gallery3DArtwork; targetPos: THREE.Vector3; targetLookAt: THREE.Vector3 }[]>([]);
  const spotLightsRef = useRef<THREE.SpotLight[]>([]);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<{ osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null>(null);

  // Camera navigation & animation state
  const cameraTargetRef = useRef<{
    pos: THREE.Vector3;
    lookAt: THREE.Vector3;
    active: boolean;
  }>({
    pos: new THREE.Vector3(0, 2.2, 7.5),
    lookAt: new THREE.Vector3(0, 2.2, 0),
    active: false,
  });

  // User input tracking (mouse drag to rotate, WASD to walk)
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const cameraAnglesRef = useRef({ yaw: 0, pitch: 0 });
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});

  // Helper to generate a procedural canvas texture for paintings if loading fails or as fallback
  const createFallbackTexture = (title: string, artist: string, color: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, '#111827');
      grad.addColorStop(0.5, color || '#374151');
      grad.addColorStop(1, '#090a0f');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Frame border
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 14;
      ctx.strokeRect(10, 10, 492, 492);

      // Text
      ctx.fillStyle = '#f3f4f6';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title.substring(0, 24), 256, 230);

      ctx.fillStyle = '#9ca3af';
      ctx.font = '20px monospace';
      ctx.fillText(artist || 'Lola Work Studio', 256, 275);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  // Helper to create procedural floor texture
  const createProceduralFloorTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Modern gallery polished terrazzo / marble tiles
      ctx.fillStyle = '#222530';
      ctx.fillRect(0, 0, 1024, 1024);

      // Grid lines for clean architectural pavers
      ctx.strokeStyle = '#323747';
      ctx.lineWidth = 2;
      const tileSize = 128;
      for (let x = 0; x <= 1024; x += tileSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1024);
        ctx.stroke();
      }
      for (let y = 0; y <= 1024; y += tileSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1024, y);
        ctx.stroke();
      }

      // Subtle marble veining and crystalline flecks
      for (let i = 0; i < 8000; i++) {
        const px = Math.random() * 1024;
        const py = Math.random() * 1024;
        ctx.fillStyle = Math.random() > 0.4 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.12)';
        ctx.fillRect(px, py, 2, 2);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    return texture;
  };

  // Helper to create procedural wall texture with gallery molding
  const createProceduralWallTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Warm modern museum gallery plaster wall (bright architectural finish)
      ctx.fillStyle = '#2f3240';
      ctx.fillRect(0, 0, 512, 512);

      // Fine stucco texture with light reflection grain
      for (let i = 0; i < 20000; i++) {
        const px = Math.random() * 512;
        const py = Math.random() * 512;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';
        ctx.fillRect(px, py, 1.5, 1.5);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 2);
    return texture;
  };

  // Teleport/smooth glide camera to front of specific artwork
  const focusArtwork = useCallback((index: number) => {
    if (!paintingMeshesRef.current[index]) return;
    const target = paintingMeshesRef.current[index];
    setSelectedArtworkIndex(index);

    cameraTargetRef.current = {
      pos: target.targetPos.clone(),
      lookAt: target.targetLookAt.clone(),
      active: true,
    };
  }, []);

  // Ambient sound synthesizer using Web Audio API
  const toggleAmbientAudio = () => {
    if (isAudioPlaying) {
      if (audioNodesRef.current) {
        audioNodesRef.current.gain.gain.linearRampToValueAtTime(0.001, (audioCtxRef.current?.currentTime || 0) + 0.5);
        setTimeout(() => {
          audioNodesRef.current?.osc1.stop();
          audioNodesRef.current?.osc2.stop();
          audioNodesRef.current = null;
        }, 500);
      }
      setIsAudioPlaying(false);
    } else {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = audioCtxRef.current || new AudioContextClass();
        audioCtxRef.current = ctx;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(82.41, ctx.currentTime); // Low E drone
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(123.47, ctx.currentTime); // Harmonic B

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(220, ctx.currentTime);

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1.5);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();

        audioNodesRef.current = { osc1, osc2, gain };
        setIsAudioPlaying(true);
      } catch (err) {
        console.log('Audio Context error:', err);
      }
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!mountRef.current) return;
    if (!document.fullscreenElement) {
      mountRef.current.parentElement?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Reset camera to center of room
  const resetCamera = () => {
    cameraTargetRef.current = {
      pos: new THREE.Vector3(0, 2.2, 7.5),
      lookAt: new THREE.Vector3(0, 2.2, 0),
      active: true,
    };
    cameraAnglesRef.current = { yaw: 0, pitch: 0 };
  };

  // Primary Three.js Scene Setup & Re-build on Artworks or Lighting Change
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Clean up previous scene if any
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
    }

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 560;

    // 1. SCENE & SOFT ARCHITECTURAL DEPTH
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const fogColor = lightingTheme === 'warm' ? 0x1c1815 : lightingTheme === 'cyber' ? 0x0c0f1d : 0x181a24;
    scene.background = new THREE.Color(fogColor);
    // Soft atmospheric distance depth (not murky fog)
    scene.fog = new THREE.Fog(fogColor, 28, 75);

    // 2. CAMERA
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 7.5);
    camera.lookAt(0, 2.2, 0);
    cameraRef.current = camera;

    // 3. RENDERER (Vivid Color & Dynamic Exposure)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = exposureLevel;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. MULTI-TIER ARCHITECTURAL LIGHTING
    const skyColor = lightingTheme === 'warm' ? 0xfff4e6 : lightingTheme === 'cyber' ? 0xbfdbfe : 0xffffff;
    const groundColor = lightingTheme === 'warm' ? 0x483e35 : lightingTheme === 'cyber' ? 0x1e1b4b : 0x3d4150;
    const ambColor = lightingTheme === 'warm' ? 0xffecd6 : lightingTheme === 'cyber' ? 0xa5b4fc : 0xf8fafc;
    const dirColor = lightingTheme === 'warm' ? 0xffeedb : lightingTheme === 'cyber' ? 0x67e8f9 : 0xffffff;

    // A. Hemisphere Light (Simulates realistic natural light bounce between ceiling and floor)
    const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, 1.5);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    // B. Ambient Fill Light
    const ambLight = new THREE.AmbientLight(ambColor, 1.2);
    scene.add(ambLight);
    ambientLightRef.current = ambLight;

    // C. Main Skylight Sun / Key Light
    const dirLight = new THREE.DirectionalLight(dirColor, 1.9);
    dirLight.position.set(2, 9, 3);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0001;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // D. Overhead Central Gallery Track Lights (Soft ambient point lights along the ceiling corridor)
    const centralLights = [
      new THREE.Vector3(0, 5.2, -6),
      new THREE.Vector3(0, 5.2, 0),
      new THREE.Vector3(0, 5.2, 6),
    ];
    centralLights.forEach((pos) => {
      const pLight = new THREE.PointLight(skyColor, 1.6, 16, 1.2);
      pLight.position.copy(pos);
      scene.add(pLight);
    });

    // 5. ARCHITECTURAL ROOM STRUCTURE (W: 18m, H: 6m, D: 22m)
    const roomWidth = 18;
    const roomHeight = 6;
    const roomDepth = 22;

    const floorTexture = createProceduralFloorTexture();
    const wallTexture = createProceduralWallTexture();

    // Floor (Polished Museum Terrazzo with Specular Sheen)
    const floorGeo = new THREE.PlaneGeometry(roomWidth, roomDepth);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.18,
      metalness: 0.12,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(roomWidth, roomDepth);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x1e2029,
      roughness: 0.6,
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = roomHeight;
    scene.add(ceiling);

    // Ceiling Glass Skylight Trim with Emissive Glow
    const skylightGeo = new THREE.PlaneGeometry(roomWidth * 0.55, roomDepth * 0.65);
    const skylightMat = new THREE.MeshStandardMaterial({
      color: lightingTheme === 'warm' ? 0xfff3db : lightingTheme === 'cyber' ? 0x93c5fd : 0xffffff,
      emissive: lightingTheme === 'warm' ? 0xffecd1 : lightingTheme === 'cyber' ? 0x60a5fa : 0xffffff,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.85,
    });
    const skylight = new THREE.Mesh(skylightGeo, skylightMat);
    skylight.rotation.x = Math.PI / 2;
    skylight.position.y = roomHeight - 0.04;
    scene.add(skylight);

    // Light Fixture Rails on Ceiling
    const railMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const railLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, roomDepth * 0.7), railMat);
    railLeft.position.set(-4.5, roomHeight - 0.1, 0);
    scene.add(railLeft);
    const railRight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, roomDepth * 0.7), railMat);
    railRight.position.set(4.5, roomHeight - 0.1, 0);
    scene.add(railRight);

    // Walls Material (Bright Architectural Plaster)
    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTexture,
      roughness: 0.65,
      metalness: 0.02,
    });

    // North Wall (Back)
    const backWallGeo = new THREE.PlaneGeometry(roomWidth, roomHeight);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, roomHeight / 2, -roomDepth / 2);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // South Wall (Front/Entrance)
    const frontWallGeo = new THREE.PlaneGeometry(roomWidth, roomHeight);
    const frontWall = new THREE.Mesh(frontWallGeo, wallMat);
    frontWall.position.set(0, roomHeight / 2, roomDepth / 2);
    frontWall.rotation.y = Math.PI;
    frontWall.receiveShadow = true;
    scene.add(frontWall);

    // West Wall (Left)
    const leftWallGeo = new THREE.PlaneGeometry(roomDepth, roomHeight);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(-roomWidth / 2, roomHeight / 2, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // East Wall (Right)
    const rightWallGeo = new THREE.PlaneGeometry(roomDepth, roomHeight);
    const rightWall = new THREE.Mesh(rightWallGeo, wallMat);
    rightWall.position.set(roomWidth / 2, roomHeight / 2, 0);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    // Baseboards along bottom of walls
    const baseboardMat = new THREE.MeshStandardMaterial({ color: 0x181a22, roughness: 0.3 });
    const bbNorth = new THREE.Mesh(new THREE.BoxGeometry(roomWidth, 0.25, 0.1), baseboardMat);
    bbNorth.position.set(0, 0.125, -roomDepth / 2 + 0.05);
    scene.add(bbNorth);

    const bbLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.25, roomDepth), baseboardMat);
    bbLeft.position.set(-roomWidth / 2 + 0.05, 0.125, 0);
    scene.add(bbLeft);

    const bbRight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.25, roomDepth), baseboardMat);
    bbRight.position.set(roomWidth / 2 - 0.05, 0.125, 0);
    scene.add(bbRight);

    // 6. CENTRAL MUSEUM BENCH
    const benchGroup = new THREE.Group();
    const benchBaseMat = new THREE.MeshStandardMaterial({ color: 0x222530, roughness: 0.4, metalness: 0.3 });
    const benchSeatMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.5 });

    const benchSeat = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.35, 1.4), benchSeatMat);
    benchSeat.position.y = 0.55;
    benchSeat.castShadow = true;
    benchSeat.receiveShadow = true;
    benchGroup.add(benchSeat);

    const benchLeg1 = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.4, 1.1), benchBaseMat);
    benchLeg1.position.y = 0.2;
    benchLeg1.castShadow = true;
    benchGroup.add(benchLeg1);

    benchGroup.position.set(0, 0, 1.5);
    scene.add(benchGroup);

    // 7. HANG ARTWORKS ON WALLS WITH 3D FRAMES & DEDICATED HIGH-LUX SPOTLIGHTS
    paintingMeshesRef.current = [];
    spotLightsRef.current = [];
    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';

    // Calculate placement slots around the gallery (Back wall, Left wall, Right wall)
    const artworkList = artworks.length > 0 ? artworks : [];

    artworkList.forEach((art, index) => {
      // Define positions on walls
      let posX = 0;
      let posY = 2.4;
      let posZ = 0;
      let rotY = 0;
      let camTargetPos = new THREE.Vector3();
      let camLookAt = new THREE.Vector3();

      if (index === 0) {
        // Center of back wall
        posX = 0;
        posZ = -roomDepth / 2 + 0.15;
        rotY = 0;
        camTargetPos.set(0, 2.3, -roomDepth / 2 + 4.5);
        camLookAt.set(0, 2.3, -roomDepth / 2);
      } else if (index === 1) {
        // Left on back wall
        posX = -4.5;
        posZ = -roomDepth / 2 + 0.15;
        rotY = 0;
        camTargetPos.set(-4.5, 2.3, -roomDepth / 2 + 4.5);
        camLookAt.set(-4.5, 2.3, -roomDepth / 2);
      } else if (index === 2) {
        // Right on back wall
        posX = 4.5;
        posZ = -roomDepth / 2 + 0.15;
        rotY = 0;
        camTargetPos.set(4.5, 2.3, -roomDepth / 2 + 4.5);
        camLookAt.set(4.5, 2.3, -roomDepth / 2);
      } else if (index % 2 === 1) {
        // Left Wall
        const slot = Math.floor(index / 2);
        posX = -roomWidth / 2 + 0.15;
        posZ = -roomDepth / 2 + 4 + slot * 4;
        rotY = Math.PI / 2;
        camTargetPos.set(-roomWidth / 2 + 4.5, 2.3, posZ);
        camLookAt.set(-roomWidth / 2, 2.3, posZ);
      } else {
        // Right Wall
        const slot = Math.floor(index / 2);
        posX = roomWidth / 2 - 0.15;
        posZ = -roomDepth / 2 + 4 + slot * 4;
        rotY = -Math.PI / 2;
        camTargetPos.set(roomWidth / 2 - 4.5, 2.3, posZ);
        camLookAt.set(roomWidth / 2, 2.3, posZ);
      }

      // 3D Artwork Group
      const artGroup = new THREE.Group();
      artGroup.position.set(posX, posY, posZ);
      artGroup.rotation.y = rotY;

      // Outer Modern Satin Titanium / Dark Bronze Frame
      const frameWidth = 2.4;
      const frameHeight = 1.8;
      const frameDepth = 0.08;

      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x2b2e38,
        metalness: 0.6,
        roughness: 0.25,
      });
      const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(frameWidth, frameHeight, frameDepth), frameMat);
      frameMesh.castShadow = true;
      artGroup.add(frameMesh);

      // Bright Museum Passepartout / Inner Mat (White border)
      const matBoardMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
      const matBoard = new THREE.Mesh(new THREE.BoxGeometry(frameWidth - 0.12, frameHeight - 0.12, frameDepth + 0.01), matBoardMat);
      artGroup.add(matBoard);

      // Artwork Canvas Texture
      const canvasWidth = frameWidth - 0.35;
      const canvasHeight = frameHeight - 0.35;
      const canvasGeo = new THREE.PlaneGeometry(canvasWidth, canvasHeight);

      // Create fallback material first with generative color scheme
      const fallbackTex = createFallbackTexture(art.title, art.artist || 'Lola Work', art.palette?.[0] || '#4f46e5');
      const canvasMat = new THREE.MeshStandardMaterial({
        map: fallbackTex,
        roughness: 0.12,
        metalness: 0.0,
        emissive: new THREE.Color(0x141414), // Subtle inner radiance so fine details stay visible
      });

      // Load HD image texture with CORS proxy and resilient fallback
      if (art.imageUrl) {
        const textureUrlToLoad = getProxiedImageUrl(art.imageUrl);
        textureLoader.load(
          textureUrlToLoad,
          (loadedTex) => {
            loadedTex.colorSpace = THREE.SRGBColorSpace;
            loadedTex.generateMipmaps = true;
            loadedTex.minFilter = THREE.LinearMipmapLinearFilter;
            canvasMat.map = loadedTex;
            canvasMat.needsUpdate = true;
          },
          undefined,
          (err) => {
            console.warn(`Texture load failed for artwork "${art.title}". Attempting backup source.`, err);
            const safeBackupUrl = 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80';
            if (art.imageUrl !== safeBackupUrl) {
              textureLoader.load(safeBackupUrl, (backupTex) => {
                backupTex.colorSpace = THREE.SRGBColorSpace;
                canvasMat.map = backupTex;
                canvasMat.needsUpdate = true;
              });
            }
          }
        );
      }

      const canvasMesh = new THREE.Mesh(canvasGeo, canvasMat);
      canvasMesh.position.z = frameDepth / 2 + 0.015;
      canvasMesh.userData = { artwork: art, index };
      artGroup.add(canvasMesh);

      // Museum Plaque under painting (Gleaming Brass)
      const plaqueGeo = new THREE.PlaneGeometry(0.7, 0.2);
      const plaqueMat = new THREE.MeshStandardMaterial({
        color: 0xdfb76c,
        metalness: 0.9,
        roughness: 0.15,
      });
      const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
      plaque.position.set(0, -frameHeight / 2 - 0.22, 0.02);
      artGroup.add(plaque);

      scene.add(artGroup);

      // Dedicated High-Power Ceiling Spotlight focused directly on this artwork
      const spotColor = lightingTheme === 'warm' ? 0xfff1db : lightingTheme === 'cyber' ? 0x38bdf8 : 0xffffff;
      const spotLight = new THREE.SpotLight(spotColor, 8.0);
      spotLight.position.set(
        posX + (rotY === Math.PI / 2 ? 3.0 : rotY === -Math.PI / 2 ? -3.0 : 0),
        roomHeight - 0.3,
        posZ + (rotY === 0 ? 3.0 : 0)
      );
      spotLight.target = canvasMesh;
      spotLight.angle = 0.65;
      spotLight.penumbra = 0.7;
      spotLight.distance = 15;
      spotLight.castShadow = true;
      scene.add(spotLight);
      spotLightsRef.current.push(spotLight);

      // Soft Artwork Front Fill Point Light (Eliminates harsh shadows across the canvas face)
      const fillLight = new THREE.PointLight(spotColor, 1.8, 5.5);
      fillLight.position.set(
        posX + (rotY === Math.PI / 2 ? 1.6 : rotY === -Math.PI / 2 ? -1.6 : 0),
        posY,
        posZ + (rotY === 0 ? 1.6 : 0)
      );
      scene.add(fillLight);

      // Track mesh reference for raycaster and click navigation
      paintingMeshesRef.current.push({
        mesh: canvasMesh,
        artwork: art,
        targetPos: camTargetPos,
        targetLookAt: camLookAt,
      });
    });

    // 8. INTERACTIVE RAYCASTING (HOVER & CLICK ON PAINTINGS)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Handle Mouse Drag Camera Look
      if (isDraggingRef.current) {
        const deltaX = e.clientX - prevMousePosRef.current.x;
        const deltaY = e.clientY - prevMousePosRef.current.y;
        prevMousePosRef.current = { x: e.clientX, y: e.clientY };

        cameraAnglesRef.current.yaw -= deltaX * 0.004;
        cameraAnglesRef.current.pitch -= deltaY * 0.003;
        // Clamp pitch so camera doesn't flip upside down
        cameraAnglesRef.current.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, cameraAnglesRef.current.pitch));

        cameraTargetRef.current.active = false;
      }

      // Check intersections with paintings
      raycaster.setFromCamera(mouse, camera);
      const meshesToTest = paintingMeshesRef.current.map((p) => p.mesh);
      const intersects = raycaster.intersectObjects(meshesToTest);

      if (intersects.length > 0) {
        container.style.cursor = 'pointer';
        const hitArt = intersects[0].object.userData?.artwork;
        if (hitArt) {
          setHoveredArtwork(hitArt);
        }
      } else {
        container.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
        setHoveredArtwork(null);
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
      container.style.cursor = 'grabbing';
      setNavTipVisible(false);
    };

    const handlePointerUp = (e: MouseEvent) => {
      // Check if it was a quick click on a painting rather than a drag
      const dragDist = Math.hypot(e.clientX - prevMousePosRef.current.x, e.clientY - prevMousePosRef.current.y);
      if (dragDist < 6) {
        raycaster.setFromCamera(mouse, camera);
        const meshesToTest = paintingMeshesRef.current.map((p) => p.mesh);
        const intersects = raycaster.intersectObjects(meshesToTest);
        if (intersects.length > 0) {
          const hitIdx = intersects[0].object.userData?.index;
          if (hitIdx !== undefined) {
            focusArtwork(hitIdx);
          }
        }
      }

      isDraggingRef.current = false;
      container.style.cursor = 'grab';
    };

    // Double-click on any painting in the 3D room immediately opens its full curatorial sheet (ficha)
    const handleDblClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshesToTest = paintingMeshesRef.current.map((p) => p.mesh);
      const intersects = raycaster.intersectObjects(meshesToTest);
      if (intersects.length > 0) {
        const hitArt = intersects[0].object.userData?.artwork;
        if (hitArt) {
          onSelectArtworkRef.current(hitArt);
        }
      }
    };

    // Double-tap support for touch/mobile devices
    let lastTapTime = 0;
    const handleTouchEnd = (e: TouchEvent) => {
      const currentTime = new Date().getTime();
      const tapInterval = currentTime - lastTapTime;
      if (tapInterval < 350 && tapInterval > 0) {
        if (e.changedTouches.length > 0) {
          const touch = e.changedTouches[0];
          const rect = container.getBoundingClientRect();
          mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

          raycaster.setFromCamera(mouse, camera);
          const meshesToTest = paintingMeshesRef.current.map((p) => p.mesh);
          const intersects = raycaster.intersectObjects(meshesToTest);
          if (intersects.length > 0) {
            const hitArt = intersects[0].object.userData?.artwork;
            if (hitArt) {
              onSelectArtworkRef.current(hitArt);
            }
          }
        }
      }
      lastTapTime = currentTime;
    };

    // Keyboard navigation (WASD / Arrows to walk around the room)
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = true;
      cameraTargetRef.current.active = false;
      setNavTipVisible(false);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = false;
    };

    // Wheel zoom
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      camera.position.addScaledVector(forward, -e.deltaY * 0.005);
      // Clamp bounds inside room
      camera.position.x = Math.max(-roomWidth / 2 + 1.2, Math.min(roomWidth / 2 - 1.2, camera.position.x));
      camera.position.z = Math.max(-roomDepth / 2 + 1.2, Math.min(roomDepth / 2 - 1.2, camera.position.z));
      camera.position.y = Math.max(1.2, Math.min(roomHeight - 1, camera.position.y));
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('mousedown', handlePointerDown);
    container.addEventListener('dblclick', handleDblClick);
    container.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // 9. ANIMATION & RENDER LOOP
    const currentLookAt = new THREE.Vector3(0, 2.2, 0);

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      // Handle Smooth Camera Glide to Painting
      if (cameraTargetRef.current.active) {
        camera.position.lerp(cameraTargetRef.current.pos, 0.05);
        currentLookAt.lerp(cameraTargetRef.current.lookAt, 0.05);
        camera.lookAt(currentLookAt);

        if (camera.position.distanceTo(cameraTargetRef.current.pos) < 0.05) {
          cameraTargetRef.current.active = false;
        }
      } else {
        // Handle User First-Person Look Rotation
        const euler = new THREE.Euler(0, 0, 0, 'YXZ');
        euler.x = cameraAnglesRef.current.pitch;
        euler.y = cameraAnglesRef.current.yaw;
        camera.quaternion.setFromEuler(euler);

        // Handle Walk Keyboard Movement (WASD / Arrows)
        const moveSpeed = 0.12;
        const forward = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, cameraAnglesRef.current.yaw, 0));
        const side = new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(0, cameraAnglesRef.current.yaw, 0));

        if (keysPressedRef.current['KeyW'] || keysPressedRef.current['ArrowUp']) {
          camera.position.addScaledVector(forward, moveSpeed);
        }
        if (keysPressedRef.current['KeyS'] || keysPressedRef.current['ArrowDown']) {
          camera.position.addScaledVector(forward, -moveSpeed);
        }
        if (keysPressedRef.current['KeyA'] || keysPressedRef.current['ArrowLeft']) {
          camera.position.addScaledVector(side, -moveSpeed);
        }
        if (keysPressedRef.current['KeyD'] || keysPressedRef.current['ArrowRight']) {
          camera.position.addScaledVector(side, moveSpeed);
        }

        // Room boundary constraints (don't walk through walls)
        camera.position.x = Math.max(-roomWidth / 2 + 1.2, Math.min(roomWidth / 2 - 1.2, camera.position.x));
        camera.position.z = Math.max(-roomDepth / 2 + 1.2, Math.min(roomDepth / 2 - 1.2, camera.position.z));
        camera.position.y = 2.2; // Eye level
      }

      renderer.render(scene, camera);
    };

    animate();

    // 10. RESIZE OBSERVER
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height || 560;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });
    resizeObserver.observe(container);

    // CLEANUP
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      container.removeEventListener('wheel', handleWheel);

      scene.traverse((obj: any) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m: any) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      container.removeEventListener('dblclick', handleDblClick);
      container.removeEventListener('touchend', handleTouchEnd);
      renderer.dispose();
    };
  }, [artworks, lightingTheme, exposureLevel, focusArtwork]);

  const activeArt = artworks[selectedArtworkIndex] || artworks[0];

  return (
    <div className="relative rounded-2xl overflow-hidden select-none border border-neutral-800 bg-[#07080c] shadow-2xl transition-all duration-300">
      
      {/* Top HUD Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        <div className="flex items-center gap-2.5 bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-neutral-800 text-xs shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="text-neutral-400 font-medium">ESTANCIA 3D:</span>
          <span className="text-white font-bold tracking-wide">{roomName}</span>
          <span className="text-neutral-600">•</span>
          <span className="text-amber-400 font-mono text-[11px] font-semibold">
            {artworks.length} {artworks.length === 1 ? 'obra colgada' : 'obras colgadas'}
          </span>
        </div>

        {/* Action Controls (Exposure Lux, Theme Switcher, Reset View, Audio Toggle, Fullscreen) */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/85 backdrop-blur-md p-1.5 rounded-full border border-neutral-800 shadow-xl">
          {/* Brightness / Exposure Lux Adjustment */}
          <button
            type="button"
            onClick={() => setExposureLevel((prev) => (prev >= 1.9 ? 1.25 : prev === 1.25 ? 1.55 : 1.95))}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors shadow-inner"
            title="Ajustar potencia y brillo de la luz de museo"
          >
            <Sun size={14} className="text-amber-400 animate-spin-slow" />
            <span>{exposureLevel >= 1.9 ? 'Luz Máxima (2.0x)' : exposureLevel >= 1.5 ? 'Luz Brillante (1.5x)' : 'Luz Suave (1.2x)'}</span>
          </button>

          {/* Lighting Theme Switcher */}
          <button
            type="button"
            onClick={() => setLightingTheme((t) => (t === 'daylight' ? 'warm' : t === 'warm' ? 'cyber' : 'daylight'))}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-800/90 hover:bg-neutral-700 text-neutral-200 border border-neutral-700/70 transition-colors"
            title="Cambiar tono de luz del pabellón"
          >
            <Sparkles size={13} className={lightingTheme === 'daylight' ? 'text-sky-300' : lightingTheme === 'warm' ? 'text-amber-400' : 'text-purple-400'} />
            <span className="capitalize">{lightingTheme === 'daylight' ? 'Luz Blanca' : lightingTheme === 'warm' ? 'Ámbar Cálido' : 'Cíber'}</span>
          </button>

          <button
            type="button"
            onClick={resetCamera}
            className="p-1.5 rounded-full text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Centrar vista en la sala"
          >
            <RotateCcw size={15} />
          </button>

          {/* Ambient Museum Sound */}
          <button
            type="button"
            onClick={toggleAmbientAudio}
            className={`p-1.5 rounded-full transition-colors ${
              isAudioPlaying ? 'text-emerald-400 bg-emerald-950/50' : 'text-neutral-400 hover:text-white'
            }`}
            title={isAudioPlaying ? 'Silenciar audio ambiental' : 'Activar atmósfera acústica del pabellón'}
          >
            {isAudioPlaying ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-full text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Pantalla completa"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      {/* Primary 3D WebGL Canvas Mount Container */}
      <div
        ref={mountRef}
        className="w-full h-[580px] sm:h-[640px] cursor-grab active:cursor-grabbing relative"
      />

      {/* Floating Hover Label on 3D Paintings */}
      {hoveredArtwork && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-all duration-200">
          <div className="bg-black/90 backdrop-blur-md px-4 py-2 rounded-xl border border-amber-500/50 text-center shadow-2xl">
            <div className="text-xs font-bold text-white tracking-wide">{hoveredArtwork.title}</div>
            <div className="text-[11px] text-amber-400 font-mono mt-0.5 flex items-center justify-center gap-1.5">
              <span>{hoveredArtwork.artist || 'Lola Work'}</span>
              <span>•</span>
              <span className="text-neutral-300">Clic: Enfocar</span>
              <span>•</span>
              <span className="text-amber-300 font-bold">Doble Clic: Abrir Ficha</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Helper Hint (WASD / Mouse Drag) */}
      {navTipVisible && (
        <div className="absolute top-20 left-4 z-20 pointer-events-none animate-fade-in hidden sm:block">
          <div className="bg-black/80 backdrop-blur-md p-3 rounded-xl border border-neutral-800 text-[11px] text-neutral-300 space-y-1.5 shadow-xl">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <Compass size={13} />
              <span>Navegación en la Sala 3D:</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-400">
              <span className="px-1.5 py-0.5 rounded bg-neutral-800 font-mono text-white text-[10px]">Arrastrar ratón</span>
              <span>Girar vista 360°</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-400">
              <span className="px-1.5 py-0.5 rounded bg-neutral-800 font-mono text-white text-[10px]">W A S D / Flechas</span>
              <span>Caminar por la galería</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-400">
              <span className="px-1.5 py-0.5 rounded bg-neutral-800 font-mono text-white text-[10px]">Clic en cuadro</span>
              <span>Aproximarse a la obra</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-400">
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">Doble clic</span>
              <span className="text-amber-200/90 font-medium">Abrir ficha curatorial</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Telemetry & Artwork Quick-Jump Strip */}
      <div className="absolute bottom-3 left-4 right-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-2 bg-black/85 backdrop-blur-md p-2.5 rounded-xl border border-neutral-800/80 shadow-2xl pointer-events-auto">
        {/* Thumbnails to jump camera directly to any painting in the 3D room */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 max-w-full scrollbar-thin">
          {artworks.map((art, idx) => (
            <button
              key={art.id || idx}
              type="button"
              onClick={() => focusArtwork(idx)}
              className={`relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                selectedArtworkIndex === idx
                  ? 'border-amber-400 scale-105 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                  : 'border-neutral-700/60 opacity-60 hover:opacity-100'
              }`}
              title={art.title}
            >
              <img
                src={art.imageUrl}
                alt={art.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {selectedArtworkIndex === idx && (
                <span className="absolute bottom-0 inset-x-0 h-1 bg-amber-400" />
              )}
            </button>
          ))}
        </div>

        {/* Selected artwork inspection trigger button */}
        {activeArt && (
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
            <div className="text-left">
              <div className="text-xs font-bold text-white truncate max-w-[180px] sm:max-w-[220px]">
                {activeArt.title}
              </div>
              <div className="text-[11px] text-neutral-400 font-mono">
                {activeArt.artist || 'Lola Work Studio'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectArtwork(activeArt)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-md transition-all shrink-0"
            >
              <Eye size={14} />
              <span>Ver Cédula HD</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
