# ⚡ QUICK START - 5 Minute Setup

Get your voice AI receptionist running in under 5 minutes.

## 🎯 Prerequisites

1. **Vapi Account** - [Sign up free](https://vapi.ai) and get your API key
2. **N8N Account** - [Start free](https://n8n.cloud) and create a workflow  
3. **Supabase Project** - [Create one](https://supabase.com) and get your keys
4. **Google Account** - For calendar integration

## 🚀 Installation

```bash
# 1. Clone and install
git clone https://github.com/dropfly/vapi-nail-salon-agent.git
cd vapi-nail-salon-agent
npm install

# 2. One-click setup
npm run quick-start
```

The interactive wizard will guide you through:
- ✅ Service configuration
- ✅ Database setup  
- ✅ Workflow deployment
- ✅ Assistant creation
- ✅ Connection testing

## 📞 Test Your Assistant

Call your Vapi phone number and say:
> *"Hi, I'd like to book a manicure for tomorrow at 2pm"*

## 💻 Access Dashboard

```bash
npm run dashboard
```

Visit: http://localhost:3000

## 🆘 Need Help?

**Something not working?**
```bash
npm run help
```

**Want to see all your assistants?**
```bash
npm run vapi:list
```

**Try demo mode first?**
```bash  
npm run demo
```

## 🎉 You're Done!

Your voice AI receptionist is now:
- ✅ Answering calls 24/7
- ✅ Booking appointments automatically  
- ✅ Syncing with your calendar
- ✅ Sending email confirmations
- ✅ Managing your customer database

---

**Next Steps**: Customize your services in `config/services.json` and voice personality in `config/vapi-assistant.json`