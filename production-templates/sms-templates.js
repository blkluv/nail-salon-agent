/**
 * SMS Templates for Vapi Nail Salon Agent
 * All messages are under 160 characters for single SMS delivery
 * Phone number: +14243519304
 */

const SMS_TEMPLATES = {
  // Appointment Confirmation (sent immediately after booking)
  confirmation: (customerName, service, date, time) => 
    `Hi ${customerName}! Your ${service} is confirmed for ${date} at ${time}. See you soon! Reply CANCEL to cancel. - Glamour Nails`,

  // 24-hour reminder
  reminder_24h: (customerName, service, date, time) => 
    `Hi ${customerName}! Reminder: ${service} tomorrow ${date} at ${time}. Reply CANCEL if needed. Thanks! - Glamour Nails`,

  // 2-hour reminder
  reminder_2h: (customerName, service, time) => 
    `Hi ${customerName}! Your ${service} starts in 2 hours at ${time}. We're excited to see you! - Glamour Nails`,

  // Cancellation confirmation
  cancellation_confirmation: (customerName, service, date) => 
    `Hi ${customerName}, your ${service} on ${date} has been cancelled. Book again anytime! Call ${process.env.SALON_PHONE || '(424) 351-9304'}`,

  // No-show follow up (sent 30 mins after missed appointment)
  no_show_followup: (customerName) => 
    `Hi ${customerName}, we missed you today! Life happens - book your next appointment anytime. We're here when you're ready! - Glamour Nails`,

  // Thank you follow-up (sent 2 hours after appointment)
  thank_you: (customerName, service) => 
    `Hi ${customerName}! Thanks for choosing us for your ${service}! We'd love a Google review. Book again: Call (424) 351-9304`,

  // Promotional - Slow day special
  slow_day_promo: () => 
    `🎉 TODAY ONLY: 20% off all services! Book now - limited spots available. Call (424) 351-9304 or book by voice AI! - Glamour Nails`,

  // Birthday special
  birthday_special: (customerName) => 
    `🎂 Happy Birthday ${customerName}! Celebrate with 25% off any service this week. Call (424) 351-9304 to book! - Glamour Nails`,

  // Holiday promotion
  holiday_promo: (holiday, discount) => 
    `✨ ${holiday} Special! ${discount}% off all services through weekend. Book now: (424) 351-9304 - Glamour Nails`,

  // Loyalty program invitation
  loyalty_invite: (customerName) => 
    `Hi ${customerName}! You've earned VIP status! Get 10% off every 5th visit. Thanks for being a loyal customer! - Glamour Nails`,

  // Weather-based promotion
  weather_promo: (weatherCondition) => 
    `Perfect ${weatherCondition} for some self-care! Walk-ins welcome or call (424) 351-9304. Treat yourself today! - Glamour Nails`,

  // Auto-responder for after-hours texts
  after_hours: () => 
    `Thanks for texting! We're closed but our AI can book your appointment 24/7. Call (424) 351-9304 now to book by voice! - Glamour Nails`,

  // SMS booking confirmation (when someone texts to book)
  sms_booking_received: (customerName) => 
    `Hi ${customerName}! Got your booking request. Our AI will call you in 2 minutes to confirm details. Thanks! - Glamour Nails`,

  // Rescheduling confirmation
  reschedule_confirmation: (customerName, oldDate, newDate, time) => 
    `Hi ${customerName}! Moved your appointment from ${oldDate} to ${newDate} at ${time}. See you then! - Glamour Nails`,

  // Waitlist notification
  waitlist_available: (customerName, date, time) => 
    `Hi ${customerName}! A spot opened up on ${date} at ${time}. Interested? Reply YES or call (424) 351-9304 - Glamour Nails`,

  // Package deal promotion
  package_promo: () => 
    `💅 PACKAGE SPECIAL: Buy 3 manicures, get the 4th FREE! Valid all month. Call (424) 351-9304 to book! - Glamour Nails`
};

// Helper function to format dates for SMS
function formatDateForSMS(dateString) {
  const date = new Date(dateString);
  const options = { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
}

// Helper function to format time for SMS
function formatTimeForSMS(timeString) {
  const [hours, minutes] = timeString.split(':');
  const hour12 = hours > 12 ? hours - 12 : hours;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${hour12}:${minutes}${ampm}`;
}

// Usage examples with proper formatting
const EXAMPLES = {
  confirmation: SMS_TEMPLATES.confirmation(
    'Sarah', 
    'gel manicure', 
    formatDateForSMS('2024-03-15'), 
    formatTimeForSMS('14:00')
  ),
  
  reminder: SMS_TEMPLATES.reminder_24h(
    'Sarah', 
    'gel manicure', 
    formatDateForSMS('2024-03-15'), 
    formatTimeForSMS('14:00')
  ),
  
  promo: SMS_TEMPLATES.slow_day_promo()
};

module.exports = {
  SMS_TEMPLATES,
  formatDateForSMS,
  formatTimeForSMS,
  EXAMPLES
};