// Get the latest business created during onboarding
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://irvyhhkoiyzartmmvbxw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMTgyOTMsImV4cCI6MjA3MDY5NDI5M30.EArkK7byT7CZkQVL1B905qDwlCyq8TQenRZnkTl-5Ms'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function getLatestBusiness() {
  try {
    console.log('🔍 Finding your newly created business...\n')
    
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('id, name, email, created_at, plan_type')
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (error) {
      console.error('❌ Error getting businesses:', error.message)
      return
    }
    
    console.log('📋 Recent businesses:')
    businesses.forEach((business, index) => {
      console.log(`${index + 1}. ${business.name}`)
      console.log(`   ID: ${business.id}`)
      console.log(`   Email: ${business.email}`)
      console.log(`   Plan: ${business.plan_type}`)
      console.log(`   Created: ${business.created_at}`)
      console.log('')
    })
    
    const latestBusiness = businesses[0]
    console.log(`🎯 Latest business to use: ${latestBusiness.name}`)
    console.log(`📝 Business ID: ${latestBusiness.id}`)
    
    return latestBusiness.id
    
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
}

getLatestBusiness()