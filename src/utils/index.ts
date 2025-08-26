import type { MindentityParams } from '../types.js';
import { getMindentitySVG, getMindentityDataURL } from '../core/generation.js';

/**
 * Download an SVG file with the given parameters
 */
export async function downloadSVG(params: {
  params: MindentityParams;
  filename?: string;
}): Promise<void> {
  const { params: mindentityParams, filename = 'mindentity.svg' } = params;
  
  const svgString = getMindentitySVG(mindentityParams);
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  
  downloadBlob(blob, filename);
}

/**
 * Download a PNG file with the given parameters
 */
export async function downloadPNG(params: {
  params: MindentityParams;
  filename?: string;
}): Promise<void> {
  const { params: mindentityParams, filename = 'mindentity.png' } = params;
  
  return new Promise((resolve, reject) => {
    const dataURL = getMindentityDataURL({ ...mindentityParams, renderer: 'canvas' });
    
    // Convert data URL to blob
    fetch(dataURL)
      .then(res => res.blob())
      .then(blob => {
        downloadBlob(blob, filename);
        resolve();
      })
      .catch(reject);
  });
}

/**
 * Create a random seed string
 */
export function createSeed(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Create a deterministic seed from a string
 */
export function createSeedFromString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Validate Mindentity parameters
 */
export function validateParams(params: MindentityParams): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Width validation
  if (params.width !== undefined) {
    if (params.width < 1 || params.width > 4096) {
      errors.push('Width must be between 1 and 4096 pixels');
    }
  }

  // Height validation
  if (params.height !== undefined) {
    if (params.height < 1 || params.height > 4096) {
      errors.push('Height must be between 1 and 4096 pixels');
    }
  }

  // Grid size validation
  if (params.gridSize !== undefined) {
    if (params.gridSize < 2 || params.gridSize > 50) {
      errors.push('Grid size must be between 2 and 50');
    }
  }

  // Percentage validations
  const percentageFields = [
    'whiteSpace',
    'halfShapesChance',
    'nodeShapesChance',
    'squareRadius',
    'crossRadius',
    'circleRadius'
  ] as const;

  percentageFields.forEach(field => {
    const value = params[field];
    if (value !== undefined && (value < 0 || value > 100)) {
      errors.push(`${field} must be between 0 and 100`);
    }
  });

  // Color validation
  if (params.backgroundColor && !isValidColor(params.backgroundColor)) {
    errors.push('Invalid background color format');
  }

  if (params.foregroundColor && !isValidColor(params.foregroundColor)) {
    errors.push('Invalid foreground color format');
  }

  // Mode validation
  if (params.mode && !['none', 'letter', 'string'].includes(params.mode)) {
    errors.push('Mode must be "none", "letter", or "string"');
  }

  // Input validation for letter mode
  if (params.mode === 'letter' && params.input && params.input.length !== 1) {
    errors.push('Input for letter mode must be a single character');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if a string is a valid color
 */
export function isValidColor(color: string): boolean {
  // Check hex colors
  if (/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
    return true;
  }

  // Check rgb/rgba colors
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/i.test(color)) {
    return true;
  }

  // Check hsl/hsla colors
  if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+)?\s*\)$/i.test(color)) {
    return true;
  }

  // Check named colors (basic set)
  const namedColors = [
    'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
    'gray', 'grey', 'orange', 'purple', 'pink', 'brown', 'transparent'
  ];
  
  return namedColors.includes(color.toLowerCase());
}

/**
 * Convert a color to hex format
 */
export function toHexColor(color: string): string {
  // If already hex, return as-is
  if (/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
    return color.toLowerCase();
  }

  // Create a temporary element to get computed color
  if (typeof document !== 'undefined') {
    const div = document.createElement('div');
    div.style.color = color;
    document.body.appendChild(div);
    
    const computedColor = window.getComputedStyle(div).color;
    document.body.removeChild(div);
    
    // Parse rgb values
    const match = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }
  }

  // Fallback for common colors
  const colorMap: Record<string, string> = {
    black: '#000000',
    white: '#ffffff',
    red: '#ff0000',
    green: '#008000',
    blue: '#0000ff',
    yellow: '#ffff00',
    cyan: '#00ffff',
    magenta: '#ff00ff',
    gray: '#808080',
    grey: '#808080',
    orange: '#ffa500',
    purple: '#800080',
    pink: '#ffc0cb',
    brown: '#a52a2a',
    transparent: '#00000000'
  };

  return colorMap[color.toLowerCase()] || color;
}

/**
 * Generate a filename with timestamp
 */
export function generateFilename(prefix: string, extension: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${prefix}-${timestamp}.${extension}`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}

/**
 * Download a blob as a file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
