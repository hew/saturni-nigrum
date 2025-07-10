<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { gsap } from 'gsap';
  import { PlanetarySystem } from './PlanetarySystem.js';

  let canvas;
  let scene, camera, renderer;
  let pyramid;
  let mouseX = 0, mouseY = 0;
  let planetarySystem;
  let planetMeshes = {};

  onMount(() => {
    init();
    animate();

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
      
      window.dispatchEvent(new CustomEvent('mousemove-coords', { 
        detail: { mouseX, mouseY } 
      }));
    };

    const handleResize = () => {
      const aspect = window.innerWidth / window.innerHeight;
      const frustumSize = 20;
      camera.left = frustumSize * aspect / -2;
      camera.right = frustumSize * aspect / 2;
      camera.top = frustumSize / 2;
      camera.bottom = frustumSize / -2;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  });

  function init() {
    scene = new THREE.Scene();
    
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 20;
    camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      1,
      1000
    );
    camera.position.set(0, 0, 30);
    camera.lookAt(0, 0, 0);
    
    renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    createPyramid();
    createLighting();
    createPlanets();
    animateIntro();
  }


  function createPyramid() {
    const geometry = new THREE.BufferGeometry();
    
    // Create perfect equilateral triangle - bigger size for orthographic view
    const size = 6;
    const height = size * Math.sqrt(3) / 2;
    
    const vertices = new Float32Array([
      0, height / 2, 0,           // Top vertex
      -size / 2, -height / 2, 0, // Bottom left
      size / 2, -height / 2, 0   // Bottom right
    ]);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide
    });
    
    pyramid = new THREE.Mesh(geometry, material);
    pyramid.position.set(0, 0, 0);
    
    scene.add(pyramid);
  }

  function createLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
  }

  function createPlanets() {
    // Initialize the planetary system
    planetarySystem = new PlanetarySystem();
    
    // Create 3D meshes for each planet
    Object.entries(planetarySystem.planets).forEach(([name, planet]) => {
      if (name === 'Sun') return; // Skip sun for now
      
      const geometry = new THREE.SphereGeometry(planet.size * 0.2, 16, 16);
      const material = new THREE.MeshBasicMaterial({ 
        color: planet.color 
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      planetMeshes[name] = mesh;
      scene.add(mesh);
    });
  }


  function animateIntro() {
    gsap.from(pyramid.scale, {
      x: 0,
      y: 0,
      z: 0,
      duration: 3,
      ease: "power2.out"
    });
    
    gsap.from(pyramid.rotation, {
      y: Math.PI * 4,
      duration: 3,
      ease: "power2.out"
    });
  }



  function animate() {
    requestAnimationFrame(animate);
    
    // Update planetary system with consistent speed
    if (planetarySystem) {
      // Much slower, realistic speed (about 1 day per 60 seconds)
      const timeSpeed = 1 / 60;
      
      // Update time in the planetary system
      planetarySystem.updateTime(timeSpeed);
      
      // Update planet positions in 3D space
      Object.entries(planetMeshes).forEach(([name, mesh]) => {
        const pos = planetarySystem.getPlanetPosition(name);
        
        // Scale and position above the triangle
        mesh.position.set(
          pos.x * 0.5, // Scale down X
          pos.y * 0.5 + 6, // Scale down Y and move above triangle
          pos.z * 0.5 // Scale down Z
        );
      });
    }
    
    renderer.render(scene, camera);
  }
</script>

<canvas bind:this={canvas}></canvas>

<style>
  canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
  }
</style>