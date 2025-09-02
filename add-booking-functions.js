#!/usr/bin/env node

/**
 * Add booking functions to Vapi assistant
 */

const VAPI_API_KEY = '1d33c846-52ba-46ff-b663-16fb6c67af9e';
const ASSISTANT_ID = '8ab7e000-aea8-4141-a471-33133219a471';

async function addBookingFunctions() {
    console.log('🔧 Adding booking functions to Vapi assistant...');
    
    const functions = [
        {
            "name": "book_appointment",
            "description": "Book an appointment for a customer with their details, service, and preferred date/time",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_name": {
                        "type": "string",
                        "description": "Customer's full name"
                    },
                    "customer_phone": {
                        "type": "string", 
                        "description": "Customer's phone number (digits only)"
                    },
                    "customer_email": {
                        "type": "string",
                        "description": "Customer's email address (optional)"
                    },
                    "service_type": {
                        "type": "string",
                        "description": "Type of service requested (e.g., classic_manicure, gel_manicure, pedicure)"
                    },
                    "appointment_date": {
                        "type": "string",
                        "description": "Preferred appointment date in YYYY-MM-DD format"
                    },
                    "start_time": {
                        "type": "string", 
                        "description": "Preferred start time in HH:MM format (24-hour)"
                    }
                },
                "required": ["customer_name", "customer_phone", "appointment_date", "start_time"]
            }
        },
        {
            "name": "check_availability",
            "description": "Check availability for a specific date and service",
            "parameters": {
                "type": "object",
                "properties": {
                    "appointment_date": {
                        "type": "string",
                        "description": "Date to check in YYYY-MM-DD format"
                    },
                    "service_type": {
                        "type": "string",
                        "description": "Service type to check availability for"
                    }
                },
                "required": ["appointment_date"]
            }
        }
    ];
    
    try {
        const response = await fetch(`https://api.vapi.ai/assistant/${ASSISTANT_ID}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${VAPI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: {
                    provider: 'openai',
                    model: 'gpt-4o',
                    functions: functions,
                    messages: [{
                        role: 'system',
                        content: `You are a professional but CONCISE booking assistant for nail salons.

IMPORTANT: Keep responses SHORT and DIRECT. Customers want quick bookings, not long explanations.

WHEN TO USE FUNCTIONS:
- When customer provides all booking details (name, phone, service, date, time), immediately call book_appointment
- If customer asks about availability for a specific date, call check_availability
- Always call functions when you have the required information - don't just respond with text

BOOKING FLOW:
1. Ask what service they want
2. Ask for date and time  
3. Ask for name and phone number
4. IMMEDIATELY call book_appointment function with the details
5. Confirm the booking based on the function response

DATE/TIME FORMATTING:
- Convert dates like "Wednesday", "tomorrow" to YYYY-MM-DD format  
- Convert times like "3 PM", "3:00 PM" to 24-hour format (15:00)
- Use check_availability if you need to verify a date/time

SERVICE TYPES:
- "classic manicure" → "classic_manicure"
- "gel manicure" → "gel_manicure" 
- "pedicure" → "pedicure"

EXAMPLE:
Customer: "Book me a classic manicure for Wednesday at 3 PM, I'm Eric, phone 323-283-7135"
You: Call book_appointment({
  customer_name: "Eric",
  customer_phone: "3232837135", 
  appointment_date: "2025-09-04", // next Wednesday
  start_time: "15:00",
  service_type: "classic_manicure"
})

CRITICAL: Always call the booking function when you have the required details. Don't just respond with confirmation text without calling the function first.`
                    }],
                    maxTokens: 150,
                    temperature: 0.3
                }
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Vapi API error: ${response.status} - ${errorText}`);
        }
        
        console.log('✅ Booking functions added to Vapi assistant!');
        console.log('📞 Now test by calling (424) 351-9304 and booking an appointment');
        console.log('🎯 The assistant will now call book_appointment function');
        
    } catch (error) {
        console.error('❌ Error adding functions:', error.message);
    }
}

addBookingFunctions();