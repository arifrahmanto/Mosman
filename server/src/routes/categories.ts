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
 * @openapi
 * /v1/categories/donations:
 *   get:
 *     summary: List Donation Categories
 *     description: Get all active donation categories (Infaq, Zakat, Sedekah, Wakaf)
 *     tags: [Categories]
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
 *                         $ref: '#/components/schemas/Category'
 *             example:
 *               success: true
 *               data:
 *                 - id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
 *                   name: "Infaq Umum"
 *                   description: "Sumbangan umum untuk operasional masjid"
 *                   is_active: true
 *                   created_at: "2026-01-18T00:00:00Z"
 *                   updated_at: "2026-01-18T00:00:00Z"
 *                 - id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
 *                   name: "Zakat"
 *                   description: "Zakat mal dan fitrah"
 *                   is_active: true
 *                   created_at: "2026-01-18T00:00:00Z"
 *                   updated_at: "2026-01-18T00:00:00Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
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
 * @openapi
 * /v1/categories/expenses:
 *   get:
 *     summary: List Expense Categories
 *     description: Get all active expense categories (Operasional, Pemeliharaan, Gaji, etc.)
 *     tags: [Categories]
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
 *                         $ref: '#/components/schemas/Category'
 *             example:
 *               success: true
 *               data:
 *                 - id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"
 *                   name: "Operasional"
 *                   description: "Biaya operasional harian masjid"
 *                   is_active: true
 *                   created_at: "2026-01-18T00:00:00Z"
 *                   updated_at: "2026-01-18T00:00:00Z"
 *                 - id: "ffffffff-ffff-ffff-ffff-ffffffffffff"
 *                   name: "Pemeliharaan Gedung"
 *                   description: "Perbaikan dan pemeliharaan bangunan"
 *                   is_active: true
 *                   created_at: "2026-01-18T00:00:00Z"
 *                   updated_at: "2026-01-18T00:00:00Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
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
