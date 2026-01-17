/**
 * API Response Types
 * Standard response formats for all API endpoints
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
