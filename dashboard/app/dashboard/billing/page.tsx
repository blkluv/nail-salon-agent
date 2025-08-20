'use client'

import { useState } from 'react'
import Layout from '../../../components/Layout'
import {
  CreditCardIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  StarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid'
import { clsx } from 'clsx'

interface Invoice {
  id: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  period: string
  downloadUrl?: string
}

interface UsageMetric {
  name: string
  current: number
  limit: number
  unit: string
  overage?: number
}

const mockInvoices: Invoice[] = [
  {
    id: 'INV-2024-001',
    date: '2024-01-01',
    amount: 99.00,
    status: 'paid',
    period: 'January 2024',
    downloadUrl: '#'
  },
  {
    id: 'INV-2023-012',
    date: '2023-12-01',
    amount: 99.00,
    status: 'paid',
    period: 'December 2023',
    downloadUrl: '#'
  },
  {
    id: 'INV-2023-011',
    date: '2023-11-01',
    amount: 99.00,
    status: 'paid',
    period: 'November 2023',
    downloadUrl: '#'
  }
]

const usageMetrics: UsageMetric[] = [
  {
    name: 'Voice Calls',
    current: 1847,
    limit: 2000,
    unit: 'calls'
  },
  {
    name: 'SMS Messages',
    current: 456,
    limit: 1000,
    unit: 'messages'
  },
  {
    name: 'Email Notifications',
    current: 2340,
    limit: 5000,
    unit: 'emails'
  },
  {
    name: 'Storage',
    current: 2.4,
    limit: 10,
    unit: 'GB'
  }
]

const plans = [
  {
    name: 'Starter',
    price: 49,
    popular: false,
    features: [
      '1 Business Location',
      '500 Voice Calls/month',
      '200 SMS Messages/month',
      '1,000 Email Notifications',
      'Basic Analytics',
      'Email Support'
    ]
  },
  {
    name: 'Professional',
    price: 99,
    popular: true,
    features: [
      '1 Business Location',
      '2,000 Voice Calls/month',
      '1,000 SMS Messages/month',
      '5,000 Email Notifications',
      'Advanced Analytics',
      'Priority Support',
      'Custom Branding',
      'Marketing Tools'
    ]
  },
  {
    name: 'Enterprise',
    price: 199,
    popular: false,
    features: [
      'Multiple Locations',
      'Unlimited Voice Calls',
      'Unlimited SMS Messages',
      'Unlimited Email Notifications',
      'Advanced Analytics',
      'Priority Support',
      'Custom Branding',
      'Marketing Tools',
      'White Label Options',
      'Dedicated Account Manager'
    ]
  }
]

export default function BillingPage() {
  const [currentPlan] = useState('Professional')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <Layout business={{ name: 'Bella Nails & Spa', subscription_tier: 'professional' }}>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600 mt-1">
            Manage your subscription, billing, and usage
          </p>
        </div>

        {/* Current Plan */}
        <div className="card mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
                <p className="text-gray-600">You're currently on the Professional plan</p>
              </div>
              <button 
                className="btn-primary"
                onClick={() => setShowUpgradeModal(true)}
              >
                <ArrowUpIcon className="h-4 w-4 mr-2" />
                Upgrade Plan
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-brand-500 to-beauty-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Professional Plan</h3>
                    <p className="text-brand-100 mt-1">Perfect for growing salons</p>
                  </div>
                  <StarIcon className="h-8 w-8 text-yellow-300" />
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-bold">$99</div>
                  <div className="text-brand-200">per month</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Next billing date</div>
                  <div className="font-medium">February 15, 2024</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Payment method</div>
                  <div className="flex items-center">
                    <CreditCardIcon className="h-4 w-4 mr-2" />
                    <span className="font-medium">•••• •••• •••• 4242</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Subscription status</div>
                  <div className="flex items-center">
                    <CheckCircleIconSolid className="h-4 w-4 text-green-500 mr-2" />
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Annual savings</div>
                  <div className="font-medium text-green-600">Save $240 with annual billing</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage */}
        <div className="card mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Usage</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {usageMetrics.map((metric) => {
                const percentage = getUsagePercentage(metric.current, metric.limit)
                return (
                  <div key={metric.name} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{metric.name}</h3>
                      <span className="text-sm text-gray-500">
                        {metric.current.toLocaleString()} / {metric.limit.toLocaleString()} {metric.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={clsx('h-2 rounded-full transition-all', getUsageColor(percentage))}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>{percentage.toFixed(1)}% used</span>
                      {percentage >= 75 && (
                        <span className="text-yellow-600 font-medium">
                          {percentage >= 90 ? 'Approaching limit' : 'High usage'}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Billing History</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {mockInvoices.map((invoice) => (
              <div key={invoice.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Invoice {invoice.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {invoice.period}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${invoice.amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(invoice.date).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <span className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getInvoiceStatusColor(invoice.status)
                    )}>
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      {invoice.status}
                    </span>

                    {invoice.downloadUrl && (
                      <button className="text-brand-600 hover:text-brand-700 text-sm font-medium">
                        Download
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white px-6 py-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Choose Your Plan</h3>
                    <button
                      onClick={() => setShowUpgradeModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                      <div 
                        key={plan.name}
                        className={clsx(
                          'rounded-lg border-2 p-6 relative',
                          plan.name === currentPlan
                            ? 'border-brand-500 bg-brand-50'
                            : plan.popular
                            ? 'border-beauty-500 bg-beauty-50'
                            : 'border-gray-200 bg-white'
                        )}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-beauty-500 text-white px-3 py-1 text-xs font-medium rounded-full">
                              Most Popular
                            </span>
                          </div>
                        )}

                        {plan.name === currentPlan && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-brand-500 text-white px-3 py-1 text-xs font-medium rounded-full">
                              Current Plan
                            </span>
                          </div>
                        )}

                        <div className="text-center mb-6">
                          <h4 className="text-xl font-semibold text-gray-900">{plan.name}</h4>
                          <div className="mt-2">
                            <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                            <span className="text-gray-500">/month</span>
                          </div>
                        </div>

                        <ul className="space-y-3 mb-6">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <CheckCircleIconSolid className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          className={clsx(
                            'w-full py-2 px-4 rounded-md text-sm font-medium transition-colors',
                            plan.name === currentPlan
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                              : plan.popular
                              ? 'bg-beauty-600 text-white hover:bg-beauty-700'
                              : 'bg-brand-600 text-white hover:bg-brand-700'
                          )}
                          disabled={plan.name === currentPlan}
                        >
                          {plan.name === currentPlan ? 'Current Plan' : 'Upgrade to ' + plan.name}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 text-center text-sm text-gray-500">
                    <p>All plans include a 14-day free trial. Cancel anytime.</p>
                    <p className="mt-1">Need a custom plan? <a href="#" className="text-brand-600 hover:text-brand-700">Contact our sales team</a></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}