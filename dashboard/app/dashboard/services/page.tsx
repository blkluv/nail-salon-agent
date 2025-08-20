'use client'

import { useState } from 'react'
import Layout from '../../../components/Layout'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  SparklesIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
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

const mockServices: Service[] = [
  {
    id: '1',
    name: 'Signature Manicure',
    description: 'Our signature manicure with nail shaping, cuticle care, and polish application',
    category: 'Manicures',
    duration: 60,
    price: 45,
    isActive: true,
    isFeatured: true,
    requiresDeposit: false,
    bookingCount: 234,
    revenue: 10530,
    lastBooked: '2024-01-15'
  },
  {
    id: '2',
    name: 'Gel Manicure',
    description: 'Long-lasting gel polish manicure with UV curing',
    category: 'Manicures',
    duration: 75,
    price: 55,
    isActive: true,
    isFeatured: true,
    requiresDeposit: true,
    depositAmount: 15,
    bookingCount: 189,
    revenue: 10395,
    lastBooked: '2024-01-14'
  },
  {
    id: '3',
    name: 'Spa Pedicure',
    description: 'Luxurious pedicure with foot soak, exfoliation, and massage',
    category: 'Pedicures',
    duration: 90,
    price: 65,
    isActive: true,
    isFeatured: true,
    requiresDeposit: true,
    depositAmount: 20,
    bookingCount: 156,
    revenue: 10140,
    lastBooked: '2024-01-15'
  },
  {
    id: '4',
    name: 'Express Manicure',
    description: 'Quick manicure for busy schedules',
    category: 'Manicures',
    duration: 30,
    price: 25,
    isActive: true,
    isFeatured: false,
    requiresDeposit: false,
    bookingCount: 78,
    revenue: 1950,
    lastBooked: '2024-01-12'
  },
  {
    id: '5',
    name: 'Nail Art Design',
    description: 'Custom nail art and creative designs',
    category: 'Enhancements',
    duration: 45,
    price: 35,
    isActive: true,
    isFeatured: false,
    requiresDeposit: true,
    depositAmount: 10,
    bookingCount: 92,
    revenue: 3220,
    lastBooked: '2024-01-13'
  },
  {
    id: '6',
    name: 'Acrylic Extensions',
    description: 'Full set of acrylic nail extensions',
    category: 'Enhancements',
    duration: 120,
    price: 85,
    isActive: false,
    isFeatured: false,
    requiresDeposit: true,
    depositAmount: 25,
    bookingCount: 45,
    revenue: 3825,
    lastBooked: '2024-01-08'
  }
]

