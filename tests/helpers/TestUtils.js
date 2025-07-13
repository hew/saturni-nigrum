/**
 * Test utilities for Three.js component testing
 */

import * as THREE from 'three';
import { vi } from 'vitest';

/**
 * Creates a minimal Three.js scene setup for testing
 */
export function createTestScene(options = {}) {
  const {
    width = 512,
    height = 512,
    enableShadows = false,
    enablePostProcessing = false
  } = options;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    preserveDrawingBuffer: true
  });
  
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = enableShadows;
  
  return { scene, camera, renderer };
}

/**
 * Sets up standard camera position for testing
 */
export function setupTestCamera(camera, type = 'default') {
  switch (type) {
    case 'desert':
      camera.position.set(30, 30, 30);
      camera.lookAt(0, 0, 0);
      break;
    case 'space':
      camera.position.set(0, 100, 0);
      camera.lookAt(0, 0, 0);
      break;
    case 'top-down':
      camera.position.set(0, 50, 0);
      camera.lookAt(0, 0, 0);
      break;
    default:
      camera.position.set(20, 20, 20);
      camera.lookAt(0, 0, 0);
  }
}

/**
 * Renders a scene and returns pixel data from specified region
 */
export function renderAndCapture(renderer, scene, camera, region = null) {
  renderer.render(scene, camera);
  
  if (!region) {
    // Capture center 32x32 pixels by default
    region = {
      x: Math.floor((renderer.domElement.width - 32) / 2),
      y: Math.floor((renderer.domElement.height - 32) / 2),
      width: 32,
      height: 32
    };
  }
  
  const pixels = new Uint8Array(region.width * region.height * 4);
  const gl = renderer.getContext();
  
  gl.readPixels(region.x, region.y, region.width, region.height, 
                gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  
  return pixels;
}

/**
 * Calculates average color from pixel data
 */
export function calculateAverageColor(pixels) {
  let r = 0, g = 0, b = 0, a = 0;
  const pixelCount = pixels.length / 4;
  
  for (let i = 0; i < pixels.length; i += 4) {
    r += pixels[i];
    g += pixels[i + 1];
    b += pixels[i + 2];
    a += pixels[i + 3];
  }
  
  return {
    r: r / pixelCount,
    g: g / pixelCount,
    b: b / pixelCount,
    a: a / pixelCount
  };
}

/**
 * Calculates pixel difference percentage between two pixel arrays
 */
export function calculatePixelDifference(pixels1, pixels2, threshold = 0) {
  if (pixels1.length !== pixels2.length) {
    return 100;
  }
  
  let differingPixels = 0;
  const pixelCount = pixels1.length / 4;
  
  for (let i = 0; i < pixels1.length; i += 4) {
    const rDiff = Math.abs(pixels1[i] - pixels2[i]);
    const gDiff = Math.abs(pixels1[i + 1] - pixels2[i + 1]);
    const bDiff = Math.abs(pixels1[i + 2] - pixels2[i + 2]);
    
    const totalDiff = rDiff + gDiff + bDiff;
    
    if (totalDiff > threshold) {
      differingPixels++;
    }
  }
  
  return (differingPixels / pixelCount) * 100;
}

/**
 * Extracts unique colors from pixel data
 */
export function getUniqueColors(pixels, tolerance = 0) {
  const colors = new Set();
  
  for (let i = 0; i < pixels.length; i += 4) {
    if (tolerance === 0) {
      const color = (pixels[i] << 16) | (pixels[i + 1] << 8) | pixels[i + 2];
      colors.add(color);
    } else {
      // Group similar colors within tolerance
      const r = Math.floor(pixels[i] / tolerance) * tolerance;
      const g = Math.floor(pixels[i + 1] / tolerance) * tolerance;
      const b = Math.floor(pixels[i + 2] / tolerance) * tolerance;
      const color = (r << 16) | (g << 8) | b;
      colors.add(color);
    }
  }
  
  return Array.from(colors);
}

/**
 * Measures render performance
 */
export function measureRenderPerformance(renderer, scene, camera, iterations = 10) {
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    renderer.render(scene, camera);
    const end = performance.now();
    times.push(end - start);
  }
  
  return {
    min: Math.min(...times),
    max: Math.max(...times),
    average: times.reduce((a, b) => a + b, 0) / times.length,
    times
  };
}

