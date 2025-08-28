import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

interface LoginRequest {
  email: string
  password?: string
  businessId?: string
  magicLink?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { email, password, businessId, magicLink } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    console.log('🔐 Business login attempt for:', email)

    // Find business by owner email
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_email', email)
      .eq('status', 'active')
      .single()

    if (businessError || !business) {
      console.log('❌ Business not found for email:', email)
      return NextResponse.json(
        { error: 'Business account not found or inactive' },
        { status: 404 }
      )
    }

    // If businessId is provided, verify it matches
    if (businessId && business.id !== businessId) {
      return NextResponse.json(
        { error: 'Business ID mismatch' },
        { status: 403 }
      )
    }

    // For MVP, we'll use magic link authentication (no passwords)
    if (magicLink) {
      // Generate and send magic link
      const magicToken = jwt.sign(
        { 
          businessId: business.id,
          email: business.owner_email,
          exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
        },
        JWT_SECRET
      )

      // TODO: Send email with magic link
      // await sendMagicLinkEmail(email, magicToken)

      return NextResponse.json({
        success: true,
        message: 'Magic link sent to your email',
        // For MVP, return the token directly (remove in production)
        magicLink: `${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/auth/verify?token=${magicToken}`
      })
    }

    // Simple password-less login for MVP (enhance in production)
    if (!password) {
      // Auto-login for MVP - generate session token
      const sessionToken = jwt.sign(
        {
          businessId: business.id,
          businessName: business.name,
          email: business.owner_email,
          plan: business.plan_tier,
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
        },
        JWT_SECRET
      )

      // Set HTTP-only cookie
      const cookieStore = cookies()
      cookieStore.set('business_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      })

      console.log('✅ Business login successful:', business.name)

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        business: {
          id: business.id,
          name: business.name,
          email: business.owner_email,
          plan: business.plan_tier,
          phoneNumber: business.vapi_phone_number,
          status: business.status
        },
        redirectUrl: `/dashboard?business=${business.id}`
      })
    }

    // Password authentication (for future enhancement)
    // TODO: Implement bcrypt password verification
    return NextResponse.json(
      { error: 'Password authentication not implemented yet' },
      { status: 501 }
    )

  } catch (error) {
    console.error('❌ Login error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is already logged in
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('business_session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(sessionToken, JWT_SECRET) as any
    
    // Verify business still exists and is active
    const { data: business, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', decoded.businessId)
      .eq('status', 'active')
      .single()

    if (error || !business) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      business: {
        id: business.id,
        name: business.name,
        email: business.owner_email,
        plan: business.plan_tier,
        phoneNumber: business.vapi_phone_number,
        status: business.status
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Session verification failed' },
      { status: 401 }
    )
  }
}