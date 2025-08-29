#!/usr/bin/env node

const axios = require('axios');

const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4ZTEyODc0Ni0yNTk3LTRkYjAtYmQzNy1hMzBkZTQ3MjRjZjAiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUzMzcwMjM4fQ.6uik0n7-gtLi_LQMQ9SgoXiqKkACNyOzkWgsAgQ6a08';
const N8N_BASE_URL = 'https://botthentic.com/api/v1';

async function createPostBookingWorkflow() {
    console.log('🚀 Creating Salon Post-Booking Automation workflow in N8N...');
    
    const workflowData = {
        name: "Salon Post-Booking Automation",
        nodes: [
            // Webhook Trigger Node
            {
                id: "webhook-trigger",
                name: "Booking Webhook",
                type: "n8n-nodes-base.webhook",
                typeVersion: 1,
                position: [240, 300],
                parameters: {
                    httpMethod: "POST",
                    path: "salon-booking-automation",
                    responseMode: "responseNode",
                    options: {}
                }
            },
            
            // Webhook Response Node
            {
                id: "webhook-response",
                name: "Webhook Response",
                type: "n8n-nodes-base.respondToWebhook",
                typeVersion: 1,
                position: [460, 300],
                parameters: {
                    respondWith: "json",
                    responseBody: '={\n  "status": "success",\n  "message": "Post-booking automation started",\n  "appointmentId": "{{ $json.appointment.id }}",\n  "timestamp": "{{ $now.toISO() }}"\n}'
                }
            },
            
            // IF Node - Validate Event Type
            {
                id: "validate-event",
                name: "Validate Event Type",
                type: "n8n-nodes-base.if",
                typeVersion: 1,
                position: [680, 300],
                parameters: {
                    conditions: {
                        string: [
                            {
                                value1: "={{ $json.event }}",
                                operation: "equal",
                                value2: "appointment_booked"
                            }
                        ]
                    }
                }
            },
            
            // Twilio SMS Node - Confirmation
            {
                id: "send-sms",
                name: "Send SMS Confirmation",
                type: "n8n-nodes-base.twilio",
                typeVersion: 1,
                position: [900, 200],
                parameters: {
                    resource: "sms",
                    operation: "send",
                    from: "={{ $credentials.twilioPhoneNumber }}",
                    to: "={{ $json.customer.phone }}",
                    message: "Hi {{ $json.customer.firstName }}! 💅 Your {{ $json.service.name }} appointment is confirmed for {{ $json.appointment.date }} at {{ $json.appointment.time }}. Looking forward to seeing you at {{ $json.business.name }}! Reply STOP to opt out."
                }
            },
            
            // Gmail Node - Email Confirmation
            {
                id: "send-email",
                name: "Send Email Confirmation",
                type: "n8n-nodes-base.gmail",
                typeVersion: 2.1,
                position: [900, 400],
                parameters: {
                    operation: "send",
                    sendTo: "={{ $json.customer.email }}",
                    subject: "🎉 Appointment Confirmed - {{ $json.business.name }}",
                    message: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; margin-top: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ff6b9d, #c44569); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
    .appointment-card { background: #f8f9ff; border: 2px solid #e1e5ff; border-radius: 10px; padding: 20px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
    .label { font-weight: bold; color: #555; }
    .value { color: #333; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px; }
    .button { display: inline-block; background: #ff6b9d; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 20px 10px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Appointment Confirmed!</h1>
      <p>Thank you for booking with {{ $json.business.name }}</p>
    </div>
    
    <div class="appointment-card">
      <h2>📅 Appointment Details</h2>
      <div class="detail-row">
        <span class="label">Service:</span>
        <span class="value">{{ $json.service.name }}</span>
      </div>
      <div class="detail-row">
        <span class="label">Date:</span>
        <span class="value">{{ $json.appointment.date }}</span>
      </div>
      <div class="detail-row">
        <span class="label">Time:</span>
        <span class="value">{{ $json.appointment.time }}</span>
      </div>
      <div class="detail-row">
        <span class="label">Duration:</span>
        <span class="value">{{ $json.appointment.duration }} minutes</span>
      </div>
      <div class="detail-row">
        <span class="label">Location:</span>
        <span class="value">{{ $json.business.address }}, {{ $json.business.city }}, {{ $json.business.state }}</span>
      </div>
    </div>
    
    <div style="text-align: center;">
      <a href="tel:{{ $json.business.phone }}" class="button">📞 Call Us</a>
    </div>
    
    <div class="footer">
      <p><strong>Need to reschedule or cancel?</strong><br>
      Call us at {{ $json.business.phone }} or reply to this email.</p>
      <p>We can't wait to pamper you! 💅✨</p>
      <p>{{ $json.business.name }} • {{ $json.business.phone }}</p>
    </div>
  </div>
</body>
</html>`,
                    options: {
                        appendAttributionText: false
                    }
                }
            },
            
            // Code Node - Update Customer Stats
            {
                id: "update-stats",
                name: "Update Customer Stats",
                type: "n8n-nodes-base.code",
                typeVersion: 2,
                position: [900, 600],
                parameters: {
                    mode: "runOnceForEachItem",
                    jsCode: `// Log analytics event and update customer stats
const appointmentData = $input.item.json;

// Prepare analytics event
const analyticsEvent = {
  business_id: appointmentData.business.id,
  event_type: 'appointment_confirmed',
  event_data: {
    appointmentId: appointmentData.appointment.id,
    customerId: appointmentData.customer.id,
    serviceId: appointmentData.service.id,
    source: appointmentData.appointment.source,
    automationTriggered: true,
    timestamp: new Date().toISOString()
  }
};

// Prepare customer update
const customerUpdate = {
  customer_id: appointmentData.customer.id,
  last_booking: appointmentData.appointment.date,
  total_bookings: (appointmentData.customer.totalVisits || 0) + 1
};

return {
  analytics: analyticsEvent,
  customer: customerUpdate,
  original: appointmentData
};`
                }
            },
            
            // Wait Node - 24 Hour Reminder
            {
                id: "wait-24h",
                name: "Wait 24 Hours",
                type: "n8n-nodes-base.wait",
                typeVersion: 1,
                position: [1120, 200],
                parameters: {
                    amount: 86400,
                    unit: "seconds"
                }
            },
            
            // Twilio SMS - 24h Reminder
            {
                id: "send-24h-reminder",
                name: "Send 24h Reminder SMS",
                type: "n8n-nodes-base.twilio",
                typeVersion: 1,
                position: [1340, 200],
                parameters: {
                    resource: "sms",
                    operation: "send",
                    from: "={{ $credentials.twilioPhoneNumber }}",
                    to: "={{ $json.customer.phone }}",
                    message: "Hi {{ $json.customer.firstName }}! 🔔 Friendly reminder: You have a {{ $json.service.name }} appointment tomorrow at {{ $json.appointment.time }} at {{ $json.business.name }}. Looking forward to seeing you! 💅"
                }
            }
        ],
        connections: {
            "Booking Webhook": {
                "main": [
                    [
                        {
                            "node": "Webhook Response",
                            "type": "main",
                            "index": 0
                        },
                        {
                            "node": "Validate Event Type",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            },
            "Validate Event Type": {
                "main": [
                    [
                        {
                            "node": "Send SMS Confirmation",
                            "type": "main",
                            "index": 0
                        },
                        {
                            "node": "Send Email Confirmation",
                            "type": "main",
                            "index": 0
                        },
                        {
                            "node": "Update Customer Stats",
                            "type": "main",
                            "index": 0
                        }
                    ],
                    []
                ]
            },
            "Send SMS Confirmation": {
                "main": [
                    [
                        {
                            "node": "Wait 24 Hours",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            },
            "Wait 24 Hours": {
                "main": [
                    [
                        {
                            "node": "Send 24h Reminder SMS",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            }
        },
        settings: {
            executionOrder: "v1"
        }
    };
    
    try {
        const response = await axios.post(`${N8N_BASE_URL}/workflows`, workflowData, {
            headers: {
                'X-N8N-API-KEY': N8N_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.status === 200 || response.status === 201) {
            const result = response.data;
            console.log('✅ Workflow created successfully!');
            console.log('📋 Workflow ID:', result.id);
            console.log('🔗 Webhook URL:', `https://botthentic.com/webhook/${result.id}/salon-booking-automation`);
            console.log('');
            console.log('🎯 Next Steps:');
            console.log('1. Open N8N at https://botthentic.com');
            console.log('2. Find "Salon Post-Booking Automation" workflow');
            console.log('3. Configure credentials (Twilio, Gmail, etc.)');
            console.log('4. Activate the workflow');
            console.log('5. Update webhook-server.js with the webhook URL');
            
            // Save webhook URL to env file
            const fs = require('fs');
            const webhookUrl = `https://botthentic.com/webhook/${result.id}/salon-booking-automation`;
            const envUpdate = `\n# N8N Webhook URL (auto-generated)\nN8N_WEBHOOK_URL=${webhookUrl}\n`;
            
            console.log('');
            console.log('📝 Add this to your .env file:');
            console.log(`N8N_WEBHOOK_URL=${webhookUrl}`);
            
            return result;
        } else {
            console.error('❌ Failed to create workflow:', response.status);
        }
    } catch (error) {
        console.error('❌ Error creating workflow:', error.response?.data || error.message);
    }
}

// Run the creation
createPostBookingWorkflow();