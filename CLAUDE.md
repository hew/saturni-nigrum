# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (runs on http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Project Architecture

This is a Svelte + Vite web application using Three.js.

### Core Structure

👀 Read the codefetch/codebase.md folder.

### Key Dependencies

- **Three.js**: Used for 3D graphics rendering, scene management, and WebGL operations
- **GSAP**: Handles animations, particularly the pyramid intro animation
- **Svelte 5**: Modern component framework with reactive updates

### Important Notes

❌ Don't just start coding "simpler" versions of what I ask for if you hit a block. Just return and ask for help.

❌ Do NOT make assumptions. Just ask me for clarification if needed.

✅ ALWAYS work in a TDD style.
✅ Always start with a test FIRST, and then the implementation.
