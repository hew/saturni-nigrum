import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as THREE from 'three';
import { 
  LightingSystem, 
  createStandardLighting, 
  createDesertLighting, 
  createSaturnLighting,
  createSpaceLighting 
} from '../../src/lib/three-core/systems/LightingSystem.js';
import { LIGHTING, COLORS } from '../../src/lib/three-core/utils/Constants.js';

describe('LightingSystem', () => {
  let scene;
  let lightingSystem;

  beforeEach(() => {
    scene = new THREE.Scene();
  });

  afterEach(() => {
    if (lightingSystem) {
      lightingSystem.dispose();
      lightingSystem = null;
    }
  });

  describe('Constructor and Initialization', () => {
    it('should create a lighting system with default options', () => {
      lightingSystem = new LightingSystem(scene);
      
      expect(lightingSystem).toBeDefined();
      expect(lightingSystem.scene).toBe(scene);
      expect(lightingSystem.options.preset).toBe('standard');
      expect(lightingSystem.options.enableShadows).toBe(true);
    });

    it('should apply custom options correctly', () => {
      const customOptions = {
        preset: 'dramatic',
        enableShadows: false,
        ambientIntensity: 0.5,
        directionalIntensity: 1.2,
        rimIntensity: 0.8
      };
      
      lightingSystem = new LightingSystem(scene, customOptions);
      
      expect(lightingSystem.options.preset).toBe('dramatic');
      expect(lightingSystem.options.enableShadows).toBe(false);
      expect(lightingSystem.options.ambientIntensity).toBe(0.5);
      expect(lightingSystem.options.directionalIntensity).toBe(1.2);
      expect(lightingSystem.options.rimIntensity).toBe(0.8);
    });

    it('should create all required lights', () => {
      lightingSystem = new LightingSystem(scene);
      
      expect(lightingSystem.lights.ambient).toBeInstanceOf(THREE.AmbientLight);
      expect(lightingSystem.lights.directional).toBeInstanceOf(THREE.DirectionalLight);
      expect(lightingSystem.lights.rim).toBeInstanceOf(THREE.DirectionalLight);
      expect(Array.isArray(lightingSystem.lights.additional)).toBe(true);
    });

    it('should add all lights to the scene', () => {
      const initialChildCount = scene.children.length;
      lightingSystem = new LightingSystem(scene);
      
      // Should add at least ambient, directional, and rim lights
      expect(scene.children.length).toBeGreaterThanOrEqual(initialChildCount + 3);
      
      // Check specific lights are in scene
      expect(scene.children).toContain(lightingSystem.lights.ambient);
      expect(scene.children).toContain(lightingSystem.lights.directional);
      expect(scene.children).toContain(lightingSystem.lights.rim);
    });
  });

  describe('Light Configuration and Consistency', () => {
    it('should configure ambient light correctly', () => {
      lightingSystem = new LightingSystem(scene, {
        ambientIntensity: 0.8
      });
      
      const ambient = lightingSystem.lights.ambient;
      expect(ambient.color.getHex()).toBe(LIGHTING.AMBIENT.color);
      expect(ambient.intensity).toBe(LIGHTING.AMBIENT.intensity * 0.8);
    });

    it('should configure directional light with correct position', () => {
      lightingSystem = new LightingSystem(scene, {
        directionalIntensity: 1.2
      });
      
      const directional = lightingSystem.lights.directional;
      expect(directional.color.getHex()).toBe(LIGHTING.DIRECTIONAL.color);
      expect(directional.intensity).toBe(LIGHTING.DIRECTIONAL.intensity * 1.2);
      
      const [x, y, z] = LIGHTING.DIRECTIONAL.position;
      expect(directional.position.x).toBe(x);
      expect(directional.position.y).toBe(y);
      expect(directional.position.z).toBe(z);
    });

    it('should configure shadows when enabled', () => {
      lightingSystem = new LightingSystem(scene, {
        enableShadows: true
      });
      
      const directional = lightingSystem.lights.directional;
      expect(directional.castShadow).toBe(true);
      
      // Check shadow camera configuration
      const shadowConfig = LIGHTING.DIRECTIONAL.shadow;
      expect(directional.shadow.camera.near).toBe(shadowConfig.camera.near);
      expect(directional.shadow.camera.far).toBe(shadowConfig.camera.far);
      expect(directional.shadow.mapSize.width).toBe(shadowConfig.mapSize.width);
      expect(directional.shadow.mapSize.height).toBe(shadowConfig.mapSize.height);
    });

    it('should disable shadows when requested', () => {
      lightingSystem = new LightingSystem(scene, {
        enableShadows: false
      });
      
      const directional = lightingSystem.lights.directional;
      // Shadow casting should not be explicitly set when disabled
      expect(directional.castShadow).toBe(false);
    });

    it('should configure rim light correctly', () => {
      lightingSystem = new LightingSystem(scene, {
        rimIntensity: 0.6
      });
      
      const rim = lightingSystem.lights.rim;
      expect(rim.color.getHex()).toBe(LIGHTING.RIM.color);
      expect(rim.intensity).toBe(LIGHTING.RIM.intensity * 0.6);
      
      const [x, y, z] = LIGHTING.RIM.position;
      expect(rim.position.x).toBe(x);
      expect(rim.position.y).toBe(y);
      expect(rim.position.z).toBe(z);
    });
  });

  describe('Preset Applications', () => {
    it('should apply standard preset correctly', () => {
      lightingSystem = new LightingSystem(scene, { preset: 'standard' });
      
      // Standard preset should not modify light intensities
      expect(lightingSystem.lights.ambient.intensity).toBe(LIGHTING.AMBIENT.intensity);
      expect(lightingSystem.lights.directional.intensity).toBe(LIGHTING.DIRECTIONAL.intensity);
      expect(lightingSystem.lights.rim.intensity).toBe(LIGHTING.RIM.intensity);
      
      // Should not add additional lights
      expect(lightingSystem.lights.additional.length).toBe(0);
    });

    it('should apply dramatic preset correctly', () => {
      lightingSystem = new LightingSystem(scene, { preset: 'dramatic' });
      
      // Dramatic preset should modify intensities
      const baseAmbient = LIGHTING.AMBIENT.intensity;
      const baseDirectional = LIGHTING.DIRECTIONAL.intensity;
      const baseRim = LIGHTING.RIM.intensity;
      
      expect(lightingSystem.lights.ambient.intensity).toBe(baseAmbient * 0.3);
      expect(lightingSystem.lights.directional.intensity).toBe(baseDirectional * 1.5);
      expect(lightingSystem.lights.rim.intensity).toBe(baseRim * 2);
      
      // Should add dramatic key light
      expect(lightingSystem.lights.additional.length).toBe(1);
      expect(lightingSystem.lights.additional[0]).toBeInstanceOf(THREE.SpotLight);
    });

    it('should apply minimal preset correctly', () => {
      lightingSystem = new LightingSystem(scene, { preset: 'minimal' });
      
      // Minimal preset should reduce all intensities
      const baseAmbient = LIGHTING.AMBIENT.intensity;
      const baseDirectional = LIGHTING.DIRECTIONAL.intensity;
      const baseRim = LIGHTING.RIM.intensity;
      
      expect(lightingSystem.lights.ambient.intensity).toBe(baseAmbient * 0.5);
      expect(lightingSystem.lights.directional.intensity).toBe(baseDirectional * 0.6);
      expect(lightingSystem.lights.rim.intensity).toBe(baseRim * 0.4);
    });

    it('should apply space preset correctly', () => {
      lightingSystem = new LightingSystem(scene, { preset: 'space' });
      
      // Space preset should change colors and add starlight
      expect(lightingSystem.lights.ambient.color.getHex()).toBe(0x0a0a1f);
      expect(lightingSystem.lights.directional.color.getHex()).toBe(0x1a1a3f);
      expect(lightingSystem.lights.rim.color.getHex()).toBe(0x0f0f2a);
      
      // Should add starlight point light
      expect(lightingSystem.lights.additional.length).toBe(1);
      expect(lightingSystem.lights.additional[0]).toBeInstanceOf(THREE.PointLight);
    });

    it('should apply saturn preset correctly', () => {
      lightingSystem = new LightingSystem(scene, { preset: 'saturn' });
      
      // Saturn preset should modify directional intensity and add golden light
      const baseDirectional = LIGHTING.DIRECTIONAL.intensity;
      expect(lightingSystem.lights.directional.intensity).toBe(baseDirectional * 1.1);
      
      // Should add golden accent light
      expect(lightingSystem.lights.additional.length).toBe(1);
      expect(lightingSystem.lights.additional[0]).toBeInstanceOf(THREE.PointLight);
      expect(lightingSystem.lights.additional[0].color.getHex()).toBe(COLORS.SATURN_GOLD);
    });
  });

  describe('Factory Functions', () => {
    it('should create standard lighting correctly', () => {
      lightingSystem = createStandardLighting(scene);
      
      expect(lightingSystem.options.preset).toBe('standard');
      expect(lightingSystem.lights.additional.length).toBe(0);
    });

    it('should create desert lighting correctly', () => {
      lightingSystem = createDesertLighting(scene);
      
      expect(lightingSystem.options.preset).toBe('dramatic');
      expect(lightingSystem.options.ambientIntensity).toBe(0.8);
      expect(lightingSystem.options.directionalIntensity).toBe(1.2);
    });

    it('should create saturn lighting correctly', () => {
      lightingSystem = createSaturnLighting(scene);
      
      expect(lightingSystem.options.preset).toBe('saturn');
      expect(lightingSystem.lights.additional.length).toBe(1);
    });

    it('should create space lighting correctly', () => {
      lightingSystem = createSpaceLighting(scene);
      
      expect(lightingSystem.options.preset).toBe('space');
      expect(lightingSystem.options.enableShadows).toBe(false);
      expect(lightingSystem.options.ambientIntensity).toBe(1.5);
    });

    it('should allow factory function customization', () => {
      lightingSystem = createDesertLighting(scene, {
        ambientIntensity: 2.0,
        enableShadows: false
      });
      
      expect(lightingSystem.options.preset).toBe('dramatic');
      expect(lightingSystem.options.ambientIntensity).toBe(2.0);
      expect(lightingSystem.options.enableShadows).toBe(false);
    });
  });

  describe('Runtime Light Control', () => {
    beforeEach(() => {
      lightingSystem = new LightingSystem(scene);
    });

    it('should update ambient intensity', () => {
      lightingSystem.setAmbientIntensity(1.5);
      expect(lightingSystem.lights.ambient.intensity).toBe(1.5);
      
      lightingSystem.setAmbientIntensity(0.2);
      expect(lightingSystem.lights.ambient.intensity).toBe(0.2);
    });

    it('should update directional intensity', () => {
      lightingSystem.setDirectionalIntensity(2.0);
      expect(lightingSystem.lights.directional.intensity).toBe(2.0);
      
      lightingSystem.setDirectionalIntensity(0.1);
      expect(lightingSystem.lights.directional.intensity).toBe(0.1);
    });

    it('should update rim intensity', () => {
      lightingSystem.setRimIntensity(1.8);
      expect(lightingSystem.lights.rim.intensity).toBe(1.8);
      
      lightingSystem.setRimIntensity(0.05);
      expect(lightingSystem.lights.rim.intensity).toBe(0.05);
    });

    it('should control shadow casting', () => {
      lightingSystem.setShadowsEnabled(false);
      expect(lightingSystem.lights.directional.castShadow).toBe(false);
      
      lightingSystem.setShadowsEnabled(true);
      expect(lightingSystem.lights.directional.castShadow).toBe(true);
    });

    it('should return correct light references', () => {
      expect(lightingSystem.getAmbientLight()).toBe(lightingSystem.lights.ambient);
      expect(lightingSystem.getDirectionalLight()).toBe(lightingSystem.lights.directional);
      expect(lightingSystem.getRimLight()).toBe(lightingSystem.lights.rim);
      
      const allLights = lightingSystem.getAllLights();
      expect(allLights).toContain(lightingSystem.lights.ambient);
      expect(allLights).toContain(lightingSystem.lights.directional);
      expect(allLights).toContain(lightingSystem.lights.rim);
    });
  });

  describe('Memory Management and Disposal', () => {
    it('should dispose all lights properly', () => {
      lightingSystem = new LightingSystem(scene, { preset: 'dramatic' });
      
      const initialChildCount = scene.children.length;
      const lightsCount = lightingSystem.getAllLights().length;
      
      lightingSystem.dispose();
      
      // All lights should be removed from scene
      expect(scene.children.length).toBe(initialChildCount - lightsCount);
      
      // Light references should be cleared
      expect(lightingSystem.lights.ambient).toBeNull();
      expect(lightingSystem.lights.directional).toBeNull();
      expect(lightingSystem.lights.rim).toBeNull();
      expect(lightingSystem.lights.additional.length).toBe(0);
    });

    it('should handle disposal of lights with dispose method', () => {
      lightingSystem = new LightingSystem(scene, { preset: 'dramatic' });
      
      // Mock dispose methods on lights that might have them
      const additionalLights = lightingSystem.lights.additional;
      const disposeMocks = additionalLights.map(light => {
        light.dispose = vi.fn();
        return light.dispose;
      });
      
      lightingSystem.dispose();
      
      // Dispose should be called on lights that have the method
      disposeMocks.forEach(mock => {
        expect(mock).toHaveBeenCalled();
      });
    });

    it('should not throw when disposing multiple times', () => {
      lightingSystem = new LightingSystem(scene);
      
      expect(() => {
        lightingSystem.dispose();
        lightingSystem.dispose();
      }).not.toThrow();
    });
  });

  describe('Lighting Consistency Across Scenes', () => {
    it('should produce identical lighting setups with same parameters', () => {
      const lighting1 = new LightingSystem(scene, {
        preset: 'standard',
        ambientIntensity: 1.0,
        directionalIntensity: 0.8,
        rimIntensity: 0.3
      });
      
      const scene2 = new THREE.Scene();
      const lighting2 = new LightingSystem(scene2, {
        preset: 'standard',
        ambientIntensity: 1.0,
        directionalIntensity: 0.8,
        rimIntensity: 0.3
      });
      
      // Compare lighting properties
      expect(lighting1.lights.ambient.intensity).toBe(lighting2.lights.ambient.intensity);
      expect(lighting1.lights.directional.intensity).toBe(lighting2.lights.directional.intensity);
      expect(lighting1.lights.rim.intensity).toBe(lighting2.lights.rim.intensity);
      
      expect(lighting1.lights.ambient.color.getHex()).toBe(lighting2.lights.ambient.color.getHex());
      expect(lighting1.lights.directional.color.getHex()).toBe(lighting2.lights.directional.color.getHex());
      expect(lighting1.lights.rim.color.getHex()).toBe(lighting2.lights.rim.color.getHex());
      
      // Compare positions
      expect(lighting1.lights.directional.position.equals(lighting2.lights.directional.position)).toBe(true);
      expect(lighting1.lights.rim.position.equals(lighting2.lights.rim.position)).toBe(true);
      
      lighting1.dispose();
      lighting2.dispose();
    });

    it('should maintain consistent shadow configurations', () => {
      const lighting1 = new LightingSystem(scene, { enableShadows: true });
      
      const scene2 = new THREE.Scene();
      const lighting2 = new LightingSystem(scene2, { enableShadows: true });
      
      const shadow1 = lighting1.lights.directional.shadow;
      const shadow2 = lighting2.lights.directional.shadow;
      
      expect(shadow1.camera.near).toBe(shadow2.camera.near);
      expect(shadow1.camera.far).toBe(shadow2.camera.far);
      expect(shadow1.camera.left).toBe(shadow2.camera.left);
      expect(shadow1.camera.right).toBe(shadow2.camera.right);
      expect(shadow1.mapSize.width).toBe(shadow2.mapSize.width);
      expect(shadow1.mapSize.height).toBe(shadow2.mapSize.height);
      
      lighting1.dispose();
      lighting2.dispose();
    });
  });
});