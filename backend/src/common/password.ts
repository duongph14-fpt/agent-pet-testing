import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

// Passwords are hashed at rest with scrypt — a memory-hard KDF from node's
// standard library, so no third-party dependency is required. Stored format:
//   scrypt$<saltHex>$<derivedKeyHex>
const ALGORITHM = 'scrypt';
const SALT_BYTES = 16;
const KEY_LENGTH = 64;

export function hashPassword(plain: string): string {
  const salt = randomBytes(SALT_BYTES).toString('hex');
  const derived = scryptSync(plain, salt, KEY_LENGTH).toString('hex');
  return `${ALGORITHM}$${salt}$${derived}`;
}

// Constant-time comparison of a candidate password against a stored hash.
// Returns false for any malformed or empty stored value rather than throwing.
export function verifyPassword(plain: string, stored: string): boolean {
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== ALGORITHM) {
    return false;
  }
  const [, salt, expectedHex] = parts;
  const expected = Buffer.from(expectedHex, 'hex');
  const derived = scryptSync(plain, salt, KEY_LENGTH);
  if (expected.length !== derived.length) {
    return false;
  }
  return timingSafeEqual(derived, expected);
}
