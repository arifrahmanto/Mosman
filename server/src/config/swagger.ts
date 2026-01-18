/**
 * Swagger/OpenAPI Configuration
 * Defines API documentation specification
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mosman API',
      version: '1.0.0',
      description: 'REST API for Mosque Financial Management System (Mosman)',
      contact: {
        name: 'API Support',
        email: 'support@mosman.app',
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api`,
        description: 'Development server',
      },
      {
        url: 'https://api.mosman.app/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your Supabase JWT token',
        },
      },
      schemas: {
        // Response schemas
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: { type: 'object' },
              },
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { type: 'object' },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                pageSize: { type: 'integer', example: 20 },
                total: { type: 'integer', example: 100 },
                totalPages: { type: 'integer', example: 5 },
              },
            },
          },
        },
        // Donation schemas
        Donation: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            pocket_id: { type: 'string', format: 'uuid' },
            pocket_name: { type: 'string' },
            category_id: { type: 'string', format: 'uuid' },
            category_name: { type: 'string' },
            donor_name: { type: 'string', nullable: true },
            amount: { type: 'number', format: 'decimal' },
            is_anonymous: { type: 'boolean' },
            payment_method: { type: 'string', enum: ['cash', 'transfer', 'qris'] },
            receipt_url: { type: 'string', format: 'uri', nullable: true },
            notes: { type: 'string', nullable: true },
            donation_date: { type: 'string', format: 'date' },
            recorded_by: { type: 'string', format: 'uuid' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        CreateDonation: {
          type: 'object',
          required: ['pocket_id', 'category_id', 'amount', 'is_anonymous', 'payment_method', 'donation_date'],
          properties: {
            pocket_id: { type: 'string', format: 'uuid' },
            category_id: { type: 'string', format: 'uuid' },
            donor_name: { type: 'string' },
            amount: { type: 'number', minimum: 0.01 },
            is_anonymous: { type: 'boolean' },
            payment_method: { type: 'string', enum: ['cash', 'transfer', 'qris'] },
            receipt_url: { type: 'string', format: 'uri' },
            notes: { type: 'string' },
            donation_date: { type: 'string', format: 'date', example: '2026-01-18' },
          },
        },
        // Expense schemas
        Expense: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            pocket_id: { type: 'string', format: 'uuid' },
            pocket_name: { type: 'string' },
            category_id: { type: 'string', format: 'uuid' },
            category_name: { type: 'string' },
            description: { type: 'string' },
            amount: { type: 'number', format: 'decimal' },
            receipt_url: { type: 'string', format: 'uri', nullable: true },
            expense_date: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
            approved_by: { type: 'string', format: 'uuid', nullable: true },
            recorded_by: { type: 'string', format: 'uuid' },
            notes: { type: 'string', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        CreateExpense: {
          type: 'object',
          required: ['pocket_id', 'category_id', 'description', 'amount', 'expense_date'],
          properties: {
            pocket_id: { type: 'string', format: 'uuid' },
            category_id: { type: 'string', format: 'uuid' },
            description: { type: 'string' },
            amount: { type: 'number', minimum: 0.01 },
            receipt_url: { type: 'string', format: 'uri' },
            expense_date: { type: 'string', format: 'date', example: '2026-01-18' },
            notes: { type: 'string' },
          },
        },
        // Pocket schemas
        Pocket: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            current_balance: { type: 'number', format: 'decimal' },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        PocketSummary: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            total_donations: { type: 'number', format: 'decimal' },
            total_expenses: { type: 'number', format: 'decimal' },
            balance: { type: 'number', format: 'decimal' },
            donation_count: { type: 'integer' },
            expense_count: { type: 'integer' },
            is_active: { type: 'boolean' },
          },
        },
        // Category schemas
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' },
              example: {
                success: false,
                error: {
                  code: 'AUTHENTICATION_ERROR',
                  message: 'Authentication required',
                },
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' },
              example: {
                success: false,
                error: {
                  code: 'AUTHORIZATION_ERROR',
                  message: 'Insufficient permissions',
                },
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' },
              example: {
                success: false,
                error: {
                  code: 'NOT_FOUND',
                  message: 'Resource not found',
                },
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' },
              example: {
                success: false,
                error: {
                  code: 'VALIDATION_ERROR',
                  message: 'Request validation failed',
                  details: {
                    'amount': 'Amount must be greater than 0',
                  },
                },
              },
            },
          },
        },
      },
      parameters: {
        page: {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          schema: { type: 'integer', minimum: 1, default: 1 },
        },
        pageSize: {
          name: 'page_size',
          in: 'query',
          description: 'Number of items per page',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
        pocketId: {
          name: 'pocket_id',
          in: 'query',
          description: 'Filter by pocket ID',
          schema: { type: 'string', format: 'uuid' },
        },
        categoryId: {
          name: 'category_id',
          in: 'query',
          description: 'Filter by category ID',
          schema: { type: 'string', format: 'uuid' },
        },
        startDate: {
          name: 'start_date',
          in: 'query',
          description: 'Filter by start date (YYYY-MM-DD)',
          schema: { type: 'string', format: 'date' },
        },
        endDate: {
          name: 'end_date',
          in: 'query',
          description: 'Filter by end date (YYYY-MM-DD)',
          schema: { type: 'string', format: 'date' },
        },
        idParam: {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Resource ID',
          schema: { type: 'string', format: 'uuid' },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Authentication', description: 'User authentication and profile management' },
      { name: 'User Management', description: 'User management (Admin only)' },
      { name: 'Donations', description: 'Donation management' },
      { name: 'Expenses', description: 'Expense management' },
      { name: 'Pockets', description: 'Financial pocket management' },
      { name: 'Categories', description: 'Category management' },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
