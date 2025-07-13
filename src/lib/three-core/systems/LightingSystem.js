/**
 * Unified Lighting System
 * Provides consistent lighting across all scenes with customizable presets
 */

import * as THREE from 'three';
import { LIGHTING, COLORS } from '../utils/Constants.js';

export class LightingSystem {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.options = {
      preset: 'standard', // 'standard', 'dramatic', 'minimal', 'space'
      enableShadows: true,
      ambientIntensity: 1,
      directionalIntensity: 0.8,
      rimIntensity: 0.3,
      ...options
    };
    
    this.lights = {
      ambient: null,
      directional: null,
      rim: null,
      additional: []
    };
    
    this._createLights();
  }
  
  _createLights() {
    this._createAmbientLight();
    this._createDirectionalLight();
    this._createRimLight();
    
    // Apply preset-specific modifications
    this._applyPreset();
  }
  
  _createAmbientLight() {
    this.lights.ambient = new THREE.AmbientLight(
      LIGHTING.AMBIENT.color,
      LIGHTING.AMBIENT.intensity * this.options.ambientIntensity
    );
    this.scene.add(this.lights.ambient);
  }
  
  _createDirectionalLight() {
    this.lights.directional = new THREE.DirectionalLight(
      LIGHTING.DIRECTIONAL.color,
      LIGHTING.DIRECTIONAL.intensity * this.options.directionalIntensity
    );
    
    // Set position
    const [x, y, z] = LIGHTING.DIRECTIONAL.position;
    this.lights.directional.position.set(x, y, z);
    
    // Configure shadows
    if (this.options.enableShadows) {
      this.lights.directional.castShadow = LIGHTING.DIRECTIONAL.castShadow;
      
      const shadow = LIGHTING.DIRECTIONAL.shadow;
      this.lights.directional.shadow.camera.near = shadow.camera.near;
      this.lights.directional.shadow.camera.far = shadow.camera.far;
      this.lights.directional.shadow.camera.left = shadow.camera.left;
      this.lights.directional.shadow.camera.right = shadow.camera.right;
      this.lights.directional.shadow.camera.top = shadow.camera.top;
      this.lights.directional.shadow.camera.bottom = shadow.camera.bottom;
      this.lights.directional.shadow.mapSize.width = shadow.mapSize.width;
      this.lights.directional.shadow.mapSize.height = shadow.mapSize.height;
    }
    
    this.scene.add(this.lights.directional);
  }
  
  _createRimLight() {
    this.lights.rim = new THREE.DirectionalLight(
      LIGHTING.RIM.color,
      LIGHTING.RIM.intensity * this.options.rimIntensity
    );
    
    const [x, y, z] = LIGHTING.RIM.position;
    this.lights.rim.position.set(x, y, z);
    
    this.scene.add(this.lights.rim);
  }
  
  _applyPreset() {
    switch (this.options.preset) {
      case 'dramatic':
        this._applyDramaticPreset();
        break;
      case 'minimal':
        this._applyMinimalPreset();
        break;
      case 'space':
        this._applySpacePreset();
        break;
      case 'saturn':
        this._applySaturnPreset();
        break;
      default:
        // Standard preset - no changes needed
        break;
    }
  }
  
  _applyDramaticPreset() {
    // High contrast lighting for dramatic effect
    this.lights.ambient.intensity *= 0.3;
    this.lights.directional.intensity *= 1.5;
    this.lights.rim.intensity *= 2;
    
    // Add dramatic key light
    const keyLight = new THREE.SpotLight(0xffffff, 1, 100, Math.PI / 4, 0.5);
    keyLight.position.set(20, 40, 20);
    keyLight.castShadow = true;
    this.scene.add(keyLight);
    this.lights.additional.push(keyLight);
  }
  
  _applyMinimalPreset() {
    // Reduce all lighting for minimal aesthetic
    this.lights.ambient.intensity *= 0.5;
    this.lights.directional.intensity *= 0.6;
    this.lights.rim.intensity *= 0.4;
  }
  
  _applySpacePreset() {
    // Space-appropriate lighting with cool tones
    this.lights.ambient.color.setHex(0x0a0a1f);
    this.lights.directional.color.setHex(0x1a1a3f);
    this.lights.rim.color.setHex(0x0f0f2a);
    
    // Reduce overall intensity for space
    this.lights.ambient.intensity *= 0.8;
    this.lights.directional.intensity *= 0.6;
    
    // Add starlight effect
    const starLight = new THREE.PointLight(0x6666ff, 0.3, 1000);
    starLight.position.set(0, 200, 0);
    this.scene.add(starLight);
    this.lights.additional.push(starLight);
  }
  
  _applySaturnPreset() {
    // Saturn scene specific lighting with golden highlights
    this.lights.directional.intensity *= 1.1;
    
    // Add golden accent light
    const saturnLight = new THREE.PointLight(COLORS.SATURN_GOLD, 0.4, 100);
    saturnLight.position.set(0, 20, 0);
    this.scene.add(saturnLight);
    this.lights.additional.push(saturnLight);
  }
  
  // Public methods for runtime adjustments
  setAmbientIntensity(intensity) {
    if (this.lights.ambient) {
      this.lights.ambient.intensity = intensity;
    }
  }
  
  setDirectionalIntensity(intensity) {
    if (this.lights.directional) {
      this.lights.directional.intensity = intensity;
    }
  }
  
  setRimIntensity(intensity) {
    if (this.lights.rim) {
      this.lights.rim.intensity = intensity;
    }
  }
  
  setShadowsEnabled(enabled) {
    if (this.lights.directional) {
      this.lights.directional.castShadow = enabled;
    }
    
    this.lights.additional.forEach(light => {
      if (light.castShadow !== undefined) {
        light.castShadow = enabled;
      }
    });
  }
  
  // Get specific lights for external manipulation
  getAmbientLight() {
    return this.lights.ambient;
  }
  
  getDirectionalLight() {
    return this.lights.directional;
  }
  
  getRimLight() {
    return this.lights.rim;
  }
  
  getAllLights() {
    return [
      this.lights.ambient,
      this.lights.directional,
      this.lights.rim,
      ...this.lights.additional
    ].filter(light => light !== null);
  }
  
  dispose() {
    // Remove all lights from scene
    this.getAllLights().forEach(light => {
      this.scene.remove(light);
      if (light.dispose) {
        light.dispose();
      }
    });
    
    // Clear references
    this.lights = {
      ambient: null,
      directional: null,
      rim: null,
      additional: []
    };
  }
}

// Factory functions for common lighting setups
export const createStandardLighting = (scene, options = {}) => {
  return new LightingSystem(scene, {
    preset: 'standard',
    ...options
  });
};

export const createDesertLighting = (scene, options = {}) => {
  return new LightingSystem(scene, {
    preset: 'dramatic',
    ambientIntensity: 0.8,
    directionalIntensity: 1.2,
    ...options
  });
};

export const createSaturnLighting = (scene, options = {}) => {
  return new LightingSystem(scene, {
    preset: 'saturn',
    ...options
  });
};

export const createSpaceLighting = (scene, options = {}) => {
  return new LightingSystem(scene, {
    preset: 'space',
    enableShadows: false,
    ambientIntensity: 1.5,
    ...options
  });
};