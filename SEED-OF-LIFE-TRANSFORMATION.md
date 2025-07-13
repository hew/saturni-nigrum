# Seed of Life Floor Transformation Concept

## Overview
The idea is to have the grid pattern on the floor morph into the Seed of Life pattern at certain cube rotation angles, creating a subtle "squaring the circle" effect.

## Implementation Details

### Shader Approach
Created a custom GLSL shader that morphs between two patterns:

1. **Grid Pattern**: Simple square grid using fract() and smoothstep
2. **Seed of Life Pattern**: 7 circles (1 center + 6 surrounding) using signed distance functions

### Key Code Snippets

#### Shader Material Setup
```javascript
const groundMaterial = new THREE.ShaderMaterial({
  uniforms: {
    transformation: { value: 0.0 }, // 0 = grid, 1 = seed
    gridSize: { value: 4.0 },
    lineWidth: { value: 0.02 },
    baseColor: { value: new THREE.Color(0x0a0a0a) },
    lineColor: { value: new THREE.Color(0x111111) }
  },
  vertexShader: /* ... */,
  fragmentShader: /* ... */
});
```

#### Fragment Shader Pattern Generation
```glsl
// Grid pattern
vec2 grid = abs(fract(p) - 0.5);
float gridLines = min(grid.x, grid.y);
float gridPattern = 1.0 - smoothstep(0.0, lineWidth, gridLines);

// Seed of Life pattern
float seedPattern = 1.0;
// Center circle
float centerCircle = sdCircle(p, vec2(0.0), 0.5);
seedPattern = min(seedPattern, centerCircle);
// 6 surrounding circles
for (int i = 0; i < 6; i++) {
  float angle = float(i) * 3.14159 * 2.0 / 6.0;
  vec2 center = vec2(cos(angle), sin(angle)) * 0.5;
  float circle = sdCircle(p, center, 0.5);
  seedPattern = min(seedPattern, circle);
}

// Morph between patterns
float pattern = mix(gridPattern, seedPattern, transformation);
```

#### Transformation Logic
```javascript
function updateFloorPattern() {
  const xAngle = cube.rotation.x % (Math.PI * 2);
  const yAngle = cube.rotation.y % (Math.PI * 2);
  
  // Check if near "sacred alignment" 
  const alignmentX = 1 - Math.abs(xAngle - HEX_ANGLE) / HEX_ANGLE;
  const alignmentY = Math.abs(Math.sin(yAngle * 3));
  
  // Smooth transformation
  let transformation = Math.max(0, alignmentX * alignmentY - 0.5) * 2;
  
  // Update shader uniform with smoothing
  ground.material.uniforms.transformation.value = 
    currentTrans + (targetTrans - currentTrans) * 0.05;
}
```

## Visual Concept
- At most angles: subtle grid pattern barely visible on the floor
- At specific "sacred" angles: grid morphs into Seed of Life pattern
- The transformation should be subtle - "you really gotta be watching"
- Represents the hidden sacred geometry becoming visible to the initiated

## User Feedback
- Initial implementation made the grid too prominent
- User wanted to maintain the original subtle floor aesthetic
- The transformation concept is good but needs to preserve the minimalist feel