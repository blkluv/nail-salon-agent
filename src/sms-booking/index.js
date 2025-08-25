#!/usr/bin/env node

const express = require('express');
const twilio = require('twilio');
require('dotenv').config();

/**
 * SMS Booking Handler for Vapi Nail Salon Agent
 * 
 * Allows customers to book appointments via text message
 * Integrates with the same N8N workflow as voice bookings
 */

const app = express();
app.use(express.urlencoded({ extended: false }));

// Twilio client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Business configuration
const BUSINESS_CONFIG = {
    name: process.env.BUSINESS_NAME || 'DropFly Beauty Studio',
    phone: process.env.BUSINESS_PHONE || '(555) 123-4567',
    services: [
        { id: 'manicure', name: 'Manicure', duration: 60, price: 45 },
        { id: 'pedicure', name: 'Pedicure', duration: 75, price: 50 },
        { id: 'combo', name: 'Mani+Pedi', duration: 120, price: 85 },
        { id: 'gel', name: 'Gel Manicure', duration: 75, price: 55 }
    ],
    hours: {
        'monday': '9 AM - 6 PM',
        'tuesday': '9 AM - 6 PM',
        'wednesday': '9 AM - 6 PM',
        'thursday': '9 AM - 6 PM',
        'friday': '9 AM - 6 PM',
        'saturday': '9 AM - 4 PM',
        'sunday': '11 AM - 3 PM'
    }
};

// Customer session storage (in production, use Redis or database)
const customerSessions = new Map();

/**
 * Main SMS webhook handler
 */
app.post('/webhook/sms', async (req, res) => {
    const { Body: message, From: customerPhone } = req.body;
    const twiml = new twilio.twiml.MessagingResponse();
    
    try {
        const response = await handleSMSMessage(customerPhone, message.trim());
        twiml.message(response);
        
    } catch (error) {
        console.error('SMS handling error:', error);
        twiml.message("Sorry, I'm having trouble right now. Please call us at " + BUSINESS_CONFIG.phone);
    }
    
    res.type('text/xml');
    res.send(twiml.toString());
});

/**
 * Handle incoming SMS messages with natural language processing
 */
async function handleSMSMessage(customerPhone, message) {
    const session = getCustomerSession(customerPhone);
    const lowerMessage = message.toLowerCase();
    
    // Handle various intents
    if (isGreeting(lowerMessage)) {
        return handleGreeting(session);
    }
    
    if (isBookingRequest(lowerMessage)) {
        return handleBookingStart(session, message);
    }
    
    if (isServiceInquiry(lowerMessage)) {
        return handleServiceInquiry(session);
    }
    
    if (isHoursInquiry(lowerMessage)) {
        return handleHoursInquiry(session);
    }
    
    if (isCancellationRequest(lowerMessage)) {
        return handleCancellationRequest(session, message);
    }
    
    // Handle conversation flow based on session state
    switch (session.state) {
        case 'collecting_name':
            return handleNameCollection(session, message);
            
        case 'collecting_email':
            return handleEmailCollection(session, message);
            
        case 'selecting_service':
            return handleServiceSelection(session, message);
            
        case 'selecting_date':
            return handleDateSelection(session, message);
            
        case 'selecting_time':
            return handleTimeSelection(session, message);
            
        case 'confirming_booking':
            return handleBookingConfirmation(session, message);
            
        default:
            return handleDefault(session, message);
    }
}

/**
 * Intent detection functions
 */
function isGreeting(message) {
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'];
    return greetings.some(greeting => message.includes(greeting));
}

function isBookingRequest(message) {
    const bookingWords = ['book', 'appointment', 'schedule', 'reserve', 'available', 'availability'];
    return bookingWords.some(word => message.includes(word));
}

function isServiceInquiry(message) {
    const serviceWords = ['services', 'what do you offer', 'menu', 'prices', 'cost', 'how much'];
    return serviceWords.some(word => message.includes(word));
}

function isHoursInquiry(message) {
    const hoursWords = ['hours', 'open', 'closed', 'when', 'time'];
    return hoursWords.some(word => message.includes(word));
}

function isCancellationRequest(message) {
    const cancelWords = ['cancel', 'reschedule', 'change', 'move', 'different time'];
    return cancelWords.some(word => message.includes(word));
}

/**
 * Session management
 */
function getCustomerSession(customerPhone) {
    if (!customerSessions.has(customerPhone)) {
        customerSessions.set(customerPhone, {
            phone: customerPhone,
            state: 'initial',
            data: {},
            lastActivity: new Date()
        });
    }
    
    const session = customerSessions.get(customerPhone);
    session.lastActivity = new Date();
    return session;
}

