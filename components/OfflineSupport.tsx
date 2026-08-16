'use client';

import { useEffect } from 'react';
import { registerServiceWorker, onOnlineStatusChange } from '@/lib/service-worker';

/**
 * Component to initialize offline support and service worker
 * Add this to your root layout.tsx
 */
export function OfflineSupport() {
  useEffect(() => {
    // Register service worker
    registerServiceWorker();

    // Listen for online/offline status changes
    const unsubscribe = onOnlineStatusChange((isOnline) => {
      if (isOnline) {
        console.log('App is now online');
      } else {
        console.log('App is now offline - cached resources will be used');
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return null;
}
