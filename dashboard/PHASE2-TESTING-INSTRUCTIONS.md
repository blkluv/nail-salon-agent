# 🧪 Phase 2 Tours Testing Instructions

## 📋 Testing Overview

This guide provides step-by-step instructions to test the complete Phase 2 onboarding system including:
- ✅ Tour triggering from dashboard with query parameters
- ✅ Staff management step in Professional and Business tours
- ✅ "Apply Settings" buttons that create real database records
- ✅ Data persistence verification in dashboard

## 🚀 Quick Start

### Prerequisites
1. Dashboard development server running: `npm run dev` in `/dashboard`
2. Access to Supabase database for verification
3. Browser with developer tools access

### Test Environment Setup

```javascript
// 1. Open browser console (F12) and authenticate as test business
localStorage.setItem("authenticated_business_id", "bb18c6ca-7e97-449d-8245-e3c28a6b6971")
localStorage.setItem("authenticated_business_name", "Bella's Nails Studio")  
localStorage.setItem("authenticated_user_email", "bella@bellasnails.com")

// 2. Refresh page to apply authentication
location.reload()
```

## 🎯 Test Cases

### Test Case 1: Professional Tour with Staff Management

**Objective:** Verify Professional tour includes staff management step and creates database records

**Steps:**
1. Navigate to: `http://localhost:3000/dashboard?onboarding=true&plan=professional`
2. Dashboard should automatically trigger Professional tour
3. Progress through tour steps until "Add Your Team Members" (step #4)
4. In staff management step:
   - Verify default staff member "Alex Johnson" is pre-loaded
   - Review specialties: Manicures, Pedicures, Nail Art
   - Review working hours: Mon-Fri 9-5, Sat 10-4, Sun off
   - Click "Add Staff to Dashboard" button
   - Wait for success message: "Staff Members Added!"
5. Complete or exit tour
6. Navigate to `/dashboard/staff`
7. **Expected Result:** Alex Johnson appears in staff list with correct details

### Test Case 2: Business Tour with Enterprise Staff Management

**Objective:** Verify Business tour includes enhanced staff management with unlimited team members

**Steps:**
1. Clear any previous tour state: `localStorage.clear()` then re-authenticate
2. Navigate to: `http://localhost:3000/dashboard?onboarding=true&plan=business`
3. Dashboard should automatically trigger Business tour
4. Progress through tour until "Enterprise Staff Management" step
5. In staff management step:
   - Verify "Unlimited staff members" is mentioned in benefits
   - Try adding additional staff members (if feature is available)
   - Click "Add Staff to Dashboard" 
   - Wait for success confirmation
6. Complete tour and check `/dashboard/staff`
7. **Expected Result:** Staff members appear with Business-tier capabilities noted

### Test Case 3: Loyalty Program Integration

**Objective:** Verify loyalty program "Apply Settings" creates database records

**Steps:**
1. Start Professional tour: `http://localhost:3000/dashboard?onboarding=true&plan=professional`
2. Progress to "Loyalty Program Setup" step
3. In loyalty program step:
   - Review 4-tier system: Bronze → Silver → Gold → Platinum
   - Review rewards: $5 (100pts) → $15 (250pts) → $35 (500pts) → Free service (1000pts)
   - Click "Apply Settings" button
   - Wait for "Loyalty Program Created!" message
4. **Verification:** Check Supabase database:
   ```sql
   -- Check loyalty program creation
   SELECT * FROM loyalty_programs WHERE business_id = 'bb18c6ca-7e97-449d-8245-e3c28a6b6971';
   
   -- Check loyalty tiers
   SELECT * FROM loyalty_tiers lt
   JOIN loyalty_programs lp ON lt.loyalty_program_id = lp.id
   WHERE lp.business_id = 'bb18c6ca-7e97-449d-8245-e3c28a6b6971';
   
   -- Check loyalty rewards
   SELECT * FROM loyalty_rewards lr
   JOIN loyalty_programs lp ON lr.loyalty_program_id = lp.id  
   WHERE lp.business_id = 'bb18c6ca-7e97-449d-8245-e3c28a6b6971';
   ```

### Test Case 4: API Endpoint Direct Testing

**Objective:** Test backend APIs independently of tour system

**Staff Creation API Test:**
```bash
curl -X POST http://localhost:3000/api/staff/bulk-create \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": "bb18c6ca-7e97-449d-8245-e3c28a6b6971",
    "staff_members": [{
      "firstName": "Test",
      "lastName": "Staff",
      "email": "test@bellasnails.com",
      "phone": "+1-555-123-4567",
      "role": "Senior Technician",
      "specialties": ["Manicures", "Pedicures"],
      "workingHours": {
        "monday": {"start": "09:00", "end": "17:00", "enabled": true},
        "tuesday": {"start": "09:00", "end": "17:00", "enabled": true},
        "wednesday": {"start": "09:00", "end": "17:00", "enabled": true},
        "thursday": {"start": "09:00", "end": "17:00", "enabled": true},
        "friday": {"start": "09:00", "end": "17:00", "enabled": true},
        "saturday": {"start": "10:00", "end": "16:00", "enabled": true},
        "sunday": {"start": "10:00", "end": "16:00", "enabled": false}
      }
    }]
  }'
```

**Loyalty Program API Test:**
```bash
curl -X POST http://localhost:3000/api/loyalty/program \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": "bb18c6ca-7e97-449d-8245-e3c28a6b6971",
    "name": "Test Rewards Program",
    "points_per_dollar": 1,
    "bonus_points_per_visit": 10,
    "is_active": true,
    "tiers": [
      {"name": "Bronze", "requirement": 0, "benefits": ["5% discount"]},
      {"name": "Silver", "requirement": 500, "benefits": ["10% discount"]},
      {"name": "Gold", "requirement": 1500, "benefits": ["15% discount"]},
      {"name": "Platinum", "requirement": 3000, "benefits": ["20% discount"]}
    ],
    "rewards": [
      {"points": 100, "reward": "$5 off next service"},
      {"points": 250, "reward": "$15 off next service"},
      {"points": 500, "reward": "$35 off next service"},
      {"points": 1000, "reward": "Free manicure service"}
    ]
  }'
```

## ✅ Success Criteria

### Tour System
- [ ] All three tour types (Starter, Professional, Business) trigger correctly
- [ ] Staff management step appears in Professional and Business tours
- [ ] Tour progress can be saved and resumed
- [ ] Tour completion redirects properly to dashboard

### Staff Management
- [ ] Default staff member (Alex Johnson) loads correctly
- [ ] Staff specialties and working hours display properly
- [ ] "Apply Settings" button creates database records
- [ ] Created staff appears in `/dashboard/staff` page
- [ ] Staff working hours and specialties are saved correctly

### Loyalty Program
- [ ] 4-tier system displays correctly (Bronze/Silver/Gold/Platinum)
- [ ] Rewards structure shows proper point requirements
- [ ] "Apply Settings" creates loyalty program in database
- [ ] All tiers and rewards are saved correctly

### API Integration
- [ ] Staff bulk-create API returns success responses
- [ ] Loyalty program API creates complete program structure
- [ ] Database relationships are properly maintained
- [ ] Multi-tenant isolation is preserved

## 🔍 Database Verification Queries

### Staff Verification
```sql
-- Main staff records
SELECT * FROM staff WHERE business_id = 'bb18c6ca-7e97-449d-8245-e3c28a6b6971';

-- Staff specialties
SELECT s.first_name, s.last_name, ss.specialty_name
FROM staff s
JOIN staff_specialties ss ON s.id = ss.staff_id
WHERE s.business_id = 'bb18c6ca-7e97-449d-8245-e3c28a6b6971';

-- Staff working hours
SELECT s.first_name, s.last_name, swh.day_of_week, swh.start_time, swh.end_time, swh.is_available
FROM staff s
JOIN staff_working_hours swh ON s.id = swh.staff_id
WHERE s.business_id = 'bb18c6ca-7e97-449d-8245-e3c28a6b6971'
ORDER BY s.first_name, 
  CASE swh.day_of_week 
    WHEN 'monday' THEN 1 WHEN 'tuesday' THEN 2 WHEN 'wednesday' THEN 3
    WHEN 'thursday' THEN 4 WHEN 'friday' THEN 5 WHEN 'saturday' THEN 6
    WHEN 'sunday' THEN 7 END;
```

### Loyalty Program Verification
```sql
-- Loyalty programs
SELECT * FROM loyalty_programs WHERE business_id = 'bb18c6ca-7e97-449d-8245-e3c28a6b6971';

-- Loyalty tiers with program details
SELECT lp.name as program_name, lt.name as tier_name, lt.minimum_points, lt.benefits
FROM loyalty_programs lp
JOIN loyalty_tiers lt ON lp.id = lt.loyalty_program_id
WHERE lp.business_id = 'bb18c6ca-7e97-449d-8245-e3c28a6b6971'
ORDER BY lt.tier_order;

-- Loyalty rewards
SELECT lp.name as program_name, lr.name as reward_name, lr.points_required, lr.description
FROM loyalty_programs lp
JOIN loyalty_rewards lr ON lp.id = lr.loyalty_program_id
WHERE lp.business_id = 'bb18c6ca-7e97-449d-8245-e3c28a6b6971'
ORDER BY lr.points_required;
```

## 🐛 Troubleshooting

### Common Issues

**Tour doesn't trigger:**
- Check browser console for JavaScript errors
- Verify authentication localStorage values are set correctly
- Ensure URL parameters are exactly: `?onboarding=true&plan=professional`
- Clear browser cache and try again

**"Apply Settings" doesn't work:**
- Check browser network tab for API call failures
- Verify Supabase credentials in `.env.local`
- Check database permissions and RLS policies
- Look for CORS errors in console

**Data doesn't appear in dashboard:**
- Refresh dashboard page after creating records
- Check database directly via Supabase console
- Verify business_id matches in all records
- Check for JavaScript errors that might prevent loading

**API endpoints return errors:**
- Verify development server is running on correct port
- Check API route files exist and are properly exported
- Test with simpler curl commands first
- Check server logs for detailed error messages

### Debug Console Commands

```javascript
// Check current authentication
console.log('Business ID:', localStorage.getItem('authenticated_business_id'))
console.log('Business Name:', localStorage.getItem('authenticated_business_name'))
console.log('User Email:', localStorage.getItem('authenticated_user_email'))

// Clear all localStorage and start fresh
localStorage.clear()

// Force reload dashboard data (run in dashboard page)
window.location.reload()

// Check for tour parameters
const url = new URL(window.location)
console.log('Onboarding:', url.searchParams.get('onboarding'))
console.log('Plan:', url.searchParams.get('plan'))
```

## 📊 Expected Test Results

### Staff Management Success
- **Dashboard**: Staff member appears with correct name, email, phone
- **Database**: `staff` table has new record with proper business_id
- **Specialties**: `staff_specialties` table contains all selected specialties
- **Hours**: `staff_working_hours` table has complete weekly schedule
- **Count**: Staff page shows accurate total staff count

### Loyalty Program Success
- **Dashboard**: Loyalty program becomes available in menu/features
- **Database**: `loyalty_programs` table has new program record
- **Tiers**: 4 tiers created with correct point thresholds
- **Rewards**: 4+ rewards created with correct point requirements
- **Integration**: Program ready for customer point accumulation

### Tour System Success
- **Flow**: Seamless progression through all tour steps
- **Skip Options**: Optional steps can be skipped without breaking flow
- **Completion**: Tour completes successfully and redirects to normal dashboard
- **State Management**: Tour progress is properly tracked and can be resumed

---

## 🎉 Test Completion Checklist

- [ ] Professional tour staff management tested and verified
- [ ] Business tour staff management tested and verified  
- [ ] Loyalty program creation tested and verified
- [ ] API endpoints tested directly with curl
- [ ] Database records verified via SQL queries
- [ ] Dashboard integration confirmed working
- [ ] Error handling tested (invalid data, network issues)
- [ ] Multi-tenant isolation verified (different business_id)

**When all tests pass, Option C implementation is confirmed working!** 🚀

The Phase 2 tours now successfully create real database records that persist and appear in the dashboard, transforming the onboarding experience from demonstration-only to fully functional business setup.