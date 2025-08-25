// Test Web Booking on Tuesday (when business is open)
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const BUSINESS_ID = process.env.NEXT_PUBLIC_DEMO_BUSINESS_ID || '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad';

// Same booking functions from before
async function checkAvailability(args, businessId) {
  try {
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
    
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('start_time, duration_minutes')
      .eq('business_id', businessId)
      .eq('appointment_date', args.preferred_date)
      .neq('status', 'cancelled');
        
    if (appointmentsError) {
      return { available: false, message: 'Error checking appointments', available_times: [] };
    }
    
    const availableSlots = [];
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
    return { 
      available: false, 
      message: 'Sorry, I had trouble checking availability. Please try again.',
      available_times: []
    };
  }
}

async function bookAppointment(args, businessId) {
  try {
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
    
    // Book appointment
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        business_id: businessId,
        customer_id: customer.id,
        appointment_date: args.appointment_date,
        start_time: args.start_time,
        duration_minutes: args.service_duration || 60,
        customer_name: args.customer_name,
        customer_phone: args.customer_phone,
        customer_email: args.customer_email,
        booking_source: args.booking_source || 'web',
        status: 'scheduled',
        service_type: args.service_type || 'manicure'
      })
      .select()
      .single();
        
    if (error) throw error;
    
    return {
      success: true,
      booking_id: appointment.id,
      message: `Perfect! Your appointment is booked for ${args.appointment_date} at ${args.start_time}.`
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Sorry, I had trouble booking your appointment.' 
    };
  }
}

async function testWebBookingTuesday() {
  console.log('🌐 Testing Web Booking on Tuesday (Open Day)...\n');
  
  try {
    // Get next Tuesday
    const today = new Date();
    let tuesday = new Date(today);
    
    // Find next Tuesday (day 2)
    while (tuesday.getDay() !== 2) {
      tuesday.setDate(tuesday.getDate() + 1);
    }
    
    const testDate = tuesday.toISOString().split('T')[0];
    console.log(`Testing for: ${tuesday.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`);
    
    // Test availability
    console.log('1. Testing availability on Tuesday...');
    const availabilityResult = await checkAvailability({
      preferred_date: testDate,
      service_type: 'manicure'
    }, BUSINESS_ID);
    
    if (availabilityResult.available) {
      console.log(`✅ PASS - Availability found on Tuesday`);
      console.log(`   ${availabilityResult.message}`);
      console.log(`   Business hours: ${availabilityResult.business_hours}`);
      console.log(`   Available times: ${availabilityResult.available_times.slice(0, 5).join(', ')}${availabilityResult.available_times.length > 5 ? '...' : ''}`);
      
      // Test booking
      console.log('\n2. Testing booking on Tuesday...');
      const bookingResult = await bookAppointment({
        customer_name: 'WebTest Tuesday',
        customer_phone: '555-TUE-TEST',
        customer_email: 'tuesday.test@example.com',
        appointment_date: testDate,
        start_time: availabilityResult.available_times[0],
        service_type: 'manicure',
        booking_source: 'web-tuesday-test',
        service_duration: 60
      }, BUSINESS_ID);
      
      if (bookingResult.success) {
        console.log('✅ PASS - Tuesday booking successful');
        console.log(`   Booking ID: ${bookingResult.booking_id}`);
        console.log(`   Time: ${availabilityResult.available_times[0]}`);
        
        // Verify booking
        console.log('\n3. Verifying booking in database...');
        const { data: appointments } = await supabase
          .from('appointments')
          .select('id, customer_name, appointment_date, start_time, booking_source, status')
          .eq('business_id', BUSINESS_ID)
          .eq('booking_source', 'web-tuesday-test')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (appointments && appointments.length > 0) {
          const apt = appointments[0];
          console.log('✅ PASS - Booking verified in database');
          console.log(`   Customer: ${apt.customer_name}`);
          console.log(`   Date: ${apt.appointment_date} at ${apt.start_time}`);
          console.log(`   Source: ${apt.booking_source}`);
        }
      } else {
        console.log('❌ FAIL - Booking failed');
        console.log(`   Error: ${bookingResult.error}`);
      }
    } else {
      console.log(`❌ FAIL - No availability on Tuesday`);
      console.log(`   ${availabilityResult.message}`);
    }
    
    console.log('\n🎉 Web Booking Tuesday Test: COMPLETED');
    
  } catch (error) {
    console.log('❌ FAIL - Unexpected error:', error.message);
  }
}

testWebBookingTuesday();