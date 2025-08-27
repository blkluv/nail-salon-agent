// Debug what data the dashboard is actually pulling for your business
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://irvyhhkoiyzartmmvbxw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMTgyOTMsImV4cCI6MjA3MDY5NDI5M30.EArkK7byT7CZkQVL1B905qDwlCyq8TQenRZnkTl-5Ms'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Your business ID from authentication
const YOUR_BUSINESS_ID = 'c7f6221a-f588-43fa-a095-09151fbc41e8'

async function debugDashboardData() {
  console.log('🔍 DEBUGGING: What data exists for your business\n')
  console.log('🏢 Business ID:', YOUR_BUSINESS_ID)
  console.log('')

  // 1. Business Info
  console.log('📋 1. BUSINESS INFO')
  try {
    const { data: business, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', YOUR_BUSINESS_ID)
      .single()
    
    if (error) {
      console.log('❌ Business query failed:', error.message)
    } else {
      console.log('✅ Business found:')
      console.log('   Name:', business.name)
      console.log('   Email:', business.email)
      console.log('   Plan:', business.plan_type)
      console.log('   Created:', business.created_at)
    }
  } catch (err) {
    console.log('❌ Business error:', err.message)
  }

  // 2. Services
  console.log('\n📋 2. SERVICES')
  try {
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', YOUR_BUSINESS_ID)
    
    if (error) {
      console.log('❌ Services query failed:', error.message)
    } else {
      console.log(`✅ Found ${services.length} services:`)
      services.forEach(service => {
        console.log(`   - ${service.name}: $${service.price_cents / 100} (${service.duration_minutes}min)`)
      })
    }
  } catch (err) {
    console.log('❌ Services error:', err.message)
  }

  // 3. Staff
  console.log('\n📋 3. STAFF')
  try {
    const { data: staff, error } = await supabase
      .from('staff')
      .select('*')
      .eq('business_id', YOUR_BUSINESS_ID)
    
    if (error) {
      console.log('❌ Staff query failed:', error.message)
    } else {
      console.log(`✅ Found ${staff.length} staff members:`)
      staff.forEach(member => {
        console.log(`   - ${member.first_name} ${member.last_name} (${member.role})`)
      })
    }
  } catch (err) {
    console.log('❌ Staff error:', err.message)
  }

  // 4. Appointments
  console.log('\n📋 4. APPOINTMENTS')
  try {
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('business_id', YOUR_BUSINESS_ID)
    
    if (error) {
      console.log('❌ Appointments query failed:', error.message)
    } else {
      console.log(`✅ Found ${appointments.length} appointments`)
      if (appointments.length > 0) {
        appointments.forEach(apt => {
          console.log(`   - ${apt.appointment_date} ${apt.start_time} (${apt.status})`)
        })
      }
    }
  } catch (err) {
    console.log('❌ Appointments error:', err.message)
  }

  // 5. Business Hours
  console.log('\n📋 5. BUSINESS HOURS')
  try {
    const { data: hours, error } = await supabase
      .from('business_hours')
      .select('*')
      .eq('business_id', YOUR_BUSINESS_ID)
      .order('day_of_week')
    
    if (error) {
      console.log('❌ Business hours query failed:', error.message)
    } else {
      console.log(`✅ Found ${hours.length} business hours records:`)
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      hours.forEach(hour => {
        const dayName = days[hour.day_of_week]
        if (hour.is_open) {
          console.log(`   - ${dayName}: ${hour.open_time} - ${hour.close_time}`)
        } else {
          console.log(`   - ${dayName}: CLOSED`)
        }
      })
    }
  } catch (err) {
    console.log('❌ Business hours error:', err.message)
  }

  console.log('\n🎯 SUMMARY: This is the ACTUAL data your dashboard should show')
}

debugDashboardData()