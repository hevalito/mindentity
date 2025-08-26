import type { Shape, ShapeType, MindentityParams } from '../types.js';
import { SeededRNG } from './rng.js';
import { GRADIENT_URLS, pickGradient } from './colors.js';

// Shape types from original script
export const SHAPE_TYPES = {
  CIRCLE_FULL: 'CIRCLE_FULL',
  CIRCLE_HALF: 'CIRCLE_HALF',
  CIRCLE_QURT: 'CIRCLE_QURT',
  DIAGONAL: 'DIAGONAL',
  SQUARE: 'SQUARE',
  CROSS: 'CROSS',
} as const;

// Rotation angles for each shape type
const SHAPE_ROTATIONS = {
  CIRCLE_FULL: [0],
  CIRCLE_HALF: [0, Math.PI],
  CIRCLE_QURT: [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5],
  DIAGONAL: [0, Math.PI * 0.5],
  SQUARE: [0],
  CROSS: [0],
} as const;

// Color constants
export const COLORS = {
  COLOR_10: '',
  COLOR_20: '',
  COLOR_30: '',
  COLOR_70: '',
};

/**
 * Vector operations
 */
export function vectorBetween(p1: { x: number; y: number }, p2: { x: number; y: number }) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const mag = Math.hypot(dx, dy);
  const magSq = dx * dx + dy * dy;
  const unit = mag !== 0 ? { x: dx / mag, y: dy / mag } : { x: 0, y: 0 };
  const normal = rotatePoint(unit, { x: 0, y: 0 }, Math.PI / 2);
  const angle = Math.atan2(dy, dx);
  const normalized = 2 * Math.PI + (Math.round(angle) % (2 * Math.PI));
  const degrees = (180 * angle) / Math.PI;
  const degreesNormalized = (360 + Math.round(degrees)) % 360;

  return {
    dx,
    dy,
    mag,
    magSq,
    unit,
    normal,
    p1: { ...p1 },
    p2: { ...p2 },
    angle: {
      radians: angle,
      normalized,
      degrees,
      degreesNormalized,
    },
  };
}

export function roundTo(value: number, decimals = 2): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}

export function rotatePoint(
  point: { x: number; y: number },
  center: { x: number; y: number },
  angle: number
): { x: number; y: number } {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const x = cos * (point.x - center.x) + sin * (point.y - center.y) + center.x;
  const y = cos * (point.y - center.y) - sin * (point.x - center.x) + center.y;
  return { x, y };
}

/**
 * SVG path parsing and manipulation
 */
const COMMAND_LENGTHS: Record<string, number> = { a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0 };
const COMMAND_REGEX = /([astvzqmhlc])([^astvzqmhlc]*)/gi;

function parsePathData(path: string): Array<[string, ...number[]]> {
  const commands: Array<[string, ...number[]]> = [];
  path.replace(COMMAND_REGEX, (match, command, args) => {
    let cmd = command.toLowerCase();
    const numbers = parseNumbers(args);
    
    if (cmd === 'm' && numbers.length > 2) {
      commands.push([command, ...numbers.splice(0, 2)]);
      cmd = 'l';
      command = command === 'm' ? 'l' : 'L';
    }
    
    while (true) {
      if (numbers.length === COMMAND_LENGTHS[cmd]) {
        numbers.unshift(command);
        commands.push(numbers as [string, ...number[]]);
        break;
      }
      if (numbers.length < COMMAND_LENGTHS[cmd]) {
        throw new Error('malformed path data');
      }
      commands.push([command, ...numbers.splice(0, COMMAND_LENGTHS[cmd])]);
    }
    return match;
  });
  return commands;
}

function parseNumbers(str: string): number[] {
  const matches = str.match(/-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/gi);
  return matches ? matches.map(Number) : [];
}

/**
 * Add rounded corners to SVG path
 */
