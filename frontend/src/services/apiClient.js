/**
 * @fileoverview Base API client.
 *
 * VITE_USE_MOCK=true  → all service calls use isolated in-memory mock data (no backend needed).
 * VITE_USE_MOCK=false → real HTTP requests to VITE_API_BASE_URL (default: http://localhost:8080/api).
 *
 * Features:
 *  - Bearer token injection from sessionStorage
 *  - Automatic 401 handling → session clear + redirect to login
 *  - Normalised ApiError with status code and server message
 *  - Exponential-backoff retry for transient failures (5xx, network errors)
 *  - Request timeout (10 s)
 */

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;
/** Status codes that are safe to retry */
const RETRYABLE = new Set([408, 429, 500, 502, 503, 504]);

// ─── Typed error ────────────────────────────────────────────────────────────

export class ApiError extends Error {
  /**
   * @param {string} message   Human-readable message (safe to show in UI)
   * @param {number} status    HTTP status code (0 = network/timeout)
   * @param {unknown} [raw]    Raw server response body
   */
  constructor(message, status = 0, raw = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.raw = raw;
  }
}

// ─── Session helpers ─────────────────────────────────────────────────────────

const SESSION_KEY = 'smhc_session';

export function getToken() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw)?.token ?? null : null;
  } catch {
    return null;
  }
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

function redirectToLogin(role) {
  const path =
    role === 'therapist' ? '/therapist/login'
    : role === 'admin'   ? '/admin/login'
    : '/login';
  // Hash navigation keeps the HashRouter in control (works on static hosts
  // and never falls through to a server-side 404 page).
  if (window.location.hash !== `#${path}`) {
    window.location.hash = path;
  }
}

function getRoleFromSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw)?.user?.role ?? null : null;
  } catch {
    return null;
  }
}

// ─── Error normalisation ─────────────────────────────────────────────────────

/**
 * Parse a fetch Response into a normalised ApiError.
 * Tries JSON first, falls back to text, then generic message.
 * @param {Response} res
 * @returns {Promise<ApiError>}
 */
async function parseErrorResponse(res) {
  let body = null;
  try { body = await res.json(); } catch { /* not JSON */ }

  const message =
    body?.message ||
    body?.error ||
    (typeof body === 'string' ? body : null) ||
    httpStatusMessage(res.status);

  return new ApiError(message, res.status, body);
}

function httpStatusMessage(status) {
  const map = {
    400: 'Invalid request. Please check your input.',
    401: 'Session expired. Please log in again.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'A conflict occurred. The resource may already exist.',
    422: 'Validation failed. Please check your input.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'A server error occurred. Please try again later.',
    502: 'Service temporarily unavailable. Please try again.',
    503: 'Service temporarily unavailable. Please try again.',
    504: 'The server took too long to respond. Please try again.',
  };
  return map[status] || `Request failed (${status}).`;
}

// ─── Core request ─────────────────────────────────────────────────────────────

/**
 * Make an authenticated API request with retry and timeout.
 *
 * @param {string} endpoint  Path relative to BASE_URL (e.g. '/auth/login')
 * @param {RequestInit & { _retry?: number }} [options]
 * @returns {Promise<unknown>}
 * @throws {ApiError}
 */
export async function apiRequest(endpoint, options = {}) {
  const { _retry = 0, ...fetchOptions } = options;

  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(fetchOptions.headers || {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    // Network error or timeout
    const isTimeout = err?.name === 'AbortError';
    const message = isTimeout
      ? 'Request timed out. Please check your connection.'
      : 'Network error. Please check your connection.';

    if (_retry < MAX_RETRIES) {
      await backoff(_retry);
      return apiRequest(endpoint, { ...options, _retry: _retry + 1 });
    }
    throw new ApiError(message, 0, err);
  } finally {
    clearTimeout(timeoutId);
  }

  // ── 401 Unauthorised ──────────────────────────────────────────────────────
  // Login attempts legitimately return 401 for bad credentials — surface the
  // server's message instead of treating it as an expired session.
  const isLoginAttempt = endpoint.startsWith('/auth/login');
  if (response.status === 401 && !isLoginAttempt) {
    // Read the role BEFORE clearing the session, otherwise we always land on
    // the generic user login.
    const role = getRoleFromSession();
    clearSession();
    redirectToLogin(role);
    throw new ApiError('Session expired. Please log in again.', 401);
  }

  // ── Retryable server errors ───────────────────────────────────────────────
  if (RETRYABLE.has(response.status) && _retry < MAX_RETRIES) {
    await backoff(_retry);
    return apiRequest(endpoint, { ...options, _retry: _retry + 1 });
  }

  // ── Other errors ──────────────────────────────────────────────────────────
  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  // ── Success ───────────────────────────────────────────────────────────────
  // 204 No Content
  if (response.status === 204) return null;

  return response.json();
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Exponential backoff: 300 ms, 900 ms, … */
function backoff(attempt) {
  return new Promise((r) => setTimeout(r, 300 * Math.pow(3, attempt)));
}

/** Simulate a network delay for mock responses */
export function mockDelay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms));
}
