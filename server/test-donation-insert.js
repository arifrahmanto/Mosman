/**
 * Test Donation Insert
 * Debug script to test donation creation
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables');
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

async function testDonationInsert() {
  console.log('\n🧪 Testing Donation Insert...\n');

  try {
    // Step 1: Get a pocket
    console.log('1. Getting first pocket...');
    const { data: pocket, error: pocketError } = await supabase
      .from('pockets')
      .select('id, name')
      .limit(1)
      .single();

    if (pocketError || !pocket) {
      console.error('   ❌ No pocket found:', pocketError?.message);
      return;
    }
    console.log(`   ✅ Found pocket: ${pocket.name} (${pocket.id})`);

    // Step 2: Get a donation category
    console.log('\n2. Getting first donation category...');
    const { data: category, error: catError } = await supabase
      .from('donation_categories')
      .select('id, name')
      .limit(1)
      .single();

    if (catError || !category) {
      console.error('   ❌ No category found:', catError?.message);
      return;
    }
    console.log(`   ✅ Found category: ${category.name} (${category.id})`);

    // Step 3: Get a user for recorded_by
    console.log('\n3. Getting first user...');
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('id, full_name')
      .limit(1)
      .single();

    if (userError || !user) {
      console.error('   ❌ No user found:', userError?.message);
      return;
    }
    console.log(`   ✅ Found user: ${user.full_name} (${user.id})`);

    // Step 4: Try inserting a donation
    console.log('\n4. Attempting to insert donation...');
    const donationPayload = {
      pocket_id: pocket.id,
      donor_name: 'Test Donor',
      is_anonymous: false,
      payment_method: 'cash',
      donation_date: '2026-01-18',
      recorded_by: user.id,
    };

    console.log('   Payload:', JSON.stringify(donationPayload, null, 2));

    const { data: donation, error: donError } = await supabase
      .from('donations')
      .insert(donationPayload)
      .select()
      .single();

    if (donError) {
      console.error('   ❌ Failed to insert donation:');
      console.error('      Error code:', donError.code);
      console.error('      Error message:', donError.message);
      console.error('      Error details:', donError.details);
      console.error('      Error hint:', donError.hint);
      return;
    }

    console.log('   ✅ Donation created:', donation.id);

    // Step 5: Insert donation item
    console.log('\n5. Attempting to insert donation item...');
    const itemPayload = {
      donation_id: donation.id,
      category_id: category.id,
      amount: 100000,
      description: 'Test donation item',
    };

    const { data: item, error: itemError } = await supabase
      .from('donation_items')
      .insert(itemPayload)
      .select()
      .single();

    if (itemError) {
      console.error('   ❌ Failed to insert item:', itemError.message);
      // Cleanup
      await supabase.from('donations').delete().eq('id', donation.id);
      return;
    }

    console.log('   ✅ Item created:', item.id);

    // Step 6: Verify data
    console.log('\n6. Verifying inserted data...');
    const { data: verifyDonation } = await supabase
      .from('donations')
      .select('*, donation_items(*)')
      .eq('id', donation.id)
      .single();

    console.log('\n   Donation with items:', JSON.stringify(verifyDonation, null, 2));

    // Step 7: Cleanup
    console.log('\n7. Cleaning up test data...');
    await supabase.from('donations').delete().eq('id', donation.id);
    console.log('   ✅ Test data deleted\n');

    console.log('✅ All tests passed!\n');

  } catch (err) {
    console.error('\n❌ Fatal error:', err.message);
    console.error(err);
  }
}

testDonationInsert()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
  });
