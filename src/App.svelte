<script>
  import { onMount } from 'svelte';
  import SaturnianCube from './lib/SaturnianCube.svelte';
  import { sceneStore, actions } from './lib/store.js';

  let mounted = false;
  let magicMode = false;

  onMount(() => {
    mounted = true;
    
    // Check for magic word in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('magic_word') === 'abracadabra') {
      magicMode = true;
      // Enable all secrets for testing
      sceneStore.dispatch(actions.unlockCubeSecret());
      sceneStore.dispatch(actions.unlockSaturnSecret());
      sceneStore.dispatch(actions.unlockTrinitySecret());
    }
    
    // Set initial status to ready
    sceneStore.dispatch(actions.setStatus('ready'));
    sceneStore.dispatch(actions.setLoading(false));
  });
  
  function handleSecretActivated() {
    // Event handler for secret activation
  }
</script>

<main>
  {#if mounted}
    <!-- SaturnianCube handles all scene states internally for now -->
    <div class="scene-container">
      <SaturnianCube on:secretActivated={handleSecretActivated} {magicMode} />
    </div>
  {/if}
</main>

<style>
  main {
    width: 100vw;
    height: 100vh;
    position: relative;
  }
  
  .scene-container {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
  
  .fade-out {
    animation: fadeOut 2s forwards;
  }
  
  .fade-in {
    animation: fadeIn 2s forwards;
  }
  
  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>