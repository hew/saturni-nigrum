import * as THREE from 'three';
import { CubeObject } from './objects/CubeObject.js';
import { SaturnObject } from './objects/SaturnObject.js';
import { TriangleObject } from './objects/TriangleObject.js';
import { FlowerOfLife } from './objects/FlowerOfLife.js';
import { createWastelandGround } from '../three-core/components/Ground.js';
import { LIGHTING } from '../three-core/utils/Constants.js';

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    
    // Objects
    this.cubeObject = null;
    this.saturnObject = null;
    this.triangleObject = null;
    this.flowerObject = null;
    this.ground = null;
    
    // Constants
    this.PHI = (1 + Math.sqrt(5)) / 2;
    this.cubeEdge = 10;
  }

  init() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // Camera with responsive FOV
    const isMobileDevice = window.innerWidth < 768;
    const baseFOV = isMobileDevice ? 60 : 45;
    this.camera = new THREE.PerspectiveCamera(
      baseFOV, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    this.camera.position.set(30, 20, 30);
    this.camera.lookAt(0, 10, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas, 
      antialias: true,
      alpha: false,
      precision: 'highp',
      logarithmicDepthBuffer: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = false;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Create lighting
    this.createLighting();
    
    // Create ground
    this.ground = createWastelandGround();
    this.scene.add(this.ground.getGroup());

    return {
      scene: this.scene,
      camera: this.camera,
      renderer: this.renderer
    };
  }

  createLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(
      LIGHTING.AMBIENT.color, 
      LIGHTING.AMBIENT.intensity
    );
    this.scene.add(ambientLight);

    // Directional light (moon)
    const directionalLight = new THREE.DirectionalLight(
      LIGHTING.DIRECTIONAL.color,
      LIGHTING.DIRECTIONAL.intensity
    );
    directionalLight.position.copy(LIGHTING.DIRECTIONAL.position);
    this.scene.add(directionalLight);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0x444466, 0.3);
    rimLight.position.set(-30, 40, -30);
    this.scene.add(rimLight);
  }

  createObjects(tubeRadius = 0.025) {
    // Create cube
    this.cubeObject = new CubeObject(this.scene, tubeRadius);
    const cube = this.cubeObject.create();

    // Create saturn
    this.saturnObject = new SaturnObject(this.scene, tubeRadius);
    const { saturn, rings } = this.saturnObject.create();

    // Create triangle
    this.triangleObject = new TriangleObject(this.scene, tubeRadius);
    const triangle = this.triangleObject.create();

    // Create flower
    this.flowerObject = new FlowerOfLife(this.scene, tubeRadius);
    const flower = this.flowerObject.create();

    return {
      cube,
      saturn,
      saturnRings: rings,
      blackTriangle: triangle,
      flowerOfLife: flower
    };
  }

  updateCameraForDevice(isMobile) {
    const baseFOV = isMobile ? 60 : 45;
    this.camera.fov = baseFOV;
    this.camera.updateProjectionMatrix();
  }

  getCameraDistance(isMobile, aspectRatio) {
    let cameraDistance = this.cubeEdge * this.PHI * this.PHI;
    let cameraHeight = this.cubeEdge * this.PHI;
    
    if (isMobile) {
      const zoomFactor = aspectRatio < 1 ? 1.5 : 1.3;
      cameraDistance *= zoomFactor;
      cameraHeight *= zoomFactor;
    }
    
    return { distance: cameraDistance, height: cameraHeight };
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    const isMobile = window.innerWidth < 768;
    this.updateCameraForDevice(isMobile);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  setTubeRadius(radius) {
    if (this.cubeObject) this.cubeObject.setTubeRadius(radius);
    if (this.saturnObject) this.saturnObject.setTubeRadius(radius);
    if (this.triangleObject) this.triangleObject.setTubeRadius(radius);
    if (this.flowerObject) this.flowerObject.setTubeRadius(radius);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    if (this.ground) this.ground.dispose();
    if (this.cubeObject) this.cubeObject.dispose();
    if (this.saturnObject) this.saturnObject.dispose();
    if (this.triangleObject) this.triangleObject.dispose();
    if (this.flowerObject) this.flowerObject.dispose();
    if (this.renderer) this.renderer.dispose();
  }
}