# 📱 Multi-Channel Booking Guide

Your customers can now book appointments through **6 different channels**! Here's how to set up and use each one:

## 🎯 Available Booking Channels

| Channel | Setup Time | Customer Experience | Best For |
|---------|------------|-------------------|----------|
| 📞 **Voice Calls** | ✅ Ready | Call and speak naturally | Quick bookings, older customers |
| 🌐 **Website Widget** | 5 minutes | Fill form on your site | Tech-savvy customers |
| 💬 **SMS/Text** | 10 minutes | Text conversation | Millennials/Gen Z |
| 📱 **WhatsApp** | 15 minutes | Rich messaging experience | International, visual users |
| 📧 **Email** | 10 minutes | Send booking request email | Detailed requests, business clients |
| 💻 **Admin Dashboard** | ✅ Ready | Staff books for customers | Phone bookings, walk-ins |

---

## 📞 Voice Calls (Already Working!)

**Customer Experience:**
- Calls your Vapi phone number
- Speaks naturally: *"I'd like a manicure tomorrow at 2 PM"*
- AI handles the entire booking process

**Setup:** Already configured! ✅

---

## 🌐 Website Booking Widget

**Customer Experience:**
- Visits your website
- Fills out booking form
- Gets instant confirmation

### Setup Instructions:

**Option 1: Full Page Widget**
```html
<!-- Add to any page on your website -->
<iframe src="https://your-domain.com/booking-widget" 
        width="100%" height="600" frameborder="0">
</iframe>
```

**Option 2: Embedded Widget**
```html
<!-- Add to your website -->
<script src="https://your-domain.com/booking-widget/embed.js"></script>
<div id="dropfly-booking-widget"></div>
```

**Files to deploy:**
- `src/booking-widget/index.html` - Full page version
- `src/booking-widget/embed.js` - Embeddable version

**Configuration:**
Edit the webhook URL in both files:
```javascript
WEBHOOK_URL: 'https://your-n8n-instance.app.n8n.cloud/webhook/web-booking'
```

---

## 💬 SMS/Text Booking

**Customer Experience:**
- Texts your business number
- AI guides them through booking
- Natural conversation flow

### Setup Instructions:

1. **Install dependencies:**
```bash
cd src/sms-booking
npm install express twilio
```

2. **Configure environment variables:**
```bash
# Add to your .env file
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
SMS_PORT=3001
```

3. **Start SMS server:**
```bash
npm run sms:start
```

4. **Configure Twilio webhook:**
- Go to Twilio Console → Phone Numbers
- Set webhook URL: `https://your-domain.com/webhook/sms`

**Customer texts examples:**
- *"Hi, I want to book a manicure"*
- *"Schedule appointment tomorrow 2pm"*
- *"Available Friday afternoon?"*

---

## 📱 WhatsApp Business

**Customer Experience:**
- Messages your WhatsApp Business number
- Interactive buttons and menus
- Rich media responses

### Setup Instructions:

