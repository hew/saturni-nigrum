/**
 * Centralized state management for the Occult Pyramid application
 * Uses a reducer pattern with Svelte stores
 */
import { writable, derived } from 'svelte/store';

// Action types
export const ACTION_TYPES = {
  // Simple object visibility
  SHOW_CUBE: 'SHOW_CUBE',
  SHOW_SATURN: 'SHOW_SATURN',
  SHOW_TRIANGLE: 'SHOW_TRIANGLE',
  SHOW_FLOWER: 'SHOW_FLOWER',
  
  // Control modes
  TOGGLE_AUTO_ROTATE: 'TOGGLE_AUTO_ROTATE',
  SET_AUTO_ROTATE: 'SET_AUTO_ROTATE',
  
  // Secrets
  UNLOCK_CUBE_SECRET: 'UNLOCK_CUBE_SECRET',
  UNLOCK_SATURN_SECRET: 'UNLOCK_SATURN_SECRET',
  UNLOCK_TRINITY_SECRET: 'UNLOCK_TRINITY_SECRET',
  
  // User input
  UPDATE_MOUSE_POSITION: 'UPDATE_MOUSE_POSITION',
  UPDATE_ROTATION: 'UPDATE_ROTATION',
  
  // System
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_STATUS: 'SET_STATUS',
  RESET_STATE: 'RESET_STATE'
};

// Initial state
const initialState = {
  // Simple object visibility - only one should be true at a time
  showCube: true,
  showSaturn: false,
  showTriangle: false,
  showFlower: false,
  
  // Control
  autoRotate: true,
  
  // Secrets
  cubeSecretUnlocked: false,
  saturnSecretUnlocked: false,
  trinitySecretUnlocked: false,
  
  // User input
  mouseX: 0,
  mouseY: 0,
  saturnRotationX: 0,
  saturnRotationY: 0,
  
  // System state
  isLoading: true,
  error: null,
  status: 'init',
  
  // Metadata
  lastAction: null,
  timestamp: Date.now()
};

// Pure reducer function
function reducer(state, action) {
  const timestamp = Date.now();
  
  switch (action.type) {
    case ACTION_TYPES.SHOW_CUBE:
      return {
        ...state,
        showCube: true,
        showSaturn: false,
        showTriangle: false,
        showFlower: false,
        lastAction: action.type,
        timestamp
      };
      
    case ACTION_TYPES.SHOW_SATURN:
      return {
        ...state,
        showCube: false,
        showSaturn: true,
        showTriangle: false,
        showFlower: false,
        lastAction: action.type,
        timestamp
      };
      
    case ACTION_TYPES.SHOW_TRIANGLE:
      return {
        ...state,
        showCube: false,
        showSaturn: false,
        showTriangle: true,
        showFlower: false,
        lastAction: action.type,
        timestamp
      };
      
    case ACTION_TYPES.SHOW_FLOWER:
      return {
        ...state,
        showCube: false,
        showSaturn: false,
        showTriangle: false,
        showFlower: true,
        lastAction: action.type,
        timestamp
      };
      
    case ACTION_TYPES.TOGGLE_AUTO_ROTATE:
      return {
        ...state,
        autoRotate: !state.autoRotate,
        lastAction: action.type,
        timestamp
      };
      
    case ACTION_TYPES.SET_AUTO_ROTATE:
      return {
        ...state,
        autoRotate: action.payload,
        lastAction: action.type,
        timestamp
      };
      
    case ACTION_TYPES.UNLOCK_CUBE_SECRET:
      return {
        ...state,
        cubeSecretUnlocked: true,
        lastAction: action.type,
        timestamp
      };
      
    case ACTION_TYPES.UNLOCK_SATURN_SECRET:
      return {
        ...state,
        saturnSecretUnlocked: true,
        lastAction: action.type,
        timestamp
      };
      
    case ACTION_TYPES.UNLOCK_TRINITY_SECRET:
      return {
        ...state,
        trinitySecretUnlocked: true,
        lastAction: action.type,
        timestamp
      };
      
    case ACTION_TYPES.UPDATE_MOUSE_POSITION:
      return {
        ...state,
        mouseX: action.payload.x,
        mouseY: action.payload.y,
        lastAction: action.type,
        timestamp
      };
      
    case ACTION_TYPES.UPDATE_ROTATION:
      return {
        ...state,
        saturnRotationX: action.payload.x,
        saturnRotationY: action.payload.y,
        lastAction: action.type,
        timestamp
      };
      
    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        lastAction: action.type,
        timestamp
      };
      
    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        status: 'error',
        lastAction: action.type,
        timestamp
      };
      
    case ACTION_TYPES.SET_STATUS:
      return {
        ...state,
        status: action.payload,
        lastAction: action.type,
        timestamp
      };
      
    case ACTION_TYPES.SET_PERFORMANCE_MODE:
      return {
        ...state,
        performanceMode: action.payload,
        lastAction: action.type,
        timestamp
      };
      
    case ACTION_TYPES.RESET_STATE:
      return {
        ...initialState,
        timestamp
      };
      
    default:
      return state;
  }
}

// Create the store
function createStore() {
  const { subscribe, update } = writable(initialState);
  
  // Dispatch function
  function dispatch(action) {
    update(state => reducer(state, action));
  }
  
  return {
    subscribe,
    dispatch,
    reset: () => dispatch({ type: ACTION_TYPES.RESET_STATE })
  };
}

// Export the store instance
export const sceneStore = createStore();

// Simple derived stores that match the state directly
export const canInteractWithCube = derived(sceneStore, $store => !$store.showTriangle);

// Action creators for cleaner dispatching
export const actions = {
  showCube: () => ({ type: ACTION_TYPES.SHOW_CUBE }),
  showSaturn: () => ({ type: ACTION_TYPES.SHOW_SATURN }),
  showTriangle: () => ({ type: ACTION_TYPES.SHOW_TRIANGLE }),
  showFlower: () => ({ type: ACTION_TYPES.SHOW_FLOWER }),
  toggleAutoRotate: () => ({ type: ACTION_TYPES.TOGGLE_AUTO_ROTATE }),
  setAutoRotate: (value) => ({ type: ACTION_TYPES.SET_AUTO_ROTATE, payload: value }),
  unlockCubeSecret: () => ({ type: ACTION_TYPES.UNLOCK_CUBE_SECRET }),
  unlockSaturnSecret: () => ({ type: ACTION_TYPES.UNLOCK_SATURN_SECRET }),
  unlockTrinitySecret: () => ({ type: ACTION_TYPES.UNLOCK_TRINITY_SECRET }),
  updateMousePosition: (x, y) => ({ type: ACTION_TYPES.UPDATE_MOUSE_POSITION, payload: { x, y } }),
  updateRotation: (x, y) => ({ type: ACTION_TYPES.UPDATE_ROTATION, payload: { x, y } }),
  setLoading: (loading) => ({ type: ACTION_TYPES.SET_LOADING, payload: loading }),
  setError: (error) => ({ type: ACTION_TYPES.SET_ERROR, payload: error }),
  setStatus: (status) => ({ type: ACTION_TYPES.SET_STATUS, payload: status }),
  reset: () => ({ type: ACTION_TYPES.RESET_STATE })
};

