// Vercel Serverless Function for Vapi Webhook
// Deploy this to Vercel for a permanent webhook URL

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const BUSINESS_ID = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { message } = req.body;
        console.log('Webhook received:', JSON.stringify(message, null, 2));
        
        if (message?.toolCalls) {
            const results = [];
            
            for (const toolCall of message.toolCalls) {
                const result = await handleToolCall(toolCall);
                results.push(result);
            }
            
            return res.status(200).json({ results });
        }
        
        return res.status(200).json({ status: 'received' });
    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ error: error.message });
    }
}

async function handleToolCall(toolCall) {
    const { function: fn } = toolCall;
    
    switch (fn.name) {
        case 'check_availability':
            return await checkAvailability(fn.arguments);
        case 'book_appointment':
            return await bookAppointment(fn.arguments);
        case 'check_appointments':
            return await checkAppointments(fn.arguments);
        case 'cancel_appointment':
            return await cancelAppointment(fn.arguments);
        default:
            return { error: `Unknown function: ${fn.name}` };
    }
}

async function checkAvailability(args) {
    try {
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
                message: `Sorry, we're closed on ${requestedDate.toLocaleDateString('en-US', { weekday: 'long' })}.`
            };
        }
        
        const { data: appointments } = await supabase
            .from('appointments')
            .select('start_time, duration_minutes')
            .eq('business_id', BUSINESS_ID)
            .eq('appointment_date', args.preferred_date)
            .neq('status', 'cancelled');
            
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
            available: true,
            date: args.preferred_date,
            available_times: availableSlots.slice(0, 5),
            message: `We have ${availableSlots.length} available slots on ${requestedDate.toLocaleDateString()}.`
        };
    } catch (error) {
        return { error: 'Sorry, I had trouble checking availability.' };
    }
}

async function bookAppointment(args) {
    try {
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
            const { data: newCustomer } = await supabase
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
            customer = newCustomer;
        }
        
        // Book appointment
        const { data: appointment } = await supabase
            .from('appointments')
            .insert({
                business_id: BUSINESS_ID,
                customer_id: customer.id,
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
            
        return {
            success: true,
            booking_id: appointment.id,
            message: `Perfect! Your appointment is booked for ${args.appointment_date} at ${args.start_time}.`
        };
    } catch (error) {
        return { 
            success: false, 
            error: 'Sorry, I had trouble booking your appointment.' 
        };
    }
}

async function checkAppointments(args) {
    try {
        let query = supabase
            .from('appointments')
            .select('*')
            .eq('business_id', BUSINESS_ID);
            
        if (args.customer_email) {
            query = query.eq('customer_email', args.customer_email);
        }
        if (args.customer_phone) {
            query = query.eq('customer_phone', args.customer_phone);
        }
        
        const { data: appointments } = await query;
        
        return {
            appointments: appointments || [],
            count: appointments?.length || 0,
            message: `I found ${appointments?.length || 0} appointments.`
        };
    } catch (error) {
        return { error: 'Sorry, I had trouble finding your appointments.' };
    }
}

async function cancelAppointment(args) {
    try {
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
            if (args.customer_email) query = query.eq('customer_email', args.customer_email);
            if (args.customer_phone) query = query.eq('customer_phone', args.customer_phone);
        }
        
        await query;
        
        return {
            success: true,
            message: 'Your appointment has been successfully cancelled.'
        };
    } catch (error) {
        return { 
            success: false,
            error: 'Sorry, I had trouble cancelling your appointment.' 
        };
    }
}