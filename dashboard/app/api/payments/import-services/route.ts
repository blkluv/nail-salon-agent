import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { businessId, processor, apiKey, squareAccessToken } = await request.json()

    if (!businessId || !processor) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify business exists
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single()

    if (businessError || !business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    let importedServices: any[] = []

    if (processor === 'stripe') {
      importedServices = await importFromStripe(apiKey || process.env.STRIPE_SECRET_KEY!)
    } else if (processor === 'square') {
      importedServices = await importFromSquare(squareAccessToken || process.env.SQUARE_ACCESS_TOKEN!)
    } else {
      return NextResponse.json(
        { error: 'Unsupported processor' },
        { status: 400 }
      )
    }

    // Check for existing services to avoid duplicates
    const { data: existingServices } = await supabase
      .from('services')
      .select('name')
      .eq('business_id', businessId)

    const existingNames = new Set(existingServices?.map(s => s.name.toLowerCase()) || [])
    
    // Filter out duplicates and prepare for insertion
    const newServices = importedServices
      .filter(service => !existingNames.has(service.name.toLowerCase()))
      .map(service => ({
        id: crypto.randomUUID(),
        business_id: businessId,
        name: service.name,
        description: service.description || `Professional ${service.name} service`,
        duration_minutes: service.duration || estimateDuration(service.name),
        base_price: service.price,
        category: categorizeService(service.name, business.business_type),
        is_active: true,
        imported_from: processor,
        imported_id: service.external_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

    if (newServices.length === 0) {
      return NextResponse.json({
        message: 'No new services to import - all services already exist',
        imported: 0,
        skipped: importedServices.length
      })
    }

    // Insert new services
    const { data: inserted, error: insertError } = await supabase
      .from('services')
      .insert(newServices)
      .select()

    if (insertError) {
      console.error('Service insertion error:', insertError)
      return NextResponse.json(
        { error: 'Failed to import services', details: insertError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${newServices.length} services from ${processor}`,
      imported: newServices.length,
      skipped: importedServices.length - newServices.length,
      services: inserted
    })

  } catch (error) {
    console.error('Import services error:', error)
    return NextResponse.json(
      { error: 'Import failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function importFromStripe(apiKey: string): Promise<any[]> {
  const stripe = new Stripe(apiKey, { apiVersion: '2025-08-27.basil' })
  
  const services: any[] = []
  
  try {
    // Fetch all active products
    const products = await stripe.products.list({
      active: true,
      limit: 100
    })

    // Fetch all active prices
    const prices = await stripe.prices.list({
      active: true,
      limit: 100
    })

    // Map products to services
    for (const product of products.data) {
      // Skip if it's not a service (check metadata or type)
      if (product.type === 'good') continue

      // Find associated price
      const price = prices.data.find(p => p.product === product.id)
      
      if (!price || !price.unit_amount) continue

      services.push({
        external_id: product.id,
        name: product.name,
        description: product.description,
        price: price.unit_amount / 100, // Convert from cents
        duration: parseInt(product.metadata?.duration || '60'), // Look for duration in metadata
        category: product.metadata?.category
      })
    }

    console.log(`Found ${services.length} services in Stripe`)
    return services

  } catch (error) {
    console.error('Stripe import error:', error)
    throw error
  }
}

async function importFromSquare(accessToken: string): Promise<any[]> {
  const services: any[] = []
  
  try {
    // Square API endpoint
    const response = await fetch('https://connect.squareup.com/v2/catalog/list?types=ITEM', {
      headers: {
        'Square-Version': '2024-01-18',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Square API error: ${response.statusText}`)
    }

    const data = await response.json()

    // Process Square catalog items
    for (const object of data.objects || []) {
      if (object.type !== 'ITEM' || !object.item_data) continue

      // Skip if it's a product, not a service
      if (object.item_data.product_type === 'REGULAR') continue

      // Get the first variation for pricing
      const variation = object.item_data.variations?.[0]
      if (!variation?.item_variation_data?.price_money) continue

      const price = variation.item_variation_data.price_money.amount / 100

      services.push({
        external_id: object.id,
        name: object.item_data.name,
        description: object.item_data.description,
        price: price,
        duration: extractDurationFromName(object.item_data.name) || 60,
        category: object.item_data.category?.name
      })
    }

    console.log(`Found ${services.length} services in Square`)
    return services

  } catch (error) {
    console.error('Square import error:', error)
    throw error
  }
}

// Helper function to estimate service duration based on name
function estimateDuration(serviceName: string): number {
  const name = serviceName.toLowerCase()
  
  // Quick services (30 minutes)
  if (name.includes('polish') || name.includes('quick') || name.includes('express')) {
    return 30
  }
  
  // Medium services (60 minutes)
  if (name.includes('manicure') || name.includes('pedicure') || name.includes('facial') || 
      name.includes('massage') || name.includes('haircut') || name.includes('blowout')) {
    return 60
  }
  
  // Long services (90+ minutes)
  if (name.includes('full set') || name.includes('extensions') || name.includes('color') || 
      name.includes('highlights') || name.includes('treatment') || name.includes('package')) {
    return 90
  }
  
  // Complex services (120+ minutes)
  if (name.includes('balayage') || name.includes('keratin') || name.includes('perm') || 
      name.includes('complete') || name.includes('deluxe')) {
    return 120
  }
  
  // Default to 60 minutes
  return 60
}

// Helper function to extract duration from service name (e.g., "60 min Massage")
function extractDurationFromName(name: string): number | null {
  const match = name.match(/(\d+)\s*(min|minute|hr|hour)/i)
  if (match) {
    const value = parseInt(match[1])
    const unit = match[2].toLowerCase()
    if (unit.startsWith('hr') || unit.startsWith('hour')) {
      return value * 60
    }
    return value
  }
  return null
}

// Helper function to categorize services based on name and business type
function categorizeService(serviceName: string, businessType: string): string {
  const name = serviceName.toLowerCase()
  
  if (businessType === 'nail_salon') {
    if (name.includes('manicure')) return 'manicure'
    if (name.includes('pedicure')) return 'pedicure'
    if (name.includes('acrylic') || name.includes('gel') || name.includes('dip')) return 'nail_enhancement'
    if (name.includes('art') || name.includes('design')) return 'nail_art'
    return 'nail_service'
  }
  
  if (businessType === 'hair_salon') {
    if (name.includes('cut') || name.includes('trim')) return 'haircut'
    if (name.includes('color') || name.includes('highlight') || name.includes('balayage')) return 'color'
    if (name.includes('style') || name.includes('blowout') || name.includes('updo')) return 'styling'
    if (name.includes('treatment') || name.includes('keratin') || name.includes('conditioning')) return 'treatment'
    return 'hair_service'
  }
  
  if (businessType === 'spa' || businessType === 'day_spa') {
    if (name.includes('massage')) return 'massage'
    if (name.includes('facial')) return 'facial'
    if (name.includes('body') || name.includes('wrap') || name.includes('scrub')) return 'body_treatment'
    if (name.includes('wax')) return 'waxing'
    return 'spa_service'
  }
  
  // Default category based on keywords
  if (name.includes('consultation')) return 'consultation'
  if (name.includes('package') || name.includes('combo')) return 'package'
  
  return 'general_service'
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Service import endpoint',
    supportedProcessors: ['stripe', 'square'],
    usage: 'POST with { businessId, processor, apiKey/squareAccessToken }'
  })
}