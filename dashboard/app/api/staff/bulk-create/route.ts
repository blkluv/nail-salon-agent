import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('👥 Creating staff members:', body)

    const { business_id, staff_members } = body

    // Validate required fields
    if (!business_id || !Array.isArray(staff_members)) {
      return NextResponse.json(
        { error: 'Missing required fields: business_id and staff_members array' },
        { status: 400 }
      )
    }

    // Prepare staff data for insertion
    const staffData = staff_members.map((member: any) => ({
      business_id,
      first_name: member.firstName || 'Team',
      last_name: member.lastName || 'Member',
      email: member.email || '',
      phone: member.phone || '',
      role: member.role || 'Technician',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    // Insert staff members
    const { data: createdStaff, error: staffError } = await supabase
      .from('staff')
      .insert(staffData)
      .select()

    if (staffError) {
      console.error('❌ Failed to create staff members:', staffError)
      return NextResponse.json(
        { error: 'Failed to create staff members', details: staffError.message },
        { status: 500 }
      )
    }

    console.log('✅ Staff members created:', createdStaff.length)

    // Create staff specialties if provided
    for (let i = 0; i < staff_members.length; i++) {
      const member = staff_members[i]
      const createdMember = createdStaff[i]
      
      if (member.specialties && Array.isArray(member.specialties) && member.specialties.length > 0) {
        const specialtyData = member.specialties.map((specialty: string) => ({
          staff_id: createdMember.id,
          specialty_name: specialty,
          created_at: new Date().toISOString()
        }))

        const { error: specialtyError } = await supabase
          .from('staff_specialties')
          .insert(specialtyData)

        if (specialtyError) {
          console.error('❌ Failed to create specialties for staff', createdMember.id, ':', specialtyError)
          // Don't fail the whole request, just log the error
        }
      }

      // Create staff working hours if provided
      if (member.workingHours && typeof member.workingHours === 'object') {
        const workingHoursData = Object.entries(member.workingHours).map(([day, hours]: [string, any]) => ({
          staff_id: createdMember.id,
          day_of_week: day,
          start_time: hours.start || '09:00',
          end_time: hours.end || '17:00',
          is_available: hours.enabled ?? true,
          created_at: new Date().toISOString()
        }))

        const { error: hoursError } = await supabase
          .from('staff_working_hours')
          .insert(workingHoursData)

        if (hoursError) {
          console.error('❌ Failed to create working hours for staff', createdMember.id, ':', hoursError)
          // Don't fail the whole request, just log the error
        }
      }
    }

    return NextResponse.json({
      success: true,
      staff_created: createdStaff.length,
      message: 'Staff members created successfully and will appear in dashboard'
    })

  } catch (error) {
    console.error('❌ Staff creation failed:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}