import React from 'react';
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx'
import './index.css'
import { registerServiceWorker, addResourceHints, optimizeFonts } from '@/utils/performance';
import { injectCriticalCSS, optimizeFontLoading } from '@/utils/criticalCss';
import { initGA4 } from '@/utils/ga4';

// Initialize performance optimizations immediately
addResourceHints();
injectCriticalCSS();

// Initialize GA4 tracking
initGA4('G-FSSPWX8DBV');

// Defer non-critical optimizations using requestIdleCallback fallback
const deferNonCritical = () => {
  optimizeFonts();
  optimizeFontLoading();
  
  // Register service worker for caching
  if ('serviceWorker' in navigator) {
    registerServiceWorker();
  }
};

if ('requestIdleCallback' in window) {
  requestIdleCallback(deferNonCritical, { timeout: 2000 });
} else {
  setTimeout(deferNonCritical, 100);
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);