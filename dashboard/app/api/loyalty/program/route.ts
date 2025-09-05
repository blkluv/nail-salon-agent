import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('🎯 Creating loyalty program:', body)

    const {
      business_id,
      name,
      points_per_dollar,
      bonus_points_per_visit,
      is_active,
      tiers,
      rewards
    } = body

    // Validate required fields
    if (!business_id || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: business_id and name' },
        { status: 400 }
      )
    }

    // Check if loyalty program already exists for this business
    const { data: existingProgram } = await supabase
      .from('loyalty_programs')
      .select('id')
      .eq('business_id', business_id)
      .single()

    if (existingProgram) {
      return NextResponse.json(
        { error: 'Loyalty program already exists for this business' },
        { status: 409 }
      )
    }

    // Create loyalty program
    const { data: program, error: programError } = await supabase
      .from('loyalty_programs')
      .insert({
        business_id,
        name,
        points_per_dollar: points_per_dollar || 1,
        bonus_points_per_visit: bonus_points_per_visit || 10,
        is_active: is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (programError) {
      console.error('❌ Failed to create loyalty program:', programError)
      return NextResponse.json(
        { error: 'Failed to create loyalty program', details: programError.message },
        { status: 500 }
      )
    }

    console.log('✅ Loyalty program created:', program.id)

    // Create loyalty tiers (if provided)
    if (tiers && Array.isArray(tiers)) {
      const tierData = tiers.map((tier, index) => ({
        loyalty_program_id: program.id,
        name: tier.name,
        minimum_points: tier.requirement || (index * 500), // Default progression: 0, 500, 1000, 1500
        benefits: Array.isArray(tier.benefits) ? tier.benefits : [tier.benefits].filter(Boolean),
        tier_order: index,
        created_at: new Date().toISOString()
      }))

      const { error: tiersError } = await supabase
        .from('loyalty_tiers')
        .insert(tierData)

      if (tiersError) {
        console.error('❌ Failed to create loyalty tiers:', tiersError)
        // Don't fail the whole request, just log the error
      } else {
        console.log('✅ Loyalty tiers created:', tierData.length)
      }
    }

    // Create loyalty rewards (if provided)
    if (rewards && Array.isArray(rewards)) {
      const rewardData = rewards.map(reward => ({
        loyalty_program_id: program.id,
        name: reward.reward || `Reward for ${reward.points} points`,
        points_required: reward.points,
        description: reward.reward,
        is_active: true,
        created_at: new Date().toISOString()
      }))

      const { error: rewardsError } = await supabase
        .from('loyalty_rewards')
        .insert(rewardData)

      if (rewardsError) {
        console.error('❌ Failed to create loyalty rewards:', rewardsError)
        // Don't fail the whole request, just log the error
      } else {
        console.log('✅ Loyalty rewards created:', rewardData.length)
      }
    }

    return NextResponse.json({
      success: true,
      program_id: program.id,
      message: 'Loyalty program created successfully and will appear in dashboard'
    })

  } catch (error) {
    console.error('❌ Loyalty program creation failed:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const business_id = searchParams.get('business_id')

    if (!business_id) {
      return NextResponse.json(
        { error: 'Missing business_id parameter' },
        { status: 400 }
      )
    }

    // Get loyalty program with tiers and rewards
    const { data: program, error: programError } = await supabase
      .from('loyalty_programs')
      .select(`
        *,
        loyalty_tiers(*),
        loyalty_rewards(*)
      `)
      .eq('business_id', business_id)
      .single()

    if (programError) {
      if (programError.code === 'PGRST116') {
        // No program found
        return NextResponse.json({ program: null })
      }
      
      console.error('❌ Failed to get loyalty program:', programError)
      return NextResponse.json(
        { error: 'Failed to get loyalty program', details: programError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ program })

  } catch (error) {
    console.error('❌ Get loyalty program failed:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}