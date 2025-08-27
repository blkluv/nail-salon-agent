'use client'

import { useState, useEffect } from 'react'
import Layout from '../../../components/Layout'
import { BusinessAPI } from '../../../lib/supabase'
import { getCurrentBusinessId } from '../../../lib/auth-utils'
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { clsx } from 'clsx'

interface Staff {
  id: string
  name: string
  email: string
  phone: string
  specialties: string[]
  isActive: boolean
  hireDate: string
  hourlyRate: number
  commissionRate: number
  profileImage?: string
  bio?: string
  rating: number
  totalAppointments: number
  schedule: {
    [key: string]: { start: string; end: string } | 'off'
  }
}

const mockStaff: Staff[] = [
  {
    id: '1',
    name: 'Maya Rodriguez',
    email: 'maya@bellanails.com',
    phone: '(555) 234-5678',
    specialties: ['Pedicures', 'Spa Services', 'Massage'],
    isActive: true,
    hireDate: '2023-01-15',
    hourlyRate: 25,
    commissionRate: 40,
    rating: 4.9,
    totalAppointments: 847,
    bio: 'Expert in luxury spa treatments with 8+ years experience.',
    schedule: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' },
      saturday: { start: '09:00', end: '15:00' },
      sunday: 'off'
    }
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@bellanails.com',
    phone: '(555) 345-6789',
    specialties: ['Manicures', 'Nail Art', 'Gel Extensions'],
    isActive: true,
    hireDate: '2022-08-20',
    hourlyRate: 28,
    commissionRate: 45,
    rating: 4.8,
    totalAppointments: 1203,
    bio: 'Creative nail artist specializing in custom designs and extensions.',
    schedule: {
      monday: { start: '10:00', end: '18:00' },
      tuesday: 'off',
      wednesday: { start: '10:00', end: '18:00' },
      thursday: { start: '10:00', end: '18:00' },
      friday: { start: '10:00', end: '18:00' },
      saturday: { start: '09:00', end: '16:00' },
      sunday: { start: '11:00', end: '15:00' }
    }
  },
  {
    id: '3',
    name: 'Jessica Chen',
    email: 'jessica@bellanails.com',
    phone: '(555) 456-7890',
    specialties: ['Manicures', 'Pedicures', 'Eyebrow Threading'],
    isActive: true,
    hireDate: '2023-03-10',
    hourlyRate: 22,
    commissionRate: 35,
    rating: 4.7,
    totalAppointments: 456,
    bio: 'Versatile technician with expertise in multiple beauty services.',
    schedule: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' },
      saturday: { start: '09:00', end: '16:00' },
      sunday: 'off'
    }
  }
]

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)

  // Load real staff from database
  useEffect(() => {
    loadStaff()
  }, [])

  const loadStaff = async () => {
    try {
      setLoading(true)
      const businessId = getCurrentBusinessId()
      if (!businessId) return

      const realStaff = await BusinessAPI.getStaff(businessId)
      
      // Transform to match our interface
      const transformedStaff: Staff[] = realStaff.map(member => ({
        id: member.id,
        name: `${member.first_name} ${member.last_name}`,
        email: member.email,
        phone: member.phone || '',
        specialties: member.specialties || [],
        isActive: member.is_active,
        hireDate: member.hire_date || new Date().toISOString().split('T')[0],
        hourlyRate: member.hourly_rate || 0,
        commissionRate: member.commission_rate || 0,
        role: member.role,
        totalAppointments: 0, // Would need to calculate
        totalRevenue: 0, // Would need to calculate
        rating: 5.0, // Would need to calculate from reviews
        schedule: {} // Empty schedule for now - would need staff_schedules table
      }))
      
      setStaff(transformedStaff)
    } catch (error) {
      console.error('Error loading staff:', error)
      setStaff([])
    } finally {
      setLoading(false)
    }
  }
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      i < Math.floor(rating) ? (
        <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />
      ) : (
        <StarIcon key={i} className="h-4 w-4 text-gray-300" />
      )
    ))
  }

  const getScheduleDisplay = (schedule: Staff['schedule']) => {
    if (!schedule || Object.keys(schedule).length === 0) {
      return 'Schedule not set'
    }
    const workingDays = daysOfWeek.filter(day => schedule[day] && schedule[day] !== 'off').length
    return `${workingDays} days/week`
  }

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-gray-600 mt-1">
              Manage your team, schedules, and performance
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button 
              className="btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Add Staff Member
            </button>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search staff..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="lg:col-span-3 grid grid-cols-3 gap-4">
            <div className="stat-card">
              <div className="px-4 py-3">
                <div className="text-sm text-gray-500">Total Staff</div>
                <div className="text-2xl font-bold text-gray-900">{staff.length}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="px-4 py-3">
                <div className="text-sm text-gray-500">Active Staff</div>
                <div className="text-2xl font-bold text-green-600">
                  {staff.filter(s => s.isActive).length}
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="px-4 py-3">
                <div className="text-sm text-gray-500">Avg. Rating</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {(staff.reduce((sum, s) => sum + s.rating, 0) / staff.length).toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((member) => (
            <div key={member.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gradient-to-br from-beauty-400 to-brand-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                    <div className="flex items-center mt-1">
                      {renderStars(member.rating)}
                      <span className="ml-2 text-sm text-gray-500">
                        ({member.totalAppointments} appointments)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedStaff(member)
                      setShowModal(true)
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  {member.email}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  {member.phone}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {getScheduleDisplay(member.schedule)}
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm text-gray-500 mb-2">Specialties:</div>
                <div className="flex flex-wrap gap-1">
                  {member.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-800"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Hourly Rate:</span>
                  <span className="font-medium">${member.hourlyRate}/hr</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Commission:</span>
                  <span className="font-medium">{member.commissionRate}%</span>
                </div>
              </div>

              <div className="mt-4">
                <div className={clsx(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  member.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                )}>
                  {member.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Staff Detail Modal */}
        {showModal && selectedStaff && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="bg-white px-6 py-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center">
                      <div className="h-16 w-16 bg-gradient-to-br from-beauty-400 to-brand-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-xl">
                          {selectedStaff.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-medium text-gray-900">{selectedStaff.name}</h3>
                        <div className="flex items-center mt-1">
                          {renderStars(selectedStaff.rating)}
                          <span className="ml-2 text-sm text-gray-500">
                            {selectedStaff.rating}/5 • {selectedStaff.totalAppointments} appointments
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact & Basic Info */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {selectedStaff.email}
                        </div>
                        <div className="flex items-center">
                          <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {selectedStaff.phone}
                        </div>
                        <div>
                          <span className="text-gray-500">Hire Date: </span>
                          {new Date(selectedStaff.hireDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="text-gray-500">Hourly Rate: </span>
                          ${selectedStaff.hourlyRate}/hour
                        </div>
                        <div>
                          <span className="text-gray-500">Commission: </span>
                          {selectedStaff.commissionRate}%
                        </div>
                      </div>

                      {selectedStaff.bio && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Bio</h4>
                          <p className="text-sm text-gray-600">{selectedStaff.bio}</p>
                        </div>
                      )}

                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Specialties</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedStaff.specialties.map((specialty, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-800"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Weekly Schedule</h4>
                      <div className="space-y-2">
                        {daysOfWeek.map((day, index) => (
                          <div key={day} className="flex justify-between items-center text-sm">
                            <span className="font-medium capitalize w-16">{dayLabels[index]}</span>
                            <span className="text-gray-600">
                              {selectedStaff.schedule[day] === 'off' ? (
                                <span className="text-red-500">Off</span>
                              ) : (
                                <span className="flex items-center">
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  {(selectedStaff.schedule[day] as any).start} - {(selectedStaff.schedule[day] as any).end}
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-3 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="btn-primary sm:ml-3"
                    onClick={() => setShowModal(false)}
                  >
                    Edit Staff Member
                  </button>
                  <button
                    type="button"
                    className="btn-secondary mt-3 sm:mt-0"
                    onClick={() => setShowModal(false)}
                  >
                    Close
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