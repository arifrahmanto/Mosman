/**
 * Category Routes
 * Defines API routes for categories (donations and expenses)
 */

import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { supabase } from '../config/supabase';
import { successResponse } from '../utils/response';
import { DatabaseError } from '../middleware/errorHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/categories/donations
 * Get all donation categories
 * Access: All authenticated users
 */
router.get('/donations', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('donation_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new DatabaseError('Failed to fetch donation categories', { error: error.message });
    }

    res.json(successResponse(data || []));
  } catch (error) {
    throw error;
  }
});

/**
 * GET /api/v1/categories/expenses
 * Get all expense categories
 * Access: All authenticated users
 */
router.get('/expenses', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new DatabaseError('Failed to fetch expense categories', { error: error.message });
    }

    res.json(successResponse(data || []));
  } catch (error) {
    throw error;
  }
});

export default router;
