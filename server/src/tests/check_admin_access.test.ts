import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { type User } from '../schema';
import { checkAdminAccess, UnauthorizedError } from '../handlers/check_admin_access';

describe('checkAdminAccess', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return true for admin user', async () => {
    const adminUser: User = {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      created_at: new Date()
    };

    const result = await checkAdminAccess(adminUser);
    expect(result).toBe(true);
  });

  it('should return false for regular user', async () => {
    const regularUser: User = {
      id: 2,
      username: 'user',
      email: 'user@example.com',
      role: 'user',
      created_at: new Date()
    };

    const result = await checkAdminAccess(regularUser);
    expect(result).toBe(false);
  });

  it('should return false for null user', async () => {
    const result = await checkAdminAccess(null);
    expect(result).toBe(false);
  });

  it('should handle undefined user gracefully', async () => {
    const result = await checkAdminAccess(undefined as any);
    expect(result).toBe(false);
  });

  it('should validate admin role case sensitivity', async () => {
    // Test that role checking is exact
    const userWithWrongCase: User = {
      id: 3,
      username: 'fakeadmin',
      email: 'fake@example.com',
      role: 'ADMIN' as any, // Invalid role - should be lowercase 'admin'
      created_at: new Date()
    };

    const result = await checkAdminAccess(userWithWrongCase);
    expect(result).toBe(false);
  });

  it('should handle edge cases with user properties', async () => {
    // Test with minimal valid admin user
    const minimalAdminUser: User = {
      id: 0,
      username: '',
      email: '',
      role: 'admin',
      created_at: new Date(0) // Epoch date
    };

    const result = await checkAdminAccess(minimalAdminUser);
    expect(result).toBe(true);
  });
});

describe('UnauthorizedError', () => {
  it('should create error with default message', () => {
    const error = new UnauthorizedError();
    expect(error.message).toBe('Access denied. Admin role required.');
    expect(error.name).toBe('UnauthorizedError');
    expect(error instanceof Error).toBe(true);
  });

  it('should create error with custom message', () => {
    const customMessage = 'Custom admin access denied';
    const error = new UnauthorizedError(customMessage);
    expect(error.message).toBe(customMessage);
    expect(error.name).toBe('UnauthorizedError');
    expect(error instanceof Error).toBe(true);
  });

  it('should be throwable and catchable', () => {
    expect(() => {
      throw new UnauthorizedError();
    }).toThrow('Access denied. Admin role required.');

    expect(() => {
      throw new UnauthorizedError('Custom error');
    }).toThrow('Custom error');
  });

  it('should maintain error stack trace', () => {
    const error = new UnauthorizedError();
    expect(error.stack).toBeDefined();
    expect(typeof error.stack).toBe('string');
  });
});