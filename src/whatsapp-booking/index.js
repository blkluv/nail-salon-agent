#!/usr/bin/env node

const express = require('express');
const axios = require('axios');
require('dotenv').config();

/**
 * WhatsApp Business API Integration for Vapi Nail Salon Agent
 * 
 * Enables appointment booking through WhatsApp Business
 * Supports rich media messages and interactive buttons
 */

const app = express();
app.use(express.json());

// WhatsApp Business API configuration
const WHATSAPP_CONFIG = {
    baseURL: 'https://graph.facebook.com/v18.0',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
};

const BUSINESS_INFO = {
    name: process.env.BUSINESS_NAME || 'DropFly Beauty Studio',
    phone: process.env.BUSINESS_PHONE || '(555) 123-4567',
    address: process.env.BUSINESS_ADDRESS || '123 Beauty Lane, Beverly Hills, CA 90210',
    website: process.env.BUSINESS_WEBSITE || 'www.dropflybeauty.com'
};

// Customer conversation state
const conversations = new Map();

/**
 * WhatsApp webhook verification
 */
app.get('/webhook/whatsapp', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    if (mode === 'subscribe' && token === WHATSAPP_CONFIG.webhookVerifyToken) {
        console.log('WhatsApp webhook verified');
        res.status(200).send(challenge);
    } else {
        res.status(403).send('Forbidden');
    }
});

/**
 * WhatsApp message handler
 */
app.post('/webhook/whatsapp', async (req, res) => {
    try {
        const { entry } = req.body;
        
        if (entry && entry[0] && entry[0].changes && entry[0].changes[0] && entry[0].changes[0].value.messages) {
            const message = entry[0].changes[0].value.messages[0];
            const from = message.from;
            const messageText = message.text ? message.text.body : '';
            const messageType = message.type;
            
            console.log(`WhatsApp message from ${from}: ${messageText}`);
            
            if (messageType === 'interactive') {
                await handleInteractiveMessage(from, message.interactive);
            } else if (messageType === 'text') {
                await handleTextMessage(from, messageText);
            }
        }
        
        res.status(200).send('OK');
        
    } catch (error) {
        console.error('WhatsApp webhook error:', error);
        res.status(500).send('Error');
    }
});

/**
 * Handle text messages
 */
async function handleTextMessage(from, text) {
    const conversation = getConversation(from);
    const lowerText = text.toLowerCase();
    
    // Intent detection
    if (isGreeting(lowerText)) {
        await sendWelcomeMessage(from);
    } else if (isBookingIntent(lowerText)) {
        await startBookingFlow(from);
    } else if (isServiceInquiry(lowerText)) {
        await sendServiceMenu(from);
    } else if (isHoursInquiry(lowerText)) {
        await sendBusinessHours(from);
    } else {
        // Handle based on conversation state
        await handleConversationFlow(from, text, conversation);
    }
}

/**
 * Handle interactive button responses
 */
async function handleInteractiveMessage(from, interactive) {
    const buttonReply = interactive.button_reply;
    
    if (buttonReply) {
        const buttonId = buttonReply.id;
        
        if (buttonId.startsWith('service_')) {
            const serviceId = buttonId.replace('service_', '');
            await handleServiceSelection(from, serviceId);
        } else if (buttonId.startsWith('date_')) {
            const date = buttonId.replace('date_', '');
            await handleDateSelection(from, date);
        } else if (buttonId === 'confirm_booking') {
            await confirmBooking(from);
        } else if (buttonId === 'cancel_booking') {
            await cancelBooking(from);
        }
    }
}

/**
 * Send welcome message with quick actions
 */
async function sendWelcomeMessage(from) {
    const message = {
        messaging_product: 'whatsapp',
        to: from,
        type: 'interactive',
        interactive: {
            type: 'button',
            header: {
                type: 'text',
                text: `Welcome to ${BUSINESS_INFO.name}! 💅✨`
            },
            body: {
                text: "Hi there! I'm your virtual assistant. I can help you book appointments, check our services, or answer any questions you have.\n\nWhat would you like to do today?"
            },
            action: {
                buttons: [
                    {
                        type: 'reply',
                        reply: {
                            id: 'book_appointment',
                            title: '📅 Book Appointment'
                        }
                    },
                    {
                        type: 'reply',
                        reply: {
                            id: 'view_services',
                            title: '💅 View Services'
                        }
                    },
                    {
                        type: 'reply',
                        reply: {
                            id: 'business_hours',
                            title: '🕐 Business Hours'
                        }
                    }
                ]
            }
        }
    };
    
    await sendWhatsAppMessage(message);
}

/**
 * Send service menu with prices
 */
