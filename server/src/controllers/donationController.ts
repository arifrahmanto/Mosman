/**
 * Donation Controller
 * Handles HTTP requests for donation endpoints
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import { successResponse } from '../utils/response';
import * as donationService from '../services/donationService';
import { DonationFilters } from '../types/donation.types';

/**
 * GET /api/v1/donations
 * List all donations with optional filters
 */
export async function listDonations(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const filters: DonationFilters = {
    pocket_id: req.query.pocket_id as string,
    category_id: req.query.category_id as string,
    start_date: req.query.start_date as string,
    end_date: req.query.end_date as string,
    payment_method: req.query.payment_method as string,
    page: req.query.page ? Number(req.query.page) : undefined,
    page_size: req.query.page_size ? Number(req.query.page_size) : undefined,
  };

  const result = await donationService.getDonations(filters);
  res.json(result);
}

/**
 * GET /api/v1/donations/:id
 * Get a single donation by ID
 */
export async function getDonation(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { id } = req.params as { id: string };
  const donation = await donationService.getDonationById(id);
  res.json(successResponse(donation));
}

/**
 * POST /api/v1/donations
 * Create a new donation
 */
export async function createDonation(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const userId = req.user!.id;
  const donation = await donationService.createDonation(req.body, userId);
  res.status(201).json(successResponse(donation, 'Donation created successfully'));
}

/**
 * PUT /api/v1/donations/:id
 * Update an existing donation
 */
export async function updateDonation(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { id } = req.params as { id: string };
  const donation = await donationService.updateDonation(id, req.body);
  res.json(successResponse(donation, 'Donation updated successfully'));
}

/**
 * DELETE /api/v1/donations/:id
 * Delete a donation
 */
export async function deleteDonation(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { id } = req.params as { id: string };
  await donationService.deleteDonation(id);
  res.json(successResponse(null, 'Donation deleted successfully'));
}
