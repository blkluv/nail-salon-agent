# Voice + Web MVP Transition Checklist
*Updated: August 27, 2025*

## 🎯 MVP Strategy: Voice + Web Only
**Goal**: Simplify the platform to focus on voice calls and web bookings, removing SMS complexity for initial launch.

## ✅ Implementation Checklist

### 1. ONBOARDING FLOW UPDATES
- [ ] Update onboarding to provision Vapi-native numbers only
- [ ] Remove Twilio configuration steps
- [ ] Simplify phone number selection (no SMS option)
- [ ] Update onboarding copy to mention "Voice & Web" only
- [ ] Remove SMS-related form fields

**Files to Update:**
- `/dashboard/app/onboarding/page.tsx`
- `/src/automated-onboarding.js`
- `/scripts/vapi-setup.js`

### 2. DASHBOARD UI CHANGES
- [ ] Remove "SMS" tab from communications section
- [ ] Update booking sources to show only: "voice", "web", "walk-in"
- [ ] Remove SMS metrics from analytics
- [ ] Update Voice AI page to remove SMS references
- [ ] Simplify settings page (remove SMS configuration)

**Files to Update:**
- `/dashboard/app/dashboard/voice-ai/page.tsx`
- `/dashboard/app/dashboard/analytics/page.tsx`
- `/dashboard/app/dashboard/settings/page.tsx`
- `/dashboard/app/dashboard/page.tsx`

### 3. BOOKING WIDGET UPDATES
- [ ] Update CTA buttons: "Call or Book Online"
- [ ] Remove "Text us" options
- [ ] Update contact information section
- [ ] Emphasize voice calling and web form
- [ ] Update confirmation messages

**Files to Update:**
- `/production-templates/booking-widget.html`
- `/src/booking-widget/index.html`
- `/src/booking-widget/embed.js`

### 4. MARKETING & DOCUMENTATION
- [ ] Update all "Voice, SMS & Web" references to "Voice & Web"
- [ ] Revise customer FAQ to remove SMS questions
- [ ] Update staff documentation
- [ ] Modify quick start guide
- [ ] Update system architecture docs

**Files to Update:**
- `/CLAUDE.md`
- `/README.md`
- `/production-templates/CUSTOMER_FAQ.md`
- `/production-templates/STAFF_DOCUMENTATION.md`
- `/production-templates/QUICK_START_CHECKLIST.md`

### 5. WEBHOOK & BACKEND SIMPLIFICATION
- [ ] Remove SMS webhook endpoints
- [ ] Update phone number provisioning to use Vapi only
- [ ] Remove Twilio dependencies from package.json
- [ ] Simplify webhook routing logic
- [ ] Update environment variable requirements

**Files to Update:**
- `/webhook-server.js`
- `/package.json`
- `/.env.example`

### 6. DATABASE & SCHEMA UPDATES
- [ ] Update booking_source enum (remove 'sms')
- [ ] Update phone_numbers table (remove Twilio fields)
- [ ] Clean up unused SMS-related columns

**Files to Update:**
- `/database/supabase-schema.sql`
- `/dashboard/supabase/schema.sql`

### 7. CONFIGURATION & TEMPLATES
- [ ] Update Vapi assistant config (voice-only focus)
- [ ] Remove SMS templates
- [ ] Update email templates to mention voice/web only
- [ ] Simplify integration options

**Files to Update:**
- `/config/vapi-assistant.json`
- `/production-templates/sms-templates.js` (DELETE)
- `/production-templates/email-templates.js`

### 8. TESTING & VALIDATION
- [ ] Test complete voice booking flow
- [ ] Test web widget booking flow
- [ ] Verify dashboard displays correctly
- [ ] Test onboarding with new flow
- [ ] Validate all links and phone numbers

## 🚀 Implementation Order

### Phase 1: Backend Changes (30 mins)
1. Update webhook server
2. Modify database schema
3. Remove SMS dependencies

### Phase 2: Frontend Updates (45 mins)
1. Update dashboard UI
2. Modify onboarding flow
3. Update booking widget

### Phase 3: Documentation (20 mins)
1. Update all documentation
2. Remove SMS references
3. Create new marketing copy

### Phase 4: Testing (15 mins)
1. End-to-end voice test
2. End-to-end web test
3. Dashboard verification

## 📊 Benefits of Voice + Web Only MVP

1. **Simpler Onboarding**: No Twilio setup required
2. **Lower Costs**: No SMS charges
3. **Faster Launch**: Less complexity to manage
4. **Clear Value Prop**: "AI Voice Assistant + Online Booking"
5. **Easy Upgrade Path**: Can add SMS later as premium feature

## 🎯 Future Upgrade Path

**Phase 2 (Post-Launch):**
- Add SMS as premium feature
- Integrate with Twilio
- Charge extra for SMS capability
- Position as "Pro" feature

## 📝 Marketing Message Update

**OLD**: "24/7 AI Receptionist - Voice, SMS & Web Bookings"
**NEW**: "24/7 AI Voice Assistant + Online Booking System"

## ⚡ Quick Start Commands

```bash
# Start implementing changes
cd /vapi-nail-salon-agent

# Test voice booking
curl -X POST https://web-production-60875.up.railway.app/webhook/vapi

# Test web booking
curl -X POST https://web-production-60875.up.railway.app/webhook/web-booking

# View dashboard
npm run dev (in dashboard folder)
```

---

**Ready to implement? Let's start with Phase 1!** 🚀