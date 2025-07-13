/**
 * Usage Examples for Three.js Core Components
 * Demonstrates how to use the modular components to create consistent scenes
 */

// Example 1: Creating a unified desert scene
import { 
  BaseScene, 
  createDesertGround, 
  createDesertLighting, 
  DESERT_CONFIG 
} from '../index.js';

export function createDesertScene(canvas) {
  // Option 1: Use BaseScene with configuration
  const scene = new BaseScene(canvas, {
    groundType: 'desert',
    lightingPreset: 'dramatic',
    enablePostProcessing: true,
    ...DESERT_CONFIG.scene
  });
  
  // The ground and lighting are automatically created
  // Add custom elements like pyramid here
  
  return scene;
}

// Example 2: Creating a Saturn scene with unified components
import { 
  BaseScene, 
  createWastelandGround, 
  createSaturnLighting, 
  Saturn, 
  SATURN_CONFIG 
} from '../index.js';

export function createSaturnScene(canvas) {
  const scene = new BaseScene(canvas, {
    groundType: 'wasteland',
    lightingPreset: 'saturn',
    enableShadows: true,
    ...SATURN_CONFIG.scene
  });
  
  // Add Saturn planet with rings
  const saturn = new Saturn(SATURN_CONFIG.saturn);
  scene.getScene().add(saturn.getGroup());
  
  // Animation loop to update Saturn
  const originalUpdate = scene.onUpdate.bind(scene);
  scene.onUpdate = function(deltaTime, time) {
    originalUpdate(deltaTime, time);
    saturn.update(deltaTime);
  };
  
  return { scene, saturn };
}

// Example 3: Creating a solar system scene
import { 
  SolarSystemScene, 
  SOLAR_SYSTEM_CONFIG 
} from '../index.js';

export function createSolarSystemScene(canvas) {
  const scene = new SolarSystemScene(canvas, {
    // Configuration is handled internally
    ...SOLAR_SYSTEM_CONFIG.scene
  });
  
  return scene;
}

// Example 4: Manual ground creation for custom scenes
import { 
  Ground, 
  LightingSystem, 
  COLORS 
} from '../index.js';

export function createCustomScene(canvas, sceneType = 'desert') {
  // Create basic Three.js scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas });
  
  // Create unified ground
  const ground = new Ground({
    type: sceneType,
    size: 200,
    proceduralTerrain: sceneType === 'desert',
    showGrid: sceneType !== 'desert'
  });
  scene.add(ground.getGroup());
  
  // Create unified lighting
  const lighting = new LightingSystem(scene, {
    preset: sceneType === 'desert' ? 'dramatic' : 'standard'
  });
  
  // Position camera
  camera.position.set(30, 30, 30);
  camera.lookAt(0, 0, 0);
  
  return { scene, camera, renderer, ground, lighting };
}

// Example 5: Ensuring visual consistency between scenes
export function ensureVisualConsistency() {
  // All scenes will use the same base colors from Constants
  console.log('Base ground color:', COLORS.GROUND_BASE);
  console.log('Grid colors:', COLORS.GROUND_GRID_PRIMARY, COLORS.GROUND_GRID_SECONDARY);
  
  // All desert scenes will use the same terrain generation
  const desertGround1 = createDesertGround({ heightVariation: 2 });
  const desertGround2 = createDesertGround({ heightVariation: 2 });
  
  // Both will look identical due to unified configuration
  console.log('Desert grounds will look identical');
  
  // All wasteland scenes will use the same flat aesthetic
  const wasteland1 = createWastelandGround();
  const wasteland2 = createWastelandGround();
  
  console.log('Wasteland grounds will look identical');
}

// Example 6: Runtime configuration changes
export function demonstrateRuntimeChanges(scene) {
  // Change grid visibility
  scene.setGridVisibility(false);
  
  // Update lighting intensity
  const lighting = scene.getLightingSystem();
  lighting.setAmbientIntensity(0.5);
  lighting.setDirectionalIntensity(1.5);
  
  // Change ground opacity if needed
  const ground = scene.getGround();
  if (ground) {
    ground.updateGridOpacity(0.2);
  }
}

// Example 7: Factory pattern for easy scene creation
export const SceneFactory = {
  createDesert: (canvas) => createDesertScene(canvas),
  createSaturn: (canvas) => createSaturnScene(canvas),
  createSolarSystem: (canvas) => createSolarSystemScene(canvas),
  
  // Quick scene creation with consistent settings
  createConsistent: (canvas, type) => {
    const configs = {
      desert: () => new BaseScene(canvas, { groundType: 'desert', lightingPreset: 'dramatic' }),
      wasteland: () => new BaseScene(canvas, { groundType: 'wasteland', lightingPreset: 'saturn' }),
      space: () => new BaseScene(canvas, { groundType: 'space', lightingPreset: 'space' })
    };
    
    return configs[type] ? configs[type]() : configs.desert();
  }
};