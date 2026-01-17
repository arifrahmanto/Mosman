/**
 * Route Aggregator
 * Mounts all API routes
 */

import { Router, Request, Response } from 'express';
import healthRoutes from './health';
import donationRoutes from './donations';
import expenseRoutes from './expenses';
import categoryRoutes from './categories';
import pocketRoutes from './pockets';
import { successResponse } from '../utils/response';

const router = Router();

// Mount health routes (no authentication required)
router.use('/health', healthRoutes);

// API v1 welcome endpoint
router.get('/v1', (req: Request, res: Response) => {
  res.json(successResponse({
    message: 'Welcome to Mosman API',
    version: 'v1',
    endpoints: {
      donations: '/api/v1/donations',
      expenses: '/api/v1/expenses',
      pockets: '/api/v1/pockets',
      categories: '/api/v1/categories',
    },
    documentation: 'See README.md for full API documentation',
  }));
});

// Mount API v1 routes (authentication handled in individual routes)
router.use('/v1/donations', donationRoutes);
router.use('/v1/expenses', expenseRoutes);
router.use('/v1/categories', categoryRoutes);
router.use('/v1/pockets', pocketRoutes);

export default router;
