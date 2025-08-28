import { NextRequest, NextResponse } from 'next/server'

// This endpoint will be called from the public onboarding form
// It triggers the complete automated setup process

interface OnboardingRequest {
  // Business Details
  businessName: string
  businessType: 'nail_salon' | 'spa' | 'beauty_salon' | 'barbershop'
  
  // Owner Details
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  
  // Business Info
  address?: string
  city?: string
  state?: string
  zipCode?: string
  
  // Plan Selection
  plan: 'starter' | 'professional' | 'business' | 'enterprise'
  
  // Services (optional)
  services?: string[]
  
  // Marketing
  howDidYouHear?: string
  marketingOptIn?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: OnboardingRequest = await request.json()
    
    // Validate required fields
    const requiredFields = ['businessName', 'ownerName', 'ownerEmail', 'plan']
    const missingFields = requiredFields.filter(field => !body[field as keyof OnboardingRequest])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    console.log('🚀 Starting complete onboarding automation for:', body.businessName)

    // Call the provisioning API to set up everything
    const provisionResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/api/admin/provision-client`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: body.businessName,
          ownerName: body.ownerName,
          ownerEmail: body.ownerEmail,
          phone: body.ownerPhone,
          plan: body.plan,
          address: body.address ? `${body.address}, ${body.city}, ${body.state} ${body.zipCode}`.trim() : undefined,
          services: body.services || getDefaultServices(body.businessType)
        })
      }
    )

    if (!provisionResponse.ok) {
      const error = await provisionResponse.json()
      console.error('❌ Provisioning failed:', error)
      return NextResponse.json(
        { 
          error: 'Setup failed', 
          details: error.error,
          message: 'We encountered an issue setting up your account. Please try again or contact support.' 
        },
        { status: 500 }
      )
    }

    const provisionData = await provisionResponse.json()
    console.log('✅ Provisioning completed:', provisionData.data)

    // Send welcome email with credentials and setup info
    await sendWelcomeEmail(body, provisionData.data)

    // Track onboarding completion
    await trackOnboardingMetrics(body, provisionData.data)

    return NextResponse.json({
      success: true,
      message: 'Welcome to DropFly AI! Your salon is now set up with AI-powered booking.',
      data: {
        businessId: provisionData.data.businessId,
        businessName: body.businessName,
        phoneNumber: provisionData.data.phoneNumber,
        dashboardUrl: provisionData.data.dashboardUrl,
        plan: body.plan,
        setup: {
          voiceAI: '✅ AI phone assistant active',
          dashboard: '✅ Management dashboard ready', 
          analytics: '✅ Real-time analytics enabled',
          payments: body.plan !== 'starter' ? '✅ Payment processing ready' : '❌ Upgrade to Professional for payments',
          loyalty: body.plan !== 'starter' ? '✅ Loyalty program active' : '❌ Upgrade to Professional for loyalty'
        }
      }
    })

  } catch (error) {
    console.error('❌ Onboarding automation error:', error)
    return NextResponse.json(
      { 
        error: 'Onboarding failed',
        message: 'We apologize for the inconvenience. Please contact our support team for assistance.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function getDefaultServices(businessType: string): string[] {
  switch (businessType) {
    case 'nail_salon':
      return [
        'Basic Manicure',
        'Gel Manicure', 
        'Pedicure',
        'Nail Art',
        'Dip Powder Nails'
      ]
    case 'spa':
      return [
        'Facial Treatment',
        'Deep Tissue Massage',
        'Body Wrap',
        'Aromatherapy',
        'Hot Stone Massage'
      ]
    case 'beauty_salon':
      return [
        'Haircut & Style',
        'Hair Color',
        'Highlights',
        'Blowout',
        'Hair Treatment'
      ]
    case 'barbershop':
      return [
        'Men\'s Haircut',
        'Beard Trim',
        'Hot Towel Shave',
        'Mustache Trim',
        'Hair Wash & Style'
      ]
    default:
      return [
        'Service 1',
        'Service 2',
        'Service 3'
      ]
  }
}

async function sendWelcomeEmail(onboardingData: OnboardingRequest, provisionData: any) {
  try {
    console.log('📧 Sending welcome email to:', onboardingData.ownerEmail)
    
    // TODO: Implement email service (SendGrid, Resend, etc.)
    // For now, just log the email content
    
    const emailContent = {
      to: onboardingData.ownerEmail,
      subject: `Welcome to DropFly AI - Your ${onboardingData.businessName} is Ready!`,
      html: `
        <h1>🎉 Welcome to DropFly AI!</h1>
        <p>Hi ${onboardingData.ownerName},</p>
        
        <p>Your ${onboardingData.businessName} is now powered by AI! Here's what's been set up for you:</p>
        
        <h2>📞 Your AI Phone Assistant</h2>
        <ul>
          <li><strong>Phone Number:</strong> ${provisionData.phoneNumber}</li>
          <li><strong>Status:</strong> Active and ready to take bookings 24/7</li>
          <li><strong>Features:</strong> Appointment booking, customer service, availability checking</li>
        </ul>
        
        <h2>📊 Your Management Dashboard</h2>
        <ul>
          <li><strong>Dashboard URL:</strong> <a href="${provisionData.dashboardUrl}">${provisionData.dashboardUrl}</a></li>
          <li><strong>Login:</strong> Use this email (${onboardingData.ownerEmail})</li>
          <li><strong>Features:</strong> Real-time analytics, appointment management, customer insights</li>
        </ul>
        
        <h2>💳 Your Plan: ${onboardingData.plan.charAt(0).toUpperCase() + onboardingData.plan.slice(1)}</h2>
        <p>You have access to all ${onboardingData.plan} features. You can upgrade anytime from your dashboard.</p>
        
        <h2>🚀 Next Steps</h2>
        <ol>
          <li>Test your AI assistant by calling ${provisionData.phoneNumber}</li>
          <li>Log into your dashboard: <a href="${provisionData.dashboardUrl}">Click here</a></li>
          <li>Customize your services and business hours</li>
          <li>Start promoting your new AI-powered booking system!</li>
        </ol>
        
        <p>Questions? Reply to this email or visit our help center.</p>
        
        <p>Welcome to the future of beauty business management!</p>
        <p>The DropFly AI Team</p>
      `
    }
    
    console.log('📧 Welcome email prepared (email service not yet configured):', emailContent.subject)
    
    // TODO: Send actual email
    // await emailService.send(emailContent)
    
  } catch (error) {
    console.error('❌ Welcome email failed:', error)
    // Don't fail the whole onboarding for email issues
  }
}

async function trackOnboardingMetrics(onboardingData: OnboardingRequest, provisionData: any) {
  try {
    // TODO: Track metrics for business intelligence
    console.log('📈 Tracking onboarding metrics:', {
      businessType: onboardingData.businessType,
      plan: onboardingData.plan,
      howDidYouHear: onboardingData.howDidYouHear,
      timestamp: new Date().toISOString()
    })
    
    // TODO: Send to analytics service (PostHog, Mixpanel, etc.)
    
  } catch (error) {
    console.error('❌ Metrics tracking failed:', error)
    // Don't fail onboarding for tracking issues
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Automated Onboarding API',
    status: 'healthy',
    description: 'Handles complete client setup automation',
    timestamp: new Date().toISOString()
  })
}