/**
 * Unified Ground Component
 * Ensures visual consistency between all scenes while allowing customization
 */

import * as THREE from 'three';
import { COLORS, MATERIALS, GEOMETRY, SOLAR_SYSTEM } from '../utils/Constants.js';

export class Ground {
  constructor(options = {}) {
    this.options = {
      // Default to flat desert aesthetic
      type: 'desert', // 'desert', 'wasteland', 'space'
      size: GEOMETRY.GROUND_SIZE,
      segments: GEOMETRY.GROUND_SEGMENTS,
      color: COLORS.GROUND_BASE,
      
      // Desert-specific options
      heightVariation: GEOMETRY.DESERT_HEIGHT_VARIATION,
      noiseScale: GEOMETRY.DESERT_NOISE_SCALE,
      proceduralTerrain: true,
      
      // Grid options
      showGrid: true,
      gridDivisions: GEOMETRY.GRID_DIVISIONS,
      gridOpacity: MATERIALS.GRID.opacity,
      
      // Material properties
      roughness: MATERIALS.GROUND.roughness,
      metalness: MATERIALS.GROUND.metalness,
      
      // Shadow properties
      receiveShadow: true,
      
      // Override any defaults
      ...options
    };
    
    this.group = new THREE.Group();
    this.ground = null;
    this.grid = null;
    
    this._createGround();
    if (this.options.showGrid) {
      this._createGrid();
    }
  }
  
  _createGround() {
    let geometry;
    
    if (this.options.type === 'desert' && this.options.proceduralTerrain) {
      // Create procedural desert terrain
      geometry = new THREE.PlaneGeometry(
        this.options.size, 
        this.options.size, 
        this.options.segments, 
        this.options.segments
      );
      
      // Apply procedural height variation
      this._applyProceduralTerrain(geometry);
    } else {
      // Create flat ground (for wasteland/space)
      geometry = new THREE.PlaneGeometry(this.options.size, this.options.size);
    }
    
    // Create material based on type
    const material = this._createGroundMaterial();
    
    this.ground = new THREE.Mesh(geometry, material);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = this.options.receiveShadow;
    
    this.group.add(this.ground);
  }
  
  _createGroundMaterial() {
    const baseConfig = {
      color: this.options.color,
      roughness: this.options.roughness,
      metalness: this.options.metalness,
      transparent: true,
      opacity: 0  // Make ground invisible, only grid will show
    };
    
    switch (this.options.type) {
      case 'desert':
        return new THREE.MeshLambertMaterial({
          ...baseConfig,
          // Desert uses Lambert for softer shading
        });
        
      case 'wasteland':
        return new THREE.MeshStandardMaterial({
          ...baseConfig,
          // Wasteland uses Standard for more realistic lighting
        });
        
      case 'space':
        return new THREE.MeshBasicMaterial({
          ...baseConfig,
          // Space uses Basic for minimal lighting
        });
        
      default:
        return new THREE.MeshStandardMaterial(baseConfig);
    }
  }
  
