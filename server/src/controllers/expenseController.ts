/**
 * Expense Controller
 * Handles HTTP requests for expense endpoints
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import { successResponse } from '../utils/response';
import * as expenseService from '../services/expenseService';
import { ExpenseFilters, ExpenseStatus } from '../types/expense.types';

/**
 * GET /api/v1/expenses
 * List all expenses with optional filters
 */
export async function listExpenses(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const filters: ExpenseFilters = {
    pocket_id: req.query.pocket_id as string,
    category_id: req.query.category_id as string,
    status: req.query.status as ExpenseStatus,
    start_date: req.query.start_date as string,
    end_date: req.query.end_date as string,
    page: req.query.page ? Number(req.query.page) : undefined,
    page_size: req.query.page_size ? Number(req.query.page_size) : undefined,
  };

  const result = await expenseService.getExpenses(filters);
  res.json(result);
}

/**
 * GET /api/v1/expenses/:id
 * Get a single expense by ID
 */
export async function getExpense(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { id } = req.params as { id: string };
  const expense = await expenseService.getExpenseById(id);
  res.json(successResponse(expense));
}

/**
 * POST /api/v1/expenses
 * Create a new expense
 */
export async function createExpense(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const userId = req.user!.id;
  const expense = await expenseService.createExpense(req.body, userId);
  res.status(201).json(successResponse(expense, 'Expense created successfully'));
}

/**
 * PUT /api/v1/expenses/:id
 * Update an existing expense
 */
export async function updateExpense(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { id } = req.params as { id: string };
  const userId = req.user!.id;
  const expense = await expenseService.updateExpense(id, req.body, userId);
  res.json(successResponse(expense, 'Expense updated successfully'));
}

/**
 * PUT /api/v1/expenses/:id/approve
 * Approve or reject an expense (admin only)
 */
export async function approveExpense(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { id } = req.params as { id: string };
  const { status } = req.body;
  const adminId = req.user!.id;

  const expense = await expenseService.approveExpense(id, status, adminId);
  res.json(successResponse(expense, `Expense ${status} successfully`));
}

/**
 * DELETE /api/v1/expenses/:id
 * Delete an expense
 */
export async function deleteExpense(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { id } = req.params as { id: string };
  await expenseService.deleteExpense(id);
  res.json(successResponse(null, 'Expense deleted successfully'));
}
