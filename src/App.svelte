<script>
  import { onMount } from 'svelte';
  import DesertScene from './lib/DesertScene.svelte';
  import Coordinates from './lib/Coordinates.svelte';
  import RitualCursor from './lib/RitualCursor.svelte';

  let mounted = false;

  onMount(() => {
    mounted = true;
  });
</script>

<main>
  {#if mounted}
    <DesertScene />
    <Coordinates />
    <RitualCursor />
  {/if}
</main>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    cursor: none;
  }

  :global(body) {
    background: #000;
    overflow: hidden;
    font-family: 'Courier New', monospace;
  }

  main {
    width: 100vw;
    height: 100vh;
    position: relative;
  }
</style>