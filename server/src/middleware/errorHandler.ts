/**
 * Global Error Handler Middleware
 * Handles all errors and returns standardized error responses
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { errorResponse } from '../utils/response';

/**
 * Custom Error Classes
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(400, 'VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(401, 'AUTHENTICATION_ERROR', message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(403, 'AUTHORIZATION_ERROR', message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(404, 'NOT_FOUND', message);
    this.name = 'NotFoundError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(500, 'DATABASE_ERROR', message, details);
    this.name = 'DatabaseError';
  }
}

/**
 * Global Error Handler Middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // Log error with stack trace
  console.error('❌ Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const details = (err as ZodError).issues.reduce((acc: Record<string, string>, error) => {
      const path = error.path.join('.');
      acc[path] = error.message;
      return acc;
    }, {} as Record<string, string>);

    res.status(400).json(
      errorResponse(
        'VALIDATION_ERROR',
        'Request validation failed',
        details
      )
    );
    return;
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json(
      errorResponse(err.code, err.message, err.details)
    );
    return;
  }

  // Handle generic errors
  const statusCode = 500;
  const code = 'INTERNAL_SERVER_ERROR';
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : err.message;

  res.status(statusCode).json(
    errorResponse(code, message)
  );
}

/**
 * 404 Not Found Handler
 */
export function notFoundHandler(
  req: Request,
  res: Response
): void {
  res.status(404).json(
    errorResponse(
      'NOT_FOUND',
      `Route ${req.method} ${req.url} not found`
    )
  );
}
