# 🎯 Vapi Nail Salon Agent - Plug & Play

> **The complete voice AI appointment booking system that deploys in under 5 minutes**

A fully-featured voice AI receptionist for nail salons, spas, and beauty businesses. Built with Vapi, N8N, Supabase, and modern web technologies.

## ✨ Features

- 🗣️ **Voice AI Booking** - Natural conversation booking via Vapi
- 📅 **Calendar Sync** - Automatic Google Calendar integration  
- 💾 **Smart Database** - Supabase for appointment management
- 📧 **Email Automation** - Beautiful Gmail confirmations
- 🔄 **Full Lifecycle** - Book, check, reschedule, cancel appointments
- 📱 **Admin Dashboard** - Real-time business insights
- 🎨 **Customizable** - Easy branding and business configuration
- ⚡ **One-Click Deploy** - Complete setup in minutes

## 🚀 Super Quick Start

**Get running in 60 seconds:**

```bash
git clone https://github.com/dropfly/vapi-nail-salon-agent.git
cd vapi-nail-salon-agent
npm run quick-start
```

That's it! The interactive wizard will handle everything else.

## 📋 What You Need

Before starting, have these ready:

- **Vapi Account** - [Get free trial](https://vapi.ai)
- **N8N Instance** - [Start for free](https://n8n.cloud) 
- **Supabase Project** - [Create one](https://supabase.com)
- **Google Account** - For calendar & email

*Don't have these? No problem! Try our demo mode first:*

```bash
npm run demo
```

## 📋 Available Commands

Once installed, use these commands:

```bash
npm run quick-start      # Complete setup from scratch
npm run one-click-deploy # Interactive deployment wizard  
npm run demo            # Try without real services
npm run vapi:setup      # Configure Vapi assistant only
npm run dashboard       # Start admin dashboard
npm run help           # Show all commands
```

## 🎙️ Voice Commands

Your customers can naturally say:

- *"Hi, I'd like to book a manicure for tomorrow at 2pm"*
- *"What appointments do I have coming up?"*
- *"Can you check availability for this Saturday?"*
- *"I need to cancel my appointment for Friday"*
- *"Do you have any openings this week?"*

## ⚙️ Configuration Options

The system adapts to your business automatically, but you can customize:

### Service Types
```bash
# Edit config/services.json
{
  "signature_manicure": {
    "name": "Signature Manicure", 
    "duration": 60,
    "price": 45
  },
  "gel_pedicure": {
    "name": "Gel Pedicure",
    "duration": 75, 
    "price": 65
  }
}
```

### Business Hours & Settings
```bash
# In your .env file
BUSINESS_HOURS_MON_FRI="09:00-18:00"
BUSINESS_HOURS_SAT="09:00-16:00"
BUSINESS_HOURS_SUN="11:00-15:00"
BOOKING_ADVANCE_DAYS="30"
CANCELLATION_HOURS="24"
```

### Voice Personality
The AI can be customized to match your brand voice by editing the system prompt in `config/vapi-assistant.json`.

## 📊 Admin Dashboard

Access your business dashboard at `http://localhost:3000`:

- 📈 **Real-time Analytics** - Bookings, revenue, conversion rates
- 📅 **Appointment Management** - View, edit, cancel appointments
- 👥 **Customer Database** - Track customer history and preferences
- ⚙️ **Voice AI Settings** - Monitor and configure your assistant
- 📧 **Email Templates** - Customize confirmation messages

## 🔧 Manual Setup (Advanced)

If you prefer step-by-step setup:

1. **Environment**: Copy `.env.example` to `.env` and fill in your API keys
2. **Database**: Run the SQL in `config/database-schema.sql` in Supabase
3. **N8N**: Import `config/workflow.json` to your N8N instance
4. **Vapi**: Run `npm run vapi:setup` to configure your assistant
5. **Dashboard**: Run `npm run dashboard:install && npm run dashboard`

## 🐛 Troubleshooting

### Common Issues

**"Assistant not responding"**
- Check your Vapi API key in `.env`
- Verify the webhook URL is accessible
- Run `npm run vapi:list` to see your assistants

**"Database errors"** 
- Confirm Supabase URL and keys in `.env`
- Make sure you ran the database schema SQL

**"No appointments showing"**
- Check the business ID in your dashboard `.env.local`
- Verify data is being written to Supabase

Get help: `npm run support`

## 🚀 Deployment to Production

The system is ready for production deployment:

```bash
npm run dashboard:build  # Build dashboard for production
```

Deploy the dashboard to Vercel, Netlify, or your preferred host.
N8N workflows run in the cloud and scale automatically.

## 📚 Learn More

- **Voice AI Best Practices**: How to optimize conversation flows
- **Multi-Location Setup**: Running multiple salon locations  
- **Custom Integrations**: Adding Square, Stripe, or other services
- **Analytics & Reporting**: Advanced business intelligence

## 🤝 Support & Community

- 🐛 **Issues**: [GitHub Issues](https://github.com/dropfly/vapi-nail-salon-agent/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/dropfly/vapi-nail-salon-agent/discussions)
- 📧 **Email**: support@dropfly.ai
- 📖 **Docs**: [Full Documentation](https://docs.dropfly.ai)

## 📄 License

MIT License - Free for commercial use. See [LICENSE](LICENSE) for details.

---

**⭐ If this helps your business, please star the repo!**

Made with ❤️ by [DropFly AI](https://dropfly.ai) | Contributing to the future of voice AI