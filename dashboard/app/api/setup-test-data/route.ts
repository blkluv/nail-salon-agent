import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('Setting up test data for phone-based business discovery...')

    // Create test businesses if they don't exist
    const testBusinesses = [
      {
        id: '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad',
        name: 'Luxury Nails Spa',
        slug: 'luxury-nails-spa',
        business_type: 'nail_salon',
        phone: '555-123-0001',
        email: 'info@luxurynails.com',
        address_line1: '123 Main St',
        city: 'Beverly Hills',
        state: 'CA',
        postal_code: '90210',
        subscription_tier: 'professional',
        subscription_status: 'active'
      },
      {
        id: 'c7f6221a-f588-43fa-a095-09151fbc41e8',
        name: 'Downtown Nail Studio',
        slug: 'downtown-nail-studio', 
        business_type: 'nail_salon',
        phone: '555-123-0002',
        email: 'hello@downtownnails.com',
        address_line1: '456 Broadway Ave',
        city: 'Los Angeles',
        state: 'CA',
        postal_code: '90012',
        subscription_tier: 'business',
        subscription_status: 'active'
      },
      {
        id: 'f1234567-89ab-cdef-0123-456789abcdef',
        name: 'Elite Beauty Lounge',
        slug: 'elite-beauty-lounge',
        business_type: 'nail_salon', 
        phone: '555-123-0003',
        email: 'contact@elitebeauty.com',
        address_line1: '789 Sunset Blvd',
        city: 'West Hollywood',
        state: 'CA',
        postal_code: '90069',
        subscription_tier: 'professional',
        subscription_status: 'active'
      }
    ]

    // Insert businesses
    for (const business of testBusinesses) {
      await supabase
        .from('businesses')
        .upsert(business, { onConflict: 'id' })
    }

    // Create test customers with different phone numbers
    const testCustomers = [
      {
        phone: '5551234567', // Single business customer (Luxury Nails)
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah@example.com',
        business_id: '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad',
        total_visits: 3,
        total_spent: 150
      },
      {
        phone: '5559876543', // Multi-business customer
        first_name: 'Maria',
        last_name: 'Garcia', 
        email: 'maria@example.com',
        business_id: '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad', // Primary business
        total_visits: 5,
        total_spent: 275
      },
      {
        phone: '5559876543', // Same customer at second business
        first_name: 'Maria',
        last_name: 'Garcia',
        email: 'maria@example.com',
        business_id: 'c7f6221a-f588-43fa-a095-09151fbc41e8',
        total_visits: 2,
        total_spent: 120
      },
      {
        phone: '5555551234', // Customer at all three businesses
        first_name: 'Jennifer',
        last_name: 'Chen',
        email: 'jen@example.com',
        business_id: '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad',
        total_visits: 8,
        total_spent: 400
      },
      {
        phone: '5555551234', // Same customer at business 2
        first_name: 'Jennifer',
        last_name: 'Chen',
        email: 'jen@example.com', 
        business_id: 'c7f6221a-f588-43fa-a095-09151fbc41e8',
        total_visits: 3,
        total_spent: 180
      },
      {
        phone: '5555551234', // Same customer at business 3
        first_name: 'Jennifer',
        last_name: 'Chen',
        email: 'jen@example.com',
        business_id: 'f1234567-89ab-cdef-0123-456789abcdef',
        total_visits: 1,
        total_spent: 85
      }
    ]

    const createdCustomers = []
    
    // Insert customers and collect their IDs
    for (const customer of testCustomers) {
      const { data, error } = await supabase
        .from('customers')
        .upsert(customer, { onConflict: 'phone,business_id' })
        .select('id, phone, business_id')
        .single()
      
      if (data) {
        createdCustomers.push(data)
      } else if (error) {
        console.log('Customer upsert result:', error.message)
      }
    }

    // Now create business relationships
    const relationships = []
    const customersByPhone: { [phone: string]: any[] } = {}
    
    // Group customers by phone
    createdCustomers.forEach(customer => {
      if (!customersByPhone[customer.phone]) {
        customersByPhone[customer.phone] = []
      }
      customersByPhone[customer.phone].push(customer)
    })

    // Create relationships
    Object.entries(customersByPhone).forEach(([phone, customers]) => {
      customers.forEach((customer, index) => {
        const isPreferred = index === 0 // First business is preferred
        const visitData = testCustomers.find(tc => 
          tc.phone === phone && tc.business_id === customer.business_id
        )
        
        relationships.push({
          customer_id: customer.id,
          business_id: customer.business_id,
          first_visit_date: '2024-01-15',
          last_visit_date: '2024-03-20',
          total_visits: visitData?.total_visits || 1,
          is_preferred: isPreferred
        })
      })
    })

    // Insert relationships
    if (relationships.length > 0) {
      const { data: relData, error: relError } = await supabase
        .from('customer_business_relationships')
        .upsert(relationships, { onConflict: 'customer_id,business_id' })

      if (relError) {
        console.error('Relationship creation error:', relError)
      } else {
        console.log('Created relationships:', relData?.length || relationships.length)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Test data created successfully',
      data: {
        businesses_created: testBusinesses.length,
        customers_created: createdCustomers.length,
        relationships_created: relationships.length,
        test_phones: [
          { phone: '5551234567', expected_businesses: 1, description: 'Single business customer' },
          { phone: '5559876543', expected_businesses: 2, description: 'Two business customer' },
          { phone: '5555551234', expected_businesses: 3, description: 'Three business customer' },
          { phone: '5551111111', expected_businesses: 0, description: 'No businesses (new customer)' }
        ]
      }
    })

  } catch (error: any) {
    console.error('Setup test data error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}