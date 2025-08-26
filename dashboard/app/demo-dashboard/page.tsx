'use client'

import { useState } from 'react'
import Layout from '../../components/Layout'
import {
  CalendarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PhoneIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { format, isToday, isTomorrow, addDays, subDays } from 'date-fns'

// Mock data for demo dashboard
const MOCK_BUSINESS = {
  id: 'demo-salon-123',
  name: 'Glamour Nails & Spa',
  subscription_tier: 'professional',
  subscription_status: 'trialing',
  trial_ends_at: addDays(new Date(), 10).toISOString(),
  settings: {
    monthly_price: 124,
    selected_plan: 'professional',
    selected_addons: ['tech-calendars'],
    tech_calendar_count: 3
  }
}

const MOCK_STATS = {
  totalAppointments: 847,
  todayAppointments: 12,
  monthlyRevenue: 18650,
  activeCustomers: 234
}

const MOCK_APPOINTMENTS = [
  {
    id: '1',
    customer_name: 'Sarah Johnson',
    service_name: 'Gel Manicure',
    appointment_date: new Date().toISOString(),
    appointment_time: '10:00',
    status: 'confirmed',
    price: 50,
    staff_name: 'Maria'
  },
  {
    id: '2', 
    customer_name: 'Jennifer Lee',
    service_name: 'Spa Pedicure',
    appointment_date: new Date().toISOString(),
    appointment_time: '11:30',
    status: 'confirmed',
    price: 75,
    staff_name: 'Ana'
  },
  {
    id: '3',
    customer_name: 'Emily Chen',
    service_name: 'Nail Art Design',
    appointment_date: addDays(new Date(), 1).toISOString(),
    appointment_time: '2:00 PM',
    status: 'pending',
    price: 65,
    staff_name: 'Jessica'
  },
  {
    id: '4',
    customer_name: 'Lisa Rodriguez',
    service_name: 'Mani-Pedi Combo',
    appointment_date: addDays(new Date(), 1).toISOString(),
    appointment_time: '3:30 PM',
    status: 'confirmed', 
    price: 85,
    staff_name: 'Maria'
  },
  {
    id: '5',
    customer_name: 'Amanda White',
    service_name: 'French Manicure',
    appointment_date: addDays(new Date(), 2).toISOString(),
    appointment_time: '1:00 PM',
    status: 'confirmed',
    price: 45,
    staff_name: 'Ana'
  }
]

const MOCK_AI_ACTIVITY = [
  { time: '2 minutes ago', action: 'Booked appointment for Lisa M.', value: '$65' },
  { time: '8 minutes ago', action: 'Answered customer question about services', value: 'Support' },
  { time: '15 minutes ago', action: 'Confirmed tomorrow\'s appointment', value: 'Retention' },
  { time: '23 minutes ago', action: 'Booked spa pedicure for new customer', value: '$75' },
  { time: '35 minutes ago', action: 'Handled cancellation and rescheduled', value: '$50 saved' }
]

export default function DemoDashboardPage() {
  const [showAIActivity, setShowAIActivity] = useState(false)
  const [showNewAppointmentForm, setShowNewAppointmentForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState<string | null>(null)
  const [newAppointment, setNewAppointment] = useState({
    customer_name: '',
    service_name: 'Gel Manicure',
    date: '',
    time: '',
    staff_name: 'Maria',
    price: 50
  })

  const handleNewAppointment = () => {
    console.log('New appointment:', newAppointment)
    alert(`✅ Demo: Appointment Successfully Created!

📋 APPOINTMENT DETAILS:
👤 Customer: ${newAppointment.customer_name}
💅 Service: ${newAppointment.service_name}
📅 Date: ${newAppointment.date}
⏰ Time: ${newAppointment.time}
👩‍💼 Staff: ${newAppointment.staff_name}
💰 Price: $${newAppointment.price}

🎯 AUTOMATED ACTIONS COMPLETED:
✅ Customer SMS confirmation sent
✅ Staff calendar updated automatically
✅ Reminder scheduled for 24hrs before
✅ Payment link sent to customer
✅ Inventory reserved for appointment
✅ Email confirmation with directions

📈 BUSINESS IMPACT:
• Revenue added: $${newAppointment.price}
• Calendar utilization: +1.2%
• Customer satisfaction: Instant booking
• Staff efficiency: Zero manual work

In the real app, this appointment would be immediately available across all your systems, and your customer would receive instant confirmation!`)
    setShowNewAppointmentForm(false)
    setNewAppointment({ customer_name: '', service_name: 'Gel Manicure', date: '', time: '', staff_name: 'Maria', price: 50 })
  }

  const handleEditAppointment = (appointmentId: string) => {
    const appointment = MOCK_APPOINTMENTS.find(a => a.id === appointmentId)
    console.log('Edit appointment:', appointmentId)
    alert(`⚡ Demo: Appointment Editor Opened!

📝 CURRENT APPOINTMENT:
👤 Customer: ${appointment?.customer_name}
💅 Service: ${appointment?.service_name} ($${appointment?.price})
📅 Date: ${appointment?.appointment_date.split('T')[0]}
⏰ Time: ${appointment?.appointment_time}
👩‍💼 Staff: ${appointment?.staff_name}
📋 Status: ${appointment?.status}

✨ EDITING OPTIONS AVAILABLE:

🕐 TIME CHANGES:
• Drag to new time slot
• See real-time availability
• Auto-conflict detection

👥 STAFF REASSIGNMENT:
• View all qualified staff
• Check availability instantly
• Maintain service quality

💅 SERVICE MODIFICATIONS:
• Upgrade/downgrade services
• Adjust pricing automatically
• Update duration estimates

📞 CUSTOMER COMMUNICATION:
• Auto-send change notifications
• Request confirmation
• Update calendar invites

💡 SMART FEATURES:
✅ Drag & drop rescheduling
✅ Conflict prevention
✅ Automatic notifications
✅ Revenue impact calculations
✅ Staff workload optimization

In the real app, any changes sync instantly across all systems and notify both staff and customers automatically!`)
    setShowEditForm(null)
  }

  const handleCancelAppointment = (appointmentId: string) => {
    const appointment = MOCK_APPOINTMENTS.find(a => a.id === appointmentId)
    if (confirm(`🚫 Confirm Cancellation\n\nCancel ${appointment?.service_name} appointment for ${appointment?.customer_name} on ${appointment?.appointment_date.split('T')[0]} at ${appointment?.appointment_time}?\n\nThis action will free up the time slot and notify the customer.`)) {
      alert(`✅ Demo: Appointment Successfully Cancelled!

📋 CANCELLED APPOINTMENT:
👤 Customer: ${appointment?.customer_name}
💅 Service: ${appointment?.service_name}
📅 Date: ${appointment?.appointment_date.split('T')[0]}
⏰ Time: ${appointment?.appointment_time}
👩‍💼 Staff: ${appointment?.staff_name}
💰 Value: $${appointment?.price}

🔄 AUTOMATED ACTIONS COMPLETED:
✅ Customer SMS cancellation notice sent
✅ Email confirmation with apology message
✅ Staff calendar automatically updated
✅ Time slot opened for new bookings
✅ Refund processed (if applicable)
✅ Waitlist customers notified of availability

📊 BUSINESS INTELLIGENCE:
• Cancelled revenue: $${appointment?.price}
• Time slot now available for rebooking
• Staff utilization optimized
• Customer relationship maintained

💡 SMART RESCHEDULING:
The system automatically offered 3 alternative dates to ${appointment?.customer_name} and she selected next Tuesday at 2:00 PM!

🎯 RESULT: Cancellation converted to rescheduled appointment - no lost revenue!

In the real app, cancellations are handled professionally with automatic rebooking opportunities and customer retention features.`)
    }
  }
  
  const formatAppointmentDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'MMM d')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Layout business={MOCK_BUSINESS}>
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 mb-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
              <span className="text-xl">🎬</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">Demo Dashboard Experience</h3>
              <p className="text-purple-100 text-sm">This is what YOUR salon dashboard would look like with real data!</p>
            </div>
          </div>
          <a 
            href="/onboarding"
            className="px-6 py-3 bg-white text-purple-600 font-bold rounded-full hover:bg-purple-50 transition-colors"
          >
            Start My Free Trial
          </a>
        </div>
      </div>

      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {MOCK_BUSINESS.name}! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              Here's what's happening with your salon today
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Today's Revenue</div>
              <div className="text-2xl font-bold text-green-600">$642</div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-8 w-8 text-brand-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Today's Appointments
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {MOCK_STATS.todayAppointments}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Monthly Revenue
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${MOCK_STATS.monthlyRevenue.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-8 w-8 text-beauty-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Customers
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {MOCK_STATS.activeCustomers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Appointments
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {MOCK_STATS.totalAppointments.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Upcoming Appointments
                </h2>
                <button 
                  onClick={() => alert('Demo: Complete Appointments Calendar\n\n📅 FULL SCHEDULE VIEW:\n\nTODAY (12 appointments):\n• 9:00 AM - Sarah J. - Gel Manicure (Maria) - $50\n• 9:30 AM - Lisa M. - French Tips (Ana) - $45\n• 10:00 AM - Emma K. - Spa Pedicure (Jessica) - $75\n• 11:30 AM - Jennifer L. - Spa Pedicure (Ana) - $75\n• 12:00 PM - David R. - Basic Manicure (Maria) - $35\n• 1:00 PM - Sophie T. - Nail Art (Maria) - $65\n• 2:00 PM - Alex W. - Mani-Pedi Combo (Jessica) - $85\n• 3:00 PM - Rachel P. - Gel Extensions (Maria) - $95\n• 4:00 PM - Mike L. - Basic Manicure (Ana) - $35\n• 5:00 PM - Jessica H. - Luxury Pedicure (Ana) - $90\n• 6:00 PM - Chris D. - Quick Polish (Jessica) - $25\n• 7:00 PM - Amanda S. - Gel Removal (Maria) - $20\n\nTOMORROW (15 appointments scheduled)\nTHIS WEEK (89 appointments total)\nNEXT WEEK (94% booked already!)\n\n✨ CALENDAR FEATURES:\n✅ Drag & drop rescheduling\n✅ Color coding by service type\n✅ Staff availability optimization\n✅ Automated reminder system\n✅ Real-time availability sync\n✅ Mobile calendar access\n\nIn the real app, you can manage hundreds of appointments with ease!')}
                  className="text-brand-600 hover:text-brand-700 text-sm font-medium"
                >
                  View all
                </button>
              </div>
              
              <div className="space-y-4">
                {MOCK_APPOINTMENTS.map((appointment) => (
                  <div 
                    key={appointment.id} 
                    className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-brand-100 rounded-full flex items-center justify-center">
                        <CalendarIcon className="h-5 w-5 text-brand-600" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">
                          {appointment.customer_name}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <div className="flex items-center mt-1 text-xs text-gray-500 space-x-4">
                        <span>{appointment.service_name}</span>
                        <span>•</span>
                        <span>{formatAppointmentDate(appointment.appointment_date)} at {appointment.appointment_time}</span>
                        <span>•</span>
                        <span>{appointment.staff_name}</span>
                        <span>•</span>
                        <span className="font-medium text-green-600">${appointment.price}</span>
                      </div>
                      <div className="flex items-center mt-2 space-x-2">
                        <button
                          onClick={() => handleEditAppointment(appointment.id)}
                          className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => alert(`Demo: Send reminder to ${appointment.customer_name}!\n\n✅ SMS reminder sent\n✅ Email confirmation sent\n✅ Calendar updated`)}
                          className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                        >
                          Remind
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowNewAppointmentForm(true)}
                  className="flex items-center w-full p-3 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors group text-left"
                >
                  <CalendarIcon className="h-5 w-5 text-brand-600 mr-3" />
                  <span className="text-sm font-medium text-brand-700 group-hover:text-brand-800">
                    Add New Appointment
                  </span>
                </button>
                
                <button 
                  onClick={() => alert('Demo: Customer Management System\n\n📋 CUSTOMER DATABASE:\n\n👤 Sarah Johnson - VIP Customer\n   • Total Visits: 23\n   • Total Spent: $1,247\n   • Preferred Tech: Maria\n   • Last Visit: 3 days ago\n   • Notes: Loves gel extensions\n\n👤 Jennifer Lee - Regular\n   • Total Visits: 8\n   • Total Spent: $420\n   • Preferred Tech: Ana\n   • Last Visit: 2 weeks ago\n   • Birthday: March 15th\n\n👤 Emily Chen - New Customer\n   • Total Visits: 1\n   • Total Spent: $65\n   • Interested in: Nail art\n   • Referral: Instagram\n\n✨ FEATURES AVAILABLE:\n✅ Customer profiles with photos\n✅ Complete booking history\n✅ Contact & preference tracking\n✅ Loyalty points system\n✅ Birthday reminders\n✅ Automated follow-ups')}
                  className="flex items-center w-full p-3 bg-beauty-50 rounded-lg hover:bg-beauty-100 transition-colors group text-left"
                >
                  <UsersIcon className="h-5 w-5 text-beauty-600 mr-3" />
                  <span className="text-sm font-medium text-beauty-700 group-hover:text-beauty-800">
                    View Customers
                  </span>
                </button>
                
                <button 
                  onClick={() => alert('Demo: Staff Management System\n\n👥 STAFF ROSTER:\n\n💅 Maria Rodriguez - Lead Technician\n   • Experience: 8 years\n   • Specialties: Gel extensions, nail art\n   • This Month: 89 appointments, $4,230 revenue\n   • Rating: 4.9/5 stars (127 reviews)\n   • Schedule: Tue-Sat, 9am-7pm\n   • Commission: $847 earned\n\n💅 Ana Santos - Senior Technician\n   • Experience: 5 years  \n   • Specialties: Pedicures, classic manicures\n   • This Month: 76 appointments, $3,420 revenue\n   • Rating: 4.8/5 stars (98 reviews)\n   • Schedule: Mon-Fri, 10am-6pm\n   • Commission: $684 earned\n\n💅 Jessica Kim - Junior Technician\n   • Experience: 2 years\n   • Specialties: Basic services, training\n   • This Month: 45 appointments, $1,890 revenue\n   • Rating: 4.6/5 stars (34 reviews)\n   • Schedule: Wed-Sun, 11am-8pm\n   • Commission: $378 earned\n\n✨ STAFF FEATURES:\n✅ Individual performance tracking\n✅ Automated schedule management\n✅ Commission calculations\n✅ Customer review aggregation\n✅ Training progress tracking\n✅ Availability optimization')}
                  className="flex items-center w-full p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group text-left"
                >
                  <UsersIcon className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm font-medium text-green-700 group-hover:text-green-800">
                    Manage Staff
                  </span>
                </button>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="card mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Subscription
                </h2>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  Trial
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Current Plan</span>
                  <span className="font-medium capitalize">Professional</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Trial Ends</span>
                  <span className="font-medium">
                    {new Date(MOCK_BUSINESS.trial_ends_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Monthly Price</span>
                  <span className="font-medium">${MOCK_BUSINESS.settings.monthly_price}/mo</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tech Calendars</span>
                  <span className="font-medium">{MOCK_BUSINESS.settings.tech_calendar_count} technicians</span>
                </div>
              </div>
              
              <button 
                onClick={() => alert('Demo: Subscription Management\n\n💎 CURRENT PLAN: Professional ($99/month)\n\n📊 PLAN BENEFITS:\n✅ SMS + Web + Voice booking channels\n✅ AI phone receptionist (24/7)\n✅ Advanced analytics dashboard\n✅ Priority customer support\n✅ Custom reminder templates\n✅ Staff management tools\n✅ Tech calendar add-on: $45/month (3 techs)\n\n💰 BILLING DETAILS:\nNext Billing: March 26, 2025\nTotal: $144/month ($99 + $45 add-on)\nPayment Method: •••• 4242\n\n🎯 UPGRADE OPTIONS:\n• Premium Plan: $179/month\n  → White-label booking pages\n  → API access & integrations\n  → Dedicated account manager\n  → 24/7 phone support\n\n📈 ROI THIS MONTH:\n• Automated bookings: $18,650 revenue\n• Time saved: 40 hours\n• Cost per booking: $0.83\n• Return on investment: 12,900%\n\nIn the real app, you can upgrade, downgrade, or cancel anytime!')}
                className="mt-4 w-full flex items-center justify-center p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Manage Subscription</span>
              </button>
            </div>

            {/* Voice AI Status */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Voice AI Activity
                </h2>
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="ml-2 text-sm text-green-600 font-medium">
                    Live
                  </span>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Calls Today</span>
                  <span className="font-medium">18</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Bookings Made</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Conversion Rate</span>
                  <span className="font-medium text-green-600">66.7%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Revenue Generated</span>
                  <span className="font-medium text-green-600">$642</span>
                </div>
              </div>
              
              <button 
                onClick={() => setShowAIActivity(!showAIActivity)}
                className="w-full flex items-center justify-center p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors mb-4"
              >
                <PhoneIcon className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">
                  {showAIActivity ? 'Hide' : 'View'} Recent Activity
                </span>
              </button>

              {showAIActivity && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Recent AI Actions:</h3>
                  <div className="space-y-2">
                    {MOCK_AI_ACTIVITY.map((activity, index) => (
                      <div key={index} className="text-xs bg-gray-50 rounded p-2">
                        <div className="flex justify-between items-start">
                          <span className="text-gray-600 flex-1">{activity.action}</span>
                          <span className="font-medium text-green-600 ml-2">{activity.value}</span>
                        </div>
                        <div className="text-gray-400 mt-1">{activity.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Demo CTA */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <StarIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Love what you see?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  This could be YOUR salon's dashboard in just 5 minutes!
                </p>
                <a 
                  href="/onboarding"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 transition-colors"
                >
                  Start Free Trial
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </a>
                <div className="text-xs text-green-600 mt-2">
                  ✅ No credit card required
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Appointment Modal */}
      {showNewAppointmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Appointment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={newAppointment.customer_name}
                  onChange={(e) => setNewAppointment({...newAppointment, customer_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                <select
                  value={newAppointment.service_name}
                  onChange={(e) => setNewAppointment({...newAppointment, service_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="Gel Manicure">Gel Manicure ($50)</option>
                  <option value="Spa Pedicure">Spa Pedicure ($75)</option>
                  <option value="Nail Art">Nail Art ($65)</option>
                  <option value="Mani-Pedi Combo">Mani-Pedi Combo ($85)</option>
                  <option value="French Manicure">French Manicure ($45)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
                <select
                  value={newAppointment.staff_name}
                  onChange={(e) => setNewAppointment({...newAppointment, staff_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="Maria">Maria</option>
                  <option value="Ana">Ana</option>
                  <option value="Jessica">Jessica</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowNewAppointmentForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleNewAppointment}
                disabled={!newAppointment.customer_name || !newAppointment.date || !newAppointment.time}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}