import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as THREE from 'three';
import { Ground, createDesertGround, createWastelandGround, createSpaceGround } from '../../src/lib/three-core/components/Ground.js';
import { COLORS, MATERIALS, GEOMETRY } from '../../src/lib/three-core/utils/Constants.js';

describe('Ground Component', () => {
  let ground;

  afterEach(() => {
    if (ground) {
      ground.dispose();
    }
  });

  describe('Constructor and Basic Properties', () => {
    it('should create a ground instance with default options', () => {
      ground = new Ground();
      
      expect(ground).toBeDefined();
      expect(ground.getGroup()).toBeInstanceOf(THREE.Group);
      expect(ground.ground).toBeInstanceOf(THREE.Mesh);
    });

    it('should apply custom options correctly', () => {
      const customOptions = {
        type: 'wasteland',
        size: 300,
        color: 0xff0000,
        showGrid: false
      };
      
      ground = new Ground(customOptions);
      
      expect(ground.options.type).toBe('wasteland');
      expect(ground.options.size).toBe(300);
      expect(ground.options.color).toBe(0xff0000);
      expect(ground.options.showGrid).toBe(false);
      expect(ground.grid).toBeNull();
    });

    it('should create grid when showGrid is true', () => {
      ground = new Ground({ showGrid: true });
      
      expect(ground.grid).toBeDefined();
      expect(ground.grid).toBeInstanceOf(THREE.Object3D);
    });
  });

  describe('Ground Types and Visual Consistency', () => {
    it('should create desert ground with procedural terrain', () => {
      ground = new Ground({
        type: 'desert',
        proceduralTerrain: true
      });
      
      const geometry = ground.ground.geometry;
      const material = ground.ground.material;
      
      // Check geometry has correct segments for procedural terrain
      expect(geometry.attributes.position.count).toBeGreaterThan(100);
      
      // Check material is Lambert for desert
      expect(material).toBeInstanceOf(THREE.MeshLambertMaterial);
      expect(material.color.getHex()).toBe(COLORS.GROUND_BASE);
      
      // Check terrain has height variation
      const positions = geometry.attributes.position.array;
      let hasHeightVariation = false;
      for (let i = 2; i < positions.length; i += 3) {
        if (positions[i] !== 0) {
          hasHeightVariation = true;
          break;
        }
      }
      expect(hasHeightVariation).toBe(true);
    });

    it('should create flat wasteland ground', () => {
      ground = new Ground({
        type: 'wasteland',
        proceduralTerrain: false
      });
      
      const geometry = ground.ground.geometry;
      const material = ground.ground.material;
      
      // Check material is Standard for wasteland
      expect(material).toBeInstanceOf(THREE.MeshStandardMaterial);
      
      // Check ground is flat (plane geometry)
      expect(geometry).toBeInstanceOf(THREE.PlaneGeometry);
    });

    it('should create space ground with special grid', () => {
      ground = new Ground({
        type: 'space',
        showGrid: true
      });
      
      const material = ground.ground.material;
      
      // Check material is Basic for space
      expect(material).toBeInstanceOf(THREE.MeshBasicMaterial);
      
      // Check custom space grid is created
      expect(ground.grid).toBeDefined();
      if (ground.grid.material) {
        expect(ground.grid.material.blending).toBe(THREE.AdditiveBlending);
      }
    });
  });

  describe('Visual Consistency Across Scenes', () => {
    it('should produce identical desert grounds with same parameters', () => {
      const ground1 = new Ground({
        type: 'desert',
        size: 200,
        segments: 100,
        proceduralTerrain: true,
        heightVariation: 2,
        noiseScale: 0.05
      });
      
      const ground2 = new Ground({
        type: 'desert',
        size: 200,
        segments: 100,
        proceduralTerrain: true,
        heightVariation: 2,
        noiseScale: 0.05
      });
      
      // Both should have same geometry properties
      const geo1 = ground1.ground.geometry;
      const geo2 = ground2.ground.geometry;
      
      expect(geo1.attributes.position.count).toBe(geo2.attributes.position.count);
      
      // Materials should be identical
      const mat1 = ground1.ground.material;
      const mat2 = ground2.ground.material;
      
      expect(mat1.constructor).toBe(mat2.constructor);
      expect(mat1.color.getHex()).toBe(mat2.color.getHex());
      expect(mat1.roughness).toBe(mat2.roughness);
      expect(mat1.metalness).toBe(mat2.metalness);
      
      // Dispose
      ground1.dispose();
      ground2.dispose();
    });

    it('should maintain consistent ground rotation across all types', () => {
      const desertGround = new Ground({ type: 'desert' });
      const wastelandGround = new Ground({ type: 'wasteland' });
      const spaceGround = new Ground({ type: 'space' });
      
      // All grounds should be rotated to lie flat (horizontal)
      expect(desertGround.ground.rotation.x).toBe(-Math.PI / 2);
      expect(wastelandGround.ground.rotation.x).toBe(-Math.PI / 2);
      expect(spaceGround.ground.rotation.x).toBe(-Math.PI / 2);
      
      // Dispose
      desertGround.dispose();
      wastelandGround.dispose();
      spaceGround.dispose();
    });

    it('should apply correct shadow settings consistently', () => {
      const ground1 = new Ground({ receiveShadow: true });
      const ground2 = new Ground({ receiveShadow: false });
      
      expect(ground1.ground.receiveShadow).toBe(true);
      expect(ground2.ground.receiveShadow).toBe(false);
      
      ground1.dispose();
      ground2.dispose();
    });
  });

  describe('Factory Functions', () => {
    it('should create desert ground with correct presets', () => {
      ground = createDesertGround();
      
      expect(ground.options.type).toBe('desert');
      expect(ground.options.proceduralTerrain).toBe(true);
      expect(ground.options.heightVariation).toBe(2);
      expect(ground.ground.material).toBeInstanceOf(THREE.MeshLambertMaterial);
    });

    it('should create wasteland ground with correct presets', () => {
      ground = createWastelandGround();
      
      expect(ground.options.type).toBe('wasteland');
      expect(ground.options.proceduralTerrain).toBe(false);
      expect(ground.ground.material).toBeInstanceOf(THREE.MeshStandardMaterial);
    });

    it('should create space ground with correct presets', () => {
      ground = createSpaceGround();
      
      expect(ground.options.type).toBe('space');
      expect(ground.options.proceduralTerrain).toBe(false);
      expect(ground.options.showGrid).toBe(true);
      expect(ground.ground.material).toBeInstanceOf(THREE.MeshBasicMaterial);
    });

    it('should allow factory function customization', () => {
      ground = createDesertGround({ 
        size: 500,
        color: 0x123456 
      });
      
      expect(ground.options.size).toBe(500);
      expect(ground.options.color).toBe(0x123456);
      expect(ground.options.type).toBe('desert'); // Should still be desert
    });
  });

  describe('Public Methods', () => {
    beforeEach(() => {
      ground = new Ground({ showGrid: true });
    });

    it('should get group correctly', () => {
      const group = ground.getGroup();
      expect(group).toBeInstanceOf(THREE.Group);
      expect(group.children).toContain(ground.ground);
      if (ground.grid) {
        expect(group.children).toContain(ground.grid);
      }
    });

    it('should control grid visibility', () => {
      ground.setGridVisibility(false);
      expect(ground.grid.visible).toBe(false);
      
      ground.setGridVisibility(true);
      expect(ground.grid.visible).toBe(true);
    });

    it('should update grid opacity', () => {
      const initialOpacity = ground.grid.material.opacity;
      
      ground.updateGridOpacity(0.8);
      expect(ground.grid.material.opacity).toBe(0.8);
      
      ground.updateGridOpacity(0.3);
      expect(ground.grid.material.opacity).toBe(0.3);
    });
  });

  describe('Memory Management', () => {
    it('should dispose resources properly', () => {
      ground = new Ground({ showGrid: true });
      
      const groundGeometry = ground.ground.geometry;
      const groundMaterial = ground.ground.material;
      const gridGeometry = ground.grid?.geometry;
      const gridMaterial = ground.grid?.material;
      
      // Mock dispose methods
      const geometryDispose = vi.spyOn(groundGeometry, 'dispose');
      const materialDispose = vi.spyOn(groundMaterial, 'dispose');
      
      let gridGeometryDispose, gridMaterialDispose;
      if (gridGeometry && gridMaterial) {
        gridGeometryDispose = vi.spyOn(gridGeometry, 'dispose');
        gridMaterialDispose = vi.spyOn(gridMaterial, 'dispose');
      }
      
      ground.dispose();
      
      expect(geometryDispose).toHaveBeenCalled();
      expect(materialDispose).toHaveBeenCalled();
      
      if (gridGeometryDispose && gridMaterialDispose) {
        expect(gridGeometryDispose).toHaveBeenCalled();
        expect(gridMaterialDispose).toHaveBeenCalled();
      }
      
      ground = null; // Prevent double disposal in afterEach
    });

    it('should handle disposal gracefully when grid is not present', () => {
      ground = new Ground({ showGrid: false });
      
      expect(() => ground.dispose()).not.toThrow();
    });
  });

  describe('Procedural Terrain Generation', () => {
    it('should generate consistent terrain with same noise parameters', () => {
      const ground1 = new Ground({
        type: 'desert',
        proceduralTerrain: true,
        heightVariation: 2,
        noiseScale: 0.05,
        segments: 50
      });
      
      const ground2 = new Ground({
        type: 'desert',
        proceduralTerrain: true,
        heightVariation: 2,
        noiseScale: 0.05,
        segments: 50
      });
      
      const positions1 = ground1.ground.geometry.attributes.position.array;
      const positions2 = ground2.ground.geometry.attributes.position.array;
      
      // Terrain should be identical for same parameters
      expect(positions1.length).toBe(positions2.length);
      
      for (let i = 0; i < positions1.length; i++) {
        expect(positions1[i]).toBeCloseTo(positions2[i], 5);
      }
      
      ground1.dispose();
      ground2.dispose();
    });

    it('should apply height variation correctly', () => {
      const flatGround = new Ground({
        type: 'desert',
        proceduralTerrain: true,
        heightVariation: 0
      });
      
      const variedGround = new Ground({
        type: 'desert',
        proceduralTerrain: true,
        heightVariation: 5
      });
      
      const flatPositions = flatGround.ground.geometry.attributes.position.array;
      const variedPositions = variedGround.ground.geometry.attributes.position.array;
      
      // Flat ground should have minimal height variation
      let maxFlatHeight = 0;
      for (let i = 2; i < flatPositions.length; i += 3) {
        maxFlatHeight = Math.max(maxFlatHeight, Math.abs(flatPositions[i]));
      }
      
      // Varied ground should have significant height variation
      let maxVariedHeight = 0;
      for (let i = 2; i < variedPositions.length; i += 3) {
        maxVariedHeight = Math.max(maxVariedHeight, Math.abs(variedPositions[i]));
      }
      
      expect(maxVariedHeight).toBeGreaterThan(maxFlatHeight);
      
      flatGround.dispose();
      variedGround.dispose();
    });
  });
});