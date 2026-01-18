/**
 * Route Aggregator
 * Mounts all API routes
 */

import { Router, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import healthRoutes from './health';
import donationRoutes from './donations';
import expenseRoutes from './expenses';
import categoryRoutes from './categories';
import pocketRoutes from './pockets';
import { successResponse } from '../utils/response';
import { swaggerSpec } from '../config/swagger';

const router = Router();

// Swagger API Documentation
router.use('/docs', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Mosman API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
}));

// Mount health routes (no authentication required)
router.use('/health', healthRoutes);

// API v1 welcome endpoint
/**
 * @openapi
 * /v1:
 *   get:
 *     summary: API Information
 *     description: Returns API version and available endpoints
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Successful response
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
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Welcome to Mosman API
 *                     version:
 *                       type: string
 *                       example: v1
 *                     endpoints:
 *                       type: object
 *                     documentation:
 *                       type: string
 */
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
    documentation: 'Interactive API docs available at /api/docs',
  }));
});

// Mount API v1 routes (authentication handled in individual routes)
router.use('/v1/donations', donationRoutes);
router.use('/v1/expenses', expenseRoutes);
router.use('/v1/categories', categoryRoutes);
router.use('/v1/pockets', pocketRoutes);

export default router;
