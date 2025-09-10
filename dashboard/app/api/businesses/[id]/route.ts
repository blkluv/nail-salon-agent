import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = params.id

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      )
    }

    // Fetch business data including all Maya job and branding fields
    const { data: business, error } = await supabase
      .from('businesses')
      .select(`
        id,
        name,
        email,
        phone,
        business_type,
        subscription_tier,
        subscription_status,
        maya_job_id,
        brand_personality,
        business_description,
        unique_selling_points,
        target_customer,
        price_range,
        owner_first_name,
        owner_last_name,
        agent_id,
        agent_type,
        phone_number,
        trial_ends_at,
        created_at
      `)
      .eq('id', businessId)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch business data' },
        { status: 500 }
      )
    }

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Parse unique selling points if they're stored as JSON string
    let uniqueSellingPoints = business.unique_selling_points
    if (typeof uniqueSellingPoints === 'string') {
      try {
        uniqueSellingPoints = JSON.parse(uniqueSellingPoints)
      } catch {
        uniqueSellingPoints = []
      }
    }

    // Format the response data
    const responseData = {
      ...business,
      unique_selling_points: uniqueSellingPoints || [],
      // Ensure all fields have default values
      maya_job_id: business.maya_job_id || 'nail-salon-receptionist',
      brand_personality: business.brand_personality || 'professional',
      price_range: business.price_range || 'mid-range',
      agent_type: business.agent_type || 'shared-job-specific'
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = params.id
    const updates = await request.json()

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      )
    }

    // Only allow updating specific fields for security
    const allowedFields = [
      'brand_personality',
      'business_description',
      'unique_selling_points',
      'target_customer',
      'price_range'
    ]

    const sanitizedUpdates: any = {
      updated_at: new Date().toISOString()
    }

    // Only include allowed fields in the update
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        if (field === 'unique_selling_points') {
          // Ensure USPs are stored as JSON string
          sanitizedUpdates[field] = Array.isArray(updates[field]) 
            ? JSON.stringify(updates[field])
            : updates[field]
        } else {
          sanitizedUpdates[field] = updates[field]
        }
      }
    }

    const { data: business, error } = await supabase
      .from('businesses')
      .update(sanitizedUpdates)
      .eq('id', businessId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update business data' },
        { status: 500 }
      )
    }

    return NextResponse.json(business)

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}