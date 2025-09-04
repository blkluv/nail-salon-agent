# Onboarding to Dashboard Data Flow Audit

## Issue Identified
Staff members entered during onboarding are not appearing in the dashboard staff page.

## Complete Onboarding Data Fields Inventory

### 1. Business Information (`BusinessInfo`)
**Onboarding Fields:**
- `name` (Business name)
- `email` (Business email)
- `phone` (Business phone)
- `address` (Full address string)
- `timezone` (Business timezone)
- `website` (Optional website)
- `ownerFirstName` (Optional)
- `ownerLastName` (Optional)

**Database Storage:** `businesses` table
**Dashboard Display:** Main dashboard, settings pages, business profile

### 2. Services (`Service[]`)
**Onboarding Fields:**
- `name` (Service name)
- `duration` (Duration in minutes)
- `price` (Service price)
- `category` (Service category)

**Database Storage:** `services` table with `business_id` foreign key
**Dashboard Display:** `/dashboard/services` page

### 3. Staff Members (`StaffMember[]`) **← MAIN ISSUE**
**Onboarding Fields:**
- `first_name`
- `last_name`
- `email`
- `phone`
- `role` (owner, technician, receptionist, etc.)

**Database Storage:** `staff` table with `business_id` foreign key
**Dashboard Display:** `/dashboard/staff` page
**Status:** ❌ BROKEN - Data may not be saving or loading correctly

### 4. Business Hours (`BusinessHours`)
**Onboarding Fields:**
- Per day (0-6): `is_closed`, `open_time`, `close_time`

**Database Storage:** Likely in `businesses.settings` JSONB or separate table
**Dashboard Display:** Business settings/hours configuration

### 5. Phone Preferences (`PhonePreferences`)
**Onboarding Fields:**
- `strategy` (new_number vs use_existing)
- `existingNumber`
- `forwardingEnabled`
- `forwardAfterHours`
- `forwardComplexCalls`
- `smsEnabled`
- `voiceEnabled`
- `webEnabled`
- `widgetStyle`

**Database Storage:** Multiple places (phone_business_mapping, businesses table)
**Dashboard Display:** Voice AI settings page

### 6. Location Setup (`LocationSetup[]`) - Business Tier Only
**Onboarding Fields:**
- `name`, `address`, `city`, `state`, `postal_code`
- `phone`, `email`

**Database Storage:** `businesses` table (additional locations)
**Dashboard Display:** `/dashboard/locations` page

### 7. Payment Setup (`PaymentSetup`) - Professional+ Tiers
**Onboarding Fields:**
- `processor` (square, stripe, both)
- `squareEnabled`, `stripeEnabled`
- `squareApiKey`, `stripeApiKey`
- `tipEnabled`, `tipPercentages`

**Database Storage:** `businesses.settings` or payment_processors table
**Dashboard Display:** `/dashboard/payments/processors` page

### 8. Loyalty Setup (`LoyaltySetup`) - Professional+ Tiers
**Onboarding Fields:**
- `enabled`
- `programName`
- `pointsPerDollar`, `pointsPerVisit`
- `rewardTiers[]`

**Database Storage:** `businesses` table loyalty columns
**Dashboard Display:** `/dashboard/loyalty` page

### 9. Communication Setup (`CommunicationSetup`)
**Onboarding Fields:**
- `smsEnabled`, `emailEnabled`
- `reminderTiming` (sms24h, sms2h, email24h, email2h)

**Database Storage:** `businesses` table communication columns
**Dashboard Display:** Communications settings

### 10. Branding Options (`BrandingOptions`)
**Onboarding Fields:**
- `primaryColor`
- `logo` (optional)
- `welcomeMessage`
- `businessDescription`

**Database Storage:** `businesses` table branding columns
**Dashboard Display:** `/dashboard/settings/branding` page

### 11. Subscription Configuration (`SubscriptionConfig`)
**Onboarding Fields:**
- `plan` (PricingPlan)
- `addOns[]`
- `totalMonthly`

**Database Storage:** `businesses.subscription_tier` and settings
**Dashboard Display:** Billing/subscription pages

## Data Flow Analysis

### Current Onboarding Data Save Process
1. `completeOnboarding()` function collects all form data
2. Creates business record in `businesses` table
3. Creates services in `services` table
4. **Creates staff in `staff` table** ← This should work but may be failing
5. Provisions phone number and assistant
6. Redirects to dashboard

### Dashboard Data Load Process
1. Each dashboard page calls respective API methods
2. Staff page calls `BusinessAPI.getStaff(businessId)`
3. Staff API queries `staff` table with business_id filter

## Specific Issues to Investigate

### Staff Data Issue (Primary)
**Problem:** Staff entered during onboarding not showing in dashboard
**Possible Causes:**
1. Staff insert failing silently during onboarding
2. Staff dashboard not loading from correct business_id
3. Database schema mismatch between save/load
4. Staff being marked as inactive (`is_active = false`)

### Other Potential Issues
1. **Services** - Verify all onboarding services appear in services page
2. **Business Hours** - Check if hours set in onboarding appear in settings
3. **Branding** - Verify brand colors/settings persist to branding page  
4. **Subscription Tier** - Ensure selected plan shows correctly in billing
5. **Phone Configuration** - Verify phone setup appears in voice AI settings

## Testing Plan

### 1. Staff Data Flow Test
- [ ] Create test onboarding with staff members
- [ ] Check database directly for staff records
- [ ] Test staff dashboard loading
- [ ] Compare onboarding save vs dashboard load data structures

### 2. Complete Onboarding Flow Test
- [ ] Business Info → Dashboard main page
- [ ] Services → Dashboard services page
- [ ] Business Hours → Settings/hours page
- [ ] Phone Config → Voice AI page
- [ ] Branding → Branding settings page
- [ ] Subscription → Billing page

### 3. Database Schema Verification
- [ ] Verify all onboarding fields have corresponding database columns
- [ ] Check for missing columns (like `daily_reports_enabled`)
- [ ] Ensure foreign key relationships are correct
- [ ] Test data type compatibility

## Fix Priority Order

1. **HIGH: Staff Data Flow** - Critical missing feature
2. **MEDIUM: Schema Issues** - Fix any missing columns
3. **MEDIUM: Services & Business Hours** - Core functionality
4. **LOW: Branding & Advanced Features** - Nice-to-have persistence