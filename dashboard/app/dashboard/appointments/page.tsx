'use client'

import { useEffect, useState } from 'react'
import Layout from '../../../components/Layout'
import { BusinessAPI } from '../../../lib/supabase'
import { 
  CalendarIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { format, isToday, isTomorrow } from 'date-fns'
import { clsx } from 'clsx'

interface Appointment {
  id: string
  booking_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  service_type: string
  service_duration: number
  service_price: number
  appointment_date: string
  start_time: string
  end_time: string
  technician_name: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'in_progress'
  payment_status: 'pending' | 'paid' | 'partially_paid' | 'refunded'
  created_at: string
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    booking_id: 'BK-001',
    customer_name: 'Sarah Johnson',
    customer_email: 'sarah@email.com',
    customer_phone: '(555) 123-4567',
    service_type: 'Gel Manicure',
    service_duration: 75,
    service_price: 55,
    appointment_date: new Date().toISOString().split('T')[0],
    start_time: '10:00',
    end_time: '11:15',
    technician_name: 'Maya',
    status: 'confirmed',
    payment_status: 'paid',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    booking_id: 'BK-002',
    customer_name: 'Emily Chen',
    customer_email: 'emily@email.com',
    customer_phone: '(555) 234-5678',
    service_type: 'Spa Pedicure',
    service_duration: 90,
    service_price: 65,
    appointment_date: new Date().toISOString().split('T')[0],
    start_time: '11:30',
    end_time: '13:00',
    technician_name: 'Jessica',
    status: 'confirmed',
    payment_status: 'pending',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    booking_id: 'BK-003',
    customer_name: 'Maria Rodriguez',
    customer_email: 'maria@email.com',
    customer_phone: '(555) 345-6789',
    service_type: 'Mani + Pedi Combo',
    service_duration: 120,
    service_price: 85,
    appointment_date: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0],
    start_time: '14:00',
    end_time: '16:00',
    technician_name: 'Sarah',
    status: 'pending',
    payment_status: 'pending',
    created_at: new Date().toISOString()
  }
]

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get business ID from demo or localStorage
  const businessId = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'

  // Fetch real appointments from Supabase
  useEffect(() => {
    loadAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [searchTerm, statusFilter, selectedDate, appointments])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const realAppointments = await BusinessAPI.getAppointments(businessId)
      
      // Transform the data to match our interface
      const transformedAppointments: Appointment[] = realAppointments.map(apt => ({
        id: apt.id,
        booking_id: apt.id.slice(0, 8), // Use first 8 chars of ID as booking ID
        customer_name: apt.customer_name || 'Unknown Customer',
        customer_email: apt.customer_email || '',
        customer_phone: apt.customer_phone || '',
        service_type: apt.service_type || 'General Service',
        service_duration: apt.duration_minutes || 60,
        service_price: 55, // Default price - could be enhanced
        appointment_date: apt.appointment_date,
        start_time: apt.start_time?.slice(0, 5) || '00:00', // Remove seconds
        end_time: apt.end_time?.slice(0, 5) || '01:00', // Remove seconds
        technician_name: apt.staff?.first_name || 'Staff Member',
        status: apt.status || 'pending',
        payment_status: 'pending' as const,
        created_at: apt.created_at
      }))
      
      // If no real appointments, show mock data for demo
      const appointmentsToShow = transformedAppointments.length > 0 
        ? transformedAppointments 
        : mockAppointments
        
      setAppointments(appointmentsToShow)
      
    } catch (error) {
      console.error('Error loading appointments:', error)
      setError('Failed to load appointments')
      // Fallback to mock data on error
      setAppointments(mockAppointments)
    } finally {
      setLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = appointments

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.technician_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter(apt => apt.appointment_date === selectedDate)
    }

    setFilteredAppointments(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'no_show': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600'
      case 'pending': return 'text-yellow-600'
      case 'partially_paid': return 'text-blue-600'
      case 'refunded': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'MMM d')
  }

  const updateAppointmentStatus = (id: string, newStatus: Appointment['status']) => {
    setAppointments(prev => prev.map(apt => 
      apt.id === id ? { ...apt, status: newStatus } : apt
    ))
  }

  if (loading) {
    return (
      <Layout business={{ name: 'Sparkle Nails Demo', subscription_tier: 'professional' }}>
        <div className="p-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <span className="ml-4 text-gray-600">Loading appointments...</span>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout business={{ name: 'Sparkle Nails Demo', subscription_tier: 'professional' }}>
      <div className="p-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-600 mt-1">
              {appointments.length === mockAppointments.length && appointments[0]?.id === '1'
                ? '📞 Showing demo data - Call +14243519304 to create real appointments!'
                : `Managing ${appointments.length} appointments (including real phone bookings)`
              }
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button 
              onClick={loadAppointments}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Refresh
            </button>
            <button className="btn-primary">
              <PlusIcon className="h-4 w-4 mr-2" />
              New Appointment
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search appointments..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                className="input-field"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <input
                type="date"
                className="input-field"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              {filteredAppointments.length} Appointments
              {selectedDate && (
                <span className="text-gray-500 font-normal ml-2">
                  on {formatDate(selectedDate)}
                </span>
              )}
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => (
              <div 
                key={appointment.id}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelectedAppointment(appointment)
                  setShowModal(true)
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-brand-100 rounded-full flex items-center justify-center">
                        <CalendarIcon className="h-5 w-5 text-brand-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {appointment.customer_name}
                        </p>
                        <span className={clsx(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          getStatusColor(appointment.status)
                        )}>
                          {appointment.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
                        <span>{appointment.service_type}</span>
                        <span>•</span>
                        <span>{appointment.technician_name}</span>
                        <span>•</span>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {appointment.start_time} - {appointment.end_time}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${appointment.service_price}
                      </p>
                      <p className={clsx(
                        'text-xs',
                        getPaymentStatusColor(appointment.payment_status)
                      )}>
                        {appointment.payment_status.replace('_', ' ')}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateAppointmentStatus(appointment.id, 'confirmed')
                            }}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Confirm"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateAppointmentStatus(appointment.id, 'cancelled')
                            }}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Cancel"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            updateAppointmentStatus(appointment.id, 'completed')
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Mark Complete"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters or search terms.
              </p>
            </div>
          )}
        </div>

        {/* Appointment Detail Modal */}
        {showModal && selectedAppointment && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Appointment Details
                    </h3>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedAppointment.customer_name}</h4>
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <EnvelopeIcon className="h-4 w-4 mr-2" />
                          {selectedAppointment.customer_email}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <PhoneIcon className="h-4 w-4 mr-2" />
                          {selectedAppointment.customer_phone}
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Service:</span>
                          <p className="font-medium">{selectedAppointment.service_type}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Technician:</span>
                          <p className="font-medium">{selectedAppointment.technician_name}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <p className="font-medium">{formatDate(selectedAppointment.appointment_date)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Time:</span>
                          <p className="font-medium">{selectedAppointment.start_time} - {selectedAppointment.end_time}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <p className="font-medium">{selectedAppointment.service_duration} minutes</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Price:</span>
                          <p className="font-medium">${selectedAppointment.service_price}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-gray-500 text-sm">Status:</span>
                          <span className={clsx(
                            'ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            getStatusColor(selectedAppointment.status)
                          )}>
                            {selectedAppointment.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Payment:</span>
                          <span className={clsx(
                            'ml-2 text-sm font-medium',
                            getPaymentStatusColor(selectedAppointment.payment_status)
                          )}>
                            {selectedAppointment.payment_status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="btn-primary sm:ml-3"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn-secondary mt-3 sm:mt-0"
                  >
                    Edit Appointment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}