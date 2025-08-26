import type { MindentityParams, Mindentity, Gradient, Shape } from '../types.js';
import { SeededRNG } from './rng.js';
import { updateColorConstants, blendColors, GRADIENT_URLS } from './colors.js';
import { parseLetterGrid } from './letters.js';
import { generateGrid, setColors, COLORS } from './grid.js';
import { createShape, SHAPE_TYPES } from './shapes.js';

/**
 * Default configuration matching the original script
 */
export const defaults: Required<Omit<MindentityParams, 'input' | 'seed' | 'offsetsRows' | 'offsetsCols'>> & {
  offsetsRows: number[];
  offsetsCols: number[];
} = {
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
  mode: 'none',
  offsetX: 0,
  offsetY: 0,
  offsetsRows: Array(8).fill(0),
  offsetsCols: Array(8).fill(0),
  renderer: 'svg',
};

/**
 * Generate Mindentity data structure
 */
export function getMindentityData(params: MindentityParams = {}): Mindentity {
  // Merge with defaults
  const config = { ...defaults, ...params };
  
  // Handle array defaults
  if (!params.offsetsRows) config.offsetsRows = Array(config.gridSize).fill(0);
  if (!params.offsetsCols) config.offsetsCols = Array(config.gridSize).fill(0);
  
  // Initialize RNG
  const seed = params.seed || Math.random().toString();
  const rng = new SeededRNG(seed);
  
  // Set up colors
  updateColorConstants(config.backgroundColor, config.foregroundColor);
  setColors(config.backgroundColor, config.foregroundColor);
  
  // Update COLORS object with blended colors
  COLORS.COLOR_10 = blendColors(config.backgroundColor, config.foregroundColor, 0.9);
  COLORS.COLOR_20 = blendColors(config.backgroundColor, config.foregroundColor, 0.8);
  COLORS.COLOR_30 = blendColors(config.backgroundColor, config.foregroundColor, 0.7);
  COLORS.COLOR_70 = blendColors(config.backgroundColor, config.foregroundColor, 0.3);
  
  // Handle letter/string modes
  let excludes: boolean[][] = [];
  if (config.mode === 'letter' || config.mode === 'string') {
    config.gridSize = 8; // Force 8x8 grid for letter modes
    
    if (config.mode === 'string' && config.input) {
      // Use string as seed for deterministic generation
      rng.setSeed(config.input);
    }
    
    if (config.input) {
      excludes = parseLetterGrid(config.input);
    }
  }
  
  // Generate gradients
  const gradientColor = COLORS.COLOR_20;
  const gradients: Gradient[] = [
    {
      name: 'top-left',
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 1,
      stops: [
        { position: 0, color: gradientColor, opacity: 1 },
        { position: 1, color: gradientColor, opacity: 0.2 },
      ],
    },
    {
      name: 'top-right',
      x1: 1,
      y1: 0,
      x2: 0,
      y2: 1,
      stops: [
        { position: 0, color: gradientColor, opacity: 1 },
        { position: 1, color: gradientColor, opacity: 0.2 },
      ],
    },
    {
      name: 'bottom-right',
      x1: 1,
      y1: 1,
      x2: 0,
      y2: 0,
      stops: [
        { position: 0, color: gradientColor, opacity: 1 },
        { position: 1, color: gradientColor, opacity: 0.2 },
      ],
    },
    {
      name: 'bottom-left',
      x1: 0,
      y1: 1,
      x2: 1,
      y2: 0,
      stops: [
        { position: 0, color: gradientColor, opacity: 1 },
        { position: 1, color: gradientColor, opacity: 0.2 },
      ],
    },
  ];
  
  // Generate grid
  const whiteSpaceRatio = config.whiteSpace / 100;
  const { cells, nodes, doubles } = generateGrid(rng, {
    width: config.width,
    height: config.height,
    columns: config.gridSize,
    rows: config.gridSize,
    columnGap: config.gap,
    rowGap: config.gap,
    margin: { x: config.margin, y: config.margin },
    excludes,
  });
  
  // Select shapes based on chances
  const halfShapesCount = Math.round((config.gridSize * config.gridSize * config.halfShapesChance) / 144);
  const nodeShapesCount = config.gridSize === 3 ? 1 : Math.round((config.gridSize * config.gridSize * config.nodeShapesChance) / 144);
  
  // Randomly select doubles and nodes
  const selectedDoubles = rng.shuffle([...doubles]).slice(0, halfShapesCount);
  const selectedNodes = rng.shuffle([...nodes]).slice(0, nodeShapesCount);
  
  // Filter out cells that are covered by selected doubles and nodes
  const coveredCellIndices = new Set([
    ...selectedDoubles.flatMap(d => d.cells),
    ...selectedNodes.flatMap(n => n.cells),
  ]);
  
  const selectedCells = cells.filter(cell => !coveredCellIndices.has(cell.index));
  
  // Apply white space reduction
  const finalCells = rng.shuffle([...selectedCells]).slice(0, Math.floor(selectedCells.length * (1 - whiteSpaceRatio)));
  const finalNodes = rng.shuffle([...selectedNodes]).slice(0, Math.floor(selectedNodes.length * (1 - whiteSpaceRatio)));
  const finalDoubles = rng.shuffle([...selectedDoubles]).slice(0, Math.floor(selectedDoubles.length * (1 - whiteSpaceRatio)));
  
  // Create shapes array
  const shapes: Shape[] = [];
  
  // Add background if not transparent
  if (!config.transparent) {
    shapes.push({
      type: 'rect',
      attributes: {
        x: 0,
        y: 0,
        width: config.width,
        height: config.height,
        fill: config.backgroundColor,
      },
    });
  }
  
  // Process all elements with offset handling
  const allElements = [...finalDoubles, ...finalCells, ...finalNodes];
  
  allElements.forEach(element => {
    const processedElements = applyOffsets(element, {
      offsetX: config.offsetX,
      offsetY: config.offsetY,
      offsetsRows: config.offsetsRows,
      offsetsCols: config.offsetsCols,
      columns: config.gridSize,
      rows: config.gridSize,
      margin: { x: config.margin, y: config.margin },
      columnGap: config.gap,
      rowGap: config.gap,
      cellWidth: (config.width - config.margin * 2 - (config.gridSize - 1) * config.gap) / config.gridSize,
      cellHeight: (config.height - config.margin * 2 - (config.gridSize - 1) * config.gap) / config.gridSize,
    });
    
    processedElements.forEach(processedElement => {
      const shape = createShape({
        x: processedElement.x,
        y: processedElement.y,
        width: processedElement.width,
        height: processedElement.height,
        type: processedElement.type,
        rotation: processedElement.rotation,
        fill: processedElement.fill,
        squareRadius: config.squareRadius,
        crossRadius: config.crossRadius,
        circleRadius: config.circleRadius,
        gap: config.gap,
      });
      
      shapes.push(shape);
    });
  });
  
  return {
    gradients,
    gradientColor,
    width: config.width,
    height: config.height,
    backgroundColor: config.transparent ? 'transparent' : config.backgroundColor,
    shapes,
    seed: seed
  };
}

