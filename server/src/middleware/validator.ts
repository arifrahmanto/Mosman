/**
 * Request Validation Middleware
 * Uses Zod schemas for runtime validation
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from './errorHandler';

/**
 * Validate request body, query, or params using Zod schema
 */
export function validateRequest(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dataToValidate = req[source];

      // Validate data against schema
      const validated = await schema.parseAsync(dataToValidate);

      // Replace original data with validated data
      req[source] = validated;

      next();
    } catch (error) {
      // Zod errors will be handled by global error handler
      next(error);
    }
  };
}

/**
 * Helper function to validate request body
 */
export function validateBody(schema: ZodSchema) {
  return validateRequest(schema, 'body');
}

/**
 * Helper function to validate query parameters
 */
export function validateQuery(schema: ZodSchema) {
  return validateRequest(schema, 'query');
}

/**
 * Helper function to validate route parameters
 */
export function validateParams(schema: ZodSchema) {
  return validateRequest(schema, 'params');
}
