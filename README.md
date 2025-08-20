# 🎯 Vapi Nail Salon Agent - Plug & Play

A complete voice AI appointment booking system for nail salons using Vapi, N8N, and modern integrations.

## ✨ Features

- 🗣️ **Voice AI Booking** - Natural language appointment booking via Vapi
- 📅 **Calendar Integration** - Automatic Google Calendar sync
- 💾 **Database Storage** - Supabase for appointment management
- 📧 **Email Confirmations** - Beautiful Gmail notifications
- 🔄 **Full Lifecycle** - Book, check, reschedule, and cancel appointments
- 🎨 **Customizable** - Easy branding and business configuration

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- N8N instance (cloud or self-hosted)
- Vapi account with phone number
- Supabase project
- Google Workspace account

### Installation

1. **Clone & Install**
```bash
git clone https://github.com/dropfly/vapi-nail-salon-agent.git
cd vapi-nail-salon-agent
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. **Run Setup**
```bash
npm run setup
```

This will:
- Import the N8N workflow
- Create Supabase database tables
- Configure Vapi assistant
- Set up Google integrations
- Test all connections

## 📋 Configuration

### Required Services

| Service | Purpose | Setup Guide |
|---------|---------|-------------|
| **Vapi** | Voice AI platform | [docs/vapi-setup.md](docs/vapi-setup.md) |
| **N8N** | Workflow automation | [docs/n8n-setup.md](docs/n8n-setup.md) |
| **Supabase** | Database & storage | [docs/supabase-setup.md](docs/supabase-setup.md) |
| **Google** | Calendar & Gmail | [docs/google-setup.md](docs/google-setup.md) |

### Business Customization

Edit your `.env` file to customize:
- Business name, phone, address
- Service types and pricing
- Operating hours
- Email templates
- Voice prompts

## 🎙️ Voice Commands

Your customers can say:
- *"I'd like to book a manicure for tomorrow at 2pm"*
- *"What appointments do I have coming up?"*
- *"Can you check availability for Saturday?"*
- *"I need to cancel my appointment"*

## 🛠️ Advanced Setup

### Custom Services
Edit `config/services.json` to add your specific services:
```json
{
  "manicure_signature": {
    "name": "Signature Manicure",
    "duration": 60,
    "price": 45
  }
}
```

### Custom Prompts
Modify `config/vapi-prompts.json` to customize the AI's personality and responses.

## 📞 Deployment

### Production Deployment
```bash
npm run deploy
```

### Testing
```bash
npm run test
```

## 🔧 Troubleshooting

Common issues and solutions in [docs/troubleshooting.md](docs/troubleshooting.md)

## 📚 Documentation

- [Installation Guide](docs/installation.md)
- [Configuration Guide](docs/configuration.md)
- [Customization Guide](docs/customization.md)
- [API Reference](docs/api-reference.md)

## 🤝 Support

- 📧 Email: support@dropfly.ai
- 💬 Discord: [Join our community](https://discord.gg/dropfly)
- 📖 Docs: [Full documentation](https://docs.dropfly.ai/vapi-salon)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [DropFly AI](https://dropfly.ai)