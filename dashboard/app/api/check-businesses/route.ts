import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Get all businesses
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('id, name, email, phone, created_at, subscription_tier')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      count: businesses?.length || 0,
      businesses: businesses || []
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as any).message
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email parameter required'
      }, { status: 400 })
    }

    // Delete business by email
    const { data, error } = await supabase
      .from('businesses')
      .delete()
      .eq('email', email)
      .select()

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${data?.length || 0} business(es) with email: ${email}`,
      deleted: data
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as any).message
    }, { status: 500 })
  }
}