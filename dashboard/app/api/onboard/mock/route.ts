import { NextRequest, NextResponse } from 'next/server'

// Mock API for testing frontend automation flow
// This simulates the complete onboarding process without hitting real Vapi/backend

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('🧪 MOCK: Automated onboarding test for:', body.businessName)
    
    // Simulate processing time (real provisioning takes ~30 seconds)
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Generate mock data that looks like real provisioning
    const mockBusinessId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const mockPhoneNumber = `+1${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 9000 + 1000)}`
    const mockAssistantId = `asst_${Math.random().toString(36).substr(2, 24)}`
    
    console.log('✅ MOCK: Client provisioning completed')
    console.log(`📞 MOCK: Phone Number: ${mockPhoneNumber}`)
    console.log(`🤖 MOCK: Assistant ID: ${mockAssistantId}`)
    console.log(`🏢 MOCK: Business ID: ${mockBusinessId}`)
    
    return NextResponse.json({
      success: true,
      message: '🧪 MOCK: Welcome to DropFly AI! Your salon is now set up with AI-powered booking.',
      data: {
        businessId: mockBusinessId,
        businessName: body.businessName,
        phoneNumber: mockPhoneNumber,
        assistantId: mockAssistantId,
        dashboardUrl: `${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3001'}/login?business=${mockBusinessId}`,
        plan: body.plan,
        setup: {
          voiceAI: '✅ AI phone assistant active (MOCK)',
          dashboard: '✅ Management dashboard ready (MOCK)', 
          analytics: '✅ Real-time analytics enabled (MOCK)',
          payments: body.plan !== 'starter' ? '✅ Payment processing ready (MOCK)' : '❌ Upgrade to Professional for payments',
          loyalty: body.plan !== 'starter' ? '✅ Loyalty program active (MOCK)' : '❌ Upgrade to Professional for loyalty'
        }
      }
    })

  } catch (error) {
    console.error('❌ MOCK: Onboarding test failed:', error)
    return NextResponse.json(
      { 
        error: 'MOCK: Onboarding test failed',
        message: 'Mock test error - check console for details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Mock Automated Onboarding API',
    status: 'healthy',
    description: 'Testing frontend automation flow with mock responses',
    timestamp: new Date().toISOString()
  })
}