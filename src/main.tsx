import React from 'react';
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx'
import './index.css'
import { registerServiceWorker, addResourceHints, optimizeFonts } from '@/utils/performance';
import { supabase } from "@/integrations/supabase/client";

// Initialize performance optimizations
addResourceHints();
optimizeFonts();

// Test instant alerts functionality on page load
console.log('Testing instant alerts function...');
supabase.functions.invoke('alerts-instant', {
  body: {
    tournamentId: 'd02f2be5-7d68-4709-8c10-d19944087514',
    action: 'created'
  }
}).then((result) => {
  console.log('Instant alerts test result:', result);
}).catch((error) => {
  console.error('Instant alerts test error:', error);
});

// Register service worker for caching
if ('serviceWorker' in navigator) {
  registerServiceWorker();
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);