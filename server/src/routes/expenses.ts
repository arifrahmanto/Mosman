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
 * @openapi
 * /v1/expenses:
 *   get:
 *     summary: List Expenses
 *     description: Get a paginated list of expenses with optional filters
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/pocketId'
 *       - $ref: '#/components/parameters/categoryId'
 *       - name: status
 *         in: query
 *         description: Filter by approval status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *       - $ref: '#/components/parameters/startDate'
 *       - $ref: '#/components/parameters/endDate'
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
 *                         $ref: '#/components/schemas/Expense'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/',
  validateQuery(expenseQuerySchema),
  expenseController.listExpenses
);

/**
 * @openapi
 * /v1/expenses/{id}:
 *   get:
 *     summary: Get Expense by ID
 *     description: Retrieve a single expense by its ID
 *     tags: [Expenses]
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
 *                       $ref: '#/components/schemas/Expense'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:id',
  validateParams(uuidParamSchema),
  expenseController.getExpense
);

/**
 * @openapi
 * /v1/expenses:
 *   post:
 *     summary: Create Expense
 *     description: Create a new expense record (Admin and Treasurer only). Status defaults to 'pending'
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExpense'
 *           example:
 *             pocket_id: "11111111-1111-1111-1111-111111111111"
 *             category_id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"
 *             description: "Pembelian sound system untuk masjid"
 *             amount: 5000000
 *             expense_date: "2026-01-18"
 *             notes: "Untuk keperluan kajian rutin"
 *     responses:
 *       201:
 *         description: Expense created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Expense'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post(
  '/',
  requireRole(UserRole.ADMIN, UserRole.TREASURER),
  validateBody(createExpenseSchema),
  expenseController.createExpense
);

/**
 * @openapi
 * /v1/expenses/{id}:
 *   put:
 *     summary: Update Expense
 *     description: Update an existing expense record (Admin and Treasurer only)
 *     tags: [Expenses]
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
 *               pocket_id:
 *                 type: string
 *                 format: uuid
 *               category_id:
 *                 type: string
 *                 format: uuid
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               receipt_url:
 *                 type: string
 *                 format: uri
 *               expense_date:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *           example:
 *             description: "Updated description"
 *             amount: 5500000
 *     responses:
 *       200:
 *         description: Expense updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Expense'
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
  requireRole(UserRole.ADMIN, UserRole.TREASURER),
  validateParams(uuidParamSchema),
  validateBody(updateExpenseSchema),
  expenseController.updateExpense
);

/**
 * @openapi
 * /v1/expenses/{id}/approve:
 *   put:
 *     summary: Approve or Reject Expense
 *     description: Change expense status to approved or rejected (Admin only)
 *     tags: [Expenses]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 description: New approval status
 *           example:
 *             status: "approved"
 *     responses:
 *       200:
 *         description: Expense status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Expense'
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
  '/:id/approve',
  requireRole(UserRole.ADMIN),
  validateParams(uuidParamSchema),
  validateBody(approveExpenseSchema),
  expenseController.approveExpense
);

/**
 * @openapi
 * /v1/expenses/{id}:
 *   delete:
 *     summary: Delete Expense
 *     description: Delete an expense record (Admin only)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Expense deleted successfully
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
 *                   example: Expense deleted successfully
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
  validateParams(uuidParamSchema),
  expenseController.deleteExpense
);

export default router;