/**
 * Message handlers
 */
function handleGreeting(session) {
    session.state = 'greeted';
    return `Hi! Welcome to ${BUSINESS_CONFIG.name}! 💅\n\nI can help you:\n• Book an appointment\n• Check our services & prices\n• Get our hours\n\nWhat would you like to do?`;
}

function handleBookingStart(session, message) {
    session.state = 'collecting_name';
    session.data.bookingRequest = message;
    
    return `Great! I'd love to help you book an appointment. 📅\n\nFirst, what's your name?`;
}

function handleServiceInquiry(session) {
    let response = `Here are our services:\n\n`;
    
    BUSINESS_CONFIG.services.forEach(service => {
        response += `• ${service.name} - $${service.price} (${service.duration} min)\n`;
    });
    
    response += `\nReady to book? Just say "book appointment"!`;
    
    return response;
}

function handleHoursInquiry(session) {
    let response = `Our hours:\n\n`;
    
    Object.entries(BUSINESS_CONFIG.hours).forEach(([day, hours]) => {
        response += `${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours}\n`;
    });
    
    response += `\nWould you like to book an appointment?`;
    
    return response;
}

function handleNameCollection(session, name) {
    session.data.name = name;
    session.state = 'collecting_email';
    
    return `Nice to meet you, ${name}! 😊\n\nWhat's your email address?`;
}

function handleEmailCollection(session, email) {
    if (!isValidEmail(email)) {
        return `That doesn't look like a valid email. Could you try again?\n\nExample: john@email.com`;
    }
    
    session.data.email = email;
    session.state = 'selecting_service';
    
    let response = `Perfect! Now, which service would you like?\n\n`;
    
    BUSINESS_CONFIG.services.forEach((service, index) => {
        response += `${index + 1}. ${service.name} - $${service.price} (${service.duration} min)\n`;
    });
    
    response += `\nJust reply with the number (1, 2, 3, etc.)`;
    
    return response;
}

function handleServiceSelection(session, message) {
    const serviceIndex = parseInt(message) - 1;
    
    if (serviceIndex >= 0 && serviceIndex < BUSINESS_CONFIG.services.length) {
        session.data.service = BUSINESS_CONFIG.services[serviceIndex];
        session.state = 'selecting_date';
        
        return `Excellent choice! ${session.data.service.name} it is. ✨\n\nWhat date works for you? Please use format like:\n• Tomorrow\n• Monday\n• Jan 15\n• 01/15/2025`;
    } else {
        return `Please choose a number from 1-${BUSINESS_CONFIG.services.length}`;
    }
}

function handleDateSelection(session, dateMessage) {
    const date = parseDate(dateMessage);
    
    if (!date) {
        return `I couldn't understand that date. Please try:\n• Tomorrow\n• Monday\n• Jan 15\n• 01/15/2025`;
    }
    
    session.data.date = date;
    session.state = 'selecting_time';
    
    return `Great! ${date.toLocaleDateString()} looks good.\n\nWhat time would you prefer?\n• Morning (9 AM - 12 PM)\n• Afternoon (12 PM - 4 PM)\n• Late (4 PM - 6 PM)\n\nOr say a specific time like "2:30 PM"`;
}

function handleTimeSelection(session, timeMessage) {
    const time = parseTime(timeMessage);
    
    if (!time) {
        return `I couldn't understand that time. Please try:\n• Morning\n• Afternoon\n• 2:30 PM\n• 14:30`;
    }
    
    session.data.time = time;
    session.state = 'confirming_booking';
    
    const summary = `Here's your appointment summary:\n\n` +
        `👤 Name: ${session.data.name}\n` +
        `💅 Service: ${session.data.service.name} ($${session.data.service.price})\n` +
        `📅 Date: ${session.data.date.toLocaleDateString()}\n` +
        `⏰ Time: ${session.data.time}\n` +
        `📧 Email: ${session.data.email}\n\n` +
        `Reply "YES" to confirm or "NO" to cancel`;
    
    return summary;
}

