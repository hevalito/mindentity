import type { GridCell, GridNode, GridDouble, ShapeType } from '../types.js';
import { SeededRNG } from './rng.js';
import { SHAPE_TYPES } from './shapes.js';
import { pickGradient, GRADIENT_URLS, blendColors } from './colors.js';

// Shape rotation mappings
const SHAPE_ROTATIONS: Record<string, number[]> = {
  [SHAPE_TYPES.CIRCLE_FULL]: [0],
  [SHAPE_TYPES.CIRCLE_HALF]: [0, Math.PI],
  [SHAPE_TYPES.CIRCLE_QURT]: [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5],
  [SHAPE_TYPES.DIAGONAL]: [0, Math.PI * 0.5],
  [SHAPE_TYPES.SQUARE]: [0],
  [SHAPE_TYPES.CROSS]: [0],
};

// Color constants (will be set by setColors function)
export const COLORS = {
  COLOR_10: '',
  COLOR_20: '',
  COLOR_30: '',
  COLOR_70: '',
};

interface GridOptions {
  width: number;
  height: number;
  columns: number;
  rows: number;
  columnGap: number;
  rowGap: number;
  margin: { x: number; y: number };
  excludes?: boolean[][];
}

interface GridResult {
  cells: GridCell[];
  nodes: GridNode[];
  doubles: GridDouble[];
  cellWidth: number;
  cellHeight: number;
}

/**
 * Generate grid layout with cells, nodes, and doubles
 * This exactly matches the original pe() function logic
 */
