<script>
  import { onMount } from 'svelte';
  
  let time = '';
  
  onMount(() => {
    const updateTime = () => {
      const now = new Date();
      time = now.toISOString().split('T')[1].split('.')[0];
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  });
</script>

<div class="time">
  {time}
</div>

<style>
  .time {
    position: fixed;
    bottom: 20px;
    left: 20px;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 12px;
    font-weight: 300;
    color: #888;
    letter-spacing: 0.05em;
  }
</style>