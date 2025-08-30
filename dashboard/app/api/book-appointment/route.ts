import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json();

    if (!bookingData.business_id || !bookingData.customer_name || !bookingData.appointment_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use the same booking logic as voice/SMS
    const result = await bookAppointment(bookingData, bookingData.business_id);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Booking API error:', error);
    return NextResponse.json(
      { error: 'Failed to book appointment' },
      { status: 500 }
    );
  }
}

// Reuse the exact same function from webhook-server.js
async function bookAppointment(args: any, businessId: string) {
  try {
    console.log('📝 Web booking - Booking appointment:', args);
    
    // Create or get customer
    let customer;
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('*')
      .eq('business_id', businessId)
      .eq('phone', args.customer_phone)
      .single();
        
    if (existingCustomer) {
      customer = existingCustomer;
    } else {
      const [firstName, ...lastNameParts] = args.customer_name.split(' ');
      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert({
          business_id: businessId,
          first_name: firstName,
          last_name: lastNameParts.join(' ') || '',
          phone: args.customer_phone,
          email: args.customer_email
        })
        .select()
        .single();
        
      if (error) throw error;
      customer = newCustomer;
    }
    
    // Calculate end time
    const [hours, minutes] = args.start_time.split(':').map(Number)
    const startDate = new Date()
    startDate.setHours(hours, minutes, 0, 0)
    const endDate = new Date(startDate.getTime() + (args.service_duration || 60) * 60000)
    const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:00`

    // Find service ID by name (or use first available service if not found)
    const { data: services } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)

    const service = services?.find(s => s.name.toLowerCase().includes(args.service_type?.toLowerCase() || 'manicure')) || services?.[0]

    // Book appointment with correct schema
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        business_id: businessId,
        customer_id: customer.id,
        service_id: service?.id || null,
        appointment_date: args.appointment_date,
        start_time: args.start_time,
        end_time: endTime,
        status: 'confirmed',
        notes: `${args.service_type || 'Service'} booked via ${args.booking_source || 'web'}`,
        reminder_sent: false
      })
      .select()
      .single();
        
    if (error) throw error;
    
    return {
      success: true,
      booking_id: appointment.id,
      message: `Perfect! Your appointment is booked for ${args.appointment_date} at ${args.start_time}.`
    };
  } catch (error: any) {
    console.error('Booking error:', error);
    return { 
      success: false, 
      error: error.message || 'Sorry, I had trouble booking your appointment.' 
    };
  }
}