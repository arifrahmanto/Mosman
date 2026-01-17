/**
 * Expense Types
 * Type definitions for expense-related data
 */

export enum ExpenseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface Expense {
  id: string;
  pocket_id: string;
  category_id: string;
  description: string;
  amount: number;
  receipt_url: string | null;
  expense_date: string;
  status: ExpenseStatus;
  approved_by: string | null;
  recorded_by: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseRequest {
  pocket_id: string;
  category_id: string;
  description: string;
  amount: number;
  receipt_url?: string;
  expense_date: string;
  notes?: string;
}

export interface UpdateExpenseRequest {
  pocket_id?: string;
  category_id?: string;
  description?: string;
  amount?: number;
  receipt_url?: string;
  expense_date?: string;
  notes?: string;
}

export interface ExpenseResponse {
  id: string;
  pocket_id: string;
  pocket_name: string;
  category_id: string;
  category_name: string;
  description: string;
  amount: number;
  receipt_url: string | null;
  expense_date: string;
  status: ExpenseStatus;
  approved_by: string | null;
  recorded_by: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseFilters {
  pocket_id?: string;
  category_id?: string;
  status?: ExpenseStatus;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}
