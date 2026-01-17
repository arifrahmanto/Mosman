/**
 * Standard Response Utilities
 * Helper functions for consistent API responses
 */

import { ApiResponse, ApiError, PaginatedResponse, Pagination } from '../types';

/**
 * Create a successful response
 */
export function successResponse<T>(
  data: T,
  message?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}

/**
 * Create an error response
 */
export function errorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>
): ApiResponse<never> {
  const error: ApiError = {
    code,
    message,
    ...(details && { details }),
  };

  return {
    success: false,
    error,
  };
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: Pagination
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination,
  };
}
