import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client for middleware
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl
  
  // Skip middleware for API routes, static files, and internal Next.js paths
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/static') ||
    url.pathname.includes('.') ||
    hostname.includes('localhost') ||
    hostname.includes('vercel.app') ||
    hostname.includes('dropfly.ai')
  ) {
    return NextResponse.next()
  }

  try {
    // Check if this is a white-label domain
    const { data: whiteLabelConfig, error } = await supabase
      .rpc('get_white_label_config', { p_domain: hostname })
      .single()

    if (error || !whiteLabelConfig) {
      // Not a white-label domain, proceed normally
      return NextResponse.next()
    }

    // This is a white-label domain
    const response = NextResponse.next()
    
    // Set headers to identify white-label context
    response.headers.set('x-white-label-domain', hostname)
    response.headers.set('x-white-label-business-id', (whiteLabelConfig as any)?.business_id || '')
    response.headers.set('x-white-label-config', JSON.stringify((whiteLabelConfig as any)?.config))
    
    // Set custom CSS variables for theming
    const branding = (whiteLabelConfig as any)?.config?.branding
    if (branding) {
      response.headers.set('x-white-label-primary-color', branding.colors?.primary || '#8b5cf6')
      response.headers.set('x-white-label-secondary-color', branding.colors?.secondary || '#ec4899')
      response.headers.set('x-white-label-accent-color', branding.colors?.accent || '#f59e0b')
      response.headers.set('x-white-label-font-family', branding.font_family || 'Inter')
      response.headers.set('x-white-label-platform-name', branding.platform_name || 'Booking Platform')
    }

    // Handle specific white-label routes
    if (url.pathname === '/') {
      // Redirect to white-label customer portal
      return NextResponse.rewrite(new URL('/customer/portal', request.url))
    }

    if (url.pathname.startsWith('/dashboard')) {
      // Only allow access if white-label dashboard is enabled
      if (!(whiteLabelConfig as any)?.config?.features?.white_label_dashboard) {
        return NextResponse.redirect(new URL('/customer/portal', request.url))
      }
    }

    return response
    
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
}