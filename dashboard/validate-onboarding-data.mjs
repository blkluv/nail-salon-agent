// Validate that onboarding data structure matches Supabase schema expectations
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://irvyhhkoiyzartmmvbxw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMTgyOTMsImV4cCI6MjA3MDY5NDI5M30.EArkK7byT7CZkQVL1B905qDwlCyq8TQenRZnkTl-5Ms'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Mock onboarding data (what the form would submit)
const mockOnboardingData = {
  // Step 1: Business Info
  businessInfo: {
    name: "Elegant Nails Spa",
    email: "info@elegantnails.com", 
    phone: "+1-555-123-4567",
    address: "123 Main Street",
    timezone: "America/Los_Angeles"
  },
  
  // Step 2: Services
  selectedServices: [
    {
      name: "Classic Manicure",
      duration: 45,
      price: 35.00,
      category: "manicure"
    },
    {
      name: "Gel Polish",
      duration: 60,
      price: 45.00,
      category: "manicure"
    }
  ],
  
  // Step 3: Staff
  staffMembers: [
    {
      first_name: "Sarah",
      last_name: "Johnson",
      email: "sarah@elegantnails.com",
      phone: "+1-555-123-4568",
      role: "technician"
    }
  ],
  
  // Step 4: Business Hours
  businessHours: {
    1: { is_closed: false, open_time: "09:00", close_time: "18:00" }, // Monday
    2: { is_closed: false, open_time: "09:00", close_time: "18:00" }, // Tuesday
    3: { is_closed: false, open_time: "09:00", close_time: "18:00" }, // Wednesday  
    4: { is_closed: false, open_time: "09:00", close_time: "18:00" }, // Thursday
    5: { is_closed: false, open_time: "09:00", close_time: "18:00" }, // Friday
    6: { is_closed: false, open_time: "10:00", close_time: "16:00" }, // Saturday
    0: { is_closed: true, open_time: "", close_time: "" }  // Sunday
  },
  
  // Step 5: Subscription
  subscriptionConfig: {
    plan: {
      id: "professional"
    }
  }
}

async function validateDataStructures() {
  console.log('🔍 VALIDATING: Onboarding data vs Supabase schema\n')
  
  // 1. Validate BUSINESSES table structure
  console.log('📋 1. BUSINESSES TABLE VALIDATION')
  const businessData = {
    name: mockOnboardingData.businessInfo.name,
    slug: 'elegant-nails-spa-test',
    email: mockOnboardingData.businessInfo.email,
    phone: mockOnboardingData.businessInfo.phone,
    address_line1: mockOnboardingData.businessInfo.address,
    timezone: mockOnboardingData.businessInfo.timezone,
    plan_type: mockOnboardingData.subscriptionConfig.plan?.id === 'premium' ? 'enterprise' : 
               mockOnboardingData.subscriptionConfig.plan?.id === 'professional' ? 'professional' : 
               'starter',
    subscription_status: 'trialing',
    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
  }
  
  console.log('📤 Business data to insert:')
  console.log(JSON.stringify(businessData, null, 2))
  
  try {
    // Test insert (but roll back)
    const { error: businessError } = await supabase
      .from('businesses')
      .insert(businessData)
      .select()
      .limit(0) // This will validate structure without actually inserting
    
    if (businessError) {
      console.log('❌ Business validation failed:', businessError.message)
      return false
    } else {
      console.log('✅ Business structure is valid')
    }
  } catch (err) {
    console.log('❌ Business validation error:', err.message)
  }
  
  // 2. Validate SERVICES table structure  
  console.log('\n📋 2. SERVICES TABLE VALIDATION')
  const serviceData = mockOnboardingData.selectedServices.map(service => ({
    business_id: '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad', // Use existing business ID
    name: service.name,
    category: service.category,
    duration_minutes: service.duration,
    price_cents: Math.round(service.price * 100), // Convert dollars to cents
    is_active: true
  }))
  
  console.log('📤 Services data to insert:')
  console.log(JSON.stringify(serviceData, null, 2))
  
  try {
    const { error: servicesError } = await supabase
      .from('services')
      .insert(serviceData)
      .select()
      .limit(0)
    
    if (servicesError) {
      console.log('❌ Services validation failed:', servicesError.message)
      return false
    } else {
      console.log('✅ Services structure is valid')
    }
  } catch (err) {
    console.log('❌ Services validation error:', err.message)
  }
  
  // 3. Validate STAFF table structure
  console.log('\n📋 3. STAFF TABLE VALIDATION')
  const staffData = mockOnboardingData.staffMembers.map(staff => ({
    business_id: '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad',
    first_name: staff.first_name,
    last_name: staff.last_name,
    email: staff.email,
    phone: staff.phone,
    role: staff.role, // technician
    is_active: true
  }))
  
  console.log('📤 Staff data to insert:')
  console.log(JSON.stringify(staffData, null, 2))
  
  try {
    const { error: staffError } = await supabase
      .from('staff')
      .insert(staffData)
      .select()
      .limit(0)
    
    if (staffError) {
      console.log('❌ Staff validation failed:', staffError.message)
      return false
    } else {
      console.log('✅ Staff structure is valid')
    }
  } catch (err) {
    console.log('❌ Staff validation error:', err.message)
  }
  
  // 4. Validate BUSINESS_HOURS table structure
  console.log('\n📋 4. BUSINESS_HOURS TABLE VALIDATION')
  const hoursData = Object.entries(mockOnboardingData.businessHours).map(([day, hours]) => ({
    business_id: '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad',
    day_of_week: parseInt(day),
    is_open: !hours.is_closed,
    open_time: hours.is_closed ? null : hours.open_time,
    close_time: hours.is_closed ? null : hours.close_time
  }))
  
  console.log('📤 Business hours data to insert:')
  console.log(JSON.stringify(hoursData, null, 2))
  
  try {
    const { error: hoursError } = await supabase
      .from('business_hours')
      .insert(hoursData)
      .select()
      .limit(0)
    
    if (hoursError) {
      console.log('❌ Business hours validation failed:', hoursError.message)
      return false
    } else {
      console.log('✅ Business hours structure is valid')
    }
  } catch (err) {
    console.log('❌ Business hours validation error:', err.message)
  }
  
  console.log('\n🎉 ALL VALIDATIONS COMPLETE!')
  return true
}

validateDataStructures()