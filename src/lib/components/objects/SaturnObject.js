import * as THREE from 'three';

export class SaturnObject {
  constructor(scene, tubeRadius = 0.025) {
    this.scene = scene;
    this.tubeRadius = tubeRadius;
    this.saturn = null;
    this.saturnRings = null;
    this.PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio
    
    // Saturn timing secret variables
    this.saturnCounter = 0;
    this.lastSixMoment = 0;
    this.saturnSecretUnlocked = false;
    this.triangleRevealed = false;
  }

  create() {
    // Sacred geometry: Saturn's radius = cube edge / PHI
    const cubeEdge = 10;
    const saturnRadius = cubeEdge / (2 * this.PHI); // ≈ 3.09
    
    // Sacred numbers: 32 segments (power of 2), 24 stacks (hours in day)
    const saturnGeometry = new THREE.SphereGeometry(saturnRadius, 32, 24);
    const saturnMaterial = new THREE.MeshPhongMaterial({
      color: 0x666666, // Brighter gray
      emissive: 0x2a2a2a, // Slightly brighter emission
      shininess: 30,
      specular: 0x4a4a4a
    });
    
    this.saturn = new THREE.Mesh(saturnGeometry, saturnMaterial);
    this.saturn.position.y = 15; // Same position as cube
    this.saturn.visible = false; // Hidden initially
    this.scene.add(this.saturn);

    // Create rings
    this.createRings(saturnRadius);
    
    return { saturn: this.saturn, rings: this.saturnRings };
  }

  createRings(saturnRadius) {
    const ringGroup = new THREE.Group();
    
    // Ring proportions based on PHI
    const rings = [
      { inner: saturnRadius * this.PHI, outer: saturnRadius * this.PHI * 1.2 },
      { inner: saturnRadius * this.PHI * 1.3, outer: saturnRadius * this.PHI * 1.5 },
      { inner: saturnRadius * this.PHI * 1.6, outer: saturnRadius * this.PHI * 2 }
    ];

    rings.forEach(ring => {
      // Ring surface
      const ringGeometry = new THREE.RingGeometry(ring.inner, ring.outer, 64, 1);
      const ringMaterial = new THREE.MeshPhongMaterial({
        color: 0x0a0a0a,
        emissive: 0x000000,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
      ringMesh.rotation.x = -Math.PI / 2;
      ringGroup.add(ringMesh);
      
      // Ring edges
      const edgeMaterial = new THREE.MeshBasicMaterial({
        color: 0x888888
      });
      
      // Inner edge
      const innerEdgeGeometry = new THREE.TorusGeometry(ring.inner, this.tubeRadius, 8, 32);
      const innerEdge = new THREE.Mesh(innerEdgeGeometry, edgeMaterial);
      innerEdge.rotation.x = -Math.PI / 2;
      ringGroup.add(innerEdge);
      
      // Outer edge
      const outerEdgeGeometry = new THREE.TorusGeometry(ring.outer, this.tubeRadius, 8, 32);
      const outerEdge = new THREE.Mesh(outerEdgeGeometry, edgeMaterial);
      outerEdge.rotation.x = -Math.PI / 2;
      ringGroup.add(outerEdge);
    });

    ringGroup.rotation.x = -26.7 * Math.PI / 180;
    ringGroup.position.y = 15;
    ringGroup.visible = false; // Hidden initially
    
    this.saturnRings = ringGroup;
    this.scene.add(this.saturnRings);
  }

  show() {
    if (this.saturn) this.saturn.visible = true;
    if (this.saturnRings) this.saturnRings.visible = true;
  }

  hide() {
    if (this.saturn) this.saturn.visible = false;
    if (this.saturnRings) this.saturnRings.visible = false;
  }

  animate(time) {
    if (!this.saturn || !this.saturnRings) return;
    
    // Saturn always auto-rotates
    this.saturn.rotation.y = time * 0.05;
    this.saturnRings.rotation.z = Math.sin(time * 0.3) * 0.02;
    this.saturnRings.rotation.x = -26.7 * (Math.PI / 180) + Math.cos(time * 0.25) * 0.03;
  }

  checkRotationSecret(autoRotate) {
    if (!this.saturn || autoRotate) return false;
    
    // Check for secret rotation combination
    const targetX = Math.PI * 0.666; // ~120 degrees (occult angle)
    const targetY = Math.PI * 1.333; // ~240 degrees
    
    const xError = Math.abs(this.saturn.rotation.x - targetX);
    const yError = Math.abs(this.saturn.rotation.y - targetY);
    
    // Very tight tolerance
    const tolerance = 0.05;
    const isAligned = xError < tolerance && yError < tolerance;
    
    if (isAligned) {
      const alignment = 1 - (xError + yError) / (tolerance * 2);
      return alignment > 0.95;
    }
    
    return false;
  }

  checkTimingSecret(currentTime) {
    // Saturn timing secret - must click when seconds contains digit 6
    const seconds = currentTime.getSeconds();
    const secondsStr = seconds.toString().padStart(2, '0');
    const containsSix = secondsStr.includes('6');
    
    if (!containsSix) {
      // Reset counter if clicked at wrong time
      this.saturnCounter = 0;
      this.lastSixMoment = seconds;
      return false;
    }
    
    // Prevent duplicate clicks in same second
    if (this.lastSixMoment === seconds) {
      return false;
    }
    
    // Valid click on a second containing 6
    this.lastSixMoment = seconds;
    this.saturnCounter++;
    
    if (this.saturnCounter >= 3) {
      this.saturnSecretUnlocked = true;
      return true;
    }
    
    return false;
  }
  
  getTimeArray(time) {
    // Format time as HH:MM:SS
    const timeString = time.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
    
    // Convert to array of characters with highlighting info
    return timeString.split('').map(char => {
      // Only highlight '6' in seconds position if counter is 0 (before first click)
      const isSix = char === '6' && this.saturnCounter === 0;
      return {
        char,
        isSix
      };
    });
  }
  
  shouldShowProgress(time) {
    // Only show progress counter when seconds contains 6 AND we have progress
    if (this.saturnCounter === 0) return false;
    
    const seconds = time.getSeconds();
    const secondsStr = seconds.toString().padStart(2, '0');
    return secondsStr.includes('6');
  }
  
  shouldShowTriangleButton() {
    return this.saturnSecretUnlocked;
  }
  
  shouldShowTriangle() {
    return this.triangleRevealed || false;
  }
  
  onTriangleButtonClick() {
    this.triangleRevealed = true;
  }

  setRotation(x, y) {
    if (this.saturn) {
      this.saturn.rotation.x = x;
      this.saturn.rotation.y = y;
    }
  }

  setTubeRadius(radius) {
    this.tubeRadius = radius;
    // Would need to recreate rings with new radius
  }

  dispose() {
    // Cleanup saturn
    if (this.saturn) {
      this.saturn.geometry.dispose();
      this.saturn.material.dispose();
      this.scene.remove(this.saturn);
    }
    
    // Cleanup rings
    if (this.saturnRings) {
      this.saturnRings.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      this.scene.remove(this.saturnRings);
    }
    
    this.saturn = null;
    this.saturnRings = null;
  }
}