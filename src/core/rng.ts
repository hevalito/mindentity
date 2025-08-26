/**
 * Seeded Random Number Generator
 * Ported from the original mindentitiyscript.mjs
 */

import type { Point } from '../types.js';

// Simplex noise implementation
class SimplexNoise {
  private perm: Float64Array;
  private grad2: Float64Array;
  private grad3: Float64Array;
  private grad4: Float64Array;

  constructor(random: () => number) {
    this.perm = this.buildPermutationTable(random);
    this.grad2 = new Float64Array(this.perm).map(i => GRAD2[(i % 12) * 2]);
    this.grad3 = new Float64Array(this.perm).map(i => GRAD3[(i % 12) * 3]);
    this.grad4 = new Float64Array(this.perm).map(i => GRAD4[(i % 32) * 4]);
  }

  private buildPermutationTable(random: () => number): Float64Array {
    const p = new Uint8Array(512);
    for (let i = 0; i < 512 / 2; i++) p[i] = i;
    for (let i = 0; i < 512 / 2 - 1; i++) {
      const r = i + ~~(random() * (256 - i));
      const aux = p[i];
      p[i] = p[r];
      p[r] = aux;
    }
    for (let i = 256; i < 512; i++) p[i] = p[i - 256];
    return new Float64Array(p);
  }

  noise2D(x: number, y: number): number {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    
    let n0 = 0, n1 = 0, n2 = 0;
    
    const s = (x + y) * F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = x - X0;
    const y0 = y - Y0;
    
    let i1: number, j1: number;
    if (x0 > y0) { i1 = 1; j1 = 0; }
    else { i1 = 0; j1 = 1; }
    
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;
    
    const ii = i & 255;
    const jj = j & 255;
    
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      const gi0 = ii + this.perm[jj];
      const g0x = this.grad2[gi0];
      const g0y = this.grad2[gi0 + 1];
      t0 *= t0;
      n0 = t0 * t0 * (g0x * x0 + g0y * y0);
    }
    
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      const gi1 = ii + i1 + this.perm[jj + j1];
      const g1x = this.grad2[gi1];
      const g1y = this.grad2[gi1 + 1];
      t1 *= t1;
      n1 = t1 * t1 * (g1x * x1 + g1y * y1);
    }
    
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      const gi2 = ii + 1 + this.perm[jj + 1];
      const g2x = this.grad2[gi2];
      const g2y = this.grad2[gi2 + 1];
      t2 *= t2;
      n2 = t2 * t2 * (g2x * x2 + g2y * y2);
    }
    
    return 70 * (n0 + n1 + n2);
  }

  noise3D(x: number, y: number, z: number): number {
    // Simplified 3D implementation - can be expanded if needed
    return this.noise2D(x + z * 0.1, y + z * 0.1);
  }

  noise4D(x: number, y: number, z: number, w: number): number {
    // Simplified 4D implementation - can be expanded if needed
    return this.noise2D(x + z * 0.1 + w * 0.01, y + z * 0.1 + w * 0.01);
  }
}

// Gradient tables
const GRAD2 = new Float64Array([
  1, 1, -1, 1, 1, -1, -1, -1, 1, 0, -1, 0, 1, 0, -1, 0, 0, 1, 0, -1, 0, 1, 0, -1,
]);

const GRAD3 = new Float64Array([
  1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0, -1, 1, 0, 1, -1, 0,
  -1, -1,
]);

const GRAD4 = new Float64Array([
  0, 1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1, 0, -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1, 1,
  0, 1, 1, 1, 0, 1, -1, 1, 0, -1, 1, 1, 0, -1, -1, -1, 0, 1, 1, -1, 0, 1, -1, -1, 0, -1, 1, -1, 0, -1, -1, 1, 1,
  0, 1, 1, 1, 0, -1, 1, -1, 0, 1, 1, -1, 0, -1, -1, 1, 0, 1, -1, 1, 0, -1, -1, -1, 0, 1, -1, -1, 0, -1, 1, 1, 1,
  0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1, 0, -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1, 0,
]);

/**
 * Seeded Random Number Generator
 * Based on the original script's Ut function
 */
export class SeededRNG {
  private seed?: string | number;
  private rng: () => number;
  private noise: SimplexNoise;
  private gaussianNext: number | null = null;
  private hasGaussianNext = false;

  constructor(seed?: string | number) {
    this.seed = seed;
    this.rng = this.createSeededRandom(seed);
    this.noise = new SimplexNoise(this.rng);
  }