async function handleBookingConfirmation(session, message) {
    const response = message.toLowerCase();
    
    if (response === 'yes' || response === 'y' || response === 'confirm') {
        // Send booking to N8N workflow
        const bookingData = {
            customer_name: session.data.name,
            customer_email: session.data.email,
            customer_phone: session.phone,
            service_type: session.data.service.id,
            service_name: session.data.service.name,
            service_duration: session.data.service.duration,
            service_price: session.data.service.price,
            appointment_date: session.data.date.toISOString().split('T')[0],
            start_time: session.data.time,
            booking_source: 'sms',
            timestamp: new Date().toISOString()
        };
        
        try {
            await submitBooking(bookingData);
            
            // Reset session
            session.state = 'initial';
            session.data = {};
            
            return `🎉 Perfect! Your appointment is booked!\n\n` +
                   `You'll receive a confirmation email shortly.\n\n` +
                   `See you on ${session.data.date.toLocaleDateString()} at ${session.data.time}! 💅✨`;
                   
        } catch (error) {
            return `Sorry, there was an issue booking your appointment. Please call us at ${BUSINESS_CONFIG.phone} or try again.`;
        }
        
    } else if (response === 'no' || response === 'n' || response === 'cancel') {
        session.state = 'initial';
        session.data = {};
        
        return `No problem! Your booking was cancelled.\n\nFeel free to start over anytime. Just say "book appointment"! 😊`;
        
    } else {
        return `Please reply "YES" to confirm your booking or "NO" to cancel.`;
    }
}

function handleCancellationRequest(session, message) {
    return `To cancel or reschedule an existing appointment, please call us at ${BUSINESS_CONFIG.phone}.\n\nWe'll be happy to help! 📞`;
}

function handleDefault(session, message) {
    return `I'm not sure I understand. I can help you:\n\n` +
           `• Book an appointment\n` +
           `• Get service info\n` +
           `• Check our hours\n\n` +
           `What would you like to do?`;
}

/**
 * Utility functions
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function parseDate(dateString) {
    const today = new Date();
    const lower = dateString.toLowerCase();
    
    // Handle relative dates
    if (lower.includes('today')) {
        return today;
    }
    
    if (lower.includes('tomorrow')) {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return tomorrow;
    }
    
    // Handle day names
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = days.find(day => lower.includes(day));
    if (dayName) {
        const targetDay = days.indexOf(dayName);
        const date = new Date(today);
        const currentDay = date.getDay();
        const daysToAdd = targetDay >= currentDay ? targetDay - currentDay : 7 - currentDay + targetDay;
        date.setDate(date.getDate() + daysToAdd);
        return date;
    }
    
    // Try parsing as regular date
    const parsed = new Date(dateString);
    if (!isNaN(parsed) && parsed > today) {
        return parsed;
    }
    
    return null;
}

function parseTime(timeString) {
    const lower = timeString.toLowerCase();
    
    // Handle time periods
    if (lower.includes('morning')) {
        return '10:00 AM';
    }
    if (lower.includes('afternoon')) {
        return '2:00 PM';
    }
    if (lower.includes('late') || lower.includes('evening')) {
        return '5:00 PM';
    }
    
    // Try to parse specific times
    const timeRegex = /(\d{1,2}):?(\d{0,2})\s*(am|pm|AM|PM)?/;
    const match = timeString.match(timeRegex);
    
    if (match) {
        let hour = parseInt(match[1]);
        const minute = match[2] ? parseInt(match[2]) : 0;
        const period = match[3] ? match[3].toLowerCase() : null;
        
        if (period === 'pm' && hour !== 12) {
            hour += 12;
        } else if (period === 'am' && hour === 12) {
            hour = 0;
        }
        
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
    
    return null;
}

async function submitBooking(bookingData) {
    const axios = require('axios');
    
    const webhookUrl = process.env.N8N_WEBHOOK_URL || process.env.WEBHOOK_URL;
    
    if (!webhookUrl) {
        throw new Error('Webhook URL not configured');
    }
    
    const response = await axios.post(webhookUrl, bookingData, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.WEBHOOK_AUTH_TOKEN}`
        }
    });
    
    if (!response.data || response.status !== 200) {
        throw new Error('Booking submission failed');
    }
    
    return response.data;
}

/**
 * Send promotional/marketing messages
 */
async function sendPromotionalMessage(to, message) {
    try {
        await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to
        });
        
        console.log(`Promotional message sent to ${to}`);
        
    } catch (error) {
        console.error('Failed to send promotional message:', error);
    }
}

/**
 * Cleanup old sessions (run periodically)
 */
function cleanupOldSessions() {
    const now = new Date();
    const maxAge = 30 * 60 * 1000; // 30 minutes
    
    for (const [phone, session] of customerSessions.entries()) {
        if (now - session.lastActivity > maxAge) {
            customerSessions.delete(phone);
        }
    }
}

// Cleanup every 10 minutes
setInterval(cleanupOldSessions, 10 * 60 * 1000);

// Start server
const port = process.env.SMS_PORT || 3001;
app.listen(port, () => {
    console.log(`SMS booking server running on port ${port}`);
});

module.exports = { app, handleSMSMessage, sendPromotionalMessage };