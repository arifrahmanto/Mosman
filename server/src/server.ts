/**
 * Server Entry Point
 * Starts the Express server and handles graceful shutdown
 */

import app from './app';
import { env } from './config/env';
import { testSupabaseConnection } from './config/supabase';

const PORT = env.PORT;

// Start server
async function startServer() {
  try {
    // Test Supabase connection
    console.log('🔌 Testing Supabase connection...');
    const isConnected = await testSupabaseConnection();

    if (!isConnected) {
      console.warn('⚠️  Supabase connection test failed, but continuing...');
    }

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log('');
      console.log('🚀 Server started successfully!');
      console.log(`📍 Environment: ${env.NODE_ENV}`);
      console.log(`🌐 Server running on: http://localhost:${PORT}`);
      console.log(`📡 API endpoint: http://localhost:${PORT}/api/${env.API_VERSION}`);
      console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
      console.log('');
    });

    // Graceful shutdown handler
    const gracefulShutdown = (signal: string) => {
      console.log(`\n🛑 ${signal} received, shutting down gracefully...`);

      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Listen for shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
