#!/usr/bin/env node

const { google } = require('googleapis');
const express = require('express');
const axios = require('axios');
require('dotenv').config();

/**
 * Email Booking Handler for Vapi Nail Salon Agent
 * 
 * Monitors Gmail inbox for appointment booking emails
 * Processes natural language booking requests via email
 */

const app = express();
app.use(express.json());

// Gmail API setup
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

// Booking keywords to detect in emails
const BOOKING_KEYWORDS = [
    'appointment', 'book', 'schedule', 'reserve', 'booking',
    'manicure', 'pedicure', 'nail', 'spa', 'beauty'
];

/**
 * Check for new booking emails periodically
 */
async function checkForBookingEmails() {
    try {
        console.log('Checking for new booking emails...');
        
        // Search for unread emails with booking keywords
        const query = `is:unread (${BOOKING_KEYWORDS.join(' OR ')})`;
        
        const response = await gmail.users.messages.list({
            userId: 'me',
            q: query,
            maxResults: 10
        });
        
        const messages = response.data.messages || [];
        
        for (const message of messages) {
            await processBookingEmail(message.id);
        }
        
    } catch (error) {
        console.error('Error checking emails:', error);
    }
}

/**
 * Process individual booking email
 */
async function processBookingEmail(messageId) {
    try {
        // Get full message
        const message = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'full'
        });
        
        const headers = message.data.payload.headers;
        const from = headers.find(h => h.name === 'From')?.value;
        const subject = headers.find(h => h.name === 'Subject')?.value;
        
        // Extract email body
        let body = '';
        if (message.data.payload.body.data) {
            body = Buffer.from(message.data.payload.body.data, 'base64').toString();
        } else if (message.data.payload.parts) {
            const textPart = message.data.payload.parts.find(part => part.mimeType === 'text/plain');
            if (textPart && textPart.body.data) {
                body = Buffer.from(textPart.body.data, 'base64').toString();
            }
        }
        
        console.log(`Processing email from ${from}: ${subject}`);
        
        // Parse booking request from email content
        const bookingData = parseEmailBookingRequest(from, subject, body);
        
        if (bookingData) {
            // Send to N8N workflow
            await submitEmailBooking(bookingData);
            
            // Send confirmation reply
            await sendBookingConfirmationEmail(from, bookingData);
            
            // Mark email as read
            await gmail.users.messages.modify({
                userId: 'me',
                id: messageId,
                resource: {
                    removeLabelIds: ['UNREAD']
                }
            });
        } else {
            // Send helpful reply for unclear requests
            await sendBookingHelpEmail(from);
        }
        
    } catch (error) {
        console.error(`Error processing email ${messageId}:`, error);
    }
}

/**
 * Parse booking information from email content using NLP
 */
function parseEmailBookingRequest(from, subject, body) {
    const emailContent = `${subject} ${body}`.toLowerCase();
    
    // Extract email address
    const emailMatch = from.match(/<(.+@.+\..+)>/) || from.match(/(.+@.+\..+)/);
    const customerEmail = emailMatch ? emailMatch[1] : from;
    
    // Extract name (try to get from email name part)
    const nameMatch = from.match(/^(.+?)\s*</) || from.match(/^([^@]+)/);
    const customerName = nameMatch ? nameMatch[1].trim() : 'Customer';
    
    // Try to detect service type
    let serviceType = null;
    const services = [
        { keywords: ['signature manicure', 'basic manicure', 'regular manicure'], id: 'manicure_signature' },
        { keywords: ['gel manicure', 'gel mani'], id: 'manicure_gel' },
        { keywords: ['signature pedicure', 'basic pedicure', 'regular pedicure'], id: 'pedicure_signature' },
        { keywords: ['spa pedicure', 'luxury pedicure'], id: 'pedicure_spa' },
        { keywords: ['combo', 'mani pedi', 'manicure and pedicure'], id: 'combo_mani_pedi' },
        { keywords: ['nail art', 'design'], id: 'nail_art' }
    ];
    
    for (const service of services) {
        if (service.keywords.some(keyword => emailContent.includes(keyword))) {
            serviceType = service.id;
            break;
        }
    }
    
    // Try to extract date/time information
    const dateRegex = /\b(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}|january|february|march|april|may|june|july|august|september|october|november|december|\d{1,2}(st|nd|rd|th)?)\b/gi;
    const timeRegex = /\b(\d{1,2}:\d{2}\s*(am|pm)?|\d{1,2}\s*(am|pm))\b/gi;
    
    const dateMatches = emailContent.match(dateRegex);
    const timeMatches = emailContent.match(timeRegex);
    
    // If we have enough information, create booking request
    if (serviceType && (dateMatches || timeMatches)) {
        return {
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: '', // Will need to collect later
            service_type: serviceType,
            preferred_date: dateMatches ? dateMatches[0] : null,
            preferred_time: timeMatches ? timeMatches[0] : null,
            original_message: body,
            booking_source: 'email',
            timestamp: new Date().toISOString(),
            status: 'requires_followup'
        };
    }
    
    return null;
}

