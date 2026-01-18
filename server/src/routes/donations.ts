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
 *     description: Create a new donation record with line items (Admin and Treasurer only)
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
 *             donor_name: "Ahmad Yusuf"
 *             is_anonymous: false
 *             payment_method: "transfer"
 *             donation_date: "2026-01-18"
 *             notes: "Donasi dari Ahmad Yusuf"
 *             items:
 *               - category_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
 *                 amount: 300000
 *                 description: "Zakat Fitrah"
 *               - category_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
 *                 amount: 200000
 *                 description: "Infaq Masjid"
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
 *             example:
 *               success: true
 *               data:
 *                 id: "99999999-9999-9999-9999-999999999999"
 *                 pocket_id: "11111111-1111-1111-1111-111111111111"
 *                 pocket_name: "Kas Masjid"
 *                 donor_name: "Ahmad Yusuf"
 *                 is_anonymous: false
 *                 payment_method: "transfer"
 *                 donation_date: "2026-01-18"
 *                 total_amount: 500000
 *                 items:
 *                   - id: "item-1111-1111-1111-111111111111"
 *                     donation_id: "99999999-9999-9999-9999-999999999999"
 *                     category_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
 *                     category_name: "Zakat"
 *                     amount: 300000
 *                     description: "Zakat Fitrah"
 *                     created_at: "2026-01-18T10:00:00Z"
 *                     updated_at: "2026-01-18T10:00:00Z"
 *                   - id: "item-2222-2222-2222-222222222222"
 *                     donation_id: "99999999-9999-9999-9999-999999999999"
 *                     category_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
 *                     category_name: "Infaq"
 *                     amount: 200000
 *                     description: "Infaq Masjid"
 *                     created_at: "2026-01-18T10:00:00Z"
 *                     updated_at: "2026-01-18T10:00:00Z"
 *                 notes: "Donasi dari Ahmad Yusuf"
 *                 recorded_by: "user-uuid"
 *                 created_at: "2026-01-18T10:00:00Z"
 *                 updated_at: "2026-01-18T10:00:00Z"
 *               message: "Donation created successfully"
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
 *     description: Update an existing donation record with optional line items replacement (Admin and Treasurer only)
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
 *             $ref: '#/components/schemas/UpdateDonation'
 *           examples:
 *             updateBasicInfo:
 *               summary: Update basic information only
 *               value:
 *                 donor_name: "Ahmad Yusuf (Updated)"
 *                 notes: "Updated donor information"
 *             updateWithItems:
 *               summary: Update with new line items
 *               value:
 *                 donor_name: "Ahmad Yusuf"
 *                 notes: "Updated donation with new items"
 *                 items:
 *                   - category_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
 *                     amount: 400000
 *                     description: "Zakat Mal"
 *                   - category_id: "cccccccc-cccc-cccc-cccc-cccccccccccc"
 *                     amount: 100000
 *                     description: "Sedekah"
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
 *             example:
 *               success: true
 *               data:
 *                 id: "99999999-9999-9999-9999-999999999999"
 *                 pocket_id: "11111111-1111-1111-1111-111111111111"
 *                 pocket_name: "Kas Masjid"
 *                 donor_name: "Ahmad Yusuf"
 *                 is_anonymous: false
 *                 payment_method: "transfer"
 *                 donation_date: "2026-01-18"
 *                 total_amount: 500000
 *                 items:
 *                   - id: "item-3333-3333-3333-333333333333"
 *                     donation_id: "99999999-9999-9999-9999-999999999999"
 *                     category_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
 *                     category_name: "Zakat"
 *                     amount: 400000
 *                     description: "Zakat Mal"
 *                     created_at: "2026-01-18T11:00:00Z"
 *                     updated_at: "2026-01-18T11:00:00Z"
 *                   - id: "item-4444-4444-4444-444444444444"
 *                     donation_id: "99999999-9999-9999-9999-999999999999"
 *                     category_id: "cccccccc-cccc-cccc-cccc-cccccccccccc"
 *                     category_name: "Sedekah"
 *                     amount: 100000
 *                     description: "Sedekah"
 *                     created_at: "2026-01-18T11:00:00Z"
 *                     updated_at: "2026-01-18T11:00:00Z"
 *                 notes: "Updated donation with new items"
 *                 recorded_by: "user-uuid"
 *                 created_at: "2026-01-18T10:00:00Z"
 *                 updated_at: "2026-01-18T11:00:00Z"
 *               message: "Donation updated successfully"
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
