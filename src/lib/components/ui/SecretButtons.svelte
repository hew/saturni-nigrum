<script>
  import { createEventDispatcher } from 'svelte';
  
  export let state;
  export let magicMode = false;
  
  const dispatch = createEventDispatcher();
  
  function handleButtonClick(action, event) {
    event.stopPropagation();
    dispatch(action);
  }
  
  function preventPropagation(event) {
    event.stopPropagation();
  }
</script>

<!-- Saturn button (shows when cube secret unlocked OR magic mode) -->
{#if state.cubeSecretUnlocked || magicMode}
<button 
  class="secret-button" 
  on:click={(e) => handleButtonClick('goToSaturn', e)}
  on:touchstart={preventPropagation}
  on:touchend={preventPropagation}
  on:mousedown={preventPropagation}
>
  ⬢
</button>
{/if}

<!-- Triangle button (shows when saturn secret unlocked OR magic mode) -->
{#if state.saturnSecretUnlocked || magicMode}
  <button 
    class="saturn-secret-button" 
    on:click={(e) => handleButtonClick('showTriangle', e)}
    on:touchstart={preventPropagation}
    on:touchend={preventPropagation}
    on:mousedown={preventPropagation}
  >
    △
  </button>
{/if}

<!-- Flower button (shows when trinity secret unlocked OR magic mode) -->
{#if state.trinitySecretUnlocked || magicMode}
  <button 
    class="trinity-secret-button" 
    on:click={(e) => handleButtonClick('showFlower', e)}
    on:touchstart={preventPropagation}
    on:touchend={preventPropagation}
    on:mousedown={preventPropagation}
  >
    ❀
  </button>
{/if}

<!-- Cube return button (only in magic mode) -->
{#if magicMode}
  <button 
    class="cube-return-button" 
    on:click={(e) => handleButtonClick('showCube', e)}
    on:touchstart={preventPropagation}
    on:touchend={preventPropagation}
    on:mousedown={preventPropagation}
  >
    ◼
  </button>
{/if}

<style>
  /* Base secret button styles */
  button {
    position: fixed;
    width: 50px;
    height: 50px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.8);
    color: rgba(255, 255, 255, 0.7);
    font-size: 24px;
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    z-index: 100;
  }
  
  button:hover {
    border-color: rgba(255, 255, 255, 0.5);
    color: rgba(255, 255, 255, 1);
    background: rgba(0, 0, 0, 0.9);
  }
  
  /* Saturn hexagon button */
  .secret-button {
    top: 20px;
    right: 20px;
    animation: subtle-glow 3s ease-in-out infinite;
  }
  
  .secret-button:hover {
    animation: hexagon-pulse 1s ease-in-out infinite;
  }
  
  /* Triangle button */
  .saturn-secret-button {
    top: 80px;
    right: 20px;
    color: rgba(147, 112, 219, 0.7);
    border-color: rgba(147, 112, 219, 0.2);
  }
  
  .saturn-secret-button:hover {
    color: rgba(147, 112, 219, 1);
    border-color: rgba(147, 112, 219, 0.5);
    text-shadow: 0 0 10px rgba(147, 112, 219, 0.8);
  }
  
  /* Flower button */
  .trinity-secret-button {
    top: 140px;
    right: 20px;
    color: rgba(255, 215, 0, 0.7);
    border-color: rgba(255, 215, 0, 0.2);
  }
  
  .trinity-secret-button:hover {
    color: rgba(255, 215, 0, 1);
    border-color: rgba(255, 215, 0, 0.5);
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
  }
  
  /* Cube return button */
  .cube-return-button {
    top: 200px;
    right: 20px;
    color: rgba(255, 255, 255, 0.7);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .cube-return-button:hover {
    color: rgba(255, 255, 255, 1);
    border-color: rgba(255, 255, 255, 0.5);
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
  }
  
  /* Animations */
  @keyframes subtle-glow {
    0%, 100% { 
      box-shadow: 0 0 5px rgba(255, 215, 0, 0.2);
    }
    50% { 
      box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
    }
  }
  
  @keyframes hexagon-pulse {
    0%, 100% { 
      transform: scale(1);
      box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    }
    50% { 
      transform: scale(1.1);
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
    }
  }
  
  /* Mobile adjustments */
  @media (max-width: 768px) {
    button {
      width: 45px;
      height: 45px;
      font-size: 20px;
    }
    
    .saturn-secret-button {
      top: 70px;
    }
    
    .trinity-secret-button {
      top: 125px;
    }
    
    .cube-return-button {
      top: 180px;
    }
  }
</style>