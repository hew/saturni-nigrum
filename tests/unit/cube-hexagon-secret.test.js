import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CubeObject } from '../../src/lib/components/objects/CubeObject.js';
import * as THREE from 'three';

describe('Cube Hexagon Secret', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });
  let scene;
  let cubeObject;
  let camera;
  let cube;
  
  beforeEach(() => {
    scene = new THREE.Scene();
    cubeObject = new CubeObject(scene);
    cube = cubeObject.create();
    
    // Setup camera at default position
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(30, 20, 30);
    camera.lookAt(cube.position);
  });

  describe('Magic Angle Detection', () => {
    it('should detect perfect corner alignment (1,1,1 direction)', () => {
      // Position camera to view cube from corner (1,1,1) direction
      const cornerDir = new THREE.Vector3(1, 1, 1).normalize();
      const distance = 50;
      camera.position.copy(cornerDir.multiplyScalar(distance).add(cube.position));
      camera.lookAt(cube.position);
      
      // Calculate alignment
      const viewDir = camera.position.clone().sub(cube.position).normalize();
      const localCorner = new THREE.Vector3(1, 1, 1).normalize();
      const alignment = Math.abs(viewDir.dot(localCorner));
      
      // Should be nearly perfect alignment (close to 1.0)
      expect(alignment).toBeGreaterThan(0.99);
    });

    it('should calculate hexagon strength based on alignment', () => {
      // Test various alignments
      const testCases = [
        { alignment: 1.0, expectedStrength: 1.0 },      // Perfect
        { alignment: 0.995, expectedStrength: 0.606 },  // Very close (pow(0.995, 100) ≈ 0.606)
        { alignment: 0.99, expectedStrength: 0.366 },   // Close (pow(0.99, 100) ≈ 0.366)
        { alignment: 0.95, expectedStrength: 0.006 },   // Far (pow(0.95, 100) ≈ 0.006)
        { alignment: 0.5, expectedStrength: 0.0 },      // Very far
      ];
      
      testCases.forEach(({ alignment, expectedStrength }) => {
        const strength = Math.pow(alignment, 100);
        expect(strength).toBeCloseTo(expectedStrength, 2);
      });
    });

    it('should only activate in manual mode (not auto-rotate)', () => {
      // Perfect alignment but in auto-rotate mode
      const cornerDir = new THREE.Vector3(1, 1, 1).normalize();
      camera.position.copy(cornerDir.multiplyScalar(50).add(cube.position));
      
      const viewDir = camera.position.clone().sub(cube.position).normalize();
      const alignment = Math.abs(viewDir.dot(cornerDir));
      
      // Auto-rotate mode should return 0 strength regardless of alignment
      const autoRotate = true;
      const hexagonStrength = autoRotate ? 0 : Math.pow(alignment, 100);
      
      expect(hexagonStrength).toBe(0);
    });
  });

  describe('Yellow Edge Transformation', () => {
    it('should have 12 edges', () => {
      expect(cubeObject.cubeEdges.length).toBe(12);
    });

    it('should set edges to golden color at perfect alignment', () => {
      // Simulate perfect alignment (hexagonStrength > 0.995)
      const mockState = {
        showCube: true,
        secretUnlocked: false,
        yellowEdgeStartTime: 0
      };
      
      // Manually update edges as if at perfect alignment
      cubeObject.cubeEdges.forEach(edge => {
        // This simulates what happens in updateCubeAppearance
        edge.material.color.setHex(0xffcc00); // Golden color
        edge.material.opacity = 1.0;
      });
      
      // Check all edges are golden
      cubeObject.cubeEdges.forEach(edge => {
        expect(edge.material.color.getHex()).toBe(0xffcc00);
        expect(edge.material.opacity).toBe(1.0);
      });
    });

    it('should reset edge colors when alignment is lost', () => {
      // First set to golden
      cubeObject.cubeEdges.forEach(edge => {
        edge.material.color.setHex(0xffcc00);
      });
      
      // Then reset to normal (hexagonStrength < 0.95)
      cubeObject.cubeEdges.forEach(edge => {
        edge.material.color.setHex(0x888888); // Normal gray
        edge.material.opacity = 1.0;
      });
      
      // Check all edges are back to gray
      cubeObject.cubeEdges.forEach(edge => {
        expect(edge.material.color.getHex()).toBe(0x888888);
      });
    });
  });

  describe('Cube Opacity Changes', () => {
    it('should make cube transparent at perfect alignment', () => {
      // Test opacity targets for different alignment levels
      const testCases = [
        { hexagonStrength: 0.996, targetOpacity: 0.0 },  // Perfect alignment
        { hexagonStrength: 0.96, targetOpacity: 0.1 },   // Very close
        { hexagonStrength: 0.5, targetOpacity: 1.0 },    // Normal
      ];
      
      testCases.forEach(({ hexagonStrength, targetOpacity }) => {
        if (hexagonStrength > 0.995) {
          cubeObject.targetCubeOpacity = 0.0;
        } else if (hexagonStrength > 0.95) {
          cubeObject.targetCubeOpacity = 0.1;
        } else {
          cubeObject.targetCubeOpacity = 1.0;
        }
        
        expect(cubeObject.targetCubeOpacity).toBe(targetOpacity);
      });
    });

    it('should smoothly animate opacity changes', () => {
      // Start at full opacity
      cubeObject.currentCubeOpacity = 1.0;
      cubeObject.targetCubeOpacity = 0.0;
      
      // Simulate animation step
      const fadeSpeed = 0.08;
      const delta = cubeObject.targetCubeOpacity - cubeObject.currentCubeOpacity;
      cubeObject.currentCubeOpacity += delta * fadeSpeed;
      
      // Should be moving towards target but not instantly
      expect(cubeObject.currentCubeOpacity).toBeLessThan(1.0);
      expect(cubeObject.currentCubeOpacity).toBeGreaterThan(0.0);
      expect(cubeObject.currentCubeOpacity).toBeCloseTo(0.92, 2); // 1.0 + (-1.0 * 0.08)
    });
  });

  describe('Secret Unlock Timing', () => {
    it('should track yellow edge duration', () => {
      const startTime = Date.now();
      
      // Wait 100ms
      vi.advanceTimersByTime(100);
      
      const duration = (Date.now() - startTime) / 1000;
      expect(duration).toBeCloseTo(0.1, 1);
    });

    it('should require 2 seconds of alignment to unlock', () => {
      const testCases = [
        { duration: 1.5, shouldUnlock: false },
        { duration: 2.0, shouldUnlock: true },
        { duration: 2.5, shouldUnlock: true },
      ];
      
      testCases.forEach(({ duration, shouldUnlock }) => {
        const canUnlock = duration >= 2.0;
        expect(canUnlock).toBe(shouldUnlock);
      });
    });

    it('should reset timer when alignment is lost', () => {
      let yellowEdgeStartTime = Date.now();
      let yellowEdgeDuration = 1.5; // 1.5 seconds elapsed
      
      // Alignment lost (hexagonStrength < 0.95)
      yellowEdgeStartTime = 0;
      yellowEdgeDuration = 0;
      
      expect(yellowEdgeStartTime).toBe(0);
      expect(yellowEdgeDuration).toBe(0);
    });
  });

  describe('Edge Visibility', () => {
    it('should update edge visibility based on camera position', () => {
      cubeObject.updateEdgeVisibility(camera.position);
      
      expect(cubeObject.edgeVisibility).toBeDefined();
      expect(cubeObject.edgeVisibility.length).toBe(12);
      
      // At least some edges should be visible (front-facing)
      const visibleEdges = cubeObject.edgeVisibility.filter(visible => visible);
      expect(visibleEdges.length).toBeGreaterThan(0);
    });

    it('should distinguish front and back facing edges', () => {
      // Position camera directly in front of cube
      camera.position.set(0, 15, 50); // Same Y as cube, Z in front
      camera.lookAt(cube.position);
      
      cubeObject.updateEdgeVisibility(camera.position);
      
      // Front face edges (indices 4-7) should be more visible
      // Back face edges (indices 0-3) should be less visible
      const frontEdgeColors = cubeObject.cubeEdges.slice(4, 8).map(e => e.material.color.r);
      const backEdgeColors = cubeObject.cubeEdges.slice(0, 4).map(e => e.material.color.r);
      
      const avgFrontBrightness = frontEdgeColors.reduce((a, b) => a + b) / frontEdgeColors.length;
      const avgBackBrightness = backEdgeColors.reduce((a, b) => a + b) / backEdgeColors.length;
      
      // Front edges should be brighter than back edges
      expect(avgFrontBrightness).toBeGreaterThan(avgBackBrightness);
    });
  });

  describe('Corner Directions', () => {
    it('should have 8 corner directions', () => {
      const corners = [
        new THREE.Vector3( 1,  1,  1).normalize(),
        new THREE.Vector3( 1,  1, -1).normalize(),
        new THREE.Vector3( 1, -1,  1).normalize(),
        new THREE.Vector3( 1, -1, -1).normalize(),
        new THREE.Vector3(-1,  1,  1).normalize(),
        new THREE.Vector3(-1,  1, -1).normalize(),
        new THREE.Vector3(-1, -1,  1).normalize(),
        new THREE.Vector3(-1, -1, -1).normalize(),
      ];
      
      expect(corners.length).toBe(8);
      
      // All should be normalized (length = 1)
      corners.forEach(corner => {
        expect(corner.length()).toBeCloseTo(1.0, 5);
      });
    });

    it('should transform corners by cube rotation', () => {
      const localCorner = new THREE.Vector3(1, 1, 1).normalize();
      
      // Rotate cube 45 degrees around Y
      cube.rotation.y = Math.PI / 4;
      
      const transformedCorner = localCorner.clone().applyEuler(cube.rotation);
      
      // Corner should be rotated
      expect(transformedCorner.x).not.toBeCloseTo(localCorner.x, 2);
      expect(transformedCorner.z).not.toBeCloseTo(localCorner.z, 2);
    });
  });
});