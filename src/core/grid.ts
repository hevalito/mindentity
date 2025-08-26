import type { GridCell, GridNode, GridDouble, ShapeType } from '../types.js';
import { SeededRNG } from './rng.js';
import { SHAPE_TYPES } from './shapes.js';
import { pickGradient, GRADIENT_URLS } from './colors.js';

// Shape rotation mappings
const SHAPE_ROTATIONS = {
  CIRCLE_FULL: [0],
  CIRCLE_HALF: [0, Math.PI],
  CIRCLE_QURT: [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5],
  DIAGONAL: [0, Math.PI * 0.5],
  SQUARE: [0],
  CROSS: [0],
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

  const cellTypes = [SHAPE_TYPES.SQUARE, SHAPE_TYPES.CIRCLE_QURT];
  const totalCells = columns * rows;
  const cellGrid: (GridCell | undefined)[][] = [];

  // Initialize cell grid
  for (let col = 0; col < columns; col++) {
    cellGrid[col] = [];
  }

  // Generate basic cells
  for (let i = 0; i < totalCells; i++) {
    const column = Math.floor(i / rows);
    const row = i % rows;
    const x = margin.x + cellWidth * column + columnGap * column;
    const y = margin.y + cellHeight * row + rowGap * row;

    const type = rng.pick(cellTypes) as ShapeType;
    const rotation = rng.pick(SHAPE_ROTATIONS[type as keyof typeof SHAPE_ROTATIONS]) || 0;
    const fill = type === SHAPE_TYPES.SQUARE
      ? rng.weightedSet([
          { value: COLORS.COLOR_20, weight: 80 },
          { value: pickGradient([], rng), weight: 20 },
        ]) || COLORS.COLOR_20
      : rng.weightedSet([
          { value: COLORS.COLOR_70, weight: 80 },
          { value: pickGradient([], rng), weight: 20 },
        ]) || COLORS.COLOR_70;

    const cell: GridCell = {
      index: i,
      x,
      y,
      column,
      row,
      width: cellWidth,
      height: cellHeight,
      type,
      rotation,
      fill,
    };

    // Check if cell should be excluded
    if (!(excludes[column] && excludes[column][row])) {
      cellGrid[column][row] = cell;
      cells.push(cell);
    }
  }

  // Helper function to get cell at position
  const getCell = (col: number, row: number): GridCell | undefined => {
    if (cellGrid[col]) return cellGrid[col][row];
    return undefined;
  };

  // Helper function to get cells in a 2x2 area
  const getCells2x2 = (col: number, row: number): number[] => {
    return [
      getCell(col, row),
      getCell(col + 1, row),
      getCell(col + 1, row + 1),
      getCell(col, row + 1),
    ]
      .filter(cell => cell !== undefined)
      .map(cell => cell!.index);
  };

  // Generate nodes (2x2 areas)
  for (let i = 0; i < totalCells; i++) {
    const column = Math.floor(i / rows);
    const row = i % rows;
    const x = margin.x + cellWidth * column + columnGap * column;
    const y = margin.y + cellHeight * row + rowGap * row;

    if (column < columns - 1 && row < rows - 1) {
      const nodeTypes = [SHAPE_TYPES.CROSS, SHAPE_TYPES.CIRCLE_FULL, SHAPE_TYPES.DIAGONAL];
      const type = rng.pick(nodeTypes) as ShapeType;
      const rotation = rng.pick(SHAPE_ROTATIONS[type]);

      const excludedGradients: string[] = [];
      if (type === SHAPE_TYPES.DIAGONAL) {
        if (rotation === 0) {
          excludedGradients.push(GRADIENT_URLS.TOP_RIGHT, GRADIENT_URLS.BOTTOM_LEFT);
        } else {
          excludedGradients.push(GRADIENT_URLS.TOP_LEFT, GRADIENT_URLS.BOTTOM_RIGHT);
        }
      }

      const fill = type === SHAPE_TYPES.DIAGONAL
        ? rng.weightedSet([
            { value: COLORS.COLOR_10, weight: 80 },
            { value: pickGradient(excludedGradients, rng), weight: 20 },
          ]) || COLORS.COLOR_10
        : COLORS.COLOR_10;

      const node: GridNode = {
        index: i,
        x,
        y,
        cells: getCells2x2(column, row),
        neighboursCells: [
          ...getCells2x2(column + 2, row),
          ...getCells2x2(column - 2, row),
          ...getCells2x2(column, row + 2),
          ...getCells2x2(column, row - 2),
        ],
        width: cellWidth * 2 + columnGap,
        height: cellHeight * 2 + rowGap,
        neighbours: [
          i + 1, i + rows + 1, i + rows, i + rows - 1,
          i - 1, i - rows + 1, i - rows - 1, i - rows,
        ],
        type,
        rotation,
        fill,
        column,
        row,
        isNode: true,
      };

      if (node.cells.length === 4) {
        nodes.push(node);
      }
    }
  }

  // Generate doubles (horizontal and vertical pairs)
  for (let i = 0; i < totalCells; i++) {
    const column = Math.floor(i / rows);
    const row = i % rows;
    const x = margin.x + cellWidth * column + columnGap * column;
    const y = margin.y + cellHeight * row + rowGap * row;

    // Horizontal doubles
    if (column < columns - 1) {
      const horizontalDouble: GridDouble = {
        index: doubles.length,
        type: SHAPE_TYPES.CIRCLE_HALF,
        x,
        y,
        width: cellWidth * 2 + columnGap,
        cells: [getCell(column, row), getCell(column + 1, row)]
          .filter(cell => cell !== undefined)
          .map(cell => cell!.index),
        neighbours: [],
        neighboursCells: [
          getCell(column - 1, row - 1),
          getCell(column, row - 1),
          getCell(column + 1, row - 1),
          getCell(column + 2, row - 1),
          getCell(column + 2, row),
          getCell(column + 2, row + 1),
          getCell(column + 1, row + 1),
          getCell(column, row + 1),
          getCell(column - 1, row + 1),
          getCell(column - 1, row),
        ]
          .filter(cell => cell !== undefined)
          .map(cell => cell!.index),
        height: cellHeight,
        color: '', // Will be set later
        rotation: rng.pick(SHAPE_ROTATIONS[SHAPE_TYPES.CIRCLE_HALF]),
        fill: rng.weightedSet([
          { value: COLORS.COLOR_30, weight: 80 },
          { value: pickGradient([], rng), weight: 20 },
        ]) || COLORS.COLOR_30,
        column,
        row,
        isDouble: true,
      };

      if (horizontalDouble.cells.length === 2) {
        doubles.push(horizontalDouble);
      }
    }

    // Vertical doubles
    if (row < rows - 1) {
      const verticalDouble: GridDouble = {
        index: doubles.length,
        type: SHAPE_TYPES.CIRCLE_HALF,
        x,
        y,
        width: cellWidth,
        height: cellHeight * 2 + rowGap,
        cells: [getCell(column, row), getCell(column, row + 1)]
          .filter(cell => cell !== undefined)
          .map(cell => cell!.index),
        neighbours: [],
        neighboursCells: [
          getCell(column - 1, row - 1),
          getCell(column, row - 1),
          getCell(column + 1, row - 1),
          getCell(column + 1, row),
          getCell(column + 1, row + 1),
          getCell(column + 1, row + 2),
          getCell(column, row + 2),
          getCell(column - 1, row + 2),
          getCell(column - 1, row + 1),
          getCell(column - 1, row),
        ]
          .filter(cell => cell !== undefined)
          .map(cell => cell!.index),
        fill: rng.weightedSet([
          { value: COLORS.COLOR_30, weight: 80 },
          { value: pickGradient([], rng), weight: 20 },
        ]) || COLORS.COLOR_30,
        rotation: rng.pick(SHAPE_ROTATIONS[SHAPE_TYPES.CIRCLE_HALF]),
        column,
        row,
        color: '', // Will be set later
        isDouble: true,
      };

      if (verticalDouble.cells.length === 2) {
        doubles.push(verticalDouble);
      }
    }
  }

  return { cells, nodes, doubles, cellWidth, cellHeight };
}

/**
 * Set color constants
 */
export function setColors(backgroundColor: string, foregroundColor: string): void {
  // This function will be implemented when we port the color blending logic
  COLORS.COLOR_10 = backgroundColor; // Placeholder
  COLORS.COLOR_20 = backgroundColor; // Placeholder
  COLORS.COLOR_30 = backgroundColor; // Placeholder
  COLORS.COLOR_70 = foregroundColor; // Placeholder
}
