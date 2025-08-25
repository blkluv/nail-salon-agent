// Test Web Booking on Wednesday (definitely open)
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const BUSINESS_ID = process.env.NEXT_PUBLIC_DEMO_BUSINESS_ID || '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad';

// Same booking functions as before
async function checkAvailability(args, businessId) {
  try {
    const requestedDate = new Date(args.preferred_date);
    const dayOfWeek = requestedDate.getDay();
    
    console.log(`   Date: ${requestedDate.toLocaleDateString()}, Day of week: ${dayOfWeek} (0=Sunday, 1=Monday, 2=Tuesday, etc.)`);
    
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
        status: 'scheduled'
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

async function testWednesday() {
  console.log('🌐 Testing Web Booking on Wednesday...\n');
  
  // Hardcode Wednesday date
  const testDate = '2025-08-27'; // This is Wednesday
  
  console.log('1. Testing availability on Wednesday...');
  const availabilityResult = await checkAvailability({
    preferred_date: testDate,
    service_type: 'manicure'
  }, BUSINESS_ID);
  
  if (availabilityResult.available) {
    console.log(`✅ PASS - Availability found on Wednesday`);
    console.log(`   ${availabilityResult.message}`);
    console.log(`   Business hours: ${availabilityResult.business_hours}`);
    console.log(`   Available times: ${availabilityResult.available_times.slice(0, 5).join(', ')}`);
    
    // Test booking
    console.log('\n2. Testing booking on Wednesday...');
    const bookingResult = await bookAppointment({
      customer_name: 'WebTest Wednesday',
      customer_phone: '555-WED-TEST',
      customer_email: 'wednesday.test@example.com',
      appointment_date: testDate,
      start_time: availabilityResult.available_times[0],
      service_type: 'manicure',
      booking_source: 'web-wednesday-test',
      service_duration: 60
    }, BUSINESS_ID);
    
    if (bookingResult.success) {
      console.log('✅ PASS - Web booking system working completely');
      console.log(`   Booking ID: ${bookingResult.booking_id}`);
    } else {
      console.log('❌ FAIL - Booking failed');
      console.log(`   Error: ${bookingResult.error}`);
    }
  } else {
    console.log(`❌ No availability: ${availabilityResult.message}`);
  }
  
  console.log('\n🎉 Web Booking Wednesday Test: COMPLETED');
}

testWednesday();