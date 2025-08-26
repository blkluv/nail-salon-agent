/**
 * Twilio SMS Integration for Vapi Nail Salon Agent
 * Handles sending automated SMS notifications and receiving replies
 * Phone: +14243519304
 */

const twilio = require('twilio');
const { SMS_TEMPLATES, formatDateForSMS, formatTimeForSMS } = require('./sms-templates');

class TwilioSMSService {
    constructor() {
        // Initialize Twilio client with environment variables
        this.accountSid = process.env.TWILIO_ACCOUNT_SID;
        this.authToken = process.env.TWILIO_AUTH_TOKEN;
        this.phoneNumber = process.env.TWILIO_PHONE_NUMBER || '+14243519304';
        
        if (!this.accountSid || !this.authToken) {
            console.error('⚠️ TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set');
            return;
        }
        
        this.client = twilio(this.accountSid, this.authToken);
        console.log(`📱 Twilio SMS Service initialized with number: ${this.phoneNumber}`);
    }

    // Send booking confirmation SMS
    async sendBookingConfirmation(appointmentData) {
        try {
            const message = SMS_TEMPLATES.confirmation(
                appointmentData.customer_name,
                appointmentData.service_name,
                formatDateForSMS(appointmentData.appointment_date),
                formatTimeForSMS(appointmentData.start_time)
            );

            const result = await this.client.messages.create({
                body: message,
                from: this.phoneNumber,
                to: appointmentData.customer_phone
            });

            console.log('✅ Confirmation SMS sent:', result.sid);
            return { success: true, messageId: result.sid };
        } catch (error) {
            console.error('❌ Error sending confirmation SMS:', error);
            return { success: false, error: error.message };
        }
    }

    // Send 24-hour reminder SMS
    async sendReminder24h(appointmentData) {
        try {
            const message = SMS_TEMPLATES.reminder_24h(
                appointmentData.customer_name,
                appointmentData.service_name,
                formatDateForSMS(appointmentData.appointment_date),
                formatTimeForSMS(appointmentData.start_time)
            );

            const result = await this.client.messages.create({
                body: message,
                from: this.phoneNumber,
                to: appointmentData.customer_phone
            });

            console.log('✅ 24h reminder SMS sent:', result.sid);
            return { success: true, messageId: result.sid };
        } catch (error) {
            console.error('❌ Error sending 24h reminder SMS:', error);
            return { success: false, error: error.message };
        }
    }

    // Send 2-hour reminder SMS
    async sendReminder2h(appointmentData) {
        try {
            const message = SMS_TEMPLATES.reminder_2h(
                appointmentData.customer_name,
                appointmentData.service_name,
                formatTimeForSMS(appointmentData.start_time)
            );

            const result = await this.client.messages.create({
                body: message,
                from: this.phoneNumber,
                to: appointmentData.customer_phone
            });

            console.log('✅ 2h reminder SMS sent:', result.sid);
            return { success: true, messageId: result.sid };
        } catch (error) {
            console.error('❌ Error sending 2h reminder SMS:', error);
            return { success: false, error: error.message };
        }
    }

    // Send cancellation confirmation SMS
    async sendCancellationConfirmation(appointmentData) {
        try {
            const message = SMS_TEMPLATES.cancellation_confirmation(
                appointmentData.customer_name,
                appointmentData.service_name,
                formatDateForSMS(appointmentData.appointment_date)
            );

            const result = await this.client.messages.create({
                body: message,
                from: this.phoneNumber,
                to: appointmentData.customer_phone
            });

            console.log('✅ Cancellation SMS sent:', result.sid);
            return { success: true, messageId: result.sid };
        } catch (error) {
            console.error('❌ Error sending cancellation SMS:', error);
            return { success: false, error: error.message };
        }
    }

