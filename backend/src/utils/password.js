import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;
const BCRYPT_PREFIX = /^\$2[aby]\$/;

/** Hash a plain-text password for storage. */
export function hashPassword(plain) {
  return bcrypt.hashSync(String(plain), SALT_ROUNDS);
}

/**
 * Verify a plain-text password against a stored value.
 * Supports bcrypt hashes and (for legacy rows seeded before hashing was
 * introduced) plain-text comparisons — the latter only matches the exact
 * original seed password, never an arbitrary "master" password.
 */
export function verifyPassword(plain, stored) {
  if (!stored) return false;
  const storedStr = String(stored);
  if (BCRYPT_PREFIX.test(storedStr)) {
    return bcrypt.compareSync(String(plain), storedStr);
  }
  return String(plain) === storedStr;
}

/** True when a stored value is already a bcrypt hash. */
export function isHashed(stored) {
  return BCRYPT_PREFIX.test(String(stored || ''));
}

/** Return a copy of the seed user list with bcrypt-hashed passwords. */
export function hashSeedUsers(users) {
  return users.map((u) => (isHashed(u.password) ? u : { ...u, password: hashPassword(u.password) }));
}
