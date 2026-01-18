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
 *     description: Create a new expense record with line items (Admin and Treasurer only). Status defaults to 'pending'
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
 *             description: "Biaya operasional masjid bulan Januari"
 *             expense_date: "2026-01-18"
 *             notes: "Pengeluaran untuk operasional rutin"
 *             items:
 *               - category_id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"
 *                 amount: 500000
 *                 description: "Tagihan listrik"
 *               - category_id: "ffffffff-ffff-ffff-ffff-ffffffffffff"
 *                 amount: 300000
 *                 description: "Tagihan air"
 *               - category_id: "gggggggg-gggg-gggg-gggg-gggggggggggg"
 *                 amount: 200000
 *                 description: "Perlengkapan kebersihan"
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
 *             example:
 *               success: true
 *               data:
 *                 id: "88888888-8888-8888-8888-888888888888"
 *                 pocket_id: "11111111-1111-1111-1111-111111111111"
 *                 pocket_name: "Kas Masjid"
 *                 description: "Biaya operasional masjid bulan Januari"
 *                 expense_date: "2026-01-18"
 *                 status: "pending"
 *                 total_amount: 1000000
 *                 items:
 *                   - id: "item-5555-5555-5555-555555555555"
 *                     expense_id: "88888888-8888-8888-8888-888888888888"
 *                     category_id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"
 *                     category_name: "Utilitas"
 *                     amount: 500000
 *                     description: "Tagihan listrik"
 *                     created_at: "2026-01-18T10:00:00Z"
 *                     updated_at: "2026-01-18T10:00:00Z"
 *                   - id: "item-6666-6666-6666-666666666666"
 *                     expense_id: "88888888-8888-8888-8888-888888888888"
 *                     category_id: "ffffffff-ffff-ffff-ffff-ffffffffffff"
 *                     category_name: "Utilitas"
 *                     amount: 300000
 *                     description: "Tagihan air"
 *                     created_at: "2026-01-18T10:00:00Z"
 *                     updated_at: "2026-01-18T10:00:00Z"
 *                   - id: "item-7777-7777-7777-777777777777"
 *                     expense_id: "88888888-8888-8888-8888-888888888888"
 *                     category_id: "gggggggg-gggg-gggg-gggg-gggggggggggg"
 *                     category_name: "Perlengkapan"
 *                     amount: 200000
 *                     description: "Perlengkapan kebersihan"
 *                     created_at: "2026-01-18T10:00:00Z"
 *                     updated_at: "2026-01-18T10:00:00Z"
 *                 notes: "Pengeluaran untuk operasional rutin"
 *                 approved_by: null
 *                 recorded_by: "user-uuid"
 *                 receipt_url: null
 *                 created_at: "2026-01-18T10:00:00Z"
 *                 updated_at: "2026-01-18T10:00:00Z"
 *               message: "Expense created successfully"
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
 *     description: Update an existing expense record with optional line items replacement (Admin and Treasurer only)
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
 *             $ref: '#/components/schemas/UpdateExpense'
 *           examples:
 *             updateBasicInfo:
 *               summary: Update basic information only
 *               value:
 *                 description: "Biaya operasional masjid bulan Januari (Updated)"
 *                 notes: "Catatan diperbarui"
 *             updateWithItems:
 *               summary: Update with new line items
 *               value:
 *                 description: "Biaya renovasi masjid"
 *                 notes: "Perubahan kategori pengeluaran"
 *                 items:
 *                   - category_id: "hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh"
 *                     amount: 3000000
 *                     description: "Material bangunan"
 *                   - category_id: "iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii"
 *                     amount: 2000000
 *                     description: "Upah tukang"
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
 *             example:
 *               success: true
 *               data:
 *                 id: "88888888-8888-8888-8888-888888888888"
 *                 pocket_id: "11111111-1111-1111-1111-111111111111"
 *                 pocket_name: "Kas Masjid"
 *                 description: "Biaya renovasi masjid"
 *                 expense_date: "2026-01-18"
 *                 status: "pending"
 *                 total_amount: 5000000
 *                 items:
 *                   - id: "item-8888-8888-8888-888888888888"
 *                     expense_id: "88888888-8888-8888-8888-888888888888"
 *                     category_id: "hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh"
 *                     category_name: "Renovasi"
 *                     amount: 3000000
 *                     description: "Material bangunan"
 *                     created_at: "2026-01-18T11:00:00Z"
 *                     updated_at: "2026-01-18T11:00:00Z"
 *                   - id: "item-9999-9999-9999-999999999999"
 *                     expense_id: "88888888-8888-8888-8888-888888888888"
 *                     category_id: "iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii"
 *                     category_name: "Tenaga Kerja"
 *                     amount: 2000000
 *                     description: "Upah tukang"
 *                     created_at: "2026-01-18T11:00:00Z"
 *                     updated_at: "2026-01-18T11:00:00Z"
 *                 notes: "Perubahan kategori pengeluaran"
 *                 approved_by: null
 *                 recorded_by: "user-uuid"
 *                 receipt_url: null
 *                 created_at: "2026-01-18T10:00:00Z"
 *                 updated_at: "2026-01-18T11:00:00Z"
 *               message: "Expense updated successfully"
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
 *             $ref: '#/components/schemas/ApproveExpense'
 *           examples:
 *             approve:
 *               summary: Approve expense
 *               value:
 *                 status: "approved"
 *             reject:
 *               summary: Reject expense
 *               value:
 *                 status: "rejected"
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
 *             example:
 *               success: true
 *               data:
 *                 id: "88888888-8888-8888-8888-888888888888"
 *                 pocket_id: "11111111-1111-1111-1111-111111111111"
 *                 pocket_name: "Kas Masjid"
 *                 description: "Biaya operasional masjid bulan Januari"
 *                 expense_date: "2026-01-18"
 *                 status: "approved"
 *                 total_amount: 1000000
 *                 items:
 *                   - id: "item-5555-5555-5555-555555555555"
 *                     expense_id: "88888888-8888-8888-8888-888888888888"
 *                     category_id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"
 *                     category_name: "Utilitas"
 *                     amount: 500000
 *                     description: "Tagihan listrik"
 *                     created_at: "2026-01-18T10:00:00Z"
 *                     updated_at: "2026-01-18T10:00:00Z"
 *                   - id: "item-6666-6666-6666-666666666666"
 *                     expense_id: "88888888-8888-8888-8888-888888888888"
 *                     category_id: "ffffffff-ffff-ffff-ffff-ffffffffffff"
 *                     category_name: "Utilitas"
 *                     amount: 300000
 *                     description: "Tagihan air"
 *                     created_at: "2026-01-18T10:00:00Z"
 *                     updated_at: "2026-01-18T10:00:00Z"
 *                   - id: "item-7777-7777-7777-777777777777"
 *                     expense_id: "88888888-8888-8888-8888-888888888888"
 *                     category_id: "gggggggg-gggg-gggg-gggg-gggggggggggg"
 *                     category_name: "Perlengkapan"
 *                     amount: 200000
 *                     description: "Perlengkapan kebersihan"
 *                     created_at: "2026-01-18T10:00:00Z"
 *                     updated_at: "2026-01-18T10:00:00Z"
 *                 notes: "Pengeluaran untuk operasional rutin"
 *                 approved_by: "admin-uuid"
 *                 recorded_by: "user-uuid"
 *                 receipt_url: null
 *                 created_at: "2026-01-18T10:00:00Z"
 *                 updated_at: "2026-01-18T12:00:00Z"
 *               message: "Expense approved successfully"
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
