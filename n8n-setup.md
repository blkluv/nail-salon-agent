# N8N Setup Guide for Vapi Integration

## Option 1: Self-Hosted N8N (Free)

### Step 1: Install n8n locally
```bash
npm install -g n8n
```

### Step 2: Start n8n
```bash
n8n start
```
This will run n8n at: http://localhost:5678

### Step 3: Create webhook endpoint
1. In n8n, create new workflow
2. Add "Webhook" trigger node
3. Set webhook URL path: `/vapi-booking`
4. Copy the full webhook URL (e.g., http://localhost:5678/webhook/vapi-booking)

### Step 4: Railway Environment Variables
Add these to Railway:
```
N8N_WEBHOOK_URL=http://localhost:5678/webhook/vapi-booking
N8N_API_URL=http://localhost:5678/api/v1
N8N_API_KEY=(not needed for self-hosted)
```

## Option 2: N8N Cloud (Paid but easier)

### Step 1: Sign up at n8n.cloud
- Go to https://n8n.cloud
- Create account (free trial available)

### Step 2: Create webhook
1. Create new workflow
2. Add Webhook trigger
3. Copy webhook URL: `https://your-instance.n8n.cloud/webhook/...`

### Step 3: Get API credentials
1. Go to Settings → API Keys
2. Create new API key
3. Copy API key and base URL

### Step 4: Railway Environment Variables
```
N8N_WEBHOOK_URL=https://your-instance.n8n.cloud/webhook/vapi-booking
N8N_API_URL=https://your-instance.n8n.cloud/api/v1
N8N_API_KEY=your-api-key-here
```

## What N8N Will Do

Once set up, n8n can automatically:
- ✅ Send SMS confirmations after bookings
- ✅ Send email receipts
- ✅ Update Google Calendar
- ✅ Send reminder texts 24h before
- ✅ Post to social media about bookings
- ✅ Generate daily revenue reports
- ✅ Handle cancellation workflows

## Integration Points

Your webhook will call n8n after:
- New appointment booked
- Appointment cancelled  
- Appointment completed
- Customer no-show

N8N will then trigger all the automation workflows!