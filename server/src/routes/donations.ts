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
 * @openapi
 * /v1/donations:
 *   get:
 *     summary: List Donations
 *     description: Get a paginated list of donations with optional filters
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/pocketId'
 *       - $ref: '#/components/parameters/categoryId'
 *       - $ref: '#/components/parameters/startDate'
 *       - $ref: '#/components/parameters/endDate'
 *       - name: payment_method
 *         in: query
 *         schema:
 *           type: string
 *           enum: [cash, transfer, qris]
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/pageSize'
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Donation'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/',
  validateQuery(donationQuerySchema),
  donationController.listDonations
);

/**
 * @openapi
 * /v1/donations/{id}:
 *   get:
 *     summary: Get Donation by ID
 *     description: Retrieve a single donation by its ID
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Donation'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:id',
  validateParams(uuidParamSchema),
  donationController.getDonation
);

/**
 * @openapi
 * /v1/donations:
 *   post:
 *     summary: Create Donation
 *     description: Create a new donation record (Admin and Treasurer only)
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDonation'
 *           example:
 *             pocket_id: "11111111-1111-1111-1111-111111111111"
 *             category_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
 *             donor_name: "Ahmad Yusuf"
 *             amount: 500000
 *             is_anonymous: false
 *             payment_method: "transfer"
 *             donation_date: "2026-01-18"
 *             notes: "Infaq Jumat"
 *     responses:
 *       201:
 *         description: Donation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Donation'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post(
  '/',
  requireRole(UserRole.ADMIN, UserRole.TREASURER),
  validateBody(createDonationSchema),
  donationController.createDonation
);

/**
 * @openapi
 * /v1/donations/{id}:
 *   put:
 *     summary: Update Donation
 *     description: Update an existing donation record (Admin and Treasurer only)
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pocket_id:
 *                 type: string
 *                 format: uuid
 *               category_id:
 *                 type: string
 *                 format: uuid
 *               donor_name:
 *                 type: string
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               is_anonymous:
 *                 type: boolean
 *               payment_method:
 *                 type: string
 *                 enum: [cash, transfer, qris]
 *               receipt_url:
 *                 type: string
 *                 format: uri
 *               notes:
 *                 type: string
 *               donation_date:
 *                 type: string
 *                 format: date
 *           example:
 *             amount: 750000
 *             notes: "Updated amount"
 *     responses:
 *       200:
 *         description: Donation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Donation'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put(
  '/:id',
  requireRole(UserRole.ADMIN, UserRole.TREASURER),
  validateParams(uuidParamSchema),
  validateBody(updateDonationSchema),
  donationController.updateDonation
);

/**
 * @openapi
 * /v1/donations/{id}:
 *   delete:
 *     summary: Delete Donation
 *     description: Delete a donation record (Admin only)
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Donation deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   nullable: true
 *                 message:
 *                   type: string
 *                   example: Donation deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete(
  '/:id',
  requireRole(UserRole.ADMIN),
  validateParams(uuidParamSchema),
  donationController.deleteDonation
);

export default router;
