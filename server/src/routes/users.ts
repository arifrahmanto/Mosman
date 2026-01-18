/**
 * User Management Routes
 * Defines API routes for user management (Admin only)
 */

import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validator';
import {
  updateUserSchema,
  userQuerySchema,
  userIdParamSchema,
} from '../validators/user.schema';
import { UserRole } from '../types';
import * as userController from '../controllers/userController';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /v1/users:
 *   get:
 *     summary: List Users
 *     description: Get a paginated list of all users (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: role
 *         in: query
 *         schema:
 *           type: string
 *           enum: [admin, treasurer, viewer]
 *       - name: is_active
 *         in: query
 *         schema:
 *           type: boolean
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/pageSize'
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           email:
 *                             type: string
 *                           full_name:
 *                             type: string
 *                           role:
 *                             type: string
 *                             enum: [admin, treasurer, viewer]
 *                           phone:
 *                             type: string
 *                             nullable: true
 *                           is_active:
 *                             type: boolean
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/',
  requireRole(UserRole.ADMIN),
  validateQuery(userQuerySchema),
  userController.listUsers
);

/**
 * @openapi
 * /v1/users/{id}:
 *   get:
 *     summary: Get User by ID
 *     description: Retrieve a single user by their ID (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         email:
 *                           type: string
 *                         full_name:
 *                           type: string
 *                         role:
 *                           type: string
 *                           enum: [admin, treasurer, viewer]
 *                         phone:
 *                           type: string
 *                           nullable: true
 *                         is_active:
 *                           type: boolean
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:id',
  requireRole(UserRole.ADMIN),
  validateParams(userIdParamSchema),
  userController.getUser
);

/**
 * @openapi
 * /v1/users/{id}:
 *   put:
 *     summary: Update User
 *     description: Update user information including role and status (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, treasurer, viewer]
 *               phone:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *           example:
 *             role: "treasurer"
 *             is_active: true
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         email:
 *                           type: string
 *                         full_name:
 *                           type: string
 *                         role:
 *                           type: string
 *                           enum: [admin, treasurer, viewer]
 *                         phone:
 *                           type: string
 *                           nullable: true
 *                         is_active:
 *                           type: boolean
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put(
  '/:id',
  requireRole(UserRole.ADMIN),
  validateParams(userIdParamSchema),
  validateBody(updateUserSchema),
  userController.updateUser
);

/**
 * @openapi
 * /v1/users/{id}:
 *   delete:
 *     summary: Deactivate User
 *     description: Deactivate a user account (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   nullable: true
 *                 message:
 *                   type: string
 *                   example: User deactivated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete(
  '/:id',
  requireRole(UserRole.ADMIN),
  validateParams(userIdParamSchema),
  userController.deleteUser
);

export default router;
