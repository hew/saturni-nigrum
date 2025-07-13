import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as THREE from 'three';
import { Ground, createDesertGround, createSpaceGround } from '../../src/lib/three-core/components/Ground.js';
import { LightingSystem, createDesertLighting, createSpaceLighting } from '../../src/lib/three-core/systems/LightingSystem.js';

describe('Visual Regression Tests', () => {
  let scene;
  let camera;
  let renderer;
  let ground;
  let lighting;

  beforeEach(() => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, 1024 / 768, 0.1, 1000);
    
    // Create renderer with consistent settings
    renderer = new THREE.WebGLRenderer({
      antialias: false, // Disable for consistent testing
      preserveDrawingBuffer: true // Enable for pixel reading
    });
    renderer.setSize(512, 512); // Smaller size for faster tests
    renderer.setClearColor(0x000000, 1.0);
    renderer.shadowMap.enabled = false; // Consistent shadows for testing
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

  describe('Ground Component Visual Consistency', () => {
    it('should render desert ground with consistent appearance', () => {
      ground = createDesertGround({
        size: 100,
        segments: 20,
        heightVariation: 1,
        noiseScale: 0.05,
        showGrid: false // Simplify for testing
      });
      lighting = createDesertLighting(scene, { enableShadows: false });
      
      scene.add(ground.getGroup());
      camera.position.set(20, 20, 20);
      camera.lookAt(0, 0, 0);
      
      // Render and capture frame
      renderer.render(scene, camera);
      
      // Read pixels from center region
      const centerPixels = readCenterPixels(renderer, 32, 32);
      
      // Desert should have dark tones (ground is dark in this theme)
      const averageColor = calculateAverageColor(centerPixels);
      expect(averageColor.r).toBeLessThan(50); // Dark ground
      expect(averageColor.g).toBeLessThan(50);
      expect(averageColor.b).toBeLessThan(50);
      
      // Should not be completely black (due to lighting)
      expect(averageColor.r + averageColor.g + averageColor.b).toBeGreaterThan(0);
    });

    it('should render space ground with distinct visual characteristics', () => {
      ground = createSpaceGround({
        size: 100,
        showGrid: true
      });
      lighting = createSpaceLighting(scene);
      
      scene.add(ground.getGroup());
      camera.position.set(0, 50, 0); // Top-down view
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
      
      // Space grid should create visible lines
      const pixels = readCenterPixels(renderer, 64, 64);
      const uniqueColors = getUniqueColors(pixels);
      
      // Should have variation due to grid lines
      expect(uniqueColors.length).toBeGreaterThan(5);
    });

    it('should produce identical visuals for identical ground configurations', () => {
      const config = {
        type: 'desert',
        size: 100,
        segments: 20,
        proceduralTerrain: true,
        heightVariation: 2,
        noiseScale: 0.05,
        showGrid: false
      };
      
      // Create two identical grounds
      const ground1 = new Ground(config);
      const ground2 = new Ground(config);
      
      lighting = createDesertLighting(scene, { enableShadows: false });
      
      // Render first ground
      scene.add(ground1.getGroup());
      camera.position.set(30, 30, 30);
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      const pixels1 = readCenterPixels(renderer, 32, 32);
      
      // Replace with second ground
      scene.remove(ground1.getGroup());
      scene.add(ground2.getGroup());
      renderer.render(scene, camera);
      const pixels2 = readCenterPixels(renderer, 32, 32);
      
      // Pixels should be very similar (allow small differences due to floating point)
      const difference = calculatePixelDifference(pixels1, pixels2);
      expect(difference).toBeLessThan(5); // Less than 5% difference
      
      ground1.dispose();
      ground2.dispose();
    });

    it('should show visual differences between ground types', () => {
      lighting = createDesertLighting(scene, { enableShadows: false });
      
      // Render desert ground
      const desertGround = createDesertGround({ 
        size: 100, 
        segments: 20,
        showGrid: false 
      });
      scene.add(desertGround.getGroup());
      camera.position.set(30, 30, 30);
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      const desertPixels = readCenterPixels(renderer, 32, 32);
      
      // Replace with space ground
      scene.remove(desertGround.getGroup());
      desertGround.dispose();
      
      const spaceGround = createSpaceGround({ 
        size: 100,
        showGrid: false // Remove grid for fair comparison
      });
      scene.add(spaceGround.getGroup());
      renderer.render(scene, camera);
      const spacePixels = readCenterPixels(renderer, 32, 32);
      
      // Should be visually different
      const difference = calculatePixelDifference(desertPixels, spacePixels);
      expect(difference).toBeGreaterThan(1); // At least 1% difference
      
      spaceGround.dispose();
    });
  });

  describe('Lighting System Visual Impact', () => {
    it('should show distinct lighting characteristics for different presets', () => {
      ground = createDesertGround({ showGrid: false });
      scene.add(ground.getGroup());
      camera.position.set(30, 30, 30);
      camera.lookAt(0, 0, 0);
      
      // Test standard lighting
      lighting = new LightingSystem(scene, { 
        preset: 'standard',
        enableShadows: false 
      });
      renderer.render(scene, camera);
      const standardPixels = readCenterPixels(renderer, 32, 32);
      
      // Replace with dramatic lighting
      lighting.dispose();
      lighting = new LightingSystem(scene, { 
        preset: 'dramatic',
        enableShadows: false 
      });
      renderer.render(scene, camera);
      const dramaticPixels = readCenterPixels(renderer, 32, 32);
      
      // Dramatic lighting should look different
      const difference = calculatePixelDifference(standardPixels, dramaticPixels);
      expect(difference).toBeGreaterThan(2); // Should have noticeable difference
    });

    it('should maintain consistent ambient lighting levels', () => {
      ground = createDesertGround({ showGrid: false });
      lighting = createDesertLighting(scene, { 
        enableShadows: false,
        ambientIntensity: 1.0 
      });
      
      scene.add(ground.getGroup());
      camera.position.set(30, 30, 30);
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
      const pixels = readCenterPixels(renderer, 32, 32);
      const averageColor = calculateAverageColor(pixels);
      
      // Store baseline brightness
      const brightness = (averageColor.r + averageColor.g + averageColor.b) / 3;
      
      // Test that similar setups produce similar brightness
      expect(brightness).toBeGreaterThan(5); // Should have some illumination
      expect(brightness).toBeLessThan(200); // Should not be blown out
    });

    it('should show proper color temperature for space lighting', () => {
      ground = createSpaceGround({ showGrid: false });
      lighting = createSpaceLighting(scene);
      
      scene.add(ground.getGroup());
      camera.position.set(0, 50, 0);
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
      const pixels = readCenterPixels(renderer, 32, 32);
      const averageColor = calculateAverageColor(pixels);
      
      // Space lighting should have cool tones (blue bias)
      // Note: exact values depend on lighting configuration
      expect(averageColor.b).toBeGreaterThanOrEqual(averageColor.r);
    });
  });

  describe('Visual Performance and Quality', () => {
    it('should render complex scenes within reasonable time', () => {
      ground = createDesertGround({
        size: 200,
        segments: 100,
        proceduralTerrain: true,
        showGrid: true
      });
      lighting = createDesertLighting(scene, { enableShadows: true });
      
      scene.add(ground.getGroup());
      camera.position.set(50, 50, 50);
      camera.lookAt(0, 0, 0);
      
      const startTime = performance.now();
      renderer.render(scene, camera);
      const renderTime = performance.now() - startTime;
      
      // Should render quickly even with complex geometry
      expect(renderTime).toBeLessThan(100); // 100ms max for test render
    });

    it('should maintain visual quality across different viewport sizes', () => {
      ground = createDesertGround({ showGrid: false });
      lighting = createDesertLighting(scene, { enableShadows: false });
      
      scene.add(ground.getGroup());
      camera.position.set(30, 30, 30);
      camera.lookAt(0, 0, 0);
      
      // Test different render sizes
      const sizes = [
        [256, 256],
        [512, 512],
        [1024, 768]
      ];
      
      const renderedImages = sizes.map(([width, height]) => {
        renderer.setSize(width, height);
        renderer.render(scene, camera);
        return readCenterPixels(renderer, 
          Math.min(32, width / 8), 
          Math.min(32, height / 8)
        );
      });
      
      // Different sizes should produce similar average colors
      const colors = renderedImages.map(calculateAverageColor);
      
      for (let i = 1; i < colors.length; i++) {
        const diff = Math.abs(colors[0].r - colors[i].r) +
                    Math.abs(colors[0].g - colors[i].g) +
                    Math.abs(colors[0].b - colors[i].b);
        
        expect(diff).toBeLessThan(30); // Allow some variation due to resolution
      }
    });
  });

  describe('Grid Rendering Consistency', () => {
    it('should render grid lines with consistent visibility', () => {
      ground = createSpaceGround({ showGrid: true });
      lighting = createSpaceLighting(scene);
      
      scene.add(ground.getGroup());
      camera.position.set(0, 100, 0);
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
      const withGridPixels = readFullFrame(renderer);
      
      // Hide grid and render again
      ground.setGridVisibility(false);
      renderer.render(scene, camera);
      const withoutGridPixels = readFullFrame(renderer);
      
      // Should be noticeably different
      const difference = calculatePixelDifference(withGridPixels, withoutGridPixels);
      expect(difference).toBeGreaterThan(5); // Grid should make visible difference
    });

    it('should handle grid opacity changes visually', () => {
      ground = createSpaceGround({ showGrid: true });
      lighting = createSpaceLighting(scene);
      
      scene.add(ground.getGroup());
      camera.position.set(0, 100, 0);
      camera.lookAt(0, 0, 0);
      
      // Test different opacities
      const opacities = [0.2, 0.6, 1.0];
      const renderedOpacities = opacities.map(opacity => {
        ground.updateGridOpacity(opacity);
        renderer.render(scene, camera);
        return readCenterPixels(renderer, 64, 64);
      });
      
      // Higher opacity should generally result in more visible grid
      const visibility = renderedOpacities.map(pixels => {
        const uniqueColors = getUniqueColors(pixels);
        return uniqueColors.length; // More unique colors = more visible grid
      });
      
      // Should show progression (though exact relationship may vary)
      expect(visibility[2]).toBeGreaterThanOrEqual(visibility[0]);
    });
  });
});

