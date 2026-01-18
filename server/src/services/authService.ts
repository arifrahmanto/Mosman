/**
 * Authentication Service
 * Handles authentication business logic and Supabase Auth integration
 */

import { supabase, supabaseAdmin } from '../config/supabase';
import { UserRole, AuthUser } from '../types/auth.types';
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  UpdateProfileInput,
  RefreshTokenInput
} from '../validators/auth.schema';
import { ApiError } from '../types/api.types';
import { AuthError } from '@supabase/supabase-js';

/**
 * Register a new user
 */
export async function register(data: RegisterInput) {
  const { email, password, full_name } = data;

  // 1. Create auth user in Supabase Auth
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    throw createAuthError(signUpError);
  }

  if (!authData.user) {
    throw createApiError('USER_CREATION_FAILED', 'Failed to create user account');
  }

  // 2. Create user profile with default 'viewer' role
  const { error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .insert({
      id: authData.user.id,
      full_name,
      role: UserRole.VIEWER,
      is_active: true,
    });

  if (profileError) {
    // Rollback: Delete auth user if profile creation fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    throw createApiError('PROFILE_CREATION_FAILED', 'Failed to create user profile');
  }

  return {
    message: 'Registration successful. Please check your email to verify your account.',
  };
}

/**
 * Login user
 */
export async function login(data: LoginInput) {
  const { email, password } = data;

  // 1. Authenticate with Supabase
  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    throw createAuthError(signInError);
  }

  if (!authData.user || !authData.session) {
    throw createApiError('LOGIN_FAILED', 'Login failed');
  }

  // 2. Fetch user profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError || !profile) {
    throw createApiError('PROFILE_NOT_FOUND', 'User profile not found');
  }

  // 3. Check if user is active
  if (!profile.is_active) {
    throw createApiError('USER_INACTIVE', 'User account is inactive');
  }

  // 4. Return user data and session
  return {
    user: {
      id: authData.user.id,
      email: authData.user.email!,
      role: profile.role as UserRole,
      full_name: profile.full_name,
    } as AuthUser,
    session: {
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      expires_at: authData.session.expires_at!,
    },
  };
}

/**
 * Logout user
 */
export async function logout(accessToken: string) {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw createAuthError(error);
  }

  return { message: 'Logout successful' };
}

/**
 * Refresh access token
 */
export async function refreshToken(data: RefreshTokenInput) {
  const { refresh_token } = data;

  const { data: sessionData, error } = await supabase.auth.refreshSession({
    refresh_token,
  });

  if (error || !sessionData.session) {
    throw createAuthError(error || new Error('Failed to refresh token'));
  }

  return {
    access_token: sessionData.session.access_token,
    refresh_token: sessionData.session.refresh_token,
    expires_at: sessionData.session.expires_at!,
  };
}

/**
 * Request password reset
 */
export async function forgotPassword(data: ForgotPasswordInput) {
  const { email } = data;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`,
  });

  if (error) {
    throw createAuthError(error);
  }

  return {
    message: 'Password reset email sent. Please check your inbox.',
  };
}

/**
 * Reset password with token
 */
export async function resetPassword(data: ResetPasswordInput) {
  const { token, password } = data;

  // Verify the token and update password
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    throw createAuthError(error);
  }

  return {
    message: 'Password reset successful',
  };
}

/**
 * Change password for authenticated user
 */
export async function changePassword(userId: string, data: ChangePasswordInput) {
  const { current_password, new_password } = data;

  // Get user email to verify current password
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (userError || !userData.user) {
    throw createApiError('USER_NOT_FOUND', 'User not found');
  }

  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: userData.user.email!,
    password: current_password,
  });

  if (signInError) {
    throw createApiError('INVALID_PASSWORD', 'Current password is incorrect');
  }

  // Update to new password
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: new_password,
  });

  if (updateError) {
    throw createAuthError(updateError);
  }

  return {
    message: 'Password changed successfully',
  };
}

/**
 * Get current user profile
 */
export async function getCurrentUser(userId: string) {
  const { data: profile, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    throw createApiError('PROFILE_NOT_FOUND', 'User profile not found');
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
 * Update current user profile
 */
export async function updateCurrentUser(userId: string, data: UpdateProfileInput) {
  const { error } = await supabaseAdmin
    .from('user_profiles')
    .update({
      full_name: data.full_name,
      phone: data.phone,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    throw createApiError('UPDATE_FAILED', 'Failed to update profile');
  }

  return getCurrentUser(userId);
}

/**
 * Create ApiError from Supabase AuthError
 */
function createAuthError(error: AuthError | Error): ApiError {
  if ('status' in error) {
    const authError = error as AuthError;
    return {
      code: authError.code || 'AUTH_ERROR',
      message: authError.message,
      details: { status: authError.status },
    };
  }
  return {
    code: 'AUTH_ERROR',
    message: error.message,
  };
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
