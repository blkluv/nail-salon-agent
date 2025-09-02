# 🏢 Developer 3: Business Features & Integration Implementation
**UPDATED with Dev 1 & Dev 2 Integration Points**

## 🎯 Your Mission
Implement custom branding, multi-location features, and white-label capabilities. You now have **full access to Dev 1's SMS/Email services** and **Dev 2's analytics components** for integration.

---

## 📋 Updated Task Breakdown

### 🔴 PRIORITY 1: Custom Branding System (Day 1-2)

#### Key Changes from Original Plan:
- **Integration with Email Templates**: Dev 1's email service can now use your custom branding
- **Analytics Theming**: Dev 2's charts can adopt your custom colors
- **SMS Branding**: Business name integration with Dev 1's SMS templates

#### Database Schema Update
**Run this migration first:**

```sql
-- Add to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{}';

-- Branding structure:
-- {
--   "logo_url": "https://...",
--   "primary_color": "#8b5cf6",
--   "secondary_color": "#ec4899", 
--   "accent_color": "#f59e0b",
--   "font_family": "Inter",
--   "custom_css": "...",
--   "favicon_url": "https://...",
--   "business_name_override": "Custom Business Name"
-- }
```

#### Enhanced Logo Upload Implementation
**Create: `/dashboard/app/dashboard/settings/branding/page.tsx`**

```tsx
'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { EmailService } from '@/lib/email-service'; // Dev 1 integration

export default function BrandingSettings() {
  const [logo, setLogo] = useState<File | null>(null);
  const [branding, setBranding] = useState({
    primary_color: '#8b5cf6',
    secondary_color: '#ec4899',
    accent_color: '#f59e0b',
    business_name_override: '',
    logo_url: ''
  });
  
  // Test branding with Dev 1's email service
  const testBrandingEmail = async () => {
    try {
      await EmailService.sendEmail(
        'test@example.com',
        'Branding Test Email',
        `<div style="color: ${branding.primary_color};">
          <h1>Your Custom Branded Email</h1>
          <p>This is how your emails will look with your branding!</p>
        </div>`
      );
      alert('Test email sent with your branding!');
    } catch (error) {
      console.error('Failed to send test email:', error);
    }
  };
  
  const handleLogoUpload = async (file: File) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Upload to Supabase Storage
    const fileName = `${businessId}/logo-${Date.now()}.${file.name.split('.').pop()}`;
    const { data, error } = await supabase.storage
      .from('business-assets')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('business-assets')
      .getPublicUrl(fileName);
    
    // Update business branding
    const updatedBranding = {
      ...branding,
      logo_url: publicUrl
    };
    
    await supabase
      .from('businesses')
      .update({ branding: updatedBranding })
      .eq('id', businessId);
      
    setBranding(updatedBranding);
    
    // 🆕 INTEGRATION: Notify Dev 1's email service of branding change
    try {
      await fetch('/api/branding/update-email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, branding: updatedBranding })
      });
    } catch (error) {
      console.error('Failed to update email templates:', error);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Branding Settings</h1>
      
      {/* Logo Upload */}
      <div className="bg-white rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Business Logo</h2>
        
        <div className="flex items-center space-x-6">
          <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            {branding.logo_url ? (
              <img src={branding.logo_url} className="w-full h-full object-contain" />
            ) : (
              <span className="text-gray-400">No logo</span>
            )}
          </div>
          
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setLogo(file);
                  handleLogoUpload(file);
                }
              }}
              className="hidden"
              id="logo-upload"
            />
            <label
              htmlFor="logo-upload"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700"
            >
              Upload Logo
            </label>
            <p className="text-sm text-gray-600 mt-2">
              Recommended: 500x500px, PNG or SVG
            </p>
          </div>
        </div>
      </div>
      
      {/* Color Scheme with Analytics Preview */}
      <div className="bg-white rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Brand Colors</h2>
        
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Primary Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={branding.primary_color}
                onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                className="w-16 h-10 rounded border"
              />
              <input
                type="text"
                value={branding.primary_color}
                onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Secondary Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={branding.secondary_color}
                onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })}
                className="w-16 h-10 rounded border"
              />
              <input
                type="text"
                value={branding.secondary_color}
                onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Accent Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={branding.accent_color}
                onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })}
                className="w-16 h-10 rounded border"
              />
              <input
                type="text"
                value={branding.accent_color}
                onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
        
        {/* 🆕 INTEGRATION: Preview with Dev 2's analytics colors */}
        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">Analytics Preview</h3>
          <div className="flex space-x-4">
            <div 
              className="w-16 h-8 rounded" 
              style={{ backgroundColor: branding.primary_color }}
            ></div>
            <div 
              className="w-16 h-8 rounded" 
              style={{ backgroundColor: branding.secondary_color }}
            ></div>
            <div 
              className="w-16 h-8 rounded" 
              style={{ backgroundColor: branding.accent_color }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Your analytics charts will use these colors</p>
        </div>
      </div>
      
      {/* Business Name Override */}
      <div className="bg-white rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Display Name</h2>
        <input
          type="text"
          placeholder="Override business display name"
          value={branding.business_name_override}
          onChange={(e) => setBranding({ ...branding, business_name_override: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
        />
        <p className="text-sm text-gray-600 mt-2">
          This name will appear in emails and SMS messages instead of the default business name
        </p>
      </div>
      
      {/* Live Preview & Test */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Preview & Test</h2>
          <button
            onClick={testBrandingEmail}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Send Test Email
          </button>
        </div>
        <BookingWidgetPreview branding={branding} />
      </div>
    </div>
  );
}
```

