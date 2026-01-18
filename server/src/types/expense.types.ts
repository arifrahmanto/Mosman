/**
 * Expense Types
 * Type definitions for expense-related data with line items support
 */

export enum ExpenseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface ExpenseItem {
  category_id: string;
  amount: number;
  description?: string;
}

export interface ExpenseItemResponse {
  id: string;
  expense_id: string;
  category_id: string;
  category_name: string;
  amount: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  pocket_id: string;
  description: string;
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
  description: string;
  receipt_url?: string;
  expense_date: string;
  notes?: string;
  items: ExpenseItem[];  // Array of expense items with category and amount
}

export interface UpdateExpenseRequest {
  pocket_id?: string;
  description?: string;
  receipt_url?: string;
  expense_date?: string;
  notes?: string;
  items?: ExpenseItem[];  // Optional: update items if provided
}

export interface ExpenseResponse {
  id: string;
  pocket_id: string;
  pocket_name: string;
  description: string;
  receipt_url: string | null;
  expense_date: string;
  status: ExpenseStatus;
  total_amount: number;  // Sum of all items
  items: ExpenseItemResponse[];
  approved_by: string | null;
  recorded_by: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseFilters {
  pocket_id?: string;
  category_id?: string;  // Filter by items containing this category
  status?: ExpenseStatus;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}
