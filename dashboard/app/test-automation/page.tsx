'use client'

import Link from 'next/link'
import { 
  RocketLaunchIcon,
  CogIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function TestAutomation() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <RocketLaunchIcon className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 Automation Testing Center
          </h1>
          <p className="text-xl text-gray-600">
            Test the complete automated onboarding system with mock APIs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Test Automated Onboarding */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <CogIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Test Automated Onboarding
              </h2>
              <p className="text-gray-600">
                Complete 4-step wizard with mock Vapi provisioning
              </p>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                Mock Vapi phone number provisioning
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                Mock AI assistant creation
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                Business setup simulation
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <ClockIcon className="h-4 w-4 text-yellow-500 mr-2" />
                3-second processing delay (simulates real 30s)
              </div>
            </div>

            <Link
              href="/onboarding-auto"
              className="block w-full bg-green-600 text-white text-center py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Start Mock Onboarding Test
            </Link>
          </div>

          {/* Test Existing Dashboard */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <CheckCircleIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Test Live Dashboard
              </h2>
              <p className="text-gray-600">
                Use existing business data with real backend
              </p>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircleIcon className="h-4 w-4 text-blue-500 mr-2" />
                Real customer data (5 customers)
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircleIcon className="h-4 w-4 text-blue-500 mr-2" />
                Live service performance analytics
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircleIcon className="h-4 w-4 text-blue-500 mr-2" />
                Real booking trends data
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <CheckCircleIcon className="h-4 w-4 text-blue-500 mr-2" />
                AI-powered business insights
              </div>
            </div>

            <Link
              href="/dashboard"
              className="block w-full bg-blue-600 text-white text-center py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Open Live Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            🔄 Testing Status
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900">Frontend Ready</h4>
              <p className="text-sm text-gray-600">All UI components built</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <h4 className="font-medium text-gray-900">Backend Updating</h4>
              <p className="text-sm text-gray-600">Multi-tenant features being added</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CogIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900">Mock Testing</h4>
              <p className="text-sm text-gray-600">Frontend automation flow active</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-500">
            🧪 Using mock APIs for testing • Real integration will be tested once backend is updated
          </p>
        </div>
      </div>
    </div>
  )
}