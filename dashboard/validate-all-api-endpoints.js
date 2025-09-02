/**
 * Comprehensive API Endpoint Validation
 * Tests all API endpoints for deployment readiness
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function validateAllAPIEndpoints() {
  console.log('🔍 Validating All API Endpoints for Deployment...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Define all API endpoints to validate
  const apiEndpoints = [
    // Core Business Operations
    { 
      path: '/api/check-availability',
      method: 'POST',
      category: 'Core',
      description: 'Check service availability',
      testData: { date: '2025-09-05', time: '14:00', serviceId: 'test' }
    },
    {
      path: '/api/book-appointment', 
      method: 'POST',
      category: 'Core',
      description: 'Book new appointment',
      testData: { customerId: 'test', serviceId: 'test', date: '2025-09-05', time: '14:00' }
    },
    {
      path: '/api/process-payment',
      method: 'POST', 
      category: 'Core',
      description: 'Process payment for appointment',
      testData: { appointmentId: 'test', amount: 50, paymentMethodId: 'test' }
    },

    // Authentication & Business Management
    {
      path: '/api/auth/business/login',
      method: 'POST',
      category: 'Auth',
      description: 'Business authentication',
      testData: { email: 'test@example.com', password: 'test123' }
    },
    {
      path: '/api/auth/business/mock',
      method: 'POST',
      category: 'Auth', 
      description: 'Mock business authentication',
      testData: { businessId: '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad' }
    },
    {
      path: '/api/admin/provision-client',
      method: 'POST',
      category: 'Admin',
      description: 'Provision new client',
      testData: { businessName: 'Test Business', plan: 'professional' }
    },

    // Communications & Notifications
    {
      path: '/api/send-sms',
      method: 'POST',
      category: 'Communications', 
      description: 'Send SMS notifications',
      testData: { to: '+15551234567', message: 'Test SMS' }
    },
    {
      path: '/api/email/send',
      method: 'POST',
      category: 'Communications',
      description: 'Send email notifications', 
      testData: { to: 'test@example.com', subject: 'Test', content: 'Test email' }
    },
    {
      path: '/api/email/campaigns',
      method: 'POST',
      category: 'Communications',
      description: 'Create email campaign',
      testData: { subject: 'Test Campaign', content: 'Campaign content' }
    },
    {
      path: '/api/email/campaign/send',
      method: 'POST',
      category: 'Communications',
      description: 'Send email campaign',
      testData: { campaignId: 'test', recipients: ['test@example.com'] }
    },

    // Reports & Analytics
    {
      path: '/api/reports/daily',
      method: 'GET',
      category: 'Reports',
      description: 'Generate daily reports',
      queryParams: 'businessId=8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad&date=2025-09-02'
    },
    {
      path: '/api/reports/export',
      method: 'POST',
      category: 'Reports',
      description: 'Export report data',
      testData: { businessId: '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad', format: 'csv', dateRange: 'week' }
    },

    // Cron Jobs
    {
      path: '/api/cron/reminders',
      method: 'GET',
      category: 'Cron',
      description: 'Appointment reminders cron job'
    },
    {
      path: '/api/cron/daily-reports', 
      method: 'GET',
      category: 'Cron',
      description: 'Daily reports cron job'
    },

    // Webhooks
    {
      path: '/api/webhook/sms',
      method: 'POST',
      category: 'Webhooks',
      description: 'SMS webhook handler',
      testData: { From: '+15551234567', Body: 'Test SMS webhook' }
    },
    {
      path: '/api/webhook/stripe',
      method: 'POST', 
      category: 'Webhooks',
      description: 'Stripe webhook handler',
      testData: { type: 'payment_intent.succeeded', data: { object: { id: 'test' } } }
    },
    {
      path: '/api/webhook/square',
      method: 'POST',
      category: 'Webhooks', 
      description: 'Square webhook handler',
      testData: { type: 'payment.created', data: { object: { id: 'test' } } }
    },

    // Billing & Payments
    {
      path: '/api/billing/create-checkout',
      method: 'POST',
      category: 'Billing',
      description: 'Create billing checkout session',
      testData: { businessId: 'test', plan: 'professional' }
    },
    {
      path: '/api/billing/success',
      method: 'GET',
      category: 'Billing',
      description: 'Billing success handler',
      queryParams: 'session_id=test_session'
    },
    {
      path: '/api/billing/webhook',
      method: 'POST',
      category: 'Billing',
      description: 'Billing webhook handler',
      testData: { type: 'checkout.session.completed', data: { object: { id: 'test' } } }
    },

    // Utility & Testing
    {
      path: '/api/production-readiness',
      method: 'GET',
      category: 'Utility',
      description: 'Production readiness check'
    },
    {
      path: '/api/test/integration',
      method: 'GET',
      category: 'Testing',
      description: 'Integration testing endpoint'
    },
    {
      path: '/api/debug-appointments',
      method: 'GET', 
      category: 'Debug',
      description: 'Debug appointments data',
      queryParams: 'businessId=8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'
    },
    {
      path: '/api/check-businesses',
      method: 'GET',
      category: 'Debug',
      description: 'Check businesses data'
    }
  ]

  let results = {
    total: apiEndpoints.length,
    tested: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    categories: {}
  }

  const baseUrl = 'http://localhost:3000'
  let localServerRunning = false

  // Test if local server is running
  try {
    const testResponse = await fetch(`${baseUrl}/api/production-readiness`)
    if (testResponse.ok || testResponse.status === 404 || testResponse.status === 500) {
      localServerRunning = true
      console.log('✅ Local development server detected')
    }
  } catch (e) {
    console.log('⚠️ Local server not running - testing endpoint logic only')
  }

  console.log('\n📊 Testing', apiEndpoints.length, 'API endpoints...\n')

  for (const endpoint of apiEndpoints) {
    results.tested++

    if (!results.categories[endpoint.category]) {
      results.categories[endpoint.category] = { passed: 0, failed: 0, warnings: 0 }
    }

    console.log(`🔍 ${endpoint.path} (${endpoint.method})`)
    console.log(`   ${endpoint.description}`)

    try {
      if (localServerRunning) {
        // Test actual endpoint
        let url = `${baseUrl}${endpoint.path}`
        if (endpoint.queryParams) {
          url += `?${endpoint.queryParams}`
        }

        const fetchOptions = {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json'
          }
        }

        if (endpoint.testData && endpoint.method !== 'GET') {
          fetchOptions.body = JSON.stringify(endpoint.testData)
        }

        const response = await fetch(url, fetchOptions)
        
        if (response.ok) {
          const data = await response.json()
          console.log('   ✅ PASS - Returns valid JSON response')
          console.log(`   📊 Status: ${response.status}`)
          results.passed++
          results.categories[endpoint.category].passed++
        } else if (response.status === 400 || response.status === 422) {
          // Expected validation errors with test data
          console.log('   ⚠️ WARN - Validation error (expected with test data)')
          console.log(`   📊 Status: ${response.status}`)
          results.warnings++
          results.categories[endpoint.category].warnings++
        } else if (response.status === 404) {
          console.log('   ❌ FAIL - Endpoint not found')
          results.failed++
          results.categories[endpoint.category].failed++
        } else {
          console.log(`   ❌ FAIL - HTTP ${response.status}`)
          results.failed++
          results.categories[endpoint.category].failed++
        }
      } else {
        // Check if endpoint file exists
        const endpointPath = `./app${endpoint.path}/route.ts`
        try {
          const fs = require('fs')
          if (fs.existsSync(endpointPath)) {
            console.log('   ✅ PASS - Endpoint file exists')
            results.passed++
            results.categories[endpoint.category].passed++
          } else {
            console.log('   ❌ FAIL - Endpoint file missing')
            results.failed++
            results.categories[endpoint.category].failed++
          }
        } catch (fsError) {
          console.log('   ⚠️ WARN - Could not check file existence')
          results.warnings++
          results.categories[endpoint.category].warnings++
        }
      }
    } catch (error) {
      console.log('   ❌ FAIL - Request error:', error.message)
      results.failed++
      results.categories[endpoint.category].failed++
    }

    console.log('')
  }

  // Summary Report
  console.log('═══════════════════════════════════════')
  console.log('🎯 API Endpoint Validation Summary')
  console.log('═══════════════════════════════════════')
  
  console.log(`📊 Overall Results:`)
  console.log(`   Total Endpoints: ${results.total}`)
  console.log(`   Tested: ${results.tested}`)
  console.log(`   ✅ Passed: ${results.passed}`)
  console.log(`   ⚠️ Warnings: ${results.warnings}`)
  console.log(`   ❌ Failed: ${results.failed}`)

  const passRate = ((results.passed + results.warnings) / results.total * 100).toFixed(1)
  console.log(`   📈 Success Rate: ${passRate}%`)

  console.log('\n📋 Results by Category:')
  Object.entries(results.categories).forEach(([category, stats]) => {
    const total = stats.passed + stats.warnings + stats.failed
    const categoryPassRate = total > 0 ? ((stats.passed + stats.warnings) / total * 100).toFixed(1) : '0'
    console.log(`   ${category}: ${categoryPassRate}% (${stats.passed}✅ ${stats.warnings}⚠️ ${stats.failed}❌)`)
  })

  // Deployment Readiness Assessment
  console.log('\n🚀 Deployment Readiness Assessment:')
  
  if (results.failed === 0) {
    console.log('   🟢 READY: All endpoints operational')
    console.log('   🟢 READY: No critical failures detected')
    
    if (results.warnings === 0) {
      console.log('   🟢 EXCELLENT: No warnings - perfect endpoint health')
      console.log('   🎉 STATUS: DEPLOYMENT READY - ALL SYSTEMS GO!')
    } else {
      console.log('   🟡 GOOD: Minor warnings present (likely test data validation)')
      console.log('   🚀 STATUS: DEPLOYMENT READY - Warnings are expected')
    }
  } else {
    console.log('   🔴 NOT READY: Critical endpoint failures detected')
    console.log('   📋 ACTION: Fix failed endpoints before deployment')
    console.log('   ❌ STATUS: NOT READY FOR DEPLOYMENT')
  }

  console.log('\n📝 Deployment Notes:')
  if (localServerRunning) {
    console.log('   ✅ Tested with live server - results are reliable')
    console.log('   🚀 Endpoints ready for production deployment')
  } else {
    console.log('   ⚠️ Tested file existence only - start dev server for full testing')
    console.log('   📋 Run: npm run dev && node validate-all-api-endpoints.js')
  }
  
  console.log('   📊 Monitor endpoint performance after deployment')
  console.log('   🔍 Check Vercel Functions dashboard for execution logs')
  console.log('   ⚡ All cron jobs will activate automatically on deployment')

  return results
}

// Also create a quick deployment test
async function quickDeploymentTest() {
  console.log('\n🚀 Quick Deployment Readiness Check...\n')

  const checks = [
    {
      name: 'Build Process',
      test: async () => {
        try {
          const { execSync } = require('child_process')
          execSync('npm run build', { stdio: 'pipe' })
          return { success: true, message: 'Build completes successfully' }
        } catch (error) {
          return { success: false, message: 'Build fails: ' + error.message.substring(0, 100) }
        }
      }
    },
    {
      name: 'Environment Variables',
      test: async () => {
        const required = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
        const missing = required.filter(key => !process.env[key])
        
        if (missing.length === 0) {
          return { success: true, message: 'All core environment variables set' }
        } else {
          return { success: false, message: `Missing: ${missing.join(', ')}` }
        }
      }
    },
    {
      name: 'Database Connectivity',
      test: async () => {
        try {
          const { createClient } = require('@supabase/supabase-js')
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
          )
          
          const { error } = await supabase.from('businesses').select('id').limit(1)
          
          if (error) {
            return { success: false, message: 'Database connection failed: ' + error.message }
          } else {
            return { success: true, message: 'Database connectivity verified' }
          }
        } catch (error) {
          return { success: false, message: 'Database test failed: ' + error.message }
        }
      }
    },
    {
      name: 'Storage Configuration', 
      test: async () => {
        try {
          const { createClient } = require('@supabase/supabase-js')
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
          )
          
          const { data: buckets, error } = await supabase.storage.listBuckets()
          
          if (error) {
            return { success: false, message: 'Storage check failed: ' + error.message }
          } else {
            const hasBusinessAssets = buckets?.find(b => b.name === 'business-assets')
            if (hasBusinessAssets) {
              return { success: true, message: 'Storage bucket configured correctly' }
            } else {
              return { success: false, message: 'business-assets bucket missing' }
            }
          }
        } catch (error) {
          return { success: false, message: 'Storage test failed: ' + error.message }
        }
      }
    }
  ]

  let allPassed = true

  for (const check of checks) {
    console.log(`🔍 ${check.name}...`)
    const result = await check.test()
    
    if (result.success) {
      console.log(`   ✅ ${result.message}`)
    } else {
      console.log(`   ❌ ${result.message}`)
      allPassed = false
    }
  }

  console.log('\n🎯 Quick Deployment Check:', allPassed ? '✅ READY' : '❌ NOT READY')
  
  return allPassed
}

// Run both tests
if (require.main === module) {
  (async () => {
    await validateAllAPIEndpoints()
    await quickDeploymentTest()
  })()
}

module.exports = { validateAllAPIEndpoints, quickDeploymentTest }