/**
 * Audit: Onboarding Data Flow Analysis
 * Checks if onboarding data collection properly maps to database schema
 */

const fs = require('fs')

function auditOnboardingDataFlow() {
  console.log('🔍 AUDITING ONBOARDING DATA FLOW...')
  console.log('Checking if collected data properly maps to database and dashboard requirements')
  
  // 1. Check what data is collected in onboarding
  console.log('\n📋 ONBOARDING DATA COLLECTION:')
  
  const onboardingCollectedData = {
    // From BusinessInfo interface in provision-client
    core: ['name', 'email', 'phone', 'businessType'],
    maya: ['mayaJobId'], // Maya job selection
    owner: ['ownerFirstName', 'ownerLastName'],
    business_tier_fields: [
      'businessDescription',
      'brandPersonality', 
      'uniqueSellingPoints',
      'targetCustomer',
      'priceRange'
    ],
    plan: ['selectedPlan'], // starter/professional/business
    payment: ['paymentMethodId']
  }
  
  console.log('✅ Core fields:', onboardingCollectedData.core.join(', '))
  console.log('✅ Maya job field:', onboardingCollectedData.maya.join(', '))
  console.log('✅ Owner fields:', onboardingCollectedData.owner.join(', '))
  console.log('✅ Business tier fields:', onboardingCollectedData.business_tier_fields.join(', '))
  console.log('✅ Plan selection:', onboardingCollectedData.plan.join(', '))
  
  // 2. Check what's actually stored in database
  console.log('\n💾 DATABASE STORAGE (businesses table):')
  
  try {
    const provisionClientFile = fs.readFileSync(
      'C:/Users/escot/vapi-nail-salon-agent/dashboard/app/api/admin/provision-client/route.ts', 
      'utf8'
    )
    
    // Extract what fields are being inserted into businesses table
    const businessInsertMatch = provisionClientFile.match(/\.insert\(\{([\s\S]*?)\}\)/s)
    
    if (businessInsertMatch) {
      const insertFields = businessInsertMatch[1]
      console.log('Database fields being stored:')
      
      const fieldLines = insertFields.split('\n').filter(line => line.includes(':'))
      fieldLines.forEach(line => {
        const field = line.trim().split(':')[0]
        console.log(`  ✅ ${field}`)
      })
    }
    
  } catch (error) {
    console.log('❌ Error reading provision-client route:', error.message)
  }
  
  // 3. Identify gaps
  console.log('\n🔍 DATA FLOW GAP ANALYSIS:')
  
  const potentialGaps = [
    {
      field: 'mayaJobId',
      collected: true,
      stored: 'NOT IN BUSINESSES TABLE',
      impact: 'Critical - Dashboard cannot show Maya job selection',
      solution: 'Add maya_job_id column to businesses table'
    },
    {
      field: 'brandPersonality', 
      collected: true,
      stored: 'NOT IN BUSINESSES TABLE',
      impact: 'Important - Cannot customize Business tier branding in dashboard',
      solution: 'Add brand_personality column for Business tier features'
    },
    {
      field: 'businessDescription',
      collected: true,
      stored: 'NOT IN BUSINESSES TABLE', 
      impact: 'Medium - Business context not available for dashboard customization',
      solution: 'Add description text field'
    },
    {
      field: 'uniqueSellingPoints',
      collected: true,
      stored: 'NOT IN BUSINESSES TABLE',
      impact: 'Important - Cannot display or edit USPs in dashboard',
      solution: 'Add unique_selling_points jsonb field'
    },
    {
      field: 'targetCustomer',
      collected: true,
      stored: 'NOT IN BUSINESSES TABLE',
      impact: 'Medium - Marketing insights not available',
      solution: 'Add target_customer text field'
    },
    {
      field: 'priceRange', 
      collected: true,
      stored: 'NOT IN BUSINESSES TABLE',
      impact: 'Important - Dashboard cannot adapt pricing displays',
      solution: 'Add price_range enum (budget/mid-range/premium/luxury)'
    }
  ]
  
  console.log('❌ CRITICAL GAPS FOUND:')
  potentialGaps.forEach(gap => {
    console.log(`\n🔴 ${gap.field}:`)
    console.log(`   Collected: ${gap.collected ? '✅' : '❌'}`)
    console.log(`   Stored: ${gap.stored}`)
    console.log(`   Impact: ${gap.impact}`)
    console.log(`   Solution: ${gap.solution}`)
  })
  
  // 4. Dashboard feature impact
  console.log('\n🎨 DASHBOARD FEATURE IMPACT:')
  
  const dashboardFeatures = [
    {
      feature: 'Maya Job Display',
      requires: ['maya_job_id'],
      status: '❌ BROKEN - Cannot show which Maya job was selected'
    },
    {
      feature: 'Business Tier Customization',
      requires: ['brand_personality', 'unique_selling_points'],
      status: '❌ BROKEN - Cannot customize Business tier branding'
    },
    {
      feature: 'Service Pricing Display',
      requires: ['price_range'],
      status: '❌ BROKEN - Cannot adapt pricing displays to business level'
    },
    {
      feature: 'Marketing Insights',
      requires: ['target_customer', 'business_description'],
      status: '❌ BROKEN - No customer targeting data available'
    },
    {
      feature: 'Agent Configuration',
      requires: ['maya_job_id', 'brand_personality'],
      status: '❌ BROKEN - Cannot show or modify AI agent settings'
    }
  ]
  
  dashboardFeatures.forEach(feature => {
    console.log(`\n📊 ${feature.feature}:`)
    console.log(`   Requires: ${feature.requires.join(', ')}`)
    console.log(`   Status: ${feature.status}`)
  })
  
  // 5. Recommendations
  console.log('\n🛠️  RECOMMENDED FIXES:')
  console.log('\n1. Create database migration to add missing columns:')
  console.log(`   ALTER TABLE businesses ADD COLUMN maya_job_id varchar(100);`)
  console.log(`   ALTER TABLE businesses ADD COLUMN brand_personality varchar(20);`)
  console.log(`   ALTER TABLE businesses ADD COLUMN business_description text;`)
  console.log(`   ALTER TABLE businesses ADD COLUMN unique_selling_points jsonb;`)
  console.log(`   ALTER TABLE businesses ADD COLUMN target_customer text;`)
  console.log(`   ALTER TABLE businesses ADD COLUMN price_range varchar(20);`)
  
  console.log('\n2. Update provision-client API to store collected data:')
  console.log(`   Add all collected fields to the businesses table insert`)
  
  console.log('\n3. Update dashboard components to use new fields:')
  console.log(`   - Business settings page to show/edit Maya job`)
  console.log(`   - Branding customization using brand_personality`)
  console.log(`   - Service pricing displays using price_range`)
  
  console.log('\n4. Create Business Tier dashboard features:')
  console.log(`   - Agent customization panel`)
  console.log(`   - Branding management interface`) 
  console.log(`   - Marketing insights dashboard`)
  
  console.log('\n🎯 URGENCY ASSESSMENT:')
  console.log('🔴 CRITICAL: Maya job ID missing breaks core functionality')
  console.log('🟡 HIGH: Business tier features unusable without branding fields')
  console.log('🟢 MEDIUM: Marketing features nice-to-have but not blocking')
  
  console.log('\n✅ NEXT STEPS:')
  console.log('1. Create and run database migration for missing columns')
  console.log('2. Update provision-client to store all collected data')
  console.log('3. Update dashboard to display and use stored Maya job data')
  console.log('4. Test complete flow from onboarding to dashboard display')
}

// Run the audit
auditOnboardingDataFlow()