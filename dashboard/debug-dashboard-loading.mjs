// Debug what business ID the dashboard is actually using
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://irvyhhkoiyzartmmvbxw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMTgyOTMsImV4cCI6MjA3MDY5NDI5M30.EArkK7byT7CZkQVL1B905qDwlCyq8TQenRZnkTl-5Ms'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function debugDashboardLoading() {
  console.log('🔍 DEBUGGING: What the dashboard is actually loading\n')
  
  // Simulate the same logic as the dashboard
  console.log('📋 Step 1: Environment business ID')
  const envBusinessId = process.env.NEXT_PUBLIC_DEMO_BUSINESS_ID || 'c7f6221a-f588-43fa-a095-09151fbc41e8'
  console.log('Environment ID:', envBusinessId)
  
  console.log('\n📋 Step 2: Simulate localStorage (would be your authenticated ID)')
  console.log('localStorage would have:', 'c7f6221a-f588-43fa-a095-09151fbc41e8')
  
  const businessId = 'c7f6221a-f588-43fa-a095-09151fbc41e8' // Your actual business
  
  console.log('\n📋 Step 3: Loading business info with ID:', businessId)
  try {
    const { data: business, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single()
    
    if (error) {
      console.log('❌ Business load failed:', error.message)
    } else {
      console.log('✅ Business loaded:', business.name)
    }
  } catch (err) {
    console.log('❌ Business error:', err.message)
  }
  
  console.log('\n📋 Step 4: Loading upcoming appointments with ID:', businessId)
  try {
    const today = new Date().toISOString().split('T')[0]
    console.log('Today:', today)
    
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        customer:customers(*),
        staff:staff(*),
        service:services(*)
      `)
      .eq('business_id', businessId)
      .gte('appointment_date', today)
      .in('status', ['pending', 'confirmed'])
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(5)
    
    if (error) {
      console.log('❌ Appointments load failed:', error.message)
    } else {
      console.log(`✅ Found ${appointments?.length || 0} upcoming appointments`)
      if (appointments && appointments.length > 0) {
        appointments.forEach(apt => {
          console.log(`   - ${apt.appointment_date} ${apt.start_time} - ${apt.customer?.first_name} ${apt.customer?.last_name}`)
        })
      } else {
        console.log('   📋 No appointments found (this is correct for your new business)')
      }
    }
  } catch (err) {
    console.log('❌ Appointments error:', err.message)
  }
  
  console.log('\n📋 Step 5: Loading dashboard stats with ID:', businessId)
  try {
    // Get total appointments count
    const { count: totalAppointments } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)

    console.log('✅ Total appointments:', totalAppointments || 0)
    
    // Get today's appointments
    const { count: todayAppointments } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('appointment_date', today)
      .in('status', ['confirmed', 'in_progress'])

    console.log('✅ Today\'s appointments:', todayAppointments || 0)
    
  } catch (err) {
    console.log('❌ Stats error:', err.message)
  }
  
  console.log('\n🎯 CONCLUSION: If dashboard shows different data, there\'s cached data or wrong business ID being used')
}

debugDashboardLoading()