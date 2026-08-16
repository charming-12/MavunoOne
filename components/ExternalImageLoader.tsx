'use client';

import Image from 'next/image';
import { useExternalImage, clearImageCache } from '@/hooks/useExternalImage';
import { useState } from 'react';

interface ExternalImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallback?: string;
}

/**
 * Component for loading and caching external images
 * Usage:
 * <ExternalImageLoader
 *   src="https://example.com/image.jpg"
 *   alt="Example"
 *   width={400}
 *   height={300}
 * />
 */
export function ExternalImageLoader({
  src,
  alt,
  width = 400,
  height = 300,
  className = '',
  fallback,
}: ExternalImageProps) {
  const { imageSrc, isLoading, error } = useExternalImage({ url: src, fallback });

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center rounded">
          <span className="text-gray-500">Loading...</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-red-100 flex items-center justify-center rounded">
          <span className="text-red-700 text-sm text-center p-2">{error}</span>
        </div>
      )}

      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`w-full h-auto rounded ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
      />
    </div>
  );
}

/**
 * Settings component for cache management
 */
export function CacheSettings() {
  const [cleared, setCleared] = useState(false);

  const handleClearCache = async () => {
    clearImageCache();
    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-bold text-gray-900 mb-4">Cache Settings</h3>

      <button
        onClick={handleClearCache}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold transition"
      >
        Clear Image Cache
      </button>

      {cleared && (
        <p className="text-green-600 text-sm mt-2">✓ Cache cleared successfully</p>
      )}

      <p className="text-gray-600 text-sm mt-4">
        Images are cached locally for offline access. Clear the cache to free up storage.
      </p>
    </div>
  );
}

/**
 * Offline status indicator
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  // Check online status
  if (typeof window !== 'undefined') {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Set initial state
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  if (!isOnline) {
    return (
      <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded flex items-center gap-2">
        <span className="inline-block w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></span>
        <span className="text-sm font-semibold">Offline Mode - Using cached resources</span>
      </div>
    );
  }

  return null;
}
