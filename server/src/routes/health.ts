/**
 * Health Check Routes
 * Provides endpoints for monitoring server and database health
 */

import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { successResponse, errorResponse } from '../utils/response';
import { env } from '../config/env';

const router = Router();

/**
 * Health Response Interface
 */
interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  database: {
    connected: boolean;
    message?: string;
  };
}

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const healthData: HealthResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: env.API_VERSION,
      environment: env.NODE_ENV,
      database: {
        connected: false,
      },
    };

    // Test database connectivity
    try {
      const { error } = await supabase
        .from('pockets')
        .select('id')
        .limit(1);

      if (error) {
        // If table doesn't exist yet, still consider connection successful
        if (error.message.includes('does not exist')) {
          healthData.database.connected = true;
          healthData.database.message = 'Connected (tables not created yet)';
        } else {
          healthData.database.connected = false;
          healthData.database.message = error.message;
          healthData.status = 'degraded';
        }
      } else {
        healthData.database.connected = true;
        healthData.database.message = 'Connected successfully';
      }
    } catch (dbError) {
      healthData.database.connected = false;
      healthData.database.message = dbError instanceof Error ? dbError.message : 'Unknown database error';
      healthData.status = 'degraded';
    }

    // Return appropriate status code
    const statusCode = healthData.status === 'healthy' ? 200 : 503;

    res.status(statusCode).json(successResponse(healthData));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Health check failed';
    res.status(500).json(
      errorResponse('HEALTH_CHECK_ERROR', message)
    );
  }
});

export default router;
