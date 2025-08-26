import { defineConfig } from 'tsup'

export default defineConfig([
  // Main entry point
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    minify: false,
    splitting: false,
    outDir: 'dist',
    external: ['react', 'react-dom'],
  },
  // React entry point
  {
    entry: ['src/react/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    minify: false,
    splitting: false,
    outDir: 'dist/react',
    external: ['react', 'react-dom'],
  },
  // Animation entry point
  {
    entry: ['src/animation/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    minify: false,
    splitting: false,
    outDir: 'dist/animation',
    external: ['react', 'react-dom'],
  },
  // Utils entry point
  {
    entry: ['src/utils/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    minify: false,
    splitting: false,
    outDir: 'dist/utils',
    external: ['react', 'react-dom'],
  },
])