export function generateGrid(
  rng: SeededRNG,
  {
    width,
    height,
    columns,
    rows,
    columnGap,
    rowGap,
    margin = { x: 0, y: 0 },
    excludes = [],
  }: GridOptions
): GridResult {
  const cells: GridCell[] = [];
  const nodes: GridNode[] = [];
  const doubles: GridDouble[] = [];

  const cellWidth = (width - margin.x * 2 - (columns - 1) * columnGap) / columns;
  const cellHeight = (height - margin.y * 2 - (rows - 1) * rowGap) / rows;

  const cellTypes = [SHAPE_TYPES.SQUARE as ShapeType, SHAPE_TYPES.CIRCLE_QURT as ShapeType];
  const totalCells = columns * rows;
  const cellGrid: (GridCell | undefined)[][] = [];

  // Initialize cell grid - exactly like original
  for (let col = 0; col < columns; col++) {
    cellGrid[col] = [];
  }

  // Generate basic cells - exactly matching original pe() function
  for (let u = 0; u < totalCells; u++) {
    const s = Math.floor(u / columns); // column index (s in original)
    const r = u % rows; // row index (r in original)  
    const p = margin.x + cellWidth * s + columnGap * s; // x position
    const m = margin.y + cellHeight * r + rowGap * r; // y position

    const E = rng.pick([SHAPE_TYPES.SQUARE, SHAPE_TYPES.CIRCLE_QURT])!;
    const S = rng.pick(SHAPE_ROTATIONS[E]) || 0;
    
    // Exact fill logic from original
    const A = E === SHAPE_TYPES.SQUARE
      ? rng.weightedSet([
          { value: COLORS.COLOR_20, weight: 80 },
          { value: pickGradient([], rng), weight: 20 },
        ]) || COLORS.COLOR_20
      : rng.weightedSet([
          { value: COLORS.COLOR_70, weight: 80 },
          { value: pickGradient([], rng), weight: 20 },
        ]) || COLORS.COLOR_70;

    const b: GridCell = {
      index: u,
      x: p,
      y: m,
      column: s,
      row: r,
      width: cellWidth,
      height: cellHeight,
      type: E as ShapeType,
      rotation: S,
      fill: A,
    };

    // Check exclusion exactly like original: excludes[s] && excludes[s][r]
    if (!(excludes[s] && excludes[s][r])) {
      cellGrid[s] || (cellGrid[s] = []);
      cellGrid[s][r] = b;
      cells.push(b);
    }
  }

  // Helper function to get cell at position
  const i = (u: number, s: number): GridCell | undefined => {
    if (cellGrid[u]) return cellGrid[u][s];
    return undefined;
  };

  // Helper function to get cells in a 2x2 area - exactly like original d() function
  const d = (u: number, s: number): number[] => {
    return [i(u, s), i(u + 1, s), i(u + 1, s + 1), i(u, s + 1)]
      .filter(r => r !== undefined)
      .map(r => r!.index);
  };

  // Generate nodes (2x2 areas) - exactly matching original
  for (let u = 0; u < totalCells; u++) {
    const s = Math.floor(u / columns);
    const r = u % rows;
    const p = margin.x + cellWidth * s + columnGap * s;
    const m = margin.y + cellHeight * r + rowGap * r;

    if (s < columns - 1 && r < rows - 1) {
      const E = rng.pick([
        SHAPE_TYPES.CROSS,
        SHAPE_TYPES.CIRCLE_FULL,
        SHAPE_TYPES.DIAGONAL,
      ])!;
      const S = rng.pick(SHAPE_ROTATIONS[E]) || 0;

      let A: string[] = [];
      if (E === SHAPE_TYPES.DIAGONAL) {
        if (S === 0) {
          A.push(GRADIENT_URLS.TOP_RIGHT, GRADIENT_URLS.BOTTOM_LEFT);
        } else {
          A.push(GRADIENT_URLS.TOP_LEFT, GRADIENT_URLS.BOTTOM_RIGHT);
        }
      }

      const b = E === SHAPE_TYPES.DIAGONAL
        ? rng.weightedSet([
            { value: COLORS.COLOR_10, weight: 80 },
            { value: pickGradient(A, rng), weight: 20 },
          ]) || COLORS.COLOR_10
        : COLORS.COLOR_10;

      const D: GridNode = {
        index: u,
        x: p,
        y: m,
        cells: d(s, r),
        neighboursCells: [...d(s + 2, r), ...d(s - 2, r), ...d(s, r + 2), ...d(s, r - 2)],
        width: cellWidth * 2 + columnGap,
        height: cellHeight * 2 + rowGap,
        neighbours: [u + 1, u + rows + 1, u + rows, u + rows - 1, u - 1, u - rows + 1, u - rows - 1, u - rows],
        type: E as ShapeType,
        rotation: S,
        fill: b,
        column: s,
        row: r,
        isNode: true,
      };

      if (D.cells.length === 4) {
        nodes.push(D);
      }
    }
  }

  // Generate doubles (horizontal and vertical pairs) - exactly matching original
  for (let u = 0; u < totalCells; u++) {
    const s = Math.floor(u / columns);
    const r = u % rows;
    const p = margin.x + cellWidth * s + columnGap * s;
    const m = margin.y + cellHeight * r + rowGap * r;

    // Horizontal doubles
    if (s < columns - 1) {
      const S: GridDouble = {
        index: doubles.length,
        type: SHAPE_TYPES.CIRCLE_HALF as ShapeType,
        x: p,
        y: m,
        width: cellWidth * 2 + columnGap,
        cells: [i(s, r), i(s + 1, r)].filter(b => b !== undefined).map(b => b!.index),
        neighbours: [],
        neighboursCells: [
          i(s - 1, r - 1),
          i(s, r - 1),
          i(s + 1, r - 1),
          i(s + 2, r - 1),
          i(s + 2, r),
          i(s + 2, r + 1),
          i(s + 1, r + 1),
          i(s, r + 1),
          i(s - 1, r + 1),
          i(s - 1, r),
        ]
          .filter(b => b !== undefined)
          .map(b => b!.index),
        height: cellHeight,
        color: '', // Will be set later
        rotation: rng.pick(SHAPE_ROTATIONS[SHAPE_TYPES.CIRCLE_HALF]) || 0,
        fill: rng.weightedSet([
          { value: COLORS.COLOR_30, weight: 80 },
          { value: pickGradient([], rng), weight: 20 },
        ]) || COLORS.COLOR_30,
        column: s,
        row: r,
        isDouble: true,
      };

      if (S.cells.length === 2) {
        doubles.push(S);
      }
    }

    // Vertical doubles
    if (r < rows - 1) {
      const S: GridDouble = {
        index: doubles.length,
        type: SHAPE_TYPES.CIRCLE_HALF as ShapeType,
        x: p,
        y: m,
        width: cellWidth,
        height: cellHeight * 2 + rowGap,
        cells: [i(s, r), i(s, r + 1)].filter(b => b !== undefined).map(b => b!.index),
        neighbours: [],
        neighboursCells: [
          i(s - 1, r - 1),
          i(s, r - 1),
          i(s + 1, r - 1),
          i(s + 1, r),
          i(s + 1, r + 1),
          i(s + 1, r + 2),
          i(s, r + 2),
          i(s - 1, r + 2),
          i(s - 1, r + 1),
          i(s - 1, r),
        ]
          .filter(b => b !== undefined)
          .map(b => b!.index),
        fill: rng.weightedSet([
          { value: COLORS.COLOR_30, weight: 80 },
          { value: pickGradient([], rng), weight: 20 },
        ]) || COLORS.COLOR_30,
        rotation: rng.pick(SHAPE_ROTATIONS[SHAPE_TYPES.CIRCLE_HALF]) || 0,
        column: s,
        row: r,
        color: '', // Will be set later
        isDouble: true,
      };

      if (S.cells.length === 2) {
        doubles.push(S);
      }
    }
  }

  return { cells, nodes, doubles, cellWidth, cellHeight };
}

/**
 * Set color constants using exact blending logic from original script
 * This matches the ye() function from the original
 */
export function setColors(backgroundColor: string, foregroundColor: string): void {
  COLORS.COLOR_10 = blendColors(backgroundColor, foregroundColor, 0.9);
  COLORS.COLOR_20 = blendColors(backgroundColor, foregroundColor, 0.8);
  COLORS.COLOR_30 = blendColors(backgroundColor, foregroundColor, 0.7);
  COLORS.COLOR_70 = blendColors(backgroundColor, foregroundColor, 0.3);
}
