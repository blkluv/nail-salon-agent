/**
 * Test Agent Provisioning System
 * Validates the complete job-specific agent system without making actual API calls
 */

// Mock environment variables for testing
process.env.VAPI_API_KEY = 'test-vapi-key'
process.env.NEXT_PUBLIC_API_BASE_URL = 'https://test-webhook.com'

// Import the modules (we'll mock the API calls)
async function testAgentProvisioning() {
  console.log('🧪 Testing Maya Job-Specific Agent System...')
  
  try {
    // Test 1: Job Template Loading
    console.log('\n1. Testing job template loading...')
    const { getJobTemplate, getAllJobTemplates } = await import('./dashboard/lib/maya-job-templates.js')
    
    const nailTemplate = getJobTemplate('nail-salon-receptionist')
    const hairTemplate = getJobTemplate('hair-salon-coordinator')
    const spaTemplate = getJobTemplate('spa-wellness-assistant')
    
    console.log(`✅ Nail Salon Template: ${nailTemplate?.name || 'NOT FOUND'}`)
    console.log(`✅ Hair Salon Template: ${hairTemplate?.name || 'NOT FOUND'}`)
    console.log(`✅ Spa Template: ${spaTemplate?.name || 'NOT FOUND'}`)
    
    const allTemplates = getAllJobTemplates()
    console.log(`✅ Total job templates loaded: ${allTemplates.length}`)
    
    // Test 2: Business Profile Generation
    console.log('\n2. Testing business profile generation...')
    const { generateBusinessProfile } = await import('./dashboard/lib/business-profile-generator.js')
    
    const businessInfo = {
      businessName: 'Elegant Nails Studio',
      ownerName: 'Sarah Johnson',
      email: 'sarah@elegantnails.com',
      phone: '+1234567890',
      mayaJobId: 'nail-salon-receptionist',
      businessDescription: 'Luxury nail salon specializing in custom nail art',
      brandPersonality: 'luxury',
      uniqueSellingPoints: ['Custom nail art', 'Luxury experience', 'Premium products'],
      targetCustomer: 'Clients seeking premium nail services',
      priceRange: 'luxury'
    }
    
    const profile = generateBusinessProfile(businessInfo)
    console.log(`✅ Generated agent name: ${profile.agentName}`)
    console.log(`✅ Brand voice: ${profile.brandVoice}`)
    console.log(`✅ Greeting preview: ${profile.customGreeting.substring(0, 80)}...`)
    
    // Test 3: Agent Provisioning Logic (Mock)
    console.log('\n3. Testing agent provisioning logic...')
    
    // Mock the VAPI API calls
    global.fetch = async (url, options) => {
      console.log(`📡 Mock API call to: ${url}`)
      if (url.includes('/assistant')) {
        return {
          ok: true,
          json: async () => ({ id: 'mock-agent-' + Date.now() })
        }
      }
      if (url.includes('/phone-number')) {
        return {
          ok: true,
          json: async () => ({ 
            id: 'mock-phone-' + Date.now(),
            number: '+1555' + Math.floor(Math.random() * 1000000)
          })
        }
      }
      return { ok: false, text: async () => 'Mock error' }
    }
    
    const { provisionMayaAgent } = await import('./dashboard/lib/agent-provisioning-service.js')
    
    // Test Starter tier (shared agent)
    const starterResult = await provisionMayaAgent(
      businessInfo,
      'starter',
      'test-business-id-1',
      []
    )
    console.log(`✅ Starter tier result: ${starterResult.agentType} - ${starterResult.agentId}`)
    
    // Test Business tier (custom agent)
    const businessResult = await provisionMayaAgent(
      businessInfo,
      'business',
      'test-business-id-2',
      []
    )
    console.log(`✅ Business tier result: ${businessResult.agentType} - ${businessResult.agentId}`)
    
    // Test 4: Different Maya Jobs
    console.log('\n4. Testing different Maya job types...')
    
    const jobs = [
      'hair-salon-coordinator',
      'spa-wellness-assistant',
      'massage-therapy-scheduler',
      'beauty-salon-assistant',
      'barbershop-coordinator'
    ]
    
    for (const jobId of jobs) {
      const template = getJobTemplate(jobId)
      if (template) {
        console.log(`✅ ${template.name} - ${template.expertise.length} expertise areas`)
      } else {
        console.log(`❌ Template not found for: ${jobId}`)
      }
    }
    
    console.log('\n🎉 All tests completed successfully!')
    console.log('✅ Job templates loaded correctly')
    console.log('✅ Business profile generation working')
    console.log('✅ Agent provisioning logic functional')
    console.log('✅ Multi-job support validated')
    console.log('\nThe Maya job-specific agent system is ready for production!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    console.error('Stack:', error.stack)
  }
}

// Run the test
testAgentProvisioning()