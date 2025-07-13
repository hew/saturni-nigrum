import { describe, it, expect, afterEach } from 'vitest';
import * as THREE from 'three';
import { Ground, createDesertGround } from '../../src/lib/three-core/components/Ground.js';
import { LightingSystem, createDesertLighting } from '../../src/lib/three-core/systems/LightingSystem.js';
import { createTestScene, setupTestCamera, renderAndCapture, calculateAverageColor } from '../helpers/TestUtils.js';

describe('Basic Component Usage Examples', () => {
  let testSetup;
  let components = [];

  afterEach(() => {
    // Clean up components
    components.forEach(component => {
      if (component.dispose) {
        component.dispose();
      }
    });
    components = [];

    // Clean up test setup
    if (testSetup?.renderer) {
      testSetup.renderer.dispose();
    }
  });

  it('should create a simple desert scene', () => {
    // Setup
    testSetup = createTestScene({ width: 512, height: 512 });
    const { scene, camera, renderer } = testSetup;
    
    // Create components
    const ground = createDesertGround({
      size: 100,
      segments: 20,
      showGrid: false
    });
    const lighting = createDesertLighting(scene);
    
    components.push(ground, lighting);
    
    // Assemble scene
    scene.add(ground.getGroup());
    setupTestCamera(camera, 'desert');
    
    // Verify scene structure
    expect(scene.children.length).toBeGreaterThan(3); // Ground + lights
    expect(ground.options.type).toBe('desert');
    expect(lighting.options.preset).toBe('dramatic');
    
    // Test rendering
    const pixels = renderAndCapture(renderer, scene, camera);
    const avgColor = calculateAverageColor(pixels);
    
    // Desert should render with dark tones but not be completely black
    expect(avgColor.r + avgColor.g + avgColor.b).toBeGreaterThan(0);
    expect(avgColor.r).toBeLessThan(100); // Dark ground characteristic
  });

  it('should demonstrate visual consistency between identical grounds', () => {
    // Setup
    testSetup = createTestScene();
    const { scene, camera, renderer } = testSetup;
    
    const config = {
      type: 'desert',
      size: 100,
      segments: 20,
      proceduralTerrain: true,
      heightVariation: 2,
      showGrid: false
    };
    
    // Create two identical grounds
    const ground1 = new Ground(config);
    const ground2 = new Ground(config);
    const lighting = createDesertLighting(scene, { enableShadows: false });
    
    components.push(ground1, ground2, lighting);
    
    setupTestCamera(camera, 'desert');
    
    // Render first ground
    scene.add(ground1.getGroup());
    const pixels1 = renderAndCapture(renderer, scene, camera);
    
    // Render second ground
    scene.remove(ground1.getGroup());
    scene.add(ground2.getGroup());
    const pixels2 = renderAndCapture(renderer, scene, camera);
    
    // Calculate visual similarity
    let identicalPixels = 0;
    for (let i = 0; i < pixels1.length; i++) {
      if (Math.abs(pixels1[i] - pixels2[i]) <= 2) { // Allow small floating-point differences
        identicalPixels++;
      }
    }
    
    const similarity = (identicalPixels / pixels1.length) * 100;
    expect(similarity).toBeGreaterThan(95); // Should be 95%+ identical
  });

  it('should handle component disposal properly', () => {
    // Setup
    testSetup = createTestScene();
    const { scene } = testSetup;
    
    const ground = createDesertGround({ showGrid: true });
    const lighting = createDesertLighting(scene);
    
    scene.add(ground.getGroup());
    
    const initialChildCount = scene.children.length;
    const lightCount = lighting.getAllLights().length;
    
    // Verify components are in scene
    expect(scene.children).toContain(ground.getGroup());
    lighting.getAllLights().forEach(light => {
      expect(scene.children).toContain(light);
    });
    
    // Dispose components
    scene.remove(ground.getGroup());
    ground.dispose();
    lighting.dispose();
    
    // Verify proper cleanup
    expect(scene.children.length).toBe(initialChildCount - lightCount - 1);
    expect(lighting.lights.ambient).toBeNull();
    expect(lighting.lights.directional).toBeNull();
    expect(lighting.lights.rim).toBeNull();
    
    // Components are disposed, don't add to cleanup array
  });

  it('should demonstrate lighting preset differences', () => {
    // Setup
    testSetup = createTestScene();
    const { scene, camera, renderer } = testSetup;
    
    const ground = createDesertGround({ showGrid: false });
    scene.add(ground.getGroup());
    setupTestCamera(camera, 'desert');
    
    // Test standard lighting
    let lighting = new LightingSystem(scene, { 
      preset: 'standard',
      enableShadows: false 
    });
    const standardPixels = renderAndCapture(renderer, scene, camera);
    const standardColor = calculateAverageColor(standardPixels);
    
    // Switch to dramatic lighting
    lighting.dispose();
    lighting = new LightingSystem(scene, { 
      preset: 'dramatic',
      enableShadows: false 
    });
    const dramaticPixels = renderAndCapture(renderer, scene, camera);
    const dramaticColor = calculateAverageColor(dramaticPixels);
    
    components.push(ground, lighting);
    
    // Dramatic lighting should be visually different
    const colorDifference = Math.abs(standardColor.r - dramaticColor.r) +
                           Math.abs(standardColor.g - dramaticColor.g) +
                           Math.abs(standardColor.b - dramaticColor.b);
    
    expect(colorDifference).toBeGreaterThan(10); // Should have noticeable difference
  });

  it('should show grid visibility effects', () => {
    // Setup
    testSetup = createTestScene();
    const { scene, camera, renderer } = testSetup;
    
    const ground = createDesertGround({ showGrid: true });
    const lighting = createDesertLighting(scene, { enableShadows: false });
    
    components.push(ground, lighting);
    
    scene.add(ground.getGroup());
    setupTestCamera(camera, 'top-down');
    
    // Render with grid visible
    ground.setGridVisibility(true);
    const withGridPixels = renderAndCapture(renderer, scene, camera, {
      x: 200, y: 200, width: 64, height: 64
    });
    
    // Render with grid hidden
    ground.setGridVisibility(false);
    const withoutGridPixels = renderAndCapture(renderer, scene, camera, {
      x: 200, y: 200, width: 64, height: 64
    });
    
    // Calculate difference
    let differentPixels = 0;
    for (let i = 0; i < withGridPixels.length; i += 4) {
      const diff = Math.abs(withGridPixels[i] - withoutGridPixels[i]) +
                   Math.abs(withGridPixels[i+1] - withoutGridPixels[i+1]) +
                   Math.abs(withGridPixels[i+2] - withoutGridPixels[i+2]);
      
      if (diff > 10) { // Threshold for meaningful difference
        differentPixels++;
      }
    }
    
    const pixelCount = withGridPixels.length / 4;
    const differencePercentage = (differentPixels / pixelCount) * 100;
    
    // Grid should make a visible difference
    expect(differencePercentage).toBeGreaterThan(5);
  });
});