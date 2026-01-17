/**
 * Authentication and Authorization Middleware
 */

import { Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest, UserRole, AuthUser } from '../types';
import { AuthenticationError, AuthorizationError } from './errorHandler';

/**
 * Authentication Middleware
 * Validates JWT token and attaches user information to request
 */
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AuthenticationError('Missing authorization header');
    }

    // Check if header is in "Bearer <token>" format
    if (!authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Invalid authorization header format. Use: Bearer <token>');
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    if (!token) {
      throw new AuthenticationError('Missing authentication token');
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new AuthenticationError('Invalid or expired token');
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, full_name, role, is_active')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new AuthorizationError('User profile not found');
    }

    // Check if user is active
    if (!profile.is_active) {
      throw new AuthorizationError('User account is disabled');
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email || '',
      role: profile.role as UserRole,
      full_name: profile.full_name,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Authorization Middleware Factory
 * Checks if user has required role(s)
 */
export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      // Check if user has required role
      if (!roles.includes(req.user.role)) {
        throw new AuthorizationError(
          `Insufficient permissions. Required role(s): ${roles.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
