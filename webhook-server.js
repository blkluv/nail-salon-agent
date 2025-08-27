#!/usr/bin/env node

/**
 * Simple Webhook Server for Vapi Assistant
 * Handles booking functions and connects to Supabase
 */

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Default business ID for demo
const DEFAULT_BUSINESS_ID = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad';

const app = express();
const PORT = process.env.PORT || 3001;

// Debug environment variables
console.log('🔍 Environment Variables Debug:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'MISSING');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');

// Fallback environment variables for Railway
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://irvyhhkoiyzartmmvbxw.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExODI5MywiZXhwIjoyMDcwNjk0MjkzfQ.61Zfyc87GpmpIlWFL1fyX6wcfydqCu6DUFuHnpNSvhk';

console.log('📡 Using Supabase URL:', SUPABASE_URL);
console.log('🔑 Using Supabase Key:', SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING');

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Multi-tenant business ID resolution
function getBusinessIdFromCall(message) {
    // Option 1: Extract from phone number (if we map numbers to businesses)
    if (message.call && message.call.phoneNumberId) {
        // Look up which business owns this phone number
        // This would be stored in a phone_numbers table
        return lookupBusinessByPhoneId(message.call.phoneNumberId);
    }
    
    // Option 2: Default to demo business for existing setup
    return '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad';
}

async function lookupBusinessByPhoneId(phoneId) {
    try {
        const { data, error } = await supabase
            .from('phone_numbers')  // New table we'd need to create
            .select('business_id')
            .eq('vapi_phone_id', phoneId)
            .single();
            
        if (error || !data) {
            console.error('Phone lookup failed:', error);
            return '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'; // Default demo
        }
        
        return data.business_id;
    } catch (error) {
        console.error('Phone lookup error:', error);
        return '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'; // Default demo
    }
}

app.use(express.json());

// Add CORS headers for web widget
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Webhook endpoint for Vapi
app.post('/webhook/vapi', async (req, res) => {
    try {
        const { message } = req.body;
        console.log('🔔 Webhook received:', JSON.stringify(message, null, 2));

        // Handle both Vapi formats: toolCalls (plural) and functionCall (singular)
        if (message?.toolCalls) {
            // Multiple tool calls
            const results = [];
            const businessId = await getBusinessIdFromCall(message);
            
            for (const toolCall of message.toolCalls) {
                const result = await handleToolCall(toolCall, businessId);
                results.push(result);
            }

            return res.json({ results });
        }
        
        if (message?.functionCall) {
            // Single function call
            const businessId = await getBusinessIdFromCall(message);
            const result = await handleToolCall({ function: message.functionCall }, businessId);
            return res.json(result);
        }

        res.json({ status: 'received' });
    } catch (error) {
        console.error('❌ Webhook error:', error);
        res.status(500).json({ error: error.message });
    }
});

async function handleToolCall(toolCall, businessId) {
    const { function: fn } = toolCall;
    
    switch (fn.name) {
        case 'check_availability':
            return await checkAvailability(fn.arguments, businessId);
            
        case 'book_appointment':
            return await bookAppointment(fn.arguments, businessId);
            
        case 'check_appointments':
            return await checkAppointments(fn.arguments, businessId);
            
        case 'cancel_appointment':
            return await cancelAppointment(fn.arguments, businessId);
            
        default:
            return { error: `Unknown function: ${fn.name}` };
    }
}

async function checkAvailability(args, businessId) {
    const BUSINESS_ID = businessId || '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad';
    try {
        console.log('📅 Checking availability for:', JSON.stringify(args));
        
        // Validate required parameters
        if (!args.preferred_date || !args.service_type) {
            console.error('❌ Missing required parameters:', args);
            return {
                available: false,
                message: 'I need both a date and service type to check availability.'
            };
        }
        
        // Get business hours for the requested date
        const requestedDate = new Date(args.preferred_date);
        const dayOfWeek = requestedDate.getDay();
        
        console.log('🔍 Looking up hours for day:', dayOfWeek, 'Business:', BUSINESS_ID);
        
        const { data: hours, error: hoursError } = await supabase
            .from('business_hours')
            .select('*')
            .eq('business_id', BUSINESS_ID)
            .eq('day_of_week', dayOfWeek)
            .single();
            
        if (hoursError) {
            console.error('❌ Database error fetching hours:', hoursError);
            return {
                available: false,
                message: 'Sorry, I had trouble checking our hours. Please try again.'
            };
        }
            
        if (!hours || hours.is_closed) {
            return { 
                available: false, 
                message: `Sorry, we're closed on ${requestedDate.toLocaleDateString('en-US', { weekday: 'long' })}.`,
                business_hours: 'Closed'
            };
        }
        
        // Validate business hours have proper time values
        if (!hours.open_time || !hours.close_time) {
            return { 
                available: false, 
                message: `Sorry, our hours aren't set for ${requestedDate.toLocaleDateString('en-US', { weekday: 'long' })}. Please call us directly.`,
                business_hours: 'Not configured'
            };
        }
        
        // Check existing appointments
        const { data: appointments } = await supabase
            .from('appointments')
            .select('start_time, duration_minutes')
            .eq('business_id', BUSINESS_ID)
            .eq('appointment_date', args.preferred_date)
            .neq('status', 'cancelled');
            
        // Generate available slots (simplified)
        const availableSlots = [];
        const openTime = parseInt(hours.open_time.split(':')[0]);
        const closeTime = parseInt(hours.close_time.split(':')[0]);
        
        for (let hour = openTime; hour < closeTime - 1; hour++) {
            const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
            // Fix: Check both HH:MM and HH:MM:SS formats
            const isBooked = appointments?.some(apt => 
                apt.start_time === timeSlot || 
                apt.start_time === `${timeSlot}:00`
            );
            
            if (!isBooked) {
                availableSlots.push(timeSlot);
            }
        }
        
        return {
            available: true,
            date: args.preferred_date,
            available_times: availableSlots.slice(0, 5), // Show first 5 slots
            business_hours: `${hours.open_time} - ${hours.close_time}`,
            message: `We have ${availableSlots.length} available slots on ${requestedDate.toLocaleDateString()}.`
        };
        
    } catch (error) {
        console.error('❌ Error in checkAvailability:', error.message);
        console.error('Stack trace:', error.stack);
        return { 
            available: false,
            message: 'Sorry, I had trouble checking availability. Please try again.',
            error: error.message 
        };
    }
}

async function bookAppointment(args, businessId) {
    const BUSINESS_ID = businessId || '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad';
    try {
        console.log('📝 Booking appointment:', args);
        
        // Create or get customer
        let customer;
        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('*')
            .eq('business_id', BUSINESS_ID)
            .eq('phone', args.customer_phone)
            .single();
            
        if (existingCustomer) {
            customer = existingCustomer;
        } else {
            const [firstName, ...lastNameParts] = args.customer_name.split(' ');
            const { data: newCustomer, error } = await supabase
                .from('customers')
                .insert({
                    business_id: BUSINESS_ID,
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
        
        // Get service - improved matching
        const serviceCategory = args.service_type.replace(/_/g, ' ').replace('manicure', 'Manicure').replace('pedicure', 'Pedicure');
        const { data: service } = await supabase
            .from('services')
            .select('*')
            .eq('business_id', BUSINESS_ID)
            .ilike('name', `%${serviceCategory}%`)
            .limit(1)
            .single();
            
        // Book appointment
        const { data: appointment, error } = await supabase
            .from('appointments')
            .insert({
                business_id: BUSINESS_ID,
                customer_id: customer.id,
                service_id: service?.id,
                appointment_date: args.appointment_date,
                start_time: args.start_time,
                duration_minutes: args.service_duration || 60,
                customer_name: args.customer_name,
                customer_phone: args.customer_phone,
                customer_email: args.customer_email,
                booking_source: 'phone',
                status: 'scheduled'
            })
            .select()
            .single();
            
        if (error) throw error;
        
        return {
            success: true,
            booking_id: appointment.id,
            message: `Perfect! I've booked your ${args.service_type.replace('_', ' ')} appointment for ${args.appointment_date} at ${args.start_time}. You should receive a confirmation shortly.`,
            appointment: {
                id: appointment.id,
                service: args.service_type,
                date: args.appointment_date,
                time: args.start_time,
                customer: args.customer_name
            }
        };
        
    } catch (error) {
        console.error('Error booking appointment:', error);
        return { 
            success: false, 
            error: 'Sorry, I had trouble booking your appointment. Please try again or call us directly.' 
        };
    }
}

async function checkAppointments(args, businessId) {
    const BUSINESS_ID = businessId || '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad';
    try {
        console.log('🔍 Checking appointments for:', args);
        
        let query = supabase
            .from('appointments')
            .select(`
                id,
                appointment_date,
                start_time,
                status,
                customer_name,
                services(name)
            `)
            .eq('business_id', BUSINESS_ID);
            
        if (args.customer_email) {
            query = query.eq('customer_email', args.customer_email);
        }
        if (args.customer_phone) {
            query = query.eq('customer_phone', args.customer_phone);
        }
        
        const { data: appointments, error } = await query;
        
        if (error) throw error;
        
        const filteredAppointments = appointments?.filter(apt => {
            const aptDate = new Date(apt.appointment_date);
            const today = new Date();
            
            switch (args.date_range) {
                case 'upcoming':
                    return aptDate >= today && apt.status !== 'cancelled';
                case 'today':
                    return apt.appointment_date === today.toISOString().split('T')[0];
                case 'past':
                    return aptDate < today;
                default:
                    return true;
            }
        }) || [];
        
        return {
            appointments: filteredAppointments,
            count: filteredAppointments.length,
            message: `I found ${filteredAppointments.length} appointments for you.`
        };
        
    } catch (error) {
        console.error('Error checking appointments:', error);
        return { error: 'Sorry, I had trouble finding your appointments.' };
    }
}

async function cancelAppointment(args, businessId) {
    const BUSINESS_ID = businessId || '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad';
    try {
        console.log('❌ Cancelling appointment:', args);
        
        let query = supabase
            .from('appointments')
            .update({ 
                status: 'cancelled',
                internal_notes: args.cancellation_reason 
            })
            .eq('business_id', BUSINESS_ID);
            
        if (args.booking_id) {
            query = query.eq('id', args.booking_id);
        } else {
            query = query
                .eq('appointment_date', args.appointment_date)
                .eq('start_time', args.appointment_time);
                
            if (args.customer_email) query = query.eq('customer_email', args.customer_email);
            if (args.customer_phone) query = query.eq('customer_phone', args.customer_phone);
        }
        
        const { error } = await query;
        
        if (error) throw error;
        
        return {
            success: true,
            message: 'Your appointment has been successfully cancelled. We hope to see you again soon!'
        };
        
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        return { 
            success: false,
            error: 'Sorry, I had trouble cancelling your appointment. Please call us directly.' 
        };
    }
}

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Vapi Nail Salon Agent - Production Ready!',
        endpoints: {
            webhook: '/webhook/vapi',
            health: '/health'
        },
        status: 'active',
        timestamp: new Date().toISOString()
    });
});

