/**
 * Hook for loading external images with caching support
 * Works in offline mode by serving cached images
 */

import { useEffect, useState } from 'react';

interface UseExternalImageOptions {
  url: string;
  fallback?: string;
  cacheTime?: number; // in milliseconds
}

interface CachedImage {
  data: string;
  timestamp: number;
}

const IMAGE_CACHE_KEY = 'mavunoone_image_cache';

export function useExternalImage({
  url,
  fallback = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%23999"%3EImage Loading...%3C/text%3E%3C/svg%3E',
  cacheTime = 24 * 60 * 60 * 1000, // 24 hours default
}: UseExternalImageOptions) {
  const [imageSrc, setImageSrc] = useState<string>(fallback);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check cache first
        const cached = getFromCache(url);
        if (cached) {
          setImageSrc(cached);
          setIsLoading(false);
          return;
        }

        // Try to fetch from network
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const blob = await response.blob();
        const reader = new FileReader();

        reader.onloadend = () => {
          const base64data = reader.result as string;
          // Cache the image
          saveToCache(url, base64data);
          setImageSrc(base64data);
          setIsLoading(false);
        };

        reader.onerror = () => {
          setError('Failed to read image');
          setIsLoading(false);
        };

        reader.readAsDataURL(blob);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        // Try to use cached version even if outdated
        const cachedAnyVersion = getFromCache(url);
        if (cachedAnyVersion) {
          setImageSrc(cachedAnyVersion);
        } else {
          setImageSrc(fallback);
        }
        setIsLoading(false);
      }
    };

    if (url) {
      loadImage();
    }
  }, [url, fallback, cacheTime]);

  return { imageSrc, isLoading, error };
}

/**
 * Retrieve image from IndexedDB cache
 */
function getFromCache(url: string): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const cache = localStorage.getItem(`${IMAGE_CACHE_KEY}_${hashUrl(url)}`);
    if (!cache) return null;

    const parsed = JSON.parse(cache) as CachedImage;
    const now = Date.now();

    // Check if cache is still valid
    if (now - parsed.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(`${IMAGE_CACHE_KEY}_${hashUrl(url)}`);
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

/**
 * Save image to localStorage cache
 */
function saveToCache(url: string, data: string): void {
  if (typeof window === 'undefined') return;

  try {
    const cacheData: CachedImage = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(
      `${IMAGE_CACHE_KEY}_${hashUrl(url)}`,
      JSON.stringify(cacheData)
    );
  } catch (err) {
    console.warn('Failed to cache image:', err);
  }
}

/**
 * Simple hash function for URLs
 */
function hashUrl(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Clear all cached images
 */
export function clearImageCache(): void {
  if (typeof window === 'undefined') return;

  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(IMAGE_CACHE_KEY)) {
        localStorage.removeItem(key);
      }
    });

    // Also notify service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.controller?.postMessage({
        type: 'CLEAR_CACHE',
      });
    }
  } catch (err) {
    console.warn('Failed to clear image cache:', err);
  }
}

/**
 * Get cache size in bytes
 */
export function getCacheSizeEstimate(): number {
  if (typeof window === 'undefined') return 0;

  let size = 0;
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith(IMAGE_CACHE_KEY)) {
      const value = localStorage.getItem(key);
      if (value) {
        size += value.length;
      }
    }
  });

  return size;
}
