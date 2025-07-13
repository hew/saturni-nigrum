/**
 * Desert Scene Configuration
 * Defines the original desert scene settings with black pyramid
 */

import { COLORS, CAMERA } from '../utils/Constants.js';

export const DESERT_CONFIG = {
  // Scene setup
  scene: {
    backgroundColor: COLORS.SCENE_BACKGROUND,
    enableShadows: true,
    enablePostProcessing: true,
    pixelRatio: window.devicePixelRatio,
    antialias: true
  },
  
  // Camera configuration
  camera: {
    type: 'perspective',
    fov: 45,
    near: 0.1,
    far: 1000,
    position: CAMERA.DESERT_POSITION,
    lookAt: [0, 0, 0],
    
    // Orbital camera settings
    orbit: {
      enabled: true,
      autoRotate: true,
      autoRotateSpeed: 0.5,
      enableDamping: true,
      dampingFactor: 0.05
    }
  },
  
  // Ground configuration - procedural desert
  ground: {
    type: 'desert',
    size: 200,
    segments: 100,
    showGrid: false, // Desert typically doesn't show grid
    proceduralTerrain: true,
    heightVariation: 2,
    noiseScale: 0.05,
    color: COLORS.DESERT_SAND,
    receiveShadow: true,
    roughness: 1,
    metalness: 0
  },
  
  // Lighting configuration
  lighting: {
    preset: 'dramatic',
    enableShadows: true,
    ambientIntensity: 0.8,
    directionalIntensity: 1.2,
    rimIntensity: 0.6
  },
  
  // Post-processing effects
  postProcessing: {
    bloom: {
      enabled: true,
      strength: 1.5,
      radius: 0.4,
      threshold: 0.85
    }
  },
  
  // Pyramid configuration
  pyramid: {
    size: 8,
    position: [0, 4, 0], // Half-buried in sand
    material: {
      color: 0x000000,
      emissive: 0x001122,
      emissiveIntensity: 0.1,
      metalness: 0.9,
      roughness: 0.1
    },
    castShadow: true,
    receiveShadow: false,
    
    // Intro animation
    intro: {
      enabled: true,
      duration: 3, // seconds
      easing: 'power2.out',
      startPosition: [0, -10, 0],
      endPosition: [0, 4, 0]
    }
  },
  
  // Particle system configuration
  particles: {
    count: 2000,
    area: 100,
    color: COLORS.DESERT_SAND,
    size: 0.5,
    opacity: 0.6,
    
    // Movement properties
    drift: {
      speed: 0.02,
      mouseInfluence: 5
    },
    
    // Wind effect
    wind: {
      enabled: true,
      strength: 0.1,
      direction: [1, 0, 0.5],
      turbulence: 0.05
    }
  },
  
  // Lighting effects
  effects: {
    // Moonlight
    moonlight: {
      enabled: true,
      color: 0x4488ff,
      intensity: 0.3,
      position: [-50, 50, -50],
      castShadow: true
    },
    
    // Pyramid glow
    pyramidLight: {
      enabled: true,
      color: 0x001122,
      intensity: 0.8,
      distance: 50,
      decay: 2
    }
  }
};