# Backend Setup for Customizable Services

Since we've enhanced the frontend to allow full service customization (names, prices, durations), we need to update the Supabase backend to properly handle and store this data.

## 🎯 What Changed in the Frontend

- **Editable Service Names**: Users can now customize any service name
- **Custom Pricing**: Each service price is fully editable
- **Duration Customization**: Service durations can be adjusted
- **Enhanced UI**: Better service selection and editing experience

## 🔧 Required Backend Changes

### 1. Database Schema Updates

The existing `services` table needs additional columns to support the enhanced features:

```sql
-- Essential columns for service customization
ALTER TABLE services ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_type VARCHAR(50) DEFAULT 'standard';
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE services ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Business table enhancements
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS owner_email VARCHAR(255);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS owner_first_name VARCHAR(100);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS owner_last_name VARCHAR(100);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS vapi_assistant_id VARCHAR(255);
```

### 2. Enhanced Service Data Structure

The onboarding now saves services with these additional fields:

```javascript
{
  business_id: "uuid",
  name: "Custom Service Name",           // ✅ User customized
  description: "Service description",
  category: "manicure",
  duration_minutes: 45,                  // ✅ User customized
  base_price: 75.00,                     // ✅ User customized
  is_active: true,
  requires_deposit: true,                // Auto-calculated based on price
  deposit_amount: 18.75,                 // 25% of service price if ≥ $75
  display_order: 1,                      // ✨ NEW: Order in list
  service_type: "standard",              // ✨ NEW: 'standard' or 'custom'
  is_featured: true,                     // ✨ NEW: Feature expensive services
  max_advance_booking_days: 30,          // ✨ NEW: Booking window
  min_advance_booking_hours: 2,          // ✨ NEW: Minimum notice
  settings: {                            // ✨ NEW: Additional metadata
    original_category: "manicure",
    customized_by_user: true,
    setup_during_onboarding: true
  }
}
```

## 🚀 Implementation Steps

### Step 1: Apply Database Schema Changes

**Option A: Use our automated script**
```bash
cd dashboard
node update-services-schema.mjs
```

**Option B: Manual SQL execution in Supabase Dashboard**
1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `database/enhanced-services-schema.sql`
3. Execute the SQL statements

### Step 2: Verify Schema Updates

Check that these columns now exist:

**services table:**
- `display_order` (INTEGER)
- `service_type` (VARCHAR)
- `is_featured` (BOOLEAN)
- `settings` (JSONB)

**businesses table:**
- `settings` (JSONB)
- `owner_email` (VARCHAR)
- `vapi_assistant_id` (VARCHAR)

### Step 3: Test Service Customization

1. Start the development server: `npm run dev`
2. Go to `/onboarding`
3. Select a plan and proceed to Step 3 (Services)
4. Customize service names and prices
5. Complete onboarding
6. Verify in Supabase that services were saved with custom data

## 📊 New Database Features

### Service Categories Table
```sql
CREATE TABLE service_categories (
    id UUID PRIMARY KEY,
    business_id UUID REFERENCES businesses(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0
);
```

### Service Pricing Tiers
```sql 
CREATE TABLE service_pricing_tiers (
    id UUID PRIMARY KEY,
    business_id UUID REFERENCES businesses(id),
    service_id UUID REFERENCES services(id), 
    tier_name VARCHAR(50), -- 'basic', 'premium', 'luxury'
    price DECIMAL(10,2),
    duration_minutes INTEGER
);
```

### Helper Functions
- `get_service_stats(business_id)` - Service statistics
- `duplicate_services_for_location()` - For multi-location businesses
- Views for common service queries

## 🔍 Validation Rules

### Automatic Business Logic
- **Deposit Required**: Services ≥ $75 require 25% deposit
- **Featured Services**: Services ≥ $100 are automatically featured
- **Booking Windows**: Longer services require more advance notice
- **Display Order**: Services ordered by selection sequence

### Data Validation
- **Price Range**: $5 - $500 (reasonable range for nail services)
- **Duration Range**: 5 - 300 minutes
- **Name Length**: 3 - 255 characters
- **Required Fields**: name, price, duration, category

## 🎨 Frontend Integration Points

### Dashboard Service Management
The enhanced schema supports future dashboard features:

- **Service Editor**: Bulk edit service names/prices
- **Service Analytics**: Track popular services by category
- **Pricing Tiers**: Different price levels for same service
- **Seasonal Pricing**: Store pricing variations in settings JSONB
- **Service Packages**: Create bundles and combos

### Booking System Integration
- **Smart Scheduling**: Use `min_advance_booking_hours`
- **Deposit Collection**: Automatic based on `requires_deposit`
- **Service Recommendations**: Use `is_featured` flag
- **Category Filtering**: Enhanced category system

## ⚠️ Migration Notes

### For Existing Businesses
If you have existing businesses in your database:

1. **Safe Migration**: New columns have default values
2. **Data Integrity**: Existing services remain functional  
3. **Gradual Rollout**: Enhanced features only apply to new services
4. **Backward Compatibility**: Old dashboard code continues to work

### For New Installations
- Schema is automatically current with enhanced features
- All new businesses get full customization capabilities
- No migration steps required

## 🔧 Troubleshooting

### Common Issues

**1. Column doesn't exist errors**
```sql
-- Run this to add missing columns
ALTER TABLE services ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
```

**2. JSONB not supported**
```sql  
-- Fallback to TEXT if JSONB isn't available
ALTER TABLE services ADD COLUMN IF NOT EXISTS settings TEXT DEFAULT '{}';
```

**3. Enum type issues**
```sql
-- Update subscription_tier enum to include 'business'
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'business';
```

### Verification Queries

**Check service customization data:**
```sql
SELECT 
  name, 
  base_price, 
  duration_minutes,
  service_type,
  settings->'customized_by_user' as is_customized
FROM services 
WHERE business_id = 'your-business-id'
ORDER BY display_order;
```

**Check business tier and settings:**
```sql
SELECT 
  name,
  subscription_tier,
  settings->'payment_processing_enabled' as has_payments,
  vapi_assistant_id
FROM businesses
WHERE id = 'your-business-id';
```

## ✅ Testing Checklist

- [ ] New columns exist in services table
- [ ] New columns exist in businesses table  
- [ ] Service customization works in onboarding
- [ ] Custom service names are saved correctly
- [ ] Custom prices are saved as decimals
- [ ] Custom durations are saved in minutes
- [ ] Service categories display properly
- [ ] Deposit rules work correctly
- [ ] Display order is maintained
- [ ] Settings JSONB stores metadata

## 🎉 Benefits of Enhanced Schema

### For Salon Owners
- **Complete Control**: Customize all service details
- **Professional Branding**: Use their own service names
- **Flexible Pricing**: Set prices that match their market
- **Better Organization**: Services display in chosen order

### For Developers  
- **Extensible Design**: JSONB settings allow future features
- **Performance**: Proper indexes for fast queries
- **Scalability**: Supports multi-location businesses
- **Analytics**: Rich data for business insights

This enhanced backend setup ensures that your customizable services frontend works perfectly with a robust, scalable database design.