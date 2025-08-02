import * as THREE from 'three';

export class FlowerOfLife {
  constructor(scene, tubeRadius = 0.025) {
    this.scene = scene;
    this.tubeRadius = tubeRadius;
    this.flowerGroup = null;
    this.metatronCube = null;
    this.radius = 3;
    
    // Sacred order tracking
    this.metatronClicks = [];
    this.showMetatron = false;
    this.FRUIT_OF_LIFE_ORDER = [0, 1, 3, 5, 2, 4, 6, 7, 9, 11, 8, 10, 12];
    
    // Store circle data
    this.circleData = [];
    this.nodeMap = new Map();
  }

  create() {
    // Create group to hold all circles
    this.flowerGroup = new THREE.Group();
    const circles = [];
    
    // Create the pattern - center circle plus 6 surrounding circles
    // Center (ID: 0)
    const circle0 = this.createCircle(0, 0, 0, 0);
    const node0 = this.createClickableNode(0, 0, 0, 0);
    circles.push(circle0);
    circles.push(node0);
    this.nodeMap.set(0, { circle: circle0, node: node0 });
    this.circleData.push({ x: 0, y: 0, id: 0 });
    
    // Six circles around center (60 degree intervals) (IDs: 1-6)
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const x = Math.cos(angle) * this.radius;
      const y = Math.sin(angle) * this.radius;
      const circle = this.createCircle(x, y, 0, i + 1);
      const node = this.createClickableNode(x, y, 0, i + 1);
      circles.push(circle);
      circles.push(node);
      this.nodeMap.set(i + 1, { circle, node });
      this.circleData.push({ x, y, id: i + 1 });
    }
    