#### 🆕 INTEGRATION: Apply Branding to Dev 2's Analytics
**Create: `/dashboard/lib/branding-integration.ts`**

```typescript
export const applyBrandingToAnalytics = (branding: any) => {
  // Dynamic CSS variables for Dev 2's charts
  const root = document.documentElement;
  
  if (branding?.primary_color) {
    root.style.setProperty('--chart-primary', branding.primary_color);
  }
  if (branding?.secondary_color) {
    root.style.setProperty('--chart-secondary', branding.secondary_color);
  }
  if (branding?.accent_color) {
    root.style.setProperty('--chart-accent', branding.accent_color);
  }
};

export const getBrandedEmailTemplate = (businessId: string, branding: any) => {
  return {
    primaryColor: branding?.primary_color || '#8b5cf6',
    logoUrl: branding?.logo_url || null,
    businessName: branding?.business_name_override || 'Your Salon'
  };
};
```

#### 🆕 INTEGRATION: Update Dev 1's Email Templates
**Create: `/dashboard/app/api/branding/update-email-templates/route.ts`**

```typescript
import { NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';

export async function POST(request: Request) {
  try {
    const { businessId, branding } = await request.json();
    
    // Update email template configuration
    // This could store branding preferences for email generation
    // Or trigger regeneration of email templates with new branding
    
    console.log('Updating email templates for business:', businessId);
    console.log('New branding:', branding);
    
    return NextResponse.json({ 
      success: true,
      message: 'Email templates updated with new branding'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

---

### 🟡 PRIORITY 2: Enhanced Multi-Location Features (Day 3-4)

#### Key Changes:
- **SMS/Email Integration**: Location-specific notifications via Dev 1's services
- **Analytics Integration**: Location comparison using Dev 2's chart components
- **Staff Notifications**: Multi-location staff alerts

#### Location Context Provider (Enhanced)
**Create: `/dashboard/contexts/LocationContext.tsx`**

```tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { SMSService } from '@/lib/sms-service';
import { EmailService } from '@/lib/email-service';

