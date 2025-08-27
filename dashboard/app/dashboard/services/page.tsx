'use client'

import { useState, useEffect } from 'react'
import Layout from '../../../components/Layout'
import { BusinessAPI } from '../../../lib/supabase'
import { getCurrentBusinessId } from '../../../lib/auth-utils'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  StarIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { clsx } from 'clsx'

interface Service {
  id: string
  name: string
  description: string
  category: string
  duration: number
  price: number
  isActive: boolean
  isFeatured: boolean
  requiresDeposit: boolean
  depositAmount?: number
  bookingCount: number
  revenue: number
  lastBooked?: string
}

// No mock data - load real services from database

const categories = [
  { name: 'All Categories', value: 'all', color: 'bg-gray-100 text-gray-800' },
  { name: 'Manicures', value: 'Manicures', color: 'bg-brand-100 text-brand-800' },
  { name: 'Pedicures', value: 'Pedicures', color: 'bg-beauty-100 text-beauty-800' },
  { name: 'Enhancements', value: 'Enhancements', color: 'bg-purple-100 text-purple-800' },
  { name: 'Spa Services', value: 'Spa Services', color: 'bg-green-100 text-green-800' }
]

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load real services from database
  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      setLoading(true)
      const businessId = getCurrentBusinessId()
      if (!businessId) return

      const realServices = await BusinessAPI.getServices(businessId)
      
      // Transform to match our interface
      const transformedServices: Service[] = realServices.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description || '',
        category: service.category || 'General',
        duration: service.duration_minutes,
        price: service.price_cents ? service.price_cents / 100 : 0,
        isActive: service.is_active,
        isFeatured: false, // Could be added to DB later
        requiresDeposit: false, // Could be added to DB later
        bookingCount: 0, // Would need to calculate from appointments
        revenue: 0, // Would need to calculate from payments
        lastBooked: undefined // Would need to query appointments
      }))
      
      setServices(transformedServices)
    } catch (error) {
      console.error('Error loading services:', error)
      setServices([]) // Show empty state on error
    } finally {
      setLoading(false)
    }
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <Layout>
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Services</h1>
            <p className="text-gray-600 mt-1">
              {services.length === 0 
                ? 'No services yet - Add your first service to get started!'
                : `Managing ${services.length} services for your salon`
              }
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Service
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => setCategoryFilter(category.value)}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  categoryFilter === category.value
                    ? category.color
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Services List */}
        <div className="space-y-4">
          {filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {services.length === 0 ? 'No services yet' : 'No matching services'}
              </h3>
              <p className="text-gray-500 mb-6">
                {services.length === 0 
                  ? 'Add your first service to get started with bookings'
                  : 'Try adjusting your search or filters'
                }
              </p>
              {services.length === 0 && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Your First Service
                </button>
              )}
            </div>
          ) : (
            filteredServices.map(service => (
              <div key={service.id} className="card">
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className={clsx(
                        'h-12 w-12 rounded-lg flex items-center justify-center',
                        service.isActive ? 'bg-brand-100' : 'bg-gray-100'
                      )}>
                        <span className="text-lg">
                          {service.category === 'Manicures' ? '💅' : 
                           service.category === 'Pedicures' ? '🦶' :
                           service.category === 'Enhancements' ? '✨' : '🧖‍♀️'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {service.name}
                        </h3>
                        {service.isFeatured && (
                          <StarIconSolid className="h-4 w-4 text-yellow-400" />
                        )}
                        {!service.isActive && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {service.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {service.duration} min
                        </div>
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                          ${service.price.toFixed(2)}
                        </div>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                          {service.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedService(service)
                        setShowModal(true)
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit service"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete service"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}