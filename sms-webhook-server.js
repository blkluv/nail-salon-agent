// SMS Webhook Server - Integrates with existing Voice AI system
// This extends your current webhook to handle SMS messages

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
const PORT = process.env.SMS_PORT || 3002;

// Initialize services
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For Twilio webhook format

// Import your existing booking functions (we'll reuse them!)
// In a real setup, you'd extract these to a shared module
async function getBusinessIdFromSMS(smsNumber) {
    try {
        const { data, error } = await supabase
            .from('phone_numbers')
            .select('business_id')
            .eq('phone_number', smsNumber)
            .single();
            
        if (error || !data) {
            console.error('SMS number lookup failed:', error);
            return '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'; // Default demo
        }
        
        return data.business_id;
    } catch (error) {
        console.error('SMS lookup error:', error);
        return '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'; // Default demo
    }
}

// Smart text parsing for booking requests
function parseBookingFromText(text, customerPhone) {
    const textLower = text.toLowerCase();
    
    // Service detection
    const servicePatterns = {
        'gel manicure': /gel.*mani|mani.*gel/i,
        'regular manicure': /regular.*mani|basic.*mani|mani(?!.*gel)/i,
        'pedicure': /pedi/i,
        'combo': /combo|mani.*pedi|pedi.*mani/i
    };
    
    let service = 'manicure'; // default
    for (const [serviceType, pattern] of Object.entries(servicePatterns)) {
        if (pattern.test(textLower)) {
            service = serviceType.replace(' ', '_');
            break;
        }
    }
    
    // Date detection
    const datePatterns = {
        'today': /today/i,
        'tomorrow': /tomorrow/i,
        'monday': /mon/i,
        'tuesday': /tue/i,
        'wednesday': /wed/i,
        'thursday': /thu/i,
        'friday': /fri/i,
        'saturday': /sat/i,
        'sunday': /sun/i
    };
    
    let appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 1); // Default to tomorrow
    
    for (const [day, pattern] of Object.entries(datePatterns)) {
        if (pattern.test(textLower)) {
            if (day === 'today') {
                appointmentDate = new Date();
            } else if (day === 'tomorrow') {
                appointmentDate = new Date();
                appointmentDate.setDate(appointmentDate.getDate() + 1);
            } else {
                // Handle weekday names (simplified)
                appointmentDate = getNextWeekday(day);
            }
            break;
        }
    }
    
    // Time detection
    const timeMatch = text.match(/(\d{1,2}):?(\d{0,2})?\s?(am|pm|AM|PM)/);
    let startTime = '14:00'; // Default 2 PM
    
    if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        const period = timeMatch[3]?.toLowerCase();
        
        if (period === 'pm' && hour !== 12) hour += 12;
        if (period === 'am' && hour === 12) hour = 0;
        
        startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
    
    return {
        preferred_date: appointmentDate.toISOString().split('T')[0],
        service_type: service,
        start_time: startTime,
        customer_phone: customerPhone,
        customer_name: 'SMS Customer' // We'll enhance this later
    };
}

function getNextWeekday(dayName) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = days.indexOf(dayName.toLowerCase());
    const today = new Date();
    const currentDay = today.getDay();
    
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7; // Next week if day has passed
    
    const result = new Date(today);
    result.setDate(today.getDate() + daysToAdd);
    return result;
}

// SMS Webhook endpoint
app.post('/webhook/sms', async (req, res) => {
    try {
        console.log('📱 SMS received:', req.body);
        
        const { From: customerPhone, Body: messageBody, To: salonNumber } = req.body;
        
        // 1. Identify which business this SMS is for
        const businessId = await getBusinessIdFromSMS(salonNumber);
        
        // 2. Check for simple commands first
        const bodyLower = messageBody.toLowerCase().trim();
        
        if (bodyLower === 'help' || bodyLower === 'info') {
            await sendSMSResponse(customerPhone, salonNumber, 
                "Hi! I can help you book appointments. Try texting: 'Book gel mani tomorrow 2pm' or 'Available Friday?'");
            return res.status(200).send('<Response></Response>');
        }
        
        if (bodyLower === 'stop' || bodyLower === 'unsubscribe') {
            await sendSMSResponse(customerPhone, salonNumber, 
                "You've been unsubscribed from SMS booking. Reply START to re-enable.");
            return res.status(200).send('<Response></Response>');
        }
        
        // 3. Check if it's a booking request
        if (isBookingRequest(messageBody)) {
            const bookingArgs = parseBookingFromText(messageBody, customerPhone);
            
            // 4. Use existing voice AI booking logic!
            const { bookAppointment } = require('./webhook-server-functions'); // Extract shared functions
            const bookingResult = await bookAppointment(bookingArgs, businessId);
            
            // 5. Send SMS response
            if (bookingResult.success) {
                const response = `✅ Booked! ${bookingArgs.service_type.replace('_', ' ')} on ${bookingArgs.preferred_date} at ${bookingArgs.start_time}. Confirmation: ${bookingResult.booking_id}`;
                await sendSMSResponse(customerPhone, salonNumber, response);
            } else {
                await sendSMSResponse(customerPhone, salonNumber, 
                    `Sorry, I couldn't book that appointment. ${bookingResult.error || 'Please call us or try different time.'}`);
            }
        } 
        // 6. Check if asking for availability
        else if (isAvailabilityRequest(messageBody)) {
            const { preferred_date } = parseBookingFromText(messageBody, customerPhone);
            
            const { checkAvailability } = require('./webhook-server-functions');
            const availabilityResult = await checkAvailability({ preferred_date }, businessId);
            
            if (availabilityResult.available && availabilityResult.available_times?.length > 0) {
                const times = availabilityResult.available_times.slice(0, 3).join(', ');
                const response = `Available times on ${preferred_date}: ${times}. Text 'Book [service] [date] [time]' to book!`;
                await sendSMSResponse(customerPhone, salonNumber, response);
            } else {
                await sendSMSResponse(customerPhone, salonNumber, 
                    `Sorry, no availability on ${preferred_date}. Try another date or call us!`);
            }
        }
        // 7. Fallback - general AI response
        else {
            await sendSMSResponse(customerPhone, salonNumber, 
                "Hi! I can help you book appointments via text. Try: 'Book gel mani Friday 2pm' or 'Available tomorrow?' or text HELP for more options.");
        }
        
        res.status(200).send('<Response></Response>');
        
    } catch (error) {
        console.error('❌ SMS webhook error:', error);
        await sendSMSResponse(req.body.From, req.body.To, 
            "Sorry, I'm having trouble right now. Please call us to book your appointment!");
        res.status(200).send('<Response></Response>');
    }
});

async function sendSMSResponse(to, from, message) {
    try {
        const result = await twilioClient.messages.create({
            body: message,
            from: from, // Salon's SMS number
            to: to      // Customer's number
        });
        
        console.log('✅ SMS sent:', result.sid);
        return result;
    } catch (error) {
        console.error('❌ SMS send failed:', error);
        throw error;
    }
}

function isBookingRequest(text) {
    const bookingKeywords = /book|schedule|appointment|reserve/i;
    return bookingKeywords.test(text);
}

function isAvailabilityRequest(text) {
    const availabilityKeywords = /available|open|free|slots?|times?/i;
    return availabilityKeywords.test(text);
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'SMS webhook server running',
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`📱 SMS webhook server running on port ${PORT}`);
    console.log(`📍 SMS webhook URL: http://localhost:${PORT}/webhook/sms`);
});

module.exports = app;