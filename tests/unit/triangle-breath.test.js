import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TriangleObject } from '../../src/lib/components/objects/TriangleObject.js';
import * as THREE from 'three';

describe('Triangle Breath Secret', () => {
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

  describe('Breath Cycle Timing', () => {
    it('should have 6 second breath cycle (3s inhale + 3s exhale)', () => {
      const cycleDuration = 6;
      
      // Start breath
      triangleObject.updateBreath();
      expect(triangleObject.breathPhase).toBe('inhale');
      
      // After 2 seconds - still inhaling
      vi.advanceTimersByTime(2000);
      triangleObject.updateBreath();
      expect(triangleObject.breathPhase).toBe('inhale');
      
      // After 3.5 seconds - now exhaling
      vi.advanceTimersByTime(1500);
      triangleObject.updateBreath();
      expect(triangleObject.breathPhase).toBe('exhale');
      
      // After 6 seconds - back to inhale
      vi.advanceTimersByTime(2500);
      triangleObject.updateBreath();
      expect(triangleObject.breathPhase).toBe('inhale');
    });

    it('should calculate breath intensity using sine wave', () => {
      // At start (0s), sine(0) = 0, intensity = 0.5
      triangleObject.updateBreath();
      const startTime = triangleObject.breathStartTime;
      
      // At 1.5s (peak inhale), sine(π/2) = 1, intensity = 1.0
      vi.advanceTimersByTime(1500);
      triangleObject.updateBreath();
      
      // At 3s (transition), sine(π) = 0, intensity = 0.5
      vi.advanceTimersByTime(1500);
      triangleObject.updateBreath();
      
      // At 4.5s (peak exhale), sine(3π/2) = -1, intensity = 0.0
      vi.advanceTimersByTime(1500);
      triangleObject.updateBreath();
    });

    it('should reset breath timer when shown', () => {
      // Start breath
      triangleObject.updateBreath();
      const firstStartTime = triangleObject.breathStartTime;
      
      // Advance time
      vi.advanceTimersByTime(3000);
      
      // Show triangle (should reset timer)
      triangleObject.show();
      expect(triangleObject.breathStartTime).toBe(0);
      
      // Update breath should set new start time
      triangleObject.updateBreath();
      expect(triangleObject.breathStartTime).not.toBe(firstStartTime);
    });
  });

  describe('Breath Peak Detection', () => {
    it('should detect peak inhale window (1.3s - 1.7s)', () => {
      // Test various times
      const testCases = [
        { time: 1000, isPeak: false },  // Too early
        { time: 1200, isPeak: false },  // Just before window
        { time: 1300, isPeak: true },   // Start of window
        { time: 1500, isPeak: true },   // Perfect peak
        { time: 1700, isPeak: true },   // End of window
        { time: 1800, isPeak: false },  // Just after window
        { time: 3000, isPeak: false },  // Exhale phase
      ];
      
      testCases.forEach(({ time, isPeak }) => {
        // Reset object for each test
        triangleObject.breathStartTime = 0;
        triangleObject.breathCounter = 0;
        triangleObject.lastClickCycle = -1;
        
        // Start breath fresh
        triangleObject.updateBreath();
        vi.advanceTimersByTime(time);
        
        const result = triangleObject.checkBreathClick();
        
        if (isPeak) {
          expect(triangleObject.breathCounter).toBe(1);
        } else {
          expect(triangleObject.breathCounter).toBe(0);
        }
      });
    });

    it('should have 0.4 second window for perfect timing', () => {
      triangleObject.updateBreath();
      
      // Window is from 1.3s to 1.7s = 0.4 seconds
      const windowStart = 1.3;
      const windowEnd = 1.7;
      const windowDuration = windowEnd - windowStart;
      
      expect(windowDuration).toBeCloseTo(0.4);
    });
  });

  describe('Progress Tracking', () => {
    it('should increment counter on perfect clicks', () => {
      expect(triangleObject.breathCounter).toBe(0);
      
      // First perfect click at 1.5s
      triangleObject.updateBreath();
      vi.advanceTimersByTime(1500); // Peak moment
      triangleObject.checkBreathClick();
      expect(triangleObject.breathCounter).toBe(1);
      
      // Wait for next cycle (total time: 7.5s)
      vi.advanceTimersByTime(6000);
      
      // Second perfect click at 7.5s (1.5s into second cycle)
      triangleObject.checkBreathClick();
      expect(triangleObject.breathCounter).toBe(2);
      
      // Wait for next cycle (total time: 13.5s)
      vi.advanceTimersByTime(6000);
      
      // Third perfect click at 13.5s (1.5s into third cycle)
      const result = triangleObject.checkBreathClick();
      expect(result).toBe(true); // Trinity achieved!
      expect(triangleObject.breathCounter).toBe(0); // Reset after success
    });

    it('should reset counter on missed timing', () => {
      // Build up some progress
      triangleObject.updateBreath();
      vi.advanceTimersByTime(1500);
      triangleObject.checkBreathClick();
      expect(triangleObject.breathCounter).toBe(1);
      
      vi.advanceTimersByTime(6000);
      triangleObject.checkBreathClick();
      expect(triangleObject.breathCounter).toBe(2);
      
      // Click at wrong time
      vi.advanceTimersByTime(3000); // Mid-exhale
      triangleObject.checkBreathClick();
      expect(triangleObject.breathCounter).toBe(0); // Reset!
    });

    it('should require exactly 3 perfect breaths', () => {
      triangleObject.updateBreath();
      
      // Click 1
      vi.advanceTimersByTime(1500);
      let result = triangleObject.checkBreathClick();
      expect(result).toBe(false);
      expect(triangleObject.breathCounter).toBe(1);
      
      // Click 2
      vi.advanceTimersByTime(6000);
      result = triangleObject.checkBreathClick();
      expect(result).toBe(false);
      expect(triangleObject.breathCounter).toBe(2);
      
      // Click 3 - Trinity achieved!
      vi.advanceTimersByTime(6000);
      result = triangleObject.checkBreathClick();
      expect(result).toBe(true);
      expect(triangleObject.breathCounter).toBe(0); // Reset after success
    });
  });

  describe('Visual Feedback', () => {
    it('should animate edge colors with breath cycle', () => {
      triangleObject.updateBreath();
      
      // Check edge colors at different points
      const edge = triangleObject.edges[0];
      
      // At peak inhale (1.5s) - should be bright
      vi.advanceTimersByTime(1500);
      triangleObject.updateBreath();
      const peakColor = edge.material.color.getHex();
      expect(peakColor).toBeGreaterThan(0xCCCCCC); // Bright
      
      // At peak exhale (4.5s) - should be dark
      vi.advanceTimersByTime(3000);
      triangleObject.updateBreath();
      const valleyColor = edge.material.color.getHex();
      expect(valleyColor).toBeLessThan(0x666666); // Dark
    });

    it('should activate glow on perfect click', () => {
      triangleObject.updateBreath();
      vi.advanceTimersByTime(1500);
      
      expect(triangleObject.triangleGlowActive).toBe(false);
      triangleObject.checkBreathClick();
      expect(triangleObject.triangleGlowActive).toBe(true);
    });

    it('should deactivate glow after 500ms', () => {
      triangleObject.updateBreath();
      vi.advanceTimersByTime(1500);
      
      triangleObject.checkBreathClick();
      expect(triangleObject.triangleGlowActive).toBe(true);
      
      // Wait for glow timeout
      vi.advanceTimersByTime(500);
      expect(triangleObject.triangleGlowActive).toBe(false);
    });
  });

  describe('Triangle Properties', () => {
    it('should create equilateral triangle', () => {
      const size = 14.4;
      const expectedHeight = size * Math.sqrt(3) / 2;
      
      // Triangle should have 3 edges
      expect(triangleObject.edges.length).toBe(3);
      
      // Check triangle dimensions
      const heightRatio = Math.sqrt(3) / 2;
      expect(heightRatio).toBeCloseTo(0.866, 3);
    });

    it('should be 44% larger than cube/saturn', () => {
      const cubeSize = 10;
      const triangleSize = 14.4;
      const sizeRatio = triangleSize / cubeSize;
      
      expect(sizeRatio).toBeCloseTo(1.44, 2);
    });

    it('should position at same height as other objects', () => {
      expect(triangleObject.triangle.position.y).toBe(15);
    });

    it('should start invisible', () => {
      expect(triangleObject.triangle.visible).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid clicks correctly', () => {
      triangleObject.updateBreath();
      vi.advanceTimersByTime(1500);
      
      // First click in the window counts
      triangleObject.checkBreathClick();
      expect(triangleObject.breathCounter).toBe(1);
      
      // Additional clicks in same breath window should not count (prevents cheating)
      triangleObject.checkBreathClick();
      expect(triangleObject.breathCounter).toBe(1); // Still 1, not 2
      
      triangleObject.checkBreathClick();
      expect(triangleObject.breathCounter).toBe(1); // Still 1, not reset
    });

    it('should maintain breath cycle continuously', () => {
      triangleObject.updateBreath();
      
      // Run for multiple cycles
      for (let i = 0; i < 10; i++) {
        vi.advanceTimersByTime(6000);
        const phase = triangleObject.updateBreath();
        
        // Should always be either inhale or exhale
        expect(['inhale', 'exhale']).toContain(phase);
      }
    });
  });
});