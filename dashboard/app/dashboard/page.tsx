'use client'

import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { BusinessAPI, type Business, type DashboardStats, type Appointment } from '../../lib/supabase'
import {
  CalendarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PhoneIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { format, isToday, isTomorrow } from 'date-fns'

// Get business ID from localStorage (set during onboarding) or use demo
const getBusinessId = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('demo_business_id') || process.env.NEXT_PUBLIC_DEMO_BUSINESS_ID || '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'
  }
  return process.env.NEXT_PUBLIC_DEMO_BUSINESS_ID || '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'
}


export default function DashboardPage() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    todayAppointments: 0,
    monthlyRevenue: 0,
    activeCustomers: 0
  })
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load business data
      const businessId = getBusinessId()
      const businessData = await BusinessAPI.getBusiness(businessId)
      if (businessData) {
        setBusiness(businessData)
      } else {
        setError('Business not found. Please check your configuration.')
        return
      }

      // Load dashboard statistics
      const dashboardStats = await BusinessAPI.getDashboardStats(businessId)
      setStats(dashboardStats)

      // Load upcoming appointments
      const upcomingAppts = await BusinessAPI.getUpcomingAppointments(businessId, 5)
      setUpcomingAppointments(upcomingAppts)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <Layout business={business}>
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1,2,3,4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout business={business}>
        <div className="p-8">
          <div className="text-center">
            <div className="text-red-600 text-lg font-medium mb-4">{error}</div>
            <button 
              onClick={() => loadDashboardData()}
              className="btn-primary"
            >
              Try Again
            </button>
            <div className="mt-4 text-sm text-gray-500">
              Make sure you have configured your Supabase credentials in .env.local
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout business={business}>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening at {business?.name} today.
          </p>
        </div>

        {/* Stats Cards */}
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
                      {stats.todayAppointments}
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
                      ${stats.monthlyRevenue.toLocaleString()}
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
                      {stats.activeCustomers}
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
                      {stats.totalAppointments.toLocaleString()}
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
                <a 
                  href="/dashboard/appointments" 
                  className="text-brand-600 hover:text-brand-700 text-sm font-medium"
                >
                  View all
                </a>
              </div>
              
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
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
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.customer ? `${appointment.customer.first_name} ${appointment.customer.last_name}` : 'Unknown Customer'}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {appointment.service?.name || 'Unknown Service'} {appointment.staff && `with ${appointment.staff.first_name} ${appointment.staff.last_name}`}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-gray-400">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {formatAppointmentDate(appointment.appointment_date)} at {appointment.start_time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions & Voice AI Status */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <a 
                  href="/dashboard/appointments" 
                  className="flex items-center p-3 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors group"
                >
                  <CalendarIcon className="h-5 w-5 text-brand-600 mr-3" />
                  <span className="text-sm font-medium text-brand-700 group-hover:text-brand-800">
                    Add New Appointment
                  </span>
                </a>
                
                <a 
                  href="/dashboard/customers" 
                  className="flex items-center p-3 bg-beauty-50 rounded-lg hover:bg-beauty-100 transition-colors group"
                >
                  <UsersIcon className="h-5 w-5 text-beauty-600 mr-3" />
                  <span className="text-sm font-medium text-beauty-700 group-hover:text-beauty-800">
                    View Customers
                  </span>
                </a>
                
                <a 
                  href="/dashboard/staff" 
                  className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                >
                  <UsersIcon className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm font-medium text-green-700 group-hover:text-green-800">
                    Manage Staff
                  </span>
                </a>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="card mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Subscription
                </h2>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  business?.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
                  business?.subscription_status === 'trialing' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {business?.subscription_status === 'trialing' ? 'Trial' : business?.subscription_status}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Current Plan</span>
                  <span className="font-medium capitalize">{business?.subscription_tier || 'Starter'}</span>
                </div>
                {business?.subscription_status === 'trialing' && business?.trial_ends_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Trial Ends</span>
                    <span className="font-medium">
                      {new Date(business.trial_ends_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {business?.settings?.monthly_price && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Monthly Price</span>
                    <span className="font-medium">${business.settings.monthly_price}/mo</span>
                  </div>
                )}
                {business?.settings?.selected_plan && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Plan Type</span>
                    <span className="font-medium capitalize">{business.settings.selected_plan}</span>
                  </div>
                )}
                {business?.settings?.tech_calendar_count && business.settings.tech_calendar_count > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tech Calendars</span>
                    <span className="font-medium">{business.settings.tech_calendar_count} technicians</span>
                  </div>
                )}
              </div>
              
              <a 
                href="/dashboard/billing" 
                className="mt-4 flex items-center justify-center p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Manage Subscription</span>
              </a>
            </div>

            {/* Voice AI Status */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Voice AI Status
                </h2>
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="ml-2 text-sm text-green-600 font-medium">
                    Active
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Calls Today</span>
                  <span className="font-medium">23</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Bookings Made</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Conversion Rate</span>
                  <span className="font-medium text-green-600">34.8%</span>
                </div>
              </div>
              
              <a 
                href="/dashboard/voice-ai" 
                className="mt-4 flex items-center justify-center p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
              >
                <PhoneIcon className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Manage Voice AI</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}