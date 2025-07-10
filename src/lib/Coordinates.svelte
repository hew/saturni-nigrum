<script>
  import { onMount } from 'svelte';
  
  let lat = '0.00';
  let lng = '0.00';

  onMount(() => {
    const handleMouseMove = (event) => {
      const { mouseX, mouseY } = event.detail;
      lat = (90 - (mouseY + 1) * 90).toFixed(2);
      lng = (mouseX * 180).toFixed(2);
    };

    window.addEventListener('mousemove-coords', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove-coords', handleMouseMove);
    };
  });
</script>

<div class="coordinates">
  {lat}°N {lng}°E
</div>

<style>
  .coordinates {
    position: fixed;
    top: 20px;
    right: 20px;
    color: #b8860b;
    font-size: 12px;
    letter-spacing: 2px;
    pointer-events: none;
    font-family: 'Courier New', monospace;
    z-index: 10;
  }
</style>