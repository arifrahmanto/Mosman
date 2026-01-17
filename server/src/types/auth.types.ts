/**
 * Authentication and Authorization Types
 */

import { Request } from 'express';

export enum UserRole {
  ADMIN = 'admin',
  TREASURER = 'treasurer',
  VIEWER = 'viewer'
}

export interface UserProfile {
  id: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  is_active: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
