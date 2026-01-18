/**
 * Run Database Migration Script
 * Executes SQL migration file using Supabase client
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function runMigration(migrationFile) {
  console.log(`\n🚀 Running migration: ${migrationFile}\n`);

  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, 'migrations', migrationFile);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 SQL file loaded successfully');
    console.log(`📏 SQL length: ${sql.length} characters\n`);

    // Execute SQL using Supabase RPC
    // Note: Supabase client doesn't have direct SQL execution
    // We need to use the REST API endpoint
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql function doesn't exist, we'll get an error
      console.error('❌ Migration failed:', error.message);
      console.log('\n⚠️  The Supabase client cannot execute raw SQL directly.');
      console.log('📋 Please run the migration manually via Supabase Dashboard:\n');
      console.log('1. Go to: https://supabase.com/dashboard/project/qwubypmzeafooowuxgnu/sql');
      console.log(`2. Copy contents of: server/migrations/${migrationFile}`);
      console.log('3. Paste and run in SQL Editor\n');
      process.exit(1);
    }

    console.log('✅ Migration completed successfully!');
    console.log('📊 Result:', data);

  } catch (err) {
    console.error('❌ Error running migration:', err.message);
    console.log('\n⚠️  Please run the migration manually via Supabase Dashboard:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/qwubypmzeafooowuxgnu/sql');
    console.log(`2. Copy contents of: server/migrations/${migrationFile}`);
    console.log('3. Paste and run in SQL Editor\n');
    process.exit(1);
  }
}

// Run the line items migration
runMigration('RUN_LINE_ITEMS_MIGRATIONS.sql')
  .then(() => {
    console.log('\n🎉 All done! Next steps:');
    console.log('1. Regenerate TypeScript types from database');
    console.log('2. Update services to handle line items');
    console.log('3. Test the API\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
