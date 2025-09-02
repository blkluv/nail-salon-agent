# 📊 Developer 2: Analytics & Reporting Implementation

## 🎯 Your Mission
Build comprehensive analytics and reporting system for Professional and Business tiers. You can work independently but will need Dev 1's email service for automated reports.

---

## 📋 Task Breakdown

### 🔴 PRIORITY 1: Revenue Analytics (Day 1-2)

#### Enhance Dashboard Metrics
**File to update: `/dashboard/app/dashboard/analytics/page.tsx`**

Current state has basic counts. Add:

```typescript
// Add these data fetching functions

async function getRevenueMetrics(businessId: string, dateRange: DateRange) {
  const { data: payments } = await supabase
    .from('appointments')
    .select(`
      *,
      service:services(base_price)
    `)
    .eq('business_id', businessId)
    .eq('status', 'completed')
    .gte('appointment_date', dateRange.start)
    .lte('appointment_date', dateRange.end);

  const totalRevenue = payments?.reduce((sum, apt) => 
    sum + (apt.service?.base_price || 0), 0
  ) || 0;

  const dailyRevenue = {}; // Group by date
  const averageTicket = totalRevenue / (payments?.length || 1);

  return {
    totalRevenue,
    dailyRevenue,
    averageTicket,
    transactionCount: payments?.length || 0
  };
}

async function getServiceAnalytics(businessId: string) {
  const { data } = await supabase
    .from('appointments')
    .select(`
      service:services(name, base_price),
      status
    `)
    .eq('business_id', businessId);

  // Calculate:
  // - Most popular services
  // - Revenue by service
  // - Cancellation rate by service
  // - Average price by category
}
```

#### Create Revenue Charts
**Install recharts (already installed) and create components:**

```tsx
// Create: /dashboard/components/analytics/RevenueChart.tsx

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function RevenueChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value) => `$${value}`} />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#8b5cf6" 
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Also create:
// - ServicePopularityChart
// - StaffPerformanceChart
// - CustomerRetentionChart
```

#### Staff Performance Metrics
**Create: `/dashboard/components/analytics/StaffPerformance.tsx`**

