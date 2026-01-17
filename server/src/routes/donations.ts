/**
 * Donation Routes
 * Defines API routes for donation management
 */

import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validator';
import {
  createDonationSchema,
  updateDonationSchema,
  donationQuerySchema,
  uuidParamSchema,
} from '../validators/donation.schema';
import { UserRole } from '../types';
import * as donationController from '../controllers/donationController';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/donations
 * List donations with optional filters
 * Access: All authenticated users
 */
router.get(
  '/',
  validateQuery(donationQuerySchema),
  donationController.listDonations
);

/**
 * GET /api/v1/donations/:id
 * Get a single donation by ID
 * Access: All authenticated users
 */
router.get(
  '/:id',
  validateParams(uuidParamSchema),
  donationController.getDonation
);

/**
 * POST /api/v1/donations
 * Create a new donation
 * Access: Admin and Treasurer only
 */
router.post(
  '/',
  requireRole(UserRole.ADMIN, UserRole.TREASURER),
  validateBody(createDonationSchema),
  donationController.createDonation
);

/**
 * PUT /api/v1/donations/:id
 * Update an existing donation
 * Access: Admin and Treasurer only
 */
router.put(
  '/:id',
  requireRole(UserRole.ADMIN, UserRole.TREASURER),
  validateParams(uuidParamSchema),
  validateBody(updateDonationSchema),
  donationController.updateDonation
);

/**
 * DELETE /api/v1/donations/:id
 * Delete a donation
 * Access: Admin only
 */
router.delete(
  '/:id',
  requireRole(UserRole.ADMIN),
  validateParams(uuidParamSchema),
  donationController.deleteDonation
);

export default router;
