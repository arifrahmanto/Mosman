/**
 * Check Migration Status
 * Verifies if line items migration has been applied
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

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

async function checkMigrationStatus() {
  console.log('\n🔍 Checking Migration Status...\n');

  try {
    // Check donations table structure
    console.log('📋 Checking donations table structure...');
    const { data: donationColumns, error: donColError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'donations');

    if (donColError) {
      console.error('❌ Error checking donations columns:', donColError.message);
    } else {
      const columnNames = donationColumns?.map(c => c.column_name) || [];
      console.log('   Columns:', columnNames.join(', '));

      const hasCategoryId = columnNames.includes('category_id');
      const hasAmount = columnNames.includes('amount');

      if (hasCategoryId || hasAmount) {
        console.log('\n⚠️  WARNING: Old schema detected!');
        console.log('   - category_id exists:', hasCategoryId);
        console.log('   - amount exists:', hasAmount);
        console.log('\n   ❌ Migration NOT applied. Please run:');
        console.log('      migrations/RUN_LINE_ITEMS_MIGRATIONS.sql\n');
        return false;
      } else {
        console.log('   ✅ Old columns removed (category_id, amount)');
      }
    }

    // Check if donation_items table exists
    console.log('\n📋 Checking donation_items table...');
    const { data: donationItems, error: itemsError } = await supabase
      .from('donation_items')
      .select('id')
      .limit(1);

    if (itemsError) {
      if (itemsError.code === '42P01') {
        console.log('   ❌ donation_items table does NOT exist');
        console.log('\n   Please run migration:');
        console.log('      migrations/RUN_LINE_ITEMS_MIGRATIONS.sql\n');
        return false;
      } else {
        console.error('   ⚠️  Error:', itemsError.message);
      }
    } else {
      console.log('   ✅ donation_items table exists');
    }

    // Check if expense_items table exists
    console.log('\n📋 Checking expense_items table...');
    const { data: expenseItems, error: expItemsError } = await supabase
      .from('expense_items')
      .select('id')
      .limit(1);

    if (expItemsError) {
      if (expItemsError.code === '42P01') {
        console.log('   ❌ expense_items table does NOT exist');
        return false;
      } else {
        console.error('   ⚠️  Error:', expItemsError.message);
      }
    } else {
      console.log('   ✅ expense_items table exists');
    }

    console.log('\n✅ Migration appears to be applied!\n');
    return true;

  } catch (err) {
    console.error('\n❌ Fatal error:', err.message);
    return false;
  }
}

checkMigrationStatus()
  .then((migrated) => {
    if (!migrated) {
      console.log('📝 Next Steps:');
      console.log('   1. Go to: https://supabase.com/dashboard/project/qwubypmzeafooowuxgnu/sql');
      console.log('   2. Copy contents of: server/migrations/RUN_LINE_ITEMS_MIGRATIONS.sql');
      console.log('   3. Paste and run in SQL Editor\n');
    } else {
      console.log('🎉 All good! Migration is applied.\n');
    }
    process.exit(migrated ? 0 : 1);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
