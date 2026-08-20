/**
 * Rate Limiting Utility
 * Prevents API abuse and excessive requests
 */

import { NextRequest } from "next/server";

interface RateLimitConfig {
  limit: number; // Max requests per window
  window: number; // Time window in milliseconds
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

/**
 * In-memory rate limit store
 * For production, use Redis or a database
 */
const rateLimitStore: RateLimitStore = {};

/**
 * Get client identifier from request
 */
export function getClientId(request: NextRequest): string {
  // Try to get from X-Forwarded-For header (for proxied requests)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  // Fallback to other headers
  return (
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Check if request exceeds rate limit
 */
export function getRateLimitStatus(
  clientId: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = `rate-limit:${clientId}`;
  const entry = rateLimitStore[key];
  if (!entry || now > entry.resetTime) return { allowed: true, remaining: config.limit, resetTime: now + config.window };
  return { allowed: entry.count < config.limit, remaining: Math.max(0, config.limit - entry.count), resetTime: entry.resetTime };
}

export function recordRateLimitFailure(
  clientId: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = `rate-limit:${clientId}`;
  const entry = rateLimitStore[key];
  if (!entry || now > entry.resetTime) {
    rateLimitStore[key] = { count: 1, resetTime: now + config.window };
    return { allowed: true, remaining: config.limit - 1, resetTime: now + config.window };
  }
  entry.count++;
  return { allowed: entry.count <= config.limit, remaining: Math.max(0, config.limit - entry.count), resetTime: entry.resetTime };
}

export function checkRateLimit(
  clientId: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = `rate-limit:${clientId}`;
  const entry = rateLimitStore[key];

  // Create new entry if doesn't exist
  if (!entry) {
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + config.window,
    };
    return { allowed: true, remaining: config.limit - 1, resetTime: now + config.window };
  }

  // Reset if window has passed
  if (now > entry.resetTime) {
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + config.window,
    };
    return { allowed: true, remaining: config.limit - 1, resetTime: now + config.window };
  }

  // Check if limit exceeded
  if (entry.count >= config.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;
  return {
    allowed: true,
    remaining: config.limit - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Clean up old entries from rate limit store
 * Should be called periodically
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach((key) => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}

/**
 * Cleanup every 5 minutes
 */
setInterval(() => {
  cleanupRateLimitStore();
}, 5 * 60 * 1000);

/**
 * Common rate limit configurations
 */
export const RATE_LIMITS = {
  // Public API endpoints
  PUBLIC: { limit: 100, window: 60 * 1000 }, // 100 per minute

  // Authenticated API endpoints
  API: { limit: 1000, window: 60 * 1000 }, // 1000 per minute

  // Login attempts
  LOGIN: { limit: 5, window: 15 * 60 * 1000 }, // 5 per 15 minutes

  // Password reset
  RESET_PASSWORD: { limit: 3, window: 60 * 60 * 1000 }, // 3 per hour

  // File uploads
  UPLOAD: { limit: 10, window: 60 * 60 * 1000 }, // 10 per hour

  // Export operations
  EXPORT: { limit: 20, window: 60 * 60 * 1000 }, // 20 per hour

  // SMS operations (expensive)
  SMS: { limit: 50, window: 24 * 60 * 60 * 1000 }, // 50 per day
};

/**
 * Format time until reset in human-readable format
 */
export function formatResetTime(resetTime: number): string {
  const seconds = Math.ceil((resetTime - Date.now()) / 1000);

  if (seconds <= 60) {
    return `${seconds} second${seconds !== 1 ? "s" : ""}`;
  }

  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
}
