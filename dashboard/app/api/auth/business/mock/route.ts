import { NextRequest, NextResponse } from 'next/server'

// Mock business authentication for testing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    console.log('🧪 MOCK: Business login attempt for:', email)
    
    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Generate mock business data
    const mockBusiness = {
      id: `mock-business-${Date.now()}`,
      name: `Mock Salon (${email.split('@')[0]})`,
      email: email,
      plan: 'professional',
      phoneNumber: `+1${Math.floor(Math.random() * 900 + 100)}555${Math.floor(Math.random() * 9000 + 1000)}`,
      status: 'active'
    }
    
    console.log('✅ MOCK: Business login successful:', mockBusiness.name)

    return NextResponse.json({
      success: true,
      message: 'MOCK: Login successful',
      business: mockBusiness,
      redirectUrl: `/dashboard?business=${mockBusiness.id}`
    })

  } catch (error) {
    console.error('❌ MOCK: Login error:', error)
    return NextResponse.json(
      { error: 'MOCK: Authentication failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Mock Business Authentication',
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
}