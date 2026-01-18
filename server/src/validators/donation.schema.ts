/**
 * Donation Validation Schemas
 * Zod schemas for validating donation-related requests with line items support
 */

import { z } from 'zod';

/**
 * Payment method enum
 */
export const paymentMethodSchema = z.enum(['cash', 'transfer', 'qris']);

/**
 * Donation item schema
 */
export const donationItemSchema = z.object({
  category_id: z.string().uuid('Category ID must be a valid UUID'),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().max(500).optional(),
});

/**
 * Create donation request schema
 */
export const createDonationSchema = z.object({
  pocket_id: z.string().uuid('Pocket ID must be a valid UUID'),
  donor_name: z.string().min(1).max(255).optional(),
  is_anonymous: z.boolean(),
  payment_method: paymentMethodSchema,
  receipt_url: z.string().url('Receipt URL must be a valid URL').optional(),
  notes: z.string().max(1000).optional(),
  donation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  items: z.array(donationItemSchema).min(1, 'At least one item is required'),
});

/**
 * Update donation request schema
 */
export const updateDonationSchema = z.object({
  pocket_id: z.string().uuid('Pocket ID must be a valid UUID').optional(),
  donor_name: z.string().min(1).max(255).optional(),
  is_anonymous: z.boolean().optional(),
  payment_method: paymentMethodSchema.optional(),
  receipt_url: z.string().url('Receipt URL must be a valid URL').optional(),
  notes: z.string().max(1000).optional(),
  donation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  items: z.array(donationItemSchema).min(1, 'At least one item is required').optional(),
});

/**
 * Donation query parameters schema
 */
export const donationQuerySchema = z.object({
  pocket_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  payment_method: paymentMethodSchema.optional(),
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  page_size: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
});

/**
 * UUID parameter schema
 */
export const uuidParamSchema = z.object({
  id: z.string().uuid('ID must be a valid UUID'),
});

/**
 * Pocket ID parameter schema
 */
export const pocketIdParamSchema = z.object({
  pocketId: z.string().uuid('Pocket ID must be a valid UUID'),
});

// Export inferred types
export type CreateDonationInput = z.infer<typeof createDonationSchema>;
export type UpdateDonationInput = z.infer<typeof updateDonationSchema>;
export type DonationQueryInput = z.infer<typeof donationQuerySchema>;
export type DonationItemInput = z.infer<typeof donationItemSchema>;
