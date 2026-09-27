import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';

/**
 * JWT signing secret.
 *  - Production: MUST be provided via the environment (fail fast otherwise).
 *  - Development/test: an ephemeral random secret is generated so the app
 *    never ships a hardcoded fallback secret in source.
 */
function resolveJwtSecret() {
  const fromEnv = process.env.JWT_SECRET;
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv.trim();

  if (nodeEnv === 'production') {
    throw new Error(
      'JWT_SECRET is required when NODE_ENV=production. Set it in your environment (see backend/.env.example).'
    );
  }

  const ephemeral = crypto.randomBytes(48).toString('hex');
  console.warn(
    '⚠️ JWT_SECRET is not set — using an ephemeral dev-only secret. Tokens will not survive a server restart.'
  );
  return ephemeral;
}

export const config = {
  port: parseInt(process.env.PORT || '8080', 10),
  jwtSecret: resolveJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv,
  /**
   * MongoDB connection string. Empty/unset → null → the API runs on the
   * in-memory store (no silent localhost fallback).
   */
  mongoUri: (process.env.MONGODB_URI || '').trim() || null,
  /** Comma-separated list of allowed CORS origins. Empty → allow all (dev). */
  corsOrigin: (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
};
