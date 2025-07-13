/**
 * Three.js Core Components Index
 * Central export point for all modular Three.js components
 */

// Base classes
export { BaseScene, createBaseScene } from './scenes/BaseScene.js';

// Components
export { 
  Ground, 
  createDesertGround, 
  createWastelandGround, 
  createSpaceGround 
} from './components/Ground.js';

export { Saturn, createSaturn } from './components/Saturn.js';

// Systems
export { 
  LightingSystem,
  createStandardLighting,
  createDesertLighting,
  createSaturnLighting,
  createSpaceLighting
} from './systems/LightingSystem.js';

// Utilities
export { 
  COLORS, 
  MATERIALS, 
  GEOMETRY, 
  CAMERA, 
  LIGHTING, 
  PERFORMANCE
} from './utils/Constants.js';

// Configurations
export { DESERT_CONFIG } from './config/DesertConfig.js';
export { SATURN_CONFIG } from './config/SaturnConfig.js';

// Scene factory functions
export const createDesertScene = (canvas, options = {}) => {
  return new BaseScene(canvas, {
    groundType: 'desert',
    lightingPreset: 'dramatic',
    enablePostProcessing: true,
    ...options
  });
};

export const createSaturnScene = (canvas, options = {}) => {
  return new BaseScene(canvas, {
    groundType: 'wasteland',
    lightingPreset: 'saturn',
    enableShadows: true,
    ...options
  });
};

