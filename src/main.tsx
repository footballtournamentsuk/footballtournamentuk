import React from 'react';
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx'
import './index.css'
import { registerServiceWorker, addResourceHints, optimizeFonts } from '@/utils/performance';

// Initialize performance optimizations
addResourceHints();
optimizeFonts();

// Register service worker for caching
if ('serviceWorker' in navigator) {
  registerServiceWorker();
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);