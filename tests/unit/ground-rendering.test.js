import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as THREE from 'three';
import { createWastelandGround } from '../../src/lib/three-core/components/Ground.js';

describe('Ground Rendering', () => {
  let ground;
  
  beforeEach(() => {
    ground = createWastelandGround();
  });

  describe('Ground Creation', () => {
    it('should create ground object', () => {
      expect(ground).toBeDefined();
      expect(ground).not.toBeNull();
      expect(ground.getGroup).toBeDefined();
    });

    it('should return a THREE.Group', () => {
      const group = ground.getGroup();
      expect(group).toBeInstanceOf(THREE.Group);
    });

    it('should have ground mesh in group', () => {
      const group = ground.getGroup();
      let meshFound = false;
      
      group.traverse((child) => {
        if (child.isMesh) {
          meshFound = true;
        }
      });
      
      expect(meshFound).toBe(true);
    });
    
    it('should create ground with proper geometry', () => {
      const group = ground.getGroup();
      let groundMesh = null;
      
      group.traverse((child) => {
        if (child.isMesh && child.geometry) {
          groundMesh = child;
        }
      });
      
      expect(groundMesh).not.toBeNull();
      expect(groundMesh.geometry).toBeDefined();
    });
    
    it('should position ground at y=0', () => {
      const group = ground.getGroup();
      expect(group.position.y).toBe(0);
    });
  });
  
  describe('Ground Rendering Properties', () => {
    it('should have visible material', () => {
      const group = ground.getGroup();
      let groundMesh = null;
      
      group.traverse((child) => {
        if (child.isMesh) {
          groundMesh = child;
        }
      });
      
      expect(groundMesh).not.toBeNull();
      expect(groundMesh.material).toBeDefined();
      expect(groundMesh.visible).toBe(true);
      
      // Check material properties
      if (groundMesh.material.transparent) {
        expect(groundMesh.material.opacity).toBeGreaterThan(0);
      }
    });
    
    it('should have grid if opacity > 0', () => {
      // Default opacity is 0.2
      const group = ground.getGroup();
      let gridFound = false;
      
      group.traverse((child) => {
        if (child.type === 'LineSegments') {
          gridFound = true;
        }
      });
      
      expect(gridFound).toBe(true);
    });
  });
  
  describe('SceneManager Ground Integration', () => {
    it('should add ground to scene in SceneManager', () => {
      // We'll just check the SceneManager code directly
      const fs = require('fs');
      const sceneManagerCode = fs.readFileSync('./src/lib/components/SceneManager.js', 'utf8');
      
      // Check that ground is created
      expect(sceneManagerCode).toContain('createWastelandGround');
      // Check that ground is added to scene
      expect(sceneManagerCode).toContain('scene.add');
      expect(sceneManagerCode).toContain('ground.getGroup()');
    });
  });
});