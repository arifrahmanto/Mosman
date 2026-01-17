/**
 * Pocket Types
 * Type definitions for pocket-related data
 */

export interface Pocket {
  id: string;
  name: string;
  description: string | null;
  current_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PocketBalance {
  id: string;
  name: string;
  description: string | null;
  current_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PocketSummary {
  id: string;
  name: string;
  description: string | null;
  total_donations: number;
  total_expenses: number;
  balance: number;
  donation_count: number;
  expense_count: number;
  is_active: boolean;
}
