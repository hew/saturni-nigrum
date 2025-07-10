<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { gsap } from 'gsap';

  let canvas;
  let scene, camera, renderer;
  let pyramid;
  let mouseX = 0, mouseY = 0;

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
    animateIntro();
  }


  function createPyramid() {
    const geometry = new THREE.ConeGeometry(4, 8, 4);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });
    
    pyramid = new THREE.Mesh(geometry, material);
    pyramid.position.y = 0;
    pyramid.rotation.y = Math.PI / 4;
    
    scene.add(pyramid);
  }

  function createLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
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