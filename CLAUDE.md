# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (runs on http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Project Architecture

This is a Svelte + Vite web application that creates a mystical 3D desert scene with a black pyramid using Three.js.

### Core Structure

- `src/App.svelte` - Main application entry point that orchestrates the three main components
- `src/main.js` - Svelte application mount point
- `src/lib/` - Component library containing the three main interactive elements:
  - `DesertScene.svelte` - The primary Three.js scene with pyramid, desert terrain, particle effects, and camera controls
  - `Coordinates.svelte` - Displays dynamic coordinates based on mouse position
  - `RitualCursor.svelte` - Custom animated cursor that replaces the default mouse cursor

### Key Dependencies

- **Three.js**: Used for 3D graphics rendering, scene management, and WebGL operations
- **GSAP**: Handles animations, particularly the pyramid intro animation
- **Svelte 5**: Modern component framework with reactive updates

### Scene Architecture

The main 3D scene (`DesertScene.svelte`) contains:
- A procedurally generated desert plane with random vertex heights
- A black pyramid with metallic material and emissive glow
- Dynamic particle system (2000 sand particles) that responds to mouse movement
- Camera that orbits around the pyramid automatically
- Multiple light sources: ambient light, directional moonlight, and pyramid point light

### Component Communication

Components communicate through custom events:
- `DesertScene` dispatches `mousemove-coords` events with normalized mouse coordinates
- `Coordinates` listens to these events to update the displayed coordinates
- All components are mounted conditionally after the main app is mounted

The application uses a custom cursor (disabled default cursor in global styles) and has a full-screen immersive design with no scrolling.