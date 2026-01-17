/**
 * Expense Routes
 * Defines API routes for expense management
 */

import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validator';
import {
  createExpenseSchema,
  updateExpenseSchema,
  approveExpenseSchema,
  expenseQuerySchema,
} from '../validators/expense.schema';
import { uuidParamSchema } from '../validators/donation.schema';
import { UserRole } from '../types';
import * as expenseController from '../controllers/expenseController';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/expenses
 * List expenses with optional filters
 * Access: All authenticated users
 */
router.get(
  '/',
  validateQuery(expenseQuerySchema),
  expenseController.listExpenses
);

/**
 * GET /api/v1/expenses/:id
 * Get a single expense by ID
 * Access: All authenticated users
 */
router.get(
  '/:id',
  validateParams(uuidParamSchema),
  expenseController.getExpense
);

/**
 * POST /api/v1/expenses
 * Create a new expense
 * Access: Admin and Treasurer only
 */
router.post(
  '/',
  requireRole(UserRole.ADMIN, UserRole.TREASURER),
  validateBody(createExpenseSchema),
  expenseController.createExpense
);

/**
 * PUT /api/v1/expenses/:id
 * Update an existing expense
 * Access: Admin and Treasurer only
 */
router.put(
  '/:id',
  requireRole(UserRole.ADMIN, UserRole.TREASURER),
  validateParams(uuidParamSchema),
  validateBody(updateExpenseSchema),
  expenseController.updateExpense
);

/**
 * PUT /api/v1/expenses/:id/approve
 * Approve or reject an expense
 * Access: Admin only
 */
router.put(
  '/:id/approve',
  requireRole(UserRole.ADMIN),
  validateParams(uuidParamSchema),
  validateBody(approveExpenseSchema),
  expenseController.approveExpense
);

/**
 * DELETE /api/v1/expenses/:id
 * Delete an expense
 * Access: Admin only
 */
router.delete(
  '/:id',
  requireRole(UserRole.ADMIN),
  validateParams(uuidParamSchema),
  expenseController.deleteExpense
);

export default router;
