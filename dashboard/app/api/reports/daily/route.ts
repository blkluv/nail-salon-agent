import { NextRequest, NextResponse } from 'next/server'
import { ReportGenerator } from '../../../../lib/report-generator'

export async function POST(request: NextRequest) {
  try {
    const { businessId, date } = await request.json()

    if (!businessId || !date) {
      return NextResponse.json(
        { error: 'Business ID and date are required' },
        { status: 400 }
      )
    }

    const reportGenerator = new ReportGenerator()
    const report = await reportGenerator.generateDailyReport(businessId, date)

    return NextResponse.json({
      success: true,
      report
    })
  } catch (error) {
    console.error('Failed to generate daily report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const businessId = searchParams.get('businessId')
  const date = searchParams.get('date')

  if (!businessId || !date) {
    return NextResponse.json(
      { error: 'Business ID and date are required' },
      { status: 400 }
    )
  }

  try {
    const reportGenerator = new ReportGenerator()
    const report = await reportGenerator.generateDailyReport(businessId, date)

    return NextResponse.json({
      success: true,
      report
    })
  } catch (error) {
    console.error('Failed to generate daily report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}