  private createSeededRandom(seed?: string | number): () => number {
    if (seed === undefined) {
      return Math.random;
    }

    // Simple seeded random implementation
    let s = typeof seed === 'string' ? this.hashString(seed) : seed;
    return () => {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
    };
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /** Get the current seed */
  getSeed(): string | number | undefined {
    return this.seed;
  }

  /** Set a new seed */
  setSeed(seed?: string | number): void {
    this.seed = seed;
    this.rng = this.createSeededRandom(seed);
    this.noise = new SimplexNoise(this.rng);
    this.gaussianNext = null;
    this.hasGaussianNext = false;
  }

  /** Generate a random number [0, 1) */
  value(): number {
    return this.rng();
  }

  /** Generate a non-zero random number */
  valueNonZero(): number {
    let val = 0;
    while (val === 0) {
      val = this.value();
    }
    return val;
  }

  /** Generate random sign (-1 or 1) */
  sign(): number {
    return this.boolean() ? 1 : -1;
  }

  /** Generate random boolean */
  boolean(): boolean {
    return this.value() > 0.5;
  }

  /** Generate random boolean with given probability */
  chance(probability = 0.5): boolean {
    return this.value() < probability;
  }

  /** Generate random number in range [min, max) */
  range(min: number, max?: number): number {
    if (max === undefined) {
      max = min;
      min = 0;
    }
    return this.value() * (max - min) + min;
  }

  /** Generate random integer in range [min, max) */
  rangeFloor(min: number, max?: number): number {
    return Math.floor(this.range(min, max));
  }

  /** Pick random element from array */
  pick<T>(array: T[]): T | undefined {
    if (array.length === 0) return undefined;
    return array[this.rangeFloor(0, array.length)];
  }

  /** Shuffle array (Fisher-Yates) */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.rangeFloor(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /** Generate point on circle */
  onCircle(radius = 1): Point {
    const angle = this.value() * 2 * Math.PI;
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    };
  }

  /** Generate point inside circle */
  insideCircle(radius = 1): Point {
    const point = this.onCircle(1);
    const r = radius * Math.sqrt(this.value());
    return {
      x: point.x * r,
      y: point.y * r,
    };
  }

  /** Generate weighted random index */
  weighted(weights: number[]): number {
    if (weights.length === 0) return -1;
    
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    if (totalWeight <= 0) throw new Error('Weights must sum to > 0');
    
    let random = this.value() * totalWeight;
    for (let i = 0; i < weights.length; i++) {
      if (random < weights[i]) return i;
      random -= weights[i];
    }
    return 0;
  }

  /** Pick from weighted set */
  weightedSet<T>(items: Array<{ value: T; weight: number }>): T | null {
    if (items.length === 0) return null;
    const index = this.weighted(items.map(item => item.weight));
    return index >= 0 ? items[index].value : null;
  }

  /** Generate Gaussian distributed number */
  gaussian(mean = 0, stdDev = 1): number {
    if (this.hasGaussianNext) {
      this.hasGaussianNext = false;
      const result = this.gaussianNext!;
      this.gaussianNext = null;
      return mean + stdDev * result;
    }

    let u = 0, v = 0, s = 0;
    do {
      u = this.value() * 2 - 1;
      v = this.value() * 2 - 1;
      s = u * u + v * v;
    } while (s >= 1 || s === 0);

    const multiplier = Math.sqrt(-2 * Math.log(s) / s);
    this.gaussianNext = v * multiplier;
    this.hasGaussianNext = true;
    return mean + stdDev * (u * multiplier);
  }

  /** 1D noise */
  noise1D(x: number, frequency = 1, amplitude = 1): number {
    return amplitude * this.noise.noise2D(x * frequency, 0);
  }

  /** 2D noise */
  noise2D(x: number, y: number, frequency = 1, amplitude = 1): number {
    return amplitude * this.noise.noise2D(x * frequency, y * frequency);
  }

  /** 3D noise */
  noise3D(x: number, y: number, z: number, frequency = 1, amplitude = 1): number {
    return amplitude * this.noise.noise3D(x * frequency, y * frequency, z * frequency);
  }

  /** 4D noise */
  noise4D(x: number, y: number, z: number, w: number, frequency = 1, amplitude = 1): number {
    return amplitude * this.noise.noise4D(x * frequency, y * frequency, z * frequency, w * frequency);
  }

  /** Regenerate noise permutation table */
  permuteNoise(): void {
    this.noise = new SimplexNoise(this.rng);
  }
}

/**
 * Generate a random seed string
 */
export function generateSeed(): string {
  let seed = '0x';
  for (let i = 64; i > 0; --i) {
    seed += '0123456789abcdef'[~~(Math.random() * 16)];
  }
  return seed;
}

/**
 * Create a new seeded RNG instance
 */
export function createRNG(seed?: string | number): SeededRNG {
  return new SeededRNG(seed);
}
