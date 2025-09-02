import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json({ error: 'Phone parameter required' }, { status: 400 })
    }

    // Check both business IDs
    const businessIds = [
      '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad', // Our demo business ID
      'c7f6221a-f588-43fa-a095-09151fbc41e8'  // Railway webhook business ID
    ]

    const results = {}

    for (const businessId of businessIds) {
      // Check customers
      const { data: customers } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', businessId)
        .eq('phone', phone)

      // Check appointments for this business
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          *,
          customer:customers(*)
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(10)

      results[businessId] = {
        businessName: businessId === '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad' ? 'Demo Business' : 'Railway Business',
        customers: customers || [],
        appointments: appointments || [],
        customerCount: customers?.length || 0,
        appointmentCount: appointments?.length || 0
      }
    }

    return NextResponse.json({
      success: true,
      phone: phone,
      results: results,
      summary: {
        totalCustomers: Object.values(results).reduce((sum: number, r: any) => sum + r.customerCount, 0),
        totalAppointments: Object.values(results).reduce((sum: number, r: any) => sum + r.appointmentCount, 0)
      }
    })

  } catch (error: any) {
    console.error('Debug API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Debug failed'
    }, { status: 500 })
  }
}