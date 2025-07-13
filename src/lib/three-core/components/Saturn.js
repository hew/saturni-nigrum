/**
 * Saturn Component
 * Reusable Saturn planet with rings for consistent rendering
 */

import * as THREE from 'three';
import { COLORS } from '../utils/Constants.js';

export class Saturn {
  constructor(options = {}) {
    this.options = {
      // Planet properties
      radius: 10,
      position: [0, 10, 0],
      color: COLORS.SATURN_GOLD,
      emissive: COLORS.SATURN_EMISSIVE,
      emissiveIntensity: 0.1,
      shininess: 30,
      specular: COLORS.SATURN_SPECULAR,
      
      // Ring system
      rings: [
        { inner: 15, outer: 18, opacity: 0.8 },
        { inner: 19, outer: 22, opacity: 0.8 },
        { inner: 23, outer: 28, opacity: 0.8 }
      ],
      
      // Ring properties
      ringColor: 0x0a0a0a,
      ringEdgeColor: 0x1a1a1a,
      ringTilt: -26.7 * Math.PI / 180, // Real Saturn tilt
      
      // Animation
      rotationSpeed: 0.05,
      wobbleSpeed: 0.3,
      wobbleIntensity: 0.02,
      
      // Shadows
      castShadow: true,
      receiveShadow: false,
      
      // Geometry detail
      segments: {
        widthSegments: 32,
        heightSegments: 24,
        ringSegments: 64
      },
      
      // Override defaults
      ...options
    };
    
    this.group = new THREE.Group();
    this.saturn = null;
    this.rings = null;
    this.time = 0;
    
    this._createSaturn();
    this._createRings();
    this._positionGroup();
  }
  
  _createSaturn() {
    const geometry = new THREE.SphereGeometry(
      this.options.radius,
      this.options.segments.widthSegments,
      this.options.segments.heightSegments
    );
    
    const material = new THREE.MeshPhongMaterial({
      color: this.options.color,
      emissive: this.options.emissive,
      emissiveIntensity: this.options.emissiveIntensity,
      shininess: this.options.shininess,
      specular: this.options.specular
    });
    
    this.saturn = new THREE.Mesh(geometry, material);
    this.saturn.castShadow = this.options.castShadow;
    this.saturn.receiveShadow = this.options.receiveShadow;
    
    this.group.add(this.saturn);
  }
  
  _createRings() {
    const ringGroup = new THREE.Group();
    
    this.options.rings.forEach(ringConfig => {
      // Create ring geometry
      const ringGeometry = new THREE.RingGeometry(
        ringConfig.inner,
        ringConfig.outer,
        this.options.segments.ringSegments,
        1
      );
      
      // Ring material
      const ringMaterial = new THREE.MeshPhongMaterial({
        color: this.options.ringColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: ringConfig.opacity
      });
      
      const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
      ringMesh.rotation.x = -Math.PI / 2; // Lay flat
      ringGroup.add(ringMesh);
      
      // Ring edges for definition
      const edgesGeometry = new THREE.EdgesGeometry(ringGeometry);
      const edgesMaterial = new THREE.LineBasicMaterial({
        color: this.options.ringEdgeColor,
        transparent: true,
        opacity: 1.0
      });
      
      const ringEdges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      ringEdges.rotation.x = -Math.PI / 2;
      ringGroup.add(ringEdges);
    });
    
    // Apply Saturn's ring tilt
    ringGroup.rotation.x = this.options.ringTilt;
    
    this.rings = ringGroup;
    this.group.add(this.rings);
  }
  
  _positionGroup() {
    const [x, y, z] = this.options.position;
    this.group.position.set(x, y, z);
  }
  
  // Public methods
  update(deltaTime) {
    this.time += deltaTime;
    
    // Rotate Saturn
    if (this.saturn) {
      this.saturn.rotation.y += this.options.rotationSpeed * deltaTime;
    }
    
    // Subtle ring wobble
    if (this.rings) {
      this.rings.rotation.z = Math.sin(this.time * this.options.wobbleSpeed) * this.options.wobbleIntensity;
    }
  }
  
  getGroup() {
    return this.group;
  }
  
  getSaturn() {
    return this.saturn;
  }
  
  getRings() {
    return this.rings;
  }
  
  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }
  
  setRotationSpeed(speed) {
    this.options.rotationSpeed = speed;
  }
  
  setWobbleProperties(speed, intensity) {
    this.options.wobbleSpeed = speed;
    this.options.wobbleIntensity = intensity;
  }
  
  dispose() {
    // Dispose of geometries and materials
    if (this.saturn) {
      this.saturn.geometry.dispose();
      this.saturn.material.dispose();
    }
    
    if (this.rings) {
      this.rings.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    }
  }
}

// Factory function
export const createSaturn = (options = {}) => {
  return new Saturn(options);
};