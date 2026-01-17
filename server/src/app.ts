/**
 * Express App Configuration
 * Sets up middleware, routes, and error handling
 */

import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes';

// Create Express app
const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW * 60 * 1000, // Convert minutes to milliseconds
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// API Routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
