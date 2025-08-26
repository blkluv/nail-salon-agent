import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { business_id, preferred_date, service_type } = await request.json();

    if (!business_id || !preferred_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use the same availability checking logic as voice/SMS
    const result = await checkAvailability(
      { preferred_date, service_type }, 
      business_id
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Availability check API error:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}

// Reuse the exact same function from webhook-server.js
async function checkAvailability(args: any, businessId: string) {
  try {
    console.log('📅 Web booking - Checking availability for:', args);
    
    // Get business hours for the requested date
    const requestedDate = new Date(args.preferred_date);
    const dayOfWeek = requestedDate.getDay();
    
    const { data: hours, error: hoursError } = await supabase
      .from('business_hours')
      .select('*')
      .eq('business_id', businessId)
      .eq('day_of_week', dayOfWeek)
      .single();
        
    if (hoursError || !hours || hours.is_closed) {
      return { 
        available: false, 
        message: `Sorry, we're closed on ${requestedDate.toLocaleDateString('en-US', { weekday: 'long' })}.`,
        available_times: []
      };
    }
    
    // Check existing appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('start_time, duration_minutes')
      .eq('business_id', businessId)
      .eq('appointment_date', args.preferred_date)
      .neq('status', 'cancelled');
        
    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
      return { available: false, message: 'Error checking appointments', available_times: [] };
    }
    
    // Generate available slots
    const availableSlots: string[] = [];
    const openTime = parseInt(hours.open_time.split(':')[0]);
    const closeTime = parseInt(hours.close_time.split(':')[0]);
    
    for (let hour = openTime; hour < closeTime - 1; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      const isBooked = appointments?.some(apt => apt.start_time === timeSlot);
      
      if (!isBooked) {
        availableSlots.push(timeSlot);
      }
    }
    
    return {
      available: availableSlots.length > 0,
      date: args.preferred_date,
      available_times: availableSlots,
      business_hours: `${hours.open_time} - ${hours.close_time}`,
      message: availableSlots.length > 0 
        ? `We have ${availableSlots.length} available slots on ${requestedDate.toLocaleDateString()}.`
        : `Sorry, no availability on ${requestedDate.toLocaleDateString()}.`
    };
    
  } catch (error) {
    console.error('Availability check error:', error);
    return { 
      available: false, 
      message: 'Sorry, I had trouble checking availability. Please try again.',
      available_times: []
    };
  }
}