/**
 * Donation Types
 * Type definitions for donation-related data
 */

export interface Donation {
  id: string;
  pocket_id: string;
  category_id: string;
  donor_name: string | null;
  amount: number;
  is_anonymous: boolean;
  payment_method: 'cash' | 'transfer' | 'qris';
  receipt_url: string | null;
  notes: string | null;
  donation_date: string;
  recorded_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDonationRequest {
  pocket_id: string;
  category_id: string;
  donor_name?: string;
  amount: number;
  is_anonymous: boolean;
  payment_method: 'cash' | 'transfer' | 'qris';
  receipt_url?: string;
  notes?: string;
  donation_date: string;
}

export interface UpdateDonationRequest {
  pocket_id?: string;
  category_id?: string;
  donor_name?: string;
  amount?: number;
  is_anonymous?: boolean;
  payment_method?: 'cash' | 'transfer' | 'qris';
  receipt_url?: string;
  notes?: string;
  donation_date?: string;
}

export interface DonationResponse {
  id: string;
  pocket_id: string;
  pocket_name: string;
  category_id: string;
  category_name: string;
  donor_name: string | null;
  amount: number;
  is_anonymous: boolean;
  payment_method: string;
  receipt_url: string | null;
  notes: string | null;
  donation_date: string;
  recorded_by: string;
  created_at: string;
  updated_at: string;
}

export interface DonationFilters {
  pocket_id?: string;
  category_id?: string;
  start_date?: string;
  end_date?: string;
  payment_method?: string;
  page?: number;
  page_size?: number;
}
