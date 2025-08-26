import React, { useEffect, useImperativeHandle, useRef } from 'react';
import type { MindentityParams, AnimationOptions } from '../types.js';
import { useMindentity } from './useMindentity.js';
import { getMindentityDataURL } from '../core/generation.js';

export interface MindentityCanvasProps extends MindentityParams {
  animation?: AnimationOptions;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
  role?: string;
  tabIndex?: number;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
}

export interface MindentityCanvasRef {
  play: () => void;
  pause: () => void;
  stop: () => void;
  regenerate: (next?: Partial<MindentityParams>) => void;
  toPNG: () => Promise<Blob>;
  toSVG: () => Promise<Blob>;
  getCanvas: () => HTMLCanvasElement | null;
  getContext: () => CanvasRenderingContext2D | null;
}

export const MindentityCanvas = React.forwardRef<MindentityCanvasRef, MindentityCanvasProps>(({
  animation,
  className,
  style,
  'aria-label': ariaLabel,
  role = 'img',
  tabIndex,
  onAnimationComplete,
  onAnimationStart,
  ...params
}, forwardedRef) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    ref: internalRef,
    data,
    playing,
    play,
    pause,
    stop,
    regenerate,
    toPNG,
    toSVG
  } = useMindentity({ ...params, renderer: 'canvas' }, animation);

  // Expose methods via ref
  useImperativeHandle(forwardedRef, () => ({
    play,
    pause,
    stop,
    regenerate,
    toPNG,
    toSVG,
    getCanvas: () => canvasRef.current,
    getContext: () => canvasRef.current?.getContext('2d') || null
  }), [play, pause, stop, regenerate, toPNG, toSVG]);

  // Handle animation callbacks
  useEffect(() => {
    if (playing && onAnimationStart) {
      onAnimationStart();
    }
  }, [playing, onAnimationStart]);

  useEffect(() => {
    if (!playing && onAnimationComplete) {
      onAnimationComplete();
    }
  }, [playing, onAnimationComplete]);

  // Render to canvas when data changes
  useEffect(() => {
    if (!data || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const width = params.width || 512;
    const height = params.height || 512;
    
    // Set actual canvas size (for high DPI displays)
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    
    // Scale context for high DPI
    ctx.scale(devicePixelRatio, devicePixelRatio);
    
    // Set CSS size
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Render background
    if (!params.transparent) {
      ctx.fillStyle = params.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }

    // Render using data URL approach for now
    // In a more advanced implementation, we could render shapes directly to canvas
    const dataURL = getMindentityDataURL({ ...params, renderer: 'canvas' });
    
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
    };
    img.src = dataURL;

  }, [data, params]);

  // Sync internal ref with canvas ref
  useEffect(() => {
    if (internalRef && canvasRef.current) {
      (internalRef as React.MutableRefObject<HTMLCanvasElement | null>).current = canvasRef.current;
    }
  }, [internalRef]);

  // Generate aria-label if not provided
  const computedAriaLabel = ariaLabel || generateAriaLabel(params);

  // Handle focus for accessibility
  const handleFocus = (e: React.FocusEvent<HTMLCanvasElement>) => {
    if (animation?.focusVisible) {
      e.currentTarget.style.outline = '2px solid #0066cc';
      e.currentTarget.style.outlineOffset = '2px';
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLCanvasElement>) => {
    if (animation?.focusVisible) {
      e.currentTarget.style.outline = 'none';
    }
  };

  // Handle hover effects
  const handleMouseEnter = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (animation?.hover?.scale) {
      e.currentTarget.style.transform = `scale(${animation.hover.scale})`;
      e.currentTarget.style.transition = 'transform 0.2s ease';
    }
    if (animation?.hover?.shadow) {
      e.currentTarget.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (animation?.hover?.scale) {
      e.currentTarget.style.transform = 'scale(1)';
    }
    if (animation?.hover?.shadow) {
      e.currentTarget.style.filter = 'none';
    }
  };

  return (
    <div
      className={className}
      style={style}
      role="presentation"
    >
      <canvas
        ref={canvasRef}
        role={role}
        aria-label={computedAriaLabel}
        tabIndex={tabIndex}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          display: 'block',
          maxWidth: '100%',
          height: 'auto',
        }}
      />
    </div>
  );
});

MindentityCanvas.displayName = 'MindentityCanvas';

function generateAriaLabel(params: MindentityParams): string {
  const mode = params.mode || 'none';
  const input = params.input || '';
  
  if (mode === 'letter' && input) {
    return `Mindentity generative logo for letter "${input}" (Canvas)`;
  } else if (mode === 'string' && input) {
    return `Mindentity generative logo for "${input}" (Canvas)`;
  } else {
    return 'Mindentity generative logo (Canvas)';
  }
}
