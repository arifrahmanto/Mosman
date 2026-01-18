/**
 * Expense Service Layer
 * Business logic for expense operations with line items support
 */

import { supabase } from '../config/supabase';
import {
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseResponse,
  ExpenseFilters,
  ExpenseStatus,
  ExpenseItemResponse
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

    // Build query for expenses
    let query = supabase
      .from('expenses')
      .select(`
        *,
        pocket:pockets(id, name)
      `, { count: 'exact' });

    // Apply filters
    if (filters.pocket_id) {
      query = query.eq('pocket_id', filters.pocket_id);
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

    const { data: expenses, error, count } = await query;

    if (error) {
      throw new DatabaseError('Failed to fetch expenses', { error: error.message });
    }

    // Fetch items for all expenses
    const expenseIds = (expenses || []).map((e: any) => e.id);

    let itemsQuery = supabase
      .from('expense_items')
      .select(`
        *,
        category:expense_categories(id, name)
      `)
      .in('expense_id', expenseIds);

    // Filter by category_id if provided
    if (filters.category_id) {
      itemsQuery = itemsQuery.eq('category_id', filters.category_id);
    }

    const { data: items, error: itemsError } = await itemsQuery;

    if (itemsError) {
      throw new DatabaseError('Failed to fetch expense items', { error: itemsError.message });
    }

    // Group items by expense_id
    const itemsByExpense = (items || []).reduce((acc: any, item: any) => {
      if (!acc[item.expense_id]) {
        acc[item.expense_id] = [];
      }
      acc[item.expense_id].push({
        id: item.id,
        expense_id: item.expense_id,
        category_id: item.category_id,
        category_name: item.category?.name || 'Unknown',
        amount: Number(item.amount),
        description: item.description,
        created_at: item.created_at,
        updated_at: item.updated_at,
      });
      return acc;
    }, {});

    // Map to response format
    const expenseResponses: ExpenseResponse[] = (expenses || [])
      .map((expense: any) => {
        const expenseItems: ExpenseItemResponse[] = itemsByExpense[expense.id] || [];
        const total_amount = expenseItems.reduce((sum, item) => sum + item.amount, 0);

        // If filtering by category_id, only include expenses that have items with that category
        if (filters.category_id && expenseItems.length === 0) {
          return null;
        }

        return {
          id: expense.id,
          pocket_id: expense.pocket_id,
          pocket_name: expense.pocket?.name || 'Unknown',
          description: expense.description,
          receipt_url: expense.receipt_url,
          expense_date: expense.expense_date,
          status: expense.status as ExpenseStatus,
          total_amount,
          items: expenseItems,
          approved_by: expense.approved_by,
          recorded_by: expense.recorded_by,
          notes: expense.notes,
          created_at: expense.created_at,
          updated_at: expense.updated_at,
        };
      })
      .filter((e): e is ExpenseResponse => e !== null);

    const pagination: Pagination = {
      page,
      pageSize,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
    };

    return {
      success: true,
      data: expenseResponses,
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
    const { data: expense, error } = await supabase
      .from('expenses')
      .select(`
        *,
        pocket:pockets(id, name)
      `)
      .eq('id', id)
      .single();

    if (error || !expense) {
      throw new NotFoundError('Expense not found');
    }

    // Fetch items for this expense
    const { data: items, error: itemsError } = await supabase
      .from('expense_items')
      .select(`
        *,
        category:expense_categories(id, name)
      `)
      .eq('expense_id', id);

    if (itemsError) {
      throw new DatabaseError('Failed to fetch expense items', { error: itemsError.message });
    }

    const expenseItems: ExpenseItemResponse[] = (items || []).map((item: any) => ({
      id: item.id,
      expense_id: item.expense_id,
      category_id: item.category_id,
      category_name: item.category?.name || 'Unknown',
      amount: Number(item.amount),
      description: item.description,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    const total_amount = expenseItems.reduce((sum, item) => sum + item.amount, 0);

    return {
      id: expense.id,
      pocket_id: expense.pocket_id,
      pocket_name: expense.pocket?.name || 'Unknown',
      description: expense.description,
      receipt_url: expense.receipt_url,
      expense_date: expense.expense_date,
      status: expense.status as ExpenseStatus,
      total_amount,
      items: expenseItems,
      approved_by: expense.approved_by,
      recorded_by: expense.recorded_by,
      notes: expense.notes,
      created_at: expense.created_at,
      updated_at: expense.updated_at,
    };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError('An error occurred while fetching expense');
  }
}

/**
 * Create a new expense with line items
 */
export async function createExpense(
  expenseData: CreateExpenseRequest,
  userId: string
): Promise<ExpenseResponse> {
  try {
    // Validate items array
    if (!expenseData.items || expenseData.items.length === 0) {
      throw new ValidationError('At least one expense item is required');
    }

    // Validate pocket exists
    const { data: pocket, error: pocketError } = await supabase
      .from('pockets')
      .select('id, name')
      .eq('id', expenseData.pocket_id)
      .single();

    if (pocketError || !pocket) {
      throw new ValidationError('Invalid pocket ID');
    }

    // Validate all categories exist
    const categoryIds = expenseData.items.map(item => item.category_id);
    const { data: categories, error: categoryError } = await supabase
      .from('expense_categories')
      .select('id, name')
      .in('id', categoryIds);

    if (categoryError || !categories || categories.length !== categoryIds.length) {
      throw new ValidationError('One or more invalid category IDs');
    }

    // Create category lookup map
    const categoryMap = categories.reduce((acc: any, cat: any) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {});

    // Create expense (without category_id and amount)
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        pocket_id: expenseData.pocket_id,
        description: expenseData.description,
        receipt_url: expenseData.receipt_url,
        expense_date: expenseData.expense_date,
        notes: expenseData.notes,
        status: ExpenseStatus.PENDING,
        recorded_by: userId,
      })
      .select()
      .single();

    if (expenseError || !expense) {
      throw new DatabaseError('Failed to create expense', { error: expenseError?.message });
    }

    // Create expense items
    const itemsToInsert = expenseData.items.map(item => ({
      expense_id: expense.id,
      category_id: item.category_id,
      amount: item.amount,
      description: item.description,
    }));

    const { data: createdItems, error: itemsError } = await supabase
      .from('expense_items')
      .insert(itemsToInsert)
      .select();

    if (itemsError || !createdItems) {
      // Rollback: delete the expense
      await supabase.from('expenses').delete().eq('id', expense.id);
      throw new DatabaseError('Failed to create expense items', { error: itemsError?.message });
    }

    // Map items to response format
    const expenseItems: ExpenseItemResponse[] = createdItems.map((item: any) => ({
      id: item.id,
      expense_id: item.expense_id,
      category_id: item.category_id,
      category_name: categoryMap[item.category_id] || 'Unknown',
      amount: Number(item.amount),
      description: item.description,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    const total_amount = expenseItems.reduce((sum, item) => sum + item.amount, 0);

    return {
      id: expense.id,
      pocket_id: expense.pocket_id,
      pocket_name: pocket.name,
      description: expense.description,
      receipt_url: expense.receipt_url,
      expense_date: expense.expense_date,
      status: expense.status as ExpenseStatus,
      total_amount,
      items: expenseItems,
      approved_by: expense.approved_by,
      recorded_by: expense.recorded_by,
      notes: expense.notes,
      created_at: expense.created_at,
      updated_at: expense.updated_at,
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
  expenseData: UpdateExpenseRequest
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

    // If items are provided, validate categories
    if (expenseData.items) {
      if (expenseData.items.length === 0) {
        throw new ValidationError('At least one expense item is required');
      }

      const categoryIds = expenseData.items.map(item => item.category_id);
      const { data: categories, error: categoryError } = await supabase
        .from('expense_categories')
        .select('id')
        .in('id', categoryIds);

      if (categoryError || !categories || categories.length !== categoryIds.length) {
        throw new ValidationError('One or more invalid category IDs');
      }
    }

    // Update expense
    const updatePayload: any = {};
    if (expenseData.pocket_id) updatePayload.pocket_id = expenseData.pocket_id;
    if (expenseData.description !== undefined) updatePayload.description = expenseData.description;
    if (expenseData.receipt_url !== undefined) updatePayload.receipt_url = expenseData.receipt_url;
    if (expenseData.expense_date) updatePayload.expense_date = expenseData.expense_date;
    if (expenseData.notes !== undefined) updatePayload.notes = expenseData.notes;

    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (expenseError || !expense) {
      if (expenseError?.code === 'PGRST116') {
        throw new NotFoundError('Expense not found');
      }
      throw new DatabaseError('Failed to update expense', { error: expenseError?.message });
    }

    // If items are provided, replace existing items
    if (expenseData.items) {
      // Delete existing items
      await supabase
        .from('expense_items')
        .delete()
        .eq('expense_id', id);

      // Insert new items
      const itemsToInsert = expenseData.items.map(item => ({
        expense_id: id,
        category_id: item.category_id,
        amount: item.amount,
        description: item.description,
      }));

      const { error: itemsError } = await supabase
        .from('expense_items')
        .insert(itemsToInsert);

      if (itemsError) {
        throw new DatabaseError('Failed to update expense items', { error: itemsError.message });
      }
    }

    // Fetch complete expense with items
    return getExpenseById(id);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('An error occurred while updating expense');
  }
}

/**
 * Approve or reject an expense
 */
export async function approveExpense(
  id: string,
  adminId: string,
  status: ExpenseStatus
): Promise<ExpenseResponse> {
  try {
    if (status !== ExpenseStatus.APPROVED && status !== ExpenseStatus.REJECTED) {
      throw new ValidationError('Status must be either approved or rejected');
    }

    const { data: expense, error } = await supabase
      .from('expenses')
      .update({
        status,
        approved_by: adminId,
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !expense) {
      if (error?.code === 'PGRST116') {
        throw new NotFoundError('Expense not found');
      }
      throw new DatabaseError('Failed to approve expense', { error: error?.message });
    }

    return getExpenseById(id);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('An error occurred while approving expense');
  }
}

/**
 * Delete an expense (items will be cascade deleted)
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
