import { NextRequest, NextResponse } from 'next/server'
import { ReportGenerator } from '../../../../lib/report-generator'

export async function POST(request: NextRequest) {
  try {
    const { reportData, format, filename } = await request.json()

    if (!reportData || !format) {
      return NextResponse.json(
        { error: 'Report data and format are required' },
        { status: 400 }
      )
    }

    const reportGenerator = new ReportGenerator()
    let content: string
    let contentType: string
    let fileExtension: string

    switch (format) {
      case 'csv':
        content = reportGenerator.exportToCSV(reportData)
        contentType = 'text/csv'
        fileExtension = 'csv'
        break
      case 'json':
        content = reportGenerator.exportToJSON(reportData)
        contentType = 'application/json'
        fileExtension = 'json'
        break
      case 'pdf':
        // For PDF, we'd typically use a library like puppeteer or react-pdf
        // For now, we'll return a simple HTML that could be converted to PDF
        content = generateHTMLReport(reportData)
        contentType = 'text/html'
        fileExtension = 'html'
        break
      default:
        return NextResponse.json(
          { error: 'Unsupported format' },
          { status: 400 }
        )
    }

    const response = new NextResponse(content)
    response.headers.set('Content-Type', contentType)
    response.headers.set('Content-Disposition', `attachment; filename="${filename || 'report'}.${fileExtension}"`)

    return response
  } catch (error) {
    console.error('Failed to export report:', error)
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    )
  }
}

function generateHTMLReport(reportData: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Daily Business Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #8b5cf6;
            padding-bottom: 20px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric {
            text-align: center;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        .metric h3 {
            margin: 0 0 10px 0;
            color: #6c757d;
            font-size: 14px;
        }
        .metric .value {
            font-size: 24px;
            font-weight: bold;
            color: #495057;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            color: #8b5cf6;
            border-bottom: 1px solid #e9ecef;
            padding-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e9ecef;
        }
        th {
            background-color: #8b5cf6;
            color: white;
            font-weight: 600;
        }
        .insight {
            background-color: #f8f9fa;
            border-left: 4px solid #8b5cf6;
            padding: 15px;
            margin-bottom: 15px;
        }
        .insight h4 {
            margin: 0 0 10px 0;
            color: #495057;
        }
        .insight p {
            margin: 0 0 10px 0;
            color: #6c757d;
        }
        .action {
            background-color: #e9ecef;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Daily Business Report</h1>
        <p>${new Date(reportData.date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
    </div>

    <div class="summary">
        <div class="metric">
            <h3>Total Appointments</h3>
            <div class="value">${reportData.summary.totalAppointments}</div>
        </div>
        <div class="metric">
            <h3>Completed</h3>
            <div class="value">${reportData.summary.completedAppointments}</div>
        </div>
        <div class="metric">
            <h3>Revenue</h3>
            <div class="value">$${reportData.summary.totalRevenue.toLocaleString()}</div>
        </div>
        <div class="metric">
            <h3>New Customers</h3>
            <div class="value">${reportData.summary.newCustomers}</div>
        </div>
        <div class="metric">
            <h3>Average Ticket</h3>
            <div class="value">$${reportData.summary.averageTicket.toFixed(2)}</div>
        </div>
    </div>

    <div class="section">
        <h2>Top Services</h2>
        <table>
            <thead>
                <tr>
                    <th>Service</th>
                    <th>Bookings</th>
                    <th>Revenue</th>
                </tr>
            </thead>
            <tbody>
                ${reportData.topServices.map(service => `
                    <tr>
                        <td>${service.name}</td>
                        <td>${service.bookings}</td>
                        <td>$${service.revenue.toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Staff Performance</h2>
        <table>
            <thead>
                <tr>
                    <th>Staff Member</th>
                    <th>Appointments</th>
                    <th>Revenue</th>
                    <th>Utilization</th>
                </tr>
            </thead>
            <tbody>
                ${reportData.staffPerformance.map(staff => `
                    <tr>
                        <td>${staff.name}</td>
                        <td>${staff.appointments}</td>
                        <td>$${staff.revenue.toLocaleString()}</td>
                        <td>${staff.utilizationRate}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Business Insights</h2>
        ${reportData.insights.map(insight => `
            <div class="insight">
                <h4>${insight.title}</h4>
                <p>${insight.description}</p>
                ${insight.action ? `<div class="action">Action: ${insight.action}</div>` : ''}
            </div>
        `).join('')}
    </div>

    <div style="margin-top: 40px; text-align: center; color: #6c757d; font-size: 12px;">
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>`
}