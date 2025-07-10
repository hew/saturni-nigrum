/**
 * PlanetarySystem - A realistic orbital mechanics engine for the 7 classical planets
 * 
 * This module provides orbital calculations based on simplified but realistic astronomy.
 * Perfect for mystical/astrological applications without NASA-level complexity.
 */

export class PlanetarySystem {
  constructor() {
    this.currentTime = 0; // Time in days since epoch
    this.planets = this.initializePlanets();
  }

  /**
   * Initialize the 7 classical planets with realistic orbital data
   * Distances are scaled for visual appeal, periods are Earth-relative
   */
  initializePlanets() {
    return {
      Sun: {
        name: 'Sun',
        color: '#FDB813',
        size: 1.2,
        distance: 0, // Sun is at center (relative to Earth's perspective)
        period: 365.25, // Earth days for one orbit
        currentAngle: 0,
        eccentricity: 0 // Circular orbit for simplicity
      },
      Moon: {
        name: 'Moon',
        color: '#C0C0C0',
        size: 0.6,
        distance: 2, // Scaled distance units
        period: 27.3, // Lunar month
        currentAngle: 0,
        eccentricity: 0.05
      },
      Mercury: {
        name: 'Mercury',
        color: '#8C7853',
        size: 0.4,
        distance: 3,
        period: 87.97, // Earth days
        currentAngle: 0,
        eccentricity: 0.21
      },
      Venus: {
        name: 'Venus',
        color: '#FFC649',
        size: 0.7,
        distance: 4,
        period: 224.7,
        currentAngle: 0,
        eccentricity: 0.01
      },
      Mars: {
        name: 'Mars',
        color: '#CD5C5C',
        size: 0.5,
        distance: 6,
        period: 687,
        currentAngle: 0,
        eccentricity: 0.09
      },
      Jupiter: {
        name: 'Jupiter',
        color: '#D8CA9D',
        size: 1.0,
        distance: 8,
        period: 4333, // ~12 Earth years
        currentAngle: 0,
        eccentricity: 0.05
      },
      Saturn: {
        name: 'Saturn',
        color: '#FAD5A5',
        size: 0.9,
        distance: 10,
        period: 10759, // ~29 Earth years
        currentAngle: 0,
        eccentricity: 0.06
      }
    };
  }

  /**
   * Update the planetary system by advancing time
   * @param {number} deltaTime - Time to advance in days
   */
  updateTime(deltaTime) {
    this.currentTime += deltaTime;
    
    // Update each planet's position based on its orbital period
    Object.values(this.planets).forEach(planet => {
      if (planet.name === 'Sun') return; // Sun stays at center
      
      // Calculate angular velocity (degrees per day)
      const angularVelocity = 360 / planet.period;
      
      // Update angle based on time progression
      planet.currentAngle = (planet.currentAngle + angularVelocity * deltaTime) % 360;
    });
  }

  /**
   * Set time directly (useful for scrubbing)
   * @param {number} time - Time in days since epoch
   */
  setTime(time) {
    const deltaTime = time - this.currentTime;
    this.updateTime(deltaTime);
  }

  /**
   * Get current 3D position of a planet
   * @param {string} planetName - Name of the planet
   * @returns {Object} {x, y, z} coordinates
   */
  getPlanetPosition(planetName) {
    const planet = this.planets[planetName];
    if (!planet) return { x: 0, y: 0, z: 0 };
    
    if (planet.name === 'Sun') {
      return { x: 0, y: 0, z: 0 }; // Sun at center
    }

    // Convert angle to radians
    const angleRad = (planet.currentAngle * Math.PI) / 180;
    
    // Calculate elliptical orbit (simplified)
    const r = planet.distance * (1 - planet.eccentricity * Math.cos(angleRad));
    
    // Calculate position
    const x = r * Math.cos(angleRad);
    const y = r * Math.sin(angleRad);
    const z = 0; // Keep orbits in same plane for simplicity
    
    return { x, y, z };
  }

  /**
   * Get all planet positions at current time
   * @returns {Object} Dictionary of planet positions
   */
  getAllPlanetPositions() {
    const positions = {};
    Object.keys(this.planets).forEach(planetName => {
      positions[planetName] = {
        ...this.getPlanetPosition(planetName),
        planet: this.planets[planetName]
      };
    });
    return positions;
  }

  /**
   * Get current system state
   * @returns {Object} Complete state of the planetary system
   */
  getSystemState() {
    return {
      currentTime: this.currentTime,
      planets: { ...this.planets },
      positions: this.getAllPlanetPositions()
    };
  }

  /**
   * Reset system to initial state
   */
  reset() {
    this.currentTime = 0;
    Object.values(this.planets).forEach(planet => {
      planet.currentAngle = 0;
    });
  }
}