/**
 * Apply offset transformations to elements - exactly matching original We() function
 */
function applyOffsets(
  element: any,
  {
    offsetX,
    offsetY,
    offsetsRows,
    offsetsCols,
    columns,
    rows,
    margin,
    columnGap,
    rowGap,
    cellWidth,
    cellHeight,
  }: {
    offsetX: number;
    offsetY: number;
    offsetsRows: number[];
    offsetsCols: number[];
    columns: number;
    rows: number;
    margin: { x: number; y: number };
    columnGap: number;
    rowGap: number;
    cellWidth: number;
    cellHeight: number;
  }
): any[] {
  const results = [];
  
  // Calculate offsets exactly like original We() function
  let offsetCol = (offsetX + offsetsRows[element.row]) % columns;
  offsetCol = offsetCol >= 0 ? offsetCol : offsetCol + columns;
  
  let offsetRow = (offsetY + offsetsCols[element.column]) % rows;
  offsetRow = offsetRow >= 0 ? offsetRow : offsetRow + rows;
  
  // Calculate new position
  let newColumn = element.column;
  newColumn += offsetCol;
  newColumn %= columns;
  
  let newRow = element.row;
  newRow += offsetRow;
  newRow %= rows;
  
  // Helper function to calculate position
  const getX = (col: number) => margin.x + cellWidth * (((col % columns) + columns) % columns) + columnGap * (((col % columns) + columns) % columns);
  const getY = (row: number) => margin.y + cellHeight * (((row % rows) + rows) % rows) + rowGap * (((row % rows) + rows) % rows);
  
  const newX = getX(newColumn);
  const newY = getY(newRow);
  
  // Grid boundaries
  const gridWidth = cellWidth * columns + columnGap * (columns - 1);
  const gridHeight = cellHeight * rows + rowGap * (rows - 1);
  const rightBoundary = margin.x + gridWidth;
  const bottomBoundary = margin.y + gridHeight;
  
  // Check wrapping conditions exactly like original
  const horizontalWrap = element.isDouble && newX + element.width > rightBoundary;
  const verticalWrap = element.isDouble && newY + element.height > bottomBoundary;
  const horizontalOffsetMismatch = element.isDouble && element.width > element.height && 
    Math.abs(offsetsCols[element.column] % rows) !== Math.abs(offsetsCols[element.column + 1] % rows);
  const verticalOffsetMismatch = element.isDouble && element.width < element.height && 
    Math.abs(offsetsRows[element.row] % columns) !== Math.abs(offsetsRows[element.row + 1] % columns);
  const nodeHorizontalWrap = element.isNode && newX + element.width > rightBoundary;
  const nodeVerticalWrap = element.isNode && newY + element.height > bottomBoundary;
  
  const needsHorizontalSplit = horizontalWrap || horizontalOffsetMismatch;
  const needsVerticalSplit = verticalWrap || verticalOffsetMismatch;
  const needsNodeSplit = nodeHorizontalWrap || nodeVerticalWrap;
  
  if (needsHorizontalSplit) {
    // Split horizontal double into two quarter circles
    results.push(
      {
        ...element,
        x: newX,
        y: newY,
        isDouble: false,
        type: SHAPE_TYPES.CIRCLE_QURT,
        width: cellWidth,
        height: cellHeight,
        rotation: element.rotation === 0 ? Math.PI * 0.5 : Math.PI,
      },
      {
        ...element,
        x: getX(newColumn + 1),
        y: getY(newRow - offsetsCols[element.column] + offsetsCols[element.column + 1]),
        isDouble: false,
        type: SHAPE_TYPES.CIRCLE_QURT,
        width: cellWidth,
        height: cellHeight,
        rotation: element.rotation === 0 ? 0 : Math.PI * 1.5,
      }
    );
  } else if (needsVerticalSplit) {
    // Split vertical double into two quarter circles
    results.push(
      {
        ...element,
        x: newX,
        y: newY,
        type: SHAPE_TYPES.CIRCLE_QURT,
        isDouble: false,
        width: cellWidth,
        height: cellHeight,
        rotation: element.rotation === 0 ? Math.PI * 0.5 : 0,
      },
      {
        ...element,
        x: getX(newColumn - offsetsRows[element.row] + offsetsRows[element.row + 1]),
        y: getY(newRow + 1),
        isDouble: false,
        type: SHAPE_TYPES.CIRCLE_QURT,
        width: cellWidth,
        height: cellHeight,
        rotation: element.rotation === 0 ? Math.PI : Math.PI * 1.5,
      }
    );
  } else if (needsNodeSplit) {
    // Split node based on type
    const positions = [
      { x: newX, y: newY },
      { x: newX, y: getY(newRow + 1) },
      { x: getX(newColumn + 1), y: newY },
      { x: getX(newColumn + 1), y: getY(newRow + 1) },
    ];
    
    if (element.type === SHAPE_TYPES.CROSS || element.type === SHAPE_TYPES.DIAGONAL) {
      // For CROSS and DIAGONAL, create squares at specific positions
      const targetPositions = element.type === SHAPE_TYPES.CROSS 
        ? positions // All positions for cross
        : element.rotation === 0 
          ? [positions[0], positions[3]] // Top-left and bottom-right for diagonal
          : [positions[2], positions[1]]; // Top-right and bottom-left for diagonal
      
      targetPositions.forEach(pos => {
        results.push({
          ...element,
          x: pos.x,
          y: pos.y,
          width: cellWidth,
          height: cellHeight,
          type: SHAPE_TYPES.SQUARE,
          rotation: 0,
          isNode: false,
        });
      });
    } else {
      // For other node types, create appropriate shapes
      const shapeConfigs = [];
      
      if (!nodeHorizontalWrap && nodeVerticalWrap) {
        // Only vertical wrap
        shapeConfigs.push(
          {
            ...positions[0],
            type: SHAPE_TYPES.CIRCLE_HALF,
            rotation: 0,
            width: element.width,
            height: cellHeight,
          },
          {
            ...positions[1],
            type: SHAPE_TYPES.CIRCLE_HALF,
            rotation: Math.PI,
            width: element.width,
            height: cellHeight,
          }
        );
      } else if (nodeHorizontalWrap && !nodeVerticalWrap) {
        // Only horizontal wrap
        shapeConfigs.push(
          {
            ...positions[0],
            type: SHAPE_TYPES.CIRCLE_HALF,
            rotation: 0,
            width: cellWidth,
            height: element.height,
          },
          {
            ...positions[2],
            type: SHAPE_TYPES.CIRCLE_HALF,
            rotation: Math.PI,
            width: cellWidth,
            height: element.height,
          }
        );
      } else {
        // Both wraps - create quarter circles
        shapeConfigs.push(
          {
            ...positions[2],
            type: SHAPE_TYPES.CIRCLE_QURT,
            rotation: 0,
            width: cellWidth,
            height: cellHeight,
          },
          {
            ...positions[0],
            type: SHAPE_TYPES.CIRCLE_QURT,
            rotation: Math.PI * 0.5,
            width: cellWidth,
            height: cellHeight,
          },
          {
            ...positions[1],
            type: SHAPE_TYPES.CIRCLE_QURT,
            rotation: Math.PI,
            width: cellWidth,
            height: cellHeight,
          },
          {
            ...positions[3],
            type: SHAPE_TYPES.CIRCLE_QURT,
            rotation: Math.PI * 1.5,
            width: cellWidth,
            height: cellHeight,
          }
        );
      }
      
      shapeConfigs.forEach(config => {
        results.push({
          ...element,
          x: config.x,
          y: config.y,
          width: config.width,
          height: config.height,
          type: config.type,
          rotation: config.rotation,
          isNode: false,
        });
      });
    }
  } else {
    // No wrapping needed
    results.push({
      ...element,
      x: newX,
      y: newY,
    });
  }
  
  return results;
}

