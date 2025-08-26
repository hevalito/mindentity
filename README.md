# @mindnow/mindentity

A production-grade generative logo system for React and Next.js applications. Create beautiful, deterministic logos with customizable parameters, animations, and multiple rendering options.

## Features

- 🎨 **Generative Design**: Create unique logos based on configurable parameters
- 🔄 **Deterministic**: Same seed produces identical results every time
- ⚛️ **React Components**: Ready-to-use React components with TypeScript support
- 🎬 **Animations**: Built-in animation presets with customizable timing
- 📱 **Responsive**: SVG and Canvas rendering options
- 🎯 **Accessible**: ARIA labels and keyboard navigation support
- 📦 **Tree-shakable**: Import only what you need
- 🔧 **TypeScript**: Full type safety and IntelliSense support

## Installation

```bash
npm install @mindnow/mindentity
# or
yarn add @mindnow/mindentity
# or
pnpm add @mindnow/mindentity
```

## Quick Start

### Basic SVG Logo

```tsx
import { Mindentity } from '@mindnow/mindentity/react';

function App() {
  return (
    <Mindentity
      width={512}
      height={512}
      mode="string"
      input="Mindnow"
      seed="mindnow:brand:v1"
      backgroundColor="#ffffff"
      foregroundColor="#000000"
    />
  );
}
```

### With Animation

```tsx
import { Mindentity } from '@mindnow/mindentity/react';

function AnimatedLogo() {
  return (
    <Mindentity
      width={640}
      height={640}
      mode="letter"
      input="A"
      seed="letter-A"
      animation={{
        enabled: true,
        preset: 'stagger-radial',
        duration: 1200,
        easing: 'inOutCubic',
        loop: { yoyo: false, count: Infinity }
      }}
    />
  );
}
```

### Canvas Rendering

```tsx
import { MindentityCanvas } from '@mindnow/mindentity/react';

function CanvasLogo() {
  return (
    <MindentityCanvas
      width={1024}
      height={1024}
      mode="none"
      seed={123}
      backgroundColor="#f0f0f0"
      foregroundColor="#333333"
    />
  );
}
```

### Headless Usage

```tsx
import { getMindentitySVG, getMindentityDataURL } from '@mindnow/mindentity';

// Generate SVG string
const svg = getMindentitySVG({
  width: 512,
  height: 512,
  mode: 'string',
  input: 'Mindnow',
  seed: 'mindnow:v1',
});

// Generate PNG data URL
const pngDataURL = getMindentityDataURL({
  width: 1024,
  height: 1024,
  seed: 'high-res-logo',
  renderer: 'canvas'
});
```

### Control Panel

```tsx
import { useState } from 'react';
import { Mindentity, MindentityController } from '@mindnow/mindentity/react';
import { downloadSVG, downloadPNG } from '@mindnow/mindentity/utils';

function LogoPlayground() {
  const [params, setParams] = useState({
    width: 512,
    height: 512,
    mode: 'string' as const,
    input: 'Mindnow',
    seed: 'playground'
  });

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <Mindentity {...params} />
      <MindentityController
        params={params}
        onChange={setParams}
        onGenerate={() => setParams(prev => ({ ...prev, seed: Math.random().toString() }))}
        onDownloadSVG={() => downloadSVG({ params, filename: 'logo.svg' })}
        onDownloadPNG={() => downloadPNG({ params, filename: 'logo.png' })}
      />
    </div>
  );
}
```

## API Reference

### Core Functions

#### `getMindentityData(params)`
Returns the complete data structure for a Mindentity logo.

#### `getMindentitySVG(params)`
Generates an SVG string from the given parameters.

#### `getMindentityDataURL(params)`
Generates a PNG data URL from the given parameters.

### React Components

#### `<Mindentity>`
Main SVG component for rendering Mindentity logos.

**Props:**
- All `MindentityParams` properties
- `animation?: AnimationOptions`
- `className?: string`
- `style?: React.CSSProperties`
- `onAnimationStart?: () => void`
- `onAnimationComplete?: () => void`

#### `<MindentityCanvas>`
Canvas-based component for high-performance rendering.

#### `<MindentityController>`
Control panel component for interactive parameter adjustment.

### Parameters

```typescript
interface MindentityParams {
  width?: number;              // Default: 1024
  height?: number;             // Default: 1024
  gridSize?: number;           // Default: 8 (2-50)
  backgroundColor?: string;    // Default: '#ffffff'
  foregroundColor?: string;    // Default: '#000000'
  transparent?: boolean;       // Default: false
  gap?: number;               // Default: 10
  margin?: number;            // Default: 100
  whiteSpace?: number;        // Default: 20 (0-100%)
  mode?: 'none' | 'letter' | 'string'; // Default: 'none'
  input?: string;             // Required for letter/string modes
  seed?: string | number;     // For deterministic generation
  // ... and more shape and offset parameters
}
```

### Animation Options

```typescript
interface AnimationOptions {
  enabled?: boolean;
  duration?: number;          // milliseconds
  delay?: number;            // milliseconds
  easing?: 'linear' | 'inOutQuad' | 'inOutCubic' | 'spring';
  loop?: boolean | { yoyo?: boolean; count?: number };
  preset?: 
    | 'draw-grid'
    | 'stagger-radial'
    | 'stagger-random'
    | 'morph-corners'
    | 'pulse-noise'
    | 'gradient-sweep'
    | 'slide-in'
    | 'spin-in';
  // ... additional animation configuration
}
```

## Utility Functions

```typescript
import { 
  downloadSVG, 
  downloadPNG, 
  createSeed, 
  validateParams,
  copyToClipboard 
} from '@mindnow/mindentity/utils';

// Download functions
await downloadSVG({ params, filename: 'logo.svg' });
await downloadPNG({ params, filename: 'logo.png' });

// Seed generation
const randomSeed = createSeed();
const deterministicSeed = createSeedFromString('my-brand');

// Parameter validation
const { valid, errors } = validateParams(params);

// Copy SVG to clipboard
const svg = getMindentitySVG(params);
await copyToClipboard(svg);
```

## Advanced Usage

### Custom Animation

```tsx
import { useMindentity } from '@mindnow/mindentity/react';

function CustomAnimatedLogo() {
  const { ref, play, pause, stop, regenerate } = useMindentity(
    { width: 512, height: 512, seed: 'custom' },
    { enabled: true, preset: 'stagger-radial', duration: 2000 }
  );

  return (
    <div>
      <svg ref={ref} />
      <button onClick={play}>Play</button>
      <button onClick={pause}>Pause</button>
      <button onClick={stop}>Stop</button>
      <button onClick={() => regenerate()}>Regenerate</button>
    </div>
  );
}
```

### Server-Side Rendering

```tsx
// pages/api/logo.ts (Next.js API route)
import { getMindentitySVG } from '@mindnow/mindentity';

export default function handler(req, res) {
  const svg = getMindentitySVG({
    width: parseInt(req.query.width) || 512,
    height: parseInt(req.query.height) || 512,
    seed: req.query.seed || 'default',
    mode: req.query.mode || 'none',
    input: req.query.input
  });

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  res.send(svg);
}
```

## Browser Support

- Modern browsers with ES2020 support
- React 18+
- TypeScript 5.0+

## License

MIT © Mindnow

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## Changelog

### 0.1.0
- Initial release
- Core generation engine
- React components
- Animation system
- TypeScript support
- Tree-shakable exports
