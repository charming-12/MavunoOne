"use client";

import { useEffect, useState } from 'react';
import { registerServiceWorker, onOnlineStatusChange } from '@/lib/service-worker';

export function OfflineSupport() {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    registerServiceWorker();
    let timer: number | undefined;

    const unsubscribe = onOnlineStatusChange((online) => {
      setIsOnline(online);
      if (timer !== undefined) window.clearTimeout(timer);
      if (online) {
        setShowBackOnline(true);
        timer = window.setTimeout(() => setShowBackOnline(false), 4000);
      } else {
        setShowBackOnline(false);
      }
    });

    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  if (isOnline && !showBackOnline) return null;

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
        color: isOnline ? '#dffbea' : '#fff4d6',
        background: isOnline ? '#12633f' : '#6b4b12',
        boxShadow: '0 2px 12px rgba(0,0,0,.18)',
      }}
    >
      {isOnline
        ? 'Umerudi online — taarifa zinaweza kusawazishwa sasa.'
        : 'Offline mode — muonekano umehifadhiwa; malipo, SMS na taarifa za mwisho zitasubiri internet.'}
    </div>
  );
}