async function sendServiceMenu(from) {
    const services = [
        { id: 'manicure_signature', name: 'Signature Manicure', price: 45, duration: 60 },
        { id: 'manicure_gel', name: 'Gel Manicure', price: 55, duration: 75 },
        { id: 'pedicure_signature', name: 'Signature Pedicure', price: 50, duration: 75 },
        { id: 'pedicure_spa', name: 'Spa Pedicure', price: 65, duration: 90 },
        { id: 'combo_mani_pedi', name: 'Mani + Pedi Combo', price: 85, duration: 120 }
    ];
    
    let serviceText = '💅 *Our Services*\n\n';
    services.forEach(service => {
        serviceText += `• *${service.name}*\n  $${service.price} • ${service.duration} minutes\n\n`;
    });
    
    const message = {
        messaging_product: 'whatsapp',
        to: from,
        type: 'interactive',
        interactive: {
            type: 'button',
            body: {
                text: serviceText + 'Ready to book an appointment?'
            },
            action: {
                buttons: [
                    {
                        type: 'reply',
                        reply: {
                            id: 'book_now',
                            title: '📅 Book Now'
                        }
                    },
                    {
                        type: 'reply',
                        reply: {
                            id: 'call_us',
                            title: '📞 Call Us'
                        }
                    }
                ]
            }
        }
    };
    
    await sendWhatsAppMessage(message);
}

/**
 * Send business hours
 */
async function sendBusinessHours(from) {
    const hoursText = `🕐 *Business Hours*\n\n` +
        `Monday - Friday: 9:00 AM - 6:00 PM\n` +
        `Saturday: 9:00 AM - 4:00 PM\n` +
        `Sunday: 11:00 AM - 3:00 PM\n\n` +
        `📍 ${BUSINESS_INFO.address}\n` +
        `📞 ${BUSINESS_INFO.phone}\n` +
        `🌐 ${BUSINESS_INFO.website}`;
    
    const message = {
        messaging_product: 'whatsapp',
        to: from,
        type: 'text',
        text: {
            body: hoursText
        }
    };
    
    await sendWhatsAppMessage(message);
}

/**
 * Start the booking flow
 */
async function startBookingFlow(from) {
    const conversation = getConversation(from);
    conversation.state = 'collecting_name';
    
    const message = {
        messaging_product: 'whatsapp',
        to: from,
        type: 'text',
        text: {
            body: '📅 *Let\'s book your appointment!*\n\nFirst, what\'s your full name?'
        }
    };
    
    await sendWhatsAppMessage(message);
}

/**
 * Send interactive service selection
 */
async function sendServiceSelection(from) {
    const message = {
        messaging_product: 'whatsapp',
        to: from,
        type: 'interactive',
        interactive: {
            type: 'list',
            header: {
                type: 'text',
                text: 'Choose Your Service 💅'
            },
            body: {
                text: 'Which service would you like to book?'
            },
            action: {
                button: 'View Services',
                sections: [
                    {
                        title: 'Manicure Services',
                        rows: [
                            {
                                id: 'service_manicure_signature',
                                title: 'Signature Manicure',
                                description: '$45 • 60 minutes'
                            },
                            {
                                id: 'service_manicure_gel',
                                title: 'Gel Manicure',
                                description: '$55 • 75 minutes'
                            }
                        ]
                    },
                    {
                        title: 'Pedicure Services',
                        rows: [
                            {
                                id: 'service_pedicure_signature',
                                title: 'Signature Pedicure',
                                description: '$50 • 75 minutes'
                            },
                            {
                                id: 'service_pedicure_spa',
                                title: 'Spa Pedicure',
                                description: '$65 • 90 minutes'
                            }
                        ]
                    },
                    {
                        title: 'Combo Services',
                        rows: [
                            {
                                id: 'service_combo_mani_pedi',
                                title: 'Mani + Pedi Combo',
                                description: '$85 • 120 minutes'
                            }
                        ]
                    }
                ]
            }
        }
    };
    
    await sendWhatsAppMessage(message);
}

/**
 * Send WhatsApp message via Graph API
 */
async function sendWhatsAppMessage(messageData) {
    try {
        const url = `${WHATSAPP_CONFIG.baseURL}/${WHATSAPP_CONFIG.phoneNumberId}/messages`;
        
        const response = await axios.post(url, messageData, {
            headers: {
                'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('WhatsApp message sent:', response.data);
        return response.data;
        
    } catch (error) {
        console.error('Failed to send WhatsApp message:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Utility functions
 */
function getConversation(from) {
    if (!conversations.has(from)) {
        conversations.set(from, {
            state: 'initial',
            data: {},
            lastActivity: new Date()
        });
    }
    
    const conversation = conversations.get(from);
    conversation.lastActivity = new Date();
    return conversation;
}

function isGreeting(text) {
    return /\b(hi|hello|hey|good morning|good afternoon|good evening)\b/i.test(text);
}

function isBookingIntent(text) {
    return /\b(book|appointment|schedule|reserve|available|availability)\b/i.test(text);
}

function isServiceInquiry(text) {
    return /\b(services|what do you offer|menu|prices|cost|how much)\b/i.test(text);
}

function isHoursInquiry(text) {
    return /\b(hours|open|closed|when|time)\b/i.test(text);
}

// Start server
const port = process.env.WHATSAPP_PORT || 3002;
app.listen(port, () => {
    console.log(`WhatsApp booking server running on port ${port}`);
    console.log(`Webhook URL: http://localhost:${port}/webhook/whatsapp`);
});

module.exports = { app, sendWhatsAppMessage };