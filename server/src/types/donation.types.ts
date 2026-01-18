/**
 * Donation Types
 * Type definitions for donation-related data with line items support
 */

export interface DonationItem {
  category_id: string;
  amount: number;
  description?: string;
}

export interface DonationItemResponse {
  id: string;
  donation_id: string;
  category_id: string;
  category_name: string;
  amount: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: string;
  pocket_id: string;
  donor_name: string | null;
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
  donor_name?: string;
  is_anonymous: boolean;
  payment_method: 'cash' | 'transfer' | 'qris';
  receipt_url?: string;
  notes?: string;
  donation_date: string;
  items: DonationItem[];  // Array of donation items with category and amount
}

export interface UpdateDonationRequest {
  pocket_id?: string;
  donor_name?: string;
  is_anonymous?: boolean;
  payment_method?: 'cash' | 'transfer' | 'qris';
  receipt_url?: string;
  notes?: string;
  donation_date?: string;
  items?: DonationItem[];  // Optional: update items if provided
}

export interface DonationResponse {
  id: string;
  pocket_id: string;
  pocket_name: string;
  donor_name: string | null;
  is_anonymous: boolean;
  payment_method: string;
  receipt_url: string | null;
  notes: string | null;
  donation_date: string;
  total_amount: number;  // Sum of all items
  items: DonationItemResponse[];
  recorded_by: string;
  created_at: string;
  updated_at: string;
}

export interface DonationFilters {
  pocket_id?: string;
  category_id?: string;  // Filter by items containing this category
  start_date?: string;
  end_date?: string;
  payment_method?: string;
  page?: number;
  page_size?: number;
}
