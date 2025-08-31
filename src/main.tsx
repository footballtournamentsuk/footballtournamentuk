import React from 'react';
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx'
import './index.css'
import { registerServiceWorker, addResourceHints, optimizeFonts } from '@/utils/performance';
import { injectCriticalCSS, optimizeFontLoading } from '@/utils/criticalCss';
import { deferHeavyOperations } from '@/utils/ttiOptimizations';

// Initialize performance optimizations immediately
addResourceHints();
injectCriticalCSS();

// Defer non-critical optimizations much later to improve TTI
const deferNonCritical = () => {
  // Defer font optimizations until after TTI
  setTimeout(() => {
    optimizeFonts();
    optimizeFontLoading();
  }, 3000);
  
  // Register service worker after user interaction or timeout
  if ('serviceWorker' in navigator) {
    const registerSW = () => registerServiceWorker();
    
    // Wait for user interaction or fallback timeout
    const events = ['click', 'keydown', 'touchstart', 'scroll'];
    const registerOnInteraction = () => {
      events.forEach(event => document.removeEventListener(event, registerOnInteraction));
      setTimeout(registerSW, 1000);
    };
    
    events.forEach(event => document.addEventListener(event, registerOnInteraction, { once: true, passive: true }));
    setTimeout(registerOnInteraction, 8000); // Fallback
  }
};

// Use longer timeout to avoid blocking TTI
if ('requestIdleCallback' in window) {
  requestIdleCallback(deferNonCritical, { timeout: 5000 });
} else {
  setTimeout(deferNonCritical, 2000);
}

// Defer heavy operations until after initial render
setTimeout(deferHeavyOperations, 100);

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);