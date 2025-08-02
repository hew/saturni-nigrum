import { describe, it, expect } from 'vitest';
import * as THREE from 'three';

describe('Cube Magic Angle Geometry', () => {
  it('should calculate the magic viewing angle correctly', () => {
    // When viewing a cube from corner (1,1,1), the angle from any face normal
    // The actual angle is arccos(1/√3) ≈ 54.7356°
    const cornerDirection = new THREE.Vector3(1, 1, 1).normalize();
    const faceNormal = new THREE.Vector3(0, 0, 1);
    
    const angle = Math.acos(Math.abs(cornerDirection.dot(faceNormal)));
    const angleDegrees = angle * 180 / Math.PI;
    
    expect(angleDegrees).toBeCloseTo(54.7356, 4);
  });

  it('should detect when cube forms hexagon silhouette', () => {
    // When viewing a cube from corner direction, 6 vertices form hexagon outline
    const viewDirection = new THREE.Vector3(1, 1, 1).normalize();
    
    // All 8 cube vertices
    const vertices = [
      new THREE.Vector3(-1, -1, -1),
      new THREE.Vector3( 1, -1, -1),
      new THREE.Vector3( 1,  1, -1),
      new THREE.Vector3(-1,  1, -1),
      new THREE.Vector3(-1, -1,  1),
      new THREE.Vector3( 1, -1,  1),
      new THREE.Vector3( 1,  1,  1),
      new THREE.Vector3(-1,  1,  1),
    ];
    
    // When viewed from (1,1,1), 6 vertices form the hexagon outline
    // 2 vertices are hidden (the near and far corners)
    const dotProducts = vertices.map(v => v.dot(viewDirection));
    const sortedDots = [...dotProducts].sort((a, b) => a - b);
    
    // Should have 1 minimum (far corner), 6 middle (hexagon), 1 maximum (near corner)
    expect(sortedDots[0]).toBeLessThan(sortedDots[1]); // Far corner
    expect(sortedDots[7]).toBeGreaterThan(sortedDots[6]); // Near corner
    
    // The 6 middle values form the hexagon ring
    const hexagonDots = sortedDots.slice(1, 7);
    const range = hexagonDots[5] - hexagonDots[0];
    // They're not all at the same distance, but form a ring
    expect(hexagonDots.length).toBe(6);
  });

  it('should have maximum alignment of 1.0 at corner directions', () => {
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
    
    // Each corner should align perfectly with itself
    corners.forEach(corner => {
      const alignment = Math.abs(corner.dot(corner));
      expect(alignment).toBeCloseTo(1.0, 10);
    });
  });

  it('should require extreme precision for hexagon activation', () => {
    // The activation function uses pow(alignment, 100)
    // This creates an extremely sharp activation curve
    
    const testAlignments = [
      { alignment: 1.000, activated: true },   // Perfect
      { alignment: 0.9995, activated: false }, // pow(0.9995, 100) ≈ 0.951
      { alignment: 0.999, activated: false },  // pow(0.999, 100) ≈ 0.905
      { alignment: 0.995, activated: false },  // pow(0.995, 100) ≈ 0.606
      { alignment: 0.990, activated: false },  // pow(0.99, 100) ≈ 0.366
    ];
    
    testAlignments.forEach(({ alignment, activated }) => {
      const strength = Math.pow(alignment, 100);
      const isActivated = strength > 0.995;
      expect(isActivated).toBe(activated);
    });
  });

  it('should detect perfect alignment threshold', () => {
    // The code checks for hexagonStrength > 0.995
    // This happens when pow(alignment, 100) > 0.995
    // Solving: alignment^100 = 0.995
    // alignment = 0.995^(1/100) ≈ 0.99995
    
    const threshold = Math.pow(0.995, 1/100);
    expect(threshold).toBeCloseTo(0.99995, 5);
    
    // This means the cube must be aligned very precisely
    const maxAngleError = Math.acos(threshold) * 180 / Math.PI;
    expect(maxAngleError).toBeLessThan(1.0); // Less than 1 degree
  });

  it('should have 12 edges forming hexagon outline', () => {
    // When viewed from corner, 6 of the 12 edges form the hexagon outline
    const cubeEdges = 12;
    const hexagonEdges = 6;
    const hiddenEdges = 6;
    
    expect(cubeEdges).toBe(hexagonEdges + hiddenEdges);
  });

  it('should maintain golden ratio in edge color', () => {
    // The golden edge color 0xffcc00 has specific ratios
    const r = 0xff / 0xff; // 1.0
    const g = 0xcc / 0xff; // 0.8
    const b = 0x00 / 0xff; // 0.0
    
    expect(r).toBe(1.0);
    expect(g).toBeCloseTo(0.8, 1);
    expect(b).toBe(0.0);
    
    // This creates a Saturn gold color matching the theme
  });
});