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
        console.log('📅 Checking availability for:', args);
        
        // Get business hours for the requested date
        const requestedDate = new Date(args.preferred_date);
        const dayOfWeek = requestedDate.getDay();
        
        const { data: hours } = await supabase
            .from('business_hours')
            .select('*')
            .eq('business_id', BUSINESS_ID)
            .eq('day_of_week', dayOfWeek)
            .single();
            
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
        console.error('Error checking availability:', error);
        return { error: 'Sorry, I had trouble checking availability. Please try again.' };
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