/**
 * Expense Validation Schemas
 * Zod schemas for validating expense-related requests with line items support
 */

import { z } from 'zod';

/**
 * Expense status enum
 */
export const expenseStatusSchema = z.enum(['pending', 'approved', 'rejected']);

/**
 * Expense item schema
 */
export const expenseItemSchema = z.object({
  category_id: z.string().uuid('Category ID must be a valid UUID'),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().max(500).optional(),
});

/**
 * Create expense request schema
 */
export const createExpenseSchema = z.object({
  pocket_id: z.string().uuid('Pocket ID must be a valid UUID'),
  description: z.string().min(1, 'Description is required').max(1000),
  receipt_url: z.string().url('Receipt URL must be a valid URL').optional(),
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  notes: z.string().max(1000).optional(),
  items: z.array(expenseItemSchema).min(1, 'At least one item is required'),
});

/**
 * Update expense request schema
 */
export const updateExpenseSchema = z.object({
  pocket_id: z.string().uuid('Pocket ID must be a valid UUID').optional(),
  description: z.string().min(1).max(1000).optional(),
  receipt_url: z.string().url('Receipt URL must be a valid URL').optional(),
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  notes: z.string().max(1000).optional(),
  items: z.array(expenseItemSchema).min(1, 'At least one item is required').optional(),
});

/**
 * Approve expense request schema
 */
export const approveExpenseSchema = z.object({
  status: expenseStatusSchema,
});

/**
 * Expense query parameters schema
 */
export const expenseQuerySchema = z.object({
  pocket_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  status: expenseStatusSchema.optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  page_size: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
});

// Export inferred types
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ApproveExpenseInput = z.infer<typeof approveExpenseSchema>;
export type ExpenseQueryInput = z.infer<typeof expenseQuerySchema>;
export type ExpenseItemInput = z.infer<typeof expenseItemSchema>;
