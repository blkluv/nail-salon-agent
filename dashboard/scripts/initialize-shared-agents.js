/**
 * Initialize Job-Specific Shared Agents Script
 * Creates all pre-built Maya agents for shared use across customers
 */

import { initializeJobSpecificAgents } from '../lib/agent-provisioning-service.js'

async function main() {
  console.log('🚀 Starting Maya job-specific shared agents initialization...')
  console.log('This will create 8 new VAPI assistants for shared use across customers.')
  
  try {
    await initializeJobSpecificAgents()
    
    console.log('✅ All job-specific shared agents have been initialized successfully!')
    console.log('')
    console.log('Shared agents created for:')
    console.log('- Hair Salon Coordinator 💇‍♀️')
    console.log('- Spa Wellness Assistant 🧘‍♀️')  
    console.log('- Massage Therapy Scheduler 💆‍♀️')
    console.log('- Beauty Salon Assistant ✨')
    console.log('- Barbershop Coordinator 💈')
    console.log('- Medical Scheduler 🏥')
    console.log('- Dental Coordinator 🦷') 
    console.log('- Fitness Coordinator 🏃‍♂️')
    console.log('')
    console.log('These agents are now ready for use by Starter and Professional tier customers!')
    
  } catch (error) {
    console.error('❌ Failed to initialize shared agents:', error)
    process.exit(1)
  }
}

// Run the initialization
main().catch(console.error)