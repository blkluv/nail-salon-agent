# 🏢 Developer 3: Business Features & Integration Implementation

## 🎯 Your Mission
Implement custom branding, multi-location features, and white-label capabilities for Professional and Business tiers.

---

## 📋 Task Breakdown

### 🔴 PRIORITY 1: Custom Branding System (Day 1-2)

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
--   "favicon_url": "https://..."
-- }
```

#### Logo Upload Implementation
**Create: `/dashboard/app/dashboard/settings/branding/page.tsx`**

```tsx
'use client'

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function BrandingSettings() {
  const [logo, setLogo] = useState<File | null>(null);
  const [colors, setColors] = useState({
    primary: '#8b5cf6',
    secondary: '#ec4899',
    accent: '#f59e0b'
  });
  
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
    await supabase
      .from('businesses')
      .update({
        branding: {
          logo_url: publicUrl,
          ...colors
        }
      })
      .eq('id', businessId);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Branding Settings</h1>
      
      {/* Logo Upload */}
      <div className="bg-white rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Business Logo</h2>
        
        <div className="flex items-center space-x-6">
          <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            {logo ? (
              <img src={URL.createObjectURL(logo)} className="w-full h-full object-contain" />
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
      
      {/* Color Scheme */}
      <div className="bg-white rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Brand Colors</h2>
        
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Primary Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={colors.primary}
                onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                className="w-16 h-10 rounded border"
              />
              <input
                type="text"
                value={colors.primary}
                onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          
          {/* Repeat for secondary and accent */}
        </div>
      </div>
      
      {/* Live Preview */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Preview</h2>
        <BookingWidgetPreview branding={{ logo, colors }} />
      </div>
    </div>
  );
}
```

#### Apply Branding to Booking Widget
**Update: `/dashboard/components/BookingWidget.tsx`**

```tsx
// Add to the component
const [branding, setBranding] = useState(null);

useEffect(() => {
  async function loadBranding() {
    const { data } = await supabase
      .from('businesses')
      .select('branding')
      .eq('id', businessId)
      .single();
    
    setBranding(data?.branding);
  }
  loadBranding();
}, [businessId]);

// Apply branding dynamically
const styles = {
  '--primary-color': branding?.primary_color || '#8b5cf6',
  '--secondary-color': branding?.secondary_color || '#ec4899',
  '--accent-color': branding?.accent_color || '#f59e0b',
} as React.CSSProperties;

return (
  <div style={styles} className="booking-widget">
    {branding?.logo_url && (
      <img src={branding.logo_url} alt="Logo" className="h-12 mb-4" />
    )}
    {/* Rest of widget */}
  </div>
);
```

#### Dynamic CSS Variables
**Create: `/dashboard/styles/branding.css`**

```css
.booking-widget {
  --primary-color: #8b5cf6;
  --secondary-color: #ec4899;
  --accent-color: #f59e0b;
}

.booking-widget .btn-primary {
  background-color: var(--primary-color);
}

.booking-widget .btn-secondary {
  background-color: var(--secondary-color);
}

.booking-widget .accent-text {
  color: var(--accent-color);
}

/* Override all purple-600 classes dynamically */
.branded [class*="purple-600"] {
  color: var(--primary-color) !important;
}

.branded [class*="bg-purple-600"] {
  background-color: var(--primary-color) !important;
}
```

---

### 🟡 PRIORITY 2: Multi-Location Features (Day 3-4)

#### Location Context Provider
**Create: `/dashboard/contexts/LocationContext.tsx`**

```tsx
import { createContext, useContext, useState, useEffect } from 'react';

interface LocationContextType {
  currentLocation: Location | null;
  locations: Location[];
  setCurrentLocation: (location: Location) => void;
  isMultiLocation: boolean;
}

const LocationContext = createContext<LocationContextType | null>(null);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  
  useEffect(() => {
    async function loadLocations() {
      const businessId = getCurrentBusinessId();
      const locs = await BusinessAPI.getLocations(businessId);
      setLocations(locs);
      
      // Set first location as default
      if (locs.length > 0) {
        setCurrentLocation(locs[0]);
      }
    }
    loadLocations();
  }, []);
  
  return (
    <LocationContext.Provider value={{
      currentLocation,
      locations,
      setCurrentLocation,
      isMultiLocation: locations.length > 1
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within LocationProvider');
  return context;
};
```

#### Location Switcher Component
**Create: `/dashboard/components/LocationSwitcher.tsx`**

```tsx
import { useLocation } from '@/contexts/LocationContext';
import { BuildingStorefrontIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export function LocationSwitcher() {
  const { currentLocation, locations, setCurrentLocation, isMultiLocation } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  if (!isMultiLocation) return null;
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
      >
        <BuildingStorefrontIcon className="h-5 w-5 text-gray-600" />
        <span className="font-medium">{currentLocation?.name}</span>
        <ChevronDownIcon className="h-4 w-4 text-gray-600" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-2 w-64 bg-white rounded-lg shadow-lg border z-50">
          {locations.map(location => (
            <button
              key={location.id}
              onClick={() => {
                setCurrentLocation(location);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between ${
                currentLocation?.id === location.id ? 'bg-purple-50' : ''
              }`}
            >
              <div>
                <p className="font-medium">{location.name}</p>
                <p className="text-sm text-gray-600">{location.address}</p>
              </div>
              {currentLocation?.id === location.id && (
                <CheckIcon className="h-5 w-5 text-purple-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### Update All Queries to Filter by Location
**Example updates needed throughout dashboard:**

```tsx
// Before:
const appointments = await BusinessAPI.getAppointments(businessId);

// After:
const { currentLocation } = useLocation();
const appointments = await BusinessAPI.getAppointments(
  businessId,
  { location_id: currentLocation?.id }
);
```

#### Cross-Location Staff Management
**Update: `/dashboard/app/dashboard/staff/page.tsx`**

```tsx
// Add staff-location assignment
interface StaffLocation {
  staff_id: string;
  location_id: string;
  schedule: any; // Different schedule per location
}

// UI for multi-location assignment
<div className="mb-4">
  <h3 className="font-medium mb-2">Location Assignment</h3>
  <div className="space-y-2">
    {locations.map(location => (
      <label key={location.id} className="flex items-center">
        <input
          type="checkbox"
          checked={staffLocations.includes(location.id)}
          onChange={(e) => toggleStaffLocation(staff.id, location.id)}
          className="mr-2"
        />
        <span>{location.name}</span>
      </label>
    ))}
  </div>
</div>
```

---

### 🟢 PRIORITY 3: White-Label System (Day 5-6)

#### White-Label Configuration
**Create: `/dashboard/lib/white-label.ts`**

```typescript
interface WhiteLabelConfig {
  domain: string;
  business_id: string;
  branding: {
    platform_name: string;
    logo_url: string;
    favicon_url: string;
    colors: any;
    hide_powered_by: boolean;
  };
  features: {
    custom_email_domain: boolean;
    custom_sms_sender: boolean;
    remove_platform_branding: boolean;
  };
}

export async function getWhiteLabelConfig(domain: string): Promise<WhiteLabelConfig | null> {
  // Check if this is a custom domain
  const { data } = await supabase
    .from('white_label_domains')
    .select('*')
    .eq('domain', domain)
    .single();
  
  if (!data) return null;
  
  return data.config;
}
```

#### Domain Detection Middleware
**Create: `/dashboard/middleware.ts`**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Check if this is a white-label domain
  if (!hostname.includes('dropfly.ai') && !hostname.includes('vercel.app')) {
    // This is a custom domain
    const response = NextResponse.next();
    response.headers.set('x-white-label-domain', hostname);
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
```

#### White-Label Theme Provider
**Create: `/dashboard/components/WhiteLabelProvider.tsx`**

```tsx
export function WhiteLabelProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<WhiteLabelConfig | null>(null);
  
  useEffect(() => {
    const domain = window.location.hostname;
    loadWhiteLabelConfig(domain).then(setConfig);
  }, []);
  
  if (!config) return children;
  
  // Apply white-label branding
  return (
    <div 
      className="white-label-app"
      style={{
        '--brand-primary': config.branding.colors.primary,
        '--brand-secondary': config.branding.colors.secondary,
      } as any}
    >
      <style jsx global>{`
        .powered-by-dropfly {
          display: ${config.branding.hide_powered_by ? 'none' : 'block'};
        }
        
        .platform-logo {
          content: url(${config.branding.logo_url});
        }
      `}</style>
      {children}
    </div>
  );
}
```

#### White-Label Admin Panel
**Create: `/dashboard/app/admin/white-label/page.tsx`**

```tsx
export default function WhiteLabelAdmin() {
  const [clients, setClients] = useState([]);
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">White-Label Management</h1>
      
      {/* Add new white-label client */}
      <div className="bg-white rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Add White-Label Client</h2>
        
        <form onSubmit={handleAddClient}>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Business Name"
              className="px-4 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Custom Domain"
              className="px-4 py-2 border rounded-lg"
            />
          </div>
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">Features</h3>
            <label className="flex items-center mb-2">
              <input type="checkbox" className="mr-2" />
              Remove platform branding
            </label>
            <label className="flex items-center mb-2">
              <input type="checkbox" className="mr-2" />
              Custom email domain
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              Custom SMS sender ID
            </label>
          </div>
          
          <button type="submit" className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg">
            Create White-Label Instance
          </button>
        </form>
      </div>
      
      {/* List existing clients */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Active White-Label Clients</h2>
        
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Business</th>
              <th className="text-left py-2">Domain</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(client => (
              <tr key={client.id} className="border-b">
                <td className="py-3">{client.business_name}</td>
                <td className="py-3">
                  <a href={`https://${client.domain}`} className="text-blue-600">
                    {client.domain}
                  </a>
                </td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Active
                  </span>
                </td>
                <td className="py-3">
                  <button className="text-purple-600 hover:underline">
                    Configure
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

#### Domain Setup Documentation
**Create: `/dashboard/docs/WHITE_LABEL_SETUP.md`**

```markdown
# White-Label Domain Setup Guide

## 1. Domain Configuration

### Customer's Domain Provider
Add CNAME record:
- Type: CNAME
- Name: @ or www
- Value: cname.vercel-dns.com

### Vercel Configuration
```bash
vercel domains add customer-domain.com
vercel domains verify customer-domain.com
```

## 2. SSL Certificate
Vercel automatically provisions SSL certificates via Let's Encrypt.

## 3. Database Configuration
Add to white_label_domains table:
```sql
INSERT INTO white_label_domains (
  domain,
  business_id,
  config
) VALUES (
  'customer-domain.com',
  'business-uuid',
  '{
    "branding": {...},
    "features": {...}
  }'::jsonb
);
```

## 4. Testing
- Visit https://customer-domain.com
- Verify branding is applied
- Test booking flow
- Check SSL certificate
```

---

## 🧪 Testing Checklist

### Branding Testing
- [ ] Logo uploads and displays correctly
- [ ] Custom colors apply to all components
- [ ] Booking widget shows custom branding
- [ ] Customer portal reflects branding

### Multi-Location Testing
- [ ] Location switcher works
- [ ] Data filters by location correctly
- [ ] Staff can be assigned to multiple locations
- [ ] Analytics show per-location data

### White-Label Testing
- [ ] Custom domain resolves correctly
- [ ] Platform branding hidden when configured
- [ ] Custom branding loads from domain
- [ ] SSL certificate valid

---

## 🔗 Dependencies

### What you need from Dev 1:
- SMS service for location-specific notifications
- Email templates that respect branding

### What you need from Dev 2:
- Analytics components to brand/theme
- Multi-location report structures

---

## ⚠️ Important Notes

1. **Image Optimization**: Resize logos before upload
2. **Color Contrast**: Ensure custom colors meet WCAG standards
3. **Domain Propagation**: DNS changes take 24-48 hours
4. **Storage Limits**: Set max file sizes for uploads
5. **Caching**: Bust cache when branding changes

---

## 📚 Resources

- Vercel Domains API: https://vercel.com/docs/rest-api/domains
- Supabase Storage: https://supabase.com/docs/guides/storage
- Color Contrast Checker: https://webaim.org/resources/contrastchecker/
- DNS Checker: https://dnschecker.org/

---

## 🚦 Definition of Done

- [ ] Logo upload functional
- [ ] Color customization working
- [ ] Booking widget branded
- [ ] Multi-location switcher complete
- [ ] Cross-location features working
- [ ] White-label config system built
- [ ] Domain detection working
- [ ] Documentation complete
- [ ] All features tested
- [ ] Merged to main branch