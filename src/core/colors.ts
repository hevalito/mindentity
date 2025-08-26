/**
 * Color utilities
 * Ported from the original mindentitiyscript.mjs
 */

import type { ColorConstants } from '../types.js';

/**
 * Color format types
 */
export const COLOR_FORMATS = {
  HEX_STRING: 'hex-string',
  RGB_STRING: 'rgb-string',
  RGBA_STRING: 'rgba-string',
  HSL_STRING: 'hsl-string',
  HSLA_STRING: 'hsla-string',
  RGB_OBJECT: 'rgb-object',
  RGBA_OBJECT: 'rgba-object',
  VEC3_STRING: 'vec3-string',
  VEC4_STRING: 'vec4-string',
  VEC3_ARRAY: 'vec3-array',
  VEC4_ARRAY: 'vec4-array',
  THREE: 'three',
  CSS_COLOR: 'css-color',
} as const;

/**
 * RGBA color array [r, g, b, a] where values are 0-1
 */
export type RGBAArray = [number, number, number, number];

/**
 * RGB color array [r, g, b] where values are 0-1
 */
export type RGBArray = [number, number, number];

/**
 * Parse hex color to RGBA array
 */
export function parseHexColor(hex: string): RGBAArray {
  let color = hex;
  
  // Expand shorthand hex colors
  if (color.length < 7) {
    const r = color[1];
    const g = color[2];
    const b = color[3];
    if (color.length > 4) {
      const a = color[4];
      color = `#${r}${r}${g}${g}${b}${b}${a}${a}`;
    } else {
      color = `#${r}${r}${g}${g}${b}${b}`;
    }
  }
  
  return [
    parseInt(color.substr(1, 2), 16) / 255,
    parseInt(color.substr(3, 2), 16) / 255,
    parseInt(color.substr(5, 2), 16) / 255,
    color.length > 7 ? parseInt(color.substr(7, 2), 16) / 255 : 1,
  ];
}

/**
 * Convert RGBA array to CSS rgba string
 */
export function rgbaArrayToString(rgba: RGBAArray = [0, 0, 0, 1]): string {
  const [r = 0, g = 0, b = 0, a = 1] = rgba;
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
}

/**
 * Convert single component to hex string
 */
export function componentToHex(component: number): string {
  return component.toString(16).padStart(2, '0');
}

/**
 * Convert RGB array to hex string
 */
export function rgbArrayToHex(rgb: RGBArray = [0, 0, 0]): string {
  const [r = 0, g = 0, b = 0] = rgb;
  return `#${[r, g, b]
    .map(c => Math.round(c * 255))
    .map(c => c.toString(16).padStart(2, '0'))
    .join('')}`;
}

/**
 * Generate random color
 */
export function randomColor(format: string = COLOR_FORMATS.RGBA_STRING): string {
  const [r, g, b, a] = [Math.random(), Math.random(), Math.random(), Math.random()];
  
  if (format === COLOR_FORMATS.HEX_STRING) {
    return rgbArrayToHex([r, g, b]);
  }
  if (format === COLOR_FORMATS.RGBA_STRING) {
    return rgbaArrayToString([r, g, b, a]);
  }
  
  return rgbaArrayToString([r, g, b, a]);
}

/**
 * Blend two colors
 */
export function blendColors(color1: string, color2: string, ratio: number): string {
  const rgba1 = parseHexColor(color1);
  const rgba2 = parseHexColor(color2);
  
  const blended: RGBArray = [
    rgba2[0] * ratio + rgba1[0] * (1 - ratio),
    rgba2[1] * ratio + rgba1[1] * (1 - ratio),
    rgba2[2] * ratio + rgba1[2] * (1 - ratio),
  ];
  
  return rgbArrayToHex(blended);
}

/**
 * Parse CSS color string to normalized RGBA values
 */
