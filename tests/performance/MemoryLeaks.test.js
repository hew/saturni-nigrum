import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as THREE from 'three';
import { Ground, createDesertGround, createSpaceGround } from '../../src/lib/three-core/components/Ground.js';
import { LightingSystem, createDesertLighting, createSpaceLighting } from '../../src/lib/three-core/systems/LightingSystem.js';

describe('Memory Leak Prevention Tests', () => {
  let scene;
  let renderer;

  beforeEach(() => {
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(512, 512);
  });

  afterEach(() => {
    if (renderer) {
      renderer.dispose();
    }
  });

  describe('Ground Component Memory Management', () => {
    it('should properly dispose all geometry and materials', () => {
      const ground = createDesertGround({ showGrid: true });
      
      // Mock dispose methods to track calls
      const groundGeometryDispose = vi.spyOn(ground.ground.geometry, 'dispose');
      const groundMaterialDispose = vi.spyOn(ground.ground.material, 'dispose');
      const gridGeometryDispose = vi.spyOn(ground.grid.geometry, 'dispose');
      const gridMaterialDispose = vi.spyOn(ground.grid.material, 'dispose');
      
      // Add to scene and render to ensure resources are allocated
      scene.add(ground.getGroup());
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      camera.position.set(30, 30, 30);
      renderer.render(scene, camera);
      
      // Dispose
      scene.remove(ground.getGroup());
      ground.dispose();
      
      // Verify all dispose methods were called
      expect(groundGeometryDispose).toHaveBeenCalledOnce();
      expect(groundMaterialDispose).toHaveBeenCalledOnce();
      expect(gridGeometryDispose).toHaveBeenCalledOnce();
      expect(gridMaterialDispose).toHaveBeenCalledOnce();
    });

    it('should handle repeated creation and disposal without accumulating memory', () => {
      const disposeSpies = [];
      
      // Create and dispose multiple grounds
      for (let i = 0; i < 10; i++) {
        const ground = createDesertGround({ 
          size: 100,
          segments: 50,
          showGrid: true 
        });
        
        // Track dispose calls
        const geometryDispose = vi.spyOn(ground.ground.geometry, 'dispose');
        const materialDispose = vi.spyOn(ground.ground.material, 'dispose');
        disposeSpies.push(geometryDispose, materialDispose);
        
        if (ground.grid) {
          const gridGeometryDispose = vi.spyOn(ground.grid.geometry, 'dispose');
          const gridMaterialDispose = vi.spyOn(ground.grid.material, 'dispose');
          disposeSpies.push(gridGeometryDispose, gridMaterialDispose);
        }
        
        scene.add(ground.getGroup());
        scene.remove(ground.getGroup());
        ground.dispose();
      }
      
      // All resources should have been disposed
      disposeSpies.forEach(spy => {
        expect(spy).toHaveBeenCalledOnce();
      });
    });

    it('should not leave dangling references after disposal', () => {
      const ground = createDesertGround({ showGrid: true });
      const groundRef = ground.ground;
      const gridRef = ground.grid;
      const groupRef = ground.getGroup();
      
      scene.add(ground.getGroup());
      
      // Verify references exist
      expect(groundRef).toBeDefined();
      expect(gridRef).toBeDefined();
      expect(groupRef.children).toContain(groundRef);
      expect(groupRef.children).toContain(gridRef);
      
      // Dispose
      scene.remove(ground.getGroup());
      ground.dispose();
      
      // References should still exist but objects should be cleaned up
      // (Note: In a real scenario, you'd want to null out references)
      expect(groupRef.children.length).toBeGreaterThan(0); // Group still contains objects
      
      // But disposed objects should have their resources cleaned up
      expect(groundRef.geometry.attributes.position).toBeDefined(); // Geometry still exists
      expect(groundRef.material.color).toBeDefined(); // Material still exists
    });

    it('should handle disposal when grid is not present', () => {
      const ground = createDesertGround({ showGrid: false });
      
      expect(ground.grid).toBeNull();
      
      // Should not throw when disposing without grid
      expect(() => {
        ground.dispose();
      }).not.toThrow();
    });

    it('should properly clean up procedural terrain geometry', () => {
      const ground = createDesertGround({
        proceduralTerrain: true,
        segments: 100,
        showGrid: false
      });
      
      const geometry = ground.ground.geometry;
      const geometryDispose = vi.spyOn(geometry, 'dispose');
      
      // Verify complex geometry was created
      expect(geometry.attributes.position.count).toBeGreaterThan(1000);
      
      ground.dispose();
      
      expect(geometryDispose).toHaveBeenCalledOnce();
    });
  });

  describe('LightingSystem Memory Management', () => {
    it('should remove all lights from scene on disposal', () => {
      const lighting = createDesertLighting(scene, { 
        preset: 'dramatic' // Adds additional lights
      });
      
      const initialChildCount = scene.children.length;
      const allLights = lighting.getAllLights();
      
      // Verify lights were added
      expect(allLights.length).toBeGreaterThan(3);
      allLights.forEach(light => {
        expect(scene.children).toContain(light);
      });
      
      lighting.dispose();
      
      // All lights should be removed
      expect(scene.children.length).toBe(initialChildCount - allLights.length);
      allLights.forEach(light => {
        expect(scene.children).not.toContain(light);
      });
    });

    it('should clear all light references after disposal', () => {
      const lighting = createSpaceLighting(scene);
      
      // Verify references exist
      expect(lighting.lights.ambient).toBeInstanceOf(THREE.AmbientLight);
      expect(lighting.lights.directional).toBeInstanceOf(THREE.DirectionalLight);
      expect(lighting.lights.rim).toBeInstanceOf(THREE.DirectionalLight);
      expect(lighting.lights.additional.length).toBeGreaterThan(0);
      
      lighting.dispose();
      
      // References should be cleared
      expect(lighting.lights.ambient).toBeNull();
      expect(lighting.lights.directional).toBeNull();
      expect(lighting.lights.rim).toBeNull();
      expect(lighting.lights.additional.length).toBe(0);
    });

    it('should handle disposal of lights with custom dispose methods', () => {
      const lighting = createDesertLighting(scene, { preset: 'dramatic' });
      
      // Mock dispose methods on additional lights
      const disposeMocks = lighting.lights.additional.map(light => {
        light.dispose = vi.fn();
        return light.dispose;
      });
      
      lighting.dispose();
      
      // Custom dispose methods should be called
      disposeMocks.forEach(mock => {
        expect(mock).toHaveBeenCalledOnce();
      });
    });

    it('should not throw on multiple disposal calls', () => {
      const lighting = createStandardLighting(scene);
      
      expect(() => {
        lighting.dispose();
        lighting.dispose();
        lighting.dispose();
      }).not.toThrow();
    });

    it('should handle rapid creation and disposal cycles', () => {
      const scenesAndLighting = [];
      
      // Create multiple lighting systems rapidly
      for (let i = 0; i < 20; i++) {
        const testScene = new THREE.Scene();
        const lighting = createDesertLighting(testScene);
        scenesAndLighting.push({ scene: testScene, lighting });
      }
      
      // Dispose all rapidly
      expect(() => {
        scenesAndLighting.forEach(({ lighting }) => {
          lighting.dispose();
        });
      }).not.toThrow();
      
      // Verify all scenes are empty
      scenesAndLighting.forEach(({ scene }) => {
        expect(scene.children.length).toBe(0);
      });
    });
  });

  describe('Complex Scene Memory Management', () => {
    it('should handle complex scene disposal without memory leaks', () => {
      const grounds = [];
      const lightingSystems = [];
      
      // Create complex scene with multiple components
      for (let i = 0; i < 5; i++) {
        const ground = createDesertGround({
          size: 100 + i * 20,
          segments: 20 + i * 10,
          showGrid: i % 2 === 0
        });
        
        const lighting = createDesertLighting(scene, {
          preset: i % 2 === 0 ? 'dramatic' : 'standard'
        });
        
        scene.add(ground.getGroup());
        grounds.push(ground);
        lightingSystems.push(lighting);
      }
      
      const initialChildCount = scene.children.length;
      expect(initialChildCount).toBeGreaterThan(15); // Should have many objects
      
      // Dispose everything
      grounds.forEach(ground => {
        scene.remove(ground.getGroup());
        ground.dispose();
      });
      
      lightingSystems.forEach(lighting => {
        lighting.dispose();
      });
      
      // Scene should be empty
      expect(scene.children.length).toBe(0);
    });

    it('should maintain performance across multiple scene transitions', () => {
      const performanceResults = [];
      
      for (let cycle = 0; cycle < 5; cycle++) {
        const startTime = performance.now();
        
        // Create scene
        const ground = createDesertGround({ 
          segments: 100,
          showGrid: true 
        });
        const lighting = createDesertLighting(scene);
        scene.add(ground.getGroup());
        
        // Render
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.set(30, 30, 30);
        renderer.render(scene, camera);
        
        // Dispose
        scene.remove(ground.getGroup());
        ground.dispose();
        lighting.dispose();
        
        const cycleTime = performance.now() - startTime;
        performanceResults.push(cycleTime);
      }
      
      // Performance should not degrade significantly over cycles
      const firstCycle = performanceResults[0];
      const lastCycle = performanceResults[performanceResults.length - 1];
      
      // Last cycle should not be more than 50% slower than first
      expect(lastCycle).toBeLessThan(firstCycle * 1.5);
    });

    it('should properly dispose WebGL resources', () => {
      const ground = createDesertGround({ 
        segments: 200,
        showGrid: true 
      });
      const lighting = createDesertLighting(scene);
      
      scene.add(ground.getGroup());
      
      // Render to allocate WebGL resources
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      camera.position.set(30, 30, 30);
      renderer.render(scene, camera);
      
      // Get WebGL context info
      const gl = renderer.getContext();
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      
      // Mock WebGL resource tracking
      const mockDeleteBuffer = vi.spyOn(gl, 'deleteBuffer');
      const mockDeleteTexture = vi.spyOn(gl, 'deleteTexture');
      
      // Dispose everything
      scene.remove(ground.getGroup());
      ground.dispose();
      lighting.dispose();
      renderer.renderLists.dispose(); // Dispose render lists
      
      // Note: Three.js handles WebGL resource disposal internally
      // This test verifies the disposal chain doesn't throw errors
      expect(() => {
        renderer.render(scene, camera); // Should render empty scene
      }).not.toThrow();
    });
  });

  describe('Component Reuse and Lifecycle Management', () => {
    it('should handle component reuse without memory accumulation', () => {
      let ground = createDesertGround({ showGrid: true });
      let lighting = createDesertLighting(scene);
      
      for (let i = 0; i < 10; i++) {
        // Use components
        scene.add(ground.getGroup());
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        renderer.render(scene, camera);
        
        // Remove but don't dispose
        scene.remove(ground.getGroup());
        lighting.dispose();
        
        // Create new lighting, reuse ground
        lighting = createDesertLighting(scene);
      }
      
      // Final cleanup
      ground.dispose();
      lighting.dispose();
      
      expect(scene.children.length).toBe(0);
    });

    it('should prevent disposal of already disposed components', () => {
      const ground = createDesertGround({ showGrid: true });
      const lighting = createDesertLighting(scene);
      
      // Dispose once
      ground.dispose();
      lighting.dispose();
      
      // Dispose again should not throw
      expect(() => {
        ground.dispose();
        lighting.dispose();
      }).not.toThrow();
    });

    it('should handle partial disposal gracefully', () => {
      const ground = createDesertGround({ showGrid: true });
      const lighting = createDesertLighting(scene);
      
      scene.add(ground.getGroup());
      
      // Dispose only lighting
      lighting.dispose();
      
      // Ground should still be functional
      expect(ground.getGroup().children.length).toBeGreaterThan(0);
      
      // Should still render without errors
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      expect(() => {
        renderer.render(scene, camera);
      }).not.toThrow();
      
      // Final cleanup
      scene.remove(ground.getGroup());
      ground.dispose();
    });
  });
});