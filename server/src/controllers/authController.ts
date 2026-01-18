/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import { successResponse } from '../utils/response';
import * as authService from '../services/authService';

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
export async function register(req: Request, res: Response): Promise<void> {
  const result = await authService.register(req.body);
  res.status(201).json(successResponse(result, result.message));
}

/**
 * POST /api/v1/auth/login
 * Login user
 */
export async function login(req: Request, res: Response): Promise<void> {
  const result = await authService.login(req.body);
  res.json(successResponse(result, 'Login successful'));
}

/**
 * POST /api/v1/auth/logout
 * Logout user
 */
export async function logout(req: AuthRequest, res: Response): Promise<void> {
  const token = req.headers.authorization?.replace('Bearer ', '') || '';
  const result = await authService.logout(token);
  res.json(successResponse(result, result.message));
}

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
  const result = await authService.refreshToken(req.body);
  res.json(successResponse(result, 'Token refreshed successfully'));
}

/**
 * POST /api/v1/auth/forgot-password
 * Request password reset
 */
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const result = await authService.forgotPassword(req.body);
  res.json(successResponse(result, result.message));
}

/**
 * POST /api/v1/auth/reset-password
 * Reset password with token
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  const result = await authService.resetPassword(req.body);
  res.json(successResponse(result, result.message));
}

/**
 * PUT /api/v1/auth/change-password
 * Change user password
 */
export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const result = await authService.changePassword(userId, req.body);
  res.json(successResponse(result, result.message));
}

/**
 * GET /api/v1/auth/me
 * Get current user profile
 */
export async function getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const user = await authService.getCurrentUser(userId);
  res.json(successResponse(user));
}

/**
 * PUT /api/v1/auth/me
 * Update current user profile
 */
export async function updateCurrentUser(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const user = await authService.updateCurrentUser(userId, req.body);
  res.json(successResponse(user, 'Profile updated successfully'));
}