interface LocationContextType {
  currentLocation: Location | null;
  locations: Location[];
  setCurrentLocation: (location: Location) => void;
  isMultiLocation: boolean;
  sendLocationNotification: (message: string, type: 'sms' | 'email') => Promise<void>;
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  
  // 🆕 INTEGRATION: Location-specific notifications
  const sendLocationNotification = async (message: string, type: 'sms' | 'email') => {
    if (!currentLocation) return;
    
    try {
      // Get location staff for notifications
      const locationStaff = await getLocationStaff(currentLocation.id);
      
      for (const staff of locationStaff) {
        if (type === 'sms' && staff.phone) {
          await SMSService.sendSMS(staff.phone, `[${currentLocation.name}] ${message}`);
        } else if (type === 'email' && staff.email) {
          await EmailService.sendEmail(
            staff.email,
            `${currentLocation.name} - Notification`,
            `<p><strong>Location:</strong> ${currentLocation.name}</p><p>${message}</p>`
          );
        }
      }
    } catch (error) {
      console.error('Failed to send location notification:', error);
    }
  };
  
  return (
    <LocationContext.Provider value={{
      currentLocation,
      locations,
      setCurrentLocation,
      isMultiLocation: locations.length > 1,
      sendLocationNotification
    }}>
      {children}
    </LocationContext.Provider>
  );
}
```

#### 🆕 INTEGRATION: Multi-Location Analytics Dashboard
**Create: `/dashboard/app/dashboard/locations/analytics/page.tsx`**

```tsx
import { RevenueChart, ServicePopularityChart } from '@/components/analytics/RevenueChart';
import { StaffPerformanceChart } from '@/components/analytics/RevenueChart';

export default function MultiLocationAnalytics() {
  const [locationData, setLocationData] = useState([]);
  
  // Use Dev 2's chart components for location comparison
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Multi-Location Analytics</h1>
      
      {/* Location Comparison using Dev 2's components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue by Location</h3>
          <RevenueChart data={locationData} type="bar" height={300} />
        </div>
        
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Staff Performance Across Locations</h3>
          <StaffPerformanceChart data={staffData} height={300} />
        </div>
      </div>
    </div>
  );
}
```

---

### 🟢 PRIORITY 3: White-Label System (Day 5-6)

#### Key Changes:
- **Email Domain Integration**: Custom domains for Dev 1's email service
- **Analytics White-Labeling**: Custom branding for Dev 2's reports
- **SMS Sender ID**: Custom sender names for SMS

---

## 🔗 Critical Integration Dependencies

### From Dev 1 (Communications):
✅ **Available Now:**
- `SMSService.sendSMS()` - Use for location notifications
- `EmailService.sendEmail()` - Use for branded emails  
- Custom business name injection in all templates
- Marketing campaign system for multi-location

### From Dev 2 (Analytics):
✅ **Available Now:**
- All chart components (RevenueChart, StaffPerformanceChart, etc.)
- Report generation system for branded reports
- Multi-location analytics infrastructure
- Automated daily reports you can brand

### What You Provide Back:
- **Custom branding data** → Dev 1's email templates
- **Location context** → Dev 2's analytics filtering
- **Business name overrides** → Both Dev 1 & 2 systems

---

## 🆕 Updated Testing Integration Points

### Test Branding + Communications
```javascript
// Test branded SMS
await SMSService.sendSMS('+1234567890', 'Test from ' + customBusinessName);

// Test branded email
await EmailService.sendEmail(
  'test@example.com', 
  'Test Email',
  `<div style="color: ${primaryColor};">Branded content</div>`
);
```

### Test Multi-Location + Analytics
```javascript
// Test location analytics
const locationMetrics = await fetch('/api/analytics/location-comparison');
// Render using Dev 2's RevenueChart component
```

---

## 🎯 Success Criteria (Updated)

### Integration Requirements:
- [ ] Branding colors applied to Dev 2's analytics charts
- [ ] Business name overrides working in Dev 1's SMS/email templates
- [ ] Location-specific notifications using Dev 1's services
- [ ] Multi-location analytics using Dev 2's chart components
- [ ] White-label branding applied to automated reports

### Original Requirements:
- [ ] Logo upload functional
- [ ] Color customization working  
- [ ] Multi-location switcher complete
- [ ] White-label config system built
- [ ] All features tested and integrated

---

**🚀 You now have full access to both Dev 1's communication services and Dev 2's analytics components!** This allows you to build much more integrated and powerful business features than originally planned.