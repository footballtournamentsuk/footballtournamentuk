import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          // Core React libraries - separate chunk
          'react-vendor': ['react', 'react-dom'],
          // Router - separate chunk  
          'router': ['react-router-dom'],
          // UI libraries - separate chunk
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-toast', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          // Form libraries - separate chunk
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Map libraries - separate chunk (heavy)
          'map-vendor': ['mapbox-gl'],
          // Query and data - separate chunk
          'data-vendor': ['@tanstack/react-query', '@supabase/supabase-js'],
          // Charts and visualization - separate chunk
          'chart-vendor': ['recharts'],
          // Utilities - separate chunk
          'utils-vendor': ['date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority']
        },
      },
    },
    // Reduce chunk size limit to force smaller bundles
    chunkSizeWarningLimit: 500,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
