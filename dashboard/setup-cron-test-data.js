/**
 * Setup Test Data for Cron Job Testing
 * Creates necessary business, customer, and service data
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function setupCronTestData() {
  console.log('📊 Setting up Cron Job Test Data...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Step 1: Check existing businesses
    console.log('1️⃣ Checking existing businesses...')
    
    const { data: existingBusinesses, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, phone, email')
      .limit(5)

    if (businessError) {
      console.log('❌ Error checking businesses:', businessError.message)
      return
    }

    console.log('Found', existingBusinesses?.length || 0, 'existing businesses:')
    existingBusinesses?.forEach(biz => {
      console.log(`   - ${biz.name} (${biz.id})`)
    })

    let testBusiness
    const DEMO_BUSINESS_ID = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'
    
    // Check if demo business exists
    const demoBusiness = existingBusinesses?.find(b => b.id === DEMO_BUSINESS_ID)
    
    if (!demoBusiness) {
      console.log('\n🏢 Creating demo business for testing...')
      
      const businessData = {
        id: DEMO_BUSINESS_ID,
        name: 'Demo Beauty Salon',
        phone: '+14243519304',
        email: 'demo@demosalontest.com',
        address: '123 Demo Street, Los Angeles, CA 90210',
        subscription_tier: 'professional',
        is_active: true,
        created_at: new Date().toISOString()
      }

      const { data: newBusiness, error: createBusinessError } = await supabase
        .from('businesses')
        .insert([businessData])
        .select()
        .single()

      if (createBusinessError) {
        console.log('❌ Failed to create demo business:', createBusinessError.message)
        return
      }

      console.log('✅ Created demo business:', newBusiness.name)
      testBusiness = newBusiness
    } else {
      console.log('✅ Using existing demo business:', demoBusiness.name)
      testBusiness = demoBusiness
    }

    // Step 2: Check/Create services
    console.log('\n2️⃣ Checking services...')
    
    const { data: existingServices, error: serviceError } = await supabase
      .from('services')
      .select('id, name, duration, base_price')
      .eq('business_id', testBusiness.id)

    if (serviceError) {
      console.log('❌ Error checking services:', serviceError.message)
      return
    }

    console.log('Found', existingServices?.length || 0, 'services for demo business')

    if (!existingServices || existingServices.length === 0) {
      console.log('🛠️ Creating demo services...')
      
      const services = [
        {
          business_id: testBusiness.id,
          name: 'Gel Manicure',
          description: 'Professional gel manicure with color',
          duration: 60,
          base_price: 45,
          is_active: true
        },
        {
          business_id: testBusiness.id,
          name: 'Classic Pedicure',
          description: 'Relaxing pedicure with foot massage',
          duration: 75,
          base_price: 55,
          is_active: true
        },
        {
          business_id: testBusiness.id,
          name: 'Nail Art Design',
          description: 'Custom nail art and designs',
          duration: 90,
          base_price: 75,
          is_active: true
        }
      ]

      const { data: newServices, error: createServicesError } = await supabase
        .from('services')
        .insert(services)
        .select()

      if (createServicesError) {
        console.log('❌ Failed to create services:', createServicesError.message)
      } else {
        console.log('✅ Created', newServices.length, 'demo services')
        newServices.forEach(service => {
          console.log(`   - ${service.name} ($${service.base_price}, ${service.duration}min)`)
        })
      }
    } else {
      console.log('✅ Services already exist:')
      existingServices.forEach(service => {
        console.log(`   - ${service.name} ($${service.base_price}, ${service.duration}min)`)
      })
    }

    // Step 3: Check/Create customers
    console.log('\n3️⃣ Checking customers...')
    
    const { data: existingCustomers, error: customerError } = await supabase
      .from('customers')
      .select('id, first_name, last_name, phone, email')
      .eq('business_id', testBusiness.id)

    if (customerError) {
      console.log('❌ Error checking customers:', customerError.message)
      return
    }

    console.log('Found', existingCustomers?.length || 0, 'customers for demo business')

    if (!existingCustomers || existingCustomers.length < 3) {
      console.log('👥 Creating demo customers...')
      
      const customers = [
        {
          business_id: testBusiness.id,
          first_name: 'Alice',
          last_name: 'Johnson',
          phone: '+15551234567',
          email: 'alice.johnson@example.com'
        },
        {
          business_id: testBusiness.id,
          first_name: 'Bob',
          last_name: 'Smith',
          phone: '+15559876543',
          email: 'bob.smith@example.com'
        },
        {
          business_id: testBusiness.id,
          first_name: 'Carol',
          last_name: 'Williams',
          phone: '+15555678901',
          email: 'carol.williams@example.com'
        }
      ]

      const { data: newCustomers, error: createCustomersError } = await supabase
        .from('customers')
        .insert(customers)
        .select()

      if (createCustomersError) {
        console.log('❌ Failed to create customers:', createCustomersError.message)
      } else {
        console.log('✅ Created', newCustomers.length, 'demo customers')
        newCustomers.forEach(customer => {
          console.log(`   - ${customer.first_name} ${customer.last_name} (${customer.phone})`)
        })
      }
    } else {
      console.log('✅ Customers already exist:')
      existingCustomers.forEach(customer => {
        console.log(`   - ${customer.first_name} ${customer.last_name} (${customer.phone})`)
      })
    }

    // Step 4: Create sample appointments for testing
    console.log('\n4️⃣ Creating test appointments...')
    
    // Get current services and customers
    const { data: services } = await supabase
      .from('services')
      .select('id, name')
      .eq('business_id', testBusiness.id)
      .limit(3)

    const { data: customers } = await supabase
      .from('customers')
      .select('id, first_name, last_name')
      .eq('business_id', testBusiness.id)
      .limit(3)

    if (services?.length && customers?.length) {
      // Create appointments for different dates
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const testAppointments = [
        {
          business_id: testBusiness.id,
          customer_id: customers[0].id,
          service_id: services[0].id,
          appointment_date: yesterday.toISOString().split('T')[0],
          start_time: '10:00:00',
          end_time: '11:00:00',
          status: 'completed',
          reminder_sent: true
        },
        {
          business_id: testBusiness.id,
          customer_id: customers[1].id,
          service_id: services[1].id,
          appointment_date: today.toISOString().split('T')[0],
          start_time: '14:00:00',
          end_time: '15:15:00',
          status: 'confirmed',
          reminder_sent: true
        },
        {
          business_id: testBusiness.id,
          customer_id: customers[2].id,
          service_id: services[2].id,
          appointment_date: tomorrow.toISOString().split('T')[0],
          start_time: '16:00:00',
          end_time: '17:30:00',
          status: 'confirmed',
          reminder_sent: false // This will be picked up by reminder cron
        }
      ]

      const { data: newAppointments, error: appointmentError } = await supabase
        .from('appointments')
        .insert(testAppointments)
        .select(`
          *,
          customer:customers(first_name, last_name),
          service:services(name)
        `)

      if (appointmentError) {
        console.log('❌ Failed to create appointments:', appointmentError.message)
      } else {
        console.log('✅ Created', newAppointments.length, 'test appointments:')
        newAppointments.forEach(apt => {
          console.log(`   - ${apt.customer.first_name} ${apt.customer.last_name}: ${apt.service.name} on ${apt.appointment_date} at ${apt.start_time} (${apt.status})`)
        })
      }
    } else {
      console.log('❌ Missing services or customers for appointment creation')
    }

    // Final summary
    console.log('\n🎉 Test Data Setup Complete!')
    console.log('────────────────────────────────────────')
    console.log('✅ Demo business created/verified')
    console.log('✅ Services created/verified')
    console.log('✅ Customers created/verified')
    console.log('✅ Test appointments created')
    console.log('')
    console.log('🚀 Ready for cron job testing!')
    console.log('   - Business ID:', testBusiness.id)
    console.log('   - Business Name:', testBusiness.name)
    console.log('   - Test appointments span yesterday, today, tomorrow')
    console.log('   - Tomorrow\'s appointment has reminder_sent = false')

  } catch (error) {
    console.log('❌ Test data setup failed:', error.message)
    console.log('   Stack:', error.stack)
  }
}

// Run the setup
if (require.main === module) {
  setupCronTestData()
}

module.exports = { setupCronTestData }