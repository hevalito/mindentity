/**
 * Core types for the Mindentity generative logo system
 */

export type Mode = 'none' | 'letter' | 'string';

export type Renderer = 'svg' | 'canvas';

export interface MindentityParams {
  /** Width in pixels */
  width?: number;
  /** Height in pixels */
  height?: number;
  /** Grid size (>= 2) */
  gridSize?: number;
  /** Background color (hex, rgb, hsl, or CSS color) */
  backgroundColor?: string;
  /** Foreground color (hex, rgb, hsl, or CSS color) */
  foregroundColor?: string;
  /** Whether to render with transparent background */
  transparent?: boolean;
  /** Gap between grid cells in pixels */
  gap?: number;
  /** Margin around the entire grid in pixels */
  margin?: number;
  /** White space percentage (0-100) */
  whiteSpace?: number;
  /** Input string for letter/string modes */
  input?: string;
  /** Chance of half shapes (0-100) */
  halfShapesChance?: number;
  /** Chance of node shapes (0-100) */
  nodeShapesChance?: number;
  /** Square corner radius percentage */
  squareRadius?: number;
  /** Cross corner radius percentage */
  crossRadius?: number;
  /** Circle radius percentage */
  circleRadius?: number;
  /** Generation mode */
  mode?: Mode;
  /** X offset for grid positioning */
  offsetX?: number;
  /** Y offset for grid positioning */
  offsetY?: number;
  /** Row-specific offsets (length = gridSize, wraps) */
  offsetsRows?: number[];
  /** Column-specific offsets (length = gridSize, wraps) */
  offsetsCols?: number[];
  /** Seed for deterministic generation */
  seed?: string | number;
  /** Preferred renderer */
  renderer?: Renderer;
}

export interface AnimationOptions {
  /** Whether animation is enabled */
  enabled?: boolean;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Delay before animation starts in milliseconds */
  delay?: number;
  /** Easing function */
  easing?: 'linear' | 'inOutQuad' | 'inOutCubic' | 'spring';
  /** Loop configuration */
  loop?: boolean | { yoyo?: boolean; count?: number };
  /** Animation driver */
  driver?: 'raf' | 'waapi';
  /** Animation preset */
  preset?: 
    | 'draw-grid'
    | 'stagger-radial'
    | 'stagger-random'
    | 'morph-corners'
    | 'pulse-noise'
    | 'gradient-sweep'
    | 'slide-in'
    | 'spin-in';
  /** Per-shape animation configuration */
  perShape?: Partial<{
    delayStepMs: number;
    maxStaggerMs: number;
    opacityFrom: number;
    translateFrom: { x: number; y: number };
    rotateFrom: number;
    scaleFrom: number;
  }>;
  /** Hover effects */
  hover?: { scale?: number; shadow?: boolean };
  /** Focus visible for accessibility */
  focusVisible?: boolean;
}

export interface RenderResult {
  /** DOM element reference */
  mount?: SVGSVGElement | HTMLCanvasElement | null;
  /** Play animation */
  play(): void;
  /** Pause animation */
  pause(): void;
  /** Stop animation */
  stop(): void;
  /** Export as PNG */
  snapshotPNG(filename?: string): Promise<Blob>;
  /** Export as SVG */
  snapshotSVG(filename?: string): Promise<Blob>;
}

export interface GradientStop {
  position: number;
  color: string;
  opacity: number;
}

export interface Gradient {
  name: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stops: GradientStop[];
}

export interface ShapeAttributes {
  [key: string]: string | number | undefined;
  fill?: string;
  'data-x'?: number;
  'data-y'?: number;
  'data-width'?: number;
  'data-height'?: number;
}

export interface Shape {
  type: 'rect' | 'circle' | 'path';
  attributes: ShapeAttributes;
}

export interface Mindentity {
  gradients: Gradient[];
  gradientColor: string;
  width: number;
  height: number;
  backgroundColor: string;
  shapes: Shape[];
  seed?: string | number;
}

// Shape types from the original script
export enum ShapeType {
  CIRCLE_FULL = 'CIRCLE_FULL',
  CIRCLE_HALF = 'CIRCLE_HALF',
  CIRCLE_QURT = 'CIRCLE_QURT',
  DIAGONAL = 'DIAGONAL',
  SQUARE = 'SQUARE',
  CROSS = 'CROSS',
}

// Color constants
export interface ColorConstants {
  COLOR_10: string;
  COLOR_20: string;
  COLOR_30: string;
  COLOR_70: string;
}

// Point interface for geometric calculations
export interface Point {
  x: number;
  y: number;
}

// Vector interface for calculations
export interface Vector {
  dx: number;
  dy: number;
  mag: number;
  magSq: number;
  unit: Point;
  normal: Point;
  p1: Point;
  p2: Point;
  angle: {
    radians: number;
    normalized: number;
    degrees: number;
    degreesNormalized: number;
  };
}

// Grid cell interface
export interface GridCell {
  index: number;
  x: number;
  y: number;
  column: number;
  row: number;
  width: number;
  height: number;
  type: ShapeType;
  rotation: number;
  fill: string;
  isNode?: boolean;
  isDouble?: boolean;
  cells?: number[];
  neighbours?: number[];
  neighboursCells?: number[];
}

// Grid node interface
export interface GridNode {
  index: number;
  x: number;
  y: number;
  cells: number[];
  neighboursCells: number[];
  width: number;
  height: number;
  neighbours: number[];
  type: ShapeType;
  rotation: number;
  fill: string;
  column: number;
  row: number;
  isNode: boolean;
}

// Grid double interface
export interface GridDouble {
  index: number;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  cells: number[];
  neighbours: number[];
  neighboursCells: number[];
  height: number;
  color: string;
  rotation: number;
  fill: string;
  column: number;
  row: number;
  isDouble: boolean;
}

// Default configuration
export interface DefaultConfig extends Required<Omit<MindentityParams, 'input' | 'seed' | 'offsetsRows' | 'offsetsCols'>> {
  offsetsRows: number[];
  offsetsCols: number[];
}
