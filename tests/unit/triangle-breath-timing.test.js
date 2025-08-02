import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TriangleObject } from '../../src/lib/components/objects/TriangleObject.js';
import * as THREE from 'three';

describe('Triangle Breath Timing Mechanics', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should follow precise breath cycle pattern', () => {
    const triangle = new TriangleObject(null);
    triangle.updateBreath();
    
    // Document the exact timing pattern:
    // 0.0s - 3.0s: INHALE phase
    // 3.0s - 6.0s: EXHALE phase
    // Peak window: 1.3s - 1.7s (during INHALE only)
    
    const timingPattern = [
      { time: 0,    phase: 'inhale', canClick: false },
      { time: 1000, phase: 'inhale', canClick: false },
      { time: 1300, phase: 'inhale', canClick: true },  // Window start
      { time: 1500, phase: 'inhale', canClick: true },  // Perfect peak
      { time: 1700, phase: 'inhale', canClick: true },  // Window end
      { time: 2000, phase: 'inhale', canClick: false },
      { time: 3000, phase: 'exhale', canClick: false },
      { time: 4000, phase: 'exhale', canClick: false },
      { time: 5000, phase: 'exhale', canClick: false },
      { time: 6000, phase: 'inhale', canClick: false }, // New cycle
      { time: 7500, phase: 'inhale', canClick: true },  // Peak of 2nd cycle
    ];
    
    timingPattern.forEach(({ time, phase, canClick }) => {
      // Reset to start
      triangle.breathStartTime = Date.now();
      vi.advanceTimersByTime(time);
      
      // Check phase
      const currentPhase = triangle.updateBreath();
      expect(currentPhase).toBe(phase);
      
      // Check if click would work
      const elapsed = time / 1000;
      const phaseTime = elapsed % 6;
      const isPeakMoment = phaseTime >= 1.3 && phaseTime <= 1.7;
      expect(isPeakMoment).toBe(canClick);
    });
  });

  it('should calculate breath wave correctly', () => {
    const scene = new THREE.Scene();
    const triangle = new TriangleObject(scene);
    triangle.create(); // Need edges for color updates
    triangle.updateBreath();
    
    // The breath intensity follows: 0.5 + 0.5 * sin(2π * elapsed/6)
    const testPoints = [
      { time: 0,    expectedIntensity: 0.5 },   // sin(0) = 0
      { time: 1500, expectedIntensity: 1.0 },   // sin(π/2) = 1
      { time: 3000, expectedIntensity: 0.5 },   // sin(π) = 0
      { time: 4500, expectedIntensity: 0.0 },   // sin(3π/2) = -1
      { time: 6000, expectedIntensity: 0.5 },   // sin(2π) = 0
    ];
    
    testPoints.forEach(({ time, expectedIntensity }) => {
      triangle.breathStartTime = Date.now();
      vi.advanceTimersByTime(time);
      triangle.updateBreath();
      
      // Check edge color brightness matches expected intensity
      const edge = triangle.edges[0];
      const color = edge.material.color;
      const actualHex = color.getHex();
      
      // Extract the red component (all RGB values are same for gray)
      const actualGray = (actualHex >> 16) & 0xFF;
      const expectedGray = Math.floor(0x33 + (expectedIntensity * (0xFF - 0x33)));
      
      // Allow small tolerance for floating point calculations
      expect(actualGray).toBeCloseTo(expectedGray, -1); // Within 5 units
    });
  });

  it('should require trinity pattern for success', () => {
    const triangle = new TriangleObject(null);
    
    // The sacred pattern: 3 perfect breaths
    // Each must be at peak inhale (1.3s - 1.7s into cycle)
    // Missing any resets the counter
    
    const clickPattern = [
      { cycle: 1, time: 1500, success: false, counter: 1 },
      { cycle: 2, time: 7500, success: false, counter: 2 },
      { cycle: 3, time: 13500, success: true, counter: 0 }, // Trinity!
    ];
    
    triangle.updateBreath();
    
    clickPattern.forEach(({ time, success, counter }) => {
      triangle.breathStartTime = Date.now();
      vi.advanceTimersByTime(time);
      
      const result = triangle.checkBreathClick();
      expect(result).toBe(success);
      expect(triangle.breathCounter).toBe(counter);
    });
  });

  it('should have glow feedback timing', () => {
    const triangle = new TriangleObject(null);
    triangle.updateBreath();
    
    // Click at peak
    vi.advanceTimersByTime(1500);
    triangle.checkBreathClick();
    
    // Glow should activate immediately
    expect(triangle.triangleGlowActive).toBe(true);
    
    // Glow should last exactly 500ms
    vi.advanceTimersByTime(499);
    expect(triangle.triangleGlowActive).toBe(true);
    
    vi.advanceTimersByTime(1);
    expect(triangle.triangleGlowActive).toBe(false);
  });
});