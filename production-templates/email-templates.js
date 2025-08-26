/**
 * Dynamic Email Templates for Vapi Nail Salon Agent
 * Professional HTML email templates with variable substitution
 */

const fs = require('fs');
const path = require('path');

// Load the HTML template file
const HTML_TEMPLATE_PATH = path.join(__dirname, 'email-templates.html');
let htmlTemplateContent = '';

try {
    htmlTemplateContent = fs.readFileSync(HTML_TEMPLATE_PATH, 'utf8');
} catch (error) {
    console.error('Could not load HTML template file:', error);
}

class EmailTemplates {
    constructor() {
        this.baseHTML = htmlTemplateContent;
    }

    // Helper function to replace template variables
    replaceVariables(template, variables) {
        let result = template;
        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            result = result.replace(regex, variables[key] || '');
        });
        return result;
    }

    // Helper function to format date for email display
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Helper function to format time for email display
    formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const hour12 = hours > 12 ? hours - 12 : (hours === '0' ? 12 : hours);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${ampm}`;
    }

    // Generate booking confirmation email
    generateConfirmationEmail(appointmentData) {
        const variables = {
            CUSTOMER_NAME: appointmentData.customer_name,
            SERVICE_NAME: appointmentData.service_name,
            APPOINTMENT_DATE: this.formatDate(appointmentData.appointment_date),
            APPOINTMENT_TIME: this.formatTime(appointmentData.start_time),
            DURATION: appointmentData.duration_minutes || '60',
            PRICE: appointmentData.price || 'TBD',
            BOOKING_ID: appointmentData.booking_id,
            RESCHEDULE_LINK: `${process.env.BASE_URL || 'https://glamournails.com'}/reschedule?id=${appointmentData.booking_id}`,
            CANCEL_LINK: `${process.env.BASE_URL || 'https://glamournails.com'}/cancel?id=${appointmentData.booking_id}`,
            UNSUBSCRIBE_LINK: `${process.env.BASE_URL || 'https://glamournails.com'}/unsubscribe?email=${appointmentData.customer_email}`
        };

        // Extract just the confirmation template from the full HTML
        const confirmationMatch = this.baseHTML.match(/<div class="email-container" id="confirmation-template"[\s\S]*?(?=<div class="email-container" id="reminder-template"|$)/);
        const template = confirmationMatch ? confirmationMatch[0] : this.baseHTML;

        return {
            html: this.replaceVariables(template, variables),
            subject: `Appointment Confirmed - ${this.formatDate(appointmentData.appointment_date)} at ${this.formatTime(appointmentData.start_time)}`,
            to: appointmentData.customer_email,
            from: process.env.EMAIL_FROM || 'hello@glamournails.com'
        };
    }

    // Generate 24-hour reminder email
    generateReminderEmail(appointmentData) {
        const variables = {
            CUSTOMER_NAME: appointmentData.customer_name,
            SERVICE_NAME: appointmentData.service_name,
            APPOINTMENT_DATE: this.formatDate(appointmentData.appointment_date),
            APPOINTMENT_TIME: this.formatTime(appointmentData.start_time),
            CONFIRM_LINK: `${process.env.BASE_URL || 'https://glamournails.com'}/confirm?id=${appointmentData.booking_id}`
        };

        // Extract the reminder template
        const reminderMatch = this.baseHTML.match(/<div class="email-container" id="reminder-template"[\s\S]*?(?=<div class="email-container" id="followup-template"|$)/);
        const template = reminderMatch ? reminderMatch[0] : '';

        return {
            html: this.replaceVariables(template, variables),
            subject: `Reminder: Your appointment tomorrow at ${this.formatTime(appointmentData.start_time)}`,
            to: appointmentData.customer_email,
            from: process.env.EMAIL_FROM || 'hello@glamournails.com'
        };
    }

    // Generate thank you follow-up email
    generateThankYouEmail(appointmentData) {
        const variables = {
            CUSTOMER_NAME: appointmentData.customer_name,
            SERVICE_NAME: appointmentData.service_name,
            GOOGLE_REVIEW_LINK: 'https://g.page/r/your-google-business-id/review',
            BOOK_NEXT_LINK: `${process.env.BASE_URL || 'https://glamournails.com'}/book`,
            UNSUBSCRIBE_LINK: `${process.env.BASE_URL || 'https://glamournails.com'}/unsubscribe?email=${appointmentData.customer_email}`
        };

        // Extract the follow-up template
        const followupMatch = this.baseHTML.match(/<div class="email-container" id="followup-template"[\s\S]*?(?=<div class="email-container" id="promotional-template"|$)/);
        const template = followupMatch ? followupMatch[0] : '';

        return {
            html: this.replaceVariables(template, variables),
            subject: `Thank you for visiting Glamour Nails! ✨`,
            to: appointmentData.customer_email,
            from: process.env.EMAIL_FROM || 'hello@glamournails.com'
        };
    }

    // Generate promotional email
    generatePromotionalEmail(customerData, promoData) {
        const variables = {
            CUSTOMER_NAME: customerData.customer_name,
            PROMOTION_TITLE: promoData.title,
            DISCOUNT_PERCENTAGE: promoData.discount_percentage,
            PROMOTION_DETAILS: promoData.details,
            EXPIRY_DATE: this.formatDate(promoData.expiry_date),
            PROMO_CODE: promoData.code,
            BOOK_NOW_LINK: `${process.env.BASE_URL || 'https://glamournails.com'}/book?promo=${promoData.code}`,
            UNSUBSCRIBE_LINK: `${process.env.BASE_URL || 'https://glamournails.com'}/unsubscribe?email=${customerData.customer_email}`
        };

        // Extract the promotional template
        const promoMatch = this.baseHTML.match(/<div class="email-container" id="promotional-template"[\s\S]*?(?=<\/body>|$)/);
        const template = promoMatch ? promoMatch[0] : '';

        return {
            html: this.replaceVariables(template, variables),
            subject: `🎉 ${promoData.title} - Save ${promoData.discount_percentage}%!`,
            to: customerData.customer_email,
            from: process.env.EMAIL_FROM || 'hello@glamournails.com'
        };
    }

    // Generate cancellation confirmation email
    generateCancellationEmail(appointmentData) {
        const simpleTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                .email-container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
                .header { background: #ff6b9d; color: white; padding: 20px; text-align: center; }
                .content { padding: 30px 20px; }
                .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h2>💅 Glamour Nails</h2>
                </div>
                <div class="content">
                    <h2>Appointment Cancelled</h2>
                    <p>Hi <strong>{{CUSTOMER_NAME}}</strong>,</p>
                    <p>Your <strong>{{SERVICE_NAME}}</strong> appointment scheduled for <strong>{{APPOINTMENT_DATE}}</strong> at <strong>{{APPOINTMENT_TIME}}</strong> has been successfully cancelled.</p>
                    <p>We understand that plans change! We hope to see you again soon.</p>
                    <p>To book a new appointment, call us at <strong>(424) 351-9304</strong> or use our AI booking system anytime.</p>
                    <p>Thank you,<br>💕 The Glamour Nails Team</p>
                </div>
                <div class="footer">
                    <strong>Glamour Nails</strong><br>
                    123 Beauty Lane, Los Angeles, CA 90210<br>
                    Phone: (424) 351-9304
                </div>
            </div>
        </body>
        </html>`;

        const variables = {
            CUSTOMER_NAME: appointmentData.customer_name,
            SERVICE_NAME: appointmentData.service_name,
            APPOINTMENT_DATE: this.formatDate(appointmentData.appointment_date),
            APPOINTMENT_TIME: this.formatTime(appointmentData.start_time)
        };

        return {
            html: this.replaceVariables(simpleTemplate, variables),
            subject: `Appointment Cancelled - ${this.formatDate(appointmentData.appointment_date)}`,
            to: appointmentData.customer_email,
            from: process.env.EMAIL_FROM || 'hello@glamournails.com'
        };
    }
}

