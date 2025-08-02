import { describe, it, expect } from 'vitest';
import { FlowerOfLife } from '../../src/lib/components/objects/FlowerOfLife.js';

describe('Flower of Life Creation Order', () => {
  it('should follow the sacred geometry creation pattern', () => {
    const flower = new FlowerOfLife(null);
    
    // The creation order represents how the Flower of Life is traditionally drawn
    // Starting from center (0), then alternating pattern around the rings
    const expectedOrder = [0, 1, 3, 5, 2, 4, 6, 7, 9, 11, 8, 10, 12];
    
    // Verify the order makes geometric sense:
    // 0: Center circle
    // 1,3,5: Every other circle in first ring (120° apart)
    // 2,4,6: Remaining circles in first ring
    // 7,9,11: Every other circle in second ring (120° apart)
    // 8,10,12: Remaining circles in second ring
    
    expect(flower.FRUIT_OF_LIFE_ORDER).toEqual(expectedOrder);
    
    // Verify all circle IDs are included exactly once
    const sortedOrder = [...flower.FRUIT_OF_LIFE_ORDER].sort((a, b) => a - b);
    expect(sortedOrder).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
  
  it('should create alternating pattern in first ring', () => {
    const flower = new FlowerOfLife(null);
    const order = flower.FRUIT_OF_LIFE_ORDER;
    
    // First ring circles (1-6) should be drawn in alternating pattern
    // First pass: 1, 3, 5 (positions 1, 2, 3 in order)
    expect(order[1]).toBe(1);
    expect(order[2]).toBe(3);
    expect(order[3]).toBe(5);
    
    // Second pass: 2, 4, 6 (positions 4, 5, 6 in order)
    expect(order[4]).toBe(2);
    expect(order[5]).toBe(4);
    expect(order[6]).toBe(6);
  });
  
  it('should create alternating pattern in second ring', () => {
    const flower = new FlowerOfLife(null);
    const order = flower.FRUIT_OF_LIFE_ORDER;
    
    // Second ring circles (7-12) should be drawn in alternating pattern
    // First pass: 7, 9, 11 (positions 7, 8, 9 in order)
    expect(order[7]).toBe(7);
    expect(order[8]).toBe(9);
    expect(order[9]).toBe(11);
    
    // Second pass: 8, 10, 12 (positions 10, 11, 12 in order)
    expect(order[10]).toBe(8);
    expect(order[11]).toBe(10);
    expect(order[12]).toBe(12);
  });
  
  it('should require exactly 13 clicks to complete', () => {
    const flower = new FlowerOfLife(null);
    expect(flower.FRUIT_OF_LIFE_ORDER.length).toBe(13);
  });
});