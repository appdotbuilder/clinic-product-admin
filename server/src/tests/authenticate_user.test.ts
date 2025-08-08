import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { authenticateUser } from '../handlers/authenticate_user';

describe('authenticateUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null when no token provided', async () => {
    const result = await authenticateUser();
    expect(result).toBeNull();
  });

  it('should return null when empty token provided', async () => {
    const result = await authenticateUser('');
    expect(result).toBeNull();
  });

  it('should authenticate user by ID token format', async () => {
    // Create a test user first
    const testUser = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      })
      .returning()
      .execute();

    const userId = testUser[0].id;
    const token = `user:${userId}`;

    const result = await authenticateUser(token);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(userId);
    expect(result!.username).toEqual('testuser');
    expect(result!.email).toEqual('test@example.com');
    expect(result!.role).toEqual('user');
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should authenticate user by username token', async () => {
    // Create a test admin user
    await db.insert(usersTable)
      .values({
        username: 'admin',
        email: 'admin@clinic.com',
        role: 'admin'
      })
      .returning()
      .execute();

    const result = await authenticateUser('admin');

    expect(result).not.toBeNull();
    expect(result!.username).toEqual('admin');
    expect(result!.email).toEqual('admin@clinic.com');
    expect(result!.role).toEqual('admin');
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent user ID', async () => {
    const token = 'user:999999'; // Non-existent user ID
    
    const result = await authenticateUser(token);
    
    expect(result).toBeNull();
  });

  it('should return null for non-existent username', async () => {
    const result = await authenticateUser('nonexistentuser');
    
    expect(result).toBeNull();
  });

  it('should return null for invalid token format', async () => {
    const result = await authenticateUser('user:invalid');
    
    expect(result).toBeNull();
  });

  it('should handle multiple users correctly', async () => {
    // Create multiple test users
    const users = await db.insert(usersTable)
      .values([
        {
          username: 'user1',
          email: 'user1@example.com',
          role: 'user'
        },
        {
          username: 'user2',
          email: 'user2@example.com',
          role: 'admin'
        }
      ])
      .returning()
      .execute();

    // Authenticate first user by ID
    const user1Result = await authenticateUser(`user:${users[0].id}`);
    expect(user1Result).not.toBeNull();
    expect(user1Result!.username).toEqual('user1');
    expect(user1Result!.role).toEqual('user');

    // Authenticate second user by username
    const user2Result = await authenticateUser('user2');
    expect(user2Result).not.toBeNull();
    expect(user2Result!.username).toEqual('user2');
    expect(user2Result!.role).toEqual('admin');
  });

  it('should preserve user data integrity', async () => {
    // Create user with specific timestamp
    const createdUser = await db.insert(usersTable)
      .values({
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      })
      .returning()
      .execute();

    const result = await authenticateUser('testuser');

    expect(result).not.toBeNull();
    // Verify all fields are preserved correctly
    expect(result!.id).toEqual(createdUser[0].id);
    expect(result!.username).toEqual(createdUser[0].username);
    expect(result!.email).toEqual(createdUser[0].email);
    expect(result!.role).toEqual(createdUser[0].role);
    expect(result!.created_at).toEqual(createdUser[0].created_at);
  });
});