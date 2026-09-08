import { hashPassword, verifyPassword } from './password';

describe('password hashing', () => {
  it('produces a salted scrypt hash, not the plaintext', () => {
    const hash = hashPassword('correct horse');
    expect(hash).not.toContain('correct horse');
    expect(hash.startsWith('scrypt$')).toBe(true);
    expect(hash.split('$')).toHaveLength(3);
  });

  it('uses a random salt so identical passwords hash differently', () => {
    expect(hashPassword('same-password')).not.toBe(hashPassword('same-password'));
  });

  it('verifies a correct password against its hash', () => {
    const hash = hashPassword('s3cret-value');
    expect(verifyPassword('s3cret-value', hash)).toBe(true);
  });

  it('rejects an incorrect password', () => {
    const hash = hashPassword('s3cret-value');
    expect(verifyPassword('wrong-value', hash)).toBe(false);
  });

  it('returns false for a malformed or empty stored hash', () => {
    expect(verifyPassword('anything', '')).toBe(false);
    expect(verifyPassword('anything', 'not-a-real-hash')).toBe(false);
    expect(verifyPassword('anything', 'bcrypt$abc$def')).toBe(false);
  });
});