export function addRoundedCorners(
  path: string,
  radius: number | number[],
  style: 'circle' | 'approx' | 'hand' = 'circle'
): string {
  if (!path || radius === 0 || (Array.isArray(radius) && radius.every(r => r === 0))) {
    return path;
  }

  let commands = parsePathData(path).filter(cmd => cmd[0] !== 'Z');
  const newCommands: string[] = [];

  for (let i = 0; i < commands.length; i++) {
    const nextIndex = (i + 1) % commands.length;
    const afterNextIndex = (i + 2) % commands.length;

    let [, x1, y1] = commands[i];
    let [, x2, y2] = commands[nextIndex];
    let [, x3, y3] = commands[afterNextIndex];

    const p1 = { x: x1, y: y1 };
    const p2 = { x: x2, y: y2 };
    const p3 = { x: x3, y: y3 };

    const v1 = vectorBetween(p2, p1);
    const v2 = vectorBetween(p2, p3);

    const angle = Math.abs(
      Math.atan2(
        v1.dx * v2.dy - v1.dy * v2.dx, // cross product
        v1.dx * v2.dx + v1.dy * v2.dy  // dot product
      )
    );

    const currentRadius = Array.isArray(radius) ? radius[i] : radius;
    let r = Math.min(currentRadius, v1.mag / 2, v2.mag / 2);

    if (currentRadius === 0) {
      newCommands.push(`L ${p1.x} ${p1.y}`);
      newCommands.push(`L ${p2.x} ${p2.y}`);
      continue;
    }

    const arcRadius = r;
    const halfAngle = Math.cos(angle / 2) * arcRadius;
    const offset = Math.sin(angle / 2) * halfAngle;
    const controlDistance = Math.cos(angle / 2) * halfAngle;
    const bezierRadius = offset / (controlDistance / arcRadius);
    const segments = Math.ceil((2 * Math.PI) / (Math.PI - angle));

    let controlLength: number;
    if (style === 'circle') {
      controlLength = (4 / 3) * Math.tan(Math.PI / (2 * segments)) * bezierRadius;
    } else if (style === 'approx') {
      controlLength = (4 / 3) * Math.tan(Math.PI / (2 * ((2 * Math.PI) / angle))) * r * 
        (angle < Math.PI / 2 ? 1 + Math.cos(angle) : 2 - Math.sin(angle));
    } else { // hand
      controlLength = (4 / 3) * Math.tan(Math.PI / (2 * ((2 * Math.PI) / angle))) * r * (2 + Math.sin(angle));
    }

    const controlOffset = r - controlLength;

    let startPoint = {
      x: p2.x + v1.unit.x * r,
      y: p2.y + v1.unit.y * r,
    };
    let startControl = {
      x: p2.x + v1.unit.x * controlOffset,
      y: p2.y + v1.unit.y * controlOffset,
    };
    let endPoint = {
      x: p2.x + v2.unit.x * r,
      y: p2.y + v2.unit.y * r,
    };
    let endControl = {
      x: p2.x + v2.unit.x * controlOffset,
      y: p2.y + v2.unit.y * controlOffset,
    };

    const round = (point: { x: number; y: number }) => ({
      x: roundTo(point.x, 3),
      y: roundTo(point.y, 3),
    });

    startPoint = round(startPoint);
    startControl = round(startControl);
    endPoint = round(endPoint);
    endControl = round(endControl);

    if (i === commands.length - 1) {
      newCommands.unshift(`M ${endPoint.x} ${endPoint.y}`);
    }

    newCommands.push(`L ${startPoint.x} ${startPoint.y}`);
    newCommands.push(`C ${startControl.x} ${startControl.y}, ${endControl.x} ${endControl.y}, ${endPoint.x} ${endPoint.y}`);
  }

  newCommands.push('Z');
  return newCommands.join(' ');
}

/**
 * Shape creation functions
 */
export function createCircle({
  x = 0,
  y = 0,
  width = 1,
  height = 1,
  fill = '',
  attributes = {},
}: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  attributes?: Record<string, any>;
}): Shape {
  return {
    type: 'circle',
    attributes: {
      ...attributes,
      cx: x + width * 0.5,
      cy: y + height * 0.5,
      r: width * 0.5,
      fill,
    },
  };
}

export function createRect({
  x = 0,
  y = 0,
  width = 1,
  height = 1,
  fill = 'red',
  radius,
  attributes = {},
}: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  radius?: number;
  attributes?: Record<string, any>;
}): Shape {
  return {
    type: 'rect',
    attributes: {
      ...attributes,
      x,
      y,
      width,
      height,
      fill,
      rx: radius,
    },
  };
}

