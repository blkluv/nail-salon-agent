import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { BusinessDiscoveryService } from '../../../lib/business-discovery';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json();

    if (!bookingData.customer_name || !bookingData.appointment_date || !bookingData.customer_phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use business_id from request, or discover from phone number
    let businessId = bookingData.business_id;
    
    if (!businessId) {
      // Discover business for phone number (fallback for legacy API calls)
      const businesses = await BusinessDiscoveryService.discoverBusinessesForPhone(bookingData.customer_phone);
      if (businesses.length === 0) {
        return NextResponse.json(
          { error: 'No salon found for this phone number. Please contact your salon to register.' },
          { status: 400 }
        );
      }
      // Use preferred business or first one found
      const preferredBusiness = businesses.find(b => b.is_preferred) || businesses[0];
      businessId = preferredBusiness.business_id;
    }

    const result = await bookAppointment(bookingData, businessId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Booking API error:', error);
    return NextResponse.json(
      { error: 'Failed to book appointment' },
      { status: 500 }
    );
  }
}

// Updated function to use business discovery service
async function bookAppointment(args: any, businessId: string) {
  try {
    console.log('📝 Web booking - Booking appointment for business:', businessId, 'with args:', args);
    
    // Use business discovery service to get or create customer
    const customer = await BusinessDiscoveryService.getOrCreateCustomerForBusiness(
      args.customer_phone,
      businessId,
      {
        first_name: args.customer_name,
        email: args.customer_email
      }
    );
    
    if (!customer) {
      throw new Error('Failed to create or find customer');
    }
    
    console.log('Using customer:', customer);
    
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