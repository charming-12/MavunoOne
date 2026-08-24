"use client";

import { useEffect, useState } from 'react';
import { registerServiceWorker, onOnlineStatusChange } from '@/lib/service-worker';

export function OfflineSupport() {
  // Do not show an offline message on initial render. navigator.onLine can be
  // stale or unreliable while a cached page is booting; only a real offline
  // event should display the banner.
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    registerServiceWorker();
    const unsubscribe = onOnlineStatusChange((online) => setIsOffline(!online));
    return unsubscribe;
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: '8px 16px',
        textAlign: 'center',
        fontSize: 13,
        fontWeight: 700,
        color: '#fff4d6',
        background: '#6b4b12',
        boxShadow: '0 2px 12px rgba(0,0,0,.18)',
      }}
    >
      Uko offline — muonekano umehifadhiwa; malipo, SMS na taarifa za mwisho zitasubiri internet.
    </div>
  );
}