export function createQuarterCircle({
  x = 0,
  y = 0,
  width = 1,
  height = 1,
  radius,
  fill,
  rotation = 0,
  attributes = {},
}: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  fill?: string;
  rotation?: number;
  attributes?: Record<string, any>;
}): Shape {
  const r = radius!;
  const size = Math.min(width, height);
  const inner = size - r;
  const outer = r;
  const hypotenuse = Math.sqrt(inner * inner - r * r);
  const angle = Math.atan(outer / hypotenuse);
  const cos = Math.sin(angle) * size;
  const sin = Math.cos(angle) * size;

  let points: Array<[number, number]> = [
    [r, height],
    [hypotenuse, height],
    [sin, height - cos],
    [cos, height - sin],
    [0, height - hypotenuse],
    [0, height - r],
    [r, height],
  ];

  points = points
    .map(([px, py]) => ({ x: px, y: py }))
    .map(p => rotatePoint(p, { x: size * 0.5, y: size * 0.5 }, rotation))
    .map(p => [p.x + x, p.y + y]);

  let pathData = `M ${points[0][0]} ${points[0][1]}`;
  pathData += `L ${points[1][0]} ${points[1][1]}`;
  pathData += `A ${r} ${r} 0 0 0 ${points[2][0]} ${points[2][1]}`;
  pathData += `A ${size} ${size} 0 0 0 ${points[3][0]} ${points[3][1]}`;
  pathData += `A ${r} ${r} 0 0 0 ${points[4][0]} ${points[4][1]}`;
  pathData += `L ${points[5][0]} ${points[5][1]}`;
  pathData += `A ${r} ${r} 0 0 0 ${points[6][0]} ${points[6][1]}`;

  return {
    type: 'path',
    attributes: {
      ...attributes,
      d: pathData,
      fill,
    },
  };
}

export function createHalfCircle({
  x = 0,
  y = 0,
  width = 1,
  height = 1,
  radius = 0,
  rotation = 0,
  fill = 'red',
  attributes = {},
}: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  rotation?: number;
  fill?: string;
  attributes?: Record<string, any>;
}): Shape {
  const r = radius;
  const maxDim = Math.max(width, height);
  const minDim = Math.min(height, width);
  const radiusX = width * (width > height ? 0.5 : 1);
  const radiusY = height * (width < height ? 0.5 : 1);
  const mainRadius = width > height ? radiusX : radiusY;
  const inner = mainRadius - r;
  const outer = r;
  const hypotenuse = Math.sqrt(inner * inner - r * r);
  const angle = Math.atan(outer / hypotenuse);
  const cos = Math.sin(angle) * mainRadius;
  const sin = Math.cos(angle) * mainRadius;

  let pathData = '';
  let points: Array<[number, number]>;

  if (width > height) {
    points = [
      [maxDim * 0.5 - hypotenuse, minDim],
      [maxDim * 0.5 + hypotenuse, minDim],
      [maxDim * 0.5 + sin, minDim - cos],
      [maxDim * 0.5 - sin, minDim - cos],
      [maxDim * 0.5 - hypotenuse, minDim],
    ];
  } else {
    points = [
      [minDim, maxDim * 0.5 + hypotenuse],
      [minDim, maxDim * 0.5 - hypotenuse],
      [minDim - cos, maxDim * 0.5 - sin],
      [minDim - cos, maxDim * 0.5 + sin],
      [minDim, maxDim * 0.5 + hypotenuse],
    ];
  }

  points = points
    .map(([px, py]) => ({ x: px, y: py }))
    .map(p => rotatePoint(p, { x: width * 0.5, y: height * 0.5 }, rotation))
    .map(p => [p.x + x, p.y + y]);

  pathData += `M ${points[0][0]} ${points[0][1]}`;
  pathData += `L ${points[1][0]} ${points[1][1]}`;
  pathData += `A ${r} ${r} 0 0 0 ${points[2][0]} ${points[2][1]}`;
  pathData += `A ${radiusX} ${radiusY} 0 0 0 ${points[3][0]} ${points[3][1]}`;
  pathData += `A ${r} ${r} 0 0 0 ${points[4][0]} ${points[4][1]}`;
  pathData += 'Z';

  return {
    type: 'path',
    attributes: {
      ...attributes,
      d: pathData,
      fill,
    },
  };
}

/**
 * Main shape creation function
 */
