import { type User } from '../schema';

export const checkAdminAccess = async (user: User | null): Promise<boolean> => {
  try {
    // Return false immediately if no user is provided
    if (!user) {
      return false;
    }
    
    // Check if user has admin role
    return user.role === 'admin';
  } catch (error) {
    console.error('Admin access check failed:', error);
    // In case of any error, deny access for security
    return false;
  }
};

export class UnauthorizedError extends Error {
  constructor(message: string = 'Access denied. Admin role required.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}