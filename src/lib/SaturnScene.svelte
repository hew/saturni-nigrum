<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { createWastelandGround } from './three-core/components/Ground.js';
  import { LIGHTING } from './three-core/utils/Constants.js';

  let canvas;
  let scene, camera, renderer;
  let saturn, saturnMesh, saturnRings;
  let ground;
  let time = 0;

  function init() {
    // Scene setup - matching the cube scene aesthetic
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera - match cube scene exactly
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(30, 20, 30); // Same as cube scene
    camera.lookAt(0, 10, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      alpha: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Create minimalist Saturn
    // createSaturn(); // TEMPORARILY DISABLED FOR TESTING

    // Create wasteland ground using modular component
    ground = createWastelandGround();  // Use default 0.2 opacity like cube scene
    scene.add(ground.getGroup());

    // Minimal lighting using standardized constants
    createStandardLighting();

    // Handle resize
    window.addEventListener('resize', handleResize);
  }

  function createSaturn() {
    // Saturn sphere - Saturn gold like the cube's magic angle
    const saturnGeometry = new THREE.SphereGeometry(10, 32, 24);
    const saturnMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000, // Black to test if this is causing the lighting
      emissive: 0x000000, // No emission to match cube scene darkness
      shininess: 30,
      specular: 0x444411
    });
    
    // Create the solid sphere
    saturnMesh = new THREE.Mesh(saturnGeometry, saturnMaterial);
    saturnMesh.position.y = 10; // Lower position
    saturnMesh.castShadow = true;
    scene.add(saturnMesh);
    
    // Store reference for rotation
    saturn = saturnMesh;

    // Saturn's rings - multiple concentric rings
    createRings();
  }

  function createRings() {
    const ringGroup = new THREE.Group();
    
    // Create 3 rings with gaps (like real Saturn)
    const rings = [
      { inner: 15, outer: 18 },
      { inner: 19, outer: 22 },
      { inner: 23, outer: 28 }
    ];

    rings.forEach(ring => {
      const ringGeometry = new THREE.RingGeometry(ring.inner, ring.outer, 64, 1);
      
      // Solid ring material
      const ringMaterial = new THREE.MeshPhongMaterial({
        color: 0x0a0a0a, // Very dark gray
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
      ringMesh.rotation.x = -Math.PI / 2;
      ringGroup.add(ringMesh);
      
      // Edge lines for the rings
      const edgesGeometry = new THREE.EdgesGeometry(ringGeometry);
      const edgesMaterial = new THREE.LineBasicMaterial({
        color: 0x1a1a1a,
        transparent: true,
        opacity: 1.0
      });
      const ringEdges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      ringEdges.rotation.x = -Math.PI / 2;
      ringGroup.add(ringEdges);
    });

    // Tilt rings like real Saturn (26.7 degrees)
    ringGroup.rotation.x = -26.7 * Math.PI / 180;
    ringGroup.position.y = 10; // Match Saturn's position
    
    saturnRings = ringGroup;
    scene.add(saturnRings);
  }

  function createStandardLighting() {
    // Use EXACT same lighting as cube scene for consistency
    const ambientLight = new THREE.AmbientLight(
      LIGHTING.AMBIENT.color, 
      LIGHTING.AMBIENT.intensity
    );
    scene.add(ambientLight);

    // Directional light using standardized values
    const dirLight = new THREE.DirectionalLight(
      LIGHTING.DIRECTIONAL.color, 
      LIGHTING.DIRECTIONAL.intensity
    );
    dirLight.position.set(...LIGHTING.DIRECTIONAL.position);
    dirLight.castShadow = LIGHTING.DIRECTIONAL.castShadow;
    dirLight.shadow.camera.near = LIGHTING.DIRECTIONAL.shadow.camera.near;
    dirLight.shadow.camera.far = LIGHTING.DIRECTIONAL.shadow.camera.far;
    dirLight.shadow.camera.left = LIGHTING.DIRECTIONAL.shadow.camera.left;
    dirLight.shadow.camera.right = LIGHTING.DIRECTIONAL.shadow.camera.right;
    dirLight.shadow.camera.top = LIGHTING.DIRECTIONAL.shadow.camera.top;
    dirLight.shadow.camera.bottom = LIGHTING.DIRECTIONAL.shadow.camera.bottom;
    dirLight.shadow.mapSize.width = LIGHTING.DIRECTIONAL.shadow.mapSize.width;
    dirLight.shadow.mapSize.height = LIGHTING.DIRECTIONAL.shadow.mapSize.height;
    scene.add(dirLight);

    // Rim light using standardized values
    const rimLight = new THREE.DirectionalLight(
      LIGHTING.RIM.color, 
      LIGHTING.RIM.intensity
    );
    rimLight.position.set(...LIGHTING.RIM.position);
    scene.add(rimLight);
  }


  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    // Slow Saturn rotation
    if (saturn) saturn.rotation.y = time * 0.05;
    
    // Very subtle ring wobble
    if (saturnRings) saturnRings.rotation.z = Math.sin(time * 0.3) * 0.02;

    renderer.render(scene, camera);
  }

  onMount(() => {
    init();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (ground) ground.dispose();
      renderer.dispose();
    };
  });
</script>

<canvas bind:this={canvas}></canvas>

<!-- Test button - always visible for now -->
<button class="secret-button" on:click={() => console.log('Saturn secret!')}>
  ⬢
</button>

<style>
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
  
  .secret-button {
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: 1px solid #ccaa00;
    color: #ccaa00;
    font-size: 24px;
    width: 48px;
    height: 48px;
    cursor: pointer;
    font-family: 'Courier New', monospace;
    transition: all 0.3s ease;
  }
  
  .secret-button:hover {
    background: #ccaa00;
    color: #000;
    box-shadow: 0 0 20px #ccaa00;
  }
</style>