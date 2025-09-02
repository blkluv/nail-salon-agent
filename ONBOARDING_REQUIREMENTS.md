# 📋 Onboarding Database Requirements - What Our Code Actually Uses

## Based on analysis of `/app/onboarding/page.tsx`, here are the EXACT tables and columns our finished product requires:

## 🏢 **BUSINESSES Table** (Primary)
**Required Columns:**
```sql
- id (uuid, primary key)
- name (varchar)
- slug (varchar, unique)
- business_type (varchar, default 'nail_salon')
- email (varchar)
- phone (varchar)
- website (varchar, optional)
- address_line1 (varchar)
- city (varchar)
- state (varchar)
- postal_code (varchar) 
- country (varchar, default 'US')
- timezone (varchar, default 'America/Los_Angeles')
- subscription_tier (enum: 'starter'|'professional'|'business')
- vapi_assistant_id (varchar)
- vapi_phone_number (varchar)
- settings (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

## 💅 **SERVICES Table** (Required)
**Required Columns:**
```sql
- id (uuid, primary key)
- business_id (uuid, foreign key)
- name (varchar)
- description (text)
- category (varchar)
- duration_minutes (integer)
- base_price (decimal) -- ⚠️ Code expects this, DB has price_cents
- is_active (boolean, default true)
- requires_deposit (boolean, default false)
- deposit_amount (decimal, default 0.00)
- display_order (integer)
- service_type (varchar)
- is_featured (boolean, default false)
- max_advance_booking_days (integer, default 30)
- min_advance_booking_hours (integer, default 2)
- settings (jsonb, default '{}')
- created_at (timestamp)
- updated_at (timestamp)
```

## 👥 **STAFF Table** (Required)
**Required Columns:**
```sql
- id (uuid, primary key)
- business_id (uuid, foreign key)
- first_name (varchar)
- last_name (varchar)
- email (varchar)
- phone (varchar)
- role (staff_role enum: 'owner'|'manager'|'technician'|'receptionist')
- specialties (text[])
- hourly_rate (decimal)
- commission_rate (decimal, default 0.00)
- is_active (boolean, default true)
- hire_date (date)
- created_at (timestamp)
- updated_at (timestamp)
```

## ⏰ **BUSINESS_HOURS Table** (Required)
**Required Columns:**
```sql
- id (uuid, primary key)
- business_id (uuid, foreign key)
- day_of_week (integer, 0-6)
- is_closed (boolean, default false)
- open_time (time)
- close_time (time)
- created_at (timestamp)
- updated_at (timestamp)
- UNIQUE(business_id, day_of_week)
```

## 📍 **LOCATIONS Table** (Business Tier Only)
**Required Columns:**
```sql
- id (uuid, primary key)
- business_id (uuid, foreign key)
- name (varchar)
- slug (varchar, unique)
- address_line1 (varchar)
- address_line2 (varchar)
- city (varchar)
- state (varchar)
- postal_code (varchar)
- country (varchar, default 'US')
- phone (varchar)
- email (varchar)
- timezone (varchar, default 'America/Los_Angeles')
- is_active (boolean, default true)
- is_primary (boolean, default false)
- created_at (timestamp)
- updated_at (timestamp)
```

## 🎁 **LOYALTY_PROGRAMS Table** (Professional+ Tiers Only)
**Required Columns:**
```sql
- id (uuid, primary key)
- business_id (uuid, foreign key)
- program_name (varchar)
- is_active (boolean, default true)
- points_per_dollar (integer, default 1)
- points_per_visit (integer, default 0)
- points_expire_days (integer)
- minimum_purchase_for_points (decimal, default 0)
- reward_tiers (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

## 📞 **PHONE_NUMBERS Table** (For Vapi Integration)
**Required Columns:**
```sql
- id (uuid, primary key)
- business_id (uuid, foreign key)
- phone_number (varchar)
- vapi_phone_id (varchar)
- vapi_phone_number_id (varchar)
- is_primary (boolean, default false)
- is_active (boolean, default true)
- created_at (timestamp)
- updated_at (timestamp)
```

## 🚫 **UNUSED TABLES** (In Your Database But Not Required by Onboarding)
These tables exist in your database but are NOT used by the current onboarding flow:
- `analytics_events`
- `customer_business_relationships` 
- `customer_loyalty_points`
- `customer_portal_activities`
- `customer_sessions`
- `customer_verification_codes`
- `customers` (not created during onboarding)
- `appointments` (not created during onboarding)
- `loyalty_transactions`
- `payment_processors`
- `payments`
- `service_categories`
- `system_logs`

## ⚠️ **CRITICAL SCHEMA MISMATCHES**

### **SERVICES Table Issues:**
- **Database has:** `price_cents` (integer)
- **Code expects:** `base_price` (decimal)
- **Fix needed:** Add `base_price` column and convert `price_cents/100 → base_price`

### **BUSINESSES Table Issues:**
- **Database has:** `zip_code`
- **Code expects:** `postal_code` (but also uses address_line1, city, state)
- **Status:** Database has both, should work

## 🎯 **RECOMMENDATION: Core Tables for Onboarding**

**Focus on these 7 tables for successful onboarding:**
1. ✅ `businesses` 
2. ⚠️ `services` (needs base_price fix)
3. ⚠️ `staff` (needs role enum and missing columns)
4. ✅ `business_hours`
5. ✅ `locations` 
6. ✅ `loyalty_programs`
7. ✅ `phone_numbers`

**The other 13 tables are not required for basic onboarding to work.**