```typescript
interface StaffMetrics {
  staffId: string;
  name: string;
  appointmentCount: number;
  revenue: number;
  averageServiceTime: number;
  utilizationRate: number; // % of available time booked
  topServices: string[];
  customerRating?: number; // Future feature
}

export function StaffPerformanceCard({ metrics }: { metrics: StaffMetrics }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{metrics.name}</h3>
          <p className="text-sm text-gray-600">
            {metrics.appointmentCount} appointments
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">
            ${metrics.revenue}
          </p>
          <p className="text-sm text-gray-600">Revenue</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <p className="text-sm text-gray-600">Utilization</p>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${metrics.utilizationRate}%` }}
              />
            </div>
            <span className="ml-2 text-sm">{metrics.utilizationRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### 🟡 PRIORITY 2: Reporting System (Day 3-4)

#### Report Generator Service
**Create: `/dashboard/lib/report-generator.ts`**

```typescript
import { createClient } from '@supabase/supabase-js';
import PDFDocument from 'pdfkit';

export class ReportGenerator {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  }

  async generateDailyReport(businessId: string, date: string) {
    // Fetch all data for the day
    const [appointments, revenue, newCustomers] = await Promise.all([
      this.getAppointmentData(businessId, date),
      this.getRevenueData(businessId, date),
      this.getNewCustomers(businessId, date)
    ]);

    return {
      date,
      summary: {
        totalAppointments: appointments.length,
        completedAppointments: appointments.filter(a => a.status === 'completed').length,
        totalRevenue: revenue,
        newCustomers: newCustomers.length
      },
      appointments,
      topServices: this.calculateTopServices(appointments),
      staffPerformance: this.calculateStaffPerformance(appointments)
    };
  }

  async generatePDFReport(reportData: any) {
    const doc = new PDFDocument();
    
    // Header
    doc.fontSize(20).text('Daily Business Report', 50, 50);
    doc.fontSize(12).text(`Date: ${reportData.date}`, 50, 80);
    
    // Summary section
    doc.fontSize(16).text('Summary', 50, 120);
    doc.fontSize(12)
      .text(`Total Revenue: $${reportData.summary.totalRevenue}`, 50, 150)
      .text(`Appointments: ${reportData.summary.totalAppointments}`, 50, 170)
      .text(`New Customers: ${reportData.summary.newCustomers}`, 50, 190);
    
    // Charts would go here (use chart.js to generate images)
    
    return doc;
  }
}
```

#### React PDF Reports
**Create: `/dashboard/components/reports/DailyReport.tsx`**

```tsx
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  section: {
    marginBottom: 10,
  }
});

export function DailyReportPDF({ data }: { data: any }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>Daily Report</Text>
          <Text>Date: {data.date}</Text>
        </View>
        
        <View style={styles.section}>
          <Text>Revenue: ${data.totalRevenue}</Text>
          <Text>Appointments: {data.appointments}</Text>
          <Text>New Customers: {data.newCustomers}</Text>
        </View>
        
        {/* Add charts as images */}
      </Page>
    </Document>
  );
}

// Usage in component:
<PDFDownloadLink 
  document={<DailyReportPDF data={reportData} />} 
  fileName="daily-report.pdf"
>
  {({ blob, url, loading, error }) =>
    loading ? 'Generating PDF...' : 'Download Report'
  }
</PDFDownloadLink>
```

#### Automated Report Emails
**Create: `/dashboard/app/api/cron/daily-reports/route.ts`**

```typescript
export async function GET() {
  // Depends on Dev 1's email service
  const { EmailService } = await import('@/lib/email-service');
  
  // Get all businesses with report subscriptions
  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('settings->daily_reports_enabled', true);
  
  for (const business of businesses || []) {
    // Generate report
    const report = await reportGenerator.generateDailyReport(
      business.id,
      new Date().toISOString().split('T')[0]
    );
    
    // Convert to PDF
    const pdfBuffer = await reportGenerator.generatePDFReport(report);
    
    // Email report
    await EmailService.sendReportEmail(
      business.email,
      'Daily Report',
      report,
      pdfBuffer
    );
  }
  
  return Response.json({ success: true });
}
```

**Add to vercel.json:**
```json
{
  "crons": [{
    "path": "/api/cron/daily-reports",
    "schedule": "0 21 * * *"  // 9 PM daily
  }]
}
```

---

### 🟢 PRIORITY 3: Multi-Location Analytics (Day 5)

#### Location Comparison Dashboard
**Create: `/dashboard/app/dashboard/analytics/multi-location/page.tsx`**

```tsx
export default function MultiLocationAnalytics() {
  const [locations, setLocations] = useState([]);
  const [comparison, setComparison] = useState({});
  
  // Fetch data for all locations
  useEffect(() => {
    async function loadLocationData() {
      const locations = await BusinessAPI.getLocations(businessId);
      
      const locationMetrics = await Promise.all(
        locations.map(async (location) => {
          const [revenue, appointments, customers] = await Promise.all([
            getLocationRevenue(location.id),
            getLocationAppointments(location.id),
            getLocationCustomers(location.id)
          ]);
          
          return {
            location,
            metrics: { revenue, appointments, customers }
          };
        })
      );
      
      setComparison(locationMetrics);
    }
  }, []);
  
  return (
    <div>
      {/* Location comparison charts */}
      <LocationComparisonChart data={comparison} />
      
      {/* Best/Worst performing metrics */}
      <PerformanceRanking locations={comparison} />
      
      {/* Detailed breakdown per location */}
      <LocationBreakdown data={comparison} />
    </div>
  );
}
```

---

## 🧪 Testing Checklist

### Analytics Testing
- [ ] Revenue calculations are accurate
- [ ] Date filtering works correctly
- [ ] Service popularity rankings correct
- [ ] Staff metrics calculate properly
- [ ] Charts render with real data

### Reporting Testing
- [ ] Daily reports generate correctly
- [ ] PDF exports are readable
- [ ] Email reports send (requires Dev 1's work)
- [ ] Scheduled reports trigger on time
- [ ] Multi-location reports aggregate correctly

---

## 📊 Sample Queries You'll Need

```sql
-- Revenue by day
SELECT 
  appointment_date,
  SUM(services.base_price) as daily_revenue,
  COUNT(*) as appointment_count
FROM appointments
JOIN services ON appointments.service_id = services.id
WHERE appointments.business_id = ?
  AND appointments.status = 'completed'
  AND appointment_date BETWEEN ? AND ?
GROUP BY appointment_date
ORDER BY appointment_date;

-- Staff performance
SELECT 
  staff.id,
  staff.first_name,
  staff.last_name,
  COUNT(appointments.id) as total_appointments,
  SUM(services.base_price) as total_revenue,
  AVG(EXTRACT(EPOCH FROM (appointments.end_time - appointments.start_time))/60) as avg_duration
FROM staff
LEFT JOIN appointments ON staff.id = appointments.staff_id
LEFT JOIN services ON appointments.service_id = services.id
WHERE staff.business_id = ?
  AND appointments.appointment_date BETWEEN ? AND ?
GROUP BY staff.id;

-- Customer retention
SELECT 
  DATE_TRUNC('month', first_appointment) as cohort_month,
  COUNT(DISTINCT customer_id) as cohort_size,
  COUNT(DISTINCT CASE WHEN return_visit IS NOT NULL THEN customer_id END) as returned
FROM (
  SELECT 
    customer_id,
    MIN(appointment_date) as first_appointment,
    MIN(CASE WHEN appointment_date > MIN(appointment_date) THEN appointment_date END) as return_visit
  FROM appointments
  WHERE business_id = ?
  GROUP BY customer_id
) as cohorts
GROUP BY cohort_month;
```

---

## 🔗 Dependencies

### What you need from Dev 1:
- Email service for sending reports (Day 3-4)
- Will be available by the time you need it

### What Dev 3 needs from you:
- Analytics components for white-label dashboard
- Multi-location comparison tools

---

## ⚠️ Important Notes

1. **Performance**: Analytics queries can be heavy - consider caching
2. **Time Zones**: Always use business timezone for reports
3. **Data Accuracy**: Validate calculations with manual checks
4. **Chart Libraries**: Recharts is already installed, use it
5. **PDF Generation**: Keep reports under 10MB for email

---

## 📚 Resources

- Recharts Docs: https://recharts.org/en-US
- React PDF: https://react-pdf.org/
- Supabase Aggregates: https://supabase.com/docs/guides/database/aggregate
- Test Data: Use Bella's Nails (bb18c6ca-7e97-449d-8245-e3c28a6b6971)

---

## 🚦 Definition of Done

- [ ] Revenue metrics displaying accurately
- [ ] Service analytics implemented
- [ ] Staff performance tracking
- [ ] Customer analytics working
- [ ] Daily/Weekly/Monthly reports generating
- [ ] PDF export functional
- [ ] Automated report emails (with Dev 1)
- [ ] Multi-location analytics complete
- [ ] All charts responsive and attractive
- [ ] Documentation updated