import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail(options: EmailOptions) {
  if (!resend) {
    console.error('Resend API key not configured')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const result = await resend.emails.send({
      from: options.from || 'Vapi Nail Salon <noreply@vapinailsalon.com>',
      to: options.to,
      subject: options.subject,
      html: options.html
    })

    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}

export function generateWelcomeEmail(businessName: string, phoneNumber: string, planTier: string, trialEndDate: string, cancellationToken?: string, businessId?: string) {
  const planNames = {
    starter: 'Starter',
    professional: 'Professional', 
    business: 'Business'
  }
  
  const planName = planNames[planTier as keyof typeof planNames] || 'Starter'
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Your AI Assistant</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                🎉 Welcome to Your AI Assistant!
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">
                ${businessName}, your AI is ready to take calls!
              </p>
            </td>
          </tr>
          
          <!-- Phone Number Section -->
          <tr>
            <td style="padding: 40px 30px 20px;">
              <div style="background: #f8f9ff; border-radius: 8px; padding: 25px; text-align: center; border: 2px solid #667eea;">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                  Your AI Phone Number
                </p>
                <p style="margin: 0; color: #333; font-size: 32px; font-weight: bold;">
                  ${phoneNumber}
                </p>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
                  Test it now! Call this number to experience your AI assistant
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Quick Start Steps -->
          <tr>
            <td style="padding: 20px 30px;">
              <h2 style="color: #333; font-size: 20px; margin: 0 0 20px 0;">
                ⚡ Quick Start Guide
              </h2>
              
              <div style="margin-bottom: 20px;">
                <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
                  <span style="background: #667eea; color: white; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0;">1</span>
                  <div>
                    <strong style="color: #333; display: block; margin-bottom: 5px;">Test Your AI Assistant</strong>
                    <span style="color: #666; font-size: 14px;">Call ${phoneNumber} and try booking an appointment</span>
                  </div>
                </div>
                
                <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
                  <span style="background: #667eea; color: white; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0;">2</span>
                  <div>
                    <strong style="color: #333; display: block; margin-bottom: 5px;">Explore Your Dashboard</strong>
                    <span style="color: #666; font-size: 14px;">View appointments, manage services, and track analytics</span>
                  </div>
                </div>
                
                <div style="display: flex; align-items: flex-start;">
                  <span style="background: #667eea; color: white; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0;">3</span>
                  <div>
                    <strong style="color: #333; display: block; margin-bottom: 5px;">Forward Your Business Line (When Ready)</strong>
                    <span style="color: #666; font-size: 14px;">No rush! Test thoroughly first, then forward when comfortable</span>
                  </div>
                </div>
              </div>
            </td>
          </tr>
          
          <!-- Plan Details -->
          <tr>
            <td style="padding: 20px 30px;">
              <div style="background: #f9f9f9; border-radius: 8px; padding: 20px;">
                <h3 style="color: #333; font-size: 16px; margin: 0 0 15px 0;">
                  Your ${planName} Plan Includes:
                </h3>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #666; font-size: 14px; line-height: 1.8;">
                  ${planTier === 'starter' ? `
                    <li>24/7 AI Voice Assistant</li>
                    <li>Unlimited Appointments</li>
                    <li>SMS Confirmations</li>
                    <li>Customer Management</li>
                  ` : planTier === 'professional' ? `
                    <li>Everything in Starter</li>
                    <li>Advanced Analytics Dashboard</li>
                    <li>Payment Processing</li>
                    <li>Email Marketing</li>
                    <li>Loyalty Program</li>
                  ` : `
                    <li>Everything in Professional</li>
                    <li>Up to 3 Locations</li>
                    <li>Custom AI Assistant</li>
                    <li>White-Label Options</li>
                    <li>Priority Support</li>
                  `}
                </ul>
              </div>
            </td>
          </tr>
          
          <!-- Trial Information -->
          <tr>
            <td style="padding: 20px 30px;">
              <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 20px; text-align: center;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                  <strong>🎁 Free Trial Period</strong><br>
                  Your trial ends on ${trialEndDate}<br>
                  No charges until then • Cancel anytime
                </p>
              </div>
            </td>
          </tr>
          
          <!-- CTA Buttons -->
          <tr>
            <td style="padding: 30px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; padding: 14px 30px; background: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 0 10px 10px 0;">
                Go to Dashboard
              </a>
              <a href="tel:${phoneNumber.replace(/\D/g, '')}" style="display: inline-block; padding: 14px 30px; background: #28a745; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 0 0 10px 0;">
                Call Your AI
              </a>
            </td>
          </tr>
          
          <!-- Help Section -->
          <tr>
            <td style="padding: 20px 30px; background: #f9f9f9;">
              <h3 style="color: #333; font-size: 16px; margin: 0 0 10px 0;">
                Need Help?
              </h3>
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                We're here to help you succeed:
              </p>
              <ul style="margin: 0; padding: 0; list-style: none; color: #666; font-size: 14px;">
                <li style="margin-bottom: 8px;">📧 Email: support@vapinailsalon.com</li>
                <li style="margin-bottom: 8px;">📚 Help Center: help.vapinailsalon.com</li>
                <li>💬 Live Chat: Available in your dashboard</li>
              </ul>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; color: #999; font-size: 12px;">
              <p style="margin: 0 0 10px 0;">
                © 2025 Vapi Nail Salon. All rights reserved.
              </p>
              <p style="margin: 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings/billing" style="color: #667eea; text-decoration: none;">Manage Subscription</a> •
                ${cancellationToken && businessId ? 
                  `<a href="${process.env.NEXT_PUBLIC_APP_URL}/api/subscription/cancel?token=${cancellationToken}&businessId=${businessId}" style="color: #667eea; text-decoration: none;">Cancel Trial</a>` :
                  `<a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing" style="color: #667eea; text-decoration: none;">Cancel Trial</a>`
                }
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export function generateCancellationEmail(businessName: string, hasRetainedNumber: boolean, phoneNumber?: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ee7c7c 0%, #d64545 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">
                We're Sorry to See You Go
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Hi ${businessName},
              </p>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Your trial has been cancelled successfully. We appreciate you giving our AI assistant a try.
              </p>
              
              ${hasRetainedNumber ? `
                <div style="background: #d4edda; border: 1px solid #28a745; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <p style="margin: 0; color: #155724;">
                    <strong>✅ Your phone number ${phoneNumber} is being retained</strong><br>
                    You'll be charged $5/month to keep this number active. You can reactivate your full service anytime.
                  </p>
                </div>
              ` : phoneNumber ? `
                <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <p style="margin: 0; color: #856404;">
                    <strong>⚠️ Your phone number ${phoneNumber} will be released in 7 days</strong><br>
                    After this date, the number will be available for other businesses to use.
                  </p>
                </div>
              ` : ''}
              
              <h3 style="color: #333; font-size: 18px; margin: 30px 0 15px 0;">
                What Happens Next:
              </h3>
              <ul style="color: #666; font-size: 14px; line-height: 1.8;">
                <li>Your data will be saved for 30 days</li>
                <li>No charges will be processed</li>
                <li>You can reactivate anytime within 30 days</li>
                ${!hasRetainedNumber && phoneNumber ? '<li>Your phone number will be released in 7 days</li>' : ''}
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #666; font-size: 14px; margin-bottom: 15px;">
                  Changed your mind?
                </p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/reactivate" style="display: inline-block; padding: 12px 30px; background: #28a745; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
                  Reactivate My Account
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background: #f9f9f9; color: #999; font-size: 12px;">
              <p style="margin: 0;">
                If you have any questions or feedback, please don't hesitate to reach out to us at support@vapinailsalon.com
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}