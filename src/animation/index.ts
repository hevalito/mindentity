/**
 * Animation system for Mindentity
 * This is a placeholder for the full animation system implementation
 */

export interface AnimationEngine {
  play(): void;
  pause(): void;
  stop(): void;
  setProgress(progress: number): void;
}

export interface AnimationTimeline {
  duration: number;
  progress: number;
  playing: boolean;
}

/**
 * Basic animation engine implementation
 * This will be expanded with the full animation presets later
 */
export class BasicAnimationEngine implements AnimationEngine {
  private animationId: number | null = null;
  private startTime: number | null = null;
  private duration: number;
  private onUpdate: (progress: number) => void;

  constructor(duration: number, onUpdate: (progress: number) => void) {
    this.duration = duration;
    this.onUpdate = onUpdate;
  }

  play(): void {
    if (this.animationId) return;
    
    this.startTime = performance.now();
    
    const animate = (currentTime: number) => {
      if (!this.startTime) return;
      
      const elapsed = currentTime - this.startTime;
      const progress = Math.min(elapsed / this.duration, 1);
      
      this.onUpdate(progress);
      
      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.animationId = null;
      }
    };
    
    this.animationId = requestAnimationFrame(animate);
  }

  pause(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  stop(): void {
    this.pause();
    this.startTime = null;
    this.onUpdate(0);
  }

  setProgress(progress: number): void {
    this.onUpdate(Math.max(0, Math.min(1, progress)));
  }
}

/**
 * Easing functions
 */
export const easings = {
  linear: (t: number) => t,
  inOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  inOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  spring: (t: number) => 1 - Math.cos(t * Math.PI * 0.5),
};

/**
 * Animation presets (basic implementations)
 * These will be expanded with full implementations later
 */
export const presets = {
  'draw-grid': (elements: Element[], progress: number) => {
    elements.forEach((element, index) => {
      const delay = index / elements.length;
      const elementProgress = Math.max(0, (progress - delay) * elements.length);
      (element as HTMLElement).style.opacity = elementProgress.toString();
    });
  },
  
  'stagger-radial': (elements: Element[], progress: number) => {
    // Basic radial stagger implementation
    elements.forEach((element, index) => {
      const delay = index / elements.length * 0.5;
      const elementProgress = Math.max(0, (progress - delay) / (1 - delay));
      (element as HTMLElement).style.opacity = elementProgress.toString();
    });
  },
  
  'stagger-random': (elements: Element[], progress: number, seed?: string | number) => {
    // Basic random stagger implementation
    elements.forEach((element, index) => {
      const seedValue = typeof seed === 'string' ? seed.length : (seed || 0);
      const random = Math.sin(index + seedValue) * 0.5 + 0.5;
      const delay = random * 0.5;
      const elementProgress = Math.max(0, (progress - delay) / (1 - delay));
      (element as HTMLElement).style.opacity = elementProgress.toString();
    });
  },
  
  'fade-in': (elements: Element[], progress: number) => {
    elements.forEach((element) => {
      (element as HTMLElement).style.opacity = progress.toString();
    });
  },
};

export type PresetName = keyof typeof presets;
