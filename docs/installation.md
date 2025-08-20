# 📦 Installation Guide

Complete setup guide for the Vapi Nail Salon Agent system.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 16+** installed on your system
- **Git** for version control
- **N8N instance** (cloud or self-hosted)
- **Vapi account** with phone number purchased
- **Supabase project** created
- **Google Workspace account** (for Gmail & Calendar)

## Quick Installation

### 1. Download & Setup

```bash
# Clone the repository
git clone https://github.com/dropfly/vapi-nail-salon-agent.git
cd vapi-nail-salon-agent

# Install dependencies
npm install

# Run interactive setup
npm run setup
```

### 2. Service Configuration

The setup wizard will guide you through configuring:

#### Vapi Configuration
- API key from your Vapi dashboard
- Phone number ID for your purchased number

#### N8N Configuration  
- Your N8N instance URL (e.g., `https://your-instance.n8n.cloud`)
- API key from N8N settings

#### Supabase Configuration
- Project URL (e.g., `https://abc123.supabase.co`)
- Anonymous key (for public access)
- Service role key (for admin operations)

#### Google Integration
- Calendar email address
- OAuth2 credentials (Client ID, Secret, Refresh Token)
- Gmail sending address

#### Business Information
- Business name, phone, address
- Website URL
- Timezone

### 3. Deploy the System

```bash
# Deploy all components
npm run deploy
```

This will:
- Import the N8N workflow
- Create database schema
- Configure Vapi assistant
- Set up integrations
- Test connections

### 4. Test Your Setup

```bash
# Run automated tests
npm run test
```

## Manual Installation

If you prefer manual setup or encounter issues with the automated process:

### 1. Environment Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your service credentials.

### 2. Database Setup

Execute the SQL schema in your Supabase project:

```sql
-- Copy contents from config/database-schema.sql
-- Run in Supabase SQL editor
```

### 3. N8N Workflow Import

1. Open your N8N instance
2. Go to Workflows > Import
3. Upload `config/workflow.json`
4. Configure credentials for each node:
   - Supabase connection
   - Google Calendar OAuth2
   - Gmail OAuth2
   - Webhook authentication

### 4. Vapi Assistant Creation

1. Log into Vapi dashboard
2. Create new assistant
3. Copy configuration from `config/vapi-assistant.json`
4. Set server URL to your N8N webhook endpoint
5. Configure function calling with the provided schema

## Verification

### Test Voice Calls
1. Call your Vapi phone number
2. Try booking an appointment
3. Check for email confirmation
4. Verify calendar entry

### Test Webhook
```bash
curl -X POST https://your-n8n-instance.com/webhook/maya \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_WEBHOOK_TOKEN" \
  -d '{
    "tool": "check_availability",
    "parameters": {
      "service_type": "manicure_signature",
      "preferred_date": "2025-08-21"
    }
  }'
```

## Troubleshooting

### Common Issues

**"API key invalid" errors:**
- Verify credentials in `.env` file
- Check expiration dates on OAuth tokens
- Ensure service roles have proper permissions

**Webhook not responding:**
- Check N8N workflow is active
- Verify webhook URL and authentication
- Check N8N execution logs

**Database connection failed:**
- Verify Supabase URL and keys
- Check RLS policies are configured
- Ensure tables were created properly

**Voice calls not working:**
- Check Vapi assistant configuration
- Verify phone number is active
- Test webhook endpoint separately

### Getting Help

- Check the [troubleshooting guide](troubleshooting.md)
- Review N8N workflow execution logs  
- Test individual components with the test script
- Contact support: support@dropfly.ai

## Next Steps

Once installed:

1. **Customize Services** - Edit `config/services.json`
2. **Update Branding** - Modify business info in `.env`
3. **Test Thoroughly** - Run `npm run test` and manual tests
4. **Monitor Usage** - Check N8N executions and Vapi logs
5. **Scale Up** - Add more technicians and services as needed

## Security Notes

- Store `.env` file securely and never commit to version control
- Regularly rotate API keys and tokens
- Use HTTPS for all webhook endpoints
- Enable Supabase RLS policies for data protection
- Monitor webhook authentication logs

For detailed configuration of each service, see:
- [Vapi Setup Guide](vapi-setup.md)
- [N8N Configuration](n8n-setup.md) 
- [Supabase Setup](supabase-setup.md)
- [Google Integration](google-setup.md)