    // Send promotional SMS
    async sendPromotionalSMS(customerPhone, customerName, promoType = 'slow_day_promo') {
        try {
            let message;
            
            switch (promoType) {
                case 'birthday':
                    message = SMS_TEMPLATES.birthday_special(customerName);
                    break;
                case 'holiday':
                    message = SMS_TEMPLATES.holiday_promo('Holiday', 20);
                    break;
                case 'loyalty':
                    message = SMS_TEMPLATES.loyalty_invite(customerName);
                    break;
                default:
                    message = SMS_TEMPLATES.slow_day_promo();
            }

            const result = await this.client.messages.create({
                body: message,
                from: this.phoneNumber,
                to: customerPhone
            });

            console.log('✅ Promotional SMS sent:', result.sid);
            return { success: true, messageId: result.sid };
        } catch (error) {
            console.error('❌ Error sending promotional SMS:', error);
            return { success: false, error: error.message };
        }
    }

    // Send thank you follow-up SMS
    async sendThankYouFollowUp(appointmentData) {
        try {
            const message = SMS_TEMPLATES.thank_you(
                appointmentData.customer_name,
                appointmentData.service_name
            );

            const result = await this.client.messages.create({
                body: message,
                from: this.phoneNumber,
                to: appointmentData.customer_phone
            });

            console.log('✅ Thank you SMS sent:', result.sid);
            return { success: true, messageId: result.sid };
        } catch (error) {
            console.error('❌ Error sending thank you SMS:', error);
            return { success: false, error: error.message };
        }
    }
}