const categories = [
  { name: 'All Categories', value: 'all', color: 'bg-gray-100 text-gray-800' },
  { name: 'Manicures', value: 'Manicures', color: 'bg-brand-100 text-brand-800' },
  { name: 'Pedicures', value: 'Pedicures', color: 'bg-beauty-100 text-beauty-800' },
  { name: 'Enhancements', value: 'Enhancements', color: 'bg-purple-100 text-purple-800' },
  { name: 'Spa Services', value: 'Spa Services', color: 'bg-green-100 text-green-800' }
]

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(mockServices)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const toggleServiceStatus = (id: string) => {
    setServices(prev => prev.map(service => 
      service.id === id ? { ...service, isActive: !service.isActive } : service
    ))
  }

  const toggleFeatured = (id: string) => {
    setServices(prev => prev.map(service => 
      service.id === id ? { ...service, isFeatured: !service.isFeatured } : service
    ))
  }

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.value === category)
    return cat?.color || 'bg-gray-100 text-gray-800'
  }

  const totalRevenue = services.reduce((sum, service) => sum + service.revenue, 0)
  const activeServices = services.filter(s => s.isActive).length
  const featuredServices = services.filter(s => s.isFeatured).length

  return (
    <Layout business={{ name: 'Bella Nails & Spa', subscription_tier: 'professional' }}>
      <div className="p-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Service Catalog</h1>
            <p className="text-gray-600 mt-1">
              Manage your services, pricing, and availability
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button 
              className="btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Service
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TagIcon className="h-8 w-8 text-brand-600" />
                </div>
                <div className="ml-5">
                  <div className="text-sm font-medium text-gray-500">Total Services</div>
                  <div className="text-2xl font-bold text-gray-900">{services.length}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <EyeIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5">
                  <div className="text-sm font-medium text-gray-500">Active Services</div>
                  <div className="text-2xl font-bold text-green-600">{activeServices}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <SparklesIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-5">
                  <div className="text-sm font-medium text-gray-500">Featured</div>
                  <div className="text-2xl font-bold text-yellow-600">{featuredServices}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-8 w-8 text-beauty-600" />
                </div>
                <div className="ml-5">
                  <div className="text-sm font-medium text-gray-500">Total Revenue</div>
                  <div className="text-2xl font-bold text-beauty-600">${totalRevenue.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search services..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                className="input-field"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => setCategoryFilter(category.value)}
                className={clsx(
                  'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors',
                  categoryFilter === category.value
                    ? category.color
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredServices.map((service) => (
            <div key={service.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                    {service.isFeatured && (
                      <SparklesIcon className="h-5 w-5 text-yellow-500 ml-2" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                  <div className="flex items-center mt-2">
                    <span className={clsx(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      getCategoryColor(service.category)
                    )}>
                      {service.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => toggleFeatured(service.id)}
                    className={clsx(
                      'p-2 rounded-lg transition-colors',
                      service.isFeatured 
                        ? 'text-yellow-600 bg-yellow-100 hover:bg-yellow-200' 
                        : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                    )}
                    title="Toggle Featured"
                  >
                    <SparklesIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleServiceStatus(service.id)}
                    className={clsx(
                      'p-2 rounded-lg transition-colors',
                      service.isActive 
                        ? 'text-green-600 bg-green-100 hover:bg-green-200' 
                        : 'text-red-600 bg-red-100 hover:bg-red-200'
                    )}
                    title={service.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {service.isActive ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedService(service)
                      setShowModal(true)
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  {service.duration} minutes
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                  ${service.price}
                </div>
              </div>

              {service.requiresDeposit && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <strong>Deposit Required:</strong> ${service.depositAmount}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Bookings</div>
                    <div className="font-medium">{service.bookingCount}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Revenue</div>
                    <div className="font-medium">${service.revenue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Status</div>
                    <div className={clsx(
                      'font-medium',
                      service.isActive ? 'text-green-600' : 'text-red-600'
                    )}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}

        {/* Service Detail Modal */}
        {showModal && selectedService && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">{selectedService.name}</h3>
                        {selectedService.isFeatured && (
                          <SparklesIcon className="h-5 w-5 text-yellow-500 ml-2" />
                        )}
                      </div>
                      <span className={clsx(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2',
                        getCategoryColor(selectedService.category)
                      )}>
                        {selectedService.category}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <p className="text-sm text-gray-600 mt-1">{selectedService.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Duration</label>
                        <p className="text-sm text-gray-900 mt-1">{selectedService.duration} minutes</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Price</label>
                        <p className="text-sm text-gray-900 mt-1">${selectedService.price}</p>
                      </div>
                    </div>

                    {selectedService.requiresDeposit && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Deposit Required</label>
                        <p className="text-sm text-gray-900 mt-1">${selectedService.depositAmount}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Total Bookings</label>
                        <p className="text-lg font-semibold text-gray-900">{selectedService.bookingCount}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Total Revenue</label>
                        <p className="text-lg font-semibold text-green-600">${selectedService.revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Avg. per Booking</label>
                        <p className="text-lg font-semibold text-blue-600">
                          ${Math.round(selectedService.revenue / selectedService.bookingCount)}
                        </p>
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
                    Edit Service
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