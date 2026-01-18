/**
 * User Management Validation Schemas
 * Zod schemas for validating user management requests
 */

import { z } from 'zod';

/**
 * User role enum
 */
export const userRoleSchema = z.enum(['admin', 'treasurer', 'viewer']);

/**
 * Update user request schema (admin only)
 */
export const updateUserSchema = z.object({
  full_name: z.string().min(1).max(255).optional(),
  role: userRoleSchema.optional(),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Phone must be a valid phone number').optional(),
  is_active: z.boolean().optional(),
});

/**
 * User query parameters schema
 */
export const userQuerySchema = z.object({
  role: userRoleSchema.optional(),
  is_active: z.string().transform((val) => val === 'true').pipe(z.boolean()).optional(),
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  page_size: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
});

/**
 * UUID parameter schema for user ID
 */
export const userIdParamSchema = z.object({
  id: z.string().uuid('User ID must be a valid UUID'),
});

// Export inferred types
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
