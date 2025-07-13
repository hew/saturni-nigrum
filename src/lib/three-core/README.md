# Three.js Core Components

A modular Three.js component system that ensures visual consistency and eliminates code duplication across multiple scenes.

## Problem Solved

This component system addresses:
- **Floor consistency issues** between different scenes
- **Code duplication** across multiple Three.js implementations
- **Visual inconsistencies** due to scattered constants and configurations
- **Maintenance overhead** when updating shared visual elements

## Architecture

```
src/lib/three-core/
├── components/          # Reusable visual components
│   ├── Ground.js       # Unified ground/floor component
│   └── Saturn.js       # Saturn planet with rings
├── systems/            # Scene management systems
│   └── LightingSystem.js # Unified lighting presets
├── scenes/             # Base scene classes
│   ├── BaseScene.js    # Abstract scene foundation
│   └── SolarSystemScene.js # Specialized solar system
├── config/             # Scene-specific configurations
│   ├── DesertConfig.js
│   ├── SaturnConfig.js
│   └── SolarSystemConfig.js
├── utils/              # Shared utilities
│   └── Constants.js    # Centralized constants
└── examples/           # Usage examples
    └── UsageExample.js
```

## Key Components

### Ground Component
Ensures identical floor appearance across all scenes:

```javascript
import { Ground, createDesertGround, createWastelandGround } from './components/Ground.js';

// Unified desert terrain with procedural generation
const desert = createDesertGround({
  heightVariation: 2,
  proceduralTerrain: true
});

// Flat wasteland for Saturn scene
const wasteland = createWastelandGround({
  showGrid: true,
  gridOpacity: 0.4
});

// Space grid for solar system
const space = createSpaceGround({
  size: 600,
  gridDivisions: 50
});
```

### Lighting System
Consistent lighting with scene-appropriate presets:

```javascript
import { LightingSystem, createSaturnLighting } from './systems/LightingSystem.js';

// Apply Saturn-specific lighting with golden highlights
const lighting = createSaturnLighting(scene, {
  ambientIntensity: 1.2,
  enableShadows: true
});
```

### Base Scene
Abstract foundation for all scenes:

```javascript
import { BaseScene } from './scenes/BaseScene.js';

class MyScene extends BaseScene {
  onInit() {
    // Custom scene initialization
  }
  
  onUpdate(deltaTime, time) {
    // Custom animation logic
  }
}
```

## Visual Consistency

All components use unified constants from `Constants.js`:

```javascript
export const COLORS = {
  GROUND_BASE: 0x0a0a0a,        // Same across all scenes
  GROUND_GRID_PRIMARY: 0x111111, // Consistent grid colors
  SATURN_GOLD: 0xffcc00,        // Unified Saturn gold
  // ...
};
```

## Scene Configurations

Each scene has its own configuration file that ensures:
- **Identical ground appearance** when intended
- **Consistent color palettes** across related scenes
- **Proper lighting setups** for each environment
- **Unified camera positioning** strategies

```javascript
// DesertConfig.js
export const DESERT_CONFIG = {
  ground: {
    type: 'desert',
    proceduralTerrain: true,
    color: COLORS.DESERT_SAND
  },
  lighting: {
    preset: 'dramatic',
    ambientIntensity: 0.8
  }
};

// SaturnConfig.js  
export const SATURN_CONFIG = {
  ground: {
    type: 'wasteland',
    proceduralTerrain: false,
    color: COLORS.GROUND_BASE  // Same as desert base
  },
  lighting: {
    preset: 'saturn'
  }
};
```

## Usage Examples

### Quick Scene Creation
```javascript
import { SceneFactory } from './examples/UsageExample.js';

// Create consistent scenes with one line
const desertScene = SceneFactory.createDesert(canvas);
const saturnScene = SceneFactory.createSaturn(canvas);
const spaceScene = SceneFactory.createSolarSystem(canvas);
```

### Manual Component Assembly
```javascript
import { BaseScene, Ground, LightingSystem } from './index.js';

const scene = new BaseScene(canvas, {
  groundType: 'desert',
  lightingPreset: 'dramatic',
  enablePostProcessing: true
});

// Ground and lighting are automatically created with consistent settings
scene.start(); // Begin animation loop
```

### Runtime Modifications
```javascript
// Change visual properties at runtime while maintaining consistency
scene.setGridVisibility(true);
scene.getLightingSystem().setAmbientIntensity(1.2);
scene.getGround().updateGridOpacity(0.3);
```

## Benefits

1. **Visual Consistency**: All scenes use the same base colors, materials, and proportions
2. **Code Reuse**: Shared components eliminate duplication
3. **Easy Maintenance**: Change constants in one place, update everywhere
4. **Flexible Configuration**: Scene-specific overrides while maintaining consistency
5. **Performance**: Optimized shared geometries and materials
6. **Type Safety**: Centralized configuration reduces runtime errors

## Integration with Existing Scenes

The components are designed to integrate seamlessly with existing Svelte components:

```javascript
// In DesertScene.svelte
import { createDesertScene } from './three-core/index.js';

let scene;

onMount(() => {
  scene = createDesertScene(canvas);
  scene.start();
  
  return () => scene.dispose();
});
```

This modular approach solves the floor consistency issue by ensuring all scenes use the same `Ground` component with unified parameters, while still allowing scene-specific customization through configuration files.