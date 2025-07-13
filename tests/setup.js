import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock WebGL context for Three.js
let mockCallCounter = 0; // Counter to create variation between calls
let mockLightingHash = 0; // Hash to track lighting configuration changes

const mockWebGL = {
  getContext: vi.fn(() => ({
    // GL Constants
    VERTEX_SHADER: 35633,
    FRAGMENT_SHADER: 35632,
    HIGH_FLOAT: 36338,
    MEDIUM_FLOAT: 36337,
    LOW_FLOAT: 36336,
    HIGH_INT: 36341,
    MEDIUM_INT: 36340,
    LOW_INT: 36339,
    FRAMEBUFFER_COMPLETE: 36053,
    COLOR_BUFFER_BIT: 16384,
    DEPTH_BUFFER_BIT: 256,
    ARRAY_BUFFER: 34962,
    ELEMENT_ARRAY_BUFFER: 34963,
    TRIANGLES: 4,
    UNSIGNED_BYTE: 5121,
    RGBA: 6408,
    VERSION: 7937,
    TEXTURE_3D: 32879,
    TEXTURE_2D_ARRAY: 35866,
    TEXTURE_2D: 3553,
    FUNC_ADD: 32774,
    
    // Shader precision
    getShaderPrecisionFormat: vi.fn((shaderType, precisionType) => ({
      precision: 23,
      rangeMin: 127,
      rangeMax: 127
    })),
    
    // Extensions and Context
    getExtension: vi.fn((name) => {
      if (name === 'WEBGL_debug_renderer_info') {
        return {
          UNMASKED_VENDOR_WEBGL: 37445,
          UNMASKED_RENDERER_WEBGL: 37446
        };
      }
      return null;
    }),
    
    getContextAttributes: vi.fn(() => ({
      alpha: true,
      antialias: true,
      depth: true,
      desynchronized: false,
      failIfMajorPerformanceCaveat: false,
      powerPreference: 'default',
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      stencil: false
    })),
    
    // Parameters
    getParameter: vi.fn((param) => {
      switch (param) {
        case 37445: return 'Mock Vendor';
        case 37446: return 'Mock Renderer';
        case 7938: return 1024; // MAX_TEXTURE_SIZE
        case 34921: return 16; // MAX_CUBE_MAP_TEXTURE_SIZE
        case 35071: return 8; // MAX_VERTEX_ATTRIBS
        case 35660: return 16; // MAX_VERTEX_UNIFORM_VECTORS
        case 35661: return 16; // MAX_FRAGMENT_UNIFORM_VECTORS
        case 36347: return 4096; // MAX_RENDERBUFFER_SIZE
        case 34930: return 4; // MAX_VERTEX_TEXTURE_IMAGE_UNITS
        case 34852: return 8; // MAX_TEXTURE_IMAGE_UNITS
        case 7937: return 'WebGL 2.0 (Mock)'; // VERSION
        default: return 0;
      }
    }),
    
    // Shaders
    createShader: vi.fn(() => ({})),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn(() => true),
    getShaderInfoLog: vi.fn(() => ''),
    deleteShader: vi.fn(),
    
    // Programs
    createProgram: vi.fn(() => ({})),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    getProgramParameter: vi.fn(() => true),
    getProgramInfoLog: vi.fn(() => ''),
    useProgram: vi.fn(),
    deleteProgram: vi.fn(),
    
    // Attributes and Uniforms
    getAttribLocation: vi.fn(() => 0),
    getActiveAttrib: vi.fn(() => ({
      name: 'mockAttribute',
      type: 35665, // FLOAT_VEC3
      size: 1
    })),
    getUniformLocation: vi.fn(() => ({})),
    getActiveUniform: vi.fn(() => ({
      name: 'mockUniform',
      type: 35676, // FLOAT_MAT4
      size: 1
    })),
    enableVertexAttribArray: vi.fn(),
    disableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    uniform1f: vi.fn((location, value) => {
      // Change lighting hash when uniforms change (simulates lighting differences)
      mockLightingHash = (mockLightingHash + Math.floor(value * 100)) % 1000;
    }),
    uniform1i: vi.fn(),
    uniform2f: vi.fn(),
    uniform3f: vi.fn((location, x, y, z) => {
      // Change lighting hash for vector uniforms (colors, positions)
      mockLightingHash = (mockLightingHash + Math.floor((x + y + z) * 100)) % 1000;
    }),
    uniform4f: vi.fn(),
    uniformMatrix4fv: vi.fn(),
    
    // Buffers
    createBuffer: vi.fn(() => ({})),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    bufferSubData: vi.fn(),
    deleteBuffer: vi.fn(),
    
    // Vertex Array Objects (WebGL 2.0)
    createVertexArray: vi.fn(() => ({})),
    bindVertexArray: vi.fn(),
    deleteVertexArray: vi.fn(),
    
    // Textures
    createTexture: vi.fn(() => ({})),
    bindTexture: vi.fn(),
    texImage2D: vi.fn(),
    texImage3D: vi.fn(), // WebGL 2.0
    texSubImage2D: vi.fn(),
    texSubImage3D: vi.fn(), // WebGL 2.0
    texParameteri: vi.fn(),
    generateMipmap: vi.fn(),
    activeTexture: vi.fn(),
    deleteTexture: vi.fn(),
    
    // Rendering
    clearColor: vi.fn(),
    clearDepth: vi.fn(),
    clearStencil: vi.fn(),
    clear: vi.fn(),
    drawArrays: vi.fn(),
    drawElements: vi.fn(),
    viewport: vi.fn(),
    
    // State management
    enable: vi.fn(),
    disable: vi.fn(),
    blendFunc: vi.fn(),
    blendEquation: vi.fn(),
    blendFuncSeparate: vi.fn(),
    blendEquationSeparate: vi.fn(),
    depthFunc: vi.fn(),
    depthMask: vi.fn(),
    depthRange: vi.fn(),
    stencilFunc: vi.fn(),
    stencilMask: vi.fn(),
    stencilOp: vi.fn(),
    colorMask: vi.fn(),
    cullFace: vi.fn(),
    frontFace: vi.fn(),
    polygonOffset: vi.fn(),
    scissor: vi.fn(),
    lineWidth: vi.fn(),
    
    // Framebuffers
    createFramebuffer: vi.fn(() => ({})),
    bindFramebuffer: vi.fn(),
    framebufferTexture2D: vi.fn(),
    framebufferRenderbuffer: vi.fn(),
    checkFramebufferStatus: vi.fn(() => 36053), // FRAMEBUFFER_COMPLETE
    deleteFramebuffer: vi.fn(),
    
    // Renderbuffers
    createRenderbuffer: vi.fn(() => ({})),
    bindRenderbuffer: vi.fn(),
    renderbufferStorage: vi.fn(),
    deleteRenderbuffer: vi.fn(),
    
    // Pixel operations
    readPixels: vi.fn((x, y, width, height, format, type, pixels) => {
      // Fill with mock pixel data if pixels array is provided
      if (pixels && pixels.length) {
        // Create stable base color that can be varied by lighting changes
        const baseColor = 64 + mockLightingHash % 32; // Consistent within same lighting config
        
        for (let i = 0; i < pixels.length; i += 4) {
          const variation = (i / 4) % 8; // Add position-based variation
          pixels[i] = Math.min(255, baseColor + variation);     // R
          pixels[i + 1] = Math.min(255, baseColor + variation); // G  
          pixels[i + 2] = Math.min(255, baseColor + variation); // B
          pixels[i + 3] = 255; // A
        }
      }
    }),
    canvas: {
      width: 1024,
      height: 768,
      style: {},
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 1024,
        height: 768
      })
    }
  }))
};

// Mock Canvas and WebGL
global.HTMLCanvasElement.prototype.getContext = mockWebGL.getContext;

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn();

// Mock performance API
global.performance = global.performance || {
  now: () => Date.now(),
  mark: vi.fn(),
  measure: vi.fn()
};

// Mock window dimensions
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768
});

// Mock devicePixelRatio
Object.defineProperty(window, 'devicePixelRatio', {
  writable: true,
  configurable: true,
  value: 1
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Silence console warnings during tests unless specifically testing them
const originalConsoleWarn = console.warn;
console.warn = vi.fn();