// Web booking GET endpoint - shows booking form
app.get('/webhook/web-booking', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Quick Booking Test</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
            .form-container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h2 { color: #ff6b9d; text-align: center; }
            label { display: block; margin: 10px 0 5px; font-weight: bold; }
            input, textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 10px; }
            button { background: #ff6b9d; color: white; padding: 12px 20px; border: none; border-radius: 5px; cursor: pointer; width: 100%; font-size: 16px; }
            button:hover { background: #e55a8a; }
            .result { margin-top: 20px; padding: 10px; border-radius: 5px; }
            .success { background: #d4edda; color: #155724; }
            .error { background: #f8d7da; color: #721c24; }
        </style>
    </head>
    <body>
        <div class="form-container">
            <h2>💅 Book Your Appointment</h2>
            <form id="bookingForm">
                <label>Full Name:</label>
                <input type="text" id="name" required placeholder="John Doe">
                
                <label>Phone Number:</label>
                <input type="tel" id="phone" required placeholder="+1-555-123-4567">
                
                <label>Email (optional):</label>
                <input type="email" id="email" placeholder="john@example.com">
                
                <label>Service:</label>
                <input type="text" id="service" placeholder="Manicure" value="Manicure">
                
                <label>Date:</label>
                <input type="date" id="date" required>
                
                <label>Time:</label>
                <input type="time" id="time" required>
                
                <label>Notes (optional):</label>
                <textarea id="notes" rows="3" placeholder="Any special requests..."></textarea>
                
                <button type="submit">Book Appointment 💅</button>
            </form>
            <div id="result"></div>
        </div>
        
        <script>
            // Set default date to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            document.getElementById('date').value = tomorrow.toISOString().split('T')[0];
            document.getElementById('time').value = '14:00';
            
            document.getElementById('bookingForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = {
                    name: document.getElementById('name').value,
                    phone: document.getElementById('phone').value,
                    email: document.getElementById('email').value,
                    service: document.getElementById('service').value,
                    date: document.getElementById('date').value,
                    time: document.getElementById('time').value,
                    notes: document.getElementById('notes').value
                };
                
                const resultDiv = document.getElementById('result');
                resultDiv.innerHTML = 'Booking appointment...';
                
                try {
                    const response = await fetch('/webhook/web-booking', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok && result.success) {
                        resultDiv.className = 'result success';
                        resultDiv.innerHTML = '✅ Appointment booked successfully!<br>Appointment ID: ' + result.appointment.id;
                    } else {
                        resultDiv.className = 'result error';
                        resultDiv.innerHTML = '❌ Error: ' + (result.error || 'Unknown error');
                    }
                } catch (error) {
                    resultDiv.className = 'result error';
                    resultDiv.innerHTML = '❌ Network error: ' + error.message;
                }
            });
        </script>
    </body>
    </html>
    `);
});

// Web booking POST endpoint
app.post('/webhook/web-booking', async (req, res) => {
    try {
        console.log('🌐 Web booking request:', JSON.stringify(req.body, null, 2));
        
        const { name, phone, email, service, date, time, notes } = req.body;
        
        // Validate required fields
        if (!name || !phone || !date || !time) {
            return res.status(400).json({ 
                error: 'Missing required fields', 
                required: ['name', 'phone', 'date', 'time'] 
            });
        }
        
        // Use dropfly business ID (updated to use Twilio number)
        const businessId = 'c7f6221a-f588-43fa-a095-09151fbc41e8';
        
        // Step 1: Create or find customer
        let customerId;
        const { data: existingCustomer, error: customerFindError } = await supabase
            .from('customers')
            .select('id')
            .eq('business_id', businessId)
            .eq('phone', phone)
            .single();
            
        if (existingCustomer) {
            customerId = existingCustomer.id;
            console.log('📞 Using existing customer:', customerId);
        } else {
            // Create new customer
            const { data: newCustomer, error: customerCreateError } = await supabase
                .from('customers')
                .insert([{
                    business_id: businessId,
                    first_name: name.split(' ')[0] || name,
                    last_name: name.split(' ').slice(1).join(' ') || '',
                    email: email || null,
                    phone: phone
                }])
                .select('id')
                .single();
                
            if (customerCreateError) {
                console.error('❌ Customer creation error:', customerCreateError);
                return res.status(500).json({ 
                    error: 'Failed to create customer', 
                    details: customerCreateError.message 
                });
            }
            
            customerId = newCustomer.id;
            console.log('👤 Created new customer:', customerId);
        }
        
        // Step 2: Get default service (or create one if needed)
        let serviceId;
        const { data: existingService, error: serviceFindError } = await supabase
            .from('services')
            .select('id, duration_minutes')
            .eq('business_id', businessId)
            .eq('is_active', true)
            .limit(1)
            .single();
            
        if (existingService) {
            serviceId = existingService.id;
            console.log('💅 Using existing service:', serviceId);
        } else {
            // Create default service
            const { data: newService, error: serviceCreateError } = await supabase
                .from('services')
                .insert([{
                    business_id: businessId,
                    name: service || 'General Service',
                    category: 'general',
                    duration_minutes: 60,
                    price_cents: 5000, // $50 default
                    is_active: true
                }])
                .select('id, duration_minutes')
                .single();
                
            if (serviceCreateError) {
                console.error('❌ Service creation error:', serviceCreateError);
                return res.status(500).json({ 
                    error: 'Failed to create service', 
                    details: serviceCreateError.message 
                });
            }
            
            serviceId = newService.id;
            console.log('🆕 Created new service:', serviceId);
        }
        
        // Step 3: Calculate end time
        const startTime = new Date(`${date}T${time}:00`);
        const endTime = new Date(startTime.getTime() + (existingService?.duration_minutes || 60) * 60000);
        
        // Step 4: Create appointment with proper schema
        const { data, error } = await supabase
            .from('appointments')
            .insert([
                {
                    business_id: businessId,
                    customer_id: customerId,
                    service_id: serviceId,
                    appointment_date: date,
                    start_time: time,
                    end_time: endTime.toTimeString().split(' ')[0].substring(0, 5), // HH:MM format
                    duration_minutes: existingService?.duration_minutes || 60,
                    status: 'confirmed',
                    customer_notes: notes || null,
                    booking_source: 'web_widget',
                    customer_name: name,
                    customer_phone: phone,
                    customer_email: email
                }
            ])
            .select();
        
        if (error) {
            console.error('❌ Appointment creation error:', error);
            return res.status(500).json({ 
                error: 'Failed to book appointment', 
                details: error.message,
                code: error.code 
            });
        }
        
        console.log('✅ Web booking created:', data[0]);
        res.json({ 
            success: true, 
            appointment: data[0],
            message: 'Appointment booked successfully!' 
        });
        
    } catch (error) {
        console.error('❌ Web booking error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Webhook server running on port ${PORT}`);
    console.log(`📞 Vapi webhook URL: http://localhost:${PORT}/webhook/vapi`);
    console.log(`💾 Connected to Supabase: ${SUPABASE_URL}`);
    console.log(`🏢 Default Business ID: ${DEFAULT_BUSINESS_ID}`);
});

module.exports = app;