/**
 * Submit email booking to N8N workflow
 */
async function submitEmailBooking(bookingData) {
    const webhookUrl = process.env.N8N_WEBHOOK_URL || process.env.WEBHOOK_URL;
    
    if (!webhookUrl) {
        throw new Error('Webhook URL not configured');
    }
    
    const response = await axios.post(webhookUrl, {
        ...bookingData,
        action: 'email_booking_request'
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.WEBHOOK_AUTH_TOKEN}`
        }
    });
    
    return response.data;
}

/**
 * Send booking confirmation email
 */
async function sendBookingConfirmationEmail(to, bookingData) {
    const subject = `Booking Request Received - ${BUSINESS_INFO.name}`;
    const body = `
Dear ${bookingData.customer_name},

Thank you for your booking request! We've received your email and will confirm your appointment shortly.

Requested Service: ${bookingData.service_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
Preferred Date: ${bookingData.preferred_date || 'Flexible'}
Preferred Time: ${bookingData.preferred_time || 'Flexible'}

Our team will review your request and send you a confirmation with the exact appointment details within 2 hours.

If you need immediate assistance, please call us at ${BUSINESS_INFO.phone}.

Best regards,
${BUSINESS_INFO.name} Team

---
This email was automatically generated by our AI booking system.
    `.trim();
    
    await sendEmail(to, subject, body);
}

/**
 * Send booking help email for unclear requests
 */
async function sendBookingHelpEmail(to) {
    const subject = `How to Book Your Appointment - ${BUSINESS_INFO.name}`;
    const body = `
Hi there!

Thanks for reaching out! To help us book your appointment quickly, please include:

1. Your preferred service:
   • Signature Manicure ($45, 60 min)
   • Gel Manicure ($55, 75 min)
   • Signature Pedicure ($50, 75 min)
   • Spa Pedicure ($65, 90 min)
   • Mani + Pedi Combo ($85, 120 min)

2. Your preferred date and time
3. Your phone number

Example booking email:
"Hi! I'd like to book a gel manicure for this Friday at 2 PM. My phone is (555) 123-4567."

Prefer to book instantly? Try these options:
• 📞 Call us: ${BUSINESS_INFO.phone}
• 💬 Text us: ${BUSINESS_INFO.phone}
• 🌐 Online: ${BUSINESS_INFO.website}/book

Looking forward to pampering you!

${BUSINESS_INFO.name} Team
    `.trim();
    
    await sendEmail(to, subject, body);
}

/**
 * Send email using Gmail API
 */
async function sendEmail(to, subject, body) {
    try {
        const email = [
            `To: ${to}`,
            `Subject: ${subject}`,
            `Content-Type: text/plain; charset=utf-8`,
            '',
            body
        ].join('\n');
        
        const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
        
        await gmail.users.messages.send({
            userId: 'me',
            resource: {
                raw: encodedEmail
            }
        });
        
        console.log(`Email sent to ${to}`);
        
    } catch (error) {
        console.error('Failed to send email:', error);
    }
}

// Check for emails every 2 minutes
setInterval(checkForBookingEmails, 2 * 60 * 1000);

// Start server for webhook endpoint (if needed)
const port = process.env.EMAIL_PORT || 3003;
app.listen(port, () => {
    console.log(`Email booking server running on port ${port}`);
    console.log('Monitoring Gmail for booking requests...');
});

// Initial check on startup
checkForBookingEmails();

module.exports = { app, checkForBookingEmails, parseEmailBookingRequest };