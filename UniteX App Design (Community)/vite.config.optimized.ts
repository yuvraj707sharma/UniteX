import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Use SWC for faster compilation
      jsxImportSource: '@emotion/react',
    }),
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
          'radix-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-avatar',
          ],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          // Utils
          'utils': ['clsx', 'tailwind-merge'],
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
    reportCompressedSize: true,
    
    // Build optimizations
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
  },
  
  // Development server configuration
  server: {
    port: 3000,
    host: true, // Listen on all addresses
    strictPort: false,
    open: false, // Don't auto-open browser
    cors: true,
    hmr: {
      overlay: true,
    },
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
    open: false,
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
    esbuildOptions: {
      target: 'es2020',
    },
  },
  
  // Define global constants
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  
  // ESBuild options for transforming
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    drop: ['console', 'debugger'], // Remove in production
  },
});
