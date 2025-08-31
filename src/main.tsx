import React from 'react';
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx'
import './index.css'
import { registerServiceWorker, addResourceHints, optimizeFonts } from '@/utils/performance';
import { injectCriticalCSS, optimizeFontLoading } from '@/utils/criticalCss';
import { deferHeavyOperations } from '@/utils/ttiOptimizations';
import { scheduleTask } from '@/utils/taskScheduler';

// Initialize performance optimizations immediately
addResourceHints();
injectCriticalCSS();

// Defer non-critical optimizations to reduce TBT
const deferNonCritical = () => {
  // Break up font optimizations into separate tasks
  scheduleTask(() => optimizeFonts(), { priority: 'background' });
  scheduleTask(() => optimizeFontLoading(), { priority: 'background' });
  
  // Register service worker with lowest priority
  if ('serviceWorker' in navigator) {
    const registerSW = () => {
      scheduleTask(() => registerServiceWorker(), { priority: 'background' });
    };
    
    // Wait for user interaction to avoid blocking main thread
    const events = ['click', 'keydown', 'touchstart', 'scroll'];
    const registerOnInteraction = () => {
      events.forEach(event => document.removeEventListener(event, registerOnInteraction));
      scheduleTask(registerSW, { priority: 'background' });
    };
    
    events.forEach(event => document.addEventListener(event, registerOnInteraction, { once: true, passive: true }));
    
    // Fallback - register after 10 seconds if no interaction
    setTimeout(registerOnInteraction, 10000);
  }
};

// Use background scheduling to avoid blocking main thread
scheduleTask(deferNonCritical, { priority: 'background' });

// Schedule heavy operations to avoid blocking initial render
scheduleTask(deferHeavyOperations, { priority: 'background' });

// Use concurrent rendering features to reduce blocking
createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);