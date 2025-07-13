/**
 * Saturn Scene Configuration
 * Defines Saturn scene-specific settings ensuring visual consistency with other scenes
 */

import { COLORS, CAMERA } from '../utils/Constants.js';

export const SATURN_CONFIG = {
  // Scene setup
  scene: {
    backgroundColor: COLORS.SCENE_BACKGROUND,
    enableShadows: true,
    enablePostProcessing: false,
    pixelRatio: window.devicePixelRatio,
    antialias: true
  },
  
  // Camera configuration
  camera: {
    type: 'perspective',
    fov: 45,
    near: 0.1,
    far: 1000,
    position: [33, 33, 33], // Zoomed out 10% more than base
    lookAt: [0, 10, 0] // Looking at Saturn's position
  },
  
  // Ground configuration - wasteland
  ground: {
    type: 'wasteland',
    size: 200,
    showGrid: true,
    gridDivisions: 50,
    proceduralTerrain: false,
    color: COLORS.GROUND_BASE,
    receiveShadow: true,
    roughness: 1,
    metalness: 0
  },
  
  // Lighting configuration
  lighting: {
    preset: 'saturn',
    enableShadows: true,
    ambientIntensity: 1,
    directionalIntensity: 0.8,
    rimIntensity: 0.3
  },
  
  // Saturn configuration
  saturn: {
    // Planet properties
    planet: {
      radius: 10,
      position: [0, 10, 0], // Elevated above ground
      color: COLORS.SATURN_GOLD,
      emissive: COLORS.SATURN_EMISSIVE,
      emissiveIntensity: 0.1,
      shininess: 30,
      specular: COLORS.SATURN_SPECULAR,
      segments: {
        widthSegments: 32,
        heightSegments: 24
      },
      castShadow: true,
      animation: {
        rotationSpeed: 0.05
      }
    },
    
    // Ring system
    rings: [
      { inner: 15, outer: 18, opacity: 0.8 },
      { inner: 19, outer: 22, opacity: 0.8 },
      { inner: 23, outer: 28, opacity: 0.8 }
    ],
    
    ringMaterial: {
      color: 0x0a0a0a, // Very dark gray
      opacity: 0.8,
      transparent: true,
      side: 'DoubleSide'
    },
    
    ringEdges: {
      color: 0x1a1a1a,
      opacity: 1.0,
      transparent: true
    },
    
    // Ring orientation (like real Saturn)
    ringTilt: -26.7 * Math.PI / 180,
    
    ringAnimation: {
      wobbleSpeed: 0.3,
      wobbleIntensity: 0.02
    }
  },
  
  // UI configuration
  ui: {
    showSecretButton: true,
    secretButton: {
      position: { top: '20px', right: '20px' },
      symbol: '⬢',
      color: COLORS.SATURN_GOLD,
      hoverColor: '#000',
      action: () => console.log('Saturn secret!')
    }
  }
};