import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const sessionId = searchParams.get('session_id')
  const businessId = searchParams.get('business_id')
  
  if (!sessionId || !businessId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }
  
  try {
    console.log('✅ Processing successful checkout:', { sessionId, businessId })
    
    // You could verify the session with Stripe here for extra security
    // const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    // Redirect to billing page with success message
    return NextResponse.redirect(
      new URL(`/dashboard/billing?success=true&session=${sessionId}`, request.url)
    )
    
  } catch (error) {
    console.error('❌ Error processing checkout success:', error)
    return NextResponse.redirect(
      new URL('/dashboard/billing?error=processing_failed', request.url)
    )
  }
}