    // Second layer - 6 more circles (IDs: 7-12)
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6 + Math.PI / 6; // Offset by 30 degrees
      const x = Math.cos(angle) * this.radius * Math.sqrt(3);
      const y = Math.sin(angle) * this.radius * Math.sqrt(3);
      const circle = this.createCircle(x, y, 0, i + 7);
      const node = this.createClickableNode(x, y, 0, i + 7);
      circles.push(circle);
      circles.push(node);
      this.nodeMap.set(i + 7, { circle, node });
      this.circleData.push({ x, y, id: i + 7 });
    }
    
    // Store circle data and map for click detection
    this.flowerGroup.userData = { circles: this.circleData, nodeMap: this.nodeMap };
    
    // Add all circles to group
    circles.forEach(circle => {
      this.flowerGroup.add(circle);
    });
    
    // Position at same height as other objects
    this.flowerGroup.position.y = 15;
    this.flowerGroup.visible = false;
    
    this.scene.add(this.flowerGroup);
    
    return this.flowerGroup;
  }

  createCircle(x, y, z = 0, id) {
    const curve = new THREE.EllipseCurve(
      x, y,            // Center
      this.radius, this.radius,  // xRadius, yRadius
      0, 2 * Math.PI,  // Start angle, end angle
      false,           // clockwise
      0                // rotation
    );
    
    const points = curve.getPoints(64);
    
    // Create tube geometry for thick lines
    const tubeGeometry = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(
        points.map(p => new THREE.Vector3(p.x, p.y, z)),
        true // closed curve
      ),
      64,        // tubular segments
      this.tubeRadius * 0.8, // slightly thinner than other objects
      8,         // radial segments
      true       // closed
    );
    
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff  // White color for flower circles
    });
    
    const circle = new THREE.Mesh(tubeGeometry, material);
    circle.userData = { id, centerX: x, centerY: y, clicked: false };
    circle.name = `circle_${id}`;
    return circle;
  }

  createClickableNode(x, y, z = 0, id) {
    // Create an invisible sphere at the center for clicking
    const isMobile = window.innerWidth < 768;
    const nodeRadius = isMobile ? 1.0 : 0.5;
    const nodeGeometry = new THREE.SphereGeometry(nodeRadius, 16, 16);
    const nodeMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0 // Invisible but still clickable
    });
    
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    node.position.set(x, y, z);
    node.userData = { id, isNode: true };
    node.name = `node_${id}`;
    
    return node;
  }

  createMetatronsCube() {
    // Create Metatron's Cube by connecting all 13 centers
    this.metatronCube = new THREE.Group();
    
    const lineMaterial = new THREE.MeshBasicMaterial({
      color: 0xccaa00 // Golden color for the sacred geometry
    });
    
    // Connect every circle center to every other circle center
    for (let i = 0; i < this.circleData.length; i++) {
      for (let j = i + 1; j < this.circleData.length; j++) {
        const start = this.circleData[i];
        const end = this.circleData[j];
        
        const direction = new THREE.Vector3(
          end.x - start.x,
          end.y - start.y,
          0
        );
        const length = direction.length();
        
        if (length > 0) {
          const tubeGeometry = new THREE.CylinderGeometry(
            this.tubeRadius * 0.6, // Slightly thinner than flower circles
            this.tubeRadius * 0.6,
            length,
            8
          );
          
          const tube = new THREE.Mesh(tubeGeometry, lineMaterial);
          tube.position.set(
            (start.x + end.x) / 2,
            (start.y + end.y) / 2,
            0
          );
          
          // Orient the tube
          const axis = new THREE.Vector3(0, 1, 0);
          const quaternion = new THREE.Quaternion().setFromUnitVectors(
            axis,
            direction.normalize()
          );
          tube.quaternion.copy(quaternion);
          
          this.metatronCube.add(tube);
        }
      }
    }
    
    this.metatronCube.position.copy(this.flowerGroup.position);
    this.metatronCube.visible = false;
    this.scene.add(this.metatronCube);
  }

  handleClick(raycaster, isMobile = false) {
    if (this.showMetatron) return false;
    
    // Initialize Points params if needed
    if (!raycaster.params.Points) {
      raycaster.params.Points = {};
    }
    
    // On mobile, increase raycaster precision for smaller touch targets
    if (isMobile) {
      raycaster.params.Points.threshold = 0.1;
    }
    
    // Check intersections with flower circles
    const intersects = raycaster.intersectObjects(this.flowerGroup.children, true);
    
    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      
      // Check if we clicked a node
      let clickedNode = null;
      
      // Find the clicked node
      if (clickedObject.userData && clickedObject.userData.isNode) {
        clickedNode = clickedObject;
      } else {
        // Traverse up to find a node
        let obj = clickedObject;
        while (obj && obj.parent) {
          if (obj.userData && obj.userData.isNode) {
            clickedNode = obj;
            break;
          }
          obj = obj.parent;
        }
      }
      
      if (clickedNode && clickedNode.userData && clickedNode.userData.id !== undefined) {
        const clickedId = clickedNode.userData.id;
        
        // Check if this is the next circle in the sacred sequence
        const expectedId = this.FRUIT_OF_LIFE_ORDER[this.metatronClicks.length];
        
        if (clickedId === expectedId) {
          this.metatronClicks.push(clickedId);
          
          // Dim the clicked circle
          const nodeData = this.nodeMap.get(clickedId);
          if (nodeData && nodeData.circle && nodeData.circle.material) {
            nodeData.circle.material.color.setHex(0x666666);
          }
          
          // Check if sequence is complete
          if (this.metatronClicks.length === 13) {
            this.showMetatron = true;
            
            // Create Metatron's Cube if not already created
            if (!this.metatronCube) {
              this.createMetatronsCube();
            }
            
            // Animate the transformation
            setTimeout(() => {
              this.metatronCube.visible = true;
              this.flowerGroup.visible = false;
            }, 500);
            
            return true; // Pattern complete!
          }
          return true; // Correct click
        } else {
          // Wrong circle - reset
          this.reset();
          return false; // Wrong click
        }
      }
    }
    
    return false;
  }

  reset() {
    this.metatronClicks = [];
    this.showMetatron = false;
    // Reset all circle colors
    this.nodeMap.forEach((nodeData) => {
      if (nodeData.circle && nodeData.circle.material) {
        nodeData.circle.material.color.setHex(0xffffff); // Original white color
      }
    });
  }

  lookAtCamera(cameraPosition) {
    if (this.flowerGroup) {
      this.flowerGroup.lookAt(cameraPosition);
    }
    if (this.metatronCube && this.metatronCube.visible) {
      this.metatronCube.lookAt(cameraPosition);
    }
  }

  show() {
    if (this.flowerGroup) {
      this.flowerGroup.visible = true;
      this.reset(); // Reset pattern when shown
    }
  }

  hide() {
    if (this.flowerGroup) this.flowerGroup.visible = false;
    if (this.metatronCube) this.metatronCube.visible = false;
    this.showMetatron = false;
  }

  isShowingMetatron() {
    return this.showMetatron;
  }

  setTubeRadius(radius) {
    this.tubeRadius = radius;
    // Would need to recreate all circles with new radius
  }

  dispose() {
    // Cleanup flower circles
    if (this.flowerGroup) {
      this.flowerGroup.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      this.scene.remove(this.flowerGroup);
    }
    
    // Cleanup metatron cube
    if (this.metatronCube) {
      this.metatronCube.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      this.scene.remove(this.metatronCube);
    }
    
    this.flowerGroup = null;
    this.metatronCube = null;
    this.circleData = [];
    this.nodeMap.clear();
  }
}