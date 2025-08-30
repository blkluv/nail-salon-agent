'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CreditCardIcon,
  GiftIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  PencilIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { BusinessAPI } from '../../../lib/supabase'
import CustomerBookingFlow from '../../../components/CustomerBookingFlow'
import AppointmentManager from '../../../components/AppointmentManager'

interface CustomerData {
  id: string
  first_name: string
  last_name: string
  phone: string
  email?: string
  date_of_birth?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  postal_code?: string
  total_visits: number
  total_spent: number
  loyalty_points?: number
  loyalty_tier?: string
  preferences?: {
    notifications: boolean
    email_marketing: boolean
    sms_reminders: boolean
  }
}

interface Appointment {
  id: string
  appointment_date: string
  start_time: string
  end_time: string
  status: string
  service?: { name: string; duration_minutes: number }
  staff?: { first_name: string; last_name: string }
  total_amount?: number
}

export default function CustomerPortal() {
  const router = useRouter()
  const [customer, setCustomer] = useState<CustomerData | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('appointments')
  const [showRescheduleModal, setShowRescheduleModal] = useState<string | null>(null)
  const [showBookingFlow, setShowBookingFlow] = useState(false)
  const [appointmentToManage, setAppointmentToManage] = useState<Appointment | null>(null)

  // Get business ID from session (set during login)
  const [businessId, setBusinessId] = useState<string>('')
  
  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    email: '',
    date_of_birth: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: ''
  })

  useEffect(() => {
    loadCustomerData()
  }, [])

  const loadCustomerData = async () => {
    try {
      const phone = localStorage.getItem('customer_phone')
      const sessionBusinessId = localStorage.getItem('customer_business_id')
      const businessName = localStorage.getItem('customer_business_name')
      
      if (!phone || !sessionBusinessId) {
        router.push('/customer/login')
        return
      }

      setBusinessId(sessionBusinessId)
      console.log('Using business:', businessName, 'ID:', sessionBusinessId)

      // Fetch real customer data from database (don't filter by business - multi-business support)
      const realCustomer = await BusinessAPI.getCustomerByPhone(phone)
      console.log('Looking for customer with phone:', phone, 'in business:', sessionBusinessId)
      console.log('Found customer:', realCustomer)
      
      let customerData: CustomerData
      if (realCustomer) {
        // Use real customer data
        customerData = {
          id: realCustomer.id,
          first_name: realCustomer.first_name,
          last_name: realCustomer.last_name,
          phone: realCustomer.phone,
          email: realCustomer.email || '',
          total_visits: realCustomer.total_visits,
          total_spent: realCustomer.total_spent,
          loyalty_points: 125, // Mock for now - would come from loyalty system
          loyalty_tier: 'Silver', // Mock for now - would be calculated
          preferences: realCustomer.preferences || {
            notifications: true,
            email_marketing: true,
            sms_reminders: true
          }
        }

        // Fetch real appointments for this customer
        const realAppointments = await BusinessAPI.getCustomerAppointments(realCustomer.id)
        setAppointments(realAppointments)
      } else {
        // Customer not found in database - use mock data for demo
        customerData = {
          id: 'demo-customer',
          first_name: 'Demo',
          last_name: 'Customer',
          phone: phone,
          email: 'demo@example.com',
          total_visits: 0,
          total_spent: 0,
          loyalty_points: 0,
          loyalty_tier: 'Bronze',
          preferences: {
            notifications: true,
            email_marketing: true,
            sms_reminders: true
          }
        }

        // No appointments for new customers
        setAppointments([])
      }

      setCustomer(customerData)
      
      // Initialize profile form data
      setProfileData({
        email: customerData.email || '',
        date_of_birth: customerData.date_of_birth || '',
        emergency_contact_name: customerData.emergency_contact_name || '',
        emergency_contact_phone: customerData.emergency_contact_phone || '',
        address_line1: customerData.address_line1 || '',
        address_line2: customerData.address_line2 || '',
        city: customerData.city || '',
        state: customerData.state || '',
        postal_code: customerData.postal_code || ''
      })
    } catch (error) {
      console.error('Failed to load customer data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('customer_phone')
    router.push('/customer/login')
  }

  const handleProfileUpdate = async () => {
    if (!customer) return
    
    try {
      setIsEditingProfile(true)
      
      // Update customer in database
      const updatedCustomer = await BusinessAPI.updateCustomer(customer.id, {
        email: profileData.email,
        // Store additional fields in preferences for now
        preferences: {
          ...customer.preferences,
          date_of_birth: profileData.date_of_birth,
          emergency_contact_name: profileData.emergency_contact_name,
          emergency_contact_phone: profileData.emergency_contact_phone,
          address_line1: profileData.address_line1,
          address_line2: profileData.address_line2,
          city: profileData.city,
          state: profileData.state,
          postal_code: profileData.postal_code
        }
      })
      
      if (updatedCustomer) {
        // Update local customer state
        setCustomer(prev => prev ? {
          ...prev,
          email: updatedCustomer.email,
          date_of_birth: profileData.date_of_birth,
          emergency_contact_name: profileData.emergency_contact_name,
          emergency_contact_phone: profileData.emergency_contact_phone,
          address_line1: profileData.address_line1,
          address_line2: profileData.address_line2,
          city: profileData.city,
          state: profileData.state,
          postal_code: profileData.postal_code,
          preferences: updatedCustomer.preferences
        } : null)
        
        alert('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsEditingProfile(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load customer data</p>
          <button 
            onClick={() => router.push('/customer/login')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {customer.first_name}!
                </h1>
                <p className="text-gray-600">Manage your appointments and account</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Customer Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">
                    {customer.first_name[0]}{customer.last_name[0]}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {customer.first_name} {customer.last_name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{customer.phone}</p>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-purple-600">{customer.total_visits}</p>
                    <p className="text-xs text-gray-600">Visits</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-green-600">${customer.total_spent}</p>
                    <p className="text-xs text-gray-600">Spent</p>
                  </div>
                </div>

                {customer.loyalty_points && (
                  <div className="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3">
                    <div className="flex items-center justify-center mb-1">
                      <GiftIcon className="h-4 w-4 text-yellow-600 mr-1" />
                      <span className="text-sm font-medium text-yellow-800">{customer.loyalty_tier} Member</span>
                    </div>
                    <p className="text-xl font-bold text-yellow-700">{customer.loyalty_points}</p>
                    <p className="text-xs text-yellow-600">Loyalty Points</p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {[
                { id: 'appointments', label: 'Appointments', icon: CalendarIcon },
                { id: 'profile', label: 'Profile', icon: UserIcon },
                { id: 'preferences', label: 'Preferences', icon: Cog6ToothIcon }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'appointments' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Your Appointments</h2>
                  
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <CalendarIcon className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{appointment.service?.name}</h3>
                              <p className="text-sm text-gray-600">
                                with {appointment.staff?.first_name} {appointment.staff?.last_name}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(appointment.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center text-gray-600">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {formatDate(appointment.appointment_date)}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <ClockIcon className="h-4 w-4 mr-2" />
                            {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                          </div>
                        </div>

                        {appointment.status === 'confirmed' && (
                          <div className="mt-4 flex space-x-2">
                            <button
                              onClick={() => setAppointmentToManage(appointment)}
                              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                            >
                              Reschedule
                            </button>
                            <button className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200">
                              Cancel
                            </button>
                          </div>
                        )}

                        {appointment.total_amount && (
                          <div className="mt-2 text-right">
                            <span className="text-sm font-medium text-gray-900">
                              ${appointment.total_amount}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <button 
                      onClick={() => setShowBookingFlow(true)}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      Book New Appointment
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
                
                <div className="space-y-8">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          value={customer.first_name}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          value={customer.last_name}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={customer.phone}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Add your email address"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                        <input
                          type="date"
                          value={profileData.date_of_birth}
                          onChange={(e) => setProfileData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                        <input
                          type="text"
                          value={profileData.address_line1}
                          onChange={(e) => setProfileData(prev => ({ ...prev, address_line1: e.target.value }))}
                          placeholder="Street address"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                        <input
                          type="text"
                          value={profileData.address_line2}
                          onChange={(e) => setProfileData(prev => ({ ...prev, address_line2: e.target.value }))}
                          placeholder="Apt, suite, etc. (optional)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                          <input
                            type="text"
                            value={profileData.city}
                            onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="City"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                          <input
                            type="text"
                            value={profileData.state}
                            onChange={(e) => setProfileData(prev => ({ ...prev, state: e.target.value }))}
                            placeholder="State"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                          <input
                            type="text"
                            value={profileData.postal_code}
                            onChange={(e) => setProfileData(prev => ({ ...prev, postal_code: e.target.value }))}
                            placeholder="ZIP Code"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                        <input
                          type="text"
                          value={profileData.emergency_contact_name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                          placeholder="Full name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                        <input
                          type="tel"
                          value={profileData.emergency_contact_phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                          placeholder="Phone number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <button 
                      onClick={handleProfileUpdate}
                      disabled={isEditingProfile}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isEditingProfile ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  {[
                    {
                      key: 'sms_reminders',
                      title: 'SMS Reminders',
                      description: 'Receive text message reminders before your appointments'
                    },
                    {
                      key: 'email_marketing',
                      title: 'Email Updates',
                      description: 'Get special offers and salon news via email'
                    },
                    {
                      key: 'notifications',
                      title: 'Push Notifications',
                      description: 'Receive notifications about appointment confirmations and changes'
                    }
                  ].map((pref) => (
                    <div key={pref.key} className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div>
                        <h3 className="font-medium text-gray-900">{pref.title}</h3>
                        <p className="text-sm text-gray-600">{pref.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customer.preferences?.[pref.key as keyof typeof customer.preferences] || false}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}

                  <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Flow Modal */}
      {showBookingFlow && businessId && (
        <CustomerBookingFlow
          businessId={businessId}
          customerPhone={customer?.phone}
          customerName={customer ? `${customer.first_name} ${customer.last_name}` : undefined}
          customerEmail={customer?.email}
          onBookingComplete={async (appointmentId) => {
            setShowBookingFlow(false)
            // Show success message
            alert(`Appointment booked successfully! Appointment ID: ${appointmentId}`)
            // Wait a moment for database to update
            setTimeout(() => {
              // Refresh appointments list
              loadCustomerData()
            }, 2000)
          }}
          onClose={() => setShowBookingFlow(false)}
        />
      )}

      {/* Appointment Management Modal */}
      {appointmentToManage && (
        <AppointmentManager
          appointment={appointmentToManage}
          onClose={() => setAppointmentToManage(null)}
          onRescheduleComplete={() => {
            setAppointmentToManage(null)
            loadCustomerData()
            alert('Appointment rescheduled successfully!')
          }}
          onCancelComplete={() => {
            setAppointmentToManage(null)
            loadCustomerData()
            alert('Appointment cancelled successfully!')
          }}
        />
      )}
    </div>
  )
}