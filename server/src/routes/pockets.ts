/**
 * Pocket Routes
 * Defines API routes for pockets (financial accounts)
 */

import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { validateParams, validateQuery } from '../middleware/validator';
import { uuidParamSchema, donationQuerySchema } from '../validators/donation.schema';
import { expenseQuerySchema } from '../validators/expense.schema';
import { supabase } from '../config/supabase';
import { successResponse } from '../utils/response';
import { DatabaseError, NotFoundError } from '../middleware/errorHandler';
import { PocketSummary } from '../types/pocket.types';
import * as donationService from '../services/donationService';
import * as expenseService from '../services/expenseService';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /v1/pockets:
 *   get:
 *     summary: List All Pockets
 *     description: Get a list of all active financial pockets with their current balances
 *     tags: [Pockets]
 *     security:
 *       - bearerAuth: []
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
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Pocket'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('pockets')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new DatabaseError('Failed to fetch pockets', { error: error.message });
    }

    // Convert current_balance to number
    const pockets = (data || []).map(pocket => ({
      ...pocket,
      current_balance: Number(pocket.current_balance),
    }));

    res.json(successResponse(pockets));
  } catch (error) {
    throw error;
  }
});

/**
 * @openapi
 * /v1/pockets/{id}:
 *   get:
 *     summary: Get Pocket by ID
 *     description: Retrieve a single pocket with its details and current balance
 *     tags: [Pockets]
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
 *                       $ref: '#/components/schemas/Pocket'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:id',
  validateParams(uuidParamSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('pockets')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        throw new NotFoundError('Pocket not found');
      }

      // Convert current_balance to number
      const pocket = {
        ...data,
        current_balance: Number(data.current_balance),
      };

      res.json(successResponse(pocket));
    } catch (error) {
      throw error;
    }
  }
);

/**
 * @openapi
 * /v1/pockets/{id}/summary:
 *   get:
 *     summary: Get Pocket Summary
 *     description: Get detailed financial summary for a pocket including total donations, expenses, and calculated balance
 *     tags: [Pockets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Successful response with financial summary
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PocketSummary'
 *             example:
 *               success: true
 *               data:
 *                 id: "11111111-1111-1111-1111-111111111111"
 *                 name: "Kas Umum"
 *                 description: "Kas untuk operasional dan kegiatan umum masjid"
 *                 total_donations: 10000000
 *                 total_expenses: 3500000
 *                 balance: 6500000
 *                 donation_count: 25
 *                 expense_count: 12
 *                 is_active: true
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:id/summary',
  validateParams(uuidParamSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Get pocket details
      const { data: pocket, error: pocketError } = await supabase
        .from('pockets')
        .select('*')
        .eq('id', id)
        .single();

      if (pocketError || !pocket) {
        throw new NotFoundError('Pocket not found');
      }

      // Calculate total donations
      const { data: donationsData, error: donationsError } = await supabase
        .from('donations')
        .select('amount')
        .eq('pocket_id', id);

      if (donationsError) {
        throw new DatabaseError('Failed to calculate donations', { error: donationsError.message });
      }

      const totalDonations = (donationsData || []).reduce((sum, d) => sum + Number(d.amount), 0);
      const donationCount = (donationsData || []).length;

      // Calculate total expenses (only approved)
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('pocket_id', id)
        .eq('status', 'approved');

      if (expensesError) {
        throw new DatabaseError('Failed to calculate expenses', { error: expensesError.message });
      }

      const totalExpenses = (expensesData || []).reduce((sum, e) => sum + Number(e.amount), 0);
      const expenseCount = (expensesData || []).length;

      const summary: PocketSummary = {
        id: pocket.id,
        name: pocket.name,
        description: pocket.description,
        total_donations: totalDonations,
        total_expenses: totalExpenses,
        balance: totalDonations - totalExpenses,
        donation_count: donationCount,
        expense_count: expenseCount,
        is_active: pocket.is_active,
      };

      res.json(successResponse(summary));
    } catch (error) {
      throw error;
    }
  }
);

/**
 * @openapi
 * /v1/pockets/{pocketId}/donations:
 *   get:
 *     summary: Get Donations by Pocket
 *     description: Get a paginated list of all donations for a specific pocket
 *     tags: [Pockets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: pocketId
 *         in: path
 *         required: true
 *         description: Pocket ID
 *         schema:
 *           type: string
 *           format: uuid
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
 *                         $ref: '#/components/schemas/Donation'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/:pocketId/donations',
  validateQuery(donationQuerySchema),
  async (req: Request, res: Response): Promise<void> => {
    const { pocketId } = req.params as { pocketId: string };
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.page_size ? Number(req.query.page_size) : 20;

    const result = await donationService.getDonationsByPocket(pocketId, page, pageSize);
    res.json(result);
  }
);

/**
 * @openapi
 * /v1/pockets/{pocketId}/expenses:
 *   get:
 *     summary: Get Expenses by Pocket
 *     description: Get a paginated list of all expenses for a specific pocket
 *     tags: [Pockets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: pocketId
 *         in: path
 *         required: true
 *         description: Pocket ID
 *         schema:
 *           type: string
 *           format: uuid
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
  '/:pocketId/expenses',
  validateQuery(expenseQuerySchema),
  async (req: Request, res: Response): Promise<void> => {
    const { pocketId } = req.params as { pocketId: string };
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.page_size ? Number(req.query.page_size) : 20;

    const result = await expenseService.getExpensesByPocket(pocketId, page, pageSize);
    res.json(result);
  }
);

export default router;
