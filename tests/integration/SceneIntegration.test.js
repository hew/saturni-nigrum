import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as THREE from 'three';
import { Ground, createDesertGround, createSpaceGround } from '../../src/lib/three-core/components/Ground.js';
import { LightingSystem, createDesertLighting, createSpaceLighting } from '../../src/lib/three-core/systems/LightingSystem.js';

describe('Scene Integration Tests', () => {
  let scene;
  let camera;
  let renderer;
  let ground;
  let lighting;

  beforeEach(() => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, 1024 / 768, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(1024, 768);
  });

  afterEach(() => {
    if (ground) {
      ground.dispose();
      ground = null;
    }
    if (lighting) {
      lighting.dispose();
      lighting = null;
    }
    if (renderer) {
      renderer.dispose();
    }
  });

  describe('Scene Assembly and Rendering', () => {
    it('should successfully create a complete desert scene', () => {
      // Create desert components
      ground = createDesertGround();
      lighting = createDesertLighting(scene);
      
      // Add ground to scene
      scene.add(ground.getGroup());
      
      // Set camera position
      camera.position.set(30, 30, 30);
      camera.lookAt(0, 0, 0);
      
      // Verify scene composition
      expect(scene.children.length).toBeGreaterThan(3); // Ground + lights
      expect(scene.children).toContain(ground.getGroup());
      expect(scene.children).toContain(lighting.getAmbientLight());
      expect(scene.children).toContain(lighting.getDirectionalLight());
      expect(scene.children).toContain(lighting.getRimLight());
      
      // Verify components are compatible
      expect(ground.options.type).toBe('desert');
      expect(lighting.options.preset).toBe('dramatic');
      
      // Test rendering doesn't throw
      expect(() => {
        renderer.render(scene, camera);
      }).not.toThrow();
    });

    it('should successfully create a complete space scene', () => {
      // Create space components
      ground = createSpaceGround();
      lighting = createSpaceLighting(scene);
      
      // Add ground to scene
      scene.add(ground.getGroup());
      
      // Set camera position for top-down view
      camera.position.set(0, 300, 0);
      camera.lookAt(0, 0, 0);
      
      // Verify scene composition
      expect(scene.children.length).toBeGreaterThan(3); // Ground + lights + starlight
      expect(scene.children).toContain(ground.getGroup());
      expect(lighting.getAllLights().length).toBe(4); // Ambient + directional + rim + starlight
      
      // Verify components are compatible
      expect(ground.options.type).toBe('space');
      expect(lighting.options.preset).toBe('space');
      expect(lighting.options.enableShadows).toBe(false);
      
      // Test rendering doesn't throw
      expect(() => {
        renderer.render(scene, camera);
      }).not.toThrow();
    });

    it('should handle mixed component configurations', () => {
      // Mix components (desert ground with space lighting)
      ground = createDesertGround();
      lighting = createSpaceLighting(scene);
      
      scene.add(ground.getGroup());
      camera.position.set(30, 30, 30);
      camera.lookAt(0, 0, 0);
      
      // Should still work even with mixed configurations
      expect(() => {
        renderer.render(scene, camera);
      }).not.toThrow();
      
      // Both components should maintain their individual characteristics
      expect(ground.options.type).toBe('desert');
      expect(lighting.options.preset).toBe('space');
    });
  });

  describe('Component Interaction and Compatibility', () => {
    it('should properly handle shadow interactions', () => {
      ground = createDesertGround({ receiveShadow: true });
      lighting = createDesertLighting(scene, { enableShadows: true });
      
      scene.add(ground.getGroup());
      
      // Ground should receive shadows
      expect(ground.ground.receiveShadow).toBe(true);
      
      // Directional light should cast shadows
      expect(lighting.getDirectionalLight().castShadow).toBe(true);
      
      // Verify shadow camera is properly configured
      const shadowCamera = lighting.getDirectionalLight().shadow.camera;
      expect(shadowCamera).toBeDefined();
      expect(shadowCamera.near).toBeGreaterThan(0);
      expect(shadowCamera.far).toBeGreaterThan(shadowCamera.near);
    });

    it('should maintain performance when combining components', () => {
      ground = createDesertGround({ segments: 100 });
      lighting = createDesertLighting(scene);
      
      scene.add(ground.getGroup());
      
      // Test multiple renders to check for performance issues
      const startTime = performance.now();
      
      for (let i = 0; i < 10; i++) {
        renderer.render(scene, camera);
      }
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should complete renders reasonably quickly (adjust threshold as needed)
      expect(renderTime).toBeLessThan(1000); // 1 second for 10 renders
    });

    it('should handle grid visibility with different lighting presets', () => {
      ground = createSpaceGround({ showGrid: true });
      lighting = createSpaceLighting(scene);
      
      scene.add(ground.getGroup());
      
      // Grid should be visible and properly lit
      expect(ground.grid.visible).toBe(true);
      
      // Space lighting should not interfere with grid rendering
      expect(() => {
        renderer.render(scene, camera);
      }).not.toThrow();
      
      // Test grid visibility toggle
      ground.setGridVisibility(false);
      expect(ground.grid.visible).toBe(false);
      
      ground.setGridVisibility(true);
      expect(ground.grid.visible).toBe(true);
    });
  });

  describe('Scene Transitions and State Management', () => {
    it('should cleanly transition from desert to space scene', () => {
      // Start with desert scene
      ground = createDesertGround();
      lighting = createDesertLighting(scene);
      scene.add(ground.getGroup());
      
      const initialChildCount = scene.children.length;
      
      // Dispose and replace with space scene
      scene.remove(ground.getGroup());
      ground.dispose();
      lighting.dispose();
      
      ground = createSpaceGround();
      lighting = createSpaceLighting(scene);
      scene.add(ground.getGroup());
      
      // Scene should have similar complexity
      expect(scene.children.length).toBeGreaterThanOrEqual(initialChildCount - 1);
      
      // New components should be properly configured
      expect(ground.options.type).toBe('space');
      expect(lighting.options.preset).toBe('space');
      
      // Should render without issues
      expect(() => {
        renderer.render(scene, camera);
      }).not.toThrow();
    });

    it('should handle rapid component disposal and recreation', () => {
      // Simulate rapid scene changes
      for (let i = 0; i < 5; i++) {
        if (ground) {
          scene.remove(ground.getGroup());
          ground.dispose();
        }
        if (lighting) {
          lighting.dispose();
        }
        
        ground = createDesertGround();
        lighting = createDesertLighting(scene);
        scene.add(ground.getGroup());
        
        // Each iteration should work correctly
        expect(scene.children.length).toBeGreaterThan(3);
        expect(() => {
          renderer.render(scene, camera);
        }).not.toThrow();
      }
    });

    it('should maintain scene state during lighting changes', () => {
      ground = createDesertGround();
      lighting = createDesertLighting(scene);
      scene.add(ground.getGroup());
      
      const groundGroup = ground.getGroup();
      const initialGroundChildren = groundGroup.children.length;
      
      // Change lighting while keeping ground
      lighting.dispose();
      lighting = createSpaceLighting(scene);
      
      // Ground should remain unchanged
      expect(scene.children).toContain(groundGroup);
      expect(groundGroup.children.length).toBe(initialGroundChildren);
      expect(ground.ground.receiveShadow).toBe(true); // Ground properties preserved
      
      // Scene should still render correctly
      expect(() => {
        renderer.render(scene, camera);
      }).not.toThrow();
    });
  });

  describe('Memory Management in Complex Scenes', () => {
    it('should properly dispose complex scenes without memory leaks', () => {
      // Create complex scene with multiple components
      ground = createDesertGround({ 
        showGrid: true, 
        segments: 200,
        proceduralTerrain: true 
      });
      lighting = createDesertLighting(scene, { enableShadows: true });
      
      scene.add(ground.getGroup());
      
      // Mock dispose methods to track calls
      const groundGeometryDispose = vi.spyOn(ground.ground.geometry, 'dispose');
      const groundMaterialDispose = vi.spyOn(ground.ground.material, 'dispose');
      const gridGeometryDispose = vi.spyOn(ground.grid.geometry, 'dispose');
      const gridMaterialDispose = vi.spyOn(ground.grid.material, 'dispose');
      
      // Render to ensure everything is initialized
      renderer.render(scene, camera);
      
      // Dispose everything
      scene.remove(ground.getGroup());
      ground.dispose();
      lighting.dispose();
      
      // Check that dispose was called on all resources
      expect(groundGeometryDispose).toHaveBeenCalled();
      expect(groundMaterialDispose).toHaveBeenCalled();
      expect(gridGeometryDispose).toHaveBeenCalled();
      expect(gridMaterialDispose).toHaveBeenCalled();
      
      // Scene should be empty of our components
      expect(scene.children.length).toBe(0);
      
      ground = null; // Prevent double disposal
      lighting = null;
    });

    it('should handle incomplete disposal gracefully', () => {
      ground = createDesertGround();
      lighting = createDesertLighting(scene);
      scene.add(ground.getGroup());
      
      // Dispose only lighting
      lighting.dispose();
      lighting = null;
      
      // Scene should still be renderable
      expect(() => {
        renderer.render(scene, camera);
      }).not.toThrow();
      
      // Ground should still be functional
      expect(ground.getGroup().children.length).toBeGreaterThan(0);
    });
  });

  describe('Visual Consistency Verification', () => {
    it('should produce consistent visual output with identical configurations', () => {
      // Create two identical scenes
      const scene1 = new THREE.Scene();
      const scene2 = new THREE.Scene();
      
      const ground1 = createDesertGround({ 
        size: 200, 
        segments: 50,
        heightVariation: 2,
        noiseScale: 0.05
      });
      const lighting1 = createDesertLighting(scene1, {
        ambientIntensity: 1.0,
        directionalIntensity: 0.8
      });
      
      const ground2 = createDesertGround({ 
        size: 200, 
        segments: 50,
        heightVariation: 2,
        noiseScale: 0.05
      });
      const lighting2 = createDesertLighting(scene2, {
        ambientIntensity: 1.0,
        directionalIntensity: 0.8
      });
      
      scene1.add(ground1.getGroup());
      scene2.add(ground2.getGroup());
      
      // Both scenes should have identical structure
      expect(scene1.children.length).toBe(scene2.children.length);
      
      // Ground properties should be identical
      expect(ground1.ground.geometry.attributes.position.count)
        .toBe(ground2.ground.geometry.attributes.position.count);
      expect(ground1.ground.material.color.getHex())
        .toBe(ground2.ground.material.color.getHex());
      
      // Lighting properties should be identical
      expect(lighting1.lights.ambient.intensity)
        .toBe(lighting2.lights.ambient.intensity);
      expect(lighting1.lights.directional.intensity)
        .toBe(lighting2.lights.directional.intensity);
      
      // Both should render without errors
      expect(() => renderer.render(scene1, camera)).not.toThrow();
      expect(() => renderer.render(scene2, camera)).not.toThrow();
      
      // Cleanup
      ground1.dispose();
      ground2.dispose();
      lighting1.dispose();
      lighting2.dispose();
    });

    it('should maintain consistent appearance across different camera angles', () => {
      ground = createDesertGround();
      lighting = createDesertLighting(scene);
      scene.add(ground.getGroup());
      
      // Test multiple camera positions
      const cameraPositions = [
        [30, 30, 30],
        [0, 50, 0],
        [-30, 20, 30],
        [50, 10, -20]
      ];
      
      cameraPositions.forEach(([x, y, z]) => {
        camera.position.set(x, y, z);
        camera.lookAt(0, 0, 0);
        
        // Should render consistently from all angles
        expect(() => {
          renderer.render(scene, camera);
        }).not.toThrow();
      });
    });
  });
});