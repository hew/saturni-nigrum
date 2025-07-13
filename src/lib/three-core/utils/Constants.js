/**
 * Centralized constants for Three.js components
 * Ensures consistency across all scenes
 */

// Colors - Unified color palette
export const COLORS = {
  // Background
  SCENE_BACKGROUND: 0x000000,
  
  // Ground/Surface
  GROUND_BASE: 0x000000,        // Pure black for invisible ground
  GROUND_GRID_PRIMARY: 0x1a1a1a,  // Subtle grid lines
  GROUND_GRID_SECONDARY: 0x1a1a1a, // Same color for uniform grid
  
  // Desert specific
  DESERT_SAND: 0x1a1612,
  DESERT_DARK: 0x0a0a08,
  
  // Lighting - exactly matching SaturnianCube scene
  AMBIENT_BASE: 0x0a0a0a,     // Very dim ambient (matches cube scene)
  DIRECTIONAL_BASE: 0x1a1a1a, // Dim directional (matches cube scene)
  RIM_LIGHT: 0x0a0a0f,
  
  // Saturn/Gold accents
  SATURN_GOLD: 0xffcc00,
  SATURN_EMISSIVE: 0x332200,
  SATURN_SPECULAR: 0x444411,
  
};

// Material properties
export const MATERIALS = {
  GROUND: {
    roughness: 1,
    metalness: 0,
    opacity: 1
  },
  
  GRID: {
    opacity: 0.4,    // More visible for chessboard effect
    transparent: true
  },
  
  DESERT_NOISE: {
    intensity: 0.3,
    frequency: 0.1
  }
};

// Geometry constants
export const GEOMETRY = {
  // Ground dimensions - unified across scenes
  GROUND_SIZE: 80,  // Smaller, finite chessboard size
  GROUND_SEGMENTS: 100,
  
  // Grid properties - 26x26 = 676 squares (close to 666)
  GRID_DIVISIONS: 26,
  GRID_SIZE: 80,  // Match ground size
  
  // Desert specific
  DESERT_HEIGHT_VARIATION: 2,
  DESERT_NOISE_SCALE: 0.05
};

// Camera settings
export const CAMERA = {
  FOV: 45,
  NEAR: 0.1,
  FAR: 1000,
  
  // Default positions for different scene types
  DESERT_POSITION: [30, 30, 30],
  SATURN_POSITION: [33, 33, 33]
};

// Lighting configuration
export const LIGHTING = {
  AMBIENT: {
    color: COLORS.AMBIENT_BASE,
    intensity: 1
  },
  
  DIRECTIONAL: {
    color: COLORS.DIRECTIONAL_BASE,
    intensity: 0.5,    // KEY: This matches cube scene exactly
    position: [0, 50, 0],
    castShadow: true,
    shadow: {
      camera: {
        near: 1,
        far: 100,
        left: -30,
        right: 30,
        top: 30,
        bottom: -30
      },
      mapSize: {
        width: 2048,
        height: 2048
      }
    }
  },
  
  RIM: {
    color: COLORS.RIM_LIGHT,
    intensity: 0.3,
    position: [-20, 10, -20]
  }
};

// Performance settings
export const PERFORMANCE = {
  MODES: {
    QUALITY: 'quality',
    BALANCED: 'balanced',
    PERFORMANCE: 'performance'
  },
  
  SPHERE_DETAIL: {
    quality: { core: 32, glow: 16 },
    balanced: { core: 16, glow: 8 },
    performance: { core: 8, glow: 6 }
  },
  
  ORBIT_SEGMENTS: {
    quality: 256,
    balanced: 128,
    performance: 64
  }
};

