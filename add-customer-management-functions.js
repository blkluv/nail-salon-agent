#!/usr/bin/env node

/**
 * Add comprehensive customer management functions to Vapi assistant
 */

const VAPI_API_KEY = '1d33c846-52ba-46ff-b663-16fb6c67af9e';
const ASSISTANT_ID = '8ab7e000-aea8-4141-a471-33133219a471';

async function addCustomerManagementFunctions() {
    console.log('🔧 Adding customer management functions to Vapi assistant...');
    
    const functions = [
        // Booking functions
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
        
        // Customer management functions
        {
            "name": "check_appointments",
            "description": "Look up a customer's appointments by phone number",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_phone": {
                        "type": "string",
                        "description": "Customer's phone number to look up appointments"
                    }
                },
                "required": ["customer_phone"]
            }
        },
        
        {
            "name": "cancel_appointment",
            "description": "Cancel a customer's appointment",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_phone": {
                        "type": "string",
                        "description": "Customer's phone number"
                    },
                    "appointment_id": {
                        "type": "string",
                        "description": "Specific appointment ID to cancel (optional - will cancel next appointment if not provided)"
                    }
                },
                "required": ["customer_phone"]
            }
        },
        
        {
            "name": "reschedule_appointment",
            "description": "Reschedule a customer's appointment to a new date and time",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_phone": {
                        "type": "string",
                        "description": "Customer's phone number"
                    },
                    "new_date": {
                        "type": "string",
                        "description": "New appointment date in YYYY-MM-DD format"
                    },
                    "new_time": {
                        "type": "string",
                        "description": "New appointment time in HH:MM format (24-hour)"
                    },
                    "appointment_id": {
                        "type": "string",
                        "description": "Specific appointment ID to reschedule (optional - will reschedule next appointment if not provided)"
                    }
                },
                "required": ["customer_phone", "new_date", "new_time"]
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

IMPORTANT: Keep responses SHORT and DIRECT. Customers want quick service, not long explanations.

🔧 CUSTOMER MANAGEMENT FUNCTIONS:

1. BOOKING: When customer provides booking details, call book_appointment
2. CHECK APPOINTMENTS: When customer asks about their appointments, call check_appointments  
3. CANCEL: When customer wants to cancel, call cancel_appointment
4. RESCHEDULE: When customer wants to change date/time, call reschedule_appointment
5. AVAILABILITY: When checking if time slots are open, call check_availability

📞 CONVERSATION EXAMPLES:

Customer: "What appointments do I have?"
You: Call check_appointments with their phone number

Customer: "Cancel my Tuesday appointment"  
You: Call cancel_appointment with their phone number

Customer: "Move my appointment to Friday at 2 PM"
You: Call reschedule_appointment with phone, new date, new time

Customer: "Is Wednesday at 3 PM available?"
You: Call check_availability for that date

🎯 BOOKING FLOW:
1. Ask what service they want
2. Ask for date and time  
3. Ask for name and phone number
4. IMMEDIATELY call book_appointment function
5. Confirm based on function response

📅 DATE/TIME FORMATTING:
- Convert "Wednesday", "tomorrow" → YYYY-MM-DD format  
- Convert "3 PM", "3:00 PM" → 24-hour format (15:00)
- Always use proper date formats for functions

🔍 SERVICE TYPES:
- "classic manicure" → "classic_manicure"
- "gel manicure" → "gel_manicure" 
- "pedicure" → "pedicure"

CRITICAL RULES:
- Always call functions when you have the required information
- Don't just respond with text - use the functions to actually perform actions
- Be helpful and efficient - customers want quick results
- Keep responses under 2 sentences when possible

PHONE NUMBER HANDLING:
- Accept phone numbers in any format: (555) 123-4567, 555-123-4567, 5551234567
- Always use the customer's phone number for lookups and modifications`
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
        
        console.log('✅ Customer management functions added to Vapi assistant!');
        console.log('');
        console.log('🎯 Now customers can:');
        console.log('   📅 Check appointments: "What appointments do I have?"');
        console.log('   ❌ Cancel appointments: "Cancel my Tuesday appointment"');  
        console.log('   🔄 Reschedule appointments: "Move my appointment to Friday at 2 PM"');
        console.log('   📞 Book appointments: "Book a manicure for tomorrow at 3 PM"');
        console.log('');
        console.log('📞 Test by calling (424) 351-9304 and trying these scenarios!');
        
    } catch (error) {
        console.error('❌ Error adding functions:', error.message);
    }
}

addCustomerManagementFunctions();