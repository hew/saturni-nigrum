import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TriangleObject } from '../../src/lib/components/objects/TriangleObject.js';
import * as THREE from 'three';

describe('Triangle Breath UI Updates', () => {
  let scene;
  let triangleObject;
  
  beforeEach(() => {
    vi.useFakeTimers();
    scene = new THREE.Scene();
    triangleObject = new TriangleObject(scene);
    triangleObject.create();
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should update breathPhase property when updateBreath is called', () => {
    // Initial state
    triangleObject.updateBreath();
    expect(triangleObject.breathPhase).toBe('inhale');
    
    // After 2 seconds - still inhaling
    vi.advanceTimersByTime(2000);
    const phase1 = triangleObject.updateBreath();
    expect(phase1).toBe('inhale');
    expect(triangleObject.breathPhase).toBe('inhale');
    
    // After 3.5 seconds - now exhaling
    vi.advanceTimersByTime(1500);
    const phase2 = triangleObject.updateBreath();
    expect(phase2).toBe('exhale');
    expect(triangleObject.breathPhase).toBe('exhale');
    
    // After 6 seconds - back to inhale
    vi.advanceTimersByTime(2500);
    const phase3 = triangleObject.updateBreath();
    expect(phase3).toBe('inhale');
    expect(triangleObject.breathPhase).toBe('inhale');
  });

  it('should update edge colors during breath cycle', () => {
    triangleObject.updateBreath();
    
    // At start (0s), intensity should be 0.5 (medium gray)
    const edge0 = triangleObject.edges[0];
    const startColor = edge0.material.color.getHex();
    
    // At peak inhale (1.5s), should be bright
    vi.advanceTimersByTime(1500);
    triangleObject.updateBreath();
    const peakColor = edge0.material.color.getHex();
    expect(peakColor).toBeGreaterThan(startColor);
    
    // At peak exhale (4.5s), should be dark
    vi.advanceTimersByTime(3000);
    triangleObject.updateBreath();
    const valleyColor = edge0.material.color.getHex();
    expect(valleyColor).toBeLessThan(startColor);
  });

  it('should have continuous updates in animation loop', () => {
    const phases = [];
    const colors = [];
    
    // Simulate animation loop calling updateBreath every 16ms (60 FPS)
    for (let i = 0; i < 400; i++) { // ~6.4 seconds
      vi.advanceTimersByTime(16);
      const phase = triangleObject.updateBreath();
      phases.push(phase);
      colors.push(triangleObject.edges[0].material.color.getHex());
    }
    
    // Should have both inhale and exhale phases
    expect(phases).toContain('inhale');
    expect(phases).toContain('exhale');
    
    // Should have color variation
    const uniqueColors = [...new Set(colors)];
    expect(uniqueColors.length).toBeGreaterThan(10); // Should have smooth gradient
  });

  it('should show triangle makes it visible and resets breath timer', () => {
    // Set some initial state
    triangleObject.breathStartTime = 12345;
    triangleObject.hide();
    
    // Show should reset timer and make visible
    triangleObject.show();
    expect(triangleObject.triangle.visible).toBe(true);
    expect(triangleObject.breathStartTime).toBe(0);
    
    // Next updateBreath should set new start time
    triangleObject.updateBreath();
    expect(triangleObject.breathStartTime).not.toBe(0);
    expect(triangleObject.breathStartTime).not.toBe(12345);
  });
});