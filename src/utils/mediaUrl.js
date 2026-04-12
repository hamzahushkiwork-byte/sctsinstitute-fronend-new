import { API_BASE } from '../config/api.js';

/**
 * Convert a media path to a URL
 * - In dev: returns relative URL (uses Vite proxy, no CORS)
 * - In prod: returns absolute URL if needed
 * @param {string} path - Media path (can be relative or absolute)
 * @returns {string} URL (relative in dev, absolute in prod if needed)
 */
export function toAbsoluteMediaUrl(path) {
  if (!path) {
    return '';
  }

  // If already an absolute URL (starts with http:// or https://), return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // In development, use relative URLs (Vite proxy handles CORS)
  // In production, build absolute URL if needed
  if (import.meta.env.DEV) {
    // Ensure path starts with /
    return path.startsWith('/') ? path : '/' + path;
  }

  // Production: build absolute URL
  const normalizedPath = path.startsWith('/') ? path : '/' + path;

  // Frontend static files (Vite bundle or public/), not API media — do not prepend API_BASE
  if (
    normalizedPath.startsWith('/assets/') ||
    normalizedPath === '/logo.jpeg' ||
    normalizedPath === '/logo_site.svg' ||
    normalizedPath === '/favicon.png'
  ) {
    return normalizedPath;
  }

  return API_BASE + normalizedPath;
}