/**
 * Generate SVG string from Mindentity data
 */
export function getMindentitySVGFromData(data: Mindentity): string {
  const { width, height, gradients, shapes } = data;
  
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${gradients.map(gradient => `
    <linearGradient id="gradient-${gradient.name}" x1="${gradient.x1 * 100}%" y1="${gradient.y1 * 100}%" x2="${gradient.x2 * 100}%" y2="${gradient.y2 * 100}%">
      ${gradient.stops.map(stop => `<stop offset="${stop.position}" stop-color="${stop.color}" stop-opacity="${stop.opacity}" />`).join('\n      ')}
    </linearGradient>`).join('')}
  </defs>
  ${shapes.map(shape => {
    const { type, attributes } = shape;
    const attrs = Object.keys(attributes)
      .map(key => `${key}="${attributes[key]}"`)
      .join(' ');
    
    if (type === 'rect') return `<rect ${attrs} />`;
    if (type === 'circle') return `<circle ${attrs} />`;
    if (type === 'path') return `<path ${attrs} />`;
    return '';
  }).join('\n  ')}
</svg>`;
}

/**
 * Generate SVG string directly from parameters
 */
export function getMindentitySVG(params: MindentityParams = {}): string {
  const data = getMindentityData(params);
  return getMindentitySVGFromData(data);
}

/**
 * Generate PNG data URL from Mindentity data
 */
export function getMindentityDataURLFromData(data: Mindentity, options: { mimetype?: string } = {}): string {
  const { width, height, shapes, gradientColor } = data;
  const { mimetype = 'png' } = options;
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Parse gradient color for canvas gradients
  const parseHex = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 0, g: 0, b: 0 };
  };
  
  const gradientRgb = parseHex(gradientColor);
  
  // Render shapes
  shapes.forEach(({ type, attributes }) => {
    const { fill } = attributes;
    
    if (fill && fill.includes('url')) {
      // Handle gradient fills
      const dataX = attributes['data-x'] as number;
      const dataY = attributes['data-y'] as number;
      const dataWidth = attributes['data-width'] as number;
      const dataHeight = attributes['data-height'] as number;
      
      const gradientMap = new Map([
        ['url(#gradient-top-left)', [dataX, dataY, dataX + dataWidth, dataY + dataHeight]],
        ['url(#gradient-bottom-left)', [dataX, dataY + dataHeight, dataX + dataWidth, dataY]],
        ['url(#gradient-top-right)', [dataX + dataWidth, dataY, dataX, dataY + dataHeight]],
        ['url(#gradient-bottom-right)', [dataX + dataWidth, dataY + dataHeight, dataX, dataY]],
      ]);
      
      const coords = gradientMap.get(fill);
      if (coords) {
        const gradient = ctx.createLinearGradient(coords[0], coords[1], coords[2], coords[3]);
        gradient.addColorStop(0, `rgba(${gradientRgb.r}, ${gradientRgb.g}, ${gradientRgb.b}, 1)`);
        gradient.addColorStop(1, `rgba(${gradientRgb.r}, ${gradientRgb.g}, ${gradientRgb.b}, 0.2)`);
        ctx.fillStyle = gradient;
      }
    } else {
      ctx.fillStyle = fill || '#000000';
    }
    
    if (type === 'circle') {
      const { cx, cy, r } = attributes;
      ctx.beginPath();
      ctx.arc(cx as number, cy as number, r as number, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    } else if (type === 'rect') {
      const { x, y, width, height, rx = 0 } = attributes;
      if ((rx as number) > 0) {
        ctx.beginPath();
        ctx.roundRect(x as number, y as number, width as number, height as number, rx as number);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(x as number, y as number, width as number, height as number);
      }
    } else if (type === 'path') {
      const { d } = attributes;
      ctx.fill(new Path2D(d as string));
    }
  });
  
  return canvas.toDataURL(`image/${mimetype}`);
}

/**
 * Generate PNG data URL directly from parameters
 */
export function getMindentityDataURL(params: MindentityParams = {}): string {
  const data = getMindentityData(params);
  return getMindentityDataURLFromData(data);
}
