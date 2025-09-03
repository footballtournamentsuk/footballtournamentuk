import React from 'react';
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx'
import './index.css'
import { registerServiceWorker, addResourceHints, optimizeFonts } from '@/utils/performance';
import { injectCriticalCSS, optimizeFontLoading } from '@/utils/criticalCss';
import { deferHeavyOperations } from '@/utils/ttiOptimizations';
import { scheduleTask } from '@/utils/taskScheduler';
import { initSpeedIndexOptimizations } from '@/utils/speedIndex';

// Initialize critical Speed Index optimizations immediately
initSpeedIndexOptimizations();

// Initialize other performance optimizations
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

// Use concurrent rendering features to reduce blocking
const root = createRoot(document.getElementById("root")!);

// Schedule non-critical optimizations after initial render
root.render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// Schedule heavy operations after the app has rendered
scheduleTask(() => {
  deferNonCritical();
  deferHeavyOperations();
}, { priority: 'background' });