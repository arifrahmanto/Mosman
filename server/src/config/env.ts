/**
 * Environment Configuration
 * Loads and validates environment variables
 */

import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

// Define environment variable schema with Zod
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform((val) => parseInt(val, 10)),
  API_VERSION: z.string().default('v1'),

  // Supabase configuration
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // CORS configuration
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Rate limiting
  RATE_LIMIT_WINDOW: z.string().default('15').transform((val) => parseInt(val, 10)),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform((val) => parseInt(val, 10)),
});

// Parse and validate environment variables
function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment variable validation failed:');
      (error as z.ZodError).issues.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

// Export validated environment configuration
export const env = validateEnv();

// Export type for EnvConfig
export type EnvConfig = z.infer<typeof envSchema>;
