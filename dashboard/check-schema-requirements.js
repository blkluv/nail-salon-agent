// Script to identify all columns being used in provision-client route

const columnsUsedInCode = {
  // From insert
  businesses_insert: [
    'id',
    'slug', 
    'name',
    'email',
    'phone',
    'business_type',
    'subscription_tier',
    'subscription_status',
    'trial_ends_at',
    'created_at',
    'updated_at'
  ],
  // From update operations
  businesses_update: [
    'vapi_phone_number',
    'vapi_phone_id', 
    'vapi_assistant_id',
    'assistant_type',
    'subscription_status',
    'updated_at'
  ],
  // Services table
  services: [
    'id',
    'business_id',
    'name',
    'duration_minutes',
    'price_cents',
    'description',
    'category',
    'is_active',
    'created_at',
    'updated_at'
  ],
  // Staff table
  staff: [
    'id',
    'business_id',
    'first_name',
    'last_name',
    'email',
    'phone',
    'role',
    'is_active',
    'created_at',
    'updated_at'
  ],
  // Business hours table
  business_hours: [
    'id',
    'business_id',
    'day',
    'open_time',
    'close_time',
    'is_closed',
    'created_at',
    'updated_at'
  ]
};

// Columns that exist in actual schema (from schema.sql)
const actualSchema = {
  businesses: [
    'id',
    'name',
    'slug',
    'business_type',
    'phone',
    'email',
    'website',
    'address_line1',
    'address_line2',
    'city',
    'state',
    'postal_code',
    'country',
    'timezone',
    'subscription_tier',
    'subscription_status',
    'trial_ends_at',
    'created_at',
    'updated_at'
  ],
  services: [
    'id',
    'business_id',
    'name',
    'description',
    'duration_minutes',
    'base_price', // NOT price_cents!
    'category',
    'is_active',
    'requires_deposit',
    'deposit_amount',
    'created_at',
    'updated_at'
  ],
  staff: [
    'id',
    'business_id',
    'email',
    'first_name',
    'last_name',
    'phone',
    'role',
    'specialties',
    'hourly_rate',
    'commission_rate',
    'is_active',
    'hire_date',
    'avatar_url',
    'created_at',
    'updated_at'
  ],
  business_hours: [
    // Table doesn't exist in schema!
  ]
};

console.log('=== MISSING COLUMNS IN BUSINESSES TABLE ===');
const missingInBusinesses = [...columnsUsedInCode.businesses_update].filter(
  col => !actualSchema.businesses.includes(col)
);
console.log('Missing:', missingInBusinesses);

console.log('\n=== WRONG COLUMN NAMES ===');
console.log('Services: uses "price_cents" but schema has "base_price"');

console.log('\n=== MISSING TABLES ===');
console.log('business_hours table does not exist in schema!');

console.log('\n=== COLUMNS THAT NEED TO BE ADDED ===');
console.log('Businesses table needs:');
missingInBusinesses.forEach(col => console.log(`  - ${col}`));

console.log('\n=== FIXES NEEDED ===');
console.log('1. Remove or comment out the business_hours insert');
console.log('2. Change price_cents to base_price in services');
console.log('3. Remove vapi_phone_number, vapi_phone_id, vapi_assistant_id, assistant_type from businesses update');
console.log('4. Or add these columns to the database');