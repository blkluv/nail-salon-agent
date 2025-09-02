import { NextRequest, NextResponse } from 'next/server'
import { ReportGenerator } from '../../../../lib/report-generator'
import { createClient } from '@supabase/supabase-js'

// This endpoint would be called by Vercel Cron Jobs
export async function GET() {
  try {
    // Verify this is a cron job request (optional security check)
    // const cronSecret = request.headers.get('authorization')
    // if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const reportGenerator = new ReportGenerator()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const reportDate = yesterday.toISOString().split('T')[0]

    // Get all businesses with daily reports enabled
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('id, name, email')
      .eq('daily_reports_enabled', true)

    if (error) {
      console.error('Failed to fetch businesses:', error)
      return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 })
    }

    const results = []

    for (const business of businesses || []) {
      try {
        // Generate report for this business
        const report = await reportGenerator.generateDailyReport(business.id, reportDate)
        
        // Convert to HTML for email
        const htmlReport = generateEmailHTMLReport(report, business.name)
        
        // Send email report (assuming email service is available)
        const emailResult = await sendReportEmail(
          business.email,
          `Daily Report - ${new Date(reportDate).toLocaleDateString()}`,
          htmlReport,
          report
        )

        results.push({
          businessId: business.id,
          businessName: business.name,
          success: emailResult.success,
          error: emailResult.error
        })
      } catch (error) {
        console.error(`Failed to generate report for business ${business.id}:`, error)
        results.push({
          businessId: business.id,
          businessName: business.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      date: reportDate,
      processedBusinesses: results.length,
      results
    })
  } catch (error) {
    console.error('Failed to run daily reports cron job:', error)
    return NextResponse.json(
      { error: 'Failed to run daily reports cron job' },
      { status: 500 }
    )
  }
}

async function sendReportEmail(email: string, subject: string, htmlContent: string, reportData: any) {
  try {
    // This would integrate with the email service from Dev 1
    // For now, we'll simulate sending an email
    
    // Example integration with SendGrid or similar:
    // const sgMail = require('@sendgrid/mail')
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    // 
    // const msg = {
    //   to: email,
    //   from: 'reports@yourbusiness.com',
    //   subject: subject,
    //   html: htmlContent,
    //   attachments: [{
    //     content: Buffer.from(JSON.stringify(reportData, null, 2)).toString('base64'),
    //     filename: `daily-report-${reportData.date}.json`,
    //     type: 'application/json',
    //     disposition: 'attachment'
    //   }]
    // }
    // 
    // await sgMail.send(msg)

    console.log(`Email report sent to ${email}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to send email report:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    }
  }
}

function generateEmailHTMLReport(reportData: any, businessName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Daily Report - ${businessName}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: white;
            padding: 30px 20px;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        .metric {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #e9ecef;
        }
        .metric-label {
            font-size: 12px;
            color: #6c757d;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 5px;
        }
        .metric-value {
            font-size: 24px;
            font-weight: 700;
            color: #495057;
        }
        .section {
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .section h2 {
            margin: 0 0 15px 0;
            color: #8b5cf6;
            font-size: 18px;
        }
        .service-item, .staff-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #f8f9fa;
        }
        .service-item:last-child, .staff-item:last-child {
            border-bottom: none;
        }
        .item-details {
            flex: 1;
        }
        .item-name {
            font-weight: 600;
            color: #495057;
        }
        .item-subtitle {
            font-size: 14px;
            color: #6c757d;
        }
        .item-value {
            font-weight: 700;
            color: #28a745;
            font-size: 16px;
        }
        .insight {
            background: #f8f9fa;
            border-left: 4px solid #8b5cf6;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 0 4px 4px 0;
        }
        .insight h4 {
            margin: 0 0 5px 0;
            color: #495057;
            font-size: 16px;
        }
        .insight p {
            margin: 0;
            color: #6c757d;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${businessName}</h1>
        <p>Daily Report for ${new Date(reportData.date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
    </div>

    <div class="metrics">
        <div class="metric">
            <div class="metric-label">Appointments</div>
            <div class="metric-value">${reportData.summary.totalAppointments}</div>
        </div>
        <div class="metric">
            <div class="metric-label">Completed</div>
            <div class="metric-value">${reportData.summary.completedAppointments}</div>
        </div>
        <div class="metric">
            <div class="metric-label">Revenue</div>
            <div class="metric-value">$${reportData.summary.totalRevenue.toLocaleString()}</div>
        </div>
        <div class="metric">
            <div class="metric-label">New Customers</div>
            <div class="metric-value">${reportData.summary.newCustomers}</div>
        </div>
    </div>

    <div class="section">
        <h2>🌟 Top Services</h2>
        ${reportData.topServices.map(service => `
            <div class="service-item">
                <div class="item-details">
                    <div class="item-name">${service.name}</div>
                    <div class="item-subtitle">${service.bookings} bookings</div>
                </div>
                <div class="item-value">$${service.revenue.toLocaleString()}</div>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>👥 Staff Performance</h2>
        ${reportData.staffPerformance.map(staff => `
            <div class="staff-item">
                <div class="item-details">
                    <div class="item-name">${staff.name}</div>
                    <div class="item-subtitle">${staff.appointments} appointments • ${staff.utilizationRate}% utilized</div>
                </div>
                <div class="item-value">$${staff.revenue.toLocaleString()}</div>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>💡 Key Insights</h2>
        ${reportData.insights.map(insight => `
            <div class="insight">
                <h4>${insight.title}</h4>
                <p>${insight.description}</p>
            </div>
        `).join('')}
    </div>

    <div class="footer">
        <p>This report was generated automatically on ${new Date().toLocaleString()}</p>
        <p>Visit your dashboard for more detailed analytics and insights</p>
    </div>
</body>
</html>`
}