// Helper functions for visual testing
function readCenterPixels(renderer, width, height) {
  const canvas = renderer.domElement;
  const centerX = Math.floor((canvas.width - width) / 2);
  const centerY = Math.floor((canvas.height - height) / 2);
  
  const pixels = new Uint8Array(width * height * 4);
  const gl = renderer.getContext();
  
  // Read pixels from center of canvas
  gl.readPixels(centerX, centerY, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  
  return pixels;
}

function readFullFrame(renderer) {
  const canvas = renderer.domElement;
  const pixels = new Uint8Array(canvas.width * canvas.height * 4);
  const gl = renderer.getContext();
  
  gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  
  return pixels;
}

function calculateAverageColor(pixels) {
  let r = 0, g = 0, b = 0;
  const pixelCount = pixels.length / 4;
  
  for (let i = 0; i < pixels.length; i += 4) {
    r += pixels[i];
    g += pixels[i + 1];
    b += pixels[i + 2];
  }
  
  return {
    r: r / pixelCount,
    g: g / pixelCount,
    b: b / pixelCount
  };
}

function calculatePixelDifference(pixels1, pixels2) {
  if (pixels1.length !== pixels2.length) {
    return 100; // Complete difference if different sizes
  }
  
  let totalDiff = 0;
  const pixelCount = pixels1.length / 4;
  
  for (let i = 0; i < pixels1.length; i += 4) {
    const rDiff = Math.abs(pixels1[i] - pixels2[i]);
    const gDiff = Math.abs(pixels1[i + 1] - pixels2[i + 1]);
    const bDiff = Math.abs(pixels1[i + 2] - pixels2[i + 2]);
    
    totalDiff += (rDiff + gDiff + bDiff) / 3;
  }
  
  // Return percentage difference
  return (totalDiff / pixelCount / 255) * 100;
}

function getUniqueColors(pixels) {
  const colors = new Set();
  
  for (let i = 0; i < pixels.length; i += 4) {
    const color = (pixels[i] << 16) | (pixels[i + 1] << 8) | pixels[i + 2];
    colors.add(color);
  }
  
  return Array.from(colors);
}