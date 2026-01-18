/**
 * User Management Controller
 * Handles HTTP requests for user management endpoints (Admin only)
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import { successResponse } from '../utils/response';
import * as userService from '../services/userService';
import { UserQueryInput } from '../validators/user.schema';

/**
 * GET /api/v1/users
 * List all users
 */
export async function listUsers(req: AuthRequest, res: Response): Promise<void> {
  const filters: UserQueryInput = {
    role: req.query.role as any,
    is_active: req.query.is_active as any,
    page: req.query.page as any,
    page_size: req.query.page_size as any,
  };

  const result = await userService.getUsers(filters);
  res.json(result);
}

/**
 * GET /api/v1/users/:id
 * Get user by ID
 */
export async function getUser(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const user = await userService.getUserById(id);
  res.json(successResponse(user));
}

/**
 * PUT /api/v1/users/:id
 * Update user
 */
export async function updateUser(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const user = await userService.updateUser(id, req.body);
  res.json(successResponse(user, 'User updated successfully'));
}

/**
 * DELETE /api/v1/users/:id
 * Deactivate user
 */
export async function deleteUser(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  await userService.deactivateUser(id);
  res.json(successResponse(null, 'User deactivated successfully'));
}
