/**
 * Expense Service Layer
 * Business logic for expense operations
 */

import { supabase } from '../config/supabase';
import {
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseResponse,
  ExpenseFilters,
  ExpenseStatus
} from '../types/expense.types';
import { PaginatedResponse, Pagination } from '../types';
import { DatabaseError, NotFoundError, ValidationError } from '../middleware/errorHandler';

/**
 * Get all expenses with optional filtering and pagination
 */
export async function getExpenses(
  filters: ExpenseFilters = {}
): Promise<PaginatedResponse<ExpenseResponse>> {
  try {
    const page = filters.page || 1;
    const pageSize = filters.page_size || 20;
    const offset = (page - 1) * pageSize;

    // Build query
    let query = supabase
      .from('expenses')
      .select(`
        *,
        pocket:pockets(id, name),
        category:expense_categories(id, name)
      `, { count: 'exact' });

    // Apply filters
    if (filters.pocket_id) {
      query = query.eq('pocket_id', filters.pocket_id);
    }
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.start_date) {
      query = query.gte('expense_date', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('expense_date', filters.end_date);
    }

    // Apply pagination and sorting
    query = query
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new DatabaseError('Failed to fetch expenses', { error: error.message });
    }

    // Map to response format
    const expenses: ExpenseResponse[] = (data || []).map((expense: any) => ({
      id: expense.id,
      pocket_id: expense.pocket_id,
      pocket_name: expense.pocket?.name || 'Unknown',
      category_id: expense.category_id,
      category_name: expense.category?.name || 'Unknown',
      description: expense.description,
      amount: Number(expense.amount),
      receipt_url: expense.receipt_url,
      expense_date: expense.expense_date,
      status: expense.status as ExpenseStatus,
      approved_by: expense.approved_by,
      recorded_by: expense.recorded_by,
      notes: expense.notes,
      created_at: expense.created_at,
      updated_at: expense.updated_at,
    }));

    const pagination: Pagination = {
      page,
      pageSize,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
    };

    return {
      success: true,
      data: expenses,
      pagination,
    };
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError('An error occurred while fetching expenses');
  }
}

/**
 * Get a single expense by ID
 */
export async function getExpenseById(id: string): Promise<ExpenseResponse> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        pocket:pockets(id, name),
        category:expense_categories(id, name)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundError('Expense not found');
    }

    return {
      id: data.id,
      pocket_id: data.pocket_id,
      pocket_name: data.pocket?.name || 'Unknown',
      category_id: data.category_id,
      category_name: data.category?.name || 'Unknown',
      description: data.description,
      amount: Number(data.amount),
      receipt_url: data.receipt_url,
      expense_date: data.expense_date,
      status: data.status as ExpenseStatus,
      approved_by: data.approved_by,
      recorded_by: data.recorded_by,
      notes: data.notes,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError('An error occurred while fetching expense');
  }
}

/**
 * Create a new expense
 */
export async function createExpense(
  expenseData: CreateExpenseRequest,
  userId: string
): Promise<ExpenseResponse> {
  try {
    // Validate pocket exists
    const { data: pocket, error: pocketError } = await supabase
      .from('pockets')
      .select('id')
      .eq('id', expenseData.pocket_id)
      .single();

    if (pocketError || !pocket) {
      throw new ValidationError('Invalid pocket ID');
    }

    // Validate category exists
    const { data: category, error: categoryError } = await supabase
      .from('expense_categories')
      .select('id')
      .eq('id', expenseData.category_id)
      .single();

    if (categoryError || !category) {
      throw new ValidationError('Invalid category ID');
    }

    // Create expense with pending status
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        ...expenseData,
        status: ExpenseStatus.PENDING,
        recorded_by: userId,
      })
      .select(`
        *,
        pocket:pockets(id, name),
        category:expense_categories(id, name)
      `)
      .single();

    if (error || !data) {
      throw new DatabaseError('Failed to create expense', { error: error?.message });
    }

    return {
      id: data.id,
      pocket_id: data.pocket_id,
      pocket_name: data.pocket?.name || 'Unknown',
      category_id: data.category_id,
      category_name: data.category?.name || 'Unknown',
      description: data.description,
      amount: Number(data.amount),
      receipt_url: data.receipt_url,
      expense_date: data.expense_date,
      status: data.status as ExpenseStatus,
      approved_by: data.approved_by,
      recorded_by: data.recorded_by,
      notes: data.notes,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    if (error instanceof ValidationError || error instanceof DatabaseError) throw error;
    throw new DatabaseError('An error occurred while creating expense');
  }
}