1. **Get WhatsApp Business Account:**
- Apply at [business.whatsapp.com](https://business.whatsapp.com)
- Get verified (may take 1-2 weeks)

2. **Configure environment variables:**
```bash
# Add to your .env file
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token
WHATSAPP_PORT=3002
```

3. **Start WhatsApp server:**
```bash
npm run whatsapp:start
```

4. **Configure webhook:**
- Facebook Developer Console → WhatsApp → Configuration
- Webhook URL: `https://your-domain.com/webhook/whatsapp`

**Features:**
- ✅ Interactive buttons
- ✅ Service menus
- ✅ Rich media messages
- ✅ Business profile integration

---

## 📧 Email Booking

**Customer Experience:**
- Sends email with booking request
- Gets automatic confirmation
- Follow-up for missing details

### Setup Instructions:

1. **Configure Google Gmail API:**
```bash
# Add to your .env file
GOOGLE_CLIENT_ID=your_gmail_client_id
GOOGLE_CLIENT_SECRET=your_gmail_client_secret
GOOGLE_REFRESH_TOKEN=your_gmail_refresh_token
EMAIL_PORT=3003
```

2. **Start email monitor:**
```bash
npm run email:start
```

3. **Customer email examples:**
```
Subject: Appointment Booking
Body: Hi! I'd like to book a gel manicure for this Friday at 2 PM. 
My phone is (555) 123-4567.
```

**Features:**
- ✅ Automatic email parsing
- ✅ Service detection
- ✅ Date/time extraction
- ✅ Confirmation replies

---

## 💻 Admin Dashboard

**Staff Experience:**
- Log in to dashboard
- Book appointments manually
- Manage customer database

**Setup:** Already working at `http://localhost:3000` ✅

---

## 🚀 Quick Deploy All Channels

Want to enable everything at once?

```bash
# 1. Install all dependencies
npm run install:all

# 2. Configure all services (one-time setup)
npm run configure:channels

# 3. Start all booking channels
npm run start:all-channels
```

This starts:
- SMS booking server (port 3001)
- WhatsApp server (port 3002)  
- Email monitor (port 3003)
- Dashboard (port 3000)

---

## 📊 Channel Analytics

Track bookings by channel in your dashboard:

- **Voice Calls**: Tracked automatically via Vapi
- **Website**: Tagged as `web_widget`
- **SMS**: Tagged as `sms`
- **WhatsApp**: Tagged as `whatsapp`
- **Email**: Tagged as `email`
- **Admin**: Tagged as `admin_manual`

---

## 🔧 Advanced Configuration

### Custom Business Hours per Channel
```javascript
// Different hours for different channels
const CHANNEL_HOURS = {
    voice: '24/7',      // AI never sleeps
    sms: '9 AM - 9 PM', // Business hours
    whatsapp: '9 AM - 9 PM',
    email: '24/7',      // Auto-response always
    website: '24/7'     // Always available
};
```

### Channel-Specific Services
```javascript
// Offer different services per channel
const CHANNEL_SERVICES = {
    voice: 'all',       // Full service menu
    sms: 'basic',       // Popular services only
    whatsapp: 'all',    // Full menu with images
    email: 'detailed',  // Detailed descriptions
    website: 'all'      // Full interactive menu
};
```

### Pricing Strategies
```javascript
// Different pricing per channel
const CHANNEL_PRICING = {
    voice: 'standard',     // Regular prices
    website: 'discount',   // 5% online discount
    whatsapp: 'premium',   // Add convenience fee
    sms: 'standard',
    email: 'standard'
};
```

---

## 🎯 Marketing Each Channel

**Promote to customers:**

**Voice:** *"Call us anytime! Our AI receptionist is available 24/7"*

**Website:** *"Book online in 60 seconds! Get instant confirmation"*

**SMS:** *"Text us to book! Just message: 'Book manicure Friday 2pm'"*

**WhatsApp:** *"Message us on WhatsApp for instant booking with photos!"*

**Email:** *"Email your booking request - we'll confirm within 2 hours"*

---

## 🔍 Troubleshooting

**Website widget not showing?**
- Check webhook URL is correct
- Verify CORS settings
- Test with browser dev tools

**SMS not working?**
- Verify Twilio credentials
- Check webhook URL is accessible
- Test with Twilio debugger

**WhatsApp setup issues?**
- Ensure business verification complete
- Check webhook verification token
- Review Facebook app permissions

**Email parsing errors?**
- Check Gmail API credentials
- Verify OAuth2 scope includes Gmail
- Test with simple booking emails

---

## 📞 Support

Need help setting up multi-channel booking?

- 📧 **Email**: support@dropfly.ai
- 💬 **Discord**: [Join our community](https://discord.gg/dropfly)
- 📖 **Docs**: [Full documentation](https://docs.dropfly.ai)

---

**🎉 Your customers can now book appointments however they prefer!**