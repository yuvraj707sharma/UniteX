import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
  ],
  
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  build: {
    // Target modern browsers for better optimization
    target: 'es2020',
    
    // Output directory
    outDir: 'dist',
    
    // Generate sourcemaps for production debugging (optional)
    sourcemap: false,
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    
    // Chunk splitting strategy
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
        },
        // File naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Report compressed size
    reportCompressedSize: false, // Faster builds
    
    // Build optimizations
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
  },
  
  // Development server configuration
  server: {
    port: 3000,
    host: true,
    strictPort: false,
    open: false,
    cors: true,
  },
  
  // Optimization options
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@supabase/supabase-js',
      'framer-motion',
      'lucide-react',
    ],
    exclude: ['@capacitor/core', '@capacitor/app'],
  },
  
  // ESBuild options
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
});
