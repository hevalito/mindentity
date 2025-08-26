import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { MindentityParams, AnimationOptions, Mindentity } from '../types.js';
import { getMindentityData, getMindentitySVG, getMindentityDataURL } from '../core/generation.js';

export interface UseMindentityReturn {
  ref: React.RefObject<SVGSVGElement | HTMLCanvasElement>;
  data: Mindentity | null;
  playing: boolean;
  play: () => void;
  pause: () => void;
  stop: () => void;
  regenerate: (next?: Partial<MindentityParams>) => void;
  toPNG: () => Promise<Blob>;
  toSVG: () => Promise<Blob>;
}

export function useMindentity(
  params: MindentityParams,
  animation?: AnimationOptions
): UseMindentityReturn {
  const ref = useRef<SVGSVGElement | HTMLCanvasElement>(null);
  const [data, setData] = useState<Mindentity | null>(null);
  const [playing, setPlaying] = useState(false);
  const animationIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Generate data when params change
  useEffect(() => {
    const newData = getMindentityData(params);
    setData(newData);
  }, [params]);

  const play = useCallback(() => {
    if (!animation?.enabled || playing) return;
    
    setPlaying(true);
    startTimeRef.current = performance.now();
    
    const animate = (currentTime: number) => {
      if (!startTimeRef.current) return;
      
      const elapsed = currentTime - startTimeRef.current;
      const duration = animation.duration || 1000;
      const progress = Math.min(elapsed / duration, 1);
      
      // Apply animation to the element
      if (ref.current && data) {
        applyAnimationFrame(ref.current, data, progress, animation);
      }
      
      if (progress < 1) {
        animationIdRef.current = requestAnimationFrame(animate);
      } else {
        setPlaying(false);
        
        // Handle looping
        if (animation.loop) {
          const isInfinite = animation.loop === true || 
            (typeof animation.loop === 'object' && animation.loop.count === Infinity);
          
          if (isInfinite) {
            setTimeout(() => {
              startTimeRef.current = null;
              play();
            }, animation.delay || 0);
          }
        }
      }
    };
    
    animationIdRef.current = requestAnimationFrame(animate);
  }, [animation, playing, data]);

  const pause = useCallback(() => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
    setPlaying(false);
  }, []);

  const stop = useCallback(() => {
    pause();
    startTimeRef.current = null;
    
    // Reset to initial state
    if (ref.current && data) {
      applyAnimationFrame(ref.current, data, 0, animation);
    }
  }, [pause, data, animation]);

  const regenerate = useCallback((next?: Partial<MindentityParams>) => {
    const newParams = { ...params, ...next };
    
    // If no seed provided, generate a new one
    if (!newParams.seed) {
      newParams.seed = Math.random().toString(36).substring(2, 15);
    }
    
    const newData = getMindentityData(newParams);
    setData(newData);
  }, [params]);

  const toPNG = useCallback(async (): Promise<Blob> => {
    if (!data) throw new Error('No data available');
    
    const canvas = document.createElement('canvas');
    canvas.width = params.width || 512;
    canvas.height = params.height || 512;
    
    const dataURL = getMindentityDataURL({ ...params, renderer: 'canvas' });
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Could not create blob'));
          }
        }, 'image/png');
      };
      img.onerror = () => reject(new Error('Could not load image'));
      img.src = dataURL;
    });
  }, [data, params]);

  const toSVG = useCallback(async (): Promise<Blob> => {
    if (!data) throw new Error('No data available');
    
    const svgString = getMindentitySVG(params);
    return new Blob([svgString], { type: 'image/svg+xml' });
  }, [data, params]);

  // Auto-play on mount if enabled
  useEffect(() => {
    if (animation?.enabled && data) {
      const delay = animation.delay || 0;
      const timer = setTimeout(() => {
        play();
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [animation?.enabled, animation?.delay, data, play]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return {
    ref,
    data,
    playing,
    play,
    pause,
    stop,
    regenerate,
    toPNG,
    toSVG,
  };
}

function applyAnimationFrame(
  element: SVGSVGElement | HTMLCanvasElement,
  data: Mindentity,
  progress: number,
  animation?: AnimationOptions
) {
  if (!animation?.preset) return;

  const easing = getEasingFunction(animation.easing || 'linear');
  const easedProgress = easing(progress);

  if (element instanceof SVGSVGElement) {
    applyAnimationToSVG(element, data, easedProgress, animation);
  } else if (element instanceof HTMLCanvasElement) {
    applyAnimationToCanvas(element, data, easedProgress, animation);
  }
}

function applyAnimationToSVG(
  svg: SVGSVGElement,
  data: Mindentity,
  progress: number,
  animation: AnimationOptions
) {
  const shapes = svg.querySelectorAll('rect, circle, path');
  const preset = animation.preset!;
  const perShape = animation.perShape || {};

  shapes.forEach((shape, index) => {
    let shapeProgress = progress;
    
    // Apply staggering based on preset
    if (preset === 'stagger-radial') {
      const delay = calculateRadialDelay(shape, index, shapes.length, perShape);
      shapeProgress = Math.max(0, progress - delay);
    } else if (preset === 'stagger-random') {
      const delay = calculateRandomDelay(index, shapes.length, perShape, data.seed);
      shapeProgress = Math.max(0, progress - delay);
    } else if (preset === 'draw-grid') {
      const delay = calculateGridDelay(index, shapes.length, perShape);
      shapeProgress = Math.max(0, progress - delay);
    }

    // Apply transformations based on preset
    applyShapeTransform(shape as SVGElement, shapeProgress, preset, perShape);
  });
}

function applyAnimationToCanvas(
  canvas: HTMLCanvasElement,
  data: Mindentity,
  progress: number,
  animation: AnimationOptions
) {
  // For canvas, we need to re-render the entire frame
  // This would require access to the rendering context and data
  // For now, we'll implement a basic opacity animation
  canvas.style.opacity = progress.toString();
}

function calculateRadialDelay(
  shape: Element,
  index: number,
  total: number,
  perShape: any
): number {
  // Calculate distance from center for radial stagger
  const rect = shape.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  // Normalize distance (0-1)
  const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
  const distance = Math.sqrt(centerX * centerX + centerY * centerY) / maxDistance;
  
  const maxDelay = perShape.maxStaggerMs || 500;
  return (distance * maxDelay) / 1000; // Convert to 0-1 range
}

function calculateRandomDelay(
  index: number,
  total: number,
  perShape: any,
  seed?: string | number
): number {
  // Use seeded random for consistent animation order
  const seedValue = typeof seed === 'string' ? seed.length : (seed || 0);
  const random = Math.sin(index + seedValue) * 0.5 + 0.5;
  
  const maxDelay = perShape.maxStaggerMs || 500;
  return (random * maxDelay) / 1000;
}

function calculateGridDelay(
  index: number,
  total: number,
  perShape: any
): number {
  const stepDelay = perShape.delayStepMs || 50;
  return (index * stepDelay) / 1000;
}

function applyShapeTransform(
  shape: SVGElement,
  progress: number,
  preset: string,
  perShape: any
) {
  const opacity = lerp(perShape.opacityFrom || 0, 1, progress);
  const scale = lerp(perShape.scaleFrom || 1, 1, progress);
  
  shape.style.opacity = opacity.toString();
  
  if (scale !== 1) {
    const rect = shape.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    shape.style.transformOrigin = `${centerX}px ${centerY}px`;
    shape.style.transform = `scale(${scale})`;
  }
  
  // Preset-specific animations
  if (preset === 'spin-in') {
    const rotation = lerp(perShape.rotateFrom || Math.PI / 4, 0, progress);
    const currentTransform = shape.style.transform || '';
    shape.style.transform = `${currentTransform} rotate(${rotation}rad)`;
  }
}

function getEasingFunction(easing: string): (t: number) => number {
  switch (easing) {
    case 'linear':
      return (t) => t;
    case 'inOutQuad':
      return (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    case 'inOutCubic':
      return (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    case 'spring':
      return (t) => 1 - Math.cos(t * Math.PI * 0.5);
    default:
      return (t) => t;
  }
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}
