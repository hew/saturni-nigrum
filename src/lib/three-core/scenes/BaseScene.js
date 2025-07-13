/**
 * Abstract Base Scene Class
 * Provides common Three.js scene setup and management functionality
 */

import * as THREE from 'three';
import { CAMERA, COLORS } from '../utils/Constants.js';
import { LightingSystem } from '../systems/LightingSystem.js';
import { Ground } from '../components/Ground.js';

export class BaseScene {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.options = {
      // Default configuration
      cameraType: 'perspective',
      enableShadows: true,
      enablePostProcessing: false,
      backgroundColor: COLORS.SCENE_BACKGROUND,
      pixelRatio: window.devicePixelRatio,
      antialias: true,
      alpha: false,
      
      // Camera defaults
      fov: CAMERA.FOV,
      near: CAMERA.NEAR,
      far: CAMERA.FAR,
      
      // Ground defaults
      groundType: 'desert',
      showGround: true,
      
      // Lighting defaults
      lightingPreset: 'standard',
      
      // Override any defaults
      ...options
    };
    
    // Core Three.js objects
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.composer = null; // For post-processing
    
    // Systems
    this.lightingSystem = null;
    this.ground = null;
    
    // Animation
    this.animationId = null;
    this.time = 0;
    this.deltaTime = 0;
    this.lastTime = 0;
    
    // Event handlers
    this.resizeHandler = this.handleResize.bind(this);
    
    this._init();
  }
  
  _init() {
    this._createScene();
    this._createCamera();
    this._createRenderer();
    this._createGround();
    this._createLighting();
    
    if (this.options.enablePostProcessing) {
      this._setupPostProcessing();
    }
    
    this._setupEventListeners();
    
    // Call subclass initialization
    this.onInit();
  }
  
  _createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.options.backgroundColor);
  }
  
  _createCamera() {
    if (this.options.cameraType === 'orthographic') {
      const aspect = window.innerWidth / window.innerHeight;
      const size = 50;
      this.camera = new THREE.OrthographicCamera(
        -size * aspect, size * aspect,
        size, -size,
        this.options.near, this.options.far
      );
    } else {
      this.camera = new THREE.PerspectiveCamera(
        this.options.fov,
        window.innerWidth / window.innerHeight,
        this.options.near,
        this.options.far
      );
    }
    
    // Set default camera position (will be overridden by subclasses)
    this.camera.position.set(...CAMERA.DESERT_POSITION);
    this.camera.lookAt(0, 0, 0);
  }
  
  _createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: this.options.antialias,
      alpha: this.options.alpha
    });
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(this.options.pixelRatio);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.sortObjects = true;
    this.renderer.autoClear = true;
    
    if (this.options.enableShadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
  }
  
  _createGround() {
    if (!this.options.showGround) return;
    
    this.ground = new Ground({
      type: this.options.groundType,
      receiveShadow: this.options.enableShadows
    });
    
    this.scene.add(this.ground.getGroup());
  }
  
  _createLighting() {
    this.lightingSystem = new LightingSystem(this.scene, {
      preset: this.options.lightingPreset,
      enableShadows: this.options.enableShadows
    });
  }
  
  _setupPostProcessing() {
    // Subclasses can override this for custom post-processing
    try {
      const { EffectComposer } = require('three/examples/jsm/postprocessing/EffectComposer.js');
      const { RenderPass } = require('three/examples/jsm/postprocessing/RenderPass.js');
      
      this.composer = new EffectComposer(this.renderer);
      const renderPass = new RenderPass(this.scene, this.camera);
      this.composer.addPass(renderPass);
    } catch (error) {
      console.warn('Post-processing not available:', error);
      this.options.enablePostProcessing = false;
    }
  }
  
  _setupEventListeners() {
    window.addEventListener('resize', this.resizeHandler);
  }
  
  // Event handlers
  handleResize() {
    if (this.camera.isPerspectiveCamera) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
    } else if (this.camera.isOrthographicCamera) {
      const aspect = window.innerWidth / window.innerHeight;
      const size = 50;
      this.camera.left = -size * aspect;
      this.camera.right = size * aspect;
      this.camera.top = size;
      this.camera.bottom = -size;
    }
    
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    if (this.composer) {
      this.composer.setSize(window.innerWidth, window.innerHeight);
    }
    
    // Call subclass resize handler
    this.onResize();
  }
  
  // Animation loop
  start() {
    if (this.animationId) return; // Already running
    
    this.lastTime = performance.now();
    this._animate();
  }
  
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  _animate() {
    this.animationId = requestAnimationFrame(() => this._animate());
    
    const currentTime = performance.now();
    this.deltaTime = (currentTime - this.lastTime) * 0.001; // Convert to seconds
    this.time += this.deltaTime;
    this.lastTime = currentTime;
    
    // Call subclass update
    this.onUpdate(this.deltaTime, this.time);
    
    // Render
    if (this.composer && this.options.enablePostProcessing) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  // Public methods
  setGroundVisibility(visible) {
    if (this.ground) {
      this.ground.getGroup().visible = visible;
    }
  }
  
  setGridVisibility(visible) {
    if (this.ground) {
      this.ground.setGridVisibility(visible);
    }
  }
  
  setShadowsEnabled(enabled) {
    this.renderer.shadowMap.enabled = enabled;
    if (this.lightingSystem) {
      this.lightingSystem.setShadowsEnabled(enabled);
    }
  }
  
  // Getters
  getScene() {
    return this.scene;
  }
  
  getCamera() {
    return this.camera;
  }
  
  getRenderer() {
    return this.renderer;
  }
  
  getLightingSystem() {
    return this.lightingSystem;
  }
  
  getGround() {
    return this.ground;
  }
  
  // Cleanup
  dispose() {
    this.stop();
    
    window.removeEventListener('resize', this.resizeHandler);
    
    if (this.lightingSystem) {
      this.lightingSystem.dispose();
    }
    
    if (this.ground) {
      this.ground.dispose();
    }
    
    if (this.composer) {
      this.composer.dispose();
    }
    
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    // Call subclass cleanup
    this.onDispose();
  }
  
  // Abstract methods - subclasses must implement
  onInit() {
    // Override in subclasses for custom initialization
  }
  
  onUpdate(deltaTime, time) {
    // Override in subclasses for custom animation
  }
  
  onResize() {
    // Override in subclasses for custom resize handling
  }
  
  onDispose() {
    // Override in subclasses for custom cleanup
  }
}

// Utility function to create a basic scene quickly
export const createBaseScene = (canvas, options = {}) => {
  return new BaseScene(canvas, options);
};