# 🏗️ Backend Infrastructure Requirements

## 🚨 Current Status: Frontend Only
We have beautiful UI components but **missing actual booking functionality**. Here's what needs to be built:

## 📋 Critical Missing Components

### **1. Customer Booking Portal** 
**URL:** `/customer/portal?business={businessId}`

**Status:** ❌ **DOES NOT EXIST YET**

**What it needs:**
```typescript
// Required pages:
- /customer/login
- /customer/portal  
- /customer/book-appointment
- /customer/appointment-history
```

**Required APIs:**
```typescript
// Authentication
POST /api/customer/auth/login
POST /api/customer/auth/register

// Booking  
GET  /api/customer/services/{businessId}
GET  /api/customer/availability/{businessId}
POST /api/customer/book-appointment
GET  /api/customer/appointments
```

### **2. Booking Widget System**
**URL:** `/widget/{businessId}`

**Status:** ❌ **DOES NOT EXIST YET**

**Required files:**
```
dashboard/app/widget/[businessId]/page.tsx    ❌ MISSING
dashboard/app/widget/[businessId]/layout.tsx  ❌ MISSING  
dashboard/public/widget-embed.js              ❌ MISSING
```

### **3. Backend Booking Engine**
**Status:** ❌ **CORE LOGIC MISSING**

**Required APIs:**
```typescript
// Business APIs
GET  /api/business/{id}/services
GET  /api/business/{id}/availability  
GET  /api/business/{id}/staff
GET  /api/business/{id}/hours

// Booking APIs  
POST /api/appointments/create
GET  /api/appointments/{id}
PUT  /api/appointments/{id}/cancel
PUT  /api/appointments/{id}/reschedule
```

## 🏗️ Implementation Plan

### **Phase 1: Customer Portal (Critical)**

#### **Step 1.1: Create Customer Pages**
```bash
# Create missing pages
mkdir -p dashboard/app/customer/portal
mkdir -p dashboard/app/customer/login
mkdir -p dashboard/app/customer/book
```

#### **Step 1.2: Customer Database Schema**
```sql
-- Customer accounts (separate from businesses)
CREATE TABLE customer_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100), 
    created_at TIMESTAMP DEFAULT NOW()
);

-- Customer business relationships
CREATE TABLE customer_business_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customer_accounts(id),
    business_id UUID REFERENCES businesses(id),
    total_visits INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    loyalty_points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### **Step 1.3: Customer Authentication**
```typescript
// dashboard/lib/customer-auth.ts
export class CustomerAuthService {
  static async login(email: string, phone: string) {
    // Verify customer exists or create new
  }
  
  static async getCustomerAppointments(customerId: string) {
    // Get appointment history
  }
}
```

### **Phase 2: Booking Widget System**

#### **Step 2.1: Widget Pages**
```typescript
// dashboard/app/widget/[businessId]/page.tsx
export default async function BookingWidget({ 
  params: { businessId } 
}: {
  params: { businessId: string }
}) {
  // Standalone booking interface
  // No header/footer, clean embed-ready design
  // Real-time availability checking
}
```

#### **Step 2.2: Embed Script**
```javascript
// dashboard/public/embed-widget.js
(function() {
  function loadWidget(businessId, containerId) {
    // Create iframe with booking widget
    // Handle responsive sizing
    // Cross-origin communication
  }
  
  window.BookingWidget = { loadWidget };
})();
```

### **Phase 3: Booking Engine APIs**

#### **Step 3.1: Availability Engine**
```typescript
// dashboard/lib/availability-engine.ts
export class AvailabilityEngine {
  static async getAvailableSlots(
    businessId: string,
    serviceId: string,
    date: Date,
    staffId?: string
  ): Promise<TimeSlot[]> {
    // Check business hours
    // Check staff schedules  
    // Check existing appointments
    // Return available slots
  }
}
```

#### **Step 3.2: Booking API Routes**
```typescript
// dashboard/app/api/booking/availability/route.ts
export async function GET(request: Request) {
  const { businessId, serviceId, date } = await request.json()
  
  // Get available time slots
  // Consider staff availability
  // Return formatted response
}

// dashboard/app/api/booking/create/route.ts  
export async function POST(request: Request) {
  const appointmentData = await request.json()
  
  // Validate availability
  // Create appointment record
  // Send confirmations
  // Update customer history
}
```

## 📊 Current Implementation Status

### ✅ **What We Have:**
- Beautiful onboarding UI
- Database schema for businesses/services
- Social media content generation
- Dashboard framework

### ❌ **What We're Missing:**
- Customer-facing booking pages
- Real booking functionality  
- Widget embedding system
- Customer authentication
- Availability checking logic
- Appointment creation/management

## 🚀 Quick Win Implementation

### **Option 1: Minimal Viable Booking**
Build just the essential pieces to make booking work:

1. **Customer Portal Page** - Basic booking interface
2. **Simple API** - Create appointment + check availability  
3. **Basic Auth** - Phone number + email verification

### **Option 2: Third-Party Integration**
Integrate with existing booking services:

1. **Calendly Integration** - Embed their booking system
2. **Acuity Scheduling** - Use their API
3. **Square Appointments** - Leverage their platform

### **Option 3: Gradual Build**
Build features incrementally:

1. **Week 1**: Customer portal + basic booking
2. **Week 2**: Widget system + embedding  
3. **Week 3**: Advanced features + social integration

## 💰 Cost vs Value Analysis

### **Full Custom Build:**
- **Time**: 4-6 weeks development
- **Cost**: High (custom development)  
- **Value**: Complete control, perfect integration

### **Third-Party Integration:**
- **Time**: 1-2 weeks integration
- **Cost**: Medium (monthly fees)
- **Value**: Fast to market, proven reliability

### **Hybrid Approach:**
- **Time**: 2-3 weeks
- **Cost**: Medium
- **Value**: Best of both worlds

## 🎯 Recommendation

**I recommend starting with a Minimal Viable Booking system:**

1. **Build customer portal** with basic booking
2. **Simple widget** that redirects to portal
3. **Essential APIs** for booking flow
4. **Iterate and improve** based on usage

This gets salons booking customers ASAP while we build out advanced features.

**Would you like me to start building the customer portal and booking APIs?**