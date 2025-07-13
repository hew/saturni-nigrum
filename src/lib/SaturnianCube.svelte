<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { createEventDispatcher } from 'svelte';
  import { createWastelandGround } from './three-core/components/Ground.js';
  import { LIGHTING } from './three-core/utils/Constants.js';
  import { sceneStore, actions, canInteractWithCube } from './store.js';
  
  const dispatch = createEventDispatcher();
  
  export let magicMode = false;

  // Simple reactive state from store - no complex mapping needed!
  $: state = $sceneStore;

  let canvas;
  let scene, camera, renderer;
  let cube, cubeEdges = [];
  let ground;
  let saturn, saturnRings; // For switching between cube and saturn
  let blackTriangle;
  let flowerOfLife;
  let time = 0;
  
  // Saturn time secret variables
  let currentTime = new Date();
  let saturnCounter = 0;
  let lastSixMoment = 0;
  
  // Triangle breath ritual variables
  let breathCounter = 0;
  let breathPhase = 'inhale'; // 'inhale' or 'exhale'
  let breathStartTime = 0;
  let lastBreathUpdate = 0;
  let triangleGlowActive = false;
  
  // Cube hint animation
  let targetCubeOpacity = 1.0;
  let currentCubeOpacity = 1.0;
  
  // Responsive line thickness
  $: isMobile = window?.innerWidth < 768;
  $: tubeRadius = isMobile ? 0.05 : 0.025; // 50% thinner on desktop
  
  // Local state variables (will be migrated to store later)
  let showSaturn = false;
  let saturnSecretUnlocked = false; // Reset to false for production
  let showTriangle = false;
  let autoRotate = true;
  let mouseX = 0, mouseY = 0;
  let secretUnlocked = false;
  let saturnRotationX = 0;
  let saturnRotationY = 0;
  
  // Sacred geometry constants
  const PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio ≈ 1.618

  function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    // No fog - pure black void

    // Camera with responsive FOV
    const isMobileDevice = window.innerWidth < 768;
    const baseFOV = isMobileDevice ? 60 : 45; // Wider FOV on mobile
    camera = new THREE.PerspectiveCamera(baseFOV, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(30, 20, 30);
    camera.lookAt(0, 10, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      alpha: false,
      precision: 'highp', // Force high precision to prevent color banding
      logarithmicDepthBuffer: false // Disable to prevent depth precision issues
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    // Disable shadows to prevent ground darkening
    renderer.shadowMap.enabled = false;
    // Disable tone mapping to prevent gradual changes
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.toneMappingExposure = 1.0;
    // Ensure color management is consistent
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // renderer.shadowMap.type = THREE.PCFShadowMap;

    // Create the Black Cube
    createBlackCube();
    
    // Also create Saturn (hidden initially)
    createSaturn();
    
    // Create the black triangle (hidden initially)
    createBlackTriangle();
    
    // Create the Flower of Life (hidden initially)
    createFlowerOfLife();

    // Create wasteland ground using modular component
    ground = createWastelandGround({
      receiveShadow: false  // Disable shadow receiving
    });
    scene.add(ground.getGroup());

    // Minimal lighting using standardized constants
    createStandardLighting();

    // Handle resize
    window.addEventListener('resize', handleResize);
  }

  function createBlackCube() {
    // Main cube - pure black but can become transparent
    const cubeGeometry = new THREE.BoxGeometry(10, 10, 10);
    const cubeMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
      emissive: 0x000000,
      shininess: 100,
      specular: 0x111111,
      transparent: true,
      opacity: 1.0
    });
    
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    // @ts-ignore
    cube.position.y = 15; // Floating above ground
    // cube.castShadow = true;
    scene.add(cube);

    // Create individual edges for depth-based rendering
    createIndividualEdges(cubeGeometry);
  }
  
  function createIndividualEdges(geometry) {
    // Define vertices of the cube
    const vertices = [
      new THREE.Vector3(-5, -5, -5), // 0
      new THREE.Vector3( 5, -5, -5), // 1
      new THREE.Vector3( 5,  5, -5), // 2
      new THREE.Vector3(-5,  5, -5), // 3
      new THREE.Vector3(-5, -5,  5), // 4
      new THREE.Vector3( 5, -5,  5), // 5
      new THREE.Vector3( 5,  5,  5), // 6
      new THREE.Vector3(-5,  5,  5), // 7
    ];
    
    // Define all 12 edges
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // back face
      [4, 5], [5, 6], [6, 7], [7, 4], // front face
      [0, 4], [1, 5], [2, 6], [3, 7], // connecting edges
    ];
    
    // Create individual edge lines using tube geometry for proper thickness
    edges.forEach(edge => {
      const start = vertices[edge[0]];
      const end = vertices[edge[1]];
      const direction = end.clone().sub(start);
      const length = direction.length();
      
      // Create tube geometry for thick lines
      const tubeGeometry = new THREE.CylinderGeometry(tubeRadius, tubeRadius, length, 8);
      const tubeMaterial = new THREE.MeshBasicMaterial({
        color: 0x888888  // Mid-gray between current dark and bright white
      });
      const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
      
      // Position and orient the tube
      tube.position.copy(start.clone().add(end).multiplyScalar(0.5));
      tube.lookAt(end);
      tube.rotateX(Math.PI / 2);
      
      cube.add(tube);
      cubeEdges.push(tube);
    });
  }

  function createStandardLighting() {
    // Ambient light using standardized values
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
    // Access shadow camera properties directly (Three.js uses OrthographicCamera for DirectionalLight)
    // @ts-ignore
    dirLight.shadow.camera.near = LIGHTING.DIRECTIONAL.shadow.camera.near;
    // @ts-ignore
    dirLight.shadow.camera.far = LIGHTING.DIRECTIONAL.shadow.camera.far;
    // @ts-ignore
    dirLight.shadow.camera.left = LIGHTING.DIRECTIONAL.shadow.camera.left;
    // @ts-ignore
    dirLight.shadow.camera.right = LIGHTING.DIRECTIONAL.shadow.camera.right;
    // @ts-ignore
    dirLight.shadow.camera.top = LIGHTING.DIRECTIONAL.shadow.camera.top;
    // @ts-ignore
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


  function createSaturn() {
    // Sacred geometry: Saturn's radius = cube edge / PHI
    // If cube is 10 units, Saturn radius = 10 / (2 * PHI) ≈ 3.09
    const cubeEdge = 10;
    const saturnRadius = cubeEdge / (2 * PHI); // ≈ 3.09
    
    // Sacred numbers: 32 segments (power of 2), 24 stacks (hours in day)
    const saturnGeometry = new THREE.SphereGeometry(saturnRadius, 32, 24);
    const saturnMaterial = new THREE.MeshPhongMaterial({
      color: 0x666666, // Brighter gray (but not as bright as white edges)
      emissive: 0x2a2a2a, // Slightly brighter emission
      shininess: 30, // Moderate shininess
      specular: 0x4a4a4a // Brighter specular
    });
    
    saturn = new THREE.Mesh(saturnGeometry, saturnMaterial);
    // @ts-ignore
    saturn.position.y = 15; // Same position as cube
    // saturn.castShadow = true;
    saturn.visible = false; // Hidden initially
    
    
    scene.add(saturn);

    // Saturn's rings with golden ratio proportions
    const ringGroup = new THREE.Group();
    // Ring proportions based on PHI
    const rings = [
      { inner: saturnRadius * PHI, outer: saturnRadius * PHI * 1.2 },        // Inner ring
      { inner: saturnRadius * PHI * 1.3, outer: saturnRadius * PHI * 1.5 },  // Middle ring  
      { inner: saturnRadius * PHI * 1.6, outer: saturnRadius * PHI * 2 }     // Outer ring
    ];

    rings.forEach(ring => {
      const ringGeometry = new THREE.RingGeometry(ring.inner, ring.outer, 64, 1);
      const ringMaterial = new THREE.MeshPhongMaterial({
        color: 0x0a0a0a,  // Very dark, almost black
        emissive: 0x000000,  // No glow
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
      // @ts-ignore
      ringMesh.rotation.x = -Math.PI / 2;
      // @ts-ignore
      ringGroup.add(ringMesh);
      
      // Add white edges for both inner and outer ring boundaries
      const saturnTubeRadius = tubeRadius;
      const edgeMaterial = new THREE.MeshBasicMaterial({
        color: 0x888888  // Mid-gray between current dark and bright white
      });
      
      // Inner edge
      const innerEdgeGeometry = new THREE.TorusGeometry(ring.inner, saturnTubeRadius, 8, 32);
      const innerEdge = new THREE.Mesh(innerEdgeGeometry, edgeMaterial);
      // @ts-ignore
      innerEdge.rotation.x = -Math.PI / 2;
      // @ts-ignore
      ringGroup.add(innerEdge);
      
      // Outer edge  
      const outerEdgeGeometry = new THREE.TorusGeometry(ring.outer, saturnTubeRadius, 8, 32);
      const outerEdge = new THREE.Mesh(outerEdgeGeometry, edgeMaterial);
      // @ts-ignore
      outerEdge.rotation.x = -Math.PI / 2;
      // @ts-ignore
      ringGroup.add(outerEdge);
    });

    // @ts-ignore
    ringGroup.rotation.x = -26.7 * Math.PI / 180;
    // @ts-ignore
    ringGroup.position.y = 15;
    ringGroup.visible = false; // Hidden initially
    
    saturnRings = ringGroup;
    scene.add(saturnRings);
  }
  
  function createBlackTriangle() {
    // Create a perfect 2D equilateral triangle
    const triangleShape = new THREE.Shape();
    const size = 14.4; // 44% bigger than cube/saturn (12 * 1.2 = 14.4)
    const height = size * Math.sqrt(3) / 2; // Height of equilateral triangle
    
    // Draw triangle centered at origin
    triangleShape.moveTo(0, height * 2/3);
    triangleShape.lineTo(-size/2, -height * 1/3);
    triangleShape.lineTo(size/2, -height * 1/3);
    triangleShape.closePath();
    
    // Use ShapeGeometry for perfect 2D appearance
    const geometry = new THREE.ShapeGeometry(triangleShape);
    
    // Pure black material with no lighting response
    const material = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.DoubleSide
    });
    
    blackTriangle = new THREE.Mesh(geometry, material);
    // @ts-ignore
    blackTriangle.position.y = 15; // Same height as cube/saturn
    blackTriangle.visible = false;
    
    // Add thick edge outline using tube geometry
    const trianglePoints = [
      new THREE.Vector3(0, height * 2/3, 0),
      new THREE.Vector3(-size/2, -height * 1/3, 0),
      new THREE.Vector3(size/2, -height * 1/3, 0),
      new THREE.Vector3(0, height * 2/3, 0) // Close the triangle
    ];
    
    for (let i = 0; i < trianglePoints.length - 1; i++) {
      const start = trianglePoints[i];
      const end = trianglePoints[i + 1];
      const direction = end.clone().sub(start);
      const length = direction.length();
      
      const tubeGeometry = new THREE.CylinderGeometry(tubeRadius, tubeRadius, length, 8);
      const tubeMaterial = new THREE.MeshBasicMaterial({
        color: 0x888888  // Mid-gray between current dark and bright white
      });
      const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
      
      // Position and orient the tube
      tube.position.copy(start.clone().add(end).multiplyScalar(0.5));
      tube.lookAt(end);
      tube.rotateX(Math.PI / 2);
      
      // @ts-ignore
      blackTriangle.add(tube);
    }
    
    scene.add(blackTriangle);
  }
  
  function createFlowerOfLife() {
    // Create group to hold all circles
    flowerOfLife = new THREE.Group();
    
    // Center circle radius
    const radius = 3;
    const circles = [];
    
    // Create circle geometry (using tube for thick lines)
    function createCircle(x, y, z = 0) {
      const curve = new THREE.EllipseCurve(
        x, y,            // Center
        radius, radius,  // xRadius, yRadius
        0, 2 * Math.PI,  // Start angle, end angle
        false,           // clockwise
        0                // rotation
      );
      
      const points = curve.getPoints(64);
      const geometry = new THREE.BufferGeometry().setFromPoints(
        points.map(p => new THREE.Vector3(p.x, p.y, z))
      );
      
      // Create tube geometry for thick lines
      const tubeGeometry = new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(
          points.map(p => new THREE.Vector3(p.x, p.y, z)),
          true // closed curve
        ),
        64,        // tubular segments
        tubeRadius * 0.8, // slightly thinner than other objects
        8,         // radial segments
        true       // closed
      );
      
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff
      });
      
      const circle = new THREE.Mesh(tubeGeometry, material);
      return circle;
    }
    
    // Create the pattern - center circle plus 6 surrounding circles
    // Center
    circles.push(createCircle(0, 0));
    
    // Six circles around center (60 degree intervals)
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      circles.push(createCircle(x, y));
    }
    
    // Second layer - 6 more circles at vertices of hexagon
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6 + Math.PI / 6; // Offset by 30 degrees
      const x = Math.cos(angle) * radius * Math.sqrt(3);
      const y = Math.sin(angle) * radius * Math.sqrt(3);
      circles.push(createCircle(x, y));
    }
    
    // Third layer - completing the flower pattern
    for (let i = 0; i < 6; i++) {
      const angle1 = (i * Math.PI * 2) / 6;
      const angle2 = ((i + 1) * Math.PI * 2) / 6;
      
      // Position between two adjacent circles
      const x = Math.cos(angle1) * radius + Math.cos(angle2) * radius;
      const y = Math.sin(angle1) * radius + Math.sin(angle2) * radius;
      circles.push(createCircle(x, y));
    }
    
    // Add all circles to group
    circles.forEach(circle => {
      flowerOfLife.add(circle);
    });
    
    // Position at same height as other objects
    flowerOfLife.position.y = 15;
    flowerOfLife.visible = false;
    
    // Rotate to face camera like triangle
    flowerOfLife.rotation.x = 0;
    
    scene.add(flowerOfLife);
  }

  function goToSaturn(event) {
    event.stopPropagation();
    sceneStore.dispatch(actions.showSaturn());
  }
  
  function handleSaturnTimingClick() {
    // Check if current seconds has a '6' in it
    const seconds = currentTime.getSeconds();
    const hasSecondsWithSix = seconds.toString().includes('6');
    
    if (hasSecondsWithSix) {
      // Correct timing! Increment counter
      saturnCounter++;
      console.log(`Saturn reveals: ${'6'.repeat(saturnCounter)}`);
      
      // Check if we've reached 666
      if (saturnCounter >= 3) {
        sceneStore.dispatch(actions.unlockSaturnSecret());
        console.log('🪐 Saturn\'s time mastery achieved: 666!');
      }
    } else {
      // Wrong timing - Saturn punishes impatience
      if (saturnCounter > 0) {
        console.log('Saturn resets: time waits for no one...');
      }
      saturnCounter = 0;
    }
  }
  
  function getTimeArray(time) {
    const timeString = time.toLocaleTimeString('en-US', { hour12: false });
    const seconds = time.getSeconds().toString().padStart(2, '0');
    
    // Split into individual characters for Svelte template rendering
    return timeString.split('').map((char, index) => {
      // Only highlight '6' in the seconds position (last 2 digits)
      // But stop highlighting after first successful click
      const isSecondsPosition = index >= timeString.length - 2;
      return {
        char,
        isSix: char === '6' && isSecondsPosition && saturnCounter === 0
      };
    });
  }
  
  function updateTriangleBreath() {
    const currentTime = Date.now();
    if (breathStartTime === 0) {
      breathStartTime = currentTime;
    }
    
    const elapsed = (currentTime - breathStartTime) / 1000; // seconds
    const cycleDuration = 6; // 3 seconds inhale + 3 seconds exhale
    const phaseTime = elapsed % cycleDuration;
    
    if (phaseTime < 3) {
      breathPhase = 'inhale';
    } else {
      breathPhase = 'exhale';
    }
    
    // Triangle breathing effect with dramatic color change
    if (blackTriangle && blackTriangle.children) {
      // Use smooth sine wave for natural breathing
      const breathWave = Math.sin((elapsed / cycleDuration) * Math.PI * 2);
      const breathIntensity = 0.5 + (breathWave * 0.5); // 0 to 1
      
      blackTriangle.children.forEach((child, i) => {
        if (child.material) {
          // Breathe from dark gray to bright white
          const darkGray = 0x333333;   // Very dark
          const brightWhite = 0xFFFFFF; // Pure white
          
          const r = Math.floor(0x33 + (breathIntensity * (0xFF - 0x33)));
          const g = Math.floor(0x33 + (breathIntensity * (0xFF - 0x33)));
          const b = Math.floor(0x33 + (breathIntensity * (0xFF - 0x33)));
          const color = (r << 16) | (g << 8) | b;
          
          child.material.color.setHex(color);
        }
      });
    }
  }
  
  function handleTriangleBreathClick() {
    // Check if click is perfectly timed with breath peak (inhale peak)
    const currentTime = Date.now();
    const elapsed = (currentTime - breathStartTime) / 1000;
    const cycleDuration = 6;
    const phaseTime = elapsed % cycleDuration;
    
    // Peak of inhale is at 1.5 seconds into the cycle (middle of 3-second inhale)
    const isPeakMoment = phaseTime >= 1.3 && phaseTime <= 1.7; // 0.4 second window
    
    if (isPeakMoment) {
      breathCounter++;
      console.log(`Triangle breath: ${breathCounter}/3`);
      
      // Flash the glow effect for successful timing
      triangleGlowActive = true;
      setTimeout(() => {
        triangleGlowActive = false;
      }, 400); // 0.4 seconds, same as the success window
      
      if (breathCounter >= 3) {
        sceneStore.dispatch(actions.unlockTrinitySecret());
        sceneStore.dispatch(actions.showFlower());
        console.log('△ Trinity alignment achieved!');
      }
    } else {
      // Triangle demands perfect synchronization
      if (breathCounter > 0) {
        console.log('Triangle resets: timing must align with the peak...');
      }
      breathCounter = 0;
    }
  }
  
  // Simple visibility - show exactly what the store says to show
  $: if (cube && saturn && saturnRings && blackTriangle && flowerOfLife) {
    cube.visible = state.showCube;
    cubeEdges.forEach(edge => edge.visible = state.showCube);
    saturn.visible = state.showSaturn;
    saturnRings.visible = state.showSaturn;
    blackTriangle.visible = state.showTriangle;
    flowerOfLife.visible = state.showFlower;
  }

  function handleResize() {
    // Update camera aspect and FOV for new size
    camera.aspect = window.innerWidth / window.innerHeight;
    
    // Adjust FOV on resize too
    const isMobileDevice = window.innerWidth < 768;
    camera.fov = isMobileDevice ? 60 : 45;
    
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    requestAnimationFrame(animate);
    time += 0.01;
    
    // Update current time for Saturn secret
    currentTime = new Date();
    
    // Update triangle breath cycle
    if (state.showTriangle) {
      updateTriangleBreath();
    }
    
    const cubeEdge = 10; // Cube size constant

    // Object rotation - only when in auto mode
    if (state.autoRotate) {
      if (!state.showSaturn) {
        cube.rotation.y = time * 0.1;
      
        // The secret: viewing from specific angle shows hexagon
        // When viewed from corner (1,1,1 direction), cube projects as hexagon
        const revealAngle = Math.sin(time * 0.2) * 0.1;
        cube.rotation.x = 0.615 + revealAngle; // Magic angle: atan(1/sqrt(2))
      } else if (!state.showTriangle) {
        // Rotate Saturn only if not showing triangle
        saturn.rotation.y = time * 0.05;
        saturnRings.rotation.z = Math.sin(time * 0.3) * 0.02;
        saturnRings.rotation.x = -26.7 * (Math.PI / 180) + Math.cos(time * 0.25) * 0.03;
      }
    }
    // When manual control, keep cube still so user can find the angles
    
    // Handle triangle visibility
    if (state.showTriangle && blackTriangle) {
      blackTriangle.visible = true;
      // Always face camera for perfect 2D appearance
      blackTriangle.lookAt(camera.position);
    }

    // Camera distance responsive to screen size
    const aspectRatio = window.innerWidth / window.innerHeight;
    const isMobile = window.innerWidth < 768;
    
    // Adjust camera distance based on screen size and aspect ratio
    let cameraDistance = cubeEdge * PHI * PHI; // Base: 10 * 1.618² ≈ 26.18
    let cameraHeight = cubeEdge * PHI; // Base: 10 * 1.618 ≈ 16.18
    
    if (isMobile) {
      // Zoom out more on mobile to ensure everything fits
      const zoomFactor = aspectRatio < 1 ? 1.5 : 1.3; // More zoom for portrait
      cameraDistance *= zoomFactor;
      cameraHeight *= zoomFactor;
    }
    
    if (state.autoRotate) {
      // Slight camera orbit for ambiance - works for all states
      camera.position.x = cameraDistance + Math.sin(time * 0.1) * 2;
      camera.position.y = cameraHeight;
      camera.position.z = cameraDistance + Math.cos(time * 0.1) * 2;
    } else if (!state.showTriangle && !state.showFlower) {
      // Camera stays still, objects rotate with mouse (not for triangle/flower)
      camera.position.set(cameraDistance, cameraHeight, cameraDistance);
      
      // Rotate the active object based on mouse
      const activeObject = state.showSaturn ? saturn : cube;
      
      // Normal object rotation
      activeObject.rotation.x = state.mouseY * Math.PI;
      activeObject.rotation.y = state.mouseX * Math.PI * 2;
      
      // Also rotate Saturn's rings if active - now on both axes
      if (state.showSaturn && saturnRings) {
        saturnRings.rotation.z = state.mouseY * Math.PI * 0.3; // Tilt based on Y
        saturnRings.rotation.x = -26.7 * (Math.PI / 180) + state.mouseX * Math.PI * 0.2; // Additional X-axis rotation
      }
      
      // Update Saturn rotation in store
      if (state.showSaturn) {
        sceneStore.dispatch(actions.updateRotation(
          saturn.rotation.x,
          saturn.rotation.y
        ));
      }
    } else {
      // Fixed camera for triangle and flower states
      camera.position.set(cameraDistance, cameraHeight, cameraDistance);
    }
    
    // Set camera look target based on current state
    let lookAtTarget;
    if (state.showFlower) {
      lookAtTarget = flowerOfLife.position;
    } else if (state.showTriangle) {
      lookAtTarget = blackTriangle.position;
    } else if (state.showSaturn) {
      lookAtTarget = saturn.position;
    } else {
      lookAtTarget = cube.position;
    }
    camera.lookAt(lookAtTarget);
    
    // Calculate if cube is oriented to show hexagon pattern
    // The hexagon appears when viewing cube from corner angles
    let maxAlignment = 0;
    
    if (!state.showSaturn) {
      // Get the view direction (from cube to camera, normalized)
      const viewDir = camera.position.clone().sub(cube.position).normalize();
      
      // All 8 corner directions of a cube (in local space)
      const localCorners = [
        new THREE.Vector3( 1,  1,  1).normalize(),
        new THREE.Vector3( 1,  1, -1).normalize(),
        new THREE.Vector3( 1, -1,  1).normalize(),
        new THREE.Vector3( 1, -1, -1).normalize(),
        new THREE.Vector3(-1,  1,  1).normalize(),
        new THREE.Vector3(-1,  1, -1).normalize(),
        new THREE.Vector3(-1, -1,  1).normalize(),
        new THREE.Vector3(-1, -1, -1).normalize(),
      ];
      
      // Transform corner directions by cube's current rotation
      const worldCorners = localCorners.map(corner => {
        return corner.clone().applyEuler(cube.rotation);
      });
      
      // Find the maximum alignment with any corner
      worldCorners.forEach(corner => {
        const alignment = Math.abs(viewDir.dot(corner));
        maxAlignment = Math.max(maxAlignment, alignment);
      });
    }
    
    // Extremely sharp activation - only at nearly perfect angles
    const hexagonStrength = state.autoRotate ? 0 : Math.pow(maxAlignment, 100); // Incredibly sharp, only in manual mode
    
    // Update appearance based on alignment
    if (state.showSaturn) {
      updateSaturnAppearance();
    } else {
      updateCubeAppearance(hexagonStrength);
      
      // Smooth fade animation for cube opacity
      const fadeSpeed = 0.08; // Adjust for faster/slower fade
      currentCubeOpacity += (targetCubeOpacity - currentCubeOpacity) * fadeSpeed;
      
      // Apply the smoothed opacity to the cube
      if (cube && cube.material) {
        cube.material.opacity = currentCubeOpacity;
      }
    }

    renderer.render(scene, camera);
  }
  
  function updateSaturnAppearance() {
    // Check for secret rotation combination
    const targetX = Math.PI * 0.666; // ~120 degrees (occult angle)
    const targetY = Math.PI * 1.333; // ~240 degrees
    
    const xError = Math.abs(saturn.rotation.x - targetX);
    const yError = Math.abs(saturn.rotation.y - targetY);
    
    // Very tight tolerance
    const tolerance = 0.05;
    const isAligned = xError < tolerance && yError < tolerance;
    
    if (isAligned && !state.autoRotate) {
      // Unlock secret at perfect alignment
      const alignment = 1 - (xError + yError) / (tolerance * 2);
      if (alignment > 0.95 && !state.saturnSecretUnlocked) {
        sceneStore.dispatch(actions.unlockSaturnSecret());
      }
    }
  }
  
  function updateCubeAppearance(hexagonStrength) {
    // Update each edge based on its depth from camera
    cubeEdges.forEach((edge, index) => {
      // Get edge midpoint in world space
      const midpoint = new THREE.Vector3();
      edge.updateMatrixWorld();
      edge.geometry.computeBoundingBox();
      edge.geometry.boundingBox.getCenter(midpoint);
      midpoint.applyMatrix4(edge.matrixWorld);
      
      // Calculate distance from camera
      const distance = camera.position.distanceTo(midpoint);
      
      // Determine if this edge is in front or back
      const edgeDir = midpoint.clone().sub(cube.position);
      const cameraDir = camera.position.clone().sub(cube.position);
      const isFrontFacing = edgeDir.dot(cameraDir) > 0;
      
      // When at the perfect magic angle (viewing from corner)
      if (hexagonStrength > 0.995) {
        // Make cube fully transparent
        targetCubeOpacity = 0.0;
        
        // All edges bright golden for the star pattern
        edge.material.color.setHex(0xffcc00); // Bright Saturn gold
        edge.material.opacity = 1.0;
        
        // Unlock the secret when lines turn yellow
        if (!state.secretUnlocked) {
          sceneStore.dispatch(actions.unlockCubeSecret());
        }
      } else if (hexagonStrength > 0.95) {
        // Very close - cube becomes transparent as a hint
        targetCubeOpacity = 0.1;
        
        // Front edges brighter, back edges dimmer for better orientation
        if (isFrontFacing) {
          edge.material.color.setHex(0xcccccc); // Brighter for front-facing edges
          edge.material.opacity = 0.9;
        } else {
          edge.material.color.setHex(0x666666); // Darker for back-facing edges
          edge.material.opacity = 0.4;
        }
      } else {
        // Normal opaque BLACK cube
        targetCubeOpacity = 1.0;
        
        // All edges same color and fully visible
        edge.material.color.setHex(0x888888);
        edge.material.opacity = 1.0;
      }
    });
  }

  onMount(() => {
    init();
    animate();

    // Mouse/Touch controls
    const handlePointerMove = (event) => {
      // No interaction in flower state
      if (state.showFlower) {
        return;
      }
      
      // Handle both mouse and touch events
      const clientX = event.clientX ?? event.touches?.[0]?.clientX;
      const clientY = event.clientY ?? event.touches?.[0]?.clientY;
      
      if (clientX !== undefined && clientY !== undefined) {
        const x = (clientX / window.innerWidth) * 2 - 1;
        const y = -(clientY / window.innerHeight) * 2 + 1;
        sceneStore.dispatch(actions.updateMousePosition(x, y));
      }
    };
    
    const handlePointerDown = (event) => {
      // Don't toggle if clicking on a button
      if (event.target.tagName === 'BUTTON') {
        return;
      }
      
      // Prevent default touch behavior (scrolling, zooming)
      if (event.type.includes('touch')) {
        event.preventDefault();
      }
      
      // Handle different interaction modes
      if (state.showFlower) {
        // Final state - no interaction
        return;
      } else if (state.showTriangle) {
        handleTriangleBreathClick();
      } else if (state.showSaturn) {
        handleSaturnTimingClick();
      } else if ($canInteractWithCube) {
        // Toggle auto-rotate on click/tap for cube
        sceneStore.dispatch(actions.toggleAutoRotate());
      }
    };
    
    const handleKeyPress = (event) => {
      // Only handle keys for cube mode
      if (!$canInteractWithCube) {
        return;
      }
      
      if (event.key === ' ') {
        sceneStore.dispatch(actions.toggleAutoRotate());
      } else if (event.key === 'Escape') {
        // Escape always returns to auto-rotate
        sceneStore.dispatch(actions.setAutoRotate(true));
      }
    };
    
    // Add both mouse and touch event listeners
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
    window.addEventListener('keypress', handleKeyPress);
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      canvas.removeEventListener('mousedown', handlePointerDown);
      canvas.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('keypress', handleKeyPress);
      window.removeEventListener('keydown', handleKeyPress);
      if (ground) ground.dispose();
      renderer.dispose();
    };
  });
