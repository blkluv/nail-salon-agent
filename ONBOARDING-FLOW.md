# Business Onboarding Flow Design

## 🚀 Multi-Tenant Salon Onboarding Process

### Step 1: Business Registration
```javascript
// New salon owner signs up
const { data: business } = await supabase
  .from('businesses')
  .insert({
    name: 'Glamour Nails',
    email: 'owner@glamournails.com',
    phone: '555-0100',
    address: '123 Main St',
    timezone: 'America/New_York'
  });
```

### Step 2: Service Setup
```javascript
// Owner adds their services
const services = [
  { name: 'Basic Manicure', duration: 30, price: 25 },
  { name: 'Gel Manicure', duration: 45, price: 45 },
  { name: 'Pedicure', duration: 60, price: 55 }
];

await supabase
  .from('services')
  .insert(services.map(s => ({
    ...s,
    business_id: business.id
  })));
```

### Step 3: Staff Setup
```javascript
// Add nail technicians
const staff = [
  { name: 'Maria', role: 'Nail Tech', email: 'maria@salon.com' },
  { name: 'Jessica', role: 'Nail Tech', email: 'jessica@salon.com' }
];

await supabase
  .from('staff')
  .insert(staff.map(s => ({
    ...s,
    business_id: business.id
  })));
```

### Step 4: Business Hours
```javascript
// Set operating hours
const hours = [
  { day: 'Monday', open: '09:00', close: '19:00' },
  { day: 'Tuesday', open: '09:00', close: '19:00' },
  // ... etc
];

await supabase
  .from('business_hours')
  .insert(hours.map(h => ({
    ...h,
    business_id: business.id
  })));
```

### Step 5: Vapi Configuration
```javascript
// Create Vapi assistant for this business
const assistant = await createVapiAssistant({
  name: `${business.name} Concierge`,
  firstMessage: `Thank you for calling ${business.name}!`,
  instructions: customInstructions(business)
});

// Update business with Vapi details
await supabase
  .from('businesses')
  .update({ 
    vapi_assistant_id: assistant.id,
    vapi_phone_number: assistant.phoneNumber 
  })
  .eq('id', business.id);
```

## 🎨 UI Implementation Options

### Option 1: Simple Form-Based
```
/onboarding
  ├── /business-info     (Name, phone, address)
  ├── /services          (Add services & prices)
  ├── /staff             (Add team members)
  ├── /hours             (Set schedule)
  └── /complete          (Dashboard access)
```

### Option 2: Wizard Style
```
[Progress Bar: Step 1 of 5]
┌─────────────────────────────┐
│   Welcome to Nail Salon Pro │
│   Let's set up your salon   │
│                              │
│   Business Name: [_______]   │
│   Your Email: [_______]      │
│                              │
│   [Back]  [Next Step →]      │
└─────────────────────────────┘
```

### Option 3: AI-Guided Setup
```
"Hi! I'm going to help you set up your salon.
What's your salon's name?"

[User types: "Sparkle Nails"]

"Great! What services do you offer?"
[Shows common services to select]
```

## 🔄 Automation Opportunities

### After Onboarding Completes:
1. **Auto-generate Vapi assistant** with salon's details
2. **Send welcome email** with dashboard login
3. **Create demo appointments** for testing
4. **Schedule onboarding call** with support
5. **Generate QR code** for customers to save number

## 💡 Smart Defaults

To speed up onboarding, provide defaults:

```javascript
const DEFAULT_SERVICES = [
  { name: 'Basic Manicure', duration: 30, price: 30 },
  { name: 'Gel Manicure', duration: 45, price: 50 },
  { name: 'Basic Pedicure', duration: 45, price: 40 },
  { name: 'Gel Pedicure', duration: 60, price: 60 },
  { name: 'Mani-Pedi Combo', duration: 90, price: 65 }
];

const DEFAULT_HOURS = [
  { day: 1, open: '09:00', close: '19:00' }, // Monday
  { day: 2, open: '09:00', close: '19:00' }, // Tuesday
  // ... etc
];
```

## 🎯 Key Decisions Needed

1. **Self-service vs Assisted?**
   - Salon owners do it themselves
   - Or you set it up for them

2. **How many salons?**
   - Single salon (simpler)
   - Multi-location chains (complex)

3. **Vapi Management?**
   - One shared Vapi account (you pay)
   - Each salon brings their own Vapi API key

4. **Pricing Model?**
   - Free tier with limits
   - Monthly subscription
   - Per-booking fee

## 📊 Database During Onboarding

```sql
-- When salon completes onboarding, we have:
businesses (1 record)
├── services (5-10 records)
├── staff (2-5 records)
├── business_hours (7 records)
├── customers (0 - filled as they book)
└── appointments (0 - filled as they book)
```

## 🚀 Quick Start Option

**"Demo Mode" - Try before setup:**
```javascript
// Create temporary demo salon
const demoSalon = await createDemoSalon({
  expires_in: '24 hours',
  phone: generateTempNumber()
});

// Let them test the system
// If they like it, convert demo → real account
```