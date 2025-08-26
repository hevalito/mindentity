/**
 * @mindnow/mindentity - Production-grade generative logo system
 * 
 * Main entry point for the core functionality
 */

// Export types
export type * from './types.js';

// Export core functionality
export { SeededRNG, createRNG, generateSeed } from './core/rng.js';
export { 
  parseColor, 
  blendColors, 
  updateColorConstants, 
  colorConstants,
  GRADIENT_URLS,
  pickGradient,
  isValidColor,
  toHex,
  toRgba
} from './core/colors.js';
export { 
  getLetterPattern, 
  hasLetterPattern, 
  getAvailableLetters, 
  validateLetterPatterns,
  LETTER_GRID_SIZE,
  AVAILABLE_LETTERS
} from './core/letters.js';

// Default configuration
export const defaults = {
  width: 1024,
  height: 1024,
  gridSize: 8,
  backgroundColor: '#ffffff',
  foregroundColor: '#000000',
  transparent: false,
  gap: 10,
  margin: 100,
  whiteSpace: 20,
  halfShapesChance: 4,
  nodeShapesChance: 4,
  squareRadius: 12,
  crossRadius: 6,
  circleRadius: 4,
  mode: 'none' as const,
  offsetX: 0,
  offsetY: 0,
  renderer: 'svg' as const,
};

// Placeholder functions - will be implemented in the next steps
export function getMindentityData(params = {}) {
  throw new Error('getMindentityData not yet implemented - coming in next iteration');
}

export function getMindentitySVG(params = {}) {
  throw new Error('getMindentitySVG not yet implemented - coming in next iteration');
}

export function getMindentityDataURL(params = {}) {
  throw new Error('getMindentityDataURL not yet implemented - coming in next iteration');
}

export function getMindentitySVGFromData(data: any) {
  throw new Error('getMindentitySVGFromData not yet implemented - coming in next iteration');
}

export function getMindentityDataURLFromData(data: any) {
  throw new Error('getMindentityDataURLFromData not yet implemented - coming in next iteration');
}
