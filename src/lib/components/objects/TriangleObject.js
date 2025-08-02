import * as THREE from 'three';

export class TriangleObject {
  constructor(scene, tubeRadius = 0.025) {
    this.scene = scene;
    this.tubeRadius = tubeRadius;
    this.triangle = null;
    this.edges = [];
    
    // Breath state
    this.breathStartTime = 0;
    this.breathPhase = 'inhale';
    this.breathCounter = 0;
    this.lastBreathUpdate = 0;
    this.triangleGlowActive = false;
    
    // Glow effect management
    this.glowTimeout = null;
    this.lastClickCycle = -1; // Track which cycle was last clicked to prevent rapid clicks
  }

  create() {
    // Create a perfect 2D equilateral triangle
    const triangleShape = new THREE.Shape();
    const size = 14.4; // 44% bigger than cube/saturn
    const height = size * Math.sqrt(3) / 2;
    
    // Draw triangle centered at origin
    triangleShape.moveTo(0, height * 2/3);
    triangleShape.lineTo(-size/2, -height * 1/3);
    triangleShape.lineTo(size/2, -height * 1/3);
    triangleShape.closePath();
    
    // Use ShapeGeometry for perfect 2D appearance
    const geometry = new THREE.ShapeGeometry(triangleShape);
    
    // Pure black material with no lighting response
    const material = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.DoubleSide
    });
    
    this.triangle = new THREE.Mesh(geometry, material);
    this.triangle.position.y = 15; // Same height as cube/saturn
    this.triangle.visible = false;
    
    // Add thick edge outline
    this.createEdges(size, height);
    
    this.scene.add(this.triangle);
    return this.triangle;
  }

  createEdges(size, height) {
    const trianglePoints = [
      new THREE.Vector3(0, height * 2/3, 0),
      new THREE.Vector3(-size/2, -height * 1/3, 0),
      new THREE.Vector3(size/2, -height * 1/3, 0),
      new THREE.Vector3(0, height * 2/3, 0) // Close the triangle
    ];
    
    for (let i = 0; i < trianglePoints.length - 1; i++) {
      const start = trianglePoints[i];
      const end = trianglePoints[i + 1];
      const direction = end.clone().sub(start);
      const length = direction.length();
      
      const tubeGeometry = new THREE.CylinderGeometry(this.tubeRadius, this.tubeRadius, length, 8);
      // Use MeshStandardMaterial to support emissive glow
      const tubeMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        emissive: 0x000000,
        emissiveIntensity: 0
      });
      const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
      
      // Position and orient the tube
      tube.position.copy(start.clone().add(end).multiplyScalar(0.5));
      tube.lookAt(end);
      tube.rotateX(Math.PI / 2);
      
      this.triangle.add(tube);
      this.edges.push(tube);
    }
  }

  updateBreath() {
    const currentTime = Date.now();
    if (this.breathStartTime === 0) {
      this.breathStartTime = currentTime;
      this.lastClickCycle = -1; // Reset cycle tracking when breath restarts
    }
    
    const elapsed = (currentTime - this.breathStartTime) / 1000; // seconds
    const cycleDuration = 6; // 3 seconds inhale + 3 seconds exhale
    const phaseTime = elapsed % cycleDuration;
    
    // Update breath phase
    const newPhase = phaseTime < 3 ? 'inhale' : 'exhale';
    if (newPhase !== this.breathPhase) {
      this.breathPhase = newPhase;
    }
    
    // Triangle breathing effect with dramatic color change
    if (this.triangle && this.edges.length > 0) {
      // Use smooth sine wave for natural breathing
      const breathWave = Math.sin((elapsed / cycleDuration) * Math.PI * 2);
      const breathIntensity = 0.5 + (breathWave * 0.5); // 0 to 1
      
      this.edges.forEach((edge, index) => {
        if (edge.material) {
          if (this.triangleGlowActive) {
            // Show golden glow when perfect timing is hit
            edge.material.color.setHex(0xFFD700); // Gold color
            edge.material.emissive = new THREE.Color(0xFFD700);
            edge.material.emissiveIntensity = 0.5;
          } else {
            // Normal breathing animation
            const r = Math.floor(0x33 + (breathIntensity * (0xFF - 0x33)));
            const g = Math.floor(0x33 + (breathIntensity * (0xFF - 0x33)));
            const b = Math.floor(0x33 + (breathIntensity * (0xFF - 0x33)));
            const color = (r << 16) | (g << 8) | b;
            
            edge.material.color.setHex(color);
            edge.material.emissive = new THREE.Color(0x000000);
            edge.material.emissiveIntensity = 0;
          }
        }
      });
    }
    
    return this.breathPhase;
  }

  checkBreathClick() {
    // Check if click is perfectly timed with breath peak
    const currentTime = Date.now();
    const elapsed = (currentTime - this.breathStartTime) / 1000;
    const cycleDuration = 6;
    const phaseTime = elapsed % cycleDuration;
    const currentCycle = Math.floor(elapsed / cycleDuration);
    
    // Peak of inhale is at 1.5 seconds into the cycle
    const isPeakMoment = phaseTime >= 1.3 && phaseTime <= 1.7; // 0.4 second window
    
    if (isPeakMoment) {
      // Prevent multiple clicks in the same cycle
      if (currentCycle === this.lastClickCycle) {
        return false; // Already clicked in this cycle
      }
      
      this.lastClickCycle = currentCycle;
      this.breathCounter++;
      
      // Activate glow effect
      this.triangleGlowActive = true;
      
      // Clear any existing timeout
      if (this.glowTimeout) {
        clearTimeout(this.glowTimeout);
      }
      
      // Set new timeout for glow effect
      this.glowTimeout = setTimeout(() => {
        this.triangleGlowActive = false;
        this.glowTimeout = null;
      }, 500);
      
      // Check if we've reached trinity (3 perfect breaths)
      if (this.breathCounter >= 3) {
        this.breathCounter = 0; // Reset for next time
        this.lastClickCycle = -1; // Reset cycle tracking
        return true; // Trinity achieved!
      }
    } else {
      // Wrong timing - reset counter
      this.breathCounter = 0;
      this.lastClickCycle = -1;
      
      // Clear glow if active
      if (this.triangleGlowActive) {
        this.triangleGlowActive = false;
        if (this.glowTimeout) {
          clearTimeout(this.glowTimeout);
          this.glowTimeout = null;
        }
      }
    }
    
    return false;
  }

  lookAtCamera(cameraPosition) {
    if (this.triangle) {
      this.triangle.lookAt(cameraPosition);
    }
  }

  show() {
    if (this.triangle) {
      this.triangle.visible = true;
      this.breathStartTime = 0; // Reset breath cycle
      this.breathCounter = 0; // Reset counter
      this.lastClickCycle = -1; // Reset cycle tracking
      this.triangleGlowActive = false; // Ensure glow is off
    }
  }

  hide() {
    if (this.triangle) {
      this.triangle.visible = false;
    }
  }

  setTubeRadius(radius) {
    this.tubeRadius = radius;
    // Would need to recreate edges with new radius
  }

  dispose() {
    // Clear any active timeout
    if (this.glowTimeout) {
      clearTimeout(this.glowTimeout);
      this.glowTimeout = null;
    }
    
    this.edges.forEach(edge => {
      edge.geometry.dispose();
      edge.material.dispose();
    });
    
    if (this.triangle) {
      this.triangle.geometry.dispose();
      this.triangle.material.dispose();
      this.scene.remove(this.triangle);
    }
    
    this.edges = [];
    this.triangle = null;
  }
}