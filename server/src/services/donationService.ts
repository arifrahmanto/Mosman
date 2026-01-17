/**
 * Donation Service Layer
 * Business logic for donation operations
 */

import { supabase } from '../config/supabase';
import {
  CreateDonationRequest,
  UpdateDonationRequest,
  DonationResponse,
  DonationFilters
} from '../types/donation.types';
import { PaginatedResponse, Pagination } from '../types';
import { DatabaseError, NotFoundError, ValidationError } from '../middleware/errorHandler';

/**
 * Get all donations with optional filtering and pagination
 */
export async function getDonations(
  filters: DonationFilters = {}
): Promise<PaginatedResponse<DonationResponse>> {
  try {
    const page = filters.page || 1;
    const pageSize = filters.page_size || 20;
    const offset = (page - 1) * pageSize;

    // Build query
    let query = supabase
      .from('donations')
      .select(`
        *,
        pocket:pockets(id, name),
        category:donation_categories(id, name)
      `, { count: 'exact' });

    // Apply filters
    if (filters.pocket_id) {
      query = query.eq('pocket_id', filters.pocket_id);
    }
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
    }
    if (filters.start_date) {
      query = query.gte('donation_date', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('donation_date', filters.end_date);
    }
    if (filters.payment_method) {
      query = query.eq('payment_method', filters.payment_method);
    }

    // Apply pagination and sorting
    query = query
      .order('donation_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new DatabaseError('Failed to fetch donations', { error: error.message });
    }

    // Map to response format
    const donations: DonationResponse[] = (data || []).map((donation: any) => ({
      id: donation.id,
      pocket_id: donation.pocket_id,
      pocket_name: donation.pocket?.name || 'Unknown',
      category_id: donation.category_id,
      category_name: donation.category?.name || 'Unknown',
      donor_name: donation.donor_name,
      amount: Number(donation.amount),
      is_anonymous: donation.is_anonymous,
      payment_method: donation.payment_method,
      receipt_url: donation.receipt_url,
      notes: donation.notes,
      donation_date: donation.donation_date,
      recorded_by: donation.recorded_by,
      created_at: donation.created_at,
      updated_at: donation.updated_at,
    }));

    const pagination: Pagination = {
      page,
      pageSize,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
    };

    return {
      success: true,
      data: donations,
      pagination,
    };
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError('An error occurred while fetching donations');
  }
}

/**
 * Get a single donation by ID
 */
export async function getDonationById(id: string): Promise<DonationResponse> {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        pocket:pockets(id, name),
        category:donation_categories(id, name)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundError('Donation not found');
    }

    return {
      id: data.id,
      pocket_id: data.pocket_id,
      pocket_name: data.pocket?.name || 'Unknown',
      category_id: data.category_id,
      category_name: data.category?.name || 'Unknown',
      donor_name: data.donor_name,
      amount: Number(data.amount),
      is_anonymous: data.is_anonymous,
      payment_method: data.payment_method,
      receipt_url: data.receipt_url,
      notes: data.notes,
      donation_date: data.donation_date,
      recorded_by: data.recorded_by,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError('An error occurred while fetching donation');
  }
}

/**
 * Create a new donation
 */
export async function createDonation(
  donationData: CreateDonationRequest,
  userId: string
): Promise<DonationResponse> {
  try {
    // Validate pocket exists
    const { data: pocket, error: pocketError } = await supabase
      .from('pockets')
      .select('id')
      .eq('id', donationData.pocket_id)
      .single();

    if (pocketError || !pocket) {
      throw new ValidationError('Invalid pocket ID');
    }

    // Validate category exists
    const { data: category, error: categoryError } = await supabase
      .from('donation_categories')
      .select('id')
      .eq('id', donationData.category_id)
      .single();

    if (categoryError || !category) {
      throw new ValidationError('Invalid category ID');
    }

    // Create donation
    const { data, error } = await supabase
      .from('donations')
      .insert({
        ...donationData,
        recorded_by: userId,
      })
      .select(`
        *,
        pocket:pockets(id, name),
        category:donation_categories(id, name)
      `)
      .single();

    if (error || !data) {
      throw new DatabaseError('Failed to create donation', { error: error?.message });
    }

    return {
      id: data.id,
      pocket_id: data.pocket_id,
      pocket_name: data.pocket?.name || 'Unknown',
      category_id: data.category_id,
      category_name: data.category?.name || 'Unknown',
      donor_name: data.donor_name,
      amount: Number(data.amount),
      is_anonymous: data.is_anonymous,
      payment_method: data.payment_method,
      receipt_url: data.receipt_url,
      notes: data.notes,
      donation_date: data.donation_date,
      recorded_by: data.recorded_by,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    if (error instanceof ValidationError || error instanceof DatabaseError) throw error;
    throw new DatabaseError('An error occurred while creating donation');
  }
}

/**
 * Update an existing donation
 */
export async function updateDonation(
  id: string,
  donationData: UpdateDonationRequest,
  userId: string
): Promise<DonationResponse> {
  try {
    // Validate pocket if provided
    if (donationData.pocket_id) {
      const { data: pocket, error: pocketError } = await supabase
        .from('pockets')
        .select('id')
        .eq('id', donationData.pocket_id)
        .single();

      if (pocketError || !pocket) {
        throw new ValidationError('Invalid pocket ID');
      }
    }

    // Validate category if provided
    if (donationData.category_id) {
      const { data: category, error: categoryError } = await supabase
        .from('donation_categories')
        .select('id')
        .eq('id', donationData.category_id)
        .single();

      if (categoryError || !category) {
        throw new ValidationError('Invalid category ID');
      }
    }

    // Update donation
    const { data, error } = await supabase
      .from('donations')
      .update(donationData)
      .eq('id', id)
      .select(`
        *,
        pocket:pockets(id, name),
        category:donation_categories(id, name)
      `)
      .single();

    if (error || !data) {
      if (error?.code === 'PGRST116') {
        throw new NotFoundError('Donation not found');
      }
      throw new DatabaseError('Failed to update donation', { error: error?.message });
    }

    return {
      id: data.id,
      pocket_id: data.pocket_id,
      pocket_name: data.pocket?.name || 'Unknown',
      category_id: data.category_id,
      category_name: data.category?.name || 'Unknown',
      donor_name: data.donor_name,
      amount: Number(data.amount),
      is_anonymous: data.is_anonymous,
      payment_method: data.payment_method,
      receipt_url: data.receipt_url,
      notes: data.notes,
      donation_date: data.donation_date,
      recorded_by: data.recorded_by,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('An error occurred while updating donation');
  }
}

/**
 * Delete a donation
 */
export async function deleteDonation(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('donations')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Donation not found');
      }
      throw new DatabaseError('Failed to delete donation', { error: error.message });
    }
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof DatabaseError) throw error;
    throw new DatabaseError('An error occurred while deleting donation');
  }
}

/**
 * Get donations by pocket ID
 */
export async function getDonationsByPocket(
  pocketId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<DonationResponse>> {
  return getDonations({ pocket_id: pocketId, page, page_size: pageSize });
}
