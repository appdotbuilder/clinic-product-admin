import { db } from '../db';
import { usersTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type User } from '../schema';

export const authenticateUser = async (token?: string): Promise<User | null> => {
  try {
    // If no token provided, return null (unauthenticated)
    if (!token) {
      return null;
    }

    // For this implementation, we'll treat the token as a simple user identifier
    // In a real system, this would involve JWT validation and user ID extraction
    
    // Parse token to extract user identifier
    // For simplicity, we'll assume token format is "user:{id}" or just the username
    let userId: number | null = null;
    let username: string | null = null;

    if (token.startsWith('user:')) {
      // Token format: "user:123"
      const idPart = token.substring(5);
      const parsedId = parseInt(idPart, 10);
      if (!isNaN(parsedId)) {
        userId = parsedId;
      }
    } else {
      // Token is treated as username
      username = token;
    }

    // Query user from database
    let user;
    
    if (userId) {
      // Query by ID
      const users = await db.select()
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .execute();
      
      user = users[0];
    } else if (username) {
      // Query by username
      const users = await db.select()
        .from(usersTable)
        .where(eq(usersTable.username, username))
        .execute();
      
      user = users[0];
    } else {
      // Invalid token format
      return null;
    }

    // If no user found, return null
    if (!user) {
      return null;
    }

    // Return user data (created_at is already a Date object from the database)
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    };
  } catch (error) {
    console.error('User authentication failed:', error);
    throw error;
  }
};