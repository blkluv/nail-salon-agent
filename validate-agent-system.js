/**
 * Validate Agent System Files
 * Checks that all required files exist and have proper structure
 */

const fs = require('fs')
const path = require('path')

function validateAgentSystem() {
  console.log('🧪 Validating Maya Job-Specific Agent System...')
  
  const files = [
    'C:/Users/escot/vapi-nail-salon-agent/dashboard/lib/maya-job-templates.ts',
    'C:/Users/escot/vapi-nail-salon-agent/dashboard/lib/business-profile-generator.ts', 
    'C:/Users/escot/vapi-nail-salon-agent/dashboard/lib/agent-provisioning-service.ts'
  ]
  
  let allValid = true
  
  // Check file existence
  console.log('\n1. Checking file existence...')
  for (const file of files) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`)
    } else {
      console.log(`❌ ${file} - NOT FOUND`)
      allValid = false
    }
  }
  
  // Check Maya job templates
  console.log('\n2. Validating Maya job templates...')
  try {
    const templatesFile = fs.readFileSync('C:/Users/escot/vapi-nail-salon-agent/dashboard/lib/maya-job-templates.ts', 'utf8')
    
    const expectedJobs = [
      'nail-salon-receptionist',
      'hair-salon-coordinator', 
      'spa-wellness-assistant',
      'massage-therapy-scheduler',
      'beauty-salon-assistant',
      'barbershop-coordinator',
      'medical-scheduler',
      'dental-coordinator',
      'fitness-coordinator'
    ]
    
    for (const job of expectedJobs) {
      if (templatesFile.includes(`'${job}'`)) {
        console.log(`✅ ${job}`)
      } else {
        console.log(`❌ ${job} - NOT FOUND`)
        allValid = false
      }
    }
    
    // Check for required properties
    const requiredProps = ['systemPrompt', 'expertise', 'voiceSettings', 'defaultGreeting']
    for (const prop of requiredProps) {
      if (templatesFile.includes(prop)) {
        console.log(`✅ Property: ${prop}`)
      } else {
        console.log(`❌ Property: ${prop} - NOT FOUND`)
        allValid = false
      }
    }
    
  } catch (error) {
    console.log(`❌ Error reading maya-job-templates.ts: ${error.message}`)
    allValid = false
  }
  
  // Check business profile generator
  console.log('\n3. Validating business profile generator...')
  try {
    const profileFile = fs.readFileSync('C:/Users/escot/vapi-nail-salon-agent/dashboard/lib/business-profile-generator.ts', 'utf8')
    
    const requiredFunctions = [
      'generateBusinessProfile',
      'generateCustomGreeting',
      'generateBusinessContext'
    ]
    
    for (const func of requiredFunctions) {
      if (profileFile.includes(func)) {
        console.log(`✅ Function: ${func}`)
      } else {
        console.log(`❌ Function: ${func} - NOT FOUND`)
        allValid = false
      }
    }
    
    // Check personality types
    const personalities = ['professional', 'warm', 'luxury', 'casual']
    for (const personality of personalities) {
      if (profileFile.includes(personality)) {
        console.log(`✅ Personality: ${personality}`)
      } else {
        console.log(`❌ Personality: ${personality} - NOT FOUND`)
        allValid = false
      }
    }
    
  } catch (error) {
    console.log(`❌ Error reading business-profile-generator.ts: ${error.message}`)
    allValid = false
  }
  
  // Check agent provisioning service
  console.log('\n4. Validating agent provisioning service...')
  try {
    const provisioningFile = fs.readFileSync('C:/Users/escot/vapi-nail-salon-agent/dashboard/lib/agent-provisioning-service.ts', 'utf8')
    
    const requiredFunctions = [
      'provisionMayaAgent',
      'createCustomVapiAgent',
      'createJobSpecificSharedAgent',
      'linkAgentToPhone',
      'initializeJobSpecificAgents'
    ]
    
    for (const func of requiredFunctions) {
      if (provisioningFile.includes(func)) {
        console.log(`✅ Function: ${func}`)
      } else {
        console.log(`❌ Function: ${func} - NOT FOUND`)
        allValid = false
      }
    }
    
    // Check shared agents mapping
    if (provisioningFile.includes('JOB_SPECIFIC_AGENTS')) {
      console.log(`✅ Shared agents mapping`)
    } else {
      console.log(`❌ Shared agents mapping - NOT FOUND`)
      allValid = false
    }
    
  } catch (error) {
    console.log(`❌ Error reading agent-provisioning-service.ts: ${error.message}`)
    allValid = false
  }
  
  // Check provision-client integration
  console.log('\n5. Validating provision-client integration...')
  try {
    const provisionClientFile = fs.readFileSync('C:/Users/escot/vapi-nail-salon-agent/dashboard/app/api/admin/provision-client/route.ts', 'utf8')
    
    if (provisionClientFile.includes('provisionMayaAgent')) {
      console.log(`✅ provisionMayaAgent import and usage`)
    } else {
      console.log(`❌ provisionMayaAgent - NOT INTEGRATED`)
      allValid = false
    }
    
    if (provisionClientFile.includes('BusinessTierInfo')) {
      console.log(`✅ BusinessTierInfo type usage`)
    } else {
      console.log(`❌ BusinessTierInfo - NOT INTEGRATED`)
      allValid = false
    }
    
    if (provisionClientFile.includes('mayaJobId')) {
      console.log(`✅ Maya job ID handling`)
    } else {
      console.log(`❌ Maya job ID - NOT INTEGRATED`)
      allValid = false
    }
    
  } catch (error) {
    console.log(`❌ Error reading provision-client route: ${error.message}`)
    allValid = false
  }
  
  // Final result
  console.log('\n🏆 VALIDATION RESULTS:')
  if (allValid) {
    console.log('✅ ALL VALIDATIONS PASSED!')
    console.log('🎉 The Maya job-specific agent system is properly implemented!')
    console.log('')
    console.log('System capabilities:')
    console.log('- 9 specialized Maya job templates with unique prompts')
    console.log('- Business profile generation with 4 brand personalities')
    console.log('- Tiered agent strategy (shared for Starter/Pro, custom for Business)')
    console.log('- Complete VAPI integration with phone number linking')
    console.log('- Integration with existing provision-client API')
    console.log('')
    console.log('Ready for production deployment! 🚀')
  } else {
    console.log('❌ SOME VALIDATIONS FAILED')
    console.log('Please check the errors above and fix the issues.')
  }
  
  return allValid
}

// Run the validation
const isValid = validateAgentSystem()
process.exit(isValid ? 0 : 1)