export function parseColor(color: string): RGBAArray {
  // Handle hex colors
  if (color.startsWith('#')) {
    return parseHexColor(color);
  }
  
  // Handle rgb/rgba colors
  if (color.startsWith('rgb')) {
    const match = color.match(/rgba?\(([^)]+)\)/);
    if (match) {
      const values = match[1].split(',').map(v => parseFloat(v.trim()));
      if (values.length >= 3) {
        return [
          values[0] / 255,
          values[1] / 255,
          values[2] / 255,
          values.length > 3 ? values[3] : 1,
        ];
      }
    }
  }
  
  // Handle hsl/hsla colors
  if (color.startsWith('hsl')) {
    const match = color.match(/hsla?\(([^)]+)\)/);
    if (match) {
      const values = match[1].split(',').map(v => parseFloat(v.trim()));
      if (values.length >= 3) {
        const [h, s, l, a = 1] = values;
        const rgb = hslToRgb(h / 360, s / 100, l / 100);
        return [rgb[0], rgb[1], rgb[2], a];
      }
    }
  }
  
  // Handle named colors (basic set)
  const namedColors: Record<string, string> = {
    black: '#000000',
    white: '#ffffff',
    red: '#ff0000',
    green: '#008000',
    blue: '#0000ff',
    yellow: '#ffff00',
    cyan: '#00ffff',
    magenta: '#ff00ff',
    silver: '#c0c0c0',
    gray: '#808080',
    maroon: '#800000',
    olive: '#808000',
    lime: '#00ff00',
    aqua: '#00ffff',
    teal: '#008080',
    navy: '#000080',
    fuchsia: '#ff00ff',
    purple: '#800080',
  };
  
  const namedColor = namedColors[color.toLowerCase()];
  if (namedColor) {
    return parseHexColor(namedColor);
  }
  
  // Default to black if parsing fails
  console.warn(`Unable to parse color: ${color}, defaulting to black`);
  return [0, 0, 0, 1];
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): RGBArray {
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [r, g, b];
}

/**
 * Color constants that get updated based on foreground/background colors
 */
export const colorConstants: ColorConstants = {
  COLOR_10: '',
  COLOR_20: '',
  COLOR_30: '',
  COLOR_70: '',
};

/**
 * Update color constants based on background and foreground colors
 */
export function updateColorConstants(backgroundColor: string, foregroundColor: string): void {
  colorConstants.COLOR_10 = blendColors(backgroundColor, foregroundColor, 0.9);
  colorConstants.COLOR_20 = blendColors(backgroundColor, foregroundColor, 0.8);
  colorConstants.COLOR_30 = blendColors(backgroundColor, foregroundColor, 0.7);
  colorConstants.COLOR_70 = blendColors(backgroundColor, foregroundColor, 0.3);
}

/**
 * Get gradient URL references
 */
export const GRADIENT_URLS = {
  TOP_LEFT: 'url(#gradient-top-left)',
  BOTTOM_LEFT: 'url(#gradient-bottom-left)',
  TOP_RIGHT: 'url(#gradient-top-right)',
  BOTTOM_RIGHT: 'url(#gradient-bottom-right)',
} as const;

/**
 * Pick a random gradient URL excluding specified ones
 */
export function pickGradient(excludes: string[] = [], rng: { pick: <T>(arr: T[]) => T | undefined }): string {
  const available = Object.values(GRADIENT_URLS).filter(url => !excludes.includes(url));
  return rng.pick(available) || GRADIENT_URLS.TOP_LEFT;
}

/**
 * Validate color string
 */
export function isValidColor(color: string): boolean {
  try {
    parseColor(color);
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert color to hex format
 */
export function toHex(color: string): string {
  const rgba = parseColor(color);
  return rgbArrayToHex([rgba[0], rgba[1], rgba[2]]);
}

/**
 * Convert color to rgba format
 */
export function toRgba(color: string): string {
  const rgba = parseColor(color);
  return rgbaArrayToString(rgba);
}
