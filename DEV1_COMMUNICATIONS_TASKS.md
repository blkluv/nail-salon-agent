# 📱 Developer 1: Communications & Notifications Implementation

## 🎯 Your Mission
Implement all SMS and Email communication systems. This is **CRITICAL PATH** - other developers depend on your work.

---

## 📋 Task Breakdown

### 🔴 PRIORITY 1: SMS Automation (Day 1-2)

#### Setup Twilio Service
```typescript
// Create: /dashboard/lib/sms-service.ts

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export class SMSService {
  static async sendSMS(to: string, message: string) {
    try {
      const result = await client.messages.create({
        body: message,
        from: fromNumber,
        to: to
      });
      console.log('SMS sent:', result.sid);
      return result;
    } catch (error) {
      console.error('SMS failed:', error);
      throw error;
    }
  }

  static async sendAppointmentConfirmation(appointment: any) {
    const message = `Hi ${appointment.customer.first_name}! Your appointment at ${appointment.business.name} is confirmed for ${appointment.appointment_date} at ${appointment.start_time}. Reply CANCEL to cancel.`;
    return this.sendSMS(appointment.customer.phone, message);
  }

  static async sendReminder(appointment: any) {
    const message = `Reminder: You have an appointment tomorrow at ${appointment.business.name} at ${appointment.start_time}. See you soon!`;
    return this.sendSMS(appointment.customer.phone, message);
  }
}
```

#### Integration Points
**File: `/dashboard/lib/supabase.ts`**

Find and update these functions:
```typescript
// Line ~554 - createAppointment()
static async createAppointment(...) {
  // After line 590 (successful creation)
  // Add:
  await SMSService.sendAppointmentConfirmation(data);
}

// Line ~598 - updateAppointment()
static async updateAppointment(...) {
  // After successful update
  // Add:
  if (updateData.appointment_date || updateData.start_time) {
    await SMSService.sendRescheduleNotice(data);
  }
}

// Line ~640 - cancelAppointment()
static async cancelAppointment(...) {
  // After successful cancellation
  // Add:
  await SMSService.sendCancellationNotice(data);
}
```

#### Reminder Cron Job
**Create: `/dashboard/app/api/cron/reminders/route.ts`**
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SMSService } from '@/lib/sms-service';

export async function GET() {
  // This will run every hour via Vercel Cron
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  // Find appointments 24 hours from now
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split('T')[0];

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      customer:customers(*),
      business:businesses(*),
      service:services(*)
    `)
    .eq('appointment_date', tomorrowDate)
    .eq('reminder_sent', false)
    .in('status', ['confirmed', 'pending']);

  for (const apt of appointments || []) {
    await SMSService.sendReminder(apt);
    
    // Mark as reminded
    await supabase
      .from('appointments')
      .update({ reminder_sent: true })
      .eq('id', apt.id);
  }

  return NextResponse.json({ 
    success: true, 
    reminded: appointments?.length || 0 
  });
}
```

**Add to `/vercel.json`:**
```json
{
  "crons": [{
    "path": "/api/cron/reminders",
    "schedule": "0 * * * *"
  }]
}
```

---

### 🟡 PRIORITY 2: Email Service (Day 3-4)

#### Install Resend
```bash
cd dashboard
npm install resend react-email @react-email/components
```

#### Create Email Service
```typescript
// Create: /dashboard/lib/email-service.ts

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  static async sendEmail(to: string, subject: string, html: string) {
    try {
      const data = await resend.emails.send({
        from: 'Bella Nails <notifications@bellnails.com>',
        to: [to],
        subject: subject,
        html: html
      });
      return data;
    } catch (error) {
      console.error('Email failed:', error);
      throw error;
    }
  }

  static async sendAppointmentConfirmation(appointment: any) {
    const html = `
      <h2>Appointment Confirmed!</h2>
      <p>Hi ${appointment.customer.first_name},</p>
      <p>Your appointment is confirmed:</p>
      <ul>
        <li>Date: ${appointment.appointment_date}</li>
        <li>Time: ${appointment.start_time}</li>
        <li>Service: ${appointment.service.name}</li>
      </ul>
      <p>See you soon!</p>
    `;
    
    return this.sendEmail(
      appointment.customer.email,
      'Appointment Confirmation',
      html
    );
  }
}
```

#### Email Templates with React Email
**Create: `/dashboard/emails/appointment-confirmation.tsx`**
```tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';

interface Props {
  customerName: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceName: string;
  businessName: string;
}

export default function AppointmentConfirmation({
  customerName,
  appointmentDate,
  appointmentTime,
  serviceName,
  businessName
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Your appointment at {businessName} is confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Appointment Confirmed!</Heading>
          <Text style={text}>Hi {customerName},</Text>
          <Text style={text}>
            Your appointment at {businessName} has been confirmed.
          </Text>
          <Container style={codeBox}>
            <Text style={confirmationText}>
              📅 {appointmentDate}<br/>
              ⏰ {appointmentTime}<br/>
              💅 {serviceName}
            </Text>
          </Container>
          <Link href="https://bellnails.com/customer/portal" style={link}>
            Manage Appointment
          </Link>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  padding: '10px 0',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  borderRadius: '5px',
  margin: '0 auto',
  padding: '45px',
};
// ... more styles
```

#### Connect Marketing Campaigns
**Update: `/dashboard/app/api/email/campaign/send/route.ts`**
```typescript
import { EmailService } from '@/lib/email-service';

export async function POST(request: Request) {
  const { campaignId, recipients } = await request.json();
  
  // Get campaign details from database
  // ...
  
  // Send to each recipient
  for (const recipient of recipients) {
    await EmailService.sendMarketingEmail(
      recipient.email,
      campaign.subject,
      campaign.content
    );
  }
  
  return Response.json({ success: true });
}
```

---

## 🧪 Testing Checklist

### SMS Testing
- [ ] Book appointment → Receive confirmation SMS
- [ ] Cancel appointment → Receive cancellation SMS  
- [ ] Reschedule → Receive update SMS
- [ ] 24hr before → Receive reminder SMS
- [ ] Test with real phone number

### Email Testing  
- [ ] Book with email → Receive confirmation
- [ ] Test email templates render correctly
- [ ] Unsubscribe link works
- [ ] Marketing campaign sends to list
- [ ] Emails not going to spam

---

## 🔗 Dependencies You're Creating

Your work enables:
- **Dev 2** can send automated reports via email
- **Dev 3** can send location-specific notifications
- **Payment receipts** can be sent (when implemented)
- **Marketing campaigns** become functional

---

## ⚠️ Important Notes

1. **Phone Format**: Always format phone numbers as E.164 (+1XXXXXXXXXX)
2. **Rate Limits**: Twilio has rate limits - implement queuing for bulk sends
3. **Opt-Out**: Handle STOP/CANCEL replies for SMS
4. **Email Compliance**: Include unsubscribe in all marketing emails
5. **Error Handling**: Log failures but don't break the main flow

---

## 📚 Resources

- Twilio Console: https://console.twilio.com
- Resend Dashboard: https://resend.com/overview
- Test Phone: (424) 351-9304
- Test Business: Bella's Nails (ID: bb18c6ca-7e97-449d-8245-e3c28a6b6971)

---

## 🚦 Definition of Done

- [ ] All SMS templates created and tested
- [ ] Automatic confirmations working
- [ ] 24-hour reminders running via cron
- [ ] Email service integrated
- [ ] Marketing campaigns functional
- [ ] Error handling implemented
- [ ] Documentation updated
- [ ] Merged to main branch