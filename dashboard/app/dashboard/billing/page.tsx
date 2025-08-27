'use client'

import { useState } from 'react'
import Layout from '../../../components/Layout'
import {
  CreditCardIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function BillingPage() {
  return (
    <Layout>
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
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Starter Plan</h3>
                <p className="text-gray-600">Perfect for getting started</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">Free</div>
                <p className="text-sm text-gray-500">Currently in trial</p>
              </div>
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Billing History</h2>
          </div>
          <div className="px-6 py-8">
            <div className="text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No billing history yet</h3>
              <p className="text-gray-500">Your invoices and billing history will appear here once you start using the service.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}