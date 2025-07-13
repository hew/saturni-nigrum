# Three.js Component Testing Suite

This comprehensive testing suite ensures visual consistency, component integration, and memory management for the modular Three.js components in the occult-pyramid project.

## Test Structure

### Unit Tests
- **`components/Ground.test.js`** - Tests for the Ground component
- **`systems/LightingSystem.test.js`** - Tests for the LightingSystem

### Integration Tests
- **`integration/SceneIntegration.test.js`** - Tests component interactions and scene assembly

### Visual Regression Tests
- **`visual/VisualRegression.test.js`** - Tests visual consistency and rendering output

### Performance Tests
- **`performance/MemoryLeaks.test.js`** - Tests memory management and leak prevention

### Test Utilities
- **`helpers/TestUtils.js`** - Common testing utilities and helpers

## Running Tests

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests once (CI mode)
npm run test:run

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui

# Watch mode for development
npm run test:watch

# Run only visual regression tests
npm run test:visual
```

### Test Categories

#### Ground Component Tests
Tests ensure the Ground component:
- ✅ Creates consistent desert, wasteland, and space ground types
- ✅ Applies procedural terrain generation correctly
- ✅ Manages grid visibility and opacity
- ✅ Disposes resources properly to prevent memory leaks
- ✅ Produces identical visual output with same parameters

#### LightingSystem Tests
Tests ensure the LightingSystem:
- ✅ Configures ambient, directional, and rim lighting correctly
- ✅ Applies different presets (standard, dramatic, minimal, space, saturn)
- ✅ Manages shadow settings consistently
- ✅ Provides runtime light control
- ✅ Disposes all lights and clears references

#### Integration Tests
Tests verify:
- ✅ Ground and lighting components work together seamlessly
- ✅ Scene assembly and rendering work correctly
- ✅ Component disposal during scene transitions
- ✅ Performance under stress conditions
- ✅ Mixed component configurations

#### Visual Regression Tests
Tests ensure:
- ✅ Consistent visual appearance across renders
- ✅ Proper color temperature and lighting characteristics
- ✅ Grid rendering visibility and opacity changes
- ✅ Performance within acceptable bounds
- ✅ Visual differences between component types

#### Memory Leak Prevention Tests
Tests verify:
- ✅ All geometries and materials are disposed properly
- ✅ Lights are removed from scenes on disposal
- ✅ No dangling references remain after disposal
- ✅ Repeated creation/disposal cycles don't accumulate memory
- ✅ WebGL resources are cleaned up correctly

## Key Testing Principles

### Visual Consistency
The tests prioritize maintaining exact visual fidelity across scenes:
- Ground components must produce identical floor appearance
- Lighting must be consistent across different configurations
- Visual regression tests catch unintended changes

### Memory Management
Comprehensive memory leak prevention:
- All Three.js resources are properly disposed
- Component lifecycle is managed correctly
- Stress testing with rapid creation/disposal cycles

### Component Integration
Tests verify components work together:
- Ground receives shadows when lighting casts them
- Different component types can be mixed safely
- Scene transitions maintain stability

### Performance Validation
Tests ensure acceptable performance:
- Render times within reasonable bounds
- Memory usage doesn't grow over time
- Complex scenes handle stress testing

## Test Configuration

### WebGL Mocking
Tests use comprehensive WebGL mocking to run in Node.js environment:
- Canvas and WebGL context simulation
- Consistent render behavior across test runs
- Pixel reading capabilities for visual tests

### Performance Thresholds
Tests include configurable performance thresholds:
- Render time limits (100ms for test renders)
- Memory allocation tracking
- Visual difference tolerance (5% for consistency tests)

### Test Data
Tests use consistent test configurations:
- Standardized ground sizes and segments
- Controlled lighting intensities
- Reproducible procedural terrain parameters

## Visual Testing Methodology

### Pixel-Based Validation
Visual tests capture and analyze pixel data:
- Center region sampling for consistency tests
- Full-frame analysis for grid visibility tests
- Color averaging for lighting validation

### Regression Detection
Tests detect visual changes through:
- Pixel difference calculations
- Color consistency validation
- Unique color counting for complexity analysis

### Cross-Resolution Testing
Tests validate visual quality across different render sizes:
- Multiple viewport dimensions
- Consistent appearance scaling
- Resolution-independent color accuracy

## Best Practices for Test Maintenance

### Adding New Tests
When adding new components or features:
1. Create unit tests for core functionality
2. Add integration tests for component interactions
3. Include visual regression tests for appearance
4. Add memory management tests for disposal

### Updating Thresholds
Performance and visual thresholds may need adjustment:
- Monitor test execution times and adjust timeouts
- Update visual difference tolerances based on rendering changes
- Revise memory usage expectations for complex scenes

### Test Environment
Maintain consistent test environment:
- Use fixed canvas sizes for reproducible results
- Disable hardware acceleration for consistent rendering
- Mock external dependencies (textures, models)

## Troubleshooting

### Common Issues

#### WebGL Context Errors
If tests fail with WebGL errors:
- Verify WebGL mocking is properly set up
- Check that canvas dimensions are valid
- Ensure dispose methods are called correctly

#### Visual Test Failures
If visual regression tests fail:
- Check if intentional changes affect rendering
- Update baseline expectations if needed
- Verify test environment consistency

#### Memory Test Failures
If memory tests fail:
- Check that all dispose methods are implemented
- Verify scene cleanup in afterEach hooks
- Look for missing resource disposal calls

#### Performance Test Failures
If performance tests timeout:
- Reduce test complexity or iterations
- Check for inefficient render loops
- Verify proper component disposal

## Future Enhancements

### Planned Improvements
- Automated baseline image generation for visual tests
- More sophisticated performance profiling
- Extended browser compatibility testing
- Component interaction stress testing

### Testing Tools Integration
- Consider adding browser-based testing with Playwright
- Implement automated visual diff reporting
- Add performance regression tracking
- Include bundle size impact analysis

This testing suite ensures the Three.js components maintain their visual fidelity and performance characteristics while preventing common issues like memory leaks and integration problems.