export function createShape({
  x,
  y,
  width,
  height,
  type,
  rotation,
  fill,
  squareRadius = 12,
  crossRadius = 6,
  circleRadius = 4,
  gap = 10,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  type: ShapeType;
  rotation: number;
  fill: string;
  squareRadius?: number;
  crossRadius?: number;
  circleRadius?: number;
  gap?: number;
}): Shape {
  const dataAttributes = {
    'data-x': x,
    'data-y': y,
    'data-width': width,
    'data-height': height,
  };

  switch (type) {
    case SHAPE_TYPES.SQUARE:
      return createRect({
        x,
        y,
        width,
        height,
        radius: (squareRadius / 100) * width,
        fill,
        attributes: dataAttributes,
      });

    case SHAPE_TYPES.CIRCLE_FULL:
      return createCircle({
        x,
        y,
        width,
        height,
        fill,
        attributes: dataAttributes,
      });

    case SHAPE_TYPES.DIAGONAL:
    case SHAPE_TYPES.CROSS: {
      const cellSize = (width - gap) / 2;
      const diagonal = Math.sqrt(cellSize * cellSize + cellSize * cellSize);
      const offset = height * 0.5 + Math.tan(Math.PI * 0.25) * (width * 0.5 - diagonal * 0.5);
      const complement = width - offset;

      let points: Array<[number, number]> = [];

      if (type === SHAPE_TYPES.DIAGONAL) {
        points = rotation === 0
          ? [
              [0, 0],
              [complement, 0],
              [width, height - complement],
              [width, height],
              [width - complement, height],
              [0, offset],
            ]
          : [
              [width, 0],
              [width, offset],
              [complement, height],
              [0, height],
              [0, height - offset],
              [width - complement, 0],
            ];

        points = points.map(([px, py]) => [px + x, py + y]);

        let pathData = points.map(([px, py], i) => `${i === 0 ? 'M' : 'L'} ${px} ${py}`).join(' ');
        pathData += ' Z';

        const cornerRadius = (crossRadius / 100) * width * 0.5;
        const smallRadius = cornerRadius * 0.5;
        pathData = addRoundedCorners(pathData, [smallRadius, smallRadius, cornerRadius, smallRadius, smallRadius, cornerRadius]);

        return {
          type: 'path',
          attributes: {
            ...dataAttributes,
            d: pathData,
            fill,
          },
        };
      } else if (type === SHAPE_TYPES.CROSS) {
        const innerSize = (width - diagonal) * 0.5;
        const innerHeight = (height - diagonal) * 0.5;

        points = [
          [0, 0],
          [complement, 0],
          [width * 0.5, innerHeight],
          [width - complement, 0],
          [width, 0],
          [width, complement],
          [width - innerSize, height * 0.5],
          [width, height - complement],
          [width, height],
          [width - complement, height],
          [width * 0.5, height - innerHeight],
          [complement, height],
          [0, height],
          [0, width - complement],
          [innerSize, height * 0.5],
          [0, complement],
        ];

        points = points.map(([px, py]) => [px + x, py + y]);

        let pathData = points.map(([px, py], i) => `${i === 0 ? 'M' : 'L'} ${px} ${py}`).join(' ');
        pathData += ' Z';

        const cornerRadius = (crossRadius / 100) * width * 0.5;
        const smallRadius = cornerRadius * 0.5;
        const mediumRadius = cornerRadius;

        pathData = addRoundedCorners(pathData, [
          smallRadius, 0, smallRadius, mediumRadius, smallRadius, 0, smallRadius, mediumRadius,
          smallRadius, 0, smallRadius, mediumRadius, smallRadius, 0, smallRadius, mediumRadius,
        ]);

        return {
          type: 'path',
          attributes: {
            ...dataAttributes,
            d: pathData,
            fill: COLORS.COLOR_10,
          },
        };
      }
      break;
    }

    case SHAPE_TYPES.CIRCLE_QURT:
      return createQuarterCircle({
        x,
        y,
        width,
        height,
        radius: (circleRadius / 100) * width,
        rotation,
        fill,
        attributes: dataAttributes,
      });

    case SHAPE_TYPES.CIRCLE_HALF:
      return createHalfCircle({
        x,
        y,
        width,
        height,
        radius: ((circleRadius * 0.5) / 100) * Math.max(width, height),
        rotation,
        fill,
        attributes: dataAttributes,
      });
  }

  // Fallback
  return createRect({
    x,
    y,
    width,
    height,
    fill,
    attributes: dataAttributes,
  });
}
