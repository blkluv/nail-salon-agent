import { NextRequest, NextResponse } from 'next/server'
import { BusinessDiscoveryService } from '../../../lib/business-discovery'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const phone = searchParams.get('phone')
  
  if (!phone) {
    return NextResponse.json({ error: 'Phone parameter required' }, { status: 400 })
  }

  try {
    console.log('Testing business discovery for phone:', phone)
    
    // Test business discovery
    const businesses = await BusinessDiscoveryService.discoverBusinessesForPhone(phone)
    
    // Test customer with businesses
    const customerWithBusinesses = await BusinessDiscoveryService.getCustomerWithBusinesses(phone)
    
    return NextResponse.json({
      success: true,
      phone,
      businesses_found: businesses.length,
      businesses,
      customer_details: customerWithBusinesses,
      test_results: {
        can_discover_businesses: businesses.length > 0,
        has_customer_record: !!customerWithBusinesses,
        preferred_business: businesses.find(b => b.is_preferred)?.business_name || 'None set'
      }
    })
  } catch (error: any) {
    console.error('Business discovery test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Test failed',
      stack: error.stack
    }, { status: 500 })
  }
}