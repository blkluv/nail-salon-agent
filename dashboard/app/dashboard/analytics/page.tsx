'use client'

import { useState } from 'react'
import Layout from '../../../components/Layout'
import { 
  ChartBarIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowDownTrayIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import SmartAnalytics from '../../../components/SmartAnalytics'
import { FeatureGate, useFeatureFlags } from '../../../lib/feature-flags'

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const [showFilters, setShowFilters] = useState(false)
  
  // Mock business data - in real app this would come from auth/context
  const businessTier = 'professional' as const
  const businessId = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad'
  const featureFlags = useFeatureFlags(businessTier)
  // Mock business for layout
  const business = {
    id: businessId,
    name: 'Nail Salon Demo',
    subscription_tier: businessTier
  }

  const handleExportData = () => {
    console.log('Exporting analytics data...')
    alert('Analytics export would be implemented here')
  }

  return (
    <Layout business={business}>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ChartBarIcon className="h-8 w-8 mr-3 text-purple-600" />
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Get insights into your salon's performance and growth opportunities
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="dateRange" className="text-sm font-medium text-gray-700">
                  Period:
                </label>
                <select 
                  id="dateRange"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              <FeatureGate 
                tier={businessTier} 
                requiredFeatures={['advanced_reporting']}
                fallback={
                  <div className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-md">
                    Export available in Professional+
                  </div>
                }
              >
                <button
                  onClick={handleExportData}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Export Data
                </button>
              </FeatureGate>
            </div>
          </div>
        </div>
        
        {/* Smart Analytics Component */}
        <SmartAnalytics 
          businessId={businessId}
          dateRange={dateRange}
          className="mb-8"
        />

        {/* Advanced Analytics for Professional+ */}
        <FeatureGate 
          tier={businessTier} 
          requiredFeatures={['advanced_reporting']}
          showUpgradePrompt={true}
        >
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Advanced Reporting</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Customer Lifetime Value</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average CLV</span>
                    <span className="font-semibold text-green-600">$485</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Top 20% CLV</span>
                    <span className="font-semibold text-green-600">$1,200</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Visit Frequency</span>
                    <span className="font-semibold">6.2 times/year</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Service Profitability</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Highest Margin</span>
                    <span className="font-semibold text-green-600">Nail Art (78%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Most Popular</span>
                    <span className="font-semibold">Gel Manicure (45 bookings)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Revenue/Hour</span>
                    <span className="font-semibold text-green-600">$75.50</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FeatureGate>
      </div>
    </Layout>
  )
}