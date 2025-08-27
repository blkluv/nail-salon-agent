// Check what phone number is assigned to your business
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://irvyhhkoiyzartmmvbxw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMTgyOTMsImV4cCI6MjA3MDY5NDI5M30.EArkK7byT7CZkQVL1B905qDwlCyq8TQenRZnkTl-5Ms'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Your business ID from authentication
const YOUR_BUSINESS_ID = 'c7f6221a-f588-43fa-a095-09151fbc41e8'

async function checkPhoneNumber() {
  console.log('📞 Checking phone number setup for your business...\n')
  
  // Check business phone setup
  console.log('🏢 1. BUSINESS PHONE NUMBERS:')
  try {
    const { data: phoneNumbers, error } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('business_id', YOUR_BUSINESS_ID)
    
    if (error) {
      console.log('❌ Error checking phone numbers:', error.message)
    } else if (phoneNumbers.length === 0) {
      console.log('❌ No phone numbers found for your business')
      console.log('📝 This means phone setup during onboarding may not have completed')
    } else {
      console.log('✅ Found phone numbers:')
      phoneNumbers.forEach(phone => {
        console.log(`   📞 ${phone.phone_number}`)
        console.log(`   🆔 Vapi Phone ID: ${phone.vapi_phone_id}`)
        console.log(`   🔗 Vapi Phone Number ID: ${phone.vapi_phone_number_id}`)
        console.log(`   ✅ Primary: ${phone.is_primary}`)
        console.log(`   🟢 Active: ${phone.is_active}`)
        console.log('')
      })
    }
  } catch (err) {
    console.log('❌ Phone number check failed:', err.message)
  }

  // Check business main phone in businesses table
  console.log('🏢 2. BUSINESS MAIN PHONE:')
  try {
    const { data: business, error } = await supabase
      .from('businesses')
      .select('id, name, phone, vapi_phone_number')
      .eq('id', YOUR_BUSINESS_ID)
      .single()
    
    if (error) {
      console.log('❌ Error checking business:', error.message)
    } else {
      console.log('✅ Business info:')
      console.log(`   📞 Main phone: ${business.phone || 'Not set'}`)
      console.log(`   📞 Vapi phone: ${business.vapi_phone_number || 'Not set'}`)
    }
  } catch (err) {
    console.log('❌ Business check failed:', err.message)
  }

  // Check voice AI config
  console.log('🤖 3. VOICE AI CONFIG:')
  try {
    const { data: voiceConfig, error } = await supabase
      .from('voice_ai_config')
      .select('*')
      .eq('business_id', YOUR_BUSINESS_ID)
      .single()
    
    if (error) {
      console.log('❌ No voice AI config found:', error.message)
    } else {
      console.log('✅ Voice AI config:')
      console.log(`   📞 Phone number: ${voiceConfig.phone_number || 'Not set'}`)
      console.log(`   🆔 Vapi Assistant ID: ${voiceConfig.vapi_assistant_id || 'Not set'}`)
      console.log(`   🟢 Enabled: ${voiceConfig.is_enabled}`)
    }
  } catch (err) {
    console.log('❌ Voice AI config check failed:', err.message)
  }

  console.log('\n🎯 NEXT STEPS:')
  console.log('1. If no phone found, the main Vapi number is: +1 (424) 351-9304')
  console.log('2. For web widget testing, check if booking widget exists')
  console.log('3. Test both SMS and web bookings to verify they create appointments')
}

checkPhoneNumber()