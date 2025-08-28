'use client'

import { useState, useEffect } from 'react'
import {
  ChartBarIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  SparklesIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'

interface AnalyticsData {
  revenue: {
    current: number
    previous: number
    trend: 'up' | 'down' | 'stable'
    growth: number
  }
  bookings: {
    total: number
    completed: number
    cancelled: number
    noShows: number
  }
  customers: {
    total: number
    new: number
    returning: number
    retention: number
  }
  services: {
    name: string
    bookings: number
    revenue: number
    avgDuration: number
    satisfaction: number
  }[]
  timeSlots: {
    hour: string
    bookings: number
    revenue: number
  }[]
  insights: {
    type: 'opportunity' | 'warning' | 'success'
    title: string
    description: string
    action?: string
  }[]
}

interface SmartAnalyticsProps {
  businessId: string
  dateRange?: 'week' | 'month' | 'quarter' | 'year'
  className?: string
}

export default function SmartAnalytics({ businessId, dateRange = 'month', className = '' }: SmartAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'bookings' | 'customers'>('revenue')

  useEffect(() => {
    loadAnalyticsData()
  }, [businessId, dateRange])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    try {
      // In real implementation, this would fetch from API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: AnalyticsData = {
        revenue: {
          current: 12850,
          previous: 10200,
          trend: 'up',
          growth: 26.0
        },
        bookings: {
          total: 156,
          completed: 142,
          cancelled: 8,
          noShows: 6
        },
        customers: {
          total: 89,
          new: 23,
          returning: 66,
          retention: 74.2
        },
        services: [
          {
            name: 'Gel Manicure',
            bookings: 45,
            revenue: 3600,
            avgDuration: 60,
            satisfaction: 4.8
          },
          {
            name: 'Pedicure',
            bookings: 38,
            revenue: 2850,
            avgDuration: 75,
            satisfaction: 4.7
          },
          {
            name: 'Nail Art',
            bookings: 28,
            revenue: 2240,
            avgDuration: 90,
            satisfaction: 4.9
          },
          {
            name: 'Dip Powder',
            bookings: 25,
            revenue: 2000,
            avgDuration: 80,
            satisfaction: 4.6
          },
          {
            name: 'Acrylic Full Set',
            bookings: 20,
            revenue: 1600,
            avgDuration: 120,
            satisfaction: 4.5
          }
        ],
        timeSlots: [
          { hour: '9 AM', bookings: 8, revenue: 640 },
          { hour: '10 AM', bookings: 12, revenue: 960 },
          { hour: '11 AM', bookings: 15, revenue: 1200 },
          { hour: '12 PM', bookings: 18, revenue: 1440 },
          { hour: '1 PM', bookings: 14, revenue: 1120 },
          { hour: '2 PM', bookings: 16, revenue: 1280 },
          { hour: '3 PM', bookings: 20, revenue: 1600 },
          { hour: '4 PM', bookings: 22, revenue: 1760 },
          { hour: '5 PM', bookings: 18, revenue: 1440 },
          { hour: '6 PM', bookings: 13, revenue: 1040 }
        ],
        insights: [
          {
            type: 'opportunity',
            title: 'Peak Hour Revenue Opportunity',
            description: '3-5 PM shows highest demand. Consider premium pricing during peak hours.',
            action: 'Set Peak Pricing'
          },
          {
            type: 'success',
            title: 'Excellent Customer Retention',
            description: '74% retention rate is above industry average of 65%.',
          },
          {
            type: 'warning',
            title: 'High Cancellation Rate',
            description: '5.1% cancellation rate. Consider implementing cancellation fee.',
            action: 'Review Policy'
          },
          {
            type: 'opportunity',
            title: 'Nail Art Premium Service',
            description: 'Nail Art has highest satisfaction (4.9) and premium pricing potential.',
            action: 'Expand Offerings'
          }
        ]
      }

      setData(mockData)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <LightBulbIcon className="h-5 w-5 text-blue-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case 'success':
        return <SparklesIcon className="h-5 w-5 text-green-500" />
      default:
        return <ChartBarIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getInsightBackground = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'bg-blue-50 border-blue-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'success':
        return 'bg-green-50 border-green-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <ChartBarIcon className="h-12 w-12 mx-auto mb-2" />
          <p>Unable to load analytics data</p>
          <button 
            onClick={loadAnalyticsData}
            className="mt-2 text-purple-600 hover:text-purple-700 flex items-center mx-auto"
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <ChartBarIcon className="h-8 w-8 mr-3 text-purple-600" />
            Smart Analytics
          </h2>
          <div className="flex items-center space-x-2">
            <select 
              value={dateRange}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button 
              onClick={loadAnalyticsData}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Revenue</p>
                <p className="text-2xl font-bold text-green-900">${data.revenue.current.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-700">+{data.revenue.growth}% vs last {dateRange}</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Bookings</p>
                <p className="text-2xl font-bold text-blue-900">{data.bookings.total}</p>
                <div className="text-sm text-blue-700 mt-1">
                  {data.bookings.completed} completed • {data.bookings.cancelled} cancelled
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Customers</p>
                <p className="text-2xl font-bold text-purple-900">{data.customers.total}</p>
                <div className="flex items-center mt-1">
                  <UserGroupIcon className="h-4 w-4 text-purple-600 mr-1" />
                  <span className="text-sm text-purple-700">{data.customers.retention}% retention</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <UserGroupIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Insights */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <SparklesIcon className="h-5 w-5 mr-2 text-purple-600" />
          Smart Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.insights.map((insight, index) => (
            <div key={index} className={`border rounded-lg p-4 ${getInsightBackground(insight.type)}`}>
              <div className="flex items-start space-x-3">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                  {insight.action && (
                    <button className="text-xs bg-white px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50 font-medium">
                      {insight.action}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Performance */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 font-medium text-gray-700">Service</th>
                <th className="text-center py-3 font-medium text-gray-700">Bookings</th>
                <th className="text-center py-3 font-medium text-gray-700">Revenue</th>
                <th className="text-center py-3 font-medium text-gray-700">Avg Duration</th>
                <th className="text-center py-3 font-medium text-gray-700">Rating</th>
              </tr>
            </thead>
            <tbody>
              {data.services.map((service, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3">
                    <div className="font-medium text-gray-900">{service.name}</div>
                  </td>
                  <td className="text-center py-3">{service.bookings}</td>
                  <td className="text-center py-3 font-medium text-green-600">
                    ${service.revenue.toLocaleString()}
                  </td>
                  <td className="text-center py-3">{service.avgDuration}min</td>
                  <td className="text-center py-3">
                    <div className="flex items-center justify-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1 font-medium">{service.satisfaction}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Peak Hours Analysis */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ClockIcon className="h-5 w-5 mr-2 text-purple-600" />
          Peak Hours Analysis
        </h3>
        <div className="space-y-3">
          {data.timeSlots.map((slot, index) => {
            const maxBookings = Math.max(...data.timeSlots.map(s => s.bookings))
            const percentage = (slot.bookings / maxBookings) * 100
            
            return (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-16 text-sm font-medium text-gray-700">{slot.hour}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {slot.bookings} bookings
                  </div>
                </div>
                <div className="w-20 text-sm font-medium text-green-600 text-right">
                  ${slot.revenue}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}