/**
 * Update an existing expense
 */
export async function updateExpense(
  id: string,
  expenseData: UpdateExpenseRequest,
  userId: string
): Promise<ExpenseResponse> {
  try {
    // Validate pocket if provided
    if (expenseData.pocket_id) {
      const { data: pocket, error: pocketError } = await supabase
        .from('pockets')
        .select('id')
        .eq('id', expenseData.pocket_id)
        .single();

      if (pocketError || !pocket) {
        throw new ValidationError('Invalid pocket ID');
      }
    }

    // Validate category if provided
    if (expenseData.category_id) {
      const { data: category, error: categoryError } = await supabase
        .from('expense_categories')
        .select('id')
        .eq('id', expenseData.category_id)
        .single();

      if (categoryError || !category) {
        throw new ValidationError('Invalid category ID');
      }
    }

    // Update expense
    const { data, error } = await supabase
      .from('expenses')
      .update(expenseData)
      .eq('id', id)
      .select(`
        *,
        pocket:pockets(id, name),
        category:expense_categories(id, name)
      `)
      .single();

    if (error || !data) {
      if (error?.code === 'PGRST116') {
        throw new NotFoundError('Expense not found');
      }
      throw new DatabaseError('Failed to update expense', { error: error?.message });
    }

    return {
      id: data.id,
      pocket_id: data.pocket_id,
      pocket_name: data.pocket?.name || 'Unknown',
      category_id: data.category_id,
      category_name: data.category?.name || 'Unknown',
      description: data.description,
      amount: Number(data.amount),
      receipt_url: data.receipt_url,
      expense_date: data.expense_date,
      status: data.status as ExpenseStatus,
      approved_by: data.approved_by,
      recorded_by: data.recorded_by,
      notes: data.notes,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('An error occurred while updating expense');
  }
}

/**
 * Approve or reject an expense (admin only)
 */
export async function approveExpense(
  id: string,
  status: ExpenseStatus,
  adminId: string
): Promise<ExpenseResponse> {
  try {
    const updateData: any = {
      status,
    };

    // Set approved_by if approving
    if (status === ExpenseStatus.APPROVED) {
      updateData.approved_by = adminId;
    }

    const { data, error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        pocket:pockets(id, name),
        category:expense_categories(id, name)
      `)
      .single();

    if (error || !data) {
      if (error?.code === 'PGRST116') {
        throw new NotFoundError('Expense not found');
      }
      throw new DatabaseError('Failed to approve expense', { error: error?.message });
    }

    return {
      id: data.id,
      pocket_id: data.pocket_id,
      pocket_name: data.pocket?.name || 'Unknown',
      category_id: data.category_id,
      category_name: data.category?.name || 'Unknown',
      description: data.description,
      amount: Number(data.amount),
      receipt_url: data.receipt_url,
      expense_date: data.expense_date,
      status: data.status as ExpenseStatus,
      approved_by: data.approved_by,
      recorded_by: data.recorded_by,
      notes: data.notes,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof DatabaseError) throw error;
    throw new DatabaseError('An error occurred while approving expense');
  }
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Expense not found');
      }
      throw new DatabaseError('Failed to delete expense', { error: error.message });
    }
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof DatabaseError) throw error;
    throw new DatabaseError('An error occurred while deleting expense');
  }
}

/**
 * Get expenses by pocket ID
 */
export async function getExpensesByPocket(
  pocketId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<ExpenseResponse>> {
  return getExpenses({ pocket_id: pocketId, page, page_size: pageSize });
}
