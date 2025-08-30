import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json();

    if (!bookingData.customer_name || !bookingData.appointment_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use the demo business ID where services and data exist
    const DEMO_BUSINESS_ID = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad';
    const result = await bookAppointment(bookingData, DEMO_BUSINESS_ID);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Booking API error:', error);
    return NextResponse.json(
      { error: 'Failed to book appointment' },
      { status: 500 }
    );
  }
}

// Updated function to match the ACTUAL database schema
async function bookAppointment(args: any, businessId: string) {
  try {
    console.log('📝 Web booking - Booking appointment for business:', businessId, 'with args:', args);
    
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
      console.log('Found existing customer:', customer);
    } else {
      const [firstName, ...lastNameParts] = args.customer_name.split(' ');
      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert({
          business_id: businessId,
          first_name: firstName,
          last_name: lastNameParts.join(' ') || '',
          phone: args.customer_phone,
          email: args.customer_email || '',
          total_visits: 0,
          total_spent: 0
        })
        .select()
        .single();
        
      if (error) {
        console.error('Customer creation error:', error);
        throw error;
      }
      customer = newCustomer;
      console.log('Created new customer:', customer);
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

    console.log('Available services:', services?.length || 0);
    const service = services?.find(s => s.name.toLowerCase().includes(args.service_type?.toLowerCase() || 'manicure')) || services?.[0]
    console.log('Selected service:', service);

    // Use ULTRA MINIMAL schema - only absolutely required fields
    const appointmentData = {
      business_id: businessId,
      customer_id: customer.id,
      appointment_date: args.appointment_date,
      start_time: args.start_time,
      end_time: endTime,
      status: 'confirmed'
    }
    
    console.log('Inserting appointment with minimal data:', appointmentData);

    // Book appointment with absolute minimal schema
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();
        
    if (error) {
      console.error('Appointment creation error:', error);
      throw error;
    }
    
    console.log('Created appointment:', appointment);
    
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