// Webhook handler for incoming SMS messages
class SMSWebhookHandler {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.smsService = new TwilioSMSService();
    }

    // Main webhook handler for Twilio SMS webhooks
    async handleIncomingSMS(req, res) {
        try {
            const { Body: messageBody, From: customerPhone, To: businessPhone } = req.body;
            
            console.log(`📨 Incoming SMS from ${customerPhone}: ${messageBody}`);

            // Validate webhook authenticity (recommended for production)
            if (process.env.TWILIO_AUTH_TOKEN) {
                const twiml = require('twilio').twiml;
                const twilioSignature = req.headers['x-twilio-signature'];
                const requestUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
                
                const isValid = twilio.validateRequest(
                    process.env.TWILIO_AUTH_TOKEN,
                    twilioSignature,
                    requestUrl,
                    req.body
                );
                
                if (!isValid) {
                    console.error('❌ Invalid Twilio webhook signature');
                    return res.status(403).send('Forbidden');
                }
            }

            // Process the message based on content
            const response = await this.processMessage(messageBody.toLowerCase(), customerPhone);
            
            // Log the interaction
            await this.logSMSInteraction(customerPhone, messageBody, response);

            // Send TwiML response
            const twiml = new twilio.twiml.MessagingResponse();
            if (response) {
                twiml.message(response);
            }
            
            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.end(twiml.toString());

        } catch (error) {
            console.error('❌ Error handling incoming SMS:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    // Process incoming SMS messages and generate appropriate responses
    async processMessage(messageBody, customerPhone) {
        const cleanPhone = customerPhone.replace(/\D/g, ''); // Remove non-digits
        
        // Handle cancellation requests
        if (messageBody.includes('cancel') || messageBody.includes('stop')) {
            return await this.handleCancellationRequest(customerPhone);
        }
        
        // Handle confirmation requests
        if (messageBody.includes('yes') || messageBody.includes('confirm')) {
            return await this.handleConfirmationRequest(customerPhone);
        }
        
        // Handle booking requests
        if (messageBody.includes('book') || messageBody.includes('appointment')) {
            return this.handleBookingRequest(customerPhone);
        }
        
        // Handle general inquiries
        if (messageBody.includes('hours') || messageBody.includes('open')) {
            return this.getBusinessHours();
        }
        
        if (messageBody.includes('price') || messageBody.includes('cost')) {
            return this.getPricingInfo();
        }
        
        if (messageBody.includes('location') || messageBody.includes('address')) {
            return this.getLocationInfo();
        }
        
        // Check if it's after hours
        if (this.isAfterHours()) {
            return SMS_TEMPLATES.after_hours();
        }
        
        // Default response - redirect to voice booking
        return `Hi! Thanks for texting Glamour Nails! For booking, our AI can help you 24/7. Just call (424) 351-9304 to book by voice. For urgent matters, we're here during business hours!`;
    }

    // Handle cancellation requests via SMS
    async handleCancellationRequest(customerPhone) {
        try {
            // Look up upcoming appointments for this phone number
            const { data: appointments, error } = await this.supabase
                .from('appointments')
                .select('*')
                .eq('customer_phone', customerPhone)
                .eq('status', 'scheduled')
                .gte('appointment_date', new Date().toISOString().split('T')[0])
                .order('appointment_date', { ascending: true })
                .limit(1);

            if (error) {
                console.error('Database error:', error);
                return `Sorry, I had trouble finding your appointment. Please call (424) 351-9304 for assistance.`;
            }

            if (!appointments || appointments.length === 0) {
                return `I don't see any upcoming appointments for this number. If you need help, please call (424) 351-9304.`;
            }

            const appointment = appointments[0];
            
            // Cancel the appointment
            const { error: updateError } = await this.supabase
                .from('appointments')
                .update({ 
                    status: 'cancelled',
                    internal_notes: 'Cancelled via SMS'
                })
                .eq('id', appointment.id);

            if (updateError) {
                console.error('Error cancelling appointment:', updateError);
                return `Sorry, I had trouble cancelling your appointment. Please call (424) 351-9304.`;
            }

            return `Your ${appointment.customer_name ? appointment.customer_name + "'s " : ""}appointment on ${formatDateForSMS(appointment.appointment_date)} at ${formatTimeForSMS(appointment.start_time)} has been cancelled. We hope to see you again soon!`;

        } catch (error) {
            console.error('Error handling cancellation:', error);
            return `Sorry, I had trouble processing your cancellation. Please call (424) 351-9304 for immediate assistance.`;
        }
    }

    // Handle confirmation requests via SMS
    async handleConfirmationRequest(customerPhone) {
        try {
            // Look up upcoming appointments
            const { data: appointments, error } = await this.supabase
                .from('appointments')
                .select('*')
                .eq('customer_phone', customerPhone)
                .eq('status', 'scheduled')
                .gte('appointment_date', new Date().toISOString().split('T')[0])
                .order('appointment_date', { ascending: true })
                .limit(1);

            if (appointments && appointments.length > 0) {
                const appointment = appointments[0];
                return `Perfect! Your ${appointment.service_name || 'appointment'} is confirmed for ${formatDateForSMS(appointment.appointment_date)} at ${formatTimeForSMS(appointment.start_time)}. See you then!`;
            } else {
                return `I don't see any upcoming appointments to confirm. Need to book? Call (424) 351-9304!`;
            }
        } catch (error) {
            console.error('Error handling confirmation:', error);
            return `Thanks for confirming! If you have any questions, call (424) 351-9304.`;
        }
    }

    // Handle booking requests via SMS
    handleBookingRequest(customerPhone) {
        return SMS_TEMPLATES.sms_booking_received('there');
    }

    // Get business hours info
    getBusinessHours() {
        return `We're open Mon-Sat 9AM-7PM, Sun 10AM-5PM. Book anytime with our AI: Call (424) 351-9304!`;
    }

    // Get pricing info
    getPricingInfo() {
        return `Gel Manicure $45, Classic $35, Pedicure $50, Combo $80. Full prices at glamournails.com or call (424) 351-9304!`;
    }

    // Get location info
    getLocationInfo() {
        return `📍 123 Beauty Lane, Los Angeles, CA 90210. Free parking in rear! Questions? Call (424) 351-9304`;
    }

    // Check if current time is after business hours
    isAfterHours() {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay(); // 0 = Sunday, 6 = Saturday
        
        // Basic hours: Mon-Sat 9AM-7PM, Sun 10AM-5PM
        if (day === 0) { // Sunday
            return hour < 10 || hour >= 17;
        } else if (day >= 1 && day <= 6) { // Monday-Saturday
            return hour < 9 || hour >= 19;
        }
        
        return false;
    }

    // Log SMS interactions for analytics
    async logSMSInteraction(customerPhone, message, response) {
        try {
            await this.supabase
                .from('sms_interactions')
                .insert({
                    customer_phone: customerPhone,
                    incoming_message: message,
                    response_sent: response,
                    created_at: new Date().toISOString()
                });
        } catch (error) {
            console.error('Error logging SMS interaction:', error);
        }
    }
}

// Automated SMS scheduling functions
class SMSScheduler {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.smsService = new TwilioSMSService();
    }

    // Schedule 24-hour reminders (run daily)
    async send24HourReminders() {
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowDate = tomorrow.toISOString().split('T')[0];

            const { data: appointments, error } = await this.supabase
                .from('appointments')
                .select('*')
                .eq('appointment_date', tomorrowDate)
                .eq('status', 'scheduled')
                .is('reminder_24h_sent', null);

            if (error) {
                console.error('Error fetching appointments for reminders:', error);
                return;
            }

            console.log(`📅 Sending 24h reminders for ${appointments?.length || 0} appointments`);

            for (const appointment of appointments || []) {
                await this.smsService.sendReminder24h(appointment);
                
                // Mark as sent
                await this.supabase
                    .from('appointments')
                    .update({ reminder_24h_sent: new Date().toISOString() })
                    .eq('id', appointment.id);
                    
                // Small delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (error) {
            console.error('Error sending 24h reminders:', error);
        }
    }

    // Schedule 2-hour reminders (run every hour)
    async send2HourReminders() {
        try {
            const now = new Date();
            const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
            const today = now.toISOString().split('T')[0];
            const targetHour = twoHoursLater.getHours().toString().padStart(2, '0') + ':00';

            const { data: appointments, error } = await this.supabase
                .from('appointments')
                .select('*')
                .eq('appointment_date', today)
                .eq('start_time', targetHour)
                .eq('status', 'scheduled')
                .is('reminder_2h_sent', null);

            if (error) {
                console.error('Error fetching appointments for 2h reminders:', error);
                return;
            }

            console.log(`⏰ Sending 2h reminders for ${appointments?.length || 0} appointments`);

            for (const appointment of appointments || []) {
                await this.smsService.sendReminder2h(appointment);
                
                // Mark as sent
                await this.supabase
                    .from('appointments')
                    .update({ reminder_2h_sent: new Date().toISOString() })
                    .eq('id', appointment.id);
            }
        } catch (error) {
            console.error('Error sending 2h reminders:', error);
        }
    }

    // Send thank you messages (run every 2 hours)
    async sendThankYouMessages() {
        try {
            const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
            const today = twoHoursAgo.toISOString().split('T')[0];
            const targetHour = twoHoursAgo.getHours().toString().padStart(2, '0') + ':00';

            const { data: appointments, error } = await this.supabase
                .from('appointments')
                .select('*')
                .eq('appointment_date', today)
                .eq('start_time', targetHour)
                .eq('status', 'completed')
                .is('thank_you_sent', null);

            if (error) {
                console.error('Error fetching completed appointments:', error);
                return;
            }

            console.log(`💕 Sending thank you messages for ${appointments?.length || 0} appointments`);

            for (const appointment of appointments || []) {
                await this.smsService.sendThankYouFollowUp(appointment);
                
                // Mark as sent
                await this.supabase
                    .from('appointments')
                    .update({ thank_you_sent: new Date().toISOString() })
                    .eq('id', appointment.id);
            }
        } catch (error) {
            console.error('Error sending thank you messages:', error);
        }
    }
}

// Integration with main webhook server
function addSMSWebhookToServer(app, supabaseClient) {
    const webhookHandler = new SMSWebhookHandler(supabaseClient);
    
    // Twilio webhook endpoint for incoming SMS
    app.post('/webhook/sms', express.raw({ type: 'application/x-www-form-urlencoded' }), 
        async (req, res) => {
            await webhookHandler.handleIncomingSMS(req, res);
        }
    );
    
    console.log('📱 SMS webhook endpoint added: /webhook/sms');
}

module.exports = {
    TwilioSMSService,
    SMSWebhookHandler,
    SMSScheduler,
    addSMSWebhookToServer
};