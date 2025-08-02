import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FlowerOfLife } from '../../src/lib/components/objects/FlowerOfLife.js';
import * as THREE from 'three';

describe('Flower of Life', () => {
  let scene;
  let flowerOfLife;
  let raycaster;
  
  beforeEach(() => {
    scene = new THREE.Scene();
    flowerOfLife = new FlowerOfLife(scene);
    flowerOfLife.create();
    raycaster = new THREE.Raycaster();
  });

  describe('Circle Creation', () => {
    it('should create 13 circles in total', () => {
      expect(flowerOfLife.circleData.length).toBe(13);
      expect(flowerOfLife.nodeMap.size).toBe(13);
    });

    it('should position center circle at origin', () => {
      const centerCircle = flowerOfLife.circleData[0];
      expect(centerCircle.id).toBe(0);
      expect(centerCircle.x).toBe(0);
      expect(centerCircle.y).toBe(0);
    });

    it('should position first ring of 6 circles correctly', () => {
      // Circles 1-6 should be at radius distance from center
      for (let i = 1; i <= 6; i++) {
        const circle = flowerOfLife.circleData[i];
        const distance = Math.sqrt(circle.x * circle.x + circle.y * circle.y);
        expect(distance).toBeCloseTo(flowerOfLife.radius, 5);
      }
    });

    it('should position second ring of 6 circles correctly', () => {
      // Circles 7-12 should be at radius * sqrt(3) distance from center
      const expectedDistance = flowerOfLife.radius * Math.sqrt(3);
      for (let i = 7; i <= 12; i++) {
        const circle = flowerOfLife.circleData[i];
        const distance = Math.sqrt(circle.x * circle.x + circle.y * circle.y);
        expect(distance).toBeCloseTo(expectedDistance, 5);
      }
    });

    it('should create clickable nodes for each circle', () => {
      flowerOfLife.nodeMap.forEach((nodeData, id) => {
        expect(nodeData.node).toBeDefined();
        expect(nodeData.node.userData.isNode).toBe(true);
        expect(nodeData.node.userData.id).toBe(id);
      });
    });
  });

  describe('Click Order Validation', () => {
    it('should define the correct creation order', () => {
      expect(flowerOfLife.FRUIT_OF_LIFE_ORDER).toEqual([0, 1, 3, 5, 2, 4, 6, 7, 9, 11, 8, 10, 12]);
      expect(flowerOfLife.FRUIT_OF_LIFE_ORDER.length).toBe(13);
    });

    it('should accept clicks in the correct order', () => {
      const mockIntersects = (nodeId) => [{
        object: {
          userData: { isNode: true, id: nodeId }
        }
      }];

      // Click in correct order
      raycaster.intersectObjects = vi.fn().mockReturnValue(mockIntersects(0));
      expect(flowerOfLife.handleClick(raycaster)).toBe(true);
      expect(flowerOfLife.metatronClicks).toEqual([0]);

      raycaster.intersectObjects = vi.fn().mockReturnValue(mockIntersects(1));
      expect(flowerOfLife.handleClick(raycaster)).toBe(true);
      expect(flowerOfLife.metatronClicks).toEqual([0, 1]);

      raycaster.intersectObjects = vi.fn().mockReturnValue(mockIntersects(3));
      expect(flowerOfLife.handleClick(raycaster)).toBe(true);
      expect(flowerOfLife.metatronClicks).toEqual([0, 1, 3]);
    });

    it('should reject clicks in wrong order', () => {
      const mockIntersects = (nodeId) => [{
        object: {
          userData: { isNode: true, id: nodeId }
        }
      }];

      // Try to click circle 1 first (should be 0)
      raycaster.intersectObjects = vi.fn().mockReturnValue(mockIntersects(1));
      expect(flowerOfLife.handleClick(raycaster)).toBe(false);
      expect(flowerOfLife.metatronClicks).toEqual([]);

      // Click correct first circle
      raycaster.intersectObjects = vi.fn().mockReturnValue(mockIntersects(0));
      expect(flowerOfLife.handleClick(raycaster)).toBe(true);
      expect(flowerOfLife.metatronClicks).toEqual([0]);

      // Try to click wrong second circle (should be 1, not 2)
      raycaster.intersectObjects = vi.fn().mockReturnValue(mockIntersects(2));
      expect(flowerOfLife.handleClick(raycaster)).toBe(false);
      expect(flowerOfLife.metatronClicks).toEqual([]); // Should reset
    });

    it('should reset progress on incorrect click', () => {
      const mockIntersects = (nodeId) => [{
        object: {
          userData: { isNode: true, id: nodeId }
        }
      }];

      // Build up some progress
      raycaster.intersectObjects = vi.fn().mockReturnValue(mockIntersects(0));
      flowerOfLife.handleClick(raycaster);
      raycaster.intersectObjects = vi.fn().mockReturnValue(mockIntersects(1));
      flowerOfLife.handleClick(raycaster);
      raycaster.intersectObjects = vi.fn().mockReturnValue(mockIntersects(3));
      flowerOfLife.handleClick(raycaster);
      
      expect(flowerOfLife.metatronClicks.length).toBe(3);

      // Click wrong circle
      raycaster.intersectObjects = vi.fn().mockReturnValue(mockIntersects(6)); // Should be 5
      expect(flowerOfLife.handleClick(raycaster)).toBe(false);
      expect(flowerOfLife.metatronClicks).toEqual([]); // Reset to empty
    });
  });

  describe('Visual Feedback', () => {
    it('should dim circles when clicked correctly', () => {
      const mockIntersects = (nodeId) => [{
        object: {
          userData: { isNode: true, id: nodeId }
        }
      }];

      // Click first circle
      raycaster.intersectObjects = vi.fn().mockReturnValue(mockIntersects(0));
      flowerOfLife.handleClick(raycaster);

      // Check that circle 0 was dimmed
      const nodeData = flowerOfLife.nodeMap.get(0);
      expect(nodeData.circle.material.color.getHex()).toBe(0x666666);
    });

    it('should reset all circle colors on wrong click', () => {
      const mockIntersects = (nodeId) => [{
        object: {
          userData: { isNode: true, id: nodeId }
        }
      }];

      // Click some circles correctly
      raycaster.intersectObjects = vi.fn().mockReturnValue(mockIntersects(0));
      flowerOfLife.handleClick(raycaster);
      raycaster.intersectObjects = vi.fn().mockReturnValue(mockIntersects(1));
      flowerOfLife.handleClick(raycaster);

      // Click wrong circle
      raycaster.intersectObjects = vi.fn().mockReturnValue(mockIntersects(5)); // Should be 3
      flowerOfLife.handleClick(raycaster);

      // All circles should be reset to original color
      flowerOfLife.nodeMap.forEach((nodeData) => {
        expect(nodeData.circle.material.color.getHex()).toBe(0xffffff);
      });
    });
  });

  describe('Completion Detection', () => {
    it('should detect when all 13 circles are clicked correctly', () => {
      const mockIntersects = (nodeId) => [{
        object: {
          userData: { isNode: true, id: nodeId }
        }
      }];

      // Click all circles in correct order
      const correctOrder = [0, 1, 3, 5, 2, 4, 6, 7, 9, 11, 8, 10, 12];
      correctOrder.forEach((nodeId, index) => {
        raycaster.intersectObjects = vi.fn().mockReturnValue(mockIntersects(nodeId));
        flowerOfLife.handleClick(raycaster);
        
        if (index < 12) {
          expect(flowerOfLife.showMetatron).toBe(false);
        }
      });

      // After all 13 clicks, Metatron should be shown
      expect(flowerOfLife.showMetatron).toBe(true);
      expect(flowerOfLife.metatronClicks.length).toBe(13);
    });

    it('should create Metatrons Cube on completion', () => {
      const mockIntersects = (nodeId) => [{
        object: {
          userData: { isNode: true, id: nodeId }
        }
      }];

      // Complete the sequence
      const correctOrder = [0, 1, 3, 5, 2, 4, 6, 7, 9, 11, 8, 10, 12];
      correctOrder.forEach((nodeId) => {
        raycaster.intersectObjects = vi.fn().mockReturnValue(mockIntersects(nodeId));
        flowerOfLife.handleClick(raycaster);
      });

      expect(flowerOfLife.metatronCube).toBeDefined();
      expect(flowerOfLife.metatronCube).not.toBeNull();
    });

    it('should not accept clicks after completion', () => {
      const mockIntersects = (nodeId) => [{
        object: {
          userData: { isNode: true, id: nodeId }
        }
      }];

      // Complete the sequence
      const correctOrder = [0, 1, 3, 5, 2, 4, 6, 7, 9, 11, 8, 10, 12];
      correctOrder.forEach((nodeId) => {
        raycaster.intersectObjects = vi.fn().mockReturnValue(mockIntersects(nodeId));
        flowerOfLife.handleClick(raycaster);
      });

      // Try to click after completion
      raycaster.intersectObjects = vi.fn().mockReturnValue(mockIntersects(0));
      expect(flowerOfLife.handleClick(raycaster)).toBe(false);
    });
  });

  describe('Mobile Support', () => {
    it('should increase raycaster threshold on mobile', () => {
      const mockIntersects = [{
        object: {
          userData: { isNode: true, id: 0 }
        }
      }];

      raycaster.intersectObjects = vi.fn().mockReturnValue(mockIntersects);
      
      // Simulate mobile click
      flowerOfLife.handleClick(raycaster, true);
      
      expect(raycaster.params.Points.threshold).toBe(0.1);
    });
  });

  describe('Helper Methods', () => {
    it('should correctly identify if showing Metatron', () => {
      expect(flowerOfLife.isShowingMetatron()).toBe(false);
      
      // Complete sequence
      flowerOfLife.showMetatron = true;
      expect(flowerOfLife.isShowingMetatron()).toBe(true);
    });

    it('should reset state correctly', () => {
      // Add some progress
      flowerOfLife.metatronClicks = [0, 1, 3];
      flowerOfLife.showMetatron = true;
      
      // Reset should clear everything
      if (flowerOfLife.reset) {
        flowerOfLife.reset();
        expect(flowerOfLife.metatronClicks).toEqual([]);
        expect(flowerOfLife.showMetatron).toBe(false);
      }
    });
  });
});