// Pre-defined promotional campaigns
const PROMO_CAMPAIGNS = {
    slow_day_special: {
        title: "Today Only - 20% Off All Services!",
        discount_percentage: 20,
        details: "All manicures, pedicures, and enhancements",
        code: "TODAY20",
        expiry_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    },
    
    birthday_special: {
        title: "Happy Birthday - Special Gift Inside!",
        discount_percentage: 25,
        details: "Celebrate your special day with us!",
        code: "BIRTHDAY25",
        expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week
    },
    
    holiday_promo: {
        title: "Holiday Special - Treat Yourself!",
        discount_percentage: 15,
        details: "Perfect for the holiday season",
        code: "HOLIDAY15",
        expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 2 weeks
    },
    
    referral_bonus: {
        title: "Refer a Friend - You Both Save!",
        discount_percentage: 15,
        details: "When your friend books, you both get 15% off",
        code: "FRIEND15",
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 1 month
    }
};

// Usage examples
const USAGE_EXAMPLES = {
    // Example appointment data structure
    sampleAppointment: {
        booking_id: "12345",
        customer_name: "Sarah Johnson",
        customer_email: "sarah@email.com",
        service_name: "Gel Manicure",
        appointment_date: "2024-03-15",
        start_time: "14:00",
        duration_minutes: 60,
        price: "45.00"
    },
    
    // Example customer data structure
    sampleCustomer: {
        customer_name: "Sarah Johnson",
        customer_email: "sarah@email.com"
    },
    
    // How to use the templates
    usage: `
    const emailTemplates = new EmailTemplates();
    
    // Booking confirmation
    const confirmationEmail = emailTemplates.generateConfirmationEmail(appointmentData);
    
    // Send with your email service (Sendgrid, Mailgun, etc.)
    await emailService.send(confirmationEmail);
    
    // Promotional campaign
    const promoEmail = emailTemplates.generatePromotionalEmail(
        customerData, 
        PROMO_CAMPAIGNS.slow_day_special
    );
    `
};

module.exports = {
    EmailTemplates,
    PROMO_CAMPAIGNS,
    USAGE_EXAMPLES
};