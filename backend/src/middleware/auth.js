import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

export function generateToken(user) {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

/**
 * Strict authentication — every protected route uses this.
 * Rejects missing, malformed, or invalid tokens with 401.
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session expired or invalid token. Please log in again.' });
  }
}

/**
 * Public routes that can optionally know who is calling.
 * Never rejects a request; simply attaches req.user when a valid token exists.
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (token) {
    try {
      req.user = jwt.verify(token, config.jwtSecret);
    } catch (e) {
      // Continue without auth
    }
  }
  next();
}

/** Role gate — must run after authenticateToken. */
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }
    next();
  };
}

/**
 * Resolve which user's data a READ request may access.
 *  - admin/therapist: may read any user's data (?userId= supported)
 *  - user: always pinned to the authenticated token subject
 */
export function resolveReadUserId(req) {
  const tokenUserId = req.user?.userId;
  if (req.user?.role === 'admin' || req.user?.role === 'therapist') {
    return req.query?.userId || tokenUserId;
  }
  return tokenUserId;
}

/**
 * Resolve which user's data a WRITE request may modify.
 *  - admin: may write on behalf of any user (body/query userId)
 *  - everyone else: always pinned to the authenticated token subject
 */
export function resolveWriteUserId(req) {
  const tokenUserId = req.user?.userId;
  if (req.user?.role === 'admin') {
    return req.body?.userId || req.query?.userId || tokenUserId;
  }
  return tokenUserId;
}