/**
 * Creates mock dispose functions for testing memory management
 */
export function createDisposeMocks(object) {
  const mocks = {};
  
  if (object.geometry) {
    mocks.geometry = vi.spyOn(object.geometry, 'dispose');
  }
  
  if (object.material) {
    if (Array.isArray(object.material)) {
      mocks.materials = object.material.map(mat => vi.spyOn(mat, 'dispose'));
    } else {
      mocks.material = vi.spyOn(object.material, 'dispose');
    }
  }
  
  return mocks;
}

/**
 * Verifies that dispose mocks were called correctly
 */
export function verifyDisposeCalls(mocks) {
  if (mocks.geometry) {
    expect(mocks.geometry).toHaveBeenCalledOnce();
  }
  
  if (mocks.material) {
    expect(mocks.material).toHaveBeenCalledOnce();
  }
  
  if (mocks.materials) {
    mocks.materials.forEach(mock => {
      expect(mock).toHaveBeenCalledOnce();
    });
  }
}

/**
 * Creates a test configuration for components
 */
export function createTestConfig(type = 'desert', customizations = {}) {
  const baseConfigs = {
    desert: {
      type: 'desert',
      size: 100,
      segments: 20,
      proceduralTerrain: true,
      heightVariation: 2,
      noiseScale: 0.05,
      showGrid: false
    },
    space: {
      type: 'space',
      size: 100,
      showGrid: true,
      proceduralTerrain: false
    },
    wasteland: {
      type: 'wasteland',
      size: 100,
      proceduralTerrain: false,
      showGrid: true
    }
  };
  
  return {
    ...baseConfigs[type],
    ...customizations
  };
}

/**
 * Validates Three.js object hierarchy
 */
export function validateObjectHierarchy(object, expectedTypes = []) {
  const hierarchy = [];
  
  object.traverse((child) => {
    hierarchy.push({
      type: child.type,
      name: child.name,
      visible: child.visible,
      hasGeometry: !!child.geometry,
      hasMaterial: !!child.material
    });
  });
  
  if (expectedTypes.length > 0) {
    const types = hierarchy.map(item => item.type);
    expectedTypes.forEach(expectedType => {
      expect(types).toContain(expectedType);
    });
  }
  
  return hierarchy;
}

/**
 * Simulates rapid scene changes for stress testing
 */
export function simulateSceneTransitions(createSceneFn, disposeFn, iterations = 5) {
  const results = {
    creationTimes: [],
    disposalTimes: [],
    errors: []
  };
  
  for (let i = 0; i < iterations; i++) {
    try {
      // Create
      const createStart = performance.now();
      const sceneComponents = createSceneFn();
      const createTime = performance.now() - createStart;
      results.creationTimes.push(createTime);
      
      // Dispose
      const disposeStart = performance.now();
      disposeFn(sceneComponents);
      const disposeTime = performance.now() - disposeStart;
      results.disposalTimes.push(disposeTime);
      
    } catch (error) {
      results.errors.push(error);
    }
  }
  
  return results;
}

/**
 * Validates color consistency within tolerance
 */
export function validateColorConsistency(colors, tolerance = 10) {
  if (colors.length < 2) return true;
  
  const baseColor = colors[0];
  
  for (let i = 1; i < colors.length; i++) {
    const color = colors[i];
    const rDiff = Math.abs(baseColor.r - color.r);
    const gDiff = Math.abs(baseColor.g - color.g);
    const bDiff = Math.abs(baseColor.b - color.b);
    
    if (rDiff > tolerance || gDiff > tolerance || bDiff > tolerance) {
      return false;
    }
  }
  
  return true;
}

/**
 * Creates a standard test runner for component consistency
 */
export function createConsistencyTest(componentFactory, testConfigs) {
  return function(testName, validationFn) {
    return it(testName, () => {
      const components = testConfigs.map(config => componentFactory(config));
      
      try {
        const results = validationFn(components);
        return results;
      } finally {
        // Cleanup
        components.forEach(component => {
          if (component.dispose) {
            component.dispose();
          }
        });
      }
    });
  };
}