/**
 * Donation Service Layer
 * Business logic for donation operations with line items support
 */

import { supabase } from '../config/supabase';
import {
  CreateDonationRequest,
  UpdateDonationRequest,
  DonationResponse,
  DonationFilters,
  DonationItemResponse
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

    // Build query for donations
    let query = supabase
      .from('donations')
      .select(`
        *,
        pocket:pockets(id, name)
      `, { count: 'exact' });

    // Apply filters
    if (filters.pocket_id) {
      query = query.eq('pocket_id', filters.pocket_id);
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

    const { data: donations, error, count } = await query;

    if (error) {
      throw new DatabaseError('Failed to fetch donations', { error: error.message });
    }

    // Fetch items for all donations
    const donationIds = (donations || []).map((d: any) => d.id);

    let itemsQuery = supabase
      .from('donation_items')
      .select(`
        *,
        category:donation_categories(id, name)
      `)
      .in('donation_id', donationIds);

    // Filter by category_id if provided
    if (filters.category_id) {
      itemsQuery = itemsQuery.eq('category_id', filters.category_id);
    }

    const { data: items, error: itemsError } = await itemsQuery;

    if (itemsError) {
      throw new DatabaseError('Failed to fetch donation items', { error: itemsError.message });
    }

    // Group items by donation_id
    const itemsByDonation = (items || []).reduce((acc: any, item: any) => {
      if (!acc[item.donation_id]) {
        acc[item.donation_id] = [];
      }
      acc[item.donation_id].push({
        id: item.id,
        donation_id: item.donation_id,
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
    const donationResponses: DonationResponse[] = (donations || [])
      .map((donation: any) => {
        const donationItems: DonationItemResponse[] = itemsByDonation[donation.id] || [];
        const total_amount = donationItems.reduce((sum, item) => sum + item.amount, 0);

        // If filtering by category_id, only include donations that have items with that category
        if (filters.category_id && donationItems.length === 0) {
          return null;
        }

        return {
          id: donation.id,
          pocket_id: donation.pocket_id,
          pocket_name: donation.pocket?.name || 'Unknown',
          donor_name: donation.donor_name,
          is_anonymous: donation.is_anonymous,
          payment_method: donation.payment_method,
          receipt_url: donation.receipt_url,
          notes: donation.notes,
          donation_date: donation.donation_date,
          total_amount,
          items: donationItems,
          recorded_by: donation.recorded_by,
          created_at: donation.created_at,
          updated_at: donation.updated_at,
        };
      })
      .filter((d): d is DonationResponse => d !== null);

    const pagination: Pagination = {
      page,
      pageSize,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
    };

    return {
      success: true,
      data: donationResponses,
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
    const { data: donation, error } = await supabase
      .from('donations')
      .select(`
        *,
        pocket:pockets(id, name)
      `)
      .eq('id', id)
      .single();

    if (error || !donation) {
      throw new NotFoundError('Donation not found');
    }

    // Fetch items for this donation
    const { data: items, error: itemsError } = await supabase
      .from('donation_items')
      .select(`
        *,
        category:donation_categories(id, name)
      `)
      .eq('donation_id', id);

    if (itemsError) {
      throw new DatabaseError('Failed to fetch donation items', { error: itemsError.message });
    }

    const donationItems: DonationItemResponse[] = (items || []).map((item: any) => ({
      id: item.id,
      donation_id: item.donation_id,
      category_id: item.category_id,
      category_name: item.category?.name || 'Unknown',
      amount: Number(item.amount),
      description: item.description,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    const total_amount = donationItems.reduce((sum, item) => sum + item.amount, 0);

    return {
      id: donation.id,
      pocket_id: donation.pocket_id,
      pocket_name: donation.pocket?.name || 'Unknown',
      donor_name: donation.donor_name,
      is_anonymous: donation.is_anonymous,
      payment_method: donation.payment_method,
      receipt_url: donation.receipt_url,
      notes: donation.notes,
      donation_date: donation.donation_date,
      total_amount,
      items: donationItems,
      recorded_by: donation.recorded_by,
      created_at: donation.created_at,
      updated_at: donation.updated_at,
    };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError('An error occurred while fetching donation');
  }
}

/**
 * Create a new donation with line items
 */
export async function createDonation(
  donationData: CreateDonationRequest,
  userId: string
): Promise<DonationResponse> {
  try {
    // Validate items array
    if (!donationData.items || donationData.items.length === 0) {
      throw new ValidationError('At least one donation item is required');
    }

    // Validate pocket exists
    const { data: pocket, error: pocketError } = await supabase
      .from('pockets')
      .select('id, name')
      .eq('id', donationData.pocket_id)
      .single();

    if (pocketError || !pocket) {
      throw new ValidationError('Invalid pocket ID');
    }

    // Validate all categories exist
    const categoryIds = donationData.items.map(item => item.category_id);
    const { data: categories, error: categoryError } = await supabase
      .from('donation_categories')
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

    // Create donation (without category_id and amount)
    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .insert({
        pocket_id: donationData.pocket_id,
        donor_name: donationData.donor_name,
        is_anonymous: donationData.is_anonymous,
        payment_method: donationData.payment_method,
        receipt_url: donationData.receipt_url,
        notes: donationData.notes,
        donation_date: donationData.donation_date,
        recorded_by: userId,
      })
      .select()
      .single();

    if (donationError || !donation) {
      throw new DatabaseError('Failed to create donation', { error: donationError?.message });
    }

    // Create donation items
    const itemsToInsert = donationData.items.map(item => ({
      donation_id: donation.id,
      category_id: item.category_id,
      amount: item.amount,
      description: item.description,
    }));

    const { data: createdItems, error: itemsError } = await supabase
      .from('donation_items')
      .insert(itemsToInsert)
      .select();

    if (itemsError || !createdItems) {
      // Rollback: delete the donation
      await supabase.from('donations').delete().eq('id', donation.id);
      throw new DatabaseError('Failed to create donation items', { error: itemsError?.message });
    }

    // Map items to response format
    const donationItems: DonationItemResponse[] = createdItems.map((item: any) => ({
      id: item.id,
      donation_id: item.donation_id,
      category_id: item.category_id,
      category_name: categoryMap[item.category_id] || 'Unknown',
      amount: Number(item.amount),
      description: item.description,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    const total_amount = donationItems.reduce((sum, item) => sum + item.amount, 0);

    return {
      id: donation.id,
      pocket_id: donation.pocket_id,
      pocket_name: pocket.name,
      donor_name: donation.donor_name,
      is_anonymous: donation.is_anonymous,
      payment_method: donation.payment_method,
      receipt_url: donation.receipt_url,
      notes: donation.notes,
      donation_date: donation.donation_date,
      total_amount,
      items: donationItems,
      recorded_by: donation.recorded_by,
      created_at: donation.created_at,
      updated_at: donation.updated_at,
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
  donationData: UpdateDonationRequest
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

    // If items are provided, validate categories
    if (donationData.items) {
      if (donationData.items.length === 0) {
        throw new ValidationError('At least one donation item is required');
      }

      const categoryIds = donationData.items.map(item => item.category_id);
      const { data: categories, error: categoryError } = await supabase
        .from('donation_categories')
        .select('id')
        .in('id', categoryIds);

      if (categoryError || !categories || categories.length !== categoryIds.length) {
        throw new ValidationError('One or more invalid category IDs');
      }
    }

    // Update donation
    const updatePayload: any = {};
    if (donationData.pocket_id) updatePayload.pocket_id = donationData.pocket_id;
    if (donationData.donor_name !== undefined) updatePayload.donor_name = donationData.donor_name;
    if (donationData.is_anonymous !== undefined) updatePayload.is_anonymous = donationData.is_anonymous;
    if (donationData.payment_method) updatePayload.payment_method = donationData.payment_method;
    if (donationData.receipt_url !== undefined) updatePayload.receipt_url = donationData.receipt_url;
    if (donationData.notes !== undefined) updatePayload.notes = donationData.notes;
    if (donationData.donation_date) updatePayload.donation_date = donationData.donation_date;

    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (donationError || !donation) {
      if (donationError?.code === 'PGRST116') {
        throw new NotFoundError('Donation not found');
      }
      throw new DatabaseError('Failed to update donation', { error: donationError?.message });
    }

    // If items are provided, replace existing items
    if (donationData.items) {
      // Delete existing items
      await supabase
        .from('donation_items')
        .delete()
        .eq('donation_id', id);

      // Insert new items
      const itemsToInsert = donationData.items.map(item => ({
        donation_id: id,
        category_id: item.category_id,
        amount: item.amount,
        description: item.description,
      }));

      const { error: itemsError } = await supabase
        .from('donation_items')
        .insert(itemsToInsert);

      if (itemsError) {
        throw new DatabaseError('Failed to update donation items', { error: itemsError.message });
      }
    }

    // Fetch complete donation with items
    return getDonationById(id);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('An error occurred while updating donation');
  }
}

/**
 * Delete a donation (items will be cascade deleted)
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
