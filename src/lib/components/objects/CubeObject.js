import * as THREE from 'three';

export class CubeObject {
  constructor(scene, tubeRadius = 0.025) {
    this.scene = scene;
    this.tubeRadius = tubeRadius;
    this.cube = null;
    this.cubeEdges = [];
    this.targetCubeOpacity = 1.0;
    this.currentCubeOpacity = 1.0;
  }

  create() {
    // Main cube - pure black but can become transparent
    const cubeGeometry = new THREE.BoxGeometry(10, 10, 10);
    const cubeMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
      emissive: 0x000000,
      shininess: 100,
      specular: 0x111111,
      transparent: true,
      opacity: 1.0
    });
    
    this.cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    this.cube.position.y = 15; // Floating above ground
    this.scene.add(this.cube);

    // Create individual edges for depth-based rendering
    this.createIndividualEdges(cubeGeometry);
    
    return this.cube;
  }

  createIndividualEdges(geometry) {
    // Define vertices of the cube
    const vertices = [
      new THREE.Vector3(-5, -5, -5), // 0
      new THREE.Vector3( 5, -5, -5), // 1
      new THREE.Vector3( 5,  5, -5), // 2
      new THREE.Vector3(-5,  5, -5), // 3
      new THREE.Vector3(-5, -5,  5), // 4
      new THREE.Vector3( 5, -5,  5), // 5
      new THREE.Vector3( 5,  5,  5), // 6
      new THREE.Vector3(-5,  5,  5), // 7
    ];
    
    // Define all 12 edges
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // back face
      [4, 5], [5, 6], [6, 7], [7, 4], // front face
      [0, 4], [1, 5], [2, 6], [3, 7], // connecting edges
    ];
    
    // Create individual edge lines using tube geometry for proper thickness
    edges.forEach(edge => {
      const start = vertices[edge[0]];
      const end = vertices[edge[1]];
      const direction = end.clone().sub(start);
      const length = direction.length();
      
      // Create tube geometry for thick lines
      const tubeGeometry = new THREE.CylinderGeometry(this.tubeRadius, this.tubeRadius, length, 8);
      const tubeMaterial = new THREE.MeshBasicMaterial({
        color: 0x888888  // Mid-gray between current dark and bright white
      });
      const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
      
      // Position and orient the tube
      tube.position.copy(start.clone().add(end).multiplyScalar(0.5));
      tube.lookAt(end);
      tube.rotateX(Math.PI / 2);
      
      this.cube.add(tube);
      this.cubeEdges.push(tube);
    });
  }

  updateAppearance(cameraPosition, state) {
    if (!state.showCube || !this.cube) return;

    // Update cube opacity smoothly
    if (state.saturnTimingActive && !state.saturnSecretUnlocked) {
      this.targetCubeOpacity = 0.5;
    } else {
      this.targetCubeOpacity = 1.0;
    }
    
    const opacityDelta = this.targetCubeOpacity - this.currentCubeOpacity;
    this.currentCubeOpacity += opacityDelta * 0.1;
    this.cube.material.opacity = this.currentCubeOpacity;

    // Update cube rotation
    if (!state.showSaturn && !state.cubeIsHexagon && state.autoRotate) {
      this.cube.rotation.x += 0.003;
      this.cube.rotation.y += 0.005;
    }

    // Update edge visibility based on camera position
    this.updateEdgeVisibility(cameraPosition);

    // Handle yellow edge animation if secret is unlocked
    if (state.cubeSecretUnlocked && state.yellowEdgeStartTime > 0) {
      this.animateYellowEdge(state.yellowEdgeStartTime, state.yellowEdgeDuration);
    }
  }

  updateEdgeVisibility(cameraPosition) {
    const cubeWorldPos = new THREE.Vector3();
    this.cube.getWorldPosition(cubeWorldPos);
    const viewDirection = cameraPosition.clone().sub(cubeWorldPos).normalize();

    // Store edge visibility for yellow edge animation
    this.edgeVisibility = [];

    this.cubeEdges.forEach((edge, index) => {
      const edgeWorldPos = new THREE.Vector3();
      edge.getWorldPosition(edgeWorldPos);
      const edgeDirection = edgeWorldPos.clone().sub(cubeWorldPos).normalize();
      
      // Dot product tells us if edge is facing camera
      const dotProduct = edgeDirection.dot(viewDirection);
      
      // Edges facing camera should be bright, edges facing away should be dark
      // Adjusted for better front/back contrast
      const brightness = dotProduct > -0.2 ? 0.9 : 0.3;
      const color = new THREE.Color(brightness, brightness, brightness);
      
      edge.material.color = color;
      edge.material.opacity = 1.0;
      
      this.edgeVisibility.push(dotProduct > -0.2);
    });
  }

  animateYellowEdge(startTime, duration) {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1.0);
    
    // Animate through each edge sequentially
    const edgeCount = this.cubeEdges.length;
    const activeEdgeIndex = Math.floor(progress * edgeCount);
    
    this.cubeEdges.forEach((edge, index) => {
      if (index === activeEdgeIndex && progress < 1.0) {
        // Current active edge - bright yellow
        edge.material.color = new THREE.Color(1.0, 1.0, 0.0);
        edge.material.emissive = new THREE.Color(0.5, 0.5, 0.0);
      } else if (index < activeEdgeIndex) {
        // Already animated edges - fading yellow
        const fadeFactor = 1.0 - (activeEdgeIndex - index) / edgeCount;
        edge.material.color = new THREE.Color(
          0.9 * fadeFactor + 0.1,
          0.9 * fadeFactor + 0.1,
          0.1
        );
      }
    });
  }

  transformToHexagon() {
    // This method would handle the hexagon transformation
    // For now, just setting visibility
    this.cube.visible = false;
    this.cubeEdges.forEach(edge => edge.visible = false);
  }

  restoreFromHexagon() {
    this.cube.visible = true;
    this.cubeEdges.forEach(edge => edge.visible = true);
  }

  setRotation(x, y, z) {
    if (this.cube) {
      this.cube.rotation.set(x, y, z);
    }
  }

  setTubeRadius(radius) {
    this.tubeRadius = radius;
    // Would need to recreate edges with new radius
  }

  dispose() {
    // Cleanup
    this.cubeEdges.forEach(edge => {
      edge.geometry.dispose();
      edge.material.dispose();
      this.cube.remove(edge);
    });
    
    if (this.cube) {
      this.cube.geometry.dispose();
      this.cube.material.dispose();
      this.scene.remove(this.cube);
    }
    
    this.cubeEdges = [];
    this.cube = null;
  }
}