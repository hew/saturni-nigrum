<script>
  import { onMount } from 'svelte';
  
  let x = 0;
  let y = 0;

  onMount(() => {
    const handleMouseMove = (event) => {
      x = event.clientX;
      y = event.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  });
</script>

<div class="ritual-cursor" style="left: {x}px; top: {y}px;">
  <span class="cursor-symbol">⊹</span>
</div>

<style>
  .ritual-cursor {
    position: fixed;
    width: 30px;
    height: 30px;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
  }

  .cursor-symbol {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 24px;
    color: #fff;
    mix-blend-mode: difference;
    animation: rotate 4s linear infinite;
  }

  @keyframes rotate {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }
</style>