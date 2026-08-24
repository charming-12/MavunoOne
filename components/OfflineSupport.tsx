"use client";

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/service-worker';

/**
 * Registers offline support silently. The service worker keeps the app shell
 * available offline, but connectivity status is intentionally not shown in
 * the user interface.
 */
export function OfflineSupport() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
