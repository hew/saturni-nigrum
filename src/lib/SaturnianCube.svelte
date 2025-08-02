<script>
  import { onMount, tick } from 'svelte';
  import * as THREE from 'three';
  import { createEventDispatcher } from 'svelte';
  import { createWastelandGround } from './three-core/components/Ground.js';
  import { LIGHTING } from './three-core/utils/Constants.js';
  import { sceneStore, actions, canInteractWithCube } from './store.js';
  import ControlsHint from './components/ui/ControlsHint.svelte';
  import SecretButtons from './components/ui/SecretButtons.svelte';
  import { SceneManager } from './components/SceneManager.js';
  
  const dispatch = createEventDispatcher();
  
  export let magicMode = false;

  // Simple reactive state from store - no complex mapping needed!
  $: state = $sceneStore;

  let canvas;
  let sceneManager;
  let scene, camera, renderer;
  let cubeObject, saturnObject, triangleObject, flowerObject;
  let cube, cubeEdges = [];
  let saturn, saturnRings;
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
  let triangleGlowActive = false;
  
  // Cube hint animation
  let targetCubeOpacity = 1.0;
  let currentCubeOpacity = 1.0;
  
  // Timer for yellow edge duration
  let yellowEdgeStartTime = 0;
  let yellowEdgeDuration = 0;
  
  // Responsive line thickness
  $: isMobile = window?.innerWidth < 768;
  $: tubeRadius = isMobile ? 0.05 : 0.025; // 50% thinner on desktop
  $: if (sceneManager) sceneManager.setTubeRadius(tubeRadius);
  
  // Metatron variables
  let metatronCube = null;
  $: showMetatron = flowerObject ? flowerObject.isShowingMetatron() : false;
  
  
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
    // Initialize scene manager
    sceneManager = new SceneManager(canvas);
    const setup = sceneManager.init();
    scene = setup.scene;
    camera = setup.camera;
    renderer = setup.renderer;

    // Create all objects
    const objects = sceneManager.createObjects(tubeRadius);
    cube = objects.cube;
    saturn = objects.saturn;
    saturnRings = objects.saturnRings;
    blackTriangle = objects.blackTriangle;
    flowerOfLife = objects.flowerOfLife;
    
    // Get object references
    cubeObject = sceneManager.cubeObject;
    saturnObject = sceneManager.saturnObject;
    triangleObject = sceneManager.triangleObject;
    flowerObject = sceneManager.flowerObject;
    
    // Keep compatibility references
    cubeEdges = cubeObject.cubeEdges;

    // Handle resize
    window.addEventListener('resize', handleResize);
  }




  function goToSaturn(event) {
    event.stopPropagation();
    sceneStore.dispatch(actions.showSaturn());
  }
  
  function handleSaturnTimingClick() {
    if (!saturnObject) return;
    
    if (saturnObject.checkTimingSecret(currentTime)) {
      sceneStore.dispatch(actions.unlockSaturnSecret());
    }
    
    // Update local counter for display
    saturnCounter = saturnObject.saturnCounter;
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
    if (!triangleObject) return;
    
    // Update the breathing animation
    const newPhase = triangleObject.updateBreath();
    
    // Only update if phase actually changed to avoid unnecessary reactivity
    if (newPhase !== breathPhase) {
      breathPhase = newPhase;
    }
    
    triangleGlowActive = triangleObject.triangleGlowActive;
  }
  
  function handleTriangleBreathClick() {
    if (!triangleObject) return;
    
    if (triangleObject.checkBreathClick()) {
      // Trinity achieved!
      sceneStore.dispatch(actions.unlockTrinitySecret());
      sceneStore.dispatch(actions.showFlower());
    }
    
    // Update local state for display
    triangleGlowActive = triangleObject.triangleGlowActive;
  }
  
  function handleFlowerClick(event) {
    if (!state.showFlower || !flowerObject) return;
    
    // Handle both mouse and touch events
    const clientX = event.clientX ?? event.touches?.[0]?.clientX;
    const clientY = event.clientY ?? event.touches?.[0]?.clientY;
    
    if (clientX === undefined || clientY === undefined) return;
    
    // Get position in normalized device coordinates
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;
    
    // Raycaster for click detection
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    
    // Let FlowerOfLife handle the click
    if (flowerObject.handleClick(raycaster, isMobile)) {
      // Pattern complete!
      showMetatron = true;
      metatronCube = flowerObject.metatronCube;
    }
  }
  
  // Simple visibility - show exactly what the store says to show
  $: if (cube && saturn && saturnRings && blackTriangle && flowerOfLife) {
    cube.visible = state.showCube;
    cubeEdges.forEach(edge => edge.visible = state.showCube);
    if (saturnObject) {
      if (state.showSaturn && !saturn.visible) {
        saturnObject.show();
      } else if (!state.showSaturn && saturn.visible) {
        saturnObject.hide();
      }
    }
    if (triangleObject) {
      if (state.showTriangle && !triangleObject.triangle.visible) {
        triangleObject.show();
      } else if (!state.showTriangle && triangleObject.triangle.visible) {
        triangleObject.hide();
      }
    }
    if (flowerObject) {
      if (state.showFlower && !flowerObject.flowerGroup.visible) {
        flowerObject.show();
      } else if (!state.showFlower && flowerObject.flowerGroup.visible) {
        flowerObject.hide();
      }
    }
  }

  function handleResize() {
    if (sceneManager) {
      sceneManager.handleResize();
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    time += 0.01;
    
    // Update current time for Saturn secret
    currentTime = new Date();
    
    // Update triangle breath cycle
    if (state.showTriangle && triangleObject) {
      updateTriangleBreath();
    }
    
    const cubeEdge = 10; // Cube size constant

    // Object rotation
    if (state.showSaturn && !state.showTriangle) {
      // Saturn always auto-rotates
      if (saturnObject) {
        saturnObject.animate(time);
      }
    } else if (state.showCube && state.autoRotate) {
      // Cube only rotates in auto mode
      if (cubeObject && cube) {
        cube.rotation.y = time * 0.1;
      
        // The secret: viewing from specific angle shows hexagon
        // When viewed from corner (1,1,1 direction), cube projects as hexagon
        const revealAngle = Math.sin(time * 0.2) * 0.1;
        cube.rotation.x = 0.615 + revealAngle; // Magic angle: atan(1/sqrt(2))
      }
    }
    // When manual control, keep cube still so user can find the angles
    
    // Handle triangle visibility
    if (state.showTriangle && triangleObject) {
      triangleObject.lookAtCamera(camera.position);
    }
    
    // Handle Flower/Metatron visibility
    if (state.showFlower && flowerObject) {
      flowerObject.lookAtCamera(camera.position);
    }

    // Camera distance responsive to screen size
    const aspectRatio = window.innerWidth / window.innerHeight;
    const isMobile = window.innerWidth < 768;
    
    // Get camera distance from scene manager
    const { distance: cameraDistance, height: cameraHeight } = 
      sceneManager ? sceneManager.getCameraDistance(isMobile, aspectRatio) : 
      { distance: 26.18, height: 16.18 };
    
    // Fixed camera position for all states - no movement
    camera.position.set(cameraDistance, cameraHeight, cameraDistance);
    
    // Handle manual cube rotation when not in auto-rotate mode
    if (state.showCube && !state.autoRotate && cubeObject && cube) {
      cube.rotation.x = state.mouseY * Math.PI;
      cube.rotation.y = state.mouseX * Math.PI * 2;
    }
    
    // Set camera look target based on current state
    let lookAtTarget;
    if (state.showFlower && flowerOfLife) {
      lookAtTarget = flowerOfLife.position;
    } else if (state.showTriangle && blackTriangle) {
      lookAtTarget = blackTriangle.position;
    } else if (state.showSaturn) {
      lookAtTarget = saturn.position;
    } else {
      lookAtTarget = cube ? cube.position : new THREE.Vector3(0, 15, 0);
    }
    camera.lookAt(lookAtTarget);
    
    // Calculate if cube is oriented to show hexagon pattern
    // The hexagon appears when viewing cube from corner angles
    let maxAlignment = 0;
    
    if (!state.showSaturn && cube) {
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
    if (state.showCube && cubeObject) {
      updateCubeAppearance(hexagonStrength);
      
      // Smooth fade animation for cube opacity
      const fadeSpeed = 0.08; // Adjust for faster/slower fade
      currentCubeOpacity += (targetCubeOpacity - currentCubeOpacity) * fadeSpeed;
      
      // Apply the smoothed opacity to the cube
      if (cube && cube.material) {
        cube.material.opacity = currentCubeOpacity;
      }
      
      // Update cube object's internal state
      cubeObject.targetCubeOpacity = targetCubeOpacity;
      cubeObject.currentCubeOpacity = currentCubeOpacity;
    }

    if (sceneManager) sceneManager.render();
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
    if (!cubeObject) return;
    
    // Handle yellow edge timing
    if (state.cubeSecretUnlocked && yellowEdgeStartTime === 0) {
      yellowEdgeStartTime = Date.now();
    }
    yellowEdgeDuration = yellowEdgeStartTime > 0 ? Date.now() - yellowEdgeStartTime : 0;
    
    // Update opacity based on hexagon strength
    if (hexagonStrength > 0.995) {
      targetCubeOpacity = 0.0;
      if (!state.secretUnlocked && yellowEdgeDuration >= 2000) {
        sceneStore.dispatch(actions.unlockCubeSecret());
      }
    } else if (hexagonStrength > 0.95) {
      targetCubeOpacity = 0.1;
      yellowEdgeStartTime = 0;
      yellowEdgeDuration = 0;
    } else {
      targetCubeOpacity = 1.0;
      yellowEdgeStartTime = 0;
      yellowEdgeDuration = 0;
    }
    
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
        
        // Track how long edges have been yellow
        if (yellowEdgeStartTime === 0) {
          yellowEdgeStartTime = Date.now();
        }
        yellowEdgeDuration = (Date.now() - yellowEdgeStartTime) / 1000; // Convert to seconds
        
        // Unlock the secret only after 2 seconds of perfect alignment
        if (!state.secretUnlocked && yellowEdgeDuration >= 2.0) {
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
        
        // Reset timer if we're only close but not perfect
        yellowEdgeStartTime = 0;
        yellowEdgeDuration = 0;
      } else {
        // Normal opaque BLACK cube
        targetCubeOpacity = 1.0;
        
        // All edges same color and fully visible
        edge.material.color.setHex(0x888888);
        edge.material.opacity = 1.0;
        
        // Reset the yellow edge timer if alignment is lost
        yellowEdgeStartTime = 0;
        yellowEdgeDuration = 0;
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
        // Flower state - check for sacred geometry clicks
        handleFlowerClick(event);
        return;
      } else if (state.showTriangle) {
        handleTriangleBreathClick();
      } else if (state.showSaturn) {
        // For Saturn: only handle the timing click, no rotation control
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
      if (sceneManager) sceneManager.dispose();
    };
  });
</script>

<canvas bind:this={canvas}></canvas>

<ControlsHint 
  {state}
  {showMetatron}
  {triangleGlowActive}
  {breathPhase}
  {currentTime}
  {saturnCounter}
  {magicMode}
/>

<SecretButtons 
  {state}
  {magicMode}
  on:goToSaturn={goToSaturn}
  on:showTriangle={() => sceneStore.dispatch(actions.showTriangle())}
  on:showFlower={() => sceneStore.dispatch(actions.showFlower())}
  on:showCube={() => sceneStore.dispatch(actions.showCube())}
/>

<style>
  canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none; /* Prevent pinch zoom and pan */
  }
  
</style>