</script>

<canvas bind:this={canvas}></canvas>

<div class="controls-hint">
  {#if state.showFlower}
    <!-- Final state - no hints -->
  {:else if state.showTriangle}
    <!-- Triangle breath ritual interface -->
    <p class="triangle-breath" class:success-glow={triangleGlowActive}>
      {breathPhase}
    </p>
  {:else if state.showSaturn}
    <!-- Saturn time secret interface -->
    <p class="saturn-time">
      {#each getTimeArray(currentTime) as timeChar}
        <span class:glowing-six={timeChar.isSix}>{timeChar.char}</span>
      {/each}
      {#if saturnCounter > 0}
        <span class="saturn-counter" class:complete={saturnCounter >= 3}>{'6'.repeat(saturnCounter)}</span>
      {/if}
    </p>
  {:else if state.autoRotate}
    <p>Tap to control</p>
  {:else}
    <p>Drag to rotate • Tap to release</p>
  {/if}
</div>

<!-- Saturn button (shows when cube secret unlocked) -->
{#if state.cubeSecretUnlocked}
<button class="secret-button" on:click={goToSaturn}>
  ⬢
</button>
{/if}

<!-- Triangle button (shows when saturn secret unlocked) -->
{#if state.saturnSecretUnlocked}
  <button 
    class="saturn-secret-button" 
    on:click={(e) => {
      e.stopPropagation();
      sceneStore.dispatch(actions.showTriangle());
    }}
    on:touchstart={(e) => e.stopPropagation()}
    on:touchend={(e) => e.stopPropagation()}
    on:mousedown={(e) => e.stopPropagation()}
  >
    △
  </button>
{/if}

<!-- Flower button (for testing - shows when trinity secret unlocked) -->
{#if state.trinitySecretUnlocked}
  <button 
    class="trinity-secret-button" 
    on:click={(e) => {
      e.stopPropagation();
      sceneStore.dispatch(actions.showFlower());
    }}
    on:touchstart={(e) => e.stopPropagation()}
    on:touchend={(e) => e.stopPropagation()}
    on:mousedown={(e) => e.stopPropagation()}
  >
    ❀
  </button>
{/if}

<!-- Cube return button (only in magic mode) -->
{#if magicMode && !state.showCube}
  <button 
    class="cube-return-button" 
    on:click={(e) => {
      e.stopPropagation();
      sceneStore.dispatch(actions.showCube());
    }}
    on:touchstart={(e) => e.stopPropagation()}
    on:touchend={(e) => e.stopPropagation()}
    on:mousedown={(e) => e.stopPropagation()}
  >
    ◼
  </button>
{/if}

<style>
  canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none; /* Prevent pinch zoom and pan */
  }
  
  .controls-hint {
    position: absolute;
    top: 20px;
    left: 20px;
    color: #333;
    font-family: 'Courier New', monospace;
    font-size: 11px;
    letter-spacing: 1px;
    opacity: 0.5;
    pointer-events: none; /* Don't block touch events */
    user-select: none;
  }
  
  @media (max-width: 768px) {
    .controls-hint {
      font-size: 13px; /* Larger on mobile */
      opacity: 0.7; /* 40% brighter on mobile */
    }
  }
  
  .saturn-time {
    font-family: 'Courier New', monospace;
    font-size: 14px;
    letter-spacing: 2px;
    margin: 0;
  }
  
  .saturn-counter {
    color: #666;
    font-weight: bold;
    margin-left: 10px;
    letter-spacing: 2px;
    transition: all 0.3s ease;
  }
  
  .saturn-counter.complete {
    color: #cc0000;
    text-shadow: 0 0 10px rgba(204, 0, 0, 0.6);
    animation: pulse 1s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  .glowing-six {
    color: #333;
    text-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
    animation: subtle-pulse 3s ease-in-out infinite;
  }
  
  @keyframes subtle-pulse {
    0%, 100% { 
      text-shadow: 0 0 2px rgba(255, 255, 255, 0.6);
    }
    50% { 
      text-shadow: 0 0 6px rgba(255, 255, 255, 1);
    }
  }
  
  .triangle-breath {
    font-family: 'Courier New', monospace;
    font-size: 14px;
    letter-spacing: 2px;
    margin: 0;
    text-transform: lowercase;
    opacity: 0.7;
    transition: all 0.1s ease;
  }
  
  .triangle-breath.success-glow {
    opacity: 1;
    font-weight: bold;
    color: #fff;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
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
    opacity: 0;
    animation: fadeIn 1s forwards;
  }
  
  .secret-button:hover {
    background: #ccaa00;
    color: #000;
    box-shadow: 0 0 20px #ccaa00;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .saturn-secret-button {
    position: absolute;
    top: 80px; /* Positioned below the cube/saturn toggle button */
    right: 20px;
    background: none;
    border: 1px solid #ccaa00;
    color: #ccaa00;
    font-size: 32px;
    width: 48px;
    height: 48px;
    cursor: pointer;
    font-family: 'Courier New', monospace;
    transition: all 0.3s ease;
    opacity: 0;
    animation: fadeIn 2s forwards;
    -webkit-tap-highlight-color: transparent; /* Remove tap highlight */
    touch-action: manipulation; /* Prevent double-tap zoom */
    z-index: 1000; /* Ensure button is on top */
  }
  
  @media (max-width: 768px) {
    .saturn-secret-button {
      top: 80px; /* Keep same vertical spacing on mobile */
    }
  }
  
  .saturn-secret-button:hover {
    background: #ccaa00;
    color: #000;
    box-shadow: 0 0 20px #ccaa00;
  }
  
  .saturn-secret-button:active {
    transform: translateX(-50%) scale(0.95);
  }
  
  .trinity-secret-button {
    position: absolute;
    top: 140px; /* Positioned below the triangle button */
    right: 20px;
    background: none;
    border: 1px solid #ccaa00;
    color: #ccaa00;
    font-size: 32px;
    width: 48px;
    height: 48px;
    cursor: pointer;
    font-family: 'Courier New', monospace;
    transition: all 0.3s ease;
    opacity: 0;
    animation: fadeIn 2s forwards;
    -webkit-tap-highlight-color: transparent; /* Remove tap highlight */
    touch-action: manipulation; /* Prevent double-tap zoom */
    z-index: 1000; /* Ensure button is on top */
  }
  
  @media (max-width: 768px) {
    .trinity-secret-button {
      top: 140px; /* Keep same vertical spacing on mobile */
    }
  }
  
  .trinity-secret-button:hover {
    background: #ccaa00;
    color: #000;
    box-shadow: 0 0 20px #ccaa00;
  }
  
  .trinity-secret-button:active {
    transform: translateX(-50%) scale(0.95);
  }
  
  .cube-return-button {
    position: absolute;
    top: 200px;
    right: 20px;
    background: none;
    border: 1px solid #ccaa00;
    color: #ccaa00;
    font-size: 32px;
    width: 48px;
    height: 48px;
    cursor: pointer;
    font-family: 'Courier New', monospace;
    transition: all 0.3s ease;
    opacity: 0;
    animation: fadeIn 1s forwards;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    z-index: 1000;
  }
  
  .cube-return-button:hover {
    background: #ccaa00;
    color: #000;
    box-shadow: 0 0 20px #ccaa00;
  }
  
  .cube-return-button:active {
    transform: scale(0.95);
  }
</style>