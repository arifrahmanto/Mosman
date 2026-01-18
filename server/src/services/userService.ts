/**
 * User Management Service
 * Handles user management business logic (Admin only operations)
 */

import { supabaseAdmin } from '../config/supabase';
import { UserRole } from '../types/auth.types';
import { UpdateUserInput, UserQueryInput } from '../validators/user.schema';
import { ApiError, PaginatedResponse } from '../types/api.types';

interface UserListItem {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Get all users with pagination and filters
 */
export async function getUsers(filters: UserQueryInput): Promise<PaginatedResponse<UserListItem>> {
  const page = filters.page || 1;
  const pageSize = filters.page_size || 20;
  const offset = (page - 1) * pageSize;

  // Build query
  let query = supabaseAdmin.from('user_profiles').select('*', { count: 'exact' });

  // Apply filters
  if (filters.role) {
    query = query.eq('role', filters.role);
  }

  if (filters.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  }

  // Apply pagination
  query = query.range(offset, offset + pageSize - 1).order('created_at', { ascending: false });

  const { data: profiles, error, count } = await query;

  if (error) {
    throw createApiError('FETCH_FAILED', 'Failed to fetch users');
  }

  // Fetch emails from auth users
  const userIds = profiles?.map((p) => p.id) || [];
  const usersWithEmails = await Promise.all(
    (profiles || []).map(async (profile) => {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(profile.id);
      return {
        id: profile.id,
        email: authUser?.user?.email || '',
        full_name: profile.full_name,
        role: profile.role as UserRole,
        phone: profile.phone,
        is_active: profile.is_active,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };
    })
  );

  return {
    success: true,
    data: usersWithEmails,
    pagination: {
      page,
      pageSize,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<UserListItem> {
  const { data: profile, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    throw createApiError('USER_NOT_FOUND', 'User not found');
  }

  // Get email from auth user
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (authError || !authUser.user) {
    throw createApiError('USER_NOT_FOUND', 'User not found');
  }

  return {
    id: profile.id,
    email: authUser.user.email!,
    full_name: profile.full_name,
    role: profile.role as UserRole,
    phone: profile.phone,
    is_active: profile.is_active,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  };
}

/**
 * Update user (Admin only)
 */
export async function updateUser(userId: string, data: UpdateUserInput): Promise<UserListItem> {
  // Check if user exists
  await getUserById(userId);

  // Update user profile
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.full_name !== undefined) updateData.full_name = data.full_name;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.is_active !== undefined) updateData.is_active = data.is_active;

  const { error } = await supabaseAdmin.from('user_profiles').update(updateData).eq('id', userId);

  if (error) {
    throw createApiError('UPDATE_FAILED', 'Failed to update user');
  }

  return getUserById(userId);
}

/**
 * Deactivate user (Admin only)
 * Soft delete by setting is_active to false
 */
export async function deactivateUser(userId: string): Promise<void> {
  // Check if user exists
  await getUserById(userId);

  const { error } = await supabaseAdmin
    .from('user_profiles')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    throw createApiError('DEACTIVATION_FAILED', 'Failed to deactivate user');
  }
}

/**
 * Create ApiError with custom code and message
 */
function createApiError(code: string, message: string, details?: Record<string, unknown>): ApiError {
  return {
    code,
    message,
    details,
  };
}
