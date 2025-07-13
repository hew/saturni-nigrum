# State Management Migration Guide

## Overview

The application now uses a centralized Redux-style state management system with Svelte stores. This provides predictable state transitions, better debugging capabilities, and eliminates the triangle dead-end state issue.

## Key Changes

### 1. Centralized Store (`store.js`)

All application state is now managed in a single store with the following structure:

```javascript
{
  status: 'loading' | 'ready' | 'error',
  error: string | null,
  currentScene: 'cube' | 'saturn' | 'triangle' | 'solar',
  
  cube: {
    autoRotate: boolean,
    showSaturn: boolean,
    showTriangle: boolean,
    secretUnlocked: boolean,
    saturnSecretUnlocked: boolean,
    mouseX: number,
    mouseY: number,
    saturnRotationX: number,
    saturnRotationY: number
  },
  
  solar: {
    isPaused: boolean,
    timeSpeed: number,
    time: number,
    zoomLevel: number,
    followingPlanet: string | null,
    hoveredPlanet: string | null,
    showGrid: boolean,
    showSpirals: boolean,
    occultMode: boolean,
    performanceMode: 'quality' | 'balanced' | 'performance',
    planetPositions: Array,
    secretCode: string
  }
}
```

### 2. Action Types

All state changes happen through dispatched actions:

- Scene management: `SET_SCENE`, `SET_STATUS`, `SET_ERROR`
- Cube actions: `TOGGLE_AUTO_ROTATE`, `UPDATE_MOUSE_POSITION`, `TOGGLE_SATURN_MODE`, etc.
- Solar actions: `TOGGLE_PAUSE`, `SET_TIME_SPEED`, `UPDATE_TIME`, etc.
- Reset actions: `RESET_CUBE_STATE`, `RESET_SOLAR_STATE`, `RESET_ALL`

### 3. Usage in Components

#### Before:
```javascript
let autoRotate = true;
let showSaturn = false;

function toggleMode() {
  showSaturn = !showSaturn;
  autoRotate = true;
}
```

#### After:
```javascript
import { sceneStore, actions, cubeState } from './store.js';

// Subscribe to state
$: state = $cubeState;

function toggleMode() {
  sceneStore.dispatch(actions.toggleSaturnMode());
}

// Use state in template
{#if state.autoRotate}
  <!-- content -->
{/if}
```

### 4. Derived Stores

Use derived stores for computed values:

- `isLoading` - Whether the app is loading
- `hasError` - Whether there's an error
- `currentScene` - Active scene
- `cubeState` - All cube-related state
- `solarState` - All solar system state
- `isManualControl` - Whether cube is manually controlled
- `canInteractWithCube` - Whether cube can be interacted with
- `isAnimating` - Whether solar system is animating

## Migration Steps

1. **Import the store** in components that need state:
   ```javascript
   import { sceneStore, actions, cubeState, solarState } from './store.js';
   ```

2. **Replace local state** with store subscriptions:
   ```javascript
   // Instead of: let showSaturn = false;
   $: state = $cubeState;
   // Use: state.showSaturn
   ```

3. **Replace state mutations** with dispatched actions:
   ```javascript
   // Instead of: autoRotate = !autoRotate;
   sceneStore.dispatch(actions.toggleAutoRotate());
   ```

4. **Use derived stores** for computed values:
   ```javascript
   import { canInteractWithCube } from './store.js';
   
   if ($canInteractWithCube) {
     // Allow interaction
   }
   ```

## Fixed Issues

### 1. Triangle Dead-End State
The triangle state is now properly managed. When activated:
- `showTriangle` is set to `true`
- `autoRotate` is set to `false`
- The state can be reset using `actions.resetCubeState()`

### 2. Hardcoded Test Values
Removed hardcoded test value:
```javascript
// Before: saturnSecretUnlocked = true; // TEMP: Set to true for testing
// After: Properly managed through state transitions
```

### 3. State Consistency
All state transitions go through the reducer, ensuring:
- No conflicting states
- Predictable updates
- Easy debugging with action logs

## Best Practices

1. **Never mutate state directly** - Always dispatch actions
2. **Use action creators** for cleaner code:
   ```javascript
   sceneStore.dispatch(actions.setTimeSpeed(10));
   ```
3. **Subscribe efficiently** using Svelte's `$:` reactive statements
4. **Cleanup subscriptions** if manually subscribing (auto-cleanup with `$`)

## Debugging

Enable state logging:
```javascript
import { logState } from './store.js';
logState(); // Logs current state to console
```

Monitor state changes:
```javascript
sceneStore.subscribe(state => {
  console.log('State changed:', state);
});
```

## Future Enhancements

The reducer pattern makes it easy to add:
- Undo/redo functionality
- State persistence to localStorage
- Time-travel debugging
- State validation middleware
- Action logging middleware