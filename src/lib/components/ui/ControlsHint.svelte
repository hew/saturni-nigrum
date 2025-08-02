<script>
  export let state;
  export let showMetatron = false;
  export let triangleGlowActive = false;
  export let breathPhase = 'inhale';
  export let currentTime = new Date();
  export let saturnCounter = 0;
  export let magicMode = false;

  // Helper function to split time into characters with highlighting
  function getTimeArray(time) {
    const timeString = time.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
    
    // Only highlight '6' in seconds if saturnCounter is 0
    const secondsStartIndex = 6; // HH:MM:SS - seconds start at index 6
    
    return timeString.split('').map((char, index) => {
      // Only highlight '6' in seconds position if counter is 0 (before first click)
      const isInSecondsPosition = index >= secondsStartIndex;
      const isSix = char === '6' && isInSecondsPosition && saturnCounter === 0;
      return {
        char,
        isSix
      };
    });
  }
</script>

<div class="controls-hint">
  {#if state.showFlower && !showMetatron}
    <!-- Extremely subtle hint for the initiated -->
    <p style="opacity: 0.3; font-size: 10px;">13</p>
  {:else if showMetatron}
    <!-- Metatron achieved -->
  {:else if state.showTriangle}
    <!-- Triangle breath ritual interface -->
    <p class="triangle-breath" class:success-glow={triangleGlowActive}>
      {breathPhase}
    </p>
  {:else if state.showSaturn}
    <!-- Saturn time secret interface -->
    <p class="saturn-time">
      {#each getTimeArray(currentTime) as timeChar}
        <span class:glowing-six={timeChar.isSix}>{timeChar.char}</span>
      {/each}
      {#if saturnCounter > 0 && currentTime.getSeconds().toString().padStart(2, '0').includes('6')}
        <span class="saturn-counter" class:complete={saturnCounter >= 3}>{'6'.repeat(saturnCounter)}</span>
      {/if}
    </p>
  {:else if state.autoRotate}
    <p>Tap to control</p>
  {:else}
    <p>Drag to rotate • Tap to release</p>
  {/if}
</div>

<style>
  .controls-hint {
    position: absolute;
    top: 20px;
    left: 20px;
    color: #333;
    font-family: 'Courier New', monospace;
    font-size: 11px;
    letter-spacing: 1px;
    opacity: 0.5;
    pointer-events: none;
    user-select: none;
  }

  .controls-hint p {
    margin: 0;
    padding: 0;
  }

  @media (max-width: 768px) {
    .controls-hint {
      font-size: 13px;
      opacity: 0.7;
    }
  }
  
  /* Saturn time display */
  .saturn-time {
    font-family: 'Courier New', monospace;
    font-size: 14px;
    letter-spacing: 2px;
    margin: 0;
  }

  .glowing-six {
    color: #333;
    text-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
    animation: subtle-pulse 3s ease-in-out infinite;
  }

  .saturn-counter {
    color: #666;
    font-weight: bold;
    margin-left: 10px;
    letter-spacing: 2px;
    transition: all 0.3s ease;
  }

  .saturn-counter.complete {
    color: #cc0000;
    text-shadow: 0 0 10px rgba(204, 0, 0, 0.6);
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  @keyframes subtle-pulse {
    0%, 100% { 
      text-shadow: 0 0 2px rgba(255, 255, 255, 0.6);
    }
    50% { 
      text-shadow: 0 0 6px rgba(255, 255, 255, 1);
    }
  }

  /* Triangle breath display */
  .triangle-breath {
    font-family: 'Courier New', monospace;
    font-size: 14px;
    letter-spacing: 2px;
    margin: 0;
    text-transform: lowercase;
    opacity: 0.7;
    transition: all 0.1s ease;
  }

  .triangle-breath.success-glow {
    opacity: 1;
    font-weight: bold;
    color: #fff;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
  }
</style>