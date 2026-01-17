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
 * GET /api/v1/pockets
 * Get all pockets with current balance
 * Access: All authenticated users
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
 * GET /api/v1/pockets/:id
 * Get a single pocket with details
 * Access: All authenticated users
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
 * GET /api/v1/pockets/:id/summary
 * Get pocket summary with calculated balance
 * Access: All authenticated users
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
 * GET /api/v1/pockets/:pocketId/donations
 * Get all donations for a specific pocket
 * Access: All authenticated users
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
 * GET /api/v1/pockets/:pocketId/expenses
 * Get all expenses for a specific pocket
 * Access: All authenticated users
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
