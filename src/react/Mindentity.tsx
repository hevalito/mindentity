import React, { useEffect, useImperativeHandle } from 'react';
import type { MindentityParams, AnimationOptions } from '../types.js';
import { useMindentity } from './useMindentity.js';
import { getMindentitySVG } from '../core/generation.js';

export interface MindentityProps extends MindentityParams {
  animation?: AnimationOptions;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
  role?: string;
  tabIndex?: number;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
}

export interface MindentityRef {
  play: () => void;
  pause: () => void;
  stop: () => void;
  regenerate: (next?: Partial<MindentityParams>) => void;
  toPNG: () => Promise<Blob>;
  toSVG: () => Promise<Blob>;
}

export const Mindentity = React.forwardRef<MindentityRef, MindentityProps>(({
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
  } = useMindentity({ ...params, renderer: 'svg' }, animation);

  // Expose methods via ref
  useImperativeHandle(forwardedRef, () => ({
    play,
    pause,
    stop,
    regenerate,
    toPNG,
    toSVG
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

  // Generate SVG content
  const svgContent = data ? getMindentitySVG({ ...params, renderer: 'svg' }) : '';

  // Generate aria-label if not provided
  const computedAriaLabel = ariaLabel || generateAriaLabel(params);

  // Handle focus for accessibility
  const handleFocus = (e: React.FocusEvent<SVGSVGElement>) => {
    if (animation?.focusVisible) {
      e.currentTarget.style.outline = '2px solid #0066cc';
      e.currentTarget.style.outlineOffset = '2px';
    }
  };

  const handleBlur = (e: React.FocusEvent<SVGSVGElement>) => {
    if (animation?.focusVisible) {
      e.currentTarget.style.outline = 'none';
    }
  };

  // Handle hover effects
  const handleMouseEnter = (e: React.MouseEvent<SVGSVGElement>) => {
    if (animation?.hover?.scale) {
      e.currentTarget.style.transform = `scale(${animation.hover.scale})`;
      e.currentTarget.style.transition = 'transform 0.2s ease';
    }
    if (animation?.hover?.shadow) {
      e.currentTarget.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<SVGSVGElement>) => {
    if (animation?.hover?.scale) {
      e.currentTarget.style.transform = 'scale(1)';
    }
    if (animation?.hover?.shadow) {
      e.currentTarget.style.filter = 'none';
    }
  };

  if (!data || !svgContent) {
    return (
      <div 
        className={className}
        style={{ 
          width: params.width || 512, 
          height: params.height || 512,
          backgroundColor: params.transparent ? 'transparent' : (params.backgroundColor || '#ffffff'),
          ...style 
        }}
        role="img"
        aria-label="Loading Mindentity..."
      />
    );
  }

  return (
    <div
      className={className}
      style={style}
      role="presentation"
    >
      <svg
        ref={internalRef as React.RefObject<SVGSVGElement>}
        width={params.width || 512}
        height={params.height || 512}
        viewBox={`0 0 ${params.width || 512} ${params.height || 512}`}
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
        dangerouslySetInnerHTML={{ __html: extractSVGContent(svgContent) }}
      />
    </div>
  );
});

Mindentity.displayName = 'Mindentity';

function generateAriaLabel(params: MindentityParams): string {
  const mode = params.mode || 'none';
  const input = params.input || '';
  
  if (mode === 'letter' && input) {
    return `Mindentity generative logo for letter "${input}"`;
  } else if (mode === 'string' && input) {
    return `Mindentity generative logo for "${input}"`;
  } else {
    return 'Mindentity generative logo';
  }
}

function extractSVGContent(svgString: string): string {
  // Extract content between <svg> tags, excluding the outer svg element
  const match = svgString.match(/<svg[^>]*>(.*)<\/svg>/s);
  return match ? match[1] : '';
}
