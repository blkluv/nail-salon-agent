'use client'

import { useState, useEffect } from 'react'
import Layout from '../../../components/Layout'
import { BusinessAPI, type Business, type RevenueData, type StaffPerformance } from '../../../lib/supabase'
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  ComposedChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts'

import { getCurrentBusinessId } from '../../../lib/auth-utils'

// Use authenticated business ID
const getBusinessId = () => getCurrentBusinessId() || '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'

// Empty service data for new business - will populate as appointments are made
const serviceData = [
  // No data yet - will be calculated from real appointments
  { name: 'Express Manicure', value: 5, color: '#8B5CF6' }
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')
  const [business, setBusiness] = useState<Business | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load business data
      const businessId = getBusinessId()
      const businessData = await BusinessAPI.getBusiness(businessId)
      if (businessData) {
        setBusiness(businessData)
      }

      // Load revenue data based on time range
      const months = timeRange === '30d' ? 6 : timeRange === '90d' ? 12 : 6
      const revenue = await BusinessAPI.getRevenueData(businessId, months)
      setRevenueData(revenue)

      // Load staff performance
      const staff = await BusinessAPI.getStaffPerformance(businessId)
      setStaffPerformance(staff)

    } catch (error) {
      console.error('Error loading analytics data:', error)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value)
  }

  if (loading) {
    return (
      <Layout business={business}>
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="h-80 bg-gray-200 rounded"></div>
              <div className="h-80 bg-gray-200 rounded"></div>
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
            <button onClick={() => loadAnalyticsData()} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout business={business}>
      <div className="p-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-gray-600 mt-1">
              Track your business performance and insights
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <select
              className="input-field"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">$</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Revenue
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(19500)}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"/>
                        </svg>
                        12.5%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">📅</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Appointments
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-bold text-gray-900">244</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"/>
                        </svg>
                        8.2%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">💳</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Avg. Ticket
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(80)}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"/>
                        </svg>
                        3.8%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">👥</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Retention Rate
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-bold text-gray-900">78.5%</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM6.293 6.707a1 1 0 011.414-1.414L10 7.586l2.293-2.293a1 1 0 111.414 1.414L11.414 9l2.293 2.293a1 1 0 01-1.414 1.414L10 10.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 9 6.293 6.707z"/>
                        </svg>
                        2.1%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue & Appointments Combined Chart */}
        <div className="card mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue & Appointments Trend</h3>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <ComposedChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="right" dataKey="appointments" fill="#EC4899" name="Appointments" />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="Revenue"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Service Popularity Pie Chart */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Service Popularity</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Simple Revenue Bar Chart */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Revenue</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Staff Performance */}
        <div className="card mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Staff Performance</h3>
          <div className="space-y-6">
            {staffPerformance.map((staff, index) => (
              <div key={staff.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gradient-to-br from-pink-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {staff.name[0]}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">{staff.name}</h4>
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-400 mr-1">⭐</span>
                      <span className="text-sm text-gray-600">{staff.rating} rating</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{staff.appointments}</div>
                    <div className="text-sm text-gray-500">Appointments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(staff.revenue)}</div>
                    <div className="text-sm text-gray-500">Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(staff.revenue / staff.appointments)}</div>
                    <div className="text-sm text-gray-500">Avg. Ticket</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-2xl">🕒</span>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900">Peak Hours</h4>
                <p className="text-sm text-gray-600">Most appointments between</p>
                <p className="text-2xl font-bold text-blue-600">2-4 PM</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900">Busiest Day</h4>
                <p className="text-sm text-gray-600">Highest booking volume on</p>
                <p className="text-2xl font-bold text-green-600">Saturday</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900">New Customers</h4>
                <p className="text-sm text-gray-600">This month</p>
                <p className="text-2xl font-bold text-purple-600">47</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}