  _applyProceduralTerrain(geometry) {
    const positions = geometry.attributes.position.array;
    
    // Simple noise function for terrain variation
    const noise = (x, z) => {
      const scale = this.options.noiseScale;
      return (
        Math.sin(x * scale) * Math.cos(z * scale) +
        Math.sin(x * scale * 2) * Math.cos(z * scale * 2) * 0.5 +
        Math.sin(x * scale * 4) * Math.cos(z * scale * 4) * 0.25
      ) * this.options.heightVariation;
    };
    
    // Apply height variation to vertices
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1];
      positions[i + 2] = noise(x, z);
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
  }
  
  _createGrid() {
    const gridColor = this._getGridColor();
    
    if (this.options.type === 'space') {
      // Create custom space grid
      this._createSpaceGrid();
    } else {
      // Create custom grid to avoid Three.js GridHelper rendering issues
      const size = this.options.size;
      const divisions = this.options.gridDivisions;
      const halfSize = size / 2;
      const step = size / divisions;
      
      const vertices = [];
      const colors = [];
      
      // Create grid lines
      for (let i = 0; i <= divisions; i++) {
        const position = -halfSize + i * step;
        
        // Determine if this is a center line or regular line
        const isCenterLine = i === divisions / 2;
        const color = isCenterLine ? gridColor.primary : gridColor.secondary;
        const r = ((color >> 16) & 0xff) / 255;
        const g = ((color >> 8) & 0xff) / 255;
        const b = (color & 0xff) / 255;
        
        // Horizontal lines
        vertices.push(-halfSize, 0, position, halfSize, 0, position);
        colors.push(r, g, b, r, g, b);
        
        // Vertical lines
        vertices.push(position, 0, -halfSize, position, 0, halfSize);
        colors.push(r, g, b, r, g, b);
      }
      
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      
      const material = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: this.options.gridOpacity,
        depthWrite: false,
        depthTest: true
      });
      
      this.grid = new THREE.LineSegments(geometry, material);
      this.grid.frustumCulled = false; // Ensure it's always rendered
      this.group.add(this.grid);
    }
  }
  
  _createSpaceGrid() {
    // Create enhanced grid for space scenes with cyan accents
    const gridSize = SOLAR_SYSTEM?.GRID?.SIZE || 600;
    const divisions = SOLAR_SYSTEM?.GRID?.DIVISIONS || 50;
    
    const gridGeometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    
    for (let i = 0; i <= divisions; i++) {
      const x = (i / divisions - 0.5) * gridSize;
      const intensity = Math.max(0, 1 - Math.abs(i - divisions / 2) / (divisions / 2)) * 0.3;
      
      positions.push(x, 0, -gridSize / 2, x, 0, gridSize / 2);
      colors.push(0, intensity, intensity, 0, intensity, intensity);
      
      const z = (i / divisions - 0.5) * gridSize;
      positions.push(-gridSize / 2, 0, z, gridSize / 2, 0, z);
      colors.push(0, intensity, intensity, 0, intensity, intensity);
    }
    
    gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    gridGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const gridMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending
    });
    
    this.grid = new THREE.LineSegments(gridGeometry, gridMaterial);
    this.grid.position.y = 0;
    this.group.add(this.grid);
  }
  
  _getGridColor() {
    switch (this.options.type) {
      case 'desert':
        return {
          primary: COLORS.GROUND_GRID_PRIMARY,
          secondary: COLORS.GROUND_GRID_SECONDARY
        };
      case 'wasteland':
        return {
          primary: COLORS.GROUND_GRID_PRIMARY,
          secondary: COLORS.GROUND_GRID_SECONDARY
        };
      case 'space':
        return {
          primary: COLORS.SOLAR_GRID_BASE,
          secondary: COLORS.SOLAR_GRID_BASE
        };
      default:
        return {
          primary: COLORS.GROUND_GRID_PRIMARY,
          secondary: COLORS.GROUND_GRID_SECONDARY
        };
    }
  }
  
  // Public methods
  getGroup() {
    return this.group;
  }
  
  setGridVisibility(visible) {
    if (this.grid) {
      this.grid.visible = visible;
    }
  }
  
  updateGridOpacity(opacity) {
    if (this.grid) {
      this.grid.material.opacity = opacity;
    }
  }
  
  dispose() {
    if (this.ground) {
      this.ground.geometry.dispose();
      this.ground.material.dispose();
    }
    
    if (this.grid) {
      this.grid.geometry.dispose();
      this.grid.material.dispose();
    }
  }
}

// Factory functions for easy scene creation
export const createDesertGround = (options = {}) => {
  return new Ground({
    type: 'desert',
    proceduralTerrain: true,
    heightVariation: 2,
    color: COLORS.DESERT_SAND,
    ...options
  });
};

export const createWastelandGround = (options = {}) => {
  return new Ground({
    type: 'wasteland',
    proceduralTerrain: false,
    color: COLORS.GROUND_BASE,
    ...options
  });
};

export const createSpaceGround = (options = {}) => {
  return new Ground({
    type: 'space',
    proceduralTerrain: false,
    showGrid: true,
    color: COLORS.SCENE_BACKGROUND,
    ...options
  });
};