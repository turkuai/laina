// src/utils/config.js
//
// Central place for environment-driven configuration.
//
// In development (XAMPP / CRA proxy):
//   - Leave REACT_APP_API_PREFIX empty → fetch('/api/...') uses the CRA proxy
//   - Leave REACT_APP_IMAGE_PREFIX empty → images use %PUBLIC_URL% (same origin)
//
// In production (e.g. https://taikukkula.fi/laina/):
//   - Set REACT_APP_API_PREFIX=https://taikukkula.fi/server-php
//   - Set REACT_APP_IMAGE_PREFIX=https://taikukkula.fi/server-php/uploads  (if images live on server)
//     OR leave empty to use PUBLIC_URL (if images are bundled in the React build)

/**
 * Base URL for all /api/* calls.
 * Empty string → relative path, which the CRA proxy handles in dev.
 */
export const API_PREFIX = process.env.REACT_APP_API_PREFIX || '';

/**
 * Base URL for static images (logo, product photos, etc.).
 * Falls back to %PUBLIC_URL% so React's public folder always works.
 */
export const IMAGE_PREFIX = process.env.REACT_APP_IMAGE_PREFIX || process.env.PUBLIC_URL || '';

/**
 * Helper: build a full API URL from just the path, e.g. "/api/users"
 */
export function apiUrl(path) {
  return `${API_PREFIX}${path}`;
}

/**
 * Helper: build a full image URL from just the filename, e.g. "tai.png"
 */
export function imageUrl(filename) {
  return `${IMAGE_PREFIX}/${filename}`;
}
