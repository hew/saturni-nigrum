import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SaturnObject } from '../../src/lib/components/objects/SaturnObject.js';
import * as THREE from 'three';

describe('SaturnObject Clock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });
  let scene;
  let saturnObject;
  
  beforeEach(() => {
    scene = new THREE.Scene();
    saturnObject = new SaturnObject(scene);
    saturnObject.create();
  });

  describe('Time Display', () => {
    it('should format time with seconds highlighted when digit is 6', () => {
      // Test case 1: Time with 6 in seconds
      const time1 = new Date('2025-01-01T12:00:06');
      const timeArray1 = saturnObject.getTimeArray(time1);
      
      // Find the seconds digits (last two characters)
      const secondsDigits = timeArray1.slice(-2);
      expect(secondsDigits[1].char).toBe('6');
      expect(secondsDigits[1].isSix).toBe(true);
      
      // Test case 2: Time with 6 in tens of seconds
      const time2 = new Date('2025-01-01T12:00:16');
      const timeArray2 = saturnObject.getTimeArray(time2);
      
      const secondsDigits2 = timeArray2.slice(-2);
      expect(secondsDigits2[0].char).toBe('1');
      expect(secondsDigits2[0].isSix).toBe(false);
      expect(secondsDigits2[1].char).toBe('6');
      expect(secondsDigits2[1].isSix).toBe(true);
      
      // Test case 3: Time without 6 in seconds
      const time3 = new Date('2025-01-01T12:00:15');
      const timeArray3 = saturnObject.getTimeArray(time3);
      
      const secondsDigits3 = timeArray3.slice(-2);
      expect(secondsDigits3[0].isSix).toBe(false);
      expect(secondsDigits3[1].isSix).toBe(false);
    });

    it('should stop highlighting 6 after first successful click', () => {
      const time = new Date('2025-01-01T12:00:06');
      
      // Before any clicks, should highlight
      const beforeClick = saturnObject.getTimeArray(time);
      const secondsDigits = beforeClick.slice(-2);
      expect(secondsDigits[1].isSix).toBe(true);
      
      // After successful click
      saturnObject.saturnCounter = 1;
      const afterClick = saturnObject.getTimeArray(time);
      const secondsDigitsAfter = afterClick.slice(-2);
      expect(secondsDigitsAfter[1].isSix).toBe(false);
    });
  });

  describe('Clock Display', () => {
    it('should display time with seconds', () => {
      // The getTimeArray function should include seconds
      const time = new Date('2025-01-01T12:34:56');
      const timeArray = saturnObject.getTimeArray(time);
      
      // Should be HH:MM:SS format (8 characters with colons)
      expect(timeArray.length).toBe(8);
      expect(timeArray[0].char).toBe('1');
      expect(timeArray[1].char).toBe('2');
      expect(timeArray[2].char).toBe(':');
      expect(timeArray[3].char).toBe('3');
      expect(timeArray[4].char).toBe('4');
      expect(timeArray[5].char).toBe(':');
      expect(timeArray[6].char).toBe('5');
      expect(timeArray[7].char).toBe('6');
    });

    it('should update clock every second', () => {
      const initialTime = new Date('2025-01-01T12:00:00');
      vi.setSystemTime(initialTime);
      
      // Get initial display
      const display1 = saturnObject.getTimeArray(new Date());
      expect(display1[7].char).toBe('0'); // Last second digit is 0
      
      // Advance time by 1 second
      vi.advanceTimersByTime(1000);
      
      // Get updated display
      const display2 = saturnObject.getTimeArray(new Date());
      expect(display2[7].char).toBe('1'); // Last second digit is 1
    });
  });

  describe('Timing Secret', () => {
    it('should only increment counter when seconds contains 6', () => {
      // Click when seconds is 06
      const time1 = new Date('2025-01-01T12:00:06');
      const result1 = saturnObject.checkTimingSecret(time1);
      expect(saturnObject.saturnCounter).toBe(1);
      expect(result1).toBe(false);
      
      // Click when seconds is 16
      const time2 = new Date('2025-01-01T12:00:16');
      const result2 = saturnObject.checkTimingSecret(time2);
      expect(saturnObject.saturnCounter).toBe(2);
      expect(result2).toBe(false);
      
      // Click when seconds is 26
      const time3 = new Date('2025-01-01T12:00:26');
      const result3 = saturnObject.checkTimingSecret(time3);
      expect(saturnObject.saturnCounter).toBe(3);
      expect(result3).toBe(true); // Secret unlocked!
    });
    
    it('should show 6/66/666 progress ONLY when seconds contains 6', () => {
      // Before any clicks, no progress shown
      expect(saturnObject.shouldShowProgress(new Date('2025-01-01T12:00:05'))).toBe(false);
      expect(saturnObject.shouldShowProgress(new Date('2025-01-01T12:00:06'))).toBe(false); // No clicks yet
      
      // After first click at :06
      saturnObject.checkTimingSecret(new Date('2025-01-01T12:00:06'));
      expect(saturnObject.saturnCounter).toBe(1);
      
      // Progress shown only when seconds contains 6
      expect(saturnObject.shouldShowProgress(new Date('2025-01-01T12:00:05'))).toBe(false);
      expect(saturnObject.shouldShowProgress(new Date('2025-01-01T12:00:06'))).toBe(true);
      expect(saturnObject.shouldShowProgress(new Date('2025-01-01T12:00:16'))).toBe(true);
      expect(saturnObject.shouldShowProgress(new Date('2025-01-01T12:00:26'))).toBe(true);
      expect(saturnObject.shouldShowProgress(new Date('2025-01-01T12:00:36'))).toBe(true);
      expect(saturnObject.shouldShowProgress(new Date('2025-01-01T12:00:46'))).toBe(true);
      expect(saturnObject.shouldShowProgress(new Date('2025-01-01T12:00:56'))).toBe(true);
      expect(saturnObject.shouldShowProgress(new Date('2025-01-01T12:00:07'))).toBe(false);
      expect(saturnObject.shouldShowProgress(new Date('2025-01-01T12:00:60'))).toBe(false); // 60 would be invalid but checking logic
    });

    it('should reset counter when clicking at wrong time', () => {
      // First successful click
      const time1 = new Date('2025-01-01T12:00:06');
      saturnObject.checkTimingSecret(time1);
      expect(saturnObject.saturnCounter).toBe(1);
      
      // Click at wrong time (no 6 in seconds)
      const time2 = new Date('2025-01-01T12:00:15');
      saturnObject.checkTimingSecret(time2);
      expect(saturnObject.saturnCounter).toBe(0); // Reset!
    });

    it('should prevent duplicate clicks in same second', () => {
      const time = new Date('2025-01-01T12:00:06');
      
      // First click
      saturnObject.checkTimingSecret(time);
      expect(saturnObject.saturnCounter).toBe(1);
      
      // Second click in same second should not increment
      saturnObject.checkTimingSecret(time);
      expect(saturnObject.saturnCounter).toBe(1);
    });
    
    it('should only highlight seconds with 6 before first successful click', () => {
      // Before any clicks
      const time1 = new Date('2025-01-01T12:00:06');
      const timeArray1 = saturnObject.getTimeArray(time1);
      expect(timeArray1[7].isSix).toBe(true); // Should highlight
      
      // After first click
      saturnObject.checkTimingSecret(time1);
      const timeArray2 = saturnObject.getTimeArray(time1);
      expect(timeArray2[7].isSix).toBe(false); // Should NOT highlight anymore
    });
  });
  
  describe('Secret Unlock Behavior', () => {
    it('should return correct unlock state for triangle button', () => {
      // Before unlocking - should not show triangle button
      expect(saturnObject.shouldShowTriangleButton()).toBe(false);
      expect(saturnObject.shouldShowTriangle()).toBe(false);
      
      // Click three times at correct moments
      saturnObject.checkTimingSecret(new Date('2025-01-01T12:00:06'));
      saturnObject.checkTimingSecret(new Date('2025-01-01T12:00:16'));
      expect(saturnObject.shouldShowTriangleButton()).toBe(false); // Not yet
      
      const unlocked = saturnObject.checkTimingSecret(new Date('2025-01-01T12:00:26'));
      expect(unlocked).toBe(true);
      expect(saturnObject.saturnSecretUnlocked).toBe(true);
      
      // After unlocking - should show button but NOT triangle
      expect(saturnObject.shouldShowTriangleButton()).toBe(true);
      expect(saturnObject.shouldShowTriangle()).toBe(false);
    });
    
    it('should show triangle only after button click', () => {
      // Unlock the secret first
      saturnObject.checkTimingSecret(new Date('2025-01-01T12:00:06'));
      saturnObject.checkTimingSecret(new Date('2025-01-01T12:00:16'));
      saturnObject.checkTimingSecret(new Date('2025-01-01T12:00:26'));
      
      expect(saturnObject.shouldShowTriangleButton()).toBe(true);
      expect(saturnObject.shouldShowTriangle()).toBe(false);
      
      // Simulate button click
      saturnObject.onTriangleButtonClick();
      
      // Now triangle should be shown
      expect(saturnObject.shouldShowTriangle()).toBe(true);
    });
  });
});